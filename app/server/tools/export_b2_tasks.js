/**
 * Export the writing task bank from the database into a source-controlled file.
 *
 *   node tools/export_b2_tasks.js            # writes src/seed/b2/writing_tasks.json
 *   node tools/export_b2_tasks.js --check     # compares DB against the file, writes nothing
 *
 * WHY THIS EXISTS RATHER THAN A HAND-WRITTEN SEED FILE.
 * Nine writing tasks are live. Two of them — s01_vier_tage_woche and
 * t01_sprachkurs_anfrage — have an INSERT in seed/seed_b2.js. The other seven
 * exist only in whichever Postgres they were first typed into:
 *
 *   g02_homeoffice  g03_oepnv  g04_homeoffice_thread
 *   t02_aupair_info  t03_aupair_beschwerde  t04_praktikum_bewerbung
 *   p01_aufnahmebericht_kremer
 *
 * That includes g04, which the writing loop demo runs on, and p01, the only
 * task a teacher has ever marked. A disk failure loses the German and the
 * content-point detectors with it.
 *
 * The detectors are the reason this is an export and not a transcription.
 * `content_points[].detector` is a regex per point, it is not returned by any
 * HTTP endpoint, and re-authoring one by hand would silently change what the
 * content-point checker detects — a scoring change disguised as a seed file.
 * So the rows are copied verbatim, by a machine, and committed.
 *
 * Round trip: this file writes the JSON, src/seed/seed_b2_tasks.js replays it.
 * Neither rewrites content; --check proves that after the fact.
 *
 * REVIEW STATUS IS NOT INVENTED. The export records `review: "unreviewed"` for
 * every task unless the database already says otherwise. Six of these seven
 * prompts have never been read by a teacher or recorded as reviewed anywhere in
 * this repository, and exporting them does not change that.
 */

require("../src/env")();
const fs = require("node:fs");
const path = require("node:path");
const pool = require("../src/db/pool");

const OUT = path.join(__dirname, "../src/seed/b2/writing_tasks.json");

/* Rubrics come along because a task is meaningless without the criteria it is
   marked against, and b2_tasks.rubric_id is a SERIAL — the number differs
   between databases, so it is resolved by (board, module, task_type, version)
   on the way back in rather than being stored. */
const RUBRIC_SQL = `
  SELECT board, module, task_type, version, provisional, dimensions,
         scale_max, subtest_weight, pass_mark, borderline_low, borderline_high
    FROM b2_rubrics
   ORDER BY board, module, task_type, version`;

const TASK_SQL = `
  SELECT t.id, t.prompt_de, t.content_points, t.target_words, t.source,
         r.board, r.module, r.task_type, r.version
    FROM b2_tasks t
    JOIN b2_rubrics r ON r.id = t.rubric_id
   ORDER BY r.board, t.id`;

async function main() {
  const check = process.argv.includes("--check");

  const [rubrics, tasks] = await Promise.all([
    pool.query(RUBRIC_SQL).then(r => r.rows),
    pool.query(TASK_SQL).then(r => r.rows),
  ]);
  await pool.end();

  const payload = {
    _comment: [
      "WRITING TASK BANK — exported from the database, not authored here.",
      "",
      "Produced by tools/export_b2_tasks.js and replayed by seed/seed_b2_tasks.js.",
      "Edit the database and re-export; do NOT hand-edit this file. The",
      "content_points detectors are regexes the content-point checker depends on,",
      "and changing one by hand changes scoring.",
      "",
      "`review` is 'unreviewed' unless a teacher sign-off exists. Most of these",
      "prompts have never been read by a qualified teacher. Exporting them did",
      "not review them.",
    ],
    exported_at: new Date().toISOString().slice(0, 10),
    rubrics,
    tasks: tasks.map(t => ({
      id: t.id,
      rubric: { board: t.board, module: t.module, task_type: t.task_type, version: t.version },
      prompt_de: t.prompt_de,
      content_points: t.content_points,
      target_words: t.target_words,
      source: t.source,
      review: "unreviewed",
    })),
  };

  if (check) {
    if (!fs.existsSync(OUT)) {
      console.error(`FAIL: ${path.relative(process.cwd(), OUT)} does not exist. Run without --check first.`);
      process.exit(1);
    }
    const onDisk = JSON.parse(fs.readFileSync(OUT, "utf8"));
    const norm = (o) => JSON.stringify({ rubrics: o.rubrics, tasks: o.tasks });
    if (norm(onDisk) === norm(payload)) {
      console.log(`OK — ${payload.tasks.length} tasks, ${payload.rubrics.length} rubrics match the committed file.`);
      return;
    }
    const ids = new Set(onDisk.tasks.map(t => t.id));
    const live = new Set(payload.tasks.map(t => t.id));
    console.error("DRIFT between the database and the committed file.");
    for (const id of live) if (!ids.has(id)) console.error(`  only in DB:   ${id}`);
    for (const id of ids) if (!live.has(id)) console.error(`  only in file: ${id}`);
    for (const t of payload.tasks) {
      const was = onDisk.tasks.find(x => x.id === t.id);
      if (was && JSON.stringify(was) !== JSON.stringify(t)) console.error(`  changed:      ${t.id}`);
    }
    process.exit(1);
  }

  fs.writeFileSync(OUT, JSON.stringify(payload, null, 2) + "\n");
  console.log(`Wrote ${path.relative(process.cwd(), OUT)}`);
  console.log(`  ${payload.rubrics.length} rubrics, ${payload.tasks.length} tasks`);
  for (const t of payload.tasks) {
    console.log(`  ${t.rubric.board.padEnd(12)} ${t.id.padEnd(28)} ${t.target_words ?? "?"}w  ` +
                `${(t.content_points || []).length} points`);
  }
  console.log("\nCommit this file. Re-run with --check in CI to catch drift.");
}

/* `e.message` alone is not enough. A refused or sandbox-denied Postgres socket
   arrives as EPERM/ECONNREFUSED with an EMPTY message, so printing just the
   message exited 1 having said nothing at all — the one failure mode this tool
   is most likely to hit, reported as a blank line. Name the code, and say what
   to check. */
main().catch(e => {
  const code = e.code ? ` (${e.code})` : "";
  console.error(`export failed${code}: ${e.message || "no error message given"}`);
  if (e.code === "EPERM" || e.code === "ECONNREFUSED" || e.code === "ENOTFOUND") {
    console.error(`could not reach Postgres at ${process.env.DATABASE_URL || "postgresql://localhost/learn_german"}`);
    console.error("check the database is running and DATABASE_URL is set.");
  }
  process.exit(1);
});
