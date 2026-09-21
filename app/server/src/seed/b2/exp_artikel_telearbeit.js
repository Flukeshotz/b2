/**
 * Experience derived from src_artikel_telearbeit. Original Skillcase
 * content, telc Lesen Teil 3's shape: three-way discrimination between what
 * the text states, what it contradicts, and what it simply never addresses
 * — genuinely harder than binary true/false, and a different skill from
 * every format built earlier this session.
 */

const SOURCE_ID = "src_artikel_telearbeit";

const reading = {
  id: "exp_artikel_telearbeit_read",
  kind: "reading",
  ord: 0,
  title: "Telearbeit in der Pflege: ein Widerspruch?",
  minutes: 12,
  primary_capability: "structure",
  secondary_capabilities: [],
  checks: [],
  teaches: [],
  steps: [
    { t: "story", lines: [
      "Ein Sachtext mit drei möglichen Antworten pro Aussage: Richtig, Falsch, oder Text sagt dazu nichts.",
      "Die dritte Option ist die schwierigste: manches klingt plausibel, steht aber einfach nicht im Text.",
    ] },

    { t: "read_source", sourceId: SOURCE_ID },

    { t: "readq", mode: "meaning", sourceId: SOURCE_ID,
      capability: "structure",
      q: "Pflege gilt auf den ersten Blick als Widerspruch zu Telearbeit, weil direkte Betreuung physische Anwesenheit erfordert.",
      options: ["Richtig", "Falsch", "Text sagt dazu nichts"],
      answer: 0,
      explain: "Das steht wörtlich im ersten Absatz: die direkte Betreuung „erfordert physische Anwesenheit“, weshalb Telearbeit „auf den ersten Blick wie ein Widerspruch“ wirkt." },

    { t: "readq", mode: "meaning", sourceId: SOURCE_ID,
      capability: "structure",
      q: "Auch direkt patientennah tätiges Pflegepersonal arbeitet in den beschriebenen Pilotprojekten im Homeoffice.",
      options: ["Richtig", "Falsch", "Text sagt dazu nichts"],
      answer: 1,
      explain: "Falsch — der Text grenzt ausdrücklich ein: die Verlagerung ins Homeoffice gilt „ausschließlich für Personal in koordinierenden oder leitenden Funktionen, nicht für das direkt patientennah tätige Pflegepersonal“." },

    { t: "readq", mode: "meaning", sourceId: SOURCE_ID,
      capability: "structure",
      q: "Die Pilotprojekte haben zu einem spürbaren Anstieg des fachlichen Austauschs zwischen den Teams geführt.",
      options: ["Richtig", "Falsch", "Text sagt dazu nichts"],
      answer: 1,
      explain: "Falsch — der Text berichtet vom Gegenteil: einem „spürbaren Rückgang des informellen fachlichen Austauschs zwischen den Teams“." },

    { t: "readq", mode: "meaning", sourceId: SOURCE_ID,
      capability: "structure",
      q: "Die Mehrheit der Pflegekräfte lehnt Homeoffice grundsätzlich ab.",
      options: ["Richtig", "Falsch", "Text sagt dazu nichts"],
      answer: 2,
      explain: "Der Text äußert sich an keiner Stelle zur Meinung der Mehrheit der Pflegekräfte über Homeoffice — weder zustimmend noch ablehnend. Das ist der Unterschied zwischen „Falsch“ (das Gegenteil steht im Text) und dieser Option (nichts steht dazu im Text)." },

    { t: "readq", mode: "meaning", sourceId: SOURCE_ID,
      capability: "structure",
      q: "Administrative Tätigkeiten in der Pflege galten schon vor der Einführung von Homeoffice als wenig sichtbar.",
      options: ["Richtig", "Falsch", "Text sagt dazu nichts"],
      answer: 0,
      explain: "Das steht wörtlich im dritten Absatz: „Diese Tätigkeiten galten schon vor der Einführung von Homeoffice als wenig sichtbar, weil sie meist außerhalb der eigentlichen Stationsarbeit stattfanden.“" },

    { t: "readq", mode: "implication", sourceId: SOURCE_ID,
      capability: "structure",
      q: "Der Text schreibt, das Homeoffice habe das Sichtbarkeits-Problem „eher verstärkt als neu geschaffen“. Was folgt daraus für die Ursache des Problems?",
      options: [
        "Homeoffice ist die alleinige Ursache des Sichtbarkeitsproblems.",
        "Das Problem bestand bereits vorher; Homeoffice hat es lediglich sichtbarer gemacht oder verschärft.",
        "Es gibt gar kein Sichtbarkeitsproblem, der Text widerspricht sich hier.",
      ],
      answer: 1,
      explain: "„Verstärkt als neu geschaffen“ ordnet die Kausalität klar: die Ursache liegt in der schon vorher bestehenden geringen Sichtbarkeit außerhalb der Stationsarbeit, Homeoffice ist ein verstärkender, nicht ein auslösender Faktor." },
  ],
};

const EXPERIENCES = [reading];

module.exports = { EXPERIENCES, SOURCE_ID };
