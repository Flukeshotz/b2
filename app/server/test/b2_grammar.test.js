/**
 * GRAMMAR — the use-checker, the gate, and whether `speculate` is real.
 *
 * The thing being measured is a communicative function, not a form: a condition
 * that did not hold and the consequence that therefore did not follow. So the
 * checker names its conditions one at a time, and every test below is either
 * "German that does this must be accepted" or "text that does not do this must
 * earn nothing".
 *
 * THE FAILURE MODE THIS SUITE EXISTS FOR was found in Experience 3: patterns
 * written from the author's sentence rather than from the language, which then
 * rejected better German than the model. This construction has more legitimate
 * shapes than any fixed expression does — wenn or no wenn, verb-first or
 * verb-final, main clause first or second, a prepositional condition instead of
 * a clause, a missing comma — so all of them are here.
 */

const { test, describe } = require("node:test");
const assert = require("node:assert");

const { checkUse, USE_CHECKS } = require("../src/b2/grammar");
const { gateSource } = require("../tools/gate_b2_source");
const src = require("../src/seed/b2/src_homeoffice");
const { EXPERIENCES } = require("../src/seed/b2/exp_homeoffice");

const KERSTIN =
  "Wäre die Regel im Team ausgehandelt worden, hätte ich sie wahrscheinlich mitgetragen";
const irr = (t, quote = KERSTIN) => checkUse("irrealis", t, { sourceSentence: quote });

describe("irrealis — German that does the job is accepted", () => {
  const GOOD = {
    "wenn + verb-final":
      "Wenn man uns rechtzeitig gefragt hätte, hätte ich der neuen Schichtplanung sofort zugestimmt.",
    "verb-first, no wenn":
      "Hätte man uns rechtzeitig gefragt, hätte ich der neuen Schichtplanung sofort zugestimmt.",
    "main clause first":
      "Ich hätte der Umstellung zugestimmt, wenn man uns vorher nach unseren Diensten gefragt hätte.",
    "passive + modal":
      "Wäre der Umbau früher angekündigt worden, hätten wir die Urlaubsplanung rechtzeitig ändern können.",
    "missing comma":
      "Hätte man uns gefragt hätte ich der neuen Schichtplanung sofort zugestimmt.",
    "fronted subordinate clause, prepositional condition":
      "Dass die Stelle so schnell besetzt wurde, wäre ohne die Empfehlung meiner Kollegin wohl nicht passiert.",
    "imperfect German, clear meaning":
      "Wenn man uns gefragt hätte, ich hätte die neue Schichtplanung akzeptiert ohne Problem.",
  };
  for (const [shape, text] of Object.entries(GOOD)) {
    test(shape, () => {
      const r = irr(text);
      assert.strictEqual(r.ok, true, `rejected: ${r.reasons.join(",")} — ${r.improve}`);
      assert.strictEqual(r.evidence[0].capability, "speculate");
      assert.strictEqual(r.evidence[0].outcome, 1);
    });
  }
});

describe("irrealis — what earns nothing", () => {
  test("a report of what happened is not a hypothetical", () => {
    const r = irr("Die Entscheidung wurde ohne uns getroffen und das fand ich damals wirklich schlecht.");
    assert.strictEqual(r.ok, false);
    assert.deepStrictEqual(r.evidence, []);
    assert.match(r.improve, /NICHT passiert/);
  });

  test("one half is not the move", () => {
    // A hypothetical about the past, but no condition and no consequence.
    const r = irr("Ich hätte das ehrlich gesagt ganz anders gemacht, wirklich.");
    assert.strictEqual(r.ok, false);
    assert.ok(!r.met.includes("relationship"));
    assert.deepStrictEqual(r.evidence, [], "half the move is not a demonstration of it");
  });

  test("the source sentence handed back earns nothing, however correct", () => {
    const r = irr(KERSTIN + ".");
    assert.strictEqual(r.ok, false);
    assert.deepStrictEqual(r.met, ["hypothetical", "relationship", "past"],
      "it is perfect German — that is exactly why the novelty check has to exist");
    assert.deepStrictEqual(r.evidence, []);
    assert.match(r.improve, /eigene Situation/);
  });

  test("marker spam does not satisfy the relationship", () => {
    // Four auxiliaries and no clauses. An earlier version scored this 0.6 for
    // `speculate`, because it counted markers instead of looking for halves.
    const r = irr("hätte wäre hätte wäre Fahrrad Kartoffel Bibliothek Regenschirm Sonnenschein Kaffeetasse.");
    assert.ok(!r.met.includes("relationship"));
    assert.deepStrictEqual(r.evidence, []);
  });

  test("markers on one side only are not two halves", () => {
    const r = irr("wäre hätte, Fahrrad Kartoffel Bibliothek Regenschirm Sonnenschein Kaffeetasse Fensterbank.");
    assert.deepStrictEqual(r.evidence, []);
  });
});

describe("irrealis — imperfect but meaningful is not zero", () => {
  test("the present irrealis demonstrates the capability and misses the tense", () => {
    const r = irr("Wenn man uns vorher fragen würde, würde ich der Umstellung sofort zustimmen.");
    assert.strictEqual(r.ok, false);
    assert.deepStrictEqual(r.reasons, ["past"]);
    assert.strictEqual(r.evidence.length, 1, "they speculated — that is the capability being measured");
    assert.strictEqual(r.evidence[0].capability, "speculate");
    assert.strictEqual(r.evidence[0].outcome, 0.6);
    assert.match(r.improve, /noch offen/);
  });

  test("partial credit never advances the ladder", () => {
    const r = irr("Wenn man uns vorher fragen würde, würde ich der Umstellung sofort zustimmen.");
    assert.strictEqual(r.stage, null,
      "evidence of the capability is not a demonstration that they can do it");
  });
});

describe("concede_first is its own function, not a flag", () => {
  const QUOTE = "Das stimmt ja alles. Nur – bei uns auf Station ist das eben nicht das Problem.";
  const con = (t) => checkUse("concede_first", t, { sourceSentence: QUOTE });

  test("concession then objection passes and routes to `concede`", () => {
    const r = con("Das stimmt natürlich, die Zahlen sprechen dafür. Nur löst eine feste Regel unser eigentliches Problem nicht.");
    assert.strictEqual(r.ok, true, r.reasons.join(","));
    assert.strictEqual(r.evidence[0].capability, "concede");
  });

  test("an objection with no concession is not the move", () => {
    const r = con("Eine feste Regel löst unser eigentliches Problem überhaupt nicht.");
    assert.strictEqual(r.ok, false);
    assert.deepStrictEqual(r.evidence, []);
  });

  test("the order is the move — conceding afterwards earns partial credit only", () => {
    const r = con("Aber das ist bei uns anders, obwohl die Zahlen natürlich für sich sprechen und stimmen.");
    assert.strictEqual(r.ok, false);
    assert.deepStrictEqual(r.reasons, ["order"]);
    assert.strictEqual(r.evidence[0].outcome, 0.6);
  });

  test("each check names its own capability", () => {
    assert.strictEqual(USE_CHECKS.irrealis.capability, "speculate");
    assert.strictEqual(USE_CHECKS.concede_first.capability, "concede");
  });

  test("an unknown check is refused rather than silently accepted", () => {
    assert.throws(() => checkUse("no_such_check", "irgendetwas"));
  });
});

describe("`speculate` is routed, not merely labelled", () => {
  const grammar = EXPERIENCES.find(e => e.id === "exp_homeoffice_irrealis");

  test("the experience exists and claims speculate", () => {
    assert.strictEqual(grammar.primary_capability, "speculate");
  });

  test("and it can only be completed by demonstrating it", () => {
    const uses = grammar.steps.filter(s => s.t === "guse");
    assert.ok(uses.length >= 1, "a capability with no production step is a label");
    for (const u of uses) {
      const check = USE_CHECKS[u.check || "irrealis"];
      assert.strictEqual(check.capability, "speculate");
    }
  });

  test("no step in it can be passed by manipulating somebody else's sentence", () => {
    const A1 = ["build", "spotmistake", "pick", "translate", "keypad", "race", "oddoneout", "soundmatch"];
    for (const s of grammar.steps) assert.ok(!A1.includes(s.t), `${s.t} is an A1 mechanic`);
  });

  test("a learner who forgets the terminology can still succeed", () => {
    // Nothing before the form card may use a grammatical term.
    const form = grammar.steps.findIndex(s => s.t === "gform");
    const TERMS = /konjunktiv|partizip|indikativ|nebensatz|plusquamperfekt/i;
    for (const s of grammar.steps.slice(0, form)) {
      const text = [s.q, ...(s.options || []), ...(s.lines || [])].filter(Boolean).join(" ");
      assert.ok(!TERMS.test(text), `terminology appears before the form is explained: ${text.slice(0, 60)}`);
    }
  });
});

describe("the grammar gate", () => {
  const bend = (mutate) => {
    const exps = EXPERIENCES.map(e => ({ ...e, steps: e.steps.map(s => ({ ...s })) }));
    mutate(exps.find(e => e.kind === "grammar"));
    return exps;
  };
  const fails = (exps, re) => {
    const f = gateSource(src, exps).fails;
    assert.ok(f.some(x => re.test(x)), f.join("; ") || "(no failures at all)");
  };

  test("the source passes as authored", () => {
    assert.deepStrictEqual(gateSource(src, EXPERIENCES).fails, []);
  });

  test("a construction with no communicative function is refused", () => {
    fails(bend(g => { delete g.function_de; }), /no `function_de`/);
  });

  test("a function stated in terminology is refused", () => {
    fails(bend(g => { g.function_de = "Den Konjunktiv II im Plusquamperfekt korrekt bilden und anwenden."; }),
      /stated in grammar terminology/);
  });

  test("explaining the form before any contrast is rule-first teaching", () => {
    fails(bend(g => {
      const i = g.steps.findIndex(s => s.t === "gform");
      const [form] = g.steps.splice(i, 1);
      g.steps.splice(1, 0, form);
    }), /rule-first teaching|before the learner has contrasted/);
  });

  test("stopping at recognition is refused", () => {
    fails(bend(g => { g.steps = g.steps.filter(s => s.t !== "guse"); }), /stops at recognition/);
  });

  test("no contrast is refused", () => {
    fails(bend(g => { g.steps = g.steps.filter(s => s.t !== "gcontrast"); }), /no CONTRAST/);
  });

  test("terminology in a noticing question is refused", () => {
    fails(bend(g => {
      const s = g.steps.find(x => x.t === "readq");
      s.q = "In welchem Satz steht der Konjunktiv II?";
    }), /grammar terminology/);
  });

  test("two identical variants are not a contrast", () => {
    fails(bend(g => {
      const c = g.steps.find(s => s.t === "gcontrast");
      c.variants = [{ label: "A", de: c.variants[0].de }, { label: "B", de: c.variants[0].de }];
    }), /identical/);
  });

  test("German quoted that is not in the source is refused", () => {
    fails(bend(g => { g.steps.find(s => s.t === "readq").quote = "Diesen Satz hat niemand geschrieben."; }),
      /not in the source/);
  });

  test("a prompt handing the learner a ready-made clause is refused", () => {
    fails(bend(g => {
      g.steps.find(s => s.t === "guse").context =
        "Sagen Sie, wie Sie reagiert hätten, wenn man Sie vorher gefragt hätte, bei irgendeiner Entscheidung.";
    }), /ready-made clause/);
  });

  test("an explanation that runs to a chapter is refused", () => {
    fails(bend(g => {
      g.steps.find(s => s.t === "gform").rule = "wort ".repeat(120);
    }), /keep it under 90/);
  });

  test("A1 mechanics in a B2 grammar experience are refused", () => {
    fails(bend(g => { g.steps.push({ t: "build", de: ["Das", "wäre", "gut"], en: "That would be good" }); }),
      /A1 mechanics/);
  });

  test("the gate reports rather than throws on malformed grammar steps", () => {
    for (const field of ["variants", "parts", "rule", "context", "options", "answer", "q"]) {
      const exps = bend(g => { for (const s of g.steps) delete s[field]; });
      const r = gateSource(src, exps);       // must not throw
      assert.ok(r.fails.length > 0, `removing ${field} produced no failure`);
    }
  });
});
