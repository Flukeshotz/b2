/**
 * MAYA SCENARIO — Eine unklare Übergabe.
 *
 * Clarification, nursing/workplace. Maya gives a handover with an ambiguous
 * detail (a time or an instruction that could mean two different things).
 * The learner must ask for clarification rather than guess — purely a
 * communication task, no clinical judgement involved.
 *
 *   ask_followup (primary) — asking for the specific missing detail.
 *   understand_speech (secondary, receptive) — following a spoken handover.
 *   adapt_register (secondary) — professional clarification, not just "what?".
 */

module.exports = {
  id: "maya_uebergabe_unklar",
  version: 1,
  title: "Eine unklare Angabe bei der Übergabe",
  minutes: 6,

  roles: {
    learner: "Pflegekraft, Spätschicht",
    maya: "Frau Öztürk, Frühschicht",
  },

  context: "Frau Öztürk übergibt hastig, weil sie in Eile ist, und eine ihrer Angaben zur Medikamentengabe ist zweideutig formuliert.",
  opening_position: "Sie ist in Eile und möchte die Übergabe schnell abschließen.",
  objective: "Die zweideutige Angabe eindeutig klären, bevor die Übergabe endet.",

  capability_targets: {
    primary: "ask_followup",
    secondary: ["understand_speech", "adapt_register"],
  },

  max_learner_turns: 5,

  declaration: {
    primary_capability: "ask_followup",
    secondary_capabilities: ["understand_speech", "adapt_register"],
    theme: 3,
    context: "professional",
    cefr_tier: "developing",
    language_resources: [
      "asking a precise clarifying question instead of guessing: meinen Sie damit …, oder …?",
      "insisting politely on clarity before letting a colleague leave",
    ],
    checks: [],
    experience_types: ["speaking"],
    exam: "telc Handbuch §4.1 · Goethe Mündlich Aufgabe 1",
  },

  brief: {
    role: "Sie übernehmen den Spätdienst.",
    situation: "Die Übergabe enthält eine zweideutige Angabe.",
    partner: "Frau Öztürk ist in Eile.",
    goal: "Die Angabe eindeutig klären, bevor sie geht.",
  },

  opening: "Frau Öztürk zieht schon die Jacke an. „Ich muss gleich los, kurz noch die Übergabe.“",
  first_say: "Bei Herrn Fischer bitte das Medikament später geben, dann bin ich weg.",

  beats: [
    {
      id: "b1_ask_specifics",
      say: "Bei Herrn Fischer bitte das Medikament später geben, dann bin ich weg.",
      wants: ["detail"],
      press: [
        "Moment — „später“ ist mir zu ungenau. Meinen Sie in einer Stunde, oder erst zur nächsten Runde?",
      ],
      transitions: { onSubstantive: "b2_clarify_reason", onMaxPress: "b2_clarify_reason", next: "b2_clarify_reason" },
    },
    {
      id: "b2_clarify_reason",
      say: "Ach so, ja — erst zur Abendrunde, weil er gerade erst etwas bekommen hat. Reicht das?",
      wants: ["detail"],
      press: [
        "Fast — sagen Sie mir noch die genaue Uhrzeit, damit ich es richtig dokumentiere.",
      ],
      transitions: { onSubstantive: "b_resolved", onMaxPress: "b_unresolved", next: "b_resolved" },
    },
    {
      id: "b_resolved",
      terminal: true,
      outcome: "resolved",
      say: "„Genau, um achtzehn Uhr zur Abendrunde. Danke fürs Nachfragen, sonst hätte das Missverständnisse gegeben.“",
    },
    {
      id: "b_unresolved",
      terminal: true,
      outcome: "unresolved",
      say: "„Ich muss jetzt wirklich los — fragen Sie notfalls im Dienstzimmer nach.“",
    },
  ],

  closing: "„Genau, um achtzehn Uhr zur Abendrunde. Danke fürs Nachfragen.“",

  afterwards: {
    strong: [
      "„Später“ ist mir zu ungenau — meinen Sie in einer Stunde oder erst zur nächsten Runde?",
      "Können Sie mir die genaue Uhrzeit nennen, damit ich es korrekt dokumentiere?",
      "Bevor Sie gehen, möchte ich das noch einmal ganz klar haben, damit nichts durcheinanderkommt.",
    ],
    watchFor: "„Später“ klingt harmlos, ist aber keine brauchbare Zeitangabe für eine Übergabe — wer das unkommentiert stehen lässt, riskiert ein Missverständnis, nicht weil er es nicht versteht, sondern weil er nicht nachfragt.",
  },
};
