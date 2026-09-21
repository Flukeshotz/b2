/**
 * MAYA SCENARIO — Ein Wunsch der Angehörigen.
 *
 * Professional communication, register adaptation. A patient's relative
 * (Maya) wants an exception to visiting hours. This is a COMMUNICATION task,
 * not a medical or policy-authority one: the learner explains a rule
 * clearly and kindly, offers what flexibility genuinely exists, and does
 * not make any clinical decision.
 *
 *   adapt_register (primary) — kind, clear, non-bureaucratic explanation.
 *   justify (secondary) — explaining WHY the rule exists.
 *   concede (secondary) — acknowledging the relative's situation.
 *   ask_followup (secondary) — clarifying what the relative actually needs.
 */

module.exports = {
  id: "maya_patientenwunsch",
  version: 1,
  title: "Eine Angehörige bittet um eine Ausnahme",
  minutes: 6,

  roles: {
    learner: "Pflegekraft am Empfang der Station",
    maya: "Frau Weidner, Angehörige",
  },

  context: "Die Besuchszeiten enden um achtzehn Uhr. Frau Weidner kommt um achtzehn Uhr dreißig, weil ihr Zug Verspätung hatte, und möchte ihren Vater noch kurz sehen.",
  opening_position: "Sie ist frustriert und möchte sofort hinein — Regeln interessieren sie in diesem Moment nicht.",
  objective: "Der Angehörigen die Situation ruhig erklären und eine faire, realistische Lösung anbieten, ohne die Regel einfach zu ignorieren oder medizinisch zu entscheiden.",

  capability_targets: {
    primary: "adapt_register",
    secondary: ["justify", "concede", "ask_followup"],
  },

  max_learner_turns: 6,

  declaration: {
    primary_capability: "adapt_register",
    secondary_capabilities: ["justify", "concede", "ask_followup"],
    theme: 3,
    context: "professional",
    cefr_tier: "developing",
    language_resources: [
      "explaining a rule kindly, not bureaucratically: die Besuchszeit dient dazu, dass…",
      "conceding frustration is understandable: das verstehe ich gut, der Zug kann ja nichts dafür",
      "asking a clarifying question instead of assuming: geht es Ihnen vor allem darum, ihn kurz zu sehen, oder…",
    ],
    checks: [],
    experience_types: ["speaking"],
    exam: "Goethe Mündlich Aufgabe 1/2 · telc Sprechen Teil 1",
  },

  brief: {
    role: "Sie arbeiten am Empfang der Station.",
    situation: "Eine Angehörige kommt dreißig Minuten nach Ende der Besuchszeit an.",
    partner: "Frau Weidner ist gestresst und möchte ihren Vater sehen.",
    goal: "Ruhig erklären, klären, was sie wirklich braucht, und eine faire Lösung finden.",
  },

  opening: "Frau Weidner kommt außer Atem an den Empfang. „Ich muss zu meinem Vater, Zimmer vierzehn!“",
  first_say: "Die Besuchszeit ist leider seit dreißig Minuten vorbei. Was genau brauchen Sie gerade?",

  beats: [
    {
      id: "b1_clarify_need",
      say: "Die Besuchszeit ist leider seit dreißig Minuten vorbei. Was genau brauchen Sie gerade?",
      wants: ["detail"],
      press: [
        "Ich verstehe, dass Sie ihn sehen möchten — aber sagen Sie mir konkret: geht es um ein kurzes Hallo oder um etwas Dringendes?",
      ],
      transitions: { onSubstantive: "b2_explain_reason", onMaxPress: "b2_explain_reason", next: "b2_explain_reason" },
    },
    {
      id: "b2_explain_reason",
      say: "Regeln, Regeln — mein Vater liegt seit drei Tagen hier, und ich habe wegen der Bahn keine Schuld an der Verspätung!",
      wants: ["reason", "concede"],
      press: [
        "Ich höre, dass Sie das als unfair empfinden. Können Sie kurz erklären, warum es Ihnen gerade heute besonders wichtig ist?",
      ],
      transitions: { onSubstantive: "b3_offer_solution", onMaxPress: "b3_offer_solution", next: "b3_offer_solution" },
    },
    {
      id: "b3_offer_solution",
      say: "Also gut. Was können Sie mir denn anbieten, wenn ich schon nicht rein darf?",
      wants: ["offer", "detail"],
      press: [
        "Ein konkreter Vorschlag wäre hilfreich — was genau würde Ihnen jetzt helfen?",
      ],
      transitions: { onSubstantive: "b_resolved", onMaxPress: "b_unresolved", next: "b_resolved" },
    },
    {
      id: "b_resolved",
      terminal: true,
      outcome: "resolved",
      say: "„Danke, dass Sie das verstehen. Fünf Minuten, ganz leise, und morgen können Sie zur regulären Zeit länger bleiben — das klingt fair.“",
    },
    {
      id: "b_unresolved",
      terminal: true,
      outcome: "unresolved",
      say: "„Wenn wir uns nicht einigen, muss ich Sie leider bitten, morgen zur regulären Besuchszeit wiederzukommen.“",
    },
  ],

  closing: "„Fünf Minuten, ganz leise, und morgen können Sie zur regulären Zeit länger bleiben.“",

  afterwards: {
    strong: [
      "Die Besuchszeit dient vor allem der Ruhe der Patienten am Abend — das ist der Grund, nicht reine Bürokratie.",
      "Das verstehe ich gut — für die Zugverspätung können Sie wirklich nichts.",
      "Ich kann Ihnen fünf ruhige Minuten heute anbieten, und morgen haben Sie regulär mehr Zeit.",
    ],
    watchFor: "Es geht hier nicht um eine medizinische Entscheidung, sondern um eine klare, freundliche Erklärung und eine faire Lösung innerhalb dessen, was tatsächlich möglich ist.",
  },
};
