/**
 * THE B2 SCREENING — about eleven minutes.
 *
 * Not a mock exam. The design question is the minimum evidence needed to build a
 * useful first plan, and two facts set the floor: trained human raters agree on
 * an exact CEFR band only 65.5% of the time, so precision beyond a band is
 * theatre; and our writing detectors fire on roughly seventy words, not 180.
 *
 * EVERY ITEM CARRIES A check_id. That is what makes screening, writing, grammar
 * and the recommendation engine one system instead of four — a weakness found
 * here routes to the same practice a real piece of writing would route to.
 *
 * KEIN FACHWISSEN. Goethe forbids requiring specialist knowledge. Nothing here
 * needs any.
 */

const grammar = {
  minutes: 2,
  // Short, because it repeats above every item. The longer framing belongs on
  // the section intro, not on all eight questions.
  instruction: "Welcher Satz passt besser?",
  note: "Es geht nicht um richtig und falsch, sondern darum, was ein Prüfer erwarten würde.",
  items: [
    { id: "g1", check_id: "connector_range", capability: "concede",
      context: "Sie sind anderer Meinung als Ihr Chef — wollen ihn aber nicht vor den Kopf stoßen.",
      options: ["Ihr Vorschlag ist gut. Ich bin dagegen.",
                "Ihr Vorschlag hat zwar Vorteile, aber ich sehe ein Problem."],
      answer: 1,
      why: "Erst einräumen, dann widersprechen. Genau das erwartet ein Prüfer auf B2." },

    { id: "g2", check_id: "konjunktiv2", capability: "speculate",
      context: "Sie schlagen im Team etwas vor. Es soll ein Vorschlag bleiben, keine Ansage.",
      options: ["Man könnte die Besprechung auf Montag verschieben.",
                "Wir verschieben die Besprechung auf Montag."],
      answer: 0,
      why: "„Man könnte“ lässt der anderen Person Raum. Der Indikativ klingt wie eine Entscheidung." },

    { id: "g3", check_id: "genitiv_praep", capability: "adapt_register",
      context: "Sie schreiben eine kurze Krankmeldung an die Personalabteilung.",
      options: ["Wegen dem Unfall komme ich später.",
                "Wegen des Unfalls komme ich später."],
      answer: 1,
      why: "Gesprochen geht „wegen dem“ durch. Geschrieben wird es angestrichen." },

    { id: "g4", check_id: "connector_range", capability: "justify",
      context: "Sie begründen schriftlich, warum ein Termin nicht klappt.",
      options: ["Ich kann nicht kommen, denn ich habe einen anderen Termin.",
                "Ich kann nicht kommen. Ich habe einen anderen Termin."],
      answer: 0,
      why: "Zwei Sätze nebeneinander sind noch keine Begründung. Der Konnektor macht den Zusammenhang sichtbar." },

    { id: "g5", check_id: "register", capability: "adapt_register",
      context: "Eine E-Mail an eine Kollegin, die Sie siezen.",
      options: ["Das war echt voll blöd gestern.",
                "Das war gestern wirklich ärgerlich."],
      answer: 1,
      why: "Umgangssprache in einer schriftlichen Aufgabe kostet auf B2 Punkte." },

    { id: "g6", check_id: "sentence_complexity", capability: "argue",
      context: "Sie erklären, warum Sie eine Entscheidung getroffen haben.",
      options: ["Ich habe abgesagt. Der Termin war zu spät. Ich hatte keine Zeit.",
                "Ich habe abgesagt, weil der Termin so spät lag, dass ich es zeitlich nicht geschafft hätte."],
      answer: 1,
      why: "Auf B2 werden Gedanken verbunden, nicht aufgezählt." },

    { id: "g7", check_id: "connector_range", capability: "compare",
      context: "Sie wägen zwei Möglichkeiten ab.",
      options: ["Homeoffice spart Zeit. Das Büro ist besser für Gespräche.",
                "Homeoffice spart einerseits Zeit, andererseits sind Gespräche im Büro einfacher."],
      answer: 1,
      why: "„einerseits … andererseits“ zeigt, dass Sie abwägen und nicht nur aufzählen." },

    { id: "g8", check_id: "konjunktiv2", capability: "speculate",
      context: "Sie stellen eine höfliche Bitte an eine Vorgesetzte.",
      options: ["Wäre es möglich, den Dienst zu tauschen?",
                "Ist es möglich, den Dienst zu tauschen?"],
      answer: 0,
      why: "Der Konjunktiv macht aus einer Frage eine Bitte." },
  ],
};

const vocabulary = {
  minutes: 1.5,
  instruction: "Welches Wort fehlt?",
  items: [
    { id: "v1", check_id: "nvv", capability: "argue",
      sentence: "Wir sollten diesen Punkt bei der Entscheidung ___.",
      options: ["berücksichtigen", "aufpassen", "beachtet"],
      answer: 0, why: "„einen Punkt berücksichtigen“ — feste Verbindung." },
    { id: "v2", check_id: "nvv", capability: "argue",
      sentence: "Das Team ___ seit Wochen unter Druck.",
      options: ["hat", "steht", "macht"],
      answer: 1, why: "„unter Druck stehen“ — nie „unter Druck haben“." },
    { id: "v3", check_id: "lexical_range", capability: "argue",
      sentence: "Das ist ein wichtiger ___ für die Entscheidung.",
      options: ["Faktor", "Sache", "Ding"],
      answer: 0, why: "Auf B2 wird ein präziseres Wort erwartet als „Sache“." },
    { id: "v4", check_id: "lexical_range", capability: "argue",
      sentence: "Die ___ der neuen Regel ist noch unklar.",
      options: ["Machung", "Umsetzung", "Machen"],
      answer: 1, why: "Nominalisierungen wie „Umsetzung“ gehören zum B2-Wortschatz." },
    { id: "v5", check_id: "connector_range", capability: "concede",
      sentence: "Der Plan ist teuer. ___ halte ich ihn für richtig.",
      options: ["Trotzdem", "Deshalb", "Außerdem"],
      answer: 0, why: "Ein Einwand wird eingeräumt und dann überstimmt." },
    { id: "v6", check_id: "register", capability: "adapt_register",
      sentence: "Ich ___ Ihnen für die schnelle Antwort. (formelle E-Mail)",
      options: ["danke", "sag danke", "bedanke mich bei"],
      answer: 2, why: "„Ich bedanke mich bei Ihnen“ ist die schriftliche Form." },
  ],
};

const reading = {
  minutes: 2.5,
  instruction: "Lesen Sie den Forumsbeitrag und beantworten Sie drei Fragen.",
  title: "Forum: Vier-Tage-Woche",
  text: `Seit einem Jahr arbeiten wir in der Firma vier Tage pro Woche, bei gleichem Gehalt.
Ich war anfangs skeptisch. Ehrlich gesagt dachte ich, das sei vor allem ein Werbetrick,
mit dem man leichter Leute findet.

Inzwischen sehe ich das anders. Wir schaffen ungefähr genauso viel wie vorher, weil
Besprechungen kürzer geworden sind und niemand mehr Zeit mit Dingen verbringt, die
ohnehin niemand liest. Das war die eigentliche Überraschung: Nicht wir arbeiten
schneller, sondern es fällt weniger an.

Was ich allerdings nicht verschweigen will: Für die Kolleginnen im Kundenkontakt ist es
härter geworden. Die Woche ist dichter, und wer freitags frei hat, findet montags
entsprechend mehr vor. Ob das langfristig gut geht, weiß ich ehrlich gesagt nicht.

Trotzdem würde ich nicht zurückwollen.`,
  items: [
    { id: "r1", kind: "main_idea", check_id: null, capability: "structure",
      q: "Wie steht der Autor heute zur Vier-Tage-Woche?",
      options: ["Er ist überzeugt, sieht aber weiterhin ein Problem.",
                "Er hält sie inzwischen für einen Werbetrick.",
                "Er möchte zur Fünf-Tage-Woche zurück."],
      answer: 0, why: "Er würde „nicht zurückwollen“, nennt aber die Belastung im Kundenkontakt." },
    { id: "r2", kind: "detail", check_id: null, capability: "structure",
      q: "Warum schafft das Team ähnlich viel wie vorher?",
      options: ["Weil alle schneller arbeiten.",
                "Weil weniger unnötige Arbeit anfällt.",
                "Weil mehr Personal eingestellt wurde."],
      answer: 1, why: "„Nicht wir arbeiten schneller, sondern es fällt weniger an.“" },
    { id: "r3", kind: "inference", check_id: null, capability: "structure",
      q: "Was verrät „Was ich allerdings nicht verschweigen will“ über den Autor?",
      options: ["Er will einen Nachteil nennen, obwohl er dafür ist.",
                "Er ärgert sich über seine Kolleginnen.",
                "Er hält den Nachteil für unwichtig."],
      answer: 0, why: "Er räumt bewusst etwas ein, das gegen seine eigene Position spricht." },
  ],
};

/* Uses a section of a source she may later study in full — real German at real
   speed, and only forty seconds of it. */
const listening = {
  minutes: 2,
  instruction: "Hören Sie den Ausschnitt einmal und beantworten Sie zwei Fragen.",
  sourceId: "src_muede",
  sectionId: "s3",
  plays: 1,
  items: [
    { id: "l1", kind: "detail", check_id: null, capability: "understand_speech",
      q: "Was passiert laut dem Forscher, wenn man nachts arbeitet und tagsüber schläft?",
      options: ["Der Körper stellt die innere Uhr um.",
                "Der Schlaf findet statt, ist aber flacher.",
                "Man schläft insgesamt länger."],
      answer: 1, why: "„… ein Schlaf, der zwar stattfindet, aber deutlich flacher ist.“" },
    { id: "l2", kind: "attitude", check_id: null, capability: "understand_speech",
      q: "Wie ordnet der Forscher das Risiko ein?",
      options: ["Er hält es für dramatisch.",
                "Er hält es für unbedeutend.",
                "Er nimmt es ernst, warnt aber vor Übertreibung."],
      answer: 2, why: "„Es ist ernst. Ich möchte es allerdings auch nicht dramatisieren.“" },
  ],
};

const writing = {
  minutes: 3.5,
  minWords: 60,
  prompt: "In vielen Firmen wird darüber diskutiert, ob man vier Tage pro Woche arbeiten sollte. Was halten Sie davon?",
  guidance: ["Sagen Sie, was Sie denken.", "Begründen Sie es.", "Nennen Sie auch, was dagegen spricht."],
};

const SCREENING = {
  id: "screen_v1",
  totalMinutes: 11,
  sections: [
    { key: "grammar", label: "Grammatik", ...grammar },
    { key: "vocabulary", label: "Wortschatz", ...vocabulary },
    { key: "reading", label: "Lesen", ...reading },
    { key: "listening", label: "Hören", ...listening },
    { key: "writing", label: "Schreiben", ...writing },
  ],
};

module.exports = { SCREENING };
