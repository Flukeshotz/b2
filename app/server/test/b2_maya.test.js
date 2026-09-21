/**
 * MAYA — the conversation engine's guardrails.
 *
 * Two bugs found by running a weak, an adequate and a strong learner through
 * the engine, both of which made the partner look broken rather than demanding:
 *
 *   1. Thinness was measured by WORD COUNT, so "Ich brauche den Samstag frei,
 *      weil meine Schwester heiratet" — a reason and a concrete day in nine
 *      words — was pressed as if the learner had said nothing. Concision is not
 *      the B2 failure mode; saying nothing new is.
 *
 *   2. `adaptedToChange` aligned turn index with beat index. Every press keeps
 *      the learner on the same beat, so after one press the unexpected turn was
 *      assessed against something the learner had said two moves earlier — and
 *      a learner who never reached the unexpected beat was still recorded as
 *      having failed it.
 *
 * Both are permanent regressions: they are the difference between evidence we
 * observed and evidence we invented.
 */

const { test, describe } = require("node:test");
const assert = require("node:assert");

const maya = require("../src/b2/maya");
const scenario = require("../src/seed/b2/maya/schichttausch");

const run = (utterances) => {
  let state = { index: 0, pressCount: 0 };
  const turns = [], moves = [];
  for (const text of utterances) {
    const read = maya.readTurn(text);
    const move = maya.nextMove(scenario, state, read);
    turns.push({ text, beat: state.index });
    moves.push(move);
    if (move.done) break;
    state = move.state;
  }
  return { summary: maya.summarise(scenario, turns), moves, turns };
};

describe("Maya — reading a turn", () => {
  test("a short turn carrying a reason and a concrete day is not thin", () => {
    const r = maya.readTurn("Ich brauche den Samstag frei, weil meine Schwester heiratet.");
    assert.ok(r.words < 12, "fixture must be short, or it tests nothing");
    assert.deepStrictEqual(r.moves.sort(), ["detail", "reason"]);
    assert.strictEqual(r.thin, false);
  });

  test("a long turn that makes no move is still thin", () => {
    const r = maya.readTurn(
      "Also ja, ich meine, das ist eben so, und ich finde das auch wirklich sehr schwierig für mich.");
    assert.ok(r.words >= 12);
    assert.deepStrictEqual(r.moves, []);
    assert.strictEqual(r.thin, true);
  });

  test("a one-word answer is thin", () => {
    assert.strictEqual(maya.readTurn("Ja.").thin, true);
  });
});

describe("Maya — pressing", () => {
  test("she presses a learner who gives her nothing", () => {
    const { moves } = run(["Ich brauche frei."]);
    assert.strictEqual(moves[0].pressing, true);
  });

  test("she does NOT press an answer that already made two moves", () => {
    const { moves } = run(["Ich brauche den Samstag frei, weil meine Schwester heiratet."]);
    assert.strictEqual(moves[0].pressing, false,
      "pressing a correct concise answer makes the partner look obtuse");
  });
});

describe("Maya — evidence honesty", () => {
  const weak = [
    "Ich brauche frei.", "Ich weiß nicht.", "Bitte.", "Ok.", "Ja.",
  ];
  const holds = [
    "Ich brauche den Samstag frei, weil meine Schwester heiratet.",
    "Ich habe es erst gestern erfahren, deshalb komme ich jetzt.",
    "Ich könnte dafür den Sonntag übernehmen.",
    "Zwar ist der Dienstplan fest, aber ich frage Frau Krause, ob sie tauscht.",
  ];

  test("a learner who cannot maintain the conversation is told so", () => {
    const { summary } = run(weak);
    assert.strictEqual(summary.heldPosition, false);
    assert.match(summary.verdict, /nicht durchgehalten/);
  });

  test("a learner who never reached the unexpected turn generates NO react_unexpected evidence", () => {
    const { summary } = run(weak);
    assert.strictEqual(summary.reachedUnexpected, false);
    const caps = summary.evidence.map(e => e.capability);
    assert.ok(!caps.includes("react_unexpected"),
      "recording an outcome for a turn the learner never met invents evidence");
  });

  test("a learner who met the unexpected turn and answered it is credited", () => {
    const { summary } = run(holds);
    assert.strictEqual(summary.reachedUnexpected, true);
    assert.strictEqual(summary.adaptedToChange, true);
    const react = summary.evidence.find(e => e.capability === "react_unexpected");
    assert.strictEqual(react.outcome, 1);
  });

  test("presses shift the beats, and adaptation is still measured on the right turn", () => {
    // One thin opener, then the same competent answers. The unexpected beat now
    // falls a turn later; index-aligned code scored the wrong utterance.
    const { summary, turns } = run(["Ja.", ...holds]);
    const unexpected = scenario.beats.findIndex(b => b.unexpected);
    assert.ok(unexpected >= 0, "scenario must have an unexpected beat");
    const answered = turns.filter(t => t.beat === unexpected);
    assert.ok(answered.length >= 1, "learner should have reached the unexpected beat");
    assert.strictEqual(summary.adaptedToChange, true);
  });

  test("speaking evidence is never a band and stays at low weight", () => {
    const { summary } = run(holds);
    for (const e of summary.evidence) {
      assert.strictEqual(e.dimension, "speaking");
      assert.strictEqual(e.weight, 0.2, "speaking scoring is uncalibrated");
      assert.ok(!("band" in e));
    }
  });
});
