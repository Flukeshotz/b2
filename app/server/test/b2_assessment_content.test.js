/**
 * THE ASSESSMENT CONTENT POOL — what has to stay true for a retest to mean
 * anything.
 *
 * The product promise is "take a NEW test and see whether you improved". Every
 * assertion here protects one half of that sentence:
 *
 *   NEW        — no item, passage, audio or prompt may appear in two versions,
 *                and none may come from practice content the learner has just
 *                been sent to work through. A repeated item measures memory,
 *                and a version built from practice material measures whether
 *                she did her homework.
 *   IMPROVED   — the versions have to be structurally comparable, or the
 *                difference between two results is a difference between two
 *                different tests.
 *
 * Deliberately DB-free. The whole point of proving the content in this phase is
 * that it can be proven without the database the backend phase will need.
 *
 * These tests do not check that the German is GOOD. No teacher has read it; the
 * banks are marked draft, and one of the tests below makes sure nobody quietly
 * changes that without recording a real review.
 */

const { test, describe } = require("node:test");
const assert = require("node:assert");

const assess = require("../src/seed/b2/assessment");
const { BLUEPRINT, ITEMS, VERSIONS } = assess;
const VERSION_IDS = Object.keys(VERSIONS);

const norm = (s) => String(s || "").toLowerCase()
  .replace(/[“”„"'’‚`]/g, "").replace(/\s+/g, " ").replace(/[—–-]/g, "-").trim();

describe("assessment pool — structure", () => {
  test("three versions exist", () => {
    assert.deepEqual(VERSION_IDS, ["v1", "v2", "v3"]);
  });

  test("every item carries the metadata a selector needs", () => {
    for (const it of ITEMS) {
      assert.ok(it.id, "item has no id");
      assert.ok(it.slot, `${it.id} has no slot`);
      assert.ok(it.version, `${it.id} has no version`);
      assert.ok(it.skill, `${it.id} has no skill`);
      assert.ok(it.capability, `${it.id} has no capability`);
      assert.ok(it.format, `${it.id} has no format`);
      assert.ok(it.scoring, `${it.id} has no scoring method`);
      assert.ok(it.tier, `${it.id} has no difficulty tier`);
    }
  });

  test("capabilities come from the real taxonomy, not free text", () => {
    const { CAPABILITIES } = require("../src/b2/capabilities");
    const known = new Set(CAPABILITIES.map(c => c.id));
    for (const it of ITEMS) {
      assert.ok(known.has(it.capability), `${it.id} names unknown capability "${it.capability}"`);
    }
  });

  test("every item's capability and check_id match its blueprint slot", () => {
    const bySlot = Object.fromEntries(
      [...BLUEPRINT.slots, BLUEPRINT.speakingSlot].map(s => [s.slot, s]));
    for (const it of ITEMS) {
      const spec = bySlot[it.slot];
      assert.ok(spec, `${it.id} names unknown slot ${it.slot}`);
      assert.equal(it.capability, spec.capability, `${it.id} capability drifted from slot ${it.slot}`);
      assert.equal(it.check_id, spec.check_id ?? null, `${it.id} check_id drifted from slot ${it.slot}`);
    }
  });
});

describe("assessment pool — comparability", () => {
  /* Structural only. If one of these ever starts asserting equal difficulty,
     it is asserting something we have no data for. */
  for (const [a, b] of [["v1", "v2"], ["v1", "v3"], ["v2", "v3"]]) {
    test(`${a} and ${b} share a blueprint`, () => {
      const c = assess.compare(a, b);
      assert.deepEqual(c.skill, {}, "skill weighting differs");
      assert.deepEqual(c.capability, {}, "capability weighting differs");
      assert.deepEqual(c.check_id, {}, "check_id weighting differs");
      assert.deepEqual(c.format, {}, "format weighting differs");
      assert.equal(c.itemCount[a], c.itemCount[b]);
      assert.ok(c.structurallyComparable);
    });
  }

  test("the claim attached to a comparison is the modest one", () => {
    const c = assess.compare("v1", "v2");
    assert.equal(c.claim, "Comparable assessment structure");
    assert.ok(!/equivalent|equal difficulty|calibrat/i.test(c.claim));
  });

  test("each version's comparable core is the blueprint's 20 slots", () => {
    for (const v of VERSION_IDS) {
      const core = assess.itemsOf(v).filter(i => i.comparable);
      assert.equal(core.length, BLUEPRINT.comparableItemCount,
        `${v} has ${core.length} comparable items`);
    }
  });
});

describe("assessment pool — nothing repeats", () => {
  test("no item id appears twice", () => {
    const ids = ITEMS.map(i => i.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  test("no two versions share an item", () => {
    for (const [a, b] of [["v1", "v2"], ["v1", "v3"], ["v2", "v3"]]) {
      assert.deepEqual(assess.compare(a, b).sharedItemIds, []);
    }
  });

  test("no stem is reused across versions", () => {
    const seen = new Map();
    for (const it of ITEMS) {
      const c = it.content;
      const stem = norm(c.q || c.sentence || c.context || c.prompt || "");
      if (!stem) continue;
      const prev = seen.get(stem);
      assert.ok(!prev || prev.version === it.version,
        `${it.id} repeats the stem of ${prev?.id}`);
      seen.set(stem, it);
    }
  });

  test("no reading passage, listening transcript or prompt is reused", () => {
    const buckets = { passage: new Map(), transcript: new Map(), prompt: new Map() };
    for (const v of VERSION_IDS) {
      for (const sec of VERSIONS[v].sections) {
        if (sec.key === "reading" && sec.text) {
          const k = norm(sec.text);
          assert.ok(!buckets.passage.has(k), `${v} reuses the passage from ${buckets.passage.get(k)}`);
          buckets.passage.set(k, v);
        }
        if (sec.key === "listening" && sec.turns) {
          const k = norm(sec.turns.map(t => t.text).join(" "));
          assert.ok(!buckets.transcript.has(k), `${v} reuses the audio from ${buckets.transcript.get(k)}`);
          buckets.transcript.set(k, v);
        }
        if (sec.key === "writing" && sec.prompt) {
          const k = norm(sec.prompt);
          assert.ok(!buckets.prompt.has(k), `${v} reuses the prompt from ${buckets.prompt.get(k)}`);
          buckets.prompt.set(k, v);
        }
      }
    }
  });

  test("no speaking prompt is reused", () => {
    const seen = new Map();
    for (const it of ITEMS.filter(i => i.skill === "speaking")) {
      const k = norm(it.content.prompt);
      assert.ok(!seen.has(k), `${it.id} reuses the speaking prompt of ${seen.get(k)}`);
      seen.set(k, it.id);
    }
  });
});

describe("assessment pool — practice overlap", () => {
  /* The failure this phase exists to prevent: an assessment built from the
     material the learner was just told to practise. V1's listening is a known,
     declared instance; V2 and V3 must be clean. */
  const practice = [];
  for (const [p, pick] of [
    ["../src/seed/b2/src_muede", m => m.TRANSCRIPT || m.SCRIPT],
    ["../src/seed/b2/src_homeoffice", m => m.TRANSCRIPT || m.SCRIPT],
    ["../src/seed/b2/exam/hoeren_t1_alltag",
      m => (m.TEXTS || []).flatMap(t => (t.turns || []).map(x => x.de || x.text)).join(" ")],
  ]) {
    try { const t = pick(require(p)); if (t) practice.push(norm(t)); } catch { /* absent is fine */ }
  }
  const blob = practice.join("  ");

  test("the practice corpus actually loaded", () => {
    assert.ok(blob.length > 1000, "practice corpus is empty — the overlap test would pass vacuously");
  });

  for (const v of ["v2", "v3"]) {
    test(`${v} shares no sentence with practice content`, () => {
      for (const sec of VERSIONS[v].sections) {
        const texts = [sec.text, ...(sec.turns || []).map(t => t.text)].filter(Boolean);
        for (const t of texts) {
          for (const s of norm(t).split(/(?<=[.!?])\s+/)) {
            if (s.split(" ").length < 7) continue;
            assert.ok(!blob.includes(s), `${v} ${sec.key} reuses practice sentence: "${s.slice(0, 50)}"`);
          }
        }
      }
    });

    test(`${v} does not borrow a practice audio source`, () => {
      const declared = assess.PRACTICE_SOURCE[v];
      assert.equal(declared.listening, null);
      const sec = VERSIONS[v].sections.find(s => s.key === "listening");
      assert.ok(sec.turns?.length, `${v} listening has no own transcript`);
      assert.ok(!sec.sourceId, `${v} listening points at an external source`);
    });
  }

  test("V1's overlap is declared rather than hidden", () => {
    assert.deepEqual(assess.PRACTICE_SOURCE.v1.listening,
      { sourceId: "src_muede", sectionId: "s3", practiceTopic: "b2_muede_listen" });
  });
});

describe("assessment pool — items are answerable", () => {
  test("every key points at a real option", () => {
    for (const it of ITEMS.filter(i => i.objective)) {
      const { options, answer } = it.content;
      assert.ok(Array.isArray(options) && options.length >= 2, `${it.id} has too few options`);
      assert.ok(Number.isInteger(answer) && answer >= 0 && answer < options.length,
        `${it.id} key ${answer} is outside its options`);
    }
  });

  test("no item repeats an option", () => {
    for (const it of ITEMS.filter(i => i.objective)) {
      const opts = it.content.options.map(norm);
      assert.equal(new Set(opts).size, opts.length, `${it.id} repeats an option`);
    }
  });

  test("every objective item explains its answer", () => {
    for (const it of ITEMS.filter(i => i.objective)) {
      assert.ok(it.content.why, `${it.id} has no explanation`);
    }
  });

  test("the key is not always in the same position", () => {
    for (const v of VERSION_IDS) {
      const two = assess.itemsOf(v).filter(i => i.objective && i.content.options.length === 2);
      if (!two.length) continue;
      const firsts = two.filter(i => i.content.answer === 0).length;
      assert.ok(firsts > 0 && firsts < two.length,
        `${v}: every two-option key sits in position ${firsts ? 0 : 1}`);
    }
  });
});

describe("assessment pool — depth for a weakness-targeted retest", () => {
  test("every slot has at least three variants", () => {
    for (const [slot, ids] of Object.entries(assess.variantsPerSlot())) {
      assert.ok(ids.length >= 3, `slot ${slot} has only ${ids.length} variant(s): ${ids.join(", ")}`);
    }
  });

  test("a learner who has sat one version still has unused items in every capability", () => {
    const caps = new Set(ITEMS.map(i => i.capability));
    for (const cap of caps) {
      for (const sat of VERSION_IDS) {
        const left = assess.itemsFor({ capability: cap, excludeVersions: [sat] });
        assert.ok(left.length >= 2,
          `after sitting ${sat}, capability "${cap}" has only ${left.length} unused item(s)`);
      }
    }
  });

  test("itemsFor answers the selector's actual question", () => {
    // "Give me three unused items testing argue."
    const got = assess.itemsFor({ capability: "argue", excludeVersions: ["v1"], limit: 3 });
    assert.equal(got.length, 3);
    assert.ok(got.every(i => i.capability === "argue"));
    assert.ok(got.every(i => i.version !== "v1"));
    assert.equal(new Set(got.map(i => i.id)).size, 3);
  });

  test("excludeIds actually excludes", () => {
    const first = assess.itemsFor({ capability: "concede" });
    const rest = assess.itemsFor({ capability: "concede", excludeIds: first.map(i => i.id) });
    assert.deepEqual(rest, []);
  });
});

describe("assessment pool — honesty", () => {
  test("nothing is marked reviewed without a recorded reviewer", () => {
    for (const [v, r] of Object.entries(assess.REVIEW)) {
      if (r.status === "reviewed") {
        assert.ok(r.reviewer && r.reviewedAt, `${v} claims review with no reviewer or date`);
      } else {
        assert.equal(r.status, "draft", `${v} has an unexpected review status "${r.status}"`);
      }
    }
  });

  test("every item carries provenance, and none claims an exam board", () => {
    for (const it of ITEMS) {
      assert.ok(it.provenance?.source, `${it.id} has no provenance`);
      assert.ok(it.provenance.sourceType, `${it.id} has no source type`);
      assert.ok(!/goethe|telc/i.test(JSON.stringify(it.provenance)),
        `${it.id} provenance names an exam board`);
    }
  });

  test("no item text claims a score, a level or a pass probability", () => {
    const banned = /\b(goethe|telc)\b|bestehenswahrscheinlichkeit|ihr niveau ist|\bB2 erreicht\b/i;
    for (const it of ITEMS) {
      const blob = JSON.stringify(it.content);
      assert.ok(!banned.test(blob), `${it.id} makes a claim the product may not make`);
    }
  });

  test("speaking is captured but never banded", () => {
    const spoken = ITEMS.filter(i => i.skill === "speaking");
    assert.ok(spoken.length >= 3);
    for (const it of spoken) {
      assert.equal(it.banded, false, `${it.id} would set a speaking level`);
      assert.equal(it.comparable, false, `${it.id} would enter the comparable core`);
      assert.equal(it.evidenceType, "unbanded_signal");
      assert.equal(it.scoring, "transcript_only");
    }
  });

  test("V1's speaking prompt is in the pool but not wired into screen_v1", () => {
    const v1s = ITEMS.find(i => i.id === "v1_s1");
    assert.ok(v1s, "V1 speaking prompt missing from the pool");
    assert.equal(v1s.wired, false);
    const sat = VERSIONS.v1.sections.map(s => s.key);
    assert.ok(!sat.includes("speaking"), "screen_v1 must not silently gain a speaking section");
  });

  test("skipping is not wrong, and cannot be reconfigured into a penalty", () => {
    assert.equal(BLUEPRINT.skip.allowed, true);
    assert.equal(BLUEPRINT.skip.scoredAsWrong, false);
    assert.equal(BLUEPRINT.skip.producesEvidence, false);
    assert.equal(BLUEPRINT.skip.learnerLabel, "Not measured yet");
  });

  test("the blueprint still forbids the claims we are not entitled to", () => {
    for (const c of ["Goethe score", "telc score", "probability of passing", "exact CEFR level"]) {
      assert.ok(BLUEPRINT.forbiddenClaims.includes(c), `${c} dropped off the forbidden list`);
    }
  });
});

describe("assessment pool — V1 is untouched", () => {
  /* V1 is the baseline every future comparison runs against. It is annotated by
     the registry, never rewritten, and this proves the registry did not quietly
     edit the file the live /api/b2/screening route serves. */
  const { SCREENING } = require("../src/seed/b2/screening");

  test("the registry serves screening.js's own items", () => {
    assert.equal(VERSIONS.v1.id, SCREENING.id);
    assert.equal(VERSIONS.v1.totalMinutes, SCREENING.totalMinutes);
    for (const sec of SCREENING.sections) {
      const mine = VERSIONS.v1.sections.find(s => s.key === sec.key);
      assert.ok(mine, `v1 lost the ${sec.key} section`);
      assert.equal((mine.items || []).length, (sec.items || []).length);
      for (const [i, item] of (sec.items || []).entries()) {
        assert.equal(mine.items[i].id, item.id);
        assert.equal(mine.items[i].answer, item.answer);
        assert.deepEqual(mine.items[i].options, item.options);
      }
    }
  });

  test("every V1 item found a slot", () => {
    for (const it of assess.itemsOf("v1")) assert.ok(it.slot, `${it.id} has no slot`);
  });
});
