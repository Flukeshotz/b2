/**
 * MAYA SCENARIO 01 — Schichttausch.
 *
 * The learner needs a shift swapped. Maya is the Stationsleitung (Frau Berger)
 * and her position is firmly no. She has legitimate organizational reasons:
 * the roster was posted on Monday, fairness across the team must be preserved,
 * and she cannot create chaos before handover.
 *
 * This scenario trains and tests:
 *   maintain_discussion (primary) — holding ground across multiple pushbacks.
 *   react_unexpected   (secondary) — detecting the collision in beat 3's counter-offer.
 *   justify            (secondary) — providing valid reasons when challenged.
 *   concede            (secondary) — acknowledging the manager's constraints.
 *   adapt_register     (secondary) — maintaining formal, professional Sie-register.
 */

module.exports = {
  id: "maya_schichttausch",
  version: 1,
  title: "Sie brauchen den Samstag frei",
  minutes: 8,

  roles: {
    learner: "Pflegekraft auf Station 3",
    maya: "Frau Berger, Stationsleitung",
  },

  context: "Sie arbeiten seit einem Jahr auf der Station. Sie haben am Samstag Spätdienst. Sie brauchen den Tag frei — Ihre Prüfung ist am Sonntagmorgen in einer anderen Stadt.",
  opening_position: "Der Dienstplan steht seit Montag fest. Grundsätzlich werden keine Schichten kurzfristig getauscht.",
  objective: "Den Samstag frei bekommen, ohne die Station unbesetzt zu lassen oder die eigene Prüfung zu gefährden.",

  capability_targets: {
    primary: "maintain_discussion",
    secondary: ["justify", "concede", "adapt_register", "react_unexpected"],
  },

  max_learner_turns: 7,

  declaration: {
    primary_capability: "maintain_discussion",
    secondary_capabilities: ["react_unexpected", "concede", "justify", "adapt_register"],
    theme: 3,                       // Tägliches Leben, Arbeit
    context: "professional",        // setting only — universal situation
    cefr_tier: "developing",
    language_resources: [
      "conceding before refusing: das verstehe ich, aber… / das stimmt zwar, nur…",
      "giving a concrete reason: weil / da / deshalb + a fact, not a feeling",
      "making a counter-offer: ich könnte dafür… / im Gegenzug würde ich…",
      "holding a position politely under a second refusal",
    ],
    checks: [],
    experience_types: ["speaking"],
    exam: "Goethe Mündlich Aufgabe 2 (gemeinsam zu einer Lösung kommen) · telc Sprechen Teil 3 (Problemlösung)",
  },

  /* WHAT THE LEARNER IS TOLD BEFORE STARTING */
  brief: {
    role: "Sie arbeiten seit einem Jahr auf der Station.",
    situation: "Sie haben am Samstag Spätdienst. Sie brauchen den Tag frei — Ihre Prüfung ist am Sonntagmorgen in einer anderen Stadt.",
    partner: "Frau Berger ist Ihre Stationsleitung. Sie hat den Dienstplan am Montag veröffentlicht.",
    goal: "Bleiben Sie im Gespräch, bis Sie eine konkrete Lösung haben — oder bis Sie wissen, warum es nicht geht.",
  },

  opening: "Frau Berger sieht kurz auf. „Ja? Ich habe gleich Übergabe.“",
  first_say: "Der Dienstplan steht seit Montag fest. Warum kommen Sie erst jetzt?",

  beats: [
    {
      id: "b1_why_now",
      say: "Der Dienstplan steht seit Montag fest. Warum kommen Sie erst jetzt?",
      wants: ["reason"],
      press: [
        "Das beantwortet meine Frage nicht. Warum erst heute?",
        "Ich frage noch einmal: Was ist zwischen Montag und heute passiert?",
      ],
      transitions: {
        onSubstantive: "b2_fairness",
        onMaxPress: "b2_fairness",
        next: "b2_fairness",
      },
    },
    {
      id: "b2_fairness",
      say: "Gut. Aber jeder hier hat private Termine. Wenn ich bei Ihnen tausche, stehen Montag fünf andere vor mir.",
      wants: ["concede", "reason"],
      press: [
        "Sie sagen mir, dass es Ihnen wichtig ist. Das glaube ich Ihnen. Meine Frage war eine andere: Warum Sie und nicht die anderen?",
        "Noch einmal — was unterscheidet Ihren Fall von dem der Kollegin, die letzte Woche gefragt hat?",
      ],
      transitions: {
        onSubstantive: "b3_unexpected_offer",
        onMaxPress: "b3_unexpected_offer",
        next: "b3_unexpected_offer",
      },
    },
    {
      id: "b3_unexpected_offer",
      unexpected: true,
      say: "Also gut. Ich kann Ihnen den Samstag streichen — dafür übernehmen Sie den Nachtdienst von Sonntag auf Montag. Passt das?",
      wants: ["offer", "detail", "concede"],
      press: [
        "Ist das ein Ja oder ein Nein? Ich brauche eine Antwort, bevor ich in die Übergabe gehe.",
      ],
      transitions: {
        onTrap: "b_trap_accepted",
        onRejectAndCounter: "b4_replacement",
        onCounter: "b4_replacement",
        onSubstantive: "b4_replacement",
        onMaxPress: "b_unresolved",
        next: "b4_replacement",
      },
    },
    {
      id: "b4_replacement",
      say: "Verstehe. Dann machen wir es anders: Sie finden bis morgen Mittag jemanden, der tauscht, und sagen mir Bescheid. Wenn nicht, bleibt der Plan.",
      wants: ["offer", "detail"],
      press: [
        "Wen genau fragen Sie? Ich möchte keine Zusage ins Blaue.",
      ],
      transitions: {
        onSubstantive: "b_resolved",
        onMaxPress: "b_unresolved",
        next: "b_resolved",
      },
    },
    // Terminal beats
    {
      id: "b_resolved",
      terminal: true,
      outcome: "resolved",
      say: "„Gut. Dann klären Sie das mit der Kollegin bis morgen Mittag. Wenn sie übernimmt, trage ich es um. Und beim nächsten Mal kommen Sie bitte am Montag zu mir, nicht am Donnerstag.“",
    },
    {
      id: "b_trap_accepted",
      terminal: true,
      outcome: "trap_accepted",
      say: "„Gut. Dann streiche ich den Samstag und trage Sie für den Sonntagnachtdienst ein.“ (Frau Berger wendet sich wieder ihren Unterlagen zu.)",
    },
    {
      id: "b_unresolved",
      terminal: true,
      outcome: "unresolved",
      say: "„Schade. Wenn Sie niemanden finden, bleibt der Dienstplan wie er ist. Ich muss jetzt in die Übergabe.“",
    },
  ],

  closing: "„Gut. Dann bis morgen Mittag. Und beim nächsten Mal kommen Sie bitte am Montag zu mir, nicht am Donnerstag.“",

  afterwards: {
    strong: [
      "Das verstehe ich, aber meine Prüfung lässt sich nicht verschieben.",
      "Das stimmt zwar, nur habe ich in diesem Jahr noch keinen Samstag getauscht.",
      "Der Nachtdienst geht leider nicht — genau dann fahre ich zur Prüfung.",
      "Ich könnte dafür den Feiertag im Mai übernehmen oder Frau Krause fragen.",
    ],
    watchFor: "Wenn Frau Berger Ihnen den Sonntagnachtdienst anbietet: das ist genau die Nacht vor Ihrer Prüfung. Wer hier „ja, danke“ sagt, hat das Gespräch verloren, ohne es zu merken.",
  },
};
