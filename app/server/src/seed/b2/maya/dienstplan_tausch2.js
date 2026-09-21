/**
 * MAYA SCENARIO — Schichttausch mit einer Kollegin.
 *
 * Negotiation, peer-to-peer (distinct from maya_schichttausch, which is
 * learner-vs-manager). Here Maya is a colleague being asked for a favour,
 * not an authority granting one — the dynamic and the pushback are different.
 *
 *   justify (primary) — giving the colleague a real reason to say yes.
 *   compare (secondary) — weighing what each side gives up.
 *   concede (secondary) — acknowledging it is a genuine favour, not owed.
 *   maintain_discussion (secondary) — not giving up after the first "vielleicht".
 */

module.exports = {
  id: "maya_dienstplan_tausch2",
  version: 1,
  title: "Eine Kollegin um einen Schichttausch bitten",
  minutes: 6,

  roles: {
    learner: "Pflegekraft",
    maya: "Frau Sandu, Kollegin",
  },

  context: "Sie haben am Sonntag Frühdienst, aber Ihre Schwester heiratet genau an diesem Tag. Sie möchten Frau Sandu bitten, mit Ihnen zu tauschen — sie hat Sonntag frei.",
  opening_position: "Sie hat sich extra freigenommen, um am Sonntag auszuschlafen, und ist nicht begeistert von der Idee.",
  objective: "Frau Sandu zu einem Tausch bewegen, ohne sie zu bedrängen — auf freiwilliger Basis.",

  capability_targets: {
    primary: "justify",
    secondary: ["compare", "concede", "maintain_discussion"],
  },

  max_learner_turns: 6,

  declaration: {
    primary_capability: "justify",
    secondary_capabilities: ["compare", "concede", "maintain_discussion"],
    theme: 3,
    context: "professional",
    cefr_tier: "developing",
    language_resources: [
      "asking a genuine favour, not a demand: ich wollte dich fragen, ob…",
      "acknowledging it costs her something: ich weiß, das ist dein freier Tag",
      "offering something in return: dafür würde ich…",
    ],
    checks: [],
    experience_types: ["speaking"],
    exam: "Goethe Mündlich Aufgabe 2 · telc Sprechen Teil 3",
  },

  brief: {
    role: "Sie arbeiten mit Frau Sandu auf derselben Station.",
    situation: "Sie brauchen den Sonntag frei für die Hochzeit Ihrer Schwester.",
    partner: "Frau Sandu hat sich den Sonntag bewusst freigehalten.",
    goal: "Einen freiwilligen Tausch vereinbaren.",
  },

  opening: "Frau Sandu packt gerade ihre Tasche. „Du wolltest was fragen?“",
  first_say: "Am Sonntag? Da hab ich extra frei genommen, um mal auszuschlafen.",

  beats: [
    {
      id: "b1_reason",
      say: "Am Sonntag? Da hab ich extra frei genommen, um mal auszuschlafen.",
      wants: ["reason"],
      press: [
        "Ein Grund muss schon her, sonst tausche ich meinen einzigen freien Sonntag nicht einfach so.",
      ],
      transitions: { onSubstantive: "b2_acknowledge_cost", onMaxPress: "b2_acknowledge_cost", next: "b2_acknowledge_cost" },
    },
    {
      id: "b2_acknowledge_cost",
      say: "Eine Hochzeit, okay, das ist schon etwas anderes. Aber ich gebe trotzdem meinen einzigen freien Tag auf.",
      wants: ["concede", "offer"],
      press: [
        "Du sagst nur, es tut dir leid — was würdest du mir denn im Gegenzug anbieten?",
      ],
      transitions: { onSubstantive: "b3_offer_compare", onMaxPress: "b3_offer_compare", next: "b3_offer_compare" },
    },
    {
      id: "b3_offer_compare",
      say: "Ich könnte den nächsten Samstagdienst für dich übernehmen oder dir den Feiertag im Mai abtreten — was wäre dir lieber?",
      wants: ["reason", "detail"],
      press: [
        "Sag mir konkret, welchen der beiden du meinst und warum.",
      ],
      transitions: { onSubstantive: "b_resolved", onMaxPress: "b_unresolved", next: "b_resolved" },
    },
    {
      id: "b_resolved",
      terminal: true,
      outcome: "resolved",
      say: "„Gut, dann machen wir das so. Ich übernehme deinen Sonntag, du meinen nächsten Samstag.“",
    },
    {
      id: "b_unresolved",
      terminal: true,
      outcome: "unresolved",
      say: "„Ohne ein klares Angebot mag ich meinen freien Sonntag nicht hergeben. Frag mich gern noch mal, wenn du dir was überlegt hast.“",
    },
  ],

  closing: "„Gut, dann machen wir das so.“",

  afterwards: {
    strong: [
      "Meine Schwester heiratet genau an diesem Sonntag, und ich möchte dabei sein.",
      "Ich weiß, das ist dein einziger freier Sonntag — das ist mir bewusst, und ich bin dir wirklich dankbar.",
      "Im Gegenzug übernehme ich deinen nächsten Samstagdienst oder trete dir den Feiertag im Mai ab.",
    ],
    watchFor: "Ein Tausch unter Kolleginnen ist eine Bitte, kein Anspruch — wer nichts anbietet und nur fordert, bekommt kein Ja.",
  },
};
