/**
 * EXPRESSIONS — noticing, choosing, producing, and the ladder between them.
 *
 * WHAT THIS IS NOT: a vocabulary trainer. There is no list, no flashcard and no
 * translation drill anywhere in it. An expression here is an ARGUMENTATIVE MOVE
 * the learner saw somebody make, and the whole point is that they can make it
 * themselves next week about something else entirely.
 *
 * THE HARD PART is checking production honestly. "The target string appears in
 * the answer" is not evidence of anything — a learner can paste
 * "Nur folgt daraus doch nicht" in front of a copied sentence and satisfy it.
 * So every expression declares:
 *
 *   pattern   how it looks once it has been inflected and fitted into a real
 *             sentence, which is rarely the citation form
 *   frame     the structural commitment it makes. "Begründet wird das mit …"
 *             is not finished until something follows the `mit`; "Nur folgt
 *             daraus doch nicht …" is not finished until a claim follows. An
 *             expression used without its frame has been pasted, not used.
 *   novelty   how much of the sentence has to be the learner's own. Reproducing
 *             the source sentence is copying, and copying is the failure mode
 *             this check exists for.
 *
 * All three have to hold. Any one of them alone is gameable.
 */

/* Stages, in order. The ladder only climbs: a muddled attempt next month is a
   bad evening, not the unlearning of an expression. */
const STAGES = ["heard", "noticed", "chosen", "produced", "defended", "examined"];
const stageIndex = (s) => Math.max(0, STAGES.indexOf(s));
const higher = (a, b) => (stageIndex(a) >= stageIndex(b) ? a : b);

/* Recognition is over once production has been demonstrated. This is the rule
   that stops the product asking a learner to pick, out of three options, an
   expression they wrote a good sentence with last week. */
const PRODUCED_AT = stageIndex("produced");
function allowsRecognition(stage) { return stageIndex(stage) < PRODUCED_AT; }

/* German content words only — articles, pronouns, particles and auxiliaries say
   nothing about whether the learner brought their own material. */
const FUNCTION_WORDS = new Set(`
der die das den dem des ein eine einen einem einer eines
ich du er sie es wir ihr man mich mir dich dir sich uns euch ihnen
und oder aber denn sondern doch nur auch noch schon nicht kein keine
ist sind war waren bin bist hat habe haben hatte hatten wird werden wurde wurden
kann können könnte muss müssen soll sollen will wollen möchte
in an auf für mit von zu bei nach aus um über unter vor seit
dass ob wenn weil da als wie was wer wo wann warum
sehr mehr weniger ganz gar schon eben ja mal etwas alle jeder
`.trim().split(/\s+/));

const words = (s) => (String(s).toLowerCase().match(/[a-zäöüß]+/g) || []);
const contentWords = (s) => words(s).filter(w => w.length > 3 && !FUNCTION_WORDS.has(w));

/**
 * Did the learner actually USE this expression, or place it?
 *
 * Returns { ok, stage, reasons, praise, improve, evidence }. `reasons` are the
 * specific checks that failed and exist for the tests and the teacher review
 * page; `improve` is the ONE thing said to the learner.
 */
function checkProduction(chunk, text, { sourceSentence = "" } = {}) {
  const t = String(text || "").trim();
  const reasons = [];
  const w = words(t);

  if (!t) return { ok: false, reasons: ["empty"], improve: "Schreiben Sie einen Satz.", evidence: [] };

  /* 1 — is it there at all, in any inflected shape it really takes? */
  const used = chunk.pattern.test(t);
  if (!used) reasons.push("expression_absent");

  /* 2 — the frame. An expression whose frame is unfilled has been pasted in
     front of a sentence rather than used to build one. */
  const framed = chunk.frame ? chunk.frame.test(t) : true;
  if (used && !framed) reasons.push("frame_unfilled");

  /* 3 — novelty. The learner's content words, minus everything in the sentence
     they saw it in. Copying the source back is the commonest way to satisfy a
     string check without having understood anything. */
  const fromSource = new Set(contentWords(sourceSentence));
  const own = [...new Set(contentWords(t))].filter(x => !fromSource.has(x));
  const need = chunk.novelty ?? 3;
  if (own.length < need) reasons.push("too_close_to_source");

  /* 4 — length. Not a quality signal on its own, which is why it is last and
     why it is generous: the frame check is what does the real work. */
  if (w.length < (chunk.minWords ?? 8)) reasons.push("too_short");

  const ok = reasons.length === 0;

  /* ONE improvement, in the learner's terms, never a report. The order matters:
     say the most useful thing, not every true thing. */
  const improve = ok ? null
    : reasons.includes("expression_absent") ? chunk.help.absent
    : reasons.includes("frame_unfilled")    ? chunk.help.frame
    : reasons.includes("too_close_to_source") ? "Nehmen Sie eine eigene Situation — nicht die aus dem Text. Der Ausdruck trägt erst, wenn er auf etwas Neues zeigt."
    : "Noch ein Stück weiter: Was folgt daraus? Ein Satz reicht.";

  return {
    ok, reasons, improve,
    praise: ok ? chunk.help.good : null,
    /* Evidence ONLY when the expression was genuinely used. A submission that
       failed the frame check tells us the learner tried, which is not the same
       as knowing they can do it — and recording it at 0.3 would let the
       recommender believe it had measured something it did not. */
    evidence: ok
      ? [{ dimension: "vocabulary", capability: chunk.capability, outcome: 1, weight: 0.5 }]
      /* Partial credit is for a short attempt that nonetheless used the
         expression properly. It is NOT for copying: a learner who hands back
         the source sentence has demonstrated nothing, and an earlier version
         recorded that at 0.6 — which would have let the recommender believe it
         had watched somebody produce German they had only retyped. */
      : used && framed && !reasons.includes("too_close_to_source")
        ? [{ dimension: "vocabulary", capability: chunk.capability, outcome: 0.6, weight: 0.3 }]
        : [],
    stage: ok ? "produced" : null,
  };
}

/**
 * Recognition. Lower weight than production on purpose: choosing the right move
 * from three is a real signal and a much weaker one than making the move.
 */
function checkChoice(chunk, correct) {
  return {
    evidence: [{ dimension: "vocabulary", capability: chunk.capability,
                 outcome: correct ? 1 : 0.3, weight: 0.25 }],
    stage: correct ? "chosen" : null,
  };
}

module.exports = { STAGES, stageIndex, higher, allowsRecognition, checkProduction, checkChoice, contentWords };
