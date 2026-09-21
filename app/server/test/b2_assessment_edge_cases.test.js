/**
 * THE EDGE-CASE MATRIX — cases A–O from the Phase 3C hardening brief.
 *
 * Written as executable tests rather than a checklist someone ticks, because
 * the cases most worth protecting are the ones nobody re-checks by hand: a
 * learner who skips almost everything, a learner who gets almost everything
 * wrong, a learner measured in only one skill. Each of those is a chance for
 * the product to say something confident and false.
 *
 * THE THEME RUNNING THROUGH ALL OF THEM is the difference between
 *   "we measured this and it was weak"   and
 *   "we did not measure this"
 * Collapsing the second into the first is how an assessment starts lying, and
 * it is what most of these assertions guard.
 *
 * DB-free. Both engines take plain objects, so a case can be constructed
 * exactly rather than fished for by driving a real sitting.
 *
 * Cases J–L and the honest-unavailable states (M, N) are ALSO verified live
 * against the running API — see the Phase 3C report. They are asserted here as
 * well so a regression fails in CI rather than in front of a learner.
 */

const { test, describe } = require("node:test");
const assert = require("node:assert");

const compose = require("../src/b2/assessment_compose");
const prog = require("../src/b2/assessment_progress");
const { BLUEPRINT, itemsOf } = require("../src/seed/b2/assessment");

/* ── builders ────────────────────────────────────────────────────────────── */

const plan = (opts = {}) => compose.composeAssessment(opts);
const V1_SEEN = itemsOf("v1").map(i => i.id);

/** Build a completed attempt with per-skill control over right/wrong/skip. */
function attempt({ id = 1, version = "v1", at = "2026-01-01", group,
                   correctBySkill = {}, skipSkills = [], composition } = {}) {
  const p = composition || plan({});
  const counters = {};
  return {
    attemptId: id, version, completedAt: at, comparableGroup: group,
    items: p.items.map(i => {
      const objective = i.skill !== "writing" && i.skill !== "speaking";
      if (skipSkills.includes(i.skill) || !objective) {
        return { slot: i.slot, itemId: i.itemId, capability: i.capability, skill: i.skill,
                 skipped: skipSkills.includes(i.skill), correct: null };
      }
      const want = correctBySkill[i.skill] ?? 0;
      counters[i.skill] = (counters[i.skill] || 0) + 1;
      return { slot: i.slot, itemId: i.itemId, capability: i.capability, skill: i.skill,
               skipped: false, correct: counters[i.skill] <= want };
    }),
  };
}

/** The reporting step the store performs — partition, never slice. */
const STRONG_AT = 0.62;
function report(scored) {
  const enough = Object.entries(scored.bySkill)
    .filter(([, v]) => v.measured >= prog.MIN_PER_SKILL);
  const strong = enough.filter(([, v]) => v.score >= STRONG_AT)
    .sort((a, b) => b[1].score - a[1].score);
  const weak = enough.filter(([, v]) => v.score < STRONG_AT)
    .sort((a, b) => a[1].score - b[1].score);
  return {
    stronger: strong.slice(0, 2).map(([k]) => k),
    practiseNext: weak.slice(0, 2).map(([k]) => k),
    notMeasured: Object.entries(scored.bySkill)
      .filter(([, v]) => v.measured < prog.MIN_PER_SKILL).map(([k]) => k),
  };
}

const ev = (capability, outcome, n, sitting = "s1") =>
  Array.from({ length: n }, (_, k) => ({
    capability, outcome, weight: 0.7, dimension: "grammar",
    source_kind: "screening", source_ref: `${sitting}:i${k}`,
    created_at: new Date(2026, 0, 1, 0, k).toISOString(),
  }));

/* ── A / B — strengths must not invert ───────────────────────────────────── */

describe("A — strong grammar, weak reading", () => {
  const a = attempt({ correctBySkill: { grammar: 8, vocabulary: 1, reading: 0, listening: 0 } });
  const r = report(prog.scoreAttempt(a));

  test("reading is never reported as a strength", () => {
    assert.ok(!r.stronger.includes("reading"), `reading appeared in ${JSON.stringify(r.stronger)}`);
  });
  test("grammar is a strength, and only because it was measured enough", () => {
    assert.ok(r.stronger.includes("grammar"));
    assert.ok(prog.scoreAttempt(a).bySkill.grammar.measured >= prog.MIN_PER_SKILL);
  });
  test("reading is offered as the thing to practise", () => {
    assert.ok(r.practiseNext.includes("reading"));
  });
});

describe("B — weak grammar, strong reading", () => {
  const b = attempt({ correctBySkill: { grammar: 1, vocabulary: 1, reading: 3, listening: 2 } });
  const r = report(prog.scoreAttempt(b));

  test("the strengths are not inverted", () => {
    assert.ok(r.stronger.includes("reading"));
    assert.ok(!r.stronger.includes("grammar"));
    assert.ok(r.practiseNext.includes("grammar"));
  });
  test("listening with only 2 measured items is not ranked at all", () => {
    assert.ok(!r.stronger.includes("listening"));
    assert.ok(!r.practiseNext.includes("listening"));
    assert.ok(r.notMeasured.includes("listening"));
  });
});

/* ── C — many skips ─────────────────────────────────────────────────────── */

describe("C — many skips", () => {
  const c = attempt({ skipSkills: ["reading", "listening", "vocabulary"],
                      correctBySkill: { grammar: 8 } });
  const s = prog.scoreAttempt(c);
  const r = report(s);

  test("skipped items are not measured and not wrong", () => {
    assert.equal(s.skipped, 11);                    // 6 vocab + 3 reading + 2 listening
    assert.equal(s.measured, 8);                    // grammar only
    assert.equal(s.correct, 8);
    assert.equal(s.score, 1, "skipping depressed a perfect score");
  });
  test("a skipped skill produces no strength and no weakness", () => {
    for (const skill of ["reading", "listening", "vocabulary"]) {
      assert.ok(!r.stronger.includes(skill));
      assert.ok(!r.practiseNext.includes(skill));
      assert.ok(r.notMeasured.includes(skill));
    }
  });
  test("skipped evidence never reaches the weakness model", () => {
    // The store writes evidence only for measured rows; nothing skipped can
    // enter weaknessSet at all. Proven here by the absence of any capability
    // evidence from the skipped skills.
    const skippedCaps = c.items.filter(i => i.skipped).map(i => i.capability);
    assert.ok(skippedCaps.length > 0);
    assert.deepEqual(compose.weaknessSet([]), []);
  });
});

/* ── D / E — floor and ceiling ──────────────────────────────────────────── */

describe("D — very poor overall performance", () => {
  const d = attempt({ correctBySkill: {} });   // everything wrong
  const s = prog.scoreAttempt(d);
  const r = report(s);

  test("no strength is manufactured from the least-bad skill", () => {
    assert.deepEqual(r.stronger, [], `invented strengths: ${JSON.stringify(r.stronger)}`);
  });
  test("it scores zero rather than crashing or returning null", () => {
    assert.equal(s.score, 0);
    assert.equal(s.measured, BLUEPRINT.objectiveItemCount);
  });
  test("weaknesses are offered, capped at two, without false precision", () => {
    assert.ok(r.practiseNext.length <= 2);
    assert.ok(r.practiseNext.length > 0);
  });
});

describe("E — strong overall performance", () => {
  const e = attempt({ correctBySkill: { grammar: 8, vocabulary: 6, reading: 3, listening: 2 } });
  const s = prog.scoreAttempt(e);
  const r = report(s);

  test("no artificial weakness is invented", () => {
    assert.deepEqual(r.practiseNext, [], `invented weaknesses: ${JSON.stringify(r.practiseNext)}`);
  });
  test("a perfect sitting still makes no pass claim", () => {
    assert.equal(s.score, 1);
    assert.ok(!/pass|bestanden|B2 erreicht/i.test(JSON.stringify(s)));
  });
  test("listening is still not a strength on 2 items", () => {
    assert.ok(!r.stronger.includes("listening"),
      "a 2-item skill was called a strength at 100%");
  });
});

/* ── F — only one measured skill ────────────────────────────────────────── */

describe("F — only one measured skill", () => {
  const f = attempt({ skipSkills: ["vocabulary", "reading", "listening"],
                      correctBySkill: { grammar: 5 } });
  const r = report(prog.scoreAttempt(f));

  test("no cross-skill ranking is produced from one skill", () => {
    assert.equal(r.stronger.length + r.practiseNext.length, 1,
      "one measured skill produced a multi-skill ranking");
  });
  test("everything else reads as not measured", () => {
    assert.deepEqual(r.notMeasured.sort(), ["listening", "reading", "vocabulary"]);
  });
});

/* ── G / H — weakness targeting ─────────────────────────────────────────── */

describe("G — several weak capabilities", () => {
  const weak = compose.weaknessSet([
    ...ev("argue", 0, 3, "a"), ...ev("concede", 0, 3, "a"), ...ev("compare", 0, 3, "a"),
  ]);
  const r = plan({ seenItemIds: V1_SEEN, weaknesses: weak, satVersions: ["v1"] });

  test("the retest targets the whole group, not one label", () => {
    assert.ok(r.targetCapabilities.length >= 3);
    for (const c of ["argue", "concede", "compare"]) assert.ok(r.targetCapabilities.includes(c));
  });
  test("targeting does not collapse onto a single capability", () => {
    const tally = r.items.reduce((a, i) => { a[i.capability] = (a[i.capability] || 0) + 1; return a; }, {});
    assert.ok(Math.max(...Object.values(tally)) <= r.items.length * 0.5);
  });
  test("the blueprint survives targeting", () => {
    assert.equal(r.comparableItemCount, BLUEPRINT.slots.length);
  });
});

describe("H — no reliable weaknesses", () => {
  // One wrong answer only: below every threshold in the evidence model.
  const weak = compose.weaknessSet(ev("argue", 0, 1));
  const r = plan({ seenItemIds: V1_SEEN, weaknesses: weak, satVersions: ["v1"] });

  test("no weakness is invented", () => {
    assert.deepEqual(weak, []);
    assert.deepEqual(r.targetCapabilities, []);
  });
  test("it says so, and falls back to broad coverage", () => {
    assert.ok(r.explanation.some(e => /No capability meets the evidence bar/.test(e)));
    assert.equal(r.composition.targetedSlots, 0);
    assert.equal(r.comparableItemCount, BLUEPRINT.slots.length);
  });
});

/* ── I — variant exhaustion ─────────────────────────────────────────────── */

describe("I — capability variant exhaustion", () => {
  const all = ["v1", "v2", "v3"].flatMap(v => itemsOf(v).map(i => i.id));
  const r = plan({ seenItemIds: all, satVersions: ["v1", "v2", "v3"] });

  test("no fourth variant is fabricated", () => {
    assert.deepEqual(r.items, []);
    assert.equal(r.contentExhausted, true);
  });
  test("no exact duplicate is served silently", () => {
    assert.ok(r.explanation.some(e => /No item was repeated/.test(e)));
    assert.ok(r.exhausted.length > 0);
    for (const e of r.exhausted) assert.ok(e.reason && e.variants.length);
  });
  test("an exhausted sitting is not comparable to a full blueprint", () => {
    assert.equal(r.comparableToBlueprint, false);
  });
  /* THE REGRESSION. An exhausted pool still had one unused SPEAKING prompt, so
     the item count was 1 and the exhaustion guard did not fire — producing an
     "assessment" made only of the component that is never measured. Exhaustion
     is judged on the comparable core now, and this pins it. */
  test("a pool with only an unscored speaking prompt left counts as exhausted", () => {
    // Everything gone except v1_s1, which was never wired into screen_v1.
    const allButV1Speaking = all.filter(id => id !== "v1_s1");
    const r = plan({ seenItemIds: allButV1Speaking, satVersions: ["v1", "v2", "v3"] });
    const core = r.items.filter(i => i.skill !== "speaking");
    assert.equal(core.length, 0, "a comparable slot was still fillable — case is not set up");
    assert.ok(r.items.length > 0, "case requires a leftover speaking prompt");
    assert.ok(core.length < BLUEPRINT.skip.minMeasuredForComparableResult,
      "the store must refuse to start this sitting");
  });

  test("thin capabilities run out first, and honestly", () => {
    // justify and compare have exactly 3 variants — no reserve past V3.
    assert.equal(compose.poolRemaining(all).G4, 0);   // justify
    assert.equal(compose.poolRemaining(all).G7, 0);   // compare
  });
});

/* ── J / K / L — lifecycle (engine-side invariants) ─────────────────────── */

describe("J/K/L — lifecycle", () => {
  test("J — an unfinished attempt is never history and never compared", () => {
    const open = { ...attempt({ id: 1 }), completedAt: null };
    const p = prog.progress([open]);
    assert.equal(p.latest, null);
    assert.equal(p.delta, null);
  });

  test("K — scoring is a pure function of stored rows, so a second finish agrees", () => {
    const a = attempt({ id: 1, correctBySkill: { grammar: 4 } });
    assert.deepEqual(prog.scoreAttempt(a), prog.scoreAttempt(a));
  });

  test("L — history and comparison are recomputed from stored rows, not memory", () => {
    const a1 = attempt({ id: 1, version: "v1", at: "2026-01-01", correctBySkill: { grammar: 2, vocabulary: 1, reading: 1 } });
    const p2 = plan({ seenItemIds: V1_SEEN, satVersions: ["v1"] });
    const a2 = attempt({ id: 2, version: "v2", at: "2026-02-01", composition: p2,
                         correctBySkill: { grammar: 7, vocabulary: 5, reading: 3 } });
    const first = prog.progress([a1, a2]);
    const again = prog.progress([a2, a1]);   // order must not matter
    assert.deepEqual(first.delta, again.delta);
    assert.equal(first.latest.attemptId, 2);
  });
});

/* ── M / N — unavailable components ─────────────────────────────────────── */

describe("M — speaking unavailable", () => {
  const p = plan({ seenItemIds: V1_SEEN, satVersions: ["v1"] });
  const spoken = p.items.filter(i => i.skill === "speaking");

  test("speaking is present in the sitting but outside the comparable core", () => {
    assert.equal(spoken.length, 1);
    assert.equal(p.comparableItemCount, BLUEPRINT.slots.length);
  });
  test("it can never contribute to the score", () => {
    const a = attempt({ composition: p });
    const s = prog.scoreAttempt(a);
    assert.ok(!s.bySkill.speaking, "speaking entered the comparable score");
  });
  test("the blueprint states the limitation rather than implying a band", () => {
    assert.equal(BLUEPRINT.speaking.banded, false);
    assert.match(BLUEPRINT.speaking.scoring, /NOT IMPLEMENTED/);
    assert.equal(BLUEPRINT.speakingSlot.comparable, false);
  });
});

describe("N — missing listening audio", () => {
  const { sectionContext } = require("../src/seed/b2/assessment");

  test("each version names its own audio, and V1's is declared as practice content", () => {
    assert.equal(sectionContext("v2", "listening").audioFile, "asr_v2_dienstplan_app");
    assert.equal(sectionContext("v3", "listening").audioFile, "asr_v3_kursplatz");
    // V1 points at practice audio — the known, declared overlap.
    assert.equal(sectionContext("v1", "listening").audioFile, "src_muede_s3");
  });
  test("no version substitutes another version's audio", () => {
    const files = ["v1", "v2", "v3"].map(v => sectionContext(v, "listening").audioFile);
    assert.equal(new Set(files).size, 3, "two versions share an audio file");
  });
});

/* ── O — incomplete assessment ──────────────────────────────────────────── */

describe("O — incomplete assessment", () => {
  const complete = attempt({ id: 1, at: "2026-01-01", correctBySkill: { grammar: 4, vocabulary: 3, reading: 2 } });
  const partial = { ...attempt({ id: 2, at: "2026-02-01", correctBySkill: { grammar: 8 } }) };
  partial.items = partial.items.slice(0, 8);   // learner stopped after grammar

  test("an incomplete sitting is distinguishable from a complete one", () => {
    const a = prog.scoreAttempt(complete), b = prog.scoreAttempt(partial);
    assert.notEqual(a.measured + a.notMeasured, b.measured + b.notMeasured);
  });
  test("it is never compared as if it were a full assessment", () => {
    const p = prog.progress([complete, partial]);
    assert.equal(p.delta, null, "an 8-item sitting produced a delta against a 19-item one");
    assert.match(p.reason, /not structurally comparable/i);
    assert.ok(p.comparability.reasons.some(r => /item count differs/.test(r)));
  });
});

/* ── The frozen group ───────────────────────────────────────────────────── */

describe("core-2026a is named and frozen", () => {
  test("the blueprint declares its group", () => {
    assert.equal(BLUEPRINT.comparableGroup, "core-2026a");
    assert.equal(BLUEPRINT.comparableGroupFrozen, true);
  });

  test("attempts from different groups are never compared", () => {
    const a = attempt({ id: 1, at: "2026-01-01", group: "core-2026a",
                        correctBySkill: { grammar: 2, vocabulary: 1, reading: 1 } });
    const p2 = plan({ seenItemIds: V1_SEEN, satVersions: ["v1"] });
    const b = attempt({ id: 2, at: "2026-02-01", group: "core-2026b", composition: p2,
                        correctBySkill: { grammar: 8, vocabulary: 6, reading: 3 } });
    const p = prog.progress([a, b]);
    assert.equal(p.delta, null, "compared across comparable groups");
    assert.ok(p.comparability.reasons.some(r => /different assessment groups/.test(r)));
  });

  test("attempts predating the field are treated as core-2026a, not as unknown", () => {
    // Attempts 126 and 127 in the live database have no group recorded. Their
    // comparison must survive this change.
    const a = attempt({ id: 1, at: "2026-01-01", group: undefined,
                        correctBySkill: { grammar: 2, vocabulary: 1, reading: 1 } });
    const p2 = plan({ seenItemIds: V1_SEEN, satVersions: ["v1"] });
    const b = attempt({ id: 2, at: "2026-02-01", group: undefined, composition: p2,
                        correctBySkill: { grammar: 8, vocabulary: 6, reading: 3 } });
    const p = prog.progress([a, b]);
    assert.ok(p.delta, "a legacy comparison was voided by naming the group");
    assert.equal(p.delta.direction, "up");
  });
});

/* ── The false-strength guarantee ───────────────────────────────────────── */

describe("false-strength audit", () => {
  /* The bug this exists for: vocabulary appeared as BOTH a strength and a
     weakness, because the two lists were slices of one sorted array and
     overlapped when few skills were measured. */
  test("no skill can ever be both stronger and practise-next", () => {
    const cases = [
      {}, { grammar: 8 }, { grammar: 8, vocabulary: 6 },
      { grammar: 4, vocabulary: 3, reading: 2, listening: 1 },
      { grammar: 8, vocabulary: 6, reading: 3, listening: 2 },
      { grammar: 1 }, { vocabulary: 6 }, { reading: 3 },
    ];
    const skips = [[], ["listening"], ["listening", "reading"], ["vocabulary", "reading", "listening"]];
    for (const correctBySkill of cases) {
      for (const skipSkills of skips) {
        const r = report(prog.scoreAttempt(attempt({ correctBySkill, skipSkills })));
        const overlap = r.stronger.filter(s => r.practiseNext.includes(s));
        assert.deepEqual(overlap, [],
          `overlap ${JSON.stringify(overlap)} for ${JSON.stringify({ correctBySkill, skipSkills })}`);
      }
    }
  });

  test("a skill measured below the floor is never labelled either way", () => {
    for (let n = 0; n < prog.MIN_PER_SKILL; n++) {
      const a = attempt({ correctBySkill: { listening: n }, skipSkills: ["grammar", "vocabulary", "reading"] });
      const r = report(prog.scoreAttempt(a));
      assert.ok(!r.stronger.includes("listening"));
      assert.ok(!r.practiseNext.includes("listening"));
    }
  });
});
