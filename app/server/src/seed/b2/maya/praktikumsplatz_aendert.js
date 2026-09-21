/**
 * MAYA SCENARIO — Der Praktikumsplatz ändert sich.
 *
 * Unexpected change, general life, demanding B2. The learner had arranged
 * an internship in one department; mid-conversation Maya reveals it has
 * been reassigned to a much less relevant one — framed as a small detail,
 * not the major change it actually is.
 *
 *   react_unexpected (primary) — noticing the change actually matters and responding.
 *   maintain_discussion (secondary) — not just accepting and moving on.
 *   speculate (secondary) — proposing an alternative.
 */

module.exports = {
  id: "maya_praktikumsplatz_aendert",
  version: 1,
  title: "Der Praktikumsplatz wurde geändert",
  minutes: 7,

  roles: {
    learner: "Praktikant/in",
    maya: "Frau Behrendt, Praktikumskoordinatorin",
  },

  context: "Sie hatten ein Praktikum in der Marketingabteilung vereinbart, das genau zu Ihrem Studienschwerpunkt passt. Frau Behrendt erwähnt beiläufig, dass Sie stattdessen im Lager eingesetzt werden.",
  opening_position: "Es ist organisatorisch nötig, sie sieht darin kein großes Problem.",
  objective: "Erreichen, dass der ursprüngliche oder zumindest ein fachlich passender Platz erhalten bleibt.",

  capability_targets: {
    primary: "react_unexpected",
    secondary: ["maintain_discussion", "speculate"],
  },

  max_learner_turns: 7,

  declaration: {
    primary_capability: "react_unexpected",
    secondary_capabilities: ["maintain_discussion", "speculate"],
    theme: 3,
    context: "general",
    cefr_tier: "demanding",
    language_resources: [
      "noticing that a 'small change' is actually significant",
      "explaining concrete stakes: mein Studienschwerpunkt ist Marketing, nicht Logistik",
      "proposing an alternative rather than just accepting or refusing",
    ],
    checks: [],
    experience_types: ["speaking"],
    exam: "telc Handbuch §4 · Goethe Mündlich Aufgabe 2",
  },

  brief: {
    role: "Sie beginnen nächste Woche ein Praktikum.",
    situation: "Der vereinbarte Platz wird beiläufig geändert.",
    partner: "Frau Behrendt behandelt das als Kleinigkeit.",
    goal: "Einen fachlich passenden Praktikumsplatz sichern.",
  },

  opening: "Frau Behrendt blättert in ihren Unterlagen. „Ach, kurz zu Ihrem Praktikum…“",
  first_say: "Kleine Planänderung: Sie starten jetzt im Lager statt im Marketing. Sonst noch Fragen?",

  beats: [
    {
      id: "b1_notice_change",
      unexpected: true,
      say: "Kleine Planänderung: Sie starten jetzt im Lager statt im Marketing. Sonst noch Fragen?",
      wants: ["reason", "concede"],
      press: [
        "Ist das für Sie okay, oder gibt es ein Problem damit?",
      ],
      transitions: {
        onTrap: "b_trap_accepted",
        onRejectAndCounter: "b2_explain_stakes",
        onCounter: "b2_explain_stakes",
        onSubstantive: "b2_explain_stakes",
        onMaxPress: "b_unresolved",
        next: "b2_explain_stakes",
      },
    },
    {
      id: "b2_explain_stakes",
      say: "Das Lager braucht gerade dringend Unterstützung, das ist auch wichtig für die Firma.",
      wants: ["reason", "detail"],
      press: [
        "Das verstehe ich, aber was schlagen Sie konkret vor, damit mein Praktikum noch zu meinem Studienschwerpunkt passt?",
      ],
      transitions: { onSubstantive: "b3_alternative", onMaxPress: "b3_alternative", next: "b3_alternative" },
    },
    {
      id: "b3_alternative",
      say: "Ich könnte Ihnen anbieten, zwei Wochen im Lager zu helfen und danach ins Marketing zu wechseln. Wäre das machbar für Sie?",
      wants: ["detail"],
      press: [
        "Sagen Sie mir klar, ob das für Sie akzeptabel ist.",
      ],
      transitions: { onSubstantive: "b_resolved", onMaxPress: "b_unresolved", next: "b_resolved" },
    },
    {
      id: "b_resolved",
      terminal: true,
      outcome: "resolved",
      say: "„Gut, dann zwei Wochen Lager, danach fest im Marketing — ich halte das schriftlich fest.“",
    },
    {
      id: "b_trap_accepted",
      terminal: true,
      outcome: "trap_accepted",
      say: "„Gut, dann ist das geklärt — Sie starten im Lager.“ (Ohne weitere Rückfrage bleibt es bei der Änderung, ganz ohne Bezug zu Ihrem Studienschwerpunkt.)",
    },
    {
      id: "b_unresolved",
      terminal: true,
      outcome: "unresolved",
      say: "„Ich habe jetzt keine Zeit mehr für Details — wir lassen es erst mal beim Lager.“",
    },
  ],

  closing: "„Gut, dann zwei Wochen Lager, danach fest im Marketing.“",

  afterwards: {
    strong: [
      "Mein Studienschwerpunkt ist Marketing, nicht Logistik — deshalb ist mir dieser Platz besonders wichtig.",
      "Das verstehe ich, dass das Lager Unterstützung braucht — trotzdem hätte ich gern eine Lösung, die auch zu meinem Studium passt.",
      "Könnte ich zwei Wochen im Lager helfen und danach wie geplant ins Marketing wechseln?",
    ],
    watchFor: "Frau Behrendt stellt die Änderung als Nebensache dar — wer einfach „okay“ sagt, verliert einen Praktikumsplatz, der für die eigene Ausbildung wirklich zählt.",
  },
};
