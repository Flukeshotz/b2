/**
 * MAYA SCENARIO — Streit ums Treppenhaus.
 *
 * Disagreement, general life. A neighbour repeatedly leaves bikes blocking
 * the stairwell. Maya starts irritated and defensive.
 *
 *   concede (primary) — de-escalating a neighbour dispute.
 *   justify (secondary) — explaining the concrete problem (fire safety, access).
 *   adapt_register (secondary) — staying polite despite provocation.
 *   maintain_discussion (secondary) — not dropping the issue after pushback.
 */

module.exports = {
  id: "maya_nachbarschaftsstreit",
  version: 1,
  title: "Fahrräder im Treppenhaus",
  minutes: 6,

  roles: {
    learner: "Mieter/in",
    maya: "Herr Palowski, Nachbar",
  },

  context: "Herr Palowski stellt regelmäßig zwei Fahrräder im engen Treppenhaus ab, sodass der Kinderwagen der Nachbarin kaum vorbeikommt. Sie möchten das ansprechen.",
  opening_position: "Er sieht das Problem nicht — es hat doch noch nie jemand beschwert.",
  objective: "Ihn höflich, aber bestimmt dazu bewegen, die Räder woanders abzustellen.",

  capability_targets: {
    primary: "concede",
    secondary: ["justify", "adapt_register", "maintain_discussion"],
  },

  max_learner_turns: 6,

  declaration: {
    primary_capability: "concede",
    secondary_capabilities: ["justify", "adapt_register", "maintain_discussion"],
    theme: 3,
    context: "general",
    cefr_tier: "developing",
    language_resources: [
      "naming a concrete problem without accusing: mir ist aufgefallen, dass…",
      "conceding a neighbour's convenience while insisting on safety",
      "staying formal despite irritation: Sie-Form durchhalten",
    ],
    checks: [],
    experience_types: ["speaking"],
    exam: "Goethe Mündlich Aufgabe 2 · telc Sprechen Teil 3",
  },

  brief: {
    role: "Sie wohnen im selben Haus wie Herr Palowski.",
    situation: "Seine Fahrräder blockieren regelmäßig das Treppenhaus.",
    partner: "Herr Palowski reagiert zunächst abwehrend.",
    goal: "Eine für beide akzeptable Lösung finden.",
  },

  opening: "Herr Palowski öffnet die Tür. „Ja bitte? Ich hab gleich einen Termin.“",
  first_say: "Fahrräder im Treppenhaus? Das hat sich noch nie jemand beschwert.",

  beats: [
    {
      id: "b1_name_problem",
      say: "Fahrräder im Treppenhaus? Das hat sich noch nie jemand beschwert.",
      wants: ["reason", "detail"],
      press: [
        "Können Sie das genauer sagen — wo genau ist das ein Problem?",
      ],
      transitions: { onSubstantive: "b2_defensive", onMaxPress: "b2_defensive", next: "b2_defensive" },
    },
    {
      id: "b2_defensive",
      say: "Ich wohne hier seit zehn Jahren und habe die Räder immer dort abgestellt. Warum jetzt plötzlich ein Problem?",
      wants: ["concede", "reason"],
      press: [
        "Zehn Jahre hin oder her — was genau ändert sich für die Nachbarin mit Kinderwagen dadurch konkret?",
      ],
      transitions: { onSubstantive: "b3_propose_solution", onMaxPress: "b3_propose_solution", next: "b3_propose_solution" },
    },
    {
      id: "b3_propose_solution",
      say: "Na gut. Wo soll ich sie denn sonst hinstellen? Im Keller ist kein Platz.",
      wants: ["offer", "detail"],
      press: [
        "Ich brauche einen konkreten Vorschlag, nicht nur ein Achselzucken.",
      ],
      transitions: { onSubstantive: "b_resolved", onMaxPress: "b_unresolved", next: "b_resolved" },
    },
    {
      id: "b_resolved",
      terminal: true,
      outcome: "resolved",
      say: "„Na gut, ich frage die Hausverwaltung wegen des Fahrradständers im Hof. Bis dahin stelle ich sie an die Seite, damit der Kinderwagen durchpasst.“",
    },
    {
      id: "b_unresolved",
      terminal: true,
      outcome: "unresolved",
      say: "„Ich habe jetzt wirklich keine Zeit mehr — wir reden ein andermal weiter.“",
    },
  ],

  closing: "„Na gut, ich stelle sie an die Seite, damit der Kinderwagen durchpasst.“",

  afterwards: {
    strong: [
      "Mir ist aufgefallen, dass der Kinderwagen der Nachbarin kaum noch vorbeikommt, wenn beide Räder mittig stehen.",
      "Ich verstehe, dass Sie das schon lange so machen — trotzdem ist es gerade im Notfall ein echtes Sicherheitsproblem.",
      "Vielleicht könnten Sie die Räder an die Seite stellen, oder wir fragen gemeinsam die Hausverwaltung nach einem Fahrradständer.",
    ],
    watchFor: "Herr Palowski fühlt sich zunächst persönlich angegriffen — wer das Problem sachlich beschreibt statt Vorwürfe zu machen, kommt schneller zu einer Lösung.",
  },
};
