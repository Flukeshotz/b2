/**
 * TASK-AWARE WRITING ASSESSMENT.
 *
 * The analyser is one instrument; a writing task is a genre. Applying every
 * check to every genre produced five failures on the teacher's own model
 * Aufnahmebericht — a text a qualified teacher wrote as exemplary B2.
 *
 * These tests prove two things, and the second matters as much as the first:
 *   1. the same check applies to one task type and not another, for a recorded
 *      reason about the GENRE;
 *   2. suppression is not leniency — a weak text is still caught, and the bar
 *      for an Aufnahmebericht is still B2.
 */

const { test, describe } = require("node:test");
const assert = require("node:assert");

require("../src/env")();
const tasks = require("../src/b2/task_profiles");
const marks = require("../src/b2/teacher/marked_2026-09.json");

const MODEL = marks.model_answer.text;                    // teacher's B2 Aufnahmebericht
const WEAK  = marks.marked.find(m => m.id === "D").text;  // teacher marked this A2
const ARGUMENT = `Ich halte die Vier-Tage-Woche für sinnvoll, obwohl sie nicht überall funktioniert. Das liegt vor allem daran, dass viele Besprechungen ohnehin zu lang sind. Einerseits gewinnen die Beschäftigten Zeit, andererseits wird die restliche Woche dichter. Man könnte das Modell zunächst in einzelnen Abteilungen testen, bevor man es überall einführt.`;

const ids = (fs) => fs.map(f => f.check_id);
const state = (fs, id) => fs.find(f => f.check_id === id)?.state;

describe("writing — the same check applies to one task and not another", () => {
  test("connector_range applies to a Forumsbeitrag and NOT to an Aufnahmebericht", () => {
    const forum = tasks.assessForTask(ARGUMENT, { task_type: "forumsbeitrag" });
    const report = tasks.assessForTask(MODEL, { task_type: "aufnahmebericht" });

    assert.ok(ids(forum.findings).includes("connector_range"),
      "an argument must be scored on how it connects its points");
    assert.ok(!ids(report.findings).includes("connector_range"),
      "a clinical report was scored on connector range — it states facts, it does not argue");

    // And the suppression carries a reason, not just an absence.
    const why = report.suppressed.find(s => s.check_id === "connector_range")?.why || "";
    assert.match(why, /argue|report/i, `suppression has no genre reason: "${why}"`);
  });

  test("konjunktiv2 applies to a Forumsbeitrag and NOT to an Aufnahmebericht", () => {
    assert.ok(ids(tasks.assessForTask(ARGUMENT, { task_type: "forumsbeitrag" }).findings).includes("konjunktiv2"));
    assert.ok(!ids(tasks.assessForTask(MODEL, { task_type: "aufnahmebericht" }).findings).includes("konjunktiv2"),
      "nothing in an admission report is hypothetical; its absence is the genre");
  });

  test("email_form applies to a telc email and NOT to a Forumsbeitrag", () => {
    const email = tasks.assessForTask("Sehr geehrte Damen und Herren, ich interessiere mich für die Stelle. Mit freundlichen Grüßen, A. B.", { task_type: "halbformelle_email" });
    const forum = tasks.assessForTask(ARGUMENT, { task_type: "forumsbeitrag" });
    assert.ok(ids(email.findings).includes("email_form"), "telc scores Anrede and Grußformel");
    assert.ok(!ids(forum.findings).includes("email_form"), "a forum post sets no Anrede");
  });

  test("an Aufnahmebericht is scored on register and coverage instead", () => {
    const report = tasks.assessForTask(MODEL, { task_type: "aufnahmebericht" });
    assert.ok(ids(report.findings).includes("professional_register"),
      "the criterion that REPLACES sentence_complexity for this genre is missing");
  });
});

describe("writing — the teacher's model answer through the real learner path", () => {
  test("it is not failed on features that belong to argumentative writing", () => {
    const r = tasks.assessForTask(MODEL, { task_type: "aufnahmebericht" });
    const failed = r.findings.filter(f => f.state === "fail").map(f => f.check_id);
    assert.deepEqual(failed, [],
      `the teacher's model B2 answer still fails: ${failed.join(", ")}`);
  });

  test("its professional register is recognised, not merely tolerated", () => {
    const r = tasks.professionalRegister(MODEL);
    assert.equal(r.state, "pass",
      "the model's passive and nominal constructions were not recognised as B2 report style");
  });

  test("it would have failed five checks under the old undifferentiated path", () => {
    // Guards the regression: if someone re-points this genre at the essay
    // check set, this test says exactly what breaks.
    const asForum = tasks.assessForTask(MODEL, { task_type: "forumsbeitrag" });
    const failed = asForum.findings.filter(f => f.state === "fail").map(f => f.check_id);
    assert.ok(failed.length >= 4,
      "expected the essay check set to fail this clinical text — that was the original bug");
    assert.ok(failed.includes("connector_range") && failed.includes("konjunktiv2"));
  });
});

describe("writing — suppression is not leniency", () => {
  test("a weak clinical text is still caught under its own profile", () => {
    const r = tasks.assessForTask(WEAK, { task_type: "aufnahmebericht" });
    const bad = r.findings.filter(f => f.state !== "pass");
    assert.ok(bad.length > 0,
      "the A2 text passed every check for its genre — the bar has been lowered, not moved");
    assert.equal(state(r.findings, "professional_register"), "fail",
      "a text of simple active sentences should fail the report-register criterion");
  });

  test("the model and the weak text are separated by the genre's own criterion", () => {
    assert.equal(tasks.professionalRegister(MODEL).state, "pass");
    assert.equal(tasks.professionalRegister(WEAK).state, "fail");
  });

  test("every B2-marked text passes and every A2-marked text fails the register criterion", () => {
    for (const m of marks.marked) {
      const got = tasks.professionalRegister(m.text).state;
      if (m.level === "B2") assert.equal(got, "pass", `text ${m.id} (B2) failed register`);
      if (m.level === "A2") assert.equal(got, "fail", `text ${m.id} (A2) passed register`);
    }
  });
});

describe("writing — every profile is well-formed", () => {
  test("no check is both applied and suppressed", () => {
    for (const [id, p] of Object.entries(tasks.PROFILES)) {
      const sup = new Set(p.suppresses.map(s => s.check));
      for (const c of p.applies) {
        assert.ok(!sup.has(c), `${id}: "${c}" is both applied and suppressed`);
      }
    }
  });

  test("every suppression records WHY, in terms of the genre", () => {
    for (const [id, p] of Object.entries(tasks.PROFILES)) {
      for (const s of p.suppresses) {
        assert.ok(s.why && s.why.length > 20, `${id}: "${s.check}" suppressed with no reason`);
      }
    }
  });

  test("every profile declares whether it can move a band, and with what weight", () => {
    for (const [id, p] of Object.entries(tasks.PROFILES)) {
      assert.equal(typeof p.bandAffecting, "boolean", `${id}: bandAffecting not declared`);
      assert.ok(p.evidenceWeight > 0 && p.evidenceWeight <= 1, `${id}: bad evidenceWeight`);
      assert.ok(p.framing && p.framing.length > 20, `${id}: no learner-facing framing`);
    }
  });

  /* This used to assert the OLD bug: an unrecognised task type silently
     labelled itself "Kurze freie Produktion" (free_response) — reading exactly
     like a deliberate genre choice, with no trace that anything was guessed.
     That silence is what let a caller which forgot to send a task type at all
     (Produce.jsx, until this fix) get a real-looking verdict instead of a
     visible warning. The fallback must still WORK (never throw, still produce
     findings) but must never be mistaken for a chosen genre. */
  test("an unknown task type falls back rather than throwing, and says so", () => {
    const r = tasks.assessForTask(ARGUMENT, { task_type: "something_new" });
    assert.ok(r.findings.length > 0, "the fallback must still produce a working assessment");
    assert.equal(r.profile.fallback, true,
      "an unrecognised task type must be visibly marked as a guess, not silently scored as a genre");
    assert.notEqual(r.profile.label, tasks.PROFILES[tasks.DEFAULT].label,
      "the fallback must not read as the deliberately-authored free_response genre");
  });

  test("a MISSING task type (undefined, not just unrecognised) also falls back visibly", () => {
    const r = tasks.assessForTask(ARGUMENT, {});
    assert.equal(r.profile.fallback, true);
    assert.equal(r.taskType, null, "the response must show that nothing was actually given");
  });

  test("every DECLARED profile explicitly says it is not a fallback", () => {
    for (const [id, p] of Object.entries(tasks.PROFILES)) {
      if (id === tasks.UNSPECIFIED) continue;
      assert.equal(p.fallback, false, `${id}: a real, chosen profile must declare fallback:false`);
    }
  });

  test("the fallback profile is reachable only through PROFILES, keyed distinctly from free_response", () => {
    assert.notEqual(tasks.UNSPECIFIED, "free_response");
    assert.equal(tasks.PROFILES[tasks.UNSPECIFIED].fallback, true);
    assert.equal(tasks.PROFILES.free_response.fallback, false);
  });
});
