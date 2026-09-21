/**
 * Does the produced audio actually say what the script says?
 *
 *   node tools/verify_audio.js src_muede
 *
 * WHY THIS IS SENTENCE-LEVEL. The recogniser behind speech.assess() is
 * single-shot and caps at roughly fifteen seconds. Earlier versions of this
 * check fed it whole 25-second turns, got nothing back, and printed
 * "recognition unavailable" — which reads like a failing item but was actually
 * the check failing to run. A verification that cannot distinguish "the audio is
 * wrong" from "I did not look" is worse than none, because it invites you to
 * believe you checked.
 *
 * So: sentences, at the production voice, style and rate. Two things are
 * measured —
 *   1. WORD ERROR RATE per speaker. High WER on synthetic audio means a human
 *      will struggle too; a learner who misses that item was failed by us.
 *   2. ITEM-CRITICAL DETAILS. Every fact an item asks about must be recoverable.
 */

require("../src/env")();
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const tts = require("../src/b2/tts");
const speech = require("../src/b2/speech");

const RATE = "-29%"; // must match tools/build_audio.js

const norm = (s) => s.toLowerCase()
  .replace(/[„“"'.,!?–—:;()]/g, " ")
  .replace(/ß/g, "ss").replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue")
  .replace(/\s+/g, " ").trim();

/** Word-level edit distance, as a fraction of the reference length. */
function wer(ref, hyp) {
  const r = norm(ref).split(" "), h = norm(hyp).split(" ");
  const d = Array.from({ length: r.length + 1 }, (_, i) =>
    Array.from({ length: h.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= r.length; i++)
    for (let j = 1; j <= h.length; j++)
      d[i][j] = r[i - 1] === h[j - 1] ? d[i - 1][j - 1]
        : 1 + Math.min(d[i - 1][j], d[i][j - 1], d[i - 1][j - 1]);
  return { wer: d[r.length][h.length] / r.length, refLen: r.length };
}

const allSentences = (turn) => turn.de.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
/** For WER sampling: long enough to be a fair test of the voice. */
const sentences = (turn) => allSentences(turn).filter(s => s.split(/\s+/).length >= 4);

/* For a critical detail: the sentence that actually CONTAINS it — including
   one-word sentences like "Planbarkeit." A previous version filtered those out
   and then tested a neighbouring sentence, which failed for a reason that had
   nothing to do with the audio. A check that fails on its own selection bug
   teaches you to distrust the check. Short hits are padded with the sentence
   before them so the recogniser has enough to work with. */
function sentenceContaining(turn, needle) {
  const all = allSentences(turn);
  const i = all.findIndex(s => s.toLowerCase().includes(needle.toLowerCase()));
  if (i < 0) return null;
  const hit = all[i];
  if (hit.split(/\s+/).length >= 5) return hit;
  return [all[i - 1], hit].filter(Boolean).join(" ");
}

async function hear(turn, text) {
  const wav = path.join(os.tmpdir(), `va-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.wav`);
  const made = await tts.synthesise(
    [{ voice: turn.voice, text, style: turn.style || undefined, rate: RATE }], wav);
  if (!made) return { error: "synthesis_failed" };
  const got = await speech.assess(wav).catch(e => ({ error: e.message }));
  try { fs.unlinkSync(wav); } catch {}
  if (!got) return { error: "no_recognition_result" };
  if (got.error) return got;
  return { text: got.text, confidence: got.confidence, seconds: got.durationSec };
}

(async () => {
  const id = process.argv[2] || "src_muede";
  const src = require(path.join(__dirname, `../src/seed/b2/${id}.js`));

  if (!tts.configured() || !speech.configured()) {
    console.error("\nNOT VERIFIED — speech services are not configured. Refusing to report a pass.");
    process.exit(2);
  }

  console.log(`\nAUDIO VERIFICATION — ${id}\n`);

  /* 1. WORD ERROR RATE, sampled evenly across the three speakers so one clear
        voice cannot mask a muddy one. */
  const bySpeaker = {};
  for (const t of src.SCRIPT) (bySpeaker[t.speaker] ||= []).push(t);

  console.log("  Word error rate — synthesised, then recognised back\n");
  const results = [];
  for (const [speaker, turns] of Object.entries(bySpeaker)) {
    const pool = turns.flatMap(t => sentences(t).map(s => ({ turn: t, s })));
    const pick = [0, Math.floor(pool.length / 2), pool.length - 1]
      .filter((v, i, a) => a.indexOf(v) === i).map(i => pool[i]).filter(Boolean);

    let sum = 0, n = 0, worst = null;
    for (const p of pick) {
      const got = await hear(p.turn, p.s);
      if (got.error) { console.log(`    ${speaker.padEnd(15)} ERROR  ${got.error}`); continue; }
      const { wer: w } = wer(p.s, got.text);
      sum += w; n++;
      if (!worst || w > worst.w) worst = { w, ref: p.s, hyp: got.text, conf: got.confidence };
    }
    if (!n) { results.push({ speaker, ok: false, note: "no sentence could be recognised" }); continue; }
    const avg = sum / n;
    const ok = avg <= 0.15;
    results.push({ speaker, avg, ok, worst });
    console.log(`    ${speaker.padEnd(15)} ${(avg * 100).toFixed(1).padStart(5)}% WER over ${n} sentences   ${ok ? "OK" : "HIGH"}`);
    if (worst && worst.w > 0.15) {
      console.log(`        worst: "${worst.ref.slice(0, 72)}"`);
      console.log(`        heard: "${worst.hyp.slice(0, 72)}"`);
    }
  }

  /* 2. ITEM-CRITICAL DETAILS. Each is the sentence an item's key depends on. */
  console.log("\n  Details the questions depend on\n");
  const critical = [
    { label: "„zwei Tage“ (detail)",      find: "brauche ich nach einer Nachtschicht", needle: "zwei Tage",     want: /zwei tage/i },
    { label: "„Übergaben“ (detail)",      find: "Kürzere Schichten heißt mehr",        needle: "Übergaben",     want: /(ue|ü)bergab/i },
    { label: "„Planbarkeit“ (main idea)", find: "Planbarkeit",                         needle: "Planbarkeit",   want: /planbar/i },
    { label: "„kaum jemand“ (inference)", find: "Zurzeit: kaum jemand",                needle: "kaum jemand",   want: /kaum jemand/i },
    { label: "„berechtigt“ (attitude)",   find: "und er ist berechtigt",               needle: "berechtigt",    want: /berechtigt/i },
  ];
  let criticalFails = 0;
  for (const c of critical) {
    const turn = src.SCRIPT.find(t => t.de.includes(c.find));
    if (!turn) { console.log(`    FAIL  ${c.label} — that line is no longer in the script`); criticalFails++; continue; }
    const sent = sentenceContaining(turn, c.needle);
    if (!sent) { console.log(`    FAIL  ${c.label} — no sentence in that turn contains "${c.needle}"`); criticalFails++; continue; }
    const got = await hear(turn, sent);
    if (got.error) { console.log(`    FAIL  ${c.label} — ${got.error}`); criticalFails++; continue; }
    const ok = c.want.test(norm(got.text)) || c.want.test(got.text);
    if (!ok) { criticalFails++; console.log(`    FAIL  ${c.label}\n          heard: "${got.text.slice(0, 80)}"`); }
    else console.log(`    PASS  ${c.label}`);
  }

  /* 3. STRUCTURE — things measurable without ears. */
  console.log("\n  Structure\n");
  const voices = [...new Set(src.SCRIPT.map(t => t.voice))];
  const speakers = Object.keys(bySpeaker);
  console.log(`    ${voices.length === speakers.length ? "PASS" : "FAIL"}  every speaker has a distinct voice (${speakers.map((s, i) => `${s}=${voices[i] || "?"}`).join(", ")})`);
  const styled = src.SCRIPT.filter(t => t.style).length;
  console.log(`    INFO  ${styled} turns carry a speaking style (the tired nurse)`);
  const secs = src.sectionRanges();
  const rates = secs.map(sec => {
    const w = src.SCRIPT.slice(sec.from, sec.to + 1).reduce((n, t) => n + t.de.split(/\s+/).length, 0);
    return { id: sec.id, w };
  });
  console.log(`    INFO  ${secs.length} sections, ${rates.map(r => r.w).join("/")} words`);

  const werFails = results.filter(r => !r.ok);
  console.log("\n" + "─".repeat(64));
  if (werFails.length || criticalFails) {
    console.log(`  NOT VERIFIED — ${werFails.length} speaker(s) above 15% WER, ${criticalFails} critical detail(s) unrecoverable.`);
    console.log("  A learner who gets these items wrong would have been failed by us.");
    process.exit(1);
  }
  console.log("  VERIFIED — every speaker is recognised cleanly and every detail an item");
  console.log("  asks about is recoverable from the produced audio.");
  console.log("\n  NOT covered by this check: whether the German SOUNDS natural to a human ear.");
  console.log("  Word error rate is a proxy. A native speaker still has to listen.");
})().catch(e => { console.error("\nVERIFICATION ERROR:", e.message); process.exit(2); });
