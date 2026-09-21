/**
 * THE ADAPTIVE LOOP, PROVEN.
 *
 * Two learners, different weaknesses, different goals. They must not receive the
 * same first recommendation — and after one of them completes an experience, her
 * NEXT recommendation must change because of what she just did.
 *
 * This is the proof the product works. Everything else is plumbing around it.
 *
 * Touches the real database, so it is skipped when one is not reachable rather
 * than failing a developer who is only running the unit suite.
 */

const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");

require("../src/env")();
const pool = require("../src/db/pool");
const profile = require("../src/b2/profile");

let live = false;
const A = { id: null, name: "__test_learner_A" };  // weak writing/concession, strong listening
const B = { id: null, name: "__test_learner_B" };  // strong writing, weak listening

before(async () => {
  try { await pool.query("SELECT 1"); live = true; } catch { return; }
  for (const u of [A, B]) {
    const found = await pool.query("SELECT id FROM users WHERE name=$1", [u.name]);
    u.id = found.rows[0]?.id
      || (await pool.query("INSERT INTO users (name) VALUES ($1) RETURNING id", [u.name])).rows[0].id;
    // Clean slate every run — a half-finished previous run must not decide this one.
    await pool.query("DELETE FROM b2_evidence WHERE user_id=$1", [u.id]);
    await pool.query("DELETE FROM b2_profile  WHERE user_id=$1", [u.id]);
  }
});

after(async () => {
  if (!live) return;
  for (const u of [A, B]) {
    if (!u.id) continue;
    await pool.query("DELETE FROM b2_evidence WHERE user_id=$1", [u.id]);
    await pool.query("DELETE FROM b2_profile  WHERE user_id=$1", [u.id]);
    await pool.query("DELETE FROM b2_learner_goal WHERE user_id=$1", [u.id]);
    await pool.query("DELETE FROM users WHERE id=$1", [u.id]);
  }
  await pool.end();
});

/* Skip has to be decided INSIDE the test body. node:test evaluates the options
   object when test() is called — which is at module load, before `before` has
   run — so a `{ skip: !live }` option is always computed against live===false
   and silently skips the entire suite. That is exactly how a proof quietly
   stops proving anything. */
const needsDb = (t) => { if (!live) { t.skip("no database reachable"); return true; } return false; };

/**
 * Simulates a screening the way the real one behaves: SEVERAL items per
 * dimension, each its own occasion.
 *
 * An earlier version wrote one item per dimension, which is not what the
 * product does — the real screening emits eight grammar items, six vocabulary,
 * three reading, two listening and seven writing check-findings. Once bands
 * required enough evidence to support them, that thin fixture stopped producing
 * bands at all, and the tests failed for the fixture's reasons rather than the
 * system's. Tests that pass on evidence the product never generates are not
 * testing the product.
 */
async function screen(userId, { writing, grammar, vocabulary, listening, reading }) {
  const spread = (dimension, outcome, n, checkId) =>
    Array.from({ length: n }, (_, i) => ({
      dimension, outcome, checkId, sourceKind: "screening",
      sourceRef: `screen_v1:${dimension}${i}`,
    }));
  await profile.recordMany(userId, [
    ...spread("writing", writing, 4, "connector_range"),
    ...spread("grammar", grammar, 4, "konjunktiv2"),
    ...spread("vocabulary", vocabulary, 3, "lexical_range"),
    ...spread("listening", listening, 3),
    ...spread("reading", reading, 3),
  ]);
}

describe("B2 — the adaptive loop", () => {
  test("bands come out of screening, and they differ per learner", async (t) => {
    if (needsDb(t)) return;
    await profile.setGoal(A.id, { goal: "anerkennung" });
    await profile.setGoal(B.id, { goal: "exam", board: "goethe" });

    // A: writing is the problem, listening is fine.
    await screen(A.id, { writing: 0.25, grammar: 0.45, vocabulary: 0.5, listening: 0.9, reading: 0.8 });
    // B: the mirror image.
    await screen(B.id, { writing: 0.88, grammar: 0.8, vocabulary: 0.75, listening: 0.3, reading: 0.55 });

    const pa = Object.fromEntries((await profile.getProfile(A.id)).map(p => [p.dimension, p.band]));
    const pb = Object.fromEntries((await profile.getProfile(B.id)).map(p => [p.dimension, p.band]));

    assert.equal(pa.writing, "needs_practice", "A's writing should band low");
    assert.equal(pa.listening, "strong", "A's listening should band high");
    assert.equal(pb.writing, "strong", "B's writing should band high");
    assert.equal(pb.listening, "needs_practice", "B's listening should band low");

    // After a screening alone, every band is HEDGED — one occasion, one format.
    const la = await profile.getProfile(A.id);
    for (const d of ["writing", "listening"]) {
      const row = la.find(x => x.dimension === d);
      // A single screening is SCREENING_SIGNAL — hedged, and internally
      // distinct from evidence accumulated across occasions.
      assert.equal(row.evidence_state, "screening_signal",
        `${d} claimed "${row.evidence_state}" off a single screening`);
      assert.match(row.label, /so far$/, `${d} was stated without a hedge: "${row.label}"`);
    }
  });

  test("speaking is never banded from screening — it is collected, not scored", async (t) => {
    if (needsDb(t)) return;
    const pa = await profile.getProfile(A.id);
    const sp = pa.find(p => p.dimension === "speaking");
    assert.equal(sp.band, null, "speaking must not carry a band until it is calibrated");
    assert.equal(sp.indicative, true);
  });

  test("THE PROOF — two learners, two different first recommendations", async (t) => {
    if (needsDb(t)) return;
    const recA = await profile.nextAction(A.id);
    const recB = await profile.nextAction(B.id);

    assert.ok(recA, "A got no recommendation at all");
    assert.ok(recB, "B got no recommendation at all");

    // The whole point. Same content library, different learner, different answer.
    assert.notEqual(recA.experienceId, recB.experienceId,
      `both learners were sent to "${recA.experienceId}" — the system is not personalising`);

    // And each is sent at their actual weakness.
    assert.equal(recA.kind, "writing", `A is weakest at writing but was sent to ${recA.kind}`);
    assert.equal(recB.kind, "listening", `B is weakest at listening but was sent to ${recB.kind}`);
  });

  test("every recommendation carries a reason the learner can read", async (t) => {
    if (needsDb(t)) return;
    for (const u of [A, B]) {
      const rec = await profile.nextAction(u.id);
      assert.ok(rec.reason && rec.reason.length > 8, "no reason given");
      // Never leak internal vocabulary into something a learner reads.
      assert.doesNotMatch(rec.reason, /check_id|connector_range|konjunktiv2|b2_|outcome|weight/i,
        `internal vocabulary leaked into a learner-facing reason: "${rec.reason}"`);
      assert.ok(rec.minutes > 0, "no duration — the one fact that decides whether she starts");
    }
  });

  test("the goal changes the answer, not just the profile", async (t) => {
    if (needsDb(t)) return;
    // Same evidence as A, but chasing a job rather than recognition. A job
    // hunter's load-bearing skills are speaking and listening, not writing.
    const found = await pool.query("SELECT id FROM users WHERE name='__test_learner_C'");
    const cid = found.rows[0]?.id
      || (await pool.query("INSERT INTO users (name) VALUES ('__test_learner_C') RETURNING id")).rows[0].id;
    try {
      await pool.query("DELETE FROM b2_evidence WHERE user_id=$1", [cid]);
      await pool.query("DELETE FROM b2_profile WHERE user_id=$1", [cid]);
      await profile.setGoal(cid, { goal: "job" });
      await screen(cid, { writing: 0.25, grammar: 0.45, vocabulary: 0.5, listening: 0.35, reading: 0.8 });

      const recC = await profile.nextAction(cid);
      // C's writing is as weak as A's, but writing is not what a job turns on.
      assert.notEqual(recC.kind, "writing",
        "a job-seeker with weak writing AND weak listening was still sent to writing — goal is being ignored");
      assert.equal(recC.kind, "listening");
    } finally {
      await pool.query("DELETE FROM b2_evidence WHERE user_id=$1", [cid]);
      await pool.query("DELETE FROM b2_profile WHERE user_id=$1", [cid]);
      await pool.query("DELETE FROM b2_learner_goal WHERE user_id=$1", [cid]);
      await pool.query("DELETE FROM users WHERE id=$1", [cid]);
    }
  });

  test("THE SECOND PROOF — completing an experience changes what comes next", async (t) => {
    if (needsDb(t)) return;
    const before = await profile.nextAction(B.id);
    assert.equal(before.kind, "listening");

    // B does the listening experience and does well.
    await profile.record(B.id, {
      dimension: "listening", outcome: 0.92, sourceKind: "experience",
      sourceRef: before.experienceId, capability: "understand_speech",
    });

    const after = await profile.nextAction(B.id);
    assert.notEqual(after.experienceId, before.experienceId,
      "the same experience was recommended again after completing it");

    // Her listening band should have moved off the floor.
    const p = await profile.getProfile(B.id);
    const listening = p.find(x => x.dimension === "listening");
    assert.notEqual(listening.band, "needs_practice",
      "listening band did not move despite a strong performance");
  });

  test("a weak performance routes to the capability it exposed", async (t) => {
    if (needsDb(t)) return;
    // A writes badly and fails connector_range — the concession detector.
    await profile.record(A.id, {
      dimension: "writing", outcome: 0.2, sourceKind: "submission",
      checkId: "connector_range", sourceRef: "sub_test_1",
      detail: "Kein konzessiver Konnektor.",
    });
    const rec = await profile.nextAction(A.id);
    // concede or argue both legitimately answer connector_range; either is a
    // correct route, and neither is a coincidence.
    assert.ok(["concede", "argue", "justify"].includes(rec.capability),
      `expected a routing to the argumentation cluster, got "${rec.capability}"`);
  });

  test("recency beats history — old evidence stops deciding", async (t) => {
    if (needsDb(t)) return;
    // Five strong listening results in a row must outweigh the weak screening.
    for (let i = 0; i < 5; i++) {
      await profile.record(B.id, { dimension: "listening", outcome: 0.95, sourceKind: "experience", sourceRef: `x${i}` });
    }
    const p = await profile.getProfile(B.id);
    const l = p.find(x => x.dimension === "listening");
    assert.equal(l.band, "strong", "recent strong performance did not override an old weak screening");
    assert.equal(l.trend, "up", "trend should register the improvement");
  });
});
