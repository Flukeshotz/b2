/**
 * THE WRITING LOOP — one weakness, a route that exists, and a rewrite that has
 * to actually fix the thing it was taught.
 *
 * The product claim being defended here is narrow and testable:
 *
 *     a learner writes something real, is told ONE thing holding it back,
 *     practises that thing, rewrites, and can see they wrote better German.
 *
 * Every rule below is a way that claim could quietly become false — a weakness
 * we cannot teach, a rewrite counted as a fresh essay, a capability awarded for
 * pressing submit.
 */

const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");

require("../src/env")();
const pool = require("../src/db/pool");
const loop = require("../src/b2/writing_loop");
const tasksMod = require("../src/b2/task_profiles");
const caps = require("../src/b2/capabilities");

const TASK = {
  id: "g04_homeoffice_thread", task_type: "forumsbeitrag", board: "goethe", target_words: 180,
  content_points: [
    { id: "meinung", label_de: "Position", detector: "(meiner meinung nach|ich finde)" },
    { id: "begruendung", label_de: "Begründung", detector: "(weil|denn|deshalb)" },
  ],
};
const impact = tasksMod.profileFor("forumsbeitrag").impact;

/* Routes as published content actually provides them, so the tests describe the
   real system rather than a fixture of it. */
let routes = null, live = false;
before(async () => {
  try { await pool.query("SELECT 1"); live = true; } catch { return; }
  routes = await loop.routesFor();
});
after(async () => { if (live) await pool.end(); });
const needsDb = (t) => { if (!live) { t.skip("no database reachable"); return true; } return false; };

const FLAT = "Ich finde Homeoffice gut. Ich arbeite gern zu Hause. Das Büro ist laut. " +
  "Ich bin dann produktiver. Meine Kollegen sind zufrieden. Das ist meine Meinung. " +
  "Ich mag Homeoffice. Es ist praktisch. Ich spare Zeit. Die Fahrt ist lang.";

describe("routes are derived from live content, never hardcoded", () => {
  test("a writing experience is never a route for a writing weakness", async (t) => {
    if (needsDb(t)) return;
    for (const [, r] of routes) {
      assert.notStrictEqual(r.experienceKind, "writing",
        "sending a learner whose writing is weak back to the writing task repeats " +
        "the diagnosis instead of teaching");
    }
  });

  test("coverage checks always have a route, because the fix is information", async (t) => {
    if (needsDb(t)) return;
    assert.strictEqual(routes.get("word_count").kind, "coverage");
    assert.strictEqual(routes.get("content_points").kind, "coverage");
  });

  test("every experience route points at a published topic", async (t) => {
    if (needsDb(t)) return;
    for (const [check, r] of routes) {
      if (r.kind !== "experience") continue;
      assert.ok(r.topicId, `${check} routes to an experience with no published topic`);
    }
  });
});

describe("one weakness, and only one we can teach", () => {
  test("a weakness with no learning route is never surfaced", () => {
    const findings = [
      { check_id: "nvv", state: "fail", detail: "", evidence: [] },
      { check_id: "register", state: "fail", detail: "", evidence: [] },
    ];
    const pick = loop.selectWeakness(findings, { routes: new Map(), impact, text: FLAT });
    assert.strictEqual(pick.finding, null);
    assert.strictEqual(pick.none, "no_route");
    assert.deepStrictEqual(pick.unroutable.sort(), ["nvv", "register"]);
  });

  test("`no_route` and `nothing_wrong` are different answers", () => {
    const clean = loop.selectWeakness(
      [{ check_id: "word_count", state: "pass", detail: "", evidence: [] }],
      { routes: new Map(), impact, text: FLAT });
    assert.strictEqual(clean.none, "nothing_wrong",
      "a text with nothing wrong is praise; a text we cannot help with is our limitation");
  });

  test("the rubric's weighting beats raw severity", () => {
    // Both fail. content_points is what Goethe penalises hardest; konjunktiv2 is
    // a narrow range marker. Severity alone would tie and pick alphabetically.
    const findings = [
      { check_id: "konjunktiv2", state: "fail", detail: "", evidence: [] },
      { check_id: "content_points", state: "fail", detail: "", evidence: [] },
    ];
    const r = new Map([["konjunktiv2", { kind: "experience", topicId: "x" }],
                       ["content_points", loop.COVERAGE_CHECKS.content_points]]);
    const pick = loop.selectWeakness(findings, { routes: r, impact, text: FLAT });
    assert.strictEqual(pick.finding.check_id, "content_points");
    assert.match(pick.reason, /what this task is marked on/);
  });

  test("a fail always beats a warn", () => {
    const findings = [
      { check_id: "connector_range", state: "warn", detail: "", evidence: [] },
      { check_id: "lexical_range", state: "fail", detail: "", evidence: [] },
    ];
    const r = new Map([["connector_range", { kind: "experience", topicId: "a" }],
                       ["lexical_range", { kind: "experience", topicId: "b" }]]);
    assert.strictEqual(
      loop.selectWeakness(findings, { routes: r, impact, text: FLAT }).finding.check_id, "lexical_range");
  });

  test("selection is deterministic — the same text never rotates its weakness", () => {
    const { findings, profile } = tasksMod.assessForTask(FLAT, TASK);
    const r = new Map(Object.entries({ connector_range: { kind: "experience", topicId: "a" } }));
    const runs = new Set();
    for (let i = 0; i < 5; i++) {
      runs.add(loop.selectWeakness(findings, { routes: r, impact: profile.impact, text: FLAT }).finding?.check_id);
    }
    assert.strictEqual(runs.size, 1, "artificial rotation would make feedback untrustworthy");
  });

  test("a check the learner recently passed is deprioritised but not excluded", () => {
    const findings = [
      { check_id: "connector_range", state: "fail", detail: "", evidence: [] },
      { check_id: "lexical_range", state: "fail", detail: "", evidence: [] },
    ];
    const r = new Map([["connector_range", { kind: "experience", topicId: "a" }],
                       ["lexical_range", { kind: "experience", topicId: "b" }]]);
    const normal = loop.selectWeakness(findings, { routes: r, impact, text: FLAT });
    assert.strictEqual(normal.finding.check_id, "connector_range");

    const stale = loop.selectWeakness(findings, {
      routes: r, impact, text: FLAT, recentlyPassed: new Set(["connector_range"]) });
    assert.strictEqual(stale.finding.check_id, "lexical_range");

    // And if it is the ONLY thing wrong, it comes back.
    const only = loop.selectWeakness([findings[0]], {
      routes: r, impact, text: FLAT, recentlyPassed: new Set(["connector_range"]) });
    assert.strictEqual(only.finding.check_id, "connector_range",
      "one good text does not make a weakness disappear");
  });
});

describe("the learner is shown their own sentence", () => {
  test("connector_range points at a sentence that joins nothing", () => {
    const s = loop.locate(FLAT, { check_id: "connector_range", evidence: [] });
    assert.ok(s, "no sentence located");
    assert.ok(!/\b(weil|denn|obwohl|trotzdem|deshalb)\b/i.test(s));
  });

  test("lexical_range locates by absence when there is nothing to quote", () => {
    const s = loop.locate(FLAT, { check_id: "lexical_range", evidence: [] });
    assert.ok(s && FLAT.includes(s));
  });

  test("a finding we cannot locate returns null rather than a guess", () => {
    assert.strictEqual(loop.locate(FLAT, { check_id: "content_points", evidence: [] }), null,
      "you cannot point at something that is missing from the text");
  });
});

describe("improvement is measured on the targeted feature only", () => {
  const withConnectors = FLAT
    .replace("Ich bin dann produktiver.", "Ich bin dann produktiver, weil zu Hause niemand hereinkommt.")
    .replace("Das Büro ist laut.", "Obwohl das Büro zentral liegt, ist es sehr laut.");

  test("a rewrite that fixes the targeted check counts", () => {
    const c = loop.compare(FLAT, withConnectors, "connector_range", TASK);
    assert.strictEqual(c.improved, true);
    assert.ok(c.measureAfter > c.measureBefore);
  });

  test("a rewrite that improved everything EXCEPT the target does not count", () => {
    // Longer and richer, but not one new connector category.
    const longer = FLAT + " " + FLAT;
    const c = loop.compare(FLAT, longer, "connector_range", TASK);
    assert.strictEqual(c.improved, false);
    assert.strictEqual(c.reason, "unchanged");
  });

  test("a measurable move that still does not pass is still an improvement", () => {
    const c = loop.compare(FLAT, withConnectors, "connector_range", TASK);
    assert.ok(["state_improved", "measure_improved"].includes(c.reason));
  });
});

describe("language_awareness is earned, never assigned", () => {
  const improved = { improved: true, reason: "state_improved" };

  test("a first attempt can never earn it", () => {
    assert.deepStrictEqual(
      loop.awarenessEvidence(improved, { isRewrite: false, targetedCheck: "connector_range" }), []);
  });

  test("a rewrite that did not fix its target earns nothing", () => {
    assert.deepStrictEqual(
      loop.awarenessEvidence({ improved: false, reason: "unchanged" },
        { isRewrite: true, targetedCheck: "connector_range" }), []);
  });

  test("a rewrite with no targeted check earns nothing", () => {
    assert.deepStrictEqual(
      loop.awarenessEvidence(improved, { isRewrite: true, targetedCheck: null }), [],
      "without a target there is nothing to have noticed and corrected");
  });

  test("a rewrite that fixed its target earns it, at writing", () => {
    const [e] = loop.awarenessEvidence(improved, { isRewrite: true, targetedCheck: "connector_range" });
    assert.strictEqual(e.capability, "language_awareness");
    assert.strictEqual(e.dimension, "writing");
    assert.strictEqual(e.outcome, 1);
  });

  test("a partial move earns partial credit", () => {
    const [e] = loop.awarenessEvidence({ improved: true, reason: "measure_improved" },
      { isRewrite: true, targetedCheck: "connector_range" });
    assert.strictEqual(e.outcome, 0.7);
  });
});

describe("task awareness is not regressed by any of this", () => {
  test("a Goethe Forumsbeitrag with Leitpunkte is scored on covering them", () => {
    const { findings, suppressed } = tasksMod.assessForTask(FLAT, TASK);
    assert.ok(findings.some(f => f.check_id === "content_points"),
      "Goethe's Schreiben Aufgabe 1 prints its Leitpunkte — suppressing the check " +
      "on the assumption that a forum topic is open marks the wrong thing");
    assert.ok(!suppressed.some(s => s.check === "content_points"));
  });

  test("a Forumsbeitrag with no Leitpunkte is not marked on coverage", () => {
    const { findings } = tasksMod.assessForTask(FLAT, { ...TASK, content_points: [] });
    assert.ok(!findings.some(f => f.check_id === "content_points"),
      "a check with nothing to measure is omitted, not passed");
  });

  test("telc Pflege still counts information, not content points, and only once", () => {
    const { findings } = tasksMod.assessForTask(
      "Herr Kremer wurde heute um 14:30 Uhr nach einem Sturz aufgenommen.",
      { task_type: "aufnahmebericht", target_words: 120,
        content_points: [{ id: "a", label_de: "Name", detector: "kremer" }] });
    const ids = findings.map(f => f.check_id);
    assert.ok(ids.includes("information_coverage"));
    assert.ok(!ids.includes("content_points"), "the same gap must not be reported twice under two names");
  });

  test("every suppression carries a name and a genre reason", () => {
    for (const type of ["forumsbeitrag", "halbformelle_email", "aufnahmebericht"]) {
      const { suppressed } = tasksMod.assessForTask(FLAT, { task_type: type, target_words: 150 });
      for (const s of suppressed) {
        assert.ok(s.check, "a suppression with no check name prints an empty row for the reviewer");
        assert.ok(s.why && s.why.length > 20, `${type}/${s.check} has no genre reason`);
      }
    }
  });
});

/**
 * THE GATE for writing experiences. A writing experience that assesses and
 * stops is a score screen; the rules below are the ways it could become one
 * again without anybody noticing.
 */
describe("the writing gate", () => {
  const { gateSource, setKnownTasks } = require("../tools/gate_b2_source");
  const src = require("../src/seed/b2/src_homeoffice");
  const { EXPERIENCES } = require("../src/seed/b2/exp_homeoffice");

  before(async () => {
    if (!live) return;
    const { rows } = await pool.query(
      `SELECT t.id, t.prompt_de, t.content_points, t.target_words, r.board, r.task_type
         FROM b2_tasks t JOIN b2_rubrics r ON r.id=t.rubric_id`);
    setKnownTasks(Object.fromEntries(rows.map(r => [r.id, r])));
  });

  const bend = (mutate) => {
    const exps = EXPERIENCES.map(e => ({ ...e, steps: e.steps.map(s => ({ ...s })) }));
    mutate(exps.find(e => e.kind === "writing"));
    return exps;
  };
  const fails = (exps, re) => {
    const f = gateSource(src, exps).fails;
    assert.ok(f.some(x => re.test(x)), f.join("; ") || "(no failures at all)");
  };

  test("the source passes as authored", (t) => {
    if (needsDb(t)) return;
    assert.deepStrictEqual(gateSource(src, EXPERIENCES).fails, []);
  });

  test("an inline prompt instead of a stored task is refused", (t) => {
    if (needsDb(t)) return;
    fails(bend(w => { delete w.steps.find(s => s.t === "write").taskId; }), /no taskId/);
  });

  test("a write step with no experienceId is refused", (t) => {
    if (needsDb(t)) return;
    fails(bend(w => { delete w.steps.find(s => s.t === "write").experienceId; }), /no experienceId/);
  });

  test("claiming language_awareness without a rewrite loop is refused", (t) => {
    if (needsDb(t)) return;
    fails(bend(w => { w.steps = w.steps.filter(s => s.t !== "write"); }),
      /claims language_awareness without a rewrite loop/);
  });

  test("the gate reports rather than throws on malformed writing steps", (t) => {
    if (needsDb(t)) return;
    for (const field of ["taskId", "experienceId", "steps"]) {
      const exps = bend(w => {
        if (field === "steps") w.steps = [];
        else for (const s of w.steps) delete s[field];
      });
      const r = gateSource(src, exps);        // must not throw
      assert.ok(r.fails.length > 0, `removing ${field} produced no failure`);
    }
  });

  test("no A1 mechanics reach the writing experience", (t) => {
    if (needsDb(t)) return;
    const w = EXPERIENCES.find(e => e.kind === "writing");
    const A1 = ["build", "spotmistake", "pick", "translate", "keypad", "race", "oddoneout", "soundmatch"];
    for (const s of w.steps) assert.ok(!A1.includes(s.t), `${s.t} is an A1 mechanic`);
  });

  test("no dead controls: `write` resolves its own footer", () => {
    const fs = require("node:fs"), path = require("node:path");
    const file = path.join(__dirname, "../../client/src/components/steps/Write.jsx");
    const body = fs.readFileSync(file, "utf8");
    assert.ok(/ctx\.commit\(/.test(body),
      "Write never calls ctx.commit(), so the lesson can never be finished");
  });
});
