/**
 * READING / WRITING PRACTICE DEPTH — practice-reading-3..30 and
 * practice-writing-3..30 (seed_reading_bank.js / seed_writing_bank.js).
 * Same convention as practice_bank.test.js / practice_mode.test.js: real
 * Express app, real signed-up learner, real HTTP.
 */
const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");
const http = require("node:http");

require("../src/env")();
const pool = require("../src/db/pool");
const express = require("express");
const profile = require("../src/b2/profile");
const contentModel = require("../src/b2/content_model");

const SKIP = "Postgres unreachable — reading/writing depth tests skipped";
let live = false, base = "", server = null;
const cleanupUserIds = [];

before(async () => {
  try {
    await pool.query("SELECT 1");
    const seeded = await pool.query(`SELECT 1 FROM b2_papers WHERE id='practice-reading-30'`);
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
  if (!live) { t.skip(SKIP + " (or seed_reading_bank.js/seed_writing_bank.js has not run)"); return false; }
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

/* ══════════════════════════════════════════════════════════════════════
   READING
   ══════════════════════════════════════════════════════════════════════ */

describe("Reading practice depth — corpus discovery", () => {
  test("categories() reports 30+ reading experiences, including the new ones", async (t) => {
    if (!need(t)) return;
    const { token } = await signup(`read-disc-${Date.now()}@test.local`);
    const cats = await fetch(`${base}/api/b2/practice/categories`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
    const reading = cats.find(c => c.skill === "reading");
    assert.ok(reading.available);
    assert.ok(reading.papers.length >= 30, `expected 30+ reading papers, got ${reading.papers.length}`);
    assert.ok(reading.papers.some(p => p.paperId === "practice-reading-30"));
  });

  test("reading practice never selects a core-2026b diagnostic paper or a Goethe/telc paper", async (t) => {
    if (!need(t)) return;
    const { token } = await signup(`read-sep-${Date.now()}@test.local`);
    const cats = await fetch(`${base}/api/b2/practice/categories`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
    const reading = cats.find(c => c.skill === "reading");
    for (const p of reading.papers) {
      assert.ok(!p.paperId.startsWith("core-2026b"), `${p.paperId} must not be a diagnostic paper`);
      assert.ok(!/^goethe-|^telc-/.test(p.paperId), `${p.paperId} must not be an exam-board paper`);
    }
  });
});

describe("Reading practice depth — required metadata and answer keys", () => {
  test("every practice-reading-3..30 item has a difficulty, a capability valid for reading, and a rationale", async (t) => {
    if (!need(t)) return;
    const { rows } = await pool.query(`
      SELECT i.item_type, i.difficulty, i.capability, i.rationale, i.options, i.answer, i.answer_payload, p.id AS paper_id
      FROM b2_paper_items i
      JOIN b2_paper_sections s ON s.id = i.section_id
      JOIN b2_papers p ON p.id = s.paper_id
      WHERE p.id ~ '^practice-reading-([3-9]|[12][0-9]|30)$'`);
    assert.ok(rows.length > 0, "expected reading depth-pass items to exist");

    const READING_CAPABILITIES = new Set([
      "argue", "justify", "concede", "compare", "speculate",
      "exemplify", "structure", "adapt_register", "summarise", "language_awareness",
    ]);
    for (const r of rows) {
      assert.ok(contentModel.DIFFICULTY.includes(r.difficulty), `${r.paper_id}: invalid difficulty "${r.difficulty}"`);
      assert.ok(READING_CAPABILITIES.has(r.capability), `${r.paper_id}: capability "${r.capability}" not appropriate for reading`);
      assert.notEqual(r.capability, "understand_speech", `${r.paper_id}: understand_speech is listening-only`);
      assert.ok(r.rationale && r.rationale.trim().length > 0, `${r.paper_id}: missing rationale`);

      if (r.item_type === "MCQ") {
        assert.ok(Array.isArray(r.options) && r.options.length >= 2, `${r.paper_id}: MCQ needs options`);
        assert.ok(Number.isInteger(r.answer) && r.answer >= 0 && r.answer < r.options.length, `${r.paper_id}: MCQ answer out of range`);
      }
      if (r.item_type === "TRUE_FALSE") {
        assert.equal(typeof r.answer_payload?.value, "boolean", `${r.paper_id}: TRUE_FALSE needs a boolean key`);
      }
    }
  });

  test("no two reading practice papers share an identical passage (no accidental duplicate)", async (t) => {
    if (!need(t)) return;
    const { rows } = await pool.query(`
      SELECT s.paper_id, s.passage
      FROM b2_paper_sections s JOIN b2_papers p ON p.id = s.paper_id
      WHERE p.board = 'custom' AND s.skill = 'reading' AND s.passage IS NOT NULL AND p.id NOT LIKE 'core-2026b%'`);
    const seen = new Map();
    for (const r of rows) {
      const key = r.passage.trim().toLowerCase();
      if (seen.has(key)) assert.fail(`duplicate passage between ${seen.get(key)} and ${r.paper_id}`);
      seen.set(key, r.paper_id);
    }
  });
});

describe("Reading practice depth — serving and grading", () => {
  test("an MCQ/TRUE_FALSE reading paper serves and grades end to end", async (t) => {
    if (!need(t)) return;
    const { token } = await signup(`read-serve-${Date.now()}@test.local`);
    const auth = { Authorization: `Bearer ${token}` };
    const started = await fetch(`${base}/api/b2/paper/practice-reading-5/start`, { method: "POST", headers: auth }).then(r => r.json());
    assert.ok(started.items.length > 0);
    assert.ok(started.items.every(i => i.skill === "reading"));
    assert.ok(!JSON.stringify(started).includes("rationale"), "rationale must not leak to the client before grading");

    for (const item of started.items) {
      const value = item.itemType === "TRUE_FALSE" ? true : 0;
      await fetch(`${base}/api/b2/paper/attempt/${started.attemptId}/item/${item.itemId}`,
        { method: "PUT", headers: { "Content-Type": "application/json", ...auth }, body: JSON.stringify({ response: value }) });
    }
    const result = await fetch(`${base}/api/b2/paper/attempt/${started.attemptId}/finish`, { method: "POST", headers: auth }).then(r => r.json());
    assert.equal(result.scores.total, started.items.length);
    assert.equal(result.scores.answered, started.items.length);
    assert.ok(result.notAnOfficialScore, "practice papers must self-identify as not an official score");
  });

  test("a MATCHING reading item grades right vs. wrong distinctly", async (t) => {
    if (!need(t)) return;
    // practice-reading-26's third item is MATCHING (Onboarding-Leitfaden).
    const { rows } = await pool.query(`
      SELECT i.answer_payload FROM b2_paper_items i
      JOIN b2_paper_sections s ON s.id = i.section_id
      WHERE s.paper_id = 'practice-reading-26' AND i.item_type = 'MATCHING'`);
    assert.equal(rows.length, 1, "expected exactly one MATCHING item on practice-reading-26");
    const mapping = rows[0].answer_payload.mapping;
    assert.ok(mapping && Object.keys(mapping).length >= 4);

    const { token } = await signup(`read-matching-${Date.now()}@test.local`);
    const auth = { Authorization: `Bearer ${token}` };
    const started = await fetch(`${base}/api/b2/paper/practice-reading-26/start`, { method: "POST", headers: auth }).then(r => r.json());
    const matchItem = started.items.find(i => i.itemType === "MATCHING");
    assert.ok(matchItem, "MATCHING item must be servable");

    // Correct mapping (server-side truth is not exposed to the client, so we
    // reuse the DB-read mapping directly — this test owns that knowledge).
    const correctResponse = mapping;
    const wrongResponse = Object.fromEntries(Object.keys(mapping).map(k => [k, 99]));

    await fetch(`${base}/api/b2/paper/attempt/${started.attemptId}/item/${matchItem.itemId}`,
      { method: "PUT", headers: { "Content-Type": "application/json", ...auth }, body: JSON.stringify({ response: correctResponse }) });
    const result = await fetch(`${base}/api/b2/paper/attempt/${started.attemptId}/finish`, { method: "POST", headers: auth }).then(r => r.json());
    const graded = result.graded.find(g => g.itemId === matchItem.itemId);
    assert.equal(graded.correct, true, "the real mapping must grade correct");

    const started2 = await fetch(`${base}/api/b2/paper/practice-reading-26/start`, { method: "POST", headers: auth }).then(r => r.json());
    const matchItem2 = started2.items.find(i => i.itemType === "MATCHING");
    await fetch(`${base}/api/b2/paper/attempt/${started2.attemptId}/item/${matchItem2.itemId}`,
      { method: "PUT", headers: { "Content-Type": "application/json", ...auth }, body: JSON.stringify({ response: wrongResponse }) });
    const result2 = await fetch(`${base}/api/b2/paper/attempt/${started2.attemptId}/finish`, { method: "POST", headers: auth }).then(r => r.json());
    const graded2 = result2.graded.find(g => g.itemId === matchItem2.itemId);
    assert.equal(graded2.correct, false, "a wrong mapping must not grade correct — grading must discriminate");
  });

  test("an ORDERING reading item is servable and carries a valid expected order", async (t) => {
    if (!need(t)) return;
    const { rows } = await pool.query(`
      SELECT i.payload, i.answer_payload FROM b2_paper_items i
      JOIN b2_paper_sections s ON s.id = i.section_id
      WHERE s.paper_id = 'practice-reading-20' AND i.item_type = 'ORDERING'`);
    assert.equal(rows.length, 1, "expected exactly one ORDERING item on practice-reading-20");
    const { payload, answer_payload } = rows[0];
    assert.ok(Array.isArray(payload.items) && payload.items.length >= 3);
    assert.ok(Array.isArray(answer_payload.order) && answer_payload.order.length === payload.items.length);

    const { token } = await signup(`read-ordering-${Date.now()}@test.local`);
    const auth = { Authorization: `Bearer ${token}` };
    const started = await fetch(`${base}/api/b2/paper/practice-reading-20/start`, { method: "POST", headers: auth }).then(r => r.json());
    const orderItem = started.items.find(i => i.itemType === "ORDERING");
    assert.ok(orderItem, "ORDERING item must be servable");
    assert.ok(!("order" in (orderItem.payload || {})), "the expected order must not leak to the client");
  });
});

/* ══════════════════════════════════════════════════════════════════════
   WRITING
   ══════════════════════════════════════════════════════════════════════ */

describe("Writing practice depth — corpus discovery", () => {
  test("categories() reports 30+ writing experiences, including the new ones", async (t) => {
    if (!need(t)) return;
    const { token } = await signup(`write-disc-${Date.now()}@test.local`);
    const cats = await fetch(`${base}/api/b2/practice/categories`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
    const writing = cats.find(c => c.skill === "writing");
    assert.ok(writing.available);
    assert.ok(writing.papers.length >= 30, `expected 30+ writing papers, got ${writing.papers.length}`);
    assert.ok(writing.papers.some(p => p.paperId === "practice-writing-30"));
  });
});

describe("Writing practice depth — task-type metadata, word limits, rubric mapping", () => {
  test("every practice-writing-3..30 task carries an explicit task_type, register, word range and rubric_id=8", async (t) => {
    if (!need(t)) return;
    const { rows } = await pool.query(`
      SELECT i.payload, i.capability, i.difficulty, i.scoring_mode, i.answer, i.answer_payload, p.id AS paper_id
      FROM b2_paper_items i
      JOIN b2_paper_sections s ON s.id = i.section_id
      JOIN b2_papers p ON p.id = s.paper_id
      WHERE p.id ~ '^practice-writing-([3-9]|[12][0-9]|30)$'`);
    assert.equal(rows.length, 28, "expected exactly 28 new writing tasks");

    const WRITING_CAPABILITIES = new Set([
      "argue", "justify", "concede", "compare", "speculate",
      "exemplify", "structure", "adapt_register", "summarise",
    ]);
    const seenTaskTypes = new Set();
    for (const r of rows) {
      assert.equal(r.scoring_mode, "RUBRIC", `${r.paper_id}: writing tasks must be RUBRIC-scored, never OBJECTIVE`);
      assert.equal(r.payload.rubric_id, 8, `${r.paper_id}: must reuse the board='custom' kurzantwort rubric`);
      assert.ok(r.payload.task_type, `${r.paper_id}: missing task_type metadata`);
      assert.ok(r.payload.register, `${r.paper_id}: missing register metadata`);
      assert.ok(Number.isFinite(r.payload.min_words) && Number.isFinite(r.payload.target_words),
        `${r.paper_id}: missing min_words/target_words`);
      assert.ok(r.payload.min_words <= r.payload.target_words, `${r.paper_id}: min_words must not exceed target_words`);
      assert.ok(WRITING_CAPABILITIES.has(r.capability), `${r.paper_id}: capability "${r.capability}" not appropriate for writing`);
      assert.ok(contentModel.DIFFICULTY.includes(r.difficulty), `${r.paper_id}: invalid difficulty`);
      // Never a manufactured answer key on a productive task.
      assert.equal(r.answer, null, `${r.paper_id}: LONG_TEXT must not carry an answer key`);
      assert.equal(r.answer_payload, null, `${r.paper_id}: LONG_TEXT must not carry an answer_payload`);
      seenTaskTypes.add(r.payload.task_type);
    }
    assert.ok(seenTaskTypes.size >= 10, `expected wide task-type variety, got only ${seenTaskTypes.size}: ${[...seenTaskTypes]}`);
  });

  test("no two writing practice tasks share an identical prompt", async (t) => {
    if (!need(t)) return;
    const { rows } = await pool.query(`
      SELECT p.id AS paper_id, i.stem
      FROM b2_paper_items i JOIN b2_paper_sections s ON s.id = i.section_id JOIN b2_papers p ON p.id = s.paper_id
      WHERE p.board = 'custom' AND s.skill = 'writing' AND p.id NOT LIKE 'core-2026b%'`);
    const seen = new Map();
    for (const r of rows) {
      const key = r.stem.trim().toLowerCase();
      if (seen.has(key)) assert.fail(`duplicate writing prompt between ${seen.get(key)} and ${r.paper_id}`);
      seen.set(key, r.paper_id);
    }
  });
});

describe("Writing practice depth — serving and scoring honesty", () => {
  test("a writing task serves, captures the response, and reports no fake automated score", async (t) => {
    if (!need(t)) return;
    const { token } = await signup(`write-serve-${Date.now()}@test.local`);
    const auth = { Authorization: `Bearer ${token}` };
    const started = await fetch(`${base}/api/b2/paper/practice-writing-7/start`, { method: "POST", headers: auth }).then(r => r.json());
    assert.equal(started.items.length, 1);
    const item = started.items[0];
    assert.equal(item.itemType, "LONG_TEXT");
    assert.ok(item.payload.task_type);

    const responseText = "Ich schlage vor, dass wir jeden Montag eine kurze Absprache von zehn Minuten einführen, in der alle offenen Punkte kurz genannt werden. Das würde Missverständnisse deutlich reduzieren, weil niemand mehr rät, was Kollegen gerade bearbeiten. Zusätzlich könnten wir eine gemeinsame Liste führen, in der jede Aufgabe sichtbar ist.";
    await fetch(`${base}/api/b2/paper/attempt/${started.attemptId}/item/${item.itemId}`,
      { method: "PUT", headers: { "Content-Type": "application/json", ...auth }, body: JSON.stringify({ response: responseText }) });
    const result = await fetch(`${base}/api/b2/paper/attempt/${started.attemptId}/finish`, { method: "POST", headers: auth }).then(r => r.json());

    assert.equal(result.scores.scorable, 0, "a RUBRIC-scored writing item must never be auto-scored as correct/incorrect");
    assert.equal(result.scores.answered, 1);
    const asJson = JSON.stringify(result);
    for (const fake of ["cefr", "CEFR", "goethe_score", "telc_score", "pass_probability", "Wortvielfalt", "percentage"]) {
      assert.ok(!asJson.includes(fake), `result must never claim a fabricated metric: found "${fake}"`);
    }
  });
});

describe("Weak-area recommendation resolves into the new Reading/Writing depth content", () => {
  test("lopsided reading evidence recommends a real practice-reading paper, never core-2026b", async (t) => {
    if (!need(t)) return;
    const { token, userId } = await signup(`weak-read-${Date.now()}@test.local`);
    const evidence = [];
    for (let i = 0; i < 4; i++) evidence.push({ dimension: "reading", capability: "summarise", outcome: 0, weight: 0.9, sourceKind: "paper", sourceRef: `wr-test:${i}` });
    for (let i = 0; i < 4; i++) evidence.push({ dimension: "grammar", capability: "structure", outcome: 1, weight: 0.9, sourceKind: "paper", sourceRef: `wr-test:g${i}` });
    await profile.recordMany(userId, evidence);

    const weak = await fetch(`${base}/api/b2/practice/weak`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
    assert.equal(weak.available, true);
    assert.equal(weak.dimension, "reading");
    assert.ok(weak.paperId.startsWith("practice-reading-"), `expected a practice-reading paper, got ${weak.paperId}`);
    assert.ok(!weak.paperId.startsWith("core-2026b"), "weak-area must never recommend the diagnostic");
  });

  test("lopsided writing evidence recommends a real practice-writing paper, never core-2026b", async (t) => {
    if (!need(t)) return;
    const { token, userId } = await signup(`weak-write-${Date.now()}@test.local`);
    const evidence = [];
    for (let i = 0; i < 4; i++) evidence.push({ dimension: "writing", capability: "structure", outcome: 0, weight: 0.9, sourceKind: "paper", sourceRef: `ww-test:${i}` });
    for (let i = 0; i < 4; i++) evidence.push({ dimension: "vocabulary", capability: "adapt_register", outcome: 1, weight: 0.9, sourceKind: "paper", sourceRef: `ww-test:v${i}` });
    await profile.recordMany(userId, evidence);

    const weak = await fetch(`${base}/api/b2/practice/weak`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
    assert.equal(weak.available, true);
    assert.equal(weak.dimension, "writing");
    assert.ok(weak.paperId.startsWith("practice-writing-"), `expected a practice-writing paper, got ${weak.paperId}`);
    assert.ok(!weak.paperId.startsWith("core-2026b"), "weak-area must never recommend the diagnostic");
  });
});
