/**
 * core-2026b-v8 — SEED DATA. Same rules as v1.js and the versions before it.
 *
 * THEME: Bürowechsel und Umzug — an office move, and how much say the team
 * actually got in the new layout. General B2, not nursing-specific.
 */

const KONTEXT = "Kontext B2 Kursbuch";
const ASPEKTE = "Aspekte neu B2 Lehrbuch";

const PROV = {
  source_type: "INSPIRED", source_book: KONTEXT, source_chapter: "10",
  source_module: "M3", source_page: "158", adaptation_status: "NOT_APPLICABLE",
};

const READING = {
  module: "lesen",
  title: "Forum: Der neue Bürostandort — Mitsprache oder nur Information?",
  instruction: "Lesen Sie den Forumsbeitrag und beantworten Sie die Fragen.",
  passage: `Vor sechs Monaten wurde angekündigt, dass unser Standort umzieht. Meine erste
Reaktion war Skepsis: Eine solche Entscheidung wird doch längst von oben
getroffen, dachte ich, und wir dürfen höchstens noch über die Farbe der Wände
mitreden.

Tatsächlich gab es zu Beginn nur eine Information, keine Beteiligung. Das hat
sich aber geändert, als drei Kolleginnen aus verschiedenen Abteilungen eine
Arbeitsgruppe gegründet haben. Sie haben konkrete Vorschläge zur Raumaufteilung
eingereicht — und tatsächlich wurden zwei davon übernommen: mehr Ruheräume und
eine zentrale Küche statt kleiner Teeküchen auf jeder Etage.

Nach diesem Prozess sehe ich die Sache differenzierter. Es stimmt, dass die
grundlegende Entscheidung längst feststand. Aber innerhalb dieses Rahmens
gab es tatsächlich Raum für echten Einfluss — nur eben nicht automatisch,
sondern nur, weil sich jemand dafür eingesetzt hat.

Was mich weiterhin stört, ist die kurze Zeit, die für Rückmeldungen blieb: Nur
zwei Wochen zwischen Vorstellung der Pläne und endgültiger Entscheidung.

Am Umzug selbst würde ich trotzdem nichts mehr ändern wollen.`,
  items: [
    { slot: "R1", item_type: "MCQ",
      stem: "Wie beurteilt die Autorin den Beteiligungsprozess insgesamt?",
      options: ["Sie hält ihn für reine Show ohne echten Einfluss.",
                "Sie sieht echten Einfluss, kritisiert aber weiterhin die kurze Rückmeldefrist.",
                "Sie findet, die Entscheidung hätte komplett dem Team überlassen werden sollen."],
      answer: 1,
      why: "Sie würde am Umzug „trotzdem nichts mehr ändern“, kritisiert aber weiter die kurze Frist für Rückmeldungen. Beides zusammen ergibt die Gesamthaltung." },

    { slot: "R2", item_type: "TRUE_FALSE",
      stem: "Zwei Vorschläge der Arbeitsgruppe wurden tatsächlich übernommen.",
      answer_value: true,
      why: "„tatsächlich wurden zwei davon übernommen: mehr Ruheräume und eine zentrale Küche“." },

    { slot: "R3", item_type: "MCQ",
      stem: "Was räumt die Autorin ein?",
      options: ["Dass innerhalb der feststehenden Entscheidung tatsächlich Raum für Einfluss bestand.",
                "Dass die Arbeitsgruppe am Ende gar nichts erreicht hat.",
                "Dass sie selbst nie an dem Prozess interessiert war."],
      answer: 0,
      why: "„Aber innerhalb dieses Rahmens gab es tatsächlich Raum für echten Einfluss“ — das Eingeständnis korrigiert ihre anfängliche Skepsis." },

    { slot: "R4", item_type: "MCQ",
      stem: "Wodurch kam die Beteiligung überhaupt zustande?",
      options: ["Weil drei Kolleginnen eine Arbeitsgruppe gegründet haben.",
                "Weil die Geschäftsleitung von sich aus dazu einlud.",
                "Weil eine externe Beratung das vorschrieb."],
      answer: 0,
      why: "„als drei Kolleginnen aus verschiedenen Abteilungen eine Arbeitsgruppe gegründet haben.“" },

    { slot: "R5", item_type: "MULTI_SELECT",
      stem: "Welche zwei Aussagen treffen auf den Text zu?",
      options: ["Zu Beginn gab es nur Information, keine Beteiligung.",
                "Die Rückmeldefrist betrug zwei Wochen.",
                "Die Autorin lehnt den Umzug bis heute grundsätzlich ab.",
                "Auf jeder Etage gibt es jetzt eine eigene Teeküche."],
      correct: [0, 1],
      why: "„zu Beginn nur eine Information, keine Beteiligung“ und „nur zwei Wochen“ stehen explizit im Text; abgelehnt wird der Umzug am Ende nicht, und die Teeküchen wurden gerade zentralisiert." },

    { slot: "R6", item_type: "ORDERING",
      stem: "Bringen Sie die Gedankenschritte in die Reihenfolge des Textes.",
      ordering: ["Sie beschreibt ihre anfängliche Skepsis.",
                 "Eine Arbeitsgruppe bringt konkrete Vorschläge ein.",
                 "Sie erkennt echten Einfluss innerhalb des Rahmens an.",
                 "Sie benennt, was sie an der Frist weiterhin stört."],
      order: [0, 1, 2, 3],
      why: "Skepsis → Arbeitsgruppe → anerkannter Einfluss → verbleibende Kritik. Der Text bewegt sich chronologisch von der ersten Reaktion zur abschließenden Haltung." },
  ],
};

const LISTENING = {
  module: "hoeren",
  audio_id: "core2026b_v8_buerowechsel",
  instruction: "Hören Sie das Gespräch einmal und beantworten Sie die Fragen.",
  situation: "Im Flur. Zwei Kollegen sprechen über die Umzugsplanung.",
  plays: 1,
  turns: [
    { voice: "conrad", speaker: "Kollege A",
      text: "Du, der Umzugstermin — der war doch für Ende März geplant, oder?" },
    { voice: "katja", speaker: "Kollegin B",
      text: "War der erste Plan, ja. Frau Ostermann hat das aber noch mal verschoben, weil die neuen Möbel erst Mitte April geliefert werden. Jetzt ist der Umzug für das letzte Aprilwochenende angesetzt." },
    { voice: "conrad", speaker: "Kollege A",
      text: "Letztes Aprilwochenende also, nicht Ende März. Und unsere Etage — bleiben wir zusammen?" },
    { voice: "katja", speaker: "Kollegin B",
      text: "Ja, das bleibt so wie geplant. Sie hat nur eine Sache geändert: Die Kartons müssen jetzt schon eine Woche vorher gepackt und beschriftet sein." },
    { voice: "conrad", speaker: "Kollege A",
      text: "Moment, habe ich das richtig verstanden — der Termin selbst verschiebt sich, aber die Vorbereitung fängt trotzdem früher an?" },
    { voice: "katja", speaker: "Kollegin B",
      text: "Genau das. Ehrlich gesagt finde ich das sinnvoll; sonst wird es am Umzugswochenende selbst zu hektisch." },
  ],
  items: [
    { slot: "L1", item_type: "MCQ",
      stem: "Wann findet der Umzug jetzt statt?",
      options: ["Ende März.", "Am letzten Aprilwochenende.", "Erst im Mai."],
      answer: 1,
      why: "Ende März war der erste Plan und wurde ersetzt: „Jetzt ist der Umzug für das letzte Aprilwochenende angesetzt.“" },

    { slot: "L2", item_type: "MCQ",
      stem: "Wie bewertet Kollegin B die frühere Kartonpackfrist?",
      options: ["Sie hält sie für übertrieben.",
                "Sie hält sie für sinnvoll.",
                "Sie hat dazu keine Meinung."],
      answer: 1,
      why: "„Ehrlich gesagt finde ich das sinnvoll“ — die Bewertung steht erst im letzten Satz." },

    { slot: "L3", item_type: "TRUE_FALSE",
      stem: "Das Team wird bei dem Umzug auf verschiedene Etagen verteilt.",
      answer_value: false,
      why: "„Ja, das bleibt so wie geplant“ — auf die Frage, ob das Team zusammenbleibt." },

    { slot: "L4", item_type: "MCQ",
      stem: "Warum wurde der Umzugstermin verschoben?",
      options: ["Weil die neuen Möbel erst Mitte April geliefert werden.",
                "Weil das neue Gebäude noch nicht fertig ist.",
                "Weil zu wenige Mitarbeitende Zeit hatten."],
      answer: 0,
      why: "„weil die neuen Möbel erst Mitte April geliefert werden.“" },

    { slot: "L5", item_type: "MATCHING",
      stem: "Welche Funktion hat welche Äußerung?",
      left: ["„Moment, habe ich das richtig verstanden …?“",
             "„Ehrlich gesagt finde ich das sinnvoll.“",
             "„Sie hat nur eine Sache geändert.“"],
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
      context: "Sie stimmen der ursprünglichen Kritik teilweise zu und machen dann Ihren eigenen Punkt.",
      stem: "Welcher Satz passt besser?",
      options: ["Die Entscheidung stand fest. Wir konnten trotzdem etwas bewegen.",
                "Die Entscheidung stand zwar fest, wir konnten aber trotzdem etwas bewegen."],
      answer: 1,
      why: "„zwar … aber“ räumt die Einschränkung ein und setzt zugleich den Erfolg dagegen. Zwei Sätze nebeneinander zeigen kein Abwägen.",
      provenance: { source_chapter: "9", source_module: "M3", source_page: "128" } },

    { slot: "K2", item_type: "MCQ",
      context: "Sie bringen eine Idee zur Raumaufteilung ins Gespräch, die noch verhandelbar bleiben soll.",
      stem: "Welcher Satz passt besser?",
      options: ["Wir richten mehr Ruheräume ein.",
                "Man könnte mehr Ruheräume einrichten."],
      answer: 1,
      why: "Der Konjunktiv II macht aus einer Ansage einen Vorschlag, über den das Team noch entscheiden darf.",
      provenance: { source_chapter: "4", source_module: "M1", source_page: "54" } },

    { slot: "K3", item_type: "MCQ",
      context: "Sie schreiben eine kurze Notiz an alle Mitarbeitenden.",
      stem: "Welcher Satz passt besser?",
      options: ["Wegen des Umzugs bitten wir um frühzeitiges Packen.",
                "Wegen dem Umzug bitten wir um frühzeitiges Packen."],
      answer: 0,
      why: "Gesprochen hört man „wegen dem“ ständig. Geschrieben verlangt „wegen“ den Genitiv.",
      provenance: { source_book: ASPEKTE, source_chapter: "10", source_module: "M3", source_page: "158" } },

    { slot: "K4", item_type: "MCQ",
      context: "Sie begründen im Protokoll, warum zwei Vorschläge übernommen wurden.",
      stem: "Welcher Satz passt besser?",
      options: ["Die beiden Vorschläge wurden übernommen, weil sie sich mit vertretbarem Aufwand umsetzen ließen und breite Zustimmung fanden.",
                "Die beiden Vorschläge wurden übernommen. Der Aufwand war vertretbar. Es gab breite Zustimmung."],
      answer: 0,
      why: "Auf B2 wird der Zusammenhang im Satzgefüge gebaut, nicht in einer Aufzählung nebeneinandergestellter Hauptsätze." },

    { slot: "K5", item_type: "GAP_FILL",
      text: "Der Vorschlag wurde von der Arbeitsgruppe zunächst in Frage ___, bevor die Leitung ihn schließlich ___ hatte.",
      match: "ignore_case",
      gaps: [{ accepted: ["gestellt"] }, { accepted: ["übernommen", "akzeptiert"] }],
      why: "„etwas in Frage stellen“ und „einen Vorschlag übernehmen/akzeptieren“ — feste Verbindungen, die auf B2 erwartet werden.",
      provenance: { source_chapter: "7", source_module: "M1", source_page: "96" } },

    { slot: "K6", item_type: "GAP_FILL",
      text: "Die ___ der Räume wurde neu geplant; nur die ___ der Möbellieferung verzögert sich noch.",
      match: "ignore_case",
      gaps: [{ accepted: ["Aufteilung", "Planung"] }, { accepted: ["Lieferung", "Ankunft"] }],
      why: "Nominalisierungen wie „Aufteilung“ und präzise Nomen wie „Lieferung“ gehören zum B2-Wortschatz; „das Aufteilen“ und „das Kommen“ wären der A2-Ersatz.",
      provenance: { source_book: ASPEKTE, source_chapter: "9", source_module: "M1", source_page: "138" } },

    { slot: "K7", item_type: "MATCHING",
      stem: "Welches Verb gehört zu welchem Nomen?",
      left: ["einen Vorschlag", "Einfluss", "zur Verfügung", "in Anspruch"],
      right: ["nehmen", "einreichen", "ausüben", "stehen"],
      mapping: { 0: 1, 1: 2, 2: 3, 3: 0 },
      why: "einen Vorschlag einreichen · Einfluss ausüben · zur Verfügung stehen · etwas in Anspruch nehmen.",
      provenance: { source_chapter: "7", source_module: "M1", source_page: "96" } },

    { slot: "K8", item_type: "MCQ",
      context: "Eine E-Mail an die Umzugskoordinatorin.",
      stem: "Welcher Satz passt besser?",
      options: ["Ich wollte nur kurz sagen, dass bei uns noch nicht alles gepackt ist.",
                "Ich möchte Sie darüber informieren, dass die Vorbereitungen bei uns noch nicht abgeschlossen sind."],
      answer: 1,
      why: "„nur kurz sagen“ gehört ins Gespräch. In einer E-Mail an die Koordinatorin kostet das auf B2 Punkte.",
      provenance: { source_chapter: "7", source_module: "M2", source_page: "98" } },

    { slot: "C1", item_type: "MCQ",
      context: "In der Infoveranstaltung unterbricht Sie ein Kollege mitten im Satz.",
      stem: "Welche Reaktion ist auf B2-Niveau angemessen?",
      options: ["Lassen Sie mich den Punkt bitte kurz zu Ende bringen — Ihre Frage kommt gleich dran.",
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
      stem: "Fassen Sie in zwei bis drei Sätzen zusammen, wie sich die Haltung der Autorin zum Beteiligungsprozess entwickelt hat. Nennen Sie auch, was sie weiterhin kritisiert.",
      min_words: 25, target_words: 40,
      expected: "Eine Zusammenfassung, die die anfängliche Skepsis, den anerkannten Einfluss der Arbeitsgruppe UND die verbleibende Kritik an der kurzen Frist nennt, ohne den Text nachzuerzählen.",
      provenance: { source_chapter: "7", source_module: "M4", source_page: "102" } },

    { slot: "P2", item_type: "SHORT_TEXT", rubric_key: "kurzantwort",
      stem: "Ihre Kollegin schreibt: „Die Kartons müssen bis Freitag fertig sein.“ Sie sind nicht sicher, ob das für alle Abteilungen gilt und wie die Kartons beschriftet werden sollen. Formulieren Sie zwei höfliche Rückfragen.",
      min_words: 15, target_words: 30,
      expected: "Zwei echte Klärungsfragen in angemessener Höflichkeitsform — nicht eine Wiederholung der Aussage und nicht eine Meinung.",
      provenance: { source_chapter: "Redemittel im Überblick", source_module: "Rückfragen stellen",
                    source_page: "182" } },

    { slot: "W1", item_type: "LONG_TEXT", rubric_key: "forumsbeitrag",
      stem: "In Ihrem Betrieb wird diskutiert, ob künftig jede größere Standortentscheidung über eine Mitarbeiterbefragung abgestimmt werden soll. Schreiben Sie einen Beitrag für das Intranet-Forum.",
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
  stem: "Manche Firmen lassen Mitarbeitende bei großen Entscheidungen wie einem Bürowechsel mitplanen, andere informieren nur im Nachhinein. Was halten Sie für sinnvoller? Begründen Sie Ihre Meinung und gehen Sie kurz auf einen Nachteil der anderen Möglichkeit ein.",
  prep_seconds: 30, speak_seconds: 90,
  expected: "Eine klare Position, mindestens zwei Begründungen und ein eingeräumter Punkt der Gegenseite.",
  provenance: { source_chapter: "5", source_module: "M2", source_page: "70" },
};

const V8 = {
  id: "core-2026b-v8",
  group: "core-2026b",
  title: "Skillcase B2 — Einstufung V8",
  theme: "Bürowechsel und Umzug",
  provenance: PROV,
  reading: READING, listening: LISTENING, language: LANGUAGE,
  production: PRODUCTION, speaking: SPEAKING,
};

module.exports = { V8 };
