/**
 * FOUR MOVES FROM THE EINARBEITUNG THREAD. Original Skillcase content.
 *
 *   acknowledge a shared experience before naming a difference → structure
 *   reject an explanation as an excuse, not a reason           → argue
 *   couple a demand to its precondition                        → argue
 *   narrow a position without abandoning it                    → concede
 */

const EXPRESSIONS = [
  {
    id: "das_kenne_ich_bei_uns_ist_es_anders",
    produceContext: "Jemand beschreibt ein Problem, das Sie auch kennen. Bei Ihnen ist es allerdings anders geregelt — beschreiben Sie den Unterschied.",
    produceHint: "Erst die geteilte Erfahrung anerkennen, dann den Unterschied nennen.",
    citation: "Das kenne ich, bei uns ist es aber anders geregelt: …",
    gloss: "I know that, but where I work it's handled differently: …",
    who: "Robert_H",
    occurrence: "Das kenne ich, bei uns ist es aber anders geregelt: wer einarbeitet, bekommt für diese Zeit offiziell reduzierte eigene Aufgaben.",
    capability: "structure",
    does: "Sie erkennen die Erfahrung der anderen Person zuerst an und stellen erst danach Ihre eigene, abweichende Situation daneben. Das signalisiert Zuhören, bevor der Unterschied kommt.",
    notThis: "Es ist keine Behauptung, dass die andere Erfahrung falsch ist. Beide Erfahrungen bleiben nebeneinander stehen.",
    pattern: /das\s+kenne\s+ich\b[^.!?]{0,20}\baber\s+anders\s+geregelt\b/i,
    frame: /das\s+kenne\s+ich\b[^.!?]{0,80}\banders\s+geregelt\b[^.!?]{0,60}/i,
    novelty: 3, minWords: 8,
    help: {
      absent: "Benutzen Sie „Das kenne ich, bei uns ist es aber anders geregelt: …“",
      frame: "Nach der Formel muss die konkrete andere Regelung folgen.",
      good: "Genau: Sie erkennen die geteilte Erfahrung an, bevor Sie den Unterschied nennen.",
    },
  },

  {
    id: "kein_grund_das_ist_eine_ausrede",
    produceContext: "Jemand erklärt eine unbefriedigende Situation mit äußeren Umständen. Sie halten diese Erklärung für vorgeschoben.",
    produceHint: "Direkt, aber mit „mit Verlaub“ abgemildert — die Formel ist scharf, nicht unhöflich gemeint.",
    citation: "Das ist kein Grund, das ist eine Ausrede.",
    gloss: "that's not a reason, that's an excuse",
    who: "Peter_W",
    occurrence: "Das ist kein Grund, das ist eine Ausrede — mit Verlaub.",
    capability: "argue",
    does: "Sie bestreiten nicht die genannten Umstände, sondern ob sie das Ergebnis tatsächlich erzwingen. Das unterscheidet eine Erklärung, die ein Problem wirklich verursacht, von einer, die nur bequem ist.",
    notThis: "Es ist kein Vorwurf persönlicher Unehrlichkeit. Es bestreitet nur, dass die genannte Ursache zwingend zum Ergebnis führt.",
    pattern: /das\s+ist\s+kein\s+grund\b[^.!?]{0,20}\bdas\s+ist\s+eine\s+ausrede\b/i,
    frame: /das\s+ist\s+kein\s+grund\b[^.!?]{0,60}\bausrede\b/i,
    novelty: 4, minWords: 6,
    help: {
      absent: "Benutzen Sie „Das ist kein Grund, das ist eine Ausrede.“",
      frame: "Beide Hälften müssen stehen — „kein Grund“ UND „eine Ausrede“.",
      good: "Genau: Sie bestreiten, dass die Umstände das Ergebnis erzwingen.",
    },
  },

  {
    id: "erst_wenn_x_gesichert_ist_kann_y_funktionieren",
    produceContext: "Sie glauben, dass eine Lösung nur funktioniert, wenn zuerst eine bestimmte Voraussetzung erfüllt ist.",
    produceHint: "Erst die Voraussetzung, dann das, was davon abhängt.",
    citation: "Erst wenn X gesichert ist, kann Y funktionieren.",
    gloss: "Y can only work once X is secured",
    who: "Peter_W",
    occurrence: "Erst wenn genug Personal gesichert ist, kann Einarbeitung überhaupt funktionieren.",
    capability: "argue",
    does: "Sie formulieren eine notwendige Bedingung: ohne X ist Y grundsätzlich nicht zu erreichen, egal wie gut Y sonst geplant ist.",
    notThis: "Es ist keine Aussage, dass Y unwichtig wäre. Y bleibt das Ziel — nur die Reihenfolge wird klargestellt.",
    pattern: /erst\s+wenn\b[^.!?]{0,40}\bgesichert\s+ist\b[^.!?]{0,40}\bfunktionieren\b/i,
    frame: /erst\s+wenn\b[^.!?]{0,80}\bfunktionieren\b/i,
    novelty: 3, minWords: 8,
    help: {
      absent: "Benutzen Sie „Erst wenn X gesichert ist, kann Y funktionieren.“",
      frame: "Beide Teile müssen stehen: die Voraussetzung und das, was davon abhängt.",
      good: "Genau: Sie machen die Reihenfolge der Bedingungen klar.",
    },
  },

  {
    id: "genauer_gesagt_meine_ich_damit",
    produceContext: "Ihre erste Aussage könnte missverstanden werden. Präzisieren Sie, was Sie eigentlich meinen, ohne Ihre Position aufzugeben.",
    produceHint: "Nicht zurückrudern — nur genauer werden.",
    citation: "Genauer gesagt, meine ich damit: …",
    gloss: "more precisely, what I mean by that is …",
    who: "Carla N.",
    occurrence: "Genauer gesagt: ich will keine perfekte Lösung, nur eine ehrliche Planung.",
    capability: "concede",
    does: "Sie schränken eine vorherige, möglicherweise zu breit wirkende Aussage auf das ein, was Sie wirklich meinen — ohne sie zurückzunehmen.",
    notThis: "Es ist kein Widerruf der vorherigen Aussage. Die Präzisierung macht sie kleiner und genauer, nicht falsch.",
    pattern: /genauer\s+gesagt\b/i,
    frame: /genauer\s+gesagt\b[^.!?]{0,80}/i,
    novelty: 2, minWords: 4,
    help: {
      absent: "Benutzen Sie „Genauer gesagt: …“ und präzisieren Sie Ihre eigentliche Position.",
      frame: "Nach der Formel muss die präzisere Aussage folgen.",
      good: "Genau: Sie machen Ihre Position genauer, ohne sie aufzugeben.",
    },
  },
];

const BY_ID = new Map(EXPRESSIONS.map(e => [e.id, e]));

module.exports = { EXPRESSIONS, BY_ID, SOURCE_ID: "src_einarbeitung" };
