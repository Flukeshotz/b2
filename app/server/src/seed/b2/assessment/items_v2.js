/**
 * ASSESSMENT V2 — a second full bank, built to the blueprint.
 *
 * Every item fills a slot that V1 also fills, with the same check_id, the same
 * capability and the same format — and different content. That is the whole
 * point: a learner who sat V1 and practised must not be able to improve her V2
 * result by remembering V1's answers.
 *
 * NOTHING HERE IS REUSED. No item, passage, audio, prompt or distractor appears
 * in V1, in V3, or in any practice topic. tools/audit_b2_assessment.js proves
 * that mechanically rather than on this comment's word.
 *
 * PROVENANCE: every item is original, authored for Skillcase. No Goethe or telc
 * material is reproduced, adapted or implied. Listening audio is synthesised by
 * Azure TTS from the transcripts below, so there is no third-party recording
 * anywhere in this bank.
 *
 * REVIEW: everything here is `draft`. No teacher or SME has read it. That is
 * recorded per item and must not be changed to `reviewed` by anyone who is not
 * recording an actual review.
 *
 * THEME: Weiterbildung und Dienstplanung. Chosen to sit well away from V1's
 * Vier-Tage-Woche and V3's Online-Bewertungen, so that no two versions can be
 * answered from the same background knowledge.
 */

/* Grammar — both options are grammatical German. The weaker one is weaker for
   the SITUATION, never broken. An item a learner can pass by spotting an error
   is testing proofreading, not B2. */
const grammar = {
  minutes: 2,
  instruction: "Welcher Satz passt besser?",
  note: "Es geht nicht um richtig und falsch, sondern darum, was ein Prüfer erwarten würde.",
  items: [
    { id: "v2_g1", slot: "G1", check_id: "connector_range", capability: "concede",
      context: "Eine Kollegin schlägt vor, die Übergabe zu verkürzen. Sie sind dagegen, wollen sie aber nicht abbürsten.",
      options: ["Die Idee spart Zeit. Ich halte sie für falsch.",
                "Die Idee spart zwar Zeit, allerdings fehlen dann wichtige Informationen."],
      answer: 1,
      why: "Erst einräumen („zwar“), dann widersprechen („allerdings“). Zwei Sätze nebeneinander zeigen kein Abwägen." },

    { id: "v2_g2", slot: "G2", check_id: "konjunktiv2", capability: "speculate",
      context: "Sie bringen in der Teamsitzung eine andere Aufteilung ins Gespräch. Es soll ein Vorschlag bleiben.",
      options: ["Wir teilen die Aufgaben neu auf.",
                "Vielleicht ließen sich die Aufgaben anders aufteilen."],
      answer: 1,
      why: "Der Konjunktiv II macht aus einer Ansage einen Vorschlag, über den das Team noch entscheiden darf." },

    { id: "v2_g3", slot: "G3", check_id: "genitiv_praep", capability: "adapt_register",
      context: "Sie schreiben eine kurze Notiz an die Stationsleitung.",
      options: ["Trotz dem hohen Andrang blieb die Wartezeit kurz.",
                "Trotz des hohen Andrangs blieb die Wartezeit kurz."],
      answer: 1,
      why: "Gesprochen hört man „trotz dem“ ständig. Geschrieben verlangt „trotz“ den Genitiv." },

    { id: "v2_g4", slot: "G4", check_id: "connector_range", capability: "justify",
      context: "Sie begründen schriftlich, warum Sie bei einem Lieferanten nicht bestellen.",
      options: ["Wir bestellen dort nicht, da die Lieferzeit zu lang ist.",
                "Wir bestellen dort nicht. Die Lieferzeit ist zu lang."],
      answer: 0,
      why: "„da“ macht den Zusammenhang explizit. Nebeneinandergestellte Sätze überlassen ihn dem Leser." },

    { id: "v2_g5", slot: "G5", check_id: "register", capability: "adapt_register",
      context: "Eine E-Mail an einen Kunden, den Sie siezen.",
      options: ["Da ist uns leider was danebengegangen.",
                "Dabei ist uns leider ein Fehler unterlaufen."],
      answer: 1,
      why: "„da ist was danebengegangen“ ist gesprochene Sprache. In einer schriftlichen Aufgabe kostet das Punkte." },

    { id: "v2_g6", slot: "G6", check_id: "sentence_complexity", capability: "argue",
      context: "Sie erklären, warum Sie ein Angebot abgelehnt haben.",
      options: ["Das Angebot war günstig, es enthielt aber keine Wartung, sodass die Kosten später gestiegen wären.",
                "Das Angebot war günstig. Es gab keine Wartung. Die Kosten wären gestiegen."],
      answer: 0,
      why: "Auf B2 wird der Zusammenhang im Satz gebaut, nicht in einer Aufzählung." },

    { id: "v2_g7", slot: "G7", check_id: "connector_range", capability: "compare",
      context: "Sie stellen zwei Schichtmodelle gegenüber.",
      options: ["Das kurze Modell ist familienfreundlicher, dafür sind die einzelnen Tage dichter.",
                "Das kurze Modell ist familienfreundlicher. Die einzelnen Tage sind dichter."],
      answer: 0,
      why: "„dafür“ setzt Vorteil und Nachteil ins Verhältnis, statt sie nebeneinanderzustellen." },

    { id: "v2_g8", slot: "G8", check_id: "konjunktiv2", capability: "speculate",
      context: "Sie bitten die Personalabteilung um eine Auskunft.",
      options: ["Könnten Sie mir sagen, bis wann die Unterlagen vorliegen müssen?",
                "Können Sie mir sagen, bis wann die Unterlagen vorliegen müssen?"],
      answer: 0,
      why: "Der Konjunktiv nimmt der Frage das Fordernde und lässt ein Nein zu." },
  ],
};

/* Vocabulary — distractors are real German that collocates wrongly. A nonsense
   word is only used where the slot is about nominalisation, and then exactly
   one of the three is invented, as in V1. */
const vocabulary = {
  minutes: 1.5,
  instruction: "Welches Wort fehlt?",
  items: [
    { id: "v2_v1", slot: "V1", check_id: "nvv", capability: "argue",
      sentence: "Wir müssen die Kritik der Angehörigen ernst ___.",
      options: ["nehmen", "machen", "halten"],
      answer: 0, why: "„Kritik ernst nehmen“ — feste Verbindung." },

    { id: "v2_v2", slot: "V2", check_id: "nvv", capability: "argue",
      sentence: "Der Vorschlag ___ im Team auf großes Interesse.",
      options: ["fand", "stieß", "kam"],
      answer: 1, why: "„auf Interesse stoßen“ — nicht „auf Interesse finden“." },

    { id: "v2_v3", slot: "V3", check_id: "lexical_range", capability: "argue",
      /* All three are neuter, so the article gives nothing away — the learner
         has to choose on precision, which is what lexical_range measures. */
      sentence: "Die hohen Kosten sind das wichtigste ___ gegen den Plan.",
      options: ["Argument", "Ding", "Problem"],
      answer: 0, why: "Auf B2 wird ein präzises Nomen erwartet. „Ding“ ist zu vage, „Problem“ passt hier inhaltlich nicht." },

    { id: "v2_v4", slot: "V4", check_id: "lexical_range", capability: "argue",
      sentence: "Die ___ der Ergebnisse dauert noch einige Tage.",
      options: ["Auswertigung", "Auswertung", "Auswerten"],
      answer: 1, why: "Nominalisierungen wie „Auswertung“ gehören zum B2-Wortschatz. „Auswertigung“ gibt es nicht." },

    { id: "v2_v5", slot: "V5", check_id: "connector_range", capability: "concede",
      sentence: "Der Weg dorthin ist weit. ___ lohnt sich der Aufwand.",
      options: ["Dennoch", "Deswegen", "Zudem"],
      answer: 0, why: "Ein Einwand wird eingeräumt und dann überstimmt." },

    { id: "v2_v6", slot: "V6", check_id: "register", capability: "adapt_register",
      /* All three options are grammatical in the frame. Only one belongs in a
         written formal email — which is the point of a register item. A
         distractor that breaks the sentence is a grammar item wearing a
         register label. */
      sentence: "___ können Sie sich jederzeit an uns wenden. (formelle E-Mail)",
      options: ["Bei Fragen", "Wenn was ist", "Falls irgendwas"],
      answer: 0, why: "„Bei Fragen“ ist die schriftliche Form. „Wenn was ist“ und „Falls irgendwas“ sind gesprochene Sprache." },
  ],
};

/* Reading — 122 words. Carries a position the author argues partly against, so
   the main-idea item cannot be answered from the first sentence and the
   inference item cannot be answered by keyword match. */
const reading = {
  minutes: 2.5,
  instruction: "Lesen Sie den Forumsbeitrag und beantworten Sie drei Fragen.",
  title: "Forum: Fortbildung nach Feierabend",
  text: `Unser Betrieb bezahlt seit zwei Jahren Fortbildungen, allerdings finden sie
abends nach der Schicht statt. Ich habe mich darüber zuerst geärgert. Wer zehn Stunden
gearbeitet hat, nimmt um sieben Uhr abends nicht mehr viel auf, dachte ich.

Nach drei Kursen sehe ich das differenzierter. Es liegt weniger an der Uhrzeit als
daran, wie die Kurse aufgebaut sind. Wo wir selbst etwas ausprobieren, bleibt
erstaunlich viel hängen; wo jemand vierzig Folien vorliest, nichts. Das wäre
vormittags nicht besser gewesen.

Was ich trotzdem kritisch sehe: Kolleginnen mit Kindern fallen faktisch heraus. Sie
können abends nicht, und eine Alternative gibt es bisher nicht. Solange das so bleibt,
ist das Angebot eben nicht für alle da.

Angemeldet habe ich mich für den nächsten Kurs trotzdem.`,
  items: [
    { id: "v2_r1", slot: "R1", kind: "main_idea", check_id: null, capability: "structure",
      q: "Wie beurteilt die Autorin die Abendkurse heute?",
      options: ["Sie sieht das Problem weniger in der Uhrzeit, hat aber weiterhin einen Einwand.",
                "Sie hält Abendkurse inzwischen grundsätzlich für sinnlos.",
                "Sie findet die Kurse gut und hat keine Kritik mehr."],
      answer: 0,
      why: "Nicht die Uhrzeit entscheidet, sondern der Aufbau — und der Einwand wegen der Kolleginnen mit Kindern bleibt." },

    { id: "v2_r2", slot: "R2", kind: "detail", check_id: null, capability: "structure",
      q: "Wovon hängt es laut der Autorin ab, ob man in einem Kurs etwas lernt?",
      options: ["Von der Tageszeit.",
                "Davon, wie der Kurs aufgebaut ist.",
                "Von der Länge der vorherigen Schicht."],
      answer: 1,
      why: "„Es liegt weniger an der Uhrzeit als daran, wie die Kurse aufgebaut sind.“" },

    { id: "v2_r3", slot: "R3", kind: "inference", check_id: null, capability: "structure",
      q: "Was sagt der Satz „Solange das so bleibt, ist das Angebot eben nicht für alle da“ über die Autorin?",
      options: ["Sie hält die Kurse insgesamt für überflüssig.",
                "Sie geht davon aus, dass sich daran etwas ändern ließe.",
                "Sie findet, die Kolleginnen müssten sich selbst kümmern."],
      answer: 1,
      why: "„Solange“ setzt voraus, dass ein anderer Zustand möglich wäre. Der Satz ist eine Forderung, keine Feststellung." },
  ],
};

/* Listening — authored dialogue, synthesised by Azure TTS from these turns.
   NOT src_muede: that source is the b2_muede_listen practice topic, and reusing
   it is the practice overlap this phase exists to remove.

   `text` is the field b2/tts.js ssml() actually reads. The decisive information
   is a CORRECTION — the date everyone has in mind is the wrong one — so a
   learner who catches only the first number gets it wrong, which is what makes
   it a listening item rather than a reading item read aloud. */
const listening = {
  minutes: 2,
  instruction: "Hören Sie das Gespräch einmal und beantworten Sie zwei Fragen.",
  audioId: "asr_v2_dienstplan_app",
  plays: 1,
  situation: "Im Stationszimmer. Ein Pfleger fragt die Teamleiterin nach der neuen Dienstplan-App.",
  turns: [
    { voice: "klaus", speaker: "Pfleger",
      text: "Sag mal, die neue Dienstplan-App — ab wann gilt die jetzt eigentlich? Ich hatte den Ersten im Kopf." },
    { voice: "mia", speaker: "Teamleiterin",
      text: "Der Erste war mal geplant, ja. Das haben wir aber verschoben, weil die Schulungen noch nicht durch sind. Es wird jetzt der Fünfzehnte." },
    { voice: "klaus", speaker: "Pfleger",
      text: "Und bis dahin trage ich meine Wünsche weiter auf dem Zettel ein?" },
    { voice: "mia", speaker: "Teamleiterin",
      text: "Genau, bis zum Fünfzehnten läuft beides parallel. Danach zählt nur noch die App." },
    { voice: "klaus", speaker: "Pfleger",
      text: "Ehrlich gesagt bin ich skeptisch, ob dadurch irgendetwas schneller wird." },
    { voice: "mia", speaker: "Teamleiterin",
      text: "Kann ich verstehen. Ich glaube schon, dass es hilft — aber ich würde jetzt auch nicht behaupten, dass damit alle Probleme gelöst sind. Es nimmt uns vor allem das Hin und Her am Telefon ab." },
  ],
  items: [
    { id: "v2_l1", slot: "L1", kind: "detail", check_id: null, capability: "understand_speech",
      q: "Ab wann zählt nur noch die App?",
      options: ["Ab dem Ersten des Monats.",
                "Ab dem Fünfzehnten.",
                "Erst wenn alle Schulungen abgeschlossen sind."],
      answer: 1,
      why: "Der Erste war geplant und wurde verschoben. „Bis zum Fünfzehnten läuft beides parallel. Danach zählt nur noch die App.“" },

    { id: "v2_l2", slot: "L2", kind: "attitude", check_id: null, capability: "understand_speech",
      q: "Wie schätzt die Teamleiterin die App ein?",
      options: ["Sie erwartet, dass damit die Probleme gelöst sind.",
                "Sie hält sie für hilfreich, warnt aber vor zu hohen Erwartungen.",
                "Sie teilt die Skepsis des Kollegen."],
      answer: 1,
      why: "„Ich glaube schon, dass es hilft — aber ich würde jetzt auch nicht behaupten, dass damit alle Probleme gelöst sind.“" },
  ],
};

/* Writing — deliberately on the same topic as the reading passage, exactly as
   V1 pairs its Vier-Tage-Woche text with its Vier-Tage-Woche prompt. That
   pairing lowers the ideation load so the task measures LANGUAGE rather than
   whether she can think of arguments in three and a half minutes. Preserved
   here because changing it would make V2 a different kind of task from V1. */
const writing = {
  minutes: 3.5,
  minWords: 60,
  slot: "W1",
  id: "v2_w1",
  prompt: "In vielen Betrieben finden Fortbildungen erst nach der Arbeitszeit statt. Halten Sie das für eine gute Lösung?",
  guidance: ["Sagen Sie, was Sie denken.", "Begründen Sie es.", "Nennen Sie auch, was dagegen spricht."],
};

/* Speaking — one prompt, 60–90 seconds. NOT "describe this picture": the task
   forces a position AND a concession, so B2 language is required by the task
   design rather than requested in the instructions. See blueprint.js for why
   this sits outside the comparable core. */
const speaking = {
  minutes: 2,
  slot: "S1",
  id: "v2_s1",
  minSeconds: 60,
  maxSeconds: 90,
  instruction: "Sprechen Sie etwa eine Minute. Sie hören sich danach selbst.",
  prompt: "Einige Arbeitgeber bezahlen eine Fortbildung nur, wenn man danach mindestens zwei Jahre im Betrieb bleibt. Halten Sie das für fair? Begründen Sie Ihre Meinung und gehen Sie kurz darauf ein, was für die andere Seite spricht.",
  elicits: ["argue", "justify", "concede"],
  expectedAnswer: "Eine klare Position, mindestens zwei Begründungen und ein eingeräumter Punkt der Gegenseite.",
  scoring: "transcript_only",
};

const V2 = {
  id: "screen_v2",
  version: "v2",
  totalMinutes: 13.5,
  theme: "Weiterbildung und Dienstplanung",
  sections: [
    { key: "grammar", label: "Grammatik", ...grammar },
    { key: "vocabulary", label: "Wortschatz", ...vocabulary },
    { key: "reading", label: "Lesen", ...reading },
    { key: "listening", label: "Hören", ...listening },
    { key: "writing", label: "Schreiben", ...writing },
    { key: "speaking", label: "Sprechen", ...speaking },
  ],
};

module.exports = { V2 };
