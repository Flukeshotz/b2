/**
 * core-2026b-v1 — SEED DATA.
 *
 * Seed convenience only. The database is authoritative at runtime; see
 * blueprint.js. Deleting this file removes the ability to RE-seed, not the
 * assessment a learner sits.
 *
 * THEME: Besprechungen und Protokoll — workplace communication, general B2 and
 * deliberately not nursing-specific. Chosen because it lets one situation carry
 * reading, listening, a discourse choice and two production tasks without any
 * of them feeling bolted on, and because it is well covered by the source
 * books.
 *
 * PROVENANCE. Every item is INSPIRED: the topic, the task pattern and the
 * grammar point come from the audited books; the German is written for
 * Skillcase. Nothing is copied, and every page reference below is one I read —
 * from the Inhalt pages and the Redemittel/Grammatik appendices. No page is
 * cited that I did not see.
 *
 * REVIEW: everything is AUTO_QA_PASS at most. No teacher has read a word of it.
 */

const KONTEXT = "Kontext B2 Kursbuch";
const ASPEKTE = "Aspekte neu B2 Lehrbuch";

/* One provenance stamp, spread onto every item by the seeder. Repeating six
   fields on twenty-four items would be noise, and a per-item override is used
   wherever an item's source genuinely differs. */
const PROV = {
  source_type: "INSPIRED",
  source_book: KONTEXT,
  source_chapter: "11",
  source_module: "M2",
  source_page: "154",
  adaptation_status: "NOT_APPLICABLE",
};

/* ── READING ──────────────────────────────────────────────────────────────
   185 words. Built so the whole-text items cannot be answered locally: the
   author revises his position mid-text, and the thing he still objects to is
   not the thing he was originally worried about. */
const READING = {
  module: "lesen",
  title: "Forum: Müssen Besprechungen wirklich sein?",
  instruction: "Lesen Sie den Forumsbeitrag und beantworten Sie die Fragen.",
  passage: `Bei uns im Betrieb gibt es seit Januar eine neue Regel: Jede Besprechung dauert
höchstens dreißig Minuten, und wer nichts beizutragen hat, muss nicht teilnehmen.

Ich war zunächst skeptisch. Meine Sorge war, dass Entscheidungen dann in kleinen Runden
fallen und der Rest des Teams erst hinterher davon erfährt. Genau das ist an meiner
früheren Stelle passiert.

Nach einem halben Jahr muss ich zugeben, dass ich mich geirrt habe — jedenfalls
teilweise. Die Besprechungen sind tatsächlich kürzer geworden, ohne dass wir weniger
klären. Das liegt aber nicht an der Zeitbegrenzung selbst, sondern daran, dass jetzt
vorher jemand aufschreibt, worum es überhaupt geht. Ohne diese Tagesordnung wäre die
halbe Stunde einfach schneller vorbei, nicht produktiver.

Was mich weiterhin stört, ist das Protokoll. Es wird zwar geschrieben, aber offenbar von
niemandem gelesen. Wer in der Besprechung war, braucht es nicht; wer nicht da war, findet
darin nicht, was er wissen müsste. Solange das so ist, ersetzt es kein Gespräch.

Abschaffen würde ich die Regel trotzdem nicht.`,
  items: [
    { slot: "R1", item_type: "MCQ",
      stem: "Wie beurteilt der Autor die neue Regel insgesamt?",
      options: ["Er hält sie inzwischen für gescheitert.",
                "Er hält sie für wirksam, sieht aber weiterhin ein Problem.",
                "Er findet sie überflüssig, weil sich nichts geändert hat."],
      answer: 1,
      why: "Er würde die Regel „trotzdem nicht abschaffen“, kritisiert aber weiter das Protokoll. Beides zusammen ergibt die Gesamthaltung — der Schlusssatz allein reicht nicht." },

    { slot: "R2", item_type: "TRUE_FALSE",
      stem: "Der Autor sagt, die Besprechungen seien kürzer geworden, ohne dass weniger geklärt wird.",
      answer_value: true,
      why: "„Die Besprechungen sind tatsächlich kürzer geworden, ohne dass wir weniger klären.“" },

    { slot: "R3", item_type: "MCQ",
      stem: "Was räumt der Autor ein?",
      options: ["Dass seine ursprüngliche Befürchtung sich nicht bestätigt hat.",
                "Dass das Protokoll inzwischen gut funktioniert.",
                "Dass er selbst zu selten an Besprechungen teilnimmt."],
      answer: 0,
      why: "„… muss ich zugeben, dass ich mich geirrt habe — jedenfalls teilweise.“ Das Eingeständnis betrifft seine Sorge, nicht das Protokoll: das kritisiert er weiterhin." },

    { slot: "R4", item_type: "MCQ",
      stem: "Worauf führt der Autor die kürzeren Besprechungen zurück?",
      options: ["Auf die Zeitbegrenzung von dreißig Minuten.",
                "Auf die Tagesordnung, die vorher geschrieben wird.",
                "Auf die kleinere Zahl der Teilnehmenden."],
      answer: 1,
      why: "„Das liegt aber nicht an der Zeitbegrenzung selbst, sondern daran, dass jetzt vorher jemand aufschreibt, worum es überhaupt geht.“ Der Text nennt die naheliegende Ursache und verwirft sie ausdrücklich." },

    { slot: "R5", item_type: "MULTI_SELECT",
      stem: "Welche zwei Aussagen treffen auf den Text zu?",
      options: ["Der Autor hat an einer früheren Stelle schlechte Erfahrungen gemacht.",
                "Das Protokoll wird nach Ansicht des Autors kaum genutzt.",
                "Der Autor nimmt selbst nicht mehr an Besprechungen teil.",
                "Die neue Regel gilt erst seit wenigen Wochen."],
      correct: [0, 1],
      why: "„Genau das ist an meiner früheren Stelle passiert“ und „offenbar von niemandem gelesen“. Die Regel gilt seit Januar, also seit einem halben Jahr." },

    { slot: "R6", item_type: "ORDERING",
      stem: "Bringen Sie die Gedankenschritte in die Reihenfolge des Textes.",
      ordering: ["Er nennt, was ihn weiterhin stört.",
                 "Er beschreibt die neue Regel.",
                 "Er räumt ein, dass er sich geirrt hat.",
                 "Er schildert seine anfängliche Sorge."],
      order: [1, 3, 2, 0],
      why: "Regel → anfängliche Sorge → Eingeständnis → verbleibende Kritik. Der Text argumentiert nicht linear positiv, sondern dreht in der Mitte." },
  ],
};

/* ── LISTENING ────────────────────────────────────────────────────────────
   ~60 seconds, heard once. Two things must be caught in passing: the meeting
   moved (the first date is the wrong one), and one speaker checks her own
   understanding — which is the ask_followup item. */
const LISTENING = {
  module: "hoeren",
  audio_id: "core2026b_v1_besprechung",
  instruction: "Hören Sie das Gespräch einmal und beantworten Sie die Fragen.",
  situation: "Im Büro. Zwei Kolleginnen sprechen über die Teambesprechung.",
  plays: 1,
  turns: [
    { voice: "mia", speaker: "Kollegin A",
      text: "Du, die Teambesprechung — die war doch für Dienstag angesetzt, oder?" },
    { voice: "katja", speaker: "Kollegin B",
      text: "War sie, ja. Frau Perkovic hat sie aber verschoben, weil die Zahlen aus dem Vertrieb noch fehlen. Jetzt ist sie am Donnerstag, gleiche Uhrzeit." },
    { voice: "mia", speaker: "Kollegin A",
      text: "Donnerstag um zehn also. Und die Tagesordnung — kommt die noch?" },
    { voice: "katja", speaker: "Kollegin B",
      text: "Die steht schon im gemeinsamen Ordner. Sie hat nur einen Punkt gestrichen: das Thema Homeoffice kommt erst im nächsten Monat dran." },
    { voice: "mia", speaker: "Kollegin A",
      text: "Moment, habe ich das richtig verstanden — Homeoffice wird am Donnerstag gar nicht besprochen?" },
    { voice: "katja", speaker: "Kollegin B",
      text: "Nein, nicht am Donnerstag. Sie will erst die Rückmeldungen abwarten. Ehrlich gesagt finde ich das vernünftig; wir hätten sonst wieder eine Stunde diskutiert und nichts entschieden." },
  ],
  items: [
    { slot: "L1", item_type: "MCQ",
      stem: "Wann findet die Besprechung statt?",
      options: ["Am Dienstag um zehn.", "Am Donnerstag um zehn.", "Erst im nächsten Monat."],
      answer: 1,
      why: "Dienstag war angesetzt und wurde verschoben: „Jetzt ist sie am Donnerstag, gleiche Uhrzeit.“ Wer nur den ersten Wochentag hört, antwortet falsch." },

    { slot: "L2", item_type: "MCQ",
      stem: "Wie bewertet Kollegin B, dass das Thema Homeoffice verschoben wurde?",
      options: ["Sie ärgert sich darüber.",
                "Sie hält es für vernünftig.",
                "Sie hat dazu keine Meinung."],
      answer: 1,
      why: "„Ehrlich gesagt finde ich das vernünftig …“ — die Bewertung steht erst im letzten Satz, nach der Sachinformation." },

    { slot: "L3", item_type: "TRUE_FALSE",
      stem: "Die Tagesordnung ist noch nicht verfügbar.",
      answer_value: false,
      why: "„Die steht schon im gemeinsamen Ordner.“ Gefragt wird danach, ob sie „noch kommt“ — die Antwort ist, dass sie bereits da ist." },

    { slot: "L4", item_type: "MCQ",
      stem: "Warum wurde die Besprechung verschoben?",
      options: ["Weil Zahlen aus dem Vertrieb fehlen.",
                "Weil die Tagesordnung nicht fertig war.",
                "Weil zu wenige Kolleginnen Zeit hatten."],
      answer: 0,
      why: "„… weil die Zahlen aus dem Vertrieb noch fehlen.“" },

    { slot: "L5", item_type: "MATCHING",
      stem: "Welche Funktion hat welche Äußerung?",
      left: ["„Moment, habe ich das richtig verstanden …?“",
             "„Ehrlich gesagt finde ich das vernünftig.“",
             "„Sie hat nur einen Punkt gestrichen.“"],
      right: ["eine Meinung äußern", "sich vergewissern", "eine Information weitergeben"],
      mapping: { 0: 1, 1: 0, 2: 2 },
      why: "„Habe ich richtig verstanden …?“ sichert das eigene Verständnis ab — auf B2 eine eigene Funktion, nicht bloß eine Frage.",
      provenance: { source_chapter: "Redemittel im Überblick", source_module: "Rückfragen stellen",
                    source_page: "182" } },
  ],
};

/* ── LANGUAGE · the eight knowledge items ────────────────────────────────
   Both options are grammatical German in every MCQ. The weaker one is weaker
   for the SITUATION — register, directness, cohesion — never broken. An item a
   learner can pass by spotting an error tests proofreading, not B2. */
const LANGUAGE = {
  module: "sprachbausteine",
  instruction: "Welche Formulierung passt besser?",
  items: [
    { slot: "K1", item_type: "MCQ",
      context: "Sie stimmen einem Vorschlag teilweise zu und machen dann Ihren eigenen Punkt.",
      stem: "Welcher Satz passt besser?",
      options: ["Der Plan kostet Zeit. Ich halte ihn für richtig.",
                "Der Plan kostet zwar Zeit, ich halte ihn aber für richtig."],
      answer: 1,
      why: "„zwar … aber“ räumt den Einwand ein und macht trotzdem den eigenen Punkt. Zwei Sätze nebeneinander zeigen kein Abwägen.",
      provenance: { source_chapter: "9", source_module: "M3", source_page: "128" } },

    { slot: "K2", item_type: "MCQ",
      context: "Sie bringen in der Besprechung eine Idee ein, die ein Vorschlag bleiben soll.",
      stem: "Welcher Satz passt besser?",
      options: ["Wir verschieben den Punkt auf nächste Woche.",
                "Man könnte den Punkt auf nächste Woche verschieben."],
      answer: 1,
      why: "Der Konjunktiv II macht aus einer Ansage einen Vorschlag, über den das Team noch entscheiden darf.",
      provenance: { source_chapter: "4", source_module: "M1", source_page: "54" } },

    { slot: "K3", item_type: "MCQ",
      context: "Sie schreiben eine kurze Notiz an das Team.",
      stem: "Welcher Satz passt besser?",
      options: ["Wegen des fehlenden Berichts verschieben wir die Besprechung.",
                "Wegen dem fehlenden Bericht verschieben wir die Besprechung."],
      answer: 0,
      why: "Gesprochen hört man „wegen dem“ ständig. Geschrieben verlangt „wegen“ den Genitiv.",
      provenance: { source_book: ASPEKTE, source_chapter: "10", source_module: "M3", source_page: "158" } },

    { slot: "K4", item_type: "MCQ",
      context: "Sie begründen im Protokoll, warum ein Punkt vertagt wurde.",
      stem: "Welcher Satz passt besser?",
      options: ["Der Punkt wurde vertagt, weil die Zahlen fehlten und eine Entscheidung ohne sie nicht möglich gewesen wäre.",
                "Der Punkt wurde vertagt. Die Zahlen fehlten. Eine Entscheidung war nicht möglich."],
      answer: 0,
      why: "Auf B2 wird der Zusammenhang im Satzgefüge gebaut, nicht in einer Aufzählung nebeneinandergestellter Hauptsätze." },

    { slot: "K5", item_type: "GAP_FILL",
      text: "In der Besprechung wurde schließlich eine Entscheidung ___, nachdem alle Abteilungen ihre Bedenken ___ hatten.",
      match: "ignore_case",
      gaps: [{ accepted: ["getroffen"] }, { accepted: ["geäußert", "vorgebracht"] }],
      why: "„eine Entscheidung treffen“ und „Bedenken äußern/vorbringen“ — feste Nomen-Verb-Verbindungen, die auf B2 erwartet werden.",
      provenance: { source_chapter: "7", source_module: "M1", source_page: "96" } },

    { slot: "K6", item_type: "GAP_FILL",
      text: "Die ___ der neuen Regel hat die ___ der Besprechungen deutlich verkürzt.",
      match: "ignore_case",
      gaps: [{ accepted: ["Einführung"] }, { accepted: ["Dauer"] }],
      why: "Nominalisierungen wie „Einführung“ und präzise Nomen wie „Dauer“ gehören zum B2-Wortschatz; „das Machen“ und „die Zeit“ wären A2-Ersatz.",
      provenance: { source_book: ASPEKTE, source_chapter: "9", source_module: "M1", source_page: "138" } },

    { slot: "K7", item_type: "MATCHING",
      stem: "Welches Verb gehört zu welchem Nomen?",
      left: ["eine Entscheidung", "Rücksicht", "zur Verfügung", "in Frage"],
      right: ["nehmen", "treffen", "kommen", "stehen"],
      mapping: { 0: 1, 1: 0, 2: 3, 3: 2 },
      why: "eine Entscheidung treffen · Rücksicht nehmen · zur Verfügung stehen · in Frage kommen.",
      provenance: { source_chapter: "7", source_module: "M1", source_page: "96" } },

    { slot: "K8", item_type: "MCQ",
      context: "Eine E-Mail an die Abteilungsleitung.",
      stem: "Welcher Satz passt besser?",
      options: ["Ich wollte nur kurz Bescheid sagen, dass das Meeting geschoben wurde.",
                "Ich möchte Sie darüber informieren, dass die Besprechung verschoben wurde."],
      answer: 1,
      why: "„Bescheid sagen“ und „geschoben“ gehören ins Gespräch. In einer E-Mail an die Leitung kostet das auf B2 Punkte.",
      provenance: { source_chapter: "7", source_module: "M2", source_page: "98" } },

    /* SKILL, not knowledge: the question is what to DO when someone talks over
       you, and all three options are grammatical. */
    { slot: "C1", item_type: "MCQ",
      context: "In der Besprechung unterbricht Sie ein Kollege mitten im Satz.",
      stem: "Welche Reaktion ist auf B2-Niveau angemessen?",
      options: ["Lassen Sie mich bitte ausreden — ich bin gleich fertig.",
                "Ich war noch nicht fertig! Immer unterbrechen Sie mich.",
                "Entschuldigung, dann höre ich auf."],
      answer: 0,
      why: "Man verteidigt den eigenen Redebeitrag sachlich: ohne Vorwurf, aber auch ohne ihn aufzugeben. Der Vorwurf eskaliert, das Aufgeben verschenkt das Wort.",
      provenance: { source_chapter: "Redemittel im Überblick",
                    source_module: "sich nicht unterbrechen lassen", source_page: "183" } },
  ],
};

/* ── PRODUCTION ──────────────────────────────────────────────────────────
   Rubric-scored. No answer keys — the database refuses them on these types and
   so does content_model.js. */
const PRODUCTION = {
  module: "schreiben",
  items: [
    { slot: "P1", item_type: "SHORT_TEXT", rubric_key: "kurzantwort",
      stem: "Fassen Sie in zwei bis drei Sätzen zusammen, was der Autor des Forumsbeitrags über die neue Besprechungsregel denkt. Nennen Sie auch, was er weiterhin kritisiert.",
      min_words: 25, target_words: 40,
      expected: "Eine Zusammenfassung, die die revidierte Position UND die verbliebene Kritik am Protokoll nennt, ohne den Text nachzuerzählen.",
      provenance: { source_chapter: "7", source_module: "M4", source_page: "102" } },

    { slot: "P2", item_type: "SHORT_TEXT", rubric_key: "kurzantwort",
      stem: "Ihre Teamleiterin sagt: „Den Punkt schieben wir auf nächsten Monat.“ Sie sind nicht sicher, welchen Punkt sie meint und ob die Besprechung trotzdem stattfindet. Formulieren Sie zwei höfliche Rückfragen.",
      min_words: 15, target_words: 30,
      expected: "Zwei echte Klärungsfragen in angemessener Höflichkeitsform — nicht eine Wiederholung der Aussage und nicht eine Meinung.",
      provenance: { source_chapter: "Redemittel im Überblick", source_module: "Rückfragen stellen",
                    source_page: "182" } },

    { slot: "W1", item_type: "LONG_TEXT", rubric_key: "forumsbeitrag",
      stem: "In Ihrem Betrieb wird diskutiert, ob Besprechungen durch schriftliche Updates ersetzt werden sollen. Schreiben Sie einen Beitrag für das Intranet-Forum.",
      guidance: ["Sagen Sie, was Sie davon halten.",
                 "Begründen Sie Ihre Position mit mindestens zwei Argumenten.",
                 "Gehen Sie auf einen Nachteil Ihrer eigenen Position ein.",
                 "Machen Sie einen konkreten Vorschlag."],
      min_words: 60, target_words: 90 },
  ],
};

/* ── SPEAKING ────────────────────────────────────────────────────────────
   Outside the comparable core. Captured, transcript-only, never banded. */
const SPEAKING = {
  module: "sprechen",
  slot: "S1", item_type: "SPOKEN_RESPONSE",
  instruction: "Sprechen Sie etwa 60 bis 90 Sekunden.",
  stem: "Manche Teams ersetzen ihre wöchentliche Besprechung durch ein kurzes schriftliches Update. Was halten Sie für sinnvoller? Begründen Sie Ihre Meinung und gehen Sie kurz auf einen Nachteil der anderen Möglichkeit ein.",
  prep_seconds: 30, speak_seconds: 90,
  expected: "Eine klare Position, mindestens zwei Begründungen und ein eingeräumter Punkt der Gegenseite.",
  provenance: { source_chapter: "5", source_module: "M2", source_page: "70" },
};

const V1 = {
  id: "core-2026b-v1",
  group: "core-2026b",
  title: "Skillcase B2 — Einstufung V1",
  theme: "Besprechungen und Protokoll",
  provenance: PROV,
  reading: READING, listening: LISTENING, language: LANGUAGE,
  production: PRODUCTION, speaking: SPEAKING,
};

module.exports = { V1 };
