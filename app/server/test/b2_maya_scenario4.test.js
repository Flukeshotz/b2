const { test, describe, beforeEach, after } = require("node:test");
const assert = require("node:assert");
const unerwartet = require("../src/seed/b2/maya/unerwartet");
const maya = require("../src/b2/maya");
const pool = require("../src/db/pool");
const profile_ = require("../src/b2/profile");

describe("Maya Scenario 4: Moment, da ist noch etwas … (maya_unerwartet)", () => {
  const TEST_USER = 99;

  beforeEach(async () => {
    await pool.query("INSERT INTO users (id, name, plan) VALUES ($1, 'Test User 99', 'trial') ON CONFLICT (id) DO NOTHING", [TEST_USER]);
    await pool.query("DELETE FROM b2_evidence WHERE user_id=$1", [TEST_USER]);
  });

  after(async () => {
    await pool.query("DELETE FROM b2_evidence WHERE user_id=$1", [TEST_USER]);
    await pool.query("DELETE FROM users WHERE id=$1", [TEST_USER]);
  });

  test("contract validation passes against frozen engine", () => {
    assert.doesNotThrow(() => {
      maya.validateMayaScenario(unerwartet);
    });
    assert.strictEqual(unerwartet.id, "maya_unerwartet");
    assert.strictEqual(unerwartet.minutes, 8);
    assert.strictEqual(unerwartet.max_learner_turns, 7);
    assert.strictEqual(unerwartet.roles.maya, "Herr Weber, Angehöriger");
  });

  test("opening turn presents Herr Weber's routine admission opening", () => {
    assert.strictEqual(unerwartet.beats[0].id, "b1_admission_start");
    assert.ok(unerwartet.first_say.includes("Guten Tag"));
    assert.ok(unerwartet.beats[0].say.includes("Guten Tag"));
  });

  test("routine turn advances to unexpected symptom turn", () => {
    const state = { current_beat: "b1_admission_start", press_count: 0, learner_turns_count: 0 };
    const turn = maya.readTurn("Guten Tag, Herr Weber. Wir gehen die Dokumente und den Aufnahmebogen gerne Schritt für Schritt durch, weil die Erfassung für die Station wichtig ist.");
    const res = maya.nextMove(unerwartet, state, turn);

    assert.strictEqual(res.state.current_beat, "b2_unexpected_turn");
    assert.ok(res.say.includes("atmet seit einer halben Stunde so schwer"));
    assert.strictEqual(res.done, false);
  });

  test("blind acceptance of paperwork during acute dyspnea triggers the trap", () => {
    // Beat 2: Unexpected turn
    const state = { current_beat: "b2_unexpected_turn", press_count: 0, learner_turns_count: 1 };
    // Learner blind-accepts continuing paperwork despite acute symptoms
    const turn = maya.readTurn("Ja, das passt, wir machen erst die Formulare fertig.");
    const res = maya.nextMove(unerwartet, state, turn);

    assert.strictEqual(res.done, true);
    assert.strictEqual(res.outcome, "trap_accepted");
    assert.strictEqual(res.trapTriggered, true);

    // Summary evaluation
    const summary = maya.summarise(unerwartet, [
      { text: "Guten Tag. Wir gehen die Dokumente der Reihe nach durch, weil das wichtig ist.", beat: "b1_admission_start" },
      { text: "Ja, das passt, wir machen erst die Formulare fertig.", beat: "b2_unexpected_turn" },
    ], res.state);

    assert.strictEqual(summary.trapTriggered, true);
    const reactEv = summary.evidence.find(e => e.capability === "react_unexpected");
    assert.ok(reactEv, "react_unexpected evidence must be emitted");
    assert.strictEqual(reactEv.outcome, 0.3);
    assert.strictEqual(reactEv.weight, 0.2);
    assert.strictEqual(reactEv.dimension, "speaking");
    assert.strictEqual(reactEv.indicative, true);
  });

  test("recognising acute symptoms, halting paperwork, and prioritising medical triage handles the unexpected turn", () => {
    // Turn 1
    const s1 = { current_beat: "b1_admission_start", press_count: 0, learner_turns_count: 0 };
    const t1 = maya.readTurn("Guten Tag, Herr Weber. Wir können die Unterlagen gerne gemeinsam durchsehen, weil das zur Aufnahme gehört.");
    const r1 = maya.nextMove(unerwartet, s1, t1);

    assert.strictEqual(r1.state.current_beat, "b2_unexpected_turn");

    // Turn 2: Halt paperwork, prioritize acute dyspnea, call physician
    const t2 = maya.readTurn("Nein, Herr Weber, das geht auf keinen Fall. Die Papiere warten jetzt, akute Atemnot hat absolute Priorität. Ich hole sofort den Stationsarzt.");
    const r2 = maya.nextMove(unerwartet, r1.state, t2);

    assert.strictEqual(r2.state.memory.unexpected_handled, true);
    assert.strictEqual(r2.state.current_beat, "b3_clarify_and_triage");

    // Turn 3: Clarify & reassure
    const t3 = maya.readTurn("Das verstehe ich natürlich, aber bei Engegefühl in der Brust müssen wir vorsichtig sein, weil das ein Notfall sein kann.");
    const r3 = maya.nextMove(unerwartet, r2.state, t3);

    assert.strictEqual(r3.state.current_beat, "b4_communicate_action");

    // Turn 4: Clear instructions & action plan
    const t4 = maya.readTurn("Bleiben Sie bitte direkt bei ihm im Zimmer, ich übernehme das sofort und bin in 2 Minuten mit dem Arzt bei Ihnen.");
    const r4 = maya.nextMove(unerwartet, r3.state, t4);

    assert.strictEqual(r4.done, true);
    assert.strictEqual(r4.outcome, "resolved");

    // Summary evaluation
    const summary = maya.summarise(unerwartet, [
      { text: t1.text, beat: "b1_admission_start" },
      { text: t2.text, beat: "b2_unexpected_turn" },
      { text: t3.text, beat: "b3_clarify_and_triage" },
      { text: t4.text, beat: "b4_communicate_action" },
    ], r4.state);

    assert.strictEqual(summary.adaptedToChange, true);
    assert.strictEqual(summary.trapTriggered, false);

    const reactEv = summary.evidence.find(e => e.capability === "react_unexpected");
    assert.ok(reactEv, "react_unexpected must be emitted");
    assert.strictEqual(reactEv.outcome, 1.0);
    assert.strictEqual(reactEv.weight, 0.2);
    assert.strictEqual(reactEv.dimension, "speaking");
    assert.strictEqual(reactEv.indicative, true);

    const discEv = summary.evidence.find(e => e.capability === "maintain_discussion");
    assert.ok(discEv);
    assert.strictEqual(discEv.outcome, 1.0);

    const regEv = summary.evidence.find(e => e.capability === "adapt_register");
    assert.ok(regEv);
    assert.strictEqual(regEv.outcome, 1.0);
  });

  test("database evidence persistence records react_unexpected with weight 0.2", async () => {
    const summary = maya.summarise(unerwartet, [
      { text: "Guten Tag, Herr Weber. Wir können die Unterlagen gerne gemeinsam durchsehen.", beat: "b1_admission_start" },
      { text: "Nein, Herr Weber, das geht auf keinen Fall. Die Papiere warten jetzt, akute Atemnot hat absolute Priorität. Ich hole sofort den Stationsarzt.", beat: "b2_unexpected_turn" },
    ], { status: "resolved", memory: { unexpected_handled: true } });

    await profile_.recordMany(TEST_USER, summary.evidence.map(e => ({
      ...e,
      sourceRef: "maya_maya_unerwartet:test_session_1",
    })));

    const { rows } = await pool.query(
      "SELECT capability, outcome, weight, dimension, source_kind FROM b2_evidence WHERE user_id=$1 ORDER BY id ASC",
      [TEST_USER]
    );

    const reactRow = rows.find(r => r.capability === "react_unexpected");
    assert.ok(reactRow, "react_unexpected must exist in b2_evidence");
    assert.strictEqual(Number(reactRow.outcome), 1.0);
    assert.strictEqual(Number(reactRow.weight), 0.2);
    assert.strictEqual(reactRow.dimension, "speaking");
    assert.strictEqual(reactRow.source_kind, "conversation");
  });
});
