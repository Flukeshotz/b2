/**
 * READING — the gates that keep a reading source from becoming a quiz.
 *
 * The reading experience type exists because "read this and answer five
 * multiple-choice questions" is a B1 task. Three of the rules below are the
 * ones that could quietly rot back into that, and one is a bug the gate itself
 * had:
 *
 *   — a reading source with no implication/intention item is pure retrieval
 *   — an attribute item whose option is not a poster in the thread has an
 *     answer key pointing at nobody
 *   — a stance or relation item that quotes nothing asks about a sentence the
 *     learner cannot find
 *   — CLINICAL matched "sondern", because `sonde` carried a trailing \w*. An
 *     ordinary German conjunction was blocking sources for requiring clinical
 *     knowledge.
 */

const { test, describe } = require("node:test");
const assert = require("node:assert");

const { gateSource } = require("../tools/gate_b2_source");
const src = require("../src/seed/b2/src_homeoffice");
const { EXPERIENCES } = require("../src/seed/b2/exp_homeoffice");

const clone = (o) => JSON.parse(JSON.stringify(o));
const readingSteps = (exps) => exps.find(e => e.kind === "reading").steps;

describe("the reading source itself", () => {
  test("passes every gate", () => {
    const r = gateSource(src, EXPERIENCES);
    assert.deepStrictEqual(r.fails, []);
  });

  test("is declared as a text source with no delivery difficulty", () => {
    assert.strictEqual(src.KIND, "text");
    assert.deepStrictEqual(src.DECLARATION.difficulty.delivery, [],
      "a text has no delivery — claiming any would take complexity credit for nothing");
  });

  test("every attribute option names somebody who actually posted", () => {
    const handles = new Set(src.VOICES.map(v => v.handle));
    for (const s of readingSteps(EXPERIENCES)) {
      if (s.t === "readq" && s.mode === "attribute")
        for (const o of s.options) assert.ok(handles.has(o), `"${o}" is not in the thread`);
    }
  });

  test("every quoted sentence occurs verbatim in the text", () => {
    for (const s of readingSteps(EXPERIENCES)) {
      if (s.quote) assert.ok(src.SCRIPT.some(p => p.de.includes(s.quote)),
        `not in the text: "${s.quote}"`);
    }
  });
});

describe("gate — retrieval is not B2 reading", () => {
  test("a reading experience with no implication or intention item is blocked", () => {
    const exps = clone(EXPERIENCES);
    const reading = exps.find(e => e.kind === "reading");
    reading.steps = reading.steps.filter(
      s => !(s.t === "readq" && ["implication", "intention"].includes(s.mode)));
    const r = gateSource(src, exps);
    assert.ok(r.fails.some(f => /implication or intention/.test(f)), r.fails.join("; "));
  });

  test("an attribute option that is not a poster is blocked", () => {
    const exps = clone(EXPERIENCES);
    const s = readingSteps(exps).find(x => x.mode === "attribute");
    s.options[0] = "someone_who_never_posted";
    const r = gateSource(src, exps);
    assert.ok(r.fails.some(f => /not a poster in this thread/.test(f)), r.fails.join("; "));
  });

  test("a stance item with no quote is blocked", () => {
    const exps = clone(EXPERIENCES);
    delete readingSteps(exps).find(x => x.mode === "stance").quote;
    const r = gateSource(src, exps);
    assert.ok(r.fails.some(f => /must quote the sentence/.test(f)), r.fails.join("; "));
  });

  test("a quote that is not in the text is blocked", () => {
    const exps = clone(EXPERIENCES);
    readingSteps(exps).find(x => x.mode === "stance").quote = "Diesen Satz hat niemand geschrieben.";
    const r = gateSource(src, exps);
    assert.ok(r.fails.some(f => /does not occur in the text/.test(f)), r.fails.join("; "));
  });

  test("an item that measures no capability is blocked", () => {
    const exps = clone(EXPERIENCES);
    delete readingSteps(exps)[2].capability;
    const r = gateSource(src, exps);
    assert.ok(r.fails.some(f => /no capability/.test(f)), r.fails.join("; "));
  });
});

describe("gate — kein Fachwissen, without false positives", () => {
  test('"sondern" is ordinary German and must not read as clinical', () => {
    const exps = clone(EXPERIENCES);
    const s = readingSteps(exps).find(x => x.mode === "implication");
    s.options[0] = "Nicht die Regel stört sie, sondern das Verfahren.";
    const r = gateSource(src, exps);
    assert.ok(!r.fails.some(f => /clinical knowledge/.test(f)), r.fails.join("; "));
  });

  test("a genuinely clinical item is still blocked", () => {
    const exps = clone(EXPERIENCES);
    const s = readingSteps(exps).find(x => x.mode === "implication");
    s.options[0] = "Weil die Magensonde neu gelegt werden musste.";
    const r = gateSource(src, exps);
    assert.ok(r.fails.some(f => /clinical knowledge/.test(f)), r.fails.join("; "));
  });
});

/**
 * The expression gates. Every rule below is a way a word list gets back in
 * wearing a chunk's clothes.
 */
describe("gate — an expression is a move, not a word", () => {
  const withExpr = (mutate) => {
    const list = src.CHUNKS.EXPRESSIONS.map(x => ({ ...x }));
    mutate(list);
    return { ...src, CHUNKS: { EXPRESSIONS: list, BY_ID: new Map(list.map(x => [x.id, x])) } };
  };
  const fails = (s, re) => {
    const f = gateSource(s, EXPERIENCES).fails;
    assert.ok(f.some(x => re.test(x)), f.join("; ") || "(no failures at all)");
  };

  test("an expression not in the source is blocked", () => {
    fails(withExpr(l => { l[0].occurrence = "Diesen Satz hat niemand geschrieben."; }),
      /occurrence is not in the source/);
  });

  test("an isolated word is not a chunk", () => {
    fails(withExpr(l => { l[0].citation = "Anwesenheitspflicht"; }),
      /single word or two is not a chunk/);
  });

  test("a duplicate expression is blocked", () => {
    fails(withExpr(l => { l[1].citation = l[0].citation; }),
      /duplicate expression/);
  });

  test("an expression with no capability is blocked", () => {
    fails(withExpr(l => { delete l[0].capability; }), /no capability/);
  });

  test("an expression with no frame is blocked — production would be mechanical", () => {
    fails(withExpr(l => { delete l[0].frame; }),
      /no frame — without one, production is satisfied by pasting/);
  });

  test("a frame identical to the pattern checks nothing and is blocked", () => {
    fails(withExpr(l => { l[0].frame = l[0].pattern; }), /frame is identical to pattern/);
  });

  test("a frame its own source line does not demonstrate is blocked", () => {
    fails(withExpr(l => { l[0].frame = /niemals irgendwo/; }),
      /frame does not match the line it came from/);
  });

  test("a translation in place of a function description is blocked", () => {
    fails(withExpr(l => { l[0].does = "means: the reason is"; }), /no `does`/);
  });
});

describe("gate — a choice item is a situation, not a gap", () => {
  const withSteps = (mutate) => {
    const exps = EXPERIENCES.map(e => ({ ...e, steps: e.steps.map(s => ({ ...s })) }));
    mutate(exps.find(e => e.kind === "vocabulary").steps);
    return exps;
  };
  const fails = (exps, re) => {
    const f = gateSource(src, exps).fails;
    assert.ok(f.some(x => re.test(x)), f.join("; ") || "(no failures at all)");
  };

  test("a choice item with no situation is blocked", () => {
    fails(withSteps(st => { delete st.find(s => s.t === "chunk_choose").situation; }),
      /no situation — a gap-fill is not a judgement item/);
  });

  test("an out-of-range answer key is blocked", () => {
    fails(withSteps(st => { st.find(s => s.t === "chunk_choose").answer = 9; }),
      /answer index 9 is out of range/);
  });

  test("a production step with no situation to write about is blocked", () => {
    fails(withSteps(st => { delete st.find(s => s.t === "chunk_produce").context; }),
      /production step has no situation/);
  });

  test("producing an expression the learner was never shown is blocked", () => {
    fails(withSteps(st => {
      // remove the notice for the first thing they are asked to produce
      const p = st.find(s => s.t === "chunk_produce");
      const i = st.findIndex(s => s.t === "notice" && s.ex === p.ex);
      st.splice(i, 1);
    }), /before showing it to them/);
  });

  test("a vocabulary experience that never asks for production is blocked", () => {
    fails(withSteps(st => {
      for (let i = st.length - 1; i >= 0; i--) if (st[i].t === "chunk_produce") st.splice(i, 1);
    }), /never asks the learner to produce anything/);
  });
});

describe("the gate reports rather than throws", () => {
  /* A gate that crashes on malformed content surfaces ONE problem and hides
     every other one, which is exactly backwards for a reviewer trying to fix a
     source. It found this the hard way: a missing `situation` threw while
     building a dedupe key, so the author saw a stack trace instead of the four
     other things wrong with their file. */
  const FIELDS = ["q", "options", "explain", "answer", "situation", "capability", "quote"];
  for (const field of FIELDS) {
    test(`a step missing \`${field}\` is reported, not thrown`, () => {
      const exps = EXPERIENCES.map(e => ({ ...e, steps: e.steps.map(s => ({ ...s })) }));
      for (const e of exps) for (const s of e.steps) {
        if (["chunk_choose", "readq", "chunk_produce", "notice"].includes(s.t)) delete s[field];
      }
      const r = gateSource(src, exps);   // must not throw
      assert.ok(r.fails.length > 0, `removing ${field} produced no failure at all`);
    });
  }
});
