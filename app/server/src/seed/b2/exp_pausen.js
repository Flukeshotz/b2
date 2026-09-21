/**
 * Experiences derived from src_pausen. Original Skillcase content, same shape
 * as exp_homeoffice.js / exp_fortbildung.js / exp_ueberstunden.js.
 */

const SOURCE_ID = "src_pausen";

/* ── 1. READING ───────────────────────────────────────────────────────────── */
const reading = {
  id: "exp_pausen_read",
  kind: "reading",
  ord: 0,
  title: "Pausenregelung: feste Zeiten oder flexibel?",
  minutes: 11,
  primary_capability: "compare",
  secondary_capabilities: ["structure", "argue"],
  checks: [],
  teaches: [],
  steps: [
    { t: "story", lines: [
      "Ein Forum. Fünf Beiträge, vier Leute — die Frage: feste Pausenzeit für alle, oder soll das jeder selbst entscheiden?",
      "Lesen Sie den ganzen Thread einmal durch. Danach bleibt er offen: Sie dürfen jederzeit zurückblättern.",
    ] },

    { t: "read_source", sourceId: SOURCE_ID },

    { t: "readq", mode: "attribute", sourceId: SOURCE_ID,
      capability: "compare",
      q: "Wer erklärt, welches Problem die neue Regel eigentlich lösen sollte?",
      options: ["melanie", "oskar", "birgit", "tarek"],
      answer: 2,
      explain: "Birgit_Stationsleitung nennt den konkreten Grund für die Regel: dass sich vorher niemand traute zu gehen, wenn viel los war. Die anderen äußern nur ihre eigene Reaktion auf die Regel, nicht die ursprüngliche Absicht dahinter." },

    { t: "readq", mode: "attribute", sourceId: SOURCE_ID,
      capability: "compare",
      q: "Wer fragt gezielt nach, was ein vager Ausdruck eigentlich bedeutet?",
      options: ["melanie", "oskar", "birgit", "tarek"],
      answer: 3,
      explain: "Tarek M. fragt direkt: „Was genau meinen Sie mit ‚alle gleichzeitig weg‘?“ Die anderen äußern eigene Positionen, aber keiner bittet zuerst um eine Präzisierung." },

    { t: "readq", mode: "stance", sourceId: SOURCE_ID,
      capability: "argue",
      quote: "am Ende hat die Hälfte gar keine richtige Pause gemacht, sondern nur zwischendurch etwas gegessen",
      q: "Diese Aussage von Oskar_L — was ist sie?",
      options: [
        "Ein Beleg: er stützt sie mit einer nachprüfbaren Zahl.",
        "Eine Behauptung: sie klingt konkret, ist aber nicht belegt.",
        "Ein Zugeständnis: er gibt Melanies Position teilweise recht.",
      ],
      answer: 1,
      explain: "„Die Hälfte“ klingt wie eine Zahl, ist hier aber ein Eindruck ohne Quelle — niemand hat das gezählt. Das unterscheidet sich von Priyas oder Birgits Aussagen, die auf eine konkrete, benennbare Beobachtung verweisen." },

    { t: "readq", mode: "relation", sourceId: SOURCE_ID,
      capability: "structure",
      quote: "Was genau meinen Sie mit „alle gleichzeitig weg“?",
      q: "Tarek M. schreibt diese Frage direkt als Antwort auf Birgits Beitrag. Wie steht sie zu Birgits Erklärung?",
      options: [
        "Sie widerspricht Birgits Begründung insgesamt.",
        "Sie akzeptiert die Begründung, hinterfragt aber eine praktische Konsequenz davon.",
        "Sie bestätigt, dass die Regel gut funktioniert.",
        "Sie wiederholt Birgits Aussage mit anderen Worten.",
      ],
      answer: 1,
      explain: "Tarek stellt Birgits Motiv (niemand soll sich schuldig fühlen) nicht infrage — er fragt nach einer konkreten Folge, die daraus entstehen könnte: dass eine halbe Stunde niemand ansprechbar ist. Das ist ein Einwand gegen die Umsetzung, nicht gegen die Absicht." },

    { t: "readq", mode: "implication", sourceId: SOURCE_ID,
      capability: "compare",
      q: "Tareks Frage nach der Erreichbarkeit bleibt im Thread unbeantwortet. Was zeigt das über den eigentlichen Streitpunkt?",
      options: [
        "Dass Tarek die Regel grundsätzlich ablehnt.",
        "Dass eine wichtige praktische Frage bei der Einführung offenbar nicht geklärt wurde.",
        "Dass Birgit die Frage absichtlich ignoriert.",
      ],
      answer: 1,
      explain: "Melanies letzter Beitrag greift genau diese offene Frage auf, statt sie zu beantworten — ein Hinweis darauf, dass die Erreichbarkeit während der Pause tatsächlich nicht geregelt wurde, bevor die Regel eingeführt wurde." },

    { t: "readq", mode: "intention", sourceId: SOURCE_ID,
      capability: "compare",
      quote: "Mich stört gar nicht die feste Zeit an sich — mich stört, dass niemand gesagt hat, wie die Erreichbarkeit während der Pause geregelt ist.",
      q: "Warum schreibt Melanie T. das ganz am Ende?",
      options: [
        "Um zuzugeben, dass ihre erste Beschwerde übertrieben war.",
        "Um klarzustellen, dass sie nicht die feste Zeit ablehnt, sondern eine offene praktische Frage stellt.",
        "Um Oskar_L vorzuwerfen, dass er die Regel zu unkritisch sieht.",
        "Um vorzuschlagen, ganz auf Pausen zu verzichten.",
      ],
      answer: 1,
      explain: "Ihr erster Beitrag klingt wie eine grundsätzliche Ablehnung der festen Zeit. Am Ende wird klar: sie hätte damit kein Problem, wenn die Erreichbarkeit geregelt wäre. Wer nur ihren ersten Beitrag liest, hält sie für eine Gegnerin fester Pausenzeiten. Das ist sie nicht." },
  ],
};

/* ── 2. VOCABULARY ────────────────────────────────────────────────────────── */
const vocabulary = {
  id: "exp_pausen_chunks",
  kind: "vocabulary",
  ord: 1,
  title: "Vier Sätze für eine Regel, die man hinterfragt",
  minutes: 9,
  primary_capability: "argue",
  secondary_capabilities: ["concede", "structure", "justify"],
  checks: ["lexical_range"],
  teaches: [
    ["Von Ausnahmen wie X abgesehen, …", "except for cases like X, …", "🔗"],
    ["Was genau meinen Sie mit …?", "what exactly do you mean by …?", "🔗"],
    ["Mich stört gar nicht X an sich — mich stört, dass …", "it's not X itself that bothers me — what bothers me is that …", "🔗"],
    ["Ich habe die Regel eingeführt, weil …", "I introduced the rule because …", "🔗"],
  ],
  steps: [
    { t: "story", lines: [
      "Vier Sätze aus dem Thread, den Sie gerade gelesen haben.",
      "Keine Vokabeln — vier Züge, mit denen eine Regel diskutiert wird, ohne dass es zum Streit wird.",
    ] },

    { t: "notice", ex: "was_genau_meinen_sie_mit", sourceId: SOURCE_ID, w: 1 },
    { t: "notice", ex: "habe_die_regel_eingefuehrt_weil", sourceId: SOURCE_ID, w: 3 },

    { t: "chunk_choose",
      situation: "Eine Kollegin beschwert sich, dass eine neue Regel „alles komplizierter macht“. Der Ausdruck ist Ihnen zu vage, um sinnvoll zu antworten.",
      q: "Wie reagieren Sie zuerst?",
      options: [
        "Was genau meinen Sie mit „komplizierter“?",
        "Von Ausnahmen abgesehen finde ich die Regel gut.",
        "Ich habe die Regel eingeführt, weil es vorher Probleme gab.",
      ],
      answer: 0,
      exercises: ["was_genau_meinen_sie_mit"],
      explain: "A klärt zuerst, was genau gemeint ist, bevor irgendjemand widerspricht oder zustimmt. B setzt eine eigene Position voraus, die noch gar nicht begründet ist. C passt nur, wenn SIE die Regel eingeführt haben — hier ist das nicht der Fall." },

    { t: "notice", ex: "von_ausnahmen_abgesehen", sourceId: SOURCE_ID, w: 0 },
    { t: "notice", ex: "stoert_gar_nicht_an_sich_sondern", sourceId: SOURCE_ID, w: 2 },

    { t: "chunk_choose",
      situation: "Eine neue Kleiderordnung wurde eingeführt. Sie finden die Regel eigentlich sinnvoll — nur bei einem einzigen Punkt, der medizinisch begründet ist, sollte es eine Ausnahme geben.",
      q: "Wie sagen Sie das?",
      options: [
        "Von Ausnahmen wie medizinischen Gründen abgesehen, finde ich die Regel sinnvoll.",
        "Mich stört die Regel an sich — sie ist einfach unnötig.",
        "Was genau meinen Sie mit „Kleiderordnung“?",
      ],
      answer: 0,
      exercises: ["von_ausnahmen_abgesehen"],
      explain: "A benennt die eine Ausnahme und stimmt der Regel im Übrigen zu — genau Ihre Position. B behauptet das Gegenteil von dem, was Sie sagen wollen. C ist hier unpassend, weil der Begriff nicht unklar ist." },

    { t: "chunk_produce", ex: "stoert_gar_nicht_an_sich_sondern", sourceId: SOURCE_ID,
      context: "Eine neue Regel bei Ihnen ist grundsätzlich in Ordnung — was Sie stört, ist ein einzelnes ungeklärtes Detail dabei. Schreiben Sie, worum es Ihnen wirklich geht.",
      hint: "Erst ausschließen, was Sie nicht stört — dann das konkrete Detail benennen." },

    { t: "chunk_produce", ex: "habe_die_regel_eingefuehrt_weil", sourceId: SOURCE_ID,
      context: "Sie haben selbst einmal eine unbeliebte Regel eingeführt oder vorgeschlagen. Erklären Sie, welches Problem sie lösen sollte.",
      hint: "Nennen Sie das konkrete Problem, nicht nur, dass die Regel nötig war." },
  ],
};

const EXPERIENCES = [reading, vocabulary];

module.exports = { EXPERIENCES, SOURCE_ID };
