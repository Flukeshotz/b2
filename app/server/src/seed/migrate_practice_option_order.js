/* One-off: apply b2/option_order to practice-* choice items seeded before
   practice_seed_lib arranged them (the key was always option A). The arrangement
   depends only on item content, so re-running is a no-op and it matches a fresh
   --force reseed. Unfinished attempts on touched papers are reset, because their
   stored indexes point at the old order.
   Run: node src/seed/migrate_practice_option_order.js [--dry-run] */
require("../env")();
const pool = require("../db/pool");
const { arrangeSingle, arrangeMulti } = require("../b2/option_order");

const dry = process.argv.includes("--dry-run");
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

(async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `SELECT i.id, i.item_type, i.stem, i.options, i.answer, i.payload, i.answer_payload, s.paper_id
         FROM b2_paper_items i JOIN b2_paper_sections s ON s.id = i.section_id
        WHERE s.paper_id LIKE 'practice-%' AND i.item_type IN ('MCQ','MULTI_SELECT')`);
    const papers = new Set();
    let changed = 0;
    for (const r of rows) {
      const { options_shuffled, ...payload } = r.payload || {}; // drop an earlier run's marker
      if (r.item_type === "MCQ") {
        const c = arrangeSingle(r.stem, r.options, r.answer);
        if (same(c.options, r.options) && c.answer === r.answer && options_shuffled === undefined) continue;
        await client.query(`UPDATE b2_paper_items SET options=$2, answer=$3, payload=$4 WHERE id=$1`,
          [r.id, JSON.stringify(c.options), c.answer, JSON.stringify(payload)]);
      } else {
        const c = arrangeMulti(r.stem, payload.options, r.answer_payload.correct);
        if (same(c.options, payload.options) && options_shuffled === undefined) continue;
        await client.query(`UPDATE b2_paper_items SET payload=$2, answer_payload=$3 WHERE id=$1`,
          [r.id, JSON.stringify({ ...payload, options: c.options }),
           JSON.stringify({ ...r.answer_payload, correct: c.correct })]);
      }
      changed++;
      papers.add(r.paper_id);
    }
    const reset = await client.query(
      `DELETE FROM b2_paper_attempts WHERE finished_at IS NULL AND paper_id = ANY($1)`, [[...papers]]);
    const { rows: dist } = await client.query(
      `SELECT i.answer, count(*)::int FROM b2_paper_items i JOIN b2_paper_sections s ON s.id = i.section_id
        WHERE s.paper_id LIKE 'practice-%' AND i.item_type = 'MCQ' GROUP BY 1 ORDER BY 1`);
    await client.query(dry ? "ROLLBACK" : "COMMIT");
    console.log(`${dry ? "[dry-run] would reorder" : "reordered"} ${changed} items in ${papers.size} papers; ` +
      `reset ${reset.rowCount} unfinished attempts; key position spread:`, dist);
  } catch (e) {
    await client.query("ROLLBACK"); throw e;
  } finally { client.release(); pool.end(); }
})();
