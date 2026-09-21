/**
 * THE RETEST AND PROGRESS ENGINES.
 *
 * These two modules carry the product's only non-negotiable rule — never tell a
 * learner she improved without two completed, comparable, really-measured
 * assessments — so the suite is written around the ways that claim could be
 * made falsely, not around the happy path.
 *
 * DB-free by construction. Both modules take their inputs as plain objects, so
 * every assertion here runs in an environment where Postgres is unreachable.
 * That is the point: the reasoning can be proven now, and the persistence that
 * feeds it can be proven later.
 */

const { test, describe } = require("node:test");
const assert = require("node:assert");

const compose = require("../src/b2/assessment_compose");
const prog = require("../src/b2/assessment_progress");
const { BLUEPRINT, itemsOf, itemsFor } = require("../src/seed/b2/assessment");

/* ── helpers ─────────────────────────────────────────────────────────────── */

const ev = (capability, outcome, n, { sourceKind = "screening", sitting = "screen_v1", day = 1 } = {}) =>
  Array.from({ length: n }, (_, k) => ({
    capability, outcome, weight: 0.7, dimension: "grammar",
    source_kind: sourceKind, source_ref: `${sitting}:i${k}`,
    created_at: new Date(2026, 0, day, 0, k).toISOString(),
  }));

/** A completed attempt built from a composition, with a given hit rate. */
function attemptFrom(composition, { correctRate = 0.5, skipSlots = [], completedAt, version, id }) {
  const core = composition.items;
  let n = 0;
  return {
    attemptId: id, version, completedAt,
    items: core.map(i => {
      const skipped = skipSlots.includes(i.slot);
      const objective = i.skill !== "writing" && i.skill !== "speaking";
      const correct = skipped || !objective ? null : (n++ % Math.round(1 / correctRate)) === 0;
      return { slot: i.slot, itemId: i.itemId, capability: i.capability,
               skill: i.skill, skipped, correct };
    }),
  };
}

/* ── weakness detection ──────────────────────────────────────────────────── */

describe("weaknessSet — the evidence bar", () => {
  test("one wrong answer is not a weakness", () => {
    const w = compose.weaknessSet(ev("argue", 0, 1));
    assert.deepEqual(w, [], "a single demonstration became a weakness");
  });

  test("two wrong answers in one sitting are still not a reliable weakness", () => {
    // `initial` state — below every threshold in WEAKNESS_STATES.
    assert.deepEqual(compose.weaknessSet(ev("argue", 0, 2)), []);
  });

  test("three wrong in one screening reaches screening_signal and counts", () => {
    const w = compose.weaknessSet(ev("argue", 0, 3));
    assert.equal(w.length, 1);
    assert.equal(w[0].capability, "argue");
    assert.equal(w[0].state, "screening_signal");
  });

  test("repeated evidence across sittings and formats raises confidence", () => {
    const rows = [
      ...ev("argue", 0, 3, { sitting: "screen_v1", sourceKind: "screening", day: 1 }),
      ...ev("argue", 0, 3, { sitting: "sub_9", sourceKind: "submission", day: 2 }),
    ];
    const w = compose.weaknessSet(rows);
    assert.equal(w[0].state, "reliable", "two occasions in two formats should be reliable");
  });

  test("good performance is never a weakness however much evidence there is", () => {
    assert.deepEqual(compose.weaknessSet(ev("argue", 1, 8)), []);
  });

  test("speaking evidence never steers targeting", () => {
    const rows = ev("argue", 0, 6).map(r => ({ ...r, dimension: "speaking" }));
    assert.deepEqual(compose.weaknessSet(rows), []);
  });

  test("weaknesses come back worst first", () => {
    const rows = [
      ...ev("argue", 0.5, 3, { sitting: "a" }),
      ...ev("concede", 0, 3, { sitting: "b" }),
    ];
    const w = compose.weaknessSet(rows);
    assert.equal(w[0].capability, "concede", "the worse capability should rank first");
  });
});

/* ── composition ─────────────────────────────────────────────────────────── */

describe("composeAssessment — first sitting", () => {
  const first = compose.composeAssessment({});

  test("a learner with no history gets the V1 baseline, whole", () => {
    assert.equal(first.mode, "initial");
    assert.equal(first.baselineVersion, "v1");
    assert.ok(first.items.every(i => i.version === "v1"));
  });

  test("the baseline fills every comparable blueprint slot", () => {
    assert.equal(first.items.length, BLUEPRINT.slots.length);
    assert.equal(first.comparableItemCount, BLUEPRINT.slots.length);
  });

  test("no targeting happens without weakness data", () => {
    assert.deepEqual(first.targetCapabilities, []);
    assert.equal(first.composition.targetedSlots, 0);
  });
});

describe("composeAssessment — retest", () => {
  const v1Seen = itemsOf("v1").map(i => i.id);
  const weak = compose.weaknessSet([
    ...ev("argue", 0, 3, { sitting: "screen_v1" }),
    ...ev("adapt_register", 0.2, 3, { sitting: "screen_v1" }),
  ]);

  const retest = compose.composeAssessment({
    seenItemIds: v1Seen, weaknesses: weak, satVersions: ["v1"],
  });

  test("it is a retest, and it is new", () => {
    assert.equal(retest.mode, "retest");
    const overlap = retest.items.filter(i => v1Seen.includes(i.itemId));
    assert.deepEqual(overlap, [], "a retest reused an item the learner has already seen");
  });

  test("it prefers a version the learner has not sat", () => {
    assert.ok(retest.items.every(i => i.version !== "v1"));
  });

  test("the blueprint survives — same slots, same capability weighting", () => {
    assert.equal(retest.comparableItemCount, BLUEPRINT.slots.length);
    const tally = retest.items.filter(i => i.skill !== "speaking")
      .reduce((a, i) => { a[i.capability] = (a[i.capability] || 0) + 1; return a; }, {});
    assert.deepEqual(tally, BLUEPRINT.capabilityWeighting);
  });

  test("targeting is a GROUP, not the single worst capability", () => {
    assert.ok(retest.targetCapabilities.length >= 2);
    assert.ok(retest.targetCapabilities.includes("argue"));
    assert.ok(retest.targetCapabilities.includes("adapt_register"));
  });

  test("no single capability monopolises the test", () => {
    const tally = retest.items.reduce((a, i) => {
      a[i.capability] = (a[i.capability] || 0) + 1; return a; }, {});
    const worst = Math.max(...Object.values(tally));
    assert.ok(worst <= retest.items.length * 0.5,
      `one capability took ${worst} of ${retest.items.length} slots`);
  });

  test("broad coverage is retained", () => {
    assert.ok(retest.composition.broadSlots >= BLUEPRINT.retestMix.minBroadSlots,
      `only ${retest.composition.broadSlots} broad slots`);
  });

  test("targeted coverage is reported as measured, and the shortfall is explained", () => {
    // argue 6 + adapt_register 3 = 9 of 20 = 45%, under the 65% strategy. The
    // blueprint cannot give more without re-weighting, and that must be SAID
    // rather than silently missed or silently forced.
    assert.equal(retest.composition.targetedCoverage, 0.45);
    assert.ok(retest.coverageShortfall, "a shortfall below the strategy went unreported");
    assert.equal(retest.coverageShortfall.wanted, 0.65);
    assert.ok(/comparability/i.test(retest.coverageShortfall.reason));
  });

  test("the composition explains itself", () => {
    assert.ok(retest.explanation.length);
    assert.ok(retest.explanation.some(e => /argue/.test(e)));
  });

  test("nothing is exhausted after one sitting", () => {
    assert.equal(retest.contentExhausted, false);
    assert.deepEqual(retest.exhausted, []);
  });

  /* Both of these were reported wrongly the first time this ran against real
     data, and both were misleading rather than merely untidy. */
  test("a full blueprint is never reported as thin broad coverage", () => {
    // Six weak capabilities cover 16 of 20 slots, leaving 4 "broad" — which
    // read as "below the floor of 6" even though the learner had lost no
    // coverage at all: every slot was present, in baseline proportions.
    const wide = compose.weaknessSet([
      ...ev("argue", 0, 3, { sitting: "s" }), ...ev("concede", 0, 3, { sitting: "s" }),
      ...ev("structure", 0, 3, { sitting: "s" }), ...ev("speculate", 0, 3, { sitting: "s" }),
      ...ev("justify", 0, 3, { sitting: "s" }), ...ev("understand_speech", 0, 3, { sitting: "s" }),
    ]);
    const r = compose.composeAssessment({
      seenItemIds: v1Seen, weaknesses: wide, satVersions: ["v1"] });
    assert.equal(r.comparableItemCount, BLUEPRINT.slots.length, "the blueprint was not complete");
    assert.ok(r.composition.broadSlots < BLUEPRINT.retestMix.minBroadSlots,
      "this case is only interesting when broad slots are below the floor");
    assert.ok(!r.explanation.some(e => /below the floor/.test(e)),
      "a complete blueprint was reported as missing coverage");
    assert.ok(r.explanation.some(e => /Full blueprint coverage/.test(e)));
  });

  test("targeting above the strategy band is explained, not corrected", () => {
    const wide = compose.weaknessSet([
      ...ev("argue", 0, 3, { sitting: "s" }), ...ev("concede", 0, 3, { sitting: "s" }),
      ...ev("structure", 0, 3, { sitting: "s" }), ...ev("speculate", 0, 3, { sitting: "s" }),
      ...ev("justify", 0, 3, { sitting: "s" }), ...ev("understand_speech", 0, 3, { sitting: "s" }),
    ]);
    const r = compose.composeAssessment({
      seenItemIds: v1Seen, weaknesses: wide, satVersions: ["v1"] });
    assert.ok(r.composition.targetedCoverage > BLUEPRINT.retestMix.targeted);
    // Slots she is weak in must NOT be dropped to hit 65%.
    assert.equal(r.comparableItemCount, BLUEPRINT.slots.length);
    assert.ok(r.explanation.some(e => /above the .* strategy/.test(e)),
      "overshoot was silent");
  });
});

describe("composeAssessment — content exhaustion", () => {
  const seenAll = ["v1", "v2", "v3"].flatMap(v => itemsOf(v).map(i => i.id));

  test("a third sitting still finds fresh items", () => {
    const seen = [...itemsOf("v1"), ...itemsOf("v2")].map(i => i.id);
    const third = compose.composeAssessment({
      seenItemIds: seen, weaknesses: [], satVersions: ["v1", "v2"] });
    assert.equal(third.contentExhausted, false);
    assert.equal(third.comparableItemCount, BLUEPRINT.slots.length);
    assert.deepEqual(third.items.filter(i => seen.includes(i.itemId)), []);
  });

  test("a fourth sitting reports exhaustion instead of repeating an item", () => {
    const fourth = compose.composeAssessment({
      seenItemIds: seenAll, weaknesses: [], satVersions: ["v1", "v2", "v3"] });
    assert.equal(fourth.contentExhausted, true);
    assert.ok(fourth.exhausted.length > 0);
    assert.deepEqual(fourth.items, [], "items were served after the pool was exhausted");
    assert.ok(fourth.explanation.some(e => /No item was repeated/.test(e)));
  });

  test("an exhausted assessment is not comparable to a full blueprint sitting", () => {
    const fourth = compose.composeAssessment({
      seenItemIds: seenAll, satVersions: ["v1", "v2", "v3"] });
    assert.equal(fourth.comparableToBlueprint, false);
  });

  test("a thin capability falls back rather than repeating", () => {
    // `compare` has exactly 3 variants. After two sittings one remains; after
    // three, none — and the slot must be reported empty, not refilled.
    const seenTwo = [...itemsOf("v1"), ...itemsOf("v2")].map(i => i.id);
    assert.equal(compose.poolRemaining(seenTwo).G7, 1);
    assert.equal(compose.poolRemaining(seenAll).G7, 0);
  });
});

/* ── scoring ─────────────────────────────────────────────────────────────── */

describe("scoreAttempt — skipped is not wrong", () => {
  const base = compose.composeAssessment({});

  test("a skipped item lowers the denominator, never the numerator", () => {
    const all = attemptFrom(base, { correctRate: 1, completedAt: "2026-01-01", version: "v1" });
    const some = attemptFrom(base, { correctRate: 1, skipSlots: ["G1", "G2", "G3"],
                                     completedAt: "2026-01-01", version: "v1" });
    const a = prog.scoreAttempt(all), b = prog.scoreAttempt(some);
    assert.equal(a.score, 1);
    assert.equal(b.score, 1, "skipping three items reduced a perfect score");
    assert.equal(b.skipped, 3);
    assert.equal(b.measured, a.measured - 3);
  });

  test("skipping everything is no score, not a zero", () => {
    const none = attemptFrom(base, { correctRate: 1,
      skipSlots: base.items.map(i => i.slot), completedAt: "2026-01-01", version: "v1" });
    const s = prog.scoreAttempt(none);
    assert.equal(s.score, null, "a fully skipped assessment scored zero instead of nothing");
    assert.equal(s.measured, 0);
  });

  test("writing and speaking stay out of the comparable score", () => {
    const s = prog.scoreAttempt(attemptFrom(base, {
      correctRate: 1, completedAt: "2026-01-01", version: "v1" }));
    assert.ok(!s.bySkill.writing, "writing entered the comparable score");
    assert.ok(!s.bySkill.speaking, "speaking entered the comparable score");
    assert.equal(s.measured, BLUEPRINT.objectiveItemCount);
  });
});

/* ── comparability and delta ─────────────────────────────────────────────── */

describe("progress — the improvement claim", () => {
  const v1Seen = itemsOf("v1").map(i => i.id);
  const first = compose.composeAssessment({});
  const second = compose.composeAssessment({
    seenItemIds: v1Seen, weaknesses: [], satVersions: ["v1"] });

  const a1 = attemptFrom(first, { id: 1, version: "v1", correctRate: 0.5, completedAt: "2026-01-01" });
  const a2 = attemptFrom(second, { id: 2, version: "v2", correctRate: 1, completedAt: "2026-02-01" });

  test("no completed assessment → no latest, no delta", () => {
    const p = prog.progress([]);
    assert.equal(p.latest, null);
    assert.equal(p.delta, null);
  });

  test("an unfinished attempt is not history", () => {
    const p = prog.progress([{ ...a1, completedAt: null }]);
    assert.equal(p.latest, null);
  });

  test("first assessment → a result, but explicitly no comparison", () => {
    const p = prog.progress([a1]);
    assert.ok(p.latest);
    assert.equal(p.previous, null);
    assert.equal(p.delta, null);
    assert.match(p.reason, /first assessment/i);
  });

  test("second comparable assessment → a real delta", () => {
    const p = prog.progress([a1, a2]);
    assert.ok(p.delta, "two comparable completed attempts produced no delta");
    assert.equal(p.delta.direction, "up");
    assert.ok(p.delta.value > 0);
    assert.ok(p.delta.basis.latestMeasured >= prog.MIN_MEASURED);
    assert.ok(!/goethe|telc|%|pass/i.test(p.delta.claim));
  });

  test("the latest attempt is the one compared, whatever order it arrives in", () => {
    assert.equal(prog.progress([a1, a2]).latest.attemptId, 2);
    assert.equal(prog.progress([a2, a1]).latest.attemptId, 2);
  });

  test("a third assessment compares against the second, not the first", () => {
    const seen = [...itemsOf("v1"), ...itemsOf("v2")].map(i => i.id);
    const third = compose.composeAssessment({ seenItemIds: seen, satVersions: ["v1", "v2"] });
    const a3 = attemptFrom(third, { id: 3, version: "v3", correctRate: 1, completedAt: "2026-03-01" });
    const p = prog.progress([a1, a2, a3]);
    assert.equal(p.latest.attemptId, 3);
    assert.equal(p.previous.attemptId, 2, "compared against the first assessment instead of the second");
  });

  test("incomparable attempts produce no delta and say why", () => {
    const truncated = { ...a2, items: a2.items.slice(0, 8) };
    const p = prog.progress([a1, truncated]);
    assert.equal(p.delta, null);
    assert.match(p.reason, /not structurally comparable/i);
    assert.ok(p.comparability.reasons.length);
  });

  test("two attempts sharing items are not a comparison", () => {
    const repeat = { ...a2, attemptId: 9, items: a1.items, completedAt: "2026-02-02" };
    const p = prog.progress([a1, repeat]);
    assert.equal(p.delta, null);
    assert.ok(p.comparability.reasons.some(r => /appear in both/.test(r)));
  });

  test("thin evidence produces no delta, not a small one", () => {
    const skipMost = (att, id, when) => ({
      ...att, attemptId: id, completedAt: when,
      items: att.items.map((i, k) => k < att.items.length - 3
        ? { ...i, skipped: true, correct: null } : i),
    });
    const p = prog.progress([skipMost(a1, 1, "2026-01-01"), skipMost(a2, 2, "2026-02-01")]);
    assert.equal(p.delta, null);
    assert.match(p.reason, /insufficient evidence/i);
  });

  test("a difference smaller than one item is flat, not improvement", () => {
    const p = prog.progress([a1, { ...a2, items: a1.items.map(i => ({ ...i, itemId: i.itemId + "_x" })) }]);
    if (p.delta) {
      assert.equal(p.delta.direction, "flat");
      assert.match(p.delta.claim, /no clear change/i);
    }
  });

  test("a skill with too few measured items is not_measured, never declined", () => {
    const p = prog.progress([a1, a2]);
    const listening = p.skills.find(s => s.skill === "listening");
    assert.equal(listening.direction, "not_measured",
      "two listening items were enough to claim a direction");
  });

  test("a skill with enough items on both sides gets a direction", () => {
    const p = prog.progress([a1, a2]);
    const grammar = p.skills.find(s => s.skill === "grammar");
    assert.ok(["up", "down", "flat"].includes(grammar.direction));
    assert.ok(grammar.measured.latest >= prog.MIN_PER_SKILL);
  });

  test("the delta never carries a score, a level or a pass claim", () => {
    const p = prog.progress([a1, a2]);
    const blob = JSON.stringify(p);
    assert.ok(!/goethe|telc|bestehen|pass probability|CEFR/i.test(blob));
  });
});

describe("progress — the shape Phase 2 already accepts", () => {
  test("it returns latest, previous, delta and skills", () => {
    const p = prog.progress([]);
    for (const k of ["latest", "previous", "delta", "skills"]) {
      assert.ok(k in p, `progress() is missing "${k}"`);
    }
    assert.ok(Array.isArray(p.skills));
  });
});
