/**
 * Experiences derived from src_urlaubsplanung. Original Skillcase content,
 * same shape as the earlier sources in this series.
 */

const SOURCE_ID = "src_urlaubsplanung";

/* ── 1. READING ───────────────────────────────────────────────────────────── */
const reading = {
  id: "exp_urlaubsplanung_read",
  kind: "reading",
  ord: 0,
  title: "Urlaubsplanung: nach Dienstalter oder nach Wunsch?",
  minutes: 11,
  primary_capability: "compare",
  secondary_capabilities: ["structure", "argue"],
  checks: [],
  teaches: [],
  steps: [
    { t: "story", lines: [
      "Ein Forum. Fünf Beiträge, vier Leute — die Frage: sollen Urlaubswünsche nach Dienstalter entschieden werden?",
      "Lesen Sie den ganzen Thread einmal durch. Danach bleibt er offen: Sie dürfen jederzeit zurückblättern.",
    ] },

    { t: "read_source", sourceId: SOURCE_ID },

    { t: "readq", mode: "attribute", sourceId: SOURCE_ID,
      capability: "compare",
      q: "Wer erklärt, unter welchen historischen Umständen die Regel einmal fair war?",
      options: ["annika", "wolfgang", "renate", "murat"],
      answer: 2,
      explain: "Renate_Stationsleitung erklärt die Herkunft der Regel — aus einer Zeit mit weniger Konflikten um Ferienzeiten — und stellt selbst infrage, ob das heute noch gilt. Die anderen sprechen über die Regel in der Gegenwart." },

    { t: "readq", mode: "attribute", sourceId: SOURCE_ID,
      capability: "compare",
      q: "Wer schlägt eine konkrete Kompromisslösung vor?",
      options: ["annika", "wolfgang", "renate", "murat"],
      answer: 3,
      explain: "Murat_K schlägt vor, Dienstalter für die meisten Zeiträume beizubehalten, aber bei Sommerferien eine Ausnahme für Eltern schulpflichtiger Kinder zu machen. Die anderen beschreiben Probleme oder Herkunft, aber keine konkrete neue Regel." },

    { t: "readq", mode: "stance", sourceId: SOURCE_ID,
      capability: "argue",
      quote: "Als Prinzip finde ich Dienstalter eigentlich richtig — wer lange dabei ist, sollte etwas davon haben.",
      q: "Was macht Wolfgang_D mit diesem Satz?",
      options: [
        "Er lehnt Annikas Beschwerde vollständig ab.",
        "Er verteidigt das allgemeine Prinzip, bevor er im nächsten Satz den Einzelfall anerkennt.",
        "Er fordert, die Regel sofort abzuschaffen.",
      ],
      answer: 1,
      explain: "Er beginnt mit einer grundsätzlichen Verteidigung des Prinzips — und schränkt sie im nächsten Satz sofort auf Annikas konkrete Situation ein. Beide Teile gehören zusammen; wer nur den ersten Satz liest, hält ihn für einen reinen Verteidiger der Regel." },

    { t: "readq", mode: "relation", sourceId: SOURCE_ID,
      capability: "structure",
      quote: "Ob sie das heute noch ist, frage ich mich inzwischen selbst.",
      q: "Wie steht dieser Satz zu Renates vorherigem Satz „Damals war sie fair“?",
      options: [
        "Er bestätigt, dass die Regel auch heute noch fair ist.",
        "Er stellt infrage, ob eine damals berechtigte Regel auch heute noch berechtigt ist.",
        "Er widerspricht der Aussage über die Vergangenheit.",
        "Er wiederholt den vorherigen Satz mit anderen Worten.",
      ],
      answer: 1,
      explain: "„Damals war sie fair“ bestätigt die Vergangenheit. Der Satz danach trennt bewusst zwischen damals und heute — er bestreitet nicht, dass es früher passte, sondern lässt offen, ob es das immer noch tut." },

    { t: "readq", mode: "implication", sourceId: SOURCE_ID,
      capability: "compare",
      q: "Murat schlägt vor, Dienstalter für „alle anderen Zeiträume“ beizubehalten. Was folgt daraus für sein Verhältnis zum Prinzip Dienstalter?",
      options: [
        "Er lehnt das Prinzip Dienstalter insgesamt ab.",
        "Er akzeptiert das Prinzip weitgehend und will nur einen einzelnen Sonderfall anders regeln.",
        "Er kennt das Prinzip Dienstalter nicht genau.",
      ],
      answer: 1,
      explain: "Indem er das Prinzip für „alle anderen Zeiträume“ ausdrücklich beibehalten will, zeigt er, dass er es grundsätzlich für sinnvoll hält — sein Vorschlag ist eine punktuelle Anpassung, keine grundsätzliche Ablehnung." },

    { t: "readq", mode: "intention", sourceId: SOURCE_ID,
      capability: "compare",
      quote: "Mich stört gar nicht das Dienstalter als Prinzip — mich stört, dass es ausgerechnet bei den Schulferien keine Ausnahme gibt, obwohl das der einzige Zeitraum ist, in dem ich wirklich keine Wahl habe.",
      q: "Warum schreibt Annika F. das ganz am Ende?",
      options: [
        "Um zuzugeben, dass ihre erste Beschwerde falsch war.",
        "Um klarzustellen, dass sie nicht das Prinzip Dienstalter ablehnt, sondern eine einzelne fehlende Ausnahme kritisiert.",
        "Um Wolfgang_D vorzuwerfen, dass er ihr nicht zugehört hat.",
        "Um vorzuschlagen, Dienstalter komplett abzuschaffen.",
      ],
      answer: 1,
      explain: "Ihr erster Beitrag klingt wie eine generelle Beschwerde über das Dienstalter-Prinzip. Am Ende wird klar: sie will nur eine Ausnahme für Schulferien — genau Murats Vorschlag. Wer nur ihren ersten Beitrag liest, hält sie für eine Gegnerin des Prinzips. Das ist sie nicht." },
  ],
};

/* ── 2. VOCABULARY ────────────────────────────────────────────────────────── */
const vocabulary = {
  id: "exp_urlaubsplanung_chunks",
  kind: "vocabulary",
  ord: 1,
  title: "Vier Sätze für eine Regel, die man anpassen will, nicht abschaffen",
  minutes: 9,
  primary_capability: "argue",
  secondary_capabilities: ["concede", "structure"],
  checks: ["lexical_range"],
  teaches: [
    ["Als Prinzip finde ich das richtig, in diesem Fall aber …", "as a principle I think that's right, but in this case …", "🔗"],
    ["Die Regel stammt noch aus einer Zeit, als …", "the rule dates back to a time when …", "🔗"],
    ["Ein Mittelweg wäre doch, …", "a middle ground would be …", "🔗"],
    ["Mich stört gar nicht X als Prinzip — mich stört, dass es bei Y keine Ausnahme gibt.", "it's not X as a principle that bothers me — what bothers me is there's no exception for Y", "🔗"],
  ],
  steps: [
    { t: "story", lines: [
      "Vier Sätze aus dem Thread, den Sie gerade gelesen haben.",
      "Keine Vokabeln — vier Züge, mit denen man eine Regel anpassen will, statt sie abzuschaffen.",
    ] },

    { t: "notice", ex: "als_prinzip_richtig_in_diesem_fall_aber", sourceId: SOURCE_ID, w: 0 },
    { t: "notice", ex: "die_regel_stammt_noch_aus_einer_zeit_als", sourceId: SOURCE_ID, w: 1 },

    { t: "chunk_choose",
      situation: "Eine alte Regel bei Ihnen im Betrieb wirkt inzwischen nicht mehr zeitgemäß. Sie wollen erklären, warum sie überhaupt entstanden ist, ohne sie einfach nur zu kritisieren.",
      q: "Wie fangen Sie an?",
      options: [
        "Die Regel stammt noch aus einer Zeit, als …",
        "Als Prinzip finde ich das falsch.",
        "Ein Mittelweg wäre doch, die Regel sofort abzuschaffen.",
      ],
      answer: 0,
      exercises: ["die_regel_stammt_noch_aus_einer_zeit_als"],
      explain: "A erklärt die Herkunft, bevor irgendein Urteil folgt — genau die Situation. B urteilt sofort, ohne die Herkunft zu erklären. C schlägt schon eine Lösung vor, bevor überhaupt der Kontext geklärt ist." },

    { t: "notice", ex: "ein_mittelweg_waere_doch", sourceId: SOURCE_ID, w: 2 },
    { t: "notice", ex: "stoert_nicht_prinzip_sondern_fehlende_ausnahme", sourceId: SOURCE_ID, w: 3 },

    { t: "chunk_choose",
      situation: "Sie akzeptieren eine allgemeine Regel bei der Schichtplanung vollständig — nur für einen einzigen Fall (z. B. eine akute familiäre Notlage) fehlt Ihnen eine Ausnahme.",
      q: "Wie sagen Sie, worum es Ihnen wirklich geht?",
      options: [
        "Mich stört gar nicht die Schichtplanung als Prinzip — mich stört, dass es bei Notlagen keine Ausnahme gibt.",
        "Als Prinzip finde ich das falsch, in jedem Fall.",
        "Die Regel stammt noch aus einer ganz anderen Zeit.",
      ],
      answer: 0,
      exercises: ["stoert_nicht_prinzip_sondern_fehlende_ausnahme"],
      explain: "A akzeptiert das Prinzip vollständig und benennt nur die eine fehlende Ausnahme — genau Ihre Position. B lehnt das Prinzip insgesamt ab, was Sie nicht wollen. C erklärt nur die Herkunft, ohne Ihr eigentliches Anliegen zu nennen." },

    { t: "chunk_produce", ex: "ein_mittelweg_waere_doch", sourceId: SOURCE_ID,
      context: "Zwei Kollegen streiten über eine Regel. Sie sehen eine Lösung, die beiden Seiten teilweise gerecht wird. Schlagen Sie sie vor.",
      hint: "Formulieren Sie den Kompromiss als Vorschlag, nicht als Forderung." },

    { t: "chunk_produce", ex: "als_prinzip_richtig_in_diesem_fall_aber", sourceId: SOURCE_ID,
      context: "Eine Regel bei Ihnen ist im Allgemeinen sinnvoll, trifft aber einen bestimmten Kollegen besonders hart. Äußern Sie beides in einem Gedankengang.",
      hint: "Erst das Prinzip verteidigen, dann den Einzelfall anerkennen." },
  ],
};

const EXPERIENCES = [reading, vocabulary];

module.exports = { EXPERIENCES, SOURCE_ID };
