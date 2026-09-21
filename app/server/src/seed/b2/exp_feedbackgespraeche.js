/**
 * Experiences derived from src_feedbackgespraeche. Original Skillcase
 * content, same shape as the earlier sources in this series.
 */

const SOURCE_ID = "src_feedbackgespraeche";

/* ── 1. READING ───────────────────────────────────────────────────────────── */
const reading = {
  id: "exp_feedbackgespraeche_read",
  kind: "reading",
  ord: 0,
  title: "Feedbackgespräche: einmal im Jahr oder laufend?",
  minutes: 11,
  primary_capability: "compare",
  secondary_capabilities: ["structure", "argue"],
  checks: [],
  teaches: [],
  steps: [
    { t: "story", lines: [
      "Ein Forum. Fünf Beiträge, vier Leute — die Frage: jährliches Feedback oder monatliche Gespräche?",
      "Lesen Sie den ganzen Thread einmal durch. Danach bleibt er offen: Sie dürfen jederzeit zurückblättern.",
    ] },

    { t: "read_source", sourceId: SOURCE_ID },

    { t: "readq", mode: "attribute", sourceId: SOURCE_ID,
      capability: "compare",
      q: "Wer berichtet von einer konkreten Erfahrung aus einem anderen Betrieb?",
      options: ["verena", "klaus2", "annette", "juergen"],
      answer: 1,
      explain: "Klaus_M berichtet von einem Kollegen, bei dem monatliches Feedback in einem früheren Betrieb zu reiner Routine wurde. Die anderen sprechen über die eigene aktuelle Situation, nicht über eine fremde Erfahrung." },

    { t: "readq", mode: "attribute", sourceId: SOURCE_ID,
      capability: "compare",
      q: "Wer äußert eine konkrete Sorge über den Zeitpunkt von Kritik, nicht über den Aufwand?",
      options: ["verena", "klaus2", "annette", "juergen"],
      answer: 3,
      explain: "Jürgen_K befürchtet, dass monatliches Feedback bei Problemen zu früh kommt, bevor genug Zeit zur Veränderung war. Annette spricht dagegen über den Vorbereitungsaufwand, ein anderes Problem." },

    { t: "readq", mode: "stance", sourceId: SOURCE_ID,
      capability: "argue",
      quote: "Öfter heißt aber nicht automatisch besser.",
      q: "Was macht Klaus_M mit diesem Satz vor allem?",
      options: [
        "Er lehnt häufigeres Feedback grundsätzlich ab.",
        "Er bestreitet eine unausgesprochene Annahme hinter Verenas Vorschlag.",
        "Er stimmt Verena vollständig zu.",
      ],
      answer: 1,
      explain: "Verenas Vorschlag setzt implizit voraus, dass häufiger automatisch besser ist. Klaus bestreitet genau diese Annahme, nicht den Vorschlag als Ganzes — das zeigt sein Beispiel danach, das ein Risiko beschreibt, kein grundsätzliches Nein." },

    { t: "readq", mode: "relation", sourceId: SOURCE_ID,
      capability: "structure",
      quote: "aber es überzeugt mich trotzdem nicht ganz",
      q: "Wie steht dieser Teil des Satzes zu „Das hat schon Vorteile, das gebe ich zu“ davor?",
      options: [
        "Er widerspricht der Aussage über die Vorteile.",
        "Er lässt die Vorteile vollständig gelten und fügt trotzdem eine bleibende Skepsis hinzu.",
        "Er wiederholt die Aussage über die Vorteile.",
        "Er wechselt das Thema zum Zeitaufwand.",
      ],
      answer: 1,
      explain: "Annette bestreitet die Vorteile nicht — sie erkennt sie ausdrücklich an („das gebe ich zu“). Die Skepsis danach ist ein zweiter, eigenständiger Punkt, kein Widerspruch zum ersten." },

    { t: "readq", mode: "implication", sourceId: SOURCE_ID,
      capability: "compare",
      q: "Annette erwähnt, dass zwölf Gespräche mehr Zeit kosten als eines. Was folgt daraus für ihre Position zum Vorschlag?",
      options: [
        "Dass sie monatliches Feedback inhaltlich für falsch hält.",
        "Dass ihr Einwand vor allem praktisch-organisatorisch ist, nicht inhaltlich.",
        "Dass sie generell gegen Feedbackgespräche ist.",
      ],
      answer: 1,
      explain: "Ihr Einwand betrifft die Vorbereitungszeit als Leitung, nicht den Wert von Feedback selbst — sie hat die Vorteile der Idee ja bereits anerkannt. Ihr Widerstand ist organisatorisch, nicht grundsätzlich." },

    { t: "readq", mode: "intention", sourceId: SOURCE_ID,
      capability: "compare",
      quote: "Mich stört gar nicht die Häufigkeit an sich — mich stört, dass niemand gesagt hat, wie kurzes Feedback von echter Beurteilung unterschieden werden soll.",
      q: "Warum schreibt Verena_S das ganz am Ende?",
      options: [
        "Um zuzugeben, dass ihr erster Vorschlag falsch war.",
        "Um klarzustellen, dass ihr eigentliches Anliegen eine klare Trennung zwischen Feedback und Beurteilung ist, nicht die Häufigkeit selbst.",
        "Um Klaus_M vorzuwerfen, dass er zu pessimistisch ist.",
        "Um vorzuschlagen, ganz auf Feedbackgespräche zu verzichten.",
      ],
      answer: 1,
      explain: "Ihr erster Beitrag klingt wie eine einfache Befürwortung häufigeren Feedbacks. Am Ende zeigt sich: ihr eigentliches Anliegen ist Jürgens Sorge — dass kurzes Feedback nicht wie ein Urteil wirken soll. Wer nur ihren ersten Beitrag liest, unterschätzt, wie differenziert ihre Position ist." },
  ],
};

/* ── 2. VOCABULARY ────────────────────────────────────────────────────────── */
const vocabulary = {
  id: "exp_feedbackgespraeche_chunks",
  kind: "vocabulary",
  ord: 1,
  title: "Vier Sätze, um Zustimmung und Skepsis zu trennen",
  minutes: 9,
  primary_capability: "argue",
  secondary_capabilities: ["concede", "justify"],
  checks: ["lexical_range"],
  teaches: [
    ["Öfter heißt nicht automatisch besser.", "more often doesn't automatically mean better", "🔗"],
    ["Das hat schon Vorteile, das gebe ich zu — überzeugt mich trotzdem nicht ganz.", "that does have advantages, I'll admit — it still doesn't fully convince me", "🔗"],
    ["Konkret befürchte ich, dass …", "specifically, I'm worried that …", "🔗"],
    ["Dafür müsste allerdings sichergestellt sein, dass …", "for that, though, it would have to be ensured that …", "🔗"],
  ],
  steps: [
    { t: "story", lines: [
      "Vier Sätze aus dem Thread, den Sie gerade gelesen haben.",
      "Keine Vokabeln — vier Züge, mit denen man Zustimmung und Zweifel gleichzeitig ausdrückt.",
    ] },

    { t: "notice", ex: "oefter_heisst_nicht_automatisch_besser", sourceId: SOURCE_ID, w: 0 },
    { t: "notice", ex: "konkret_befuerchte_ich_dass", sourceId: SOURCE_ID, w: 2 },

    { t: "chunk_choose",
      situation: "Ein Kollege schlägt vor, Teambesprechungen von einmal im Monat auf jede Woche zu erhöhen, weil „mehr Austausch immer gut ist“. Sie sind skeptisch, dass die Qualität mithält.",
      q: "Wie widersprechen Sie der Annahme?",
      options: [
        "Öfter heißt nicht automatisch besser.",
        "Konkret befürchte ich, dass wir dann keine Zeit mehr für die Arbeit haben.",
        "Dafür müsste allerdings sichergestellt sein, dass alle kommen.",
      ],
      answer: 0,
      exercises: ["oefter_heisst_nicht_automatisch_besser"],
      explain: "A bestreitet direkt die Annahme hinter dem Vorschlag — genau die Situation. B nennt eine andere, konkretere Sorge, passt aber weniger gut zur allgemeinen Annahme. C setzt schon eine Bedingung, bevor die Grundannahme überhaupt diskutiert wurde." },

    { t: "notice", ex: "hat_schon_vorteile_ueberzeugt_mich_trotzdem_nicht", sourceId: SOURCE_ID, w: 1 },
    { t: "notice", ex: "dafuer_muesste_allerdings_sichergestellt_sein", sourceId: SOURCE_ID, w: 3 },

    { t: "chunk_choose",
      situation: "Ein neues System wird vorgeschlagen. Sie erkennen echte Vorteile an, sind aber insgesamt noch nicht überzeugt.",
      q: "Wie drücken Sie beides aus?",
      options: [
        "Das hat schon Vorteile, das gebe ich zu — überzeugt mich trotzdem nicht ganz.",
        "Öfter heißt nicht automatisch besser.",
        "Konkret befürchte ich, dass es nicht funktioniert.",
      ],
      answer: 0,
      exercises: ["hat_schon_vorteile_ueberzeugt_mich_trotzdem_nicht"],
      explain: "A erkennt die Vorteile an UND behält die Skepsis — genau Ihre Position. B passt inhaltlich nicht zu einem neuen System, das nicht um Häufigkeit geht. C ist eine reine Sorge ohne das vorherige Zugeständnis." },

    { t: "chunk_produce", ex: "dafuer_muesste_allerdings_sichergestellt_sein", sourceId: SOURCE_ID,
      context: "Sie könnten einem Vorschlag bei der Arbeit zustimmen — aber nur, wenn vorher eine bestimmte Sache geklärt wird. Formulieren Sie diese Bedingung.",
      hint: "Die Bedingung als Voraussetzung formulieren, nicht als Forderung." },

    { t: "chunk_produce", ex: "konkret_befuerchte_ich_dass", sourceId: SOURCE_ID,
      context: "Sie haben eine vage Sorge zu einer geplanten Änderung bei der Arbeit. Machen Sie sie konkret.",
      hint: "Nennen Sie genau, was im schlechtesten Fall passieren könnte." },
  ],
};

const EXPERIENCES = [reading, vocabulary];

module.exports = { EXPERIENCES, SOURCE_ID };
