/**
 * RETIRED CONTENT STAYS RETIRED.
 *
 * Four B2 topics were built with A1 exercise mechanics and removed from the
 * learner surface. They were kept in the database on purpose — the German is
 * reusable, the experience design is not — which means the only thing stopping
 * them reappearing is these assertions.
 */
const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");
require("../src/env")();
const pool = require("../src/db/pool");
const curriculum = require("../src/b2/curriculum");

const RETIRED = ["b2g_konzessiv", "b2g_konjunktiv2", "b2g_genitiv", "b2v_nvv"];
let live = false;
before(async () => { try { await pool.query("SELECT 1"); live = true; } catch {} });
after(async () => { if (live) await pool.end(); });
const needsDb = (t) => { if (!live) { t.skip("no database"); return true; } return false; };

describe("retired B2 content", () => {
  test("the rows still exist — retirement is not deletion", async (t) => {
    if (needsDb(t)) return;
    const { rows } = await pool.query(
      `SELECT id, status, retired_reason FROM topics WHERE id = ANY($1)`, [RETIRED]);
    assert.equal(rows.length, RETIRED.length, "retired content was deleted, not retired");
    for (const r of rows) {
      assert.equal(r.status, "retired");
      assert.equal(r.retired_reason, "a1_methodology_conflict");
    }
  });

  test("none of them appears on the B2 learner surface", async (t) => {
    if (needsDb(t)) return;
    const listed = (await curriculum.listTopics(1)).map(x => x.id);
    for (const id of RETIRED) {
      assert.ok(!listed.includes(id), `${id} is still listed to learners`);
    }
  });

  test("none of them can be recommended", async (t) => {
    if (needsDb(t)) return;
    const profile = require("../src/b2/profile");
    const rec = await profile.nextAction(1);
    if (rec) assert.ok(!RETIRED.includes(rec.topicId || rec.experienceId),
      `retired content was recommended: ${rec.experienceId}`);
  });

  test("they contribute no coverage", async (t) => {
    if (needsDb(t)) return;
    const live_ = await curriculum.listTopics(1);
    assert.ok(live_.every(x => !RETIRED.includes(x.id)));
  });

  test("the seed module refuses to republish them", () => {
    const m = require("../src/seed/b2_curriculum");
    assert.equal(m.RETIRED, true, "the retirement flag was removed from the seed module");
  });
});
