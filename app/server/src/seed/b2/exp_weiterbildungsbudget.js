/**
 * Experiences derived from src_weiterbildungsbudget. Original Skillcase
 * content, same shape as the earlier sources in this series.
 */

const SOURCE_ID = "src_weiterbildungsbudget";

/* ── 1. READING ───────────────────────────────────────────────────────────── */
const reading = {
  id: "exp_weiterbildungsbudget_read",
  kind: "reading",
  ord: 0,
  title: "Weiterbildungsbudget: pro Kopf oder nach Bedarf?",
  minutes: 11,
  primary_capability: "compare",
  secondary_capabilities: ["structure", "argue"],
  checks: [],
  teaches: [],
  steps: [
    { t: "story", lines: [
      "Ein Forum. Fünf Beiträge, vier Leute — die Frage: Weiterbildungsbudget für alle gleich, oder nach Bedarf?",
      "Lesen Sie den ganzen Thread einmal durch. Danach bleibt er offen: Sie dürfen jederzeit zurückblättern.",
    ] },

    { t: "read_source", sourceId: SOURCE_ID },

    { t: "readq", mode: "attribute", sourceId: SOURCE_ID,
      capability: "compare",
      q: "Wer äußert eine Sorge über das Entscheidungsverfahren bei einer Bedarfsvergabe?",
      options: ["elena", "hakan", "petra2", "michael2"],
      answer: 1,
      explain: "Hakan_T fragt, wer bei einer Bedarfsvergabe entscheidet, wessen Bedarf größer ist, und befürchtet Willkür ohne klare Kriterien. Die anderen sprechen über die Wirkung des jetzigen oder eines möglichen Systems, nicht über das Entscheidungsverfahren selbst." },

    { t: "readq", mode: "attribute", sourceId: SOURCE_ID,
      capability: "compare",
      q: "Wer relativiert die eigene positive Erfahrung von sich aus?",
      options: ["elena", "hakan", "petra2", "michael2"],
      answer: 2,
      explain: "Petra_L2 berichtet von einer guten eigenen Erfahrung, fügt aber selbst hinzu, das könnte „einfach Glück“ gewesen sein, und will es nicht verallgemeinern." },

    { t: "readq", mode: "stance", sourceId: SOURCE_ID,
      capability: "argue",
      quote: "Einfach zu verwalten schon, gerecht aber nicht unbedingt",
      q: "Was macht Elena_W mit dieser Aussage?",
      options: [
        "Sie bestreitet, dass die aktuelle Regel einfach ist.",
        "Sie trennt zwei verschiedene Qualitäten einer Regel und erkennt nur eine davon an.",
        "Sie fordert, die Regel sofort abzuschaffen.",
      ],
      answer: 1,
      explain: "Sie gibt zu, dass die Regel einfach zu verwalten ist — bestreitet aber, dass Einfachheit automatisch Gerechtigkeit bedeutet. Beide Eigenschaften werden getrennt bewertet." },

    { t: "readq", mode: "relation", sourceId: SOURCE_ID,
      capability: "structure",
      quote: "Ob das in der Praxis für alle so fair läuft wie bei Petra, wage ich allerdings zu bezweifeln.",
      q: "Wie steht dieser Satz zu Petras vorherigem Beitrag?",
      options: [
        "Er bezweifelt, dass Petras Erfahrung wirklich stattgefunden hat.",
        "Er akzeptiert Petras Erfahrung, bezweifelt aber, dass sie für alle gilt.",
        "Er wiederholt Petras Aussage zustimmend.",
        "Er wechselt zu einem neuen Thema.",
      ],
      answer: 1,
      explain: "Michael bestreitet Petras Erfahrung nicht — er zweifelt nur daran, dass sie repräsentativ für alle ist, besonders für Personen, die sich seltener trauen, ihren Bedarf laut zu äußern." },

    { t: "readq", mode: "implication", sourceId: SOURCE_ID,
      capability: "compare",
      q: "Michael erwähnt, dass „leiser Sprechende“ bei einer Bedarfsvergabe benachteiligt sein könnten. Was folgt daraus für Petras Argument?",
      options: [
        "Dass Petras Argument grundsätzlich falsch ist.",
        "Dass Petras Erfahrung zwar echt ist, aber nicht automatisch für Personen mit anderem Auftreten gilt.",
        "Dass Petra absichtlich benachteiligt wurde.",
      ],
      answer: 1,
      explain: "Petras Erfolg bei der Bedarfsvergabe könnte auch daran liegen, dass sie ihren Bedarf klar äußern konnte — eine Fähigkeit, die nicht alle gleichermaßen haben. Das schwächt die Verallgemeinerbarkeit ihrer Erfahrung, ohne sie infrage zu stellen." },

    { t: "readq", mode: "intention", sourceId: SOURCE_ID,
      capability: "compare",
      quote: "Mich stört gar nicht die Idee einer bedarfsgerechten Verteilung an sich — mich stört, dass dabei genau die leiser Sprechenden übersehen werden könnten.",
      q: "Warum schreibt Elena_W das ganz am Ende?",
      options: [
        "Um zuzugeben, dass ihre erste Kritik am System falsch war.",
        "Um klarzustellen, dass sie Bedarfsvergabe nicht ablehnt, sondern eine Schwäche darin beheben will.",
        "Um Hakan_T vorzuwerfen, dass er zu misstrauisch ist.",
        "Um vorzuschlagen, das Budget ganz abzuschaffen.",
      ],
      answer: 1,
      explain: "Ihr erster Beitrag kritisiert das jetzige Pro-Kopf-System. Am Ende zeigt sich: sie befürwortet Bedarfsvergabe grundsätzlich, sieht aber durch Michaels Einwand eine Lücke — und schlägt eine Kombination aus beidem vor." },
  ],
};

/* ── 2. VOCABULARY ────────────────────────────────────────────────────────── */
const vocabulary = {
  id: "exp_weiterbildungsbudget_chunks",
  kind: "vocabulary",
  ord: 1,
  title: "Vier Sätze, um Zustimmung an Bedingungen zu knüpfen",
  minutes: 9,
  primary_capability: "argue",
  secondary_capabilities: ["concede", "structure"],
  checks: ["lexical_range"],
  teaches: [
    ["Einfach zu verwalten schon, gerecht aber nicht unbedingt.", "easy to administer, sure, but not necessarily fair", "🔗"],
    ["Nur, wenn klare Kriterien gelten, würde ich das unterstützen.", "only if clear criteria apply would I support that", "🔗"],
    ["Ob das für alle so gilt, wage ich zu bezweifeln.", "whether that holds for everyone, I dare to doubt", "🔗"],
    ["Das war bei mir vielleicht einfach Glück.", "that might just have been luck in my case", "🔗"],
  ],
  steps: [
    { t: "story", lines: [
      "Vier Sätze aus dem Thread, den Sie gerade gelesen haben.",
      "Keine Vokabeln — vier Züge, mit denen man Zustimmung an Bedingungen knüpft, ohne pauschal zu urteilen.",
    ] },

    { t: "notice", ex: "einfach_zu_verwalten_gerecht_aber_nicht_unbedingt", sourceId: SOURCE_ID, w: 0 },
    { t: "notice", ex: "nur_wenn_klare_kriterien_gelten_sonst_nicht", sourceId: SOURCE_ID, w: 1 },

    { t: "chunk_choose",
      situation: "Ein Kollege schlägt eine neue Regel vor, bei der eine einzelne Person über die Verteilung von Ressourcen entscheidet. Sie sind offen dafür, aber nur unter einer bestimmten Voraussetzung.",
      q: "Wie äußern Sie das?",
      options: [
        "Nur, wenn klare Kriterien gelten, würde ich das unterstützen.",
        "Einfach zu verwalten schon, gerecht aber nicht unbedingt.",
        "Das war bei mir vielleicht einfach Glück.",
      ],
      answer: 0,
      exercises: ["nur_wenn_klare_kriterien_gelten_sonst_nicht"],
      explain: "A macht Ihre Zustimmung von einer klaren Bedingung abhängig — genau die Situation. B kommentiert eine bestehende Regel, nicht einen neuen Vorschlag. C bezieht sich auf eine eigene Erfahrung, die hier nicht das Thema ist." },

    { t: "notice", ex: "wage_ich_zu_bezweifeln", sourceId: SOURCE_ID, w: 2 },
    { t: "notice", ex: "bei_mir_war_das_vielleicht_einfach_glueck", sourceId: SOURCE_ID, w: 3 },

    { t: "chunk_choose",
      situation: "Ein Kollege berichtet, dass ein neues System bei ihm hervorragend funktioniert hat, und schlägt vor, es für alle einzuführen. Sie bezweifeln, dass seine Erfahrung repräsentativ ist.",
      q: "Wie äußern Sie Ihren Zweifel höflich?",
      options: [
        "Ob das für alle so gilt wie bei dir, wage ich zu bezweifeln.",
        "Das war bei mir vielleicht einfach Glück.",
        "Nur, wenn klare Kriterien gelten, würde ich das unterstützen.",
      ],
      answer: 0,
      exercises: ["wage_ich_zu_bezweifeln"],
      explain: "A zweifelt direkt an der Verallgemeinerbarkeit, ohne die Erfahrung selbst anzugreifen — genau Ihre Position. B wäre eine passende Antwort, wenn SIE die Erfahrung gemacht hätten, nicht Ihr Kollege. C setzt eine neue Bedingung, statt Ihren Zweifel zu äußern." },

    { t: "chunk_produce", ex: "einfach_zu_verwalten_gerecht_aber_nicht_unbedingt", sourceId: SOURCE_ID,
      context: "Eine Regel bei Ihnen ist sehr einfach umzusetzen. Sie bezweifeln trotzdem, dass sie wirklich gerecht ist. Sagen Sie beides.",
      hint: "Erst die Einfachheit zugeben, dann die Gerechtigkeit infrage stellen." },

    { t: "chunk_produce", ex: "bei_mir_war_das_vielleicht_einfach_glueck", sourceId: SOURCE_ID,
      context: "Sie haben eine gute eigene Erfahrung mit etwas gemacht, wollen aber nicht, dass andere sie als allgemeingültig ansehen. Relativieren Sie sie selbst.",
      hint: "Die eigene Erfahrung nicht zurücknehmen — nur ihre Verallgemeinerbarkeit infrage stellen." },
  ],
};

const EXPERIENCES = [reading, vocabulary];

module.exports = { EXPERIENCES, SOURCE_ID };
