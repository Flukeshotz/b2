/**
 * Experience derived from src_sprachbausteine_praxis. Original Skillcase
 * content, telc's Sprachbausteine shape: one running text, six numbered
 * gaps, three options each, testing which word fits grammatically and
 * idiomatically — not what the text means. Each gap is a readq item
 * referencing the same source; the source text stays visible throughout,
 * same as every other reading experience in this product.
 */

const SOURCE_ID = "src_sprachbausteine_praxis";

const reading = {
  id: "exp_sprachbausteine_praxis_read",
  kind: "reading",
  ord: 0,
  title: "Sprachbausteine: Ein Text mit Lücken",
  minutes: 10,
  primary_capability: "structure",
  secondary_capabilities: [],
  checks: [],
  teaches: [],
  steps: [
    { t: "story", lines: [
      "Ein Text mit sechs Lücken. Bei jeder Lücke passen die drei Wörter grammatisch fast — aber nur eines passt wirklich.",
      "Der Text bleibt die ganze Zeit sichtbar. Lesen Sie ihn zuerst einmal ganz durch.",
    ] },

    { t: "read_source", sourceId: SOURCE_ID },

    { t: "readq", mode: "meaning", sourceId: SOURCE_ID,
      capability: "structure",
      q: "Lücke 1: „Immer mehr Betriebe bieten inzwischen Homeoffice an, ___ längst nicht jede Tätigkeit sich dafür eignet.\"",
      options: ["obwohl", "weil", "damit"],
      answer: 0,
      explain: "„Obwohl“ passt: der Hauptsatz (immer mehr Homeoffice) und der Nebensatz (nicht jede Tätigkeit eignet sich) stehen im Gegensatz zueinander. „Weil“ würde eine Begründung einleiten, die hier keinen Sinn ergibt; „damit“ verlangt einen Zweck, der hier fehlt." },

    { t: "readq", mode: "meaning", sourceId: SOURCE_ID,
      capability: "structure",
      q: "Lücke 2: „Wer direkten Kontakt zu Patientinnen und Patienten hat, kann seine Arbeit ___ von zu Hause noch aus dem Café erledigen.\"",
      options: ["weder", "sowohl", "entweder"],
      answer: 0,
      explain: "„Weder … noch“ ist ein festes Paar, das beide Möglichkeiten ausschließt — genau die Aussage hier. „Sowohl“ würde „als auch“ verlangen und die gegenteilige Bedeutung ergeben; „entweder“ passt nicht zu „noch“." },

    { t: "readq", mode: "meaning", sourceId: SOURCE_ID,
      capability: "structure",
      q: "Lücke 3: „___ diese Tätigkeiten von vornherein ausgeschlossen sind, wünschen sich viele Beschäftigte in solchen Berufen trotzdem mehr Flexibilität.\"",
      options: ["Auch wenn", "Damit", "Sobald"],
      answer: 0,
      explain: "„Auch wenn“ leitet einen Gegensatz ein: obwohl Homeoffice ausgeschlossen ist, wünschen sich die Beschäftigten trotzdem etwas anderes. „Damit“ verlangt einen Zweck, „sobald“ eine zeitliche Bedingung — beides passt hier nicht." },

    { t: "readq", mode: "meaning", sourceId: SOURCE_ID,
      capability: "structure",
      q: "Lücke 4: „Einige Kliniken reagieren ___ schon darauf und bieten mehr Mitspracherecht bei der Verteilung der Dienste.\"",
      options: ["bereits", "obwohl", "falls"],
      answer: 0,
      explain: "„Bereits“ (zusammen mit „schon“) verstärkt die zeitliche Aussage, dass etwas jetzt schon passiert. „Obwohl“ und „falls“ sind Konjunktionen, die hier keinen eigenen Nebensatz einleiten und syntaktisch nicht passen." },

    { t: "readq", mode: "meaning", sourceId: SOURCE_ID,
      capability: "structure",
      q: "Lücke 5: „Andere Häuser halten dagegen ___ an starren Plänen fest, weil eine Änderung aus ihrer Sicht zu kompliziert wäre.\"",
      options: ["nach wie vor", "immerhin", "sowieso"],
      answer: 0,
      explain: "„Nach wie vor“ (immer noch, wie zuvor) passt genau zur Aussage, dass sich an der Praxis nichts geändert hat. „Immerhin“ würde eine positive Einschränkung einleiten, „sowieso“ eine Selbstverständlichkeit — beides passt inhaltlich nicht." },

    { t: "readq", mode: "meaning", sourceId: SOURCE_ID,
      capability: "structure",
      q: "Lücke 6: „Ob sich diese Haltung auf Dauer halten lässt, ___ sich zeigen.\"",
      options: ["wird", "kann", "muss"],
      answer: 0,
      explain: "„Wird sich zeigen“ ist eine feste Wendung für „das bleibt abzuwarten“. „Kann sich zeigen“ und „muss sich zeigen“ sind grammatisch korrekte Sätze, aber nicht die feste, in diesem Kontext übliche Wendung." },

    /* Sprachbausteine tests grammatical fit, not content — but B2 reading
       still requires more than filling gaps correctly. One item that asks
       what the completed text actually argues, not just which word fits. */
    { t: "readq", mode: "implication", sourceId: SOURCE_ID,
      capability: "structure",
      q: "Der Text stellt zwei Arten von Kliniken gegenüber. Was ist die eigentliche Aussage des Textes, wenn man alle Sätze zusammen betrachtet?",
      options: [
        "Homeoffice sollte in der Pflege komplett eingeführt werden.",
        "Auch dort, wo Homeoffice unmöglich ist, wächst der Wunsch nach mehr Mitspracherecht bei der Arbeitsorganisation — und manche Häuser reagieren bereits, andere noch nicht.",
        "Kliniken mit starren Plänen handeln bewusst gegen die Interessen ihrer Beschäftigten.",
      ],
      answer: 1,
      explain: "Der Text sagt nirgends, Homeoffice solle eingeführt werden — im Gegenteil, er stellt fest, dass es dort unmöglich ist. Die eigentliche Bewegung im Text ist die von Flexibilität allgemein zu einer konkreten Reaktion mancher Häuser, während andere „aus ihrer Sicht“ (nicht notwendigerweise aus böser Absicht) an alten Plänen festhalten." },
  ],
};

const EXPERIENCES = [reading];

module.exports = { EXPERIENCES, SOURCE_ID };
