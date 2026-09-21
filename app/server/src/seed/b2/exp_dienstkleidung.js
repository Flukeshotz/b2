/**
 * Experiences derived from src_dienstkleidung. Original Skillcase content,
 * same shape as the earlier sources in this series.
 */

const SOURCE_ID = "src_dienstkleidung";

/* ── 1. READING ───────────────────────────────────────────────────────────── */
const reading = {
  id: "exp_dienstkleidung_read",
  kind: "reading",
  ord: 0,
  title: "Dienstkleidung: wer zahlt dafür?",
  minutes: 11,
  primary_capability: "compare",
  secondary_capabilities: ["structure", "argue"],
  checks: [],
  teaches: [],
  steps: [
    { t: "story", lines: [
      "Ein Forum. Fünf Beiträge, vier Leute — die Frage: wer zahlt für die Dienstkleidung?",
      "Lesen Sie den ganzen Thread einmal durch. Danach bleibt er offen: Sie dürfen jederzeit zurückblättern.",
    ] },

    { t: "read_source", sourceId: SOURCE_ID },

    { t: "readq", mode: "attribute", sourceId: SOURCE_ID,
      capability: "compare",
      q: "Wer erklärt die rechtliche Seite der Frage, ohne selbst eine Meinung dazu zu äußern?",
      options: ["sonja", "matteo", "helene", "yusuf"],
      answer: 2,
      explain: "Helene K. legt die rechtliche Lage dar — wann ein Anspruch besteht und wann nicht —, ohne zu sagen, ob sie das für richtig oder falsch hält. Die anderen äußern jeweils eine klare eigene Position." },

    { t: "readq", mode: "attribute", sourceId: SOURCE_ID,
      capability: "compare",
      q: "Wer trennt ausdrücklich zwischen dem, was rechtlich gilt, und dem, was fair ist?",
      options: ["sonja", "matteo", "helene", "yusuf"],
      answer: 3,
      explain: "Yusuf D. sagt es direkt: „Das mag rechtlich stimmen, hat aber mit der Frage, was fair ist, eigentlich wenig zu tun.“ Er akzeptiert Helenes rechtliche Aussage, hält sie aber für die falsche Frage." },

    { t: "readq", mode: "stance", sourceId: SOURCE_ID,
      capability: "argue",
      quote: "Ist das bei euch auch so? Ich finde das ehrlich gesagt nicht in Ordnung.",
      q: "Sonjas erster Beitrag — was ist er vor allem?",
      options: [
        "Eine rechtliche Einschätzung, die sich später als falsch herausstellt.",
        "Eine persönliche Reaktion, deren genauer Grund erst am Ende des Threads klar wird.",
        "Ein Vorschlag für eine neue Regel.",
      ],
      answer: 1,
      explain: "Sie äußert zunächst nur ein allgemeines Unbehagen. Was sie konkret stört, wird erst in ihrem letzten Beitrag deutlich — und es ist nicht das, was ihr erster Satz vermuten lässt." },

    { t: "readq", mode: "relation", sourceId: SOURCE_ID,
      capability: "structure",
      quote: "Das mag rechtlich stimmen, hat aber mit der Frage, was fair ist, eigentlich wenig zu tun.",
      q: "Wie steht Yusufs Satz zu Helenes Beitrag davor?",
      options: [
        "Er bestreitet, dass Helenes rechtliche Darstellung korrekt ist.",
        "Er akzeptiert Helenes Darstellung vollständig und verschiebt nur den Maßstab, an dem er die Frage misst.",
        "Er wiederholt Helenes Aussage mit anderen Worten.",
        "Er wechselt das Thema komplett.",
      ],
      answer: 1,
      explain: "„Das mag rechtlich stimmen“ akzeptiert Helenes Punkt vollständig. Der Rest des Satzes ändert nur, welche Frage als relevant gilt — von „was ist vorgeschrieben“ zu „was ist gerecht“." },

    { t: "readq", mode: "implication", sourceId: SOURCE_ID,
      capability: "compare",
      q: "Matteo erwähnt, dass sein Betrieb einen festen jährlichen Betrag zahlt. Was folgt daraus für Sonjas letzten Beitrag?",
      options: [
        "Dass sie Matteos Modell für unbrauchbar hält.",
        "Dass sie mit einer ähnlichen Lösung zufrieden wäre — ihr eigentliches Problem liegt woanders.",
        "Dass ihr Betrieb genau dasselbe Modell einführen muss.",
      ],
      answer: 1,
      explain: "Sie schreibt ausdrücklich, dass sie mit Matteos Modell „sogar leben“ könnte. Das zeigt: das Geld selbst ist nicht ihr Hauptproblem — sonst würde sie Matteos Lösung nicht so leicht akzeptieren." },

    { t: "readq", mode: "intention", sourceId: SOURCE_ID,
      capability: "compare",
      quote: "Mich stört gar nicht so sehr das Geld an sich — bei Matteos Modell mit dem festen Betrag könnte ich sogar leben. Mich stört, dass bei uns niemand überhaupt erklärt hat, warum es so geregelt ist.",
      q: "Warum schreibt Sonja W. das ganz am Ende?",
      options: [
        "Um zuzugeben, dass ihre erste Beschwerde falsch war.",
        "Um klarzustellen, dass sie nicht in erster Linie mehr Geld fordert, sondern eine Erklärung vermisst.",
        "Um Helene K. vorzuwerfen, die Regel erfunden zu haben.",
        "Um vorzuschlagen, ganz auf Dienstkleidung zu verzichten.",
      ],
      answer: 1,
      explain: "Ihr erster Beitrag klingt wie eine Forderung nach mehr Geld. Am Ende zeigt sich: fehlende Transparenz ist ihr eigentliches Problem, nicht die Höhe der Kosten. Wer nur ihren ersten Satz liest, missversteht ihre Position." },
  ],
};

/* ── 2. VOCABULARY ────────────────────────────────────────────────────────── */
const vocabulary = {
  id: "exp_dienstkleidung_chunks",
  kind: "vocabulary",
  ord: 1,
  title: "Vier Sätze, um Recht und Fairness auseinanderzuhalten",
  minutes: 9,
  primary_capability: "argue",
  secondary_capabilities: ["concede", "structure", "justify"],
  checks: ["lexical_range"],
  teaches: [
    ["Bei mir persönlich war das anders: …", "for me personally it was different: …", "🔗"],
    ["Das mag rechtlich stimmen, hat aber mit X wenig zu tun.", "that may be legally correct, but it has little to do with X", "🔗"],
    ["Solange X gilt, bin ich einverstanden.", "as long as X holds, I'm fine with it", "🔗"],
    ["Mich stört gar nicht so sehr X an sich — mich stört, dass …", "it's not really X itself that bothers me — what bothers me is that …", "🔗"],
  ],
  steps: [
    { t: "story", lines: [
      "Vier Sätze aus dem Thread, den Sie gerade gelesen haben.",
      "Keine Vokabeln — vier Züge, mit denen man Regeln diskutiert, ohne persönlich zu werden.",
    ] },

    { t: "notice", ex: "bei_mir_persoenlich_war_das_anders", sourceId: SOURCE_ID, w: 0 },
    { t: "notice", ex: "mag_rechtlich_stimmen_hat_aber_mit_fair_wenig_zu_tun", sourceId: SOURCE_ID, w: 1 },

    { t: "chunk_choose",
      situation: "Ein Kollege sagt, eine Regel sei rechtlich völlig zulässig und deshalb kein Problem. Sie stimmen der rechtlichen Einschätzung zu, finden die Regel aber trotzdem unfair.",
      q: "Wie antworten Sie?",
      options: [
        "Das mag rechtlich stimmen, hat aber mit Fairness wenig zu tun.",
        "Bei mir persönlich war das anders.",
        "Solange das rechtlich so bleibt, bin ich einverstanden.",
      ],
      answer: 0,
      exercises: ["mag_rechtlich_stimmen_hat_aber_mit_fair_wenig_zu_tun"],
      explain: "A akzeptiert die rechtliche Aussage und öffnet gleichzeitig die Fairness-Frage — genau Ihre Position. B passt inhaltlich nicht, es geht nicht um eine persönliche Erfahrung. C würde bedeuten, dass Sie einverstanden sind, was nicht stimmt." },

    { t: "notice", ex: "solange_x_gilt_bin_ich_einverstanden", sourceId: SOURCE_ID, w: 2 },
    { t: "notice", ex: "stoert_nicht_geld_sondern_erklaerung", sourceId: SOURCE_ID, w: 3 },

    { t: "chunk_choose",
      situation: "Ihr Betrieb schlägt eine neue Regel vor. Niemand hat bisher erklärt, warum sie eingeführt wurde. Wenn Sie den Grund kennen würden, wären Sie vermutlich einverstanden.",
      q: "Wie sagen Sie das?",
      options: [
        "Wenn ich den Grund wüsste, würde ich es vermutlich auch akzeptieren.",
        "Mich stört die Regel an sich, ganz unabhängig vom Grund.",
        "Bei mir persönlich war das schon immer anders geregelt.",
      ],
      answer: 0,
      exercises: ["solange_x_gilt_bin_ich_einverstanden"],
      explain: "A macht die Zustimmung von einer Bedingung abhängig — hier: dem fehlenden Grund. B widerspricht dem, was Sie eigentlich sagen wollen. C beschreibt nur eine andere Erfahrung, keine Bedingung für Zustimmung." },

    { t: "chunk_produce", ex: "bei_mir_persoenlich_war_das_anders", sourceId: SOURCE_ID,
      context: "In einer Diskussion beschreibt jemand eine Regel als allgemeingültig. Ihre eigene Erfahrung war anders. Beschreiben Sie sie, ohne die andere Person zu widerlegen.",
      hint: "Stellen Sie Ihre Erfahrung neben die Aussage, statt sie zu bestreiten." },

    { t: "chunk_produce", ex: "stoert_nicht_geld_sondern_erklaerung", sourceId: SOURCE_ID,
      context: "Eine unpopuläre Entscheidung wurde bei Ihnen getroffen, ohne dass jemand den Grund erklärt hat. Sagen Sie, was Sie wirklich stört.",
      hint: "Schließen Sie zuerst aus, was Sie NICHT stört — dann das eigentliche Problem." },
  ],
};

const EXPERIENCES = [reading, vocabulary];

module.exports = { EXPERIENCES, SOURCE_ID };
