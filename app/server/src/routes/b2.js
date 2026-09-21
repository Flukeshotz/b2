const express = require("express");
const pool = require("../db/pool");
const { analyse } = require("../b2/analyse");
const { gate, integrity } = require("../b2/gate");
const { compose } = require("../b2/verdict");
const pflege = require("../b2/pflege");
const model = require("../b2/model");
const resources = require("../b2/resources");
const speech = require("../b2/speech");
const { recommend } = require("../b2/recommend");
const b2curriculum = require("../b2/curriculum");
const profile_ = require("../b2/profile");
const tasks = require("../b2/task_profiles");
const maya = require("../b2/maya");
const caps = require("../b2/capabilities");
const interview = require("../b2/interview");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const router = require("../lib/safe_router")();

// Teacher review surface. Serves HTML rather than JSON, and is gated by a shared
// secret rather than a session, because no auth system exists yet.
router.use("/review", require("./b2review"));

/* CONTENT-ONLY ROUTES, BEFORE THE AUTH GATE. Neither reads nor writes any
   learner state — one is an ops dashboard computed from content tables, the
   other is "what is in this version" with every answer key stripped, the
   same content a public course catalog page would show. Both stay reachable
   without a session; everything below them is learner data and requires one. */
router.get("/content/status", async (req, res) => {
  const [versions, audio, blockers, capabilities] = await Promise.all([
    pool.query(`SELECT * FROM b2_v_assessment_versions ORDER BY version`),
    pool.query(`SELECT * FROM b2_v_audio_status WHERE audio_required ORDER BY version, module`),
    pool.query(`SELECT * FROM b2_v_content_blockers ORDER BY blocker, scope`),
    pool.query(`SELECT * FROM b2_v_capability_coverage ORDER BY items DESC, capability`),
  ]);
  const data = {
    versions: versions.rows, audio: audio.rows,
    blockers: blockers.rows, capabilities: capabilities.rows,
    generatedAt: new Date().toISOString(),
  };
  if (req.query.format !== "html") return res.json(data);

  const esc = (s) => String(s ?? "—").replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  const table = (title, rows) => {
    if (!rows.length) return `<h2>${esc(title)}</h2><p>none</p>`;
    const cols = Object.keys(rows[0]);
    return `<h2>${esc(title)}</h2><table><tr>${cols.map(c => `<th>${esc(c)}</th>`).join("")}</tr>` +
      rows.map(r => `<tr>${cols.map(c => `<td>${esc(r[c])}</td>`).join("")}</tr>`).join("") + `</table>`;
  };
  res.type("html").send(`<!doctype html><meta charset="utf-8">
<title>B2 content status</title>
<style>
 body{font:14px/1.5 -apple-system,system-ui,sans-serif;margin:24px;color:#111}
 h1{font-size:20px} h2{font-size:15px;margin:24px 0 6px}
 table{border-collapse:collapse;font-size:13px}
 th,td{border:1px solid #ddd;padding:4px 8px;text-align:left}
 th{background:#f4f4f5;font-weight:600}
 .note{color:#666;font-size:12px}
</style>
<h1>B2 content status</h1>
<p class="note">Computed from the database at ${esc(data.generatedAt)}. Read-only.</p>
${table("Assessment versions", data.versions)}
${table("Audio", data.audio)}
${table("Blockers", data.blockers)}
${table("Capability coverage", data.capabilities)}`);
});

/* The production content itself, straight from the database, with every answer
   key stripped. Separate from /assessment/:id because it answers "what is in
   this version?" rather than "where is this learner up to?". */
router.get("/assessment/version/:version", async (req, res) => {
  const v = await assessmentContent.safeVersion(req.params.version);
  if (!v.items.length) return res.status(404).json({ error: "unknown_version" });
  res.json(v);
});

/* EVERYTHING BELOW THIS LINE IS LEARNER DATA. `req.userId` comes from a
   verified session token from here on — never from anything the client
   claims about itself. */
router.use(require("../auth").requireAuth);

/* ── ASSESSMENT ──────────────────────────────────────────────────────────────
   The loop the product exists for: take a quick test, find your weaknesses,
   practise them, take a NEW test, see whether you improved.

   Thin on purpose. Composition lives in b2/assessment_compose.js, comparison in
   b2/assessment_progress.js, persistence in b2/assessment_store.js — all three
   are unit-testable without an HTTP server, and two of them without a database.
   These handlers only translate.

   DISTINCT FROM /screening, which is left exactly as it is. That endpoint marks
   answers and returns a profile without recording an attempt; it has learners
   on it today and this phase does not disturb it. The assessment routes are the
   path that remembers. */
const store = require("../b2/assessment_store");
/* core-2026b content comes from the database through this provider; core-2026a
   still comes from its frozen registry. See b2/assessment_content.js. */
const assessmentContent = require("../b2/assessment_content");

/** Which production version "Take a quick test" should open next for this
    learner — core-2026b-v1, then v2, then v3, then none left. Server decides;
    the client never hardcodes a version id. Literal path, so it is registered
    before the `:attemptId` routes below. */
router.get("/assessment/current-diagnostic", async (req, res) => {
  const version = await store.currentDiagnosticVersion(req.userId);
  res.json({ version, exhausted: !version });
});

/** Start, or resume the one already open. A refresh must not open a second.
    `version` starts a fixed production version (core-2026b) from the DATABASE;
    without it, the core-2026a composer runs as before (used only for a
    core-2026a retest, never by the "Take a quick test" CTA any more). */
router.post("/assessment/start", async (req, res) => {
  const version = req.body?.version;
  const a = version
    ? await store.startVersion(req.userId, version)
    : await store.startAssessment(req.userId, { force: !!req.body?.force });
  if (a?.error) return res.status(400).json(a);
  if (a?.exhausted) return res.status(409).json(a);
  res.json(a);
});

router.get("/assessment/current", async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id FROM b2_paper_attempts
      WHERE user_id=$1 AND kind='assessment' AND finished_at IS NULL
      ORDER BY id DESC LIMIT 1`, [req.userId]);
  if (!rows[0]) return res.json({ attemptId: null });
  res.json(await store.getAssessment(rows[0].id));
});

/* History and progress come BEFORE /:attemptId so that the literal paths are
   not swallowed by the parameter. */
router.get("/assessment/history", async (req, res) => res.json(await store.history(req.userId)));

router.get("/assessment/progress", async (req, res) => res.json(await store.progress(req.userId)));

/* VALIDATE THE PARAM ONCE, FOR EVERY ROUTE BELOW THAT USES IT — format AND
   OWNERSHIP. A non-numeric attemptId used to reach `Number(...)` -> NaN -> a
   Postgres 22P02 error inside an unguarded async handler, crashing the whole
   process for every learner — confirmed live; the format check closes that.
   The ownership check closes a separate, equally real hole the audit found:
   `getAssessment`/`result` fetched `b2_paper_attempts` by id ALONE, no
   user_id filter, so a valid session for learner A could read learner B's
   attempt just by guessing a numeric id — an attempt id was never sufficient
   proof of ownership, only of existence. Both "doesn't exist" and "exists but
   isn't yours" return the SAME 404, so a caller cannot use the response to
   enumerate which attempt ids are real. */
router.param("attemptId", async (req, res, next, value) => {
  if (!/^\d+$/.test(value)) return res.status(400).json({ error: "invalid_attempt_id" });
  const { rows } = await pool.query(
    `SELECT user_id FROM b2_paper_attempts WHERE id=$1`, [Number(value)]);
  if (!rows[0] || rows[0].user_id !== req.userId) return res.status(404).json({ error: "unknown_attempt" });
  next();
});

router.get("/assessment/:attemptId", async (req, res) => {
  const a = await store.getAssessment(Number(req.params.attemptId));
  if (!a) return res.status(404).json({ error: "unknown_attempt" });
  res.json(a);
});

router.get("/assessment/:attemptId/result", async (req, res) => {
  const r = await store.result(Number(req.params.attemptId));
  if (!r) return res.status(404).json({ error: "unknown_attempt" });
  res.json(r);
});

router.put("/assessment/:attemptId/item/:itemId", async (req, res) => {
  const { response, skip } = req.body || {};
  /* Skipping is a first-class action with its own route shape, not an empty
     answer. An empty answer would be indistinguishable from a wrong one at the
     next layer down, and that is precisely the distinction this product refuses
     to lose. */
  const out = skip
    ? await store.skipItem(Number(req.params.attemptId), req.params.itemId)
    : await store.answerItem(Number(req.params.attemptId), req.params.itemId, response);
  if (out.error === "already_completed") return res.status(409).json(out);
  if (out.error) return res.status(400).json(out);
  res.json(out);
});

router.post("/assessment/:attemptId/finish", async (req, res) => {
  const out = await store.finishAssessment(Number(req.params.attemptId));
  if (out?.error) return res.status(404).json(out);
  res.json(out);
});

/* ── EXAM-PRACTICE PAPERS (Goethe/telc standalone sections) ───────────────
   Separate from the diagnostic assessment (kind='assessment', above) and
   from the bespoke Hören-Teil-1 engine (kind='paper', but its own
   /exam/:sectionId routes further down) — same content engine as
   core-2026b, different attempt bookkeeping. See b2/exam_paper.js. */
const examPaper = require("../b2/exam_paper");
router.get("/paper/complete", async (req, res) => {
  const { rows } = await pool.query(
    `SELECT p.id, p.board, p.title, p.minutes, p.source,
            count(DISTINCT s.id)::int AS section_count,
            count(i.id)::int AS item_count,
            array_agg(DISTINCT s.module) AS modules
       FROM b2_papers p
       JOIN b2_paper_sections s ON s.paper_id = p.id
       LEFT JOIN b2_paper_items i ON i.section_id = s.id
      WHERE p.id LIKE '%-complete-%'
      GROUP BY p.id, p.board, p.title, p.minutes, p.source
      ORDER BY (CASE WHEN p.board = 'goethe' THEN 1 ELSE 2 END), p.id`
  );
  res.json(rows);
});

router.get("/paper/board/:board", async (req, res) => {
  const board = req.params.board.toLowerCase();
  const { rows } = await pool.query(
    `SELECT p.id, p.board, p.title, p.minutes, p.source,
            count(DISTINCT s.id)::int AS section_count,
            count(i.id)::int AS item_count,
            array_agg(DISTINCT s.module) AS modules
       FROM b2_papers p
       LEFT JOIN b2_paper_sections s ON s.paper_id = p.id
       LEFT JOIN b2_paper_items i ON i.section_id = s.id
      WHERE lower(p.board) = $1
      GROUP BY p.id, p.board, p.title, p.minutes, p.source
      ORDER BY p.id`,
    [board]
  );
  res.json(rows);
});

router.post("/paper/:paperId/start", async (req, res) => {
  const out = await examPaper.startPaper(req.userId, req.params.paperId);
  if (out?.error) return res.status(404).json(out);
  res.json(out);
});

router.get("/paper/attempt/:attemptId", async (req, res) => {
  const out = await examPaper.getPaper(Number(req.params.attemptId));
  if (!out) return res.status(404).json({ error: "unknown_attempt" });
  res.json(out);
});

router.put("/paper/attempt/:attemptId/item/:itemId", async (req, res) => {
  const out = await examPaper.answerItem(Number(req.params.attemptId), req.params.itemId, req.body?.response);
  if (out.error === "already_completed") return res.status(409).json(out);
  if (out.error) return res.status(400).json(out);
  res.json(out);
});

router.post("/paper/attempt/:attemptId/finish", async (req, res) => {
  const out = await examPaper.finishPaper(Number(req.params.attemptId));
  if (out?.error) return res.status(404).json(out);
  res.json(out);
});

/* ── Curriculum ──────────────────────────────────────────────────────────
   B2 topics live in the same `topics` table as A1, separated by `level`. They
   are returned UNGATED: nothing here says "locked". A1's linear journey is a
   beginner's scaffold; a B2 learner has an exam date and should be able to open
   whichever of the four topics answers the mistake she just made.

   req.userId comes from the verified session (see the requireAuth mount
   above) — the service layer has always taken userId as an explicit
   argument, so wiring real auth only ever had to change the routes layer. */
router.get("/curriculum", async (req, res) => {
  res.json(await b2curriculum.listTopics(req.userId));
});

/* The one thing behind the primary button on the B2 home screen. Returns a
   single action or null, never a list — choosing between four is work the
   learner should not do at the end of a shift. */
/* ONE recommender. `b2/curriculum.js` also has a nextAction — it predates the
   profile layer, knows nothing about goals or evidence, and ranks by topic
   order. Both were live, so the home screen and the profile screen recommended
   different things to the same learner on the same data. `profile.nextAction`
   is the one that reads the goal and the evidence, so it wins everywhere. */
router.get("/next", async (req, res) => {
  res.json(await profile_.nextAction(req.userId));
});

/* THE PERFORMANCE REPORT — composed from the assessment delta, the six-
   dimension evidence profile and the same recommendation Home uses. See
   b2/report.js for why nothing here computes its own score. */
router.get("/report", async (req, res) => {
  res.json(await require("../b2/report").buildReport(req.userId));
});

/* THE COACH — four fixed questions, answered only from the report above.
   Deterministic, no LLM call. See b2/coach.js. */
router.get("/coach", async (req, res) => {
  res.json(await require("../b2/coach").coachAdvice(req.userId));
});

/* PRACTICE MODE — targeted skill/capability drilling, distinct from EXAM
   PRACTICE below (board IN goethe/telc). See b2/practice.js: only
   board='custom' papers surface here, discovered from real content, never
   hard-coded. Sessions run through the exact same /paper/* routes as exam
   practice — no second attempt engine. */
router.get("/practice/categories", async (req, res) => {
  res.json(await require("../b2/practice").categories());
});
router.get("/practice/weak", async (req, res) => {
  res.json(await require("../b2/practice").weakAreaRecommendation(req.userId));
});

/* Practice by skill lists every paper EXCEPT full exam papers (their own
   header), the placement tests, and gx_* sections, which run on the bespoke
   /exam engine and open empty through /paper/* (reachable as a topic instead).
   Grammar and vocabulary drills have no card of their own, so they sit under
   Reading beside Sprachbausteine rather than being unreachable. */
const PRACTICE_PAPER_FILTER =
  "p.id NOT LIKE 'core-2026b%' AND p.id NOT LIKE '%-complete-%' AND p.id NOT LIKE 'gx\\_%'";
const READING_FAMILY = ["reading", "grammar", "vocabulary"];

router.get("/practice/counts", async (req, res) => {
  const { rows } = await pool.query(
    `SELECT s.skill, count(DISTINCT p.id)::int AS count
       FROM b2_papers p
       JOIN b2_paper_sections s ON s.paper_id = p.id
      WHERE ${PRACTICE_PAPER_FILTER}
      GROUP BY s.skill`
  );
  const counts = { reading: 0, listening: 0, writing: 0, speaking: 0 };
  for (const r of rows) {
    if (READING_FAMILY.includes(r.skill)) counts.reading += r.count;
    else if (counts[r.skill] !== undefined) counts[r.skill] += r.count;
  }
  res.json(counts);
});

router.get("/practice/skill/:skill", async (req, res) => {
  const skill = req.params.skill.toLowerCase();
  const { rows } = await pool.query(
    `SELECT p.id, p.board, p.title, p.minutes, p.source,
            count(DISTINCT s.id)::int AS section_count,
            count(i.id)::int AS item_count,
            array_agg(DISTINCT s.module) AS modules,
            array_agg(DISTINCT s.skill) AS skills
       FROM b2_papers p
       JOIN b2_paper_sections s ON s.paper_id = p.id
       LEFT JOIN b2_paper_items i ON i.section_id = s.id
      WHERE (s.skill = $1 OR ($1 = 'reading' AND s.skill = ANY($2)) OR (s.module = 'hoeren' AND $1 = 'listening'))
        AND ${PRACTICE_PAPER_FILTER}
      GROUP BY p.id, p.board, p.title, p.minutes, p.source
      ORDER BY (CASE WHEN p.board = 'goethe' THEN 1 WHEN p.board = 'telc' THEN 2 ELSE 3 END), p.id`,
    [skill, READING_FAMILY]
  );
  res.json(rows);
});

/* Everything the audio player and the reader need for one source: the sections
   with their URLs, the markers, and the transcript. The SCRIPT is included so a
   learner can read along after the second listen — reading along while listening
   is a different, easier skill, so the client gates it. */
router.get("/sources/:id", async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id, title, hook, kind, duration_s, audio_url, markers, script, transcript,
            declaration->'sections' AS sections, status
       FROM b2_sources WHERE id=$1 AND status IN ('approved','live')`, [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: "source not found or not published" });
  res.json(rows[0]);
});

/* ── SCREENING ───────────────────────────────────────────────────────────
   Eleven minutes, six dimensions, and it ends by handing straight over to the
   first practice. Never a dead-end score screen. */

router.get("/screening", (req, res) => {
  const { SCREENING } = require("../seed/b2/screening");
  // Keys and explanations are NOT sent with the questions. A learner who can
  // read the answer out of the payload is not being screened.
  res.json({
    ...SCREENING,
    sections: SCREENING.sections.map(sec => ({
      ...sec,
      items: (sec.items || []).map(({ answer, why, check_id, capability, ...safe }) => safe),
    })),
  });
});

router.post("/screening/submit", async (req, res) => {
  const { SCREENING } = require("../seed/b2/screening");
  const { answers = {}, text = "", goal = "unsure", board = null, examDate = null } = req.body || {};

  await profile_.setGoal(req.userId, { goal, board, examDate });

  const evidence = [];
  const marked = {};

  for (const sec of SCREENING.sections) {
    for (const item of sec.items || []) {
      const given = answers[item.id];
      // Unanswered is not wrong — a skipped section must not band her badly.
      if (given === undefined || given === null) continue;
      const ok = given === item.answer;
      marked[item.id] = { ok, answer: item.answer, why: item.why };
      evidence.push({
        dimension: sec.key === "reading" ? "reading" : sec.key === "listening" ? "listening" : sec.key,
        checkId: item.check_id || null,
        capability: item.capability || null,
        outcome: ok ? 1 : 0,
        sourceKind: "screening",
        sourceRef: `${SCREENING.id}:${item.id}`,
      });
    }
  }

  /* The written text is scored by the same engine that marks real submissions —
     the whole point of the check_id spine. Too short is not a failure here: we
     simply gather no writing evidence rather than banding her on nothing. */
  let writing = null;
  const WRITING_FLOOR = 45;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  if (wordCount > 0 && wordCount < WRITING_FLOOR) {
    /* Say so rather than silently producing a profile with a hole in it. Under
       this length there is not enough language to judge, and a band built on
       forty words would be a number that means nothing. */
    writing = { wordCount, skipped: true,
      reason: `Sie haben ${wordCount} Wörter geschrieben. Für eine faire Einschätzung Ihres Schreibens brauchen wir etwa ${WRITING_FLOOR}. Das holen wir später nach.` };
  }
  if (wordCount >= WRITING_FLOOR) {
    /* The screening's writing prompt is a short free response, so it goes
       through the free_response profile — not the Forumsbeitrag check set that
       used to be hardcoded here. Same task-aware pipeline as /produce; there is
       one place that decides which checks apply.
       This is a DELIBERATE, explicit choice of the free_response genre — not
       the silent-absence case /produce used to have. There is exactly one
       possible genre for a screening prompt, so naming it plainly is correct;
       it resolves with `fallback: false` because it names a real profile key. */
    const task = { target_words: 60, task_type: tasks.DEFAULT };
    const { profile: wProfile, findings: wFindings } = tasks.assessForTask(text, task);

    for (const f of wFindings) {
      evidence.push({
        dimension: "writing", checkId: f.check_id,
        capability: caps.capabilityForCheck(f.check_id),
        outcome: f.state === "pass" ? 1 : f.state === "warn" ? 0.5 : 0,
        weight: wProfile.evidenceWeight,
        sourceKind: "screening", sourceRef: `${SCREENING.id}:writing`, detail: f.detail,
      });
    }
    const worst = tasks.topFinding(wFindings);
    writing = {
      wordCount,
      taskType: task.task_type,
      finding: worst && { check_id: worst.check_id, working_on: caps.findingPhrase(worst.check_id),
                          detail: worst.detail, evidence: worst.evidence },
    };
  }

  await profile_.recordMany(req.userId, evidence);

  const [prof, next] = await Promise.all([profile_.getProfile(req.userId), profile_.nextAction(req.userId)]);
  res.json({ marked, writing, profile: prof, next, goal: (await profile_.getGoal(req.userId)) });
});

/** Where she stands, on its own — for a return visit. */
router.get("/profile", async (req, res) => {
  const [prof, goal, next] = await Promise.all([
    profile_.getProfile(req.userId), profile_.getGoal(req.userId), profile_.nextAction(req.userId),
  ]);
  res.json({ profile: prof, goal: { goal: goal.goal, label: goal.label, why: goal.why, board: goal.board }, next });
});

/* Free written production from inside a training session.
   Distinct from /submissions, which is the full exam-task path with a rubric and
   a board. This is shorter, has no rubric, and exists to do three things: refuse
   what is not yet an answer, record evidence, and hand back exactly ONE thing to
   fix. A dozen findings is marking; one is teaching. */
router.post("/produce", async (req, res) => {
  const { text = "", experienceId = null, taskType = null, taskId = null,
          composeMs = null, pasteEvents = 0, capabilities = [] } = req.body || {};

  /* The task decides which checks apply. A stored task carries its own type;
     a bare training prompt with an EXPLICIT taskType gets that genre.
     Deliberately NOT `taskType || tasks.DEFAULT`: manufacturing a real
     `task_type: "free_response"` here for a caller that sent nothing meant
     task_profiles.js's own fallback detection never saw an absence — it saw a
     perfectly valid, explicitly-requested genre, and reported `fallback:
     false` accordingly. That is a second copy of the exact silent-default bug
     this file exists to fix, one level up from where task_profiles.js already
     closed it. `task_type` is left undefined when nothing was given, so
     assessForTask's own UNSPECIFIED path runs and is visible in the response
     (`taskTypeFallback: true`) instead of reading as a deliberate choice. */
  let task = { target_words: 70, task_type: taskType || undefined, content_points: [] };
  if (taskId) {
    const { rows } = await pool.query(
      `SELECT t.target_words, t.content_points, r.task_type, r.board
         FROM b2_tasks t JOIN b2_rubrics r ON r.id = t.rubric_id WHERE t.id=$1`, [taskId]);
    if (rows[0]) task = { ...rows[0], target_words: rows[0].target_words || 70 };
  }

  const g = gate(text, task);
  if (!g.ok) return res.status(422).json({ refused: true, reason: g.reason, message: g.message });

  const { profile, findings, suppressed, metrics } = tasks.assessForTask(text, task);
  const top = tasks.topFinding(findings, capabilities);

  /* Evidence comes ONLY from checks this genre is scored on. Recording a
     suppressed failure would poison the profile with a judgement we have just
     said does not apply. When the task type itself was unrecognised or
     missing, `profile.fallback` is true (see task_profiles.js) — evidence
     still records (a guessed-but-broad check set is still a real signal, and
     refusing to record anything would make the underlying caller bug
     invisible rather than visible), but every row says so, so the gap is
     traceable in the data rather than only in a server log. */
  await profile_.recordMany(req.userId, findings.map(f => ({
    dimension: "writing",
    checkId: f.check_id,
    capability: caps.capabilityForCheck(f.check_id),
    outcome: f.state === "pass" ? 1 : f.state === "warn" ? 0.5 : 0,
    weight: profile.evidenceWeight,
    sourceKind: experienceId ? "experience" : "submission",
    sourceRef: experienceId,
    detail: profile.fallback ? `[no task_type given] ${f.detail}` : f.detail,
  })));

  res.json({
    taskType: task.task_type || null,
    /* VISIBLE STATE, per the fix: a caller can tell "we scored this as a
       deliberate free_response" apart from "nobody told us what this was, so
       we guessed" without having to compare taskLabel strings. */
    taskTypeFallback: profile.fallback,
    taskLabel: profile.label,
    framing: profile.framing,
    wordCount: metrics.wordCount,
    finding: top && {
      check_id: top.check_id,
      capability: caps.capabilityForCheck(top.check_id),
      working_on: caps.findingPhrase(top.check_id),
      state: top.state,
      detail: top.detail,
      evidence: top.evidence,
    },
    passed: findings.filter(f => f.state === "pass").length,
    total: findings.length,
    // Returned for the review surface, never shown to a learner.
    suppressed,
    integrity: integrity({ pasteEvents, composeMs, wordCount: metrics.wordCount }),
  });
});

/* ── THE WRITING LOOP ────────────────────────────────────────────────────
   WRITE → ASSESS → ONE WEAKNESS → MICRO-LESSON → REWRITE → COMPARE.

   Deliberately NOT another writing scorer: assessment goes through the same
   task-aware pipeline as /produce and the screening. What is new here is
   everything after the assessment — choosing the one thing worth saying,
   checking a learning route exists before saying it, and measuring whether the
   rewrite actually fixed THAT feature. */
const loop = require("../b2/writing_loop");

async function taskById(id) {
  const { rows } = await pool.query(
    `SELECT t.id, t.prompt_de, t.content_points, t.target_words, r.task_type, r.board
       FROM b2_tasks t JOIN b2_rubrics r ON r.id = t.rubric_id WHERE t.id=$1`, [id]);
  return rows[0] || null;
}

/* The writing screen. The prompt, the points, the target length — and the
   learner's own unfinished draft if they walked away from one. No rubric, no
   model answer, no phrases to game the assessment with. */
router.get("/write/:taskId", async (req, res) => {
  const task = await taskById(req.params.taskId);
  if (!task) return res.status(404).json({ error: "unknown task" });
  const p = tasks.profileFor(task.task_type);
  const [draft, prev] = await Promise.all([
    pool.query(`SELECT text, parent_id FROM b2_drafts WHERE user_id=$1 AND task_id=$2`, [req.userId, task.id]),
    pool.query(`SELECT id, text, targeted_check FROM b2_submissions
                 WHERE user_id=$1 AND task_id=$2 ORDER BY id DESC LIMIT 1`, [req.userId, task.id]),
  ]);
  res.json({
    taskId: task.id, board: task.board, taskType: task.task_type, taskLabel: p.label,
    prompt: task.prompt_de,
    points: (task.content_points || []).map(x => x.label_de || x.id),
    targetWords: task.target_words,
    framing: p.framing,
    draft: draft.rows[0]?.text || null,
    lastAttemptId: prev.rows[0]?.id || null,
  });
});

/* LOSING SOMEBODY'S WRITING IS THE ONE FAILURE THIS PRODUCT CANNOT RECOVER
   FROM. The draft is saved as they type and survives closing the tab. */
router.put("/write/:taskId/draft", async (req, res) => {
  const text = String(req.body?.text || "");
  if (!text.trim()) {
    await pool.query(`DELETE FROM b2_drafts WHERE user_id=$1 AND task_id=$2`, [req.userId, req.params.taskId]);
    return res.json({ saved: false });
  }
  await pool.query(
    `INSERT INTO b2_drafts (user_id, task_id, parent_id, text) VALUES ($1,$2,$3,$4)
     ON CONFLICT (user_id, task_id) DO UPDATE SET text=$4, parent_id=$3, updated_at=now()`,
    [req.userId, req.params.taskId, req.body?.parentId || null, text]);
  res.json({ saved: true });
});

/**
 * Submit — first attempt or rewrite.
 *
 * A rewrite carries `parentId`, and that changes what happens in three ways:
 * the submission is linked rather than counted as a fresh occasion, the
 * comparison runs on the check the learner was told to fix, and
 * `language_awareness` becomes earnable — but only if the feature actually
 * moved.
 */
router.post("/write/:taskId/submit", async (req, res) => {
  const task = await taskById(req.params.taskId);
  if (!task) return res.status(404).json({ error: "unknown task" });

  const text = String(req.body?.text || "");
  const parentId = req.body?.parentId ? Number(req.body.parentId) : null;
  const experienceId = req.body?.experienceId || null;

  const g = gate(text, task);
  if (!g.ok) return res.status(422).json({ refused: true, reason: g.reason, message: g.message });

  let parent = null;
  if (parentId) {
    const { rows } = await pool.query(
      `SELECT id, text, targeted_check FROM b2_submissions WHERE id=$1 AND user_id=$2 AND task_id=$3`,
      [parentId, req.userId, task.id]);
    parent = rows[0] || null;
    /* A rewrite whose original cannot be found is not a rewrite. Treating it as
       one would let the loop claim an improvement it never observed. */
    if (!parent) return res.status(409).json({ error: "no such original attempt for this task" });
  }

  const { profile, findings, suppressed, metrics } = tasks.assessForTask(text, task);

  /* Was the thing we taught actually fixed? Only meaningful on a rewrite, and
     only ever about the check the learner was pointed at. */
  const targeted = parent?.targeted_check || null;
  const cmp = parent && targeted ? loop.compare(parent.text, text, targeted, task) : null;

  const { rows: [row] } = await pool.query(
    `INSERT INTO b2_submissions
       (user_id, task_id, text, word_count, attempt_no, compose_ms, paste_events,
        integrity_flag, parent_id, experience_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
    [req.userId, task.id, text, metrics.wordCount, parent ? 2 : 1,
     req.body?.composeMs || null, req.body?.pasteEvents || 0,
     integrity({ pasteEvents: req.body?.pasteEvents || 0, composeMs: req.body?.composeMs, wordCount: metrics.wordCount }),
     parent?.id || null, experienceId]);

  /* Which weakness — and only one the learner can be sent somewhere to fix. */
  const routes = await loop.routesFor();
  const recentlyPassed = new Set((await pool.query(
    `SELECT DISTINCT check_id FROM b2_evidence
      WHERE user_id=$1 AND dimension='writing' AND outcome=1 AND check_id IS NOT NULL
        AND created_at > now() - interval '30 days'`, [req.userId])).rows.map(r => r.check_id));
  /* No goal weighting here on purpose. GOALS.critical names DIMENSIONS
     (writing, speaking, …) and every finding in this loop is already a writing
     finding, so the goal cannot separate them. Passing an empty list and
     pretending otherwise would be a knob that does nothing. */
  const pick = loop.selectWeakness(findings, { routes, recentlyPassed,
    impact: profile.impact || [], text, unsurePoints: metrics.unsurePoints || [] });

  /* Evidence. Findings from the applicable check set as before — plus, on a
     rewrite that demonstrably fixed its target, language_awareness. An occasion
     is the ATTEMPT CHAIN, not the submission: a first draft and its rewrite are
     one demonstration of one text, and counting them as two would let a single
     evening look like sustained evidence. */
  const chain = parent?.id || row.id;
  const evidence = findings.map(f => ({
    dimension: "writing",
    checkId: f.check_id,
    capability: caps.capabilityForCheck(f.check_id),
    outcome: f.state === "pass" ? 1 : f.state === "warn" ? 0.5 : 0,
    weight: profile.evidenceWeight,
    sourceKind: "submission",
    sourceRef: `write${chain}:${row.id}`,
    detail: f.detail,
  }));
  const awareness = loop.awarenessEvidence(cmp || {}, { isRewrite: !!parent, targetedCheck: targeted });
  await profile_.recordMany(req.userId, [
    ...evidence,
    ...awareness.map(e => ({ ...e, sourceKind: "submission", sourceRef: `write${chain}:${row.id}`,
                             detail: cmp ? `${targeted}: ${cmp.reason}` : null })),
  ]);

  /* Record what this attempt was told to work on, so its rewrite can be
     compared against the right thing. */
  if (pick.finding) {
    await pool.query(`UPDATE b2_submissions SET targeted_check=$2 WHERE id=$1`, [row.id, pick.finding.check_id]);
  }
  await pool.query(`DELETE FROM b2_drafts WHERE user_id=$1 AND task_id=$2`, [req.userId, task.id]);

  res.json({
    submissionId: row.id,
    isRewrite: !!parent,
    taskLabel: profile.label,
    board: task.board,
    wordCount: metrics.wordCount,
    /* What went RIGHT, in one line — a learner told only what is wrong stops
       writing. Counted from the checks this genre is actually scored on. */
    strengths: findings.filter(f => f.state === "pass").map(f => caps.findingPhraseDe(f.check_id)).slice(0, 2),
    weakness: pick.finding && {
      checkId: pick.finding.check_id,
      workingOn: caps.findingPhraseDe(pick.finding.check_id),
      detail: pick.finding.detail,
      yourSentence: loop.locate(text, pick.finding),
      route: pick.route && { kind: pick.route.kind, topicId: pick.route.topicId, title: pick.route.title },
      why: pick.reason,
    },
    /* An honest "nothing to send you to" rather than a manufactured fault. */
    none: pick.none,
    comparison: cmp && {
      improved: cmp.improved, reason: cmp.reason,
      /* The countable change, already in German. Composed here rather than
         sent as (check id + two numbers) for the component to interpret: the
         check id is our database, and every check → learner-language mapping
         in this product lives in capabilities.js. */
      changed: caps.changeLineDe(targeted, cmp.measureBefore, cmp.measureAfter),
      stateBefore: cmp.stateBefore, stateAfter: cmp.stateAfter,
      measureBefore: cmp.measureBefore, measureAfter: cmp.measureAfter,
      workingOn: caps.findingPhraseDe(targeted),
      before: parent.text, after: text,
    },
    awarded: awareness.map(e => e.capability),
    suppressed,          // review surface only, never shown to a learner
  });
});

/* ── MAYA ────────────────────────────────────────────────────────────────
   Conversation, not a branching script. The learner writes their own German;
   what Maya says next depends on what they actually did. State is held by the
   client and echoed back, so a dropped connection costs the turn and not the
   conversation. */

/* ── EXPRESSIONS ─────────────────────────────────────────────────────────
   Everything a chunk step needs at runtime. The regexes that decide whether an
   expression was USED rather than pasted live in code, so the client never sees
   them — a learner who can read the frame check out of the payload is writing
   to a pattern, not making a point. */
const expressions = require("../b2/expressions");
const chunks = require("../b2/chunks");

/* One expression, in the post it was written in. `pattern` and `frame` are
   deliberately withheld. */
router.get("/expressions/:id", async (req, res) => {
  const x = expressions.get(req.params.id);
  if (!x) return res.status(404).json({ error: "unknown expression" });
  await expressions.advance(req.userId, x.id, "noticed", x.sourceId);
  res.json({
    id: x.id, citation: x.citation, gloss: x.gloss, who: x.who,
    occurrence: x.occurrence, does: x.does, notThis: x.notThis,
    sourceId: x.sourceId, stage: await expressions.stageOf(req.userId, x.id),
  });
});

/* A recognition item was answered. Lower weight than production on purpose:
   choosing the right move from three is a real signal and a much weaker one
   than making the move. */
router.post("/expressions/:id/chose", async (req, res) => {
  const x = expressions.get(req.params.id);
  if (!x) return res.status(404).json({ error: "unknown expression" });
  const correct = req.body?.correct === true;
  const r = chunks.checkChoice(x, correct);
  await profile_.recordMany(req.userId, r.evidence.map(e => ({
    /* The OCCASION is the leading segment of source_ref (profile.js splits on
       ':'), so it has to identify the demonstration, not the content type. An
       earlier version wrote `chunk:<id>:…`, which made every expression the
       learner ever met — this week and next — a single occasion, permanently.
       Keying on the expression means two expressions produced in one sitting
       count as two demonstrations, and recognising then producing the SAME
       expression counts as one. That under-claims rather than over-claims,
       which is the direction this system errs in. */
    ...e, sourceKind: "experience", sourceRef: `${x.id}:${req.body?.stepRef || "choose"}`,
  })));
  if (r.stage) await expressions.advance(req.userId, x.id, r.stage, x.sourceId);
  res.json({ ok: true, stage: await expressions.stageOf(req.userId, x.id) });
});

/* PRODUCTION. The only step in this experience that generates strong evidence,
   and the only one that can fail for a reason worth telling the learner. */
router.post("/expressions/:id/produce", async (req, res) => {
  const x = expressions.get(req.params.id);
  if (!x) return res.status(404).json({ error: "unknown expression" });
  const text = String(req.body?.text || "");
  if (!text.trim()) {
    return res.status(422).json({ refused: true,
      message: "Schreiben Sie einen Satz — Ihren eigenen, nicht den aus dem Text." });
  }
  const r = chunks.checkProduction(x, text, { sourceSentence: x.occurrence });
  /* Evidence only when something was actually demonstrated — checkProduction
     returns none for an attempt that never used the expression, because
     recording 0.3 there would let the recommender believe it had measured
     something it did not. */
  if (r.evidence.length) {
    await profile_.recordMany(req.userId, r.evidence.map(e => ({
      ...e, sourceKind: "submission", sourceRef: `${x.id}:produce`,
      detail: r.ok ? null : r.reasons.join(","),
    })));
  }
  if (r.stage) await expressions.advance(req.userId, x.id, r.stage, x.sourceId);
  res.json({
    ok: r.ok,
    /* One line. Never a report. */
    say: r.ok ? r.praise : r.improve,
    stage: await expressions.stageOf(req.userId, x.id),
  });
});

/* GRAMMAR USE. One check per communicative function, named by the step; the
   conditions live in b2/grammar.js and are never sent to the client, because a
   learner who can read the conditions writes to them instead of writing what
   they mean. */
const grammar = require("../b2/grammar");

router.post("/grammar/:check/use", async (req, res) => {
  const check = grammar.USE_CHECKS[req.params.check];
  if (!check) return res.status(404).json({ error: "unknown check" });
  const text = String(req.body?.text || "");
  if (!text.trim()) {
    return res.status(422).json({ refused: true,
      message: "Schreiben Sie Ihren Satz — Ihre eigene Situation, nicht die aus dem Text." });
  }
  const r = grammar.checkUse(check, text, { sourceSentence: String(req.body?.quote || "") });
  /* Evidence only when the learner demonstrated the function. checkUse returns
     none for a copied sentence and none for one that made no hypothetical or
     conceded nothing — reaching the end of a lesson is not a demonstration. */
  if (r.evidence.length) {
    await profile_.recordMany(req.userId, r.evidence.map(e => ({
      ...e,
      sourceKind: "submission",
      /* The occasion is the leading segment: one per function, so producing an
         irrealis and a concession are two demonstrations. */
      sourceRef: `${req.params.check}:use`,
      detail: r.ok ? null : r.reasons.join(","),
    })));
  }
  /* Record the demonstration on the same ladder expressions use. Nothing acts
     on it yet: the next rung for a construction is defending it in a Maya
     conversation or meeting it under exam conditions, and neither carries these
     functions today. Writing it down now means the data is true when they do —
     and it is deliberately NOT used to filter this experience's steps, because
     dropping the production step would leave a return visit with recognition
     only, which is the failure this whole model exists to prevent. */
  if (r.stage) await expressions.advance(req.userId, `grammar:${req.params.check}`, r.stage, req.body?.sourceId || null);

  res.json({ ok: r.ok, say: r.ok ? r.praise : r.improve, met: r.met });
});

/* Every scenario file in src/seed/b2/maya/ is loaded automatically — a new
   scenario needs only a new file there plus a topics-table entry
   (seed_b2_maya.js), never an edit here. Each is registered under both its
   full id ("maya_x") and the short alias ("x"), exactly as the four
   hand-registered scenarios were before this became a directory scan. The
   four original files (schichttausch/homeoffice/vorschlag/unerwartet) are
   unchanged — only this loading mechanism is new. */
const MAYA_DIR = path.join(__dirname, "../seed/b2/maya");
const SCENARIOS = {};
for (const file of fs.readdirSync(MAYA_DIR).filter(f => f.endsWith(".js"))) {
  const sc = require(path.join(MAYA_DIR, file));
  SCENARIOS[sc.id] = sc;
  SCENARIOS[sc.id.replace(/^maya_/, "")] = sc;
}

router.get("/maya/:id", async (req, res) => {
  const sc = SCENARIOS[req.params.id];
  if (!sc) return res.status(404).json({ error: "unknown scenario" });

  let activeSession = null;
  try {
    activeSession = await maya.getActiveSession(req.userId, sc.id);
  } catch (err) {
    console.warn("Could not query active Maya session:", err.message);
  }

  // The brief, opening, and session state. Beats, presses, and model phrases are
  // withheld: a learner who can read Maya's next move is rehearsing, not conversing.
  res.json({
    id: sc.id,
    version: sc.version || 1,
    title: sc.title,
    minutes: sc.minutes,
    roles: sc.roles,
    brief: sc.brief,
    opening: sc.opening,
    firstSay: sc.first_say || sc.beats[0].say,
    totalBeats: sc.beats.length,
    maxLearnerTurns: sc.max_learner_turns || 7,
    session: activeSession ? {
      sessionId: activeSession.session_id,
      currentBeat: activeSession.current_beat,
      pressCount: activeSession.press_count,
      learnerTurnsCount: activeSession.learner_turns_count,
      dialogueLog: activeSession.dialogue_log,
      turns: activeSession.turns,
      status: activeSession.status,
      done: activeSession.status !== "active",
      terminalOutcome: activeSession.terminal_outcome,
    } : null,
  });
});

router.post("/maya/:id/start", async (req, res) => {
  const sc = SCENARIOS[req.params.id];
  if (!sc) return res.status(404).json({ error: "unknown scenario" });
  try {
    const session = await maya.startSession(req.userId, sc);
    res.json({
      sessionId: session.session_id,
      currentBeat: session.current_beat,
      dialogueLog: session.dialogue_log,
      status: session.status,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/maya/:id/reset", async (req, res) => {
  const sc = SCENARIOS[req.params.id];
  if (!sc) return res.status(404).json({ error: "unknown scenario" });
  try {
    await pool.query(
      `UPDATE b2_maya_sessions SET status='abandoned', updated_at=now()
        WHERE user_id=$1 AND scenario_id=$2 AND status='active'`,
      [req.userId, sc.id]
    );
    res.json({ abandoned: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/maya/:id/turn", async (req, res) => {
  const sc = SCENARIOS[req.params.id];
  if (!sc) return res.status(404).json({ error: "unknown scenario" });
  const { text = "", sessionId = null, state: legacyState = null, history = [] } = req.body || {};

  if (!text.trim()) {
    return res.status(422).json({
      refused: true,
      reason: "empty",
      message: "Schreiben Sie Ihre Antwort — auch ein Satz reicht für den Anfang.",
    });
  }

  // Load or initialize session
  let dbSession = null;
  if (sessionId) {
    const { rows } = await pool.query(
      `SELECT * FROM b2_maya_sessions WHERE session_id=$1 AND user_id=$2`,
      [sessionId, req.userId]
    ).catch(() => ({ rows: [] }));
    dbSession = rows[0] || null;
  }
  if (!dbSession && !legacyState) {
    try {
      dbSession = (await maya.getActiveSession(req.userId, sc.id)) || (await maya.startSession(req.userId, sc));
    } catch {
      // In-memory fallback if DB not accessible
    }
  }

  // Determine current working state
  let currentState = {
    current_beat: dbSession?.current_beat || legacyState?.current_beat || legacyState?.beatId || sc.beats[0].id,
    press_count: dbSession?.press_count ?? legacyState?.press_count ?? legacyState?.pressCount ?? 0,
    learner_turns_count: dbSession?.learner_turns_count ?? legacyState?.learner_turns_count ?? legacyState?.turnsCount ?? 0,
    memory: dbSession?.memory || legacyState?.memory || {},
    index: legacyState?.index ?? 0,
  };

  const currentTurns = dbSession?.turns || history || [];
  const currentLog = dbSession?.dialogue_log || [];

  const turn = maya.readTurn(text);
  const move = maya.nextMove(sc, currentState, turn);

  const activeSessionId = dbSession?.session_id || sessionId || `maya_${sc.id}_${Date.now()}`;
  const newTurnRecord = {
    turnNumber: currentState.learner_turns_count + 1,
    text,
    beat: currentState.current_beat,
    moves: turn.moves,
    substantive: turn.substantive,
  };
  const updatedTurns = [...currentTurns, newTurnRecord];

  const updatedLog = [
    ...currentLog,
    { who: "me", text },
    { who: "maya", text: move.say, nudge: move.nudge },
  ];

  if (move.done) {
    const summary = maya.summarise(sc, updatedTurns, {
      ...move.state,
      status: move.outcome || "resolved",
      outcome: move.outcome,
      memory: move.state?.memory,
    });

    // Mark session finished in DB
    if (dbSession) {
      await maya.saveSessionTurn(activeSessionId, {
        current_beat: move.state?.current_beat || "closing",
        press_count: move.state?.press_count || 0,
        learner_turns_count: move.state?.learner_turns_count || currentState.learner_turns_count + 1,
        dialogue_log: updatedLog,
        turns: updatedTurns,
        memory: move.state?.memory || {},
        status: move.outcome || "resolved",
        terminal_outcome: move.outcome || "resolved",
        finished: true,
      }).catch(err => console.warn("Could not save terminal Maya session:", err.message));
    }

    // IDEMPOTENT EVIDENCE INSERTION:
    // Key evidence by source_ref = "maya_<scenarioId>:<sessionId>"
    // Check if evidence already exists so duplicate POSTs / reloads never duplicate evidence rows!
    const sourceRef = `maya_${sc.id}:${activeSessionId}`;
    const { rows: existingEv } = await pool.query(
      `SELECT 1 FROM b2_evidence WHERE user_id=$1 AND source_kind='conversation' AND source_ref=$2`,
      [req.userId, sourceRef]
    ).catch(() => ({ rows: [] }));

    if (!existingEv.length) {
      await profile_.recordMany(req.userId, summary.evidence.map(e => ({
        ...e,
        sourceKind: "conversation",
        sourceRef,
      }))).catch(err => console.warn("Could not record Maya evidence:", err.message));
    }

    return res.json({
      done: true,
      say: move.say || sc.closing,
      outcome: move.outcome,
      summary: {
        verdict: summary.verdict,
        heldPosition: summary.heldPosition,
        adaptedToChange: summary.adaptedToChange,
        did: summary.did,
        missing: summary.missing,
        status: summary.status,
      },
      afterwards: sc.afterwards,
      sessionId: activeSessionId,
    });
  }

  // In-flight turn
  if (dbSession) {
    await maya.saveSessionTurn(activeSessionId, {
      current_beat: move.state?.current_beat,
      press_count: move.state?.press_count,
      learner_turns_count: move.state?.learner_turns_count,
      dialogue_log: updatedLog,
      turns: updatedTurns,
      memory: move.state?.memory,
      status: "active",
      finished: false,
    }).catch(err => console.warn("Could not save active Maya session turn:", err.message));
  }

  res.json({
    done: false,
    say: move.say,
    pressing: !!move.pressing,
    nudge: move.nudge || null,
    state: move.state,
    sessionId: activeSessionId,
  });
});

router.get("/tasks", async (req, res) => {
  const { board = "goethe", module: mod = "schreiben" } = req.query;
  const { rows } = await pool.query(
    `SELECT t.id, t.prompt_de, t.content_points, t.target_words, r.board, r.module, r.task_type, r.provisional
       FROM b2_tasks t JOIN b2_rubrics r ON r.id = t.rubric_id
      WHERE r.board=$1 AND r.module=$2`,
    [board, mod]
  );
  res.json(rows);
});

// Official free materials, deep-linked to their owners. We never mirror exam
// board content -- see b2/resources.js for why.
router.get("/resources", (req, res) => {
  const { board, weakness } = req.query;
  if (weakness) return res.json(resources.forWeakness(weakness, board || null));
  res.json(board ? resources.forBoard(board) : resources.RESOURCES);
});

// ── Interview practice ───────────────────────────────────────────────────
// A different job from the exam: these candidates mostly HAVE B2. What they
// need is the employer interview, which published guidance describes as a
// 30-60 minute video call that checks language rather than practical skill.
router.get("/interview/set", (req, res) => {
  const n = Math.min(10, Math.max(1, Number(req.query.n) || 5));
  const cats = req.query.categories ? String(req.query.categories).split(",") : null;
  // Never ship the trap detectors or model answers to the client — a learner who
  // can read the trap before answering is rehearsing the answer, not the skill.
  res.json(interview.practiceSet(n, { categories: cats }).map(q => ({
    id: q.id, de: q.de, category: q.category, assesses: q.assesses,
  })));
});

router.get("/interview/categories", (req, res) => res.json(interview.CATEGORIES));

router.post("/interview/answer", express.raw({ type: ["audio/*", "application/octet-stream"], limit: "25mb" }), async (req, res) => {
  const q = interview.QUESTIONS.find(x => x.id === req.query.q);
  if (!q) return res.status(404).json({ error: "unknown question" });
  if (!req.body?.length) return res.status(400).json({ error: "no audio received" });

  const turn = Number(req.query.turn) || 0;
  const tmp = path.join(os.tmpdir(), `iv-${Date.now()}${(req.headers["content-type"] || "").includes("wav") ? ".wav" : ".webm"}`);
  fs.writeFileSync(tmp, req.body);
  try {
    const spoken = await speech.assess(tmp);
    if (spoken?.noMatch) return res.status(422).json({
      refused: true, reason: "no_audio",
      message: "I couldn't hear anything. Check the mic is picking you up, then try again — nothing has been counted.",
    });
    if (!spoken) return res.status(503).json({ error: "speech_unavailable", message: "That recording could not be assessed. Nothing counted — try again." });
    const used = req.query.used ? String(req.query.used).split("|").filter(Boolean) : [];
    const graded = interview.gradeAnswer(q, spoken, turn);
    // The next thing the interviewer says is chosen from what they just did —
    // press a good answer, challenge the trap, ask for detail after a freeze.
    const probe = interview.nextProbe(q, graded, turn, used);
    // The model answer is released ONLY after they have answered — and only when
    // they need it. Handing it over first turns practice into recitation, which
    // is the habit the trainer is trying to break.
    const needsModel = graded.notes.some(n => n.state === "fail");
    res.json({
      question: { id: q.id, de: q.de }, turn, probe, ...graded,
      model: needsModel && interview.MODEL_ANSWERS[q.id]
        ? { text: interview.MODEL_ANSWERS[q.id], audio: `/b2/interview/model_${q.id}.mp3` }
        : null,
    });
  } finally { try { fs.unlinkSync(tmp); } catch {} }
});

// The whole session says more than the sum of its answers: five separate
// "some hesitation" notes are five data points; "you hesitated on four of five"
// is a finding the learner can act on.
router.post("/interview/summary", (req, res) => {
  const { answers = [] } = req.body || {};
  res.json(interview.sessionSummary(answers) || { total: 0, findings: [] });
});

// Speaking. Audio arrives as a raw body rather than multipart so no upload
// middleware is needed; the browser posts the Blob straight from MediaRecorder.
// One Azure call returns both halves of the verdict -- what they said and how.
router.post("/speaking", express.raw({ type: ["audio/*", "application/octet-stream"], limit: "25mb" }), async (req, res) => {
  if (!req.body?.length) return res.status(400).json({ error: "no audio received" });

  const ext = (req.headers["content-type"] || "").includes("wav") ? ".wav" : ".webm";
  const tmp = path.join(os.tmpdir(), `sc-in-${Date.now()}${ext}`);
  fs.writeFileSync(tmp, req.body);

  try {
    const reference = req.query.reference || "";   // read-aloud drills pass one; spontaneous tasks do not
    const a = await speech.assess(tmp, reference);
    if (a?.noMatch) {
      return res.status(422).json({
        refused: true, reason: "no_audio",
        message: "I couldn't hear anything. Check the mic is picking you up, then try again — nothing has been counted.",
      });
    }
    if (!a) {
      return res.status(503).json({
        error: "speech_unavailable",
        // Never a silent zero: a learner who recorded an answer and got a bad
        // score because our transcriber was down would have no way to know.
        message: "That recording could not be assessed. Nothing has been counted — try again.",
      });
    }

    const words = (a.text || "").trim().split(/\s+/).filter(Boolean).length;
    if (words < 12) {
      return res.status(422).json({
        refused: true, reason: "too_short", words,
        message: `Only ${words} words came through. There is not enough here to judge — have another go.`,
      });
    }

    res.json({
      transcript: a.text,
      display: a.display,
      durationSec: a.durationSec,
      confidence: a.confidence,
      pronunciation: a.scores,
      fluency: speech.pauseProfile(a),
      weakWords: speech.weakWords(a),
      unscripted: a.unscripted,
      // Recognition confidence is the learner's proxy for "was I audible".
      lowConfidence: a.confidence != null && a.confidence < 0.6,
    });
  } finally {
    try { fs.unlinkSync(tmp); } catch {}
  }
});

// Board recommendation from a skill profile. A decision table, not a model —
// see b2/recommend.js for why.
router.post("/recommend", (req, res) => {
  const { skills = {}, mandated = null, weeksToExam = null } = req.body || {};
  res.json(recommend(skills, { mandated, weeksToExam }));
});

router.post("/submissions", async (req, res) => {
  const { taskId, text, composeMs = null, pasteEvents = 0 } = req.body;
  if (!taskId || typeof text !== "string") return res.status(400).json({ error: "taskId and text required" });

  const taskRes = await pool.query(
    `SELECT t.*, r.id AS rubric_id, r.board, r.module, r.task_type, r.pass_mark,
            r.borderline_low, r.borderline_high, r.provisional
       FROM b2_tasks t JOIN b2_rubrics r ON r.id = t.rubric_id WHERE t.id=$1`,
    [taskId]
  );
  const task = taskRes.rows[0];
  if (!task) return res.status(404).json({ error: "task not found" });

  // Gate first. A refusal returns a reason and never a score, and deliberately
  // does not create a submission row -- it must not consume a paid quota.
  const g = gate(text, task);
  if (!g.ok) return res.status(422).json({ refused: true, ...g });

  /* telc Deutsch B1·B2 Pflege is scored on its own four criteria and reports a
     CEFR LEVEL, not a percentage against a pass mark. Running it through the
     general engine would hand a nurse a number their exam never produces. */
  if (task.board === "telc_pflege") {
    const p = pflege.score(text, task);
    /* Double-marked, the way telc does it. Korrektheit is the one band we cannot
       derive deterministically, and at temperature 0 the model still returned
       0, 2, 0 across three calls on the same short text — enough to swing a
       whole level, because the reported level is the weakest criterion. telc
       marks every script with two licensed raters and brings in a third on
       disagreement; we do the same and average, which cost one extra call and
       turned a wrong level into a right one on real examiner-marked scripts. */
    const rate = async () => {
      const m = await model.assess(text, task, task).catch(() => null);
      const k = m?.dimensions?.find(d => d.id === "korrektheit");
      return k ? Math.max(0, Math.min(5, Math.round((k.band / 3) * 5))) : null;
    };
    const marks = [await rate(), await rate()].filter(x => x !== null);
    if (marks.length === 2 && marks[0] !== marks[1]) {
      const third = await rate();
      if (third !== null) marks.push(third);
    }
    const k = marks.length
      ? { band: Math.round(marks.reduce((a, b) => a + b, 0) / marks.length) } : null;
    if (k && !p.voided) {
      p.criteria.korrektheit = { band: k.band, basis: `model · ${marks.length} raters`,
                                 detail: "Grammatik und Rechtschreibung." };
      const bands = Object.values(p.criteria).map(c => c.band).filter(b => b !== null);
      p.incomplete = false;
      p.points = bands.reduce((a, b) => a + b, 0);
      p.level = pflege.levelFor(Math.min(...bands));
      p.raters = marks;
    }
    return res.json({ board: "telc_pflege", provisional: task.provisional, pflege: p });
  }

  const det = analyse(text, task);
  const flag = integrity({ pasteEvents, composeMs, wordCount: det.metrics.wordCount });
  let attemptNo = 1;
  const m = await model.assessDoubleMarked(text, task, task);
  const v = compose(det, task, m);

  // ONE TRANSACTION. Submission, findings and verdict were three independent
  // writes: a failure between them left a scored submission with no verdict, or
  // findings with no parent — rows that look real to the calibration query and
  // are not. A calibration set cannot be cleaned retrospectively, so this has to
  // be all-or-nothing.
  const client = await pool.connect();
  let submissionId;
  try {
    await client.query("BEGIN");

    const attempt = await client.query(
      "SELECT COALESCE(MAX(attempt_no),0)+1 AS n FROM b2_submissions WHERE user_id=$1 AND task_id=$2",
      [req.userId, taskId]
    );

    const sub = await client.query(
      `INSERT INTO b2_submissions (user_id, task_id, text, word_count, attempt_no, compose_ms, paste_events, integrity_flag)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id, attempt_no`,
      [req.userId, taskId, text, det.metrics.wordCount, attempt.rows[0].n, composeMs, pasteEvents, flag]
    );
    submissionId = sub.rows[0].id;
    attemptNo = sub.rows[0].attempt_no;

    // One multi-row insert rather than a query per finding — eleven sequential
    // round trips inside a transaction held the connection far longer than needed.
    const rows = [
      ...det.findings.map(f => ["deterministic", f.check_id, f.state, f.detail, JSON.stringify(f.evidence)]),
      ...(m ? m.dimensions.map(d => ["model", d.id, d.band >= 2 ? "pass" : d.band === 1 ? "warn" : "fail",
        d.comment || "", JSON.stringify([d.evidence])]) : []),
    ];
    if (rows.length) {
      const values = rows.map((_, i) =>
        `($1,$${i * 5 + 2},$${i * 5 + 3},$${i * 5 + 4},$${i * 5 + 5},$${i * 5 + 6})`).join(",");
      await client.query(
        `INSERT INTO b2_findings (submission_id, source, check_id, state, detail, evidence) VALUES ${values}`,
        [submissionId, ...rows.flat()]
      );
    }

    await client.query(
      `INSERT INTO b2_verdicts (submission_id, rubric_id, predicted_score, ci_low, ci_high, borderline,
                                reasons, weakness_ids, next_action, model_available)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [submissionId, task.rubric_id, v.predicted_score, v.ci_low, v.ci_high, v.borderline,
       JSON.stringify(v.reasons), JSON.stringify(v.weakness_ids), v.top_weakness, v.model_available]
    );

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    // The learner's text is not lost to our database problem — they get the
    // verdict, we just did not manage to keep it.
    console.error("b2 submission write failed:", e.message);
    return res.status(500).json({
      error: "not_saved",
      message: "Your result is below, but we could not save it. Nothing has been counted against you.",
      findings: det.findings, verdict: v,
    });
  } finally {
    client.release();
  }

  res.json({
    submissionId,
    attempt: attemptNo,
    provisional: task.provisional,   // telc: criteria held, exam level not yet confirmed
    integrity_flag: flag,
    findings: det.findings,
    verdict: v,
  });
});

// Outcome capture. This ships in v1 by design -- without linked
// prediction-vs-actual pairs the whole thesis is unfalsifiable.
router.post("/outcomes", async (req, res) => {
  const { board, module: mod, realScore, examDate = null, tier = "self_reported" } = req.body;
  if (!board || !mod || !Number.isFinite(realScore)) {
    return res.status(400).json({ error: "board, module and realScore required" });
  }
  const { rows } = await pool.query(
    `INSERT INTO b2_outcomes (user_id, board, module, real_score, passed, exam_date, verification_tier)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [req.userId, board, mod, realScore, realScore >= 60, examDate, tier]
  );
  res.json(rows[0]);
});

// Calibration, never pooled across boards or modules -- a blended figure
// describes neither. Misses are reported, not hidden: docs/05-edge-cases.md §1.
router.get("/calibration", async (req, res) => {
  const { rows } = await pool.query(
    `SELECT r.board, r.module,
            COUNT(*)::int AS n_pairs,
            AVG(ABS(v.predicted_score - o.real_score))::numeric(5,1) AS mean_abs_error,
            SUM(CASE WHEN (v.predicted_score >= 60) <> o.passed THEN 1 ELSE 0 END)::int AS misses,
            SUM(CASE WHEN v.predicted_score >= 60 AND NOT o.passed THEN 1 ELSE 0 END)::int AS false_optimism,
            SUM(CASE WHEN v.predicted_score < 60 AND o.passed THEN 1 ELSE 0 END)::int AS false_pessimism
       FROM b2_verdicts v
       JOIN b2_submissions s ON s.id = v.submission_id
       JOIN b2_rubrics r     ON r.id = v.rubric_id
       JOIN b2_outcomes o    ON o.user_id = s.user_id AND o.board = r.board AND o.module = r.module
      WHERE s.integrity_flag IS NULL
      GROUP BY r.board, r.module`
  );
  res.json({ calibrated: false, note: "Uncalibrated until enough linked pairs exist.", slices: rows });
});

/* ── EXAM SECTION — Goethe B2 Hören Teil 1 ───────────────────────────────
   The blueprint constants, the content and the single-play state all live
   outside this file; what is here is the wiring, and one rule it enforces
   directly: THE CLIENT NEVER RECEIVES A URL FOR A TEXT ALREADY HEARD. Not
   hidden, not disabled — not sent. A control the browser cannot reach is the
   only version of "no replay" that survives a reload. */
const examBlueprint = require("../b2/exam/goethe_b2");
const examSection = require("../b2/exam_section");
const examAttempt = require("../b2/exam_attempt");

const SECTIONS = { gx_hoeren_t1_alltag: require("../seed/b2/exam/hoeren_t1_alltag") };

const flatItems = (TEXTS) => {
  const out = [];
  let n = 0;
  for (const t of TEXTS) for (const it of t.items) out.push({ ...it, itemNo: ++n, textNo: t.no });
  return out;
};

/* Everything the learner may see before listening: the situation, the two
   questions, the options. Never the key, never the transcript, never a URL. */
router.get("/exam/:sectionId", async (req, res) => {
  const mod = SECTIONS[req.params.sectionId];
  if (!mod) return res.status(404).json({ error: "unknown section" });
  const { SECTION, TEXTS } = mod;
  const bp = examBlueprint.teil(SECTION.teil);

  const attempt = await examAttempt.openAttempt(req.userId, SECTION.paperId, null);
  const heard = await examAttempt.heardIn(attempt.id);
  const done = await examAttempt.getAttempt(attempt.id);

  res.json({
    sectionId: SECTION.id,
    attemptId: attempt.id,
    resumed: attempt.resumed,
    finished: !!done.finished_at,
    scores: done.scores || null,
    /* Named so no screen can imply this is the real thing. */
    label: examBlueprint.PRACTICE_LABEL(SECTION.teil),
    instruction: bp.instruction,
    readSeconds: bp.readSeconds,
    plays: bp.plays,
    texts: TEXTS.map(t => ({
      no: t.no,
      situation: t.situation,
      heard: heard.has(t.no),
      items: t.items.map((it, i) => ({
        itemNo: TEXTS.slice(0, t.no - 1).reduce((a, x) => a + x.items.length, 0) + i + 1,
        type: it.type,
        stem: it.stem,
        options: it.type === "mc3" ? it.options : null,
      })),
    })),
    responses: done.responses || {},
  });
});

/* Ask for a text's audio. Consumes nothing — see exam_attempt.requestPlay. */
router.post("/exam/:sectionId/play/:textNo", async (req, res) => {
  const mod = SECTIONS[req.params.sectionId];
  if (!mod) return res.status(404).json({ error: "unknown section" });
  const textNo = Number(req.params.textNo);
  if (!mod.TEXTS.some(t => t.no === textNo)) return res.status(404).json({ error: "unknown text" });

  const attempt = await examAttempt.openAttempt(req.userId, mod.SECTION.paperId, null);
  const { allowed, requests } = await examAttempt.requestPlay(attempt.id, textNo);
  if (!allowed) {
    /* 422 + {refused:true}, matching the ONE refusal convention every other
       route in this file uses (gate(), the writing loop's too-short/no-audio
       cases). An earlier version used a bespoke 409, which is not special-cased
       by b2api.js's req() — that helper only treats 422 and 503 as designed,
       non-throwing outcomes, so the 409 fell into the generic `throw` branch.
       The client's dedicated "you already heard this" handling was UNREACHABLE
       dead code as a result: every reload-then-retry showed a generic
       "recording failed to load" message instead, telling a learner to do the
       one thing — retry — that could never work. No url in the body at any
       level, either way. */
    return res.status(422).json({
      refused: true, reason: "already_heard",
      message: "Diesen Text haben Sie schon gehört. In der Prüfung wird Teil 1 nur einmal gespielt.",
    });
  }
  res.json({
    url: `/b2/audio/exam/${mod.SECTION.id}_t${textNo}.mp3`,
    /* Surfaced, not enforced: a second request is usually a failed load. */
    requests,
  });
});

/* Playback actually started. The irreversible step. */
router.post("/exam/:sectionId/heard/:textNo", async (req, res) => {
  const mod = SECTIONS[req.params.sectionId];
  if (!mod) return res.status(404).json({ error: "unknown section" });
  const attempt = await examAttempt.openAttempt(req.userId, mod.SECTION.paperId, null);
  const r = await examAttempt.confirmHeard(attempt.id, Number(req.params.textNo));
  if (!r.known) return res.status(409).json({ error: "no play was requested for this text" });
  res.json({ heard: r.heard });
});

router.put("/exam/:sectionId/answer/:itemNo", async (req, res) => {
  const mod = SECTIONS[req.params.sectionId];
  if (!mod) return res.status(404).json({ error: "unknown section" });
  const items = flatItems(mod.TEXTS);
  const item = items.find(i => i.itemNo === Number(req.params.itemNo));
  if (!item) return res.status(404).json({ error: "unknown item" });

  const attempt = await examAttempt.openAttempt(req.userId, mod.SECTION.paperId, null);
  const heard = await examAttempt.heardIn(attempt.id);
  /* An answer to a text nobody has heard is not an answer. Storing it would
     let a learner fill the section in without listening and then be scored. */
  if (!heard.has(item.textNo))
    return res.status(409).json({ error: "this text has not been heard yet" });

  await examAttempt.saveResponse(attempt.id, item.itemNo, req.body?.value);
  res.json({ saved: true });
});

/* Finish and score. Idempotent — a reload here re-reads the stored result. */
router.post("/exam/:sectionId/finish", async (req, res) => {
  const mod = SECTIONS[req.params.sectionId];
  if (!mod) return res.status(404).json({ error: "unknown section" });
  const { SECTION, TEXTS } = mod;

  const attempt = await examAttempt.openAttempt(req.userId, SECTION.paperId, null);
  const stored = await examAttempt.getAttempt(attempt.id);
  const items = flatItems(TEXTS);
  const heard = await examAttempt.heardIn(attempt.id);
  const result = examSection.score(items, stored.responses || {}, heard);
  const complete = result.unheard === 0 && result.rows.every(r => r.answered);

  const closed = await examAttempt.finish(attempt.id, {
    correct: result.correct, scorable: result.scorable, total: result.total, complete,
  });
  /* Evidence only from a complete section, and only from texts actually heard.
     `was_open` is false on a reload, so a second POST re-reads and records
     nothing — one section is one demonstration. */
  if (closed?.was_open) {
    const ev = examSection.evidenceFor(result, { complete });
    if (ev.length) {
      await profile_.recordMany(req.userId, ev.map(e => ({
        ...e, sourceKind: "experience", sourceRef: `${SECTION.id}:${attempt.id}`,
      })));
    }
  }

  res.json({
    /* Raw counting only. No percentage of the exam, no Ergebnispunkte, no
       pass/fail — goethe_b2.ergebnispunkte() throws for a partial module and is
       deliberately never called from here. */
    correct: result.correct,
    scorable: result.scorable,
    total: result.total,
    unheard: result.unheard,
    complete,
    label: examBlueprint.PRACTICE_LABEL(SECTION.teil),
    review: result.rows.map(r => {
      const text = TEXTS.find(t => t.no === r.textNo);
      const src = text.items[items.filter(i => i.textNo === r.textNo).findIndex(i => i.itemNo === r.itemNo)];
      return {
        itemNo: r.itemNo, textNo: r.textNo, type: r.type, stem: r.stem,
        options: r.type === "mc3" ? src.options : null,
        yours: r.response, answer: String(r.answer), correct: r.correct,
        listened: r.listened,
        /* The explanation and the transcript are released ONLY for a text the
           learner heard. Feedback about audio nobody played is fabricated. */
        because: r.listened ? src.because : null,
        transcript: r.listened ? text.turns.map(t => ({ speaker: t.speaker, de: t.de })) : null,
      };
    }),
  });
});

/* Start a new practice attempt for this exam section. Preserves past attempts. */
router.post("/exam/:sectionId/retake", async (req, res) => {
  const mod = SECTIONS[req.params.sectionId];
  if (!mod) return res.status(404).json({ error: "unknown section" });
  const attempt = await examAttempt.newAttempt(req.userId, mod.SECTION.paperId, null);
  res.json({ ok: true, attemptId: attempt.id });
});

module.exports = router;
