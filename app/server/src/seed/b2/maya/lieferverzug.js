/**
 * MAYA SCENARIO — Unerwarteter Lieferverzug.
 *
 * Unexpected change, workplace, demanding B2. The learner is negotiating a
 * delivery date with a supplier contact (Maya) when she reveals a further
 * complication mid-conversation — a classic "trap": accepting the vague
 * replacement offer without conditions locks in an even worse outcome.
 *
 *   react_unexpected (primary) — detecting and responding to the new information.
 *   maintain_discussion (secondary) — staying engaged through the complication.
 *   justify (secondary) — explaining why the original date matters.
 *   adapt_register (secondary) — staying professional despite frustration.
 */

module.exports = {
  id: "maya_lieferverzug",
  version: 1,
  title: "Die Lieferung verzögert sich weiter",
  minutes: 8,

  roles: {
    learner: "Einkäufer/in",
    maya: "Frau Nowak, Lieferantin",
  },

  context: "Eine wichtige Lieferung sollte am Freitag ankommen. Frau Nowak meldet sich, um eine Verspätung anzukündigen — und offenbart mitten im Gespräch, dass auch der Ersatztermin unsicher ist.",
  opening_position: "Die Lieferung verspätet sich um drei Tage wegen eines Transportproblems.",
  objective: "Einen verlässlichen neuen Termin bekommen, ohne sich auf eine vage Zusage einzulassen.",

  capability_targets: {
    primary: "react_unexpected",
    secondary: ["maintain_discussion", "justify", "adapt_register"],
  },

  max_learner_turns: 7,

  declaration: {
    primary_capability: "react_unexpected",
    secondary_capabilities: ["maintain_discussion", "justify", "adapt_register"],
    theme: 3,
    context: "professional",
    cefr_tier: "demanding",
    language_resources: [
      "explaining why a date matters concretely: unsere Produktion steht ab Montag ohne dieses Teil",
      "noticing a vague replacement offer and asking for a firm commitment",
      "proposing a concrete alternative instead of accepting uncertainty",
    ],
    checks: [],
    experience_types: ["speaking"],
    exam: "telc Handbuch §4 (unerwartete Gesprächsverläufe) · Goethe Mündlich Aufgabe 2",
  },

  brief: {
    role: "Sie sind für den termingerechten Wareneingang zuständig.",
    situation: "Eine wichtige Lieferung verspätet sich, und ein zweites Problem taucht während des Gesprächs auf.",
    partner: "Frau Nowak versucht, das Gespräch mit einer vagen Zusage zu beenden.",
    goal: "Einen verlässlichen, konkreten neuen Termin bekommen.",
  },

  opening: "Frau Nowak ruft an. „Ich habe leider keine guten Neuigkeiten zur Lieferung.“",
  first_say: "Die Lieferung von Freitag verzögert sich um drei Tage — Transportproblem beim Zoll.",

  beats: [
    {
      id: "b1_explain_impact",
      say: "Die Lieferung von Freitag verzögert sich um drei Tage — Transportproblem beim Zoll.",
      wants: ["reason", "detail"],
      press: [
        "Ich höre nur, dass Sie es bedauern — was genau bedeutet das für unseren neuen Termin?",
      ],
      transitions: { onSubstantive: "b2_unexpected_complication", onMaxPress: "b2_unexpected_complication", next: "b2_unexpected_complication" },
    },
    {
      id: "b2_unexpected_complication",
      unexpected: true,
      say: "Montag also — obwohl, ehrlich gesagt bin ich mir da auch nicht ganz sicher, der Zoll ist gerade unberechenbar. Aber machen wir Montag fest, passt das für Sie?",
      wants: ["offer", "detail", "concede"],
      press: [
        "Ist das jetzt ein Ja oder ein Nein? Ich muss das intern weitergeben.",
      ],
      transitions: {
        onTrap: "b_trap_accepted",
        onRejectAndCounter: "b3_firm_commitment",
        onCounter: "b3_firm_commitment",
        onSubstantive: "b3_firm_commitment",
        onMaxPress: "b_unresolved",
        next: "b3_firm_commitment",
      },
    },
    {
      id: "b3_firm_commitment",
      say: "Ich verstehe, dass Sie einen festen Termin möchten. Ich kann Ihnen eine schriftliche Bestätigung bis morgen zusagen — reicht Ihnen das?",
      wants: ["detail"],
      press: [
        "Was genau würde diese Bestätigung enthalten — ein festes Datum oder wieder nur eine Einschätzung?",
      ],
      transitions: { onSubstantive: "b_resolved", onMaxPress: "b_unresolved", next: "b_resolved" },
    },
    {
      id: "b_resolved",
      terminal: true,
      outcome: "resolved",
      say: "„In Ordnung. Sie bekommen morgen eine schriftliche Bestätigung mit einem verbindlichen Datum, keine bloße Schätzung.“",
    },
    {
      id: "b_trap_accepted",
      terminal: true,
      outcome: "trap_accepted",
      say: "„Gut, dann trage ich Montag als vorläufiges Datum ein.“ (Frau Nowak beendet das Gespräch, ohne eine feste Zusage gemacht zu haben.)",
    },
    {
      id: "b_unresolved",
      terminal: true,
      outcome: "unresolved",
      say: "„Ich melde mich, sobald ich mehr weiß.“ (Kein verbindlicher Termin wurde vereinbart.)",
    },
  ],

  closing: "„In Ordnung. Sie bekommen morgen eine schriftliche Bestätigung mit einem verbindlichen Datum.“",

  afterwards: {
    strong: [
      "Unsere Produktion steht ab Montag ohne dieses Teil — deshalb brauche ich ein verbindliches Datum, keine Einschätzung.",
      "Sie sagen selbst, dass Sie sich beim Montag nicht sicher sind — dann kann ich das nicht einfach als fest akzeptieren.",
      "Könnten Sie mir das stattdessen schriftlich mit einem festen Datum bestätigen, statt nur mündlich zu schätzen?",
    ],
    watchFor: "Frau Nowak nennt \"Montag\" und gibt im selben Atemzug zu, unsicher zu sein — wer trotzdem einfach zustimmt, hat keine echte Zusage, sondern nur eine Vermutung mit einem Datum daran.",
  },
};
