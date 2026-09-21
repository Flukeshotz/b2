/**
 * MAYA SCENARIO — Reklamation im Hotel.
 *
 * Service interaction, general life. The learner's booked room isn't ready
 * and the alternative offered is worse. Requires clear complaint plus
 * negotiation, not just passive acceptance.
 *
 *   justify (primary) — explaining exactly what was booked and why it matters.
 *   compare (secondary) — comparing the offered alternative to what was booked.
 *   ask_followup (secondary) — clarifying what is actually available.
 */

module.exports = {
  id: "maya_reklamation_hotel",
  version: 1,
  title: "Das gebuchte Zimmer ist nicht verfügbar",
  minutes: 6,

  roles: {
    learner: "Gast",
    maya: "Herr Baptiste, Rezeption",
  },

  context: "Sie hatten ein ruhiges Zimmer zum Hof gebucht. An der Rezeption wird Ihnen ein lauteres Zimmer zur Straße angeboten, weil das gebuchte belegt ist.",
  opening_position: "Er bietet die Alternative an, als sei sie gleichwertig.",
  objective: "Eine faire Lösung erreichen — das ursprüngliche Zimmer, eine echte Alternative, oder einen Ausgleich.",

  capability_targets: {
    primary: "justify",
    secondary: ["compare", "ask_followup"],
  },

  max_learner_turns: 5,

  declaration: {
    primary_capability: "justify",
    secondary_capabilities: ["compare", "ask_followup"],
    theme: 3,
    context: "general",
    cefr_tier: "developing",
    language_resources: [
      "explaining why the booking detail matters: ich habe extra ein ruhiges Zimmer gebucht, weil ich früh aufstehen muss",
      "comparing the offer to what was booked: das ist nicht gleichwertig, es liegt zur Straße",
      "asking what else is actually possible",
    ],
    checks: [],
    experience_types: ["speaking"],
    exam: "Goethe Mündlich Aufgabe 1 · telc Sprechen Teil 1",
  },

  brief: {
    role: "Sie checken in einem Hotel ein.",
    situation: "Das gebuchte ruhige Zimmer ist nicht verfügbar.",
    partner: "Herr Baptiste bietet eine lautere Alternative an.",
    goal: "Eine faire Lösung erreichen.",
  },

  opening: "Herr Baptiste schaut auf den Bildschirm. „Ihr Zimmer zum Hof ist leider noch belegt, aber ich habe eins zur Straße für Sie.“",
  first_say: "Zur Straße wäre aktuell frei — das wäre doch auch in Ordnung, oder?",

  beats: [
    {
      id: "b1_explain_why_it_matters",
      say: "Zur Straße wäre aktuell frei — das wäre doch auch in Ordnung, oder?",
      wants: ["reason"],
      press: [
        "Verstehe ich Sie richtig, dass Ihnen die Lage wirklich wichtig ist? Können Sie mir sagen, warum genau?",
      ],
      transitions: { onSubstantive: "b2_compare_offer", onMaxPress: "b2_compare_offer", next: "b2_compare_offer" },
    },
    {
      id: "b2_compare_offer",
      say: "Ich verstehe. Aber im Moment ist wirklich nur das Zimmer zur Straße frei.",
      wants: ["detail", "reason"],
      press: [
        "Gibt es denn irgendeine andere Möglichkeit — ein anderer Zimmertyp, oder wann würde das ruhige Zimmer frei?",
      ],
      transitions: { onSubstantive: "b3_resolve", onMaxPress: "b3_resolve", next: "b3_resolve" },
    },
    {
      id: "b3_resolve",
      say: "Das ruhige Zimmer wird erst morgen früh frei. Was schlagen Sie vor?",
      wants: ["offer", "detail"],
      press: [
        "Sagen Sie mir konkret, was Sie sich vorstellen.",
      ],
      transitions: { onSubstantive: "b_resolved", onMaxPress: "b_unresolved", next: "b_resolved" },
    },
    {
      id: "b_resolved",
      terminal: true,
      outcome: "resolved",
      say: "„In Ordnung, Sie nehmen heute Nacht das Zimmer zur Straße mit Rabatt, und morgen früh wechseln wir Sie kostenlos ins ruhige Zimmer.“",
    },
    {
      id: "b_unresolved",
      terminal: true,
      outcome: "unresolved",
      say: "„Mehr kann ich Ihnen momentan leider nicht anbieten.“",
    },
  ],

  closing: "„In Ordnung, Sie nehmen heute Nacht das Zimmer zur Straße mit Rabatt.“",

  afterwards: {
    strong: [
      "Ich habe extra ein ruhiges Zimmer gebucht, weil ich morgen früh einen wichtigen Termin habe und gut schlafen muss.",
      "Das ist nicht gleichwertig — es liegt zur Straße, das gebuchte lag zum Hof.",
      "Gibt es eine Möglichkeit, heute Nacht einen Ausgleich zu bekommen und morgen ins ruhige Zimmer zu wechseln?",
    ],
    watchFor: "Ein „das wäre doch auch in Ordnung“ ist kein echtes Angebot — wer das kommentarlos akzeptiert, bekommt kein lauteres Zimmer ausgeglichen.",
  },
};
