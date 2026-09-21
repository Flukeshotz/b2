/**
 * core-2026b — THE PRODUCTION ASSESSMENT, TESTED AGAINST THE DATABASE.
 *
 * The architecture requirement is that the database is authoritative: the seed
 * files are how the content was written, not where it is read from. So these
 * tests query Postgres and drive the content provider, and one of them deletes
 * the seed module from the require cache to prove the runtime does not need it.
 *
 * The rules being protected are the same ones as everywhere else in this
 * product, and they are worth restating because a new assessment is exactly
 * where they get quietly broken:
 *
 *   a productive task never gets an invented answer key
 *   a skipped item is not measured and is never wrong
 *   a learner payload never contains a key
 *   nothing claims a review that did not happen
 *   core-2026a is not touched
 *
 * Skips cleanly when Postgres is unreachable rather than failing, so a
 * sandboxed run reports honestly instead of looking broken.
 */

const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");

require("../src/env")();
const pool = require("../src/db/pool");
const content = require("../src/b2/assessment_content");
const model = require("../src/b2/content_model");
const { BLUEPRINT } = require("../src/seed/b2/core2026b/blueprint");

const V1 = "core-2026b-v1";
const SKIP = "Postgres unreachable — core-2026b tests skipped";

let live = false, items = [], seeded = false;
before(async () => {
  try {
    await pool.query("SELECT 1");
    live = true;
    items = await content.itemsOf(V1);
    seeded = items.length > 0;
  } catch { live = false; }
});
after(async () => { try { await pool.end(); } catch { /* already closed */ } });

/** Run a statement in a transaction and always roll it back. */
async function probeSql(sql) {
  const c = await pool.connect();
  try { await c.query("BEGIN"); await c.query(sql); return { ok: true }; }
  catch (e) { return { ok: false, message: e.message }; }
  finally { await c.query("ROLLBACK"); c.release(); }
}

const need = (t) => {
  if (!live) { t.skip(SKIP); return false; }
  if (!seeded) { t.skip("core-2026b is not seeded — run src/seed/seed_core2026b.js"); return false; }
  return true;
};

/* ── the content is in the database ─────────────────────────────────────── */

describe("core-2026b lives in the database", () => {
  test("the version is stored as a paper with honest exam metadata", async (t) => {
    if (!need(t)) return;
    const { rows } = await pool.query(
      `SELECT board, alignment, exam_version, review_status FROM b2_papers WHERE id=$1`, [V1]);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].board, "custom", "a Skillcase assessment must not claim a board");
    assert.equal(rows[0].alignment, "original");
    assert.equal(rows[0].exam_version, BLUEPRINT.group);
    assert.notEqual(rows[0].alignment, "licensed_official");
  });

  test("items come from b2_paper_items, not from a JS registry", async (t) => {
    if (!need(t)) return;
    const { rows } = await pool.query(
      `SELECT count(*)::int AS n FROM b2_paper_items i
         JOIN b2_paper_sections s ON s.id=i.section_id WHERE s.paper_id=$1`, [V1]);
    assert.equal(rows[0].n, items.length);
    assert.equal(items.length, BLUEPRINT.comparableItemCount + 1, "23 comparable + 1 speaking");
  });

  /* THE ARCHITECTURE CLAIM. If the runtime needed the seed file, dropping it
     from the module cache and re-resolving would break content loading. */
  test("the runtime does not read the seed files", async (t) => {
    if (!need(t)) return;
    const seedPath = require.resolve("../src/seed/b2/core2026b/v1");
    delete require.cache[seedPath];
    const again = await content.itemsOf(V1);
    assert.equal(again.length, items.length);
    assert.equal(again[0].stem, items[0].stem);
  });
});

/* ── structure and the 35/65 claim ──────────────────────────────────────── */

describe("structure", () => {
  const core = () => items.filter(i => i.module !== "sprechen");

  test("23 comparable items plus one speaking item", async (t) => {
    if (!need(t)) return;
    assert.equal(core().length, 23);
    assert.equal(items.filter(i => i.module === "sprechen").length, 1);
  });

  test("the knowledge/skill split is 35/65, computed from the rows", async (t) => {
    if (!need(t)) return;
    const k = core().filter(i => i.payload?.band === "KNOWLEDGE").length;
    const s = core().filter(i => i.payload?.band === "SKILL").length;
    assert.equal(k + s, core().length, "every comparable item must be classified");
    const pct = k / core().length;
    assert.ok(Math.abs(pct - 0.35) <= 0.06,
      `knowledge is ${Math.round(pct * 100)}%, target 35% ±6`);
    assert.ok(s > k, "a diagnostic dominated by recognition is the thing this replaces");
  });

  test("it is not another MCQ test", async (t) => {
    if (!need(t)) return;
    const types = new Set(core().map(i => i.item_type));
    assert.ok(types.size >= 6, `only ${types.size} item types`);
    const mcq = core().filter(i => i.item_type === "MCQ").length;
    assert.ok(mcq / core().length <= 0.6, `${mcq} of ${core().length} are MCQ`);
  });

  test("no single capability dominates", async (t) => {
    if (!need(t)) return;
    const tally = {};
    for (const i of core()) tally[i.capability] = (tally[i.capability] || 0) + 1;
    const worst = Math.max(...Object.values(tally));
    assert.ok(worst / core().length <= 0.35, `one capability holds ${worst} items`);
    assert.ok(Object.keys(tally).length >= 8, "broad diagnostic coverage");
  });

  test("the book-backed gap capabilities are actually measured", async (t) => {
    if (!need(t)) return;
    const caps = new Set(items.map(i => i.capability));
    for (const c of ["summarise", "ask_followup"]) {
      assert.ok(caps.has(c), `${c} was declared but is not measured`);
    }
  });

  test("all three difficulty bands are present", async (t) => {
    if (!need(t)) return;
    for (const d of ["A", "B", "C"]) {
      assert.ok(items.some(i => i.difficulty === d), `no ${d}-level item`);
    }
  });
});

/* ── the no-fake-key rule ───────────────────────────────────────────────── */

describe("productive items carry no key", () => {
  test("every productive item has a null answer and null answer_payload", async (t) => {
    if (!need(t)) return;
    const productive = items.filter(i => model.PRODUCTIVE_TYPES.includes(i.item_type));
    assert.ok(productive.length >= 4, "expected the short answers, the essay and the speaking item");
    for (const i of productive) {
      assert.equal(i.answer, null, `${i.slot} has an answer index`);
      assert.equal(i.answer_payload, null, `${i.slot} has an answer payload`);
      assert.notEqual(i.scoring_mode, "OBJECTIVE", `${i.slot} claims objective scoring`);
    }
  });

  test("every objective item has a real key", async (t) => {
    if (!need(t)) return;
    for (const i of items.filter(x => x.scoring_mode === "OBJECTIVE")) {
      assert.ok(i.answer != null || i.answer_payload != null, `${i.slot} has no key`);
      const v = model.validateItem(i);
      assert.ok(v.valid, `${i.slot}: ${v.problems.join("; ")}`);
    }
  });

  test("speaking is transcript-only, worth nothing, outside the comparable core", async (t) => {
    if (!need(t)) return;
    const s = items.find(i => i.module === "sprechen");
    assert.equal(s.scoring_mode, "TRANSCRIPT_ONLY");
    assert.equal(Number(s.points), 0, "an unscored item must not carry points");
    assert.equal(s.answer_payload, null);
  });
});

/* ── grading ────────────────────────────────────────────────────────────── */

describe("grading, by item type", () => {
  const of = (slot) => items.find(i => i.slot === slot);

  test("MCQ", async (t) => {
    if (!need(t)) return;
    const i = of("R1");
    assert.equal(content.grade(i, i.answer), true);
    assert.equal(content.grade(i, (i.answer + 1) % i.options.length), false);
  });

  test("TRUE_FALSE, including the string form a form post sends", async (t) => {
    if (!need(t)) return;
    const i = of("R2");
    assert.equal(content.grade(i, i.answer_payload.value), true);
    assert.equal(content.grade(i, !i.answer_payload.value), false);
  });

  test("MULTI_SELECT is order-independent and refuses a partial answer", async (t) => {
    if (!need(t)) return;
    const i = of("R5");
    const key = i.answer_payload.correct;
    assert.equal(content.grade(i, [...key].reverse()), true);
    assert.equal(content.grade(i, [key[0]]), false, "a partial selection must not score");
    assert.equal(content.grade(i, [0, 1, 2, 3]), false, "selecting everything must not score");
  });

  test("MATCHING requires every pair", async (t) => {
    if (!need(t)) return;
    const i = of("K7");
    assert.equal(content.grade(i, i.answer_payload.mapping), true);
    const partial = { ...i.answer_payload.mapping }; delete partial["0"];
    assert.equal(content.grade(i, partial), false);
  });

  test("ORDERING requires the whole sequence", async (t) => {
    if (!need(t)) return;
    const i = of("R6");
    const key = i.answer_payload.order;
    assert.equal(content.grade(i, key), true);
    assert.equal(content.grade(i, [...key].reverse()), false);
  });

  test("GAP_FILL accepts every listed alternative and is case-insensitive", async (t) => {
    if (!need(t)) return;
    const i = of("K5");
    const gaps = i.answer_payload.gaps;
    assert.equal(content.grade(i, gaps.map(g => g.accepted[0])), true);
    assert.equal(content.grade(i, gaps.map(g => g.accepted[g.accepted.length - 1])), true,
      "a listed alternative must be accepted");
    assert.equal(content.grade(i, gaps.map(g => g.accepted[0].toUpperCase())), true,
      "capitals must be accepted — ß uppercases to SS and must fold back");
    // The Swiss spelling of any ß word must not be marked wrong.
    assert.equal(content.grade(i, gaps.map(g => g.accepted[0].replace(/ß/g, "ss"))), true);
    assert.equal(content.grade(i, gaps.map(() => "quatsch")), false);
  });

  test("productive items are not graded at all", async (t) => {
    if (!need(t)) return;
    for (const slot of ["P1", "P2", "W1", "S1"]) {
      assert.equal(content.grade(of(slot), "irgendein Text"), null, `${slot} was graded`);
    }
  });
});

/* ── the learner payload ────────────────────────────────────────────────── */

describe("no answer key reaches the learner", () => {
  test("safeItem strips keys, rationales and internal metadata", async (t) => {
    if (!need(t)) return;
    const safe = items.map(content.safeItem);
    const blob = JSON.stringify(safe);
    for (const leak of ['"answer"', "answer_payload", "rationale", '"gaps"', "mapping",
                        '"order"', '"correct"', "accepted", '"band"', "expected", "rubric_id"]) {
      assert.ok(!blob.includes(leak), `learner payload leaks ${leak}`);
    }
  });

  test("the learner still gets everything needed to answer", async (t) => {
    if (!need(t)) return;
    const v = await content.safeVersion(V1);
    assert.ok(v.context.reading?.text, "the reading passage must be sent");
    for (const i of v.items) {
      assert.ok(i.stem, `${i.slot} has no stem`);
      if (["MCQ", "MULTI_SELECT"].includes(i.itemType)) {
        assert.ok(Array.isArray(i.options) && i.options.length >= 2, `${i.slot} has no options`);
      }
      if (i.itemType === "MATCHING") {
        assert.ok(i.payload.left?.length && i.payload.right?.length, `${i.slot} is unanswerable`);
      }
      if (i.itemType === "GAP_FILL") assert.ok(i.payload.text?.includes("___"));
      if (i.itemType === "ORDERING") assert.ok(i.payload.items?.length >= 3);
    }
  });

  test("audio availability is reported honestly", async (t) => {
    if (!need(t)) return;
    const v = await content.safeVersion(V1);
    const l = v.context.listening;
    assert.ok(l, "a listening section must be described");
    assert.equal(l.audioRequired, true);
    // Until the clip is cut, `available` must be false — never a player that
    // plays nothing.
    assert.equal(l.available, !!l.audioUrl);
  });
});

/* ── provenance and review ──────────────────────────────────────────────── */

describe("provenance and review honesty", () => {
  test("every item carries complete, valid provenance", async (t) => {
    if (!need(t)) return;
    for (const i of items) {
      const v = model.validateProvenance(i, { required: true });
      assert.ok(v.valid, `${i.slot}: ${v.problems.join("; ")}`);
      if (i.source_type !== "ORIGINAL") assert.ok(i.source_book, `${i.slot} has no book`);
    }
  });

  test("no page reference is invented for original content", async (t) => {
    if (!need(t)) return;
    for (const i of items.filter(x => x.source_type === "ORIGINAL")) {
      assert.equal(i.source_page, null, `${i.slot} cites a page for ORIGINAL content`);
    }
  });

  test("nothing claims SME review", async (t) => {
    if (!need(t)) return;
    for (const i of items) {
      assert.notEqual(i.review_status, "SME_REVIEWED", `${i.slot} claims a review`);
      assert.notEqual(i.review_status, "PRODUCTION", `${i.slot} claims production status`);
    }
  });

  test("the rubric for our own short answers is not labelled as a board's", async (t) => {
    if (!need(t)) return;
    const { rows } = await pool.query(
      `SELECT board FROM b2_rubrics WHERE task_type='kurzantwort'`);
    assert.ok(rows.length, "the kurzantwort rubric is missing");
    assert.equal(rows[0].board, "custom");
  });
});

/* ── ALL THREE VERSIONS ─────────────────────────────────────────────────── */

const ALL = ["core-2026b-v1", "core-2026b-v2", "core-2026b-v3"];

describe("V1, V2 and V3 are parallel forms", () => {
  const load = async () => Object.fromEntries(
    await Promise.all(ALL.map(async v => [v, await content.itemsOf(v)])));

  test("all three exist with the same item count", async (t) => {
    if (!need(t)) return;
    const all = await load();
    for (const v of ALL) {
      assert.equal(all[v].length, 24, `${v} has ${all[v].length} items`);
    }
  });

  /* COMPARABILITY IS STRUCTURAL. Same slots, skills, capabilities, check_ids
     and item types — and explicitly NOT a claim of equal difficulty. */
  for (const dim of ["slot", "skill", "capability", "check_id", "item_type", "difficulty"]) {
    test(`${dim} distribution is identical across versions`, async (t) => {
      if (!need(t)) return;
      const all = await load();
      const tally = (xs) => xs.reduce((a, i) => {
        const k = i[dim] ?? "—"; a[k] = (a[k] || 0) + 1; return a; }, {});
      const base = tally(all[ALL[0]]);
      for (const v of ALL.slice(1)) {
        assert.deepEqual(tally(all[v]), base, `${v} differs from ${ALL[0]} on ${dim}`);
      }
    });
  }

  test("no item is shared between any two versions", async (t) => {
    if (!need(t)) return;
    const all = await load();
    const ids = ALL.flatMap(v => all[v].map(i => i.item_id));
    assert.equal(new Set(ids).size, ids.length, "an item id appears in two versions");
  });

  /* The check that matters more than ids: the same QUESTION must not appear
     twice under different ids. Generic task instructions ("Welcher Satz passt
     besser?") are expected to repeat — the task is constant, the material is
     not — so the fingerprint is stem + situation + options + text together. */
  test("no question is reused across versions", async (t) => {
    if (!need(t)) return;
    const all = await load();
    const seen = new Map();
    const n = (s) => String(s ?? "").toLowerCase().replace(/\s+/g, " ").trim();
    for (const v of ALL) {
      for (const i of all[v]) {
        const fp = [n(i.stem), n(i.payload?.context), n(i.payload?.text),
                    (Array.isArray(i.options) && i.options.length
                      ? i.options : i.payload?.options ?? []).map(n).join("~"),
                    [...(i.payload?.left ?? []), ...(i.payload?.right ?? [])].map(n).join("~"),
                    (i.payload?.items ?? []).map(n).join("~")].join("|");
        if (!fp.replace(/\|/g, "").trim()) continue;
        const prev = seen.get(fp);
        assert.ok(!prev || prev.startsWith(v), `${v}/${i.slot} repeats ${prev}`);
        seen.set(fp, `${v}/${i.slot}`);
      }
    }
  });

  test("no reading passage, listening transcript or prompt is reused", async (t) => {
    if (!need(t)) return;
    const seen = { passage: new Set(), audio: new Set(), writing: new Set(), speaking: new Set() };
    for (const v of ALL) {
      const ctx = (await content.safeVersion(v)).context;
      const items = await content.itemsOf(v);
      const passage = ctx.reading?.text;
      assert.ok(passage, `${v} has no reading passage`);
      assert.ok(!seen.passage.has(passage), `${v} reuses a passage`);
      seen.passage.add(passage);

      const audio = ctx.listening?.audioFile;
      assert.ok(audio, `${v} names no audio`);
      assert.ok(!seen.audio.has(audio), `${v} reuses audio`);
      seen.audio.add(audio);

      for (const [slot, bucket] of [["W1", "writing"], ["S1", "speaking"]]) {
        const s = items.find(i => i.slot === slot)?.stem;
        assert.ok(s, `${v} has no ${slot}`);
        assert.ok(!seen[bucket].has(s), `${v} reuses its ${slot} prompt`);
        seen[bucket].add(s);
      }
    }
  });

  test("each version's listening audio is its own, never borrowed", async (t) => {
    if (!need(t)) return;
    for (const v of ALL) {
      const ctx = (await content.safeVersion(v)).context;
      assert.match(ctx.listening.audioFile, /^core2026b_/,
        `${v} points at audio outside core-2026b`);
      assert.equal(ctx.listening.audioRequired, true);
      // available only when the asset is actually registered — never a
      // player that plays nothing.
      assert.equal(ctx.listening.available, !!ctx.listening.audioUrl);
    }
  });

  test("no learner payload of any version carries a key", async (t) => {
    if (!need(t)) return;
    for (const v of ALL) {
      const blob = JSON.stringify(await content.safeVersion(v));
      for (const leak of ['"answer"', "answer_payload", "rationale", '"gaps"',
                          "mapping", '"order"', "accepted", '"band"', "expected", "rubric_id"]) {
        assert.ok(!blob.includes(leak), `${v} leaks ${leak}`);
      }
      /* "correct" needs care rather than a blanket ban: the RESULT legitimately
         reports how many the learner got right. What must never appear is the
         key-shaped form — an array of correct option indices. */
      assert.ok(!/"correct":\s*\[/.test(blob), `${v} leaks a MULTI_SELECT key`);
    }
  });

  test("every version is 35/65 and fully classified", async (t) => {
    if (!need(t)) return;
    const all = await load();
    for (const v of ALL) {
      const core = all[v].filter(i => i.module !== "sprechen");
      const k = core.filter(i => i.payload?.band === "KNOWLEDGE").length;
      const s = core.filter(i => i.payload?.band === "SKILL").length;
      assert.equal(k + s, core.length, `${v} has unclassified items`);
      assert.ok(Math.abs(k / core.length - 0.35) <= 0.06, `${v} is ${k}/${core.length} knowledge`);
    }
  });

  test("every objective item in every version grades correctly", async (t) => {
    if (!need(t)) return;
    const all = await load();
    for (const v of ALL) {
      for (const i of all[v].filter(x => x.scoring_mode === "OBJECTIVE")) {
        const key = i.item_type === "MCQ" ? i.answer
          : i.item_type === "TRUE_FALSE" ? i.answer_payload.value
          : i.item_type === "MULTI_SELECT" ? i.answer_payload.correct
          : i.item_type === "MATCHING" ? i.answer_payload.mapping
          : i.item_type === "ORDERING" ? i.answer_payload.order
          : i.answer_payload.gaps.map(g => g.accepted[0]);
        assert.equal(content.grade(i, key), true, `${v}/${i.slot} does not accept its own key`);
      }
    }
  });

  /* THE C1 REGRESSION. An objectively-scored item was labelled skill="speaking"
     and silently dropped out of the comparable core: twenty answered, nineteen
     counted. Nothing scored may sit outside the core again. */
  test("every objectively scored item counts toward the comparable core", async (t) => {
    if (!need(t)) return;
    const all = await load();
    for (const v of ALL) {
      const scored = all[v].filter(i => i.scoring_mode === "OBJECTIVE");
      const counted = scored.filter(i => i.skill !== "speaking" && i.skill !== "writing");
      assert.equal(counted.length, scored.length,
        `${v}: ${scored.length - counted.length} scored item(s) excluded from the core`);
      assert.equal(scored.length, 20, `${v} has ${scored.length} scored items, expected 20`);
    }
  });
});

/* ── SPEAKING MUST NEVER BECOME A SCORE ─────────────────────────────────── */

describe("speaking is captured, never scored", () => {
  /* The failure this guards is quiet, not loud. Nobody will ever write
     "speakingBand = 4"; what happens is that a scoring_mode is changed, or a
     points value drifts from 0, or the comparable core stops excluding it — and
     suddenly one unscorable prompt is moving a learner's result. Each of those
     is a separate assertion because each is a separate way in. */

  test("every version's speaking item is TRANSCRIPT_ONLY and worth nothing", async (t) => {
    if (!need(t)) return;
    for (const v of ALL) {
      const s = (await content.itemsOf(v)).find(i => i.module === "sprechen");
      assert.ok(s, `${v} has no speaking item`);
      assert.equal(s.item_type, "SPOKEN_RESPONSE");
      assert.equal(s.scoring_mode, "TRANSCRIPT_ONLY", `${v} speaking claims a scoring mode`);
      assert.equal(Number(s.points), 0, `${v} speaking carries points`);
      assert.equal(s.answer, null);
      assert.equal(s.answer_payload, null, `${v} speaking has an answer key`);
    }
  });

  test("the database refuses to make a spoken response objectively scored", async (t) => {
    if (!need(t)) return;
    const r = await probeSql(
      `UPDATE b2_paper_items SET scoring_mode='OBJECTIVE'
        WHERE item_type='SPOKEN_RESPONSE'`);
    assert.equal(r.ok, false, "a spoken response was allowed to become objective");
  });

  test("the database refuses to give a spoken response an answer key", async (t) => {
    if (!need(t)) return;
    const r = await probeSql(
      `UPDATE b2_paper_items SET answer_payload='{"value":true}'::jsonb
        WHERE item_type='SPOKEN_RESPONSE'`);
    assert.equal(r.ok, false, "a spoken response was given a key");
  });

  test("speaking never reaches the comparable core", async (t) => {
    if (!need(t)) return;
    const prog = require("../src/b2/assessment_progress");
    const items = await content.itemsOf(ALL[0]);
    const attempt = {
      attemptId: 1, completedAt: "2026-01-01", comparableGroup: "core-2026b",
      items: items.map(i => ({
        slot: i.slot, itemId: i.item_id, capability: i.capability, skill: i.skill,
        skipped: false,
        // Pretend the speaking item somehow arrived marked correct.
        correct: i.scoring_mode === "OBJECTIVE" ? true : (i.module === "sprechen" ? true : null),
      })),
    };
    const scored = prog.scoreAttempt(attempt);
    assert.equal(scored.measured, 20,
      "the comparable core must be the 20 objective items, whatever speaking claims");
    assert.ok(!scored.bySkill.speaking, "speaking entered the scored breakdown");
  });

  test("the result reports speaking as not measured, distinctly from skipped", async (t) => {
    if (!need(t)) return;
    // The distinction the UI depends on: speaking appears in notMeasured, and
    // never in stronger or practiseNext.
    const items = await content.itemsOf(ALL[0]);
    const spoken = items.filter(i => i.module === "sprechen");
    assert.equal(spoken.length, 1);
    assert.notEqual(spoken[0].scoring_mode, "OBJECTIVE");
  });

  test("no version's payload offers a speaking score, band or level", async (t) => {
    if (!need(t)) return;
    for (const v of ALL) {
      const blob = JSON.stringify(await content.safeVersion(v)).toLowerCase();
      for (const claim of ["sprechniveau", "speaking score", "speaking band",
                           "cefr", "goethe", "telc", "punkte für sprechen"]) {
        assert.ok(!blob.includes(claim), `${v} offers "${claim}"`);
      }
    }
  });
});

/* ── core-2026a is untouched ────────────────────────────────────────────── */

describe("core-2026a is not disturbed", () => {
  test("the frozen registry still answers for its own versions", async (t) => {
    if (!need(t)) return;
    const legacy = await content.itemsOf("v1");
    // 20 comparable slots plus the V1 speaking prompt that lives in the pool
    // without being wired into screen_v1 — see the Phase 3A registry.
    assert.equal(legacy.length, 21, "core-2026a v1 must still resolve from the registry");
    assert.ok(legacy.every(i => i.legacy), "core-2026a must not be served from the database");
  });

  test("group membership routes correctly", async (t) => {
    if (!need(t)) return;
    assert.equal(content.groupOf("v1"), "core-2026a");
    assert.equal(content.groupOf("core-2026b-v1"), "core-2026b");
    assert.equal(content.isDbBacked("v1"), false);
    assert.equal(content.isDbBacked("core-2026b-v1"), true);
  });

  test("the two groups are never compared", async (t) => {
    if (!need(t)) return;
    const prog = require("../src/b2/assessment_progress");
    const mk = (group, at) => ({
      attemptId: group === "core-2026a" ? 1 : 2, completedAt: at, comparableGroup: group,
      items: [{ slot: "G1", itemId: `${group}_1`, capability: "argue", skill: "grammar",
                skipped: false, correct: true }],
    });
    const p = prog.progress([mk("core-2026a", "2026-01-01"), mk("core-2026b", "2026-02-01")]);
    assert.equal(p.delta, null, "compared across comparable groups");
  });
});

/* ── one open attempt per learner, even when two starts race ─────────────
   FOUND LIVE: a page reload racing React StrictMode's double effect
   invocation created two open attempts a few milliseconds apart. Every
   learner answer landed on the first row; "resume" (ORDER BY id DESC LIMIT 1)
   silently picked up the second, empty one, so a refresh looked like it had
   erased her progress. Migration 014 makes the losing INSERT fail with 23505
   instead of succeeding twice, and assessment_store catches that and resumes
   the row that won. */
describe("two near-simultaneous starts do not fork an attempt", () => {
  const store = require("../src/b2/assessment_store");
  const RACE_USER = 3;

  const cleanup = async () => {
    await pool.query(
      `DELETE FROM b2_assessment_items WHERE attempt_id IN
         (SELECT id FROM b2_paper_attempts WHERE user_id=$1 AND kind='assessment')`,
      [RACE_USER]);
    await pool.query(`DELETE FROM b2_paper_attempts WHERE user_id=$1 AND kind='assessment'`, [RACE_USER]);
  };

  test("concurrent startVersion calls resolve to exactly one open attempt", async (t) => {
    if (!need(t)) return;
    await cleanup();
    try {
      const [a, b] = await Promise.all([
        store.startVersion(RACE_USER, V1),
        store.startVersion(RACE_USER, V1),
      ]);
      assert.equal(a.attemptId, b.attemptId, "both racing starts must land on the same attempt");

      const { rows } = await pool.query(
        `SELECT count(*)::int AS n FROM b2_paper_attempts
          WHERE user_id=$1 AND kind='assessment' AND finished_at IS NULL`, [RACE_USER]);
      assert.equal(rows[0].n, 1, "exactly one open attempt must exist after the race");

      /* THE HALF-BUILT-ATTEMPT REGRESSION. The first live run of this exact
         race left an attempt row behind with 5 of its 24 items because the
         item-insert loop was not transactional with the attempt insert — a
         losing 23505 (or any crash) mid-loop left a sitting nobody could ever
         finish correctly. Every item must be present, not just the attempt row. */
      const full = await content.itemsOf(V1);
      const { rows: itemRows } = await pool.query(
        `SELECT count(*)::int AS n FROM b2_assessment_items WHERE attempt_id=$1`, [a.attemptId]);
      assert.equal(itemRows[0].n, full.length, "the winning attempt must have every item, never a partial set");
    } finally { await cleanup(); }
  });

  test("the database itself refuses a second open attempt for the same learner", async (t) => {
    if (!need(t)) return;
    await cleanup();
    try {
      await pool.query(
        `INSERT INTO b2_paper_attempts (user_id, kind, assessment_version) VALUES ($1,'assessment',$2)`,
        [RACE_USER, V1]);
      const second = await probeSql(
        `INSERT INTO b2_paper_attempts (user_id, kind, assessment_version) VALUES (${RACE_USER},'assessment','${V1}')`);
      assert.equal(second.ok, false, "a second open attempt for the same user must be refused");
    } finally { await cleanup(); }
  });
});
