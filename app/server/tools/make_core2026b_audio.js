#!/usr/bin/env node
/**
 * Synthesise and register core-2026b assessment audio.
 *
 *   node tools/make_core2026b_audio.js [--force]
 *
 * Two jobs, and they must happen in this order: cut the file, then register it
 * in b2_audio_assets with its REAL duration read off the file. A registry row
 * whose duration was assumed rather than measured is a fake asset, and
 * b2_paper_sections.audio_asset_id is a foreign key precisely so that a
 * listening section cannot point at audio that does not exist.
 *
 * DEDICATED ASSESSMENT AUDIO. core-2026b does not reuse practice audio and does
 * not reuse core-2026a's. Practice audio is material a learner may have already
 * worked through; scoring her on it measures whether she did her homework.
 *
 * Needs Azure Speech. Without it, nothing is written and nothing is registered —
 * the listening section then has audio_required=true and no asset, which
 * content_model.validateForProduction correctly refuses. That is the honest
 * failure: a visible gap, not a silent placeholder.
 */

require("../src/env")();
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const tts = require("../src/b2/tts");
const pool = require("../src/db/pool");

const OUT = path.join(__dirname, "../public/b2/audio");
const FORCE = process.argv.includes("--force");

const VERSIONS = [
  require("../src/seed/b2/core2026b/v1").V1,
  require("../src/seed/b2/core2026b/v2").V2,
  require("../src/seed/b2/core2026b/v3").V3,
  require("../src/seed/b2/core2026b/v4").V4,
  require("../src/seed/b2/core2026b/v5").V5,
  require("../src/seed/b2/core2026b/v6").V6,
  require("../src/seed/b2/core2026b/v7").V7,
  require("../src/seed/b2/core2026b/v8").V8,
  require("../src/seed/b2/core2026b/v9").V9,
  require("../src/seed/b2/core2026b/v10").V10,
];

/**
 * Duration via ffprobe.
 *
 * THIS REPLACES A HAND-ROLLED MP3 FRAME PARSER THAT WAS WRONG BY A FACTOR OF
 * TWO. It reported 23.3s for a file ffprobe measures at 64.3s. That is not a
 * rounding error — it drove a real, wrong decision: the pace check built on it
 * said this audio was running at 4.6 words/second and needed slowing down, and
 * that "fix" (`rate: -25%`) is what produced audio that is actually too SLOW
 * (1.66–1.97 w/s against a 2.0–2.8 target). A synthetic diagnosis produced a
 * real regression.
 *
 * ffprobe decodes the container properly — VBR, ID3 tags, LAME headers, all of
 * it — rather than hand-scanning frame sync bytes, which is exactly the kind of
 * problem a hand-rolled parser keeps finding new ways to get wrong. It is a
 * local, offline binary call: no network, so it works in every environment this
 * tool needs to run in.
 */
function mp3Duration(file) {
  const out = spawnSync("ffprobe",
    ["-v", "error", "-show_entries", "format=duration",
     "-of", "default=noprint_wrappers=1:nokey=1", file],
    { encoding: "utf8" });
  if (out.status !== 0 || !out.stdout) {
    console.error(`  ffprobe failed on ${file}: ${out.stderr || out.error?.message || "unknown error"}`);
    return null;
  }
  const seconds = parseFloat(out.stdout.trim());
  return Number.isFinite(seconds) ? Math.round(seconds * 10) / 10 : null;
}

async function main() {
  const configured = typeof tts.configured === "function" ? tts.configured() : !!tts.configured;
  if (!configured) {
    console.error("Azure Speech is not configured (AZURE_SPEECH_REGION + a key).");
    console.error("Nothing written, nothing registered. The listening sections will");
    console.error("correctly report audio_required with no asset attached.");
    process.exit(1);
  }
  fs.mkdirSync(OUT, { recursive: true });

  let made = 0, registered = 0;
  for (const v of VERSIONS) {
    const L = v.listening;
    const file = path.join(OUT, `${L.audio_id}.mp3`);

    if (fs.existsSync(file) && !FORCE) {
      console.log(`  ${L.audio_id}.mp3 already exists — not recut`);
    } else {
      /* NO SLOWDOWN BY DEFAULT — reversed from an earlier "-25%" that was
         itself a bug fix for a bug that did not exist.

         The hand-rolled MP3 duration parser this tool used to carry mis-synced
         on ID3/LAME header bytes and reported this V1 clip at 23.3s against its
         real (ffprobe-measured) 64.3s — wrong by a factor of two. On that false
         reading the pace check said 4.6 words/second and demanded a slowdown.
         Applying -25% to already-natural audio produced real, measured 1.66–
         1.97 w/s — too SLOW — while solving the derivative equation
         (pace_at_rate = pace_at_0 × speed_factor) back out shows the ORIGINAL,
         unadjusted audio was already at 2.2–2.6 w/s: inside the natural target
         band the whole time. The fix was the regression.
         A version can still override with `speech_rate` if its own content
         genuinely needs a different pace. */
      const rate = L.speech_rate ?? "0%";
      const turns = L.turns.map(t => ({ ...t, rate: t.rate ?? rate }));

      process.stdout.write(`  cutting ${L.audio_id}.mp3 (rate ${rate}) … `);
      const ok = await tts.synthesise(turns, file);
      if (!ok) { console.log("FAILED"); process.exitCode = 1; continue; }
      console.log(`${Math.round(fs.statSync(file).size / 1024)} kB`);
      made++;
    }

    const duration = mp3Duration(file);
    if (!duration) {
      console.error(`  could not read a duration from ${L.audio_id}.mp3 — not registering`);
      process.exitCode = 1;
      continue;
    }

    await pool.query(
      `INSERT INTO b2_audio_assets
         (id, path, kind, duration_seconds, transcript_available, voice_set,
          source_type, review_status)
       VALUES ($1,$2,'assessment',$3,true,$4,'ORIGINAL','AUTO_QA_PASS')
       ON CONFLICT (id) DO UPDATE SET
         duration_seconds=EXCLUDED.duration_seconds,
         transcript_available=EXCLUDED.transcript_available`,
      [L.audio_id, `/b2/audio/${L.audio_id}.mp3`, duration,
       [...new Set(L.turns.map(t => t.voice))].join("+")]);
    console.log(`  registered ${L.audio_id}  ${duration}s  voices=${[...new Set(L.turns.map(t => t.voice))].join("+")}`);
    registered++;

    /* LINK THE SECTION TO THE ASSET NOW, not only on the next seed run.
       b2_paper_sections.audio_asset_id is a foreign key, so it could not be set
       while the asset did not exist — but leaving that as a second manual step
       is exactly the kind of gap this tool's own verification step exists to
       catch. Better to close it here: cutting the audio is what "the audio is
       ready" should mean, without a second command in between. */
    await pool.query(
      `UPDATE b2_paper_sections SET audio_asset_id=$1
        WHERE paper_id=$2 AND module='hoeren' AND audio_intended_id=$1`,
      [L.audio_id, v.id]);
  }

  /* ── SELF-VERIFICATION ───────────────────────────────────────────────────
     Cutting a file and inserting a row is not the job; the job is a listening
     section a learner can actually use. So this checks the three things that
     can still be wrong afterwards — the asset is not attached to its section,
     the file is not where the row says it is, or the clip is too fast to be a
     fair single-play test — and exits non-zero if any of them is.

     It runs here rather than only in the audit because whoever runs this
     command is the person who can fix what it finds, and they should not have
     to run a second thing to learn that the first one half-worked. */
  console.log(`\n${made} file(s) cut, ${registered} asset(s) registered.\n`);

  const problems = [];
  const { rows } = await pool.query(
    `SELECT s.paper_id, s.audio_required, s.audio_intended_id, s.audio_asset_id,
            a.path, a.duration_seconds
       FROM b2_paper_sections s
       LEFT JOIN b2_audio_assets a ON a.id = s.audio_asset_id
      WHERE s.paper_id LIKE 'core-2026b%' AND s.module = 'hoeren'
      ORDER BY s.paper_id`);

  console.log("verification:");
  for (const r of rows) {
    const v = SEED_BY_ID[r.paper_id];
    const words = v ? v.listening.turns.map(t => t.text).join(" ").split(/\s+/).filter(Boolean).length : null;

    if (!r.audio_asset_id) {
      problems.push(`${r.paper_id}: audio "${r.audio_intended_id}" still not attached`);
      console.log(`  FAIL  ${r.paper_id}  not attached`);
      continue;
    }
    const onDisk = fs.existsSync(path.join(OUT, `${r.audio_asset_id}.mp3`));
    if (!onDisk) {
      problems.push(`${r.paper_id}: registered as ${r.audio_asset_id} but no file on disk`);
      console.log(`  FAIL  ${r.paper_id}  registered but missing on disk`);
      continue;
    }
    const wps = words && r.duration_seconds ? words / r.duration_seconds : null;
    const pace = wps === null ? "pace unknown"
      : wps > 3.0 ? `TOO FAST ${wps.toFixed(1)} w/s`
      : wps < 1.8 ? `TOO SLOW ${wps.toFixed(1)} w/s`
      : `${wps.toFixed(1)} w/s`;
    if (wps !== null && (wps > 3.0 || wps < 1.8)) {
      problems.push(`${r.paper_id}: ${pace} — re-run with --force after adjusting speech_rate`);
      console.log(`  WARN  ${r.paper_id}  ${r.duration_seconds}s  ${pace}`);
    } else {
      console.log(`  OK    ${r.paper_id}  ${r.duration_seconds}s  ${pace}  → ${r.path}`);
    }
  }

  if (problems.length) {
    console.error(`\n${problems.length} problem(s):`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exitCode = 1;
  } else {
    console.log("\nAll core-2026b listening audio is cut, registered, attached and at a usable pace.");
    console.log("Restart the API so the learner payload reports it as available.");
  }
  await pool.end();
}

/* Seed transcripts, used only to count words for the pace check. */
const SEED_BY_ID = Object.fromEntries(VERSIONS.map(v => [v.id, v]));

main().catch(e => { console.error("FAILED:", e.message); process.exit(1); });
