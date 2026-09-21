/**
 * MAYA SCENARIO — Eine überlastete Kollegin ansprechen.
 *
 * Professional communication, nursing context but purely interpersonal —
 * no clinical decision involved. The learner has noticed a colleague
 * struggling and wants to offer help without being intrusive or
 * patronising.
 *
 *   justify (primary) — explaining why the offer is made, concretely.
 *   adapt_register (secondary) — kind but not condescending tone.
 *   concede (secondary) — respecting the colleague's initial "I'm fine".
 *   ask_followup (secondary) — checking in without prying.
 */

module.exports = {
  id: "maya_kollegin_ueberlastet",
  version: 1,
  title: "Eine überlastete Kollegin ansprechen",
  minutes: 6,

  roles: {
    learner: "Pflegekraft",
    maya: "Frau Kowalczyk, Kollegin",
  },

  context: "Frau Kowalczyk wirkt seit Tagen erschöpft und macht ungewöhnlich viele kleine Fehler bei der Dokumentation. Sie möchten ihr Hilfe anbieten, ohne aufdringlich zu wirken.",
  opening_position: "Sie weist Hilfe zunächst zurück — sie will nicht als schwach gelten.",
  objective: "Ihr auf eine Weise Unterstützung anbieten, die sie tatsächlich annehmen kann.",

  capability_targets: {
    primary: "justify",
    secondary: ["adapt_register", "concede", "ask_followup"],
  },

  max_learner_turns: 6,

  declaration: {
    primary_capability: "justify",
    secondary_capabilities: ["adapt_register", "concede", "ask_followup"],
    theme: 3,
    context: "professional",
    cefr_tier: "developing",
    language_resources: [
      "naming an observation kindly, not clinically: mir ist aufgefallen, dass du in letzter Zeit…",
      "respecting a first refusal without dropping the topic: das verstehe ich, trotzdem wollte ich fragen…",
      "offering something concrete, not vague sympathy: ich könnte dir die Dokumentation heute abnehmen",
    ],
    checks: [],
    experience_types: ["speaking"],
    exam: "Goethe Mündlich Aufgabe 1 · telc Sprechen Teil 1",
  },

  brief: {
    role: "Sie arbeiten mit Frau Kowalczyk auf derselben Station.",
    situation: "Sie wirkt erschöpft und macht ungewöhnlich viele kleine Fehler.",
    partner: "Frau Kowalczyk lehnt Hilfe zunächst ab.",
    goal: "Ihr konkrete, annehmbare Unterstützung anbieten.",
  },

  opening: "Frau Kowalczyk wirkt müde, lächelt aber knapp. „Alles gut, wieso fragst du?“",
  first_say: "Mir geht's gut, wirklich. Warum fragst du?",

  beats: [
    {
      id: "b1_name_observation",
      say: "Mir geht's gut, wirklich. Warum fragst du?",
      wants: ["reason"],
      press: [
        "Das kann sein — aber woran genau hast du das denn festgemacht, dass du fragst?",
      ],
      transitions: { onSubstantive: "b2_deflect", onMaxPress: "b2_deflect", next: "b2_deflect" },
    },
    {
      id: "b2_deflect",
      say: "Ein paar Fehler in der Doku, na und. Das passiert jedem mal. Ich brauche keine Hilfe.",
      wants: ["concede", "offer"],
      press: [
        "Ich will dir nichts unterstellen — aber ein konkretes Angebot würde ich dir trotzdem gerne machen. Wäre das okay?",
      ],
      transitions: { onSubstantive: "b3_concrete_offer", onMaxPress: "b3_concrete_offer", next: "b3_concrete_offer" },
    },
    {
      id: "b3_concrete_offer",
      say: "Na gut. Was genau schlägst du vor?",
      wants: ["offer", "detail"],
      press: [
        "Sag mir konkret, was du übernehmen würdest.",
      ],
      transitions: { onSubstantive: "b_resolved", onMaxPress: "b_unresolved", next: "b_resolved" },
    },
    {
      id: "b_resolved",
      terminal: true,
      outcome: "resolved",
      say: "„Okay… danke. Wenn du heute Abend die Doku für Zimmer acht bis zwölf übernimmst, wäre das wirklich eine Hilfe.“",
    },
    {
      id: "b_unresolved",
      terminal: true,
      outcome: "unresolved",
      say: "„Wirklich, mir geht's gut. Lass uns das Thema lassen.“",
    },
  ],

  closing: "„Okay… danke. Das wäre wirklich eine Hilfe.“",

  afterwards: {
    strong: [
      "Mir ist aufgefallen, dass in letzter Zeit ein paar Kleinigkeiten in der Doku anders liefen als sonst bei dir.",
      "Das verstehe ich, trotzdem wollte ich dir ein konkretes Angebot machen, kein allgemeines Mitleid.",
      "Ich könnte dir heute Abend die Dokumentation für ein paar Zimmer abnehmen, wenn dir das hilft.",
    ],
    watchFor: "Ein zu allgemeines „Brauchst du Hilfe?“ wird leicht abgewehrt — ein konkretes, kleines Angebot ist leichter anzunehmen als ein großes, vages.",
  },
};
