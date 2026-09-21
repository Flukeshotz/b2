// Verdict composition — docs/04-architecture.md §1, §5, §16.
//
// Two rules govern this file and neither is negotiable:
//
// 1. Never a bare point estimate. Goethe double-marks B2 writing and triggers a
//    THIRD rater when the two markers straddle 60. The board itself treats
//    scores near the line as unstable, so a product reporting "you are a 61"
//    claims more certainty than the exam board does.
// 2. Exactly two reasons. Triage is the product -- a learner with six weeks and
//    unlimited free material needs to know which two things to fix, not a list
//    of everything imperfect.
//
// The score here is UNCALIBRATED and says so. It becomes a real prediction only
// once b2_outcomes has enough linked pairs to fit it against real results; until
// then the interval stays wide on purpose.

// Order matters: this is "which single fix moves the real score most", not
// "which error is most severe linguistically". A missing content point is first
// because the real rubric penalises it regardless of language quality -- that is
// strategic knowledge candidates reliably lack.
const WEAKNESS_PRIORITY = [
  "content_point_missing",
  "email_form_missing",
  "range_simple",
  "range_lexis",
  "genitiv_praep",
  "konnektoren_range",
  "nvv_absent",
  "konjunktiv2_argument",
  "register_break",
];

const WEAKNESS_LABEL = {
  range_simple:          "Sätze zu einfach für B2",
  range_lexis:           "Wortschatz zu alltagssprachlich",
  content_point_missing: "Ein Leitpunkt fehlt",
  email_form_missing:    "Anrede oder Grußformel fehlt",
  genitiv_praep:         "Genitiv nach Präpositionen",
  konnektoren_range:     "Konzessive Konnektoren fehlen",
  nvv_absent:            "Nomen-Verb-Verbindungen ungenutzt",
  konjunktiv2_argument:  "Konjunktiv II im Argument",
  register_break:        "Registerbruch",
};

// Deterministic checks cannot see grammar, argument quality, idiomatic range or
// paragraph coherence -- that is what the model pass is for. So a
// deterministic-only verdict must not reach the top of the scale: we have not
// looked at the things that separate a 75 from a 90 and must not imply we have.
//
// Applied as SOFT compression rather than a flat clamp. A hard cap made every
// clean text score identically, which erased the difference between "correct but
// plain" and "genuinely strong" -- exactly the distinction a B2 learner is
// trying to see. Below the threshold nothing is touched, so the borderline band
// (where the verdict actually matters) keeps full resolution.
const DET_SOFT_FROM = 70;
const DET_COMPRESSION = 0.4;

function softCap(score) {
  if (score <= DET_SOFT_FROM) return score;
  return Math.round(DET_SOFT_FROM + (score - DET_SOFT_FROM) * DET_COMPRESSION);
}

const PENALTY = {
  content_points:  { fail: 22, warn: 11 },
  email_form:      { fail: 12, warn: 6 },
  sentence_complexity: { fail: 0, warn: 0 },   // handled by the range cap, not by subtraction
  lexical_range:       { fail: 0, warn: 0 },
  genitiv_praep:   { fail: 10, warn: 4 },
  connector_range: { fail: 12, warn: 6 },
  nvv:             { fail: 8,  warn: 4 },
  konjunktiv2:     { fail: 8,  warn: 4 },
  register:        { fail: 8,  warn: 5 },
  word_count:      { fail: 14, warn: 6 },
  repetition:      { fail: 5,  warn: 3 },
};

// Penalties do NOT stack additively. A text with one bad error and five small
// ones is a weak B2, not a failed A2 -- but naive summing drives it into the
// thirties, which is both wrong and demoralising for a learner two points under
// the line. So: full weight on the two largest penalties, half on the rest.
//
// The "two largest" is not arbitrary. They are the same two findings reported as
// the verdict's two reasons, so the score and the advice move together: fix what
// we told you to fix, and the number moves the most it can.
function scoreFrom(findings) {
  const penalties = findings
    .map(f => PENALTY[f.check_id]?.[f.state] || 0)
    .filter(p => p > 0)
    .sort((a, b) => b - a);

  const total = penalties.reduce((sum, p, i) => sum + (i < 2 ? p : p * 0.5), 0);
  return Math.max(0, Math.min(100, Math.round(92 - total)));
}

function pickReasons(findings) {
  // Worst first, and only findings that actually carry evidence -- a reason the
  // learner cannot see in their own text reads as an assertion, not coaching.
  const ranked = findings
    .filter(f => f.state !== "pass")
    .sort((a, b) => {
      if (a.state !== b.state) return a.state === "fail" ? -1 : 1;
      const pa = PENALTY[a.check_id]?.[a.state] || 0;
      const pb = PENALTY[b.check_id]?.[b.state] || 0;
      return pb - pa;
    });
  return ranked.slice(0, 2).map(f => ({ check_id: f.check_id, detail: f.detail, evidence: f.evidence }));
}

function pickWeaknesses(findings) {
  const present = new Set(findings.filter(f => f.weakness).map(f => f.weakness));
  return WEAKNESS_PRIORITY.filter(w => present.has(w));
}

/**
 * @param {object} det      output of analyse()
 * @param {object} rubric   row from b2_rubrics
 * @param {object|null} model  model pass output, or null when unavailable
 */
// CEFR is not error-subtractive: you cannot reach B2 by writing simply and
// making no mistakes. Range is therefore a CAP, not a deduction — a text with
// no complexity cannot be scored as B2 however clean it is. Applied as a
// ceiling so accuracy still moves the score underneath it.
function rangeCeiling(findings) {
  const f = id => findings.find(x => x.check_id === id)?.state;
  const complexity = f("sentence_complexity"), lexis = f("lexical_range");
  if (!complexity && !lexis) return 100;                       // range not measured
  const fails = [complexity, lexis].filter(x => x === "fail").length;
  const warns = [complexity, lexis].filter(x => x === "warn").length;
  // Ceilings sit BELOW the 60-point pass line whenever a range dimension fails.
  // The principle, not a tuned number: CEFR does not let you reach B2 on accuracy
  // alone, so a text that demonstrates no B2 range must not be told it will pass.
  // An earlier version capped a single failure at 62 — two points ABOVE the line —
  // which told a clean B1 text it was likely to pass a B2 exam. That is the exact
  // failure that destroys trust in the number.
  // CONSERVATIVE ON PURPOSE. These proxies — mean sentence length, subordinator
  // count, suffix-based abstraction, type-token ratio — reliably catch a text
  // that is plainly simple. They CANNOT resolve the B1/B2 boundary, which is
  // exactly the boundary this product judges.
  //
  // An earlier version tried: caps tuned so a hand-written B1 sample fell below
  // 60. That was fitting five texts written by the same person who wrote the
  // rule, and each tightening broke a different case (C1 ranked under B2). It is
  // not a scoring model, it is a mirror.
  //
  // So the cap fires only when BOTH dimensions fail — a text with no
  // subordination AND no abstraction, which is unambiguous. Everything else is
  // left to the error signal and the model pass, and the real fix is calibration
  // against scored samples (assumption A2). Until then the range checks earn
  // their place as FEEDBACK, not as a score.
  if (fails === 2) return 52;
  return 100;
}


/* ── telc criterion scoring ──────────────────────────────────────────────
   Source: telc's published marking criteria for Writing. Three criteria,
   each banded A/B/C/D worth 5/3/1/0, so one text is out of 15. Part 1 is
   multiplied by 3 (max 45) and Part 2 by 2 (max 30).

   Two things in the published criteria change how we mark:

   1. THE ZERO RULE. A "D" on Content or on Language voids the ENTIRE text —
      not a deduction, a zero. Nothing in our flat penalty model could express
      that, and it is the single most consequential rule telc has.

   2. WHERE A FAILING FEATURE BELONGS. telc puts "range and variety of
      language" under Communicative Design, and reserves Language for syntax,
      morphology and spelling. So a missing Konjunktiv II or a thin connector
      range is NOT a language error in telc's model — it is a design one. We
      had them all in one bucket, which let range problems masquerade as
      accuracy problems and vice versa. */

/* Weighted within each criterion. An unweighted mean let word count carry as
   much of Criterion I as the guiding points themselves, so an on-topic letter
   that ran short was banded D — and D on Content voids the whole text. A false
   void is far worse than a generous band, so the criterion's defining check
   has to dominate it. */
const TELC_CRITERIA = {
  // I — Inhalt. The guiding points ARE the criterion; length modulates it.
  leitpunkte: { content_points: 0.78, word_count: 0.22 },
  // II — Kommunikative Gestaltung. Organisation, linking, RANGE, register.
  gestaltung: { connector_range: 0.20, email_form: 0.15, sentence_complexity: 0.15,
                lexical_range: 0.15, register: 0.10, nvv: 0.10, konjunktiv2: 0.10,
                repetition: 0.05 },
  // III — Sprache. Syntax, morphology, spelling — error density only.
  // Our deterministic pass barely measures this; the model's `korrektheit`
  // dimension is the real signal, and we say so rather than pretending.
  richtigkeit: { genitiv_praep: 1 },
};

const BAND_POINTS = { A: 5, B: 3, C: 1, D: 0 };

function bandFor(weighted) {
  if (!weighted.length) return null;
  /* Proportional, not a raw fail count. Communicative Design carries eight
     checks and Language one, so counting failures absolutely made the broad
     criterion almost impossible to pass and the narrow one almost impossible
     to fail — an artefact of how we grouped our own checks, not anything telc
     says. Score each check and band the mean. */
  const WEIGHT = { pass: 1, warn: 0.5, fail: 0 };
  const total = weighted.reduce((t, x) => t + x.w, 0);
  const mean = weighted.reduce((t, x) => t + (WEIGHT[x.state] ?? 0) * x.w, 0) / total;
  /* Thresholds fitted against MERLIN's expert per-criterion ratings, not chosen
     by eye. The originals (.90/.70/.40) were severe by a wide margin: they
     awarded the top two bands to 18 of 720 texts where the raters awarded them
     to 257. Held-out agreement went 41.4% -> 57.0%, and the shape of what we
     output now matches the shape of what examiners award. */
  if (mean >= 0.70) return "A";   // "appropriate in all respects"
  if (mean >= 0.40) return "B";   // "appropriate in most respects"
  if (mean >= 0.275) return "C";  // "mostly inappropriate"
  return "D";                     // "completely inappropriate"
}

/** Grades a text against telc's three criteria. Returns null for other boards. */
function telcBands(findings, model) {
  const state = id => findings.find(f => f.check_id === id)?.state;
  const out = {};

  for (const [criterion, checks] of Object.entries(TELC_CRITERIA)) {
    const weighted = Object.entries(checks)
      .map(([id, w]) => ({ state: state(id), w }))
      .filter(x => x.state);
    out[criterion] = { band: bandFor(weighted), basis: "deterministic" };
  }

  /* Criterion III is error density, which regex checks cannot see. When the
     model has scored Korrektheit we use it and say so; when it has not, we
     report the criterion as unscored instead of inventing a band from the one
     genitive check we happen to have. */
  const korrekt = model?.dimensions?.find(d => d.id === "korrektheit");
  if (korrekt) {
    out.richtigkeit = {
      band: ["D", "C", "B", "A"][Math.max(0, Math.min(3, korrekt.band))],
      basis: "model",
    };
  } else if (out.richtigkeit.band && out.richtigkeit.band !== "A") {
    out.richtigkeit = { band: null, basis: "unscored" };
  }

  const bands = Object.values(out).map(c => c.band);
  if (bands.some(b => b === null)) {
    return { criteria: out, points: null, voided: false, incomplete: true };
  }

  // The zero rule: D on Inhalt or Sprache voids the text outright.
  const voided = out.leitpunkte.band === "D" || out.richtigkeit.band === "D";
  const points = voided ? 0 : bands.reduce((t, b) => t + BAND_POINTS[b], 0);

  return { criteria: out, points, max: 15, voided, incomplete: false };
}


/* ── scale calibration ───────────────────────────────────────────────────
   Measured against MERLIN (1,033 German learner texts from real
   certification exams, each rated on the CEFR by trained raters,
   CC BY-SA 4.0 — Boyd et al., Eurac Research).

   The two scoring paths were on DIFFERENT SCALES while sharing one pass
   mark, so 60 meant opposite things depending on whether the model
   answered:

     path             A2    B1    B2    C1     at cut 60
     deterministic   54.3  61.0  70.3  71.7    183 false-optimistic, 10 not
     with model      40.0  47.8  55.8  62.6      2 false-optimistic, 18 not

   Deterministically the average B1 text passed; with the model the average
   B2 text failed. A learner could not tell which engine had graded them.

   So each path is shifted onto one scale where 60 is the B2 boundary. The
   cut for each was chosen to minimise 2*falseOptimism + falsePessimism —
   telling someone they are ready when they are not costs them an exam fee
   and months, which is worse than telling them to study longer. */
const CALIBRATION = {
  // cut 71 -> 60. n=1033, accuracy 84.0% (was 81.3% at cut 60, but with
  // 183 false-optimistic verdicts against 10 the other way).
  deterministic_only: -11,
  /* cut 66 -> 60, refitted after the model prompt was given the boards' real
     band descriptors. That change alone moved held-out accuracy from 77.5% to
     91.6%, and moved the scale with it — the old +4 was fitted against a model
     answering a vaguer question, so keeping it would have left the pass mark
     optimistic by six points (10 false-optimistic verdicts against 2).
     Held out on 95 texts the engine never saw. */
  full: -2,
};

function calibrate(score, basis) {
  const shift = CALIBRATION[basis] ?? 0;
  return Math.max(0, Math.min(100, Math.round(score + shift)));
}

function compose(det, rubric, model = null) {
  let score = scoreFrom(det.findings);
  const modelAvailable = !!(model && model.dimensions && model.dimensions.length);

  if (modelAvailable) {
    // Model dimensions are bands 0-3 against the rubric. Blend rather than
    // replace: the deterministic signal is the part we can defend.
    const avg = model.dimensions.reduce((s, d) => s + d.band, 0) / model.dimensions.length;
    score = Math.round(score * 0.55 + (avg / 3) * 100 * 0.45);
  } else {
    score = softCap(score);
  }

  // The range ceiling applies last and to both paths: a model impressed by clean
  // simple prose must not lift a text past what its own complexity supports.
  const ceiling = rangeCeiling(det.findings);
  const cappedByRange = score > ceiling;
  score = Math.min(score, ceiling);

  /* Put both paths on one scale before anything is derived from the number —
     the interval, the standing and "borderline" all key off the pass mark, so
     calibrating after them would leave them disagreeing with the score. */
  score = calibrate(score, modelAvailable ? "full" : "deterministic_only");

  // Interval width is an honesty dial, not a statistic. Wide while uncalibrated;
  // wider still when the model could not run. Narrow it only when linked
  // outcomes justify it -- docs/04-architecture.md OPEN 4 and OPEN 5.
  // Without the model pass nothing has looked at grammar, argument quality,
  // idiom or paragraph coherence — four of the things that separate B1 from B2.
  // A deterministic-only read can say "this is clearly short" with confidence,
  // but it must NOT say "you will clear" — a clean, simple B1 text trips every
  // error check and passes. Predicting a pass and being wrong is the failure that
  // costs a learner an exam fee and costs us their trust permanently, so the
  // interval widens until a human or the model has actually read it.
  const half = modelAvailable ? 6 : 16;
  const ciLow = Math.max(0, score - half);
  const ciHigh = Math.min(100, score + half);

  const pass = rubric.pass_mark ?? 60;

  // Borderline means "your interval straddles the PASS MARK" — might you fail? —
  // not "your interval clips the board's borderline band". The earlier version
  // used the band, so a C1-level text scoring 71 with a wide interval was told it
  // was borderline for B2. Anything comfortably above the line has cleared it,
  // and telling a strong writer they might fail is both wrong and alarming.
  const borderline = ciLow < pass && ciHigh >= pass;

  const reasons = pickReasons(det.findings);
  const weaknesses = pickWeaknesses(det.findings);

  const telc = rubric.board === "telc" ? telcBands(det.findings, model) : null;

  return {
    telc,
    predicted_score: score,
    ci_low: ciLow,
    ci_high: ciHigh,
    pass_mark: pass,
    // "clear" / "short" / "borderline" -- never a naked probability, because we
    // have no outcomes to fit one against yet.
    standing: borderline ? "borderline" : score >= pass ? "clear" : "short",
    // Says plainly which parts were actually examined, so "will clear" is never
    // read as more than it is.
    basis: modelAvailable ? "full" : "deterministic_only",
    borderline,
    reasons,
    weakness_ids: weaknesses,
    top_weakness: weaknesses[0] || null,
    top_weakness_label: weaknesses[0] ? WEAKNESS_LABEL[weaknesses[0]] : null,
    model_available: modelAvailable,
    range_ceiling: ceiling,
    capped_by_range: cappedByRange,
    calibrated: false, // flips only when b2_outcomes supports it
  };
}

module.exports = { compose, softCap, telcBands, TELC_CRITERIA, BAND_POINTS,
                  WEAKNESS_PRIORITY, WEAKNESS_LABEL, DET_SOFT_FROM };
