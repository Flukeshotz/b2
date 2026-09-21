// Hören audio — Azure Neural TTS on the same key.
//
// This closes OPEN 15 (build / license / record the listening audio), which was
// the only genuine content cost in v1. The resource carries 28 German voices
// across de-DE, de-AT and de-CH.
//
// The point is not that generating audio is cheaper than recording it. It is that
// B2 listening is SUPPOSED to be hard: regional variation, natural pace, more than
// one speaker, and detail buried in the middle of a sentence. A calm read-aloud of
// the same words is a much weaker item. Two of these voices carry eighteen speaking
// styles, so a handover can be delivered by someone who is tired and slightly
// irritated -- which is what a ward handover actually sounds like.

const fs = require("node:fs");

const REGION = process.env.AZURE_SPEECH_REGION || "";
const KEY = () => process.env.AZURE_SPEECH_KEY || process.env.AZURE_AI_API_KEY || process.env.AZURE_OPENAI_API_KEY || "";
const configured = () => !!(REGION && KEY());

// Deliberately small, named set rather than "pick any of 28". A listening bank
// wants recognisable, repeated speakers -- the learner should get used to a ward,
// not meet a stranger every item.
const VOICES = {
  // Expressive pair — for anything where tone carries meaning.
  klaus:  { name: "de-DE-Klaus:MAI-Voice-2", styles: true,  note: "male, 18 styles" },
  mia:    { name: "de-DE-Mia:MAI-Voice-2",   styles: true,  note: "female, 18 styles" },
  // Plain, high-quality — for announcements and neutral narration.
  conrad: { name: "de-DE-ConradNeural",      styles: false, note: "male, neutral" },
  katja:  { name: "de-DE-KatjaNeural",       styles: false, note: "female, neutral" },
  // Regional — B2 listening legitimately includes these, and candidates are
  // rarely prepared for them.
  ingrid: { name: "de-AT-IngridNeural",      styles: false, note: "female, Austrian" },
  jan:    { name: "de-CH-JanNeural",         styles: false, note: "male, Swiss" },
};

const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * @param {Array} turns  [{ voice: 'klaus', text, style?, rate?, pauseAfterMs? }]
 *   One turn is a monologue; several make a dialogue with distinct speakers,
 *   which is what a handover or a doctor-patient item needs.
 */
function ssml(turns) {
  const body = turns.map(t => {
    const v = VOICES[t.voice] || VOICES.conrad;
    let inner = esc(t.text);
    if (t.rate) inner = `<prosody rate="${esc(t.rate)}">${inner}</prosody>`;
    if (t.style && v.styles) inner = `<mstts:express-as style="${esc(t.style)}">${inner}</mstts:express-as>`;
    const pause = t.pauseAfterMs ? `<break time="${Math.round(t.pauseAfterMs)}ms"/>` : "";
    return `<voice name="${v.name}">${inner}${pause}</voice>`;
  }).join("");
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="de-DE">${body}</speak>`;
}

/**
 * @param {string} outPath  .wav (16 kHz mono PCM — same format the assessor wants)
 *                          or .mp3 for serving to a browser
 */
async function synthesise(turns, outPath) {
  if (!configured()) return null;
  const mp3 = /\.mp3$/i.test(outPath);
  const res = await fetch(`https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": KEY(),
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": mp3 ? "audio-24khz-96kbitrate-mono-mp3" : "riff-16khz-16bit-mono-pcm",
      "User-Agent": "skillcase-b2",
    },
    body: ssml(turns),
  });
  if (!res.ok) return null;
  fs.writeFileSync(outPath, Buffer.from(await res.arrayBuffer()));
  return { path: outPath, bytes: fs.statSync(outPath).size };
}

/**
 * Content gate for a listening item — synthesise it, recognise it back, and
 * assert that every detail the item TESTS is actually recoverable from the audio.
 *
 * This exists because of a real failure. A handover clip read at +8% rate rendered
 * "Zimmer zwei null vier" such that the recogniser heard "zwei und vier" — while
 * the same phrase in isolation was fine. So the bug was rate and context, not
 * wording, and no amount of reviewing the SCRIPT would have caught it.
 *
 * A learner who gets that item wrong has been failed by us, not by their German.
 * That is the worst thing a product built on trustworthy scoring can do, so the
 * check belongs on the produced artefact and it belongs before any learner sees it.
 *
 * @param {Array} turns        as for synthesise()
 * @param {Array} assertions   [{ label, pattern }] — one per detail the item asks about
 */
async function verifyItem(turns, assertions = [], { keepAudio = null } = {}) {
  const fs2 = require("node:fs");
  const os2 = require("node:os");
  const path2 = require("node:path");
  const speech = require("./speech");

  const wav = keepAudio || path2.join(os2.tmpdir(), `verify-${Date.now()}.wav`);
  const made = await synthesise(turns, wav);
  if (!made) return { ok: false, reason: "synthesis_failed" };

  const heard = await speech.assess(wav);
  if (!keepAudio) { try { fs2.unlinkSync(wav); } catch {} }
  if (!heard) return { ok: false, reason: "recognition_failed" };

  const checks = assertions.map(a => ({
    label: a.label,
    ok: new RegExp(a.pattern, "i").test(heard.text),
  }));

  return {
    ok: checks.every(c => c.ok),
    transcript: heard.text,
    durationSec: heard.durationSec,
    confidence: heard.confidence,
    checks,
    // Low confidence on synthetic audio means a human will struggle too.
    warnings: [
      heard.confidence != null && heard.confidence < 0.8 ? "low recognition confidence — likely hard for a learner too" : null,
      heard.durationSec != null && heard.durationSec > 120 ? "over two minutes — long for a single B2 item" : null,
    ].filter(Boolean),
  };
}

module.exports = { synthesise, ssml, verifyItem, VOICES, configured };
