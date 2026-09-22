/**
 * core-2026b-v5 — SEED DATA. Same rules as v1.js/v4.js: seed convenience
 * only, database authoritative (blueprint.js), every item INSPIRED, review
 * AUTO_QA_PASS at most.
 *
 * THEME: Homeoffice-Regelung — a new remote-work policy, and how far trust
 * without daily check-ins actually stretches. General B2, not nursing.
 */

const KONTEXT = "Kontext B2 Kursbuch";
const ASPEKTE = "Aspekte neu B2 Lehrbuch";

const PROV = {
  source_type: "INSPIRED", source_book: KONTEXT, source_chapter: "5",
  source_module: "M2", source_page: "70", adaptation_status: "NOT_APPLICABLE",
};

const READING = {
  module: "lesen",
  title: "Forum: Vertrauensarbeitszeit — nur ein Vorteil?",
  instruction: "Lesen Sie den Forumsbeitrag und beantworten Sie die Fragen.",
  passage: `Seit einem Jahr können wir bei uns im Betrieb unsere Arbeitszeit frei einteilen,
solange die Aufgaben erledigt werden. Am Anfang war ich begeistert: keine Stechuhr
mehr, keine Diskussion darüber, wer wann kommt. Inzwischen sehe ich das nüchterner.

Der Vorteil ist real: Wer abends produktiver ist, muss sich nicht mehr morgens zur
Arbeit zwingen. Auch Arzttermine oder die Kinderbetreuung lassen sich leichter
unterbringen.

Was mir dagegen zu schaffen macht, ist die stille Erwartung, immer erreichbar zu
sein. Offiziell hat niemand das verlangt. Trotzdem antworte ich abends auf Nachrichten,
aus Sorge, sonst als weniger engagiert zu gelten.

Nach einem Gespräch mit meiner Teamleiterin sehe ich das differenzierter. Sie hat mir
klar gesagt, dass diese Erwartung nicht von ihr kommt — und dass ich das ernster nehmen
sollte als jede ungeschriebene Regel im Team.

Ganz abschaffen würde ich die Regelung deshalb trotzdem nicht.`,
  items: [
    { slot: "R1", item_type: "MCQ",
      stem: "Wie beurteilt die Autorin die Vertrauensarbeitszeit insgesamt?",
      options: ["Sie hält sie für gescheitert und will zur Stechuhr zurück.",
                "Sie sieht echte Vorteile, aber auch ein ungelöstes Problem.",
                "Sie findet sie überflüssig, weil sich nichts geändert hat."],
      answer: 1,
      why: "Sie würde die Regelung „trotzdem nicht“ abschaffen, benennt aber weiterhin die stille Erwartung als Problem. Beides zusammen ergibt die Gesamthaltung." },

    { slot: "R2", item_type: "TRUE_FALSE",
      stem: "Die Teamleiterin hat die ständige Erreichbarkeit offiziell verlangt.",
      answer_value: false,
      why: "„Offiziell hat niemand das verlangt“ — die Erwartung ist ungeschrieben, nicht angeordnet." },

    { slot: "R3", item_type: "MCQ",
      stem: "Was räumt die Autorin ein?",
      options: ["Dass die Erwartung, immer erreichbar zu sein, nicht von der Teamleiterin kommt.",
                "Dass die Vertrauensarbeitszeit ihr gar nichts bringt.",
                "Dass sie selbst nie abends antwortet."],
      answer: 0,
      why: "„Sie hat mir klar gesagt, dass diese Erwartung nicht von ihr kommt“ — das Gespräch korrigiert ihre Annahme." },

    { slot: "R4", item_type: "MCQ",
      stem: "Warum antwortet die Autorin abends auf Nachrichten?",
      options: ["Aus Sorge, sonst als weniger engagiert zu gelten.",
                "Weil die Teamleiterin es ausdrücklich verlangt.",
                "Weil ihr Vertrag das vorschreibt."],
      answer: 0,
      why: "„aus Sorge, sonst als weniger engagiert zu gelten“ — der Text nennt diesen Grund direkt." },

    { slot: "R5", item_type: "MULTI_SELECT",
      stem: "Welche zwei Aussagen treffen auf den Text zu?",
      options: ["Arzttermine lassen sich seit der neuen Regelung leichter unterbringen.",
                "Die Teamleiterin verlangt abendliche Erreichbarkeit.",
                "Die Regelung gilt seit einem Jahr.",
                "Die Autorin will vollständig zur Stechuhr zurück."],
      correct: [0, 2],
      why: "„Arzttermine … lassen sich leichter unterbringen“ und „seit einem Jahr“ stehen explizit im Text; die Teamleiterin verlangt Erreichbarkeit gerade NICHT, und zur Stechuhr will die Autorin nicht zurück." },

    { slot: "R6", item_type: "ORDERING",
      stem: "Bringen Sie die Gedankenschritte in die Reihenfolge des Textes.",
      ordering: ["Sie beschreibt ihre anfängliche Begeisterung.",
                 "Sie benennt die stille Erwartung, die sie belastet.",
                 "Ein Gespräch korrigiert ihre Annahme.",
                 "Sie zieht ihr abschließendes Fazit."],
      order: [0, 1, 2, 3],
      why: "Begeisterung → belastende Erwartung → korrigierendes Gespräch → Fazit. Der Text bewegt sich linear von der ersten Reaktion zur abschließenden Haltung." },
  ],
};

const LISTENING = {
  module: "hoeren",
  audio_id: "core2026b_v5_homeoffice",
  instruction: "Hören Sie das Gespräch einmal und beantworten Sie die Fragen.",
  situation: "Im Büro. Zwei Kollegen sprechen über die neue Homeoffice-Regelung.",
  plays: 1,
  turns: [
    { voice: "klaus", speaker: "Kollege A",
      text: "Du, die neue Homeoffice-Regelung — da sind doch zwei Tage pro Woche fest vorgesehen, oder?" },
    { voice: "mia", speaker: "Kollegin B",
      text: "War der erste Entwurf, ja. Frau Albrecht hat das aber noch mal überarbeitet, weil die Auslastung im Kundenservice schwankt. Jetzt sind es drei Tage, flexibel wählbar." },
    { voice: "klaus", speaker: "Kollege A",
      text: "Drei Tage flexibel also, nicht zwei fest. Und die Kernzeit — bleibt die?" },
    { voice: "mia", speaker: "Kollegin B",
      text: "Die fällt komplett weg. Sie hat nur eine Bedingung ergänzt: An mindestens einem Bürotag pro Woche müssen alle gemeinsam da sein." },
    { voice: "klaus", speaker: "Kollege A",
      text: "Moment, habe ich das richtig verstanden — wir wählen die drei Tage frei, aber ein bestimmter Tag ist trotzdem für alle Pflicht?" },
    { voice: "mia", speaker: "Kollegin B",
      text: "Genau das. Ehrlich gesagt finde ich das sinnvoll; sonst sitzt am Ende nie das ganze Team gleichzeitig im Büro." },
  ],
  items: [
    { slot: "L1", item_type: "MCQ",
      stem: "Wie viele Homeoffice-Tage pro Woche sind es am Ende?",
      options: ["Zwei, fest vorgegeben.", "Drei, frei wählbar.", "Vier, mit Kernzeit."],
      answer: 1,
      why: "Zwei feste Tage war der erste Entwurf und wurde ersetzt: „Jetzt sind es drei Tage, flexibel wählbar.“" },

    { slot: "L2", item_type: "MCQ",
      stem: "Wie bewertet Kollegin B den gemeinsamen Pflichttag?",
      options: ["Sie hält ihn für überflüssig.",
                "Sie hält ihn für sinnvoll.",
                "Sie hat dazu keine Meinung."],
      answer: 1,
      why: "„Ehrlich gesagt finde ich das sinnvoll“ — die Bewertung steht erst im letzten Satz." },

    { slot: "L3", item_type: "TRUE_FALSE",
      stem: "Die feste Kernzeit bleibt in der neuen Regelung bestehen.",
      answer_value: false,
      why: "„Die fällt komplett weg.“" },

    { slot: "L4", item_type: "MCQ",
      stem: "Warum wurde der erste Entwurf überarbeitet?",
      options: ["Weil die Auslastung im Kundenservice schwankt.",
                "Weil zu wenige Mitarbeitende Homeoffice wollten.",
                "Weil die Technik nicht ausreichte."],
      answer: 0,
      why: "„weil die Auslastung im Kundenservice schwankt.“" },

    { slot: "L5", item_type: "MATCHING",
      stem: "Welche Funktion hat welche Äußerung?",
      left: ["„Moment, habe ich das richtig verstanden …?“",
             "„Ehrlich gesagt finde ich das sinnvoll.“",
             "„Sie hat nur eine Bedingung ergänzt.“"],
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
      context: "Sie stimmen der neuen Regelung teilweise zu und machen dann Ihren eigenen Punkt.",
      stem: "Welcher Satz passt besser?",
      options: ["Die Regelung bringt mehr Freiheit. Der Druck bleibt trotzdem.",
                "Die Regelung bringt zwar mehr Freiheit, der Druck bleibt aber trotzdem."],
      answer: 1,
      why: "„zwar … aber“ räumt den Vorteil ein und setzt zugleich den Einwand dagegen. Zwei Sätze nebeneinander zeigen kein Abwägen.",
      provenance: { source_chapter: "9", source_module: "M3", source_page: "128" } },

    { slot: "K2", item_type: "MCQ",
      context: "Sie bringen eine Änderung ins Gespräch, die noch verhandelbar bleiben soll.",
      stem: "Welcher Satz passt besser?",
      options: ["Wir führen einen festen Bürotag pro Woche ein.",
                "Man könnte einen festen Bürotag pro Woche einführen."],
      answer: 1,
      why: "Der Konjunktiv II macht aus einer Ansage einen Vorschlag, über den das Team noch entscheiden darf.",
      provenance: { source_chapter: "4", source_module: "M1", source_page: "54" } },

    { slot: "K3", item_type: "MCQ",
      context: "Sie schreiben eine kurze Notiz an das Team.",
      stem: "Welcher Satz passt besser?",
      options: ["Aufgrund dem neuen Plan ändert sich der Bürotag.",
                "Aufgrund des neuen Plans ändert sich der Bürotag."],
      answer: 1,
      why: "Gesprochen hört man „aufgrund dem“ gelegentlich. Geschrieben verlangt „aufgrund“ den Genitiv.",
      provenance: { source_book: ASPEKTE, source_chapter: "10", source_module: "M3", source_page: "158" } },

    { slot: "K4", item_type: "MCQ",
      context: "Sie begründen im Protokoll, warum die Kernzeit abgeschafft wurde.",
      stem: "Welcher Satz passt besser?",
      options: ["Die Kernzeit wurde abgeschafft, weil sie der tatsächlichen Arbeitsweise vieler Teams nicht mehr entsprach.",
                "Die Kernzeit wurde abgeschafft. Sie passte nicht mehr. Viele Teams arbeiten anders."],
      answer: 0,
      why: "Auf B2 wird der Zusammenhang im Satzgefüge gebaut, nicht in einer Aufzählung nebeneinandergestellter Hauptsätze." },

    { slot: "K5", item_type: "GAP_FILL",
      text: "Die neue Regelung wurde nach längerer Diskussion schließlich ___, nachdem das Team seine Bedenken ___ hatte.",
      match: "ignore_case",
      gaps: [{ accepted: ["eingeführt", "beschlossen"] }, { accepted: ["geäußert", "vorgebracht"] }],
      why: "„eine Regelung einführen/beschließen“ und „Bedenken äußern/vorbringen“ — feste Verbindungen, die auf B2 erwartet werden.",
      provenance: { source_chapter: "7", source_module: "M1", source_page: "96" } },

    { slot: "K6", item_type: "GAP_FILL",
      text: "Die ___ der Arbeitszeit hat die ___ vieler Mitarbeitender spürbar erhöht.",
      match: "ignore_case",
      gaps: [{ accepted: ["Flexibilisierung"] }, { accepted: ["Zufriedenheit"] }],
      why: "Nominalisierungen wie „Flexibilisierung“ und präzise Nomen wie „Zufriedenheit“ gehören zum B2-Wortschatz; „das Flexiblermachen“ wäre der A2-Ersatz.",
      provenance: { source_book: ASPEKTE, source_chapter: "9", source_module: "M1", source_page: "138" } },

    { slot: "K7", item_type: "MATCHING",
      stem: "Welches Verb gehört zu welchem Nomen?",
      left: ["eine Regelung", "Vertrauen", "zur Verfügung", "in Frage"],
      right: ["kommen", "treffen", "genießen", "stehen"],
      mapping: { 0: 1, 1: 2, 2: 3, 3: 0 },
      why: "eine Regelung treffen · Vertrauen genießen · zur Verfügung stehen · in Frage kommen.",
      provenance: { source_chapter: "7", source_module: "M1", source_page: "96" } },

    { slot: "K8", item_type: "MCQ",
      context: "Eine E-Mail an die Abteilungsleitung.",
      stem: "Welcher Satz passt besser?",
      options: ["Ich wollte nur kurz sagen, dass der Bürotag jetzt anders läuft.",
                "Ich möchte Sie darüber informieren, dass sich der gemeinsame Bürotag geändert hat."],
      answer: 1,
      why: "„nur kurz sagen“ gehört ins Gespräch. In einer E-Mail an die Leitung kostet das auf B2 Punkte.",
      provenance: { source_chapter: "7", source_module: "M2", source_page: "98" } },

    { slot: "C1", item_type: "MCQ",
      context: "In einer Videokonferenz unterbricht Sie eine Kollegin mitten im Satz.",
      stem: "Welche Reaktion ist auf B2-Niveau angemessen?",
      options: ["Lassen Sie mich den Gedanken bitte kurz zu Ende führen — dann übergebe ich gern.",
                "Ich war noch nicht fertig! Man kann mich ja nie ausreden lassen.",
                "Schon gut, sagen Sie einfach, was Sie meinen."],
      answer: 0,
      why: "Man behält den eigenen Redebeitrag sachlich, ohne Vorwurf und ohne ihn aufzugeben. Der Vorwurf eskaliert, das Aufgeben verschenkt das Wort.",
      provenance: { source_chapter: "Redemittel im Überblick",
                    source_module: "sich nicht unterbrechen lassen", source_page: "183" } },
  ],
};

const PRODUCTION = {
  module: "schreiben",
  items: [
    { slot: "P1", item_type: "SHORT_TEXT", rubric_key: "kurzantwort",
      stem: "Fassen Sie in zwei bis drei Sätzen zusammen, wie sich die Haltung der Autorin zur Vertrauensarbeitszeit entwickelt hat. Nennen Sie auch, was sie weiterhin belastet.",
      min_words: 25, target_words: 40,
      expected: "Eine Zusammenfassung, die die anfängliche Begeisterung, die korrigierte Annahme UND die verbleibende Belastung (stille Erwartung der Erreichbarkeit) nennt, ohne den Text nachzuerzählen.",
      provenance: { source_chapter: "7", source_module: "M4", source_page: "102" } },

    { slot: "P2", item_type: "SHORT_TEXT", rubric_key: "kurzantwort",
      stem: "Ihre Teamleiterin schreibt: „Ab nächster Woche gilt die neue Regelung.“ Sie sind nicht sicher, ob das für alle Abteilungen gilt und ob eine Übergangszeit vorgesehen ist. Formulieren Sie zwei höfliche Rückfragen.",
      min_words: 15, target_words: 30,
      expected: "Zwei echte Klärungsfragen in angemessener Höflichkeitsform — nicht eine Wiederholung der Aussage und nicht eine Meinung.",
      provenance: { source_chapter: "Redemittel im Überblick", source_module: "Rückfragen stellen",
                    source_page: "182" } },

    { slot: "W1", item_type: "LONG_TEXT", rubric_key: "forumsbeitrag",
      stem: "In Ihrem Betrieb wird diskutiert, ob feste Kernarbeitszeiten wieder eingeführt werden sollen, um die ständige Erreichbarkeit zu begrenzen. Schreiben Sie einen Beitrag für das Intranet-Forum.",
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
  stem: "Manche Firmen erwarten von Mitarbeitenden im Homeoffice, außerhalb der Arbeitszeit erreichbar zu bleiben. Was halten Sie davon? Begründen Sie Ihre Meinung und gehen Sie kurz auf einen Nachteil der entgegengesetzten Position ein.",
  prep_seconds: 30, speak_seconds: 90,
  expected: "Eine klare Position, mindestens zwei Begründungen und ein eingeräumter Punkt der Gegenseite.",
  provenance: { source_chapter: "5", source_module: "M2", source_page: "70" },
};

const V5 = {
  id: "core-2026b-v5",
  group: "core-2026b",
  title: "Skillcase B2 — Einstufung V5",
  theme: "Homeoffice-Regelung",
  provenance: PROV,
  reading: READING, listening: LISTENING, language: LANGUAGE,
  production: PRODUCTION, speaking: SPEAKING,
};

module.exports = { V5 };
