/**
 * Expressions from src_muede, brought up to the production bar.
 *
 * WHY THIS FILE EXISTS. The vocabulary experience for this source shipped
 * before `chunk_produce` did, so it ended at recognition — notice, pick, a
 * translation drill — and the gate that now refuses word lists correctly
 * refused it. The gate was right, so the content moved rather than the rule.
 *
 * Only the two expressions worth producing are here. The other four in that
 * experience are useful to recognise and hear ("im Schnitt" is not a move
 * anybody needs to be drilled on producing), and forcing all six through a
 * writing box would be the padding this product is supposed to avoid.
 */

const EXPRESSIONS = [
  {
    id: "laesst_sich_nicht_pauschal_sagen",
    produceContext: "Jemand fragt Sie, ob Schichtarbeit auf Dauer krank macht. Sie halten die Frage für zu grob gestellt — es kommt darauf an. Sagen Sie das.",
    produceHint: "Erst die Verallgemeinerung zurückweisen, dann sagen, wovon es abhängt.",
    citation: "Das lässt sich nicht pauschal sagen",
    gloss: "you can't say that across the board",
    who: "Dr. Bergmann",
    occurrence: "Es lässt sich allerdings nicht pauschal sagen, was der richtige Weg ist.",
    capability: "concede",
    does: "Sie weisen eine Verallgemeinerung zurück, ohne der Person zu widersprechen. Das Unpersönliche („es lässt sich“) nimmt den Angriff heraus — Sie sagen nicht, dass jemand falsch liegt, sondern dass die Frage so nicht zu beantworten ist.",
    notThis: "Es heißt nicht „ich weiß es nicht“. Der Satz sagt, dass es keine Antwort gibt, die für alle Fälle stimmt — das ist eine Aussage über die Sache, nicht über Sie.",
    /* No subject is required in front. German fronts the indirect question all
       the time — „Ob Schichtarbeit krank macht, lässt sich nicht pauschal
       sagen“ is better than the citation form, and a pattern that demands
       „das lässt sich“ rejects it. Punishing a learner for improving on the
       model is the fastest way to make a checker feel arbitrary. */
    pattern: /l[äa]sst\s+sich\s+(so\s+)?(allerdings\s+|aber\s+)?nicht\s+pauschal\s+sagen/i,
    /* A refusal to generalise has to say what it DEPENDS ON, or it is a shrug
       with better vocabulary. An earlier frame accepted any word after
       „sagen“, which passed „Das lässt sich nicht pauschal sagen, finde ich
       ehrlich gesagt“ — a sentence that refuses to answer and then adds
       nothing. Two shapes count: naming the variable („es kommt darauf an, wie
       …“), or the indirect question the source itself uses („…, was der
       richtige Weg ist“). */
    frame: /\b(kommt\s+(es\s+)?(ganz\s+)?(darauf|drauf)\s+an|h[äa]ngt\s+[^.!?]{0,25}?\bab\b|je\s+nach(dem)?\b)|pauschal\s+sagen,?\s+(was|wie|ob|wann|wovon|welche)\b/i,
    novelty: 3, minWords: 10,
    help: {
      absent: "Benutzen Sie die Formel selbst: „Das lässt sich nicht pauschal sagen“.",
      frame: "Sagen Sie danach, wovon es abhängt. Ohne das ist der Satz nur ein Achselzucken.",
      good: "Genau — Sie haben die Verallgemeinerung zurückgewiesen, ohne jemanden anzugreifen.",
    },
  },
  {
    id: "in_kauf_nehmen",
    produceContext: "Etwas an Ihrer Arbeit oder Ihrem Alltag ist eindeutig ein Nachteil — und Sie haben sich trotzdem dafür entschieden. Erklären Sie, warum.",
    produceHint: "Nennen Sie den Nachteil und das, wofür Sie ihn hinnehmen.",
    citation: "etwas in Kauf nehmen",
    gloss: "to accept something as a trade-off",
    who: "Yvonne Krause",
    occurrence: "Man nimmt das ja in Kauf, wenn man den Beruf wählt.",
    capability: "concede",
    does: "Sie geben zu, dass etwas schlecht ist — und sagen im selben Atemzug, dass Sie es trotzdem hinnehmen, weil Ihnen etwas anderes wichtiger ist. Damit räumen Sie ein und verteidigen sich gleichzeitig.",
    notThis: "Es heißt nicht, dass es Ihnen nichts ausmacht. Wer etwas in Kauf nimmt, findet es weiterhin schlecht — er hat sich nur entschieden, dafür zu bezahlen.",
    /* „in Kauf nehmen“ is separable, so in a real main clause the verb is at
       the front and „in Kauf“ at the end — „Man NIMMT das ja IN KAUF“. A
       pattern that expects the citation order matches the infinitive and misses
       every sentence anybody actually writes. Both halves, same clause. */
    pattern: /(?=[^.!?]*\bin\s+kauf\b)[^.!?]*\b(nehmen|nimmt|nimmst|nehme|nahm|nahmen|genommen|nähme)\b/i,
    /* What is being traded away must be nameable, and so must the reason. */
    frame: /\bin\s+kauf\b[^.!?]{0,8}(,\s*\S+|\s+(weil|wenn|um|dafür|damit)\b)|\b(weil|wenn|um|dafür|damit)\b[^.!?]*\bin\s+kauf\b/i,
    novelty: 3, minWords: 10,
    help: {
      absent: "„… in Kauf nehmen“ — der Ausdruck muss wörtlich vorkommen.",
      frame: "Sagen Sie auch, wofür. Man nimmt etwas immer für etwas anderes in Kauf.",
      good: "Gut — Sie geben den Nachteil zu und verteidigen die Entscheidung im selben Satz.",
    },
  },
];

const BY_ID = new Map(EXPRESSIONS.map(e => [e.id, e]));
module.exports = { EXPRESSIONS, BY_ID, SOURCE_ID: "src_muede" };
