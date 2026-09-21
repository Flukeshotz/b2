/**
 * REPETITION — the ladder, against a real database.
 *
 * The rule this enforces is the one that decides whether a learner comes back:
 * an expression they have already produced must never be offered again as a
 * recognition item. Being asked to pick, out of three options, a phrase you
 * wrote a good sentence with last week is the most demoralising thing a
 * language product can do, and it is the default behaviour of every system that
 * stores "seen / not seen" instead of "how well".
 *
 * The ladder is also one-way. A muddled attempt in March does not undo a good
 * sentence written in February; treating it as though it did would send the
 * learner back through work they have outgrown.
 */

const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");

require("../src/env")();
const pool = require("../src/db/pool");
const expressions = require("../src/b2/expressions");
const { EXPERIENCES } = require("../src/seed/b2/exp_homeoffice");

const NAME = "__b2_repetition_test__";
let uid = null, live = false;
const needsDb = (t) => { if (!live) { t.skip("no database reachable"); return true; } return false; };

const vocabSteps = () => EXPERIENCES.find(e => e.kind === "vocabulary").steps;

before(async () => {
  try { await pool.query("SELECT 1"); live = true; } catch { return; }
  const f = await pool.query("SELECT id FROM users WHERE name=$1", [NAME]);
  uid = f.rows[0]?.id
    || (await pool.query("INSERT INTO users (name) VALUES ($1) RETURNING id", [NAME])).rows[0].id;
  await pool.query("DELETE FROM b2_expression_state WHERE user_id=$1", [uid]);
});
after(async () => {
  if (!live || !uid) return;
  await pool.query("DELETE FROM b2_expression_state WHERE user_id=$1", [uid]);
  await pool.query("DELETE FROM users WHERE id=$1", [uid]);
  await pool.end();
});

describe("the ladder", () => {
  test("a new learner starts at `heard` for everything", async (t) => {
    if (needsDb(t)) return;
    assert.strictEqual(await expressions.stageOf(uid, "nur_folgt_daraus_nicht"), "heard");
  });

  test("it climbs", async (t) => {
    if (needsDb(t)) return;
    await expressions.advance(uid, "nur_folgt_daraus_nicht", "noticed");
    assert.strictEqual(await expressions.stageOf(uid, "nur_folgt_daraus_nicht"), "noticed");
    await expressions.advance(uid, "nur_folgt_daraus_nicht", "chosen");
    assert.strictEqual(await expressions.stageOf(uid, "nur_folgt_daraus_nicht"), "chosen");
    await expressions.advance(uid, "nur_folgt_daraus_nicht", "produced");
    assert.strictEqual(await expressions.stageOf(uid, "nur_folgt_daraus_nicht"), "produced");
  });

  test("and never falls back", async (t) => {
    if (needsDb(t)) return;
    // A later bad evening: the same expression met again at a lower rung.
    await expressions.advance(uid, "nur_folgt_daraus_nicht", "noticed");
    assert.strictEqual(await expressions.stageOf(uid, "nur_folgt_daraus_nicht"), "produced",
      "a muddled later attempt is a bad evening, not the unlearning of an expression");
  });

  test("every encounter still counts as an occasion", async (t) => {
    if (needsDb(t)) return;
    const { rows } = await pool.query(
      "SELECT occasions FROM b2_expression_state WHERE user_id=$1 AND expression=$2",
      [uid, "nur_folgt_daraus_nicht"]);
    assert.ok(rows[0].occasions >= 4);
  });

  test("an unknown stage is refused rather than stored", async (t) => {
    if (needsDb(t)) return;
    await assert.rejects(() => expressions.advance(uid, "stoert_weniger_als", "mastered"));
  });
});

describe("serve-time filtering", () => {
  test("a fresh learner is served the whole experience", async (t) => {
    if (needsDb(t)) return;
    const fresh = (await pool.query(
      "INSERT INTO users (name) VALUES ($1) RETURNING id", [NAME + "_fresh"])).rows[0].id;
    const served = await expressions.filterSteps(fresh, vocabSteps());
    assert.strictEqual(served.length, vocabSteps().length);
    await pool.query("DELETE FROM users WHERE id=$1", [fresh]);
  });

  test("a produced expression is never offered as recognition again", async (t) => {
    if (needsDb(t)) return;
    const served = await expressions.filterSteps(uid, vocabSteps());
    const offered = served.filter(s => s.ex === "nur_folgt_daraus_nicht");
    assert.deepStrictEqual(offered, [],
      "the learner wrote a good sentence with this; do not ask them to pick it out of three");
    const choice = served.find(s => s.t === "chunk_choose" &&
      (s.exercises || []).length === 1 && s.exercises[0] === "nur_folgt_daraus_nicht");
    assert.strictEqual(choice, undefined, "a choice item exercising only produced expressions is dead");
  });

  test("expressions the learner has NOT produced are still served", async (t) => {
    if (needsDb(t)) return;
    const served = await expressions.filterSteps(uid, vocabSteps());
    assert.ok(served.some(s => s.ex === "stoert_weniger_als"));
    assert.ok(served.some(s => s.t === "chunk_produce"),
      "the experience must still ask for production of something");
  });

  test("a choice item survives while any of its expressions is unproduced", async (t) => {
    if (needsDb(t)) return;
    const served = await expressions.filterSteps(uid, vocabSteps());
    assert.ok(served.some(s => s.t === "chunk_choose" &&
      (s.exercises || []).includes("stoert_weniger_als")));
  });
});

/**
 * A1 REVIEW INJECTION MUST NOT REACH B2.
 *
 * The injector's three mechanics are pick, listen and soundmatch. All three are
 * recognition, and a B2 lesson opened with a Sound Match on
 * "Nur folgt daraus doch nicht" — an expression the learner had already
 * produced. That is the standing repetition rule broken by a second, competing
 * progress model running alongside the expression ladder.
 *
 * This reads Lesson.jsx rather than trusting a comment, because the failure is
 * silent: nothing errors, the learner just gets an A1 flashcard.
 */
describe("B2 lessons take no A1 review injection", () => {
  const fs = require("node:fs");
  const path = require("node:path");
  const lesson = fs.readFileSync(
    path.join(__dirname, "../../client/src/screens/Lesson.jsx"), "utf8");

  test("the pending review list is emptied in exam tone", () => {
    const line = lesson.match(/const pending = [^;]+;/)?.[0];
    assert.ok(line, "could not find the review injection line in Lesson.jsx");
    assert.match(line, /exam\s*\?\s*\[\]/,
      "B2 (tone=exam) must not receive A1 review steps — its repetition model " +
      "is the expression ladder, applied at serve time in b2/curriculum.js");
  });

  test("the review mechanics really are all recognition", () => {
    const curr = fs.readFileSync(
      path.join(__dirname, "../../client/src/lib/curriculum.js"), "utf8");
    const mech = curr.match(/const REVIEW_MECHANICS = \[([^\]]*)\]/)?.[1] || "";
    const list = mech.split(",").map(s => s.trim().replace(/^"|"$/g, "")).filter(Boolean);
    assert.ok(list.length > 0);
    for (const m of list) {
      assert.ok(["pick", "listen", "soundmatch", "match"].includes(m),
        `"${m}" is a new review mechanic — if it is production rather than ` +
        `recognition, B2 may want it and this test should be revisited`);
    }
  });
});

/**
 * OCCASION COUNTING for expression evidence.
 *
 * profile.js takes the occasion from the leading ':'-segment of source_ref, so
 * that segment has to name the DEMONSTRATION. The first version wrote
 * `chunk:<id>:produce`, which meant every expression the learner ever produced
 * — this week, next month, any source — shared the occasion key "chunk". The
 * profile would have shown one occasion forever and never reached `reliable`.
 *
 * This checks the route source, because the failure is silent: the evidence
 * rows look perfect and only the confidence ladder is quietly wrong.
 */
describe("expression evidence carries a real occasion key", () => {
  const fs = require("node:fs");
  const path = require("node:path");
  const routes = fs.readFileSync(path.join(__dirname, "../src/routes/b2.js"), "utf8");

  test("no expression source_ref is prefixed with a constant", () => {
    const refs = [...routes.matchAll(/sourceRef: `([^`]+)`/g)].map(m => m[1]);
    const exprRefs = refs.filter(r => /x\.id/.test(r));
    assert.ok(exprRefs.length >= 2, `found ${exprRefs.length} expression sourceRefs`);
    for (const r of exprRefs) {
      assert.match(r, /^\$\{x\.id\}:/,
        `"${r}" puts a constant before the first ':' — profile.js reads that as ` +
        `the occasion, so every demonstration would collapse into one`);
    }
  });

  test("two expressions produced in one sitting are two occasions", async (t) => {
    if (needsDb(t)) return;
    const key = (ref) => ref.split(":")[0];
    assert.notStrictEqual(key("nur_folgt_daraus_nicht:produce"), key("stoert_weniger_als:produce"));
    assert.strictEqual(key("nur_folgt_daraus_nicht:choose"), key("nur_folgt_daraus_nicht:produce"),
      "recognising then producing the same expression is one demonstration, not two");
  });
});

/**
 * PROMOTION — the other half of the repetition rule.
 *
 * Dropping what the learner has outgrown is only half of it. An expression they
 * chose correctly but never wrote has nowhere to climb: the authored experience
 * carries production steps for two of five expressions, so on a return visit
 * the other three came back as recognition — forever. That is the same
 * complaint in a quieter voice, and the brief's rule is explicit: future
 * encounters should increase the communicative demand.
 */
describe("the demand goes up on a return visit", () => {
  const expr = require("../src/b2/expressions");
  let ret = null;

  test("a chosen-but-unwritten expression is promoted to production", async (t) => {
    if (needsDb(t)) return;
    await expr.advance(uid, "weiss_ich_allerdings_auch_nicht", "chosen");
    ret = await expr.filterSteps(uid, vocabSteps());
    const p = ret.find(s => s.t === "chunk_produce" && s.ex === "weiss_ich_allerdings_auch_nicht");
    assert.ok(p, "an expression at `chosen` must be offered as production next time");
    assert.strictEqual(p.promoted, true);
    assert.ok(p.context && p.context.length > 30,
      "a promoted step needs a real situation — 'write a sentence with X' is the " +
      "meaningless completion this experience exists to avoid");
  });

  test("a produced expression is NOT promoted again", async (t) => {
    if (needsDb(t)) return;
    assert.ok(!ret.some(s => s.ex === "nur_folgt_daraus_nicht"),
      "already produced — it should be gone, not promoted");
  });

  test("an expression still at `noticed` is not promoted past its turn", async (t) => {
    if (needsDb(t)) return;
    const early = ret.filter(s => s.t === "chunk_produce" && s.ex === "begruendet_wird_das_mit" && s.promoted);
    assert.deepStrictEqual(early, [],
      "nothing is promoted before the learner has demonstrated recognition");
  });

  test("every expression can be promoted — each carries its own context", () => {
    for (const x of expr.BY_ID.values()) {
      assert.ok(x.produceContext, `${x.id} has no produceContext, so it can never climb`);
      assert.ok(x.produceHint, `${x.id} has no produceHint`);
    }
  });

  test("a return visit still asks for production of something", async (t) => {
    if (needsDb(t)) return;
    assert.ok(ret.some(s => s.t === "chunk_produce"),
      "a session that only asks the learner to recognise is the failure mode");
  });
});
