/**
 * EXPRESSIONS — production checking, evidence honesty, and the repetition ladder.
 *
 * The three failures these guard against, all of which the first version had:
 *
 *   1. String presence counted as production. A learner could paste
 *      "Nur folgt daraus doch nicht" in front of anything and be credited with
 *      making the move.
 *   2. Copying the source back earned evidence. The sentence passed the pattern
 *      and the frame, failed only novelty, and was recorded at 0.6 — so the
 *      recommender believed it had watched somebody produce German they had
 *      retyped.
 *   3. Every wrong tap on a three-option item posted its own negative row, so a
 *      learner working down the list generated two failures for one item.
 *
 * And the standing repetition rule: once production is demonstrated, that
 * expression never comes back as recognition.
 */

const { test, describe } = require("node:test");
const assert = require("node:assert");

const chunks = require("../src/b2/chunks");
const { BY_ID, EXPRESSIONS } = require("../src/seed/b2/chunks_homeoffice");
const src = require("../src/seed/b2/src_homeoffice");

const check = (id, text) => {
  const x = BY_ID.get(id);
  return chunks.checkProduction(x, text, { sourceSentence: x.occurrence });
};

describe("production is not string presence", () => {
  test("the expression pasted with nothing after it fails the frame", () => {
    const r = check("nur_folgt_daraus_nicht", "Nur folgt daraus doch nicht.");
    assert.strictEqual(r.ok, false);
    assert.ok(r.reasons.includes("frame_unfilled"));
    assert.deepStrictEqual(r.evidence, [], "an unfilled frame demonstrates nothing");
  });

  test("half of a two-part expression is not the expression", () => {
    const r = check("stoert_weniger_als", "Mich stört weniger die Arbeit.");
    assert.strictEqual(r.ok, false);
    assert.ok(r.reasons.includes("expression_absent"));
  });

  test("the wrong voice is a different move, not this one", () => {
    // "ich begründe das mit …" makes the justification your own — the exact
    // thing the passive in this expression avoids.
    const r = check("begruendet_wird_das_mit", "Ich begründe das mit dem Personalmangel auf der Station.");
    assert.strictEqual(r.ok, false);
    assert.ok(r.reasons.includes("expression_absent"));
  });

  test("the indirect question is part of the construction", () => {
    const bare = check("weiss_ich_allerdings_auch_nicht", "Ich weiß allerdings auch nicht, was man da machen soll.");
    assert.strictEqual(bare.ok, false);
    const framed = check("weiss_ich_allerdings_auch_nicht",
      "Ob ein zweiter Springer die Übergaben wirklich entlastet, weiß ich allerdings auch nicht.");
    assert.strictEqual(framed.ok, true);
  });
});

describe("copying is not producing", () => {
  test("handing the source sentence back fails and earns NOTHING", () => {
    const r = check("nur_folgt_daraus_nicht", "Nur folgt daraus doch nicht die Pflicht für alle.");
    assert.strictEqual(r.ok, false);
    assert.ok(r.reasons.includes("too_close_to_source"));
    assert.deepStrictEqual(r.evidence, [],
      "a retyped source sentence must not reach the recommender as production");
  });

  test("a short but genuinely own attempt still earns partial credit", () => {
    const x = BY_ID.get("stoert_weniger_als");
    const r = chunks.checkProduction(
      { ...x, minWords: 40 },                       // force `too_short` alone
      "Mich stört weniger die Anfahrt als der Zeitpunkt der Übergabe.",
      { sourceSentence: x.occurrence });
    assert.strictEqual(r.ok, false);
    assert.deepStrictEqual(r.reasons, ["too_short"]);
    assert.strictEqual(r.evidence.length, 1);
    assert.strictEqual(r.evidence[0].outcome, 0.6);
  });
});

describe("real production", () => {
  const good = {
    nur_folgt_daraus_nicht: "Die Krankenstände sind gestiegen, das stimmt. Nur folgt daraus doch nicht, dass wir wieder jeden Tag ins Büro fahren müssen.",
    stoert_weniger_als: "Mich stört weniger die Menge der Übergaben als der Zeitpunkt, zu dem sie stattfinden.",
    begruendet_wird_das_mit: "Begründet wird das mit dem Personalmangel, obwohl die Stellen seit Januar besetzt sind.",
    nicht_rundweg_ablehnen: "Ich will das gar nicht rundweg ablehnen, nur kommt die Umstellung ausgerechnet in der Urlaubszeit.",
    weiss_ich_allerdings_auch_nicht: "Ob ein zweiter Springer die Übergaben wirklich entlastet, weiß ich allerdings auch nicht.",
  };

  for (const [id, text] of Object.entries(good)) {
    test(`a real sentence with "${id}" passes and reaches the right capability`, () => {
      const r = check(id, text);
      assert.strictEqual(r.ok, true, r.reasons.join(","));
      assert.strictEqual(r.stage, "produced");
      assert.strictEqual(r.evidence.length, 1);
      assert.strictEqual(r.evidence[0].capability, BY_ID.get(id).capability);
      assert.strictEqual(r.evidence[0].outcome, 1);
      assert.strictEqual(r.evidence[0].dimension, "vocabulary");
    });
  }

  test("every expression's own source line satisfies its own pattern and frame", () => {
    for (const x of EXPRESSIONS) {
      assert.ok(src.SCRIPT.some(p => p.de.includes(x.occurrence)), `${x.id}: not in the source`);
      assert.ok(x.pattern.test(x.occurrence), `${x.id}: pattern misses its own line`);
      assert.ok(x.frame.test(x.occurrence), `${x.id}: frame misses its own line`);
    }
  });
});

describe("recognition is weaker than production, and one item is one row", () => {
  test("choosing correctly weighs less than writing it", () => {
    const x = BY_ID.get("nur_folgt_daraus_nicht");
    const chose = chunks.checkChoice(x, true);
    const made = check("nur_folgt_daraus_nicht",
      "Die Zahlen sind gestiegen, ja. Nur folgt daraus doch nicht, dass die Regelung schuld ist.");
    assert.ok(chose.evidence[0].weight < made.evidence[0].weight,
      "picking a move from three is a weaker signal than making it");
  });

  test("a correct choice yields exactly one row", () => {
    assert.strictEqual(chunks.checkChoice(BY_ID.get("stoert_weniger_als"), true).evidence.length, 1);
  });
});

describe("the ladder only climbs, and closes recognition behind it", () => {
  test("stages are ordered", () => {
    assert.deepStrictEqual(chunks.STAGES,
      ["heard", "noticed", "chosen", "produced", "defended", "examined"]);
  });

  test("recognition is allowed up to `chosen` and never after `produced`", () => {
    assert.strictEqual(chunks.allowsRecognition("heard"), true);
    assert.strictEqual(chunks.allowsRecognition("noticed"), true);
    assert.strictEqual(chunks.allowsRecognition("chosen"), true);
    assert.strictEqual(chunks.allowsRecognition("produced"), false);
    assert.strictEqual(chunks.allowsRecognition("defended"), false);
    assert.strictEqual(chunks.allowsRecognition("examined"), false);
  });

  test("higher() never moves an expression backwards", () => {
    assert.strictEqual(chunks.higher("produced", "chosen"), "produced");
    assert.strictEqual(chunks.higher("chosen", "produced"), "produced");
    assert.strictEqual(chunks.higher("produced", "produced"), "produced");
  });
});

/**
 * DEAD CONTROLS.
 *
 * `chunk` shipped live in b2_muede_chunks with a footer button that did
 * nothing: the component set the label "Verstanden", the lesson's handler found
 * the step was neither in NOCHECK nor answerable, and the learner could not get
 * past it. The experience was unfinishable for as long as it had been published.
 *
 * The invariant: a step whose component only sets a main button — that is, one
 * that never calls ctx.commit() — must be listed in NOCHECK, or its button is
 * dead. This reads the actual source files rather than a hand-kept list, so a
 * new consumption step added next month is covered without anybody remembering.
 */
const fs = require("node:fs");
const path = require("node:path");

describe("no step ships with a dead footer button", () => {
  const CLIENT = path.join(__dirname, "../../client/src");
  const lesson = fs.readFileSync(path.join(CLIENT, "screens/Lesson.jsx"), "utf8");
  const nocheck = new Set(
    (lesson.match(/const NOCHECK = \[([^\]]*)\]/)?.[1] || "")
      .split(",").map(s => s.trim().replace(/^"|"$/g, "")).filter(Boolean));
  const registry = fs.readFileSync(path.join(CLIENT, "components/steps/index.jsx"), "utf8");
  const body = registry.slice(registry.indexOf("const COMPONENTS"));
  const map = [...body.matchAll(/(\w+):\s*(\w+)[,\n]/g)].map(m => ({ step: m[1], comp: m[2] }));

  test("the registry was parsed", () => {
    assert.ok(map.length > 15, `only found ${map.length} step types`);
  });

  for (const { step, comp } of map) {
    const file = path.join(CLIENT, "components/steps", `${comp}.jsx`);
    if (!fs.existsSync(file)) continue;
    const srcTxt = fs.readFileSync(file, "utf8");
    const setsBtn = /ctx\.setMainBtn/.test(srcTxt);
    const commits = /ctx\.commit\(/.test(srcTxt);
    const advances = /ctx\.advance/.test(srcTxt);
    if (!setsBtn || commits || advances) continue;
    test(`"${step}" (${comp}) sets a footer button it never resolves, so it must be in NOCHECK`, () => {
      assert.ok(nocheck.has(step),
        `${comp} sets a main button but never calls ctx.commit() or ctx.advance(). ` +
        `Without "${step}" in Lesson.jsx's NOCHECK list that button does nothing ` +
        `and the lesson cannot be finished.`);
    });
  }
});

/**
 * IDIOMATIC VARIANTS.
 *
 * Every one of these is German a good B2 learner might well write instead of
 * the citation form, and every one was REJECTED by the first version of its
 * pattern, because the pattern had been written from the citation rather than
 * from the language:
 *
 *   „Ob Schichtarbeit krank macht, lässt sich nicht pauschal sagen“
 *       — fronted indirect question; the pattern demanded „das lässt sich“
 *   „Begründet wird die Regelung mit …“
 *       — any subject; the pattern demanded „das“
 *   „Daraus folgt aber nicht, dass …“
 *       — fronted adverb; the pattern demanded „folgt daraus“
 *   „Das lehne ich nicht rundweg ab“
 *       — separable finite verb; the pattern demanded the infinitive
 *
 * Punishing a learner for improving on the model is the fastest way to make a
 * checker feel arbitrary, and a learner who decides the checker is arbitrary
 * stops writing.
 */
describe("good German that is not the citation form still counts", () => {
  const muede = require("../src/seed/b2/chunks_muede");
  const at = (mod, id, text) => {
    const x = mod.BY_ID.get(id);
    return chunks.checkProduction(x, text, { sourceSentence: x.occurrence });
  };

  const VARIANTS = [
    [muede, "laesst_sich_nicht_pauschal_sagen",
      "Ob Schichtarbeit auf Dauer krank macht, lässt sich nicht pauschal sagen — es kommt darauf an, wie regelmäßig die Wechsel sind."],
    [{ BY_ID }, "begruendet_wird_das_mit",
      "Begründet wird die neue Regelung mit dem Personalmangel, obwohl die Stellen längst besetzt sind."],
    [{ BY_ID }, "nur_folgt_daraus_nicht",
      "Die Zahlen sind gestiegen, das bestreite ich nicht. Daraus folgt aber nicht, dass die Regelung schuld daran ist."],
    [{ BY_ID }, "nicht_rundweg_ablehnen",
      "Den Vorschlag lehne ich gar nicht rundweg ab, nur kommt er ausgerechnet in der Urlaubszeit."],
    [muede, "in_kauf_nehmen",
      "Die lange Anfahrt nehme ich in Kauf, weil die Station sonst genau die ist, auf der ich arbeiten wollte."],
  ];

  for (const [mod, id, text] of VARIANTS) {
    test(`${id} accepts an idiomatic variant`, () => {
      const r = at(mod, id, text);
      assert.strictEqual(r.ok, true, `rejected good German: ${r.reasons.join(",")}`);
    });
  }

  test("widening the patterns did not make them accept the wrong move", () => {
    // "ich begründe das mit …" makes the justification your own — still wrong.
    assert.strictEqual(at({ BY_ID }, "begruendet_wird_das_mit",
      "Ich begründe die neue Regelung mit dem Personalmangel auf der Station.").ok, false);
    // A refusal to generalise that says nothing about what it depends on.
    assert.strictEqual(at(muede, "laesst_sich_nicht_pauschal_sagen",
      "Also das lässt sich nicht pauschal sagen, finde ich ehrlich gesagt.").ok, false);
  });
});
