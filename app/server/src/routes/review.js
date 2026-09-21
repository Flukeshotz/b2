/**
 * TEACHER CONTENT REVIEW — a lightweight internal tool, not a CMS.
 *
 * Separate from every learner-facing route: learners never see an answer
 * key or a rationale before answering, but a reviewer's whole job is
 * reading the key and judging whether it's right. Mounted at /api/review,
 * gated by a single shared token (REVIEW_TOKEN) rather than the learner
 * auth system — teachers are not learner accounts, and this is an internal
 * tool for a small trusted group, not a second identity system.
 *
 * Reuses content_model.js's existing validators for every write — an edit
 * that would fail validateItem()/validateProvenance() is rejected with the
 * same problems the seed scripts would report, never silently saved.
 * Review-status transitions reuse canTransition() so "SME_REVIEWED" can
 * only be reached through a real recorded review, exactly like the rule
 * content_model.js already enforces for seeding.
 */
const express = require("express");
const router = express.Router();
const pool = require("../db/pool");
const model = require("../b2/content_model");
const caps = require("../b2/capabilities");

const TOKEN = process.env.REVIEW_TOKEN || "";
if (!TOKEN) {
  console.warn(JSON.stringify({ level: "warn", event: "review_token_unset",
    message: "REVIEW_TOKEN is not set — /api/review is reachable with ANY token. Set REVIEW_TOKEN before sharing the review page." }));
}

router.use((req, res, next) => {
  // Fail CLOSED, not open: an unset REVIEW_TOKEN must never mean "anyone can
  // edit content," which is what `TOKEN && sent !== TOKEN` would do the
  // moment TOKEN is falsy.
  if (!TOKEN) return res.status(503).json({ error: "review_tool_disabled", message: "REVIEW_TOKEN is not configured." });
  const sent = req.header("x-review-token") || "";
  if (sent !== TOKEN) return res.status(401).json({ error: "bad_review_token" });
  next();
});

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Everything a dropdown needs, from the one place these are already defined —
// never a second, driftable copy of REVIEW_STATUS/DIFFICULTY/capabilities.
router.get("/meta", wrap(async (req, res) => {
  res.json({
    reviewStatus: model.REVIEW_STATUS,
    difficulty: model.DIFFICULTY,
    itemTypes: model.ITEM_TYPES,
    sourceTypes: model.SOURCE_TYPES,
    scoringModes: model.SCORING_MODES,
    capabilities: caps.CAPABILITIES.map(c => ({ id: c.id, label: c.label })),
  });
}));

router.get("/papers", wrap(async (req, res) => {
  const { board, status } = req.query;
  const where = [];
  const params = [];
  if (board) { params.push(board); where.push(`p.board = $${params.length}`); }
  if (status) { params.push(status); where.push(`p.review_status = $${params.length}`); }
  const { rows } = await pool.query(
    `SELECT p.id, p.board, p.title, p.review_status, p.source_type, p.alignment,
            p.difficulty, p.minutes,
            count(DISTINCT s.id)::int AS section_count,
            count(i.id)::int AS item_count
       FROM b2_papers p
       LEFT JOIN b2_paper_sections s ON s.paper_id = p.id
       LEFT JOIN b2_paper_items i ON i.section_id = s.id
       ${where.length ? "WHERE " + where.join(" AND ") : ""}
       GROUP BY p.id, p.board, p.title, p.review_status, p.source_type, p.alignment, p.difficulty, p.minutes
       ORDER BY p.board, p.id`, params);
  res.json(rows);
}));

router.get("/papers/:id", wrap(async (req, res) => {
  const paper = await pool.query(`SELECT * FROM b2_papers WHERE id=$1`, [req.params.id]);
  if (!paper.rows[0]) return res.status(404).json({ error: "unknown_paper" });

  const sections = await pool.query(
    `SELECT * FROM b2_paper_sections WHERE paper_id=$1 ORDER BY part_no`, [req.params.id]);
  const sectionIds = sections.rows.map(s => s.id);
  const items = sectionIds.length
    ? await pool.query(
        `SELECT * FROM b2_paper_items WHERE section_id = ANY($1) ORDER BY section_id, item_no`, [sectionIds])
    : { rows: [] };
  const reviews = await pool.query(
    `SELECT * FROM b2_content_reviews WHERE entity_type='paper' AND entity_id=$1 ORDER BY created_at DESC`,
    [req.params.id]);

  res.json({
    paper: paper.rows[0],
    sections: sections.rows.map(s => ({
      ...s,
      items: items.rows.filter(i => i.section_id === s.id),
    })),
    reviews: reviews.rows,
  });
}));

// Paper-level metadata edit — title/source/alignment/minutes/difficulty.
// review_status is deliberately NOT editable here; it only moves through
// POST /papers/:id/review, which enforces canTransition().
router.patch("/papers/:id", wrap(async (req, res) => {
  const { title, source, alignment, minutes, difficulty } = req.body || {};
  const { rows: existing } = await pool.query(`SELECT * FROM b2_papers WHERE id=$1`, [req.params.id]);
  if (!existing[0]) return res.status(404).json({ error: "unknown_paper" });

  const next = { ...existing[0],
    title: title ?? existing[0].title, source: source ?? existing[0].source,
    alignment: alignment ?? existing[0].alignment, minutes: minutes ?? existing[0].minutes,
    difficulty: difficulty ?? existing[0].difficulty };
  const prov = model.validateProvenance(next, { required: existing[0].source_type != null });
  if (!prov.valid) return res.status(400).json({ error: "invalid_provenance", problems: prov.problems });

  await pool.query(
    `UPDATE b2_papers SET title=$2, source=$3, alignment=$4, minutes=$5, difficulty=$6 WHERE id=$1`,
    [req.params.id, next.title, next.source, next.alignment, next.minutes, next.difficulty]);
  console.log(JSON.stringify({ level: "info", event: "review_paper_edit", paperId: req.params.id }));
  res.json({ saved: true });
}));

router.patch("/sections/:id", wrap(async (req, res) => {
  const { title, instruction, passage, minutes } = req.body || {};
  const { rows } = await pool.query(`SELECT * FROM b2_paper_sections WHERE id=$1`, [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: "unknown_section" });

  await pool.query(
    `UPDATE b2_paper_sections SET title=$2, instruction=$3, passage=$4, minutes=$5 WHERE id=$1`,
    [req.params.id, title ?? rows[0].title, instruction ?? rows[0].instruction,
     passage ?? rows[0].passage, minutes ?? rows[0].minutes]);
  console.log(JSON.stringify({ level: "info", event: "review_section_edit", sectionId: req.params.id }));
  res.json({ saved: true });
}));

// Item edit — the actual content: stem, options, answer key, rationale,
// capability, difficulty. Validated exactly as a seed script would be
// before it's allowed to save, so a bad edit reports its problems instead
// of silently corrupting a graded item.
router.patch("/items/:id", wrap(async (req, res) => {
  const { rows } = await pool.query(`SELECT * FROM b2_paper_items WHERE id=$1`, [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: "unknown_item" });
  const existing = rows[0];

  const patch = req.body || {};
  const next = {
    item_type: existing.item_type, // never changed via edit — a type change is a new item, not an edit
    stem: patch.stem ?? existing.stem,
    options: patch.options ?? existing.options,
    answer: patch.answer !== undefined ? patch.answer : existing.answer,
    answer_payload: patch.answer_payload !== undefined ? patch.answer_payload : existing.answer_payload,
    payload: patch.payload ?? existing.payload,
    rationale: patch.rationale ?? existing.rationale,
    scoring_mode: existing.scoring_mode,
    points: existing.points,
    skill: patch.skill ?? existing.skill,
    capability: patch.capability ?? existing.capability,
    difficulty: patch.difficulty ?? existing.difficulty,
    source_type: existing.source_type, source_book: existing.source_book, source_page: existing.source_page,
  };

  const itemCheck = model.validateItem(next);
  if (!itemCheck.valid) return res.status(400).json({ error: "invalid_item", problems: itemCheck.problems });
  const provCheck = model.validateProvenance(next, { required: true });
  if (!provCheck.valid) return res.status(400).json({ error: "invalid_provenance", problems: provCheck.problems });
  if (next.capability && !caps.BY_ID.has(next.capability)) {
    return res.status(400).json({ error: "invalid_capability", problems: [`unknown capability "${next.capability}"`] });
  }

  await pool.query(
    `UPDATE b2_paper_items SET stem=$2, options=$3, answer=$4, answer_payload=$5, payload=$6,
       rationale=$7, skill=$8, capability=$9, difficulty=$10
     WHERE id=$1`,
    [req.params.id, next.stem, JSON.stringify(next.options ?? []), next.answer,
     next.answer_payload != null ? JSON.stringify(next.answer_payload) : null,
     JSON.stringify(next.payload ?? {}), next.rationale, next.skill, next.capability, next.difficulty]);
  console.log(JSON.stringify({ level: "info", event: "review_item_edit", itemId: req.params.id }));
  res.json({ saved: true });
}));

// Recording an actual review — the only path that can move review_status
// forward. Writes b2_content_reviews AND the paper's review_status in one
// transaction, and refuses the move if canTransition() says no (e.g.
// SME_REVIEWED without a reviewer name).
router.post("/papers/:id/review", wrap(async (req, res) => {
  const { reviewer, outcome, notes } = req.body || {};
  const { rows } = await pool.query(`SELECT review_status FROM b2_papers WHERE id=$1`, [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: "unknown_paper" });

  const reviewedAt = new Date().toISOString();
  const check = model.canTransition(rows[0].review_status, outcome, { review: { reviewer, reviewed_at: reviewedAt, outcome } });
  if (!check.allowed) return res.status(400).json({ error: "invalid_transition", problems: check.problems });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO b2_content_reviews (entity_type, entity_id, reviewer, reviewed_at, outcome, notes)
       VALUES ('paper', $1, $2, $3, $4, $5)`,
      [req.params.id, reviewer, reviewedAt, outcome, notes || null]);
    await client.query(`UPDATE b2_papers SET review_status=$2 WHERE id=$1`, [req.params.id, outcome]);
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
  console.log(JSON.stringify({ level: "info", event: "review_recorded", paperId: req.params.id, reviewer, outcome }));
  res.json({ saved: true, review_status: outcome });
}));

module.exports = router;
