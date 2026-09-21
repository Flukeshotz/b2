/**
 * FOUR MOVES FROM THE WEITERBILDUNGSBUDGET THREAD. Original Skillcase
 * content.
 *
 *   criticize a rule as simple but not fair            → argue
 *   weaken support for an idea to a strict condition     → concede
 *   doubt whether an idea works for everyone, not just one → argue
 *   relativize a good experience as possibly individual   → concede
 */

const EXPRESSIONS = [
  {
    id: "einfach_zu_verwalten_gerecht_aber_nicht_unbedingt",
    produceContext: "Eine Regel ist einfach umzusetzen, aber Sie bezweifeln, dass sie deshalb auch gerecht ist.",
    produceHint: "Erst die Einfachheit zugeben, dann die Gerechtigkeit infrage stellen.",
    citation: "Einfach zu verwalten schon, gerecht aber nicht unbedingt.",
    gloss: "easy to administer, sure, but not necessarily fair",
    who: "Elena_W",
    occurrence: "Einfach zu verwalten schon, gerecht aber nicht unbedingt — wer wirklich etwas Teures braucht, geht leer aus.",
    capability: "argue",
    does: "Sie trennen zwei verschiedene Qualitäten einer Regel — Einfachheit und Gerechtigkeit — und erkennen die eine an, ohne die andere automatisch mit anzuerkennen.",
    notThis: "Es ist keine Ablehnung der Einfachheit als Wert. Es zeigt nur, dass Einfachheit nicht automatisch Gerechtigkeit bedeutet.",
    pattern: /einfach\s+zu\s+verwalten\s+schon\b[^.!?]{0,20}\bgerecht\s+aber\s+nicht\s+unbedingt\b/i,
    frame: /einfach\s+zu\s+verwalten\b[^.!?]{0,100}\bgerecht\b[^.!?]{0,40}/i,
    novelty: 3, minWords: 6,
    help: {
      absent: "Benutzen Sie „Einfach zu verwalten schon, gerecht aber nicht unbedingt.“",
      frame: "Beide Teile müssen stehen — die zugegebene Einfachheit UND der Zweifel an der Gerechtigkeit.",
      good: "Genau: Sie trennen Einfachheit von Gerechtigkeit, statt eine für die andere zu halten.",
    },
  },

  {
    id: "nur_wenn_klare_kriterien_gelten_sonst_nicht",
    produceContext: "Sie könnten einen Vorschlag unterstützen — aber nur, wenn eine bestimmte Voraussetzung erfüllt ist.",
    produceHint: "Die Bedingung zuerst, dann die eingeschränkte Zustimmung.",
    citation: "Nur, wenn klare Kriterien gelten, würde ich das unterstützen.",
    gloss: "only if clear criteria apply would I support that",
    who: "Hakan_T",
    occurrence: "Nur, wenn klare Kriterien gelten, würde ich das unterstützen — sonst wird es schnell zu einer Frage von Sympathie.",
    capability: "concede",
    does: "Sie machen Ihre Unterstützung von einer klaren Bedingung abhängig und benennen, was ohne diese Bedingung schiefgehen könnte.",
    notThis: "Es ist keine grundsätzliche Ablehnung. Ohne die Bedingung fehlt nur Ihre Unterstützung — die Idee selbst wird nicht verworfen.",
    pattern: /nur[,]?\s*wenn\s+klare\s+kriterien\s+gelten\b[^.!?]{0,20}\bwürde\s+ich\s+das\s+unterstützen\b/i,
    frame: /klare\s+kriterien\s+gelten\b[^.!?]{0,100}/i,
    novelty: 3, minWords: 7,
    help: {
      absent: "Benutzen Sie „Nur, wenn klare Kriterien gelten, würde ich das unterstützen.“",
      frame: "Nach der Bedingung sollte stehen, was ohne sie schiefgehen könnte.",
      good: "Genau: Sie machen Ihre Zustimmung von einer klaren Bedingung abhängig.",
    },
  },

  {
    id: "wage_ich_zu_bezweifeln",
    produceContext: "Jemand hat eine positive Erfahrung gemacht, die als allgemeingültig dargestellt wird. Sie bezweifeln, dass das für alle gilt.",
    produceHint: "Höflich, aber deutlich formuliert — kein Angriff auf die Erfahrung selbst.",
    citation: "Ob das für alle so gilt, wage ich zu bezweifeln.",
    gloss: "whether that holds for everyone, I dare to doubt",
    who: "Michael_D",
    occurrence: "Ob das in der Praxis für alle so fair läuft wie bei Petra, wage ich allerdings zu bezweifeln.",
    capability: "argue",
    does: "Sie bezweifeln, dass eine einzelne positive Erfahrung auf alle übertragbar ist, ohne die Erfahrung selbst infrage zu stellen.",
    notThis: "Es ist kein Vorwurf, dass die Erfahrung erfunden wäre. Der Zweifel betrifft nur die Verallgemeinerung.",
    pattern: /wage\s+ich\s+(allerdings\s+)?zu\s+bezweifeln\b/i,
    frame: /wage\s+ich\b[^.!?]{0,20}\bzu\s+bezweifeln\b[^.!?]{0,40}/i,
    novelty: 4, minWords: 5,
    help: {
      absent: "Benutzen Sie „…, wage ich zu bezweifeln.“",
      frame: "Am besten mit einem konkreten Vergleich davor, was genau bezweifelt wird.",
      good: "Genau: Sie zweifeln an der Verallgemeinerung, nicht an der einzelnen Erfahrung.",
    },
  },

  {
    id: "bei_mir_war_das_vielleicht_einfach_glueck",
    produceContext: "Ihre eigene positive Erfahrung könnte ein Einzelfall gewesen sein. Räumen Sie das ein, bevor jemand anderes es tut.",
    produceHint: "Die eigene Erfahrung nicht zurücknehmen — nur ihre Verallgemeinerbarkeit infrage stellen.",
    citation: "Das war bei mir vielleicht einfach Glück.",
    gloss: "that might just have been luck in my case",
    who: "Petra_L2",
    occurrence: "Das war bei mir vielleicht einfach Glück, ich will das nicht verallgemeinern.",
    capability: "concede",
    does: "Sie relativieren Ihre eigene positive Erfahrung von sich aus, bevor jemand anderes den Einwand bringt. Das macht die Diskussion ehrlicher.",
    notThis: "Es ist keine Rücknahme der eigenen Erfahrung. Sie bleibt bestehen — nur ihr Wert als allgemeines Argument wird eingeschränkt.",
    pattern: /war\s+bei\s+mir\s+vielleicht\s+einfach\s+glück\b/i,
    frame: /war\s+bei\s+mir\s+vielleicht\s+einfach\s+glück\b[^.!?]{0,60}/i,
    novelty: 3, minWords: 6,
    help: {
      absent: "Benutzen Sie „Das war bei mir vielleicht einfach Glück.“",
      frame: "Am besten mit einem Zusatz wie „ich will das nicht verallgemeinern“ danach.",
      good: "Genau: Sie relativieren Ihre eigene Erfahrung von sich aus.",
    },
  },
];

const BY_ID = new Map(EXPRESSIONS.map(e => [e.id, e]));

module.exports = { EXPRESSIONS, BY_ID, SOURCE_ID: "src_weiterbildungsbudget" };
