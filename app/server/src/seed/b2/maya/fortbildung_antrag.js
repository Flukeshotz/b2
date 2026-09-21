/**
 * MAYA SCENARIO — Eine Fortbildung beantragen.
 *
 * Negotiation, workplace. The learner requests paid leave and cost coverage
 * for a professional course; Maya (the manager) questions the timing and
 * cost, not the value.
 *
 *   justify (primary) — connecting the course to concrete job needs.
 *   compare (secondary) — weighing cost against benefit.
 *   concede (secondary) — accepting a partial approval as progress.
 */

module.exports = {
  id: "maya_fortbildung_antrag",
  version: 1,
  title: "Eine Fortbildung beantragen",
  minutes: 6,

  roles: {
    learner: "Mitarbeiter/in",
    maya: "Frau Dahlmann, Abteilungsleiterin",
  },

  context: "Sie möchten an einem dreitägigen Fortbildungskurs teilnehmen, der bezahlte Freistellung und eine Kursgebühr von 600 Euro erfordert. Frau Dahlmann ist unter Kostendruck.",
  opening_position: "Das Budget für Fortbildungen ist dieses Quartal bereits ausgeschöpft.",
  objective: "Zumindest eine Teilfinanzierung oder eine Zusage für das nächste Quartal erreichen.",

  capability_targets: {
    primary: "justify",
    secondary: ["compare", "concede"],
  },

  max_learner_turns: 6,

  declaration: {
    primary_capability: "justify",
    secondary_capabilities: ["compare", "concede"],
    theme: 3,
    context: "professional",
    cefr_tier: "developing",
    language_resources: [
      "connecting a request to concrete job needs: der Kurs vermittelt genau die Kenntnisse, die für das neue Projekt gebraucht werden",
      "comparing cost against benefit: 600 Euro stehen einem klaren Nutzen für das Team gegenüber",
      "accepting a partial solution as real progress",
    ],
    checks: [],
    experience_types: ["speaking"],
    exam: "Goethe Mündlich Aufgabe 2 · telc Sprechen Teil 3",
  },

  brief: {
    role: "Sie möchten an einer Fortbildung teilnehmen.",
    situation: "Das Budget ist laut Frau Dahlmann bereits ausgeschöpft.",
    partner: "Frau Dahlmann ist unter Kostendruck, aber nicht grundsätzlich dagegen.",
    goal: "Eine (auch teilweise) Zusage erreichen.",
  },

  opening: "Frau Dahlmann seufzt. „Fortbildung, ja? Das Budget ist dieses Quartal leider ausgeschöpft.“",
  first_say: "Das Fortbildungsbudget ist für dieses Quartal schon aufgebraucht.",

  beats: [
    {
      id: "b1_connect_need",
      say: "Das Fortbildungsbudget ist für dieses Quartal schon aufgebraucht.",
      wants: ["reason", "detail"],
      press: [
        "Warum genau dieser Kurs — was würde er konkret für Ihre Arbeit bringen?",
      ],
      transitions: { onSubstantive: "b2_cost_pushback", onMaxPress: "b2_cost_pushback", next: "b2_cost_pushback" },
    },
    {
      id: "b2_cost_pushback",
      say: "Das klingt sinnvoll, aber 600 Euro sind gerade viel — das Budget hergibt es einfach nicht.",
      wants: ["offer", "reason"],
      press: [
        "Gibt es eine Möglichkeit, die Kosten aufzuteilen oder es später zu machen?",
      ],
      transitions: { onSubstantive: "b3_partial_solution", onMaxPress: "b3_partial_solution", next: "b3_partial_solution" },
    },
    {
      id: "b3_partial_solution",
      say: "Ich könnte die Freistellung genehmigen, wenn Sie die Kursgebühr fürs nächste Quartal beantragen. Wäre das für Sie machbar?",
      wants: ["concede", "detail"],
      press: [
        "Ich brauche eine klare Antwort — passt Ihnen das oder nicht?",
      ],
      transitions: { onSubstantive: "b_resolved", onMaxPress: "b_unresolved", next: "b_resolved" },
    },
    {
      id: "b_resolved",
      terminal: true,
      outcome: "resolved",
      say: "„Gut, dann genehmige ich die Freistellung jetzt, und Sie stellen den Antrag auf Kostenübernahme fürs nächste Quartal.“",
    },
    {
      id: "b_unresolved",
      terminal: true,
      outcome: "unresolved",
      say: "„Ohne eine praktikable Lösung kann ich den Kurs dieses Quartal leider nicht genehmigen.“",
    },
  ],

  closing: "„Gut, dann genehmige ich die Freistellung jetzt.“",

  afterwards: {
    strong: [
      "Der Kurs vermittelt genau die Kenntnisse, die wir für das neue Projekt im Herbst brauchen.",
      "600 Euro stehen einem klaren Nutzen für das ganze Team gegenüber, nicht nur für mich persönlich.",
      "Wenn die Freistellung jetzt genehmigt wird, kann ich die Kursgebühr auch fürs nächste Quartal beantragen.",
    ],
    watchFor: "Frau Dahlmann lehnt nicht den Kurs ab, sondern die sofortigen Kosten — eine zeitlich gestaffelte Lösung überzeugt eher als ein Alles-oder-nichts-Antrag.",
  },
};
