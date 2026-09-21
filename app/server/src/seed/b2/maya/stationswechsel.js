/**
 * MAYA SCENARIO — Um einen Stationswechsel bitten.
 *
 * Proposal defense, nursing/workplace. The learner wants to move to a
 * different ward for professional development reasons. Purely a career/
 * communication conversation — no clinical content.
 *
 *   argue (primary) — making and defending the case for the move.
 *   justify (secondary) — giving concrete professional reasons.
 *   concede (secondary) — acknowledging the current ward would lose someone useful.
 *   maintain_discussion (secondary) — not dropping the request after the first doubt.
 */

module.exports = {
  id: "maya_stationswechsel",
  version: 1,
  title: "Um einen Wechsel auf die Kinderstation bitten",
  minutes: 7,

  roles: {
    learner: "Pflegekraft",
    maya: "Frau Berger, Stationsleitung",
  },

  context: "Sie arbeiten seit zwei Jahren auf der Inneren Station und möchten auf die Kinderstation wechseln, weil Sie sich dort langfristig weiterentwickeln möchten.",
  opening_position: "Sie sind auf der Inneren Station unverzichtbar eingearbeitet; ein Wechsel jetzt sei ungünstig.",
  objective: "Frau Berger von einem konkreten, zeitlich geplanten Wechsel überzeugen.",

  capability_targets: {
    primary: "argue",
    secondary: ["justify", "concede", "maintain_discussion"],
  },

  max_learner_turns: 7,

  declaration: {
    primary_capability: "argue",
    secondary_capabilities: ["justify", "concede", "maintain_discussion"],
    theme: 3,
    context: "professional",
    cefr_tier: "developing",
    language_resources: [
      "stating a professional goal clearly: ich möchte mich langfristig in der Kinderkrankenpflege spezialisieren",
      "conceding the ward's staffing concern while still pressing the request",
      "proposing a transition timeline instead of an abrupt change",
    ],
    checks: [],
    experience_types: ["speaking"],
    exam: "Goethe Mündlich Aufgabe 2 · telc Sprechen Teil 3",
  },

  brief: {
    role: "Sie arbeiten seit zwei Jahren auf der Inneren Station.",
    situation: "Sie möchten auf die Kinderstation wechseln.",
    partner: "Frau Berger sieht den Wechsel zunächst als Verlust für ihre Station.",
    goal: "Einen konkreten Übergangsplan vereinbaren.",
  },

  opening: "Frau Berger sieht auf. „Du wolltest über einen Wechsel sprechen?“",
  first_say: "Du bist hier gerade richtig gut eingearbeitet. Warum ausgerechnet jetzt wechseln?",

  beats: [
    {
      id: "b1_state_goal",
      say: "Du bist hier gerade richtig gut eingearbeitet. Warum ausgerechnet jetzt wechseln?",
      wants: ["reason"],
      press: [
        "Das beantwortet meine Frage nicht ganz — was genau reizt dich an der Kinderstation?",
      ],
      transitions: { onSubstantive: "b2_staffing_concern", onMaxPress: "b2_staffing_concern", next: "b2_staffing_concern" },
    },
    {
      id: "b2_staffing_concern",
      say: "Verstehe ich, aber wenn du gehst, fehlt mir sofort eine erfahrene Kraft — das trifft uns hart.",
      wants: ["concede", "offer"],
      press: [
        "Ein einfaches 'das tut mir leid' hilft mir nicht — was schlägst du konkret vor?",
      ],
      transitions: { onSubstantive: "b3_transition_plan", onMaxPress: "b3_transition_plan", next: "b3_transition_plan" },
    },
    {
      id: "b3_transition_plan",
      say: "Ein Übergang, okay. Wie stellst du dir das zeitlich genau vor?",
      wants: ["detail"],
      press: [
        "Ich brauche einen konkreten Zeitraum, keine vage Idee.",
      ],
      transitions: { onSubstantive: "b_resolved", onMaxPress: "b_unresolved", next: "b_resolved" },
    },
    {
      id: "b_resolved",
      terminal: true,
      outcome: "resolved",
      say: "„Gut. Wir planen den Wechsel in drei Monaten, und du hilfst bis dahin, deine Nachfolge einzuarbeiten.“",
    },
    {
      id: "b_unresolved",
      terminal: true,
      outcome: "unresolved",
      say: "„Ohne einen klaren Plan kann ich das jetzt nicht freigeben. Wir sprechen später noch mal.“",
    },
  ],

  closing: "„Gut. Wir planen den Wechsel in drei Monaten.“",

  afterwards: {
    strong: [
      "Ich möchte mich langfristig in der Kinderkrankenpflege spezialisieren, das ist mein konkretes Ziel.",
      "Das verstehe ich — deshalb schlage ich vor, dass ich meine Nachfolge selbst einarbeite, bevor ich gehe.",
      "Ein Übergang von drei Monaten würde reichen, um jemand Neues einzuarbeiten.",
    ],
    watchFor: "Frau Bergers eigentliche Sorge ist die Personallücke, nicht die Berufswahl an sich — wer nur das persönliche Ziel wiederholt, ohne eine Lösung für die Station anzubieten, überzeugt sie nicht.",
  },
};
