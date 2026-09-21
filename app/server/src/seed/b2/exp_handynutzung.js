/**
 * Experiences derived from src_handynutzung. Original Skillcase content, same
 * shape as the earlier sources in this series.
 */

const SOURCE_ID = "src_handynutzung";

/* ── 1. READING ───────────────────────────────────────────────────────────── */
const reading = {
  id: "exp_handynutzung_read",
  kind: "reading",
  ord: 0,
  title: "Handynutzung während der Arbeitszeit",
  minutes: 11,
  primary_capability: "compare",
  secondary_capabilities: ["structure", "argue"],
  checks: [],
  teaches: [],
  steps: [
    { t: "story", lines: [
      "Ein Forum. Fünf Beiträge, vier Leute — die Frage: ein neues Handyverbot am Arbeitsplatz.",
      "Lesen Sie den ganzen Thread einmal durch. Danach bleibt er offen: Sie dürfen jederzeit zurückblättern.",
    ] },

    { t: "read_source", sourceId: SOURCE_ID },

    { t: "readq", mode: "attribute", sourceId: SOURCE_ID,
      capability: "compare",
      q: "Wer erklärt, was die Regel ursprünglich ausgelöst hat?",
      options: ["petra", "daniel", "isabel", "felix"],
      answer: 2,
      explain: "Isabel_Stationsleitung nennt den konkreten Auslöser — einen einzelnen, wiederholten Vorfall — und erklärt damit die Herkunft der Regel. Die anderen äußern jeweils ihre Reaktion auf die Regel, nicht deren Ursprung." },

    { t: "readq", mode: "attribute", sourceId: SOURCE_ID,
      capability: "compare",
      q: "Wer weist auf eine mögliche Ungleichbehandlung zwischen zwei Gruppen hin?",
      options: ["petra", "daniel", "isabel", "felix"],
      answer: 3,
      explain: "Felix_B beobachtet, dass Führungskräfte ihr Handy weiterhin sichtbar haben dürfen, während der Rest des Teams es wegpacken muss — und benennt das ausdrücklich als mögliche Ungleichbehandlung." },

    { t: "readq", mode: "stance", sourceId: SOURCE_ID,
      capability: "argue",
      quote: "Mit zweierlei Maß gemessen, oder sehe ich das falsch?",
      q: "Was macht Felix mit dieser Frage vor allem?",
      options: [
        "Er behauptet mit Sicherheit, dass die Führungskräfte unfair handeln.",
        "Er benennt eine Beobachtung als offene Frage, statt sie als sichere Tatsache zu präsentieren.",
        "Er entschuldigt sich für seine vorherige Beobachtung.",
      ],
      answer: 1,
      explain: "Die Frageform „oder sehe ich das falsch?“ hält ausdrücklich offen, dass es eine andere Erklärung geben könnte. Das unterscheidet die Aussage von einer festen Behauptung." },

    { t: "readq", mode: "relation", sourceId: SOURCE_ID,
      capability: "structure",
      quote: "Unterstellen will ich niemandem etwas, es ist mir nur aufgefallen.",
      q: "Wie steht dieser Satz zu Felix' Beobachtung über die Führungskräfte davor?",
      options: [
        "Er verstärkt den Vorwurf gegen die Führungskräfte.",
        "Er trennt die Beobachtung ausdrücklich von einer Unterstellung böser Absicht.",
        "Er widerruft die Beobachtung vollständig.",
        "Er wiederholt die Beobachtung mit anderen Worten.",
      ],
      answer: 1,
      explain: "Der Satz lässt die Beobachtung selbst stehen, schließt aber ausdrücklich aus, dass damit eine Anschuldigung gemeint ist. Das macht den Beitrag sachlicher, ohne den Punkt fallen zu lassen." },

    { t: "readq", mode: "implication", sourceId: SOURCE_ID,
      capability: "compare",
      q: "Isabel erkennt an, dass die Regel „als Misstrauen“ angekommen ist, auch wenn sie nicht so gemeint war. Was folgt daraus für ihre eigene Position?",
      options: [
        "Dass sie die Beschwerden für unberechtigt hält.",
        "Dass sie die Wirkung der Regel ernst nimmt, auch ohne die Regel selbst zurückzunehmen.",
        "Dass sie die Regel sofort wieder abschaffen will.",
      ],
      answer: 1,
      explain: "Sie sagt ausdrücklich „das kann ich nachvollziehen“ — sie nimmt die Wirkung ernst, ohne in diesem Beitrag anzukündigen, die Regel zu ändern. Beides ist möglich: Verständnis zeigen und trotzdem bei der Entscheidung bleiben." },

    { t: "readq", mode: "intention", sourceId: SOURCE_ID,
      capability: "compare",
      quote: "Mich stört gar nicht das Verbot an sich — mich stört, dass es nur für einen Teil des Teams gilt.",
      q: "Warum schreibt Petra L. das ganz am Ende?",
      options: [
        "Um zuzugeben, dass ihre erste Beschwerde übertrieben war.",
        "Um klarzustellen, dass ihr eigentliches Problem die Ungleichbehandlung ist, nicht das Verbot selbst.",
        "Um Daniel_R vorzuwerfen, dass er zu nachsichtig ist.",
        "Um vorzuschlagen, das Verbot ganz aufzuheben.",
      ],
      answer: 1,
      explain: "Ihr erster Beitrag klingt wie eine grundsätzliche Kritik am Verbot. Am Ende zeigt sich: sie hätte mit einem Verbot für alle kein Problem — ihr Punkt ist Felix' Beobachtung zur Ungleichbehandlung. Wer nur ihren ersten Beitrag liest, hält sie für eine Gegnerin des Verbots. Das ist sie nicht." },
  ],
};

/* ── 2. VOCABULARY ────────────────────────────────────────────────────────── */
const vocabulary = {
  id: "exp_handynutzung_chunks",
  kind: "vocabulary",
  ord: 1,
  title: "Vier Sätze, um Absicht von Wirkung zu trennen",
  minutes: 9,
  primary_capability: "argue",
  secondary_capabilities: ["concede", "structure"],
  checks: ["lexical_range"],
  teaches: [
    ["So gemeint war es sicher nicht, angekommen ist es trotzdem so.", "it certainly wasn't meant that way, but that's how it came across anyway", "🔗"],
    ["Für X sehe ich das ein — sonst eigentlich nicht.", "for X I can see that — otherwise not really", "🔗"],
    ["Mit zweierlei Maß gemessen, oder sehe ich das falsch?", "measured with double standards, or am I wrong?", "🔗"],
    ["Mir ist aufgefallen, dass … Unterstellen will ich niemandem etwas.", "I noticed that … I don't mean to accuse anyone of anything", "🔗"],
  ],
  steps: [
    { t: "story", lines: [
      "Vier Sätze aus dem Thread, den Sie gerade gelesen haben.",
      "Keine Vokabeln — vier Züge, mit denen man Kritik äußert, ohne anzugreifen.",
    ] },

    { t: "notice", ex: "so_gemeint_war_es_nicht_angekommen_ist_es_so", sourceId: SOURCE_ID, w: 0 },
    { t: "notice", ex: "fuer_x_sehe_ich_das_ein_sonst_eigentlich_nicht", sourceId: SOURCE_ID, w: 1 },

    { t: "chunk_choose",
      situation: "Eine Ankündigung von Ihnen kam bei Ihrem Team ganz anders an, als Sie es gemeint hatten. Sie wollen das anerkennen, ohne die Entscheidung selbst zurückzunehmen.",
      q: "Wie reagieren Sie?",
      options: [
        "So gemeint war es sicher nicht, angekommen ist es trotzdem so.",
        "Für Notfälle sehe ich das ein — sonst eigentlich nicht.",
        "Mit zweierlei Maß gemessen, oder sehe ich das falsch?",
      ],
      answer: 0,
      exercises: ["so_gemeint_war_es_nicht_angekommen_ist_es_so"],
      explain: "A trennt Absicht und Wirkung — genau die Situation. B passt inhaltlich nicht: es geht nicht um eine Ausnahme. C würde eine Ungleichbehandlung unterstellen, die hier gar nicht das Thema ist." },

    { t: "notice", ex: "mit_zweierlei_mass_gemessen_oder_sehe_ich_das_falsch", sourceId: SOURCE_ID, w: 2 },
    { t: "notice", ex: "aufgefallen_unterstellen_will_ich_niemandem_etwas", sourceId: SOURCE_ID, w: 3 },

    { t: "chunk_choose",
      situation: "Ihnen ist aufgefallen, dass eine Regel bei einer Kollegin nie durchgesetzt wird, bei Ihnen aber schon. Sie wollen das ansprechen, ohne jemandem Absicht zu unterstellen.",
      q: "Wie sprechen Sie es an?",
      options: [
        "Mir ist aufgefallen, dass die Regel unterschiedlich gilt. Unterstellen will ich niemandem etwas.",
        "So gemeint war es sicher nicht.",
        "Für diesen Fall sehe ich das ein.",
      ],
      answer: 0,
      exercises: ["aufgefallen_unterstellen_will_ich_niemandem_etwas"],
      explain: "A markiert die Beobachtung als Beobachtung und schließt ausdrücklich eine Unterstellung aus — genau die Situation. B und C passen inhaltlich nicht: hier geht es nicht um eine Absicht-Wirkung-Trennung oder eine akzeptierte Ausnahme." },

    { t: "chunk_produce", ex: "mit_zweierlei_mass_gemessen_oder_sehe_ich_das_falsch", sourceId: SOURCE_ID,
      context: "Ihnen ist aufgefallen, dass eine Regel für zwei Gruppen unterschiedlich gilt. Sprechen Sie das an, ohne direkt anzugreifen.",
      hint: "Formulieren Sie es als Frage, nicht als Vorwurf." },

    { t: "chunk_produce", ex: "fuer_x_sehe_ich_das_ein_sonst_eigentlich_nicht", sourceId: SOURCE_ID,
      context: "Eine neue Regel gilt bei Ihnen sehr allgemein. Sie würden sie nur für einen bestimmten Ausnahmefall akzeptieren, sonst nicht.",
      hint: "Erst den akzeptierten Fall nennen, dann die allgemeine Ablehnung." },
  ],
};

const EXPERIENCES = [reading, vocabulary];

module.exports = { EXPERIENCES, SOURCE_ID };
