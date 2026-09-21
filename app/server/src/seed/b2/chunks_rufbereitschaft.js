/**
 * FOUR MOVES FROM THE RUFBEREITSCHAFT THREAD. Original Skillcase content.
 *
 *   name an unfair pattern without accusing anyone     → structure
 *   question an unspoken assumption                     → argue
 *   endorse a solution while naming its limits           → concede
 *   attach a condition to a concession                    → concede
 */

const EXPRESSIONS = [
  {
    id: "verteilt_sich_ungleich_liegt_an_niemandem",
    produceContext: "Etwas verteilt sich unfair zwischen Kolleginnen, aber nicht, weil jemand absichtlich benachteiligt. Erklären Sie das.",
    produceHint: "Erst das Muster beschreiben, dann ausdrücklich niemanden beschuldigen.",
    citation: "Das verteilt sich einfach ungleich, das liegt an niemandem persönlich.",
    gloss: "it just distributes unevenly, that's nobody's fault personally",
    who: "André_K",
    occurrence: "Das verteilt sich einfach ungleich, das liegt an niemandem persönlich — wer flexibel ist und in der Nähe wohnt, wird automatisch öfter gefragt.",
    capability: "structure",
    does: "Sie beschreiben ein unfaires Muster, ohne es als bewusste Entscheidung einer Person darzustellen. Das trennt Ergebnis und Absicht.",
    notThis: "Es ist keine Behauptung, dass das Ergebnis in Ordnung ist. Nur die Ursache wird von persönlicher Absicht getrennt.",
    pattern: /verteilt\s+sich\s+(einfach\s+)?ungleich\b[^.!?]{0,60}\bliegt\s+an\s+niemandem\b/i,
    frame: /verteilt\s+sich\b[^.!?]{0,100}\bniemandem\b[^.!?]{0,40}/i,
    novelty: 3, minWords: 8,
    help: {
      absent: "Benutzen Sie „Das verteilt sich einfach ungleich, das liegt an niemandem persönlich.“",
      frame: "Beide Teile müssen stehen: das Muster UND der Verzicht auf persönliche Schuld.",
      good: "Genau: Sie trennen ein unfaires Ergebnis von persönlicher Absicht.",
    },
  },

  {
    id: "warum_eigentlich_immer_die_gleichen",
    produceContext: "Sie bemerken, dass eine unbeliebte Aufgabe immer wieder bei denselben Personen landet, ohne dass das bewusst so entschieden wurde. Hinterfragen Sie das.",
    produceHint: "Als Frage formulieren, nicht als Vorwurf.",
    citation: "Warum eigentlich immer die gleichen?",
    gloss: "why is it always the same people, actually?",
    who: "Sandra_H",
    occurrence: "Warum eigentlich immer die gleichen? Ich will mich nicht drücken, aber es sollte doch gleichmäßig verteilt sein.",
    capability: "argue",
    does: "Sie hinterfragen eine unausgesprochene Praxis, ohne jemanden direkt zu beschuldigen. Die Frage öffnet die Diskussion, statt sie zu einem Vorwurf zu machen.",
    notThis: "Es ist kein Vorwurf, sich drücken zu wollen — im Gegenteil, das wird im selben Atemzug ausdrücklich verneint.",
    pattern: /warum\s+eigentlich\s+immer\s+die\s+gleichen\b/i,
    frame: /warum\s+eigentlich\s+immer\s+die\s+gleichen\b\??[^.!?]{0,60}/i,
    novelty: 3, minWords: 5,
    help: {
      absent: "Benutzen Sie „Warum eigentlich immer die gleichen?“ als offene Frage.",
      frame: "Die Formel funktioniert als eigenständige Frage, oft mit einem Zusatz danach.",
      good: "Genau: Sie hinterfragen die Praxis, ohne jemanden direkt zu beschuldigen.",
    },
  },

  {
    id: "wuerde_helfen_loest_aber_nicht_alles",
    produceContext: "Eine vorgeschlagene Lösung ist gut, löst aber nicht jedes Problem. Sagen Sie beides.",
    produceHint: "Erst die Lösung befürworten, dann ihre Grenze benennen.",
    citation: "X würde helfen, löst aber nicht alles.",
    gloss: "X would help, but it doesn't solve everything",
    who: "Lukas_F",
    occurrence: "Eine feste Rotation würde helfen, löst aber nicht alles: manche haben private Gründe, warum bestimmte Wochen besser oder schlechter passen.",
    capability: "concede",
    does: "Sie befürworten eine Lösung grundsätzlich und benennen gleichzeitig ihre Grenzen, statt sie unkritisch zu loben oder pauschal abzulehnen.",
    notThis: "Es ist keine Ablehnung der Lösung. Sie wird als hilfreich anerkannt — nur eben nicht als vollständige Antwort.",
    pattern: /würde\s+helfen\b[^.!?]{0,20}\blöst\s+aber\s+nicht\s+alles\b/i,
    frame: /würde\s+helfen\b[^.!?]{0,100}\balles\b/i,
    novelty: 3, minWords: 6,
    help: {
      absent: "Benutzen Sie „X würde helfen, löst aber nicht alles.“",
      frame: "Nach der Formel sollte erklärt werden, was ungelöst bleibt.",
      good: "Genau: Sie befürworten die Lösung und benennen trotzdem ihre Grenzen.",
    },
  },

  {
    id: "mache_das_gern_oefter_wenn",
    produceContext: "Sie sind bereit, etwas Unbeliebtes öfter zu übernehmen — aber nur unter einer bestimmten Bedingung.",
    produceHint: "Die Bereitschaft zuerst, dann die Bedingung.",
    citation: "Ich mache das gern öfter, wenn …",
    gloss: "I'm happy to do that more often, if …",
    who: "Sandra_H",
    occurrence: "Ich mache das gern öfter, wenn es fair verteilt ist und niemand dauerhaft mehr trägt als der Rest.",
    capability: "concede",
    does: "Sie zeigen echte Bereitschaft und machen sie gleichzeitig von einer Bedingung abhängig. Das ist konstruktiver als eine reine Beschwerde.",
    notThis: "Es ist kein Rückzug von der ursprünglichen Kritik. Die Bereitschaft ist echt, aber an die genannte Bedingung geknüpft.",
    pattern: /mache\s+das\s+gern\s+öfter[,]?\s*wenn\b/i,
    frame: /mache\s+das\s+gern\s+öfter\b[^.!?]{0,100}/i,
    novelty: 3, minWords: 6,
    help: {
      absent: "Benutzen Sie „Ich mache das gern öfter, wenn …“ und nennen Sie die Bedingung.",
      frame: "Nach der Formel muss die konkrete Bedingung folgen.",
      good: "Genau: Sie zeigen Bereitschaft und benennen gleichzeitig eine klare Bedingung.",
    },
  },
];

const BY_ID = new Map(EXPRESSIONS.map(e => [e.id, e]));

module.exports = { EXPRESSIONS, BY_ID, SOURCE_ID: "src_rufbereitschaft" };
