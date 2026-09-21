/**
 * Experiences derived from src_teambesprechung. Original Skillcase content,
 * same shape as the earlier sources in this series.
 */

const SOURCE_ID = "src_teambesprechung";

/* ── 1. READING ───────────────────────────────────────────────────────────── */
const reading = {
  id: "exp_teambesprechung_read",
  kind: "reading",
  ord: 0,
  title: "Digitale Teambesprechungen: sinnvoll oder Zeitverschwendung?",
  minutes: 11,
  primary_capability: "compare",
  secondary_capabilities: ["structure", "argue"],
  checks: [],
  teaches: [],
  steps: [
    { t: "story", lines: [
      "Ein Forum. Fünf Beiträge, vier Leute — die Frage: sollten Teambesprechungen digital bleiben, obwohl alle im selben Gebäude arbeiten?",
      "Lesen Sie den ganzen Thread einmal durch. Danach bleibt er offen: Sie dürfen jederzeit zurückblättern.",
    ] },

    { t: "read_source", sourceId: SOURCE_ID },

    { t: "readq", mode: "attribute", sourceId: SOURCE_ID,
      capability: "compare",
      q: "Wer stützt eine Beobachtung mit einer konkreten, wenn auch ungefähren Zahl?",
      options: ["simone", "bernd", "walter", "yara"],
      answer: 3,
      explain: "Yara_P nennt eine ungefähre Zahl — „von den letzten zehn Besprechungen war ungefähr die Hälfte reine Information“ —, um ihre Beobachtung zu stützen. Die anderen äußern Eindrücke ohne Zahlen." },

    { t: "readq", mode: "attribute", sourceId: SOURCE_ID,
      capability: "compare",
      q: "Wer erklärt, warum das digitale Format ursprünglich eingeführt wurde?",
      options: ["simone", "bernd", "walter", "yara"],
      answer: 2,
      explain: "Walter_L erklärt den ursprünglichen Grund — eine Phase im Homeoffice — und räumt ein, dass sich das Format seitdem unhinterfragt fortgesetzt hat. Die anderen sprechen über den heutigen Nutzen, nicht über die Entstehung." },

    { t: "readq", mode: "stance", sourceId: SOURCE_ID,
      capability: "argue",
      quote: "Ich vermute, dass es eher daran liegt, dass sich digital niemand die Zeit nimmt, einen Raum zu buchen",
      q: "Was macht Bernd_T mit dieser Aussage?",
      options: [
        "Er behauptet mit Sicherheit, warum digitale Treffen bevorzugt werden.",
        "Er bietet eine mögliche Erklärung an, markiert sie aber ausdrücklich als Vermutung.",
        "Er zitiert eine offizielle Begründung des Betriebs.",
      ],
      answer: 1,
      explain: "„Ich vermute“ markiert die Aussage ausdrücklich als Annahme, nicht als gesicherte Tatsache — anders als etwa Yaras Beobachtung, die auf einer tatsächlichen Zählung beruht." },

    { t: "readq", mode: "relation", sourceId: SOURCE_ID,
      capability: "structure",
      quote: "für längere Diskussionen nicht mehr",
      q: "Wie steht dieser Teil zu „Für kurze Absprachen funktioniert digital eigentlich ganz gut“ davor?",
      options: [
        "Er widerspricht der ersten Aussage vollständig.",
        "Er grenzt die erste Aussage auf einen bestimmten Fall ein, ohne sie zu widerlegen.",
        "Er wiederholt die erste Aussage mit anderen Worten.",
        "Er wechselt zu einem völlig neuen Thema.",
      ],
      answer: 1,
      explain: "Bernd bestreitet nicht, dass digitale Treffen für kurze Absprachen funktionieren — er zieht nur eine Grenze, ab der es seiner Meinung nach nicht mehr funktioniert. Beide Teile ergänzen sich zu einer differenzierten Position." },

    { t: "readq", mode: "implication", sourceId: SOURCE_ID,
      capability: "compare",
      q: "Walter schreibt, ihm sei erst kürzlich selbst aufgefallen, dass niemand das Format neu entschieden hat. Was zeigt das über die Entstehung der aktuellen Praxis?",
      options: [
        "Dass die Praxis bewusst und sorgfältig geplant wurde.",
        "Dass sich eine ursprünglich befristete Lösung ohne erneute Entscheidung zur Dauerpraxis entwickelt hat.",
        "Dass Walter die Entscheidung absichtlich geheim gehalten hat.",
      ],
      answer: 1,
      explain: "Eine Regelung, die „einfach so weiterläuft, ohne dass es jemand neu entschieden hat“, ist typisch für Gewohnheiten, die nie bewusst überprüft wurden — nicht für eine geplante, dauerhafte Entscheidung." },

    { t: "readq", mode: "intention", sourceId: SOURCE_ID,
      capability: "compare",
      quote: "Mich stört gar nicht das digitale Format an sich — mich stört, dass wir nie unterscheiden, wofür es passt und wofür nicht.",
      q: "Warum schreibt Simone_K das ganz am Ende?",
      options: [
        "Um zuzugeben, dass ihre erste Frage überflüssig war.",
        "Um klarzustellen, dass ihr eigentliches Anliegen eine differenzierte Nutzung ist, nicht die Abschaffung des digitalen Formats.",
        "Um Bernd_T vorzuwerfen, dass er zu unentschlossen ist.",
        "Um vorzuschlagen, komplett zu Präsenztreffen zurückzukehren.",
      ],
      answer: 1,
      explain: "Ihr erster Beitrag klingt wie eine grundsätzliche Infragestellung des digitalen Formats. Am Ende zeigt sich: sie will keine Abschaffung, sondern eine bewusste Unterscheidung — genau Yaras und Bernds Punkte zusammengeführt. Wer nur ihren ersten Beitrag liest, hält sie für eine Gegnerin digitaler Treffen. Das ist sie nicht." },
  ],
};

/* ── 2. VOCABULARY ────────────────────────────────────────────────────────── */
const vocabulary = {
  id: "exp_teambesprechung_chunks",
  kind: "vocabulary",
  ord: 1,
  title: "Vier Sätze, um Situationen statt Prinzipien zu unterscheiden",
  minutes: 9,
  primary_capability: "argue",
  secondary_capabilities: ["structure", "justify"],
  checks: ["lexical_range"],
  teaches: [
    ["Für X funktioniert das, für Y nicht mehr.", "for X that works, for Y it doesn't anymore", "🔗"],
    ["Ich vermute, dass es eher daran liegt, dass …", "I suspect it's actually more because …", "🔗"],
    ["Warum nicht beides kombinieren, je nach Anlass?", "why not combine both, depending on the occasion?", "🔗"],
    ["Von den letzten X war ungefähr die Hälfte …", "of the last X, about half were …", "🔗"],
  ],
  steps: [
    { t: "story", lines: [
      "Vier Sätze aus dem Thread, den Sie gerade gelesen haben.",
      "Keine Vokabeln — vier Züge, mit denen man eine Entweder-oder-Frage auflöst.",
    ] },

    { t: "notice", ex: "fuer_x_funktioniert_das_fuer_y_nicht_mehr", sourceId: SOURCE_ID, w: 0 },
    { t: "notice", ex: "warum_nicht_beides_kombinieren_je_nach_anlass", sourceId: SOURCE_ID, w: 2 },

    { t: "chunk_choose",
      situation: "Zwei Kollegen streiten, ob Absprachen schriftlich per Chat oder mündlich am Telefon laufen sollten. Sie glauben, beides hat seinen Platz, je nach Situation.",
      q: "Wie lösen Sie den Streit auf?",
      options: [
        "Warum nicht beides kombinieren, je nach Anlass?",
        "Für kurze Absprachen funktioniert das eine, für lange das andere nicht mehr.",
        "Ich vermute, dass es eher daran liegt, dass niemand sich festlegen will.",
      ],
      answer: 0,
      exercises: ["warum_nicht_beides_kombinieren_je_nach_anlass"],
      explain: "A schlägt direkt die situative Lösung vor — genau Ihre Position. B zieht zwar auch eine Grenze, klingt aber wie eine Bewertung statt eines Vorschlags. C äußert nur eine Vermutung über die Ursache des Streits, keine Lösung." },

    { t: "notice", ex: "ich_vermute_dass_es_eher_daran_liegt_dass", sourceId: SOURCE_ID, w: 1 },
    { t: "notice", ex: "von_den_letzten_x_war_ungefaehr_die_haelfte", sourceId: SOURCE_ID, w: 3 },

    { t: "chunk_choose",
      situation: "Sie haben den Eindruck, dass viele Ihrer Besprechungen eigentlich unnötig sind — aber Sie haben nicht genau mitgezählt. Sie wollen Ihre Beobachtung trotzdem mit etwas Konkretem stützen.",
      q: "Wie formulieren Sie das?",
      options: [
        "Von den letzten acht Besprechungen war ungefähr die Hälfte reine Information.",
        "Warum nicht beides kombinieren, je nach Anlass?",
        "Für kurze Absprachen funktioniert das, für lange nicht mehr.",
      ],
      answer: 0,
      exercises: ["von_den_letzten_x_war_ungefaehr_die_haelfte"],
      explain: "A stützt die Beobachtung mit einer ungefähren Zahl, ohne eine exakte Statistik vorzutäuschen — genau die Situation. B und C sind Vorschläge bzw. Unterscheidungen, aber keine Beobachtung mit Zahl." },

    { t: "chunk_produce", ex: "ich_vermute_dass_es_eher_daran_liegt_dass", sourceId: SOURCE_ID,
      context: "Ein Kollege verhält sich auf eine bestimmte Art, und Sie haben eine Vermutung über den wahren Grund, sind sich aber nicht sicher.",
      hint: "Markieren Sie die Erklärung ausdrücklich als Vermutung." },

    { t: "chunk_produce", ex: "fuer_x_funktioniert_das_fuer_y_nicht_mehr", sourceId: SOURCE_ID,
      context: "Eine Arbeitsweise funktioniert bei Ihnen in einer Situation gut, in einer anderen nicht mehr. Ziehen Sie die Grenze.",
      hint: "Erst die Situation, in der es funktioniert, dann die, in der nicht." },
  ],
};

const EXPERIENCES = [reading, vocabulary];

module.exports = { EXPERIENCES, SOURCE_ID };
