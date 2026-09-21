/**
 * MIGRATION 010 AGAINST THE REAL DATABASE.
 *
 * `b2_content_model.test.js` proves the JavaScript rules. This proves the SQL
 * ones, and — the part that actually matters — proves the two agree.
 *
 * A controlled vocabulary that exists in both places is a vocabulary that can
 * drift. If `content_model.js` gains an item type that the CHECK constraint has
 * never heard of, the application accepts a row the database then refuses; if
 * the CHECK is widened and the module is not, a direct INSERT walks straight
 * past every validation we wrote. So the vocabularies are read back out of
 * `pg_get_constraintdef` and compared, rather than assumed to match.
 *
 * Needs Postgres. Skips cleanly when it is unreachable rather than failing, so
 * a sandboxed run reports honestly instead of looking broken.
 */

const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");

require("../src/env")();
const pool = require("../src/db/pool");
const M = require("../src/b2/content_model");

let live = false;
before(async () => {
  try { await pool.query("SELECT 1"); live = true; }
  catch { live = false; }
});
after(async () => { try { await pool.end(); } catch { /* already closed */ } });

const SKIP = "Postgres unreachable — live-schema tests skipped";

/** Pull the allowed values out of a CHECK constraint definition. */
async function checkValues(table, constraint) {
  const { rows } = await pool.query(
    `SELECT pg_get_constraintdef(c.oid) AS def
       FROM pg_constraint c JOIN pg_class r ON r.oid=c.conrelid
      WHERE r.relname=$1 AND c.conname=$2`, [table, constraint]);
  if (!rows[0]) return null;
  return [...rows[0].def.matchAll(/'([A-Z_a-z]+)'::text/g)].map(m => m[1]);
}

/** Run a statement inside a transaction and always roll it back. */
async function probe(sql, params = []) {
  const c = await pool.connect();
  try { await c.query("BEGIN"); await c.query(sql, params); return { ok: true }; }
  catch (e) { return { ok: false, code: e.code, message: e.message }; }
  finally { await c.query("ROLLBACK"); c.release(); }
}

/* ── P. MIGRATION INTEGRITY ─────────────────────────────────────────────── */

describe("P — migration integrity", () => {
  test("every table 010 creates exists", async (t) => {
    if (!live) return t.skip(SKIP);
    for (const t of ["b2_content_reviews", "b2_speaking_tasks", "b2_audio_assets",
                     "b2_attempt_sections", "b2_can_dos", "b2_can_do_links"]) {
      const { rows } = await pool.query(
        `SELECT 1 FROM information_schema.tables WHERE table_name=$1`, [t]);
      assert.ok(rows.length, `${t} missing`);
    }
  });

  test("provenance and review columns reached every content table", async (t) => {
    if (!live) return t.skip(SKIP);
    for (const t of ["b2_sources", "b2_experiences", "b2_tasks", "b2_papers", "b2_paper_items"]) {
      const { rows } = await pool.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name=$1`, [t]);
      const cols = rows.map(r => r.column_name);
      for (const c of ["source_book", "source_chapter", "source_module", "source_page",
                       "source_type", "adaptation_status", "review_status", "difficulty"]) {
        assert.ok(cols.includes(c), `${t}.${c} missing`);
      }
    }
  });

  test("no duplicate attempt table was created", async (t) => {
    if (!live) return t.skip(SKIP);
    const { rows } = await pool.query(
      `SELECT table_name FROM information_schema.tables
        WHERE table_name LIKE '%attempt%' AND table_schema='public'`);
    const names = rows.map(r => r.table_name).sort();
    assert.deepEqual(names, ["b2_attempt_sections", "b2_paper_attempts"],
      "a second attempt table appeared");
  });
});

/* ── THE TWO LAYERS MUST AGREE ──────────────────────────────────────────── */

describe("SQL and JavaScript vocabularies agree", () => {
  const cases = [
    ["b2_paper_items", "b2_paper_items_type", () => M.ITEM_TYPES],
    ["b2_paper_items", "b2_paper_items_scoring", () => M.SCORING_MODES],
    ["b2_experiences", "b2_experiences_source_type", () => M.SOURCE_TYPES],
    ["b2_experiences", "b2_experiences_adaptation_status", () => M.ADAPTATION_STATUS],
    ["b2_experiences", "b2_experiences_review_status", () => M.REVIEW_STATUS],
    ["b2_experiences", "b2_experiences_difficulty", () => M.DIFFICULTY],
  ];
  for (const [table, constraint, expected] of cases) {
    test(`${constraint} matches content_model.js`, async (t) => {
    if (!live) return t.skip(SKIP);
      const sql = await checkValues(table, constraint);
      assert.ok(sql, `${constraint} not found on ${table}`);
      assert.deepEqual([...sql].sort(), [...expected()].sort(),
        `vocabulary drifted between SQL and JS for ${constraint}`);
    });
  }
});

/* ── D–F. THE DATABASE REFUSES WHAT THE MODULE REFUSES ──────────────────── */

describe("D/E/F — the database enforces the product rules", () => {
  const section = `(SELECT id FROM b2_paper_sections ORDER BY id LIMIT 1)`;

  test("an unknown item_type is refused", async (t) => {
    if (!live) return t.skip(SKIP);
    const r = await probe(`INSERT INTO b2_paper_items (section_id,item_no,stem,options,answer,item_type)
      VALUES (${section},8001,'s','[]'::jsonb,0,'PUZZLE')`);
    assert.equal(r.ok, false);
  });

  test("a productive item cannot carry an answer key", async (t) => {
    if (!live) return t.skip(SKIP);
    const r = await probe(`INSERT INTO b2_paper_items
      (section_id,item_no,stem,options,answer,item_type,scoring_mode)
      VALUES (${section},8002,'Schreiben Sie…','[]'::jsonb,1,'LONG_TEXT','RUBRIC')`);
    assert.equal(r.ok, false);
  });

  test("a productive item WITHOUT a key is accepted", async (t) => {
    if (!live) return t.skip(SKIP);
    // The regression: `answer` was NOT NULL, which made this impossible.
    const r = await probe(`INSERT INTO b2_paper_items
      (section_id,item_no,stem,options,item_type,scoring_mode)
      VALUES (${section},8003,'Schreiben Sie…','[]'::jsonb,'LONG_TEXT','RUBRIC')`);
    assert.ok(r.ok, r.message);
  });

  test("an MCQ still requires its key", async (t) => {
    if (!live) return t.skip(SKIP);
    const r = await probe(`INSERT INTO b2_paper_items (section_id,item_no,stem,options,item_type)
      VALUES (${section},8004,'?','["a","b"]'::jsonb,'MCQ')`);
    assert.equal(r.ok, false);
  });

  test("ORIGINAL content cannot cite a page", async (t) => {
    if (!live) return t.skip(SKIP);
    const r = await probe(`UPDATE b2_experiences SET source_type='ORIGINAL', source_page='p.42'
      WHERE id=(SELECT id FROM b2_experiences LIMIT 1)`);
    assert.equal(r.ok, false);
  });

  test("an official paper must be licensed and sourced", async (t) => {
    if (!live) return t.skip(SKIP);
    const r = await probe(`UPDATE b2_papers SET alignment='licensed_official'
      WHERE id=(SELECT id FROM b2_papers LIMIT 1)`);
    assert.equal(r.ok, false);
  });
});

/* ── G. SECTION RESUME ──────────────────────────────────────────────────── */

describe("G — section-level resume", () => {
  test("a section can be started, paused, resumed and completed", async (t) => {
    if (!live) return t.skip(SKIP);
    const c = await pool.connect();
    try {
      await c.query("BEGIN");
      /* A throwaway paper of its own. Reusing the live paper collides with
         `b2_paper_attempts_one_open` — which is the duplicate-attempt guard
         doing its job, not a fault, so the test works around it rather than
         weakening it. */
      await c.query(`INSERT INTO b2_papers (id,board,title,minutes,source)
                     VALUES ('__resume_probe__','custom','probe',60,'test')`);
      const { rows: s } = await c.query(
        `INSERT INTO b2_paper_sections (paper_id,module,part_no,title,instruction)
         VALUES ('__resume_probe__','hoeren',1,'probe','probe') RETURNING id`);
      const sec = s[0].id;
      const { rows: a } = await c.query(
        `INSERT INTO b2_paper_attempts (user_id, kind, paper_id)
         VALUES ((SELECT id FROM users ORDER BY id LIMIT 1),'paper','__resume_probe__')
         RETURNING id`);
      const attempt = a[0].id;

      await c.query(`INSERT INTO b2_attempt_sections (attempt_id,section_id,ord,started_at)
                     VALUES ($1,$2,1,now())`, [attempt, sec]);
      await c.query(`UPDATE b2_attempt_sections SET paused_at=now(), elapsed_seconds=120
                      WHERE attempt_id=$1 AND section_id=$2`, [attempt, sec]);
      // Resuming clears the pause and keeps the time already spent.
      await c.query(`UPDATE b2_attempt_sections SET paused_at=NULL
                      WHERE attempt_id=$1 AND section_id=$2`, [attempt, sec]);
      await c.query(`UPDATE b2_attempt_sections SET completed_at=now(), result='{"correct":7}'::jsonb
                      WHERE attempt_id=$1 AND section_id=$2`, [attempt, sec]);

      const { rows } = await c.query(
        `SELECT started_at, paused_at, completed_at, elapsed_seconds, result
           FROM b2_attempt_sections WHERE attempt_id=$1`, [attempt]);
      assert.equal(rows.length, 1, "resume must not fork into a second section row");
      assert.ok(rows[0].started_at);
      assert.equal(rows[0].paused_at, null);
      assert.ok(rows[0].completed_at);
      assert.equal(rows[0].elapsed_seconds, 120, "time spent was lost across the pause");
      assert.equal(rows[0].result.correct, 7);
    } finally { await c.query("ROLLBACK"); c.release(); }
  });

  test("a section cannot complete without starting", async (t) => {
    if (!live) return t.skip(SKIP);
    const r = await probe(`INSERT INTO b2_attempt_sections (attempt_id,section_id,ord,completed_at)
      VALUES ((SELECT id FROM b2_paper_attempts ORDER BY id LIMIT 1),
              (SELECT id FROM b2_paper_sections ORDER BY id LIMIT 1),1,now())`);
    assert.equal(r.ok, false);
  });

  test("the same section cannot be recorded twice in one attempt", async (t) => {
    if (!live) return t.skip(SKIP);
    const r = await probe(`INSERT INTO b2_attempt_sections (attempt_id,section_id,ord) VALUES
      ((SELECT id FROM b2_paper_attempts ORDER BY id LIMIT 1),
       (SELECT id FROM b2_paper_sections ORDER BY id LIMIT 1),1),
      ((SELECT id FROM b2_paper_attempts ORDER BY id LIMIT 1),
       (SELECT id FROM b2_paper_sections ORDER BY id LIMIT 1),2)`);
    assert.equal(r.ok, false);
  });

  test("the no-duplicate-open-attempt guard still stands", async (t) => {
    if (!live) return t.skip(SKIP);
    const { rows } = await pool.query(
      `SELECT indexdef FROM pg_indexes WHERE indexname='b2_paper_attempts_one_open'`);
    assert.ok(rows.length, "the open-attempt guard was dropped");
    assert.match(rows[0].indexdef, /UNIQUE/);
    assert.match(rows[0].indexdef, /finished_at IS NULL/);
  });
});

/* ── H. SPEAKING TASKS ──────────────────────────────────────────────────── */

describe("H — speaking task representation", () => {
  test("a transcript-only speaking task stores cleanly", async (t) => {
    if (!live) return t.skip(SKIP);
    const r = await probe(`INSERT INTO b2_speaking_tasks
      (id,prompt_de,speak_seconds,prep_seconds,format,evaluation_mode,primary_capability,difficulty,
       source_type,source_book,adaptation_status)
      VALUES ('__probe__','Welche Lösung halten Sie für sinnvoller?',90,60,'monologue',
              'TRANSCRIPT_ONLY','argue','B','ADAPTED','Kontext B2','ADAPTED')`);
    assert.ok(r.ok, r.message);
  });

  test("a speaking task cannot invent a band", async (t) => {
    if (!live) return t.skip(SKIP);
    const r = await probe(`INSERT INTO b2_speaking_tasks
      (id,prompt_de,speak_seconds,format,evaluation_mode)
      VALUES ('__probe2__','p',60,'monologue','BAND')`);
    assert.equal(r.ok, false);
  });

  test("it reuses the existing rubric table rather than a parallel one", async (t) => {
    if (!live) return t.skip(SKIP);
    const { rows } = await pool.query(
      `SELECT 1 FROM information_schema.columns
        WHERE table_name='b2_speaking_tasks' AND column_name='rubric_id'`);
    assert.ok(rows.length);
    const { rows: sprechen } = await pool.query(
      `SELECT count(*)::int AS n FROM b2_rubrics WHERE module='sprechen'`);
    assert.ok(sprechen[0].n > 0, "expected an existing speaking rubric to reuse");
  });

  test("speaking is not forced into the writing task table", async (t) => {
    if (!live) return t.skip(SKIP);
    const { rows } = await pool.query(
      `SELECT 1 FROM information_schema.columns
        WHERE table_name='b2_speaking_tasks' AND column_name='target_words'`);
    assert.equal(rows.length, 0, "a speaking task should not have a word target");
  });
});

/* ── O. BACKWARD COMPATIBILITY ──────────────────────────────────────────── */

describe("O — backward compatibility", () => {
  /* Scoped to the content that existed BEFORE migration 010, not to global row
     counts. A global count assertion fails every time a batch adds content —
     which is what a content product does continuously — and would have to be
     edited on every such batch, teaching everyone to edit it without looking.
     What these tests are actually about is that the PRE-EXISTING rows survived
     untouched, so that is what they assert. */
  const LEGACY_PAPER = "gx_hoeren_t1";

  test("existing content survived with its data intact", async (t) => {
    if (!live) return t.skip(SKIP);
    const { rows } = await pool.query(`
      SELECT (SELECT count(*)::int FROM b2_sources)        AS sources,
             (SELECT count(*)::int FROM b2_experiences)    AS experiences,
             (SELECT count(*)::int FROM b2_tasks)          AS tasks,
             (SELECT count(*)::int FROM b2_papers WHERE id=$1)  AS papers,
             (SELECT count(*)::int FROM b2_paper_sections WHERE paper_id=$1) AS sections,
             (SELECT count(*)::int FROM b2_paper_items i
                JOIN b2_paper_sections s ON s.id=i.section_id
               WHERE s.paper_id=$1) AS items`, [LEGACY_PAPER]);
    const r = rows[0];
    assert.ok(r.sources >= 2);
    assert.ok(r.experiences >= 8);
    assert.ok(r.tasks >= 9);
    assert.equal(r.papers, 1, "the exam paper must still exist");
    assert.equal(r.sections, 1);
    assert.equal(r.items, 10, "the ten exam items must be untouched");
  });

  test("existing items defaulted to MCQ and kept their keys", async (t) => {
    if (!live) return t.skip(SKIP);
    const { rows } = await pool.query(
      `SELECT count(*)::int AS n FROM b2_paper_items i
         JOIN b2_paper_sections s ON s.id=i.section_id
        WHERE s.paper_id=$1 AND i.item_type='MCQ'
          AND i.answer IS NOT NULL AND i.scoring_mode='OBJECTIVE'`, [LEGACY_PAPER]);
    assert.equal(rows[0].n, 10);
  });

  test("pre-existing content claims no review it never had", async (t) => {
    if (!live) return t.skip(SKIP);
    for (const tbl of ["b2_sources", "b2_experiences", "b2_tasks"]) {
      const { rows } = await pool.query(
        `SELECT count(*)::int AS n FROM ${tbl} WHERE review_status <> 'DRAFT'`);
      assert.equal(rows[0].n, 0, `${tbl} has content claiming a review`);
    }
    // The legacy exam paper and its items specifically.
    const { rows: p } = await pool.query(
      `SELECT count(*)::int AS n FROM b2_papers WHERE id=$1 AND review_status <> 'DRAFT'`,
      [LEGACY_PAPER]);
    assert.equal(p.rows === undefined ? p[0].n : p[0].n, 0);
  });

  /* Newly seeded production content may sit at AUTO_QA_PASS — but never higher
     without a real review record. That is the rule worth protecting now that
     content is being added. */
  test("no content anywhere claims SME review without a record", async (t) => {
    if (!live) return t.skip(SKIP);
    for (const tbl of ["b2_sources", "b2_experiences", "b2_tasks", "b2_papers", "b2_paper_items"]) {
      const { rows } = await pool.query(
        `SELECT count(*)::int AS n FROM ${tbl}
          WHERE review_status IN ('SME_REVIEWED','PRODUCTION')`);
      assert.equal(rows[0].n, 0, `${tbl} claims SME review`);
    }
    const { rows } = await pool.query(`SELECT count(*)::int AS n FROM b2_content_reviews`);
    assert.equal(rows[0].n, 0, "no review has been recorded, so none may be claimed");
  });

  test("no provenance was invented for existing rows", async (t) => {
    if (!live) return t.skip(SKIP);
    const { rows } = await pool.query(
      `SELECT count(*)::int AS n FROM b2_tasks WHERE source_type IS NOT NULL`);
    assert.equal(rows[0].n, 0, "existing tasks were assigned a source_type by guesswork");
  });

  test("the publish lifecycle was not overloaded by the review one", async (t) => {
    if (!live) return t.skip(SKIP);
    // profile.nextAction() filters on status IN ('approved','live'); that column
    // must be untouched and still carry its original vocabulary.
    const vals = await checkValues("b2_experiences", "b2_experiences_status_check");
    assert.deepEqual(vals.sort(),
      ["approved", "draft", "gated", "live", "rejected", "review"]);
    const { rows } = await pool.query(
      `SELECT count(*)::int AS n FROM b2_experiences WHERE status='live'`);
    assert.ok(rows[0].n >= 8, "live experiences changed status");
  });

  test("the existing writing tasks still resolve through their rubrics", async (t) => {
    if (!live) return t.skip(SKIP);
    const { rows } = await pool.query(
      `SELECT count(*)::int AS n FROM b2_tasks t JOIN b2_rubrics r ON r.id=t.rubric_id`);
    assert.equal(rows[0].n, 9);
  });

  test("the exam attempt rows are untouched", async (t) => {
    if (!live) return t.skip(SKIP);
    const { rows } = await pool.query(
      `SELECT count(*)::int AS n FROM b2_paper_attempts WHERE kind='paper' AND paper_id IS NOT NULL`);
    assert.ok(rows[0].n >= 2);
  });

  test("board widened without losing its old values", async (t) => {
    if (!live) return t.skip(SKIP);
    const vals = await checkValues("b2_papers", "b2_papers_board_check");
    for (const v of ["goethe", "telc", "telc_pflege"]) assert.ok(vals.includes(v), `${v} lost`);
    for (const v of ["osd", "custom"]) assert.ok(vals.includes(v), `${v} missing`);
  });
});
