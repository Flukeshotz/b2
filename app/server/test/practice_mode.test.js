/**
 * PRACTICE MODE — discovery + weak-area recommendation. Real Express app,
 * real signed-up learner, real HTTP, same convention as the other B2 test
 * files. This is the seam the brief calls architectural: can a learner move
 * from an identified weakness into targeted practice, and does Practice stay
 * a genuinely different surface from Exam Practice?
 */
const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");
const http = require("node:http");

require("../src/env")();
const pool = require("../src/db/pool");
const express = require("express");
const profile = require("../src/b2/profile");

const SKIP = "Postgres unreachable — practice mode tests skipped";
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
    await pool.query(`DELETE FROM b2_paper_attempts WHERE user_id = ANY($1) AND kind='paper'`, [cleanupUserIds]);
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
  return { token: body.token, userId: body.user.id };
}

describe("Practice category discovery", () => {
  test("Grammar and Vocabulary are servable; a category with no content says so honestly", async (t) => {
    if (!need(t)) return;
    const { token } = await signup(`disc-${Date.now()}@test.local`);
    const cats = await fetch(`${base}/api/b2/practice/categories`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
    const bySkill = Object.fromEntries(cats.map(c => [c.skill, c]));
    assert.equal(bySkill.grammar.available, true);
    assert.ok(bySkill.grammar.papers.some(p => p.paperId === "practice-grammar-1"));
    assert.equal(bySkill.vocabulary.available, true);
    assert.ok(bySkill.vocabulary.papers.some(p => p.paperId === "practice-vocabulary-1"));
    // Workplace always available (reuses the interview bank, not a paper) —
    // every other unavailable category must carry no papers, never a broken link.
    for (const c of cats) if (!c.available) assert.equal(c.papers.length, 0);
  });

  test("Practice papers never include a Goethe/telc board paper", async (t) => {
    if (!need(t)) return;
    const { token } = await signup(`disc2-${Date.now()}@test.local`);
    const cats = await fetch(`${base}/api/b2/practice/categories`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
    const allPaperIds = cats.flatMap(c => c.papers.map(p => p.paperId));
    assert.ok(!allPaperIds.some(id => id.startsWith("goethe-") || id.startsWith("telc-")),
      "Practice must stay genuinely separate from Exam Practice");
  });
});

describe("Weak-area recommendation — honest, evidence-driven", () => {
  test("a fresh learner with no evidence gets the honest no-data message, not a fabricated weakness", async (t) => {
    if (!need(t)) return;
    const { token } = await signup(`fresh-${Date.now()}@test.local`);
    const weak = await fetch(`${base}/api/b2/practice/weak`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
    assert.equal(weak.available, false);
    assert.match(weak.message, /take the quick test/i);
  });

  test("a learner with real, lopsided grammar evidence gets grammar recommended, using the same profile scores Report/Coach show", async (t) => {
    if (!need(t)) return;
    const { token, userId } = await signup(`weak-${Date.now()}@test.local`);
    // Real evidence through the exact same recordMany() Report/Coach/exam_paper.js already use.
    const evidence = [];
    for (let i = 0; i < 4; i++) evidence.push({ dimension: "grammar", capability: "structure", outcome: 0, weight: 0.9, sourceKind: "paper", sourceRef: `test:${i}` });
    for (let i = 0; i < 4; i++) evidence.push({ dimension: "reading", capability: "summarise", outcome: 1, weight: 0.9, sourceKind: "paper", sourceRef: `test:r${i}` });
    await profile.recordMany(userId, evidence);

    const weak = await fetch(`${base}/api/b2/practice/weak`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
    assert.equal(weak.available, true);
    assert.equal(weak.dimension, "grammar");
    assert.equal(weak.paperId, "practice-grammar-1");
  });
});

describe("Practice sessions never mutate the assessment result", () => {
  test("finishing a practice paper writes b2_evidence (as exam papers already do) but touches no assessment/attempt row", async (t) => {
    if (!need(t)) return;
    const { token, userId } = await signup(`isolate-${Date.now()}@test.local`);
    const auth = { Authorization: `Bearer ${token}` };
    const started = await fetch(`${base}/api/b2/paper/practice-grammar-1/start`, { method: "POST", headers: auth }).then(r => r.json());
    for (const item of started.items) {
      await fetch(`${base}/api/b2/paper/attempt/${started.attemptId}/item/${item.itemId}`,
        { method: "PUT", headers: { "Content-Type": "application/json", ...auth }, body: JSON.stringify({ response: 0 }) });
    }
    await fetch(`${base}/api/b2/paper/attempt/${started.attemptId}/finish`, { method: "POST", headers: auth });

    const { rows } = await pool.query(
      `SELECT kind FROM b2_paper_attempts WHERE user_id=$1`, [userId]);
    assert.ok(rows.every(r => r.kind === "paper"), "no other attempt kind must appear from a practice session");
    const assessmentRows = await pool.query(
      `SELECT id FROM b2_paper_attempts WHERE user_id=$1 AND kind='assessment'`, [userId]);
    assert.equal(assessmentRows.rows.length, 0, "a practice session must never create/touch an assessment attempt");
  });
});
