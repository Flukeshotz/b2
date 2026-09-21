/**
 * Does the exam section's audio actually say what the script says?
 *
 *   node tools/verify_exam_audio.js hoeren_t1_alltag
 *
 * SAME METHOD as verify_audio.js — synthesise a sentence at the production
 * voice and rate, recognise it back, measure word error rate — and the same
 * reason for working sentence by sentence: the recogniser is single-shot and
 * caps around fifteen seconds, so feeding it a whole turn returns nothing and
 * prints a pass that never ran.
 *
 * WHAT IS DIFFERENT, and why this is a harder gate than the one for a source:
 * Teil 1 is heard ONCE. A learner who mishears a source can play it again; here
 * they cannot, so audio that is merely mostly intelligible is not good enough.
 * Every sentence an answer key depends on is checked individually, and any one
 * of them failing blocks the section — a single unclear number turns an item
 * from a listening test into a coin toss the learner cannot appeal.
 */

require("../src/env")();
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const tts = require("../src/b2/tts");
const speech = require("../src/b2/speech");

const RATE = "-25%";        // must match tools/build_exam_audio.js (155/208 wpm)
const WER_LIMIT = 0.15;     // same bar as the source verifier

const norm = (s) => s.toLowerCase()
  .replace(/[„“"'.,!?–—:;()]/g, " ")
  .replace(/ß/g, "ss").replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue")
  .replace(/\s+/g, " ").trim();

function wer(ref, hyp) {
  /* GERMAN COMPOUNDS ARE NOT MISHEARINGS. The recogniser writes "home office"
     for Homeoffice and "dazwischen kommt" for dazwischenkommt — the audio is
     exactly right and only the segmentation convention differs, but word-level
     WER counts each as two errors and blocked a clean recording. If the two
     strings are identical once spaces are removed, the only disagreement is
     about where the gaps go, and a listener hears no difference at all. */
  if (norm(ref).replace(/ /g, "") === norm(hyp || "").replace(/ /g, "")) return 0;
  const r = norm(ref).split(" "), h = norm(hyp || "").split(" ");
  const d = Array.from({ length: r.length + 1 }, (_, i) => [i, ...Array(h.length).fill(0)]);
  for (let j = 0; j <= h.length; j++) d[0][j] = j;
  for (let i = 1; i <= r.length; i++)
    for (let j = 1; j <= h.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (r[i - 1] === h[j - 1] ? 0 : 1));
  return d[r.length][h.length] / r.length;
}

const sentences = (t) => t.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.split(/\s+/).length >= 4);

/* A NETWORK FAILURE IS NOT A CONTENT FAILURE, and neither is it a pass.
   The first run of this script died on a connect timeout half way through —
   which, uncaught, is the worst of the three outcomes: it looks like the audio
   is broken, and it leaves you unsure whether the sentences before it were
   checked. Transient errors are retried; a persistent one stops the run with a
   distinct exit code so nobody reads "no failures" as "verified". */
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function hear(voice, text, attempt = 0) {
  const wav = path.join(os.tmpdir(), `ve-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.wav`);
  try {
    const made = await tts.synthesise([{ voice, text, rate: RATE }], wav);
    if (!made) throw new Error("synthesis returned nothing");
    const got = await speech.assess(wav);
    if (!got) throw new Error("no recognition result");
    return got;
  } catch (e) {
    if (attempt < 3) { await sleep(800 * (attempt + 1)); return hear(voice, text, attempt + 1); }
    return { unavailable: e.message };
  } finally {
    try { fs.unlinkSync(wav); } catch {}
  }
}

(async () => {
  const id = process.argv[2] || "hoeren_t1_alltag";
  const { SECTION, TEXTS } = require(path.join(__dirname, `../src/seed/b2/exam/${id}.js`));

  if (!tts.configured() || !speech.configured()) {
    console.error("\nNOT VERIFIED — speech services are not configured. Refusing to report a pass.");
    process.exit(2);
  }

  console.log(`\nEXAM AUDIO VERIFICATION — ${SECTION.id}\n`);
  let worstOverall = 0, failures = 0, checked = 0;

  for (const text of TEXTS) {
    console.log(`  Text ${text.no} — ${text.situation}`);
    for (const turn of text.turns) {
      for (const s of sentences(turn.de)) {
        const got = await hear(turn.voice, s);
        if (got.unavailable) {
          console.error(`\n  NOT VERIFIED — the speech service did not answer (${got.unavailable}).`);
          console.error(`  ${checked} sentences were checked before this. Refusing to report a pass.\n`);
          process.exit(2);
        }
        if (got.error) { console.log(`    ERROR ${got.error}`); failures++; continue; }
        const w = wer(s, got.text);
        checked++;
        worstOverall = Math.max(worstOverall, w);
        if (w > WER_LIMIT) {
          failures++;
          console.log(`    ${(w * 100).toFixed(0).padStart(3)}%  HIGH  "${s.slice(0, 64)}"`);
          console.log(`              heard  "${(got.text || "").slice(0, 64)}"`);
        }
      }
    }
  }

  console.log(`\n  ${checked} sentences checked, worst ${(worstOverall * 100).toFixed(1)}% WER, ` +
              `${failures} above the ${WER_LIMIT * 100}% limit`);

  /* THE RECEIPT. seed_exam_section.js refuses to publish without it, so a
     section can only go live if this script actually ran and actually passed —
     rather than because somebody remembered running it once. */
  const RECEIPT = path.join(__dirname, "../public/b2/audio/exam/verified.json");
  const prev = fs.existsSync(RECEIPT) ? JSON.parse(fs.readFileSync(RECEIPT, "utf8")) : {};
  prev[SECTION.id] = {
    passed: failures === 0, checked, worstWer: Number(worstOverall.toFixed(3)),
    limit: WER_LIMIT, rate: RATE, at: new Date().toISOString(),
  };
  fs.writeFileSync(RECEIPT, JSON.stringify(prev, null, 2));

  if (failures) {
    console.log(`\n  BLOCKED — Teil 1 is heard once. Audio a learner cannot make out on the ` +
                `first pass turns an item into a coin toss they have no way to appeal.\n`);
    process.exit(1);
  }
  console.log(`\n  PASSED — the audio is recoverable at production rate.\n`);
})();
