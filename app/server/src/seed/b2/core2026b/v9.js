/**
 * core-2026b-v9 — SEED DATA. Same rules as v1.js and the versions before it.
 *
 * THEME: Mitarbeitergespräch und Zielvereinbarung — an annual review, and
 * whether a goal set by the manager can also be the employee's own.
 */

const KONTEXT = "Kontext B2 Kursbuch";
const ASPEKTE = "Aspekte neu B2 Lehrbuch";

const PROV = {
  source_type: "INSPIRED", source_book: KONTEXT, source_chapter: "11",
  source_module: "M1", source_page: "150", adaptation_status: "NOT_APPLICABLE",
};

const READING = {
  module: "lesen",
  title: "Forum: Das Jahresgespräch — Pflichttermin oder Chance?",
  instruction: "Lesen Sie den Forumsbeitrag und beantworten Sie die Fragen.",
  passage: `Jedes Jahr im Herbst steht bei uns das Mitarbeitergespräch an. Lange habe ich es
als Pflichttermin gesehen: Man sitzt eine Stunde zusammen, füllt ein Formular aus,
und die Ziele fürs nächste Jahr stehen ohnehin schon fest, bevor man etwas sagt.

Dieses Jahr habe ich mich zum ersten Mal vorbereitet. Ich habe aufgeschrieben, was
im letzten Jahr gut lief, wo ich Unterstützung gebraucht hätte und welches Ziel mich
selbst interessiert. Das Ergebnis hat mich überrascht: Von den drei Zielen, die wir
vereinbart haben, stammen zwei aus meinem eigenen Vorschlag.

Mir ist dabei klar geworden, dass die Ziele früher nicht deshalb von oben kamen,
weil meine Meinung nicht zählte, sondern weil ich nie eine eingebracht hatte. Meine
Vorgesetzte hat das im Gespräch sogar offen angesprochen.

Was mich weiterhin stört, ist der Abstand: Ein Gespräch pro Jahr ist zu wenig, um
Ziele wirklich nachzuhalten. Im Frühjahr weiß oft niemand mehr genau, was vereinbart
wurde.

Abschaffen würde ich das Gespräch deshalb trotzdem nicht.`,
  items: [
    { slot: "R1", item_type: "MCQ",
      stem: "Wie beurteilt die Autorin das Mitarbeitergespräch am Ende?",
      options: ["Sie hält es weiterhin für einen reinen Pflichttermin.",
                "Sie sieht es jetzt als Chance, kritisiert aber den großen zeitlichen Abstand.",
                "Sie findet, es sollte ganz abgeschafft werden."],
      answer: 1,
      why: "Sie würde das Gespräch „trotzdem nicht“ abschaffen, kritisiert aber, dass ein Termin pro Jahr zu wenig ist. Beides zusammen ergibt die Gesamthaltung." },

    { slot: "R2", item_type: "TRUE_FALSE",
      stem: "Zwei der drei vereinbarten Ziele gehen auf den Vorschlag der Autorin zurück.",
      answer_value: true,
      why: "„Von den drei Zielen … stammen zwei aus meinem eigenen Vorschlag.“" },

    { slot: "R3", item_type: "MCQ",
      stem: "Was räumt die Autorin ein?",
      options: ["Dass die Ziele früher von oben kamen, weil sie selbst keine Meinung eingebracht hatte.",
                "Dass ihre Vorgesetzte ihre Vorschläge grundsätzlich ablehnt.",
                "Dass sie das Formular nie ausgefüllt hat."],
      answer: 0,
      why: "„… nicht deshalb von oben kamen, weil meine Meinung nicht zählte, sondern weil ich nie eine eingebracht hatte.“" },

    { slot: "R4", item_type: "MCQ",
      stem: "Was hat die Autorin dieses Jahr anders gemacht?",
      options: ["Sie hat sich zum ersten Mal auf das Gespräch vorbereitet.",
                "Sie hat das Gespräch verschoben.",
                "Sie hat eine Kollegin mitgenommen."],
      answer: 0,
      why: "„Dieses Jahr habe ich mich zum ersten Mal vorbereitet.“" },

    { slot: "R5", item_type: "MULTI_SELECT",
      stem: "Welche zwei Aussagen treffen auf den Text zu?",
      options: ["Das Gespräch findet jedes Jahr im Herbst statt.",
                "Die Vorgesetzte hat das Thema im Gespräch offen angesprochen.",
                "Es wurden fünf Ziele vereinbart.",
                "Die Autorin möchte das Gespräch abschaffen."],
      correct: [0, 1],
      why: "„Jedes Jahr im Herbst“ und „Meine Vorgesetzte hat das … offen angesprochen“ stehen im Text; es waren drei Ziele, und abgeschafft werden soll nichts." },

    { slot: "R6", item_type: "ORDERING",
      stem: "Bringen Sie die Gedankenschritte in die Reihenfolge des Textes.",
      ordering: ["Sie beschreibt das Gespräch als früheren Pflichttermin.",
                 "Sie bereitet sich zum ersten Mal vor.",
                 "Sie erkennt, warum die Ziele früher von oben kamen.",
                 "Sie benennt, was sie am Abstand stört."],
      order: [0, 1, 2, 3],
      why: "Pflichttermin → Vorbereitung → Erkenntnis → verbleibende Kritik. Der Text dreht nach der Vorbereitung." },
  ],
};

const LISTENING = {
  module: "hoeren",
  audio_id: "core2026b_v9_mitarbeitergespraech",
  instruction: "Hören Sie das Gespräch einmal und beantworten Sie die Fragen.",
  situation: "Im Büro. Zwei Kolleginnen sprechen über ein Mitarbeitergespräch.",
  plays: 1,
  turns: [
    { voice: "mia", speaker: "Kollegin A",
      text: "Du, dein Jahresgespräch — das war doch für diesen Donnerstag angesetzt, oder?" },
    { voice: "katja", speaker: "Kollegin B",
      text: "War es, ja. Frau Keller hat es aber verschoben, weil sie die Zahlen aus dem Quartal noch abwarten will. Jetzt ist es am Dienstag in zwei Wochen." },
    { voice: "mia", speaker: "Kollegin A",
      text: "Dienstag in zwei Wochen also, nicht diesen Donnerstag. Und das Formular — musst du das vorher ausfüllen?" },
    { voice: "katja", speaker: "Kollegin B",
      text: "Ja, das bleibt so. Sie hat nur eine Sache ergänzt: Ich soll zusätzlich ein eigenes Ziel mitbringen, das ich selbst vorschlage." },
    { voice: "mia", speaker: "Kollegin A",
      text: "Moment, habe ich das richtig verstanden — das Formular bleibt, aber du bringst jetzt auch ein eigenes Ziel mit?" },
    { voice: "katja", speaker: "Kollegin B",
      text: "Genau das. Ehrlich gesagt finde ich das gut; so wird es mehr ein Gespräch und weniger eine Kontrolle." },
  ],
  items: [
    { slot: "L1", item_type: "MCQ",
      stem: "Wann findet das Gespräch jetzt statt?",
      options: ["Diesen Donnerstag.", "Am Dienstag in zwei Wochen.", "Erst im nächsten Quartal."],
      answer: 1,
      why: "Donnerstag war angesetzt und wurde verschoben: „Jetzt ist es am Dienstag in zwei Wochen.“" },

    { slot: "L2", item_type: "MCQ",
      stem: "Wie bewertet Kollegin B die neue Vorgabe mit dem eigenen Ziel?",
      options: ["Sie findet sie lästig.",
                "Sie findet sie gut.",
                "Sie hat dazu keine Meinung."],
      answer: 1,
      why: "„Ehrlich gesagt finde ich das gut“ — die Bewertung steht erst im letzten Satz." },

    { slot: "L3", item_type: "TRUE_FALSE",
      stem: "Das Formular muss vor dem Gespräch nicht mehr ausgefüllt werden.",
      answer_value: false,
      why: "„Ja, das bleibt so.“ — das Formular muss weiterhin vorher ausgefüllt werden." },

    { slot: "L4", item_type: "MCQ",
      stem: "Warum wurde das Gespräch verschoben?",
      options: ["Weil Frau Keller die Quartalszahlen abwarten will.",
                "Weil Kollegin B krank ist.",
                "Weil das Formular fehlte."],
      answer: 0,
      why: "„weil sie die Zahlen aus dem Quartal noch abwarten will.“" },

    { slot: "L5", item_type: "MATCHING",
      stem: "Welche Funktion hat welche Äußerung?",
      left: ["„Moment, habe ich das richtig verstanden …?“",
             "„Ehrlich gesagt finde ich das gut.“",
             "„Sie hat nur eine Sache ergänzt.“"],
      right: ["eine Meinung äußern", "sich vergewissern", "eine Information weitergeben"],
      mapping: { 0: 1, 1: 0, 2: 2 },
      why: "„Habe ich richtig verstanden …?“ sichert das eigene Verständnis ab — auf B2 eine eigene Funktion, nicht bloß eine Frage.",
      provenance: { source_chapter: "Redemittel im Überblick", source_module: "Rückfragen stellen",
                    source_page: "182" } },
  ],
};

const LANGUAGE = {
  module: "sprachbausteine",
  instruction: "Welche Formulierung passt besser?",
  items: [
    { slot: "K1", item_type: "MCQ",
      context: "Sie stimmen einem Ziel teilweise zu und machen dann Ihren eigenen Punkt.",
      stem: "Welcher Satz passt besser?",
      options: ["Das Ziel ist ehrgeizig. Ich halte es für erreichbar.",
                "Das Ziel ist zwar ehrgeizig, ich halte es aber für erreichbar."],
      answer: 1,
      why: "„zwar … aber“ räumt den Einwand ein und macht trotzdem den eigenen Punkt.",
      provenance: { source_chapter: "9", source_module: "M3", source_page: "128" } },

    { slot: "K2", item_type: "MCQ",
      context: "Sie schlagen im Gespräch einen zusätzlichen Termin vor, ohne ihn zu fordern.",
      stem: "Welcher Satz passt besser?",
      options: ["Wir treffen uns im Frühjahr noch einmal.",
                "Man könnte sich im Frühjahr noch einmal treffen."],
      answer: 1,
      why: "Der Konjunktiv II macht aus einer Ansage einen Vorschlag.",
      provenance: { source_chapter: "4", source_module: "M1", source_page: "54" } },

    { slot: "K3", item_type: "MCQ",
      context: "Sie schreiben eine Notiz nach dem Gespräch.",
      stem: "Welcher Satz passt besser?",
      options: ["Während des Gesprächs wurden drei Ziele vereinbart.",
                "Während dem Gespräch wurden drei Ziele vereinbart."],
      answer: 0,
      why: "Gesprochen hört man „während dem“ häufig. Geschrieben verlangt „während“ den Genitiv.",
      provenance: { source_book: ASPEKTE, source_chapter: "10", source_module: "M3", source_page: "158" } },

    { slot: "K4", item_type: "MCQ",
      context: "Sie begründen im Protokoll, warum ein Ziel angepasst wurde.",
      stem: "Welcher Satz passt besser?",
      options: ["Das Ziel wurde angepasst, weil sich die Zuständigkeiten geändert hatten und es in der alten Form nicht mehr erreichbar gewesen wäre.",
                "Das Ziel wurde angepasst. Die Zuständigkeiten hatten sich geändert. Es war nicht mehr erreichbar."],
      answer: 0,
      why: "Auf B2 wird der Zusammenhang im Satzgefüge gebaut, nicht in einer Aufzählung von Hauptsätzen." },

    { slot: "K5", item_type: "GAP_FILL",
      text: "Im Gespräch wurde eine klare Vereinbarung ___, nachdem beide Seiten ihre Erwartungen ___ hatten.",
      match: "ignore_case",
      gaps: [{ accepted: ["getroffen"] }, { accepted: ["geäußert", "formuliert"] }],
      why: "„eine Vereinbarung treffen“ und „Erwartungen äußern/formulieren“ — feste Verbindungen auf B2-Niveau.",
      provenance: { source_chapter: "7", source_module: "M1", source_page: "96" } },

    { slot: "K6", item_type: "GAP_FILL",
      text: "Die ___ der Ziele erfolgt einmal im Jahr; die ___ im Frühjahr fehlt bisher.",
      match: "ignore_case",
      gaps: [{ accepted: ["Vereinbarung", "Festlegung"] }, { accepted: ["Überprüfung", "Kontrolle"] }],
      why: "Nominalisierungen wie „Vereinbarung“ und „Überprüfung“ gehören zum B2-Wortschatz.",
      provenance: { source_book: ASPEKTE, source_chapter: "9", source_module: "M1", source_page: "138" } },

    { slot: "K7", item_type: "MATCHING",
      stem: "Welches Verb gehört zu welchem Nomen?",
      left: ["ein Ziel", "Feedback", "Verantwortung", "zur Sprache"],
      right: ["übernehmen", "setzen", "bringen", "geben"],
      mapping: { 0: 1, 1: 3, 2: 0, 3: 2 },
      why: "ein Ziel setzen · Feedback geben · Verantwortung übernehmen · zur Sprache bringen.",
      provenance: { source_chapter: "7", source_module: "M1", source_page: "96" } },

    { slot: "K8", item_type: "MCQ",
      context: "Eine E-Mail an Ihre Vorgesetzte.",
      stem: "Welcher Satz passt besser?",
      options: ["Passt Ihnen Dienstag oder soll ich was anderes vorschlagen?",
                "Ich möchte Sie fragen, ob Ihnen der Dienstag passt oder ob ich einen anderen Termin vorschlagen soll."],
      answer: 1,
      why: "„was anderes“ gehört ins Gespräch. In einer E-Mail an die Vorgesetzte kostet das auf B2 Punkte.",
      provenance: { source_chapter: "7", source_module: "M2", source_page: "98" } },

    { slot: "C1", item_type: "MCQ",
      context: "Ihre Vorgesetzte unterbricht Sie, bevor Sie Ihr Ziel erklärt haben.",
      stem: "Welche Reaktion ist auf B2-Niveau angemessen?",
      options: ["Darf ich den Vorschlag kurz zu Ende erklären? Dann wird klarer, worum es geht.",
                "Sie hören mir ja gar nicht zu.",
                "Dann lassen wir das Ziel eben weg."],
      answer: 0,
      why: "Man behält den eigenen Beitrag sachlich — ohne Vorwurf und ohne ihn aufzugeben.",
      provenance: { source_chapter: "Redemittel im Überblick",
                    source_module: "sich nicht unterbrechen lassen", source_page: "183" } },
  ],
};

const PRODUCTION = {
  module: "schreiben",
  items: [
    { slot: "P1", item_type: "SHORT_TEXT", rubric_key: "kurzantwort",
      stem: "Fassen Sie in zwei bis drei Sätzen zusammen, wie sich die Sicht der Autorin auf das Mitarbeitergespräch verändert hat. Nennen Sie auch, was sie weiterhin kritisiert.",
      min_words: 25, target_words: 40,
      expected: "Eine Zusammenfassung, die den Wandel (Pflichttermin → Chance durch Vorbereitung) UND die Kritik am Jahresabstand nennt.",
      provenance: { source_chapter: "7", source_module: "M4", source_page: "102" } },

    { slot: "P2", item_type: "SHORT_TEXT", rubric_key: "kurzantwort",
      stem: "Ihre Vorgesetzte schreibt: „Bringen Sie bitte ein Ziel mit.“ Sie sind nicht sicher, ob es ein fachliches oder persönliches Ziel sein soll und wie konkret es sein muss. Formulieren Sie zwei höfliche Rückfragen.",
      min_words: 15, target_words: 30,
      expected: "Zwei echte Klärungsfragen in angemessener Höflichkeitsform.",
      provenance: { source_chapter: "Redemittel im Überblick", source_module: "Rückfragen stellen",
                    source_page: "182" } },

    { slot: "W1", item_type: "LONG_TEXT", rubric_key: "forumsbeitrag",
      stem: "In Ihrem Betrieb wird diskutiert, ob das jährliche Mitarbeitergespräch durch kurze Gespräche alle drei Monate ersetzt werden soll. Schreiben Sie einen Beitrag für das Intranet-Forum.",
      guidance: ["Sagen Sie, was Sie davon halten.",
                 "Begründen Sie Ihre Position mit mindestens zwei Argumenten.",
                 "Gehen Sie auf einen Nachteil Ihrer eigenen Position ein.",
                 "Machen Sie einen konkreten Vorschlag."],
      min_words: 60, target_words: 90 },
  ],
};

const SPEAKING = {
  module: "sprechen",
  slot: "S1", item_type: "SPOKEN_RESPONSE",
  instruction: "Sprechen Sie etwa 60 bis 90 Sekunden.",
  stem: "Manche Firmen führen ein Mitarbeitergespräch pro Jahr, andere kurze Gespräche jedes Quartal. Was halten Sie für sinnvoller? Begründen Sie Ihre Meinung und gehen Sie kurz auf einen Nachteil der anderen Möglichkeit ein.",
  prep_seconds: 30, speak_seconds: 90,
  expected: "Eine klare Position, mindestens zwei Begründungen und ein eingeräumter Punkt der Gegenseite.",
  provenance: { source_chapter: "5", source_module: "M2", source_page: "70" },
};

const V9 = {
  id: "core-2026b-v9",
  group: "core-2026b",
  title: "Skillcase B2 — Einstufung V9",
  theme: "Mitarbeitergespräch und Zielvereinbarung",
  provenance: PROV,
  reading: READING, listening: LISTENING, language: LANGUAGE,
  production: PRODUCTION, speaking: SPEAKING,
};

module.exports = { V9 };
