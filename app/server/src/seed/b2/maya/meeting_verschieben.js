/**
 * MAYA SCENARIO — Meeting verschieben.
 *
 * Negotiation. The learner wants the weekly team meeting moved from Monday to
 * Wednesday. Maya (a colleague, not a manager) has a real constraint of her
 * own — she teaches a course on Wednesday mornings — so this is peer
 * negotiation, not asking permission from an authority.
 *
 *   justify (primary) — giving concrete reasons the request is necessary.
 *   compare (secondary) — weighing two possible new days against each other.
 *   concede (secondary) — acknowledging Maya's own conflicting commitment.
 *   maintain_discussion (secondary) — staying in the negotiation past the first no.
 */

module.exports = {
  id: "maya_meeting_verschieben",
  version: 1,
  title: "Das Meeting verschieben",
  minutes: 6,

  roles: {
    learner: "Teammitglied",
    maya: "Frau Lindqvist, Kollegin",
  },

  context: "Das wöchentliche Team-Meeting liegt montags um neun Uhr. Seit Kurzem haben Sie montags einen festen Arzttermin, der sich nicht verschieben lässt. Sie möchten das Meeting auf einen anderen Wochentag legen.",
  opening_position: "Montag neun Uhr ist seit zwei Jahren der feste Termin. Eine Verschiebung bringt alle anderen Kalender durcheinander.",
  objective: "Das Meeting auf einen Tag legen, der für Sie funktioniert, ohne Frau Lindqvists eigenen Konflikt zu ignorieren.",

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
      "giving a fixed, non-negotiable reason: das lässt sich leider nicht verschieben",
      "comparing two options: montags geht es nicht, aber mittwochs oder donnerstags wäre möglich",
      "conceding a colleague's own constraint before pressing on",
    ],
    checks: [],
    experience_types: ["speaking"],
    exam: "Goethe Mündlich Aufgabe 2 · telc Sprechen Teil 3 (Problemlösung)",
  },

  brief: {
    role: "Sie sind Teammitglied und haben seit Kurzem montags um neun Uhr einen festen Arzttermin.",
    situation: "Das Team-Meeting liegt genau in dieser Zeit. Sie möchten es verschieben.",
    partner: "Frau Lindqvist organisiert die Meetings seit zwei Jahren nach demselben Muster.",
    goal: "Einen neuen, für beide funktionierenden Termin finden.",
  },

  opening: "Frau Lindqvist blättert in ihrem Kalender. „Du wolltest wegen des Meetings sprechen?“",
  first_say: "Montag neun Uhr ist seit zwei Jahren fix. Warum soll sich das jetzt ändern?",

  beats: [
    {
      id: "b1_reason",
      say: "Montag neun Uhr ist seit zwei Jahren fix. Warum soll sich das jetzt ändern?",
      wants: ["reason"],
      press: [
        "Ein Arzttermin lässt sich doch meistens verlegen. Warum ausgerechnet dieser nicht?",
      ],
      transitions: { onSubstantive: "b2_alternative", onMaxPress: "b2_alternative", next: "b2_alternative" },
    },
    {
      id: "b2_alternative",
      say: "Gut, das verstehe ich. Aber ich habe mittwochs früh einen Kurs, den ich unterrichte — das geht bei mir also auch nicht einfach so.",
      wants: ["concede", "offer"],
      press: [
        "Dann brauche ich einen konkreten Vorschlag, keinen allgemeinen Wunsch — welcher Tag würde bei dir denn wirklich passen?",
      ],
      transitions: { onSubstantive: "b3_compare_days", onMaxPress: "b3_compare_days", next: "b3_compare_days" },
    },
    {
      id: "b3_compare_days",
      say: "Donnerstag oder Freitag könnten bei mir beide funktionieren. Was spricht für dich für den einen oder den anderen?",
      wants: ["reason", "detail"],
      press: [
        "Beide sind für mich technisch möglich — ich brauche von dir einen Grund, warum einer der beiden besser ist.",
      ],
      transitions: { onSubstantive: "b_resolved", onMaxPress: "b_unresolved", next: "b_resolved" },
    },
    {
      id: "b_resolved",
      terminal: true,
      outcome: "resolved",
      say: "„Gut, dann verschieben wir es auf Donnerstag neun Uhr. Ich sage dem Team Bescheid.“",
    },
    {
      id: "b_unresolved",
      terminal: true,
      outcome: "unresolved",
      say: "„Ohne einen klaren Vorschlag lassen wir es vorerst beim Montag. Denk in Ruhe nach und sprich mich noch einmal an.“",
    },
  ],

  closing: "„Gut, dann verschieben wir es auf Donnerstag neun Uhr.“",

  afterwards: {
    strong: [
      "Der Termin liegt genau montags um neun und lässt sich ärztlicherseits nicht verlegen.",
      "Das verstehe ich — dein Kurs mittwochs ist ja genauso fix wie mein Arzttermin.",
      "Donnerstag wäre besser, weil dann noch niemand im Team einen anderen festen Termin hat.",
    ],
    watchFor: "Frau Lindqvist hat einen echten eigenen Konflikt (der Mittwochskurs) — wer das ignoriert und weiter auf Mittwoch besteht, verliert an Glaubwürdigkeit.",
  },
};
