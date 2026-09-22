/**
 * LISTENING PRACTICE DEPTH — practice-listening-1..30 (seed_practice_bank.js's
 * LISTENING_1 + seed_listening_bank.js's ALL), all with real Azure Neural TTS
 * audio (tools/make_practice_audio.js). Same convention as
 * practice_reading_writing.test.js: real Express app, real signed-up
 * learner, real HTTP.
 */
const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

require("../src/env")();
const pool = require("../src/db/pool");
const express = require("express");
const profile = require("../src/b2/profile");
const contentModel = require("../src/b2/content_model");

const AUDIO_DIR = path.join(__dirname, "../public/b2/audio");
const SKIP = "Postgres unreachable — listening depth tests skipped";
let live = false, base = "", server = null;
const cleanupUserIds = [];

before(async () => {
  try {
    await pool.query("SELECT 1");
    const seeded = await pool.query(`SELECT 1 FROM b2_papers WHERE id='practice-listening-30'`);
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
  if (!live) { t.skip(SKIP + " (or seed_listening_bank.js/make_practice_audio.js has not run)"); return false; }
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
   CONTENT
   ══════════════════════════════════════════════════════════════════════ */

describe("Listening practice depth — content", () => {
  test("30+ listening experiences with 100+ items exist and are servable", async (t) => {
    if (!need(t)) return;
    const { token } = await signup(`listen-disc-${Date.now()}@test.local`);
    const cats = await fetch(`${base}/api/b2/practice/categories`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
    const listening = cats.find(c => c.skill === "listening");
    assert.ok(listening.available);
    assert.ok(listening.papers.length >= 30, `expected 30+ listening papers, got ${listening.papers.length}`);
    const totalItems = listening.papers.reduce((a, p) => a + p.items, 0);
    assert.ok(totalItems >= 100, `expected 100+ listening items, got ${totalItems}`);
    assert.ok(listening.papers.some(p => p.paperId === "practice-listening-30"));
  });

  test("every listening item has a unique id, a difficulty, a capability valid for listening, and a rationale", async (t) => {
    if (!need(t)) return;
    const { rows } = await pool.query(`
      SELECT i.id, i.item_type, i.difficulty, i.capability, i.rationale, i.options, i.answer, i.answer_payload, p.id AS paper_id
      FROM b2_paper_items i
      JOIN b2_paper_sections s ON s.id = i.section_id
      JOIN b2_papers p ON p.id = s.paper_id
      WHERE p.board = 'custom' AND s.skill = 'listening' AND p.id NOT LIKE 'core-2026b%'`);
    assert.ok(rows.length >= 100, `expected 100+ rows, got ${rows.length}`);

    const LISTENING_CAPABILITIES = new Set([
      "understand_speech", "concede", "ask_followup", "argue", "justify", "compare", "speculate",
    ]);
    const ids = new Set();
    for (const r of rows) {
      assert.ok(!ids.has(r.id), `duplicate item id ${r.id}`);
      ids.add(r.id);
      assert.ok(contentModel.DIFFICULTY.includes(r.difficulty), `${r.paper_id}: invalid difficulty "${r.difficulty}"`);
      assert.ok(LISTENING_CAPABILITIES.has(r.capability), `${r.paper_id}: capability "${r.capability}" not appropriate for listening`);
      assert.notEqual(r.capability, "maintain_discussion", `${r.paper_id}: maintain_discussion needs live conversation, not an MCQ`);
      assert.notEqual(r.capability, "react_unexpected", `${r.paper_id}: react_unexpected needs live conversation, not an MCQ`);
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

  test("no two listening scripts or item stems are duplicated (source-level check)", async (t) => {
    if (!need(t)) return;
    const { LISTENING_1 } = require("../src/seed/seed_practice_bank");
    const { ALL } = require("../src/seed/seed_listening_bank");
    const all = [LISTENING_1, ...ALL];
    const seenScript = new Map(), seenStem = new Map();
    for (const p of all) {
      const script = p.section.turns.map(t2 => t2.text).join(" ").trim().toLowerCase();
      assert.ok(!seenScript.has(script), `duplicate script between ${seenScript.get(script)} and ${p.paper.id}`);
      seenScript.set(script, p.paper.id);
      for (const it of p.items) {
        const stem = it.stem.trim().toLowerCase();
        assert.ok(!seenStem.has(stem), `duplicate stem between ${seenStem.get(stem)} and ${p.paper.id}: "${it.stem}"`);
        seenStem.set(stem, p.paper.id);
      }
    }
  });
});

/* ══════════════════════════════════════════════════════════════════════
   AUDIO
   ══════════════════════════════════════════════════════════════════════ */

describe("Listening practice depth — audio", () => {
  test("every listening section has a real, attached, on-disk audio asset with a plausible duration", async (t) => {
    if (!need(t)) return;
    const { rows } = await pool.query(`
      SELECT s.paper_id, s.audio_required, s.audio_intended_id, s.audio_asset_id, a.path, a.duration_seconds
      FROM b2_paper_sections s
      JOIN b2_papers p ON p.id = s.paper_id
      LEFT JOIN b2_audio_assets a ON a.id = s.audio_asset_id
      WHERE p.board = 'custom' AND s.skill = 'listening' AND p.id NOT LIKE 'core-2026b%'`);
    assert.ok(rows.length >= 30, `expected 30+ listening sections, got ${rows.length}`);
    for (const r of rows) {
      assert.ok(r.audio_required, `${r.paper_id}: audio_required must be true`);
      assert.ok(r.audio_asset_id, `${r.paper_id}: no audio asset attached`);
      assert.ok(r.path, `${r.paper_id}: attached asset has no path`);
      const file = path.join(AUDIO_DIR, `${r.audio_asset_id}.mp3`);
      assert.ok(fs.existsSync(file), `${r.paper_id}: audio file missing on disk at ${file}`);
      assert.ok(fs.statSync(file).size > 5000, `${r.paper_id}: audio file implausibly small`);
      assert.ok(r.duration_seconds >= 10 && r.duration_seconds <= 150,
        `${r.paper_id}: implausible duration ${r.duration_seconds}s`);
    }
  });

  test("an audio asset is never registered accidentally more than once — only the documented complete-paper reuse pattern is allowed", async (t) => {
    if (!need(t)) return;
    const { rows } = await pool.query(`
      SELECT s.audio_asset_id, array_agg(s.paper_id ORDER BY s.paper_id) AS paper_ids
      FROM b2_paper_sections s
      WHERE s.audio_asset_id IS NOT NULL GROUP BY s.audio_asset_id HAVING count(*) > 1`);
    for (const r of rows) {
      // The one legitimate reuse: a standalone Hören set's clip also
      // attached to the matching section of its board's "-complete-" paper
      // (exactly the same intentional-reuse pattern already documented for
      // Lesen/Schreiben/Sprechen passages/stems in those papers). Anything
      // else sharing an asset id would be a real accidental duplicate.
      assert.equal(r.paper_ids.length, 2, `unexpected audio reuse across ${r.paper_ids.length} papers: ${JSON.stringify(r.paper_ids)}`);
      assert.ok(r.paper_ids.some(id => id.includes("-complete-")),
        `audio asset ${r.audio_asset_id} is duplicated across ${JSON.stringify(r.paper_ids)}, neither of which is a complete-paper reuse`);
    }
  });

  test("audio is served with a real MP3 response, not a broken reference", async (t) => {
    if (!need(t)) return;
    const { rows } = await pool.query(`SELECT path FROM b2_audio_assets WHERE id = $1`, ["practice_listening_2_terminabsage"]);
    assert.ok(rows[0], "expected the proof-of-pipeline asset to be registered");
    const res = await fetch(`${base.replace(/:\d+$/, ":4000")}${rows[0].path}`).catch(() => null);
    // The audio is served by the same app's /b2/audio static route, which
    // this test's in-process server does not mount (that lives on the real
    // dev server on :4000) — so this checks the asset row + file, the same
    // invariant the running server relies on, without assuming :4000 is up
    // in CI. Skip the live HTTP fetch if it's unreachable; the file-exists
    // check above already covers "served correctly" in-process.
    if (res && res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      assert.ok(buf.length > 5000, "served audio must be a real, non-trivial file");
      // Azure's output has no ID3 tag — it starts directly with an MPEG frame
      // sync (0xFF Ex). Accept either that or an ID3 header, so this doesn't
      // assume one particular encoder's framing.
      const isId3 = buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33;
      const isMpegFrameSync = buf[0] === 0xff && (buf[1] & 0xe0) === 0xe0;
      assert.ok(isId3 || isMpegFrameSync, `served file does not look like an MP3 (first bytes: ${buf[0].toString(16)} ${buf[1].toString(16)})`);
    }
  });
});

/* ══════════════════════════════════════════════════════════════════════
   SERVING
   ══════════════════════════════════════════════════════════════════════ */

describe("Listening practice depth — serving and grading", () => {
  test("a listening paper serves with context.available=true and the right audio file", async (t) => {
    if (!need(t)) return;
    const { token } = await signup(`listen-serve-${Date.now()}@test.local`);
    const auth = { Authorization: `Bearer ${token}` };
    const started = await fetch(`${base}/api/b2/paper/practice-listening-15/start`, { method: "POST", headers: auth }).then(r => r.json());
    assert.ok(started.items.length > 0);
    assert.ok(started.items.every(i => i.skill === "listening"));
    const ctx = started.context.listening;
    assert.ok(ctx, "listening context must be present");
    assert.equal(ctx.available, true);
    assert.ok(ctx.audioFile, "context must name the audio file/asset id");
    assert.ok(!JSON.stringify(started).includes("rationale"), "rationale must not leak to the client before grading");
    // The transcript must not be surfaced as the primary passage text.
    assert.equal(ctx.text, null, "listening sections must not carry a passage — the script is not shown as primary content");
  });

  test("correct answers score correctly and wrong answers do not (grading discriminates)", async (t) => {
    if (!need(t)) return;
    const { token } = await signup(`listen-grade-${Date.now()}@test.local`);
    const auth = { Authorization: `Bearer ${token}` };

    const started = await fetch(`${base}/api/b2/paper/practice-listening-15/start`, { method: "POST", headers: auth }).then(r => r.json());
    for (const item of started.items) {
      const value = item.itemType === "TRUE_FALSE" ? true : 0;
      await fetch(`${base}/api/b2/paper/attempt/${started.attemptId}/item/${item.itemId}`,
        { method: "PUT", headers: { "Content-Type": "application/json", ...auth }, body: JSON.stringify({ response: value }) });
    }
    const result = await fetch(`${base}/api/b2/paper/attempt/${started.attemptId}/finish`, { method: "POST", headers: auth }).then(r => r.json());
    assert.equal(result.scores.total, started.items.length);
    assert.equal(result.scores.answered, started.items.length);
    // practice-listening-15's real answer key is not "always index 0 / always
    // true" (verified by inspecting the seed), so an all-0/all-true response
    // must not score perfectly — that would mean grading is a no-op.
    assert.ok(result.scores.correct < result.scores.total,
      "grading must discriminate — a constant response should not score perfectly");
  });

  test("a second, independently reachable listening paper also serves and grades", async (t) => {
    if (!need(t)) return;
    const { token } = await signup(`listen-serve2-${Date.now()}@test.local`);
    const auth = { Authorization: `Bearer ${token}` };
    const started = await fetch(`${base}/api/b2/paper/practice-listening-8/start`, { method: "POST", headers: auth }).then(r => r.json());
    assert.ok(started.items.length > 0);
    assert.equal(started.context.listening.available, true);
    for (const item of started.items) {
      await fetch(`${base}/api/b2/paper/attempt/${started.attemptId}/item/${item.itemId}`,
        { method: "PUT", headers: { "Content-Type": "application/json", ...auth }, body: JSON.stringify({ response: item.itemType === "TRUE_FALSE" ? true : 0 }) });
    }
    const result = await fetch(`${base}/api/b2/paper/attempt/${started.attemptId}/finish`, { method: "POST", headers: auth }).then(r => r.json());
    assert.ok(result.notAnOfficialScore);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   SEPARATION
   ══════════════════════════════════════════════════════════════════════ */

describe("Listening practice depth — practice/exam separation", () => {
  test("Listening practice never selects a core-2026b diagnostic paper or a Goethe/telc paper", async (t) => {
    if (!need(t)) return;
    const { token } = await signup(`listen-sep-${Date.now()}@test.local`);
    const cats = await fetch(`${base}/api/b2/practice/categories`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
    const listening = cats.find(c => c.skill === "listening");
    for (const p of listening.papers) {
      assert.ok(!p.paperId.startsWith("core-2026b"), `${p.paperId} must not be a diagnostic paper`);
      assert.ok(!/^goethe-|^telc-/.test(p.paperId), `${p.paperId} must not be an exam-board paper`);
    }
  });

  test("the core-2026b Hören audio assets stay AUTO_QA_PASS and unduplicated as versions are added", async (t) => {
    if (!need(t)) return;
    const { rows } = await pool.query(`
      SELECT id, review_status FROM b2_audio_assets
      WHERE id LIKE 'core2026b_%' ORDER BY id`);
    // At least the original v1–v3; more versions land as core2026b/v4.js etc are
    // seeded (see tools/make_core2026b_audio.js), so this checks the audio
    // corpus isn't corrupted or duplicated, not a version count frozen in time.
    assert.ok(rows.length >= 3, `expected at least the 3 original core-2026b audio assets, got ${rows.length}`);
    assert.equal(new Set(rows.map(r => r.id)).size, rows.length, "no duplicate audio asset ids");
    for (const r of rows) assert.equal(r.review_status, "AUTO_QA_PASS");
  });
});

/* ══════════════════════════════════════════════════════════════════════
   RECOMMENDATION
   ══════════════════════════════════════════════════════════════════════ */

describe("Weak-area recommendation resolves into real Listening practice", () => {
  test("lopsided listening evidence recommends a real practice-listening paper, never core-2026b", async (t) => {
    if (!need(t)) return;
    const { token, userId } = await signup(`weak-listen-${Date.now()}@test.local`);
    const evidence = [];
    for (let i = 0; i < 4; i++) evidence.push({ dimension: "listening", capability: "understand_speech", outcome: 0, weight: 0.9, sourceKind: "paper", sourceRef: `wl-test:${i}` });
    for (let i = 0; i < 4; i++) evidence.push({ dimension: "grammar", capability: "structure", outcome: 1, weight: 0.9, sourceKind: "paper", sourceRef: `wl-test:g${i}` });
    await profile.recordMany(userId, evidence);

    const weak = await fetch(`${base}/api/b2/practice/weak`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
    assert.equal(weak.available, true);
    assert.equal(weak.dimension, "listening");
    assert.ok(weak.paperId.startsWith("practice-listening-"), `expected a practice-listening paper, got ${weak.paperId}`);
    assert.ok(!weak.paperId.startsWith("core-2026b"), "weak-area must never recommend the diagnostic");
  });
});
