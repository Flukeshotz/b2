// Speaking assessment — Azure AI Speech via the Speech SDK.
//
// Runs on the multi-service key the model pass already uses: the AI Services
// resource issues Speech tokens (verified 03 Sep 2026), region eastus2. No
// separate Speech resource is needed.
//
// WHY THE SDK AND NOT REST. The REST v1 endpoint accepts a Pronunciation-Assessment
// header and returns 200 -- then silently omits the assessment. Verified across
// conversation / interactive / dictation modes and against an en-US control, so it
// is not a German limitation. The SDK returns it correctly. A REST implementation
// would look like it worked and quietly score nothing.
//
// One call yields both halves of a speaking verdict:
//   what they said   -> LEXICAL transcript, fed to the rubric like any text
//   how they said it -> accuracy, fluency, completeness, per-word scores
//
// Returns null on failure. verdict.js already degrades without the model pass;
// same rule here -- no score beats a wrong one.

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");
const execFileAsync = promisify(execFile);
const sdk = require("microsoft-cognitiveservices-speech-sdk");

const REGION = process.env.AZURE_SPEECH_REGION || "";
const KEY = () => process.env.AZURE_SPEECH_KEY || process.env.AZURE_AI_API_KEY || process.env.AZURE_OPENAI_API_KEY || "";
const configured = () => !!(REGION && KEY());

// Browsers record webm/opus; the SDK's WAV input wants 16 kHz mono PCM.
// ASYNC on purpose. execFileSync blocked the whole Node event loop for the
// length of the conversion — fine with one user, but a second person submitting
// a recording froze the entire server, including every unrelated request. On a
// product whose core action is "upload audio", that is the first thing to break
// under real load.
async function toWav16k(input) {
  if (path.extname(input).toLowerCase() === ".wav") return { file: input, tmp: false };
  const out = path.join(os.tmpdir(), `sc-${Date.now()}-${Math.random().toString(36).slice(2)}.wav`);
  await execFileAsync("ffmpeg", ["-y", "-i", input, "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le", out], { timeout: 30000 });
  return { file: out, tmp: true };
}

/**
 * @param {string} audioPath
 * @param {string} referenceText  "" runs UNSCRIPTED assessment — right for a
 *   spontaneous answer. Pass the expected text for read-aloud drills to get
 *   miscue detection and tighter per-word accuracy.
 */
/* Accented clinical German is exactly where a general model fails, and it fails
   in the worst direction: a real screening answer of „Blutdruck, Puls,
   Temperatur" came back as "Blue Trook pools", which then graded as noise. The
   candidate said the right thing and got no credit for it. Biasing recognition
   toward the vocabulary this product is actually about costs nothing and only
   affects near-misses. */
const CLINICAL_TERMS = [
  "Blutdruck", "Puls", "Temperatur", "Sauerstoffsättigung", "Atemfrequenz", "Vitalzeichen",
  "Herzinfarkt", "Schlaganfall", "Reanimation", "Notaufnahme", "Notfall", "Intensivstation",
  "Zugang legen", "venöser Zugang", "Infusion", "Medikamente verabreichen", "Dosierung",
  "Anamnese", "Visite", "Übergabe", "Dokumentation", "Katheter", "Verband", "Wunde",
  "Arzt informieren", "Monitor anschließen", "EKG", "Blutabnahme", "Spritze", "Kanüle",
  "Schichtdienst", "Frühdienst", "Spätdienst", "Nachtdienst", "Pflegekraft", "Station",
  "Patient", "Patientin", "Angehörige", "Sturz", "Dekubitus", "Mobilisation",
];

async function assess(audioPath, referenceText = "") {
  if (!configured()) return null;

  let conv;
  try { conv = await toWav16k(audioPath); }
  catch { return null; }   // unconvertible audio degrades, it does not throw

  return new Promise(resolve => {
    let rec;
    const done = (v) => {
      try { rec?.close(); } catch {}
      if (conv?.tmp) { try { fs.unlinkSync(conv.file); } catch {} }
      resolve(v);
    };

    try {
      const speechConfig = sdk.SpeechConfig.fromSubscription(KEY(), REGION);
      speechConfig.speechRecognitionLanguage = "de-DE";
      rec = new sdk.SpeechRecognizer(speechConfig, sdk.AudioConfig.fromWavFileInput(fs.readFileSync(conv.file)));

      try {
        const phrases = sdk.PhraseListGrammar.fromRecognizer(rec);
        for (const t of CLINICAL_TERMS) phrases.addPhrase(t);
      } catch { /* biasing is an improvement, never a requirement */ }

      const pa = new sdk.PronunciationAssessmentConfig(
        referenceText,
        sdk.PronunciationAssessmentGradingSystem.HundredMark,
        sdk.PronunciationAssessmentGranularity.Phoneme,
        !!referenceText   // miscue detection needs a reference to compare against
      );
      try { pa.enableProsodyAssessment = true; } catch {}
      pa.applyTo(rec);

      const timer = setTimeout(() => done(null), 30000);

      rec.recognizeOnceAsync(result => {
        clearTimeout(timer);
        // NoMatch is not a failure of ours — Azure heard nothing. Collapsing it
        // into null told the learner "that could not be assessed", i.e. the
        // system broke, when in fact their mic was muted, they were too quiet,
        // or they stopped before saying anything. Wrong cause, wrong fix, and
        // they have no way to know what to do differently.
        if (result.reason === sdk.ResultReason.NoMatch) return done({ noMatch: true });
        if (result.reason !== sdk.ResultReason.RecognizedSpeech) return done(null);

        // r.text carries inverse text normalisation — "halb vier" comes back as
        // "15:30 Uhr". Verified twice. In a clinical item about a dosage time that
        // is a wrong answer manufactured by the formatter, so the rubric gets
        // LEXICAL and the learner is shown display text only as a courtesy.
        let lexical = "", confidence = null;
        try {
          const raw = JSON.parse(result.properties.getProperty(sdk.PropertyId.SpeechServiceResponse_JsonResult));
          lexical = (raw?.NBest?.[0]?.Lexical ?? "").trim();
          confidence = raw?.NBest?.[0]?.Confidence ?? null;
        } catch {}

        let scores = null, words = [];
        try {
          const p = sdk.PronunciationAssessmentResult.fromResult(result);
          scores = {
            accuracy: p.accuracyScore ?? null,
            fluency: p.fluencyScore ?? null,
            completeness: p.completenessScore ?? null,
            prosody: p.prosodyScore ?? null,
            overall: p.pronunciationScore ?? null,
          };
          words = (p.detailResult?.Words || []).map(w => ({
            word: w.Word,
            accuracy: w.PronunciationAssessment?.AccuracyScore ?? null,
            errorType: w.PronunciationAssessment?.ErrorType ?? null,
          }));
        } catch {}

        done({
          text: lexical || result.text || "",
          display: result.text || "",
          confidence,
          durationSec: result.duration ? result.duration / 1e7 : null,
          scores,
          words,
          unscripted: !referenceText,
        });
      }, () => { clearTimeout(timer); done(null); });
    } catch {
      done(null);
    }
  });
}

// The words worth naming to a learner. Two specifics beat twenty: "the ü in
// Übergabe" is actionable, "your pronunciation is 68" is not.
function weakWords(a, limit = 3) {
  if (!a?.words?.length) return [];
  return a.words
    .filter(w => w.errorType === "Mispronunciation" || (w.accuracy != null && w.accuracy < 70))
    .sort((x, y) => (x.accuracy ?? 0) - (y.accuracy ?? 0))
    .slice(0, limit);
}

// Long silences are what a learner is actually penalised for in a speaking exam,
// and they are the thing they can least hear in themselves.
function pauseProfile(a) {
  if (a?.scores?.fluency == null) return null;
  const f = a.scores.fluency;
  return {
    fluency: f,
    reads: f >= 85 ? "kept going" : f >= 70 ? "some hesitation" : "stalled repeatedly",
  };
}

module.exports = { assess, weakWords, pauseProfile, configured, REGION };
