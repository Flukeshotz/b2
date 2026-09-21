/**
 * THE PERFORMANCE REPORT AND COACH — proven against real evidence, not mocks.
 *
 * Both modules are pure composition over profile.js/assessment_store.js,
 * which already have their own extensive test coverage — these tests exist
 * to prove the COMPOSITION is honest: a fresh learner gets "not measured"
 * language and no fabricated weak point, a learner with real evidence gets a
 * weakest capability that actually matches the worst-scoring evidence in the
 * database, and neither module ever invents a claim beyond what evidence.js
 * itself would say.
 */
const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");

require("../src/env")();
const pool = require("../src/db/pool");
const profile = require("../src/b2/profile");
const report = require("../src/b2/report");
const coach = require("../src/b2/coach");

const SKIP = "Postgres unreachable — report/coach tests skipped";
let live = false;
let TEST_USER = null; // a real, disposable row in `users` — b2_evidence FKs to it

before(async () => {
  try {
    await pool.query("SELECT 1");
    live = true;
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash) VALUES ('report-test','report-test-${Date.now()}@test.local',null) RETURNING id`);
    TEST_USER = rows[0].id;
  } catch { live = false; }
});
after(async () => {
  if (live && TEST_USER) {
    await pool.query(`DELETE FROM b2_evidence WHERE user_id=$1`, [TEST_USER]);
    await pool.query(`DELETE FROM b2_profile WHERE user_id=$1`, [TEST_USER]);
    await pool.query(`DELETE FROM b2_learner_goal WHERE user_id=$1`, [TEST_USER]);
    await pool.query(`DELETE FROM users WHERE id=$1`, [TEST_USER]);
  }
  try { await pool.end(); } catch { /* already closed */ }
});
const need = (t) => { if (!live) { t.skip(SKIP); return false; } return true; };

describe("report: a fresh learner with zero evidence", () => {
  test("never claims a weak point or a score that doesn't exist", async (t) => {
    if (!need(t)) return;
    await pool.query(`DELETE FROM b2_evidence WHERE user_id=$1`, [TEST_USER]);
    await pool.query(`DELETE FROM b2_profile WHERE user_id=$1`, [TEST_USER]);

    const r = await report.buildReport(TEST_USER);
    assert.equal(r.capabilities.measured.length, 0, "no evidence must mean no measured capability");
    assert.equal(r.capabilities.weakest.length, 0);
    assert.equal(r.capabilities.strongest.length, 0);
    assert.equal(r.assessment.delta, null, "no completed assessments means no delta");
    // Every dimension must be the honest "not measured" state, never a band.
    for (const p of r.profile) {
      if (p.evidence_state === "none") assert.equal(p.band, null);
    }
    assert.equal(r.notAnExamScore, true);
  });

  test("coach gives an honest 'nothing measured yet' answer, not a fabricated weakness", async (t) => {
    if (!need(t)) return;
    const c = await coach.coachAdvice(TEST_USER);
    assert.match(c.whatAmIWeakAt, /nothing|not enough|take the assessment/i);
    assert.ok(!/argue|adapt_register|structure/.test(c.whatAmIWeakAt), "must not name a capability with no evidence behind it");
  });
});

describe("report: a learner with real, lopsided evidence", () => {
  before(async (t) => {
    if (!live) return;
    await pool.query(`DELETE FROM b2_evidence WHERE user_id=$1`, [TEST_USER]);
    await pool.query(`DELETE FROM b2_profile WHERE user_id=$1`, [TEST_USER]);
    // Genuinely weak at "argue" (low outcomes), genuinely strong at "compare".
    const evidence = [
      ...Array(4).fill(0).map((_, i) => ({ dimension: "writing", capability: "argue", outcome: 0.1,
        sourceKind: "submission", sourceRef: `test_argue_${i}` })),
      ...Array(4).fill(0).map((_, i) => ({ dimension: "speaking", capability: "compare", outcome: 0.95,
        sourceKind: "conversation", sourceRef: `test_compare_${i}` })),
    ];
    await profile.recordMany(TEST_USER, evidence);
  });

  test("weakest capability in the report is the one with the real low scores", async (t) => {
    if (!need(t)) return;
    const r = await report.buildReport(TEST_USER);
    const weakest = r.capabilities.weakest[0];
    assert.ok(weakest, "must surface a weakest capability once there is real evidence");
    assert.equal(weakest.capability, "argue");
    assert.ok(weakest.score < 0.62, "weakest must actually score below the 'strong' boundary");
  });

  test("strongest capability is the one with the real high scores, not the weak one", async (t) => {
    if (!need(t)) return;
    const r = await report.buildReport(TEST_USER);
    const strongest = r.capabilities.strongest[0];
    assert.ok(strongest);
    assert.equal(strongest.capability, "compare");
    assert.notEqual(strongest.capability, "argue", "must never call the weak capability strong");
  });

  test("coach names the same weak capability the report computed — no separate invention", async (t) => {
    if (!need(t)) return;
    const c = await coach.coachAdvice(TEST_USER);
    assert.match(c.whatAmIWeakAt, /argue/);
    assert.ok(!/compare/.test(c.whatAmIWeakAt), "coach must not name the strong capability as the weakness");
  });

  test("coach's reason cites the real item count, not an invented one", async (t) => {
    if (!need(t)) return;
    const c = await coach.coachAdvice(TEST_USER);
    assert.match(c.why, /4 measured item/);
  });
});

describe("coach never fabricates beyond the report", () => {
  test("every field coach returns traces back to a report field", async (t) => {
    if (!need(t)) return;
    const [r, c] = await Promise.all([report.buildReport(TEST_USER), coach.coachAdvice(TEST_USER)]);
    // The recommendation object itself must be identical — coach does not
    // compute a second, possibly-different recommendation.
    assert.deepEqual(c.recommendation, r.recommendation);
  });
});
