#!/usr/bin/env node
/**
 * Synthesise and register audio for Goethe/telc exam-practice Hören sets.
 *
 *   node tools/make_exam_audio.js [--force]
 *
 * Mirrors make_core2026b_audio.js / make_practice_audio.js's cut-then-
 * register order for the same reason: a b2_audio_assets row's duration
 * must be measured off the real file (ffprobe), never assumed.
 *
 * Covers goethe-b2-hoeren-1/2 and telc-b2-hoeren-1/2 (seed_exam_papers.js).
 * Each clip is registered ONCE and then attached to EVERY b2_paper_sections
 * row that declares the same `audio_intended_id` — this deliberately
 * includes both the standalone set's own section AND the matching section
 * inside goethe-b2-complete-1 / telc-b2-complete-1, which reuse the
 * standalone set's transcript verbatim (the same composition pattern the
 * content audit already documents for Lesen/Schreiben/Sprechen reuse in
 * those two papers). One asset, two sections — not two copies of one clip.
 *
 * NEVER FAKES AUDIO. If Azure Speech is not configured, nothing is written
 * or registered, and the affected sections correctly keep audio_required
 * with no asset attached — content_model.js's validateForProduction()
 * refuses to call that combination production-ready.
 */
require("../src/env")();
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const tts = require("../src/b2/tts");
const pool = require("../src/db/pool");
const exam = require("../src/seed/seed_exam_papers");

const OUT = path.join(__dirname, "../public/b2/audio");
const FORCE = process.argv.includes("--force");

const SETS = [exam.GOETHE_HOEREN_1, exam.GOETHE_HOEREN_2, exam.TELC_HOEREN_1, exam.TELC_HOEREN_2];

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
    console.error("Nothing written, nothing registered. Hören sections keep audio_required");
    console.error("with no asset attached — correctly not production-ready.");
    process.exit(1);
  }
  fs.mkdirSync(OUT, { recursive: true });

  let made = 0, registered = 0, attached = 0;
  const problems = [];

  for (const spec of SETS) {
    const s = spec.section;
    const audioId = s.audio_intended_id;
    const file = path.join(OUT, `${audioId}.mp3`);

    if (fs.existsSync(file) && !FORCE) {
      console.log(`  ${audioId}.mp3 already exists — not recut`);
    } else {
      process.stdout.write(`  cutting ${audioId}.mp3 … `);
      const ok = await tts.synthesise(s.turns, file);
      if (!ok) { console.log("FAILED"); problems.push(`${spec.paper.id}: synthesis failed`); continue; }
      console.log(`${Math.round(fs.statSync(file).size / 1024)} kB`);
      made++;
    }

    const duration = mp3Duration(file);
    if (!duration) {
      problems.push(`${spec.paper.id}: could not read a duration from ${audioId}.mp3 — not registering`);
      continue;
    }

    await pool.query(
      `INSERT INTO b2_audio_assets
         (id, path, kind, duration_seconds, transcript_available, voice_set,
          source_type, review_status)
       VALUES ($1,$2,'exam',$3,true,$4,'ORIGINAL','AUTO_QA_PASS')
       ON CONFLICT (id) DO UPDATE SET
         duration_seconds=EXCLUDED.duration_seconds,
         transcript_available=EXCLUDED.transcript_available`,
      [audioId, `/b2/audio/${audioId}.mp3`, duration, [...new Set(s.turns.map(t => t.voice))].join("+")]);
    registered++;

    // Attach to EVERY section declaring this audio_intended_id — the
    // standalone set and, where it exists, the complete paper's reused copy.
    const { rowCount } = await pool.query(
      `UPDATE b2_paper_sections SET audio_asset_id=$1
        WHERE module='hoeren' AND audio_intended_id=$1`,
      [audioId]);
    attached += rowCount;

    const words = s.turns.map(t => t.text).join(" ").split(/\s+/).filter(Boolean).length;
    const wps = words / duration;
    const pace = wps > 3.0 ? `TOO FAST ${wps.toFixed(1)} w/s`
      : wps < 1.8 ? `TOO SLOW ${wps.toFixed(1)} w/s`
      : `${wps.toFixed(1)} w/s`;
    if (wps > 3.0 || wps < 1.8) problems.push(`${spec.paper.id}: ${pace} — re-run with --force after adjusting speech_rate`);
    console.log(`  registered ${audioId}  ${duration}s  ${pace}  attached to ${rowCount} section(s)  voices=${[...new Set(s.turns.map(t => t.voice))].join("+")}`);
  }

  console.log(`\n${made} file(s) cut, ${registered} asset(s) registered, ${attached} section attachment(s).\n`);

  const { rows } = await pool.query(
    `SELECT s.paper_id, s.audio_required, s.audio_intended_id, s.audio_asset_id, a.path
       FROM b2_paper_sections s LEFT JOIN b2_audio_assets a ON a.id = s.audio_asset_id
      WHERE s.audio_intended_id = ANY($1) AND s.module='hoeren'
      ORDER BY s.paper_id`,
    [SETS.map(s => s.section.audio_intended_id)]);

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
    console.log("\nAll exam-practice Hören audio is cut, registered, attached (standalone + complete-paper reuse) and at a usable pace.");
    console.log("Restart the API so the learner payload reports it as available.");
  }
  await pool.end();
}

main().catch(e => { console.error("FAILED:", e.message); process.exit(1); });
