/**
 * MAYA SCENARIO — Ein Fehler eines Kollegen.
 *
 * Workplace disagreement. A colleague's mistake affected the learner's own
 * work, but the learner needs the colleague's cooperation to fix it, not a
 * fight. Maya starts defensive.
 *
 *   concede (primary) — de-escalating while still naming the problem.
 *   justify (secondary) — explaining the concrete impact.
 *   maintain_discussion (secondary) — staying constructive under defensiveness.
 *   adapt_register (secondary) — staying professional, not accusatory.
 */

module.exports = {
  id: "maya_kollege_fehler",
  version: 1,
  title: "Ein Fehler in der gemeinsamen Tabelle",
  minutes: 7,

  roles: {
    learner: "Kollege/Kollegin",
    maya: "Frau Ostrowski, Kollegin",
  },

  context: "Frau Ostrowski hat in der gemeinsamen Kalkulationstabelle eine falsche Formel eingetragen, wodurch Ihr Bericht an einen Kunden fehlerhafte Zahlen enthielt. Der Kunde hat bereits nachgefragt.",
  opening_position: "Sie hat nichts falsch gemacht — die Tabelle war schon vorher fehleranfällig, das ist nicht ihr Problem allein.",
  objective: "Den Fehler gemeinsam beheben und eine Wiederholung verhindern, ohne die Zusammenarbeit zu beschädigen.",

  capability_targets: {
    primary: "concede",
    secondary: ["justify", "maintain_discussion", "adapt_register"],
  },

  max_learner_turns: 6,

  declaration: {
    primary_capability: "concede",
    secondary_capabilities: ["justify", "maintain_discussion", "adapt_register"],
    theme: 3,
    context: "professional",
    cefr_tier: "developing",
    language_resources: [
      "naming a problem factually, not accusingly: mir ist aufgefallen, dass…",
      "conceding shared responsibility: das kann jedem passieren, uns beiden nicht nur Ihnen",
      "focusing on the fix, not blame: wichtig ist jetzt, wie wir das beheben",
    ],
    checks: [],
    experience_types: ["speaking"],
    exam: "Goethe Mündlich Aufgabe 2 · telc Sprechen Teil 3",
  },

  brief: {
    role: "Sie arbeiten mit Frau Ostrowski an einer gemeinsamen Kundentabelle.",
    situation: "Eine falsche Formel hat zu einem fehlerhaften Bericht geführt; der Kunde hat nachgefragt.",
    partner: "Frau Ostrowski reagiert zunächst defensiv.",
    goal: "Den Fehler klären und beheben, ohne die Zusammenarbeit zu belasten.",
  },

  opening: "Frau Ostrowski wirkt angespannt. „Ich habe deine Nachricht gesehen — worum geht's genau?“",
  first_say: "Ich habe nichts Falsches gemacht. Die Tabelle war schon vorher unübersichtlich.",

  beats: [
    {
      id: "b1_name_problem",
      say: "Ich habe nichts Falsches gemacht. Die Tabelle war schon vorher unübersichtlich.",
      wants: ["reason", "detail"],
      press: [
        "Das mag sein, aber was genau ist jetzt konkret passiert — welche Zahl war falsch?",
      ],
      transitions: { onSubstantive: "b2_defensive", onMaxPress: "b2_defensive", next: "b2_defensive" },
    },
    {
      id: "b2_defensive",
      say: "Wenn Sie mir jetzt die Schuld geben wollen, dann sage ich auch, dass Sie die Tabelle nie kontrolliert haben, bevor Sie sie verschickt haben.",
      wants: ["concede", "reason"],
      press: [
        "Es geht mir nicht ums Schuldzuweisen — aber Sie haben die Formel geändert. Wie gehen wir jetzt konkret damit um?",
      ],
      transitions: { onSubstantive: "b3_fix_together", onMaxPress: "b3_fix_together", next: "b3_fix_together" },
    },
    {
      id: "b3_fix_together",
      say: "Gut, gut. Was schlagen Sie vor, damit das nicht wieder passiert?",
      wants: ["offer", "detail"],
      press: [
        "Ein vager Wunsch reicht nicht — was genau würde das nächste Mal verhindern?",
      ],
      transitions: { onSubstantive: "b_resolved", onMaxPress: "b_unresolved", next: "b_resolved" },
    },
    {
      id: "b_resolved",
      terminal: true,
      outcome: "resolved",
      say: "„In Ordnung. Wir schreiben dem Kunden gemeinsam eine Korrektur und führen ab jetzt eine zweite Kontrolle vor dem Versand ein.“",
    },
    {
      id: "b_unresolved",
      terminal: true,
      outcome: "unresolved",
      say: "„Ich habe jetzt keine Zeit mehr, das weiter zu besprechen. Wir reden später noch einmal.“",
    },
  ],

  closing: "„In Ordnung. Wir schreiben dem Kunden gemeinsam eine Korrektur.“",

  afterwards: {
    strong: [
      "Mir ist aufgefallen, dass die Formel in Zeile zwölf ein falsches Ergebnis liefert — das hat sich auf den Kundenbericht ausgewirkt.",
      "Das kann jedem passieren, mir eingeschlossen — wichtig ist jetzt, wie wir das schnell korrigieren.",
      "Wenn wir künftig eine zweite Kontrolle vor dem Versand einführen, passiert das nicht noch einmal.",
    ],
    watchFor: "Frau Ostrowski wird defensiv, sobald sie sich beschuldigt fühlt — wer sofort Schuld verteilt statt das Problem sachlich zu benennen, verliert die Kooperation, die für die Lösung nötig ist.",
  },
};
