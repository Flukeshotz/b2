#!/usr/bin/env node
/**
 * Synthesise the listening audio for the assessment banks.
 *
 *   node tools/make_assessment_audio.js            # only what is missing
 *   node tools/make_assessment_audio.js --force    # re-cut everything
 *
 * V2 and V3 were authored in Phase 3A as transcripts — dialogue turns with
 * named voices — and never cut to audio. Until they are, those listening items
 * cannot be answered, so this closes the gap between "the content exists" and
 * "a learner can hear it".
 *
 * V1 IS NOT TOUCHED. Its listening section points at src_muede s3, which is
 * practice audio that already exists on disk. Re-cutting it here would be a
 * silent edit to the baseline every future result is compared against — that is
 * an explicit re-seed decision, not a side effect of generating V2.
 *
 * Needs AZURE_SPEECH_REGION and a key, and therefore needs network. It reports
 * what it would do and exits cleanly when TTS is not configured, rather than
 * writing silent files that would look like success.
 */

require("../src/env")();
const fs = require("node:fs");
const path = require("node:path");
const tts = require("../src/b2/tts");
const { VERSIONS } = require("../src/seed/b2/assessment");

const OUT = path.join(__dirname, "../public/b2/audio");
const FORCE = process.argv.includes("--force");

async function main() {
  if (!tts.configured || (typeof tts.configured === "function" && !tts.configured())) {
    console.error("Azure Speech is not configured (AZURE_SPEECH_REGION + a key).");
    console.error("Nothing was written. Set them and re-run.");
    process.exit(1);
  }
  fs.mkdirSync(OUT, { recursive: true });

  let made = 0, skipped = 0;
  for (const [id, v] of Object.entries(VERSIONS)) {
    const sec = v.sections.find(s => s.key === "listening");
    if (!sec) continue;
    if (!sec.turns) {
      // V1: points at an existing practice source rather than owning a script.
      console.log(`  ${id}  external audio (${sec.sourceId}_${sec.sectionId}) — not regenerated`);
      skipped++;
      continue;
    }
    const file = path.join(OUT, `${sec.audioId}.mp3`);
    if (fs.existsSync(file) && !FORCE) {
      console.log(`  ${id}  ${sec.audioId}.mp3 already exists — skipping`);
      skipped++;
      continue;
    }
    process.stdout.write(`  ${id}  cutting ${sec.audioId}.mp3 … `);
    const ok = await tts.synthesise(sec.turns, file);
    if (!ok) { console.log("FAILED"); process.exitCode = 1; continue; }
    const kb = Math.round(fs.statSync(file).size / 1024);
    console.log(`${kb} kB`);
    made++;
  }
  console.log(`\n${made} file(s) written, ${skipped} skipped.`);
  if (made) {
    console.log("Restart the API so the availability check sees them.");
  }
}

main().catch(e => { console.error("FAILED:", e.message); process.exit(1); });
