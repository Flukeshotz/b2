/**
 * Produce the audio for an exam section — one file per text.
 *
 *   node tools/build_exam_audio.js hoeren_t1_alltag
 *   node tools/build_exam_audio.js hoeren_t1_alltag --verify
 *
 * SEPARATE FROM build_audio.js on purpose. That script slices a single long
 * source into sections because the old Goethe Aufgabe 2 replayed a text in
 * pieces. Teil 1 is five UNRELATED texts, each played once and whole, so the
 * unit here is the text and there is no section replay to serve. Sharing a
 * script would have meant one of the two lying about what it produces.
 *
 * CONTENT IS VALIDATED FIRST. Audio is the expensive artefact; synthesising a
 * section whose answer key is broken wastes the spend and, worse, makes the
 * broken version feel finished.
 */

require("../src/env")();
const fs = require("node:fs");
const path = require("node:path");
const { Pool } = require("pg");
const tts = require("../src/b2/tts");
const { validateSection } = require("../src/b2/exam_section");

const pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgresql://localhost/learn_german" });
const OUT_DIR = path.join(__dirname, "../public/b2/audio/exam");

/* Same dial as build_audio.js and for the same reason: Azure's default read is
   208 wpm, far above the pace anybody speaks at. Teil 1 is everyday speech, so
   it sits a little quicker than the discussion source — but "authentic speed"
   still means how people talk, not how fast the synthesiser will go. */
const BASELINE_WPM = 208;
const TARGET_WPM = 155;
const RATE = `${Math.round((TARGET_WPM / BASELINE_WPM - 1) * 100)}%`;

const pauseAfter = (turn, next) => {
  if (!next) return 250;
  return next.speaker !== turn.speaker ? 400 : 200;
};

async function main() {
  const id = process.argv[2];
  if (!id) { console.error("usage: build_exam_audio.js <section_file>"); process.exit(1); }
  const mod = require(path.join(__dirname, `../src/seed/b2/exam/${id}.js`));
  const { SECTION, TEXTS } = mod;

  const v = validateSection(SECTION, TEXTS);
  if (!v.ok) {
    console.error(`\nBLOCKED — the section does not validate. No audio built.\n`);
    for (const f of v.fails) console.error(`  FAIL  ${f}`);
    process.exit(1);
  }
  for (const w of v.warns) console.warn(`  WARN  ${w}`);

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const built = [];
  for (const text of TEXTS) {
    const turns = text.turns.map((t, i) => ({
      text: t.de, voice: t.voice, speaker: t.speaker, rate: RATE,
      pauseAfterMs: pauseAfter(t, text.turns[i + 1]),
    }));
    const file = `${SECTION.id}_t${text.no}.mp3`;
    const out = await tts.synthesise(turns, path.join(OUT_DIR, file));
    if (!out) { console.error(`  text ${text.no}: synthesis failed (is AZURE_SPEECH_KEY set?)`); process.exit(1); }
    const words = text.turns.map(t => t.de.split(/\s+/).length).reduce((a, b) => a + b, 0);
    built.push({ no: text.no, file, bytes: out.bytes, words });
    console.log(`  text ${text.no}  ${file}  ${(out.bytes / 1024).toFixed(0)} kB  ${words} Wörter`);
  }
  console.log(`\nBuilt ${built.length} files into public/b2/audio/exam/`);
  await pool.end();
}

main().catch(e => { console.error(e.message); process.exit(1); });
