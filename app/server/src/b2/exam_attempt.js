/**
 * ATTEMPT STATE for an exam section — where the single-play rule is enforced.
 *
 * Kept out of routes/b2.js because the invariants here are the product, not
 * plumbing, and they need to be testable without an HTTP server.
 *
 * THE RULE: a text may be heard exactly once per attempt, and no reload,
 * navigation, double-click or second window may produce a second listen. The
 * only way to keep that promise is to hold it server-side and to make the
 * client's role purely advisory — the browser reports that sound started, and
 * that report is what closes the door. It cannot open it.
 */

const pool = require("../db/pool");

/**
 * The learner's attempt at this section — open, finished, or a fresh one.
 *
 * MUST consider FINISHED attempts, not only open ones. An earlier version
 * queried `WHERE finished_at IS NULL`, so the moment an attempt finished it
 * became invisible to this function: the very next call — a page reload on
 * the results screen, or the finish route's own second invocation — found
 * nothing open and silently INSERTed a brand-new, empty attempt. The learner's
 * completed section vanished behind a fresh one with no plays and no answers,
 * which is the "completed-attempt recovery" case failing outright, and it also
 * broke the finish route's own idempotency: a second POST scored the new empty
 * attempt (0/0) instead of returning the stored 5/10.
 *
 * So: the MOST RECENT attempt for this learner and paper is always returned,
 * finished or not. A learner who wants to try the section again is a decision
 * this product does not yet make implicitly — that is a future "start a new
 * attempt" action, not something a reload should do on its own.
 */
async function openAttempt(userId, paperId, sectionId) {
  const { rows } = await pool.query(
    `SELECT id, responses, started_at, finished_at FROM b2_paper_attempts
      WHERE user_id=$1 AND paper_id=$2
      ORDER BY id DESC LIMIT 1`, [userId, paperId]);
  if (rows[0]) return { ...rows[0], resumed: true };
  const { rows: made } = await pool.query(
    `INSERT INTO b2_paper_attempts (user_id, paper_id, section_id, responses)
     VALUES ($1,$2,$3,'{}'::jsonb) RETURNING id, responses, started_at, finished_at`,
    [userId, paperId, sectionId]);
  return { ...made[0], resumed: false };
}

/** Text numbers already heard in this attempt. */
async function heardIn(attemptId) {
  const { rows } = await pool.query(
    `SELECT text_no FROM b2_exam_plays WHERE attempt_id=$1 AND heard_at IS NOT NULL`, [attemptId]);
  return new Set(rows.map(r => r.text_no));
}

async function playState(attemptId) {
  const { rows } = await pool.query(
    `SELECT text_no, requests, requested_at IS NOT NULL AS requested, heard_at IS NOT NULL AS heard
       FROM b2_exam_plays WHERE attempt_id=$1 ORDER BY text_no`, [attemptId]);
  return rows;
}

/**
 * Ask for a text's audio.
 *
 * Consumes NOTHING. A request that never becomes sound is a failed load, and
 * charging the learner a listen for our own network problem would be the worst
 * failure this section can have. Repeated requests before a confirmation return
 * the same permission and are counted, so retrying a broken load is free.
 *
 * @returns { allowed, requests } — allowed:false means already heard, and no
 *          URL may be issued.
 */
async function requestPlay(attemptId, textNo) {
  const { rows } = await pool.query(
    `INSERT INTO b2_exam_plays (attempt_id, text_no, requests, requested_at)
     VALUES ($1,$2,1,now())
     ON CONFLICT (attempt_id, text_no) DO UPDATE SET
       requests = b2_exam_plays.requests + 1,
       requested_at = COALESCE(b2_exam_plays.requested_at, now())
     RETURNING requests, heard_at`,
    [attemptId, textNo]);
  const row = rows[0];
  /* Already heard: the door is shut, and the extra request is still counted so
     the integrity note can say how often it was tried. */
  return { allowed: !row.heard_at, requests: row.requests };
}

/**
 * The client reports that playback actually started. This is the irreversible
 * step, and it is idempotent: a double-click that fires two confirmations
 * marks the text heard once, at the first time.
 */
async function confirmHeard(attemptId, textNo) {
  const { rows } = await pool.query(
    `UPDATE b2_exam_plays SET heard_at = COALESCE(heard_at, now())
      WHERE attempt_id=$1 AND text_no=$2
      RETURNING heard_at`, [attemptId, textNo]);
  /* No row means confirm arrived without a request — a client bug or a forged
     call. Nothing is marked: we only close a door somebody actually opened. */
  return { heard: !!rows[0]?.heard_at, known: !!rows[0] };
}

/** Save one answer. Answers are free to change until the section is submitted. */
async function saveResponse(attemptId, itemNo, value) {
  await pool.query(
    `UPDATE b2_paper_attempts
        SET responses = jsonb_set(responses, ARRAY[$2::text], to_jsonb($3::text), true)
      WHERE id=$1 AND finished_at IS NULL`,
    [attemptId, String(itemNo), String(value)]);
}

async function getAttempt(attemptId) {
  const { rows } = await pool.query(
    `SELECT id, responses, scores, started_at, finished_at FROM b2_paper_attempts WHERE id=$1`,
    [attemptId]);
  return rows[0] || null;
}

/**
 * Close the attempt. Idempotent: reopening a finished attempt returns the
 * stored result rather than re-scoring, so a reload on the results screen
 * cannot produce a second demonstration.
 */
async function finish(attemptId, scores) {
  /* `was_open` CANNOT be computed in the RETURNING clause: Postgres returns the
     NEW row, so `finished_at IS NULL` there is false the first time too, and
     every reload looked like the first submission. That is the difference
     between recording one demonstration and recording one per refresh.
     The UPDATE is therefore guarded on the row still being open, and rowCount
     is what says whether this call is the one that closed it. */
  const { rowCount } = await pool.query(
    `UPDATE b2_paper_attempts SET finished_at = now(), scores = $2::jsonb
      WHERE id=$1 AND finished_at IS NULL`,
    [attemptId, JSON.stringify(scores)]);
  const { rows } = await pool.query(
    `SELECT finished_at, scores FROM b2_paper_attempts WHERE id=$1`, [attemptId]);
  if (!rows[0]) return null;
  return { ...rows[0], was_open: rowCount === 1 };
}

/**
 * Start a fresh practice attempt for this section.
 * Preserves all previous attempts, their scores and their timestamps in history.
 */
async function newAttempt(userId, paperId, sectionId) {
  await pool.query(
    `UPDATE b2_paper_attempts SET finished_at = now()
      WHERE user_id=$1 AND paper_id=$2 AND finished_at IS NULL`,
    [userId, paperId]);

  const { rows: made } = await pool.query(
    `INSERT INTO b2_paper_attempts (user_id, paper_id, section_id, responses)
     VALUES ($1,$2,$3,'{}'::jsonb) RETURNING id, responses, started_at, finished_at`,
    [userId, paperId, sectionId]);
  return { ...made[0], resumed: false };
}

module.exports = {
  openAttempt, newAttempt, heardIn, playState, requestPlay, confirmHeard,
  saveResponse, getAttempt, finish,
};
