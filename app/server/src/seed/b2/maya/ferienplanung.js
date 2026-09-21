/**
 * MAYA SCENARIO — Ferien planen und zusammenfassen.
 *
 * Planning, general life, accessible-to-developing B2. The learner and a
 * partner/friend plan a short trip and must agree, then the learner has to
 * SUMMARISE the agreed plan back clearly at the end — the one scenario in
 * this batch that specifically exercises `summarise`.
 *
 *   summarise (primary) — restating the agreed plan accurately and completely.
 *   compare (secondary) — weighing two destination options.
 *   speculate (secondary) — proposing options tentatively.
 */

module.exports = {
  id: "maya_ferienplanung",
  version: 1,
  title: "Den Kurzurlaub planen",
  minutes: 6,

  roles: {
    learner: "Partner/in",
    maya: "Elin, Partnerin",
  },

  context: "Sie planen gemeinsam einen viertägigen Kurzurlaub und müssen sich auf Ziel, Zeitraum und ein grobes Budget einigen.",
  opening_position: "Sie hat zwei mögliche Ziele im Kopf und noch keine klare Präferenz.",
  objective: "Einen konkreten Plan festlegen und am Ende korrekt zusammenfassen.",

  capability_targets: {
    primary: "summarise",
    secondary: ["compare", "speculate"],
  },

  max_learner_turns: 6,

  declaration: {
    primary_capability: "summarise",
    secondary_capabilities: ["compare", "speculate"],
    theme: 3,
    context: "general",
    cefr_tier: "accessible",
    language_resources: [
      "comparing two options fairly: einerseits …, andererseits …",
      "proposing tentatively: wir könnten vielleicht Ende des Monats fahren",
      "summarising an agreement accurately: also fahren wir am … für … Tage nach …, mit einem Budget von …",
    ],
    checks: [],
    experience_types: ["speaking"],
    exam: "Goethe Mündlich Aufgabe 2 · telc Sprechen Teil 3",
  },

  brief: {
    role: "Sie planen gemeinsam einen Kurzurlaub.",
    situation: "Ziel, Zeitraum und Budget sind noch offen.",
    partner: "Elin ist unentschlossen zwischen zwei Zielen.",
    goal: "Einen klaren Plan festlegen und am Ende richtig zusammenfassen.",
  },

  opening: "Elin schaut auf ihr Handy. „Also, wohin denn jetzt — Berge oder Meer?“",
  first_say: "Ich schwanke zwischen den Bergen und der Küste. Was denkst du?",

  beats: [
    {
      id: "b1_compare",
      say: "Ich schwanke zwischen den Bergen und der Küste. Was denkst du?",
      wants: ["reason", "detail"],
      press: [
        "Sag mir konkret, was für dich für welches Ziel spricht.",
      ],
      transitions: { onSubstantive: "b2_timing", onMaxPress: "b2_timing", next: "b2_timing" },
    },
    {
      id: "b2_timing",
      say: "Gut, dann die Küste. Wann würde es dir zeitlich passen?",
      wants: ["offer", "detail"],
      press: [
        "Nenn mir ein konkretes Datum, kein „irgendwann“.",
      ],
      transitions: { onSubstantive: "b3_summary_check", onMaxPress: "b3_summary_check", next: "b3_summary_check" },
    },
    {
      id: "b3_summary_check",
      say: "Okay. Fass noch mal für mich zusammen, was wir jetzt genau vereinbart haben, damit ich es aufschreibe.",
      wants: ["detail"],
      press: [
        "Bitte alles zusammen in einem Satz: wohin, wann, wie lange.",
      ],
      transitions: { onSubstantive: "b_resolved", onMaxPress: "b_unresolved", next: "b_resolved" },
    },
    {
      id: "b_resolved",
      terminal: true,
      outcome: "resolved",
      say: "„Genau, so habe ich das auch verstanden. Ich buche die Fahrt heute noch.“",
    },
    {
      id: "b_unresolved",
      terminal: true,
      outcome: "unresolved",
      say: "„Ich bin mir nicht sicher, ob wir uns wirklich einig sind — lass uns das noch mal in Ruhe klären.“",
    },
  ],

  closing: "„Genau, so habe ich das auch verstanden. Ich buche die Fahrt heute noch.“",

  afterwards: {
    strong: [
      "Einerseits ist es an der Küste windiger, andererseits kann man dort besser wandern gehen als in den Bergen im Sommer.",
      "Wir könnten vielleicht Ende des Monats fahren, dann hätten wir beide noch Urlaubstage übrig.",
      "Also fahren wir Ende des Monats für vier Tage an die Küste, mit einem Budget von etwa vierhundert Euro.",
    ],
    watchFor: "Die letzte Runde prüft nicht neue Information, sondern ob die eigene Zusammenfassung wirklich vollständig und korrekt ist — wer etwas vergisst (z. B. die Dauer), lässt eine Lücke im Plan.",
  },
};
