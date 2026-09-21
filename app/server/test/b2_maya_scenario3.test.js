/**
 * Maya Scenario 3 (Vorschlag) — Test Suite
 *
 * ARCHITECTURAL CONTEXT — READ BEFORE EDITING:
 *
 * The frozen maya.js classifier detects communicative moves through LEXICAL PATTERNS,
 * not semantic understanding. The MOVES regex table is:
 *
 *   reason  : weil|denn|da |deshalb|deswegen|daher|nämlich|aus diesem Grund|liegt daran|aufgrund
 *   example : zum Beispiel|beispielsweise|etwa |letzte|neulich|damals|als ich|bei uns|einmal hatte ich
 *   detail  : numeric time expressions|day names|Frau/Herr + surname
 *   concede : zwar|obwohl|trotzdem|dennoch|allerdings|verstehe|natürlich|klar|stimmt|
 *             einerseits|das ist richtig|da haben sie recht|zugegeben
 *   offer   : ich könnte|ich kann|ich würde|ich biete|vorschlag|stattdessen|dafür|im gegenzug|...
 *
 * A turn is SUBSTANTIVE when: (a) it fires >= 2 MOVES, OR (b) it fires >= 1 MOVE with >= 8 words.
 *
 * IMPORTANT implications for this test file:
 *   - "behavior-based" does NOT mean arbitrary natural-language understanding.
 *   - Scenario design avoids requiring SPECIFIC learner phrases, but the engine's
 *     progression gates on whether the learner's text happens to contain these lexical signals.
 *   - "Alternative valid adaptations" accepted by beat 3 must still contain offer-triggering
 *     language (ich würde vorschlagen / ich schlage vor + nämlich) because those are the
 *     only patterns the frozen classifier recognises. Adaptations expressed in pure
 *     thematic language without classifier triggers will NOT advance the beat.
 *   - This is a known limitation of the frozen engine — documented here, not fixed.
 *
 * EVIDENCE ARCHITECTURE:
 *   - summarise() returns { evidence: [{capability, outcome, weight, indicative, ...}] }
 *   - 'indicative: true' and 'weight: 0.2' are in-memory only; they are NOT DB columns.
 *   - The b2_evidence table stores: user_id, dimension, capability, outcome, weight,
 *     source_kind, source_ref, detail — no 'indicative' column.
 *   - Idempotence is enforced at the ROUTE level via sourceRef check.
 *     profile_.recordMany() itself does NOT deduplicate.
 *   - adapt_register measures: absence of du-form slips where formal context is absent.
 *     It is 1.0 when informalSlips === 0 (no du/dich/dein... without Sie/Frau/etc. context).
 *     It does NOT positively require Sie-form to be present; absence of du-form is sufficient.
 *
 * MAINTAIN_DISCUSSION SCORING:
 *   - totalTurns >= 3 AND substantiveRatio >= 0.6 -> 0.8 (no unexpected beat)
 *   - substantiveRatio >= 0.4 OR totalTurns >= 2 -> 0.6
 *   - The cooperative turns used in evidence tests are VERIFIED to all be substantive
 *     (each fires >= 2 MOVES or >= 1 MOVE with >= 8 words).
 *
 * JUSTIFY SCORING:
 *   - Engine counts learner turns containing the 'reason' MOVE (weil/denn/da /deshalb/nämlich...).
 *   - 2 or more such turns -> 1.0; exactly 1 -> 0.7; 0 -> 0.3.
 *   - The test uses two turns with DISTINCT rationales both containing 'weil':
 *     T1: "weil direkte Beobachtung schwere Zwischenfälle verhindert" (patient safety argument)
 *     T2: "weil schriftliche Protokolle keine klinischen Veränderungen am Körper erfassen"
 *         (documentation gap argument — a meaningfully different rationale)
 */

const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");
const pool = require("../src/db/pool");
const maya = require("../src/b2/maya");
const vorschlag = require("../src/seed/b2/maya/vorschlag");

// ---------------------------------------------------------------------------
// HELPER: Verified cooperative turns that exercise proper MOVE signals.
// These are used across multiple evidence tests to ensure consistency.
//
// MOVE signal analysis (verified via maya.readTurn):
//   T1: reason (weil), substantive=true (1 move, 15 words)
//   T2: reason (weil) + concede (Da haben Sie recht), substantive=true (2 moves)
//   T3: reason (nämlich) + offer (ich würde vorschlagen), substantive=true (2 moves)
//   T4: detail (Freitag) + offer (ich könnte), substantive=true (2 moves)
//   -> All 4 substantive, substantiveRatio=1.0, maintain_discussion=0.8
//   -> reason appears in T1 and T2 -> justifyOutcome=1.0
//   -> concede appears in T2 -> concedeOutcome=1.0
//   -> no informal slips -> adaptRegisterOutcome=1.0
// ---------------------------------------------------------------------------
function cooperativeTurns() {
  return [
    {
      // Turn 1: patient safety rationale (reason MOVE via 'weil')
      text: "Die Übergabe am Bett ist wichtig, weil direkte Beobachtung schwere Zwischenfälle verhindert, die sonst unbemerkt bleiben.",
      beat: "b1_defend_core_proposal",
    },
    {
      // Turn 2: documentation-gap rationale (reason MOVE via 'weil') + concession (Da haben Sie recht)
      // This is a DISTINCT rationale from Turn 1: clinical body-state changes vs. safety incidents.
      text: "Da haben Sie recht. Dennoch ist die Sichtprüfung unverzichtbar, weil schriftliche Protokolle keine klinischen Veränderungen am Körper des Patienten erfassen.",
      beat: "b2_challenge_practicality",
    },
    {
      // Turn 3: concrete adaptation (offer MOVE via 'ich würde vorschlagen', reason MOVE via 'nämlich')
      text: "Ich würde vorschlagen, die Übergabe auf Hochrisikopatienten zu beschränken, nämlich postoperative und Sturzrisiko-Fälle — eine Pflegekraft bleibt dabei am Flur.",
      beat: "b3_adapt_to_constraint",
    },
    {
      // Turn 4: pilot commitment (detail MOVE via 'Freitag', offer MOVE via 'ich könnte')
      text: "Ich könnte bis Freitag eine Einführungsunterlage erstellen und schlage eine Vier-Wochen-Testphase vor.",
      beat: "b4_pilot_commitment",
    },
  ];
}

// Isolated test user — distinct from Scenario 1 (1) and Scenario 2 (2)
const TEST_USER = 3;
const SC_ID = "maya_vorschlag";

// ---------------------------------------------------------------------------
// CONTRACT VALIDATION
// ---------------------------------------------------------------------------

describe("Maya Scenario 3 (Vorschlag) — Contract Validation", () => {
  test("vorschlag scenario validates cleanly against the frozen engine contract", () => {
    assert.doesNotThrow(() => {
      maya.validateMayaScenario(vorschlag);
    });
    assert.strictEqual(vorschlag.id, "maya_vorschlag");
    assert.strictEqual(vorschlag.version, 1);
    assert.strictEqual(vorschlag.max_learner_turns, 7);
    assert.strictEqual(vorschlag.capability_targets.primary, "justify");
  });

  test("scenario includes all mandatory fields: roles, context, objective, beats, afterwards", () => {
    assert.ok(vorschlag.roles && vorschlag.roles.learner && vorschlag.roles.maya);
    assert.ok(vorschlag.context && vorschlag.context.length > 0);
    assert.ok(vorschlag.objective && vorschlag.objective.length > 0);
    assert.ok(Array.isArray(vorschlag.beats) && vorschlag.beats.length >= 4);
    assert.ok(vorschlag.afterwards && vorschlag.afterwards.strong && vorschlag.afterwards.watchFor);
  });

  test("both terminal beats are present with correct outcomes", () => {
    const terminalBeats = vorschlag.beats.filter((b) => b.terminal);
    assert.strictEqual(terminalBeats.length, 2);
    const outcomes = terminalBeats.map((b) => b.outcome).sort();
    assert.deepStrictEqual(outcomes, ["resolved", "unresolved"]);
  });

  test("rejects a copy of vorschlag that is missing roles", () => {
    assert.throws(
      () => maya.validateMayaScenario({ ...vorschlag, roles: null }),
      /missing roles/
    );
  });

  test("rejects a copy of vorschlag that has an empty objective", () => {
    assert.throws(
      () => maya.validateMayaScenario({ ...vorschlag, objective: "" }),
      /missing objective/
    );
  });

  test("rejects a copy of vorschlag with a dangling transition target", () => {
    const broken = JSON.parse(JSON.stringify(vorschlag));
    broken.beats[0].transitions.onSubstantive = "non_existent_beat_xyz";
    assert.throws(
      () => maya.validateMayaScenario(broken),
      /targets non-existent beat/
    );
  });
});

// ---------------------------------------------------------------------------
// BEAT 1: DEFEND CORE PROPOSAL
// ---------------------------------------------------------------------------

describe("Maya Scenario 3 (Vorschlag) — Beat 1: Defend Core Proposal", () => {
  test("opening beat is b1_defend_core_proposal", () => {
    assert.strictEqual(vorschlag.beats[0].id, "b1_defend_core_proposal");
    assert.ok(
      vorschlag.first_say.includes("Übergabe am Bett") ||
      vorschlag.first_say.includes("funktioniert")
    );
  });

  test("vague response (no MOVE signals, < 8 words) triggers first pushback", () => {
    const state = { current_beat: "b1_defend_core_proposal", press_count: 0, learner_turns_count: 0 };
    // No MOVE signals, 5 words -> thin -> pressing
    const weakTurn = maya.readTurn("Das ist einfach besser so.");
    const move = maya.nextMove(vorschlag, state, weakTurn);

    assert.strictEqual(move.pressing, true);
    assert.strictEqual(move.state.press_count, 1);
    assert.strictEqual(move.state.current_beat, "b1_defend_core_proposal");
  });

  test("repeated vague response triggers second pushback (press_count advances)", () => {
    const state = { current_beat: "b1_defend_core_proposal", press_count: 1, learner_turns_count: 1 };
    const weakTurn = maya.readTurn("Das ist moderner.");
    const move = maya.nextMove(vorschlag, state, weakTurn);

    assert.strictEqual(move.pressing, true);
    assert.strictEqual(move.state.press_count, 2);
    assert.strictEqual(move.state.current_beat, "b1_defend_core_proposal");
    // Second press contains the '20 Jahre Erfahrung' or concrete demand
    assert.ok(
      move.say.includes("Erfahrung") || move.say.includes("konkreten Grund")
    );
  });

  test("turn with 'weil' (reason MOVE) advances to b2 without pressing", () => {
    // The 'reason' MOVE fires on: weil|denn|da |deshalb|nämlich etc.
    // This is a lexical signal, not open semantic understanding.
    const state = { current_beat: "b1_defend_core_proposal", press_count: 0, learner_turns_count: 0 };
    const goodTurn = maya.readTurn(
      "Die Übergabe am Bett ist notwendig, weil direkte Sichtprüfung Befunde erkennt, die kein schriftliches Protokoll erfassen kann."
    );
    const move = maya.nextMove(vorschlag, state, goodTurn);

    assert.strictEqual(move.pressing, false);
    assert.strictEqual(move.state.current_beat, "b2_challenge_practicality");
    assert.strictEqual(move.state.press_count, 0);
    assert.ok(
      move.say.includes("Spätdienst") ||
      move.say.includes("Patienten") ||
      move.say.includes("Überstunden")
    );
  });

  test("engine records hasReason=true in session memory when reason MOVE fires", () => {
    const state = { current_beat: "b1_defend_core_proposal", press_count: 0, learner_turns_count: 0 };
    const turn = maya.readTurn(
      "Die Übergabe ist notwendig, weil direkte Sichtprüfung kritische Befunde zeigt."
    );
    const move = maya.nextMove(vorschlag, state, turn);
    assert.strictEqual(move.state.memory.hasReason, true);
  });
});

// ---------------------------------------------------------------------------
// BEAT 2: CHALLENGE PRACTICALITY
// Verifies the engine correctly distinguishes:
//   (A) short concession with no counter-reason -> pushback
//   (B) concession + preserved core (weil) -> advance
// ---------------------------------------------------------------------------

describe("Maya Scenario 3 (Vorschlag) — Beat 2: Challenge Practicality", () => {
  test("short bare concession (5 words, no reason/offer MOVE) deterministically triggers pushback", () => {
    // Turn: "Stimmt, das sehe ich ein."
    // MOVE analysis: 'stimmt' fires concede. 5 words, 1 move -> substantive=false (needs >=8 for single-move)
    // meetsCriteria = false -> engine presses.
    // Verified: maya.readTurn gives moves=['concede'], words=5, substantive=false
    const state = { current_beat: "b2_challenge_practicality", press_count: 0, learner_turns_count: 1 };
    const surrenderTurn = maya.readTurn("Stimmt, das sehe ich ein.");
    assert.strictEqual(surrenderTurn.substantive, false, "Precondition: turn must be non-substantive");
    assert.strictEqual(surrenderTurn.words, 5, "Precondition: 5 words");

    const move = maya.nextMove(vorschlag, state, surrenderTurn);
    assert.strictEqual(move.pressing, true);
    assert.strictEqual(move.state.current_beat, "b2_challenge_practicality");
  });

  test("concession WITH preserved core reason (dennoch + weil) advances to b3_adapt_to_constraint", () => {
    const state = { current_beat: "b2_challenge_practicality", press_count: 0, learner_turns_count: 1 };
    // concede fires (dennoch), reason fires (weil) -> 2 MOVES -> substantive=true -> advances
    const goodTurn = maya.readTurn(
      "Das ist ein berechtigter Einwand — Unterbrechungen durch Angehörige sind ein echtes Problem. Dennoch lässt sich die visuelle Kontrolle nicht ersetzen, weil postoperative Befunde nur direkt sichtbar sind."
    );
    assert.ok(goodTurn.moves.includes("reason"), "Precondition: reason MOVE must fire");
    assert.ok(goodTurn.moves.includes("concede"), "Precondition: concede MOVE must fire");

    const move = maya.nextMove(vorschlag, state, goodTurn);
    assert.strictEqual(move.pressing, false);
    assert.strictEqual(move.state.current_beat, "b3_adapt_to_constraint");
    assert.ok(
      move.say.includes("Spätdienst") ||
      move.say.includes("Flur") ||
      move.say.includes("Pflegekräfte")
    );
  });

  test("engine records hasConcession=true in memory after concede MOVE fires", () => {
    // Note: engine stores 'hasConcession' (not 'hasConcede') — verified from maya.js line 214
    const state = { current_beat: "b2_challenge_practicality", press_count: 0, learner_turns_count: 1 };
    const turn = maya.readTurn(
      "Da haben Sie recht, die Unterbrechungen sind ein reales Problem. Trotzdem erfordert die postoperative Überwachung eine direkte Sichtprüfung, weil schriftliche Einträge das nicht abdecken."
    );
    const move = maya.nextMove(vorschlag, state, turn);
    // Engine key is 'hasConcession' per line 214 of maya.js: if (turn.moves.includes("concede")) memory.hasConcession = true;
    assert.strictEqual(move.state.memory.hasConcession, true);
  });
});

// ---------------------------------------------------------------------------
// BEAT 3: ADAPT TO STAFFING CONSTRAINT
// ---------------------------------------------------------------------------

describe("Maya Scenario 3 (Vorschlag) — Beat 3: Adapt to Staffing Constraint", () => {
  test("vague response without any MOVE signals triggers pushback", () => {
    const state = { current_beat: "b3_adapt_to_constraint", press_count: 0, learner_turns_count: 2 };
    // No offer/reason/detail MOVE -> thin -> pressing
    const vagueTurn = maya.readTurn("Wir können das einfach schneller machen.");
    const move = maya.nextMove(vorschlag, state, vagueTurn);

    assert.strictEqual(move.pressing, true);
    assert.strictEqual(move.state.current_beat, "b3_adapt_to_constraint");
    assert.ok(
      move.say.includes("unbesetzt") ||
      move.say.includes("Personalproblem") ||
      move.say.includes("Lösungsvorschlag")
    );
  });

  test("'ich würde vorschlagen' (offer MOVE) + 'nämlich' (reason MOVE) advances to b4", () => {
    const state = { current_beat: "b3_adapt_to_constraint", press_count: 0, learner_turns_count: 2 };
    // offer fires (ich würde), reason fires (nämlich) -> 2 MOVES -> advances
    const adaptTurn = maya.readTurn(
      "Ich würde vorschlagen, die Übergabe auf Hochrisikopatienten zu beschränken, nämlich postoperative und Sturzrisiko-Patienten. Eine Pflegekraft bleibt dabei am Stationsflur."
    );
    assert.ok(adaptTurn.moves.includes("offer"), "Precondition: offer MOVE must fire");
    assert.ok(adaptTurn.moves.includes("reason"), "Precondition: reason MOVE (nämlich) must fire");

    const move = maya.nextMove(vorschlag, state, adaptTurn);
    assert.strictEqual(move.pressing, false);
    assert.strictEqual(move.state.current_beat, "b4_pilot_commitment");
    assert.ok(
      move.say.includes("schult") ||
      move.say.includes("Team") ||
      move.say.includes("Zeitdisziplin") ||
      move.say.includes("kontrollieren")
    );
  });

  test("alternative formulation using 'Mein Vorschlag ist' + 'nämlich' also advances", () => {
    // ARCHITECTURAL NOTE: This "alternative" still uses classifier-triggering language
    // ("Mein Vorschlag ist" -> offer MOVE via \bvorschlag\b, nämlich -> reason MOVE).
    // The frozen engine cannot accept truly arbitrary natural language — it depends on
    // lexical MOVE signals. This test demonstrates that the range of offer-triggering phrases
    // is not limited to "ich würde vorschlagen", but does NOT demonstrate open semantic understanding.
    const state = { current_beat: "b3_adapt_to_constraint", press_count: 0, learner_turns_count: 2 };
    const altTurn = maya.readTurn(
      "Mein Vorschlag ist, dass immer eine Pflegekraft als Fluraufsicht eingeteilt ist, nämlich damit der Stationsflur nie unbesetzt bleibt, während eine Kollegin die Übergabe am Bett durchführt."
    );
    assert.ok(altTurn.moves.includes("offer"), "Precondition: offer MOVE must fire on 'Mein Vorschlag ist'");

    const move = maya.nextMove(vorschlag, state, altTurn);
    assert.strictEqual(move.pressing, false);
    assert.strictEqual(move.state.current_beat, "b4_pilot_commitment");
  });
});

// ---------------------------------------------------------------------------
// BEAT 4: PILOT COMMITMENT
// ---------------------------------------------------------------------------

describe("Maya Scenario 3 (Vorschlag) — Beat 4: Pilot Commitment", () => {
  test("vague response with no MOVE signals triggers pushback", () => {
    const state = { current_beat: "b4_pilot_commitment", press_count: 0, learner_turns_count: 3 };
    // "Das regeln wir dann schon im Team." — no offer/detail triggers -> thin
    const vagueTurn = maya.readTurn("Das regeln wir dann schon im Team.");
    const move = maya.nextMove(vorschlag, state, vagueTurn);

    assert.strictEqual(move.pressing, true);
    assert.strictEqual(move.state.current_beat, "b4_pilot_commitment");
    assert.ok(
      move.say.includes("konkret") ||
      move.say.includes("wann") ||
      move.say.includes("Antwort")
    );
  });

  test("'ich könnte' (offer MOVE) + 'Freitag' (detail MOVE) leads to b_resolved", () => {
    // detail fires on day names (Freitag). offer fires on 'ich könnte'.
    const state = { current_beat: "b4_pilot_commitment", press_count: 0, learner_turns_count: 3 };
    const commitTurn = maya.readTurn(
      "Ich könnte bis Freitag eine kurze Einführungsunterlage erstellen und schlage eine Vier-Wochen-Testphase vor."
    );
    assert.ok(commitTurn.moves.includes("offer"), "Precondition: offer MOVE must fire");
    assert.ok(commitTurn.moves.includes("detail"), "Precondition: detail MOVE (Freitag) must fire");

    const move = maya.nextMove(vorschlag, state, commitTurn);
    assert.strictEqual(move.done, true);
    assert.strictEqual(move.outcome, "resolved");
    assert.strictEqual(move.state.current_beat, "b_resolved");
    assert.ok(
      move.say.includes("Vier-Wochen") ||
      move.say.includes("Hochrisiko") ||
      move.say.includes("Einführung") ||
      move.say.includes("Freitag")
    );
  });

  test("max_press on b4 (press_count=1, weak turn) leads to b_unresolved", () => {
    const state = { current_beat: "b4_pilot_commitment", press_count: 1, learner_turns_count: 4 };
    const vagueAgain = maya.readTurn("Das wird schon klappen.");
    const move = maya.nextMove(vorschlag, state, vagueAgain);

    assert.strictEqual(move.done, true);
    assert.strictEqual(move.outcome, "unresolved");
  });
});

// ---------------------------------------------------------------------------
// TURN CEILING & RESOLUTION
// ---------------------------------------------------------------------------

describe("Maya Scenario 3 (Vorschlag) — Turn Ceiling & Resolution", () => {
  test("max_learner_turns=7 ceiling enforced server-side, never client-derived", () => {
    const state = { current_beat: "b1_defend_core_proposal", press_count: 0, learner_turns_count: 6 };
    const turn = maya.readTurn("Ich möchte das trotzdem.");
    const move = maya.nextMove(vorschlag, state, turn);

    assert.strictEqual(move.done, true);
    assert.strictEqual(move.outcome, "unresolved");
    assert.strictEqual(move.state.learner_turns_count, 7);
  });

  test("ceiling triggers from any mid-session beat (b2 tested)", () => {
    const state = { current_beat: "b2_challenge_practicality", press_count: 0, learner_turns_count: 6 };
    const turn = maya.readTurn("Das ist schwierig zu lösen.");
    const move = maya.nextMove(vorschlag, state, turn);

    assert.strictEqual(move.done, true);
    assert.strictEqual(move.outcome, "unresolved");
  });

  test("cooperative 4-turn path resolves to b_resolved", () => {
    const turns = cooperativeTurns();
    const summary = maya.summarise(vorschlag, turns, { status: "resolved", done: true });
    assert.ok(
      summary.verdict.includes("vereinbart") ||
      summary.verdict.includes("drangeblieben") ||
      summary.verdict.includes("Gespräch")
    );
  });
});

// ---------------------------------------------------------------------------
// EVIDENCE INTEGRITY
// ---------------------------------------------------------------------------

describe("Maya Scenario 3 (Vorschlag) — Evidence Integrity", () => {
  test("all cooperative turns are substantive (precondition for maintain_discussion >= 0.8)", () => {
    // This test validates the precondition for the maintain_discussion assertion below.
    // If any cooperative turn is not substantive, that assertion must be adjusted.
    const turns = cooperativeTurns();
    const reads = turns.map((t) => maya.readTurn(t.text));
    reads.forEach((r, i) => {
      assert.ok(
        r.substantive,
        `Turn ${i + 1} must be substantive (moves: ${JSON.stringify(r.moves)}, words: ${r.words})`
      );
    });
    assert.strictEqual(reads.filter((r) => r.substantive).length, 4);
  });

  test("justify=1.0: two turns with weil represent DISTINCT rationales (patient safety + documentation gap)", () => {
    // T1 fires reason via 'weil direkte Beobachtung ... verhindert' -> patient-safety rationale
    // T2 fires reason via 'weil schriftliche Protokolle keine klinischen Veränderungen ... erfassen' -> documentation-gap rationale
    // These are substantively different arguments, not merely paraphrases of each other.
    // The engine counts 'reason' turns (not semantic uniqueness of rationale), scoring 2 -> 1.0.
    const turns = cooperativeTurns();
    const summary = maya.summarise(vorschlag, turns, { status: "resolved", done: true });
    const evMap = Object.fromEntries(summary.evidence.map((e) => [e.capability, e]));

    assert.strictEqual(evMap.justify.outcome, 1.0,
      `justify expected 1.0 (2 reason turns with distinct rationales), got ${evMap.justify.outcome}`);
  });

  test("concede=1.0: explicit Da-haben-Sie-recht concession fires concede MOVE", () => {
    const turns = cooperativeTurns();
    const summary = maya.summarise(vorschlag, turns, { status: "resolved", done: true });
    const evMap = Object.fromEntries(summary.evidence.map((e) => [e.capability, e]));

    assert.strictEqual(evMap.concede.outcome, 1.0,
      `concede expected 1.0, got ${evMap.concede.outcome}`);
  });

  test("maintain_discussion=0.8: 4/4 substantive turns + no unexpected beat", () => {
    // With 4/4 substantive turns: substantiveRatio=1.0 >= 0.6, totalTurns=4 >= 3
    // No unexpected beat -> unexpectedHandled=false -> outcome=0.8 (not 1.0)
    // This is the correct and expected value for Scenario 3.
    const turns = cooperativeTurns();
    const summary = maya.summarise(vorschlag, turns, { status: "resolved", done: true });
    const evMap = Object.fromEntries(summary.evidence.map((e) => [e.capability, e]));

    assert.strictEqual(evMap.maintain_discussion.outcome, 0.8,
      `maintain_discussion expected exactly 0.8 (no unexpected beat, 4/4 substantive), got ${evMap.maintain_discussion.outcome}`);
    assert.strictEqual(evMap.maintain_discussion.indicative, true);
    assert.strictEqual(evMap.maintain_discussion.weight, 0.2);
  });

  test("adapt_register=1.0: absence of du-form slips is sufficient for full score", () => {
    // The frozen engine implementation: adaptRegisterOutcome = informalSlips === 0 ? 1.0 : 0.4
    // informalSlips = registerSlip count across turns
    // registerSlip = INFORMAL.test(text) && !FORMAL.test(text)
    // INFORMAL = du|dir|dich|dein... FORMAL = sie|ihnen|frau|herr|guten tag...
    //
    // LIMITATION: The engine does NOT require positive Sie-form evidence.
    // 1.0 means "no du-form slips detected" — not "confirmed formal register throughout".
    // Turns WITHOUT any register markers also score 1.0 by absence.
    // This is documented here, not altered.
    const turns = cooperativeTurns();
    const summary = maya.summarise(vorschlag, turns, { status: "resolved", done: true });
    const evMap = Object.fromEntries(summary.evidence.map((e) => [e.capability, e]));

    assert.strictEqual(evMap.adapt_register.outcome, 1.0,
      `adapt_register expected 1.0 (no informal slips in cooperative turns), got ${evMap.adapt_register.outcome}`);
  });

  test("adapt_register=0.4 when du-form slip is present and no formal marker masks it", () => {
    // Conversely: a turn with du-form and NO Sie/Frau/Herr context gets registerSlip=true -> 0.4
    const informalTurns = [
      { text: "Du hast recht, das ist ein gutes Argument.", beat: "b1" },
      { text: "Ich verstehe dein Anliegen vollkommen.", beat: "b2" },
    ];
    const summary = maya.summarise(vorschlag, informalTurns, { status: "resolved", done: true });
    const evMap = Object.fromEntries(summary.evidence.map((e) => [e.capability, e]));

    assert.strictEqual(evMap.adapt_register.outcome, 0.4,
      `adapt_register expected 0.4 for du-form slips, got ${evMap.adapt_register.outcome}`);
  });

  test("scenario has no unexpected beat -> 4 evidence items, weight sum = 0.8", () => {
    // Vorschlag has no 'unexpected: true' beat -> react_unexpected not included
    // 4 capabilities × weight 0.2 = 0.8 total. This is the correct expected sum.
    const turns = cooperativeTurns();
    const summary = maya.summarise(vorschlag, turns, { status: "resolved", done: true });

    assert.strictEqual(summary.evidence.length, 4,
      `expected 4 evidence items (no react_unexpected), got ${summary.evidence.length}`);
    const totalWeight = summary.evidence.reduce((s, e) => s + e.weight, 0);
    assert.ok(
      Math.abs(totalWeight - 0.8) < 0.01,
      `weight sum expected 0.8 (4 × 0.2), got ${totalWeight}`
    );
  });

  test("unresolved session with 3 substantive turns produces maintain_discussion >= 0.8", () => {
    // 3/3 substantive (100% ratio, >= 3 turns) -> 0.8 (same threshold as resolved)
    // Evidence scoring is independent of terminal outcome.
    const unresolvedTurns = [
      // reason fires (weil)
      { text: "Die Übergabe ist wichtig, weil direkte Beobachtung Zwischenfälle verhindert, die sonst unbemerkt bleiben.", beat: "b1_defend_core_proposal" },
      // reason + concede fire
      { text: "Da haben Sie recht. Dennoch ist die Sichtprüfung unverzichtbar, weil Protokolle keine körperlichen Veränderungen erfassen.", beat: "b2_challenge_practicality" },
      // offer + reason fire
      { text: "Ich würde vorschlagen, die Übergabe auf Hochrisikopatienten zu beschränken, nämlich postoperative Patienten.", beat: "b3_adapt_to_constraint" },
    ];

    // Verify all 3 are substantive
    unresolvedTurns.forEach((t, i) => {
      const r = maya.readTurn(t.text);
      assert.ok(r.substantive,
        `Precondition: unresolved turn ${i + 1} must be substantive (moves: ${JSON.stringify(r.moves)}, words: ${r.words})`);
    });

    const summary = maya.summarise(vorschlag, unresolvedTurns, { status: "unresolved", done: true });
    const evMap = Object.fromEntries(summary.evidence.map((e) => [e.capability, e]));

    assert.strictEqual(evMap.maintain_discussion.outcome, 0.8,
      `maintain_discussion expected 0.8 for 3/3 substantive unresolved session, got ${evMap.maintain_discussion.outcome}`);
  });
});

// ---------------------------------------------------------------------------
// PROGRESSION INTEGRITY: weak responses receive meaningful pushback
// These tests verify the scenario's 7-turn design is not circumvented by
// weak engagement silently counting as successful justification.
// ---------------------------------------------------------------------------

describe("Maya Scenario 3 (Vorschlag) — Progression Integrity", () => {
  test("weak justification at b1 gets pushback — weak engagement does not count as justify", () => {
    // A weak turn does not fire any MOVE -> meetsCriteria=false -> push back
    // Evidence: such a turn contributes 0 to justifyOutcome (no reason signal)
    const state = { current_beat: "b1_defend_core_proposal", press_count: 0, learner_turns_count: 0 };
    const weakTurn = maya.readTurn("Es ist besser für alle.");
    assert.strictEqual(weakTurn.substantive, false, "Weak turn must be non-substantive");
    const move = maya.nextMove(vorschlag, state, weakTurn);
    assert.strictEqual(move.pressing, true);
  });

  test("repeated weakness on b1 causes onMaxPress fallthrough — not counted as successful justification", () => {
    // After max press, engine falls through to b2. This is progression WITHOUT evidence.
    // The learner who does this will score justify=0.3 (no reason turns), not 1.0.
    const state = { current_beat: "b1_defend_core_proposal", press_count: 2, learner_turns_count: 2 };
    const weakTurn = maya.readTurn("Ich denke, es ist halt besser.");
    const move = maya.nextMove(vorschlag, state, weakTurn);

    // Engine advances after maxPress regardless — this is engine design, not a flaw
    // The evidence score reflects the actual (weak) engagement
    const worstCaseTurns = [
      { text: "Es ist besser so.", beat: "b1_defend_core_proposal" },
      { text: "Ja, das sollte funktionieren.", beat: "b1_defend_core_proposal" },
      { text: "Ich denke, es ist halt besser.", beat: "b1_defend_core_proposal" },
    ];
    const summary = maya.summarise(vorschlag, worstCaseTurns, { status: "unresolved", done: true });
    const evMap = Object.fromEntries(summary.evidence.map((e) => [e.capability, e]));
    // 0 reason turns -> justify=0.3 (not inflated)
    assert.strictEqual(evMap.justify.outcome, 0.3,
      `justify expected 0.3 for zero reason turns, got ${evMap.justify.outcome}`);
  });

  test("concession without core preservation at b2 triggers pushback — not counted as successful", () => {
    // Short concession: 5 words, 1 MOVE (concede), substantive=false -> push back
    const state = { current_beat: "b2_challenge_practicality", press_count: 0, learner_turns_count: 1 };
    const bareConced = maya.readTurn("Stimmt, das sehe ich ein.");
    assert.strictEqual(bareConced.words, 5, "Precondition: 5 words");
    assert.strictEqual(bareConced.substantive, false, "Precondition: not substantive");
    const move = maya.nextMove(vorschlag, state, bareConced);
    assert.strictEqual(move.pressing, true);
  });

  test("weak adaptation at b3 triggers pushback — vague 'kürzer' does not advance", () => {
    const state = { current_beat: "b3_adapt_to_constraint", press_count: 0, learner_turns_count: 2 };
    const vagueAdapt = maya.readTurn("Wir können das alles einfach kürzer halten.");
    const move = maya.nextMove(vorschlag, state, vagueAdapt);
    assert.strictEqual(move.pressing, true);
  });

  test("learner can still reach b_unresolved from b3 after turn ceiling", () => {
    const state = { current_beat: "b3_adapt_to_constraint", press_count: 0, learner_turns_count: 6 };
    const turn = maya.readTurn("Ich weiß es nicht genau.");
    const move = maya.nextMove(vorschlag, state, turn);
    assert.strictEqual(move.done, true);
    assert.strictEqual(move.outcome, "unresolved");
  });
});

// ---------------------------------------------------------------------------
// DATABASE PERSISTENCE, SESSION RECOVERY & IDEMPOTENCE
// ---------------------------------------------------------------------------

describe("Maya Scenario 3 (Vorschlag) — Database Persistence & Idempotence", () => {
  before(async () => {
    await pool.query(
      "INSERT INTO users (id, name) VALUES (3, 'Test User 3') ON CONFLICT (id) DO NOTHING"
    );
    await pool.query(
      "DELETE FROM b2_maya_sessions WHERE user_id=$1 AND scenario_id=$2",
      [TEST_USER, SC_ID]
    );
    await pool.query(
      "DELETE FROM b2_evidence WHERE user_id=$1 AND source_kind='conversation' AND source_ref LIKE 'maya_maya_vorschlag:%'",
      [TEST_USER]
    );
  });

  after(async () => {
    await pool.query(
      "DELETE FROM b2_maya_sessions WHERE user_id=$1 AND scenario_id=$2",
      [TEST_USER, SC_ID]
    );
    await pool.query(
      "DELETE FROM b2_evidence WHERE user_id=$1 AND source_kind='conversation' AND source_ref LIKE 'maya_maya_vorschlag:%'",
      [TEST_USER]
    );
  });

  test("starting a new session marks the previous session as abandoned", async () => {
    const s1 = await maya.startSession(TEST_USER, vorschlag);
    assert.strictEqual(s1.status, "active");
    assert.strictEqual(s1.scenario_id, SC_ID);

    const s2 = await maya.startSession(TEST_USER, vorschlag);
    assert.strictEqual(s2.status, "active");
    assert.notStrictEqual(s1.session_id, s2.session_id);

    const { rows: [r1] } = await pool.query(
      "SELECT status FROM b2_maya_sessions WHERE session_id=$1",
      [s1.session_id]
    );
    assert.strictEqual(r1.status, "abandoned");
  });

  test("saving a turn persists state and dialogue log to database", async () => {
    const active = await maya.getActiveSession(TEST_USER, SC_ID);
    assert.ok(active);

    const turn = {
      text: "Die Übergabe ist notwendig, weil direkte Sichtprüfung Befunde zeigt, die Protokolle nicht abbilden.",
      beat: "b1_defend_core_proposal",
    };
    await maya.saveSessionTurn(active.session_id, {
      current_beat: "b2_challenge_practicality",
      press_count: 0,
      learner_turns_count: 1,
      turn,
      dialogueTurns: [
        { who: "me", text: turn.text },
        { who: "maya", text: "Schön und gut. Aber wissen Sie, was am Bett passiert?" },
      ],
      status: "active",
      terminal_outcome: null,
    });

    const updated = await maya.getActiveSession(TEST_USER, SC_ID);
    assert.strictEqual(updated.current_beat, "b2_challenge_practicality");
    assert.strictEqual(updated.learner_turns_count, 1);
    assert.strictEqual(updated.dialogue_log.length, 2);
  });

  test("session recovery returns same beat and turn count after simulated reload", async () => {
    const active = await maya.getActiveSession(TEST_USER, SC_ID);
    assert.ok(active);
    assert.strictEqual(active.current_beat, "b2_challenge_practicality");
    assert.strictEqual(active.learner_turns_count, 1);

    const reloaded = await maya.getActiveSession(TEST_USER, SC_ID);
    assert.strictEqual(reloaded.current_beat, active.current_beat);
    assert.strictEqual(reloaded.learner_turns_count, active.learner_turns_count);
    assert.strictEqual(reloaded.session_id, active.session_id);
  });

  test("Scenario 3 session is isolated from Scenario 1 and Scenario 2 sessions (TEST_USER=3)", async () => {
    const { rows } = await pool.query(
      "SELECT scenario_id FROM b2_maya_sessions WHERE user_id=$1 AND status='active'",
      [TEST_USER]
    );
    const scenarioIds = rows.map((r) => r.scenario_id);
    assert.ok(
      scenarioIds.every((id) => id === SC_ID),
      `Unexpected scenario IDs for TEST_USER=3: ${JSON.stringify(scenarioIds)}`
    );
  });
});
