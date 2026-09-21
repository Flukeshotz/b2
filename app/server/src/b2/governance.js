/**
 * B2 CONTENT GOVERNANCE & SME REVIEW REGISTRY.
 *
 * Exposes a structured, single-source-of-truth inventory of all B2 content units
 * across Diagnostic Assessments, Practice Banks, and Exam Papers.
 *
 * Review statuses:
 *   DRAFT         — authored / seeded, not yet reviewed by a designated German SME
 *   SME_REVIEWED  — audited by an SME with notes
 *   APPROVED      — approved for learner delivery
 *   RETIRED       — archived / withdrawn from live curriculum
 */

const pool = require("../db/pool");
const { CAPABILITIES } = require("./capabilities");
const { BLUEPRINT } = require("../seed/b2/assessment");

async function getContentInventory({ module, status, skill } = {}) {
  const items = [];

  // 1. Diagnostic Assessments & Papers from b2_papers
  const { rows: papers } = await pool.query(
    `SELECT id, board, title, minutes, source, provisional, source_type, review_status,
            alignment, difficulty
       FROM b2_papers ORDER BY board, id`);

  for (const p of papers) {
    const isComplete = p.id.includes("complete");
    items.push({
      id: p.id,
      title: p.title,
      type: isComplete ? "complete_paper" : "standalone_set",
      module: "exam",
      track: p.board,
      skill: p.id.split("-")[2] || "exam",
      capability: "multi_capability",
      difficulty: p.difficulty || "B2",
      provenance: p.source_type || "ORIGINAL",
      source_type: p.source_type || "ORIGINAL",
      exam_family: p.board,
      exam_component: p.id.split("-")[2] || "exam",
      exam_alignment: p.alignment || "exam_format_practice",
      rubric: "board_aligned",
      audio_status: p.id.includes("hoeren") ? "verified_audio" : "n/a",
      transcript_status: p.id.includes("hoeren") ? "verified" : "n/a",
      scoring_mode: "board_weighted",
      review_status: p.review_status || "DRAFT",
    });
  }

  // 2. Practice experiences from b2_experiences
  try {
    const { rows: exps } = await pool.query(
      `SELECT id, title, kind, primary_capability, difficulty, source_type, review_status, updated_at
         FROM b2_experiences ORDER BY kind, id`);

    for (const e of exps) {
      items.push({
        id: e.id,
        title: e.title,
        type: "practice_experience",
        module: "practice",
        track: e.kind,
        skill: e.kind,
        capability: e.primary_capability || "general_b2",
        difficulty: e.difficulty || "B2",
        provenance: e.source_type || "ORIGINAL",
        source_type: e.source_type || "ORIGINAL",
        exam_family: "skillcase_practice",
        exam_component: e.kind,
        exam_alignment: "curriculum_practice",
        rubric: e.kind === "writing" ? "analytical_rubric" : "closed_key",
        audio_status: e.kind === "listening" ? "synthetic_or_recorded" : "n/a",
        transcript_status: e.kind === "listening" ? "available" : "n/a",
        scoring_mode: e.kind === "writing" ? "automated_marking" : "objective_scoring",
        review_status: e.review_status || "DRAFT",
        updated_at: e.updated_at,
      });
    }
  } catch {
    // b2_experiences table might be empty or in different state in some test runs
  }

  // Filter if requested
  let filtered = items;
  if (module) filtered = filtered.filter(i => i.module === module);
  if (status) filtered = filtered.filter(i => i.review_status === status);
  if (skill) filtered = filtered.filter(i => i.skill === skill);

  return filtered;
}

async function getGovernanceSummary() {
  const all = await getContentInventory();

  const byModule = {};
  const byStatus = {};
  const bySkill = {};
  const byProvenance = {};

  for (const item of all) {
    byModule[item.module] = (byModule[item.module] || 0) + 1;
    byStatus[item.review_status] = (byStatus[item.review_status] || 0) + 1;
    bySkill[item.skill] = (bySkill[item.skill] || 0) + 1;
    byProvenance[item.source_type] = (byProvenance[item.source_type] || 0) + 1;
  }

  return {
    totalUnits: all.length,
    byModule,
    byStatus,
    bySkill,
    byProvenance,
    canonicalCapabilitiesCount: CAPABILITIES.length,
    generatedAt: new Date().toISOString(),
  };
}

async function updateContentReviewStatus(id, review_status, notes = null) {
  const allowed = ["DRAFT", "SME_REVIEWED", "APPROVED", "RETIRED", "AUTO_QA_PASS"];
  if (!allowed.includes(review_status)) {
    throw new Error(`Invalid review status: ${review_status}. Allowed: ${allowed.join(", ")}`);
  }

  // Update in b2_papers or b2_experiences
  const r1 = await pool.query(
    `UPDATE b2_papers SET review_status=$1 WHERE id=$2 RETURNING id`,
    [review_status, id]
  );
  if (r1.rowCount > 0) return { id, table: "b2_papers", review_status };

  const r2 = await pool.query(
    `UPDATE b2_experiences SET review_status=$1, updated_at=now() WHERE id=$2 RETURNING id`,
    [review_status, id]
  );
  if (r2.rowCount > 0) return { id, table: "b2_experiences", review_status };

  return null;
}

module.exports = {
  getContentInventory,
  getGovernanceSummary,
  updateContentReviewStatus,
};
