/**
 * THE MASTER-STRATEGY REGRESSION: task type must never be lost between the
 * task and the analyser.
 *
 * `task_profiles.js` already implements TASK → TASK TYPE → APPLICABLE CHECK
 * SET correctly for every genre it knows about — the architecture was sound.
 * What was NOT sound was getting the task type there at all:
 *
 *   1. `Produce.jsx` (the in-lesson "produce" step, e.g. b2_muede_produce)
 *      never sent `taskId` or `taskType` to `/produce`. The server's own
 *      fallback then silently aliased to `free_response`, whose check set is
 *      argumentative (connectors, Konjunktiv II, sentence complexity, lexical
 *      range) — the exact set that flags a clinical Aufnahmebericht, if one
 *      were ever authored as a `produce` step and reached this path.
 *   2. Even when `aufnahmebericht` WAS correctly resolved,
 *      `informationCoverage()` read `task.content_points` while every real
 *      telc-Pflege task stores its Leitpunkte under `task.information_points`
 *      — the field `pflege.score()` has always used. The Kremer task's
 *      `content_points` is `[]`, so this check silently returned null: not
 *      wrong feedback, no feedback, on Aufgabenbewältigung — the criterion
 *      telc weighs most.
 *
 * Both are fixed at the root (task_profiles.js reads the right field and
 * shares pflege.js's counting logic; the fallback is now a distinct, visible
 * state; Produce.jsx forwards a real task type; the content gate refuses to
 * publish a `produce` step without one) rather than patched at any one call
 * site, because the failure was architectural, not local.
 *
 * EVIDENCE DISCIPLINE: passing the teacher's six marked texts is regression
 * evidence for THIS product's calibration, not proof the analyser generalises
 * to German it has never seen. Where a check is a Skillcase interpretation
 * rather than a published telc/Goethe rule (`professional_register`,
 * `information_coverage`'s exact thresholds), the code comments say so; this
 * suite does not claim more than it tested.
 */

const { test, describe } = require("node:test");
const assert = require("node:assert");

require("../src/env")();
const tasks = require("../src/b2/task_profiles");
const pflege = require("../src/b2/pflege");
const marks = require("../src/b2/teacher/marked_2026-09.json");

const MODEL = marks.model_answer.text;
const WEAK = marks.marked.find(m => m.id === "D").text;

const KREMER_INFO_POINTS = [
  { id: "name_alter", label_de: "Name und Alter", detector: "(frau|herr)\\s+\\w+" },
  { id: "aufnahmegrund", label_de: "Aufnahmegrund", detector: "(sturz|gest(ü|ue)rzt|fraktur)" },
  { id: "vorerkrankungen", label_de: "Vorerkrankungen", detector: "(diabetes|bluthochdruck)" },
  { id: "medikamente", label_de: "Medikamente", detector: "(metformin|medikament)" },
  { id: "allergien", label_de: "Allergien", detector: "(allergi|penicillin)" },
  { id: "mobilitaet", label_de: "Mobilität", detector: "(rollator|bettl(ä|ae)gerig|mobil)" },
  { id: "orientierung", label_de: "Orientierung", detector: "(orientiert|wach)" },
  { id: "angehoerige", label_de: "Angehörige", detector: "(tochter|angeh(ö|oe)rige)" },
];
const KREMER_TASK = { board: "telc_pflege", task_type: "aufnahmebericht",
  target_words: 120, information_points: KREMER_INFO_POINTS };

const ARGUMENT = "Ich halte die Vier-Tage-Woche für sinnvoll, obwohl sie nicht überall funktioniert. " +
  "Das liegt vor allem daran, dass viele Besprechungen ohnehin zu lang sind. Einerseits gewinnen die " +
  "Beschäftigten Zeit, andererseits wird die restliche Woche dichter. Man könnte das Modell zunächst " +
  "in einzelnen Abteilungen testen.";
const EMAIL = "Sehr geehrte Damen und Herren, ich interessiere mich für die ausgeschriebene Stelle als " +
  "Pflegekraft. Über die Möglichkeit eines Vorstellungsgesprächs würde ich mich sehr freuen. " +
  "Mit freundlichen Grüßen, A. Beispiel";

const ids = (fs) => fs.map(f => f.check_id);
const failed = (fs) => fs.filter(f => f.state === "fail").map(f => f.check_id);

describe("A — the teacher's exemplary Aufnahmebericht", () => {
  test("must NOT fail connector_range, konjunktiv2, sentence_complexity or lexical_range", () => {
    const r = tasks.assessForTask(MODEL, KREMER_TASK);
    for (const bad of ["connector_range", "konjunktiv2", "sentence_complexity", "lexical_range"]) {
      assert.ok(!ids(r.findings).includes(bad), `${bad} was applied to a clinical report`);
    }
  });

  test("passes overall — zero failed checks on a text a teacher marked B2", () => {
    const r = tasks.assessForTask(MODEL, KREMER_TASK);
    assert.deepStrictEqual(failed(r.findings), []);
  });

  test("information_coverage actually FIRES against the real field telc-Pflege tasks use", () => {
    // REGRESSION for bug #2. Before the fix this check silently returned null
    // whenever the caller supplied `information_points` (the real field) but
    // not the unrelated `content_points` — which was every real task.
    const r = tasks.assessForTask(MODEL, KREMER_TASK);
    const info = r.findings.find(f => f.check_id === "information_coverage");
    assert.ok(info, "information_coverage did not fire at all — the criterion telc weighs most was silently skipped");
    assert.strictEqual(info.state, "pass");
    assert.match(info.detail, /8\/8|Alle 8/, "all eight Kremer information points should be recognised");
  });

  test("professional_register credits clinical vocabulary as its own, added signal", () => {
    // Same structural shell (passive + nominal fügung), with and without
    // clinical vocabulary. The score must move BECAUSE the vocabulary was
     // added — proving the reused CLINICAL_LEXIS signal actually contributes,
     // rather than the check still passing on grammar shape alone the way it
     // did before pflege.js's calibrated lexicon was reused here.
    const withoutLexis = "Es wurde berichtet, dass die Angelegenheit besprochen wurde. " +
      "Bei der Sitzung wurde auf verschiedene Punkte eingegangen, die zuvor genannt worden waren.";
    const withLexis = "Die Patientin wurde nach einem Sturz aufgenommen. Bei Aufnahme bestand " +
      "Verdacht auf eine Fraktur; die Medikation wurde dokumentiert, die Mobilität war eingeschränkt.";
    const a = tasks.professionalRegister(withoutLexis);
    const b = tasks.professionalRegister(withLexis);
    assert.ok(!/Fachvokabular/.test(a.detail), `unexpected clinical credit: ${a.detail}`);
    assert.match(b.detail, /Fachvokabular/, `expected clinical vocabulary to be credited: ${b.detail}`);
  });

  test("pflege.js and task_profiles.js SHARE one point-counting implementation", () => {
    const direct = pflege.countInformationPoints(MODEL, KREMER_INFO_POINTS);
    const viaTaskProfiles = tasks.assessForTask(MODEL, KREMER_TASK)
      .findings.find(f => f.check_id === "information_coverage");
    assert.strictEqual(direct.missing.length, 0);
    assert.strictEqual(viaTaskProfiles.state, "pass");
  });
});

describe("B — a weak Forumsbeitrag: real weaknesses still surface", () => {
  test("a flat, unconnected argument still fails connector_range", () => {
    const flat = "Ich finde das gut. Es ist praktisch. Ich mag es. Das ist meine Meinung. " +
      "Viele Leute denken so. Es ist wichtig. Ich bin zufrieden. Das reicht.";
    const r = tasks.assessForTask(flat, { task_type: "forumsbeitrag" });
    assert.strictEqual(r.findings.find(f => f.check_id === "connector_range")?.state, "fail");
  });

  test("a genuinely argued Forumsbeitrag passes connector_range", () => {
    const r = tasks.assessForTask(ARGUMENT, { task_type: "forumsbeitrag" });
    const cr = r.findings.find(f => f.check_id === "connector_range");
    assert.notStrictEqual(cr?.state, "fail");
  });

  test("suppression does not hide a genuine Aufnahmebericht weakness", () => {
    const r = tasks.assessForTask(WEAK, {
      board: "telc_pflege", task_type: "aufnahmebericht", target_words: 120,
      information_points: KREMER_INFO_POINTS,
    });
    assert.ok(failed(r.findings).length > 0,
      "a text the teacher marked A2 must still fail something under its own genre's checks");
  });
});

describe("C — Halbformelle E-Mail: the right checks apply, the wrong ones do not", () => {
  test("email_form, content_points, register, genitiv_praep and connector_range are all applicable", () => {
    const profile = tasks.PROFILES.halbformelle_email;
    for (const must of ["email_form", "content_points", "register", "genitiv_praep", "connector_range"]) {
      assert.ok(profile.applies.includes(must), `halbformelle_email must apply ${must}`);
    }
  });

  test("konjunktiv2 is not automatically applied just because the analyser can detect it", () => {
    const r = tasks.assessForTask(EMAIL, { task_type: "halbformelle_email" });
    assert.ok(!ids(r.findings).includes("konjunktiv2"),
      "an email asking about a job does not require hypothetical language");
  });

  test("email_form actually fires on a real semi-formal email", () => {
    const r = tasks.assessForTask(EMAIL, { task_type: "halbformelle_email" });
    const ef = r.findings.find(f => f.check_id === "email_form");
    assert.ok(ef, "email_form must be present for this genre");
  });

  test("lexical_range and nvv — essay measures — are suppressed for this genre", () => {
    const profile = tasks.PROFILES.halbformelle_email;
    const suppressedIds = profile.suppresses.map(s => s.check);
    assert.ok(suppressedIds.includes("lexical_range"));
    assert.ok(suppressedIds.includes("nvv"));
  });
});

describe("D — the same text legitimately scores differently under different task types", () => {
  test("the clinical model text: clean as an Aufnahmebericht, flagged as a Forumsbeitrag", () => {
    const asReport = tasks.assessForTask(MODEL, KREMER_TASK);
    const asForum = tasks.assessForTask(MODEL, { task_type: "forumsbeitrag" });
    assert.deepStrictEqual(failed(asReport.findings), []);
    assert.ok(failed(asForum.findings).length >= 4,
      "the SAME text must fail under the essay rubric, because the rubric — not the text — changed");
  });

  test("the difference is attributable: every extra failure traces to a named, genre-based suppression", () => {
    const asReport = tasks.assessForTask(MODEL, KREMER_TASK);
    const reportChecks = new Set(asReport.findings.map(f => f.check_id));
    for (const f of tasks.assessForTask(MODEL, { task_type: "forumsbeitrag" }).findings) {
      if (reportChecks.has(f.check_id)) continue;   // applies to both, not part of the difference
      const why = KREMER_INFO_POINTS && tasks.PROFILES.aufnahmebericht.suppresses
        .find(s => s.check === f.check_id)?.why;
      assert.ok(why, `${f.check_id} differs between profiles with no recorded genre reason`);
    }
  });
});

describe("E — unknown or missing task type: an explicit, visible fallback, never a silent Forumsbeitrag", () => {
  test("a missing task_type does not silently become forumsbeitrag OR free_response", () => {
    const r = tasks.assessForTask(MODEL, {});   // no task_type at all
    assert.strictEqual(r.profile.fallback, true);
    assert.notStrictEqual(r.profile.label, tasks.PROFILES.forumsbeitrag.label);
    assert.notStrictEqual(r.profile.label, tasks.PROFILES.free_response.label);
  });

  test("an unrecognised task_type string is visibly a guess, not a genre", () => {
    const r = tasks.assessForTask(ARGUMENT, { task_type: "totally_unknown_genre" });
    assert.strictEqual(r.profile.fallback, true);
  });

  test("assessForTask warns to the console when it falls back (visible in the implementation)", () => {
    const original = console.warn;
    const calls = [];
    console.warn = (...a) => calls.push(a.join(" "));
    try { tasks.assessForTask(MODEL, {}); } finally { console.warn = original; }
    assert.ok(calls.some(c => /fallback/i.test(c)), "no visible trace was left when the task type was missing");
  });

  test("every declared, real profile explicitly states fallback:false", () => {
    for (const [id, p] of Object.entries(tasks.PROFILES)) {
      if (id === tasks.UNSPECIFIED) continue;
      assert.strictEqual(p.fallback, false, `${id} must explicitly declare it is not a guess`);
    }
  });
});

describe("F — no regression in Experience 5's writing loop or evidence", () => {
  test("writing_loop.compare() still works against an aufnahmebericht task", () => {
    const loop = require("../src/b2/writing_loop");
    const c = loop.compare(WEAK, MODEL, "information_coverage", KREMER_TASK);
    assert.strictEqual(typeof c.improved, "boolean");
  });

  test("the writing route files still parse and export what routes/b2.js expects", () => {
    assert.strictEqual(typeof tasks.assessForTask, "function");
    assert.strictEqual(typeof tasks.topFinding, "function");
    assert.strictEqual(typeof tasks.profileFor, "function");
  });
});

describe("the live client entry point that caused this — Produce.jsx", () => {
  const fs = require("node:fs"), path = require("node:path");
  const comp = fs.readFileSync(
    path.join(__dirname, "../../client/src/components/steps/Produce.jsx"), "utf8");

  test("submitProduction is called with taskId AND taskType, not neither", () => {
    const call = comp.slice(comp.indexOf("b2.submitProduction"), comp.indexOf("});", comp.indexOf("b2.submitProduction")));
    assert.match(call, /taskId:\s*step\.taskId/);
    assert.match(call, /taskType:\s*step\.taskType/);
  });
});

describe("the content gate refuses a produce step with no declared genre", () => {
  const { gateSource } = require("../tools/gate_b2_source");

  test("a produce step with neither taskId nor taskType is refused", () => {
    const src = { KIND: "audio", DECLARATION: {
      primary_capability: "argue", theme: 3, cefr_tier: "developing",
      language_resources: ["x"], experience_types: ["writing"] },
      SCRIPT: [{ speaker: "A", de: "Ein Testsatz für die Analyse." }], MARKERS: [], TRANSCRIPT: "Ein Testsatz für die Analyse." };
    const exps = [{ id: "exp_test", kind: "writing", steps: [
      { t: "produce", prompt: "Schreiben Sie etwas.", minWords: 50 },
    ] }];
    const r = gateSource(src, exps);
    assert.ok(r.fails.some(f => /no taskId and no taskType/.test(f)), r.fails.join("; "));
  });

  test("declaring an explicit, real taskType passes that rule", () => {
    const src = { KIND: "audio", DECLARATION: {
      primary_capability: "argue", theme: 3, cefr_tier: "developing",
      language_resources: ["x"], experience_types: ["writing"] },
      SCRIPT: [{ speaker: "A", de: "Ein Testsatz für die Analyse." }], MARKERS: [], TRANSCRIPT: "Ein Testsatz für die Analyse." };
    const exps = [{ id: "exp_test", kind: "writing", steps: [
      { t: "produce", prompt: "Schreiben Sie etwas.", minWords: 50, taskType: "free_response" },
    ] }];
    const r = gateSource(src, exps);
    assert.ok(!r.fails.some(f => /taskId and no taskType|not a real task profile/.test(f)), r.fails.join("; "));
  });

  test("the fallback profile itself cannot be declared as a taskType", () => {
    const src = { KIND: "audio", DECLARATION: {
      primary_capability: "argue", theme: 3, cefr_tier: "developing",
      language_resources: ["x"], experience_types: ["writing"] },
      SCRIPT: [{ speaker: "A", de: "Ein Testsatz für die Analyse." }], MARKERS: [], TRANSCRIPT: "Ein Testsatz für die Analyse." };
    const exps = [{ id: "exp_test", kind: "writing", steps: [
      { t: "produce", prompt: "Schreiben Sie etwas.", minWords: 50, taskType: "__unspecified__" },
    ] }];
    const r = gateSource(src, exps);
    assert.ok(r.fails.some(f => /not a real task profile/.test(f)), r.fails.join("; "));
  });
});

describe("the existing authored produce step now declares itself", () => {
  test("exp_muede's produce step has an explicit taskType", () => {
    const { EXPERIENCES } = require("../src/seed/b2/exp_muede");
    const w = EXPERIENCES.find(e => e.kind === "writing");
    const p = w.steps.find(s => s.t === "produce");
    assert.strictEqual(p.taskType, "free_response");
  });
});
