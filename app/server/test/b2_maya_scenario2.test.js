const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");
const pool = require("../src/db/pool");
const maya = require("../src/b2/maya");
const homeoffice = require("../src/seed/b2/maya/homeoffice");

describe("Maya Scenario 2 (Homeoffice) — Contract Validation", () => {
  test("Homeoffice scenario validates cleanly against the contract", () => {
    assert.doesNotThrow(() => {
      maya.validateMayaScenario(homeoffice);
    });
    assert.strictEqual(homeoffice.id, "maya_homeoffice");
    assert.strictEqual(homeoffice.version, 1);
    assert.strictEqual(homeoffice.max_learner_turns, 7);
    assert.strictEqual(homeoffice.capability_targets.primary, "argue");
  });

  test("rejects corrupted Homeoffice scenario missing roles or objective", () => {
    assert.throws(() => {
      maya.validateMayaScenario({ ...homeoffice, roles: null });
    }, /missing roles/);

    assert.throws(() => {
      maya.validateMayaScenario({ ...homeoffice, objective: "" });
    }, /missing objective/);
  });

  test("rejects invalid transition targets in Homeoffice scenario", () => {
    const broken = JSON.parse(JSON.stringify(homeoffice));
    broken.beats[0].transitions.onSubstantive = "non_existent_beat";
    assert.throws(() => {
      maya.validateMayaScenario(broken);
    }, /targets non-existent beat/);
  });
});

describe("Maya Scenario 2 (Homeoffice) — Communicative Flow & Pushbacks", () => {
  test("initial opening position is skeptical and prompts for concrete scope", () => {
    assert.ok(homeoffice.first_say.includes("Videochat"));
    assert.strictEqual(homeoffice.beats[0].id, "b1_position_and_scope");
  });

  test("weak response receives meaningful pushback", () => {
    const state = { current_beat: "b1_position_and_scope", press_count: 0, learner_turns_count: 0 };
    const weakTurn = maya.readTurn("Das machen doch heute alle Firmen.");
    const move = maya.nextMove(homeoffice, state, weakTurn);

    assert.strictEqual(move.done, undefined);
    assert.strictEqual(move.pressing, true);
    assert.ok(move.say.includes("Das ist doch keine Antwort"));
    assert.strictEqual(move.state.press_count, 1);
    assert.strictEqual(move.state.current_beat, "b1_position_and_scope");
  });

  test("repeated weak response triggers second pushback", () => {
    const state = { current_beat: "b1_position_and_scope", press_count: 1, learner_turns_count: 1 };
    const weakTurn = maya.readTurn("Es ist einfach modern.");
    const move = maya.nextMove(homeoffice, state, weakTurn);

    assert.strictEqual(move.pressing, true);
    assert.ok(move.say.includes("Ich frage noch einmal"));
    assert.strictEqual(move.state.press_count, 2);
    assert.strictEqual(move.state.current_beat, "b1_position_and_scope");
  });

  test("one good argument does not automatically end the discussion; advances to counterargument", () => {
    const state = { current_beat: "b1_position_and_scope", press_count: 0, learner_turns_count: 0 };
    const strongTurn = maya.readTurn(
      "Es geht mir keineswegs um die Patientenversorgung, sondern ausschließlich um die Dienstplanung und Qualitätsberichte, weil man dafür mehrere Stunden absolute Ruhe braucht."
    );
    const move = maya.nextMove(homeoffice, state, strongTurn);

    assert.strictEqual(!move.done, true);
    assert.strictEqual(move.pressing, false);
    assert.strictEqual(move.state.current_beat, "b2_counter_solidarity");
    assert.strictEqual(move.state.press_count, 0);
    // Maya presents her counterargument regarding team solidarity
    assert.ok(move.say.includes("doppelt so viele Patientenglocken"));
  });

  test("Maya tracks communicative memory from previous arguments", () => {
    const state = { current_beat: "b1_position_and_scope", press_count: 0, learner_turns_count: 0 };
    const turn = maya.readTurn("Weil die Planung am PC zu Hause konzentrierter läuft.");
    const move = maya.nextMove(homeoffice, state, turn);

    assert.strictEqual(move.state.memory.hasReason, true);
  });

  test("concession without defense on solidarity beat triggers pushback", () => {
    const state = { current_beat: "b2_counter_solidarity", press_count: 0, learner_turns_count: 1 };
    const concessionOnlyTurn = maya.readTurn("Das verstehe ich natürlich vollkommen, Frau Berger.");
    const move = maya.nextMove(homeoffice, state, concessionOnlyTurn);

    assert.strictEqual(move.pressing, true);
    assert.ok(move.say.includes("Da haben Sie recht?") || move.say.includes("Sie weichen aus"));
  });

  test("concession combined with safeguard advances past solidarity beat", () => {
    const state = { current_beat: "b2_counter_solidarity", press_count: 0, learner_turns_count: 1 };
    const goodTurn = maya.readTurn(
      "Das verstehe ich vollkommen. Die Kolleginnen am Bett dürfen keinesfalls mehr Belastung tragen. Deshalb schlage ich vor, dass Homeoffice nur an Tagen genehmigt wird, an denen die Station bereits voll besetzt ist."
    );
    const move = maya.nextMove(homeoffice, state, goodTurn);

    assert.strictEqual(move.pressing, false);
    assert.strictEqual(move.state.current_beat, "b3_reframe_emergencies");
    // Maya reframes to emergency / unpredictability
    assert.ok(move.say.includes("Notfall") || move.say.includes("Reanimation"));
  });

  test("learner defends against emergency reframing with concrete details", () => {
    const state = { current_beat: "b3_reframe_emergencies", press_count: 0, learner_turns_count: 2 };
    const detailTurn = maya.readTurn(
      "Für unvorhergesehene Notfälle greift immer die reguläre Notfallbesetzung vor Ort. Zum Beispiel haben wir freitags ab 14 Uhr feste administrative Zeiten, in denen keine Visite stattfindet."
    );
    const move = maya.nextMove(homeoffice, state, detailTurn);

    assert.strictEqual(move.pressing, false);
    assert.strictEqual(move.state.current_beat, "b4_pilot_agreement");
    assert.ok(move.say.includes("Bedingungen") || move.say.includes("Pilotprojekt"));
  });
});

describe("Maya Scenario 2 (Homeoffice) — Resolution, Ceiling & Evidence", () => {
  test("learner proposing concrete pilot framework reaches successful resolution", () => {
    const state = { current_beat: "b4_pilot_agreement", press_count: 0, learner_turns_count: 3 };
    const proposalTurn = maya.readTurn(
      "Wir könnten als Vorschlag für 3 Monate ein Pilotprojekt vereinbaren: 1 Tag pro Monat für die Dienstplanung."
    );
    const move = maya.nextMove(homeoffice, state, proposalTurn);

    assert.strictEqual(move.done, true);
    assert.strictEqual(move.outcome, "resolved");
    assert.strictEqual(move.state.current_beat, "b_resolved");
    assert.ok(move.say.includes("Pilotprojekt"));
  });

  test("max_learner_turns ceiling is enforced independently of client state", () => {
    let state = { current_beat: "b1_position_and_scope", press_count: 0, learner_turns_count: 6 };
    const turn = maya.readTurn("Ich möchte das trotzdem.");
    const move = maya.nextMove(homeoffice, state, turn);

    assert.strictEqual(move.done, true);
    assert.strictEqual(move.outcome, "unresolved");
    assert.strictEqual(move.state.learner_turns_count, 7);
  });

  test("evidence honestly reflects demonstrated behaviors", () => {
    const turns = [
      { text: "Es geht mir um die Dienstplanung, weil man dafür Ruhe braucht.", beat: "b1_position_and_scope" },
      { text: "Das verstehe ich vollkommen, die Kolleginnen am Bett dürfen nicht leiden. Deshalb nur bei Vollbesetzung.", beat: "b2_counter_solidarity" },
      { text: "Zum Beispiel am Freitag ab 14 Uhr, weil dann keine Notfälle anstehen.", beat: "b3_reframe_emergencies" },
      { text: "Wir vereinbaren ein dreimonatiges Pilotprojekt mit einem Tag pro Monat.", beat: "b4_pilot_agreement" },
    ];

    const summary = maya.summarise(homeoffice, turns, { status: "resolved", done: true });
    assert.ok(summary.verdict.includes("drangeblieben") || summary.verdict.includes("vereinbart"));

    const evMap = Object.fromEntries(summary.evidence.map(e => [e.capability, e]));
    assert.ok(evMap.maintain_discussion.outcome >= 0.8);
    assert.strictEqual(evMap.justify.outcome, 1.0);
    assert.strictEqual(evMap.concede.outcome, 1.0);
    assert.strictEqual(evMap.adapt_register.outcome, 1.0);
    assert.strictEqual(evMap.maintain_discussion.weight, 0.2);
    assert.strictEqual(evMap.maintain_discussion.indicative, true);
  });
});

describe("Maya Scenario 2 (Homeoffice) — Database Persistence & Idempotence", () => {
  const TEST_USER = 2;
  const SC_ID = "maya_homeoffice";

  before(async () => {
    await pool.query("INSERT INTO users (id, name) VALUES (2, 'Test User 2') ON CONFLICT (id) DO NOTHING");
    await pool.query("DELETE FROM b2_maya_sessions WHERE user_id=$1 AND scenario_id=$2", [TEST_USER, SC_ID]);
  });

  after(async () => {
    await pool.query("DELETE FROM b2_maya_sessions WHERE user_id=$1 AND scenario_id=$2", [TEST_USER, SC_ID]);
    await pool.query("DELETE FROM b2_evidence WHERE user_id=$1 AND source_kind='conversation' AND source_ref LIKE 'maya_maya_homeoffice:%'", [TEST_USER]);
  });

  test("starting a new session for Homeoffice marks previous as abandoned", async () => {
    const s1 = await maya.startSession(TEST_USER, homeoffice);
    assert.strictEqual(s1.status, "active");
    assert.strictEqual(s1.scenario_id, SC_ID);

    const s2 = await maya.startSession(TEST_USER, homeoffice);
    assert.strictEqual(s2.status, "active");
    assert.notStrictEqual(s1.session_id, s2.session_id);

    const { rows: [r1] } = await pool.query(
      "SELECT status FROM b2_maya_sessions WHERE session_id=$1",
      [s1.session_id]
    );
    assert.strictEqual(r1.status, "abandoned");
  });

  test("saving turn updates dialogue log and state in database", async () => {
    const active = await maya.getActiveSession(TEST_USER, SC_ID);
    assert.ok(active);

    const turn = { text: "Ich begründe meinen Vorschlag sachlich.", beat: "b1_position_and_scope" };
    const dialogueTurn = { who: "me", text: turn.text };
    const mayaReply = { who: "maya", text: "Frau Berger antwortet." };

    await maya.saveSessionTurn(active.session_id, {
      current_beat: "b2_counter_solidarity",
      press_count: 0,
      learner_turns_count: 1,
      turn,
      dialogueTurns: [dialogueTurn, mayaReply],
      status: "active",
      terminal_outcome: null,
    });

    const updated = await maya.getActiveSession(TEST_USER, SC_ID);
    assert.strictEqual(updated.current_beat, "b2_counter_solidarity");
    assert.strictEqual(updated.learner_turns_count, 1);
    assert.strictEqual(updated.dialogue_log.length, 2);
  });
});
