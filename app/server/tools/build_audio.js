/**
 * Produce the audio for a source, one file per section.
 *
 *   node tools/build_audio.js src_muede
 *   node tools/build_audio.js src_muede --verify   # also recognise it back
 *
 * Per-section rather than one long file, for three reasons: a nine-minute SSML
 * request sits near the service ceiling; a failure costs one section rather than
 * the whole build; and Goethe's Hören Aufgabe 2 plays the text whole and then
 * AGAIN IN SECTIONS, so the player needs the pieces regardless.
 *
 * Writes real measured durations back to the database. The estimated timings in
 * the script are for authoring; once audio exists, the audio is the truth.
 */

require("../src/env")();
const fs = require("node:fs");
const path = require("node:path");
const { Pool } = require("pg");
const tts = require("../src/b2/tts");

const pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgresql://localhost/learn_german" });
const OUT_DIR = path.join(__dirname, "../public/b2/audio");

/* SPEAKING RATE.
   Azure's neural voices default to a news-read pace. Left alone, this script
   came out at 208 wpm — far above real German discussion (roughly 130–160) and
   above anything an exam board would set. "Authentic speed" means the pace
   people actually talk at, not the fastest the synthesiser will go: too fast is
   as wrong as the slow, over-articulated read that makes a B1 item out of a B2
   text. TARGET_WPM is the dial; RATE is derived from the measured baseline. */
const BASELINE_WPM = 208;   // measured from the first unrated build
const TARGET_WPM = 148;
const RATE = `${Math.round((TARGET_WPM / BASELINE_WPM - 1) * 100)}%`;

/* A turn's pause is the beat before the NEXT speaker. Longer when the speaker
   changes, and longer still where the script marks a hesitation — Frau Krause
   interrupting herself is a declared difficulty feature, not an accident. */
function pauseAfter(turn, next) {
  if (!next) return 300;
  const changed = next.speaker !== turn.speaker;
  const hesitates = /…|\s–\s/.test(turn.de);
  return (changed ? 420 : 220) + (hesitates ? 180 : 0);
}

async function build(id, { verify = false } = {}) {
  if (!tts.configured()) {
    console.error("TTS is not configured — set AZURE_SPEECH_REGION and a key.");
    process.exit(1);
  }
  const src = require(path.join(__dirname, `../src/seed/b2/${id}.js`));
  const ranges = src.sectionRanges();
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const built = [];
  let cumulativeMs = 0;

  for (const sec of ranges) {
    const turns = src.SCRIPT.slice(sec.from, sec.to + 1).map((t, i, all) => ({
      voice: t.voice,
      text: t.de,
      style: t.style || undefined,
      rate: RATE,
      pauseAfterMs: pauseAfter(t, all[i + 1]),
    }));

    const file = `${id}_${sec.id}.mp3`;
    const out = path.join(OUT_DIR, file);
    process.stdout.write(`  ${sec.id} ${sec.label.padEnd(30)} `);

    const made = await tts.synthesise(turns, out);
    if (!made) { console.log("FAILED"); process.exit(1); }

    const seconds = await mp3Duration(out);
    console.log(`${(made.bytes / 1024).toFixed(0).padStart(4)} KB  ${seconds ? seconds.toFixed(1) + "s" : "?"}`);

    built.push({
      id: sec.id, label: sec.label, file, url: `/b2/audio/${file}`,
      from: sec.from, to: sec.to,
      startMs: Math.round(cumulativeMs),
      durationMs: seconds ? Math.round(seconds * 1000) : null,
    });
    cumulativeMs += (seconds || 0) * 1000;
  }

  const totalS = Math.round(cumulativeMs / 1000);

  /* Re-anchor the markers and item cues to REAL audio time. The authoring
     estimate put the whole discussion at 547s; if the produced audio differs,
     every timestamp attached to it is wrong, and a marker that points at the
     wrong second is worse than no marker. */
  const scale = src.DURATION_S ? (totalS / src.DURATION_S) : 1;
  const markers = src.MARKERS.map(m => ({ ...m, ms: Math.round(m.ms * scale) }));

  await pool.query(
    `UPDATE b2_sources
        SET audio_url=$2, duration_s=$3, markers=$4,
            script = $5, updated_at=now()
      WHERE id=$1`,
    [id, built[0].url, totalS, JSON.stringify(markers),
     JSON.stringify(src.SCRIPT.map(t => ({ ...t, ms: Math.round(t.ms * scale) })))]
  );
  await pool.query(
    `UPDATE b2_experiences
        SET steps = jsonb_set(steps, '{0}', steps->0)
      WHERE source_id=$1 AND false`, [id]); // no-op placeholder; sections live on the source

  // Sections are stored on the declaration so the player can fetch them with the source.
  await pool.query(
    `UPDATE b2_sources SET declaration = declaration || $2::jsonb WHERE id=$1`,
    [id, JSON.stringify({ sections: built })]);

  const wpm = src.SCRIPT.reduce((n, t) => n + t.de.split(/\s+/).length, 0) / (totalS / 60);
  console.log(`\n  measured ${wpm.toFixed(0)} wpm at rate ${RATE} (target ${TARGET_WPM})`);
  if (wpm > 175) console.log("  WARNING: still faster than real German discussion — lower TARGET_WPM.");
  if (wpm < 115) console.log("  WARNING: slower than authentic speech — this reads as a B1 item.");
  console.log(`  total ${Math.floor(totalS / 60)}:${String(totalS % 60).padStart(2, "0")}  (authoring estimate was ${Math.floor(src.DURATION_S / 60)}:${String(src.DURATION_S % 60).padStart(2, "0")}, scale ${scale.toFixed(3)})`);

  if (verify) {
    console.log("\n  Verifying the produced audio is intelligible…");
    /* PHRASE LEVEL, not section level. speech.assess() uses single-shot
       recognition, which caps at roughly fifteen seconds — feeding it a
       sixty-second section returns nothing and the check silently "fails" for
       the wrong reason. So each assertion is synthesised as the single TURN it
       occurs in, at the same voice, style and rate as the real audio.

       This is the check that matters: if the recogniser cannot hear a detail an
       item asks about, a learner will struggle too, and that is our fault
       rather than their German. */
    const speech = require("../src/b2/speech");
    const os = require("node:os");
    const assertions = [
      { label: "„zwei Tage“ — detail item",        contains: "brauche ich nach einer Nachtschicht", pattern: "zwei Tage" },
      { label: "„Übergaben“ — detail item",        contains: "Kürzere Schichten heißt mehr",        pattern: "(Ü|U)bergab" },
      { label: "„Planbarkeit“ — main-idea item",   contains: "Planbarkeit",                         pattern: "planbar" },
      { label: "„Sehen Sie.“ — inference item",    contains: "Zurzeit: kaum jemand",                pattern: "kaum jemand" },
    ];
    let failed = 0;
    for (const a of assertions) {
      const turn = src.SCRIPT.find(t => t.de.includes(a.contains));
      if (!turn) { console.log(`    FAIL  ${a.label} — the line is no longer in the script`); failed++; continue; }
      const wav = path.join(os.tmpdir(), `verify-${Date.now()}.wav`);
      const made = await tts.synthesise([{ voice: turn.voice, text: turn.de, style: turn.style || undefined, rate: RATE }], wav);
      if (!made) { console.log(`    FAIL  ${a.label} — synthesis failed`); failed++; continue; }
      const heard = await speech.assess(wav).catch(e => { console.log(`          (assess threw: ${e.message})`); return null; });
      try { fs.unlinkSync(wav); } catch {}
      if (!heard) { console.log(`    FAIL  ${a.label} — recognition unavailable`); failed++; continue; }
      const ok = new RegExp(a.pattern, "i").test(heard.text);
      if (!ok) failed++;
      console.log(`    ${ok ? "PASS" : "FAIL"}  ${a.label}`);
      if (!ok) console.log(`          heard: "${heard.text.slice(0, 90)}"`);
    }
    console.log(failed
      ? `\n  ${failed} assertion(s) failed — a learner asked about these would be failed by us, not by their German.`
      : "\n  Every detail the items ask about is recoverable from the audio.");
  }
}

/** Duration from the mp3 frame headers — no dependency, good enough for CBR. */
async function mp3Duration(file) {
  const buf = fs.readFileSync(file);
  const RATES = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
  let i = 0, frames = 0, bitrateSum = 0;
  while (i < buf.length - 4) {
    if (buf[i] === 0xff && (buf[i + 1] & 0xe0) === 0xe0) {
      const br = RATES[(buf[i + 2] & 0xf0) >> 4];
      const sr = [44100, 48000, 32000][(buf[i + 2] & 0x0c) >> 2];
      if (!br || !sr) { i++; continue; }
      const pad = (buf[i + 2] & 0x02) >> 1;
      const len = Math.floor((144 * br * 1000) / sr) + pad;
      if (len < 4) { i++; continue; }
      frames++; bitrateSum += br; i += len;
    } else i++;
  }
  if (!frames) return null;
  const avg = bitrateSum / frames;
  return (buf.length * 8) / (avg * 1000);
}

(async () => {
  const id = process.argv[2] || "src_muede";
  await build(id, { verify: process.argv.includes("--verify") });
  await pool.end();
})().catch(e => { console.error("BUILD FAILED:", e.message); process.exit(1); });
