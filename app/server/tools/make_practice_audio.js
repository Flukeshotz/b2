#!/usr/bin/env node
/**
 * Synthesise and register audio for practice-bank listening papers.
 *
 *   node tools/make_practice_audio.js [--force]
 *
 * Mirrors make_core2026b_audio.js's cut-then-register order for the exact
 * same reason: a b2_audio_assets row's duration must be measured off the
 * real file (via ffprobe), never assumed, because audio_asset_id is a
 * foreign key a listening section uses to claim "this clip really exists".
 *
 * Covers every board='custom' listening paper across both seed files:
 * practice-listening-1 (seed_practice_bank.js's LISTENING_1) and the full
 * depth-pass corpus in seed_listening_bank.js's ALL. Written as a loop over
 * PAPERS so a new listening paper only needs an entry in one of those two
 * files, never a new generation script.
 */
require("../src/env")();
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const tts = require("../src/b2/tts");
const pool = require("../src/db/pool");
const { LISTENING_1 } = require("../src/seed/seed_practice_bank");
const { ALL: LISTENING_DEPTH_PASS } = require("../src/seed/seed_listening_bank");

const OUT = path.join(__dirname, "../public/b2/audio");
const FORCE = process.argv.includes("--force");

const PAPERS = [LISTENING_1, ...LISTENING_DEPTH_PASS];

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
    console.error("Nothing written, nothing registered. The listening section will");
    console.error("correctly report audio_required with no asset attached.");
    process.exit(1);
  }
  fs.mkdirSync(OUT, { recursive: true });

  let made = 0, registered = 0;
  const problems = [];

  for (const p of PAPERS) {
    const s = p.section;
    const audioId = s.audio_intended_id;
    const file = path.join(OUT, `${audioId}.mp3`);

    if (fs.existsSync(file) && !FORCE) {
      console.log(`  ${audioId}.mp3 already exists — not recut`);
    } else {
      process.stdout.write(`  cutting ${audioId}.mp3 … `);
      const ok = await tts.synthesise(s.turns, file);
      if (!ok) { console.log("FAILED"); problems.push(`${p.paper.id}: synthesis failed`); continue; }
      console.log(`${Math.round(fs.statSync(file).size / 1024)} kB`);
      made++;
    }

    const duration = mp3Duration(file);
    if (!duration) {
      problems.push(`${p.paper.id}: could not read a duration from ${audioId}.mp3 — not registering`);
      continue;
    }

    await pool.query(
      `INSERT INTO b2_audio_assets
         (id, path, kind, duration_seconds, transcript_available, voice_set,
          source_type, review_status)
       VALUES ($1,$2,'practice',$3,true,$4,'ORIGINAL','AUTO_QA_PASS')
       ON CONFLICT (id) DO UPDATE SET
         duration_seconds=EXCLUDED.duration_seconds,
         transcript_available=EXCLUDED.transcript_available`,
      [audioId, `/b2/audio/${audioId}.mp3`, duration,
       [...new Set(s.turns.map(t => t.voice))].join("+")]);
    registered++;

    await pool.query(
      `UPDATE b2_paper_sections SET audio_asset_id=$1
        WHERE paper_id=$2 AND module='hoeren' AND audio_intended_id=$1`,
      [audioId, p.paper.id]);

    const words = s.turns.map(t => t.text).join(" ").split(/\s+/).filter(Boolean).length;
    const wps = words / duration;
    const pace = wps > 3.0 ? `TOO FAST ${wps.toFixed(1)} w/s`
      : wps < 1.8 ? `TOO SLOW ${wps.toFixed(1)} w/s`
      : `${wps.toFixed(1)} w/s`;
    if (wps > 3.0 || wps < 1.8) problems.push(`${p.paper.id}: ${pace} — re-run with --force after adjusting speech_rate`);
    console.log(`  registered ${audioId}  ${duration}s  ${pace}  voices=${[...new Set(s.turns.map(t => t.voice))].join("+")}`);
  }

  console.log(`\n${made} file(s) cut, ${registered} asset(s) registered.\n`);

  // Self-verification: attached, on disk, at a usable pace.
  const { rows } = await pool.query(
    `SELECT s.paper_id, s.audio_required, s.audio_intended_id, s.audio_asset_id, a.path
       FROM b2_paper_sections s LEFT JOIN b2_audio_assets a ON a.id = s.audio_asset_id
      WHERE s.paper_id = ANY($1) AND s.module = 'hoeren'`,
    [PAPERS.map(p => p.paper.id)]);

  for (const r of rows) {
    if (!r.audio_asset_id) { problems.push(`${r.paper_id}: audio "${r.audio_intended_id}" still not attached`); continue; }
    if (!fs.existsSync(path.join(OUT, `${r.audio_asset_id}.mp3`))) {
      problems.push(`${r.paper_id}: registered as ${r.audio_asset_id} but no file on disk`); continue;
    }
    console.log(`  OK    ${r.paper_id}  → ${r.path}`);
  }

  if (problems.length) {
    console.error(`\n${problems.length} problem(s):`);
    for (const p of problems) console.error(`  - ${p}`);
    process.exitCode = 1;
  } else {
    console.log("\nAll practice-bank listening audio is cut, registered, attached and at a usable pace.");
    console.log("Restart the API so the learner payload reports it as available.");
  }
  await pool.end();
}

main().catch(e => { console.error("FAILED:", e.message); process.exit(1); });
