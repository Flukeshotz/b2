/**
 * MAYA SCENARIO — Überstunden.
 *
 * Opinion + pushback. The learner argues that the team's frequent unpaid
 * overtime needs to change. Maya, the team lead, initially defends the
 * status quo on operational grounds.
 *
 *   argue (primary) — stating and defending a clear position.
 *   justify (secondary) — backing the position with concrete facts.
 *   concede (secondary) — acknowledging real staffing constraints.
 *   maintain_discussion (secondary) — not folding after the first pushback.
 */

module.exports = {
  id: "maya_ueberstunden",
  version: 1,
  title: "Zu viele Überstunden",
  minutes: 7,

  roles: {
    learner: "Teammitglied",
    maya: "Herr Brankovic, Teamleiter",
  },

  context: "In den letzten sechs Wochen hat das Team an vier von sechs Wochen Überstunden gemacht, ohne dass diese ausgeglichen wurden. Sie möchten das ansprechen.",
  opening_position: "Überstunden gehören in dieser Branche einfach dazu. Ein Ausgleichssystem einzuführen ist zu kompliziert.",
  objective: "Herrn Brankovic überzeugen, dass ein klares Ausgleichssystem nötig ist, ohne das Team schlechtzumachen.",

  capability_targets: {
    primary: "argue",
    secondary: ["justify", "concede", "maintain_discussion"],
  },

  max_learner_turns: 7,

  declaration: {
    primary_capability: "argue",
    secondary_capabilities: ["justify", "concede", "maintain_discussion"],
    theme: 3,
    context: "professional",
    cefr_tier: "developing",
    language_resources: [
      "stating a position clearly: ich finde, dass wir hier etwas ändern müssen",
      "backing it with numbers: vier von sechs Wochen, ohne Ausgleich",
      "conceding a real constraint before pressing the point",
    ],
    checks: [],
    experience_types: ["speaking"],
    exam: "Goethe Mündlich Aufgabe 2 · telc Sprechen Teil 2/3",
  },

  brief: {
    role: "Sie sind seit einem Jahr im Team.",
    situation: "Überstunden häufen sich, ein Ausgleich fehlt bisher.",
    partner: "Herr Brankovic leitet das Team und ist unter Zeitdruck.",
    goal: "Ein konkretes Ausgleichssystem vereinbaren.",
  },

  opening: "Herr Brankovic sieht kurz von seinem Bildschirm auf. „Du wolltest über Überstunden reden?“",
  first_say: "Überstunden gehören in dem Job einfach dazu. Was genau ist das Problem?",

  beats: [
    {
      id: "b1_state_problem",
      say: "Überstunden gehören in dem Job einfach dazu. Was genau ist das Problem?",
      wants: ["reason", "detail"],
      press: [
        "Das ist mir zu allgemein. Wie oft genau, und worin siegt das Problem konkret?",
      ],
      transitions: { onSubstantive: "b2_pushback_complexity", onMaxPress: "b2_pushback_complexity", next: "b2_pushback_complexity" },
    },
    {
      id: "b2_pushback_complexity",
      say: "Vier von sechs Wochen, gut. Aber ein Ausgleichssystem aufzusetzen bedeutet mehr Verwaltung, und dafür haben wir aktuell niemanden frei.",
      wants: ["reason", "offer"],
      press: [
        "Ich höre nur, dass es unfair ist — aber keinen Vorschlag, wie das ohne zusätzlichen Verwaltungsaufwand funktionieren soll.",
      ],
      transitions: { onSubstantive: "b3_concrete_proposal", onMaxPress: "b3_concrete_proposal", next: "b3_concrete_proposal" },
    },
    {
      id: "b3_concrete_proposal",
      say: "Ein einfaches Stundenkonto also, ohne neue Software. Wer würde das führen?",
      wants: ["offer", "detail"],
      press: [
        "Das muss klar geregelt sein, sonst scheitert es wie der letzte Versuch. Wer genau, und wie oft wird abgerechnet?",
      ],
      transitions: { onSubstantive: "b_resolved", onMaxPress: "b_unresolved", next: "b_resolved" },
    },
    {
      id: "b_resolved",
      terminal: true,
      outcome: "resolved",
      say: "„Gut. Wir führen ein einfaches Stundenkonto, monatlich abgerechnet. Schick mir bis Freitag einen kurzen Vorschlag, wie das geführt werden soll.“",
    },
    {
      id: "b_unresolved",
      terminal: true,
      outcome: "unresolved",
      say: "„Ohne einen klaren, einfachen Vorschlag ändere ich jetzt nichts — das Risiko, dass es wieder einschläft, ist mir zu groß.“",
    },
  ],

  closing: "„Gut. Wir führen ein einfaches Stundenkonto ein, monatlich abgerechnet.“",

  afterwards: {
    strong: [
      "In vier von sechs Wochen gab es Überstunden ohne jeden Ausgleich — das ist auf Dauer nicht haltbar.",
      "Ich verstehe, dass zusätzliche Verwaltung schwierig ist, deshalb schlage ich etwas bewusst Einfaches vor.",
      "Ein Stundenkonto ohne neue Software, monatlich abgerechnet, würde reichen.",
    ],
    watchFor: "Herr Brankovic lehnt nicht das Problem ab, sondern die Komplexität einer Lösung — wer nur das Problem wiederholt, ohne einen einfachen Vorschlag zu machen, kommt nicht weiter.",
  },
};
