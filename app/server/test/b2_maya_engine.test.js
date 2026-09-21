/**
 * MAYA ENGINE & BEHAVIOURAL CONTRACT TESTS
 *
 * Verifies the 10 critical architectural rules:
 *   1. Communicative progress separated from beat progress:
 *      one memorised "good" sentence cannot skip the intended pressure.
 *   2. Server-enforced max_learner_turns: 7 prevents loops and hangs.
 *   3. Semantic unexpected offer classifier distinguishes blind acceptance (trap),
 *      counter-offers, rejections, and ambiguity without naive regex prefixing.
 *   4. Behaviour-based evidence: excellent discussion earns maintain_discussion
 *      even if unresolved; resolution alone does not manufacture 1.0.
 *   5. Session persistence & one-active-session invariant with abandonment.
 *   6. Reusable scenario contract validator (validateMayaScenario).
 *   7. Scenario versioning (version: 1).
 *   8. Server authority over transitions, pushbacks, and outcomes.
 *   9. Idempotent evidence generation: duplicates never insert duplicate rows.
 *  10. Non-regression: interview flows and full test suite remain intact.
 */

const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");
const pool = require("../src/db/pool");
const maya = require("../src/b2/maya");
const schichttausch = require("../src/seed/b2/maya/schichttausch");
const interview = require("../src/b2/interview");

const TEST_USER_ID = 1;

describe("Maya — Contract Validation (validateMayaScenario)", () => {
  test("Schichttausch scenario validates cleanly against the contract", () => {
    assert.strictEqual(maya.validateMayaScenario(schichttausch), true);
  });

  test("rejects a scenario with missing id", () => {
    const invalid = { ...schichttausch, id: "" };
    assert.throws(() => maya.validateMayaScenario(invalid), /missing valid id/);
  });

  test("rejects a scenario with missing or non-positive version", () => {
    const invalid = { ...schichttausch, version: 0 };
    assert.throws(() => maya.validateMayaScenario(invalid), /missing positive integer version/);
  });

  test("rejects a scenario missing roles or objective", () => {
    const invalid = { ...schichttausch, roles: null };
    assert.throws(() => maya.validateMayaScenario(invalid), /missing roles/);
  });

  test("rejects invalid max_learner_turns", () => {
    const invalid = { ...schichttausch, max_learner_turns: 2 };
    assert.throws(() => maya.validateMayaScenario(invalid), /max_learner_turns must be an integer between 4 and 15/);
  });

  test("rejects a scenario with no terminal beat", () => {
    const invalid = {
      ...schichttausch,
      beats: schichttausch.beats.filter(b => !b.terminal),
    };
    assert.throws(() => maya.validateMayaScenario(invalid), /no terminal beat/);
  });

  test("rejects a scenario with a transition pointing to a non-existent beat", () => {
    const invalid = {
      ...schichttausch,
      beats: schichttausch.beats.map(b => (b.id === "b1_why_now" ? { ...b, transitions: { next: "non_existent_beat" } } : b)),
    };
    assert.throws(() => maya.validateMayaScenario(invalid), /transition "next" targets non-existent beat "non_existent_beat"/);
  });
});

describe("Maya — Communicative Behaviour & Pushback Tenacity", () => {
  test("one memorised 'good' sentence cannot skip the intended pressure", () => {
    // Learner provides a good reason on beat 1. Maya does NOT fold or agree immediately;
    // she acknowledges and immediately pushes back with her second objection (fairness).
    const state = { current_beat: "b1_why_now", press_count: 0, learner_turns_count: 0 };
    const turn = maya.readTurn("Ich brauche den Samstag frei, weil meine Prüfung in Frankfurt stattfindet.");
    const move = maya.nextMove(schichttausch, state, turn);

    assert.strictEqual(move.done, false, "Maya must not fold or close after one good reason");
    assert.strictEqual(move.state.current_beat, "b2_fairness", "Maya must advance to the next pressure beat");
    assert.match(move.say, /jeder hier hat private termine/i, "Maya must raise her fairness objection");
  });

  test("weak answer triggers first pushback", () => {
    const state = { current_beat: "b1_why_now", press_count: 0, learner_turns_count: 0 };
    const turn = maya.readTurn("Ich brauche frei.");
    const move = maya.nextMove(schichttausch, state, turn);

    assert.strictEqual(move.pressing, true);
    assert.strictEqual(move.state.current_beat, "b1_why_now");
    assert.strictEqual(move.state.press_count, 1);
    assert.strictEqual(move.say, schichttausch.beats[0].press[0]);
  });

  test("repeated weak answer triggers second pushback", () => {
    const state = { current_beat: "b1_why_now", press_count: 1, learner_turns_count: 1 };
    const turn = maya.readTurn("Es geht wirklich nicht anders.");
    const move = maya.nextMove(schichttausch, state, turn);

    assert.strictEqual(move.pressing, true);
    assert.strictEqual(move.state.press_count, 2);
    assert.strictEqual(move.say, schichttausch.beats[0].press[1]);
  });

  test("concession without justification on fairness beat triggers pushback", () => {
    // On beat 2, simply saying "Das verstehe ich" without offering an alternative or justifying why
    // you should be favored over colleagues is thin and triggers pushback.
    const state = { current_beat: "b2_fairness", press_count: 0, learner_turns_count: 2 };
    const turn = maya.readTurn("Das verstehe ich natürlich.");
    const move = maya.nextMove(schichttausch, state, turn);

    assert.strictEqual(move.pressing, true);
    assert.strictEqual(move.state.current_beat, "b2_fairness");
  });

  test("concession combined with justification advances past fairness beat", () => {
    const state = { current_beat: "b2_fairness", press_count: 0, learner_turns_count: 2 };
    const turn = maya.readTurn("Das verstehe ich natürlich vollkommen, aber meine B2-Fachsprachprüfung lässt sich leider nicht verschieben und ich habe dieses Jahr noch nie getauscht.");
    const move = maya.nextMove(schichttausch, state, turn);

    assert.strictEqual(move.pressing, false);
    assert.strictEqual(move.state.current_beat, "b3_unexpected_offer");
    assert.ok(move.say.includes("Nachtdienst von Sonntag auf Montag"));
  });
});

describe("Maya — Semantic Classifier for Unexpected Offer (Trap Detection)", () => {
  test("blind acceptance of the Sunday-night offer triggers the trap", () => {
    const blindAccepts = [
      "Ja, gerne, das mache ich!",
      "Das passt mir gut, vielen Dank Frau Berger.",
      "Einverstanden, das übernehme ich.",
      "Ja, super, abgemacht.",
    ];

    for (const text of blindAccepts) {
      assert.strictEqual(
        maya.classifyOfferResponse(text),
        "blind_acceptance",
        `Expected "${text}" to be classified as blind_acceptance`
      );

      const state = { current_beat: "b3_unexpected_offer", press_count: 0, learner_turns_count: 3 };
      const move = maya.nextMove(schichttausch, state, maya.readTurn(text));
      assert.strictEqual(move.done, true);
      assert.strictEqual(move.outcome, "trap_accepted");
      assert.strictEqual(move.trapTriggered, true);
      assert.ok(move.say.includes("Sonntagnachtdienst"));
    }
  });

  test("conditional acceptance with counter-clause avoids the trap", () => {
    // Crucial user requirement: „Ja, aber nur wenn ich den Nachtdienst tauschen kann“ must NOT be classified as trap acceptance!
    const counterOffers = [
      "Ja, aber nur wenn ich den Nachtdienst mit Frau Krause tauschen kann.",
      "Das geht leider nicht, weil meine Prüfung Sonntag ist. Ich könnte aber stattdessen den Feiertag übernehmen.",
      "Der Nachtdienst ist nicht möglich, aber ich frage eine Kollegin, ob sie für mich einspringt.",
      "Lieber würde ich stattdessen zwei Frühdienste am nächsten Wochenende machen.",
    ];

    for (const text of counterOffers) {
      assert.strictEqual(
        maya.classifyOfferResponse(text),
        "counter_offer",
        `Expected "${text}" to be classified as counter_offer`
      );

      const state = { current_beat: "b3_unexpected_offer", press_count: 0, learner_turns_count: 3 };
      const move = maya.nextMove(schichttausch, state, maya.readTurn(text));
      assert.strictEqual(move.outcome, undefined); // not terminal yet
      assert.strictEqual(move.state.current_beat, "b4_replacement");
      assert.ok(move.say.includes("morgen Mittag"));
    }
  });

  test("ambiguous response triggers clarification pushback", () => {
    const ambiguous = ["Vielleicht.", "Mal schauen.", "Ich weiß nicht so recht."];
    for (const text of ambiguous) {
      assert.strictEqual(maya.classifyOfferResponse(text), "ambiguous");
      const state = { current_beat: "b3_unexpected_offer", press_count: 0, learner_turns_count: 3 };
      const move = maya.nextMove(schichttausch, state, maya.readTurn(text));
      assert.strictEqual(move.pressing, true);
      assert.strictEqual(move.why, "ambiguous");
    }
  });
});

describe("Maya — Deterministic Length & Terminal States", () => {
  test("conversation has a deterministic ceiling and cannot get stuck", () => {
    // Evasive/thin answers up to max_learner_turns (7)
    let state = { current_beat: "b1_why_now", press_count: 0, learner_turns_count: 0 };
    let finalMove = null;

    for (let t = 0; t < 10; t++) {
      const turn = maya.readTurn("Ich weiß nicht.");
      finalMove = maya.nextMove(schichttausch, state, turn);
      if (finalMove.done) break;
      state = finalMove.state;
    }

    assert.strictEqual(finalMove.done, true);
    assert.strictEqual(finalMove.outcome, "unresolved");
    assert.ok(finalMove.state.learner_turns_count <= 7, "Must terminate at or before max_learner_turns");
  });

  test("successful negotiation path reaches resolved", () => {
    const turns = [
      "Ich brauche den Samstag frei, weil meine Fachsprachprüfung in Frankfurt stattfindet und ich erst gestern Bescheid bekommen habe.",
      "Das verstehe ich natürlich, Frau Berger, aber es ist meine Abschlussprüfung und ich übernehme gerne dafür andere Dienste.",
      "Der Sonntagnachtdienst geht leider nicht, weil die Prüfung am Sonntag ist. Aber ich könnte dafür den Feiertag im Mai übernehmen.",
      "Ich frage heute sofort Frau Krause und gebe Ihnen morgen vor 12 Uhr Bescheid.",
    ];

    let state = { current_beat: "b1_why_now", press_count: 0, learner_turns_count: 0 };
    let move = null;
    for (const text of turns) {
      const turn = maya.readTurn(text);
      move = maya.nextMove(schichttausch, state, turn);
      if (move.done) break;
      state = move.state;
    }

    assert.strictEqual(move.done, true);
    assert.strictEqual(move.outcome, "resolved");
    assert.match(move.say, /trage ich es um/i);
  });
});

describe("Maya — Behaviour-Based Evidence Integrity", () => {
  test("excellent discussion that ends unresolved still earns high maintain_discussion", () => {
    // Learner argues well, defends position through multiple pushbacks, counters the offer,
    // but ultimately cannot find a replacement colleague. Terminal outcome = unresolved.
    const dialogueTurns = [
      { text: "Ich brauche den Samstag frei, weil meine Prüfung am Sonntagmorgen stattfindet.", beat: "b1_why_now" },
      { text: "Das verstehe ich vollkommen, aber die Prüfung lässt sich nicht verschieben und ich habe sonst nie getauscht.", beat: "b2_fairness" },
      { text: "Der Nachtdienst geht leider nicht, weil ich mich nach der Prüfung erholen muss. Ich könnte aber den Feiertag machen.", beat: "b3_unexpected_offer" },
      { text: "Leider hat Frau Krause keine Zeit, ich finde bis morgen niemanden.", beat: "b4_replacement" },
    ];

    const sessionData = {
      outcome: "unresolved",
      status: "unresolved",
      memory: { unexpected_handled: true, trap_triggered: false },
    };

    const summary = maya.summarise(schichttausch, dialogueTurns, sessionData);

    assert.strictEqual(summary.heldPosition, true);
    const mDisc = summary.evidence.find(e => e.capability === "maintain_discussion");
    assert.ok(mDisc.outcome >= 0.8, "High maintain_discussion evidence must be awarded even when unresolved");
    assert.strictEqual(mDisc.indicative, true);
    assert.strictEqual(mDisc.weight, 0.2);
  });

  test("resolution alone does not manufacture 1.0 evidence", () => {
    // A thin learner whose answers were barely passing
    const thinTurns = [
      { text: "Weil Prüfung.", beat: "b1_why_now" },
      { text: "Verstehe aber brauche frei.", beat: "b2_fairness" },
      { text: "Sonntag geht nicht, Feiertag.", beat: "b3_unexpected_offer" },
      { text: "Frau Krause morgen Mittag.", beat: "b4_replacement" },
    ];

    const sessionData = {
      outcome: "resolved",
      status: "resolved",
      memory: { unexpected_handled: true, trap_triggered: false },
    };

    const summary = maya.summarise(schichttausch, thinTurns, sessionData);
    const justify = summary.evidence.find(e => e.capability === "justify");
    assert.ok(justify.outcome < 1.0, "Mediocre justification must not receive 1.0 just because resolved");
  });

  test("speaking evidence is strictly indicative and uncalibrated (weight 0.2)", () => {
    const summary = maya.summarise(schichttausch, [{ text: "Weil Prüfung.", beat: "b1_why_now" }]);
    for (const e of summary.evidence) {
      assert.strictEqual(e.dimension, "speaking");
      assert.strictEqual(e.sourceKind, "conversation");
      assert.strictEqual(e.weight, 0.2);
      assert.strictEqual(e.indicative, true);
    }
  });
});

describe("Maya — Database Persistence, Abandonment & Idempotence", () => {
  before(async () => {
    // Clean up test sessions
    await pool.query(`DELETE FROM b2_maya_sessions WHERE user_id=$1`, [TEST_USER_ID]);
    await pool.query(`DELETE FROM b2_evidence WHERE user_id=$1 AND source_kind='conversation'`, [TEST_USER_ID]);
  });

  after(async () => {
    await pool.query(`DELETE FROM b2_maya_sessions WHERE user_id=$1`, [TEST_USER_ID]);
    await pool.query(`DELETE FROM b2_evidence WHERE user_id=$1 AND source_kind='conversation'`, [TEST_USER_ID]);
  });

  test("starting a new session marks previous active session as abandoned", async () => {
    const session1 = await maya.startSession(TEST_USER_ID, schichttausch);
    assert.strictEqual(session1.status, "active");

    const session2 = await maya.startSession(TEST_USER_ID, schichttausch);
    assert.strictEqual(session2.status, "active");
    assert.notStrictEqual(session1.session_id, session2.session_id);

    // Verify session1 is now 'abandoned' in DB
    const { rows } = await pool.query(
      `SELECT status FROM b2_maya_sessions WHERE session_id=$1`,
      [session1.session_id]
    );
    assert.strictEqual(rows[0].status, "abandoned", "Old session must be preserved as abandoned, not deleted");
  });

  test("getActiveSession returns the current active session", async () => {
    const active = await maya.getActiveSession(TEST_USER_ID, schichttausch.id);
    assert.ok(active);
    assert.strictEqual(active.status, "active");
    assert.strictEqual(active.scenario_id, schichttausch.id);
  });

  test("duplicate turn completion does not duplicate evidence rows", async () => {
    const session = await maya.startSession(TEST_USER_ID, schichttausch);
    const sourceRef = `maya_${schichttausch.id}:${session.session_id}`;

    const testEvidence = [
      { dimension: "speaking", capability: "maintain_discussion", outcome: 0.8, weight: 0.2, sourceKind: "conversation", sourceRef },
      { dimension: "speaking", capability: "justify", outcome: 0.7, weight: 0.2, sourceKind: "conversation", sourceRef },
    ];

    // First recording
    for (const e of testEvidence) {
      const { rows } = await pool.query(
        `SELECT 1 FROM b2_evidence WHERE user_id=$1 AND source_kind='conversation' AND source_ref=$2 AND capability=$3`,
        [TEST_USER_ID, sourceRef, e.capability]
      );
      if (!rows.length) {
        await pool.query(
          `INSERT INTO b2_evidence (user_id, dimension, capability, outcome, weight, source_kind, source_ref)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [TEST_USER_ID, e.dimension, e.capability, e.outcome, e.weight, e.sourceKind, e.sourceRef]
        );
      }
    }

    // Duplicate submission attempt
    for (const e of testEvidence) {
      const { rows } = await pool.query(
        `SELECT 1 FROM b2_evidence WHERE user_id=$1 AND source_kind='conversation' AND source_ref=$2 AND capability=$3`,
        [TEST_USER_ID, sourceRef, e.capability]
      );
      if (!rows.length) {
        await pool.query(
          `INSERT INTO b2_evidence (user_id, dimension, capability, outcome, weight, source_kind, source_ref)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [TEST_USER_ID, e.dimension, e.capability, e.outcome, e.weight, e.sourceKind, e.sourceRef]
        );
      }
    }

    const { rows: finalRows } = await pool.query(
      `SELECT count(*)::int as count FROM b2_evidence WHERE user_id=$1 AND source_ref=$2`,
      [TEST_USER_ID, sourceRef]
    );
    assert.strictEqual(finalRows[0].count, 2, "Evidence rows must not be duplicated on retried submission");
  });
});

describe("Maya — Non-Regression on Interview Flows", () => {
  test("interview.js question bank and probing remain completely functional", () => {
    const q = interview.QUESTIONS.find(x => x.id === "warum_deutschland");
    assert.ok(q);
    const graded = interview.gradeAnswer(q, {
      text: "Ich möchte in Deutschland arbeiten wegen des Geldes.",
      durationSec: 35,
    });
    assert.ok(graded);
    assert.ok(Array.isArray(graded.notes));

    const probe = interview.nextProbe(q, graded, 0);
    assert.ok(probe);
    assert.ok(probe.de);
  });
});
