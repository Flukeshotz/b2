/**
 * MAYA SCENARIO — Ein Kollege kommt oft zu spät.
 *
 * Workplace disagreement. A colleague's repeated lateness affects the
 * learner's own start of shift. Maya is defensive at first.
 *
 *   concede (primary) — the conversation must land somewhere workable, not a fight.
 *   justify (secondary) — explaining the concrete impact of the lateness.
 *   maintain_discussion (secondary) — not dropping it after the first excuse.
 */

module.exports = {
  id: "maya_kollege_spaet",
  version: 1,
  title: "Ein Kollege kommt wiederholt zu spät",
  minutes: 6,

  roles: {
    learner: "Kollege/Kollegin",
    maya: "Herr Reinholz, Kollege",
  },

  context: "Herr Reinholz kommt seit drei Wochen regelmäßig zehn bis fünfzehn Minuten zu spät zur Übergabe, sodass Sie später aufhören können. Sie sprechen ihn darauf an.",
  opening_position: "Er findet zehn Minuten nicht der Rede wert.",
  objective: "Erreichen, dass er pünktlicher wird oder zumindest rechtzeitig Bescheid gibt.",

  capability_targets: {
    primary: "concede",
    secondary: ["justify", "maintain_discussion"],
  },

  max_learner_turns: 6,

  declaration: {
    primary_capability: "concede",
    secondary_capabilities: ["justify", "maintain_discussion"],
    theme: 3,
    context: "professional",
    cefr_tier: "developing",
    language_resources: [
      "naming a concrete, repeated pattern: das ist jetzt die dritte Woche in Folge",
      "explaining the real impact: dadurch komme ich selbst zu spät nach Hause",
      "proposing something small and realistic instead of a big demand",
    ],
    checks: [],
    experience_types: ["speaking"],
    exam: "Goethe Mündlich Aufgabe 2 · telc Sprechen Teil 3",
  },

  brief: {
    role: "Sie übernehmen die Schicht nach Herrn Reinholz.",
    situation: "Er kommt regelmäßig zu spät zur Übergabe.",
    partner: "Herr Reinholz reagiert zunächst abwehrend.",
    goal: "Eine realistische Verbesserung vereinbaren.",
  },

  opening: "Herr Reinholz kommt hastig herein. „Sorry, bisschen spät — was gibt's?“",
  first_say: "Zehn Minuten, das ist doch nicht der Rede wert, oder?",

  beats: [
    {
      id: "b1_name_pattern",
      say: "Zehn Minuten, das ist doch nicht der Rede wert, oder?",
      wants: ["reason", "detail"],
      press: [
        "Es geht mir nicht um einen einzelnen Tag — wie oft ist das in letzter Zeit vorgekommen?",
      ],
      transitions: { onSubstantive: "b2_explain_impact", onMaxPress: "b2_explain_impact", next: "b2_explain_impact" },
    },
    {
      id: "b2_explain_impact",
      say: "Na gut, dreimal vielleicht. Aber was macht das schon für einen Unterschied?",
      wants: ["reason"],
      press: [
        "Was bedeutet das denn konkret für mich, wenn du zu spät kommst?",
      ],
      transitions: { onSubstantive: "b3_solution", onMaxPress: "b3_solution", next: "b3_solution" },
    },
    {
      id: "b3_solution",
      say: "Verstehe. Was würde dir denn helfen?",
      wants: ["offer", "detail"],
      press: [
        "Sag mir etwas Konkretes, das wirklich funktioniert.",
      ],
      transitions: { onSubstantive: "b_resolved", onMaxPress: "b_unresolved", next: "b_resolved" },
    },
    {
      id: "b_resolved",
      terminal: true,
      outcome: "resolved",
      say: "„Okay, ich schreibe dir künftig kurz, falls es doch mal später wird, damit du planen kannst.“",
    },
    {
      id: "b_unresolved",
      terminal: true,
      outcome: "unresolved",
      say: "„Ich verstehe das Problem ehrlich gesagt immer noch nicht ganz — lass uns das später weiter besprechen.“",
    },
  ],

  closing: "„Okay, ich schreibe dir künftig kurz Bescheid.“",

  afterwards: {
    strong: [
      "Das ist jetzt die dritte Woche in Folge, in der du zehn bis fünfzehn Minuten später kommst.",
      "Dadurch komme ich selbst später nach Hause, weil die Übergabe sich verschiebt.",
      "Es würde mir schon reichen, wenn du kurz Bescheid gibst, sobald du weißt, dass es später wird.",
    ],
    watchFor: "Herr Reinholz bagatellisiert das Problem zunächst — konkrete Zahlen (dreimal, zehn Minuten) sind überzeugender als ein allgemeines „das nervt mich“.",
  },
};
