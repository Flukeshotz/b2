/**
 * Experience derived from src_brief_umzug. Original Skillcase content, in
 * Goethe Lesen Teil 1's actual shape: detail comprehension on a single
 * personal letter, not the Teil-2 forum-thread format every other reading
 * source in this product uses. MCQ rather than binary Richtig/Falsch — the
 * gate requires 3+ options per item and at least one implication/intention
 * item even here, so pure retrieval alone is not enough at B2.
 */

const SOURCE_ID = "src_brief_umzug";

const reading = {
  id: "exp_brief_umzug_read",
  kind: "reading",
  ord: 0,
  title: "Brief: Der neue Arbeitsplatz",
  minutes: 8,
  primary_capability: "structure",
  secondary_capabilities: [],
  checks: [],
  teaches: [],
  steps: [
    { t: "story", lines: [
      "Ein Brief, keine Diskussion. Eine Frau schreibt einer Freundin, drei Monate nach einem Stellenwechsel.",
      "Lesen Sie den Brief einmal durch. Danach einige Fragen dazu.",
    ] },

    { t: "read_source", sourceId: SOURCE_ID },

    { t: "readq", mode: "meaning", sourceId: SOURCE_ID,
      capability: "structure",
      q: "Wovor hatte Annelie vor dem Stellenwechsel vor allem Angst?",
      options: [
        "Dass ihr das neue Team fremd vorkommen würde.",
        "Dass die Fahrtzeit zu lang werden würde.",
        "Dass sie die neue Software nicht lernen würde.",
      ],
      answer: 0,
      explain: "Sie schreibt es direkt: „Ich hatte erwartet, dass mir vor allem das neue Team fremd vorkommen würde.“ Das war ihre Erwartung vorher." },

    { t: "readq", mode: "meaning", sourceId: SOURCE_ID,
      capability: "structure",
      q: "Wie hat das Team tatsächlich auf sie reagiert?",
      options: [
        "Es hat lange gedauert, bis sie akzeptiert wurde.",
        "Das Team hat sie von Anfang an gut aufgenommen.",
        "Im Brief steht nichts darüber.",
      ],
      answer: 1,
      explain: "„Das Team hat mich von Anfang an gut aufgenommen“ — das steht wörtlich im Text." },

    { t: "readq", mode: "meaning", sourceId: SOURCE_ID,
      capability: "structure",
      q: "Was war für Annelie in den ersten Wochen tatsächlich am schwierigsten?",
      options: [
        "Der Kontakt zu den neuen Kolleginnen.",
        "Die neue Dokumentationssoftware.",
        "Die neuen Arbeitszeiten.",
      ],
      answer: 1,
      explain: "Sie schreibt, dass sie in den ersten Wochen doppelt so lange für einfache Einträge brauchte wie ihre Kolleginnen — eine Schwierigkeit, mit der sie vorher nicht gerechnet hatte." },

    { t: "readq", mode: "meaning", sourceId: SOURCE_ID,
      capability: "structure",
      q: "Wie hat sich ihr Arbeitsweg durch den Stellenwechsel verändert?",
      options: [
        "Er ist kürzer geworden.",
        "Er ist gleich geblieben.",
        "Er ist um vierzig Minuten länger geworden.",
      ],
      answer: 2,
      explain: "Die Fahrtzeit ist mit vierzig Minuten länger als vorher, das stört sie ausdrücklich — auch wenn sie im nächsten Satz einen Ausgleich nennt." },

    { t: "readq", mode: "meaning", sourceId: SOURCE_ID,
      capability: "structure",
      q: "Was nennt Annelie als Ausgleich für den längeren Arbeitsweg?",
      options: [
        "Ein höheres Gehalt.",
        "Flexiblere Arbeitszeiten als früher.",
        "Mehr Urlaubstage.",
      ],
      answer: 1,
      explain: "„Zum Ausgleich habe ich aber flexiblere Arbeitszeiten als früher“ — das steht direkt im Text, als Gegengewicht zum längeren Weg." },

    { t: "readq", mode: "implication", sourceId: SOURCE_ID,
      capability: "structure",
      q: "Annelie schreibt am Ende, wie wenig ihre ursprünglichen Sorgen gestimmt haben, und wie sehr sie stattdessen eine Kleinigkeit beschäftigt hat, an die sie vorher gar nicht gedacht hatte. Was zeigt das über die Art, wie Veränderungen oft ablaufen?",
      options: [
        "Dass man Sorgen vor einer Veränderung grundsätzlich nicht ernst nehmen sollte.",
        "Dass die Dinge, vor denen man sich am meisten fürchtet, oft nicht die sind, die am Ende wirklich Mühe machen.",
        "Dass Annelie sich für den Stellenwechsel schlecht vorbereitet hat.",
      ],
      answer: 1,
      explain: "Ihre größte Sorge (das Team) hat sich nicht bestätigt; ihre eigentliche Schwierigkeit (die Software) hatte sie vorher gar nicht auf dem Schirm. Das ist eine allgemeine Beobachtung über Erwartung und Realität, keine Kritik an ihrer Vorbereitung — und auch kein Argument, Sorgen grundsätzlich zu ignorieren." },
  ],
};

const EXPERIENCES = [reading];

module.exports = { EXPERIENCES, SOURCE_ID };
