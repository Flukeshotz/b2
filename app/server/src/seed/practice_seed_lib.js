/**
 * SHARED SEEDING PLUMBING for the standalone practice bank (board='custom').
 *
 * Extracted out of seed_practice_bank.js so seed_reading_bank.js and
 * seed_writing_bank.js (the Reading/Writing depth pass) can reuse the exact
 * same item builders, row shaping and upsert logic instead of forking a
 * second copy. No behaviour changed in the extraction — same SQL, same
 * validation calls, same review_status default.
 */
require("../env")();
const pool = require("../db/pool");
const model = require("../b2/content_model");
const { arrangeSingle, arrangeMulti } = require("../b2/option_order");

function mcq({ stem, options, answer, capability, difficulty, rationale }) {
  return { item_type: "MCQ", capability, difficulty, stem, options, answer, rationale };
}
function trueFalse({ stem, answer, capability, difficulty, rationale }) {
  return { item_type: "TRUE_FALSE", capability, difficulty, stem, answer_value: answer, rationale };
}
function multiSelect({ stem, options, correct, capability, difficulty, rationale }) {
  return { item_type: "MULTI_SELECT", capability, difficulty, stem, options, correct, rationale };
}
function matching({ stem, left, right, mapping, capability, difficulty, rationale }) {
  return { item_type: "MATCHING", capability, difficulty, stem, left, right, mapping, rationale };
}
function ordering({ stem, items, order, capability, difficulty, rationale }) {
  return { item_type: "ORDERING", capability, difficulty, stem, items, order, rationale };
}
function longText({ stem, min_words, target_words, rubric_id, rubric_key, guidance,
                    task_type, register, capability = "structure", difficulty = "B" }) {
  return { item_type: "LONG_TEXT", capability, difficulty, stem, min_words, target_words,
           rubric_id, rubric_key, guidance, task_type, register };
}
function spokenResponse({ stem, prep_seconds, speak_seconds, capability = "argue", difficulty = "B" }) {
  return { item_type: "SPOKEN_RESPONSE", capability, difficulty, stem, prep_seconds, speak_seconds };
}

function buildItemRow(raw, sectionSkill) {
  const row = {
    item_type: raw.item_type, stem: raw.stem,
    options: null, answer: null, answer_payload: null,
    payload: {}, scoring_mode: "OBJECTIVE", points: 1,
    skill: sectionSkill, capability: raw.capability, difficulty: raw.difficulty,
    rationale: raw.rationale ?? null,
    source_type: "ORIGINAL", source_book: null, source_page: null,
  };
  if (raw.item_type === "MCQ") {
    const c = arrangeSingle(raw.stem, raw.options, raw.answer);
    row.options = c.options; row.answer = c.answer;
  } else if (raw.item_type === "TRUE_FALSE") {
    row.answer_payload = { value: raw.answer_value };
  } else if (raw.item_type === "MULTI_SELECT") {
    const c = arrangeMulti(raw.stem, raw.options, raw.correct);
    row.payload = { options: c.options }; row.answer_payload = { correct: c.correct };
  } else if (raw.item_type === "MATCHING") {
    row.payload = { left: raw.left, right: raw.right }; row.answer_payload = { mapping: raw.mapping };
  } else if (raw.item_type === "ORDERING") {
    row.payload = { items: raw.items }; row.answer_payload = { order: raw.order };
  } else if (raw.item_type === "LONG_TEXT") {
    row.scoring_mode = "RUBRIC"; row.points = 4;
    row.payload = { rubric_id: raw.rubric_id, rubric_key: raw.rubric_key,
                    min_words: raw.min_words, target_words: raw.target_words, guidance: raw.guidance ?? null,
                    task_type: raw.task_type ?? null, register: raw.register ?? null };
  } else if (raw.item_type === "SPOKEN_RESPONSE") {
    row.scoring_mode = "TRANSCRIPT_ONLY"; row.points = 0;
    row.payload = { speak_seconds: raw.speak_seconds, prep_seconds: raw.prep_seconds };
  } else {
    throw new Error(`practice_seed_lib: unsupported item_type ${raw.item_type}`);
  }
  return row;
}

async function seedPaper(spec, { reviewStatus = "AUTO_QA_PASS", force = process.argv.includes("--force") } = {}) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const existing = await client.query(`SELECT 1 FROM b2_papers WHERE id=$1`, [spec.paper.id]);
    if (existing.rows.length && !force) {
      console.log(`  ${spec.paper.id}: already seeded — run with --force to replace`);
      await client.query("ROLLBACK");
      return;
    }

    await client.query(
      `INSERT INTO b2_papers (id, board, title, minutes, source, provisional,
                               exam_version, alignment, source_type, review_status, difficulty)
       VALUES ($1,$2,$3,$4,$5,true,$6,$7,'ORIGINAL',$8,'B')
       ON CONFLICT (id) DO UPDATE SET
         title=EXCLUDED.title, minutes=EXCLUDED.minutes, source=EXCLUDED.source,
         exam_version=EXCLUDED.exam_version, alignment=EXCLUDED.alignment, review_status=EXCLUDED.review_status`,
      [spec.paper.id, spec.paper.board, spec.paper.title, spec.paper.minutes,
       spec.paper.source, spec.paper.exam_version, spec.paper.alignment, reviewStatus]);

    await client.query(`DELETE FROM b2_paper_sections WHERE paper_id=$1`, [spec.paper.id]);

    const { rows } = await client.query(
      `INSERT INTO b2_paper_sections
         (paper_id, module, part_no, title, instruction, minutes, time_limit_seconds,
          passage, skill, scoring_mode, item_count, audio_required, audio_intended_id)
       VALUES ($1,$2,1,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id`,
      [spec.paper.id, spec.section.module, spec.section.title, spec.section.instruction,
       spec.section.minutes, spec.section.minutes * 60, spec.section.passage ?? null,
       spec.section.skill, spec.section.scoring_mode, spec.items.length,
       !!spec.section.audio_required, spec.section.audio_intended_id ?? null]);
    const sectionId = rows[0].id;

    let itemNo = 0;
    for (const raw of spec.items) {
      const row = buildItemRow(raw, spec.section.skill);
      const v = model.validateItem(row);
      if (!v.valid) throw new Error(`${spec.paper.id} item ${itemNo + 1}: ${v.problems.join("; ")}`);
      const p = model.validateProvenance(row, { required: true });
      if (!p.valid) throw new Error(`${spec.paper.id} item ${itemNo + 1} provenance: ${p.problems.join("; ")}`);

      await client.query(
        `INSERT INTO b2_paper_items
           (section_id, item_no, stem, options, answer, rationale,
            item_type, payload, answer_payload, scoring_mode, points,
            skill, capability, difficulty, source_type, review_status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
        [sectionId, ++itemNo, row.stem, JSON.stringify(row.options ?? []), row.answer, row.rationale,
         row.item_type, JSON.stringify(row.payload ?? {}), row.answer_payload ? JSON.stringify(row.answer_payload) : null,
         row.scoring_mode, row.points, row.skill, row.capability, row.difficulty, row.source_type, reviewStatus]);
    }

    await client.query("COMMIT");
    console.log(`  ${spec.paper.id}: seeded 1 section(s), ${spec.items.length} item(s) [${reviewStatus}]`);
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

module.exports = {
  pool, model, mcq, trueFalse, multiSelect, matching, ordering, longText, spokenResponse,
  buildItemRow, seedPaper,
};
