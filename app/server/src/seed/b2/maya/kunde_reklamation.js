/**
 * MAYA SCENARIO — Eine Kundenreklamation klären.
 *
 * Clarification + workplace. A customer's complaint email was vague. The
 * learner (in a support role) must get the specifics before offering a fix.
 *
 *   ask_followup (primary) — extracting the actual problem from a vague complaint.
 *   adapt_register (secondary) — staying professional with a frustrated customer.
 *   justify (secondary) — explaining what's needed and why.
 */

module.exports = {
  id: "maya_kunde_reklamation",
  version: 1,
  title: "Eine unklare Reklamation",
  minutes: 6,

  roles: {
    learner: "Kundenservice-Mitarbeiter/in",
    maya: "Herr Dumitrescu, Kunde",
  },

  context: "Ein Kunde hat geschrieben: „Das Produkt funktioniert nicht, ich will mein Geld zurück.“ Ohne weitere Details lässt sich das Problem nicht lösen.",
  opening_position: "Er ist genervt und möchte einfach sein Geld zurück, ohne Details zu nennen.",
  objective: "Herausfinden, was konkret nicht funktioniert, bevor eine Lösung angeboten wird.",

  capability_targets: {
    primary: "ask_followup",
    secondary: ["adapt_register", "justify"],
  },

  max_learner_turns: 6,

  declaration: {
    primary_capability: "ask_followup",
    secondary_capabilities: ["adapt_register", "justify"],
    theme: 3,
    context: "professional",
    cefr_tier: "developing",
    language_resources: [
      "asking for specifics without sounding dismissive: können Sie mir genauer beschreiben, was passiert?",
      "explaining why detail is needed: damit ich das Problem gezielt lösen kann",
      "staying calm with a frustrated customer",
    ],
    checks: [],
    experience_types: ["speaking"],
    exam: "Goethe Mündlich Aufgabe 1 · telc Sprechen Teil 1",
  },

  brief: {
    role: "Sie arbeiten im Kundenservice.",
    situation: "Ein Kunde beschwert sich vage über ein defektes Produkt.",
    partner: "Herr Dumitrescu ist frustriert und ungeduldig.",
    goal: "Das konkrete Problem klären und eine passende Lösung anbieten.",
  },

  opening: "Herr Dumitrescu klingt genervt am Telefon. „Das Ding funktioniert einfach nicht. Ich will mein Geld zurück.“",
  first_say: "Das Ding funktioniert nicht, Punkt. Ich will einfach mein Geld zurück.",

  beats: [
    {
      id: "b1_ask_specifics",
      say: "Das Ding funktioniert nicht, Punkt. Ich will einfach mein Geld zurück.",
      wants: ["detail"],
      press: [
        "Ich verstehe den Ärger — aber können Sie mir genauer sagen, was konkret passiert, wenn Sie es benutzen?",
      ],
      transitions: { onSubstantive: "b2_more_detail", onMaxPress: "b2_more_detail", next: "b2_more_detail" },
    },
    {
      id: "b2_more_detail",
      say: "Es geht einfach nicht an, seit dem ersten Tag. Was soll ich da noch groß beschreiben?",
      wants: ["detail", "reason"],
      press: [
        "Das hilft mir schon weiter — haben Sie es an einer anderen Steckdose ausprobiert, oder das Ladekabel gewechselt?",
      ],
      transitions: { onSubstantive: "b3_offer_solution", onMaxPress: "b3_offer_solution", next: "b3_offer_solution" },
    },
    {
      id: "b3_offer_solution",
      say: "Nein, das habe ich nicht probiert. Was schlagen Sie jetzt vor?",
      wants: ["offer", "detail"],
      press: [
        "Sagen Sie mir bitte konkret, welche der beiden Optionen Ihnen lieber wäre.",
      ],
      transitions: { onSubstantive: "b_resolved", onMaxPress: "b_unresolved", next: "b_resolved" },
    },
    {
      id: "b_resolved",
      terminal: true,
      outcome: "resolved",
      say: "„Gut, dann schicken Sie mir bitte ein Ersatzgerät, und ich probiere zuerst ein anderes Kabel.“",
    },
    {
      id: "b_unresolved",
      terminal: true,
      outcome: "unresolved",
      say: "„Ich habe keine Lust mehr auf Fragen — ich will einfach nur mein Geld zurück, ohne weitere Tests.“",
    },
  ],

  closing: "„Gut, dann schicken Sie mir bitte ein Ersatzgerät.“",

  afterwards: {
    strong: [
      "Ich verstehe den Ärger — können Sie mir genauer sagen, was konkret passiert, wenn Sie das Gerät benutzen?",
      "Damit ich das Problem gezielt lösen kann, bräuchte ich noch eine Information: geht es gar nicht an oder schaltet es sich ab?",
      "Ich könnte Ihnen entweder ein Ersatzgerät schicken oder das Geld erstatten — was wäre Ihnen lieber?",
    ],
    watchFor: "Eine vage Beschwerde lässt sich nicht direkt lösen — wer sofort eine Lösung anbietet, ohne das eigentliche Problem zu kennen, trifft oft die falsche.",
  },
};
