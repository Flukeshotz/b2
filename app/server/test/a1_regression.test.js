/**
 * A1 REGRESSION SUITE
 *
 * Written before the `topics.level` column existed, for one reason: B2 is about
 * to share A1's curriculum table, progress table, review queue and lesson
 * engine, and there was no automated way to know whether that broke the product
 * thirty lessons of learners are already using.
 *
 * Everything here is A1's behaviour AS IT SHIPPED. If a test in this file goes
 * red, the change under it is wrong -- not the test. The one permitted reason to
 * edit these expectations is a deliberate, requested change to how A1 behaves.
 *
 * Pure domain logic only: no DB, no network, no React. The functions under test
 * live in the client's ESM lib, imported dynamically because this server package
 * is CommonJS.
 */

const { test, describe, before } = require("node:test");
const assert = require("node:assert");

let C;
before(async () => { C = await import("../../client/src/lib/curriculum.js"); });

/* Shaped exactly like a real row: three subs keyed learn/practice/apply. */
const topic = (id, level, subs = ["learn", "practice", "apply"]) => ({
  id, level, order_index: 0, icon: "🥐", title: `topic ${id}`,
  capability: "cap", proof: "proof",
  subs: subs.map(k => ({ key: k, label: k, teaches: [[`de_${id}_${k}`, "en", "🥐"]], steps: [] })),
});

const a1 = (id) => topic(id, "a1");
const b2 = (id) => topic(id, "b2");
const allSubs = (t) => t.subs.map(s => `${t.id}:${s.key}`);

describe("A1 — level classification", () => {
  test("a row with no level column at all reads as A1", () => {
    // Every topic seeded before the migration looks like this. Treating the
    // absent value as anything but A1 would empty the A1 journey outright.
    const legacy = { id: "a1l1", subs: [] };
    assert.equal(C.levelOf(legacy), "a1");
    assert.equal(C.topicsAtLevel([legacy], "a1").length, 1);
  });

  test("levels split cleanly and neither leaks into the other", () => {
    const mixed = [a1("a1l1"), b2("b2g1"), a1("a1l2"), b2("b2v1")];
    assert.deepEqual(C.topicsAtLevel(mixed, "a1").map(t => t.id), ["a1l1", "a1l2"]);
    assert.deepEqual(C.topicsAtLevel(mixed, "b2").map(t => t.id), ["b2g1", "b2v1"]);
  });
});

describe("A1 — linear unlocking (requirements 1, 2, 3)", () => {
  const topics = [a1("a1l1"), a1("a1l2"), a1("a1l3")];

  test("order is preserved exactly as given", () => {
    assert.deepEqual(topics.map(t => t.id), ["a1l1", "a1l2", "a1l3"]);
  });

  test("a brand-new learner has only lesson 1 open", () => {
    assert.equal(C.openTopicIndex(topics, []), 0);
  });

  test("a partly-finished topic does not unlock the next one", () => {
    // Two of three subs done. This is the case that decides whether a learner
    // can skip the Apply stage, and the answer must stay no.
    const done = ["a1l1:learn", "a1l1:practice"];
    assert.equal(C.openTopicIndex(topics, done), 0);
  });

  test("completing every sub of a topic unlocks exactly the next topic", () => {
    assert.equal(C.openTopicIndex(topics, allSubs(topics[0])), 1);
    assert.equal(C.openTopicIndex(topics, [...allSubs(topics[0]), ...allSubs(topics[1])]), 2);
  });

  test("completing the last topic saturates rather than running off the end", () => {
    const done = topics.flatMap(allSubs);
    assert.equal(C.openTopicIndex(topics, done), 2);
    assert.equal(C.nextUnfinishedIndex(topics, done), -1); // "you finished A1"
  });

  test("out-of-order completion does not skip an unfinished earlier topic", () => {
    // Replaying a later topic must never jump the cursor past unfinished work.
    assert.equal(C.openTopicIndex(topics, allSubs(topics[2])), 0);
  });
});

describe("A1 — B2 must not perturb the A1 journey (requirement 4)", () => {
  const a1Only = [a1("a1l1"), a1("a1l2")];

  test("B2 rows interleaved in the table do not move the A1 cursor", () => {
    const mixed = [a1("a1l1"), b2("b2g1"), a1("a1l2"), b2("b2v1")];
    const filtered = C.topicsAtLevel(mixed, "a1");
    assert.equal(C.openTopicIndex(filtered, []), C.openTopicIndex(a1Only, []));
    assert.deepEqual(filtered.map(t => t.id), a1Only.map(t => t.id));
  });

  test("finishing B2 work does not advance A1", () => {
    // Same shared user_progress table, so B2 keys land in the same `done` array.
    const mixed = [a1("a1l1"), a1("a1l2"), b2("b2g1")];
    const done = allSubs(b2("b2g1"));
    assert.equal(C.openTopicIndex(C.topicsAtLevel(mixed, "a1"), done), 0);
  });

  test("finishing A1 does not mark any B2 topic complete", () => {
    const done = [...allSubs(a1("a1l1")), ...allSubs(a1("a1l2"))];
    assert.equal(C.topicFullyDone(b2("b2g1"), done), false);
  });

  test("B2 is reachable with zero A1 progress", () => {
    // The whole point of the level split: no A1 gate stands in front of B2.
    const mixed = [a1("a1l1"), a1("a1l2"), b2("b2g1")];
    const b2Topics = C.topicsAtLevel(mixed, "b2");
    assert.equal(b2Topics.length, 1);
    assert.equal(C.topicFullyDone(b2Topics[0], []), false); // available, not complete
  });
});

describe("A1 — progress accounting (requirement 5)", () => {
  const t = a1("a1l1");

  test("sub keys are unchanged in shape", () => {
    assert.equal(C.subKey(t, t.subs[0]), "a1l1:learn");
  });

  test("counts and completion read the same as before", () => {
    assert.equal(C.topicDoneCount(t, ["a1l1:learn", "a1l1:apply"]), 2);
    assert.equal(C.topicFullyDone(t, ["a1l1:learn", "a1l1:apply"]), false);
    assert.equal(C.topicFullyDone(t, allSubs(t)), true);
  });

  test("progress from another topic never counts toward this one", () => {
    assert.equal(C.topicDoneCount(t, ["a1l2:learn", "a1l2:practice", "a1l2:apply"]), 0);
  });

  test("nextSub resumes at the first unfinished sub, and falls back to the first", () => {
    assert.equal(C.nextSub(t, ["a1l1:learn"]).key, "practice");
    assert.equal(C.nextSub(t, allSubs(t)).key, "learn"); // replay from the top
  });
});

describe("A1 — review injection (requirement 6)", () => {
  const topics = [a1("a1l1"), a1("a1l2")];
  const owned = ["de_a1l1_learn", "de_a1l2_learn", "de_a1l2_apply"];
  const item = (de) => ({ de, en: "en", icon: "🥐" });
  // Words these A1 topics really teach — review is now scoped to them.
  const W1 = "de_a1l1_learn", W2 = "de_a1l2_learn";

  test("no due items means no injected steps at all", () => {
    const { steps, teaches } = C.buildReviewSteps([], topics, owned, 3);
    assert.deepEqual(steps, []);
    assert.deepEqual(teaches, []);
  });

  test("injected steps are bookended by story beats", () => {
    const { steps } = C.buildReviewSteps([item(W1)], topics, owned, 3);
    assert.equal(steps[0].t, "story");
    assert.equal(steps[steps.length - 1].t, "story");
    assert.match(steps[steps.length - 1].lines[0], new RegExp(`Still know ${W1}`));
  });

  test("every teaches index is offset past the host sub's own array", () => {
    // The offset bug class: a review word rendering as a lesson word because
    // their indices collided. Nothing may point below `offset`.
    const offset = 7;
    const { steps, teaches } = C.buildReviewSteps(
      [item(W1), item(W2)], topics, owned, offset);
    const idx = [];
    for (const s of steps) {
      if (typeof s.w === "number") idx.push(s.w);
      if (Array.isArray(s.from)) idx.push(...s.from);
    }
    assert.ok(idx.length > 0, "expected index-bearing steps");
    for (const i of idx) {
      assert.ok(i >= offset, `index ${i} collides with the host sub's teaches`);
      assert.ok(i - offset < teaches.length, `index ${i} runs past the review teaches`);
    }
  });

  test("the correct answer is always from[0], never shuffled away", () => {
    // Pick shuffles for display itself; shuffling here silently marks the
    // wrong tile correct. Run repeatedly — the mechanic is chosen at random.
    for (let run = 0; run < 40; run++) {
      const { steps, teaches } = C.buildReviewSteps(
        [item(W1), item(W2)], topics, owned, 0);
      const quizzes = steps.filter(s => s.reviewWord);
      assert.equal(quizzes.length, 2);
      for (const q of quizzes) {
        assert.equal(teaches[q.from[0]][0], q.reviewWord);
        assert.equal(new Set(q.from).size, q.from.length, "duplicate option");
      }
    }
  });

  test("decoys are only ever words the learner already owns", () => {
    // Never quiz against something untaught — the standing content rule.
    for (let run = 0; run < 20; run++) {
      const { teaches } = C.buildReviewSteps([item(W1)], topics, owned, 0);
      for (const [de] of teaches.slice(1)) assert.ok(owned.includes(de), `untaught decoy: ${de}`);
    }
  });

  test("a word with no owned decoys still produces a usable step", () => {
    const { steps } = C.buildReviewSteps([item(W1)], topics, [], 0);
    assert.ok(steps.some(s => s.reviewWord === W1));
  });

  test("B2 phrases inject exactly like A1 words — no schema change needed", () => {
    // review_queue.de is TEXT and `teaches` entries are free strings, so a
    // multi-word B2 collocation is already legal. Proven against a topic set
    // that actually teaches the phrase.
    const phrase = "in Betracht ziehen";
    const b2Topic = {
      id: "b2v_nvv", level: "b2", subs: [{ key: "learn", label: "Learn",
        teaches: [[phrase, "to take into consideration", "🔗"]], steps: [] }],
    };
    const { steps, teaches } = C.buildReviewSteps([item(phrase)], [b2Topic], [phrase], 5);
    const quiz = steps.find(s => s.reviewWord === phrase);
    assert.ok(quiz, "phrase produced no quiz step");
    assert.equal(teaches[quiz.from[0] - 5][0], phrase);
  });

  test("a B2 phrase is NEVER injected into an A1 lesson", () => {
    // review_queue is one queue per user, not per level. Without scoping, a
    // learner forty words into A1 gets quizzed on a B2 collocation she has
    // never been taught — the taught-before-tested rule, broken by the level
    // split itself. This is the test that keeps it closed.
    const { steps, teaches } = C.buildReviewSteps(
      [item("in Betracht ziehen")], topics /* A1 only */, owned, 0);
    assert.deepEqual(steps, [], "a B2 phrase leaked into an A1 lesson");
    assert.deepEqual(teaches, []);
  });

  test("and an A1 word is never injected into a B2 lesson", () => {
    const b2Topics = [{ id: "b2g_konzessiv", level: "b2", subs: [{ key: "learn",
      label: "Learn", teaches: [["obwohl", "although", "🔀"]], steps: [] }] }];
    const { steps } = C.buildReviewSteps([item("de_a1l1_learn")], b2Topics, owned, 0);
    assert.deepEqual(steps, []);
  });

  test("a mixed queue keeps only the items this level taught", () => {
    const mixed = [item("de_a1l1_learn"), item("in Betracht ziehen"), item("de_a1l2_learn")];
    const { steps } = C.buildReviewSteps(mixed, topics /* A1 */, owned, 0);
    const quizzed = steps.filter(s => s.reviewWord).map(s => s.reviewWord);
    assert.deepEqual(quizzed.sort(), ["de_a1l1_learn", "de_a1l2_learn"]);
  });
});
