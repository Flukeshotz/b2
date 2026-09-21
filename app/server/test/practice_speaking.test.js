/**
 * SPEAKING PRACTICE DEPTH — 26 new Maya scenarios (src/seed/b2/maya/*.js)
 * on top of the 4 frozen ones (schichttausch/homeoffice/vorschlag/
 * unerwartet), registered via routes/b2.js's directory-scan SCENARIOS map
 * and seed_b2_maya.js's MAYA_TOPICS. No new conversation engine — this
 * reuses maya.js and the existing `topics`/`b2_maya_sessions` tables
 * exactly as the four originals do.
 *
 * Real Express app, real signed-up learner, real HTTP — same convention as
 * practice_listening.test.js.
 */
const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

require("../src/env")();
const pool = require("../src/db/pool");
const express = require("express");
const maya = require("../src/b2/maya");
const profile = require("../src/b2/profile");
const { trackOf } = require("../src/seed/b2_curriculum");

const MAYA_DIR = path.join(__dirname, "../src/seed/b2/maya");
const FROZEN = new Set(["schichttausch.js", "homeoffice.js", "vorschlag.js", "unerwartet.js"]);

const SKIP = "Postgres unreachable — speaking depth tests skipped";
let live = false, base = "", server = null;
const cleanupUserIds = [];

before(async () => {
  try {
    await pool.query("SELECT 1");
    const seeded = await pool.query(`SELECT 1 FROM topics WHERE id='b2_maya_fortbildung_antrag'`);
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
    await pool.query(`DELETE FROM b2_maya_sessions WHERE user_id = ANY($1)`, [cleanupUserIds]);
    await pool.query(`DELETE FROM b2_evidence WHERE user_id = ANY($1)`, [cleanupUserIds]);
    await pool.query(`DELETE FROM b2_profile WHERE user_id = ANY($1)`, [cleanupUserIds]);
    await pool.query(`DELETE FROM sessions WHERE user_id = ANY($1)`, [cleanupUserIds]);
    await pool.query(`DELETE FROM users WHERE id = ANY($1)`, [cleanupUserIds]);
  }
  if (server) await new Promise(resolve => server.close(resolve));
  try { await pool.end(); } catch { /* already closed */ }
});

const need = (t) => {
  if (!live) { t.skip(SKIP + " (or seed_b2_maya.js has not run)"); return false; }
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

describe("Speaking practice depth — content", () => {
  test("30+ scenario files exist and every one validates against the Maya contract", () => {
    const files = fs.readdirSync(MAYA_DIR).filter(f => f.endsWith(".js"));
    assert.ok(files.length >= 30, `expected 30+ scenario files, got ${files.length}`);
    for (const f of files) {
      const sc = require(path.join(MAYA_DIR, f));
      assert.doesNotThrow(() => maya.validateMayaScenario(sc), `${f} failed validation`);
    }
  });

  test("every scenario id is unique", () => {
    const files = fs.readdirSync(MAYA_DIR).filter(f => f.endsWith(".js"));
    const seen = new Map();
    for (const f of files) {
      const sc = require(path.join(MAYA_DIR, f));
      assert.ok(!seen.has(sc.id), `duplicate scenario id "${sc.id}" in ${f} and ${seen.get(sc.id)}`);
      seen.set(sc.id, f);
    }
  });

  test("no two scenarios share an identical opening line or terminal 'resolved' line", () => {
    const files = fs.readdirSync(MAYA_DIR).filter(f => f.endsWith(".js"));
    const seenOpening = new Map(), seenResolved = new Map();
    for (const f of files) {
      const sc = require(path.join(MAYA_DIR, f));
      const opening = sc.first_say.trim().toLowerCase();
      assert.ok(!seenOpening.has(opening), `duplicate first_say between ${seenOpening.get(opening)} and ${f}`);
      seenOpening.set(opening, f);
      const resolvedBeat = sc.beats.find(b => b.terminal && b.outcome === "resolved");
      if (resolvedBeat) {
        const key = resolvedBeat.say.trim().toLowerCase();
        assert.ok(!seenResolved.has(key), `duplicate resolved closing line between ${seenResolved.get(key)} and ${f}`);
        seenResolved.set(key, f);
      }
    }
  });

  test("the four frozen scenarios are unchanged (spot-checked known values)", () => {
    const schichttausch = require(path.join(MAYA_DIR, "schichttausch.js"));
    const homeoffice = require(path.join(MAYA_DIR, "homeoffice.js"));
    const vorschlag = require(path.join(MAYA_DIR, "vorschlag.js"));
    const unerwartet = require(path.join(MAYA_DIR, "unerwartet.js"));
    assert.equal(schichttausch.capability_targets.primary, "maintain_discussion");
    assert.equal(schichttausch.max_learner_turns, 7);
    assert.equal(homeoffice.capability_targets.primary, "argue");
    assert.equal(vorschlag.capability_targets.primary, "justify");
    assert.equal(unerwartet.capability_targets.primary, "react_unexpected");
  });

  test("capability_targets.primary is not overwhelmingly one capability, and spans the suggested taxonomy", () => {
    const files = fs.readdirSync(MAYA_DIR).filter(f => f.endsWith(".js"));
    const counts = {};
    for (const f of files) {
      const sc = require(path.join(MAYA_DIR, f));
      counts[sc.capability_targets.primary] = (counts[sc.capability_targets.primary] || 0) + 1;
    }
    const total = files.length;
    for (const [cap, n] of Object.entries(counts)) {
      assert.ok(n / total <= 0.3, `capability "${cap}" is ${n}/${total} of primaries — too concentrated`);
    }
    assert.ok(Object.keys(counts).length >= 8, `expected wide capability variety, got only ${Object.keys(counts).length}: ${Object.keys(counts)}`);
  });

  test("every new-pass scenario declares required metadata: roles, context, objective, difficulty tier, provenance-equivalent declaration", () => {
    const files = fs.readdirSync(MAYA_DIR).filter(f => f.endsWith(".js") && !FROZEN.has(f));
    assert.equal(files.length, 26, `expected exactly 26 new scenario files, got ${files.length}`);
    for (const f of files) {
      const sc = require(path.join(MAYA_DIR, f));
      assert.ok(sc.roles?.learner && sc.roles?.maya, `${f}: missing roles`);
      assert.ok(sc.context, `${f}: missing context`);
      assert.ok(sc.objective, `${f}: missing objective`);
      assert.ok(sc.declaration?.cefr_tier, `${f}: missing difficulty (cefr_tier)`);
      assert.ok(["accessible", "developing", "demanding"].includes(sc.declaration.cefr_tier), `${f}: invalid cefr_tier "${sc.declaration.cefr_tier}"`);
      assert.ok(sc.declaration?.context, `${f}: missing declaration.context`);
    }
  });

  test("difficulty tiers show a real spread, not one label repeated", () => {
    const files = fs.readdirSync(MAYA_DIR).filter(f => f.endsWith(".js"));
    const tiers = {};
    for (const f of files) {
      const sc = require(path.join(MAYA_DIR, f));
      const tier = sc.declaration?.cefr_tier || "unknown";
      tiers[tier] = (tiers[tier] || 0) + 1;
    }
    assert.ok(Object.keys(tiers).length >= 2, `expected 2+ difficulty tiers, got ${JSON.stringify(tiers)}`);
  });

  test("a meaningful nursing/professional subset exists without dominating the corpus", () => {
    const files = fs.readdirSync(MAYA_DIR).filter(f => f.endsWith(".js") && !FROZEN.has(f));
    const nursingIds = ["dienstplan_tausch2", "patientenwunsch", "kollegin_ueberlastet", "stationswechsel", "uebergabe_unklar", "krankmeldung_kollege"];
    const present = files.filter(f => nursingIds.some(id => f.startsWith(id)));
    assert.ok(present.length >= 4, `expected a meaningful nursing subset, got ${present.length}`);
    assert.ok(present.length < files.length / 2, "nursing scenarios must not dominate the corpus");
  });
});

/* ══════════════════════════════════════════════════════════════════════
   DISCOVERY
   ══════════════════════════════════════════════════════════════════════ */

describe("Speaking practice depth — discovery", () => {
  test("all 30 Maya topics derive track='speaking' and are live", async (t) => {
    if (!need(t)) return;
    const { rows } = await pool.query(
      `SELECT id, status FROM topics WHERE level='b2' AND id LIKE 'b2_maya_%'`);
    assert.ok(rows.length >= 30, `expected 30+ topics, got ${rows.length}`);
    for (const r of rows) {
      assert.equal(r.status, "live", `${r.id} is not live`);
      assert.equal(trackOf(r.id), "speaking", `${r.id} did not derive track='speaking'`);
    }
  });

  test("the curriculum API returns all 30 speaking topics for a real learner", async (t) => {
    if (!need(t)) return;
    const { token } = await signup(`speak-disc-${Date.now()}@test.local`);
    const topics = await fetch(`${base}/api/b2/curriculum`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
    const speaking = topics.filter(t2 => t2.track === "speaking");
    assert.ok(speaking.length >= 30, `expected 30+ speaking topics from /curriculum, got ${speaking.length}`);
  });
});

/* ══════════════════════════════════════════════════════════════════════
   SERVING
   ══════════════════════════════════════════════════════════════════════ */

describe("Speaking practice depth — serving", () => {
  test("a new scenario resolves via GET /maya/:id with brief, roles, and no session yet", async (t) => {
    if (!need(t)) return;
    const { token } = await signup(`speak-serve-${Date.now()}@test.local`);
    const res = await fetch(`${base}/api/b2/maya/maya_meeting_verschieben`, { headers: { Authorization: `Bearer ${token}` } });
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.id, "maya_meeting_verschieben");
    assert.ok(body.roles?.learner && body.roles?.maya);
    assert.ok(body.opening && body.firstSay);
    assert.equal(body.session, null);
    // Beats/press/transitions must never leak to the client — a learner
    // who can read Maya's next move is rehearsing, not conversing.
    assert.ok(!("beats" in body));
    assert.ok(!("afterwards" in body));
  });

  test("a full conversation can be played through a new scenario to a terminal outcome, server-authoritative throughout", async (t) => {
    if (!need(t)) return;
    const { token } = await signup(`speak-play-${Date.now()}@test.local`);
    const auth = { Authorization: `Bearer ${token}` };
    const scenarioId = "maya_meeting_verschieben";
    const sc = require(path.join(MAYA_DIR, "meeting_verschieben.js"));

    await fetch(`${base}/api/b2/maya/${scenarioId}/start`, { method: "POST", headers: auth });

    const strongTurns = [
      "Der Termin liegt montags neun Uhr fest bei meinem Arzt, weil er nur dann Kapazität hat und ich das nicht verschieben kann.",
      "Das verstehe ich, dass dein Kurs mittwochs genauso fix ist. Ich könnte donnerstags oder freitags.",
      "Donnerstag wäre besser, weil dann noch niemand im Team einen anderen festen Termin an dem Tag hat.",
    ];

    let done = null, sessionId = null;
    for (const text of strongTurns) {
      const res = await fetch(`${base}/api/b2/maya/${scenarioId}/turn`, {
        method: "POST", headers: { "Content-Type": "application/json", ...auth },
        body: JSON.stringify({ text, sessionId }),
      });
      const body = await res.json();
      assert.equal(res.status, 200, JSON.stringify(body));
      if (body.sessionId) sessionId = body.sessionId;
      if (body.done) { done = body; break; }
    }
    assert.ok(done, "conversation did not reach a terminal outcome within the scripted turns");
    assert.ok(done.summary?.verdict);
    assert.ok(done.afterwards?.strong?.length > 0);

    // Server-authoritative: the DB session, not the client, is the source of truth.
    const { rows } = await pool.query(
      `SELECT status, terminal_outcome, learner_turns_count FROM b2_maya_sessions WHERE session_id=$1`, [sessionId]);
    assert.equal(rows[0].status, done.outcome);
    assert.ok(rows[0].learner_turns_count > 0);
  });

  test("duplicate submission never records evidence twice (idempotent by source_ref)", async (t) => {
    if (!need(t)) return;
    const { token, userId } = await signup(`speak-dup-${Date.now()}@test.local`);
    const auth = { Authorization: `Bearer ${token}` };
    const scenarioId = "maya_umzug_freunde"; // a short, 3-beat scenario

    await fetch(`${base}/api/b2/maya/${scenarioId}/start`, { method: "POST", headers: auth });
    const turns = [
      "Ich kann leider nur bis 12 Uhr, danach habe ich einen wichtigen Termin.",
      "Ich könnte unser eigenes Auto nehmen, weil wir nicht so viele große Möbel haben.",
      "Wir fangen um 9 Uhr an, und du hilfst mir bis 12 Uhr beim Tragen.",
    ];
    let sessionId = null, lastBody = null;
    for (const text of turns) {
      const res = await fetch(`${base}/api/b2/maya/${scenarioId}/turn`, {
        method: "POST", headers: { "Content-Type": "application/json", ...auth },
        body: JSON.stringify({ text, sessionId }),
      });
      lastBody = await res.json();
      if (lastBody.sessionId) sessionId = lastBody.sessionId;
      if (lastBody.done) break;
    }
    assert.ok(lastBody.done, "expected the scripted turns to finish the scenario");

    const before = await pool.query(`SELECT count(*)::int n FROM b2_evidence WHERE user_id=$1`, [userId]);

    // Re-submit the exact same finishing turn again (simulates a reload/double-tap).
    await fetch(`${base}/api/b2/maya/${scenarioId}/turn`, {
      method: "POST", headers: { "Content-Type": "application/json", ...auth },
      body: JSON.stringify({ text: turns[turns.length - 1], sessionId }),
    });

    const after = await pool.query(`SELECT count(*)::int n FROM b2_evidence WHERE user_id=$1`, [userId]);
    assert.equal(after.rows[0].n, before.rows[0].n, "duplicate submission must not create duplicate evidence rows");
  });
});

/* ══════════════════════════════════════════════════════════════════════
   SEPARATION
   ══════════════════════════════════════════════════════════════════════ */

describe("Speaking practice depth — separation from Practice papers and the diagnostic", () => {
  test("Maya scenario ids never appear as b2_papers rows, and vice versa", async (t) => {
    if (!need(t)) return;
    const files = fs.readdirSync(MAYA_DIR).filter(f => f.endsWith(".js"));
    const ids = files.map(f => require(path.join(MAYA_DIR, f)).id);
    const { rows } = await pool.query(
      `SELECT id FROM b2_papers WHERE id = ANY($1)`, [ids]);
    assert.equal(rows.length, 0, "a Maya scenario id must never also be a b2_papers row");
  });

  test("Practice Mode's categories() speaking papers (if any) stay disjoint from Maya's own discovery", async (t) => {
    if (!need(t)) return;
    const { token } = await signup(`speak-sep-${Date.now()}@test.local`);
    const cats = await fetch(`${base}/api/b2/practice/categories`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
    const speaking = cats.find(c => c.skill === "speaking");
    for (const p of speaking.papers) {
      assert.ok(!p.paperId.startsWith("maya_"), "a Maya scenario must not be listed as a practice paper");
    }
  });
});

/* ══════════════════════════════════════════════════════════════════════
   EVIDENCE DISCIPLINE
   ══════════════════════════════════════════════════════════════════════ */

describe("Speaking practice depth — evidence stays indicative, never a fake reliable band", () => {
  test("a single finished conversation records weight-0.2 conversation evidence and never flips speaking to a measured/reliable dimension", async (t) => {
    if (!need(t)) return;
    const { token, userId } = await signup(`speak-evidence-${Date.now()}@test.local`);
    const auth = { Authorization: `Bearer ${token}` };
    const scenarioId = "maya_wg_regeln";

    await fetch(`${base}/api/b2/maya/${scenarioId}/start`, { method: "POST", headers: auth });
    const turns = [
      "Ohne Plan klappt es nicht, weil sich nie jemand richtig zuständig fühlt.",
      "Ich könnte einmal pro Woche putzen, das wäre für mich machbar.",
      "Wir wechseln uns ab Freitag jede Woche, ich fange diesen Freitag gleich an.",
    ];
    let sessionId = null, lastBody = null;
    for (const text of turns) {
      const res = await fetch(`${base}/api/b2/maya/${scenarioId}/turn`, {
        method: "POST", headers: { "Content-Type": "application/json", ...auth },
        body: JSON.stringify({ text, sessionId }),
      });
      lastBody = await res.json();
      if (lastBody.sessionId) sessionId = lastBody.sessionId;
      if (lastBody.done) break;
    }
    assert.ok(lastBody.done);

    const { rows } = await pool.query(
      `SELECT source_kind, weight, dimension FROM b2_evidence WHERE user_id=$1`, [userId]);
    assert.ok(rows.length > 0, "expected evidence rows from the finished conversation");
    for (const r of rows) {
      assert.equal(r.source_kind, "conversation");
      assert.equal(r.weight, 0.2, "Maya evidence must stay at the indicative 0.2 weight, never boosted");
      assert.equal(r.dimension, "speaking");
    }

    const prof = await profile.getProfile(userId);
    const speakingRow = prof.find(p => p.dimension === "speaking");
    assert.ok(speakingRow, "expected a speaking row in the profile");
    assert.equal(speakingRow.indicative, true, "speaking must stay indicative — one conversation is never a reliable band");

    // No fake CEFR/band claim anywhere in the raw finish response.
    const asJson = JSON.stringify(lastBody);
    for (const fake of ["CEFR", "goethe_score", "telc_score", "pass_probability", "fluency_percentage"]) {
      assert.ok(!asJson.includes(fake), `finish response must never claim a fabricated metric: found "${fake}"`);
    }
  });
});
