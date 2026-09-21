/**
 * EVIDENCE HONESTY — the learner is never told more than we know.
 *
 * The failure this prevents: a band computed from one screening item, printed
 * as though it were a level. Every assertion below is a specific way that could
 * come back.
 *
 * The distinction that matters most is SCREENING_SIGNAL vs EMERGING. Both hedge
 * identically to the learner ("Developing so far"), and they are deliberately
 * different states internally — one rests on a single sitting, the other on
 * more than one. Collapsing them would let an eleven-minute diagnostic pass
 * itself off as accumulated evidence.
 */

const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");

require("../src/env")();
const pool = require("../src/db/pool");
const profile = require("../src/b2/profile");

let live = false, uid = null;
const NAME = "__test_evidence_honesty";
const needsDb = (t) => { if (!live) { t.skip("no database reachable"); return true; } return false; };

before(async () => {
  try { await pool.query("SELECT 1"); live = true; } catch { return; }
  const f = await pool.query("SELECT id FROM users WHERE name=$1", [NAME]);
  uid = f.rows[0]?.id
    || (await pool.query("INSERT INTO users (name) VALUES ($1) RETURNING id", [NAME])).rows[0].id;
});
after(async () => {
  if (!live || !uid) return;
  await reset();
  await pool.query("DELETE FROM b2_learner_goal WHERE user_id=$1", [uid]);
  await pool.query("DELETE FROM users WHERE id=$1", [uid]);
  await pool.end();
});

async function reset() {
  await pool.query("DELETE FROM b2_evidence WHERE user_id=$1", [uid]);
  await pool.query("DELETE FROM b2_profile  WHERE user_id=$1", [uid]);
}
const dim = async (d = "listening") => (await profile.getProfile(uid)).find(x => x.dimension === d);

/** A screening: several items, ONE sitting, one format. */
const screening = (n, outcome = 0.9, d = "listening") =>
  Array.from({ length: n }, (_, i) => ({
    dimension: d, outcome, sourceKind: "screening", sourceRef: `screen_v1:${d}${i}`,
  }));

describe("evidence — the state ladder", () => {
  test("one item cannot produce a band", async (t) => {
    if (needsDb(t)) return;
    await reset();
    await profile.recordMany(uid, screening(1));
    const l = await dim();
    assert.equal(l.evidence_state, "initial");
    assert.equal(l.band, null, "a band was printed from a single item");
    assert.match(l.label, /Too early to say/);
  });

  test("two items are still too early", async (t) => {
    if (needsDb(t)) return;
    await reset();
    await profile.recordMany(uid, screening(2));
    assert.equal((await dim()).band, null);
  });

  test("a screening produces a HEDGED signal, never a plain band", async (t) => {
    if (needsDb(t)) return;
    await reset();
    await profile.recordMany(uid, screening(5));
    const l = await dim();
    assert.equal(l.evidence_state, "screening_signal",
      `a single screening claimed "${l.evidence_state}"`);
    assert.ok(l.band, "the screening produced no usable signal at all");
    assert.match(l.label, /so far$/, `stated without a hedge: "${l.label}"`);
  });

  test("a screening alone can NEVER be reliable, however many items it has", async (t) => {
    if (needsDb(t)) return;
    await reset();
    await profile.recordMany(uid, screening(20));   // absurdly long screening
    const l = await dim();
    assert.notEqual(l.evidence_state, "reliable",
      "twenty items from one sitting were treated as reliable evidence");
    assert.match(l.label, /so far$/);
  });

  test("one screening is ONE occasion, not one per item", async (t) => {
    if (needsDb(t)) return;
    await reset();
    await profile.recordMany(uid, screening(8));
    // 8 items, 1 occasion, 1 format → cannot be emerging (needs 2 occasions)
    assert.equal((await dim()).evidence_state, "screening_signal");
  });

  test("a second occasion in the SAME format reaches emerging, not reliable", async (t) => {
    if (needsDb(t)) return;
    await reset();
    await profile.recordMany(uid, screening(4));
    await profile.recordMany(uid, Array.from({ length: 4 }, (_, i) => ({
      dimension: "listening", outcome: 0.9, sourceKind: "screening", sourceRef: `screen_v2:l${i}`,
    })));
    const l = await dim();
    assert.equal(l.evidence_state, "emerging", "two sittings of the same format should be emerging");
    assert.match(l.label, /so far$/, "emerging must still hedge");
  });

  test("reliable requires ≥2 occasions AND ≥2 formats", async (t) => {
    if (needsDb(t)) return;
    await reset();
    await profile.recordMany(uid, screening(4));
    await profile.recordMany(uid, Array.from({ length: 4 }, (_, i) => ({
      dimension: "listening", outcome: 0.9, sourceKind: "experience", sourceRef: `exp_muede_listen:${i}`,
    })));
    const l = await dim();
    assert.equal(l.evidence_state, "reliable");
    assert.ok(l.band, "no band at reliable");
    assert.doesNotMatch(l.label, /so far/, `reliable evidence was still hedged: "${l.label}"`);
  });

  test("one later experience cannot alone make a thin learner reliable", async (t) => {
    if (needsDb(t)) return;
    await reset();
    // 2 screening items + one experience item = 3 items, 2 occasions, 2 formats.
    // Two formats is met, but six items is not.
    await profile.recordMany(uid, screening(2));
    await profile.record(uid, { dimension: "listening", outcome: 1, sourceKind: "experience", sourceRef: "exp_x:1" });
    const l = await dim();
    assert.notEqual(l.evidence_state, "reliable",
      "three items across two formats were treated as reliable");
  });
});

describe("evidence — recency", () => {
  test("recent demonstrated improvement overrides old weak evidence", async (t) => {
    if (needsDb(t)) return;
    await reset();
    // A bad start: six weak items across two occasions.
    await profile.recordMany(uid, screening(3, 0.1));
    await profile.recordMany(uid, Array.from({ length: 3 }, (_, i) => ({
      dimension: "listening", outcome: 0.1, sourceKind: "experience", sourceRef: `old_exp:${i}`,
    })));
    const before = await dim();
    assert.equal(before.band, "needs_practice");

    // Then five strong demonstrations.
    for (let i = 0; i < 5; i++) {
      await profile.record(uid, {
        dimension: "listening", outcome: 0.95, sourceKind: "experience", sourceRef: `new_exp_${i}:1`,
      });
    }
    const after = await dim();
    assert.equal(after.band, "strong",
      `old weak evidence still decided the band (${after.band}) after five strong demonstrations`);
    assert.equal(after.trend, "up", "improvement was not registered as a trend");
  });

  test("speaking is collected but never banded", async (t) => {
    if (needsDb(t)) return;
    await reset();
    for (let i = 0; i < 10; i++) {
      await profile.record(uid, {
        dimension: "speaking", outcome: 0.95, sourceKind: "experience", sourceRef: `maya_${i}:1`, weight: 0.2,
      });
    }
    const sp = await dim("speaking");
    assert.equal(sp.indicative, true);
    assert.equal(sp.band, null, "speaking was banded despite being uncalibrated");
  });
});

/**
 * THE CACHE MUST NOT OUTLIVE ITS EVIDENCE.
 *
 * b2_profile stores a band and a score; b2_evidence holds the rows they were
 * computed from. The rows can go away — a source retired, a bad sitting removed
 * — and the cached row does not. The API then printed a learner-facing
 * contradiction: "Not measured yet" beside a score of 0.9 over five items, none
 * of which still existed.
 */
describe("a stale profile row never survives its evidence", () => {
  test("state, score, trend and count all go quiet together", async (t) => {
    if (needsDb(t)) return;
    await reset();
    // Enough for a band, across two occasions and two formats.
    for (let i = 0; i < 6; i++) {
      await profile.record(uid, {
        dimension: "reading", outcome: 0.9, weight: 0.6,
        sourceKind: i % 2 ? "experience" : "submission", sourceRef: `occ${i}:item`,
      });
    }
    await profile.recomputeDimension(uid, "reading");
    const before = (await profile.getProfile(uid)).find(x => x.dimension === "reading");
    assert.ok(before.score > 0, "fixture must actually produce a score");
    assert.strictEqual(before.evidence_n, 6);

    // The evidence goes; the cached b2_profile row deliberately stays.
    await pool.query("DELETE FROM b2_evidence WHERE user_id=$1 AND dimension='reading'", [uid]);
    const after = (await profile.getProfile(uid)).find(x => x.dimension === "reading");

    assert.strictEqual(after.evidence_state, "none");
    assert.strictEqual(after.label, "Not measured yet");
    assert.strictEqual(after.band, null);
    assert.strictEqual(after.score, null, "a score with no evidence behind it is a claim we cannot make");
    assert.strictEqual(after.trend, null);
    assert.strictEqual(after.evidence_n, 0, "the count must come from the rows, not the cache");
  });

  test("evidence_n always matches the live rows, not the cached number", async (t) => {
    if (needsDb(t)) return;
    await reset();
    for (let i = 0; i < 4; i++) {
      await profile.record(uid, {
        dimension: "reading", outcome: 0.8, weight: 0.6,
        sourceKind: "experience", sourceRef: `o${i}:x`,
      });
    }
    await profile.recomputeDimension(uid, "reading");
    await pool.query(
      "DELETE FROM b2_evidence WHERE user_id=$1 AND dimension='reading' AND source_ref='o0:x'", [uid]);
    const p = (await profile.getProfile(uid)).find(x => x.dimension === "reading");
    assert.strictEqual(p.evidence_n, 3);
  });
});
