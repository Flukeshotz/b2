/**
 * core-2026b-v6 — SEED DATA. Same rules as v1.js/v4.js/v5.js.
 *
 * THEME: Schichttausch und Dienstplan — a shift-swap request and how far
 * a "just this once" exception should be allowed to spread. General B2.
 */

const KONTEXT = "Kontext B2 Kursbuch";
const ASPEKTE = "Aspekte neu B2 Lehrbuch";

const PROV = {
  source_type: "INSPIRED", source_book: KONTEXT, source_chapter: "9",
  source_module: "M3", source_page: "128", adaptation_status: "NOT_APPLICABLE",
};

const READING = {
  module: "lesen",
  title: "Forum: Schichttausch — wo hört Kollegialität auf?",
  instruction: "Lesen Sie den Forumsbeitrag und beantworten Sie die Fragen.",
  passage: `Bei uns im Team können Schichten getauscht werden, solange beide Seiten
einverstanden sind und die Leitung informiert wird. Ich fand das immer eine
gute Lösung — bis vor drei Monaten.

Damals hat eine Kollegin mich gebeten, kurzfristig einzuspringen, weil sie einen
Arzttermin hatte. Kein Problem, dachte ich. Seitdem häufen sich die Anfragen: mal
ein Termin, mal ein privates Ereignis, immer kurzfristig, immer an mich gerichtet.

Zunächst wollte ich einfach nicht als unkollegial gelten. Nach einem Gespräch mit
unserem Schichtleiter sehe ich das differenzierter. Er hat mir klar gemacht, dass
Kollegialität keine Einbahnstraße sein darf — und dass ich das genauso offen sagen
darf wie jede andere Bitte.

Was ich inzwischen mache: Ich frage zurück, ob auch andere im Team angefragt wurden,
bevor ich zusage. Das hat schon zweimal dazu geführt, dass die Anfrage sich erledigt
hat, weil jemand anderes übernehmen konnte.

Ganz ablehnen würde ich Tauschanfragen deshalb trotzdem nicht.`,
  items: [
    { slot: "R1", item_type: "MCQ",
      stem: "Wie beurteilt der Autor die Situation am Ende?",
      options: ["Er lehnt Schichttausch inzwischen grundsätzlich ab.",
                "Er akzeptiert Tauschanfragen weiterhin, aber mit einer eigenen Bedingung.",
                "Er findet, das System habe sich von selbst erledigt."],
      answer: 1,
      why: "Er würde Tauschanfragen „trotzdem nicht“ ablehnen, stellt aber inzwischen eine Rückfrage, bevor er zusagt. Beides zusammen ergibt die Gesamthaltung." },

    { slot: "R2", item_type: "TRUE_FALSE",
      stem: "Die Rückfrage des Autors hat schon zweimal dazu geführt, dass jemand anderes übernommen hat.",
      answer_value: true,
      why: "„Das hat schon zweimal dazu geführt, dass die Anfrage sich erledigt hat, weil jemand anderes übernehmen konnte.“" },

    { slot: "R3", item_type: "MCQ",
      stem: "Was räumt der Autor ein?",
      options: ["Dass er zunächst aus Angst vor dem Ruf „unkollegial“ zu häufig zugesagt hat.",
                "Dass die Kollegin ihn absichtlich ausgenutzt hat.",
                "Dass er selbst nie wieder tauschen möchte."],
      answer: 0,
      why: "„Zunächst wollte ich einfach nicht als unkollegial gelten“ — das Eingeständnis betrifft sein eigenes Verhalten, nicht die Absicht der Kollegin." },

    { slot: "R4", item_type: "MCQ",
      stem: "Wodurch hat sich die Sicht des Autors verändert?",
      options: ["Durch ein Gespräch mit dem Schichtleiter.",
                "Durch eine offizielle Änderung der Tauschregel.",
                "Durch eine Beschwerde der Kollegin."],
      answer: 0,
      why: "„Nach einem Gespräch mit unserem Schichtleiter sehe ich das differenzierter.“" },

    { slot: "R5", item_type: "MULTI_SELECT",
      stem: "Welche zwei Aussagen treffen auf den Text zu?",
      options: ["Ein Tausch setzt die Zustimmung beider Seiten voraus.",
                "Der Autor lehnt inzwischen jede Tauschanfrage ab.",
                "Die Anfragen häuften sich nach dem ersten Einspringen.",
                "Der Schichtleiter hat die Tauschregel abgeschafft."],
      correct: [0, 2],
      why: "„solange beide Seiten einverstanden sind“ und „seitdem häufen sich die Anfragen“ stehen explizit im Text; abgelehnt wird nichts grundsätzlich, und die Regel besteht weiter." },

    { slot: "R6", item_type: "ORDERING",
      stem: "Bringen Sie die Gedankenschritte in die Reihenfolge des Textes.",
      ordering: ["Er beschreibt die erste Tauschanfrage.",
                 "Er bemerkt, dass sich die Anfragen häufen.",
                 "Ein Gespräch verändert seine Sicht.",
                 "Er beschreibt seine neue Rückfrage-Strategie."],
      order: [0, 1, 2, 3],
      why: "Erste Anfrage → Häufung → korrigierendes Gespräch → neue Strategie. Der Text argumentiert chronologisch von der ersten Anfrage zur heutigen Praxis." },
  ],
};

const LISTENING = {
  module: "hoeren",
  audio_id: "core2026b_v6_schichttausch",
  instruction: "Hören Sie das Gespräch einmal und beantworten Sie die Fragen.",
  situation: "Auf der Station. Zwei Kolleginnen sprechen über einen Schichttausch.",
  plays: 1,
  turns: [
    { voice: "katja", speaker: "Kollegin A",
      text: "Du, die Frühschicht am Samstag — die wollte doch Sandra mit mir tauschen, oder?" },
    { voice: "mia", speaker: "Kollegin B",
      text: "War der erste Plan, ja. Herr Brandt hat das aber noch mal angepasst, weil am Samstag ohnehin zwei Leute fehlen. Jetzt übernimmt Tobias die Frühschicht, und du bleibst bei deiner ursprünglichen Spätschicht." },
    { voice: "katja", speaker: "Kollegin A",
      text: "Tobias übernimmt sie also, nicht Sandra. Und mein Frei am Sonntag — bleibt das?" },
    { voice: "mia", speaker: "Kollegin B",
      text: "Ja, das bleibt unverändert. Er hat nur eine Sache geändert: Die Übergabe findet jetzt eine halbe Stunde früher statt." },
    { voice: "katja", speaker: "Kollegin A",
      text: "Moment, habe ich das richtig verstanden — die Übergabezeit wurde vorgezogen, aber sonst ändert sich für mich nichts?" },
    { voice: "mia", speaker: "Kollegin B",
      text: "Genau das. Ehrlich gesagt finde ich das sinnvoll; die alte Übergabezeit war ohnehin immer zu knapp." },
  ],
  items: [
    { slot: "L1", item_type: "MCQ",
      stem: "Wer übernimmt am Ende die Frühschicht am Samstag?",
      options: ["Sandra.", "Tobias.", "Kollegin A selbst."],
      answer: 1,
      why: "Sandra war der erste Plan und wurde ersetzt: „Jetzt übernimmt Tobias die Frühschicht.“" },

    { slot: "L2", item_type: "MCQ",
      stem: "Wie bewertet Kollegin B die vorgezogene Übergabezeit?",
      options: ["Sie hält sie für unnötig.",
                "Sie hält sie für sinnvoll.",
                "Sie hat dazu keine Meinung."],
      answer: 1,
      why: "„Ehrlich gesagt finde ich das sinnvoll“ — die Bewertung steht erst im letzten Satz." },

    { slot: "L3", item_type: "TRUE_FALSE",
      stem: "Das freie Wochenende von Kollegin A am Sonntag entfällt durch die Änderung.",
      answer_value: false,
      why: "„Ja, das bleibt unverändert.“" },

    { slot: "L4", item_type: "MCQ",
      stem: "Warum wurde der ursprüngliche Tauschplan geändert?",
      options: ["Weil am Samstag ohnehin zwei Leute fehlen.",
                "Weil Sandra krank geworden ist.",
                "Weil Kollegin A den Tausch abgelehnt hat."],
      answer: 0,
      why: "„weil am Samstag ohnehin zwei Leute fehlen.“" },

    { slot: "L5", item_type: "MATCHING",
      stem: "Welche Funktion hat welche Äußerung?",
      left: ["„Moment, habe ich das richtig verstanden …?“",
             "„Ehrlich gesagt finde ich das sinnvoll.“",
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
      context: "Sie stimmen einer Tauschanfrage teilweise zu und stellen dann eine Bedingung.",
      stem: "Welcher Satz passt besser?",
      options: ["Ich übernehme die Schicht. Nur dieses eine Mal.",
                "Ich übernehme die Schicht zwar, aber nur dieses eine Mal."],
      answer: 1,
      why: "„zwar … aber“ räumt die Zusage ein und setzt zugleich die Bedingung dagegen. Zwei Sätze nebeneinander zeigen kein Abwägen.",
      provenance: { source_chapter: "9", source_module: "M3", source_page: "128" } },

    { slot: "K2", item_type: "MCQ",
      context: "Sie bringen einen neuen Ablauf ins Gespräch, der noch verhandelbar bleiben soll.",
      stem: "Welcher Satz passt besser?",
      options: ["Wir verteilen Tauschanfragen künftig reihum.",
                "Man könnte Tauschanfragen künftig reihum verteilen."],
      answer: 1,
      why: "Der Konjunktiv II macht aus einer Ansage einen Vorschlag, über den das Team noch entscheiden darf.",
      provenance: { source_chapter: "4", source_module: "M1", source_page: "54" } },

    { slot: "K3", item_type: "MCQ",
      context: "Sie schreiben eine kurze Notiz an den Schichtleiter.",
      stem: "Welcher Satz passt besser?",
      options: ["Wegen des Personalmangels bitten wir um eine neue Regelung.",
                "Wegen dem Personalmangel bitten wir um eine neue Regelung."],
      answer: 0,
      why: "Gesprochen hört man „wegen dem“ ständig. Geschrieben verlangt „wegen“ den Genitiv.",
      provenance: { source_book: ASPEKTE, source_chapter: "10", source_module: "M3", source_page: "158" } },

    { slot: "K4", item_type: "MCQ",
      context: "Sie begründen im Protokoll, warum die Übergabezeit geändert wurde.",
      stem: "Welcher Satz passt besser?",
      options: ["Die Übergabezeit wurde vorgezogen, weil die alte Regelung immer wieder zu knapp bemessen war.",
                "Die Übergabezeit wurde vorgezogen. Die alte Regelung war knapp. Das war ein Problem."],
      answer: 0,
      why: "Auf B2 wird der Zusammenhang im Satzgefüge gebaut, nicht in einer Aufzählung nebeneinandergestellter Hauptsätze." },

    { slot: "K5", item_type: "GAP_FILL",
      text: "Der Schichtplan wurde nach der Beschwerde schließlich ___, nachdem alle Beteiligten ihre Bedenken ___ hatten.",
      match: "ignore_case",
      gaps: [{ accepted: ["angepasst", "geändert"] }, { accepted: ["geäußert", "vorgebracht"] }],
      why: "„einen Plan anpassen/ändern“ und „Bedenken äußern/vorbringen“ — feste Verbindungen, die auf B2 erwartet werden.",
      provenance: { source_chapter: "7", source_module: "M1", source_page: "96" } },

    { slot: "K6", item_type: "GAP_FILL",
      text: "Die ___ der Schichten erfolgt jetzt digital; nur die ___ der Sonderfälle dauert noch etwas länger.",
      match: "ignore_case",
      gaps: [{ accepted: ["Verteilung", "Planung"] }, { accepted: ["Bearbeitung"] }],
      why: "Nominalisierungen wie „Verteilung“ und präzise Nomen wie „Bearbeitung“ gehören zum B2-Wortschatz; „das Verteilen“ und „das Machen“ wären der A2-Ersatz.",
      provenance: { source_book: ASPEKTE, source_chapter: "9", source_module: "M1", source_page: "138" } },

    { slot: "K7", item_type: "MATCHING",
      stem: "Welches Verb gehört zu welchem Nomen?",
      left: ["eine Schicht", "Rücksicht", "zur Verfügung", "zur Sprache"],
      right: ["nehmen", "übernehmen", "stehen", "bringen"],
      mapping: { 0: 1, 1: 0, 2: 2, 3: 3 },
      why: "eine Schicht übernehmen · Rücksicht nehmen · zur Verfügung stehen · etwas zur Sprache bringen.",
      provenance: { source_chapter: "7", source_module: "M1", source_page: "96" } },

    { slot: "K8", item_type: "MCQ",
      context: "Eine Nachricht an den Schichtleiter.",
      stem: "Welcher Satz passt besser?",
      options: ["Kannst du das kurz checken? Bei mir klappt der Tausch grad nicht.",
                "Ich bitte Sie, den Tauschwunsch zu prüfen; die Zuweisung ist derzeit noch offen."],
      answer: 1,
      why: "„kurz checken“ und „klappt grad nicht“ gehören ins Gespräch. An den Schichtleiter kostet das auf B2 Punkte.",
      provenance: { source_chapter: "7", source_module: "M2", source_page: "98" } },

    { slot: "C1", item_type: "MCQ",
      context: "In der Übergabe unterbricht Sie ein Kollege mitten im Satz.",
      stem: "Welche Reaktion ist auf B2-Niveau angemessen?",
      options: ["Lassen Sie mich den Punkt bitte kurz zu Ende bringen — gleich sind Sie dran.",
                "Ich war noch nicht fertig! Immer unterbrechen Sie mich.",
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
      stem: "Fassen Sie in zwei bis drei Sätzen zusammen, wie sich der Umgang des Autors mit Tauschanfragen entwickelt hat. Nennen Sie auch, was ihn dazu bewegt hat.",
      min_words: 25, target_words: 40,
      expected: "Eine Zusammenfassung, die die anfängliche Zusage aus Sorge vor dem Ruf „unkollegial“, das klärende Gespräch UND die neue Rückfrage-Strategie nennt, ohne den Text nachzuerzählen.",
      provenance: { source_chapter: "7", source_module: "M4", source_page: "102" } },

    { slot: "P2", item_type: "SHORT_TEXT", rubric_key: "kurzantwort",
      stem: "Ihr Kollege schreibt: „Kannst du am Freitag für mich einspringen?“ Sie sind nicht sicher, um welche Schicht es geht und ob schon jemand anderes gefragt wurde. Formulieren Sie zwei höfliche Rückfragen.",
      min_words: 15, target_words: 30,
      expected: "Zwei echte Klärungsfragen in angemessener Höflichkeitsform — nicht eine Wiederholung der Aussage und nicht eine Meinung.",
      provenance: { source_chapter: "Redemittel im Überblick", source_module: "Rückfragen stellen",
                    source_page: "182" } },

    { slot: "W1", item_type: "LONG_TEXT", rubric_key: "forumsbeitrag",
      stem: "In Ihrem Betrieb wird diskutiert, ob Schichttausch künftig nur noch über eine zentrale Liste statt direkt zwischen Kolleginnen und Kollegen organisiert werden soll. Schreiben Sie einen Beitrag für das Intranet-Forum.",
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
  stem: "Manche Teams verteilen Schichttausch über eine zentrale Liste, andere organisieren ihn direkt zwischen Kolleginnen und Kollegen. Was halten Sie für sinnvoller? Begründen Sie Ihre Meinung und gehen Sie kurz auf einen Nachteil der anderen Möglichkeit ein.",
  prep_seconds: 30, speak_seconds: 90,
  expected: "Eine klare Position, mindestens zwei Begründungen und ein eingeräumter Punkt der Gegenseite.",
  provenance: { source_chapter: "5", source_module: "M2", source_page: "70" },
};

const V6 = {
  id: "core-2026b-v6",
  group: "core-2026b",
  title: "Skillcase B2 — Einstufung V6",
  theme: "Schichttausch und Dienstplan",
  provenance: PROV,
  reading: READING, listening: LISTENING, language: LANGUAGE,
  production: PRODUCTION, speaking: SPEAKING,
};

module.exports = { V6 };
