/**
 * STANDALONE EXAM-PRACTICE PAPERS — Goethe/telc sections that are NOT the
 * bespoke Hören-Teil-1 engine (exam_attempt.js/exam_section.js) and NOT the
 * core-2026b diagnostic (assessment_store.js).
 *
 * A third thing was tempting to avoid, and isn't one: this reuses the exact
 * same b2_papers/b2_paper_sections/b2_paper_items model and the exact same
 * assessment_content.js provider (itemsOf/getItem/safeItem/safeVersion/grade)
 * core-2026b already proved out for all 9 item types — the only reason it
 * needed a new module at all is that `kind='paper'` attempts (Goethe/telc
 * practice) must NOT enter the diagnostic's comparability/evidence/retest
 * machinery the way `kind='assessment'` attempts do. Same content engine,
 * different attempt bookkeeping.
 *
 * Evidence IS still recorded on finish, because a Goethe Lesen paper is real
 * signal about reading — it just never becomes part of "did she improve
 * between two comparable sittings", which only core-2026b's assessment
 * versions support.
 */

const pool = require("../db/pool");
const content = require("./assessment_content");
const profile = require("./profile");

async function attemptRow(attemptId) {
  const { rows } = await pool.query(
    `SELECT id, user_id, paper_id, started_at, finished_at, responses, scores
       FROM b2_paper_attempts WHERE id=$1 AND kind='paper'`, [attemptId]);
  return rows[0] || null;
}

/** Start, or resume the one already open for this learner+paper. */
async function startPaper(userId, paperId) {
  if (!content.isDbBacked(paperId)) return { error: "unknown_paper" };
  const items = await content.itemsOf(paperId);
  if (!items.length) return { error: "unknown_paper" };

  /* DRAFT was never actually checked here before — content_model.js's
     review-status rules only ran at seed time, so a paper set back to DRAFT
     after a real content problem was found (see mark_hoeren_drafts.js) was
     still fully startable by any learner. A paper isn't ready just because
     it has items; it also has to not be actively known-broken. */
  const { rows: paperRow } = await pool.query(`SELECT review_status FROM b2_papers WHERE id=$1`, [paperId]);
  if (paperRow[0]?.review_status === "DRAFT") return { error: "paper_not_ready" };

  const open = await pool.query(
    `SELECT id FROM b2_paper_attempts
      WHERE user_id=$1 AND paper_id=$2 AND kind='paper' AND finished_at IS NULL
      ORDER BY id DESC LIMIT 1`, [userId, paperId]);
  if (open.rows[0]) return { ...(await getPaper(open.rows[0].id)), resumed: true };

  /* Same race migration 014 found for the diagnostic, closed here by
     migration 016 before it was ever hit live: two near-simultaneous starts
     can both pass the check above. The losing INSERT gets a 23505 and simply
     resumes the row that won, instead of creating (or worse, half-creating) a
     second open attempt. */
  try {
    const { rows: made } = await pool.query(
      `INSERT INTO b2_paper_attempts (user_id, kind, paper_id, responses)
       VALUES ($1,'paper',$2,'{}'::jsonb) RETURNING id`,
      [userId, paperId]);
    return { ...(await getPaper(made[0].id)), resumed: false };
  } catch (e) {
    if (e.code !== "23505") throw e;
    const won = await pool.query(
      `SELECT id FROM b2_paper_attempts
        WHERE user_id=$1 AND paper_id=$2 AND kind='paper' AND finished_at IS NULL
        ORDER BY id DESC LIMIT 1`, [userId, paperId]);
    return { ...(await getPaper(won.rows[0].id)), resumed: true };
  }
}

async function getPaper(attemptId) {
  const a = await attemptRow(attemptId);
  if (!a) return null;
  const [v, itemMeta] = await Promise.all([
    content.safeVersion(a.paper_id),
    content.itemsOf(a.paper_id),
  ]);
  const responses = a.responses || {};
  return {
    attemptId: a.id,
    paperId: a.paper_id,
    startedAt: a.started_at,
    completedAt: a.finished_at,
    status: a.finished_at ? "completed" : "in_progress",
    board: v.group === "core-2026b" ? null : null, // paper's own `board` is on b2_papers, not needed client-side yet
    context: v.context,
    items: v.items.map((safe, i) => ({
      ...safe,
      response: responses[safe.itemId] ?? null,
      answered: Object.prototype.hasOwnProperty.call(responses, safe.itemId),
    })),
  };
}

async function answerItem(attemptId, itemId, response) {
  const a = await attemptRow(attemptId);
  if (!a) return { error: "unknown_attempt" };
  if (a.finished_at) return { error: "already_completed" };

  const meta = await content.getItem(itemId);
  if (!meta) return { error: "unknown_item" };

  const responses = { ...(a.responses || {}) };
  responses[itemId] = response;
  await pool.query(
    `UPDATE b2_paper_attempts SET responses=$2::jsonb WHERE id=$1`,
    [attemptId, JSON.stringify(responses)]);
  return { saved: true, itemId };
}

/** Finish and score. Idempotent: a second call re-reads the stored result
    rather than re-scoring and writing evidence twice. */
async function finishPaper(attemptId) {
  const a = await attemptRow(attemptId);
  if (!a) return { error: "unknown_attempt" };

  const items = await content.itemsOf(a.paper_id);
  const responses = a.responses || {};

  const graded = items.map(it => {
    const has = Object.prototype.hasOwnProperty.call(responses, it.item_id);
    const objective = (it.scoring_mode ?? "OBJECTIVE") === "OBJECTIVE";
    const correct = has && objective ? content.grade(it, responses[it.item_id]) : null;
    let correctAns = it.answer !== null && it.answer !== undefined ? it.answer : null;
    if (correctAns === null && it.answer_payload) {
      if (it.answer_payload.value !== undefined) correctAns = it.answer_payload.value;
      else if (it.answer_payload.correct !== undefined) correctAns = it.answer_payload.correct;
      else if (it.answer_payload.mapping !== undefined) correctAns = it.answer_payload.mapping;
      else if (it.answer_payload.order !== undefined) correctAns = it.answer_payload.order;
      else if (it.answer_payload.gaps !== undefined) correctAns = it.answer_payload.gaps;
    }
    return {
      itemId: it.item_id,
      slot: it.slot,
      skill: it.skill,
      capability: it.capability,
      itemType: it.item_type,
      scoringMode: it.scoring_mode,
      answered: has,
      correct,
      stem: it.stem,
      options: it.options,
      userAnswer: has ? responses[it.item_id] : null,
      correctAnswer: correctAns,
      rationale: it.rationale || null,
    };
  });
  const scorable = graded.filter(g => g.correct !== null);
  const scores = {
    total: items.length,
    answered: graded.filter(g => g.answered).length,
    scorable: scorable.length,
    correct: scorable.filter(g => g.correct === true).length,
  };

  const { rowCount } = await pool.query(
    `UPDATE b2_paper_attempts SET finished_at=now(), scores=$2::jsonb
      WHERE id=$1 AND finished_at IS NULL`,
    [attemptId, JSON.stringify(scores)]);

  if (rowCount === 1) {
    const evidence = graded
      .filter(g => g.correct !== null && g.capability)
      .map(g => ({
        dimension: g.skill, capability: g.capability, outcome: g.correct ? 1 : 0,
        weight: 0.9, sourceKind: "paper", sourceRef: `paper_${attemptId}:${g.itemId}`,
      }));
    if (evidence.length) await profile.recordMany(a.user_id, evidence);
  }

  return { attemptId, paperId: a.paper_id, scores, graded,
           claim: "Exam practice result", notAnOfficialScore: true };
}

module.exports = { startPaper, getPaper, answerItem, finishPaper };
