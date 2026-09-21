/**
 * Experiences derived from src_fortbildung. Original Skillcase content, same
 * five task modes as exp_homeoffice.js — see that file's header for why each
 * mode exists. Reading and vocabulary only: no writing/grammar experience is
 * shipped here yet, so this source is not claimed as a full four-experience
 * set the way src_homeoffice is.
 */

const SOURCE_ID = "src_fortbildung";

/* ── 1. READING ───────────────────────────────────────────────────────────── */
const reading = {
  id: "exp_fortbildung_read",
  kind: "reading",
  ord: 0,
  title: "Pflichtfortbildungen: Arbeitszeit oder Freizeit?",
  minutes: 11,
  primary_capability: "compare",
  secondary_capabilities: ["structure", "argue"],
  checks: [],
  teaches: [],
  steps: [
    { t: "story", lines: [
      "Ein Forum. Fünf Beiträge, vier Leute — die Frage: zählt eine Pflichtfortbildung nach Dienstschluss als Arbeitszeit?",
      "Lesen Sie den ganzen Thread einmal durch. Danach bleibt er offen: Sie dürfen jederzeit zurückblättern.",
    ] },

    { t: "read_source", sourceId: SOURCE_ID },

    { t: "readq", mode: "attribute", sourceId: SOURCE_ID,
      capability: "compare",
      q: "Wer schlägt eine konkrete Lösung vor, die anderswo schon funktioniert?",
      options: ["nina", "jonas", "wagner", "priya"],
      answer: 3,
      explain: "Priya S. beschreibt keine Idee, sondern ein bestehendes Verfahren: die Fortbildungszeit wird separat erfasst und im Folgemonat als Freizeit ausgeglichen — bei ihr im Betrieb bereits Praxis. Die anderen beschreiben nur die eigene Situation oder das eigene Problem." },

    { t: "readq", mode: "attribute", sourceId: SOURCE_ID,
      capability: "compare",
      q: "Wer erklärt eine organisatorische Einschränkung, ohne sich für die Regel zu entschuldigen?",
      options: ["nina", "jonas", "wagner", "priya"],
      answer: 2,
      explain: "Stationsleitung Wagner nennt zwei konkrete Zwänge — das zentral vergebene Budget und die Personallage — und erklärt damit, warum es so ist, ohne zu sagen, dass es richtig oder falsch ist. Jonas_P äußert dagegen nur eine allgemeine Haltung ohne Begründung." },

    { t: "readq", mode: "stance", sourceId: SOURCE_ID,
      capability: "argue",
      quote: "Bei uns ist das schon immer so gelaufen.",
      q: "Dieser Satz von Jonas_P — was ist er?",
      options: [
        "Ein Beleg: er stützt seine Position mit etwas Nachprüfbarem.",
        "Eine Behauptung: sie klingt wie eine Erklärung, ist aber keine.",
        "Ein Zugeständnis: er gibt der Gegenseite teilweise recht.",
      ],
      answer: 1,
      explain: "„Schon immer so“ erklärt nichts — es sagt nur, dass etwas nicht neu ist, nicht, warum es richtig ist. Stationsleitung Wagner macht es an anderer Stelle anders: sie nennt echte Gründe, die man prüfen kann." },

    { t: "readq", mode: "relation", sourceId: SOURCE_ID,
      capability: "structure",
      quote: "nur folgt daraus doch nicht automatisch, dass die Zeit unbezahlt bleibt.",
      q: "Priya S. schreibt zuerst: „Das leuchtet mir ein.“ Wie steht der Satz danach zu diesem ersten Satz?",
      options: [
        "Er widerspricht ihm: sie hält Wagners Erklärung doch für falsch.",
        "Er belegt ihn mit einem Beispiel aus ihrer Firma.",
        "Er lässt ihn gelten und bestreitet nur, was daraus folgen soll.",
        "Er wiederholt ihn mit anderen Worten.",
      ],
      answer: 2,
      explain: "„Das leuchtet mir ein“ akzeptiert Wagners Erklärung vollständig. „Nur folgt daraus doch nicht automatisch …“ greift danach nicht die Erklärung an, sondern nur den Schluss, den man daraus ziehen könnte. Das Beispiel aus ihrer Firma kommt erst im nächsten Satz — es stützt ihren eigenen Vorschlag, nicht diesen." },

    { t: "readq", mode: "implication", sourceId: SOURCE_ID,
      capability: "compare",
      q: "Priya S. erwähnt, dass sich bei ihrer eigenen Regelung seitdem niemand mehr beschwert hat. Was folgt daraus für ihren Vorschlag?",
      options: [
        "Ihre Kollegen nehmen das Problem einfach nicht ernst.",
        "Der Vorschlag ist nicht nur denkbar, sondern in der Praxis bereits erprobt.",
        "Die Regelung wurde inzwischen wieder abgeschafft.",
      ],
      answer: 1,
      explain: "Ein Detail, das beiläufig klingt, aber etwas Wichtiges belegt: die Lösung ist keine Theorie, sondern läuft bei ihr im Betrieb bereits — und funktioniert offenbar gut genug, dass niemand mehr Anlass zur Beschwerde sieht." },

    { t: "readq", mode: "intention", sourceId: SOURCE_ID,
      capability: "compare",
      quote: "Hätte man uns vorher gefragt, dann wäre vermutlich sofort eine Lösung wie Priyas dabei herausgekommen, und wir würden jetzt nicht darüber streiten.",
      q: "Warum schreibt Nina K. das ganz am Ende?",
      options: [
        "Um zuzugeben, dass ihre erste Beschwerde unberechtigt war.",
        "Um klarzustellen, dass sie nicht die Fortbildung ablehnt, sondern wie darüber entschieden wurde.",
        "Um Jonas_P vorzuwerfen, dass er sich zu wenig einsetzt.",
        "Um vorzuschlagen, die Fortbildungen ganz abzuschaffen.",
      ],
      answer: 1,
      explain: "Sie sagt es selbst im Satz davor: „Mich stört ehrlich gesagt weniger die Fortbildung selbst … als der Umstand, dass niemand vorher gefragt hat.“ Wer nur ihren ersten Beitrag liest, hält sie für eine Gegnerin der Fortbildungspflicht. Sie ist es nicht — sie ist eine Gegnerin des Verfahrens, mit dem darüber entschieden wurde." },
  ],
};

/* ── 2. VOCABULARY ────────────────────────────────────────────────────────
   Same NOTICE → CHOOSE → PRODUCE shape as chunks_homeoffice's experience —
   see exp_homeoffice.js's header for the reasoning behind each step type. */
const vocabulary = {
  id: "exp_fortbildung_chunks",
  kind: "vocabulary",
  ord: 1,
  title: "Fünf Sätze, mit denen man einen Streit entschärft",
  minutes: 9,
  primary_capability: "argue",
  secondary_capabilities: ["concede", "justify", "structure"],
  checks: ["lexical_range"],
  teaches: [
    ["Wenn ich Sie richtig verstehe, …", "if I understand you correctly, …", "🔗"],
    ["Nur folgt daraus doch nicht automatisch, dass …", "but it doesn't automatically follow that …", "🔗"],
    ["Mich stört weniger X als Y", "what actually bothers me is less X than Y", "🔗"],
    ["Hätte man uns vorher gefragt, dann wäre …", "if we had been asked first, then … would have", "🔗"],
    ["Ich verstehe den Unmut, aber …", "I understand the frustration, but …", "🔗"],
  ],
  steps: [
    { t: "story", lines: [
      "Fünf Sätze aus dem Thread, den Sie gerade gelesen haben.",
      "Keine Vokabeln — fünf Züge, mit denen ein Streit sachlich bleibt.",
    ] },

    { t: "notice", ex: "wenn_ich_sie_richtig_verstehe", sourceId: SOURCE_ID, w: 0 },
    { t: "notice", ex: "ich_verstehe_den_unmut_aber", sourceId: SOURCE_ID, w: 4 },

    { t: "chunk_choose",
      situation: "Ein Kollege beschwert sich lautstark über eine neue Regel. Sie können daran nichts ändern, wollen aber auch nicht so klingen, als fänden Sie die Beschwerde unwichtig.",
      q: "Wie reagieren Sie zuerst?",
      options: [
        "Ich verstehe den Unmut, aber ich kann daran leider nichts ändern.",
        "Wenn ich Sie richtig verstehe, ist das Problem also die Besetzung.",
        "Nur folgt daraus doch nicht automatisch, dass Sie recht haben.",
      ],
      answer: 0,
      exercises: ["ich_verstehe_den_unmut_aber"],
      explain: "A erkennt das Gefühl an, ohne der Forderung zuzustimmen — genau das brauchen Sie hier. B passt nicht, weil noch niemand etwas erklärt hat, das Sie zusammenfassen könnten. C wirkt schroff, bevor überhaupt ein Argument genannt wurde." },

    { t: "notice", ex: "folgt_daraus_nicht_automatisch", sourceId: SOURCE_ID, w: 1 },

    { t: "chunk_choose",
      situation: "Eine Kollegin sagt: „Die Patientenzahlen sind diesen Monat höher als sonst.“ Das stimmt zweifellos. Trotzdem widersprechen Sie ihrer Idee, deshalb sofort mehr Personal anzufordern.",
      q: "Wie widersprechen Sie, ohne die Zahl selbst zu bestreiten?",
      options: [
        "Das sehe ich anders — die Zahlen sind gar nicht so hoch.",
        "Nur folgt daraus doch nicht automatisch, dass wir sofort mehr Personal brauchen.",
        "Wenn ich Sie richtig verstehe, sind die Zahlen also höher.",
      ],
      answer: 1,
      exercises: ["folgt_daraus_nicht_automatisch"],
      explain: "B lässt die Zahl vollständig stehen und bestreitet nur den Schluss, den sie daraus zieht — das lässt ihr nichts zum Verteidigen, weil Sie ihr nichts weggenommen haben. A bestreitet die Tatsache selbst, die Sie gar nicht bezweifeln. C ist nur eine Zusammenfassung, kein Einwand." },

    { t: "notice", ex: "stoert_mich_weniger_als", sourceId: SOURCE_ID, w: 2 },
    { t: "notice", ex: "haette_man_uns_gefragt", sourceId: SOURCE_ID, w: 3 },

    { t: "chunk_choose",
      situation: "Ein neuer Dienstplan wurde ohne Rücksprache mit dem Team eingeführt. Sie sind mit dem Ergebnis eigentlich einverstanden — es stört Sie nur, dass niemand vorher gefragt hat.",
      q: "Wie sagen Sie, worum es Ihnen wirklich geht?",
      options: [
        "Ich bin mit dem neuen Plan überhaupt nicht einverstanden.",
        "Mich stört weniger der Plan selbst als die Art, wie er zustande kam.",
        "Begründet wird das mit der Personallage.",
      ],
      answer: 1,
      exercises: ["stoert_mich_weniger_als"],
      explain: "Sie ordnen zwei mögliche Ärgernisse: der Plan selbst ist in Ordnung, das Verfahren nicht. A behauptet das Gegenteil von dem, was Sie eigentlich sagen wollen. C gibt nur eine fremde Begründung wieder, ohne Ihre eigene Position zu nennen." },

    { t: "chunk_produce", ex: "folgt_daraus_nicht_automatisch", sourceId: SOURCE_ID,
      context: "Jemand sagt Ihnen: „Die Nachfrage nach Spätschichten ist gestiegen.“ Nehmen Sie an, das stimmt. Widersprechen Sie trotzdem dem Schluss, den die Person daraus zieht.",
      hint: "Die Tatsache stehen lassen, nur den Schluss angreifen. Was soll daraus angeblich folgen — und warum folgt es nicht automatisch?" },

    { t: "chunk_produce", ex: "haette_man_uns_gefragt", sourceId: SOURCE_ID,
      context: "Bei Ihnen wurde einmal etwas entschieden, ohne dass man Sie vorher gefragt hat. Schreiben Sie, was anders gewesen wäre, wenn man es getan hätte.",
      hint: "Zwei Hälften im Konjunktiv II: die Bedingung, die fehlte — und die Folge, die deshalb nicht eintrat." },
  ],
};

const EXPERIENCES = [reading, vocabulary];

module.exports = { EXPERIENCES, SOURCE_ID };
