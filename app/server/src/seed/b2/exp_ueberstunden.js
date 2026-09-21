/**
 * Experiences derived from src_ueberstunden. Original Skillcase content, same
 * shape as exp_homeoffice.js / exp_fortbildung.js.
 */

const SOURCE_ID = "src_ueberstunden";

/* ── 1. READING ───────────────────────────────────────────────────────────── */
const reading = {
  id: "exp_ueberstunden_read",
  kind: "reading",
  ord: 0,
  title: "Überstunden: auszahlen oder abbauen?",
  minutes: 11,
  primary_capability: "compare",
  secondary_capabilities: ["structure", "argue"],
  checks: [],
  teaches: [],
  steps: [
    { t: "story", lines: [
      "Ein Forum. Fünf Beiträge, vier Leute — die Frage: Überstunden auszahlen oder als freie Zeit nehmen?",
      "Lesen Sie den ganzen Thread einmal durch. Danach bleibt er offen: Sie dürfen jederzeit zurückblättern.",
    ] },

    { t: "read_source", sourceId: SOURCE_ID },

    { t: "readq", mode: "attribute", sourceId: SOURCE_ID,
      capability: "compare",
      q: "Wer erklärt eine Regel mit einer wirtschaftlichen Überlegung, nicht mit einer persönlichen Meinung?",
      options: ["leon", "franzi", "dennis", "priya2"],
      answer: 2,
      explain: "Dennis K. nennt einen konkreten wirtschaftlichen Grund — Auszahlung ist für den Betrieb meist teurer — und macht daraus keine persönliche Überzeugung, sondern eine Kalkulation. Franzi_R äußert dagegen eine persönliche Einschätzung, kein Rechenmodell." },

    { t: "readq", mode: "attribute", sourceId: SOURCE_ID,
      capability: "compare",
      q: "Wer beschreibt eine Lösung, die bei ihr schon eingeführt wurde und funktioniert?",
      options: ["leon", "franzi", "dennis", "priya2"],
      answer: 3,
      explain: "Priya S. berichtet von einer bereits bestehenden Regelung — individuelle Wahl zwischen Auszahlung und Freizeit — und nennt sogar, dass die Kosten kaum gestiegen sind. Die anderen beschreiben nur die jeweils eigene, unveränderte Situation." },

    { t: "readq", mode: "stance", sourceId: SOURCE_ID,
      capability: "argue",
      quote: "Am Ende des Jahres hat kaum noch jemand das Gefühl, dass sich die Mehrarbeit gelohnt hat.",
      q: "Dieser Satz von Franzi_R — was ist er?",
      options: [
        "Ein Beleg: er stützt ihre Position mit einer nachprüfbaren Zahl.",
        "Eine Behauptung: sie klingt plausibel, ist aber nicht belegt.",
        "Ein Zugeständnis: sie gibt Leon B. teilweise recht.",
      ],
      answer: 1,
      explain: "„Kaum noch jemand“ ist ein Eindruck, keine Zahl — es klingt überzeugend, ist aber nicht überprüfbar. Priya S. macht es an anderer Stelle anders: sie nennt eine tatsächliche Beobachtung aus ihrem Betrieb." },

    { t: "readq", mode: "relation", sourceId: SOURCE_ID,
      capability: "structure",
      quote: "Ist das wirklich so eindeutig?",
      q: "Priya S. schreibt zuerst: „Das mag für die Kalkulation gelten, für die Beschäftigten aber nicht unbedingt.“ Wie steht die Frage danach zu diesem Satz?",
      options: [
        "Sie widerspricht dem Satz davor.",
        "Sie belegt ihn mit einem Beispiel.",
        "Sie bekräftigt den Zweifel, den der Satz davor schon eingeführt hat.",
        "Sie wiederholt ihn mit anderen Worten.",
      ],
      answer: 2,
      explain: "Der erste Satz grenzt Dennis' Erklärung bereits ein. Die Frage danach verstärkt genau diesen Zweifel, ohne neue Information zu liefern — erst im nächsten Satz kommt das Beispiel aus ihrem Betrieb." },

    { t: "readq", mode: "implication", sourceId: SOURCE_ID,
      capability: "compare",
      q: "Priya S. erwähnt, dass die Kosten bei ihrer Regelung kaum gestiegen sind. Was folgt daraus für Dennis' Argument?",
      options: [
        "Dass Dennis' Zahlen grundsätzlich falsch sind.",
        "Dass die wirtschaftliche Begründung nicht zwingend gegen Wahlfreiheit spricht.",
        "Dass ihr Betrieb generell mehr Geld zur Verfügung hat.",
      ],
      answer: 1,
      explain: "Dennis begründet den Freizeitausgleich mit Kosten. Priyas Beispiel zeigt, dass Wahlfreiheit nicht automatisch teurer sein muss — sein Argument gilt also nicht zwingend gegen jede Alternative, auch wenn es für seine eigene Situation stimmen mag." },

    { t: "readq", mode: "intention", sourceId: SOURCE_ID,
      capability: "compare",
      quote: "Mich stört gar nicht so sehr der Freizeitausgleich an sich — mich stört, dass niemand gefragt wurde, was zu wem passt.",
      q: "Warum schreibt Leon B. das ganz am Ende?",
      options: [
        "Um zuzugeben, dass seine erste Forderung falsch war.",
        "Um klarzustellen, dass er nicht die Auszahlung fordert, sondern Wahlfreiheit.",
        "Um Dennis K. vorzuwerfen, dass er zu wenig rechnet.",
        "Um vorzuschlagen, Überstunden ganz abzuschaffen.",
      ],
      answer: 1,
      explain: "Sein erster Beitrag klingt wie eine klare Forderung nach Auszahlung. Am Ende zeigt sich: er will keine neue Einheitsregel, sondern Wahlfreiheit — genau das, was Priyas Beispiel schon zeigt. Wer nur seinen ersten Beitrag liest, hält ihn für einen Gegner des Freizeitausgleichs. Das ist er nicht." },
  ],
};

/* ── 2. VOCABULARY ────────────────────────────────────────────────────────── */
const vocabulary = {
  id: "exp_ueberstunden_chunks",
  kind: "vocabulary",
  ord: 1,
  title: "Vier Sätze, mit denen man eine Verallgemeinerung eingrenzt",
  minutes: 9,
  primary_capability: "argue",
  secondary_capabilities: ["concede", "structure"],
  checks: ["lexical_range"],
  teaches: [
    ["Das mag für X gelten, für Y aber nicht.", "that may be true for X, but not for Y", "🔗"],
    ["Ist das wirklich so eindeutig?", "is that really so clear-cut?", "🔗"],
    ["Denkbar wäre doch, …", "one could imagine …", "🔗"],
    ["Das ist keine böse Absicht, sondern …", "that's not malicious intent, it's just …", "🔗"],
  ],
  steps: [
    { t: "story", lines: [
      "Vier Sätze aus dem Thread, den Sie gerade gelesen haben.",
      "Keine Vokabeln — vier Züge, mit denen man widerspricht, ohne zu verallgemeinern.",
    ] },

    { t: "notice", ex: "keine_boese_absicht_sondern", sourceId: SOURCE_ID, w: 3 },
    { t: "notice", ex: "mag_fuer_x_gelten_fuer_y_nicht", sourceId: SOURCE_ID, w: 0 },

    { t: "chunk_choose",
      situation: "Ihr Vorgesetzter hat eine unbeliebte Regel eingeführt. Ein Kollege unterstellt ihm böse Absicht. Sie glauben eher an einen anderen Grund, ohne die Regel selbst zu verteidigen.",
      q: "Wie widersprechen Sie der Unterstellung?",
      options: [
        "Das ist keine böse Absicht, sondern vermutlich einfach Zeitdruck.",
        "Das mag für ihn gelten, für uns aber nicht.",
        "Ist das wirklich so eindeutig?",
      ],
      answer: 0,
      exercises: ["keine_boese_absicht_sondern"],
      explain: "A erklärt eine plausible andere Ursache, ohne die Regel selbst gutzuheißen — genau das brauchen Sie hier. B passt inhaltlich nicht: es geht nicht um eine Verallgemeinerung. C fragt nur nach, ohne der Unterstellung eine Erklärung entgegenzusetzen." },

    { t: "notice", ex: "ist_das_wirklich_so_eindeutig", sourceId: SOURCE_ID, w: 1 },
    { t: "notice", ex: "denkbar_waere_doch", sourceId: SOURCE_ID, w: 2 },

    { t: "chunk_choose",
      situation: "Ein Kollege sagt: „Frühdienst ist für alle am anstrengendsten.“ Für Sie persönlich stimmt das nicht — Sie kommen mit Frühdienst gut zurecht, mit Spätdienst weniger.",
      q: "Wie widersprechen Sie, ohne seine Erfahrung zu bestreiten?",
      options: [
        "Das mag für dich gelten, für mich aber nicht.",
        "Das ist keine böse Absicht, sondern eine ehrliche Einschätzung.",
        "Denkbar wäre doch, den Frühdienst ganz abzuschaffen.",
      ],
      answer: 0,
      exercises: ["mag_fuer_x_gelten_fuer_y_nicht"],
      explain: "A lässt seine Erfahrung vollständig gelten und grenzt nur die Reichweite auf Sie selbst ein — das ist genau die Situation. B passt nicht: niemand hat ihm etwas Böses unterstellt. C schlägt eine Lösung vor, die hier gar nicht gefragt ist." },

    { t: "chunk_produce", ex: "denkbar_waere_doch", sourceId: SOURCE_ID,
      context: "In Ihrem Team gibt es eine starre Regel, die nicht für jeden gleich gut passt. Schlagen Sie eine flexiblere Alternative vor, ohne sie zu fordern.",
      hint: "Der Konjunktiv macht aus der Forderung einen Vorschlag zur Diskussion." },

    { t: "chunk_produce", ex: "ist_das_wirklich_so_eindeutig", sourceId: SOURCE_ID,
      context: "Jemand stellt eine Erklärung als völlig sicher dar. Sie sind nicht überzeugt. Fragen Sie höflich nach, statt zu widersprechen.",
      hint: "Eine Frage, keine Gegenbehauptung." },
  ],
};

const EXPERIENCES = [reading, vocabulary];

module.exports = { EXPERIENCES, SOURCE_ID };
