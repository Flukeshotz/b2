/**
 * FOUR MOVES FROM THE URLAUBSPLANUNG THREAD. Original Skillcase content.
 *
 *   defend a principle without denying the hard case  → concede
 *   trace a rule to its historical origin              → structure
 *   offer a compromise as a proposal, not a demand      → argue
 *   separate what was fair once from what is fair now   → argue
 */

const EXPRESSIONS = [
  {
    id: "als_prinzip_richtig_in_diesem_fall_aber",
    produceContext: "Sie halten eine Regel im Allgemeinen für richtig, sehen aber, dass sie in einem konkreten Fall hart trifft.",
    produceHint: "Erst das Prinzip verteidigen, dann den Einzelfall zugeben.",
    citation: "Als Prinzip finde ich das richtig, in diesem Fall aber …",
    gloss: "as a principle I think that's right, but in this case …",
    who: "Wolfgang_D",
    occurrence: "Als Prinzip finde ich Dienstalter eigentlich richtig — wer lange dabei ist, sollte etwas davon haben. In deinem Fall mit kleinen Kindern klingt das allerdings hart, das gebe ich zu.",
    capability: "concede",
    does: "Sie trennen die Frage, ob eine Regel im Allgemeinen sinnvoll ist, von der Frage, ob sie in einem bestimmten Fall fair wirkt. Beide Antworten können unterschiedlich ausfallen.",
    notThis: "Es ist keine Forderung, die Regel abzuschaffen. Das Prinzip bleibt bestehen — nur der Einzelfall wird als problematisch anerkannt.",
    pattern: /als\s+prinzip\s+finde\s+ich\b[^.!?]{0,60}\brichtig\b[\s\S]{0,100}?\ballerdings\b/i,
    frame: /als\s+prinzip\s+finde\s+ich\b[\s\S]{0,150}?\ballerdings\b[^.!?]{0,60}/i,
    novelty: 3, minWords: 10,
    help: {
      absent: "Benutzen Sie „Als Prinzip finde ich das richtig …“ und ergänzen Sie danach den Einzelfall mit „allerdings“.",
      frame: "Nach dem Prinzip muss der Einzelfall mit „allerdings“ oder ähnlich folgen.",
      good: "Genau: Sie verteidigen das Prinzip und erkennen den harten Einzelfall trotzdem an.",
    },
  },

  {
    id: "die_regel_stammt_noch_aus_einer_zeit_als",
    produceContext: "Eine Regel wirkt heute nicht mehr passend. Erklären Sie, woher sie ursprünglich kommt.",
    produceHint: "Nennen Sie die damaligen Umstände, unter denen die Regel entstanden ist.",
    citation: "Die Regel stammt noch aus einer Zeit, als …",
    gloss: "the rule dates back to a time when …",
    who: "Renate_Stationsleitung",
    occurrence: "Diese Regelung stammt noch aus einer Zeit, als die meisten Kolleginnen keine schulpflichtigen Kinder hatten und die Ferienzeiten weniger Konflikte verursachten.",
    capability: "structure",
    does: "Sie erklären eine Regel historisch, statt sie einfach zu verteidigen oder abzulehnen. Das macht sichtbar, dass eine Regel passend sein KONNTE, ohne dass sie es heute noch sein muss.",
    notThis: "Es ist keine Verteidigung der Regel. Im Gegenteil — die Formel wird meistens benutzt, um zu zeigen, dass sich die Umstände seither geändert haben.",
    pattern: /stammt\s+noch\s+aus\s+einer\s+zeit\b/i,
    frame: /stammt\s+noch\s+aus\s+einer\s+zeit\b[^.!?]{0,100}/i,
    novelty: 3, minWords: 8,
    help: {
      absent: "Benutzen Sie „Die Regel stammt noch aus einer Zeit, als …“ und nennen Sie die damaligen Umstände.",
      frame: "Nach der Formel müssen die damaligen Umstände stehen.",
      good: "Genau: Sie erklären die Herkunft, ohne die Regel automatisch zu verteidigen.",
    },
  },

  {
    id: "ein_mittelweg_waere_doch",
    produceContext: "Zwei Positionen stehen sich gegenüber. Sie sehen eine Lösung, die beiden teilweise gerecht wird.",
    produceHint: "Formulieren Sie den Kompromiss als Vorschlag, nicht als Forderung.",
    citation: "Ein Mittelweg wäre doch, …",
    gloss: "a middle ground would be …",
    who: "Murat_K",
    occurrence: "Ein Mittelweg wäre doch, Eltern schulpflichtiger Kinder bei den Sommerferien Vorrang zu geben und Dienstalter für alle anderen Zeiträume beizubehalten.",
    capability: "argue",
    does: "Sie schlagen eine Lösung vor, die ein Prinzip nicht abschafft, sondern für einen bestimmten Fall anpasst. Der Konjunktiv hält den Vorschlag offen für Widerspruch.",
    notThis: "Es ist kein Ultimatum. „Wäre doch“ lädt zur Diskussion ein, statt eine Bedingung zu stellen.",
    pattern: /ein\s+mittelweg\s+wäre\s+doch\b/i,
    frame: /ein\s+mittelweg\s+wäre\s+doch\b[^.!?]{0,100}/i,
    novelty: 3, minWords: 8,
    help: {
      absent: "Benutzen Sie „Ein Mittelweg wäre doch, …“ und nennen Sie danach den Kompromiss.",
      frame: "Nach der Formel muss der konkrete Kompromissvorschlag folgen.",
      good: "Genau: Sie schlagen einen Mittelweg vor, statt eine Seite komplett zu bevorzugen.",
    },
  },

  {
    id: "stoert_nicht_prinzip_sondern_fehlende_ausnahme",
    produceContext: "Eine allgemeine Regel stört Sie nicht — es fehlt nur eine Ausnahme für genau eine Situation, in der Sie keine Wahl haben.",
    produceHint: "Erst das Prinzip akzeptieren, dann die fehlende Ausnahme benennen.",
    citation: "Mich stört gar nicht X als Prinzip — mich stört, dass es ausgerechnet bei Y keine Ausnahme gibt.",
    gloss: "it's not X as a principle that bothers me — what bothers me is that there's no exception for Y specifically",
    who: "Annika F.",
    occurrence: "Mich stört gar nicht das Dienstalter als Prinzip — mich stört, dass es ausgerechnet bei den Schulferien keine Ausnahme gibt, obwohl das der einzige Zeitraum ist, in dem ich wirklich keine Wahl habe.",
    capability: "justify",
    does: "Sie akzeptieren ein Prinzip vollständig und richten die Kritik gezielt auf eine einzelne fehlende Ausnahme, statt das ganze Prinzip infrage zu stellen.",
    notThis: "Es ist keine grundsätzliche Ablehnung des Prinzips. Der Einwand ist eng begrenzt auf einen Fall, in dem keine Wahl besteht.",
    pattern: /stört\s+(mich\s+)?gar\s+nicht\b[\s\S]{0,80}?\bals\s+prinzip\b[\s\S]{0,100}?\bausnahme\b/i,
    frame: /stört\s+(mich\s+)?gar\s+nicht\b[\s\S]{0,220}?\bausnahme\b/i,
    novelty: 4, minWords: 12,
    help: {
      absent: "Benutzen Sie „Mich stört gar nicht X als Prinzip — mich stört, dass es bei Y keine Ausnahme gibt.“",
      frame: "Beide Teile müssen stehen: das akzeptierte Prinzip und die fehlende Ausnahme.",
      good: "Genau: Sie akzeptieren das Prinzip und benennen nur die eine fehlende Ausnahme.",
    },
  },
];

const BY_ID = new Map(EXPRESSIONS.map(e => [e.id, e]));

module.exports = { EXPRESSIONS, BY_ID, SOURCE_ID: "src_urlaubsplanung" };
