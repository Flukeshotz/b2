/**
 * MAYA — the conversation engine.
 *
 * This is the only route to two capabilities: `maintain_discussion`
 * (Goethe's Durchhaltevermögen im Diskurs, and a named speaking criterion) and
 * `react_unexpected` (telc's unerwartete Gesprächsverläufe). Neither can be
 * trained by listening, reading, grammar or vocabulary, because both are
 * defined by what happens when somebody pushes back.
 *
 * Maya holds a firm POSITION. She does not fold after a single good answer.
 * Communicative progress is strictly separated from beat progress:
 * a learner must hold their position under pressure across turns.
 *
 * Reusable contract, schema validation, session persistence with recovery,
 * semantic unexpected offer classification, and behavior-based evidence.
 */

const pool = require("../db/pool");
const caps = require("./capabilities");

const MOVES = {
  reason:  { de: "Begründung",  test: /\b(weil|denn|da\s|deshalb|deswegen|daher|nämlich|aus diesem Grund|liegt daran|aufgrund)\b/i },
  example: { de: "Beispiel",    test: /\b(zum beispiel|beispielsweise|etwa\s|letzte[ns]|neulich|damals|als ich|bei uns|einmal hatte ich)\b/i },
  detail:  { de: "Konkretes",   test: /\b(\d{1,2}[:.]\d{2}|\d+\s*(uhr|tage|stunden|wochen|monate|jahre|prozent)|montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag|morgen|übermorgen|mittag|vormittag|nachmittag|abend|nacht)\b|\b(frau|herr[n]?)\s+[A-ZÄÖÜ]\w+/i },
  concede: { de: "Einräumen",   test: /\b(zwar|obwohl|trotzdem|dennoch|allerdings|verstehe|natürlich|klar|stimmt|einerseits|das ist richtig|da haben sie recht|zugegeben)\b/i },
  offer:   { de: "Angebot",     test: /\b(ich (könnte|kann|würde|biete|frage|kläre|melde|organisiere|suche|übernehme)|wir könnten|vorschlag|stattdessen|dafür|im gegenzug|melde mich)\b/i },
};

const ENGLISH = /\b(the|and|but|because|would|should|could|i think|sorry|please|maybe|actually)\b/gi;
const INFORMAL = /\b(du|dir|dich|dein|deine|deinem|deinen|deiner|deines|euch|euer|eure|eurem|euren|eurer|eures|hey|hallo|tschüss)\b/i;
const FORMAL = /\b(sie|ihnen|ihr|ihre|ihrem|ihren|ihrer|ihres|herr|herrn|frau|guten tag|auf wiedersehen)\b/i;

/**
 * Validate a Maya scenario declaration.
 * Rejects invalid scenarios at seed/build time so scenarios remain declarative data.
 */
function validateMayaScenario(sc) {
  if (!sc || typeof sc !== "object") throw new Error("Scenario must be an object");
  if (!sc.id || typeof sc.id !== "string") throw new Error("Scenario missing valid id");
  if (!Number.isInteger(sc.version) || sc.version < 1) throw new Error(`Scenario ${sc.id} missing positive integer version`);
  if (!sc.title || typeof sc.title !== "string") throw new Error(`Scenario ${sc.id} missing title`);
  if (!sc.roles || !sc.roles.learner || !sc.roles.maya) throw new Error(`Scenario ${sc.id} missing roles.learner or roles.maya`);
  if (!sc.context || typeof sc.context !== "string") throw new Error(`Scenario ${sc.id} missing context`);
  if (!sc.opening_position || typeof sc.opening_position !== "string") throw new Error(`Scenario ${sc.id} missing opening_position`);
  if (!sc.objective || typeof sc.objective !== "string") throw new Error(`Scenario ${sc.id} missing objective`);
  if (!sc.capability_targets || !sc.capability_targets.primary) throw new Error(`Scenario ${sc.id} missing primary capability target`);
  if (!sc.opening || typeof sc.opening !== "string") throw new Error(`Scenario ${sc.id} missing opening`);
  if (!sc.first_say || typeof sc.first_say !== "string") throw new Error(`Scenario ${sc.id} missing first_say`);

  const maxTurns = sc.max_learner_turns;
  if (!Number.isInteger(maxTurns) || maxTurns < 4 || maxTurns > 15) {
    throw new Error(`Scenario ${sc.id} max_learner_turns must be an integer between 4 and 15`);
  }

  if (!Array.isArray(sc.beats) || sc.beats.length < 2) {
    throw new Error(`Scenario ${sc.id} must define at least 2 beats`);
  }

  const beatIds = new Set();
  let hasTerminal = false;
  let hasNonTerminal = false;

  for (const b of sc.beats) {
    if (!b.id || typeof b.id !== "string") throw new Error(`Scenario ${sc.id} has beat with missing id`);
    if (beatIds.has(b.id)) throw new Error(`Scenario ${sc.id} has duplicate beat id "${b.id}"`);
    beatIds.add(b.id);

    if (b.terminal) {
      hasTerminal = true;
      if (!b.say) throw new Error(`Terminal beat "${b.id}" missing say`);
      if (!b.outcome) throw new Error(`Terminal beat "${b.id}" missing outcome`);
    } else {
      hasNonTerminal = true;
      if (!b.say) throw new Error(`Beat "${b.id}" missing say`);
      if (!Array.isArray(b.press) || b.press.length < 1) {
        throw new Error(`Beat "${b.id}" must define at least 1 pushback in press array`);
      }
      if (!b.transitions || typeof b.transitions !== "object") {
        throw new Error(`Beat "${b.id}" must define transitions object`);
      }
    }
  }

  if (!hasNonTerminal) throw new Error(`Scenario ${sc.id} has no non-terminal beats`);
  if (!hasTerminal) throw new Error(`Scenario ${sc.id} has no terminal beat`);

  // Verify transition targets
  for (const b of sc.beats) {
    if (!b.terminal && b.transitions) {
      for (const [key, target] of Object.entries(b.transitions)) {
        if (!beatIds.has(target)) {
          throw new Error(`Beat "${b.id}" transition "${key}" targets non-existent beat "${target}"`);
        }
      }
    }
  }

  if (!sc.afterwards || !Array.isArray(sc.afterwards.strong) || !sc.afterwards.watchFor) {
    throw new Error(`Scenario ${sc.id} missing afterwards model phrases or watchFor guidance`);
  }

  return true;
}

/** What did this learner turn actually contain? */
function readTurn(text = "") {
  const clean = text.trim();
  const words = (clean.match(/[\wäöüßÄÖÜ'-]+/g) || []).length;
  const moves = Object.entries(MOVES).filter(([, m]) => m.test.test(clean)).map(([k]) => k);
  const english = (clean.match(ENGLISH) || []).length;

  const informal = INFORMAL.test(clean);
  const formal = FORMAL.test(clean);
  const registerSlip = informal && !formal;

  // Substantive is about communicative moves, not just raw word count
  const substantive = moves.length >= 2 || (moves.length === 1 && words >= 8);
  return {
    text: clean,
    words,
    moves,
    english,
    thin: !substantive,
    substantive,
    registerSlip,
    isFormal: formal,
  };
}

/**
 * Semantic response classifier for unexpected counter-offers / traps.
 * Distinguishes:
 *  - 'blind_acceptance' (accepted without condition or noticing collision)
 *  - 'counter_offer' (accepted conditionally or proposed alternative)
 *  - 'rejection' (refused the bad offer)
 *  - 'clarification' (asked for details)
 *  - 'ambiguous' (vague / unclear response requiring clarification)
 */
function classifyOfferResponse(text = "") {
  const clean = text.trim().toLowerCase();
  if (!clean) return "ambiguous";

  // Check condition / counter-offer first: "ja, aber nur wenn...", "ich könnte stattdessen..."
  const isConditional = /\b(aber nur wenn|nur wenn|unter der bedingung|wenn ich dafür|dafür aber|lieber würde ich|stattdessen|nur falls|dafür übernehme ich)\b/i.test(clean);
  const isCounter = /\b(ich könnte|ich würde eher|vorschlag|wie wäre es mit|könnte ich dafür|biete ich an|ich frage|frage ich|einspringen|einspringt|tauschen|tausche|übernehme)\b/i.test(clean);
  const mentionsConflict = /\b(prüfung|termin|kollidiert|schaffe ich nicht|geht leider nicht|nicht möglich|ausruhen|lernen|keine zeit|geht nicht)\b/i.test(clean);

  if (isConditional || (isCounter && mentionsConflict) || (clean.includes("aber") && isCounter)) {
    return "counter_offer";
  }

  // Explicit rejection
  const isRejection = /\b(nein|das geht leider nicht|das schaffe ich nicht|das kann ich nicht|das passt mir leider gar nicht|auf keinen fall|unmöglich|nicht möglich|geht nicht)\b/i.test(clean);
  if (isRejection) {
    return isCounter ? "counter_offer" : "rejection";
  }

  // Clarification question
  const isClarification = clean.includes("?") && /\b(welche|wann|wie|um wie viel|genau|meinen sie)\b/i.test(clean);
  if (isClarification) {
    return "clarification";
  }

  // Blind acceptance: positive agreement without reservations
  const isAccept = /\b(ja|das passt|einverstanden|das mache ich|gerne|super|abgemacht|in ordnung|mache ich|übernehme ich|vielen dank)\b/i.test(clean);
  const hasReservation = /\b(aber|nur|leider|nicht|keinesfalls|jedoch|allerdings|problem|schwierig)\b/i.test(clean);

  if (isAccept && !hasReservation) {
    return "blind_acceptance";
  }

  if (isAccept && hasReservation) {
    return "counter_offer";
  }

  return "ambiguous";
}

/**
 * Server-authoritative next move evaluator.
 * Models communicative progress independently from beat index.
 */
function nextMove(scenario, state, turn) {
  // Support both legacy beats format and new declarative state machine
  const beatMap = new Map((scenario.beats || []).map((b, i) => [b.id || `b${i + 1}`, { ...b, index: i }]));
  const beatList = scenario.beats || [];
  const maxTurns = scenario.max_learner_turns || scenario.max_turns || 7;

  // Resolve current beat
  let currentBeatId = state.current_beat || state.beatId;
  if (!currentBeatId && state.index != null) {
    currentBeatId = beatList[state.index]?.id || `b${state.index + 1}`;
  }
  if (!currentBeatId && beatList[0]) {
    currentBeatId = beatList[0].id;
  }

  const beat = beatMap.get(currentBeatId) || beatList[0];
  if (!beat || beat.terminal) {
    return {
      done: true,
      say: beat?.say || scenario.closing,
      outcome: beat?.outcome || "resolved",
      state: { ...state, current_beat: beat?.id, done: true },
    };
  }

  const pressCount = state.press_count ?? state.pressCount ?? 0;
  const learnerTurnsCount = (state.learner_turns_count ?? state.turnsCount ?? 0) + 1;
  const memory = { ...(state.memory || {}) };

  // Track communicative memory
  if (turn.moves.includes("reason")) memory.hasReason = true;
  if (turn.moves.includes("concede")) memory.hasConcession = true;
  if (turn.moves.includes("offer")) memory.hasOffer = true;
  if (turn.moves.includes("detail")) memory.hasDetail = true;
  if (turn.registerSlip) memory.registerSlips = (memory.registerSlips || 0) + 1;

  // Ceiling check: deterministic maximum learner turns
  if (learnerTurnsCount >= maxTurns) {
    const timeoutBeatId = beat.transitions?.onTimeout || beat.transitions?.onMaxPress || "b_unresolved";
    const targetBeat = beatMap.get(timeoutBeatId) || beatMap.get("b_unresolved") || { say: scenario.closing, outcome: "unresolved" };
    return {
      done: true,
      say: targetBeat.say,
      outcome: targetBeat.outcome || "unresolved",
      status: targetBeat.outcome || "unresolved",
      terminal: true,
      state: {
        ...state,
        current_beat: targetBeat.id,
        learner_turns_count: learnerTurnsCount,
        memory,
        done: true,
      },
      nudge: "Das Gespräch hat das Zeitlimit erreicht.",
    };
  }

  // SPECIAL EVALUATION: Unexpected offer / counter-offer beat
  if (beat.unexpected) {
    const offerClass = classifyOfferResponse(turn.text || "");
    memory.offerClass = offerClass;

    if (offerClass === "blind_acceptance") {
      memory.trap_triggered = true;
      const targetId = beat.transitions?.onTrap || beat.trap_detect?.onTrap || "b_trap_accepted";
      const targetBeat = beatMap.get(targetId);
      return {
        done: true,
        say: targetBeat?.say || "„Gut. Dann trage ich Sie für die Sonntagnacht ein.“",
        outcome: "trap_accepted",
        status: "trap_accepted",
        terminal: true,
        trapTriggered: true,
        state: { ...state, current_beat: targetId, learner_turns_count: learnerTurnsCount, memory, done: true },
      };
    }

    if (offerClass === "counter_offer" || offerClass === "rejection") {
      memory.unexpected_handled = true;
      const targetId = beat.transitions?.onRejectAndCounter || beat.transitions?.onCounter || beat.transitions?.onSubstantive || "b4_replacement";
      const targetBeat = beatMap.get(targetId);
      if (targetBeat) {
        return {
          done: !!targetBeat.terminal,
          say: targetBeat.say,
          pressing: false,
          outcome: targetBeat.outcome,
          state: {
            ...state,
            current_beat: targetBeat.id,
            index: targetBeat.index,
            press_count: 0,
            learner_turns_count: learnerTurnsCount,
            memory,
            done: !!targetBeat.terminal,
          },
        };
      }
    }

    if (offerClass === "ambiguous" || turn.thin) {
      if (pressCount < (beat.press?.length || 0)) {
        return {
          say: beat.press[pressCount],
          pressing: true,
          why: "ambiguous",
          nudge: "Frau Berger braucht eine klare Antwort auf ihren Vorschlag.",
          state: {
            ...state,
            current_beat: beat.id,
            press_count: pressCount + 1,
            learner_turns_count: learnerTurnsCount,
            memory,
          },
        };
      }
    }
  }

  // GENERAL EVALUATION: Check whether communicative criteria for this beat were met
  const wants = beat.wants || [];
  const hasWantedMove = wants.length === 0 || wants.some(w => turn.moves.includes(w));
  const meetsCriteria = turn.substantive && hasWantedMove;

  // If thin or missing required move -> pushback
  if (!meetsCriteria && pressCount < (beat.press?.length || 0)) {
    return {
      say: beat.press[pressCount],
      pressing: true,
      why: turn.words < 8 ? "too_short" : (!hasWantedMove ? "no_wanted_move" : "thin"),
      nudge: turn.words < 8
        ? "Frau Berger wartet auf mehr als einen kurzen Satz."
        : (wants.includes("reason") && !turn.moves.includes("reason")
            ? "Sie hat noch keine Begründung gehört."
            : (wants.includes("concede") && !turn.moves.includes("concede")
                ? "Gehen Sie auf ihre Situation ein (Einräumen: „Das verstehe ich, aber…“)."
                : "Frau Berger hakt noch einmal nach.")),
      state: {
        ...state,
        current_beat: beat.id,
        press_count: pressCount + 1,
        learner_turns_count: learnerTurnsCount,
        memory,
      },
    };
  }

  // Transition to next beat
  let nextBeatId = null;
  if (beat.transitions) {
    if (meetsCriteria) {
      nextBeatId = beat.transitions.onSubstantive || beat.transitions.next;
    } else {
      nextBeatId = beat.transitions.onMaxPress || beat.transitions.next;
    }
  }

  if (!nextBeatId && beat.index != null) {
    const nextBeat = beatList[beat.index + 1];
    nextBeatId = nextBeat?.id;
  }

  const nextBeat = beatMap.get(nextBeatId);
  if (!nextBeat || nextBeat.terminal) {
    const terminalOutcome = nextBeat?.outcome || (meetsCriteria ? "resolved" : "unresolved");
    return {
      done: true,
      say: nextBeat?.say || scenario.closing,
      outcome: terminalOutcome,
      status: terminalOutcome,
      terminal: true,
      state: {
        ...state,
        current_beat: nextBeat?.id || "closing",
        learner_turns_count: learnerTurnsCount,
        memory,
        done: true,
      },
    };
  }

  return {
    done: false,
    say: nextBeat.say,
    pressing: false,
    state: {
      ...state,
      current_beat: nextBeat.id,
      index: nextBeat.index,
      press_count: 0,
      learner_turns_count: learnerTurnsCount,
      memory,
    },
  };
}

/**
 * Summarise conversational evidence across all turns.
 * Evidence is derived from observed communicative behaviours, NEVER equating
 * terminal outcome with proficiency.
 *
 * Strictly indicative: weight 0.2, dimension speaking, sourceKind conversation.
 */
function summarise(scenario, turns = [], sessionData = {}) {
  const recs = turns.map((t, idx) => (typeof t === "string" ? { text: t, beat: null, turnNumber: idx + 1 } : t));
  const reads = recs.map(r => readTurn(r.text));
  const allMoves = new Set(reads.flatMap(r => r.moves));
  const totalTurns = recs.length;

  const substantiveTurns = reads.filter(r => r.substantive).length;
  const pressedTurns = recs.filter(r => r.pressed).length;
  const englishWords = reads.reduce((n, r) => n + r.english, 0);
  const informalSlips = reads.filter(r => r.registerSlip).length;

  const memory = sessionData.memory || {};
  const status = sessionData.status || sessionData.outcome || (sessionData.done ? "resolved" : "active");
  const unexpectedBeats = (scenario.beats || [])
    .map((b, i) => (b.unexpected ? (b.id || i) : null)).filter(Boolean);
  const unexpectedIndices = (scenario.beats || [])
    .map((b, i) => (b.unexpected ? i : -1)).filter(i => i >= 0);

  const unexpectedRec = recs.find(r =>
    unexpectedBeats.includes(r.beat) || unexpectedIndices.includes(r.beat)
  );

  const turnIsTrap = !!(unexpectedRec && classifyOfferResponse(unexpectedRec.text) === "blind_acceptance");
  const turnHandled = !!(unexpectedRec &&
    readTurn(unexpectedRec.text).substantive &&
    classifyOfferResponse(unexpectedRec.text) !== "blind_acceptance");

  const trapTriggered = !!(memory.trap_triggered || status === "trap_accepted" || turnIsTrap);
  const unexpectedHandled = !!(memory.unexpected_handled || turnHandled);

  // 1. maintain_discussion: Did learner hold their ground under pressure?
  // Evaluated by ratio of substantive responses across turns, especially under pushback
  const substantiveRatio = totalTurns > 0 ? substantiveTurns / totalTurns : 0;
  let maintainDiscussionOutcome = 0.3;
  if (totalTurns >= 3 && substantiveRatio >= 0.6) {
    maintainDiscussionOutcome = unexpectedHandled ? 1.0 : 0.8;
  } else if (substantiveRatio >= 0.4 || totalTurns >= 2) {
    maintainDiscussionOutcome = 0.6;
  }

  // 2. react_unexpected: Did the learner meet the unexpected turn and avoid the trap?
  const reachedUnexpected = !!(recs.some(r =>
    unexpectedBeats.includes(r.beat) || unexpectedIndices.includes(r.beat)
  ) || unexpectedHandled || trapTriggered);

  let reactUnexpectedOutcome = null;
  if (reachedUnexpected) {
    if (unexpectedHandled) {
      reactUnexpectedOutcome = 1.0;
    } else if (trapTriggered) {
      reactUnexpectedOutcome = 0.3; // fell into the trap
    } else {
      reactUnexpectedOutcome = 0.5; // evasive / ambiguous
    }
  }

  // 3. justify: Did the learner give concrete reasons for their request?
  const reasonsGiven = reads.filter(r => r.moves.includes("reason")).length;
  const justifyOutcome = reasonsGiven >= 2 ? 1.0 : reasonsGiven === 1 ? 0.7 : 0.3;

  // 4. concede: Did the learner acknowledge the partner's constraints?
  const concessionsGiven = reads.filter(r => r.moves.includes("concede")).length;
  const concedeOutcome = concessionsGiven >= 1 ? 1.0 : 0.3;

  // 5. adapt_register: Polite hospital register
  const adaptRegisterOutcome = informalSlips === 0 ? 1.0 : 0.4;

  const did = [], missing = [];
  for (const [k, m] of Object.entries(MOVES)) {
    (allMoves.has(k) ? did : missing).push(m.de);
  }

  const heldPosition = substantiveRatio >= 0.5 && totalTurns >= 2;
  const adaptedToChange = unexpectedHandled && !trapTriggered;

  // Human-readable summary verdict
  let verdict = "";
  if (trapTriggered) {
    verdict = "Sie haben den Sonntagnachtdienst angenommen — genau die Schicht vor Ihrer Prüfung. Die Prüfungssituation erfordert hier ein klares Einräumen und einen Gegenvorschlag.";
  } else if (!heldPosition) {
    verdict = "Sie haben die Position nicht durchgehalten — mehrere Antworten waren zu kurz oder blieben eine Begründung schuldig.";
  } else if (status === "resolved") {
    verdict = "Sie sind im Gespräch drangeblieben, haben auf Gegenargumente reagiert und eine tragfähige Lösung vereinbart. Genau das prüft B2.";
  } else if (adaptedToChange) {
    verdict = "Sie haben Ihre Position auch unter Druck gehalten und den ungünstigen Gegenvorschlag erkannt. Auch ohne Einigung war das ein starker Diskursverlauf.";
  } else {
    verdict = "Sie haben Ihre Position behauptet. Beim unerwarteten Gegenangebot hätten Sie noch aktiver nachfassen können.";
  }

  const evidence = [
    {
      dimension: "speaking",
      capability: "maintain_discussion",
      outcome: Number(maintainDiscussionOutcome.toFixed(2)),
      weight: 0.2,
      sourceKind: "conversation",
      indicative: true,
    },
    {
      dimension: "speaking",
      capability: "justify",
      outcome: Number(justifyOutcome.toFixed(2)),
      weight: 0.2,
      sourceKind: "conversation",
      indicative: true,
    },
    {
      dimension: "speaking",
      capability: "concede",
      outcome: Number(concedeOutcome.toFixed(2)),
      weight: 0.2,
      sourceKind: "conversation",
      indicative: true,
    },
    {
      dimension: "speaking",
      capability: "adapt_register",
      outcome: Number(adaptRegisterOutcome.toFixed(2)),
      weight: 0.2,
      sourceKind: "conversation",
      indicative: true,
    },
    ...(reachedUnexpected && reactUnexpectedOutcome != null
      ? [{
          dimension: "speaking",
          capability: "react_unexpected",
          outcome: Number(reactUnexpectedOutcome.toFixed(2)),
          weight: 0.2,
          sourceKind: "conversation",
          indicative: true,
        }]
      : []),
  ];

  return {
    turns: totalTurns,
    substantiveTurns,
    heldPosition,
    adaptedToChange,
    reachedUnexpected,
    trapTriggered,
    moves: [...allMoves],
    did,
    missing,
    verdict,
    status,
    evidence,
  };
}

/**
 * Session persistence helper: get active session for a user and scenario.
 */
async function getActiveSession(userId, scenarioId) {
  const { rows } = await pool.query(
    `SELECT * FROM b2_maya_sessions
      WHERE user_id=$1 AND scenario_id=$2 AND status='active'
      ORDER BY id DESC LIMIT 1`,
    [userId, scenarioId]
  );
  return rows[0] || null;
}

/**
 * Session persistence helper: create new active session, abandoning previous active ones.
 */
async function startSession(userId, scenario, customSessionId = null) {
  const sessionId = customSessionId || `maya_${scenario.id}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const firstBeatId = scenario.beats[0]?.id || "b1";

  // Atomically mark any existing active sessions as abandoned
  await pool.query(
    `UPDATE b2_maya_sessions
        SET status='abandoned', updated_at=now()
      WHERE user_id=$1 AND scenario_id=$2 AND status='active'`,
    [userId, scenario.id]
  );

  const initialLog = [
    { who: "maya", text: scenario.opening },
    { who: "maya", text: scenario.first_say },
  ];

  const { rows } = await pool.query(
    `INSERT INTO b2_maya_sessions
      (user_id, scenario_id, scenario_version, session_id, current_beat, press_count,
       learner_turns_count, max_learner_turns, dialogue_log, turns, memory, status)
     VALUES ($1, $2, $3, $4, $5, 0, 0, $6, $7, '[]'::jsonb, '{}'::jsonb, 'active')
     RETURNING *`,
    [userId, scenario.id, scenario.version || 1, sessionId, firstBeatId, scenario.max_learner_turns || 7, JSON.stringify(initialLog)]
  );

  return rows[0];
}

/**
 * Session persistence helper: save turn and state to DB.
 */
async function saveSessionTurn(sessionId, sessionUpdate) {
  const {
    current_beat,
    press_count,
    learner_turns_count,
    dialogue_log,
    turns,
    memory,
    status,
    terminal_outcome,
    finished,
  } = sessionUpdate;

  const { rows } = await pool.query(
    `UPDATE b2_maya_sessions
        SET current_beat = COALESCE($2, current_beat),
            press_count = COALESCE($3, press_count),
            learner_turns_count = COALESCE($4, learner_turns_count),
            dialogue_log = COALESCE($5::jsonb, dialogue_log),
            turns = COALESCE($6::jsonb, turns),
            memory = COALESCE($7::jsonb, memory),
            status = COALESCE($8, status),
            terminal_outcome = COALESCE($9, terminal_outcome),
            finished_at = CASE WHEN $10::boolean THEN now() ELSE finished_at END,
            updated_at = now()
      WHERE session_id = $1
      RETURNING *`,
    [
      sessionId,
      current_beat,
      press_count,
      learner_turns_count,
      dialogue_log ? JSON.stringify(dialogue_log) : null,
      turns ? JSON.stringify(turns) : null,
      memory ? JSON.stringify(memory) : null,
      status,
      terminal_outcome,
      !!finished,
    ]
  );

  return rows[0];
}

module.exports = {
  MOVES,
  validateMayaScenario,
  readTurn,
  classifyOfferResponse,
  nextMove,
  summarise,
  getActiveSession,
  startSession,
  saveSessionTurn,
};
