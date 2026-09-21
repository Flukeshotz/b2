/**
 * MAYA SCENARIO — Eine Rückgabe klären.
 *
 * Service interaction + clarification. The learner wants to return an item
 * without a receipt; the store's information is initially ambiguous.
 *
 *   ask_followup (primary) — asking for clarification on unclear policy.
 *   justify (secondary) — explaining the situation clearly.
 *   adapt_register (secondary) — polite, service-appropriate register.
 */

module.exports = {
  id: "maya_rueckgabe_geschaeft",
  version: 1,
  title: "Eine Rückgabe ohne Kassenbon",
  minutes: 5,

  roles: {
    learner: "Kunde/Kundin",
    maya: "Frau Yilmaz, Verkäuferin",
  },

  context: "Sie möchten eine Jacke zurückgeben, die Sie vor zehn Tagen gekauft haben, finden aber den Kassenbon nicht.",
  opening_position: "Ohne Bon ist eine Rückgabe schwierig — das ist zunächst unklar formuliert.",
  objective: "Herausfinden, was genau möglich ist, und eine Lösung finden.",

  capability_targets: {
    primary: "ask_followup",
    secondary: ["justify", "adapt_register"],
  },

  max_learner_turns: 5,

  declaration: {
    primary_capability: "ask_followup",
    secondary_capabilities: ["justify", "adapt_register"],
    theme: 3,
    context: "general",
    cefr_tier: "accessible",
    language_resources: [
      "asking for clarification on vague information: was genau bedeutet das — geht es also gar nicht, oder geht es anders?",
      "explaining the situation calmly: ich habe den Bon leider nicht mehr, aber…",
    ],
    checks: [],
    experience_types: ["speaking"],
    exam: "Goethe Mündlich Aufgabe 1 · telc Sprechen Teil 1",
  },

  brief: {
    role: "Sie möchten eine Jacke zurückgeben.",
    situation: "Der Kassenbon ist nicht mehr auffindbar.",
    partner: "Frau Yilmaz gibt zunächst eine unklare Auskunft.",
    goal: "Klarheit über die tatsächlichen Möglichkeiten bekommen.",
  },

  opening: "Frau Yilmaz nimmt die Jacke entgegen. „Haben Sie den Kassenbon dabei?“",
  first_say: "Ohne Bon wird das schwierig, das kann ich Ihnen so leider nicht einfach zurücknehmen.",

  beats: [
    {
      id: "b1_clarify_policy",
      say: "Ohne Bon wird das schwierig, das kann ich Ihnen so leider nicht einfach zurücknehmen.",
      wants: ["reason"],
      press: [
        "Was heißt „schwierig“ genau — geht es also gar nicht, oder gibt es einen anderen Weg?",
      ],
      transitions: { onSubstantive: "b2_alternative_proof", onMaxPress: "b2_alternative_proof", next: "b2_alternative_proof" },
    },
    {
      id: "b2_alternative_proof",
      say: "Wenn Sie mit Karte bezahlt haben, könnten wir den Kauf über den Kontoauszug nachweisen. Haben Sie den dabei?",
      wants: ["detail", "reason"],
      press: [
        "Können Sie das genauer sagen — haben Sie den Auszug hier auf dem Handy, oder müssten Sie ihn erst holen?",
      ],
      transitions: { onSubstantive: "b3_resolve", onMaxPress: "b3_resolve", next: "b3_resolve" },
    },
    {
      id: "b3_resolve",
      say: "Gut, dann kann ich das mit dem Kontoauszug auf Ihrem Handy so akzeptieren. Möchten Sie Geld zurück oder einen Umtausch?",
      wants: ["detail"],
      press: [
        "Sagen Sie mir bitte konkret, was Sie möchten.",
      ],
      transitions: { onSubstantive: "b_resolved", onMaxPress: "b_unresolved", next: "b_resolved" },
    },
    {
      id: "b_resolved",
      terminal: true,
      outcome: "resolved",
      say: "„Gut, dann bekommen Sie das Geld auf die Karte zurückerstattet. Das dauert ein bis zwei Werktage.“",
    },
    {
      id: "b_unresolved",
      terminal: true,
      outcome: "unresolved",
      say: "„Ohne einen Kaufnachweis kann ich die Rückgabe heute leider nicht bearbeiten.“",
    },
  ],

  closing: "„Gut, dann bekommen Sie das Geld auf die Karte zurückerstattet.“",

  afterwards: {
    strong: [
      "Was genau bedeutet 'schwierig' — geht es also gar nicht, oder gibt es einen anderen Weg?",
      "Ich habe mit Karte bezahlt, den Kontoauszug habe ich hier auf dem Handy.",
      "Ich hätte gerne das Geld zurück, kein Umtausch.",
    ],
    watchFor: "Die erste Auskunft „das wird schwierig“ ist absichtlich vage — wer nicht nachfragt, was das konkret bedeutet, bleibt ohne Lösung stehen.",
  },
};
