/**
 * CONTENT EXPORT — a clean, self-contained snapshot of the Reading,
 * Listening, Speaking and Writing content (papers -> sections -> items,
 * WITH the real expected answers/rationale) for another app to ingest.
 *
 *   node tools/export_content.js
 *
 * Deliberately NOT the seed scripts: several of those (seed_goethe_b2_master.js,
 * seed_telc_b2_master.js) read from JSON files on the author's Desktop,
 * outside this repo — nothing a "main app" could clone and run. This reads
 * straight from the live, already-seeded database and writes one clean JSON
 * file per skill under content-export/, with no external dependency at all.
 *
 * Answer keys ARE included (answer, answer_payload, rationale) — this is a
 * content-ingestion export for another system, not a learner-facing API
 * response, so the same field is honest here that would be stripped by
 * assessment_content.js's safeItem() before anything reaches a browser.
 */
require("../src/env")();
const fs = require("fs");
const path = require("path");
const pool = require("../src/db/pool");

const SKILLS = ["reading", "listening", "speaking", "writing"];
const OUT_DIR = path.join(__dirname, "..", "content-export");

async function exportSkill(skill) {
  const { rows } = await pool.query(
    `SELECT
       p.id AS paper_id, p.board, p.title AS paper_title, p.exam_version,
       p.alignment, p.source_type AS paper_source_type, p.review_status AS paper_review_status,
       p.minutes AS paper_minutes,
       s.id AS section_id, s.part_no, s.module, s.title AS section_title,
       s.instruction, s.passage, s.skill, s.scoring_mode AS section_scoring_mode,
       s.minutes AS section_minutes,
       i.id AS item_id, i.item_no, i.item_type, i.stem, i.options, i.answer,
       i.answer_payload, i.rationale, i.payload, i.scoring_mode, i.points,
       i.capability, i.difficulty, i.source_type AS item_source_type,
       i.review_status AS item_review_status
     FROM b2_papers p
     JOIN b2_paper_sections s ON s.paper_id = p.id
     JOIN b2_paper_items i ON i.section_id = s.id
     WHERE s.skill = $1
     ORDER BY p.board, p.id, s.part_no, i.item_no`,
    [skill]
  );

  // Group flat rows into paper -> sections -> items.
  const papers = new Map();
  for (const r of rows) {
    if (!papers.has(r.paper_id)) {
      papers.set(r.paper_id, {
        paperId: r.paper_id,
        board: r.board,
        title: r.paper_title,
        examVersion: r.exam_version,
        alignment: r.alignment,
        sourceType: r.paper_source_type,
        reviewStatus: r.paper_review_status,
        minutes: r.paper_minutes,
        sections: new Map(),
      });
    }
    const paper = papers.get(r.paper_id);
    if (!paper.sections.has(r.section_id)) {
      paper.sections.set(r.section_id, {
        partNo: r.part_no,
        module: r.module,
        title: r.section_title,
        instruction: r.instruction,
        passage: r.passage,
        skill: r.skill,
        scoringMode: r.section_scoring_mode,
        minutes: r.section_minutes,
        items: [],
      });
    }
    paper.sections.get(r.section_id).items.push({
      itemNo: r.item_no,
      itemId: `${r.paper_id}_${String(r.item_no)}`, // stable, human-readable; not the runtime slot id
      itemType: r.item_type,
      stem: r.stem,
      options: r.options,
      answer: r.answer,
      answerPayload: r.answer_payload,
      rationale: r.rationale,
      payload: r.payload,
      scoringMode: r.scoring_mode,
      points: r.points,
      capability: r.capability,
      difficulty: r.difficulty,
      sourceType: r.item_source_type,
      reviewStatus: r.item_review_status,
    });
  }

  const out = [...papers.values()].map(p => ({
    ...p,
    sections: [...p.sections.values()].sort((a, b) => a.partNo - b.partNo),
  }));

  return out;
}

// board -> folder name. "custom" is Skillcase-original practice, never
// Goethe/telc exam-board content — kept in its own folder for exactly the
// same reason board is never conflated anywhere else in this product.
const BOARD_DIR = { goethe: "goethe", telc: "telc", custom: "custom" };

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const manifest = { generatedAt: new Date().toISOString(), skills: {} };

  for (const skill of SKILLS) {
    const data = await exportSkill(skill);
    const itemCount = data.reduce((n, p) => n + p.sections.reduce((m, s) => m + s.items.length, 0), 0);

    const byBoard = {};
    for (const p of data) (byBoard[p.board] ||= []).push(p);

    manifest.skills[skill] = { papers: data.length, items: itemCount, papersByBoard: {} };

    for (const [board, papers] of Object.entries(byBoard)) {
      const dir = BOARD_DIR[board];
      if (!dir) throw new Error(`unknown board "${board}" — add it to BOARD_DIR before exporting`);
      fs.mkdirSync(path.join(OUT_DIR, dir), { recursive: true });
      const boardItemCount = papers.reduce((n, p) => n + p.sections.reduce((m, s) => m + s.items.length, 0), 0);
      fs.writeFileSync(path.join(OUT_DIR, dir, `${skill}.json`), JSON.stringify(papers, null, 2));
      manifest.skills[skill].papersByBoard[board] = { papers: papers.length, items: boardItemCount };
      console.log(`${dir}/${skill}.json: ${papers.length} papers, ${boardItemCount} items`);
    }
  }

  fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2));
  console.log("\nWrote manifest.json");
  await pool.end();
}

main().catch(e => { console.error("FAILED:", e); process.exit(1); });
