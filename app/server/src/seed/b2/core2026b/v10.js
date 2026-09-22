/**
 * core-2026b-v10 — SEED DATA. Same rules as v1.js and the versions before it.
 *
 * THEME: Dienstreise und Spesenabrechnung — a new expense process, and
 * whether "simpler" also means "fairer". General B2, not nursing-specific.
 */

const KONTEXT = "Kontext B2 Kursbuch";
const ASPEKTE = "Aspekte neu B2 Lehrbuch";

const PROV = {
  source_type: "INSPIRED", source_book: KONTEXT, source_chapter: "6",
  source_module: "M3", source_page: "86", adaptation_status: "NOT_APPLICABLE",
};

const READING = {
  module: "lesen",
  title: "Forum: Die neue Spesen-App — wirklich einfacher?",
  instruction: "Lesen Sie den Forumsbeitrag und beantworten Sie die Fragen.",
  passage: `Seit Juli rechnen wir Dienstreisen nicht mehr auf Papier ab, sondern über eine App.
Belege werden fotografiert, der Rest geht angeblich automatisch. Ich war zunächst
dagegen, weil ich befürchtet habe, dass ältere Kolleginnen und Kollegen damit
allein gelassen werden.

Nach drei Monaten muss ich zugeben: Die Befürchtung hat sich nur zum Teil
bestätigt. Die meisten kommen gut zurecht, und die Erstattung dauert jetzt eine
Woche statt fast eines Monats. Das liegt aber nicht an der App allein, sondern
daran, dass die Buchhaltung gleichzeitig eine feste Ansprechperson für Fragen
eingeführt hat.

Was mich weiterhin stört, sind Sonderfälle. Wer eine Reise kurzfristig umbuchen
muss oder eine Quittung verliert, findet in der App keinen passenden Weg und
landet am Ende doch wieder beim Papierformular.

Zurück zum alten Verfahren möchte ich trotzdem nicht.`,
  items: [
    { slot: "R1", item_type: "MCQ",
      stem: "Wie beurteilt der Autor die Spesen-App insgesamt?",
      options: ["Er hält sie für gescheitert.",
                "Er hält sie für einen Fortschritt, sieht aber Probleme bei Sonderfällen.",
                "Er findet, sie habe gar nichts verändert."],
      answer: 1,
      why: "Er möchte „trotzdem nicht“ zurück, kritisiert aber weiter die Sonderfälle. Beides zusammen ergibt die Gesamthaltung." },

    { slot: "R2", item_type: "TRUE_FALSE",
      stem: "Die Erstattung dauert jetzt etwa eine Woche.",
      answer_value: true,
      why: "„die Erstattung dauert jetzt eine Woche statt fast eines Monats.“" },

    { slot: "R3", item_type: "MCQ",
      stem: "Was räumt der Autor ein?",
      options: ["Dass seine Befürchtung sich nur zum Teil bestätigt hat.",
                "Dass die App alle Sonderfälle löst.",
                "Dass er die App selbst nie benutzt hat."],
      answer: 0,
      why: "„Nach drei Monaten muss ich zugeben: Die Befürchtung hat sich nur zum Teil bestätigt.“" },

    { slot: "R4", item_type: "MCQ",
      stem: "Worauf führt der Autor die schnellere Erstattung zurück?",
      options: ["Allein auf die neue App.",
                "Auch auf die feste Ansprechperson in der Buchhaltung.",
                "Auf weniger Dienstreisen."],
      answer: 1,
      why: "„Das liegt aber nicht an der App allein, sondern daran, dass die Buchhaltung … eine feste Ansprechperson … eingeführt hat.“" },

    { slot: "R5", item_type: "MULTI_SELECT",
      stem: "Welche zwei Aussagen treffen auf den Text zu?",
      options: ["Belege werden in der App fotografiert.",
                "Bei verlorenen Quittungen hilft die App nicht weiter.",
                "Die App wurde vor zwei Jahren eingeführt.",
                "Der Autor war von Anfang an begeistert."],
      correct: [0, 1],
      why: "„Belege werden fotografiert“ und der Weg zurück zum Papierformular bei verlorenen Quittungen stehen im Text; eingeführt wurde die App im Juli, und der Autor war zunächst dagegen." },

    { slot: "R6", item_type: "ORDERING",
      stem: "Bringen Sie die Gedankenschritte in die Reihenfolge des Textes.",
      ordering: ["Er beschreibt die Umstellung auf die App.",
                 "Er nennt seine ursprüngliche Befürchtung.",
                 "Er räumt ein, dass sie sich nur teilweise bestätigt hat.",
                 "Er benennt die verbleibenden Probleme."],
      order: [0, 1, 2, 3],
      why: "Umstellung → Befürchtung → Eingeständnis → verbleibende Kritik." },
  ],
};

const LISTENING = {
  module: "hoeren",
  audio_id: "core2026b_v10_dienstreise",
  instruction: "Hören Sie das Gespräch einmal und beantworten Sie die Fragen.",
  situation: "Am Telefon. Zwei Kollegen sprechen über eine Dienstreise.",
  plays: 1,
  turns: [
    { voice: "klaus", speaker: "Kollege A",
      text: "Du, die Reise nach Hamburg — da fahren wir doch am Montagmorgen mit dem Zug, oder?" },
    { voice: "katja", speaker: "Kollegin B",
      text: "Das war der Plan, ja. Herr Vogt hat es aber geändert, weil der Termin beim Kunden vorgezogen wurde. Jetzt fahren wir schon am Sonntagabend und übernachten dort." },
    { voice: "klaus", speaker: "Kollege A",
      text: "Sonntagabend also, nicht Montagmorgen. Und das Hotel — bucht das die Assistenz?" },
    { voice: "katja", speaker: "Kollegin B",
      text: "Ja, das bleibt so. Er hat nur eine Sache geändert: Die Belege laden wir diesmal direkt nach der Reise in die App hoch, nicht erst am Monatsende." },
    { voice: "klaus", speaker: "Kollege A",
      text: "Moment, habe ich das richtig verstanden — wir fahren früher, und die Belege müssen sofort danach rein?" },
    { voice: "katja", speaker: "Kollegin B",
      text: "Genau das. Ehrlich gesagt finde ich das praktisch; am Monatsende suche ich die Quittungen sonst immer zusammen." },
  ],
  items: [
    { slot: "L1", item_type: "MCQ",
      stem: "Wann fahren die beiden nach Hamburg?",
      options: ["Am Montagmorgen.", "Am Sonntagabend.", "Am Freitagnachmittag."],
      answer: 1,
      why: "Montagmorgen war der Plan und wurde geändert: „Jetzt fahren wir schon am Sonntagabend.“" },

    { slot: "L2", item_type: "MCQ",
      stem: "Wie bewertet Kollegin B die neue Regel für die Belege?",
      options: ["Sie findet sie umständlich.",
                "Sie findet sie praktisch.",
                "Sie hat dazu keine Meinung."],
      answer: 1,
      why: "„Ehrlich gesagt finde ich das praktisch“ — die Bewertung steht im letzten Satz." },

    { slot: "L3", item_type: "TRUE_FALSE",
      stem: "Die Kollegen müssen das Hotel selbst buchen.",
      answer_value: false,
      why: "„Ja, das bleibt so.“ — die Assistenz bucht das Hotel weiterhin." },

    { slot: "L4", item_type: "MCQ",
      stem: "Warum wurde die Abfahrt geändert?",
      options: ["Weil der Termin beim Kunden vorgezogen wurde.",
                "Weil der Zug am Montag ausfällt.",
                "Weil das Hotel ausgebucht war."],
      answer: 0,
      why: "„weil der Termin beim Kunden vorgezogen wurde.“" },

    { slot: "L5", item_type: "MATCHING",
      stem: "Welche Funktion hat welche Äußerung?",
      left: ["„Moment, habe ich das richtig verstanden …?“",
             "„Ehrlich gesagt finde ich das praktisch.“",
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
      context: "Sie stimmen der neuen App teilweise zu und machen dann Ihren eigenen Punkt.",
      stem: "Welcher Satz passt besser?",
      options: ["Die App spart Zeit. Sonderfälle bleiben schwierig.",
                "Die App spart zwar Zeit, Sonderfälle bleiben aber schwierig."],
      answer: 1,
      why: "„zwar … aber“ räumt den Vorteil ein und setzt den Einwand dagegen.",
      provenance: { source_chapter: "9", source_module: "M3", source_page: "128" } },

    { slot: "K2", item_type: "MCQ",
      context: "Sie schlagen eine Lösung für Sonderfälle vor, ohne sie zu fordern.",
      stem: "Welcher Satz passt besser?",
      options: ["Wir brauchen ein Formular für Sonderfälle in der App.",
                "Ein Formular für Sonderfälle in der App wäre vielleicht sinnvoll."],
      answer: 1,
      why: "Der Konjunktiv II macht aus einer Forderung einen Vorschlag.",
      provenance: { source_chapter: "4", source_module: "M1", source_page: "54" } },

    { slot: "K3", item_type: "MCQ",
      context: "Sie schreiben eine kurze Notiz an die Buchhaltung.",
      stem: "Welcher Satz passt besser?",
      options: ["Trotz des verlorenen Belegs bitte ich um Erstattung.",
                "Trotz dem verlorenen Beleg bitte ich um Erstattung."],
      answer: 0,
      why: "Gesprochen ist „trotz dem“ verbreitet. Geschrieben verlangt „trotz“ den Genitiv.",
      provenance: { source_book: ASPEKTE, source_chapter: "10", source_module: "M3", source_page: "158" } },

    { slot: "K4", item_type: "MCQ",
      context: "Sie begründen in einer E-Mail, warum die Reise umgebucht wurde.",
      stem: "Welcher Satz passt besser?",
      options: ["Die Reise wurde umgebucht, weil der Kunde den Termin vorgezogen hat und wir sonst zu spät angekommen wären.",
                "Die Reise wurde umgebucht. Der Kunde hat den Termin vorgezogen. Wir wären zu spät gekommen."],
      answer: 0,
      why: "Auf B2 wird der Zusammenhang im Satzgefüge gebaut, nicht in einer Aufzählung von Hauptsätzen." },

    { slot: "K5", item_type: "GAP_FILL",
      text: "Die Buchhaltung hat die Kosten schließlich ___, nachdem ich den fehlenden Beleg ___ hatte.",
      match: "ignore_case",
      gaps: [{ accepted: ["erstattet", "übernommen"] }, { accepted: ["nachgereicht", "eingereicht"] }],
      why: "„Kosten erstatten/übernehmen“ und „einen Beleg nachreichen/einreichen“ — feste Verbindungen auf B2-Niveau.",
      provenance: { source_chapter: "7", source_module: "M1", source_page: "96" } },

    { slot: "K6", item_type: "GAP_FILL",
      text: "Die ___ der Belege läuft jetzt digital; nur die ___ von Sonderfällen ist noch unklar.",
      match: "ignore_case",
      gaps: [{ accepted: ["Erfassung", "Abrechnung"] }, { accepted: ["Behandlung", "Bearbeitung"] }],
      why: "Nominalisierungen wie „Erfassung“ und „Behandlung“ gehören zum B2-Wortschatz.",
      provenance: { source_book: ASPEKTE, source_chapter: "9", source_module: "M1", source_page: "138" } },

    { slot: "K7", item_type: "MATCHING",
      stem: "Welches Verb gehört zu welchem Nomen?",
      left: ["eine Reise", "Kosten", "einen Antrag", "in Kauf"],
      right: ["stellen", "antreten", "nehmen", "tragen"],
      mapping: { 0: 1, 1: 3, 2: 0, 3: 2 },
      why: "eine Reise antreten · Kosten tragen · einen Antrag stellen · etwas in Kauf nehmen.",
      provenance: { source_chapter: "7", source_module: "M1", source_page: "96" } },

    { slot: "K8", item_type: "MCQ",
      context: "Eine E-Mail an die Buchhaltung.",
      stem: "Welcher Satz passt besser?",
      options: ["Hab die Quittung verschlampt, geht das trotzdem?",
                "Leider ist mir die Quittung abhandengekommen. Ich bitte Sie um Auskunft, wie ich in diesem Fall vorgehen kann."],
      answer: 1,
      why: "„verschlampt“ gehört ins Gespräch. In einer E-Mail an die Buchhaltung kostet das auf B2 Punkte.",
      provenance: { source_chapter: "7", source_module: "M2", source_page: "98" } },

    { slot: "C1", item_type: "MCQ",
      context: "In einer Besprechung zweifelt jemand Ihre Reisekosten an, bevor Sie sie erklärt haben.",
      stem: "Welche Reaktion ist auf B2-Niveau angemessen?",
      options: ["Darf ich die Kosten kurz erklären? Danach ist der Punkt sicher klarer.",
                "Die Kosten stimmen, Punkt.",
                "Dann zahle ich es eben selbst."],
      answer: 0,
      why: "Man behält den eigenen Beitrag und bietet die Klärung an — ohne Rückzug und ohne Konfrontation.",
      provenance: { source_chapter: "Redemittel im Überblick",
                    source_module: "sich nicht unterbrechen lassen", source_page: "183" } },
  ],
};

const PRODUCTION = {
  module: "schreiben",
  items: [
    { slot: "P1", item_type: "SHORT_TEXT", rubric_key: "kurzantwort",
      stem: "Fassen Sie in zwei bis drei Sätzen zusammen, wie der Autor die neue Spesen-App beurteilt. Nennen Sie auch, was ihn weiterhin stört.",
      min_words: 25, target_words: 40,
      expected: "Eine Zusammenfassung, die die revidierte Befürchtung, die schnellere Erstattung UND die Probleme bei Sonderfällen nennt.",
      provenance: { source_chapter: "7", source_module: "M4", source_page: "102" } },

    { slot: "P2", item_type: "SHORT_TEXT", rubric_key: "kurzantwort",
      stem: "Die Buchhaltung schreibt: „Bitte reichen Sie die Belege zeitnah ein.“ Sie sind nicht sicher, was „zeitnah“ genau bedeutet und ob Fotos genügen. Formulieren Sie zwei höfliche Rückfragen.",
      min_words: 15, target_words: 30,
      expected: "Zwei echte Klärungsfragen in angemessener Höflichkeitsform.",
      provenance: { source_chapter: "Redemittel im Überblick", source_module: "Rückfragen stellen",
                    source_page: "182" } },

    { slot: "W1", item_type: "LONG_TEXT", rubric_key: "forumsbeitrag",
      stem: "In Ihrem Betrieb wird diskutiert, ob Dienstreisen künftig grundsätzlich durch Videokonferenzen ersetzt werden sollen, wenn es möglich ist. Schreiben Sie einen Beitrag für das Intranet-Forum.",
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
  stem: "Manche Firmen bestehen auf persönlichen Kundenbesuchen, andere setzen fast nur noch auf Videokonferenzen. Was halten Sie für sinnvoller? Begründen Sie Ihre Meinung und gehen Sie kurz auf einen Nachteil der anderen Möglichkeit ein.",
  prep_seconds: 30, speak_seconds: 90,
  expected: "Eine klare Position, mindestens zwei Begründungen und ein eingeräumter Punkt der Gegenseite.",
  provenance: { source_chapter: "5", source_module: "M2", source_page: "70" },
};

const V10 = {
  id: "core-2026b-v10",
  group: "core-2026b",
  title: "Skillcase B2 — Einstufung V10",
  theme: "Dienstreise und Spesenabrechnung",
  provenance: PROV,
  reading: READING, listening: LISTENING, language: LANGUAGE,
  production: PRODUCTION, speaking: SPEAKING,
};

module.exports = { V10 };
