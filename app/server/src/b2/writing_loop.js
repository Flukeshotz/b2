/**
 * THE WRITING LOOP — write → assess → ONE weakness → teach it → rewrite → compare.
 *
 * The product this file exists to make possible:
 *
 *     your German → a diagnosis → targeted teaching → your improved German
 *
 * Three decisions carry the whole thing.
 *
 * 1. ONE WEAKNESS, AND ONLY IF WE CAN HELP.
 *    The analyser returns up to nine findings. A learner shown nine findings
 *    fixes none of them, and a learner shown a finding Skillcase cannot teach is
 *    being told to improve something we have no way to improve. So the selector
 *    filters to weaknesses with a LIVE learning route before it ranks anything.
 *    Routes are read from published content, never hardcoded: an experience
 *    declares the checks it trains, and retiring it removes the route.
 *
 * 2. THE ROUTE MAP IS DERIVED, SO IT CANNOT ROT.
 *    `routesFor()` reads live experiences out of the database. If the grammar
 *    experience that teaches connectors is retired tomorrow, connector_range
 *    stops being surfaced as an actionable weakness the same day — rather than
 *    pointing at a lesson that no longer exists.
 *
 * 3. IMPROVEMENT IS MEASURED ON THE TARGETED FEATURE ONLY.
 *    A rewrite that got longer and happened to score better everywhere is not
 *    evidence that the learner fixed what they were taught. `compare()` looks at
 *    the check they were working on, and at nothing else.
 */

const pool = require("../db/pool");
const caps = require("./capabilities");
const tasks = require("./task_profiles");
const { analyse } = require("./analyse");

/* Checks that need no lesson because the fix is information, not language:
   the learner has to write more, or cover a point they missed. Telling them so
   IS the intervention, and it is always available — which is why these carry a
   built-in route rather than depending on published content. */
const COVERAGE_CHECKS = {
  word_count:     { kind: "coverage", why: "Der Text ist zu kurz für die Aufgabe." },
  content_points: { kind: "coverage", why: "Ein geforderter Inhaltspunkt fehlt." },
};

/**
 * check_id → where a learner can actually go to work on it.
 * Derived from LIVE experiences and their declared `checks`.
 */
async function routesFor() {
  const { rows } = await pool.query(
    `SELECT e.id, e.title, e.kind, e.checks, e.primary_capability, e.published_topic_id
       FROM b2_experiences e
      WHERE e.status='live' AND e.published_topic_id IS NOT NULL`);
  /* A WRITING EXPERIENCE IS NOT A ROUTE. Sending a learner whose writing is
     weak back to the same writing task is not teaching — it is repeating the
     diagnosis. Routes are the experiences that TEACH the feature. */
  const teaching = rows.filter(e => e.kind !== "writing");
  const PREF = { grammar: 0, vocabulary: 1, reading: 2, listening: 3, speaking: 4 };
  teaching.sort((a, b) => (PREF[a.kind] ?? 9) - (PREF[b.kind] ?? 9) || a.id.localeCompare(b.id));

  const map = new Map();
  for (const e of teaching) {
    for (const check of e.checks || []) {
      if (map.has(check)) continue;             // most teaching-shaped route wins, then by id
      map.set(check, {
        kind: "experience",
        experienceId: e.id,
        topicId: e.published_topic_id,
        title: e.title,
        experienceKind: e.kind,
      });
    }
  }
  for (const [check, r] of Object.entries(COVERAGE_CHECKS)) if (!map.has(check)) map.set(check, r);
  return map;
}

/* Severity first, then how much the learner's goal turns on it. Deliberately a
   small fixed table rather than a score: a ranking somebody can read is worth
   more here than a ranking that is marginally better tuned. */
const SEVERITY = { fail: 0, warn: 1 };

/**
 * Pick the ONE thing to work on.
 *
 * @returns { finding, route, reason, alreadyStrong, none }  — `none` is a
 *   legitimate outcome and says why. We never manufacture a weakness.
 */
function selectWeakness(findings, { routes, recentlyPassed = new Set(), impact = [], text = "",
                                    unsurePoints = [] } = {}) {
  const actionable = findings
    .filter(f => f.state === "fail" || f.state === "warn")
    .filter(f => routes.has(f.check_id))
    /* NEVER SEND SOMEBODY TO A LESSON ON THE STRENGTH OF A GUESS.
       Content-point detection scores about 71% on unseen German, and its
       residual errors are semantic — a reason given by juxtaposition carries no
       marker, and no pattern separates "a reason" from "the learner's reason".
       When the only thing standing between the learner and a pass is a point we
       flagged unsure, content_points is not eligible to be the one weakness:
       being told to cover a Leitpunkt you already covered is the worst thing
       this loop could do, and it would happen on the check the rubric weighs
       most. It stays in the evidence and in the detail; it just does not become
       the headline. */
    .filter(f => !(f.check_id === "content_points" && unsurePoints.length &&
                   (f.evidence || []).length === 0));

  const unroutable = findings
    .filter(f => f.state !== "pass" && !routes.has(f.check_id))
    .map(f => f.check_id);

  if (!actionable.length) {
    return {
      finding: null, route: null, unroutable,
      /* Two different "nothing to do"s, and the learner deserves to know which.
         Nothing wrong is praise; nothing we can teach is our limitation, not
         theirs, and it must never be dressed up as either praise or a fault. */
      none: findings.every(f => f.state === "pass") ? "nothing_wrong" : "no_route",
    };
  }

  const scored = actionable.map(f => {
    const at = impact.indexOf(f.check_id);
    return {
      f,
      severity: SEVERITY[f.state],
      /* How much the board's rubric turns on this check. Severity alone let a
         narrow range marker outrank a missing Inhaltspunkt — and Goethe
         penalises a missing content point far more heavily than an absent
         Konjunktiv II. An unlisted check sorts last rather than first. */
      impact: at < 0 ? 99 : at,
      /* A check the learner passed in a recent piece is deprioritised — not
         excluded. One bad text does not undo a habit, but if it is the only
         thing wrong it is still the thing to work on. */
      stale: recentlyPassed.has(f.check_id) ? 1 : 0,
      /* Actionable means SHOWABLE. A weakness we cannot point at in the
         learner's own writing is a claim they have to take on trust, and being
         shown your own sentence is most of what makes writing feedback land. */
      locatable: text && locate(text, f) ? 0 : 1,
      cap: caps.capabilityForCheck(f.check_id),
    };
  });

  /* ORDER: severity, then whether they can already do it, then what the rubric
     weighs, then whether we can show it to them.

     `stale` sits ABOVE `impact` deliberately. Rubric weight says what costs
     marks; "passed it in a recent piece" says the learner can already do this
     and today was a slip. Slips do not need a lesson — and with the two the
     other way round, a high-weight check would always win and the factor would
     be a knob that never fires. It still comes back when it is the only thing
     wrong: one good text does not make a weakness disappear. */
  scored.sort((a, b) =>
    (a.severity - b.severity) || (a.stale - b.stale) ||
    (a.impact - b.impact) || (a.locatable - b.locatable) ||
    a.f.check_id.localeCompare(b.f.check_id));      // deterministic tiebreak

  const top = scored[0];
  return {
    finding: top.f,
    route: routes.get(top.f.check_id),
    capability: top.cap,
    unroutable,
    /* Why THIS one, in a sentence, for the review surface and the tests. */
    reason: [
      top.severity === 0 ? "the clearest gap in this text" : "the closest thing to a gap",
      top.impact <= 2 ? "and it is what this task is marked on" : null,
      top.stale ? "though you have had it right before" : null,
    ].filter(Boolean).join(", "),
    none: null,
  };
}

/**
 * The learner's own sentence showing the problem. Nothing teaches a writing
 * weakness like being shown where it happened in your own text — and a finding
 * we cannot locate is shown without one rather than with a guess.
 */
function locate(text, finding) {
  const sentences = text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
  if (!sentences.length) return null;
  const c = finding.check_id;

  if (c === "connector_range") {
    /* The sentence that most needed joining: the longest one with no connector
       in it at all. */
    const CONN = /\b(weil|denn|obwohl|trotzdem|dennoch|allerdings|jedoch|zwar|deshalb|deswegen|daher|außerdem|zudem|während|andererseits|einerseits|wenn|falls|damit|dass)\b/i;
    return sentences.filter(s => !CONN.test(s)).sort((a, b) => b.length - a.length)[0] || null;
  }
  if (c === "sentence_complexity") {
    /* The shortest sentence that stands alone — a one-idea sentence is the
       thing this check is about, and pointing at the shortest fragment
       ("Ja.") would be pedantic rather than useful. */
    return sentences.filter(s => s.split(/\s+/).length >= 4)
      .sort((a, b) => a.split(/\s+/).length - b.split(/\s+/).length)[0] || null;
  }
  if (c === "repetition") {
    const w = (finding.evidence || [])[0];
    return w ? sentences.find(s => s.toLowerCase().includes(String(w).toLowerCase())) || null : null;
  }
  if (c === "lexical_range") {
    /* On a FAIL the evidence list is empty by definition — there was no
       abstract vocabulary to quote. So locate by absence: the longest sentence
       carrying none, which is where a more precise word would have paid most. */
    const ABSTRACT = /\b\w{5,}(ung|heit|keit|schaft|ität|anz|enz|nis)\b|\b\w{6,}(lich|bar|haft|sam|fähig|mäßig)\b/i;
    const w = (finding.evidence || [])[0];
    if (w) return sentences.find(s => s.toLowerCase().includes(String(w).toLowerCase())) || null;
    return sentences.filter(s => !ABSTRACT.test(s)).sort((a, b) => b.length - a.length)[0] || null;
  }
  if (c === "konjunktiv2") {
    /* Where a suggestion was made flatly. The sentence that proposes something
       without softening it is exactly the one to show. */
    const PROPOSE = /\b(man muss|man soll|die firma muss|arbeitgeber müssen|es ist n(ö|oe)tig|ich fordere|man macht|wir brauchen)\b/i;
    return sentences.find(s => PROPOSE.test(s))
      || sentences.sort((a, b) => b.length - a.length)[0] || null;
  }
  if ((finding.evidence || []).length) {
    const w = finding.evidence[0];
    return sentences.find(s => s.toLowerCase().includes(String(w).toLowerCase())) || null;
  }
  return null;
}

/* A number for the targeted check, so "better" is a measurement rather than an
   impression. Only the features the analyser already computes. */
function measure(check, metrics) {
  switch (check) {
    case "connector_range":     return metrics.connectorCats?.length ?? 0;
    case "sentence_complexity": return (metrics.range?.subordinators?.length ?? 0) + (metrics.range?.avgLen ?? 0) / 10;
    case "lexical_range":       return metrics.range?.abstract?.length ?? 0;
    case "repetition":          return -(metrics.repeat?.count ?? 0);
    case "konjunktiv2":         return metrics.konj2?.length ?? 0;
    case "nvv":                 return metrics.nvv?.length ?? 0;
    case "word_count":          return metrics.wordCount ?? 0;
    case "content_points":      return (metrics.points?.length ?? 0) - (metrics.missing?.length ?? 0);
    case "register":            return -(metrics.colloquial?.length ?? 0);
    case "genitiv_praep":       return -(metrics.genitiv?.length ?? 0);
    default:                    return null;
  }
}

const STATE_RANK = { fail: 0, warn: 1, pass: 2 };

/**
 * Did the rewrite fix the thing the learner was taught?
 *
 * Deliberately narrow. A rewrite that improved everywhere except the targeted
 * check has not demonstrated that the teaching worked, and saying it did would
 * make `language_awareness` evidence worthless.
 */
function compare(before, after, targetedCheck, task) {
  const a = analyse(before, task), b = analyse(after, task);
  const fa = a.findings.find(f => f.check_id === targetedCheck);
  const fb = b.findings.find(f => f.check_id === targetedCheck);
  if (!fa || !fb) return { improved: false, reason: "check_not_applicable", before: null, after: null };

  const stateUp = STATE_RANK[fb.state] > STATE_RANK[fa.state];
  const ma = measure(targetedCheck, a.metrics), mb = measure(targetedCheck, b.metrics);
  const measureUp = ma !== null && mb !== null && mb > ma;

  return {
    improved: stateUp || measureUp,
    /* Both are reported because they answer different questions: the state is
       whether it now passes, the measure is whether it moved at all. A learner
       who went from no connectors to two has improved even if two is still not
       enough to pass, and telling them it did not count would be a lie. */
    stateBefore: fa.state, stateAfter: fb.state,
    measureBefore: ma, measureAfter: mb,
    detailAfter: fb.detail,
    reason: stateUp ? "state_improved" : measureUp ? "measure_improved" : "unchanged",
  };
}

/**
 * `language_awareness` — earned, not assigned.
 *
 * Goethe names Sprachbewusstsein as a defining B2 feature, and it is not
 * "knows grammar". It is noticing your own recurring weakness and correcting
 * it. So the evidence requires the whole loop to have happened: a real text, a
 * weakness identified in it, teaching, a rewrite of THAT text, and a measurable
 * change in THAT feature. Anything less earns nothing — including a rewrite
 * that is simply better, and including a learner who merely pressed submit.
 */
function awarenessEvidence(cmp, { isRewrite, targetedCheck }) {
  if (!isRewrite || !targetedCheck) return [];
  if (!cmp.improved) return [];
  return [{
    dimension: "writing",
    capability: "language_awareness",
    /* A full state change is the demonstration; a measurable move in the right
       direction that still does not pass is real but partial. */
    outcome: cmp.reason === "state_improved" ? 1 : 0.7,
    weight: 0.6,
  }];
}

module.exports = {
  routesFor, selectWeakness, locate, compare, awarenessEvidence, measure, COVERAGE_CHECKS,
};
