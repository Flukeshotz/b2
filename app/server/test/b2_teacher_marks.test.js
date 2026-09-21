/**
 * THE TEACHER'S MARKS — a regression guard, NOT a claim of accuracy.
 *
 * Six Aufnahmeberichte marked by a qualified German teacher. The engine agrees
 * with all six — and that number means much less than it looks:
 *
 *   · These same six texts were used to FIND AND FIX four real bugs. Scoring
 *     6/6 on the set you tuned against is overfitting by definition.
 *   · Six marks from ONE rater cannot establish accuracy. Trained raters agree
 *     on an exact CEFR band only 65.5% of the time.
 *
 * So what is this test for? Making sure we never silently go BACKWARDS on the
 * only independently marked scripts we own. If one of these flips, something
 * real changed in the scorer and a human needs to look.
 *
 * It is not evidence the engine is accurate. That needs ~20 more texts,
 * marked by someone who has not seen our output.
 */

const { test, describe } = require("node:test");
const assert = require("node:assert");

require("../src/env")();
const pflege = require("../src/b2/pflege");
const { analyse } = require("../src/b2/analyse");
const marks = require("../src/b2/teacher/marked_2026-09.json");

const TASK = { target_words: 80, task_type: "aufnahmebericht", content_points: [] };
const RANK = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5 };

describe("telc Pflege — the teacher-marked set", () => {
  for (const m of marks.marked) {
    test(`text ${m.id} is still ${m.level} — "${m.teacher_reason.slice(0, 46)}"`, () => {
      const got = pflege.score(m.text, TASK).level;
      assert.equal(got, m.level,
        `text ${m.id}: the teacher marked it ${m.level}, the engine now says ${got}. ` +
        `This is one of only six independently marked scripts — a flip here needs a human.`);
    });
  }

  test("no text is ever more than one band from the teacher", () => {
    // The weaker guarantee, and the one that would still matter if a future
    // recalibration deliberately shifted the exact cut.
    for (const m of marks.marked) {
      const got = pflege.score(m.text, TASK).level;
      assert.ok(Math.abs(RANK[got] - RANK[m.level]) <= 1,
        `text ${m.id}: ${m.level} -> ${got} is more than one band out`);
    }
  });

  test("the teacher's own model answer scores B2", () => {
    // If the engine cannot recognise the model we SHOW learners as B2, we are
    // teaching one thing and marking another.
    const got = pflege.score(marks.model_answer.text, TASK).level;
    assert.equal(got, "B2", `the model answer we show learners scores ${got}`);
  });

  test("a correct but simple text is still below B2 — confirmed by the teacher", () => {
    // Asked directly: "we fail a text with no mistakes if every sentence is
    // short and the vocabulary everyday — would you?" Answer: "Yes".
    // Text D has few errors and is A2 because of range, not accuracy.
    const d = marks.marked.find(x => x.id === "D");
    const { findings } = analyse(d.text, TASK);
    const range = findings.filter(f => ["sentence_complexity", "lexical_range"].includes(f.check_id));
    assert.ok(range.some(f => f.state !== "pass"),
      "the range checks pass on a text the teacher placed at A2 for exactly that reason");
    assert.equal(pflege.score(d.text, TASK).level, "A2");
  });
});
