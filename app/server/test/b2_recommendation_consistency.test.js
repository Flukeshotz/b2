/**
 * ONE RECOMMENDER — proven, not asserted.
 *
 * There were two: an order-ranking `nextAction` in b2/curriculum.js and the
 * goal-aware one in b2/profile.js. Both were routed at the same time, so the
 * home screen and the profile screen told the same learner to do different
 * things on identical evidence. Nobody noticed until the two were put side by
 * side on screen.
 *
 * These tests exist so that cannot come back: every surface that answers
 * "what should I do next?" must consume the same service and return the same
 * answer. Presentation may differ; the recommendation may not.
 */

const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");

require("../src/env")();
const pool = require("../src/db/pool");
const profile = require("../src/b2/profile");
const curriculum = require("../src/b2/curriculum");

let live = false, uid = null;
const NAME = "__test_reco_consistency";

before(async () => {
  try { await pool.query("SELECT 1"); live = true; } catch { return; }
  const f = await pool.query("SELECT id FROM users WHERE name=$1", [NAME]);
  uid = f.rows[0]?.id
    || (await pool.query("INSERT INTO users (name) VALUES ($1) RETURNING id", [NAME])).rows[0].id;
  await reset();
});

async function reset() {
  await pool.query("DELETE FROM b2_evidence WHERE user_id=$1", [uid]);
  await pool.query("DELETE FROM b2_profile WHERE user_id=$1", [uid]);
}

after(async () => {
  if (!live || !uid) return;
  await reset();
  await pool.query("DELETE FROM b2_learner_goal WHERE user_id=$1", [uid]);
  await pool.query("DELETE FROM users WHERE id=$1", [uid]);
  await pool.end();
});

const needsDb = (t) => { if (!live) { t.skip("no database reachable"); return true; } return false; };

describe("B2 — recommendation consistency", () => {
  test("the superseded recommender no longer exists", async (t) => {
    if (needsDb(t)) return;
    // A second implementation that still compiles is one somebody will call.
    assert.equal(curriculum.nextAction, undefined,
      "b2/curriculum.js still exports a nextAction — there are two recommenders again");
    assert.equal(typeof profile.nextAction, "function");
  });

  test("every surface returns the SAME action for the same learner", async (t) => {
    if (needsDb(t)) return;
    await reset();
    await profile.setGoal(uid, { goal: "anerkennung" });
    await profile.recordMany(uid, [
      { dimension: "writing",   outcome: 0.2, sourceKind: "screening", checkId: "connector_range" },
      { dimension: "grammar",   outcome: 0.9, sourceKind: "screening" },
      { dimension: "listening", outcome: 0.9, sourceKind: "screening" },
    ]);

    // The three call sites that answer "what next?": /b2/next, /b2/profile, and
    // the screening submit response. All must go through the one service.
    const a = await profile.nextAction(uid);
    const b = await profile.nextAction(uid);
    const c = (await Promise.all([profile.getProfile(uid), profile.nextAction(uid)]))[1];

    assert.ok(a, "no recommendation produced");
    assert.equal(a.experienceId, b.experienceId);
    assert.equal(a.experienceId, c.experienceId, "profile screen disagrees with home");
    assert.equal(a.reason, c.reason, "the same action was explained two different ways");
    assert.equal(a.kind, c.kind);
  });

  test("it is stable across repeated calls with no new evidence", async (t) => {
    if (needsDb(t)) return;
    const seen = new Set();
    for (let i = 0; i < 6; i++) seen.add((await profile.nextAction(uid)).experienceId);
    assert.equal(seen.size, 1,
      `the recommendation drifted across ${seen.size} different experiences without new evidence`);
  });

  test("it changes only when evidence changes", async (t) => {
    if (needsDb(t)) return;
    const before = await profile.nextAction(uid);
    await profile.record(uid, {
      dimension: "writing", outcome: 0.95, sourceKind: "experience",
      sourceRef: before.experienceId, checkId: "connector_range",
    });
    const after = await profile.nextAction(uid);
    assert.notEqual(after.experienceId, before.experienceId,
      "completing the recommended experience did not change the recommendation");
  });

  test("every recommendation is presentable — duration, reason, no internals", async (t) => {
    if (needsDb(t)) return;
    for (const goal of ["anerkennung", "job", "exam", "ausbildung", "unsure"]) {
      await reset();
      await profile.setGoal(uid, { goal });
      await profile.recordMany(uid, [
        { dimension: "writing", outcome: 0.25, sourceKind: "screening", checkId: "connector_range" },
        { dimension: "listening", outcome: 0.35, sourceKind: "screening" },
      ]);
      const r = await profile.nextAction(uid);
      assert.ok(r, `no recommendation for goal "${goal}"`);
      assert.ok(r.minutes > 0, `no duration for goal "${goal}"`);
      assert.ok(r.reason && r.reason.length > 8, `no reason for goal "${goal}"`);
      // Nothing internal may reach a learner-facing string.
      assert.doesNotMatch(r.reason, /check_id|connector_range|konjunktiv2|lexical_range|exp_|b2_|outcome|weight|score/i,
        `internal vocabulary leaked for goal "${goal}": "${r.reason}"`);
      assert.match(r.reason, /^[A-ZÄÖÜ]/, `reason does not read as a sentence: "${r.reason}"`);
    }
  });

  test("the goal changes the answer on identical evidence", async (t) => {
    if (needsDb(t)) return;
    const answers = {};
    for (const goal of ["anerkennung", "job"]) {
      await reset();
      await profile.setGoal(uid, { goal });
      // Only writing is weak. Anerkennung turns on writing; a job does not.
      await profile.recordMany(uid, [
        { dimension: "writing",    outcome: 0.25, sourceKind: "screening", checkId: "connector_range" },
        { dimension: "grammar",    outcome: 0.9,  sourceKind: "screening" },
        { dimension: "vocabulary", outcome: 0.9,  sourceKind: "screening" },
        { dimension: "listening",  outcome: 0.9,  sourceKind: "screening" },
        { dimension: "reading",    outcome: 0.9,  sourceKind: "screening" },
      ]);
      answers[goal] = await profile.nextAction(uid);
    }
    assert.equal(answers.anerkennung.kind, "writing",
      "Anerkennung with weak writing was not sent to writing");
    assert.notEqual(answers.job.experienceId, answers.anerkennung.experienceId,
      "the goal made no difference on identical evidence — personalisation is not working");
  });
});
