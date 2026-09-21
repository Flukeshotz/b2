/**
 * CONTENT-POINT DETECTION — the highest-impact check, and the one that was
 * nearly worthless.
 *
 * A flat alternation of surface strings scored 48% on forty adversarial B2
 * sentences: 14 false negatives, 7 false positives. `content_points` is the
 * check the Goethe rubric weighs most heavily and the one the weakness selector
 * therefore reaches for first, so a coin-flip detector was sending learners to
 * the wrong lesson about the most important thing.
 *
 * The rule engine replaced it: signal FAMILIES (inversion, nominal causality,
 * marker-free narration each get their own pattern), sentence ANCHORS (the
 * marker and the topic must be in the same breath), sentence-level
 * DISQUALIFIERS, and a two-sentence window where the move genuinely spans one.
 *
 * WHAT THIS SUITE PROTECTS, in order of importance:
 *   1. no false positives — never tell a learner they covered what they did not
 *   2. the held-out floor — a fresh batch, never tuned against, is the only
 *      honest measure; the tuned batch scoring 100% is overfit by construction
 *   3. the `unsure` state — the residual errors are semantic, so the system has
 *      to be able to say "we cannot read this" instead of guessing
 */

const { test, describe } = require("node:test");
const assert = require("node:assert");

const { matchPoint, analyse } = require("../src/b2/analyse");
const { CONTENT_POINTS } = require("../src/seed/b2/content_points_g04");
const corpus = require("../src/b2/teacher/content_points_g04.json");

const ruleFor = (id) => CONTENT_POINTS.find(p => p.id === id);
const score = (filter) => {
  let ok = 0, n = 0, fp = 0, fn = 0;
  for (const c of corpus.cases.filter(filter)) {
    const got = matchPoint(c.de, ruleFor(c.point)).ok;
    n++;
    if (got === c.expect) ok++;
    else if (got) fp++; else fn++;
  }
  return { ok, n, fp, fn, pct: n ? ok / n : 1 };
};

describe("the adversarial corpus", () => {
  test("is big enough and balanced enough to mean something", () => {
    assert.ok(corpus.cases.length >= 80, `only ${corpus.cases.length} cases`);
    for (const id of ["meinung", "begruendung", "bezug", "beispiel"]) {
      const cs = corpus.cases.filter(c => c.point === id);
      assert.ok(cs.filter(c => c.expect).length >= 5, `${id}: too few positives`);
      assert.ok(cs.filter(c => !c.expect).length >= 3, `${id}: too few negatives`);
    }
  });

  /* THE RULE THAT MATTERS MOST. A false positive tells a learner they covered a
     Leitpunkt they did not, which is the one error that cannot be recovered
     from — they never learn they missed it, and the exam does not forgive it. */
  test("NO false positives anywhere in the corpus", () => {
    const r = score(() => true);
    assert.strictEqual(r.fp, 0, `${r.fp} false positive(s)`);
  });

  test("held-out batch 3 stays above 70% — the only untuned measure", () => {
    const r = score(c => c.batch === 3);
    assert.ok(r.n >= 20, `held-out batch too small: ${r.n}`);
    assert.ok(r.pct >= 0.70,
      `held-out accuracy fell to ${(r.pct * 100).toFixed(0)}% (${r.ok}/${r.n}). ` +
      `The tuned batches scoring 100% is overfit by construction and proves nothing.`);
  });

  test("overall accuracy stays above 85%", () => {
    const r = score(() => true);
    assert.ok(r.pct >= 0.85, `${(r.pct * 100).toFixed(0)}% (${r.ok}/${r.n})`);
  });

  test("the old flat detector really was this bad — the change was necessary", () => {
    /* Kept as a floor: if somebody replaces the rules with a single alternation
       again, this is what they are choosing. */
    const OLD = {
      meinung: "(meiner meinung nach|ich finde|ich denke|ich glaube|ich halte|ich bin (der (meinung|ansicht)|daf(ü|ue)r|dagegen)|aus meiner sicht|meines erachtens|ich w(ü|ue)rde)",
      begruendung: "(weil|denn|deshalb|deswegen|daher|n(ä|ae)mlich|aus diesem grund|der grund daf(ü|ue)r|begr(ü|ue)ndet)",
      bezug: "(kerstin|tobi|reinhardt|nadja|@|wie .{0,20}schreibt|dem .{0,25}stimme ich|da hat .{0,20}recht)",
      beispiel: "(zum beispiel|beispielsweise|bei uns|in meinem (team|betrieb|beruf)|letzte[ns]|neulich|als ich|ich selbst)",
    };
    let ok = 0;
    for (const c of corpus.cases) {
      if (new RegExp(OLD[c.point], "i").test(c.de) === c.expect) ok++;
    }
    const oldPct = ok / corpus.cases.length;
    const newPct = score(() => true).pct;
    assert.ok(newPct > oldPct + 0.2,
      `the rule engine (${(newPct * 100).toFixed(0)}%) must clearly beat the old ` +
      `detector (${(oldPct * 100).toFixed(0)}%) or it is not worth its complexity`);
  });
});

describe("patterns that can never fire", () => {
  /* JavaScript's \b is defined on ASCII word characters, so "\b(ü…" matches
     nothing: there is no boundary between a space and "ü". Every umlaut-initial
     alternative behind a leading \b was silently dead, and a pattern that never
     fires is indistinguishable from a learner who never wrote it. */
  test("no pattern puts \\b immediately before an umlaut", () => {
    for (const p of CONTENT_POINTS) {
      for (const re of [...(p.any || []), ...(p.none || []), ...(p.anchors || [])]) {
        assert.ok(!/\\b\(?[äöüßÄÖÜ]/.test(re),
          `${p.id}: "\\b" before an umlaut can never match — ${re.slice(0, 60)}`);
      }
    }
  });

  test("every pattern compiles", () => {
    for (const p of CONTENT_POINTS) {
      for (const re of [...(p.any || []), ...(p.none || []), ...(p.anchors || [])]) {
        assert.doesNotThrow(() => new RegExp(re, "i"), `${p.id}: ${re.slice(0, 50)}`);
      }
    }
  });

  test("every `any` pattern earns its place — none is dead across the corpus", () => {
    for (const p of CONTENT_POINTS) {
      const positives = corpus.cases.filter(c => c.point === p.id && c.expect).map(c => c.de);
      for (const re of p.any) {
        const fires = positives.some(t => new RegExp(re, "i").test(t));
        assert.ok(fires, `${p.id}: this pattern matches nothing in the corpus — ${re.slice(0, 60)}`);
      }
    }
  });
});

describe("sentence boundaries", () => {
  const rule = ruleFor("begruendung");

  test("a colon does not cut a thought in half", () => {
    assert.strictEqual(
      matchPoint("Der wichtigste Punkt dafür ist die Konzentration: zu Hause schaffe ich mehr.", rule).ok,
      true, "splitting at the colon hid the first person from the reason");
  });

  test("an initial is not a sentence end", () => {
    assert.strictEqual(
      matchPoint("Nadja W. hat recht, dass man die ersten Monate anders regeln kann.", ruleFor("bezug")).ok,
      true, '"Nadja W." was being split into two sentences');
  });

  test("a real sentence break still separates unrelated clauses", () => {
    /* The scoping has to still work, or the anchors stop meaning anything. */
    assert.strictEqual(
      matchPoint("Eine Kollegin konnte nicht kommen, weil ihr Zug ausgefallen war. Sonst habe ich dazu nichts zu sagen.", rule).ok,
      false);
  });
});

describe("the window is per rule, not global", () => {
  test("reference and stance may be two sentences apart", () => {
    assert.strictEqual(ruleFor("bezug").window, 2);
    assert.strictEqual(matchPoint(
      "Kerstin_M schreibt, an ihrem Bürotag fehlten genau die Kollegen. Da stimme ich ihr zu.",
      ruleFor("bezug")).ok, true);
  });

  test("a one-sentence rule cannot borrow the next sentence's topic", () => {
    /* If begruendung had a wide window, this would pass by taking "weil" from
       the first sentence and the topic from the second. */
    assert.ok(!ruleFor("begruendung").window || ruleFor("begruendung").window === 1);
    assert.strictEqual(matchPoint(
      "Eine Kollegin konnte nicht kommen, weil ihr Zug ausgefallen war. Die Anwesenheitspflicht ist ein anderes Thema.",
      ruleFor("begruendung")).ok, false);
  });
});

describe("unsure is a state, not a verdict", () => {
  const task = { task_type: "forumsbeitrag", target_words: 180, content_points: CONTENT_POINTS };

  test("a signal blocked only by an anchor is unsure, not missing", () => {
    const m = matchPoint(
      "Da die Aufgaben ohnehin digital verteilt werden, spielt der Ort kaum eine Rolle.",
      ruleFor("begruendung"));
    assert.strictEqual(m.state, "unsure");
    assert.ok(m.sentence, "an unsure verdict must name the sentence it could not read");
  });

  test("an unsure point is never counted against the learner", () => {
    const withUnsure = analyse(
      "Meiner Meinung nach ist die Pflicht falsch. Da die Aufgaben ohnehin digital verteilt " +
      "werden, spielt der Ort kaum eine Rolle. Kerstin_M hat recht, dem stimme ich zu. " +
      "Bei uns läuft das seit zwei Jahren ohne feste Tage.", task);
    const f = withUnsure.findings.find(x => x.check_id === "content_points");
    assert.notStrictEqual(f.state, "fail",
      "a point we cannot read must not fail the learner");
    assert.ok(withUnsure.metrics.unsurePoints.length > 0);
  });

  test("a covered point names the sentence that satisfied it", () => {
    const m = matchPoint("Meiner Meinung nach ist eine feste Anwesenheitspflicht der falsche Weg.",
      ruleFor("meinung"));
    assert.strictEqual(m.state, "covered");
    assert.ok(m.sentence && m.signal, "a verdict a reviewer cannot check is not auditable");
  });

  test("legacy string detectors still work unchanged", () => {
    const m = matchPoint("Ich finde das gut.", { id: "x", detector: "(ich finde)" });
    assert.strictEqual(m.ok, true);
    assert.strictEqual(m.state, "covered");
    assert.strictEqual(matchPoint("Nichts davon.", { id: "x", detector: "(ich finde)" }).state, "missing");
  });
});
