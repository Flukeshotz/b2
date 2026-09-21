/**
 * GRAMMAR USE — a narrowly scoped checker for one communicative function.
 *
 * NOT a second generic free-text checker. `b2/chunks.js` checks that a fixed
 * expression was used rather than pasted; that shape does not fit here, because
 * what is being demonstrated is not a phrase but a RELATIONSHIP: a condition
 * that did not hold, and the consequence that therefore did not follow. There
 * is no string to look for. There are conditions to satisfy, and each one is
 * named, testable and explainable on its own.
 *
 * THE EVIDENCE PHILOSOPHY IS THE ONE FROM EXPERIENCE 3: measure what the
 * learner demonstrated, not what the checker wishes they had. Concretely that
 * means a sentence which expresses the hypothetical relationship in imperfect
 * German still counts for something, because the capability being measured is
 * `speculate` and they speculated. What earns nothing is a sentence that makes
 * no hypothetical claim at all, and a sentence copied back from the source.
 *
 * AND IT MUST TOLERATE REAL GERMAN. Experience 3 shipped four patterns that
 * rejected good sentences because they had been written from the citation form
 * rather than from the language. The same failure is likelier here, because
 * this construction has more legitimate shapes than any expression does:
 *
 *   Wenn man uns gefragt hätte, hätte ich zugestimmt.      wenn + verb-final
 *   Hätte man uns gefragt, hätte ich zugestimmt.           verb-first, no wenn
 *   Ich hätte zugestimmt, wenn man uns gefragt hätte.      main clause first
 *   Wäre der Termin früher angekündigt worden, hätten wir umplanen können.
 *                                                          passive + modal
 *
 * Every one of those is in the test suite.
 */

const { contentWords } = require("./chunks");

/* Konjunktiv II auxiliaries. These are what carry the irrealis; the participle
   carries the past. Both halves of a real conditional sentence normally have
   one, which is what makes counting them a usable signal for "two clauses". */
const KONJ_AUX = /\b(hätte|hätten|hättest|hättet|wäre|wären|wärst|wärest|wäret)\b/gi;
/* würde + infinitive is the present/future irrealis. Accepted as a hypothetical
   marker but NOT as past reference — telling those apart is the point of the
   contrast stage, so the checker has to be able to tell them apart too. */
const WUERDE = /\b(würde|würden|würdest|würdet)\b/gi;
/* Modal Konjunktiv II — "hätten wir umplanen können", "man hätte … müssen". */
const KONJ_MODAL = /\b(könnte|könnten|müsste|müssten|dürfte|dürften|sollte|sollten)\b/gi;

/* A past participle: ge…t / ge…en, the -ieren verbs, or the passive `worden`.
   Deliberately loose — this is asking "is there a past event here", not parsing. */
const PARTICIPLE = /\b(worden|gewesen|gehabt|ge\w{2,}(t|en)|\w{4,}iert)\b/i;

/* An explicit condition marker. `wenn` and `falls` introduce one; so does a
   clause that simply starts with the auxiliary, which German allows and which
   is exactly what the source sentence does. */
const WENN = /\b(wenn|falls)\b/i;
/* German expresses an unreal condition with a phrase as readily as with a
   clause — „ohne die Empfehlung meiner Kollegin wäre das nicht passiert“ is the
   same move as „wenn sie mich nicht empfohlen hätte …“. Rejecting it would be
   the Experience 3 mistake again: a checker that only accepts the shape the
   author happened to write. Kept narrow; `mit` and `bei` are far too common to
   read as conditions. */
const CONDITION_PP = /\bohne\s+\w{3,}|\ban\s+(deiner|ihrer|seiner|Ihrer)\s+Stelle\b/i;

const count = (re, s) => (s.match(re) || []).length;
const MARKER = new RegExp(`${KONJ_AUX.source}|${WUERDE.source}|${KONJ_MODAL.source}`, "gi");

/* Clause-ish segmentation. Not a parser: it splits where German writers put
   clause boundaries, which is enough to ask "are there two halves here, and
   does each of them say anything?" */
const clauses = (t) => t.split(/[,;:—–]|\s+(?=\b(wenn|falls|dann)\b)/i)
  .map(c => (c || "").trim()).filter(Boolean);

/* Content words that are NOT the auxiliaries themselves. „hätte“ and „wäre“ are
   long enough to look like content, so counting them let "hätte wäre hätte
   wäre Fahrrad Kartoffel Bibliothek" satisfy the structural test — four
   markers, apparently content on both sides, and a demonstration of nothing.
   A half of a sentence has to say something other than the verb that makes it
   hypothetical. */
const substance = (s) => contentWords(String(s).replace(MARKER, " "));

/* Concessive and contrastive markers, for the second use-check below. */
const CONCESSION = /\b(zwar|obwohl|natürlich|selbstverständlich|sicher|sicherlich|klar|gewiss|zugegeben|einerseits|stimmt|richtig|verstehe|nachvollziehen|bestreite\s+ich\s+(gar\s+)?nicht|da\s+haben\s+sie\s+recht)\b/i;
const OBJECTION  = /\b(aber|nur|trotzdem|dennoch|allerdings|jedoch|andererseits|gleichwohl)\b/i;

/**
 * The conditions, each one named so the failure can be explained in a sentence
 * rather than a score. Order matters: `improve` reports the first unmet one,
 * and they are ordered by what is most useful to hear.
 */
const IRREALIS_CONDITIONS = [
  {
    id: "hypothetical",
    /* Something in the sentence has to be unreal. Without this the learner has
       reported what happened, which is the opposite of the move. */
    test: (t) => count(KONJ_AUX, t) + count(WUERDE, t) + count(KONJ_MODAL, t) > 0,
    help: "Der Satz erzählt, was passiert ist. Gesucht ist, was NICHT passiert ist: „hätte …“, „wäre …“.",
  },
  {
    id: "relationship",
    /* Condition AND consequence. "Ich hätte das anders gemacht" is a
       hypothetical, but it is not this move — nothing is said about what would
       have followed, or under what circumstance. Two Konjunktiv verbs, or one
       plus an explicit `wenn`, is the cheapest honest test for two clauses. */
    /* COUNTING AUXILIARIES IS NOT ENOUGH. "hätte wäre hätte wäre Fahrrad
       Kartoffel Bibliothek" has four markers and says nothing; an earlier
       version scored it as a demonstration of `speculate`. What has to be true
       is that there are two halves and that each half carries content. */
    test: (t) => {
      const markers = count(MARKER, t);
      if (!markers) return false;
      const halves = clauses(t).filter(c => substance(c).length >= 1);
      if (halves.length >= 2 && (markers >= 2 || WENN.test(t) || CONDITION_PP.test(t))) return true;
      /* A missing comma is a punctuation slip, not a failure to speculate, so
         fall back to the marker positions: content before the last marker and
         content after it means two halves however it was punctuated. */
      if (markers >= 2) {
        const last = [...t.matchAll(MARKER)].pop();
        if (last) {
          const at = last.index;
          return substance(t.slice(0, at)).length >= 1
              && substance(t.slice(at)).length >= 1;
        }
      }
      return false;
    },
    help: "Es fehlt die andere Hälfte. Sagen Sie beides: unter welcher Bedingung — und was dann anders gewesen wäre.",
  },
  {
    id: "past",
    /* The past irrealis, not the present one. "Würde man uns fragen, würde ich
       zustimmen" is correct German about a chance that is still open; the whole
       point of this construction is that the chance is gone. */
    test: (t) => count(KONJ_AUX, t) > 0 && PARTICIPLE.test(t),
    help: "Das klingt, als wäre die Sache noch offen. Für etwas, das vorbei ist: „hätte/wäre …“ plus Partizip — „hätte ich zugestimmt“, „wäre … angekündigt worden“.",
  },
];

/* ONE CHECK PER COMMUNICATIVE FUNCTION, not one generic checker.
   Each entry names the capability it can demonstrate, the conditions that
   constitute a demonstration, and which subset of those conditions counts as
   having done the move at all (`core`). Anything short of `core` earns no
   evidence; `core` without the rest earns partial evidence and a specific
   correction, because the learner did the thing and missed a detail. */
const USE_CHECKS = {
  irrealis: {
    capability: "speculate",
    conditions: IRREALIS_CONDITIONS,
    core: ["hypothetical", "relationship"],
    novelty: 4, minWords: 10,
    good: "Genau das ist der Zug: eine Bedingung, die nicht erfüllt war, und die Folge, die deshalb ausblieb.",
    copied: "Das ist Kerstins Satz. Nehmen Sie Ihre eigene Situation — sonst zeigt der Satz nur, dass Sie ihn abschreiben können.",
  },

  /* The CONCEDE move: grant something, then object. It is a different function
     with different conditions, which is exactly why it gets its own check
     rather than a flag on a shared one. */
  concede_first: {
    capability: "concede",
    conditions: [
      { id: "concession",
        test: (t) => CONCESSION.test(t),
        help: "Es fehlt das Zugeständnis. Geben Sie zuerst etwas zu — „das stimmt“, „zwar …“, „natürlich …“." },
      { id: "objection",
        test: (t) => OBJECTION.test(t),
        help: "Und jetzt der Einwand. Ein Zugeständnis allein ist keine Antwort: „…, nur …“, „…, aber …“." },
      { id: "order",
        /* The order IS the move. "Aber das stimmt schon" concedes after
           objecting, which buys none of the goodwill the move exists for. */
        test: (t) => {
          const c = t.search(CONCESSION), o = t.search(OBJECTION);
          return c >= 0 && o >= 0 && c < o;
        },
        help: "Die Reihenfolge macht den Zug aus: erst einräumen, dann widersprechen. Andersherum klingt es wie Widerspruch mit Beiwerk." },
    ],
    core: ["concession", "objection"],
    novelty: 3, minWords: 10,
    good: "So klingt Widerspruch, dem jemand zuhört: Sie haben erst etwas gelten lassen.",
    copied: "Das ist der Satz aus der Sendung. Nehmen Sie Ihre eigene Situation.",
  },
};

/**
 * @param check  a key of USE_CHECKS, or a check object
 * @returns { ok, met, reasons, improve, praise, evidence, stage }
 */
function checkUse(check, text, { sourceSentence = "" } = {}) {
  const item = typeof check === "string" ? USE_CHECKS[check] : check;
  if (!item) throw new Error(`unknown use-check "${check}"`);
  const CONDITIONS = item.conditions;
  const t = String(text || "").trim();
  if (!t) {
    return { ok: false, met: [], reasons: ["empty"], improve: "Schreiben Sie Ihren Satz.", evidence: [], stage: null };
  }

  const met = CONDITIONS.filter(c => c.test(t)).map(c => c.id);
  const reasons = CONDITIONS.filter(c => !met.includes(c.id)).map(c => c.id);

  /* OWN CONTENT. Same rule as expressions: handing the source sentence back
     demonstrates nothing, and a checker that accepts it is measuring typing. */
  const fromSource = new Set(contentWords(sourceSentence));
  const own = [...new Set(contentWords(t))].filter(w => !fromSource.has(w));
  const copied = own.length < (item.novelty ?? 4);
  if (copied) reasons.push("too_close_to_source");

  const words = (t.match(/[\wäöüß'-]+/g) || []).length;
  if (words < (item.minWords ?? 10)) reasons.push("too_short");

  const ok = reasons.length === 0;

  /* The hypothetical RELATIONSHIP, in the learner's own words, is what
     `speculate` means. A learner who has that but used the present irrealis has
     demonstrated the capability and missed the tense — which is worth partial
     evidence and a specific correction, not a zero. A learner who copied the
     source has demonstrated nothing whatever they got right. */
  const spoke = (item.core || []).every(id => met.includes(id));
  const evidence = copied ? []
    : ok    ? [{ dimension: "grammar", capability: item.capability, outcome: 1,   weight: 0.5 }]
    : spoke ? [{ dimension: "grammar", capability: item.capability, outcome: 0.6, weight: 0.3 }]
    : [];

  const first = CONDITIONS.find(c => !met.includes(c.id));
  const improve = ok ? null
    : reasons.includes("too_close_to_source") && !first
      ? item.copied
    : first ? first.help
    : "Noch ein Stück weiter: Was wäre die Folge gewesen?";

  return {
    ok, met, reasons, improve,
    praise: ok ? item.good : null,
    evidence,
    /* `produced` only on a full pass. A partial attempt is evidence of the
       capability and not a demonstration that the learner can do it — sending
       them past this construction on the strength of it would be the ladder
       lying. */
    stage: ok ? "produced" : null,
  };
}

module.exports = { checkUse, USE_CHECKS, IRREALIS_CONDITIONS };
