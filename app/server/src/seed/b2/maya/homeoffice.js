/**
 * MAYA SCENARIO 02 — Homeoffice auf der Station?
 *
 * The learner discusses flexible working arrangements with Frau Berger (Stationsleitung).
 * Frau Berger represents the traditional clinical standpoint: care happens at the bedside,
 * not from the kitchen table. She is worried about team fairness, colleague burden,
 * and emergency preparedness.
 *
 * This scenario specifically trains:
 *   argue               (primary)   — stating a clear position, presenting claims and reasons.
 *   concede             (primary)   — acknowledging valid counterarguments without abandoning ground.
 *   justify             (secondary) — providing concrete facts, figures, or rules to back up claims.
 *   maintain_discussion (secondary) — defending a position across multiple pushbacks and reframings.
 *   adapt_register      (secondary) — maintaining formal, constructive professional German.
 */

module.exports = {
  id: "maya_homeoffice",
  version: 1,
  title: "Homeoffice auf der Station?",
  minutes: 8,

  roles: {
    learner: "Pflegefachkraft auf Station 3",
    maya: "Frau Berger, Stationsleitung",
  },

  context: "Auf Ihrer Station wird über Entlastung und moderne Arbeitszeitmodelle diskutiert. Sie möchten vorschlagen, dass bestimmte administrative Aufgaben — wie Dienstplankonzepte, Qualitätsberichte oder Pflegegrad-Dokumentationen — teilweise von zu Hause erledigt werden können.",
  opening_position: "Pflege ist Präsenzarbeit am Patienten. Homeoffice auf einer somatischen Akutstation ist weder machbar noch gegenüber den Kolleginnen am Bett fair.",
  objective: "Frau Berger mit sachlichen Argumenten und klaren Rahmenbedingungen von einer zeitlich befristeten Testphase (z. B. 1 Tag pro Monat bei voller Stationsbesetzung) überzeugen, ohne ihre berechtigten Einwände zur Teamgerechtigkeit abzutun.",

  capability_targets: {
    primary: "argue",
    secondary: ["concede", "justify", "maintain_discussion", "adapt_register"],
  },

  max_learner_turns: 7,

  declaration: {
    primary_capability: "argue",
    secondary_capabilities: ["concede", "justify", "maintain_discussion", "adapt_register"],
    theme: 3,                       // Tägliches Leben, Arbeit
    context: "professional",        // healthcare ward administration
    cefr_tier: "developing",
    language_resources: [
      "differentiating scope: es geht nicht um X, sondern um Y",
      "giving reasoned arguments: weil / da / liegt daran, dass...",
      "conceding before countering: das ist ein berechtigter Einwand, aber...",
      "proposing safeguards: unter der Bedingung, dass...",
      "suggesting a trial: ein dreimonatiges Pilotprojekt / eine Testphase vereinbaren",
    ],
    checks: [],
    experience_types: ["speaking"],
    exam: "Goethe Mündlich Aufgabe 2 (Meinung äußern, Argumente abwägen) · telc Sprechen Teil 2/3 (Diskussion und Problemlösung)",
  },

  brief: {
    role: "Sie arbeiten als erfahrene Pflegefachkraft auf der Station und übernehmen auch administrative Aufgaben.",
    situation: "Im Team wird über Entlastung und Dokumentationszeit diskutiert. Sie sprechen mit der Stationsleitung über die Möglichkeit von Homeoffice für reine Schreibarbeiten.",
    partner: "Frau Berger ist Ihre Stationsleitung. Sie hält Homeoffice in der Akutpflege für eine weltfremde Idee.",
    goal: "Bringen Sie stichhaltige Argumente, räumen Sie Gegenargumente ein und einigen Sie sich auf einen konkreten Testlauf.",
  },

  opening: "Frau Berger schenkt sich einen Kaffee ein und sieht Sie skeptisch an. „Sie wollten über Homeoffice sprechen? Ich sage Ihnen gleich: Pflege findet am Krankenbett statt.“",
  first_say: "Wie stellen Sie sich das vor? Sollen unsere Patienten die Medikamente demnächst per Videochat bekommen?",

  beats: [
    {
      id: "b1_position_and_scope",
      say: "Wie stellen Sie sich das vor? Sollen unsere Patienten die Medikamente demnächst per Videochat bekommen?",
      wants: ["reason"],
      press: [
        "Das ist doch keine Antwort auf die Praxis. Wer auf Station arbeitet, muss hier sein. Was genau soll denn zu Hause passieren?",
        "Ich frage noch einmal: Welche konkrete Aufgabe soll das sein? Bisher klingt das nach Kaffeetrinken auf Kosten der Schicht.",
      ],
      transitions: {
        onSubstantive: "b2_counter_solidarity",
        onMaxPress: "b2_counter_solidarity",
        next: "b2_counter_solidarity",
      },
    },
    {
      id: "b2_counter_solidarity",
      say: "Schön und gut, Berichte schreiben. Aber wenn Sie zu Hause sitzen und tippen, fehlt auf der Station eine Pflegekraft. Dann müssen die anderen Kolleginnen doppelt so viele Patientenglocken laufen. Das zerreißt doch das Team.",
      wants: ["reason"],
      press: [
        "Sie weichen aus. Die Stimmung im Team ist ohnehin angespannt. Wie wollen Sie verhindern, dass die Kolleginnen am Bett das Gefühl haben, Sie drücken sich vor der Pflege?",
        "Da haben Sie recht? Wenn Sie mir einfach nur recht geben, ist das Thema ja erledigt. Oder haben Sie eine Lösung, die das Team nicht belastet?",
      ],
      transitions: {
        onSubstantive: "b3_reframe_emergencies",
        onMaxPress: "b3_reframe_emergencies",
        next: "b3_reframe_emergencies",
      },
    },
    {
      id: "b3_reframe_emergencies",
      say: "Sie haben immer eine Antwort parat. Aber was ist bei einem unvorhergesehenen Notfall oder einer Reanimation? Im Dienstzimmer kann ich jemanden sofort rufen. Wer am Küchentisch sitzt, ist 30 Kilometer entfernt.",
      wants: ["reason", "detail", "example"],
      press: [
        "Notfälle kündigen sich nicht an. Wenn auf Station die Hölle los ist, nützt mir Ihre telefonische Erreichbarkeit nichts. Warum sollte das ausgerechnet von zu Hause besser klappen?",
        "Bisher höre ich nur Vorteile für Sie, aber keinen einzigen Mehrwert für die Patientensicherheit. Nennen Sie mir ein klares Beispiel.",
      ],
      transitions: {
        onSubstantive: "b4_pilot_agreement",
        onMaxPress: "b4_pilot_agreement",
        next: "b4_pilot_agreement",
      },
    },
    {
      id: "b4_pilot_agreement",
      say: "Ich bin nach wie vor skeptisch. Aber die Pflegedienstleitung will, dass wir flexiblere Modelle prüfen. Unter welchen konkreten Bedingungen würden Sie denn einen Test vorschlagen?",
      wants: ["offer", "detail"],
      press: [
        "‚Einfach mal ausprobieren‘ mache ich nicht. Wenn, dann brauche ich klare Rahmenbedingungen: Wie lange, wie oft und wer kontrolliert die Ergebnisse?",
      ],
      transitions: {
        onSubstantive: "b_resolved",
        onMaxPress: "b_unresolved",
        next: "b_resolved",
      },
    },
    // Terminal beats
    {
      id: "b_resolved",
      terminal: true,
      outcome: "resolved",
      say: "„Einverstanden. Wir testen das für drei Monate als Pilotprojekt: maximal ein Tag im Monat für die Dienstplanung, und zwar nur, wenn die Schicht auf Station voll besetzt ist. Wir werten das im nächsten Teammeeting aus. Setzen Sie die Eckpunkte bis Freitag schriftlich auf.“",
    },
    {
      id: "b_unresolved",
      terminal: true,
      outcome: "unresolved",
      say: "„Unsere Besprechungszeit ist um. Ohne konkrete Sicherheiten für die Patienten und das Team bleibt Homeoffice auf unserer Station tabu. Wir belassen vorerst alles beim Alten.“",
    },
  ],

  closing: "„Einverstanden. Wir testen das für drei Monate als Pilotprojekt: maximal ein Tag im Monat für die Dienstplanung, und zwar nur, wenn die Schicht auf Station voll besetzt ist. Setzen Sie die Eckpunkte bis Freitag schriftlich auf.“",

  afterwards: {
    strong: [
      "Es geht nicht um die Patientenversorgung, sondern ausschließlich um konzentrierte Dokumentation wie Dienstpläne oder QM-Berichte.",
      "Das verstehe ich vollkommen. Die Kolleginnen am Bett dürfen keinesfalls mehr Belastung tragen. Deshalb sollte Homeoffice nur bei voller Schichtbesetzung möglich sein.",
      "Im Dienstzimmer wird man alle fünf Minuten unterbrochen; zu Hause ist die Planung in der halben Zeit fehlerfrei fertig.",
      "Wir könnten eine dreimonatige Testphase vereinbaren: ein Tag pro Monat, feste Kernarbeitszeit und anschließende Auswertung im Team.",
    ],
    watchFor: "Gehen Sie auf Frau Bergers Sorge um den Teamfrieden ein. Wer ihre Bedenken einfach abtut, verliert das Gespräch. Der Schlüssel ist: Erst den Einwand anerkennen („Das verstehe ich…“), dann eine feste Regel vorschlagen (z. B. nur bei voller Besetzung).",
  },
};
