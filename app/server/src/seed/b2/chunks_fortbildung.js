/**
 * FIVE MOVES FROM THE FORTBILDUNG THREAD. Original Skillcase content.
 *
 * Same test as chunks_homeoffice: would a B2 learner want to steal this
 * tomorrow, about something unrelated to fortbildungen? Words that are merely
 * difficult were rejected even where they sound B2 on a list.
 *
 *   summarise the other side before objecting to it   → structure
 *   grant the premise and deny the conclusion         → argue
 *   redirect the objection to what actually bothers   → justify
 *   an unreal past for a process that did not happen  → concede
 *   concede before objecting                          → concede
 */

const EXPRESSIONS = [
  {
    id: "wenn_ich_sie_richtig_verstehe",
    produceContext: "Ein Kollege erklärt Ihnen ausführlich, warum eine Regel eingeführt wurde. Bevor Sie widersprechen, geben Sie erst wieder, was Sie verstanden haben.",
    produceHint: "Erst zusammenfassen, was die andere Person gesagt hat — dann erst Ihren Einwand.",
    citation: "Wenn ich Sie richtig verstehe, …",
    gloss: "if I understand you correctly, …",
    who: "Priya S.",
    occurrence: "Wenn ich Sie richtig verstehe, ist das Problem also die Besetzung, nicht der Wille.",
    capability: "structure",
    does: "Sie geben zuerst wieder, was die andere Person gemeint hat — mit Ihren eigenen Worten, nicht als Zitat. Das zeigt, dass Sie zugehört haben, bevor Sie widersprechen.",
    notThis: "Es ist keine Zustimmung. Die Zusammenfassung kann genau richtig sein und der Widerspruch trotzdem folgen.",
    pattern: /wenn\s+ich\s+\w+\s+richtig\s+verstehe\b/i,
    frame: /wenn\s+ich\s+\w+\s+richtig\s+verstehe\b[^.!?]{0,80}/i,
    novelty: 3, minWords: 8,
    help: {
      absent: "Fangen Sie mit „Wenn ich Sie richtig verstehe, …“ an, und geben Sie den Kernpunkt der anderen Person in eigenen Worten wieder.",
      frame: "Nach der Formel muss noch stehen, WAS Sie verstanden haben.",
      good: "Genau: Sie zeigen erst, dass Sie zugehört haben, dann kommt Ihr eigener Punkt.",
    },
  },

  {
    id: "folgt_daraus_nicht_automatisch",
    produceContext: "Eine Kollegin nennt einen Grund, der Sie überzeugt. Trotzdem finden Sie ihre Schlussfolgerung falsch. Widersprechen Sie nur dem Schluss.",
    produceHint: "Den Grund stehen lassen, den Schluss angreifen.",
    citation: "Nur folgt daraus doch nicht automatisch, dass …",
    gloss: "but it doesn't automatically follow that …",
    who: "Priya S.",
    occurrence: "Das leuchtet mir ein — nur folgt daraus doch nicht automatisch, dass die Zeit unbezahlt bleibt.",
    capability: "argue",
    does: "Sie akzeptieren den Grund vollständig und bestreiten nur den Schluss, den jemand daraus zieht. Das lässt der anderen Person nichts zum Verteidigen — Sie haben ihr ja nichts weggenommen.",
    notThis: "Es ist kein Widerspruch gegen die Tatsache selbst. „Automatisch“ markiert genau, dass ein Schritt in der Kette fehlt, nicht dass die Kette falsch anfängt.",
    pattern: /folgt\s+daraus\s+(doch\s+)?nicht\s+automatisch\b/i,
    frame: /folgt\s+daraus\s+(doch\s+)?nicht\s+automatisch\b[^.!?]{0,80}?\bdass\b/i,
    novelty: 3, minWords: 8,
    help: {
      absent: "Benutzen Sie „Nur folgt daraus doch nicht automatisch, dass …“ — wörtlich, das ist die Formel.",
      frame: "Nach der Formel muss ein „dass“-Satz stehen: WAS folgt nicht automatisch?",
      good: "Genau: Sie greifen nur den Schluss an, nicht die Tatsache, auf der er beruht.",
    },
  },

  {
    id: "stoert_mich_weniger_als",
    produceContext: "Etwas an Ihrer Arbeit stört Sie — aber nicht das, was die meisten vermuten würden. Stellen Sie klar, was es wirklich ist.",
    produceHint: "Beide Hälften: was Sie weniger stört, und was stattdessen.",
    citation: "Mich stört ehrlich gesagt weniger X als Y",
    gloss: "what actually bothers me is less X than Y",
    who: "Nina K.",
    occurrence: "Mich stört ehrlich gesagt weniger die Fortbildung selbst — die ist ja sinnvoll — als der Umstand, dass niemand vorher gefragt hat",
    capability: "justify",
    does: "Sie lenken einen Einwand um: weg vom naheliegenden Ziel, hin zum eigentlichen Punkt. Damit korrigieren Sie, worüber gerade gestritten wird.",
    notThis: "Es ist keine Aussage darüber, dass X in Ordnung wäre. „Weniger … als …“ vergleicht zwei Störungen, es entschuldigt die erste nicht.",
    pattern: /stört\s+(ehrlich\s+gesagt\s+)?weniger\b[^.!?]{0,140}\bals\b/i,
    frame: /stört\b[^.!?]{0,140}\bweniger\b[^.!?]{0,140}\bals\b[^.!?]{0,60}/i,
    novelty: 3, minWords: 10,
    help: {
      absent: "Benutzen Sie „Mich stört weniger X als Y“ — nennen Sie beide Hälften.",
      frame: "Beide Seiten müssen stehen: was Sie WENIGER stört, und was Sie stattdessen wirklich stört.",
      good: "Genau: Sie ordnen zwei mögliche Ärgernisse und sagen, welches das eigentliche ist.",
    },
  },

  {
    id: "haette_man_uns_gefragt",
    produceContext: "Bei Ihnen wurde etwas entschieden, ohne dass vorher jemand gefragt hat. Sie sind nicht unbedingt gegen die Entscheidung — aber gegen das Verfahren. Sagen Sie, was anders gelaufen wäre.",
    produceHint: "Die Bedingung, die gefehlt hat — und die Folge, zu der es deshalb nicht gekommen ist.",
    citation: "Hätte man uns vorher gefragt, dann wäre …",
    gloss: "if we had been asked first, then … would have",
    who: "Nina K.",
    occurrence: "Hätte man uns vorher gefragt, dann wäre vermutlich sofort eine Lösung wie Priyas dabei herausgekommen",
    capability: "concede",
    does: "Sie benennen eine Bedingung, die nicht erfüllt wurde, und die Folge, die deshalb nicht eintrat. Das Verfahren wird kritisiert, nicht das Ergebnis.",
    notThis: "Es ist keine Aussage darüber, was jetzt passieren soll. Der Satz spricht über eine vertane Gelegenheit, nicht über eine Forderung für die Zukunft.",
    pattern: /hätte\s+man\s+\w+\s+(vorher\s+)?gefragt\b[^.!?]{0,40}\bwäre\b/i,
    frame: /hätte\s+man\s+\w+\s+(vorher\s+)?gefragt\b[^.!?]{0,60}\bwäre\b[^.!?]{0,40}/i,
    novelty: 4, minWords: 10,
    help: {
      absent: "Benutzen Sie „Hätte man uns vorher gefragt, dann wäre …“ — beide Hälften im Konjunktiv II.",
      frame: "Nach dem „wäre“ muss die Folge stehen: was wäre dann anders gelaufen?",
      good: "Genau: Sie kritisieren das Verfahren, nicht das Ergebnis selbst.",
    },
  },

  {
    id: "ich_verstehe_den_unmut_aber",
    produceContext: "Jemand beschwert sich bei Ihnen über etwas, das Sie nicht ändern können. Sie wollen die Beschwerde ernst nehmen, ohne sie zu bestätigen.",
    produceHint: "Erst den Ärger anerkennen, dann Ihre eigene Position.",
    citation: "Ich verstehe den Unmut, aber …",
    gloss: "I understand the frustration, but …",
    who: "Jonas_P",
    occurrence: "Ich verstehe den Unmut, aber ganz ehrlich: davon geht die Welt nicht unter.",
    capability: "concede",
    does: "Sie erkennen ein Gefühl an, ohne der Sache selbst zuzustimmen. Das unterscheidet sich von „Sie haben recht“ — Sie bestätigen die Reaktion, nicht die Forderung.",
    notThis: "Es ist kein Eingeständnis, dass etwas geändert werden sollte. Das „aber“ zeigt, dass die eigene Position gleich folgt.",
    pattern: /ich\s+verstehe\s+den\s+unmut\b/i,
    frame: /ich\s+verstehe\s+den\s+unmut\b[^.!?]{0,60}\baber\b/i,
    novelty: 2, minWords: 6,
    help: {
      absent: "Benutzen Sie „Ich verstehe den Unmut, aber …“ — das Gefühl anerkennen, dann Ihre Position.",
      frame: "Nach „aber“ muss Ihre eigene Position stehen, nicht nur das Ende des Satzes.",
      good: "Genau: Sie nehmen die Reaktion ernst, ohne der Forderung zuzustimmen.",
    },
  },
];

const BY_ID = new Map(EXPRESSIONS.map(e => [e.id, e]));

module.exports = { EXPRESSIONS, BY_ID, SOURCE_ID: "src_fortbildung" };
