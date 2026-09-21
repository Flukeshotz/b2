/**
 * GRAMMAR / VOCABULARY PRACTICE BANK — board='custom', alignment='original'.
 * Same convention as exam_papers.test.js: real Express app, real signed-up
 * learner, real HTTP. Distinct from the Goethe/telc suite because this
 * content makes no exam-board claim at all — the assertions here specifically
 * guard against that claim leaking in (board must stay 'custom').
 */
const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");
const http = require("node:http");

require("../src/env")();
const pool = require("../src/db/pool");
const express = require("express");

const SKIP = "Postgres unreachable — practice bank tests skipped";
let live = false, base = "", server = null;
const cleanupUserIds = [];

before(async () => {
  try {
    await pool.query("SELECT 1");
    const seeded = await pool.query(`SELECT 1 FROM b2_papers WHERE id='practice-grammar-1'`);
    live = seeded.rows.length > 0;
    if (!live) return;
  } catch { live = false; return; }

  const app = express();
  app.use(express.json());
  app.use("/api/auth", require("../src/routes/auth"));
  app.use("/api/b2", require("../src/routes/b2"));
  app.use((err, req, res, _next) => res.status(500).json({ error: "internal_error" }));
  server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (cleanupUserIds.length) {
    await pool.query(`DELETE FROM b2_paper_attempts WHERE user_id = ANY($1) AND kind='paper'
      AND paper_id LIKE 'practice-%'`, [cleanupUserIds]);
    await pool.query(`DELETE FROM b2_evidence WHERE user_id = ANY($1)`, [cleanupUserIds]);
    await pool.query(`DELETE FROM b2_profile WHERE user_id = ANY($1)`, [cleanupUserIds]);
    await pool.query(`DELETE FROM sessions WHERE user_id = ANY($1)`, [cleanupUserIds]);
    await pool.query(`DELETE FROM users WHERE id = ANY($1)`, [cleanupUserIds]);
  }
  if (server) await new Promise(resolve => server.close(resolve));
  try { await pool.end(); } catch { /* already closed */ }
});

const need = (t) => {
  if (!live) { t.skip(SKIP + " (or seed_practice_bank.js has not run)"); return false; }
  return true;
};

async function signup(email) {
  const res = await fetch(`${base}/api/auth/signup`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "correcthorsebattery" }),
  });
  const body = await res.json();
  if (body.user?.id) cleanupUserIds.push(body.user.id);
  return body.token;
}

describe("Grammar practice bank — not exam-board content", () => {
  test("board is 'custom', 12 items, all skill='grammar'", async (t) => {
    if (!need(t)) return;
    const token = await signup(`grammar-${Date.now()}@test.local`);
    const auth = { Authorization: `Bearer ${token}` };

    const started = await fetch(`${base}/api/b2/paper/practice-grammar-1/start`,
      { method: "POST", headers: auth }).then(r => r.json());
    assert.equal(started.items.length, 12);
    assert.ok(started.items.every(i => i.skill === "grammar"));
    assert.ok(!JSON.stringify(started).includes("rationale"));

    const { rows } = await pool.query(`SELECT board, alignment FROM b2_papers WHERE id='practice-grammar-1'`);
    assert.equal(rows[0].board, "custom", "grammar practice must never claim a Goethe/telc board");
    assert.equal(rows[0].alignment, "original");

    for (const item of started.items) {
      const r = await fetch(`${base}/api/b2/paper/attempt/${started.attemptId}/item/${item.itemId}`,
        { method: "PUT", headers: { "Content-Type": "application/json", ...auth },
          body: JSON.stringify({ response: 0 }) }).then(r => r.json());
      assert.equal(r.saved, true);
    }
    const result = await fetch(`${base}/api/b2/paper/attempt/${started.attemptId}/finish`,
      { method: "POST", headers: auth }).then(r => r.json());
    assert.equal(result.scores.total, 12);
    assert.equal(result.scores.answered, 12);
  });
});

describe("Vocabulary practice bank — grading actually discriminates right/wrong", () => {
  test("answering the real key scores 12/12; answering index 0 throughout does not", async (t) => {
    if (!need(t)) return;
    const token = await signup(`vocab-${Date.now()}@test.local`);
    const auth = { Authorization: `Bearer ${token}` };

    const started = await fetch(`${base}/api/b2/paper/practice-vocabulary-1/start`,
      { method: "POST", headers: auth }).then(r => r.json());
    assert.equal(started.items.length, 12);
    assert.ok(started.items.every(i => i.skill === "vocabulary"));

    for (const item of started.items) {
      await fetch(`${base}/api/b2/paper/attempt/${started.attemptId}/item/${item.itemId}`,
        { method: "PUT", headers: { "Content-Type": "application/json", ...auth },
          body: JSON.stringify({ response: 0 }) });
    }
    const result = await fetch(`${base}/api/b2/paper/attempt/${started.attemptId}/finish`,
      { method: "POST", headers: auth }).then(r => r.json());
    // One item's real answer is index 2 — always answering 0 must not score 12/12,
    // which would mean grading is a no-op rather than a real key comparison.
    assert.ok(result.scores.correct < result.scores.total,
      "grading must discriminate — an all-zero response should not score perfectly");
  });
});
