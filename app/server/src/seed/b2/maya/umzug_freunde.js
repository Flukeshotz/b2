/**
 * MAYA SCENARIO — Umzugshilfe planen.
 *
 * Planning + tentative suggestion. The learner and a friend must agree on a
 * practical plan for moving day. Low-stakes, accessible B2.
 *
 *   speculate (primary) — proposing options tentatively, not as demands.
 *   compare (secondary) — weighing morning vs. afternoon, van vs. no van.
 *   concede (secondary) — accepting a friend's constraint.
 *   ask_followup (secondary) — asking for missing details.
 */

module.exports = {
  id: "maya_umzug_freunde",
  version: 1,
  title: "Den Umzugstag planen",
  minutes: 5,

  roles: {
    learner: "Freund/Freundin",
    maya: "Nadja, Freundin",
  },

  context: "Sie ziehen am Samstag um und möchten mit Nadja klären, wann sie kommen kann und ob ein Transporter nötig ist.",
  opening_position: "Sie kann nur vormittags, nicht den ganzen Tag, und ist sich unsicher, ob ein Transporter nötig ist.",
  objective: "Einen konkreten, für beide passenden Plan für den Umzugstag festlegen.",

  capability_targets: {
    primary: "speculate",
    secondary: ["compare", "concede", "ask_followup"],
  },

  max_learner_turns: 5,

  declaration: {
    primary_capability: "speculate",
    secondary_capabilities: ["compare", "concede", "ask_followup"],
    theme: 3,
    context: "general",
    cefr_tier: "accessible",
    language_resources: [
      "proposing tentatively: wir könnten vielleicht… / man könnte auch…",
      "comparing two options: entweder … oder, einerseits … andererseits",
      "asking a clarifying question: bis wann genau hast du Zeit?",
    ],
    checks: [],
    experience_types: ["speaking"],
    exam: "Goethe Mündlich Aufgabe 2 · telc Sprechen Teil 3",
  },

  brief: {
    role: "Sie ziehen am Samstag um.",
    situation: "Sie brauchen Hilfe und möchten den Ablauf mit Nadja klären.",
    partner: "Nadja kann nur vormittags und ist unsicher wegen des Transporters.",
    goal: "Einen konkreten Plan für Samstag festlegen.",
  },

  opening: "Nadja meldet sich zurück. „Du wolltest wegen Samstag was klären?“",
  first_say: "Ich kann nur vormittags, nicht den ganzen Tag. Wie stellst du dir das vor?",

  beats: [
    {
      id: "b1_clarify_time",
      say: "Ich kann nur vormittags, nicht den ganzen Tag. Wie stellst du dir das vor?",
      wants: ["detail"],
      press: [
        "Bis wann genau hast du denn vormittags Zeit?",
      ],
      transitions: { onSubstantive: "b2_transport", onMaxPress: "b2_transport", next: "b2_transport" },
    },
    {
      id: "b2_transport",
      say: "Gut, bis zwölf würde gehen. Aber brauchen wir überhaupt einen Transporter, oder reichen unsere Autos?",
      wants: ["reason", "offer"],
      press: [
        "Das hängt davon ab, wie viele große Möbel es sind — was genau müssen wir transportieren?",
      ],
      transitions: { onSubstantive: "b3_confirm_plan", onMaxPress: "b3_confirm_plan", next: "b3_confirm_plan" },
    },
    {
      id: "b3_confirm_plan",
      say: "Okay, dann fassen wir zusammen: was genau machen wir wann?",
      wants: ["detail"],
      press: [
        "Sag mir den ganzen Plan noch einmal klar, damit ich nichts verwechsle.",
      ],
      transitions: { onSubstantive: "b_resolved", onMaxPress: "b_unresolved", next: "b_resolved" },
    },
    {
      id: "b_resolved",
      terminal: true,
      outcome: "resolved",
      say: "„Gut, dann kommen wir um neun mit dem kleinen Transporter, und um zwölf bist du fertig. Das passt.“",
    },
    {
      id: "b_unresolved",
      terminal: true,
      outcome: "unresolved",
      say: "„Ich bin mir noch nicht sicher — lass uns das lieber morgen noch mal genau klären.“",
    },
  ],

  closing: "„Gut, dann kommen wir um neun mit dem kleinen Transporter.“",

  afterwards: {
    strong: [
      "Wir könnten vielleicht um neun anfangen, dann bist du bis zwölf fertig.",
      "Einerseits reichen unsere Autos für Kisten, andererseits bräuchten wir für den Schrank wohl einen kleinen Transporter.",
      "Bis wann genau hast du vormittags Zeit — reicht es bis zwölf oder eher bis elf?",
    ],
    watchFor: "Ein guter Plan hier ist konkret: Uhrzeit, Transportmittel und wer was macht — vage Zusagen wie „mal schauen“ führen zu keinem festen Ergebnis.",
  },
};
