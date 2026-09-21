/**
 * The expression ladder, persisted.
 *
 * `b2/chunks.js` knows what a stage MEANS. This knows what stage a particular
 * learner is at with a particular expression, and it is the thing that stops
 * the product asking somebody to pick, out of three options, a phrase they
 * wrote a good sentence with last week.
 *
 * Every source that teaches expressions registers here, the same way scenarios
 * register in the Maya route: one map, so an expression id means the same thing
 * wherever it is met.
 */

const pool = require("../db/pool");
const { STAGES, stageIndex, higher, allowsRecognition } = require("./chunks");

const SOURCES = [
  require("../seed/b2/chunks_homeoffice"),
  require("../seed/b2/chunks_muede"),
];

const BY_ID = new Map();
for (const s of SOURCES) for (const x of s.EXPRESSIONS) BY_ID.set(x.id, { ...x, sourceId: s.SOURCE_ID });

const get = (id) => BY_ID.get(id) || null;

/** Every expression this learner has met, id → row. */
async function statesFor(userId) {
  const { rows } = await pool.query(
    `SELECT expression, stage, occasions, last_seen_at FROM b2_expression_state WHERE user_id=$1`,
    [userId]);
  return new Map(rows.map(r => [r.expression, r]));
}

async function stageOf(userId, id) {
  const { rows } = await pool.query(
    `SELECT stage FROM b2_expression_state WHERE user_id=$1 AND expression=$2`, [userId, id]);
  return rows[0]?.stage || "heard";
}

/**
 * Move an expression up the ladder. Never down: a muddled attempt in March does
 * not undo a good sentence written in February, and treating it as though it
 * did would send the learner back through recognition they have outgrown.
 */
async function advance(userId, id, stage, sourceId = null) {
  if (!STAGES.includes(stage)) throw new Error(`unknown stage "${stage}"`);
  const { rows } = await pool.query(
    `INSERT INTO b2_expression_state (user_id, expression, source_id, stage, occasions)
     VALUES ($1,$2,$3,$4,1)
     ON CONFLICT (user_id, expression) DO UPDATE SET
       occasions = b2_expression_state.occasions + 1,
       last_seen_at = now(),
       stage = CASE
         WHEN $5 > array_position($6::text[], b2_expression_state.stage)
         THEN $4 ELSE b2_expression_state.stage END
     RETURNING stage, occasions`,
    [userId, id, sourceId, stage, stageIndex(stage) + 1, STAGES]);
  return rows[0];
}

/** Seen at all — what a source does to every expression in it. */
async function markHeard(userId, ids, sourceId) {
  for (const id of ids) await advance(userId, id, "heard", sourceId);
}

/**
 * Which of these expressions may still be offered as a RECOGNITION item.
 * Production is a one-way door: once it has been walked through, this returns
 * false for that expression forever.
 */
async function recognisable(userId, ids) {
  const states = await statesFor(userId);
  return ids.filter(id => allowsRecognition(states.get(id)?.stage || "heard"));
}

/**
 * Serve-time filtering of an experience's steps.
 *
 * A learner returning to this experience should not repeat what they have
 * already demonstrated. Recognition items whose expressions are all produced
 * are dropped; production items for expressions already produced are replaced
 * by the NEXT rung — which today means they are dropped too, and will mean
 * "defend it in a conversation" once Maya carries these expressions.
 */
async function filterSteps(userId, steps) {
  const states = await statesFor(userId);
  const stage = (id) => states.get(id)?.stage || "heard";
  const done = (id) => stageIndex(stage(id)) >= stageIndex("produced");
  const out = [];
  const seen = new Set();

  for (const st of steps) {
    if (st.ex) seen.add(st.ex);
    if ((st.t === "notice" || st.t === "chunk_produce") && done(st.ex)) continue;
    if (st.t === "chunk_choose") {
      /* A choice item is dead once every expression it could teach has been
         produced. Options are authored German rather than ids, so the item
         declares which expressions it exercises. */
      const ex = st.exercises || [];
      if (ex.length && ex.every(done)) continue;
    }
    out.push(st);
  }

  /* PROMOTION — the half of the rule that is not "stop showing me this".
     An expression the learner has CHOSEN correctly but never written has
     nowhere to climb: the authored experience only carries production steps for
     two of the five, so on a return visit the other three would come back as
     recognition forever. That is the same complaint in a quieter voice.

     So every chosen-but-unproduced expression in this experience is promoted
     to a production step, using the context authored on the expression itself.
     A generic "write a sentence with X" would be the meaningless completion
     this whole experience exists to avoid, which is why the context is content
     and not a template. */
  const promotable = [...seen].filter(id => {
    const x = BY_ID.get(id);
    return x?.produceContext && stage(id) === "chosen"
      && !out.some(s => s.t === "chunk_produce" && s.ex === id);
  });
  for (const id of promotable) {
    const x = BY_ID.get(id);
    out.push({ t: "chunk_produce", ex: id, sourceId: x.sourceId,
               context: x.produceContext, hint: x.produceHint, promoted: true });
  }
  return out;
}

module.exports = { BY_ID, get, statesFor, stageOf, advance, markHeard, recognisable, filterSteps, higher };
