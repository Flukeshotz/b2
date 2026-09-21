/**
 * Replay the exported writing task bank into a database.
 *
 *   node src/seed/seed_b2_tasks.js
 *
 * The other half of tools/export_b2_tasks.js. Together they make the nine live
 * writing tasks reproducible from source control instead of existing only in
 * one developer's Postgres — see that file for why this is an export/replay
 * pair rather than a hand-written seeder.
 *
 * PRESERVES CONTENT EXACTLY. Every field is written back as exported: the
 * German prompt, the content points including their detector regexes, the word
 * target and the source note. Nothing here rewrites, reformats or improves any
 * German, and the upsert is keyed on the task id so re-running is idempotent.
 *
 * Rubric ids are SERIAL and differ per database, so the export stores
 * (board, module, task_type, version) and this resolves it locally. A task
 * whose rubric is missing is REPORTED AND SKIPPED rather than attached to
 * whatever rubric happens to be nearest — a task marked against the wrong
 * board's criteria is worse than a task that is absent.
 *
 * This does not overlap seed_b2.js: that file seeds the two original tasks and
 * their rubrics from inline literals. Running both is safe (same ids, same
 * upsert), and the export is the authority for the seven that have no literal.
 */

require("../env")();
const path = require("node:path");
const fs = require("node:fs");
const pool = require("../db/pool");

const FILE = path.join(__dirname, "b2/writing_tasks.json");

async function main() {
  if (!fs.existsSync(FILE)) {
    console.error(`Missing ${path.relative(process.cwd(), FILE)}.`);
    console.error("Run `node tools/export_b2_tasks.js` against a database that has the tasks.");
    process.exit(1);
  }
  const { rubrics = [], tasks = [] } = JSON.parse(fs.readFileSync(FILE, "utf8"));

  for (const r of rubrics) {
    await pool.query(
      `INSERT INTO b2_rubrics (board, module, task_type, version, provisional, dimensions,
                               scale_max, subtest_weight, pass_mark, borderline_low, borderline_high)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (board, module, task_type, version) DO UPDATE SET
         provisional = EXCLUDED.provisional,
         dimensions  = EXCLUDED.dimensions,
         scale_max   = EXCLUDED.scale_max,
         subtest_weight = EXCLUDED.subtest_weight,
         pass_mark   = EXCLUDED.pass_mark,
         borderline_low  = EXCLUDED.borderline_low,
         borderline_high = EXCLUDED.borderline_high`,
      [r.board, r.module, r.task_type, r.version, r.provisional,
       JSON.stringify(r.dimensions), r.scale_max, r.subtest_weight,
       r.pass_mark, r.borderline_low, r.borderline_high]
    );
  }

  let written = 0;
  const skipped = [];
  for (const t of tasks) {
    /* The export may or may not carry a rubric VERSION. The database export
       does; the API export (see the file's own `_comment`) cannot, because
       /tasks does not select it. Resolve on the three fields that are always
       present and take the highest version — a task is marked against the
       current criteria unless it names an older set explicitly. */
    const { rows } = await pool.query(
      t.rubric.version
        ? `SELECT id FROM b2_rubrics WHERE board=$1 AND module=$2 AND task_type=$3 AND version=$4`
        : `SELECT id FROM b2_rubrics WHERE board=$1 AND module=$2 AND task_type=$3
             ORDER BY version DESC LIMIT 1`,
      t.rubric.version
        ? [t.rubric.board, t.rubric.module, t.rubric.task_type, t.rubric.version]
        : [t.rubric.board, t.rubric.module, t.rubric.task_type]
    );
    if (!rows[0]) {
      skipped.push(`${t.id} — no rubric for ${t.rubric.board}/${t.rubric.module}/${t.rubric.task_type}` +
                   (t.rubric.version ? ` v${t.rubric.version}` : ""));
      continue;
    }
    /* `source` is COALESCEd rather than overwritten. The API export cannot see
       it, and replaying one of those must not wipe a provenance note the row
       already carries — losing provenance silently is the exact failure this
       whole file exists to prevent. */
    await pool.query(
      `INSERT INTO b2_tasks (id, rubric_id, prompt_de, content_points, target_words, source)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (id) DO UPDATE SET
         rubric_id      = EXCLUDED.rubric_id,
         prompt_de      = EXCLUDED.prompt_de,
         content_points = EXCLUDED.content_points,
         target_words   = EXCLUDED.target_words,
         source         = COALESCE(EXCLUDED.source, b2_tasks.source)`,
      [t.id, rows[0].id, t.prompt_de, JSON.stringify(t.content_points || []),
       t.target_words, t.source ?? null]
    );
    written += 1;
  }

  console.log(`Seeded ${rubrics.length} rubrics and ${written} writing tasks from the export.`);
  for (const s of skipped) console.log(`  SKIPPED  ${s}`);

  const unreviewed = tasks.filter(t => t.review !== "reviewed").map(t => t.id);
  if (unreviewed.length) {
    console.log(`\nNOTE: ${unreviewed.length} of ${tasks.length} tasks are marked unreviewed:`);
    console.log(`  ${unreviewed.join(", ")}`);
    console.log("  No German in this set carries teacher sign-off unless recorded as reviewed.");
  }
  await pool.end();
}

main().catch(e => { console.error(e.message); process.exit(1); });
