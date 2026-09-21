/**
 * Experience derived from src_ueberschriften_pflege. Original Skillcase
 * content, telc Lesen Teil 1's shape: match the headline that actually
 * SUMMARIZES a paragraph, not the one that merely shares a keyword with it.
 * Five candidate headlines for four paragraphs — one is a deliberate
 * distractor that shares vocabulary with paragraph 1 but misstates its
 * actual point.
 */

const SOURCE_ID = "src_ueberschriften_pflege";

const reading = {
  id: "exp_ueberschriften_pflege_read",
  kind: "reading",
  ord: 0,
  title: "Vier Überschriften, vier Absätze",
  minutes: 10,
  primary_capability: "structure",
  secondary_capabilities: [],
  checks: [],
  teaches: [],
  steps: [
    { t: "story", lines: [
      "Vier Absätze zu einem Thema, fünf mögliche Überschriften. Eine Überschrift passt zu keinem der Absätze — merken Sie sich, welche.",
      "Eine Überschrift muss den GANZEN Absatz zusammenfassen, nicht nur ein Wort daraus aufgreifen.",
    ] },

    { t: "read_source", sourceId: SOURCE_ID },

    { t: "readq", mode: "meaning", sourceId: SOURCE_ID,
      capability: "structure",
      q: "Welche Überschrift passt zu Absatz 1?",
      options: [
        "Pflegekräfte fordern höhere Gehälter",
        "Planbare Dienstpläne locken mehr Bewerbungen",
        "Weniger Bewerbungen trotz besserer Bezahlung",
      ],
      answer: 1,
      explain: "Absatz 1 handelt davon, dass mehr Bewerbungen eingehen, SEIT Kliniken planbare Dienstpläne anbieten — und dass Planbarkeit den Befragten sogar wichtiger ist als Gehalt. Die erste Überschrift greift nur das Stichwort „Gehalt“ auf, verdreht aber die eigentliche Aussage." },

    { t: "readq", mode: "meaning", sourceId: SOURCE_ID,
      capability: "structure",
      q: "Welche Überschrift passt zu Absatz 2?",
      options: [
        "Kleine Häuser sehen sich außerstande, langfristig zu planen",
        "Alle Kliniken führen jetzt feste Dienstpläne ein",
        "Beschäftigte kleinerer Häuser sind besonders zufrieden",
      ],
      answer: 0,
      explain: "Absatz 2 erklärt genau, warum kleinere Häuser mit knapper Personaldecke sich dem Trend zu langfristiger Planung nicht anschließen können — wegen kurzfristiger Ausfälle. Die anderen beiden Überschriften behaupten das Gegenteil bzw. etwas, das im Absatz nicht steht." },

    { t: "readq", mode: "meaning", sourceId: SOURCE_ID,
      capability: "structure",
      q: "Welche Überschrift passt zu Absatz 3?",
      options: [
        "Ein Kompromiss zwischen Planbarkeit und Flexibilität",
        "Ein Modellprojekt scheitert an mangelnder Akzeptanz",
        "Feste Dienstpläne ohne jede Ausnahme"
      ],
      answer: 0,
      explain: "Absatz 3 beschreibt eine Lösung, die beides kombiniert — vier Wochen Vorlauf UND die Möglichkeit späterer Änderungen mit 48-Stunden-Frist. Die Rückmeldungen sind laut Text „überwiegend positiv“, nicht gescheitert; und Ausnahmen (Notfälle) sind ausdrücklich erlaubt." },

    { t: "readq", mode: "meaning", sourceId: SOURCE_ID,
      capability: "structure",
      q: "Welche Überschrift passt zu Absatz 4?",
      options: [
        "Bessere Planung löst den Personalmangel nicht",
        "Experten empfehlen sofortige Neueinstellungen",
        "Planungswerkzeuge sind überflüssig geworden",
      ],
      answer: 0,
      explain: "Absatz 4 sagt ausdrücklich, dass bessere Planung die Situation „entschärfen“, aber „keine zusätzlichen Arbeitskräfte ersetzen“ kann, solange der Personalmangel bestehen bleibt — das grundlegende Problem bleibt ungelöst." },

    { t: "readq", mode: "implication", sourceId: SOURCE_ID,
      capability: "structure",
      q: "Absatz 1 nennt planbare Dienstpläne als Grund für mehr Bewerbungen; Absatz 4 sagt, Planungswerkzeuge könnten den Personalmangel nicht lösen. Wie passen beide Aussagen zusammen?",
      options: [
        "Sie widersprechen sich: entweder helfen Dienstpläne oder sie helfen nicht.",
        "Beide können gleichzeitig stimmen: bessere Planung kann mehr Bewerbungen anziehen, ohne das strukturelle Problem des Personalmangels vollständig zu lösen.",
        "Absatz 4 widerlegt Absatz 1 vollständig.",
      ],
      answer: 1,
      explain: "Die beiden Aussagen operieren auf verschiedenen Ebenen: mehr Bewerbungen (kurzfristiger, lokaler Effekt) und struktureller Personalmangel (langfristiges, branchenweites Problem). Ein Absatz beschreibt einen positiven Effekt, der andere dessen Grenzen — kein Widerspruch." },
  ],
};

const EXPERIENCES = [reading];

module.exports = { EXPERIENCES, SOURCE_ID };
