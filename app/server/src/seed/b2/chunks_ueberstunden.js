/**
 * FOUR MOVES FROM THE ÜBERSTUNDEN THREAD. Original Skillcase content.
 *
 *   reject a generalisation for one group without denying it elsewhere → argue
 *   question a claim politely instead of flatly denying it              → argue
 *   propose a compromise without demanding it                          → concede
 *   attribute a decision to calculation rather than intent               → structure
 */

const EXPRESSIONS = [
  {
    id: "mag_fuer_x_gelten_fuer_y_nicht",
    produceContext: "Jemand macht eine allgemeine Aussage, die für eine Gruppe stimmt, für eine andere aber nicht. Weisen Sie die Verallgemeinerung zurück, ohne die Aussage insgesamt zu bestreiten.",
    produceHint: "Erst zugeben, dass es für eine Gruppe stimmt — dann sagen, für wen nicht.",
    citation: "Das mag für X gelten, für Y aber nicht.",
    gloss: "that may be true for X, but not for Y",
    who: "Priya S.",
    occurrence: "Das mag für die Kalkulation gelten, für die Beschäftigten aber nicht unbedingt.",
    capability: "argue",
    does: "Sie räumen ein, dass eine Aussage für einen Bereich zutrifft, und grenzen sie gleichzeitig auf genau diesen Bereich ein. Das ist präziser als ein glattes Nein.",
    notThis: "Es ist kein Widerspruch gegen die ganze Aussage. Der erste Teil bleibt stehen — nur die Reichweite wird begrenzt.",
    pattern: /das\s+mag\s+für\s+\S[^.!?]{0,40}\bgelten\b[^.!?]{0,60}\baber\s+nicht\b/i,
    frame: /das\s+mag\s+für\b[^.!?]{0,100}\baber\s+nicht\b/i,
    novelty: 3, minWords: 8,
    help: {
      absent: "Benutzen Sie „Das mag für X gelten, für Y aber nicht.“",
      frame: "Beide Hälften brauchen ein konkretes X und Y — sonst bleibt offen, was eingegrenzt wird.",
      good: "Genau: Sie grenzen die Aussage ein, statt sie ganz zu verwerfen.",
    },
  },

  {
    id: "ist_das_wirklich_so_eindeutig",
    produceContext: "Jemand präsentiert eine Erklärung so, als gäbe es keine andere Möglichkeit. Sie sind nicht überzeugt, wollen aber höflich nachfragen statt zu widersprechen.",
    produceHint: "Eine Frage, keine Behauptung — das ist der ganze Unterschied.",
    citation: "Ist das wirklich so eindeutig?",
    gloss: "is that really so clear-cut?",
    who: "Priya S.",
    occurrence: "Das mag für die Kalkulation gelten, für die Beschäftigten aber nicht unbedingt. Ist das wirklich so eindeutig?",
    capability: "argue",
    does: "Sie stellen eine als sicher dargestellte Erklärung infrage, ohne eine eigene Behauptung dagegenzusetzen. Das öffnet die Diskussion, statt sie zu einem Streit zu machen.",
    notThis: "Es ist keine rhetorische Frage mit vorgegebener Antwort. Sie fordert eine echte Auseinandersetzung mit der Annahme.",
    pattern: /ist\s+das\s+wirklich\s+so\s+eindeutig\b/i,
    frame: /ist\s+das\s+wirklich\s+so\s+eindeutig\b\??/i,
    novelty: 2, minWords: 5,
    help: {
      absent: "Benutzen Sie „Ist das wirklich so eindeutig?“ — als Frage, nicht als Behauptung.",
      frame: "Die Formel steht für sich allein als Frage — kein Zusatz nötig.",
      good: "Genau: Sie fragen nach, statt zu behaupten.",
    },
  },

  {
    id: "denkbar_waere_doch",
    produceContext: "Sie haben eine Idee für einen Kompromiss, wollen sie aber als Vorschlag formulieren, nicht als Forderung.",
    produceHint: "Der Konjunktiv macht aus einer Forderung einen Vorschlag.",
    citation: "Denkbar wäre doch, …",
    gloss: "one could imagine …",
    who: "Leon B.",
    occurrence: "Denkbar wäre doch, dass jeder für sich wählt, statt dass eine Regel für alle gilt.",
    capability: "concede",
    does: "Sie schlagen eine Lösung vor, ohne sie als einzig richtige Option zu präsentieren. Der Konjunktiv II lässt Raum für Widerspruch, ohne dass der Vorschlag schwächer wirkt.",
    notThis: "Es ist keine Forderung. „Wäre doch“ markiert ausdrücklich, dass es sich um einen Vorschlag zur Diskussion handelt, nicht um eine Bedingung.",
    pattern: /denkbar\s+wäre\s+doch\b/i,
    frame: /denkbar\s+wäre\s+doch\b[^.!?]{0,80}/i,
    novelty: 3, minWords: 6,
    help: {
      absent: "Benutzen Sie „Denkbar wäre doch, …“ und nennen Sie danach Ihren Vorschlag.",
      frame: "Nach der Formel muss der konkrete Vorschlag folgen.",
      good: "Genau: Sie schlagen etwas vor, ohne es zu fordern.",
    },
  },

  {
    id: "keine_boese_absicht_sondern",
    produceContext: "Sie wollen erklären, warum eine unbeliebte Entscheidung getroffen wurde, ohne sie als persönlichen Angriff darzustellen.",
    produceHint: "Erst ausschließen, was es NICHT ist — dann sagen, was es tatsächlich ist.",
    citation: "Das ist keine böse Absicht, sondern …",
    gloss: "that's not malicious intent, it's just …",
    who: "Dennis K.",
    occurrence: "Das ist keine böse Absicht, sondern schlicht Kalkulation.",
    capability: "structure",
    does: "Sie schließen eine naheliegende, aber falsche Erklärung (Absicht, Böswilligkeit) aus und ersetzen sie durch die tatsächliche Ursache. Das entschärft einen Konflikt, ohne die Entscheidung selbst zu verteidigen.",
    notThis: "Es ist keine Rechtfertigung der Entscheidung. Es erklärt nur, WARUM sie so gefallen ist — nicht, dass sie richtig war.",
    pattern: /keine\s+böse\s+absicht\b[^.!?]{0,40}\bsondern\b/i,
    frame: /keine\s+böse\s+absicht\b[^.!?]{0,40}\bsondern\b[^.!?]{0,60}/i,
    novelty: 3, minWords: 7,
    help: {
      absent: "Benutzen Sie „Das ist keine böse Absicht, sondern …“ und nennen Sie danach den echten Grund.",
      frame: "Nach „sondern“ muss die tatsächliche Ursache stehen.",
      good: "Genau: Sie erklären die Ursache, ohne die Entscheidung zu verteidigen.",
    },
  },
];

const BY_ID = new Map(EXPRESSIONS.map(e => [e.id, e]));

module.exports = { EXPRESSIONS, BY_ID, SOURCE_ID: "src_ueberstunden" };
