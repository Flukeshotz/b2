/**
 * Pulls the 8 telc Hören papers with a corrupted answer key (see
 * fix_broken_rationale.js's header) out of being servable, by setting
 * review_status='DRAFT'. Paired with the new gate in exam_paper.js's
 * startPaper() — DRAFT was never actually checked at serve time before
 * this, so setting the status alone would not have stopped a student from
 * starting one of these papers.
 *
 *   node tools/mark_hoeren_drafts.js [--apply]
 */
require("../src/env")();
const pool = require("../src/db/pool");
const APPLY = process.argv.includes("--apply");

const PAPER_IDS = [
  "telc-b2-hoeren-t1-s1", "telc-b2-hoeren-t1-s2", "telc-b2-hoeren-t1-s3",
  "telc-b2-hoeren-t2-s1", "telc-b2-hoeren-t2-s2",
  "telc-b2-hoeren-t3-s1", "telc-b2-hoeren-t3-s2", "telc-b2-hoeren-t3-s3",
];

async function main() {
  const { rows } = await pool.query(
    `SELECT id, review_status FROM b2_papers WHERE id = ANY($1)`, [PAPER_IDS]);
  for (const r of rows) console.log(`  ${r.id}: ${r.review_status} -> DRAFT`);

  if (APPLY) {
    await pool.query(`UPDATE b2_papers SET review_status='DRAFT' WHERE id = ANY($1)`, [PAPER_IDS]);
    console.log(`\nApplied to ${rows.length} papers.`);
  } else {
    console.log(`\nDry run — re-run with --apply to write this.`);
  }
  await pool.end();
}

main().catch(e => { console.error("FAILED:", e); process.exit(1); });
