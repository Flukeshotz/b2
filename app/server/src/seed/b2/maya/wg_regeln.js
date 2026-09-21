/**
 * MAYA SCENARIO — WG-Regeln aushandeln.
 *
 * Negotiation, general life, accessible B2. A new flatmate wants clearer
 * rules on cleaning; Maya (an existing flatmate) is casual about it.
 *
 *   compare (primary) — weighing a fixed rota against an informal approach.
 *   speculate (secondary) — proposing a system tentatively.
 *   concede (secondary) — accepting a partial compromise.
 */

module.exports = {
  id: "maya_wg_regeln",
  version: 1,
  title: "Klare Regeln für die Küche",
  minutes: 5,

  roles: {
    learner: "Mitbewohner/in",
    maya: "Timo, Mitbewohner",
  },

  context: "Die Küche wird selten sauber gehalten, weil es keinen klaren Putzplan gibt. Sie möchten einen festen Rhythmus vorschlagen.",
  opening_position: "Ein fester Plan klingt nach Schule, das brauche man unter Erwachsenen nicht.",
  objective: "Timo für einen einfachen, festen Putzrhythmus gewinnen.",

  capability_targets: {
    primary: "compare",
    secondary: ["speculate", "concede"],
  },

  max_learner_turns: 5,

  declaration: {
    primary_capability: "compare",
    secondary_capabilities: ["speculate", "concede"],
    theme: 3,
    context: "general",
    cefr_tier: "accessible",
    language_resources: [
      "comparing two approaches: ohne Plan klappt es nicht, mit Plan wüssten wir immer, wer dran ist",
      "proposing tentatively: wir könnten es ja mal mit einem wöchentlichen Plan versuchen",
    ],
    checks: [],
    experience_types: ["speaking"],
    exam: "Goethe Mündlich Aufgabe 2 · telc Sprechen Teil 3",
  },

  brief: {
    role: "Sie leben mit Timo in einer WG.",
    situation: "Die Küche ist oft unaufgeräumt, es gibt keinen klaren Plan.",
    partner: "Timo findet feste Pläne übertrieben.",
    goal: "Einen einfachen, festen Rhythmus vereinbaren.",
  },

  opening: "Timo sitzt am Küchentisch. „Du wolltest wegen der Küche reden?“",
  first_say: "Ein fester Putzplan? Das klingt nach Schule, das brauchen wir doch nicht.",

  beats: [
    {
      id: "b1_compare",
      say: "Ein fester Putzplan? Das klingt nach Schule, das brauchen wir doch nicht.",
      wants: ["reason"],
      press: [
        "Ohne Plan hat es bisher aber auch nicht funktioniert — was schlägst du stattdessen vor?",
      ],
      transitions: { onSubstantive: "b2_propose", onMaxPress: "b2_propose", next: "b2_propose" },
    },
    {
      id: "b2_propose",
      say: "Na gut, aber ich will nicht jeden Tag putzen müssen.",
      wants: ["offer", "detail"],
      press: [
        "Was genau wäre dir denn lieber — einmal die Woche, oder wie stellst du dir das vor?",
      ],
      transitions: { onSubstantive: "b3_confirm", onMaxPress: "b3_confirm", next: "b3_confirm" },
    },
    {
      id: "b3_confirm",
      say: "Einmal die Woche, abwechselnd, klingt machbar. Wer fängt an?",
      wants: ["detail"],
      press: [
        "Sag mir konkret, ab wann das gelten soll.",
      ],
      transitions: { onSubstantive: "b_resolved", onMaxPress: "b_unresolved", next: "b_resolved" },
    },
    {
      id: "b_resolved",
      terminal: true,
      outcome: "resolved",
      say: "„Gut, ab dieser Woche wechseln wir uns freitags ab. Ich fange an.“",
    },
    {
      id: "b_unresolved",
      terminal: true,
      outcome: "unresolved",
      say: "„Lass uns das später noch mal besprechen, ich bin mir noch nicht sicher.“",
    },
  ],

  closing: "„Gut, ab dieser Woche wechseln wir uns freitags ab.“",

  afterwards: {
    strong: [
      "Ohne Plan hat es bisher nicht geklappt — mit einem festen Rhythmus wüssten wir beide immer, wer dran ist.",
      "Wir könnten es ja mal mit einem wöchentlichen Wechsel versuchen, freitags zum Beispiel.",
      "Einmal die Woche statt täglich klingt für mich auch machbar.",
    ],
    watchFor: "Timo lehnt nicht die Idee an sich ab, sondern die Vorstellung von etwas Starrem — ein einfacher, seltener Rhythmus überzeugt eher als ein strenger Plan.",
  },
};
