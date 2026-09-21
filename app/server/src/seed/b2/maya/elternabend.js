/**
 * MAYA SCENARIO — Gespräch beim Elternabend.
 *
 * Professional communication / register adaptation, general life. The
 * learner (a parent) raises a concern about excessive homework with a
 * teacher figure. Requires clear, adapted, non-confrontational register.
 *
 *   adapt_register (primary) — polite but clear register with an authority figure.
 *   justify (secondary) — giving concrete examples.
 *   concede (secondary) — acknowledging the teacher's perspective.
 *   maintain_discussion (secondary) — not dropping the concern too easily.
 */

module.exports = {
  id: "maya_elternabend",
  version: 1,
  title: "Zu viele Hausaufgaben ansprechen",
  minutes: 6,

  roles: {
    learner: "Elternteil",
    maya: "Frau Albrecht, Lehrerin",
  },

  context: "Ihr Kind sitzt täglich über zwei Stunden an Hausaufgaben. Sie möchten das beim Elterngespräch ansprechen, ohne die Lehrerin anzugreifen.",
  opening_position: "Der Umfang entspricht dem Lehrplan; andere Eltern hätten sich nicht beschwert.",
  objective: "Erreichen, dass die Hausaufgabenmenge zumindest überprüft wird.",

  capability_targets: {
    primary: "adapt_register",
    secondary: ["justify", "concede", "maintain_discussion"],
  },

  max_learner_turns: 6,

  declaration: {
    primary_capability: "adapt_register",
    secondary_capabilities: ["justify", "concede", "maintain_discussion"],
    theme: 3,
    context: "general",
    cefr_tier: "developing",
    language_resources: [
      "raising a concern without blame: mir ist aufgefallen, dass… nicht: Sie geben zu viel auf",
      "giving a concrete example: gestern hat er von vier bis sechs an Mathe gesessen",
      "conceding the teacher's perspective before pressing on",
    ],
    checks: [],
    experience_types: ["speaking"],
    exam: "Goethe Mündlich Aufgabe 1/2 · telc Sprechen Teil 1",
  },

  brief: {
    role: "Sie sind Elternteil eines Schulkindes.",
    situation: "Ihr Kind hat täglich sehr viele Hausaufgaben.",
    partner: "Frau Albrecht sieht darin zunächst kein Problem.",
    goal: "Eine ernsthafte Überprüfung der Hausaufgabenmenge erreichen.",
  },

  opening: "Frau Albrecht blättert in ihren Unterlagen. „Sie wollten über die Hausaufgaben sprechen?“",
  first_say: "Der Umfang entspricht genau dem Lehrplan. Andere Eltern haben sich nie beschwert.",

  beats: [
    {
      id: "b1_concrete_example",
      say: "Der Umfang entspricht genau dem Lehrplan. Andere Eltern haben sich nie beschwert.",
      wants: ["example", "detail"],
      press: [
        "Ein Beispiel wäre hilfreich — wie sah das konkret in der letzten Woche aus?",
      ],
      transitions: { onSubstantive: "b2_defend_plan", onMaxPress: "b2_defend_plan", next: "b2_defend_plan" },
    },
    {
      id: "b2_defend_plan",
      say: "Zwei Stunden für ein Kind seines Alters ist nicht ungewöhnlich, gerade vor den Prüfungen.",
      wants: ["concede", "reason"],
      press: [
        "Ich verstehe, dass Prüfungen anstehen — aber gilt das für jeden Tag, oder nur in dieser Woche?",
      ],
      transitions: { onSubstantive: "b3_propose_check", onMaxPress: "b3_propose_check", next: "b3_propose_check" },
    },
    {
      id: "b3_propose_check",
      say: "Was schlagen Sie denn konkret vor?",
      wants: ["offer", "detail"],
      press: [
        "Ein vager Wunsch hilft mir nicht — was genau möchten Sie, dass ich prüfe?",
      ],
      transitions: { onSubstantive: "b_resolved", onMaxPress: "b_unresolved", next: "b_resolved" },
    },
    {
      id: "b_resolved",
      terminal: true,
      outcome: "resolved",
      say: "„Gut, ich beobachte das über zwei Wochen und melde mich dann bei Ihnen, ob eine Anpassung nötig ist.“",
    },
    {
      id: "b_unresolved",
      terminal: true,
      outcome: "unresolved",
      say: "„Ich sehe aktuell keinen Handlungsbedarf. Beobachten Sie es doch selbst noch etwas.“",
    },
  ],

  closing: "„Gut, ich beobachte das über zwei Wochen.“",

  afterwards: {
    strong: [
      "Mir ist aufgefallen, dass er gestern von vier bis sechs allein an den Matheaufgaben saß.",
      "Ich verstehe, dass vor Prüfungen mehr zu tun ist — meine Frage ist, ob das auch für normale Wochen gilt.",
      "Ich würde mir wünschen, dass Sie den Umfang über zwei Wochen im Blick behalten.",
    ],
    watchFor: "Ein Vorwurf wie „Sie geben zu viel auf“ macht die Lehrerin defensiv — eine konkrete Beobachtung ohne Schuldzuweisung führt eher zu einer echten Prüfung.",
  },
};
