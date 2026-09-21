/**
 * Migration runner — inspect, apply, verify.
 *
 * Deliberately not a bare `psql -f`. The Phase 0 audit could not establish
 * whether production held real learner progress, and it turned out to hold
 * some. So this prints what it is about to touch, applies the change in a
 * transaction, and then re-checks the invariants that matter afterwards. A
 * migration that reports "done" without proving A1 survived is not evidence.
 *
 *   node tools/migrate.js            # inspect only, changes nothing
 *   node tools/migrate.js --apply
 *   node tools/migrate.js --rollback
 */

const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgresql://localhost/learn_german" });
const MIG = path.join(__dirname, "../src/db/migrations");
const q = async (sql, p = []) => (await pool.query(sql, p)).rows;

const hasLevel = async () =>
  (await q(`SELECT 1 FROM information_schema.columns
             WHERE table_name='topics' AND column_name='level'`)).length > 0;

const tableExists = async (t) =>
  (await q(`SELECT 1 FROM information_schema.tables WHERE table_name=$1`, [t])).length > 0;

/* Migrations are listed, not discovered, so the order is explicit and a stray
   file in the directory can never run. Each declares what must be true after it
   — a migration that reports success without proving anything is not evidence. */
const MIGRATIONS = [
  { id: "001_topics_level", verify: "level" },
  { id: "002_b2_content",   verify: "tables", tables: ["b2_sources", "b2_experiences"] },
  { id: "003_b2_evidence",  verify: "tables", tables: ["b2_evidence", "b2_profile", "b2_learner_goal"] },
  { id: "004_content_lifecycle", verify: "column", table: "topics", column: "status" },
  { id: "005_expression_state", verify: "tables", tables: ["b2_expression_state"] },
  { id: "006_rewrite", verify: "column", table: "b2_submissions", column: "parent_id" },
  { id: "007_exam_plays", verify: "tables", tables: ["b2_exam_plays"] },
  { id: "008_maya_sessions", verify: "tables", tables: ["b2_maya_sessions"] },
  { id: "009_assessment_attempts", verify: "tables", tables: ["b2_assessment_items"] },
  { id: "010_production_content", verify: "tables",
    tables: ["b2_content_reviews", "b2_speaking_tasks", "b2_audio_assets",
             "b2_attempt_sections", "b2_can_dos", "b2_can_do_links"] },
  { id: "011_core2026b_rubrics", verify: "custom_rubric_board" },
  { id: "012_audio_intended", verify: "column", table: "b2_paper_sections", column: "audio_intended_id" },
  { id: "013_content_status_views", verify: "view", view: "b2_v_assessment_versions" },
  { id: "014_one_open_assessment", verify: "index", index: "b2_one_open_assessment_per_user" },
  { id: "015_auth", verify: "column", table: "users", column: "password_hash" },
  { id: "016_one_open_paper", verify: "index", index: "b2_one_open_paper_per_user" },
];

const columnExists = async (t, c) =>
  (await q(`SELECT 1 FROM information_schema.columns
             WHERE table_name=$1 AND column_name=$2`, [t, c])).length > 0;

const applied = async (m) => {
  if (m.verify === "custom_rubric_board") {
    const d = await q(`SELECT pg_get_constraintdef(oid) AS def FROM pg_constraint WHERE conname='b2_rubrics_board_check'`);
    return !!d[0] && d[0].def.includes("custom");
  }
  if (m.verify === "view") {
    return (await q(`SELECT 1 FROM information_schema.views WHERE table_name=$1`, [m.view])).length > 0;
  }
  if (m.verify === "index") {
    return (await q(`SELECT 1 FROM pg_indexes WHERE indexname=$1`, [m.index])).length > 0;
  }
  if (m.verify === "level") return hasLevel();
  if (m.verify === "column") return columnExists(m.table, m.column);
  for (const t of m.tables) if (!(await tableExists(t))) return false;
  return true;
};

async function inspect() {
  const cols = await q(`SELECT column_name, data_type, is_nullable, column_default
                          FROM information_schema.columns WHERE table_name='topics'
                         ORDER BY ordinal_position`);
  const counts = await q(`SELECT
      (SELECT count(*) FROM topics)        AS topics,
      (SELECT count(*) FROM user_progress) AS progress,
      (SELECT count(*) FROM review_queue)  AS review,
      (SELECT count(*) FROM users)         AS users`);
  console.log("\ntopics columns:");
  for (const c of cols) console.log(`  ${c.column_name.padEnd(12)} ${c.data_type.padEnd(10)} ${c.is_nullable === "NO" ? "NOT NULL" : "nullable"} ${c.column_default || ""}`);
  console.log("\nrow counts:", counts[0]);

  // Never assume the database is empty. It is not.
  if (Number(counts[0].progress) > 0) {
    console.log(`\n  ${counts[0].progress} rows of real learner progress exist — this migration does not touch them.`);
  }
  if (await hasLevel()) {
    const byLevel = await q("SELECT level, count(*) FROM topics GROUP BY level ORDER BY level");
    console.log("\nby level:", byLevel.map(r => `${r.level}=${r.count}`).join("  "));
  }
  return counts[0];
}

/** Everything that must still be true after the column lands. */
async function verify(before) {
  const checks = [];
  const ok = (name, pass, detail = "") => { checks.push({ name, pass, detail }); };

  ok("column `level` exists", await hasLevel());

  const nulls = await q("SELECT count(*)::int AS n FROM topics WHERE level IS NULL");
  ok("no topic has a NULL level", nulls[0].n === 0, `${nulls[0].n} NULL`);

  const strays = await q("SELECT count(*)::int AS n FROM topics WHERE level NOT IN ('a1','a2','b1','b2')");
  ok("every level is on the CEFR ladder", strays[0].n === 0, `${strays[0].n} off-ladder`);

  const after = await q("SELECT count(*)::int AS n FROM topics");
  ok("no topic row was lost", after[0].n === Number(before.topics), `${before.topics} -> ${after[0].n}`);

  const prog = await q("SELECT count(*)::int AS n FROM user_progress");
  ok("no progress row was lost", prog[0].n === Number(before.progress), `${before.progress} -> ${prog[0].n}`);

  // The whole reason the column exists: existing content must still be A1.
  const legacy = await q("SELECT count(*)::int AS n FROM topics WHERE id LIKE 'a1%' AND level <> 'a1'");
  ok("every pre-existing a1* topic is level a1", legacy[0].n === 0, `${legacy[0].n} misclassified`);

  // A B2 row must be insertable and must not disturb A1's ordering. Rolled
  // back either way — a verification step must never leave content behind.
  const client = await pool.connect();
  let insertOk = false, a1Stable = false;
  try {
    await client.query("BEGIN");
    const a1Before = (await client.query("SELECT id FROM topics WHERE level='a1' ORDER BY order_index")).rows.map(r => r.id);
    await client.query(
      `INSERT INTO topics (id, order_index, icon, title, capability, proof, subs, level)
       VALUES ('__probe__', 0, '🧪', 'probe', 'c', 'p', '[]'::jsonb, 'b2')`);
    insertOk = true;
    const a1After = (await client.query("SELECT id FROM topics WHERE level='a1' ORDER BY order_index")).rows.map(r => r.id);
    a1Stable = JSON.stringify(a1Before) === JSON.stringify(a1After);
  } finally {
    await client.query("ROLLBACK");
    client.release();
  }
  ok("a b2 topic can be inserted", insertOk);
  ok("inserting b2 leaves the a1 sequence identical", a1Stable);

  // The constraint must actually refuse a bad level, not just describe one.
  let refused = false;
  const c2 = await pool.connect();
  try {
    await c2.query("BEGIN");
    await c2.query(`INSERT INTO topics (id, order_index, icon, title, capability, proof, subs, level)
                    VALUES ('__bad__', 0, 'x', 't', 'c', 'p', '[]'::jsonb, 'B2')`);
  } catch { refused = true; } finally { await c2.query("ROLLBACK"); c2.release(); }
  ok("an off-ladder level is refused", refused);

  console.log("\nverification:");
  for (const c of checks) console.log(`  ${c.pass ? "PASS" : "FAIL"}  ${c.name}${c.detail ? `  (${c.detail})` : ""}`);
  const failed = checks.filter(c => !c.pass);
  if (failed.length) { console.error(`\n${failed.length} check(s) FAILED.`); process.exit(1); }
  console.log(`\nAll ${checks.length} checks passed.`);
}

/* Proves the content and evidence tables actually behave, not merely exist:
   the status ratchet refuses an invalid value, the FK cascade is real, and the
   band constraint holds. Each probe rolls back — verification must never leave
   content behind. */
async function verifyContentTables() {
  const checks = [];
  const ok = (name, pass, detail = "") => checks.push({ name, pass, detail });

  for (const t of ["b2_sources", "b2_experiences", "b2_evidence", "b2_profile", "b2_learner_goal"]) {
    ok(`table ${t} exists`, await tableExists(t));
  }

  const refuses = async (sql, params = []) => {
    const c = await pool.connect();
    try { await c.query("BEGIN"); await c.query(sql, params); return false; }
    catch { return true; }
    finally { await c.query("ROLLBACK"); c.release(); }
  };

  ok("an invalid source status is refused", await refuses(
    `INSERT INTO b2_sources (id,kind,title,hook,theme,script,status)
     VALUES ('__p__','audio','t','h',7,'[]'::jsonb,'shipped')`));
  ok("a theme outside 1-14 is refused", await refuses(
    `INSERT INTO b2_sources (id,kind,title,hook,theme,script)
     VALUES ('__p__','audio','t','h',99,'[]'::jsonb)`));
  ok("an unknown evidence dimension is refused", await refuses(
    `INSERT INTO b2_evidence (user_id,dimension,outcome,source_kind)
     VALUES (1,'vibes',0.5,'screening')`));
  ok("an out-of-range outcome is refused", await refuses(
    `INSERT INTO b2_evidence (user_id,dimension,outcome,source_kind)
     VALUES (1,'writing',1.7,'screening')`));
  ok("an invalid band is refused", await refuses(
    `INSERT INTO b2_profile (user_id,dimension,band,score) VALUES (1,'writing','excellent',0.9)`));

  // Deleting a source must take its experiences with it, not orphan them.
  const c = await pool.connect();
  let cascaded = false;
  try {
    await c.query("BEGIN");
    await c.query(`INSERT INTO b2_sources (id,kind,title,hook,theme,script)
                   VALUES ('__p__','audio','t','h',7,'[]'::jsonb)`);
    await c.query(`INSERT INTO b2_experiences (id,source_id,kind,title,primary_capability,steps)
                   VALUES ('__pe__','__p__','listening','t','understand_speech','[]'::jsonb)`);
    await c.query(`DELETE FROM b2_sources WHERE id='__p__'`);
    const left = await c.query(`SELECT 1 FROM b2_experiences WHERE id='__pe__'`);
    cascaded = left.rowCount === 0;
  } finally { await c.query("ROLLBACK"); c.release(); }
  ok("deleting a source cascades to its experiences", cascaded);

  console.log("\ncontent + evidence verification:");
  for (const c of checks) console.log(`  ${c.pass ? "PASS" : "FAIL"}  ${c.name}${c.detail ? `  (${c.detail})` : ""}`);
  const failed = checks.filter(c => !c.pass);
  if (failed.length) { console.error(`\n${failed.length} check(s) FAILED.`); process.exit(1); }
  console.log(`All ${checks.length} checks passed.`);
}

/* Proves 009 did what it claims. Two things matter more than the columns
   existing: that the EXAM path is exactly as constrained as it was before
   paper_id became nullable, and that a skipped item physically cannot be
   stored as a wrong one. Every probe rolls back. */
async function verifyAssessmentTables() {
  const checks = [];
  const ok = (name, pass, detail = "") => checks.push({ name, pass, detail });

  ok("table b2_assessment_items exists", await tableExists("b2_assessment_items"));
  for (const c of ["kind", "assessment_version", "measured_items", "skipped_items", "composition"]) {
    ok(`b2_paper_attempts.${c} exists`, await columnExists("b2_paper_attempts", c));
  }

  const refuses = async (sql, params = []) => {
    const c = await pool.connect();
    try { await c.query("BEGIN"); await c.query(sql, params); return false; }
    catch { return true; }
    finally { await c.query("ROLLBACK"); c.release(); }
  };

  // The invariant paper_id NOT NULL used to carry, now carried by a CHECK.
  ok("a paper attempt still requires a paper_id", await refuses(
    `INSERT INTO b2_paper_attempts (user_id, kind, paper_id) VALUES (1,'paper',NULL)`));
  ok("an assessment attempt requires a version", await refuses(
    `INSERT INTO b2_paper_attempts (user_id, kind, assessment_version) VALUES (1,'assessment',NULL)`));
  ok("an unknown attempt kind is refused", await refuses(
    `INSERT INTO b2_paper_attempts (user_id, kind, assessment_version) VALUES (1,'quiz','v1')`));

  // Every pre-existing row must still be a paper attempt.
  const strays = await q(`SELECT count(*)::int AS n FROM b2_paper_attempts
                           WHERE kind='paper' AND paper_id IS NULL`);
  ok("no existing exam attempt lost its paper", strays[0].n === 0, `${strays[0].n} orphaned`);

  /* The product rule, enforced by the database: a skipped item may not also be
     marked wrong. This is the one that stops a future caller from quietly
     reintroducing negative marking. */
  const withAttempt = async (fn) => {
    const c = await pool.connect();
    try {
      await c.query("BEGIN");
      const { rows } = await c.query(
        `INSERT INTO b2_paper_attempts (user_id, kind, assessment_version)
         VALUES ((SELECT id FROM users ORDER BY id LIMIT 1),'assessment','v1') RETURNING id`);
      return await fn(c, rows[0].id);
    } catch { return false; }
    finally { await c.query("ROLLBACK"); c.release(); }
  };

  ok("a skipped item cannot be stored as wrong", await withAttempt(async (c, id) => {
    try {
      await c.query(`INSERT INTO b2_assessment_items
        (attempt_id,item_id,slot,version,position,skill,skipped,correct)
        VALUES ($1,'x','G1','v1',1,'grammar',true,false)`, [id]);
      return false;
    } catch { return true; }
  }));

  ok("a skipped item cannot be marked measured", await withAttempt(async (c, id) => {
    try {
      await c.query(`INSERT INTO b2_assessment_items
        (attempt_id,item_id,slot,version,position,skill,skipped,measured)
        VALUES ($1,'x','G1','v1',1,'grammar',true,true)`, [id]);
      return false;
    } catch { return true; }
  }));

  ok("a skipped item with no verdict is accepted", await withAttempt(async (c, id) => {
    await c.query(`INSERT INTO b2_assessment_items
      (attempt_id,item_id,slot,version,position,skill,skipped,correct)
      VALUES ($1,'x','G1','v1',1,'grammar',true,NULL)`, [id]);
    return true;
  }));

  ok("the same item cannot be recorded twice in one attempt", await withAttempt(async (c, id) => {
    await c.query(`INSERT INTO b2_assessment_items
      (attempt_id,item_id,slot,version,position,skill) VALUES ($1,'x','G1','v1',1,'grammar')`, [id]);
    try {
      await c.query(`INSERT INTO b2_assessment_items
        (attempt_id,item_id,slot,version,position,skill) VALUES ($1,'x','G1','v1',2,'grammar')`, [id]);
      return false;
    } catch { return true; }
  }));

  ok("deleting an attempt takes its items with it", await withAttempt(async (c, id) => {
    await c.query(`INSERT INTO b2_assessment_items
      (attempt_id,item_id,slot,version,position,skill) VALUES ($1,'x','G1','v1',1,'grammar')`, [id]);
    await c.query(`DELETE FROM b2_paper_attempts WHERE id=$1`, [id]);
    const left = await c.query(`SELECT 1 FROM b2_assessment_items WHERE attempt_id=$1`, [id]);
    return left.rowCount === 0;
  }));

  console.log("\nassessment verification:");
  for (const c of checks) console.log(`  ${c.pass ? "PASS" : "FAIL"}  ${c.name}${c.detail ? `  (${c.detail})` : ""}`);
  const failed = checks.filter(c => !c.pass);
  if (failed.length) { console.error(`\n${failed.length} check(s) FAILED.`); process.exit(1); }
  console.log(`All ${checks.length} checks passed.`);
}

/* Proves 010 did what it claims. The columns existing is the least interesting
   part; what matters is that no production lie can be stored — a fake answer key
   on a productive task, an "official" paper with no source, ORIGINAL content
   carrying a page number, or SME_REVIEWED with nobody's name on it. Every probe
   rolls back. */
async function verifyProductionContent(before) {
  const checks = [];
  const ok = (name, pass, detail = "") => checks.push({ name, pass, detail });

  for (const t of ["b2_content_reviews", "b2_speaking_tasks", "b2_audio_assets",
                   "b2_attempt_sections", "b2_can_dos", "b2_can_do_links"]) {
    ok(`table ${t} exists`, await tableExists(t));
  }
  for (const [t, c] of [["b2_experiences", "review_status"], ["b2_experiences", "source_type"],
                        ["b2_experiences", "difficulty"], ["b2_tasks", "source_type"],
                        ["b2_papers", "exam_version"], ["b2_papers", "alignment"],
                        ["b2_paper_items", "item_type"], ["b2_paper_items", "scoring_mode"],
                        ["b2_paper_sections", "time_limit_seconds"]]) {
    ok(`${t}.${c} exists`, await columnExists(t, c));
  }

  const refuses = async (sql, params = []) => {
    const c = await pool.connect();
    try { await c.query("BEGIN"); await c.query(sql, params); return false; }
    catch { return true; }
    finally { await c.query("ROLLBACK"); c.release(); }
  };
  const accepts = async (sql, params = []) => !(await refuses(sql, params));

  // ── nothing existing was lost or silently reclassified ──
  for (const [t, n] of Object.entries(before)) {
    const { rows } = await pool.query(`SELECT count(*)::int AS n FROM ${t}`);
    ok(`no row lost from ${t}`, rows[0].n === n, `${n} -> ${rows[0].n}`);
  }
  /* Scoped to the exam paper that existed BEFORE 010. A global count was right
     when that was the only content; now that core-2026b adds MATCHING,
     GAP_FILL, ORDERING and the rest, a global assertion reports legitimate new
     content as a migration failure. What 010 actually promised is that the ten
     PRE-EXISTING rows kept working, so that is what is checked. */
  const legacy = await q(
    `SELECT count(*)::int AS n FROM b2_paper_items i
       JOIN b2_paper_sections s ON s.id = i.section_id
      WHERE s.paper_id = 'gx_hoeren_t1' AND i.item_type <> 'MCQ'`);
  ok("pre-existing exam items defaulted to MCQ", legacy[0].n === 0, `${legacy[0].n} not MCQ`);
  const rev = await q(`SELECT count(*)::int AS n FROM b2_experiences WHERE review_status <> 'DRAFT'`);
  ok("no existing content claims a review it never had", rev[0].n === 0, `${rev[0].n} non-DRAFT`);

  // ── controlled vocabularies actually refuse ──
  ok("an unknown item_type is refused", await refuses(
    `INSERT INTO b2_paper_items (section_id,item_no,stem,options,answer,item_type)
     VALUES ((SELECT id FROM b2_paper_sections LIMIT 1),9001,'s','[]'::jsonb,0,'PUZZLE')`));
  ok("an unknown scoring_mode is refused", await refuses(
    `INSERT INTO b2_paper_items (section_id,item_no,stem,options,answer,scoring_mode)
     VALUES ((SELECT id FROM b2_paper_sections LIMIT 1),9002,'s','[]'::jsonb,0,'VIBES')`));
  ok("an unknown difficulty is refused", await refuses(
    `UPDATE b2_experiences SET difficulty='X' WHERE id=(SELECT id FROM b2_experiences LIMIT 1)`));
  ok("an unknown review_status is refused", await refuses(
    `UPDATE b2_experiences SET review_status='SHIPPED' WHERE id=(SELECT id FROM b2_experiences LIMIT 1)`));
  ok("an unknown source_type is refused", await refuses(
    `UPDATE b2_experiences SET source_type='SCRAPED' WHERE id=(SELECT id FROM b2_experiences LIMIT 1)`));

  // ── the product rules, enforced by the database ──
  ok("a productive item cannot carry an answer key", await refuses(
    `INSERT INTO b2_paper_items (section_id,item_no,stem,options,answer,item_type,scoring_mode)
     VALUES ((SELECT id FROM b2_paper_sections LIMIT 1),9003,'Schreiben Sie…','[]'::jsonb,1,'LONG_TEXT','RUBRIC')`));
  ok("a productive item cannot claim objective scoring", await refuses(
    `INSERT INTO b2_paper_items (section_id,item_no,stem,options,item_type,scoring_mode)
     VALUES ((SELECT id FROM b2_paper_sections LIMIT 1),9004,'Sprechen Sie…','[]'::jsonb,'SPOKEN_RESPONSE','OBJECTIVE')`));
  ok("an objective item without a key is refused", await refuses(
    `INSERT INTO b2_paper_items (section_id,item_no,stem,options,item_type,scoring_mode)
     VALUES ((SELECT id FROM b2_paper_sections LIMIT 1),9005,'?','[]'::jsonb,'MATCHING','OBJECTIVE')`));
  ok("a productive item with no key is accepted", await accepts(
    `INSERT INTO b2_paper_items (section_id,item_no,stem,options,item_type,scoring_mode)
     VALUES ((SELECT id FROM b2_paper_sections LIMIT 1),9006,'Schreiben Sie…','[]'::jsonb,'LONG_TEXT','RUBRIC')`));

  ok("ORIGINAL content cannot cite a book page", await refuses(
    `UPDATE b2_experiences SET source_type='ORIGINAL', source_page='p. 42'
      WHERE id=(SELECT id FROM b2_experiences LIMIT 1)`));
  ok("licensed content must name its book", await refuses(
    `UPDATE b2_experiences SET source_type='DIRECT_LICENSED', source_book=NULL
      WHERE id=(SELECT id FROM b2_experiences LIMIT 1)`));
  ok("an official paper must be licensed and sourced", await refuses(
    `UPDATE b2_papers SET alignment='licensed_official' WHERE id=(SELECT id FROM b2_papers LIMIT 1)`));
  ok("exam-format practice needs no licence claim", await accepts(
    `UPDATE b2_papers SET alignment='exam_format_practice' WHERE id=(SELECT id FROM b2_papers LIMIT 1)`));

  ok("board now accepts osd and custom", await accepts(
    `INSERT INTO b2_papers (id,board,title,minutes,source) VALUES ('__p__','osd','t',60,'probe')`));
  ok("board still refuses an unknown exam", await refuses(
    `INSERT INTO b2_papers (id,board,title,minutes,source) VALUES ('__p2__','duolingo','t',60,'probe')`));

  ok("a completed section must have started", await refuses(
    `INSERT INTO b2_attempt_sections (attempt_id,section_id,ord,completed_at)
     VALUES ((SELECT id FROM b2_paper_attempts LIMIT 1),(SELECT id FROM b2_paper_sections LIMIT 1),1,now())`));
  ok("a section cannot be recorded twice in one attempt", await refuses(
    `INSERT INTO b2_attempt_sections (attempt_id,section_id,ord) VALUES
       ((SELECT id FROM b2_paper_attempts LIMIT 1),(SELECT id FROM b2_paper_sections LIMIT 1),1),
       ((SELECT id FROM b2_paper_attempts LIMIT 1),(SELECT id FROM b2_paper_sections LIMIT 1),2)`));

  ok("a speaking task cannot claim an unknown evaluation mode", await refuses(
    `INSERT INTO b2_speaking_tasks (id,prompt_de,speak_seconds,format,evaluation_mode)
     VALUES ('__s__','p',60,'monologue','BAND')`));
  ok("a transcript-only speaking task is accepted", await accepts(
    `INSERT INTO b2_speaking_tasks (id,prompt_de,speak_seconds,format,evaluation_mode)
     VALUES ('__s2__','p',60,'monologue','TRANSCRIPT_ONLY')`));

  ok("a review record needs a reviewer", await refuses(
    `INSERT INTO b2_content_reviews (entity_type,entity_id,outcome) VALUES ('experience','x','SME_REVIEWED')`));

  console.log("\nproduction content verification:");
  for (const c of checks) console.log(`  ${c.pass ? "PASS" : "FAIL"}  ${c.name}${c.detail ? `  (${c.detail})` : ""}`);
  const failed = checks.filter(c => !c.pass);
  if (failed.length) { console.error(`\n${failed.length} check(s) FAILED.`); process.exit(1); }
  console.log(`All ${checks.length} checks passed.`);
}

async function main() {
  const apply = process.argv.includes("--apply");
  const rollback = process.argv.includes("--rollback");

  const before = await inspect();

  /* Row counts for every table 010 touches, captured BEFORE anything runs, so
     "no row was lost" is a measurement rather than an assumption. */
  const counts010 = {};
  for (const t of ["b2_sources", "b2_experiences", "b2_tasks", "b2_papers",
                   "b2_paper_sections", "b2_paper_items", "b2_paper_attempts"]) {
    if (await tableExists(t)) {
      counts010[t] = (await q(`SELECT count(*)::int AS n FROM ${t}`))[0].n;
    }
  }

  if (rollback) {
    // Roll back in reverse order, and only what exists.
    for (const m of [...MIGRATIONS].reverse().filter(x => x.id !== "001_topics_level")) {
      if (!(await applied(m))) continue;
      await pool.query(fs.readFileSync(path.join(MIG, `${m.id}.down.sql`), "utf8"));
      console.log(`Rolled back ${m.id}.`);
    }
    const b2 = await q("SELECT count(*)::int AS n FROM topics WHERE level <> 'a1'");
    if (b2[0].n > 0) {
      console.error(`\nRefusing to roll back: ${b2[0].n} non-a1 topic row(s) exist.`);
      console.error("Dropping `level` would put them inside the A1 journey. Remove them first —");
      console.error("see the header of 001_topics_level.down.sql for the exact statements.");
      process.exit(1);
    }
    await pool.query(fs.readFileSync(path.join(MIG, "001_topics_level.down.sql"), "utf8"));
    console.log("\nRolled back 001.");
    await pool.end();
    return;
  }

  if (!apply) {
    console.log("\nInspect only. Re-run with --apply to migrate.");
    await pool.end();
    return;
  }

  let ran = 0;
  for (const m of MIGRATIONS) {
    if (await applied(m)) { console.log(`\n  ${m.id} — already applied, skipping`); continue; }
    await pool.query(fs.readFileSync(path.join(MIG, `${m.id}.sql`), "utf8"));
    console.log(`\nApplied ${m.id}.sql`);
    ran++;
  }
  if (!ran) console.log("\nNothing to apply.");

  await verify(before);
  await verifyContentTables();
  await verifyAssessmentTables();
  await verifyProductionContent(counts010);
  await pool.end();
}

main().catch(e => { console.error("MIGRATION FAILED:", e.message); process.exit(1); });
