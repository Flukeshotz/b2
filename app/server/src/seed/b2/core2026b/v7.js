/**
 * core-2026b-v7 — SEED DATA. Same rules as v1.js/v4.js/v5.js/v6.js.
 *
 * THEME: Weiterbildungsbudget — a training budget cut and who actually
 * gets to use what's left. General B2, not nursing-specific.
 */

const KONTEXT = "Kontext B2 Kursbuch";
const ASPEKTE = "Aspekte neu B2 Lehrbuch";

const PROV = {
  source_type: "INSPIRED", source_book: KONTEXT, source_chapter: "7",
  source_module: "M4", source_page: "102", adaptation_status: "NOT_APPLICABLE",
};

const READING = {
  module: "lesen",
  title: "Forum: Wer bekommt das Weiterbildungsbudget?",
  instruction: "Lesen Sie den Forumsbeitrag und beantworten Sie die Fragen.",
  passage: `Unser Weiterbildungsbudget wurde dieses Jahr um ein Drittel gekürzt. Meine erste
Reaktion war Ärger: Gerade jetzt, wo sich so viel in unserem Bereich verändert,
wird an Fortbildung gespart.

Dann habe ich mir angesehen, wie das Budget in den letzten Jahren tatsächlich
genutzt wurde. Fast siebzig Prozent gingen an dieselben fünf Personen, die
ohnehin schon die erfahrensten im Team waren. Der Rest hat kaum etwas
beantragt — nicht, weil kein Interesse bestand, sondern weil niemand genau
wusste, wie der Antrag funktioniert.

Mit dem kleineren Budget hat die Abteilungsleitung jetzt eine klare Regel
eingeführt: Jede Person hat Anspruch auf mindestens einen Kurs pro Jahr, und
Anträge werden zuerst nach Bedarf, dann nach Eingangsdatum bearbeitet.

Was mich weiterhin stört, ist die kurze Antragsfrist. Wer sich erst
entscheiden muss, welcher Kurs wirklich passt, hat oft keine zwei Wochen Zeit
dafür.

Die Kürzung selbst würde ich trotzdem nicht mehr rückgängig machen wollen.`,
  items: [
    { slot: "R1", item_type: "MCQ",
      stem: "Wie beurteilt der Autor die Neuregelung insgesamt?",
      options: ["Er hält sie für gescheitert und will die alte Verteilung zurück.",
                "Er hält die neue Verteilung für gerechter, kritisiert aber weiterhin die Frist.",
                "Er findet, das Budget hätte gar nicht gekürzt werden dürfen."],
      answer: 1,
      why: "Er würde die Kürzung „trotzdem nicht mehr rückgängig machen wollen“, kritisiert aber weiter die kurze Antragsfrist. Beides zusammen ergibt die Gesamthaltung." },

    { slot: "R2", item_type: "TRUE_FALSE",
      stem: "Fast siebzig Prozent des früheren Budgets gingen an dieselben fünf Personen.",
      answer_value: true,
      why: "„Fast siebzig Prozent gingen an dieselben fünf Personen.“" },

    { slot: "R3", item_type: "MCQ",
      stem: "Was räumt der Autor ein?",
      options: ["Dass seine anfängliche Empörung über die Kürzung nicht die ganze Geschichte war.",
                "Dass die neue Regelung inzwischen wieder abgeschafft wurde.",
                "Dass er selbst nie einen Kurs beantragt hat."],
      answer: 0,
      why: "Der Blick auf die tatsächliche Nutzung verändert seine erste Reaktion — das Eingeständnis betrifft seine anfängliche Sicht, nicht die Kürzung selbst." },

    { slot: "R4", item_type: "MCQ",
      stem: "Warum haben viele früher kaum Budget beantragt?",
      options: ["Weil niemand genau wusste, wie der Antrag funktioniert.",
                "Weil kein Interesse an Fortbildung bestand.",
                "Weil die Abteilungsleitung Anträge grundsätzlich ablehnte."],
      answer: 0,
      why: "„nicht, weil kein Interesse bestand, sondern weil niemand genau wusste, wie der Antrag funktioniert.“" },

    { slot: "R5", item_type: "MULTI_SELECT",
      stem: "Welche zwei Aussagen treffen auf den Text zu?",
      options: ["Jede Person hat jetzt Anspruch auf mindestens einen Kurs pro Jahr.",
                "Die Antragsfrist wurde nach Ansicht des Autors verlängert.",
                "Anträge werden zuerst nach Bedarf bearbeitet.",
                "Das Budget wurde in diesem Jahr erhöht."],
      correct: [0, 2],
      why: "„Jede Person hat Anspruch auf mindestens einen Kurs“ und „zuerst nach Bedarf … bearbeitet“ stehen explizit im Text; die Frist wurde nicht verlängert, und das Budget wurde gekürzt, nicht erhöht." },

    { slot: "R6", item_type: "ORDERING",
      stem: "Bringen Sie die Gedankenschritte in die Reihenfolge des Textes.",
      ordering: ["Er beschreibt seinen ersten Ärger über die Kürzung.",
                 "Er erkennt am bisherigen Muster ein Verteilungsproblem.",
                 "Er beschreibt die neue, klarere Regel.",
                 "Er benennt, was ihn an der Frist weiterhin stört."],
      order: [0, 1, 2, 3],
      why: "Ärger → erkanntes Muster → neue Regel → verbleibende Kritik. Der Text argumentiert nicht linear negativ, sondern dreht in der Mitte." },
  ],
};

const LISTENING = {
  module: "hoeren",
  audio_id: "core2026b_v7_weiterbildung",
  instruction: "Hören Sie das Gespräch einmal und beantworten Sie die Fragen.",
  situation: "In der Kaffeeküche. Zwei Kolleginnen sprechen über einen Fortbildungsantrag.",
  plays: 1,
  turns: [
    { voice: "mia", speaker: "Kollegin A",
      text: "Du, dein Antrag für den Excel-Kurs — der war doch für nächsten Monat genehmigt, oder?" },
    { voice: "katja", speaker: "Kollegin B",
      text: "War die erste Zusage, ja. Herr Reimann hat das aber noch mal angepasst, weil der Kurs schon ausgebucht war. Jetzt bin ich für den Termin im übernächsten Monat eingetragen." },
    { voice: "mia", speaker: "Kollegin A",
      text: "Übernächsten Monat also, nicht nächsten. Und das Budget dafür — bleibt das reserviert?" },
    { voice: "katja", speaker: "Kollegin B",
      text: "Ja, das ist für mich fest reserviert. Er hat nur eine Sache geändert: Ich muss den Teilnahmenachweis jetzt direkt nach dem Kurs einreichen, nicht erst am Jahresende." },
    { voice: "mia", speaker: "Kollegin A",
      text: "Moment, habe ich das richtig verstanden — dein Platz ist sicher, nur der Termin und die Nachweisfrist haben sich geändert?" },
    { voice: "katja", speaker: "Kollegin B",
      text: "Genau das. Ehrlich gesagt finde ich die frühere Abgabe sogar besser; am Jahresende hätte ich das sicher vergessen." },
  ],
  items: [
    { slot: "L1", item_type: "MCQ",
      stem: "Wann findet der Excel-Kurs für Kollegin B jetzt statt?",
      options: ["Nächsten Monat.", "Übernächsten Monat.", "Erst im nächsten Jahr."],
      answer: 1,
      why: "Nächster Monat war die erste Zusage und wurde ersetzt: „Jetzt bin ich für den Termin im übernächsten Monat eingetragen.“" },

    { slot: "L2", item_type: "MCQ",
      stem: "Wie bewertet Kollegin B die frühere Abgabefrist für den Nachweis?",
      options: ["Sie hält sie für unpraktisch.",
                "Sie hält sie für besser als die alte Regelung.",
                "Sie hat dazu keine Meinung."],
      answer: 1,
      why: "„Ehrlich gesagt finde ich die frühere Abgabe sogar besser“ — die Bewertung steht erst im letzten Satz." },

    { slot: "L3", item_type: "TRUE_FALSE",
      stem: "Das Budget für Kollegin Bs Kurs ist nicht mehr reserviert.",
      answer_value: false,
      why: "„Ja, das ist für mich fest reserviert.“" },

    { slot: "L4", item_type: "MCQ",
      stem: "Warum wurde der ursprüngliche Termin geändert?",
      options: ["Weil der Kurs schon ausgebucht war.",
                "Weil Kollegin B den Termin absagen wollte.",
                "Weil das Budget nicht ausreichte."],
      answer: 0,
      why: "„weil der Kurs schon ausgebucht war.“" },

    { slot: "L5", item_type: "MATCHING",
      stem: "Welche Funktion hat welche Äußerung?",
      left: ["„Moment, habe ich das richtig verstanden …?“",
             "„Ehrlich gesagt finde ich die frühere Abgabe sogar besser.“",
             "„Er hat nur eine Sache geändert.“"],
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
      context: "Sie stimmen der Kürzung teilweise zu und machen dann Ihren eigenen Punkt.",
      stem: "Welcher Satz passt besser?",
      options: ["Das Budget wurde kleiner. Die Verteilung ist jetzt gerechter.",
                "Das Budget wurde zwar kleiner, die Verteilung ist aber jetzt gerechter."],
      answer: 1,
      why: "„zwar … aber“ räumt den Nachteil ein und setzt zugleich den Vorteil dagegen. Zwei Sätze nebeneinander zeigen kein Abwägen.",
      provenance: { source_chapter: "9", source_module: "M3", source_page: "128" } },

    { slot: "K2", item_type: "MCQ",
      context: "Sie bringen eine neue Antragsregel ins Gespräch, die noch verhandelbar bleiben soll.",
      stem: "Welcher Satz passt besser?",
      options: ["Wir verlängern die Antragsfrist auf vier Wochen.",
                "Man könnte die Antragsfrist auf vier Wochen verlängern."],
      answer: 1,
      why: "Der Konjunktiv II macht aus einer Ansage einen Vorschlag, über den noch entschieden werden darf.",
      provenance: { source_chapter: "4", source_module: "M1", source_page: "54" } },

    { slot: "K3", item_type: "MCQ",
      context: "Sie schreiben eine kurze Notiz an die Personalabteilung.",
      stem: "Welcher Satz passt besser?",
      options: ["Wegen des gekürzten Budgets bitten wir um eine klare Priorisierung.",
                "Wegen dem gekürzten Budget bitten wir um eine klare Priorisierung."],
      answer: 0,
      why: "Gesprochen hört man „wegen dem“ ständig. Geschrieben verlangt „wegen“ den Genitiv.",
      provenance: { source_book: ASPEKTE, source_chapter: "10", source_module: "M3", source_page: "158" } },

    { slot: "K4", item_type: "MCQ",
      context: "Sie begründen im Protokoll, warum die neue Regel eingeführt wurde.",
      stem: "Welcher Satz passt besser?",
      options: ["Die neue Regel wurde eingeführt, weil das Budget zuvor ungleich verteilt war und viele gar nicht wussten, wie man es beantragt.",
                "Die neue Regel wurde eingeführt. Das Budget war ungleich verteilt. Viele wussten nicht, wie man es beantragt."],
      answer: 0,
      why: "Auf B2 wird der Zusammenhang im Satzgefüge gebaut, nicht in einer Aufzählung nebeneinandergestellter Hauptsätze." },

    { slot: "K5", item_type: "GAP_FILL",
      text: "Der Antrag wurde nach kurzer Prüfung schließlich ___, nachdem die Abteilungsleitung Rücksprache ___ hatte.",
      match: "ignore_case",
      gaps: [{ accepted: ["genehmigt", "bewilligt"] }, { accepted: ["gehalten"] }],
      why: "„einen Antrag genehmigen/bewilligen“ und „Rücksprache halten“ — feste Verbindungen, die auf B2 erwartet werden.",
      provenance: { source_chapter: "7", source_module: "M1", source_page: "96" } },

    { slot: "K6", item_type: "GAP_FILL",
      text: "Die ___ des Budgets folgt jetzt festen Kriterien; nur die ___ der Ausnahmefälle dauert noch etwas länger.",
      match: "ignore_case",
      gaps: [{ accepted: ["Verteilung", "Vergabe"] }, { accepted: ["Bearbeitung"] }],
      why: "Nominalisierungen wie „Verteilung“ und präzise Nomen wie „Bearbeitung“ gehören zum B2-Wortschatz; „das Verteilen“ und „das Machen“ wären der A2-Ersatz.",
      provenance: { source_book: ASPEKTE, source_chapter: "9", source_module: "M1", source_page: "138" } },

    { slot: "K7", item_type: "MATCHING",
      stem: "Welches Verb gehört zu welchem Nomen?",
      left: ["einen Antrag", "Anspruch", "zur Verfügung", "in Betracht"],
      right: ["ziehen", "stellen", "haben", "stehen"],
      mapping: { 0: 1, 1: 2, 2: 3, 3: 0 },
      why: "einen Antrag stellen · Anspruch haben · zur Verfügung stehen · etwas in Betracht ziehen.",
      provenance: { source_chapter: "7", source_module: "M1", source_page: "96" } },

    { slot: "K8", item_type: "MCQ",
      context: "Eine E-Mail an die Personalabteilung.",
      stem: "Welcher Satz passt besser?",
      options: ["Ich wollte nur kurz fragen, wie das jetzt mit dem Kurs läuft.",
                "Ich möchte Sie bitten, mir den aktuellen Stand meines Antrags mitzuteilen."],
      answer: 1,
      why: "„nur kurz fragen“ und „wie das läuft“ gehören ins Gespräch. An die Personalabteilung kostet das auf B2 Punkte.",
      provenance: { source_chapter: "7", source_module: "M2", source_page: "98" } },

    { slot: "C1", item_type: "MCQ",
      context: "In der Teambesprechung stellt jemand Ihre Kursauswahl in Frage, bevor Sie sie erklärt haben.",
      stem: "Welche Reaktion ist auf B2-Niveau angemessen?",
      options: ["Darf ich kurz erklären, warum ich diesen Kurs gewählt habe? Danach wird es klarer.",
                "Das geht doch niemanden etwas an.",
                "Wenn Sie meinen, ich hätte falsch gewählt, dann eben nicht."],
      answer: 0,
      why: "Man behält den eigenen Redebeitrag und bietet zugleich die Klärung an — ohne Rückzug und ohne Konfrontation. Die zweite Option blockt ab, die dritte gibt das Wort auf.",
      provenance: { source_chapter: "Redemittel im Überblick",
                    source_module: "sich nicht unterbrechen lassen", source_page: "183" } },
  ],
};

const PRODUCTION = {
  module: "schreiben",
  items: [
    { slot: "P1", item_type: "SHORT_TEXT", rubric_key: "kurzantwort",
      stem: "Fassen Sie in zwei bis drei Sätzen zusammen, wie sich die Haltung des Autors zur Budgetkürzung entwickelt hat. Nennen Sie auch, was ihn weiterhin stört.",
      min_words: 25, target_words: 40,
      expected: "Eine Zusammenfassung, die den anfänglichen Ärger, die erkannte Ungleichverteilung, die neue Regel UND die verbleibende Kritik an der Frist nennt, ohne den Text nachzuerzählen.",
      provenance: { source_chapter: "7", source_module: "M4", source_page: "102" } },

    { slot: "P2", item_type: "SHORT_TEXT", rubric_key: "kurzantwort",
      stem: "Ihre Abteilungsleitung schreibt: „Der Antrag muss bis Freitag eingereicht werden.“ Sie sind nicht sicher, ob das für alle Kurse gilt und was bei Verspätung passiert. Formulieren Sie zwei höfliche Rückfragen.",
      min_words: 15, target_words: 30,
      expected: "Zwei echte Klärungsfragen in angemessener Höflichkeitsform — nicht eine Wiederholung der Aussage und nicht eine Meinung.",
      provenance: { source_chapter: "Redemittel im Überblick", source_module: "Rückfragen stellen",
                    source_page: "182" } },

    { slot: "W1", item_type: "LONG_TEXT", rubric_key: "forumsbeitrag",
      stem: "In Ihrem Betrieb wird diskutiert, ob das Weiterbildungsbudget künftig nur noch für Kurse mit direktem Bezug zur aktuellen Stelle genutzt werden darf. Schreiben Sie einen Beitrag für das Intranet-Forum.",
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
  stem: "Manche Firmen verteilen das Weiterbildungsbudget nach Bedarf, andere nach Betriebszugehörigkeit. Was halten Sie für gerechter? Begründen Sie Ihre Meinung und gehen Sie kurz auf einen Nachteil der anderen Möglichkeit ein.",
  prep_seconds: 30, speak_seconds: 90,
  expected: "Eine klare Position, mindestens zwei Begründungen und ein eingeräumter Punkt der Gegenseite.",
  provenance: { source_chapter: "5", source_module: "M2", source_page: "70" },
};

const V7 = {
  id: "core-2026b-v7",
  group: "core-2026b",
  title: "Skillcase B2 — Einstufung V7",
  theme: "Weiterbildungsbudget",
  provenance: PROV,
  reading: READING, listening: LISTENING, language: LANGUAGE,
  production: PRODUCTION, speaking: SPEAKING,
};

module.exports = { V7 };
