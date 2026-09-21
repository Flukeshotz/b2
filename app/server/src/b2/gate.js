// Submission gate — docs/04-architecture.md §6.1, docs/05-edge-cases.md §2.2.
//
// Refusing to score is a designed behaviour, not an error. Putting a number on
// a 40-word stub produces a number that means nothing, and teaches the learner
// that our numbers mean nothing -- which is the one thing this product cannot
// afford, since trust in the score IS the product.

const { words } = require("./analyse");

// A global floor refuses the diagnostic's own 80-word micro-task. Derive it from
// the task instead: ~55% of target, never below 45. Below that a verdict is
// noise whatever the task was.
const MIN_WORDS_FLOOR = 45;
/* telc Pflege scores content by COUNTING which required pieces of information
   arrived, so a short report is marked low rather than refused — an examiner
   graded two 30-word Aufnahmeberichte A2 that this gate was turning away with
   no feedback at all. Length is a criterion there, not a precondition, so the
   floor only has to catch a non-attempt. */
const PFLEGE_FLOOR = 25;
function minWords(task = {}) {
  if (task.board === "telc_pflege") return PFLEGE_FLOOR;
  return Math.max(MIN_WORDS_FLOOR, Math.round((task.target_words || 150) * 0.55));
}

// Rough script check: a submission that is mostly non-Latin, or carries no
// German function words at all, is not a German text.
const GERMAN_MARKERS = /\b(der|die|das|und|ist|nicht|ich|man|dass|ein|eine|zu|mit|für|auf|sich)\b/i;

function gate(text, task = {}) {
  const t = (text || "").trim();
  if (!t) return { ok: false, reason: "empty", message: "Es wurde kein Text eingereicht." };

  const wc = words(t);
  const min = minWords(task);
  if (wc < min) {
    return {
      ok: false, reason: "too_short", words: wc, min,
      /* German, like every other string on this screen. The learner reads a
         German prompt, writes German and gets a German verdict; one English
         sentence in the middle of that reads as a bug, not as a bilingual
         product. The reason is stated plainly — a mark from a text this short
         would mean nothing, and a meaningless number is worse than none. */
      message: `${wc} Wörter — die Aufgabe verlangt etwa ${task.target_words || 150}. Unter ${min} Wörtern lässt sich der Text nicht sinnvoll bewerten. Ihr Text bleibt gespeichert; schreiben Sie weiter.`,
    };
  }

  if (!GERMAN_MARKERS.test(t)) {
    return { ok: false, reason: "wrong_language", message: "Dieser Text scheint nicht auf Deutsch zu sein." };
  }

  // Off-topic: no content point detected at all. Deliberately requires ALL to
  // miss -- one missing point is a scoring matter (the rubric handles it), not
  // a refusal, and refusing there would withhold the feedback they paid for.
  const pts = task.content_points || [];
  const safeTest = (pat, str) => { try { return new RegExp(pat, "i").test(str); } catch { return false; } };
  if (pts.length && !pts.some(p => safeTest(p.detector, t))) {
    return {
      ok: false, reason: "off_topic",
      message: "Dieser Text beantwortet die Aufgabe nicht. Keiner der geforderten Inhaltspunkte ist erkennbar.",
    };
  }

  return { ok: true, words: wc };
}

// Composition integrity -- docs/04-architecture.md §7. Flagged submissions are
// still scored (the learner gets what they paid for) but are excluded from
// calibration, because a poisoned calibration set cannot be cleaned later.
function integrity({ pasteEvents = 0, composeMs = null, wordCount = 0 }) {
  if (pasteEvents > 0) return "paste";
  if (composeMs != null && wordCount > 0) {
    const wpm = wordCount / (composeMs / 60000);
    if (wpm > 70) return "implausible_speed";
  }
  return null;
}

module.exports = { gate, integrity, minWords, MIN_WORDS_FLOOR };
