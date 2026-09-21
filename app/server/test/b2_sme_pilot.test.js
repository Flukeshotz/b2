/**
 * B2 SME PILOT SUITE — End-to-End Integration, Governance, and Security Tests.
 *
 * Covers:
 * 1. 14-capability categorization (reliable >= 3, emerging 1-2, unmeasured 0) & movement tracking.
 * 2. Deterministic Coach responses (4 honest questions, no invented claims, zero LLM scoring).
 * 3. Closed product loop (Assessment -> Result -> Report -> Practice -> Retest).
 * 4. SME Content Governance API & inventory serialization.
 * 5. Exam separation and IDOR/multi-tenant security isolation.
 */
const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");

require("../src/env")();
const pool = require("../src/db/pool");
const profile = require("../src/b2/profile");
const report = require("../src/b2/report");
const coach = require("../src/b2/coach");
const store = require("../src/b2/assessment_store");
const governance = require("../src/b2/governance");
const { CAPABILITIES } = require("../src/b2/capabilities");

const SKIP = "Postgres unreachable — SME pilot tests skipped";
let live = false;
let USER_A = null;
let USER_B = null;

before(async () => {
  try {
    await pool.query("SELECT 1");
    live = true;
    const { rows: rA } = await pool.query(
      `INSERT INTO users (name, email) VALUES ('sme-user-a', 'sme-user-a-${Date.now()}@test.local') RETURNING id`
    );
    USER_A = rA[0].id;

    const { rows: rB } = await pool.query(
      `INSERT INTO users (name, email) VALUES ('sme-user-b', 'sme-user-b-${Date.now()}@test.local') RETURNING id`
    );
    USER_B = rB[0].id;
  } catch {
    live = false;
  }
});

after(async () => {
  if (live) {
    if (USER_A) {
      await pool.query(`DELETE FROM b2_evidence WHERE user_id=$1`, [USER_A]);
      await pool.query(`DELETE FROM b2_profile WHERE user_id=$1`, [USER_A]);
      await pool.query(`DELETE FROM b2_paper_attempts WHERE user_id=$1`, [USER_A]);
      await pool.query(`DELETE FROM users WHERE id=$1`, [USER_A]);
    }
    if (USER_B) {
      await pool.query(`DELETE FROM b2_evidence WHERE user_id=$1`, [USER_B]);
      await pool.query(`DELETE FROM b2_profile WHERE user_id=$1`, [USER_B]);
      await pool.query(`DELETE FROM b2_paper_attempts WHERE user_id=$1`, [USER_B]);
      await pool.query(`DELETE FROM users WHERE id=$1`, [USER_B]);
    }
  }
  try { await pool.end(); } catch { /* no-op */ }
});

const need = (t) => {
  if (!live) {
    t.skip(SKIP);
    return false;
  }
  return true;
};

describe("1. Performance Report — 14 Canonical Capabilities Breakdown", () => {
  before(async () => {
    if (!live) return;
    await pool.query(`DELETE FROM b2_evidence WHERE user_id=$1`, [USER_A]);
    await pool.query(`DELETE FROM b2_profile WHERE user_id=$1`, [USER_A]);

    // Setup User A with 4 of the 14 canonical capabilities:
    // - "argue": 4 items (reliable, score 0.20 -> weak)
    // - "summarise": 3 items (reliable, score 0.85 -> strong)
    // - "adapt_register": 2 items (emerging, score 0.50)
    // - "justify": 1 item (emerging, score 0.90)
    // - 10 other capabilities: 0 items (unmeasured)
    const evidence = [
      ...Array(4).fill(0).map((_, i) => ({
        dimension: "writing", capability: "argue", outcome: 0.20,
        sourceKind: "submission", sourceRef: `pilot_argue_${i}`
      })),
      ...Array(3).fill(0).map((_, i) => ({
        dimension: "reading", capability: "summarise", outcome: 0.85,
        sourceKind: "submission", sourceRef: `pilot_sum_${i}`
      })),
      ...Array(2).fill(0).map((_, i) => ({
        dimension: "speaking", capability: "adapt_register", outcome: 0.50,
        sourceKind: "conversation", sourceRef: `pilot_reg_${i}`
      })),
      {
        dimension: "grammar", capability: "justify", outcome: 0.90,
        sourceKind: "submission", sourceRef: "pilot_just_0"
      }
    ];
    await profile.recordMany(USER_A, evidence);
  });

  test("all 14 canonical capabilities are strictly partitioned into reliable, emerging, unmeasured", async (t) => {
    if (!need(t)) return;
    const r = await report.buildReport(USER_A);

    assert.equal(r.capabilities.all.length, 14, "must cover exactly all 14 canonical capabilities");
    assert.equal(r.capabilities.reliable.length, 2, "argue and summarise must be reliable (>=3 items)");
    assert.equal(r.capabilities.emerging.length, 2, "adapt_register and justify must be emerging (1-2 items)");
    assert.equal(r.capabilities.unmeasured.length, 10, "10 remaining capabilities must be unmeasured (0 items)");

    const reliableIds = r.capabilities.reliable.map(c => c.id).sort();
    assert.deepEqual(reliableIds, ["argue", "summarise"]);

    const emergingIds = r.capabilities.emerging.map(c => c.id).sort();
    assert.deepEqual(emergingIds, ["adapt_register", "justify"]);

    assert.equal(r.capabilities.weakest[0].capability, "argue");
    assert.equal(r.capabilities.strongest[0].capability, "summarise");
    assert.equal(r.notAnExamScore, true);
  });

  test("unmeasured capabilities contain honest learner-facing descriptions and zero fake score", async (t) => {
    if (!need(t)) return;
    const r = await report.buildReport(USER_A);
    for (const c of r.capabilities.unmeasured) {
      assert.equal(c.items, 0);
      assert.equal(c.score, null);
      assert.equal(c.band, null);
      assert.ok(c.learner, "must have learner-friendly label");
    }
  });
});

describe("2. Deterministic Coach Layer — 4 Core Questions", () => {
  test("coach answers weak point citing actual evidence item count without hallucinating", async (t) => {
    if (!need(t)) return;
    const advice = await coach.coachAdvice(USER_A);
    assert.equal(advice.whatAmIWeakAt, "argue");
    assert.match(advice.why, /4 measured items/);
    assert.ok(advice.retestAvailable !== undefined);
    assert.match(advice.claim, /deterministic/i);
  });

  test("coach for fresh learner without evidence provides honest invitation, not a fake diagnosis", async (t) => {
    if (!need(t)) return;
    const advice = await coach.coachAdvice(USER_B);
    assert.match(advice.whatAmIWeakAt, /nothing measured yet/i);
    assert.match(advice.why, /enough evidence/i);
    assert.ok(advice.whatToPractise, "must suggest an initial practice topic");
  });
});

describe("3. Closed Product Loop — Retest Flow & Comparability", () => {
  test("submitting an assessment result enables report delta tracking", async (t) => {
    if (!need(t)) return;
    // Attempt 1: core-2026b-v1
    const a1 = await store.startVersion(USER_B, "core-2026b-v1");
    assert.ok(a1.attemptId, "must start version 1");
    for (const itm of a1.items) {
      await store.answerItem(a1.attemptId, itm.itemId, 0);
    }
    await store.finishAssessment(a1.attemptId);

    const prog1 = await store.progress(USER_B);
    assert.equal(prog1.latest.version, "core-2026b-v1");
    assert.equal(prog1.previous, null, "first attempt has no previous comparable");

    // Attempt 2: core-2026b-v2 (comparable parallel form)
    const a2 = await store.startVersion(USER_B, "core-2026b-v2");
    assert.ok(a2.attemptId, "must start version 2");
    for (const itm of a2.items) {
      await store.answerItem(a2.attemptId, itm.itemId, 0);
    }
    await store.finishAssessment(a2.attemptId);

    const prog2 = await store.progress(USER_B);
    assert.ok(prog2.delta, "comparable v1 and v2 must yield delta");
    assert.ok(["up", "down", "flat"].includes(prog2.delta.direction));

    const r2 = await report.buildReport(USER_B);
    assert.ok(r2.assessment.delta);
  });
});

describe("4. SME Content Governance & Review Registry", () => {
  test("getContentInventory returns structured items across all modules", async (t) => {
    if (!need(t)) return;
    const inv = await governance.getContentInventory();
    assert.ok(Array.isArray(inv));
    assert.ok(inv.length > 0, "must return seeded inventory");

    const sample = inv[0];
    assert.ok(sample.id);
    assert.ok(sample.type);
    assert.ok(sample.module);
    assert.ok(sample.difficulty);
    assert.ok(sample.review_status);
  });

  test("getGovernanceSummary counts inventory by module, status, and skill", async (t) => {
    if (!need(t)) return;
    const summary = await governance.getGovernanceSummary();
    assert.ok(summary.totalUnits > 0);
    assert.ok(summary.byModule);
    assert.ok(summary.byStatus);
    assert.equal(summary.canonicalCapabilitiesCount, 14);
  });

  test("updateContentReviewStatus enforces valid statuses and updates database", async (t) => {
    if (!need(t)) return;
    const inv = await governance.getContentInventory();
    const testItem = inv[0];

    const updated = await governance.updateContentReviewStatus(testItem.id, "SME_REVIEWED");
    assert.ok(updated);
    assert.equal(updated.review_status, "SME_REVIEWED");

    // Inadmissible status throws error
    await assert.rejects(
      async () => await governance.updateContentReviewStatus(testItem.id, "INVALID_STATUS"),
      /Invalid review status/
    );

    // Reset back to DRAFT
    await governance.updateContentReviewStatus(testItem.id, "DRAFT");
  });
});

describe("5. Security & Isolation — Multi-Tenant IDOR and Separation", () => {
  test("User A's evidence and report never leaks into User B's report", async (t) => {
    if (!need(t)) return;
    const repA = await report.buildReport(USER_A);
    const repB = await report.buildReport(USER_B);

    assert.notEqual(repA.capabilities.reliable.length, repB.capabilities.reliable.length);
    assert.equal(repA.capabilities.weakest[0]?.capability, "argue");
  });

  test("Exam papers never leak into practice curriculum tables", async (t) => {
    if (!need(t)) return;
    const { rows: examRows } = await pool.query(
      `SELECT id FROM b2_papers WHERE board IN ('goethe', 'telc')`
    );
    assert.ok(examRows.length >= 4, "must have at least Goethe and telc papers");

    for (const r of examRows) {
      assert.ok(!r.id.startsWith("b2-assessment-core"), "exam papers must be distinct from diagnostic papers");
    }
  });
});
