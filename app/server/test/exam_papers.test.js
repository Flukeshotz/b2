/**
 * GOETHE/TELC EXAM-PRACTICE PAPERS — proven end to end against the real
 * server, same convention as auth_and_isolation.test.js: a real Express app,
 * a real signed-up learner, real HTTP requests. This is the vertical slice
 * proof that the exam_family distinction (board='goethe' vs 'telc') actually
 * reaches a learner through the real content engine, not just the schema.
 *
 * Expanded: paper completeness, component coverage, family identity, stem
 * uniqueness, audio on disk, section sequencing, objective/capture scoring,
 * practice/exam separation, and second complete papers (set-2).
 */
const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

require("../src/env")();
const pool = require("../src/db/pool");
const express = require("express");

const SKIP = "Postgres unreachable — exam paper tests skipped";
let live = false, base = "", server = null;
const cleanupUserIds = [];

before(async () => {
  try {
    await pool.query("SELECT 1");
    const seeded = await pool.query(`SELECT 1 FROM b2_papers WHERE id='goethe-b2-lesen-1'`);
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
      AND (paper_id LIKE 'goethe-b2-%' OR paper_id LIKE 'telc-b2-%')`, [cleanupUserIds]);
    await pool.query(`DELETE FROM b2_evidence WHERE user_id = ANY($1)`, [cleanupUserIds]);
    await pool.query(`DELETE FROM b2_profile WHERE user_id = ANY($1)`, [cleanupUserIds]);
    await pool.query(`DELETE FROM sessions WHERE user_id = ANY($1)`, [cleanupUserIds]);
    await pool.query(`DELETE FROM users WHERE id = ANY($1)`, [cleanupUserIds]);
  }
  if (server) await new Promise(resolve => server.close(resolve));
  try { await pool.end(); } catch { /* already closed */ }
});

const need = (t) => {
  if (!live) { t.skip(SKIP + " (or seed_exam_papers.js has not run)"); return false; }
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

describe("Goethe B2 Lesen — a real learner takes the paper", () => {
  test("start, answer every item correctly, finish, and score 5/5", async (t) => {
    if (!need(t)) return;
    const token = await signup(`goethe-${Date.now()}@test.local`);
    const auth = { Authorization: `Bearer ${token}` };

    const started = await fetch(`${base}/api/b2/paper/goethe-b2-lesen-1/start`,
      { method: "POST", headers: auth }).then(r => r.json());
    assert.equal(started.items.length, 5);
    assert.ok(started.context?.reading?.text, "the passage must be served in context, not per item");
    assert.ok(!JSON.stringify(started).includes("rationale"));

    for (const item of started.items) {
      const value = item.itemType === "TRUE_FALSE" ? true
        : item.itemType === "MULTI_SELECT" ? [0, 1] : 1;
      const r = await fetch(`${base}/api/b2/paper/attempt/${started.attemptId}/item/${item.itemId}`,
        { method: "PUT", headers: { "Content-Type": "application/json", ...auth },
          body: JSON.stringify({ response: value }) }).then(r => r.json());
      assert.equal(r.saved, true);
    }

    const result = await fetch(`${base}/api/b2/paper/attempt/${started.attemptId}/finish`,
      { method: "POST", headers: auth }).then(r => r.json());
    assert.equal(result.scores.correct, 5, "every item was answered with its real key — must score 5/5");
    assert.equal(result.scores.total, 5);
    assert.equal(result.notAnOfficialScore, true);
  });
});

describe("telc B2 Sprachbausteine — a real learner takes the paper", () => {
  test("start, answer every gap correctly, finish, and score 6/6", async (t) => {
    if (!need(t)) return;
    const token = await signup(`telc-${Date.now()}@test.local`);
    const auth = { Authorization: `Bearer ${token}` };

    const started = await fetch(`${base}/api/b2/paper/telc-b2-sprachbausteine-1/start`,
      { method: "POST", headers: auth }).then(r => r.json());
    assert.equal(started.items.length, 6);

    for (const item of started.items) {
      await fetch(`${base}/api/b2/paper/attempt/${started.attemptId}/item/${item.itemId}`,
        { method: "PUT", headers: { "Content-Type": "application/json", ...auth },
          body: JSON.stringify({ response: 0 }) });
    }
    const result = await fetch(`${base}/api/b2/paper/attempt/${started.attemptId}/finish`,
      { method: "POST", headers: auth }).then(r => r.json());
    assert.equal(result.scores.correct, 6);
  });

  test("exam_family is explicit and Goethe/telc content never crosses over", async (t) => {
    if (!need(t)) return;
    const { rows } = await pool.query(
      `SELECT id, board FROM b2_papers WHERE id IN ('goethe-b2-lesen-1','telc-b2-sprachbausteine-1')`);
    const byId = Object.fromEntries(rows.map(r => [r.id, r.board]));
    assert.equal(byId["goethe-b2-lesen-1"], "goethe");
    assert.equal(byId["telc-b2-sprachbausteine-1"], "telc");
  });
});

describe("exam-practice papers are owner-scoped like everything else", () => {
  test("learner A cannot read or answer learner B's paper attempt", async (t) => {
    if (!need(t)) return;
    const tokenA = await signup(`paperA-${Date.now()}@test.local`);
    const tokenB = await signup(`paperB-${Date.now()}@test.local`);
    const authA = { Authorization: `Bearer ${tokenA}` };
    const authB = { Authorization: `Bearer ${tokenB}` };

    const started = await fetch(`${base}/api/b2/paper/goethe-b2-lesen-1/start`,
      { method: "POST", headers: authA }).then(r => r.json());

    const read = await fetch(`${base}/api/b2/paper/attempt/${started.attemptId}`, { headers: authB });
    assert.equal(read.status, 404);

    const answer = await fetch(`${base}/api/b2/paper/attempt/${started.attemptId}/item/${started.items[0].itemId}`,
      { method: "PUT", headers: { "Content-Type": "application/json", ...authB },
        body: JSON.stringify({ response: 0 }) });
    assert.equal(answer.status, 404);
  });
});

describe("Goethe/telc Schreiben and Sprechen — captured, never fake-scored", () => {
  test("Schreiben (LONG_TEXT) is captured but never auto-graded", async (t) => {
    if (!need(t)) return;
    const token = await signup(`schreiben-${Date.now()}@test.local`);
    const auth = { Authorization: `Bearer ${token}` };
    const started = await fetch(`${base}/api/b2/paper/goethe-b2-schreiben-1/start`,
      { method: "POST", headers: auth }).then(r => r.json());
    assert.equal(started.items.length, 1);
    assert.equal(started.items[0].itemType, "LONG_TEXT");
    assert.ok(started.items[0].payload.min_words > 0);
    assert.ok(!started.items[0].payload.rubric_id, "the model answer/rubric id must never reach the client");

    await fetch(`${base}/api/b2/paper/attempt/${started.attemptId}/item/${started.items[0].itemId}`,
      { method: "PUT", headers: { "Content-Type": "application/json", ...auth },
        body: JSON.stringify({ response: "Ein kurzer Forumsbeitrag zum Testen." }) });
    const result = await fetch(`${base}/api/b2/paper/attempt/${started.attemptId}/finish`,
      { method: "POST", headers: auth }).then(r => r.json());
    assert.equal(result.scores.scorable, 0, "a RUBRIC item must never be counted as objectively scored");
    assert.equal(result.scores.answered, 1, "but it must still be recorded as answered");
  });

  test("Sprechen (SPOKEN_RESPONSE) never becomes part of the score, telc side too", async (t) => {
    if (!need(t)) return;
    const token = await signup(`sprechen-${Date.now()}@test.local`);
    const auth = { Authorization: `Bearer ${token}` };
    const started = await fetch(`${base}/api/b2/paper/telc-b2-sprechen-1/start`,
      { method: "POST", headers: auth }).then(r => r.json());
    assert.equal(started.items[0].itemType, "SPOKEN_RESPONSE");
    assert.equal(started.items[0].scoringMode, "TRANSCRIPT_ONLY");

    const result = await fetch(`${base}/api/b2/paper/attempt/${started.attemptId}/finish`,
      { method: "POST", headers: auth }).then(r => r.json());
    assert.equal(result.scores.scorable, 0);
    assert.ok(!JSON.stringify(result).match(/CEFR|Goethe.*Punkte|telc.*Punkte|pass/i));
  });
});

describe("complete papers — one coherent sitting, not four unrelated routes", () => {
  test("Goethe complete paper 1 composes Lesen + Hören + Schreiben + Sprechen in order", async (t) => {
    if (!need(t)) return;
    const token = await signup(`goethefull-${Date.now()}@test.local`);
    const auth = { Authorization: `Bearer ${token}` };
    const started = await fetch(`${base}/api/b2/paper/goethe-b2-complete-1/start`,
      { method: "POST", headers: auth }).then(r => r.json());

    assert.equal(started.items.length, 11);
    const skills = started.items.map(i => i.skill);
    assert.deepEqual(skills, [
      "reading", "reading", "reading", "reading", "reading",
      "listening", "listening", "listening", "listening",
      "writing", "speaking",
    ]);
    assert.ok(started.context.reading?.text, "the Lesen passage must be served in context");
    assert.equal(started.context.listening?.available, true, "the Hören section must report real, attached audio");
    assert.equal(started.context.listening?.text, null, "the Hören transcript must never be served as primary content");

    const correctValues = [1, true, 1, 1, [0, 1], 0, false, 0, 0];
    for (let i = 0; i < 9; i++) {
      const item = started.items[i];
      await fetch(`${base}/api/b2/paper/attempt/${started.attemptId}/item/${item.itemId}`,
        { method: "PUT", headers: { "Content-Type": "application/json", ...auth },
          body: JSON.stringify({ response: correctValues[i] }) });
    }
    const result = await fetch(`${base}/api/b2/paper/attempt/${started.attemptId}/finish`,
      { method: "POST", headers: auth }).then(r => r.json());
    assert.equal(result.scores.total, 11);
    assert.equal(result.scores.scorable, 9, "5 Lesen + 4 Hören OBJECTIVE items are scorable");
    assert.equal(result.scores.correct, 9);
  });

  test("telc complete paper 1 composes all five components", async (t) => {
    if (!need(t)) return;
    const token = await signup(`telcfull-${Date.now()}@test.local`);
    const auth = { Authorization: `Bearer ${token}` };
    const started = await fetch(`${base}/api/b2/paper/telc-b2-complete-1/start`,
      { method: "POST", headers: auth }).then(r => r.json());

    assert.equal(started.items.length, 16);
    const skills = started.items.map(i => i.skill);
    assert.deepEqual(skills, [
      "reading", "reading", "reading", "reading", "reading",
      "grammar", "grammar", "grammar", "grammar", "grammar", "grammar",
      "listening", "listening", "listening",
      "writing", "speaking",
    ]);
    assert.equal(started.context.listening?.available, true);
    const { rows } = await pool.query(`SELECT board FROM b2_papers WHERE id='telc-b2-complete-1'`);
    assert.equal(rows[0].board, "telc");
  });

  test("Goethe complete paper 2 composes from set-2 content", async (t) => {
    if (!need(t)) return;
    const token = await signup(`goethefull2-${Date.now()}@test.local`);
    const auth = { Authorization: `Bearer ${token}` };
    const started = await fetch(`${base}/api/b2/paper/goethe-b2-complete-2/start`,
      { method: "POST", headers: auth }).then(r => r.json());

    assert.equal(started.items.length, 11);
    const skills = started.items.map(i => i.skill);
    assert.deepEqual(skills, [
      "reading", "reading", "reading", "reading", "reading",
      "listening", "listening", "listening", "listening",
      "writing", "speaking",
    ]);
    const { rows } = await pool.query(`SELECT board FROM b2_papers WHERE id='goethe-b2-complete-2'`);
    assert.equal(rows[0].board, "goethe");
  });

  test("telc complete paper 2 composes from set-2 content", async (t) => {
    if (!need(t)) return;
    const token = await signup(`telcfull2-${Date.now()}@test.local`);
    const auth = { Authorization: `Bearer ${token}` };
    const started = await fetch(`${base}/api/b2/paper/telc-b2-complete-2/start`,
      { method: "POST", headers: auth }).then(r => r.json());

    const skills = started.items.map(i => i.skill);
    assert.deepEqual(skills, [
      "reading", "reading", "reading", "reading", "reading",
      "grammar", "grammar", "grammar", "grammar", "grammar", "grammar",
      "listening", "listening", "listening", "listening",
      "writing", "speaking",
    ]);
    const { rows } = await pool.query(`SELECT board FROM b2_papers WHERE id='telc-b2-complete-2'`);
    assert.equal(rows[0].board, "telc");
  });

  test("complete papers are owner-scoped and one-open-attempt-safe", async (t) => {
    if (!need(t)) return;
    const token = await signup(`fullrace-${Date.now()}@test.local`);
    const auth = { Authorization: `Bearer ${token}` };
    const [a, b] = await Promise.all([
      fetch(`${base}/api/b2/paper/goethe-b2-complete-1/start`, { method: "POST", headers: auth }).then(r => r.json()),
      fetch(`${base}/api/b2/paper/goethe-b2-complete-1/start`, { method: "POST", headers: auth }).then(r => r.json()),
    ]);
    assert.equal(a.attemptId, b.attemptId);
  });
});

describe("provenance is honest", () => {
  test("no exam-practice paper claims to be official Goethe/telc material", async (t) => {
    if (!need(t)) return;
    const { rows } = await pool.query(
      `SELECT id, alignment, source_type FROM b2_papers WHERE id LIKE 'goethe-b2-%' OR id LIKE 'telc-b2-%'`);
    assert.ok(rows.length >= 18, `expected at least 18 exam-practice papers (14 standalone + 4 complete), got ${rows.length}`);
    for (const r of rows) {
      assert.equal(r.alignment, "exam_format_practice", `${r.id} must not claim to be licensed_official`);
      assert.equal(r.source_type, "ORIGINAL", `${r.id} must be marked as Skillcase-authored`);
    }
  });
});

/* ── STRUCTURAL TESTS ────────────────────────────────────────────────────── */

describe("component coverage — every component has ≥2 standalone sets per family", () => {
  test("Goethe has ≥2 standalone Lesen, Hören, Schreiben, Sprechen", async (t) => {
    if (!need(t)) return;
    for (const mod of ["lesen", "hoeren", "schreiben", "sprechen"]) {
      const { rows } = await pool.query(
        `SELECT COUNT(DISTINCT p.id) AS n FROM b2_papers p
           JOIN b2_paper_sections s ON s.paper_id = p.id
         WHERE p.board = 'goethe' AND s.module = $1 AND p.id NOT LIKE '%-complete-%'`, [mod]);
      assert.ok(Number(rows[0].n) >= 2,
        `Goethe ${mod} must have at least 2 standalone sets, found ${rows[0].n}`);
    }
  });

  test("telc has ≥2 standalone Lesen, Sprachbausteine, Hören, Schreiben, Sprechen", async (t) => {
    if (!need(t)) return;
    for (const mod of ["lesen", "sprachbausteine", "hoeren", "schreiben", "sprechen"]) {
      const { rows } = await pool.query(
        `SELECT COUNT(DISTINCT p.id) AS n FROM b2_papers p
           JOIN b2_paper_sections s ON s.paper_id = p.id
         WHERE p.board = 'telc' AND s.module = $1 AND p.id NOT LIKE '%-complete-%'`, [mod]);
      assert.ok(Number(rows[0].n) >= 2,
        `telc ${mod} must have at least 2 standalone sets, found ${rows[0].n}`);
    }
  });
});

describe("paper completeness — complete papers contain all required sections", () => {
  test("Goethe complete papers contain lesen, hoeren, schreiben, sprechen", async (t) => {
    if (!need(t)) return;
    const required = new Set(["lesen", "hoeren", "schreiben", "sprechen"]);
    const { rows } = await pool.query(
      `SELECT p.id, array_agg(DISTINCT s.module ORDER BY s.module) AS modules
         FROM b2_papers p JOIN b2_paper_sections s ON s.paper_id = p.id
        WHERE p.id LIKE 'goethe-b2-complete-%'
        GROUP BY p.id`);
    assert.ok(rows.length >= 2, `expected at least 2 Goethe complete papers, got ${rows.length}`);
    for (const r of rows) {
      const got = new Set(r.modules);
      for (const m of required) assert.ok(got.has(m), `${r.id} is missing section '${m}'`);
    }
  });

  test("telc complete papers contain lesen, sprachbausteine, hoeren, schreiben, sprechen", async (t) => {
    if (!need(t)) return;
    const required = new Set(["lesen", "sprachbausteine", "hoeren", "schreiben", "sprechen"]);
    const { rows } = await pool.query(
      `SELECT p.id, array_agg(DISTINCT s.module ORDER BY s.module) AS modules
         FROM b2_papers p JOIN b2_paper_sections s ON s.paper_id = p.id
        WHERE p.id LIKE 'telc-b2-complete-%'
        GROUP BY p.id`);
    assert.ok(rows.length >= 2, `expected at least 2 telc complete papers, got ${rows.length}`);
    for (const r of rows) {
      const got = new Set(r.modules);
      for (const m of required) assert.ok(got.has(m), `${r.id} is missing section '${m}'`);
    }
  });
});

describe("family identity — no cross-contamination", () => {
  test("every goethe-b2-* paper has board='goethe' and every telc-b2-* has board='telc'", async (t) => {
    if (!need(t)) return;
    const { rows } = await pool.query(
      `SELECT id, board FROM b2_papers WHERE id LIKE 'goethe-b2-%' OR id LIKE 'telc-b2-%'`);
    for (const r of rows) {
      if (r.id.startsWith("goethe-b2-")) assert.equal(r.board, "goethe", `${r.id} has wrong board`);
      if (r.id.startsWith("telc-b2-")) assert.equal(r.board, "telc", `${r.id} has wrong board`);
    }
  });
});

describe("no duplicate item stems across standalone exam papers", () => {
  test("no two standalone papers share an identical stem", async (t) => {
    if (!need(t)) return;
    const { rows } = await pool.query(
      `SELECT i.stem, COUNT(*) AS n
         FROM b2_paper_items i JOIN b2_paper_sections s ON s.id = i.section_id
        WHERE s.paper_id LIKE 'goethe-b2-%' OR s.paper_id LIKE 'telc-b2-%'
        GROUP BY i.stem HAVING COUNT(*) > 1`);
    for (const r of rows) {
      const { rows: dups } = await pool.query(
        `SELECT DISTINCT s.paper_id FROM b2_paper_items i
           JOIN b2_paper_sections s ON s.id = i.section_id
         WHERE i.stem = $1`, [r.stem]);
      const standalone = dups.filter(d => !d.paper_id.includes("-complete-"));
      assert.ok(standalone.length <= 1,
        `stem "${r.stem.slice(0, 60)}…" appears in ${standalone.length} standalone papers`);
    }
  });
});

describe("Hören audio on disk — every audio_required section has a real file", () => {
  test("all Hören sections with audio_required=true have an audio file on disk", async (t) => {
    if (!need(t)) return;
    const audioDir = path.join(__dirname, "../public/b2/audio");
    const { rows } = await pool.query(
      `SELECT s.paper_id, s.audio_required, s.audio_intended_id, s.audio_asset_id, a.path
         FROM b2_paper_sections s LEFT JOIN b2_audio_assets a ON a.id = s.audio_asset_id
        WHERE (s.paper_id LIKE 'goethe-b2-%' OR s.paper_id LIKE 'telc-b2-%')
          AND s.module = 'hoeren'`);
    for (const r of rows) {
      if (!r.audio_required) continue;
      assert.ok(r.audio_asset_id, `${r.paper_id}: Hören section requires audio but has no asset registered`);
      const file = path.join(audioDir, `${r.audio_asset_id}.mp3`);
      assert.ok(fs.existsSync(file), `${r.paper_id}: audio file ${file} does not exist on disk`);
    }
  });
});

describe("section sequencing — complete papers serve items in correct order", () => {
  test("Goethe complete paper items arrive in Lesen→Hören→Schreiben→Sprechen order", async (t) => {
    if (!need(t)) return;
    const { rows } = await pool.query(
      `SELECT i.skill FROM b2_paper_items i
         JOIN b2_paper_sections s ON s.id = i.section_id
        WHERE s.paper_id = 'goethe-b2-complete-1' ORDER BY s.part_no, i.item_no`);
    const transitions = [];
    let prev = null;
    for (const r of rows) {
      if (r.skill !== prev) { transitions.push(r.skill); prev = r.skill; }
    }
    assert.deepEqual(transitions, ["reading", "listening", "writing", "speaking"]);
  });

  test("telc complete paper items arrive in Lesen→SB→Hören→Schreiben→Sprechen order", async (t) => {
    if (!need(t)) return;
    const { rows } = await pool.query(
      `SELECT i.skill FROM b2_paper_items i
         JOIN b2_paper_sections s ON s.id = i.section_id
        WHERE s.paper_id = 'telc-b2-complete-1' ORDER BY s.part_no, i.item_no`);
    const transitions = [];
    let prev = null;
    for (const r of rows) {
      if (r.skill !== prev) { transitions.push(r.skill); prev = r.skill; }
    }
    assert.deepEqual(transitions, ["reading", "grammar", "listening", "writing", "speaking"]);
  });
});

describe("objective scoring vs capture-only — the line is never blurred", () => {
  test("RUBRIC and TRANSCRIPT_ONLY items have no answer key stored", async (t) => {
    if (!need(t)) return;
    const { rows } = await pool.query(
      `SELECT i.id, i.scoring_mode, i.answer, i.answer_payload, s.paper_id
         FROM b2_paper_items i JOIN b2_paper_sections s ON s.id = i.section_id
        WHERE (s.paper_id LIKE 'goethe-b2-%' OR s.paper_id LIKE 'telc-b2-%')
          AND i.scoring_mode IN ('RUBRIC','TRANSCRIPT_ONLY')`);
    assert.ok(rows.length >= 4, "expected at least 4 capture-only items across both families");
    for (const r of rows) {
      assert.equal(r.answer, null, `${r.id} in ${r.paper_id}: capture-only item must not have an answer key`);
      assert.equal(r.answer_payload, null, `${r.id} in ${r.paper_id}: capture-only item must not have answer_payload`);
    }
  });
});

describe("practice/exam separation — no leakage between the two surfaces", () => {
  test("no board='custom' paper has a goethe-* or telc-* id", async (t) => {
    if (!need(t)) return;
    const { rows } = await pool.query(
      `SELECT id, board FROM b2_papers WHERE board = 'custom' AND (id LIKE 'goethe-%' OR id LIKE 'telc-%')`);
    assert.equal(rows.length, 0, "no board='custom' paper should have a goethe-* or telc-* id");
  });

  test("exam-practice papers are never board='custom'", async (t) => {
    if (!need(t)) return;
    const { rows } = await pool.query(
      `SELECT id, board FROM b2_papers WHERE (id LIKE 'goethe-b2-%' OR id LIKE 'telc-b2-%') AND board = 'custom'`);
    assert.equal(rows.length, 0);
  });

  test("no core-2026b diagnostic paper is ever labelled goethe/telc, and no exam-practice paper is core-2026b", async (t) => {
    if (!need(t)) return;
    const { rows } = await pool.query(
      `SELECT id, board FROM b2_papers WHERE id LIKE 'core-2026b%'`);
    assert.ok(rows.length > 0, "expected the diagnostic to still exist");
    for (const r of rows) assert.equal(r.board, "custom", `${r.id}: the frozen diagnostic must stay board='custom'`);
  });

  test("Maya Speaking Practice scenarios are never presented as Goethe/telc exam simulation", async (t) => {
    if (!need(t)) return;
    const { rows } = await pool.query(
      `SELECT id FROM b2_papers WHERE id LIKE 'maya_%' OR id LIKE '%maya%'`);
    assert.equal(rows.length, 0, "a Maya scenario must never also exist as a b2_papers row under any board");
  });
});

describe("timing — every section carries a real, sane time limit", () => {
  test("time_limit_seconds is set and consistent with minutes on every goethe/telc section", async (t) => {
    if (!need(t)) return;
    const { rows } = await pool.query(
      `SELECT s.paper_id, s.module, s.minutes, s.time_limit_seconds
         FROM b2_paper_sections s
        WHERE s.paper_id LIKE 'goethe-b2-%' OR s.paper_id LIKE 'telc-b2-%'`);
    assert.ok(rows.length > 0);
    for (const r of rows) {
      assert.ok(r.minutes > 0, `${r.paper_id}/${r.module}: minutes must be positive`);
      assert.equal(r.time_limit_seconds, r.minutes * 60,
        `${r.paper_id}/${r.module}: time_limit_seconds must equal minutes*60`);
    }
  });
});

describe("completeness is truthful — a paper is only ever as 'complete' as its actual sections", () => {
  const REQUIRED = {
    goethe: ["lesen", "hoeren", "schreiben", "sprechen"],
    telc: ["lesen", "sprachbausteine", "hoeren", "schreiben", "sprechen"],
  };

  test("every paper whose id contains '-complete-' actually has every required module for its board", async (t) => {
    if (!need(t)) return;
    const { rows } = await pool.query(
      `SELECT p.id, p.board, p.title, array_agg(DISTINCT s.module) AS modules
         FROM b2_papers p JOIN b2_paper_sections s ON s.paper_id = p.id
        WHERE p.id LIKE '%-complete-%' AND (p.board = 'goethe' OR p.board = 'telc')
        GROUP BY p.id, p.board, p.title`);
    assert.ok(rows.length >= 4, `expected at least 4 complete papers (2 goethe + 2 telc), got ${rows.length}`);
    for (const r of rows) {
      const required = REQUIRED[r.board];
      const missing = required.filter(m => !r.modules.includes(m));
      assert.equal(missing.length, 0,
        `${r.id} is named as a complete paper but is missing: ${missing.join(", ")} — a paper may only be called complete when every required component is actually present`);
      // The title must not carry a stale "ohne Hören"/"without Hören" disclaimer
      // now that Hören is genuinely present.
      assert.ok(!/ohne h.?ren|without h.?ren/i.test(r.title),
        `${r.id}'s title still disclaims missing Hören even though it is present: "${r.title}"`);
    }
  });

  test("no standalone (non-'-complete-') paper is ever missing its own single required module", async (t) => {
    if (!need(t)) return;
    const { rows } = await pool.query(
      `SELECT p.id, count(DISTINCT s.module)::int n
         FROM b2_papers p JOIN b2_paper_sections s ON s.paper_id = p.id
        WHERE (p.id LIKE 'goethe-b2-%' OR p.id LIKE 'telc-b2-%') AND p.id NOT LIKE '%-complete-%'
        GROUP BY p.id`);
    for (const r of rows) assert.equal(r.n, 1, `${r.id}: a standalone set should cover exactly one module`);
  });
});
