/**
 * REAL HTTP-LEVEL PROOF, not a service-layer unit test.
 *
 * Every other test file in this suite calls into src/b2/*.js directly,
 * bypassing routes/b2.js and its (until this change) hardcoded USER_ID — the
 * audit's own finding. Authentication and cross-learner isolation live
 * entirely in the routes layer, so they can only be proven by actually
 * driving HTTP requests against a running Express app, which is why this
 * file builds one (no new dependency: routes + native `fetch`, no supertest).
 *
 * Skips cleanly if Postgres is unreachable, same convention as the rest of
 * this suite.
 */
const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");
const http = require("node:http");

require("../src/env")();
const pool = require("../src/db/pool");
const express = require("express");

const SKIP = "Postgres unreachable — auth/isolation tests skipped";

let live = false, base = "", server = null;
const cleanupUserIds = [];

before(async () => {
  try {
    await pool.query("SELECT 1");
    live = true;
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
    await pool.query(`DELETE FROM b2_assessment_items WHERE attempt_id IN
      (SELECT id FROM b2_paper_attempts WHERE user_id = ANY($1))`, [cleanupUserIds]);
    await pool.query(`DELETE FROM b2_paper_attempts WHERE user_id = ANY($1)`, [cleanupUserIds]);
    await pool.query(`DELETE FROM sessions WHERE user_id = ANY($1)`, [cleanupUserIds]);
    await pool.query(`DELETE FROM users WHERE id = ANY($1)`, [cleanupUserIds]);
  }
  if (server) await new Promise(resolve => server.close(resolve));
  try { await pool.end(); } catch { /* already closed */ }
});

const need = (t) => { if (!live) { t.skip(SKIP); return false; } return true; };

async function signup(email, password = "correcthorsebattery") {
  const res = await fetch(`${base}/api/auth/signup`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json();
  if (body.user?.id) cleanupUserIds.push(body.user.id);
  return { status: res.status, body };
}

describe("signup / login", () => {
  test("signup creates a real session token", async (t) => {
    if (!need(t)) return;
    const { status, body } = await signup(`sign-${Date.now()}@test.local`);
    assert.equal(status, 201);
    assert.ok(body.token && body.token.length >= 32, "token must be a real random string");
    assert.ok(body.user?.id);
  });

  test("login with the wrong password is refused", async (t) => {
    if (!need(t)) return;
    const email = `wrongpw-${Date.now()}@test.local`;
    await signup(email, "correcthorsebattery");
    const res = await fetch(`${base}/api/auth/login`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "totally-wrong-password" }),
    });
    assert.equal(res.status, 401);
  });

  test("login with an unknown email gets the SAME error as a wrong password", async (t) => {
    if (!need(t)) return;
    // Distinguishing the two responses would let a caller enumerate which
    // emails are registered.
    const res = await fetch(`${base}/api/auth/login`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "nobody-here@test.local", password: "whatever12" }),
    });
    const body = await res.json();
    assert.equal(res.status, 401);
    assert.equal(body.error, "invalid_credentials");
  });

  test("a weak password is refused at signup", async (t) => {
    if (!need(t)) return;
    const res = await fetch(`${base}/api/auth/signup`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: `weak-${Date.now()}@test.local`, password: "short" }),
    });
    assert.equal(res.status, 400);
  });
});

describe("protected routes refuse an unauthenticated caller", () => {
  test("no Authorization header at all -> 401", async (t) => {
    if (!need(t)) return;
    const res = await fetch(`${base}/api/b2/assessment/current`);
    assert.equal(res.status, 401);
  });

  test("a garbage bearer token -> 401, not a 500", async (t) => {
    if (!need(t)) return;
    const res = await fetch(`${base}/api/b2/assessment/progress`,
      { headers: { Authorization: "Bearer not-a-real-token" } });
    assert.equal(res.status, 401);
  });

  test("public content routes still work with no session", async (t) => {
    if (!need(t)) return;
    const res = await fetch(`${base}/api/b2/content/status`);
    assert.equal(res.status, 200);
  });
});

describe("learner A cannot touch learner B's attempt", () => {
  test("read, answer, and finish are all refused across learners", async (t) => {
    if (!need(t)) return;
    const a = await signup(`isoA-${Date.now()}@test.local`);
    const b = await signup(`isoB-${Date.now()}@test.local`);
    const authA = { Authorization: `Bearer ${a.body.token}` };
    const authB = { Authorization: `Bearer ${b.body.token}` };

    const started = await fetch(`${base}/api/b2/assessment/start`, {
      method: "POST", headers: { "Content-Type": "application/json", ...authA },
      body: JSON.stringify({ version: "core-2026b-v1" }),
    }).then(r => r.json());
    const attemptId = started.attemptId;
    assert.ok(attemptId, "learner A must actually get an attempt to test isolation against");

    // B reading A's attempt id must look IDENTICAL to a nonexistent attempt —
    // not a 403 (which would confirm the id is real), a 404.
    const read = await fetch(`${base}/api/b2/assessment/${attemptId}`, { headers: authB });
    assert.equal(read.status, 404);

    const item = started.items[0];
    const answer = await fetch(`${base}/api/b2/assessment/${attemptId}/item/${item.itemId}`, {
      method: "PUT", headers: { "Content-Type": "application/json", ...authB },
      body: JSON.stringify({ response: 0 }),
    });
    assert.equal(answer.status, 404);

    const finish = await fetch(`${base}/api/b2/assessment/${attemptId}/finish`,
      { method: "POST", headers: authB });
    assert.equal(finish.status, 404);

    // Sanity: A can still reach her own attempt through the exact same route.
    const ownRead = await fetch(`${base}/api/b2/assessment/${attemptId}`, { headers: authA });
    assert.equal(ownRead.status, 200);
  });

  test("a non-numeric attempt id is refused before touching the database", async (t) => {
    if (!need(t)) return;
    const a = await signup(`fmt-${Date.now()}@test.local`);
    const res = await fetch(`${base}/api/b2/assessment/not-a-number`,
      { headers: { Authorization: `Bearer ${a.body.token}` } });
    assert.equal(res.status, 400);
  });
});
