/**
 * core-2026b-v4 — SEED DATA. Same rules as v1.js: seed convenience only, the
 * database is authoritative at runtime (see blueprint.js), every item is
 * INSPIRED (topic/task pattern/grammar point from the audited books, German
 * written for Skillcase), review is AUTO_QA_PASS at most.
 *
 * THEME: Kundenreklamation und Kulanz — a customer complaint and how far a
 * company goes to make it right. General B2, not nursing-specific.
 */

const KONTEXT = "Kontext B2 Kursbuch";
const ASPEKTE = "Aspekte neu B2 Lehrbuch";

const PROV = {
  source_type: "INSPIRED", source_book: KONTEXT, source_chapter: "8",
  source_module: "M3", source_page: "112", adaptation_status: "NOT_APPLICABLE",
};

/* ── READING ────────────────────────────────────────────────────────────
   The author's position shifts once he learns WHY the delay happened — the
   same "revise mid-text" shape v1 uses, so R1/R3 stay whole-text items. */
const READING = {
  module: "lesen",
  title: "Forum: Wie viel Kulanz ist zu viel?",
  instruction: "Lesen Sie den Forumsbeitrag und beantworten Sie die Fragen.",
  passage: `Letzte Woche hat ein Kunde bei uns eine Lieferung reklamiert: drei von zwölf Paketen
waren beschädigt angekommen. Mein erster Gedanke war, das sei ein Einzelfall und der Kunde
solle sich an die Spedition wenden — schließlich hatten wir sauber verpackt.

Dann habe ich mir die Reklamationen der letzten drei Monate angesehen. Es waren nicht drei
beschädigte Pakete, es waren einundzwanzig, und fast alle kamen von derselben Route. Das hat
meine Sicht verändert. Es ging nicht mehr um einen einzelnen unglücklichen Kunden, sondern
um ein Problem, das wir selbst verursacht hatten.

Wir haben dem Kunden eine volle Rückerstattung angeboten, dazu einen Gutschein für die
nächste Bestellung. Das war teurer, als ich wollte, aber richtig: Wer für unseren Fehler
zahlt, sollte nicht auch noch dafür kämpfen müssen.

Was mich trotzdem stört, ist die Spedition selbst. Wir haben sie zweimal auf die Route
angesprochen, ohne eine klare Antwort zu bekommen. Solange sich daran nichts ändert, wird
uns das Problem wieder einholen — Kulanz hin oder her.

Den Vertrag kündigen würde ich deshalb trotzdem noch nicht.`,
  items: [
    { slot: "R1", item_type: "MCQ",
      stem: "Wie beurteilt der Autor die Lage am Ende?",
      options: ["Er hält die Spedition für zuverlässig, sieht das Problem als gelöst.",
                "Er hat kulant reagiert, sieht aber bei der Spedition weiterhin ein ungelöstes Problem.",
                "Er findet, der Kunde habe übertrieben reagiert."],
      answer: 1,
      why: "Er würde den Vertrag „trotzdem noch nicht“ kündigen, kritisiert aber weiter die fehlende Antwort der Spedition. Beides zusammen ergibt die Gesamthaltung." },

    { slot: "R2", item_type: "TRUE_FALSE",
      stem: "Laut Text kamen fast alle beschädigten Sendungen von derselben Route.",
      answer_value: true,
      why: "„fast alle kamen von derselben Route.“" },

    { slot: "R3", item_type: "MCQ",
      stem: "Was räumt der Autor ein?",
      options: ["Dass es sich nicht um einen Einzelfall handelte, sondern um ein hausgemachtes Problem.",
                "Dass die Spedition inzwischen zuverlässig liefert.",
                "Dass der Kunde die beschädigten Pakete selbst verursacht hat."],
      answer: 0,
      why: "„Es ging nicht mehr um einen einzelnen unglücklichen Kunden, sondern um ein Problem, das wir selbst verursacht hatten.“" },

    { slot: "R4", item_type: "MCQ",
      stem: "Worauf führt der Autor seinen Sinneswandel zurück?",
      options: ["Auf ein Gespräch mit dem Kunden.",
                "Auf den Blick in die Reklamationen der letzten drei Monate.",
                "Auf eine Beschwerde der Spedition."],
      answer: 1,
      why: "„Dann habe ich mir die Reklamationen der letzten drei Monate angesehen.“ Der Text nennt diesen Blick als Auslöser für die veränderte Sicht." },

    { slot: "R5", item_type: "MULTI_SELECT",
      stem: "Welche zwei Aussagen treffen auf den Text zu?",
      options: ["Der Kunde erhielt eine volle Rückerstattung und einen Gutschein.",
                "Die Spedition hat auf zwei Nachfragen klar geantwortet.",
                "In drei Monaten gab es einundzwanzig beschädigte Sendungen.",
                "Der Autor hat den Vertrag mit der Spedition bereits gekündigt."],
      correct: [0, 2],
      why: "„Rückerstattung … dazu einen Gutschein“ und „einundzwanzig“ Sendungen in drei Monaten stehen beide explizit im Text; die Spedition antwortete gerade NICHT klar, und gekündigt wurde nichts." },

    { slot: "R6", item_type: "ORDERING",
      stem: "Bringen Sie die Gedankenschritte in die Reihenfolge des Textes.",
      ordering: ["Er beschreibt die einzelne Reklamation.",
                 "Er erkennt am Muster der letzten Monate ein größeres Problem.",
                 "Er entscheidet sich für volle Rückerstattung und Gutschein.",
                 "Er benennt, was ihn an der Spedition weiterhin stört."],
      order: [0, 1, 2, 3],
      why: "Einzelfall → Muster erkannt → Entscheidung getroffen → verbleibende Kritik. Die einzige Reihenfolge, die dem Text als Argumentation folgt." },
  ],
};

/* ── LISTENING ──────────────────────────────────────────────────────────
   ~60 seconds, heard once. A changed decision (voucher amount) and a stance
   (whether the new offer is fair) must be caught in passing. */
const LISTENING = {
  module: "hoeren",
  audio_id: "core2026b_v4_reklamation",
  instruction: "Hören Sie das Gespräch einmal und beantworten Sie die Fragen.",
  situation: "Im Kundenservice. Zwei Kollegen sprechen über eine Reklamation.",
  plays: 1,
  turns: [
    { voice: "conrad", speaker: "Kollege A",
      text: "Die Reklamation von Frau Bauer — die wollten wir doch mit zwanzig Euro Gutschein abschließen, oder?" },
    { voice: "katja", speaker: "Kollegin B",
      text: "Das war der erste Vorschlag, ja. Herr Weiss hat das aber noch mal angesehen, weil es schon ihre dritte Reklamation dieses Jahr ist. Jetzt sind es vierzig Euro, dazu die volle Rückerstattung." },
    { voice: "conrad", speaker: "Kollege A",
      text: "Vierzig Euro also, nicht zwanzig. Und die Rückerstattung — kommt die separat?" },
    { voice: "katja", speaker: "Kollegin B",
      text: "Nein, beides zusammen auf einmal. Er hat nur eine Bedingung gestrichen: Sie muss das beschädigte Paket nicht mehr zurückschicken." },
    { voice: "conrad", speaker: "Kollege A",
      text: "Moment, habe ich das richtig verstanden — sie behält das beschädigte Paket und bekommt trotzdem alles erstattet?" },
    { voice: "katja", speaker: "Kollegin B",
      text: "Genau das. Ehrlich gesagt finde ich das bei der dritten Reklamation auch angemessen; sonst verlieren wir sie als Kundin ganz." },
  ],
  items: [
    { slot: "L1", item_type: "MCQ",
      stem: "Wie hoch ist der Gutschein am Ende?",
      options: ["Zwanzig Euro.", "Vierzig Euro.", "Er entfällt ganz."],
      answer: 1,
      why: "Zwanzig Euro war der erste Vorschlag und wurde ersetzt: „Jetzt sind es vierzig Euro.“ Wer nur den ersten Betrag hört, antwortet falsch." },

    { slot: "L2", item_type: "MCQ",
      stem: "Wie bewertet Kollegin B die neue Lösung?",
      options: ["Sie hält sie für übertrieben.",
                "Sie hält sie für angemessen.",
                "Sie hat dazu keine Meinung."],
      answer: 1,
      why: "„Ehrlich gesagt finde ich das … auch angemessen“ — die Bewertung steht erst im letzten Satz, nach der Sachinformation." },

    { slot: "L3", item_type: "TRUE_FALSE",
      stem: "Frau Bauer muss das beschädigte Paket nicht zurückschicken.",
      answer_value: true,
      why: "„Sie muss das beschädigte Paket nicht mehr zurückschicken.“ Genau diese Bedingung wurde gestrichen." },

    { slot: "L4", item_type: "MCQ",
      stem: "Warum wurde der Vorschlag von Herrn Weiss noch einmal geändert?",
      options: ["Weil es schon Frau Bauers dritte Reklamation dieses Jahr ist.",
                "Weil das Paket versichert war.",
                "Weil Frau Bauer sich beim Vorgesetzten beschwert hat."],
      answer: 0,
      why: "„weil es schon ihre dritte Reklamation dieses Jahr ist.“" },

    { slot: "L5", item_type: "MATCHING",
      stem: "Welche Funktion hat welche Äußerung?",
      left: ["„Moment, habe ich das richtig verstanden …?“",
             "„Ehrlich gesagt finde ich das … angemessen.“",
             "„Er hat nur eine Bedingung gestrichen.“"],
      right: ["eine Meinung äußern", "sich vergewissern", "eine Information weitergeben"],
      mapping: { 0: 1, 1: 0, 2: 2 },
      why: "„Habe ich richtig verstanden …?“ sichert das eigene Verständnis ab — auf B2 eine eigene Funktion, nicht bloß eine Frage.",
      provenance: { source_chapter: "Redemittel im Überblick", source_module: "Rückfragen stellen",
                    source_page: "182" } },
  ],
};

/* ── LANGUAGE · the eight knowledge items, same nine grammar/register/
   collocation points v1–v3 test, new sentences on this theme. ──────────── */
const LANGUAGE = {
  module: "sprachbausteine",
  instruction: "Welche Formulierung passt besser?",
  items: [
    { slot: "K1", item_type: "MCQ",
      context: "Sie stimmen einer Beschwerde teilweise zu und machen dann Ihren eigenen Punkt.",
      stem: "Welcher Satz passt besser?",
      options: ["Die Lieferung kam beschädigt an. Das war unser Fehler.",
                "Die Lieferung kam zwar beschädigt an, das war aber nicht allein unser Fehler."],
      answer: 1,
      why: "„zwar … aber“ räumt den Fehler ein und setzt zugleich die Einschränkung dagegen. Zwei Sätze nebeneinander zeigen kein Abwägen.",
      provenance: { source_chapter: "9", source_module: "M3", source_page: "128" } },

    { slot: "K2", item_type: "MCQ",
      context: "Sie bringen eine Lösung ins Gespräch, die noch verhandelbar bleiben soll.",
      stem: "Welcher Satz passt besser?",
      options: ["Wir erstatten den vollen Betrag.",
                "Man könnte den vollen Betrag erstatten."],
      answer: 1,
      why: "Der Konjunktiv II macht aus einer Ansage einen Vorschlag, über den noch gesprochen werden kann.",
      provenance: { source_chapter: "4", source_module: "M1", source_page: "54" } },

    { slot: "K3", item_type: "MCQ",
      context: "Sie schreiben eine kurze Notiz an die Spedition.",
      stem: "Welcher Satz passt besser?",
      options: ["Wegen des beschädigten Pakets bitten wir um Stellungnahme.",
                "Wegen dem beschädigten Paket bitten wir um Stellungnahme."],
      answer: 0,
      why: "Gesprochen hört man „wegen dem“ ständig. Geschrieben verlangt „wegen“ den Genitiv.",
      provenance: { source_book: ASPEKTE, source_chapter: "10", source_module: "M3", source_page: "158" } },

    { slot: "K4", item_type: "MCQ",
      context: "Sie begründen in einer E-Mail, warum eine Rückerstattung genehmigt wurde.",
      stem: "Welcher Satz passt besser?",
      options: ["Die Rückerstattung wurde genehmigt, weil die Reklamation berechtigt war und eine Ablehnung die Kundin verloren hätte.",
                "Die Rückerstattung wurde genehmigt. Die Reklamation war berechtigt. Eine Ablehnung hätte die Kundin gekostet."],
      answer: 0,
      why: "Auf B2 wird der Zusammenhang im Satzgefüge gebaut, nicht in einer Aufzählung nebeneinandergestellter Hauptsätze." },

    { slot: "K5", item_type: "GAP_FILL",
      text: "Der Kunde hat die Lieferung zunächst in Frage ___, nachdem er drei beschädigte Pakete ___ hatte.",
      match: "ignore_case",
      gaps: [{ accepted: ["gestellt"] }, { accepted: ["erhalten", "bekommen"] }],
      why: "„etwas in Frage stellen“ und „etwas erhalten/bekommen“ — feste Verbindungen, die auf B2 erwartet werden.",
      provenance: { source_chapter: "7", source_module: "M1", source_page: "96" } },

    { slot: "K6", item_type: "GAP_FILL",
      text: "Die ___ der Reklamation hat gezeigt, dass die ___ des Problems bei der Spedition liegt.",
      match: "ignore_case",
      gaps: [{ accepted: ["Prüfung", "Auswertung"] }, { accepted: ["Ursache"] }],
      why: "Nominalisierungen wie „Prüfung“ und präzise Nomen wie „Ursache“ gehören zum B2-Wortschatz; „das Prüfen“ und „der Grund davon“ wären der A2-Ersatz.",
      provenance: { source_book: ASPEKTE, source_chapter: "9", source_module: "M1", source_page: "138" } },

    { slot: "K7", item_type: "MATCHING",
      stem: "Welches Verb gehört zu welchem Nomen?",
      left: ["eine Reklamation", "Kulanz", "zur Verfügung", "in Anspruch"],
      right: ["nehmen", "bearbeiten", "zeigen", "stehen"],
      mapping: { 0: 1, 1: 2, 2: 3, 3: 0 },
      why: "eine Reklamation bearbeiten · Kulanz zeigen · zur Verfügung stehen · etwas in Anspruch nehmen.",
      provenance: { source_chapter: "7", source_module: "M1", source_page: "96" } },

    { slot: "K8", item_type: "MCQ",
      context: "Eine E-Mail an die Geschäftsleitung.",
      stem: "Welcher Satz passt besser?",
      options: ["Ich wollte nur kurz sagen, dass der Kunde ziemlich sauer war.",
                "Ich möchte Sie darüber informieren, dass der Kunde sich deutlich beschwert hat."],
      answer: 1,
      why: "„ziemlich sauer“ gehört ins Gespräch. In einer E-Mail an die Leitung kostet das auf B2 Punkte.",
      provenance: { source_chapter: "7", source_module: "M2", source_page: "98" } },

    { slot: "C1", item_type: "MCQ",
      context: "Ein Kunde unterbricht Sie am Telefon, bevor Sie die Lösung erklärt haben.",
      stem: "Welche Reaktion ist auf B2-Niveau angemessen?",
      options: ["Lassen Sie mich bitte kurz ausreden — dann ist die Lösung klarer.",
                "Ich war noch nicht fertig! Hören Sie mir doch mal zu.",
                "Wenn Sie nicht zuhören wollen, kann ich auch nichts machen."],
      answer: 0,
      why: "Man behält den eigenen Redebeitrag sachlich, ohne Vorwurf und ohne ihn aufzugeben. Der Vorwurf eskaliert, das Aufgeben verschenkt das Wort.",
      provenance: { source_chapter: "Redemittel im Überblick",
                    source_module: "sich nicht unterbrechen lassen", source_page: "183" } },
  ],
};

/* ── PRODUCTION ──────────────────────────────────────────────────────── */
const PRODUCTION = {
  module: "schreiben",
  items: [
    { slot: "P1", item_type: "SHORT_TEXT", rubric_key: "kurzantwort",
      stem: "Fassen Sie in zwei bis drei Sätzen zusammen, wie sich die Haltung des Autors zur Reklamation entwickelt hat. Nennen Sie auch, was ihn weiterhin stört.",
      min_words: 25, target_words: 40,
      expected: "Eine Zusammenfassung, die den Sinneswandel (Einzelfall → strukturelles Problem) UND die verbleibende Kritik an der Spedition nennt, ohne den Text nachzuerzählen.",
      provenance: { source_chapter: "7", source_module: "M4", source_page: "102" } },

    { slot: "P2", item_type: "SHORT_TEXT", rubric_key: "kurzantwort",
      stem: "Ihr Kollege sagt: „Den Fall lösen wir wie die letzten Male.“ Sie sind nicht sicher, welchen Fall er meint und ob damit die volle Rückerstattung gemeint ist. Formulieren Sie zwei höfliche Rückfragen.",
      min_words: 15, target_words: 30,
      expected: "Zwei echte Klärungsfragen in angemessener Höflichkeitsform — nicht eine Wiederholung der Aussage und nicht eine Meinung.",
      provenance: { source_chapter: "Redemittel im Überblick", source_module: "Rückfragen stellen",
                    source_page: "182" } },

    { slot: "W1", item_type: "LONG_TEXT", rubric_key: "forumsbeitrag",
      stem: "In Ihrem Betrieb wird diskutiert, ob Kulanzentscheidungen wie volle Rückerstattungen künftig nur noch von der Führungsebene genehmigt werden dürfen. Schreiben Sie einen Beitrag für das Intranet-Forum.",
      guidance: ["Sagen Sie, was Sie davon halten.",
                 "Begründen Sie Ihre Position mit mindestens zwei Argumenten.",
                 "Gehen Sie auf einen Nachteil Ihrer eigenen Position ein.",
                 "Machen Sie einen konkreten Vorschlag."],
      min_words: 60, target_words: 90 },
  ],
};

/* ── SPEAKING ────────────────────────────────────────────────────────── */
const SPEAKING = {
  module: "sprechen",
  slot: "S1", item_type: "SPOKEN_RESPONSE",
  instruction: "Sprechen Sie etwa 60 bis 90 Sekunden.",
  stem: "Manche Firmen geben Mitarbeitenden im Kundenservice das Recht, kleinere Reklamationen selbst und sofort zu lösen, statt jeden Fall an eine Führungskraft weiterzugeben. Was halten Sie für sinnvoller? Begründen Sie Ihre Meinung und gehen Sie kurz auf einen Nachteil der anderen Möglichkeit ein.",
  prep_seconds: 30, speak_seconds: 90,
  expected: "Eine klare Position, mindestens zwei Begründungen und ein eingeräumter Punkt der Gegenseite.",
  provenance: { source_chapter: "5", source_module: "M2", source_page: "70" },
};

const V4 = {
  id: "core-2026b-v4",
  group: "core-2026b",
  title: "Skillcase B2 — Einstufung V4",
  theme: "Kundenreklamation und Kulanz",
  provenance: PROV,
  reading: READING, listening: LISTENING, language: LANGUAGE,
  production: PRODUCTION, speaking: SPEAKING,
};

module.exports = { V4 };
