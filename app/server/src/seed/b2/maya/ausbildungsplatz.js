/**
 * MAYA SCENARIO — Für einen Ausbildungsplatz argumentieren.
 *
 * Opinion + pushback, general life. The learner argues that a younger
 * relative should be allowed to choose a vocational path over university.
 * Maya (an uncle/relative figure) is skeptical.
 *
 *   argue (primary) — defending an opinion under family pressure.
 *   concede (secondary) — acknowledging valid concerns about job security.
 *   justify (secondary) — giving concrete reasons.
 *   maintain_discussion (secondary) — not backing down after the first doubt.
 */

module.exports = {
  id: "maya_ausbildungsplatz",
  version: 1,
  title: "Ausbildung statt Studium?",
  minutes: 7,

  roles: {
    learner: "Nichte/Neffe",
    maya: "Onkel Reiner",
  },

  context: "Ihre jüngere Cousine möchte eine Ausbildung zur Elektronikerin statt ein Studium beginnen. Onkel Reiner findet das bei einem Familientreffen einen Fehler und diskutiert mit Ihnen darüber.",
  opening_position: "Ohne Studium kommt man beruflich nicht weit — das war schon immer so.",
  objective: "Onkel Reiner mit sachlichen Argumenten zeigen, dass eine Ausbildung eine gute Wahl sein kann.",

  capability_targets: {
    primary: "argue",
    secondary: ["concede", "justify", "maintain_discussion"],
  },

  max_learner_turns: 7,

  declaration: {
    primary_capability: "argue",
    secondary_capabilities: ["concede", "justify", "maintain_discussion"],
    theme: 3,
    context: "general",
    cefr_tier: "developing",
    language_resources: [
      "challenging a generalisation: das stimmt so pauschal nicht mehr",
      "conceding a real concern before countering: die Sorge verstehe ich, aber…",
      "backing an opinion with a concrete example: ein Elektroniker verdient nach der Ausbildung oft mehr als…",
    ],
    checks: [],
    experience_types: ["speaking"],
    exam: "Goethe Mündlich Aufgabe 2 · telc Sprechen Teil 2",
  },

  brief: {
    role: "Sie sind bei einem Familientreffen.",
    situation: "Ihre Cousine möchte eine Ausbildung statt eines Studiums beginnen.",
    partner: "Onkel Reiner hält das für die falsche Entscheidung.",
    goal: "Ihn zumindest zum Nachdenken bringen, ohne den Streit eskalieren zu lassen.",
  },

  opening: "Onkel Reiner schüttelt den Kopf. „Hast du schon gehört? Keine Ausbildung statt Studium — was soll das werden?“",
  first_say: "Ohne Studium kommt man doch beruflich nicht weit. Das war schon immer so.",

  beats: [
    {
      id: "b1_challenge_claim",
      say: "Ohne Studium kommt man doch beruflich nicht weit. Das war schon immer so.",
      wants: ["reason"],
      press: [
        "Das ist eine steile Aussage — worauf stützt du das konkret?",
      ],
      transitions: { onSubstantive: "b2_job_security", onMaxPress: "b2_job_security", next: "b2_job_security" },
    },
    {
      id: "b2_job_security",
      say: "Und was, wenn sie in fünf Jahren einen ganz anderen Beruf will? Mit Ausbildung sitzt man dann fest.",
      wants: ["concede", "reason"],
      press: [
        "Du gehst nicht auf meinen Punkt ein — was ist mit späterer Umorientierung?",
      ],
      transitions: { onSubstantive: "b3_concrete_example", onMaxPress: "b3_concrete_example", next: "b3_concrete_example" },
    },
    {
      id: "b3_concrete_example",
      say: "Nenn mir doch mal ein konkretes Beispiel, statt allgemein zu reden.",
      wants: ["example", "detail"],
      press: [
        "Ein echtes Beispiel, bitte — nicht nur 'man hört das so'.",
      ],
      transitions: { onSubstantive: "b_resolved", onMaxPress: "b_unresolved", next: "b_resolved" },
    },
    {
      id: "b_resolved",
      terminal: true,
      outcome: "resolved",
      say: "„Na gut, vielleicht habe ich das zu einseitig gesehen. Lass sie ihren Weg gehen — sie wird schon wissen, was sie tut.“",
    },
    {
      id: "b_unresolved",
      terminal: true,
      outcome: "unresolved",
      say: "„Ich bleibe dabei — ohne Studium fehlt einfach die Absicherung. Reden wir ein andermal weiter.“",
    },
  ],

  closing: "„Na gut, vielleicht habe ich das zu einseitig gesehen.“",

  afterwards: {
    strong: [
      "Das stimmt so pauschal nicht mehr — viele Ausbildungsberufe sind heute stark nachgefragt.",
      "Die Sorge um spätere Umorientierung verstehe ich, aber eine Ausbildung schließt ein späteres Studium ja nicht aus.",
      "Eine Elektronikerin verdient nach der Ausbildung oft ähnlich viel wie manche Studienabsolventen zu Berufsbeginn.",
    ],
    watchFor: "Onkel Reiner argumentiert mit einer alten Faustregel — wer nur pauschal widerspricht statt mit einem konkreten Beispiel zu kommen, überzeugt ihn nicht.",
  },
};
