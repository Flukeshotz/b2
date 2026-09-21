/**
 * Experiences derived from src_fahrtkosten. Original Skillcase content, same
 * shape as the earlier sources in this series.
 */

const SOURCE_ID = "src_fahrtkosten";

/* ── 1. READING ───────────────────────────────────────────────────────────── */
const reading = {
  id: "exp_fahrtkosten_read",
  kind: "reading",
  ord: 0,
  title: "Fahrtkostenzuschuss für Wechselschicht",
  minutes: 11,
  primary_capability: "compare",
  secondary_capabilities: ["structure", "argue"],
  checks: [],
  teaches: [],
  steps: [
    { t: "story", lines: [
      "Ein Forum. Fünf Beiträge, vier Leute — die Frage: warum bekommt nur die Frühschicht einen Fahrtkostenzuschuss?",
      "Lesen Sie den ganzen Thread einmal durch. Danach bleibt er offen: Sie dürfen jederzeit zurückblättern.",
    ] },

    { t: "read_source", sourceId: SOURCE_ID },

    { t: "readq", mode: "attribute", sourceId: SOURCE_ID,
      capability: "compare",
      q: "Wer erklärt, unter welchen historischen Umständen die Regel entstanden ist?",
      options: ["monika", "thorsten", "carola", "ben"],
      answer: 2,
      explain: "Carola_Personalabteilung erklärt, dass die Regel aus einer Zeit stammt, als durchgehende Nachtschicht die Ausnahme war. Die anderen sprechen über die heutige Situation, nicht über die Entstehung der Regel." },

    { t: "readq", mode: "attribute", sourceId: SOURCE_ID,
      capability: "compare",
      q: "Wer stützt seine Position mit einem konkreten Vergleich zu einem anderen Arbeitgeber?",
      options: ["monika", "thorsten", "carola", "ben"],
      answer: 3,
      explain: "Ben_bewerbung berichtet von einem früheren Arbeitgeber mit einer anderen, umfassenderen Regelung. Die anderen sprechen über die aktuelle Situation bei ihnen, ohne einen externen Vergleich." },

    { t: "readq", mode: "stance", sourceId: SOURCE_ID,
      capability: "argue",
      quote: "Auf dem Papier klingt das fair — Frühschicht ist objektiv am schwierigsten mit dem Bus zu erreichen.",
      q: "Was macht Thorsten_B mit diesem Satz, bevor er im nächsten Satz widerspricht?",
      options: [
        "Er lehnt die Regel von Anfang an vollständig ab.",
        "Er erkennt die ursprüngliche Logik der Regel ausdrücklich an.",
        "Er behauptet, die Regel sei nie sinnvoll gewesen.",
      ],
      answer: 1,
      explain: "Er beginnt mit einer echten Anerkennung der Logik — die Regel „klingt fair“ und die Begründung ist „objektiv“ nachvollziehbar. Erst danach folgt der Einwand zur Praxis." },

    { t: "readq", mode: "relation", sourceId: SOURCE_ID,
      capability: "structure",
      quote: "In der Praxis sieht es allerdings anders aus, wie du sagst: Nachtschicht hat oft überhaupt keine Verbindung, nicht nur eine seltene.",
      q: "Wie steht dieser Satz zu Thorstens vorherigem Satz über die Logik der Regel?",
      options: [
        "Er widerspricht der Logik, die er selbst gerade anerkannt hat.",
        "Er lässt die Logik bestehen und zeigt, dass sie in der Praxis nicht ausreicht.",
        "Er wiederholt den vorherigen Satz mit anderen Worten.",
        "Er wechselt komplett das Thema.",
      ],
      answer: 1,
      explain: "Er bestreitet nicht, dass die ursprüngliche Logik nachvollziehbar war — er zeigt nur, dass sie ein wichtiges Detail übersieht: der Unterschied zwischen „selten“ und „gar nicht vorhanden“." },

    { t: "readq", mode: "implication", sourceId: SOURCE_ID,
      capability: "compare",
      q: "Carola schreibt, es sei ihr „neu“, dass sich die Situation geändert hat. Was folgt daraus für die aktuelle Regel?",
      options: [
        "Dass die Regel absichtlich nie aktualisiert wurde.",
        "Dass die Regel möglicherweise nicht aus bösem Willen, sondern aus fehlender Überprüfung veraltet ist.",
        "Dass Carola die Beschwerden für unwichtig hält.",
      ],
      answer: 1,
      explain: "Wenn selbst die Personalabteilung von der veränderten Situation überrascht ist, spricht das eher für eine Regel, die niemand bewusst überprüft hat, als für eine absichtliche Benachteiligung." },

    { t: "readq", mode: "intention", sourceId: SOURCE_ID,
      capability: "compare",
      quote: "Mich stört gar nicht, dass es überhaupt eine Regel gibt — mich stört, dass sie auf einer Annahme beruht, die inzwischen nicht mehr stimmt.",
      q: "Warum schreibt Monika_R das ganz am Ende?",
      options: [
        "Um zuzugeben, dass ihre erste Beschwerde falsch war.",
        "Um klarzustellen, dass ihr eigentliches Problem eine veraltete Annahme ist, nicht die Existenz der Regel selbst.",
        "Um Carola vorzuwerfen, absichtlich unfair zu handeln.",
        "Um vorzuschlagen, den Zuschuss ganz abzuschaffen.",
      ],
      answer: 1,
      explain: "Ihr erster Beitrag klingt wie eine grundsätzliche Kritik am Zuschuss-System. Am Ende zeigt sich: sie will nicht, dass es keine Regel gibt — sie will, dass die Regel auf aktuellen Fakten beruht. Wer nur ihren ersten Beitrag liest, unterschätzt die Präzision ihrer Position." },
  ],
};

/* ── 2. VOCABULARY ────────────────────────────────────────────────────────── */
const vocabulary = {
  id: "exp_fahrtkosten_chunks",
  kind: "vocabulary",
  ord: 1,
  title: "Vier Sätze, um Theorie und Praxis zu vergleichen",
  minutes: 9,
  primary_capability: "argue",
  secondary_capabilities: ["structure", "justify", "concede"],
  checks: ["lexical_range"],
  teaches: [
    ["Auf dem Papier klingt das fair, in der Praxis sieht es anders aus.", "on paper that sounds fair, in practice it looks different", "🔗"],
    ["Das war eher die Ausnahme als der Normalfall.", "that was more the exception than the norm", "🔗"],
    ["Anderswo wird das längst so gemacht.", "elsewhere it's already done that way", "🔗"],
    ["Ganz sicher bin ich mir da selbst nicht.", "I'm not entirely sure about that myself", "🔗"],
  ],
  steps: [
    { t: "story", lines: [
      "Vier Sätze aus dem Thread, den Sie gerade gelesen haben.",
      "Keine Vokabeln — vier Züge, mit denen man eine Regel gegen die Realität prüft.",
    ] },

    { t: "notice", ex: "auf_dem_papier_fair_in_der_praxis_anders", sourceId: SOURCE_ID, w: 0 },
    { t: "notice", ex: "eher_die_ausnahme_als_der_normalfall", sourceId: SOURCE_ID, w: 1 },

    { t: "chunk_choose",
      situation: "Eine Regel bei Ihnen sieht auf den ersten Blick gerecht aus. Sobald Sie genauer hinschauen, funktioniert sie für eine bestimmte Gruppe aber nicht.",
      q: "Wie beschreiben Sie das?",
      options: [
        "Auf dem Papier klingt das fair, in der Praxis sieht es anders aus.",
        "Anderswo wird das längst so gemacht.",
        "Ganz sicher bin ich mir da selbst nicht.",
      ],
      answer: 0,
      exercises: ["auf_dem_papier_fair_in_der_praxis_anders"],
      explain: "A trennt genau Theorie und Praxis — genau die Situation. B ist ein Vergleich mit anderswo, den Sie hier noch nicht gemacht haben. C ist eine Unsicherheit über die eigene Position, nicht das Thema hier." },

    { t: "notice", ex: "anderswo_wird_das_laengst_so_gemacht", sourceId: SOURCE_ID, w: 2 },
    { t: "notice", ex: "ganz_sicher_bin_ich_mir_da_selbst_nicht", sourceId: SOURCE_ID, w: 3 },

    { t: "chunk_choose",
      situation: "Sie fordern eine Änderung bei der Arbeit und wissen von einem früheren Arbeitgeber, dass diese Änderung dort erfolgreich umgesetzt wurde.",
      q: "Wie stützen Sie Ihre Forderung?",
      options: [
        "Bei meinem letzten Arbeitgeber gab es das schon. Anderswo wird das längst so gemacht.",
        "Auf dem Papier klingt das fair, in der Praxis sieht es anders aus.",
        "Das war eher die Ausnahme als der Normalfall.",
      ],
      answer: 0,
      exercises: ["anderswo_wird_das_laengst_so_gemacht"],
      explain: "A liefert das konkrete Beispiel und den Vergleich — genau Ihre Position. B und C passen inhaltlich nicht: hier geht es um einen positiven Vergleich, nicht um einen Theorie-Praxis-Unterschied oder eine historische Einordnung." },

    { t: "chunk_produce", ex: "eher_die_ausnahme_als_der_normalfall", sourceId: SOURCE_ID,
      context: "Eine alte Regel bei Ihnen beruht auf einer Situation, die früher selten war und heute häufig ist. Erklären Sie den Unterschied.",
      hint: "Nennen Sie den damaligen Status als Ausnahme, im Gegensatz zu heute." },

    { t: "chunk_produce", ex: "ganz_sicher_bin_ich_mir_da_selbst_nicht", sourceId: SOURCE_ID,
      context: "Sie vertreten eine Position in einer Diskussion, sind sich aber bei einem Detail selbst nicht ganz sicher. Räumen Sie das ein.",
      hint: "Ehrlich bleiben, statt Sicherheit vorzutäuschen." },
  ],
};

const EXPERIENCES = [reading, vocabulary];

module.exports = { EXPERIENCES, SOURCE_ID };
