/**
 * MAYA SCENARIO — Kritik von der Teamleitung.
 *
 * Workplace disagreement, demanding B2. Maya (the team lead) criticises the
 * learner's work in front of the wider context of a deadline miss. The
 * learner must accept valid criticism while correcting an inaccurate part
 * of it — a harder balance than simple agreement or simple defence.
 *
 *   concede (primary) — accepting what is actually true.
 *   justify (secondary) — correcting the inaccurate part with facts.
 *   adapt_register (secondary) — staying calm and professional under criticism.
 *   maintain_discussion (secondary) — not going silent, not overreacting.
 */

module.exports = {
  id: "maya_teamleitung_kritik",
  version: 1,
  title: "Kritik an der letzten Abgabe",
  minutes: 7,

  roles: {
    learner: "Mitarbeiter/in",
    maya: "Frau Coskun, Teamleiterin",
  },

  context: "Der letzte Bericht wurde zwei Tage zu spät abgegeben. Frau Coskun kritisiert das scharf — sagt aber auch fälschlich, Sie hätten sie darüber gar nicht informiert, obwohl Sie ihr eine E-Mail geschrieben hatten.",
  opening_position: "Die Verspätung ist inakzeptabel, und dass niemand Bescheid gesagt hat, macht es noch schlimmer.",
  objective: "Die berechtigte Kritik an der Verspätung annehmen, aber den falschen Vorwurf (keine Information) sachlich richtigstellen.",

  capability_targets: {
    primary: "concede",
    secondary: ["justify", "adapt_register", "maintain_discussion"],
  },

  max_learner_turns: 7,

  declaration: {
    primary_capability: "concede",
    secondary_capabilities: ["justify", "adapt_register", "maintain_discussion"],
    theme: 3,
    context: "professional",
    cefr_tier: "demanding",
    language_resources: [
      "accepting valid criticism without excuses: da haben Sie recht, das war zu spät",
      "correcting one specific inaccurate point without dismissing the rest: einen Punkt möchte ich richtigstellen",
      "staying calm under sharp criticism",
    ],
    checks: [],
    experience_types: ["speaking"],
    exam: "Goethe Mündlich Aufgabe 2 · telc Sprechen Teil 3",
  },

  brief: {
    role: "Sie haben den Quartalsbericht zwei Tage zu spät abgegeben.",
    situation: "Frau Coskun ist verärgert und behauptet zusätzlich, Sie hätten sie nicht informiert.",
    partner: "Frau Coskun ist unter Druck von ihrer eigenen Chefin.",
    goal: "Die berechtigte Kritik annehmen, den falschen Punkt sachlich richtigstellen.",
  },

  opening: "Frau Coskun kommt direkt zur Sache. „Der Bericht ist zwei Tage zu spät — und Sie haben mich nicht mal informiert!“",
  first_say: "Zwei Tage Verspätung ohne jede Information — das geht so nicht.",

  beats: [
    {
      id: "b1_accept_delay",
      say: "Zwei Tage Verspätung ohne jede Information — das geht so nicht.",
      wants: ["concede"],
      press: [
        "Ich höre keine klare Aussage von Ihnen dazu — war der Bericht zu spät, ja oder nein?",
      ],
      transitions: { onSubstantive: "b2_correct_inaccuracy", onMaxPress: "b2_correct_inaccuracy", next: "b2_correct_inaccuracy" },
    },
    {
      id: "b2_correct_inaccuracy",
      say: "Und die fehlende Information macht es noch schlimmer — davon wusste ich gar nichts!",
      wants: ["reason", "detail"],
      press: [
        "Ich habe jedenfalls keine Nachricht von Ihnen gesehen — können Sie das belegen?",
      ],
      transitions: { onSubstantive: "b3_way_forward", onMaxPress: "b3_way_forward", next: "b3_way_forward" },
    },
    {
      id: "b3_way_forward",
      say: "Gut, das kläre ich. Aber wie stellen wir sicher, dass das nicht wieder passiert?",
      wants: ["offer", "detail"],
      press: [
        "Ein vager Vorsatz reicht nicht — was genau ändern Sie konkret?",
      ],
      transitions: { onSubstantive: "b_resolved", onMaxPress: "b_unresolved", next: "b_resolved" },
    },
    {
      id: "b_resolved",
      terminal: true,
      outcome: "resolved",
      say: "„In Ordnung. Ich schaue mir Ihre E-Mail noch mal an, und wir vereinbaren feste Zwischenchecks für die nächsten Berichte.“",
    },
    {
      id: "b_unresolved",
      terminal: true,
      outcome: "unresolved",
      say: "„Ich bin damit noch nicht zufrieden. Wir müssen das ein andermal genauer klären.“",
    },
  ],

  closing: "„In Ordnung. Wir vereinbaren feste Zwischenchecks für die nächsten Berichte.“",

  afterwards: {
    strong: [
      "Da haben Sie recht — der Bericht war tatsächlich zwei Tage zu spät, das war nicht in Ordnung.",
      "Einen Punkt möchte ich richtigstellen: Ich habe Ihnen am Montag eine E-Mail zur Verspätung geschickt — vielleicht ist sie untergegangen.",
      "Damit das nicht wieder passiert, schlage ich feste Zwischenchecks eine Woche vor Abgabe vor.",
    ],
    watchFor: "Es gibt hier zwei getrennte Punkte: die Verspätung (berechtigt) und die angebliche fehlende Information (nicht zutreffend). Wer beides pauschal verteidigt oder pauschal zugibt, übersieht den Unterschied.",
  },
};
