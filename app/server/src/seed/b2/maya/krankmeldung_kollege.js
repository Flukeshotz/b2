/**
 * MAYA SCENARIO — Ein Kollege meldet sich krank.
 *
 * Unexpected change, nursing/workplace, demanding B2. The learner is
 * mid-shift-planning when Maya reveals a colleague's sudden sick leave
 * changes everything — and offers the learner an overloaded solution
 * framed as simple.
 *
 *   react_unexpected (primary) — reacting to the new situation, not just nodding along.
 *   justify (secondary) — explaining realistic limits.
 *   maintain_discussion (secondary) — pushing for a workable solution.
 */

module.exports = {
  id: "maya_krankmeldung_kollege",
  version: 1,
  title: "Eine kurzfristige Krankmeldung",
  minutes: 8,

  roles: {
    learner: "Pflegekraft",
    maya: "Frau Berger, Stationsleitung",
  },

  context: "Sie besprechen gerade die Aufgabenverteilung für den Spätdienst, als Frau Berger erfährt, dass ein Kollege sich kurzfristig krankgemeldet hat.",
  opening_position: "Sie schlägt vor, dass Sie einfach die Aufgaben beider Kollegen übernehmen.",
  objective: "Eine realistische Lösung finden, die nicht auf Ihre Kosten geht.",

  capability_targets: {
    primary: "react_unexpected",
    secondary: ["justify", "maintain_discussion"],
  },

  max_learner_turns: 7,

  declaration: {
    primary_capability: "react_unexpected",
    secondary_capabilities: ["justify", "maintain_discussion"],
    theme: 3,
    context: "professional",
    cefr_tier: "demanding",
    language_resources: [
      "recognising an offer is actually unrealistic: das würde bedeuten, dass ich doppelt so viele Patienten betreue",
      "explaining a concrete limit: ich kann nicht gleichzeitig in zwei Zimmern sein",
      "proposing a realistic alternative instead of just refusing",
    ],
    checks: [],
    experience_types: ["speaking"],
    exam: "telc Handbuch §4 · Goethe Mündlich Aufgabe 2",
  },

  brief: {
    role: "Sie sind für den Spätdienst eingeteilt.",
    situation: "Ein Kollege meldet sich kurzfristig krank, mitten in der Planung.",
    partner: "Frau Berger schlägt eine unrealistische Sofortlösung vor.",
    goal: "Eine tragfähige Aufgabenverteilung finden.",
  },

  opening: "Frau Berger legt das Telefon auf. „Das kommt jetzt ungelegen…“",
  first_say: "Herr Klein hat sich gerade krankgemeldet. Übernehmen Sie einfach seine Zimmer mit — das sollte machbar sein.",

  beats: [
    {
      id: "b1_unexpected_ask",
      unexpected: true,
      say: "Herr Klein hat sich gerade krankgemeldet. Übernehmen Sie einfach seine Zimmer mit — das sollte machbar sein.",
      wants: ["reason", "detail"],
      press: [
        "Ist das ein Ja? Ich muss das jetzt regeln.",
      ],
      transitions: {
        onTrap: "b_trap_accepted",
        onRejectAndCounter: "b2_explain_limit",
        onCounter: "b2_explain_limit",
        onSubstantive: "b2_explain_limit",
        onMaxPress: "b_unresolved",
        next: "b2_explain_limit",
      },
    },
    {
      id: "b2_explain_limit",
      say: "Wie viele Zimmer meinen Sie denn genau? Das kann doch nicht so viel mehr sein.",
      wants: ["detail", "reason"],
      press: [
        "Das klingt nach einer Ausrede. Geht es wirklich nicht, oder wollen Sie einfach nicht?",
      ],
      transitions: { onSubstantive: "b3_realistic_solution", onMaxPress: "b3_realistic_solution", next: "b3_realistic_solution" },
    },
    {
      id: "b3_realistic_solution",
      say: "Gut, was schlagen Sie dann vor?",
      wants: ["offer", "detail"],
      press: [
        "Ich brauche jetzt einen konkreten Vorschlag, keine allgemeine Klage.",
      ],
      transitions: { onSubstantive: "b_resolved", onMaxPress: "b_unresolved", next: "b_resolved" },
    },
    {
      id: "b_resolved",
      terminal: true,
      outcome: "resolved",
      say: "„In Ordnung. Ich frage den Bereitschaftsdienst nach Unterstützung, und Sie übernehmen nur die dringendsten Zimmer von Herrn Klein.“",
    },
    {
      id: "b_trap_accepted",
      terminal: true,
      outcome: "trap_accepted",
      say: "„Gut, dann ist das geregelt.“ (Sie übernehmen beide Zimmerblöcke allein, ohne jede zusätzliche Unterstützung.)",
    },
    {
      id: "b_unresolved",
      terminal: true,
      outcome: "unresolved",
      say: "„Wir klären das später — im Moment bleibt es unklar, wer was übernimmt.“",
    },
  ],

  closing: "„In Ordnung. Ich frage den Bereitschaftsdienst nach Unterstützung.“",

  afterwards: {
    strong: [
      "Zwölf zusätzliche Zimmer würden bedeuten, dass ich doppelt so viele Patienten gleichzeitig betreue — das ist nicht sicher machbar.",
      "Ich kann nicht gleichzeitig in zwei Zimmern sein, gerade bei den Kontrollen, die alle zwei Stunden fällig sind.",
      "Könnten wir stattdessen den Bereitschaftsdienst fragen und ich übernehme nur die dringendsten Zimmer?",
    ],
    watchFor: "„Das sollte machbar sein“ klingt harmlos, ist aber eine große, unrealistische Bitte — wer sofort zustimmt, ohne die tatsächliche Zahl der Zimmer zu klären, übernimmt am Ende zu viel allein.",
  },
};
