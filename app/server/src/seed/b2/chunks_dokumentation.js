/**
 * FOUR MOVES FROM THE DOKUMENTATION DIALOGUE. Original Skillcase content.
 *
 *   name the objection before it lands       → argue
 *   grant the logic, deny the practice        → argue
 *   attach one exception to a claim           → concede
 *   narrow opposition to a specific objection  → concede
 */

const EXPRESSIONS = [
  {
    id: "bevor_du_das_sagst",
    produceContext: "Sie wollen etwas vorschlagen, von dem Sie wissen, dass jemand sofort einen bestimmten Einwand bringen wird. Nehmen Sie diesen Einwand vorweg.",
    produceHint: "Sagen Sie zuerst, was die andere Person vermutlich gleich sagen wird — dann Ihren Punkt.",
    citation: "Bevor du das ablehnst — …",
    gloss: "before you say that — …",
    who: "Markus",
    occurrence: "Ich weiß, es kostet erstmal Zeit. Aber bevor du das ganz ablehnst — letzte Woche hat die App bei mir einen Fehler gefunden",
    capability: "argue",
    does: "Sie benennen den Einwand, den die andere Person vermutlich gleich bringt, und liefern gleich ein Gegenbeispiel. Das nimmt der Antwort die Wucht, weil sie nicht mehr überraschend kommt.",
    notThis: "Es ist keine Entschuldigung. Sie sagen nicht, dass der Einwand falsch ist — Sie liefern nur schon eine Antwort darauf, bevor er ausgesprochen wird.",
    pattern: /bevor\s+(du|sie|ihr)\s+das\s+(ganz\s+)?(ablehnst|ablehnen|ablehnt)\b/i,
    frame: /bevor\s+(du|sie|ihr)\s+das\b[^.!?]{0,80}?[—-]\s*\S+/i,
    novelty: 3, minWords: 8,
    help: {
      absent: "Benutzen Sie „Bevor du das ablehnst — …“ und liefern Sie direkt ein Gegenbeispiel.",
      frame: "Nach der Formel muss ein Gedankenstrich und dann das Gegenbeispiel kommen.",
      good: "Genau: Sie nehmen den Einwand vorweg, statt ihn abzuwarten.",
    },
  },

  {
    id: "in_der_theorie_in_der_praxis",
    produceContext: "Jemand erklärt Ihnen eine Idee, die logisch völlig einleuchtet. Trotzdem funktioniert sie bei Ihnen im Alltag nicht so, wie gedacht.",
    produceHint: "Erst die Logik anerkennen, dann den Unterschied zur Praxis benennen.",
    citation: "In der Theorie … in der Praxis …",
    gloss: "in theory … in practice …",
    who: "Sabine",
    occurrence: "Das mag sein. In der Theorie klingt das großartig. In der Praxis heißt es: ich stehe am Bett und tippe",
    capability: "argue",
    does: "Sie erkennen an, dass eine Idee logisch stimmt, und zeigen gleichzeitig, dass die Umsetzung ein anderes Problem hat. Beide Hälften sind nötig — sonst ist es entweder Zustimmung oder Ablehnung, nicht beides.",
    notThis: "Es ist keine Aussage, dass die Idee grundsätzlich falsch wäre. Der Widerspruch betrifft die Umsetzung, nicht die Logik.",
    pattern: /in\s+der\s+theorie\b[\s\S]{0,80}?\bin\s+der\s+praxis\b/i,
    frame: /in\s+der\s+theorie\b[\s\S]{0,80}?\bin\s+der\s+praxis\b[^.!?]{0,60}/i,
    novelty: 3, minWords: 10,
    help: {
      absent: "Benutzen Sie „In der Theorie … In der Praxis …“ — beide Hälften müssen vorkommen.",
      frame: "Nach „in der Praxis“ muss stehen, was im Alltag tatsächlich anders läuft.",
      good: "Genau: Sie trennen, ob eine Idee logisch stimmt, von der Frage, ob sie im Alltag funktioniert.",
    },
  },

  {
    id: "es_sei_denn",
    produceContext: "Sie stimmen einer Aussage im Großen und Ganzen zu — bis auf eine Ausnahme, die Sie noch nennen wollen.",
    produceHint: "Erst die allgemeine Aussage, dann die eine Ausnahme mit „es sei denn“.",
    citation: "…, es sei denn, …",
    gloss: "…, unless …",
    who: "Sabine",
    occurrence: "Es sei denn, jemand schreibt wirklich unleserlich, finde ich Papier trotzdem schneller.",
    capability: "concede",
    does: "Sie hängen eine einzelne Ausnahme an eine sonst geltende Aussage, ohne die Aussage selbst zurückzunehmen.",
    notThis: "Es ist kein genereller Vorbehalt. „Es sei denn“ markiert genau EINEN Fall, nicht Unsicherheit über die ganze Aussage.",
    pattern: /es\s+sei\s+denn\b/i,
    frame: /es\s+sei\s+denn\b[^.!?]{0,80}/i,
    novelty: 3, minWords: 6,
    help: {
      absent: "Benutzen Sie „…, es sei denn, …“ und nennen Sie danach die eine Ausnahme.",
      frame: "Nach „es sei denn“ muss die konkrete Ausnahme stehen, nicht nur ein Komma.",
      good: "Genau: Sie lassen die Regel stehen und nennen nur den einen Fall, in dem sie nicht gilt.",
    },
  },

  {
    id: "nicht_grundsaetzlich_dagegen",
    produceContext: "Sie widersprechen einem einzelnen Punkt, aber nicht der ganzen Sache. Stellen Sie das klar, damit man Sie nicht für eine generelle Gegnerin hält.",
    produceHint: "Erst die Position einschränken — dann den konkreten Punkt nennen, um den es wirklich geht.",
    citation: "Ich bin ja nicht grundsätzlich gegen X …",
    gloss: "I'm not fundamentally against it …",
    who: "Markus",
    occurrence: "Ich bin ja nicht grundsätzlich gegen Papier. Nur, ehrlich gesagt, bei Papier hat's bei uns auch schon Fehler gegeben.",
    capability: "concede",
    does: "Sie verkleinern Ihre eigene Position von genereller Ablehnung zu einem einzelnen, benennbaren Einwand. Das macht Sie präziser und schwerer zu widerlegen.",
    notThis: "Es ist keine Zustimmung zur Sache insgesamt. Der eigentliche Einwand kommt danach, meistens mit „nur“ oder „aber“.",
    pattern: /nicht\s+grundsätzlich\s+(dagegen|gegen)\b/i,
    frame: /nicht\s+grundsätzlich\s+(dagegen|gegen)\b[^.!?]{0,100}/i,
    novelty: 3, minWords: 8,
    help: {
      absent: "Benutzen Sie „Ich bin ja nicht grundsätzlich dagegen …“ und nennen Sie danach den einen konkreten Punkt.",
      frame: "Nach der Formel muss der konkrete Einwand folgen — sonst bleibt unklar, worum es eigentlich geht.",
      good: "Genau: Sie engen Ihre Position ein, statt sie ganz aufzugeben.",
    },
  },
];

const BY_ID = new Map(EXPRESSIONS.map(e => [e.id, e]));

module.exports = { EXPRESSIONS, BY_ID, SOURCE_ID: "src_dokumentation" };
