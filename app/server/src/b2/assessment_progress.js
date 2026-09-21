/**
 * DID SHE IMPROVE? — scoring, comparability and the delta.
 *
 * Pure. Takes stored attempt records and returns what the Phase 2 Progress
 * component needs. No database here on purpose: the rule this module exists to
 * enforce is a reasoning rule, and it has to be testable without one.
 *
 * THE NON-NEGOTIABLE RULE, in code rather than in a comment:
 * the product may not say "you improved" unless there are two COMPLETED
 * attempts, on STRUCTURALLY COMPARABLE content, with REAL stored per-item
 * results, and ENOUGH measured items to support the claim. Every one of those
 * four is checked below, and failing any of them returns `delta: null` with a
 * reason — never a percentage, never an arrow.
 *
 * "Insufficient evidence for improvement comparison" is a correct answer. A
 * green arrow off two questions is not.
 *
 * WHAT COUNTS TOWARD THE COMPARABLE SCORE
 *   objective items      yes — they have a key, so `correct` means something
 *   writing              no  — judged by the analyser, no correct/incorrect;
 *                              it contributes evidence, not a point
 *   speaking             no  — captured, transcript-only, unbanded, and
 *                              explicitly outside the comparable core
 *   skipped items        no  — not measured. NOT wrong. They lower the
 *                              denominator, never the numerator.
 */

const { BLUEPRINT } = require("../seed/b2/assessment");

/* Enough measured items for an overall comparison. Reuses the blueprint's own
   floor so the assessment and the evidence model cannot disagree about what
   "enough" means. */
const MIN_MEASURED = BLUEPRINT.skip.minMeasuredForComparableResult;

/* Per-skill comparison needs its own floor. Grammar has 8 slots and listening
   has 2; a "listening improved" claim off two items is exactly the false
   precision this file exists to prevent. */
const MIN_PER_SKILL = 3;

/* Below this the difference is noise, not improvement. One item in twenty is
   5%, so anything under a whole item's worth cannot be called movement. */
const NOISE = 0.05;

const isCore = (i) => i.skill !== "speaking" && i.skill !== "writing";
const isMeasured = (i) => !i.skipped && i.correct !== null && i.correct !== undefined;

/**
 * Score one completed attempt over its comparable core.
 * @returns { score|null, measured, skipped, correct, bySkill, byCapability }
 */
function scoreAttempt(attempt) {
  const items = (attempt.items || []).filter(isCore);
  const measured = items.filter(isMeasured);
  const correct = measured.filter(i => i.correct === true).length;

  const group = (key) => {
    const out = {};
    for (const i of items) {
      const k = i[key];
      if (!k) continue;
      out[k] = out[k] || { measured: 0, correct: 0, skipped: 0 };
      if (i.skipped) { out[k].skipped += 1; continue; }
      if (!isMeasured(i)) continue;
      out[k].measured += 1;
      if (i.correct === true) out[k].correct += 1;
    }
    for (const v of Object.values(out)) {
      v.score = v.measured ? v.correct / v.measured : null;
    }
    return out;
  };

  return {
    attemptId: attempt.attemptId ?? attempt.id ?? null,
    version: attempt.version ?? null,
    completedAt: attempt.completedAt ?? null,
    // No measured items means NO SCORE, not zero. Zero is a result; null is the
    // absence of one, and a learner who skipped everything has not scored zero.
    score: measured.length ? correct / measured.length : null,
    measured: measured.length,
    skipped: items.filter(i => i.skipped).length,
    correct,
    // Items in the attempt the learner was never shown at all are simply absent;
    // shown-and-skipped are counted above. The distinction is the persistence
    // layer's to record and this module's to respect.
    notMeasured: items.length - measured.length,
    bySkill: group("skill"),
    byCapability: group("capability"),
  };
}

/**
 * Are two attempts the same instrument?
 *
 * STRUCTURAL, never statistical. Same comparable slot set, same capability
 * weighting, same skill weighting, same objective count. Speaking is excluded
 * before anything is counted, because it is not part of the core and letting it
 * in would make two attempts look different purely over a prompt that carries
 * no score.
 */
function comparable(a, b) {
  const reasons = [];
  const core = (att) => (att.items || []).filter(isCore);
  const A = core(a), B = core(b);

  if (!a.completedAt) reasons.push("first attempt is not completed");
  if (!b.completedAt) reasons.push("second attempt is not completed");

  /* GROUP FIRST, AND IT IS DECISIVE. Two blueprints could coincidentally agree
     on every tally and still be different instruments — different difficulty
     targets, different item formats behind the same counts. The declared group
     is the only thing that settles it, so it is checked before any counting.

     An attempt with no group recorded predates the field and belongs to
     `core-2026a` — the only group that has ever existed. Defaulting rather than
     refusing is deliberate: every attempt already in the database was built to
     that blueprint, and treating them as unknown would silently void the
     history this whole phase exists to protect. */
  const groupOf = (att) => att.comparableGroup || "core-2026a";
  if (groupOf(a) !== groupOf(b)) {
    reasons.push(`different assessment groups: ${groupOf(a)} vs ${groupOf(b)}`);
  }

  if (A.length !== B.length) {
    reasons.push(`comparable item count differs: ${A.length} vs ${B.length}`);
  }

  const tally = (list, key) => list.reduce((acc, i) => {
    const k = i[key]; if (!k) return acc;
    acc[k] = (acc[k] || 0) + 1; return acc;
  }, {});
  for (const key of ["skill", "capability", "slot"]) {
    const x = tally(A, key), y = tally(B, key);
    const keys = new Set([...Object.keys(x), ...Object.keys(y)]);
    for (const k of keys) {
      if ((x[k] || 0) !== (y[k] || 0)) {
        reasons.push(`${key} weighting differs at "${k}": ${x[k] || 0} vs ${y[k] || 0}`);
      }
    }
  }

  /* Same content is not a comparison either. Two attempts that share items are
     measuring recall of those items, and the difference between them is not
     evidence of improved German. */
  const shared = A.map(i => i.itemId).filter(id => B.some(j => j.itemId === id));
  if (shared.length) reasons.push(`${shared.length} item(s) appear in both attempts`);

  return { ok: reasons.length === 0, reasons, sharedItemIds: shared };
}

const direction = (d) => (d > NOISE ? "up" : d < -NOISE ? "down" : "flat");

/**
 * Compare the two most recent completed attempts.
 *
 * Compares LATEST against the one immediately before it — V3 against V2, not
 * V3 against V1. A longer-term trend is a different question and is not
 * answered here.
 *
 * @returns the shape the Phase 2 Progress component already accepts:
 *          { latest, previous, delta, skills[] } — with `delta: null` and a
 *          stated reason whenever the claim is not supported.
 */
function progress(attempts = []) {
  const done = attempts
    .filter(a => a.completedAt)
    .sort((x, y) => new Date(y.completedAt) - new Date(x.completedAt));

  if (!done.length) {
    return { latest: null, previous: null, delta: null, skills: [],
             reason: "No completed assessment yet." };
  }

  const latest = scoreAttempt(done[0]);
  if (done.length < 2) {
    return { latest, previous: null, delta: null, skills: [],
             reason: "No improvement comparison yet — this is the first assessment." };
  }

  const previous = scoreAttempt(done[1]);
  const cmp = comparable(done[1], done[0]);

  if (!cmp.ok) {
    /* Explained internally, never shown as a number. A delta between two
       different instruments is worse than no delta, because it looks like one. */
    return { latest, previous, delta: null, skills: [],
             reason: "The two assessments are not structurally comparable, so no change can be reported.",
             comparability: cmp };
  }

  if (latest.measured < MIN_MEASURED || previous.measured < MIN_MEASURED) {
    return { latest, previous, delta: null, skills: [],
             reason: `Insufficient evidence for improvement comparison — ` +
                     `${Math.min(latest.measured, previous.measured)} measured item(s), ` +
                     `${MIN_MEASURED} needed.` };
  }

  const d = latest.score - previous.score;

  /* Per skill, and only where BOTH sittings measured enough of it. A skill she
     skipped this time is "not measured", never "declined". */
  const skills = [];
  const names = new Set([...Object.keys(latest.bySkill), ...Object.keys(previous.bySkill)]);
  for (const skill of names) {
    const L = latest.bySkill[skill], P = previous.bySkill[skill];
    if (!L || !P || L.measured < MIN_PER_SKILL || P.measured < MIN_PER_SKILL) {
      skills.push({ skill, direction: "not_measured",
                    reason: `Fewer than ${MIN_PER_SKILL} measured items in one of the two assessments.` });
      continue;
    }
    const sd = L.score - P.score;
    skills.push({ skill, direction: direction(sd),
                  delta: Math.round(sd * 100) / 100,
                  measured: { latest: L.measured, previous: P.measured } });
  }

  return {
    latest, previous,
    delta: {
      value: Math.round(d * 100) / 100,
      direction: direction(d),
      // The measured base the claim rests on, carried with it so no caller can
      // present the number without the evidence behind it.
      basis: { latestMeasured: latest.measured, previousMeasured: previous.measured,
               comparableItems: (done[0].items || []).filter(isCore).length },
      // What the product is allowed to say. Never a percentage of a level,
      // never a score, never a pass probability.
      claim: direction(d) === "flat"
        ? "No clear change since your last assessment."
        : direction(d) === "up"
          ? "More correct than last time, on a comparable assessment."
          : "Fewer correct than last time, on a comparable assessment.",
    },
    skills,
    capabilities: Object.fromEntries(Object.entries(latest.byCapability).map(([c, L]) => {
      const P = previous.byCapability[c];
      if (!P || !P.measured || !L.measured) return [c, { direction: "not_measured" }];
      const cd = L.score - P.score;
      return [c, { direction: direction(cd), delta: Math.round(cd * 100) / 100,
                   measured: { latest: L.measured, previous: P.measured } }];
    })),
  };
}

module.exports = { scoreAttempt, comparable, progress, MIN_MEASURED, MIN_PER_SKILL, NOISE };
