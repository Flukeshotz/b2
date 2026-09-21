/**
 * MAYA SCENARIO — Meinungsäußerung in der Vereinsversammlung.
 *
 * Opinion + pushback, general life. The learner proposes changing the
 * club's training schedule; Maya, a long-standing member, resists change.
 *
 *   argue (primary) — defending a proposal for change.
 *   compare (secondary) — weighing old vs. new schedule.
 *   concede (secondary) — respecting tradition while proposing change.
 */

module.exports = {
  id: "maya_vereinsversammlung",
  version: 1,
  title: "Neue Trainingszeiten vorschlagen",
  minutes: 6,

  roles: {
    learner: "Vereinsmitglied",
    maya: "Frau Thalberg, langjähriges Mitglied",
  },

  context: "Das Training liegt seit Jahren dienstags um achtzehn Uhr, was viele Berufstätige ausschließt. Sie schlagen eine Verlegung auf einen späteren Zeitpunkt vor.",
  opening_position: "Die Zeit hat sich seit zehn Jahren bewährt, eine Änderung sei unnötig.",
  objective: "Eine Mehrheit für eine spätere Trainingszeit gewinnen.",

  capability_targets: {
    primary: "argue",
    secondary: ["compare", "concede"],
  },

  max_learner_turns: 6,

  declaration: {
    primary_capability: "argue",
    secondary_capabilities: ["compare", "concede"],
    theme: 3,
    context: "general",
    cefr_tier: "developing",
    language_resources: [
      "arguing for change with concrete numbers: drei von zehn Mitgliedern kommen aktuell aus Zeitgründen nicht",
      "comparing old and new: dienstags um achtzehn Uhr schließt Berufstätige aus, um neunzehn Uhr dreißig nicht",
      "respecting tradition while proposing a change",
    ],
    checks: [],
    experience_types: ["speaking"],
    exam: "Goethe Mündlich Aufgabe 2 · telc Sprechen Teil 2",
  },

  brief: {
    role: "Sie sind Mitglied im Verein.",
    situation: "Die Trainingszeit schließt viele Berufstätige aus.",
    partner: "Frau Thalberg ist seit zehn Jahren im Verein und schätzt die Tradition.",
    goal: "Eine Mehrheit für eine spätere Zeit gewinnen.",
  },

  opening: "Frau Thalberg meldet sich in der Versammlung zu Wort. „Wozu die Trainingszeit ändern?“",
  first_say: "Dienstags achtzehn Uhr hat sich seit zehn Jahren bewährt. Wozu das jetzt ändern?",

  beats: [
    {
      id: "b1_reason",
      say: "Dienstags achtzehn Uhr hat sich seit zehn Jahren bewährt. Wozu das jetzt ändern?",
      wants: ["reason", "detail"],
      press: [
        "Das ist mir zu unkonkret — wie viele Mitglieder betrifft das denn tatsächlich?",
      ],
      transitions: { onSubstantive: "b2_tradition", onMaxPress: "b2_tradition", next: "b2_tradition" },
    },
    {
      id: "b2_tradition",
      say: "Drei von zehn, na gut. Aber die anderen sieben sind zufrieden — warum sollen die sich anpassen?",
      wants: ["concede", "reason"],
      press: [
        "Was schlagen Sie konkret vor, das für beide Gruppen funktioniert?",
      ],
      transitions: { onSubstantive: "b3_compare_times", onMaxPress: "b3_compare_times", next: "b3_compare_times" },
    },
    {
      id: "b3_compare_times",
      say: "Neunzehn Uhr dreißig also. Was ist daran besser als achtzehn Uhr?",
      wants: ["reason", "detail"],
      press: [
        "Ein klarer Vergleich wäre hilfreich — was genau ändert sich für wen?",
      ],
      transitions: { onSubstantive: "b_resolved", onMaxPress: "b_unresolved", next: "b_resolved" },
    },
    {
      id: "b_resolved",
      terminal: true,
      outcome: "resolved",
      say: "„Gut, das überzeugt mich. Ich stimme für einen Testmonat mit neunzehn Uhr dreißig.“",
    },
    {
      id: "b_unresolved",
      terminal: true,
      outcome: "unresolved",
      say: "„Ich bin weiterhin nicht überzeugt. Lassen wir es erst mal beim Alten.“",
    },
  ],

  closing: "„Gut, das überzeugt mich. Ich stimme für einen Testmonat.“",

  afterwards: {
    strong: [
      "Drei von zehn Mitgliedern kommen aktuell aus Zeitgründen nicht — das ist fast ein Drittel.",
      "Das verstehe ich, dass die anderen sieben zufrieden sind — deshalb schlage ich nur einen Testmonat vor, keine dauerhafte Änderung.",
      "Um achtzehn Uhr schaffen es viele Berufstätige nicht rechtzeitig, um neunzehn Uhr dreißig schon.",
    ],
    watchFor: "Frau Thalberg verteidigt vor allem die Tradition — ein zeitlich begrenzter Testmonat überzeugt eher als eine dauerhafte Änderung ohne Rückweg.",
  },
};
