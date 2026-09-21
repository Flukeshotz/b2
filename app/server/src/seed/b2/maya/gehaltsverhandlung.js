/**
 * MAYA SCENARIO — Gehaltsverhandlung.
 *
 * Negotiation, workplace, demanding B2. The learner asks for a raise after
 * a year of expanded responsibilities. Maya (the manager) resists on
 * budget grounds.
 *
 *   justify (primary) — backing the request with concrete achievements.
 *   argue (secondary) — making the case clearly.
 *   concede (secondary) — acknowledging real budget constraints.
 *   maintain_discussion (secondary) — not settling for the first no.
 */

module.exports = {
  id: "maya_gehaltsverhandlung",
  version: 1,
  title: "Um eine Gehaltserhöhung bitten",
  minutes: 8,

  roles: {
    learner: "Mitarbeiter/in",
    maya: "Herr Vogt, Abteilungsleiter",
  },

  context: "Sie haben im letzten Jahr zusätzliche Verantwortung übernommen, ohne dass sich Ihr Gehalt geändert hat. Sie bitten um eine Erhöhung.",
  opening_position: "Das Budget ist dieses Jahr besonders knapp — schlechter Zeitpunkt für diese Frage.",
  objective: "Eine konkrete Gehaltserhöhung oder zumindest einen klaren nächsten Schritt erreichen.",

  capability_targets: {
    primary: "justify",
    secondary: ["argue", "concede", "maintain_discussion"],
  },

  max_learner_turns: 8,

  declaration: {
    primary_capability: "justify",
    secondary_capabilities: ["argue", "concede", "maintain_discussion"],
    theme: 3,
    context: "professional",
    cefr_tier: "demanding",
    language_resources: [
      "backing a request with concrete facts: seit letztem Jahr betreue ich zusätzlich drei neue Kunden",
      "conceding budget reality while still pressing: das verstehe ich, dennoch möchte ich über eine Lösung sprechen",
      "asking for a concrete commitment, not a vague 'we'll see'",
    ],
    checks: [],
    experience_types: ["speaking"],
    exam: "Goethe Mündlich Aufgabe 2 · telc Sprechen Teil 3",
  },

  brief: {
    role: "Sie haben zusätzliche Verantwortung übernommen.",
    situation: "Ihr Gehalt hat sich seit einem Jahr nicht geändert.",
    partner: "Herr Vogt verweist auf ein knappes Budget.",
    goal: "Eine Erhöhung oder einen konkreten nächsten Schritt vereinbaren.",
  },

  opening: "Herr Vogt sieht kurz auf. „Sie wollten über Ihr Gehalt sprechen?“",
  first_say: "Das Budget ist dieses Jahr besonders angespannt — ehrlich gesagt kein guter Zeitpunkt.",

  beats: [
    {
      id: "b1_state_case",
      say: "Das Budget ist dieses Jahr besonders angespannt — ehrlich gesagt kein guter Zeitpunkt.",
      wants: ["reason", "detail"],
      press: [
        "Das mag sein — aber können Sie mir sagen, was sich bei Ihnen konkret geändert hat, das eine Erhöhung rechtfertigen würde?",
      ],
      transitions: { onSubstantive: "b2_budget_pushback", onMaxPress: "b2_budget_pushback", next: "b2_budget_pushback" },
    },
    {
      id: "b2_budget_pushback",
      say: "Zusätzliche Verantwortung, gut — aber das Budget ist trotzdem fest. Ich kann da jetzt nichts versprechen.",
      wants: ["concede", "offer"],
      press: [
        "Ein reines „geht nicht“ reicht mir nicht — gibt es einen Zeitpunkt, zu dem wir das noch mal ernsthaft besprechen könnten?",
      ],
      transitions: { onSubstantive: "b3_concrete_step", onMaxPress: "b3_concrete_step", next: "b3_concrete_step" },
    },
    {
      id: "b3_concrete_step",
      say: "Zur nächsten Budgetrunde im Januar könnten wir das noch mal aufgreifen. Was genau erwarten Sie dann von mir?",
      wants: ["detail"],
      press: [
        "Formulieren Sie das bitte konkret, damit ich es intern vertreten kann.",
      ],
      transitions: { onSubstantive: "b_resolved", onMaxPress: "b_unresolved", next: "b_resolved" },
    },
    {
      id: "b_resolved",
      terminal: true,
      outcome: "resolved",
      say: "„In Ordnung. Ich trage im Januar einen konkreten Vorschlag für eine Erhöhung vor, basierend auf Ihrer zusätzlichen Verantwortung — schriftlich festgehalten.“",
    },
    {
      id: "b_unresolved",
      terminal: true,
      outcome: "unresolved",
      say: "„Ich kann Ihnen dazu aktuell nichts Konkretes zusagen. Sprechen Sie mich einfach irgendwann wieder darauf an.“",
    },
  ],

  closing: "„In Ordnung. Ich trage im Januar einen konkreten Vorschlag vor.“",

  afterwards: {
    strong: [
      "Seit letztem Jahr betreue ich zusätzlich drei neue Kunden, ohne dass sich mein Gehalt geändert hat.",
      "Das mit dem Budget verstehe ich, dennoch möchte ich gern über einen konkreten nächsten Schritt sprechen.",
      "Könnten wir das zur nächsten Budgetrunde schriftlich festhalten, statt es offen zu lassen?",
    ],
    watchFor: "Ein „kein guter Zeitpunkt“ ist keine endgültige Absage — wer das als Nein akzeptiert und das Gespräch beendet, bekommt keinen konkreten nächsten Schritt.",
  },
};
