/**
 * Experiences derived from src_rufbereitschaft. Original Skillcase content,
 * same shape as the earlier sources in this series.
 */

const SOURCE_ID = "src_rufbereitschaft";

/* ── 1. READING ───────────────────────────────────────────────────────────── */
const reading = {
  id: "exp_rufbereitschaft_read",
  kind: "reading",
  ord: 0,
  title: "Rufbereitschaft: wer übernimmt sie?",
  minutes: 11,
  primary_capability: "compare",
  secondary_capabilities: ["structure", "argue"],
  checks: [],
  teaches: [],
  steps: [
    { t: "story", lines: [
      "Ein Forum. Fünf Beiträge, vier Leute — die Frage: warum landet Rufbereitschaft immer bei denselben Leuten?",
      "Lesen Sie den ganzen Thread einmal durch. Danach bleibt er offen: Sie dürfen jederzeit zurückblättern.",
    ] },

    { t: "read_source", sourceId: SOURCE_ID },

    { t: "readq", mode: "attribute", sourceId: SOURCE_ID,
      capability: "compare",
      q: "Wer erklärt, warum es keine feste Rotation gibt?",
      options: ["sandra", "andre", "birthe", "lukas"],
      answer: 2,
      explain: "Birthe_Stationsleitung erklärt das Verfahren: es wird immer die am ehesten erreichbare Person gefragt, nicht nach einer festen Liste. Die anderen sprechen über die Wirkung dieser Praxis, nicht über das Verfahren selbst." },

    { t: "readq", mode: "attribute", sourceId: SOURCE_ID,
      capability: "compare",
      q: "Wer benennt einen konkreten Nachteil einer festen Rotation?",
      options: ["sandra", "andre", "birthe", "lukas"],
      answer: 3,
      explain: "Lukas_F weist darauf hin, dass eine starre Liste private Gründe für bestimmte Wochen ignorieren würde. Die anderen sprechen nicht über Nachteile einer Rotation, sondern über das aktuelle System." },

    { t: "readq", mode: "stance", sourceId: SOURCE_ID,
      capability: "argue",
      quote: "Das verteilt sich einfach ungleich, das liegt an niemandem persönlich",
      q: "Was macht André_K mit dieser Aussage vor allem?",
      options: [
        "Er bestreitet, dass die Verteilung ungleich ist.",
        "Er erklärt die ungleiche Verteilung, ohne jemandem Absicht zu unterstellen.",
        "Er beschuldigt die Stationsleitung, absichtlich ungerecht zu handeln.",
      ],
      answer: 1,
      explain: "Er bestätigt die Ungleichheit sogar ausdrücklich, trennt sie aber von persönlicher Schuld. Das ist etwas anderes, als die Ungleichheit selbst zu bestreiten oder jemanden zu beschuldigen." },

    { t: "readq", mode: "relation", sourceId: SOURCE_ID,
      capability: "structure",
      quote: "aber es macht es nicht automatisch gerecht",
      q: "Wie steht dieser Teil zu Birthes Erklärung des Verfahrens davor?",
      options: [
        "Er widerspricht der Erklärung des Verfahrens.",
        "Er akzeptiert die Erklärung als Erklärung, bestreitet aber, dass sie das Ergebnis rechtfertigt.",
        "Er wiederholt die Erklärung mit anderen Worten.",
        "Er schlägt ein neues Verfahren vor.",
      ],
      answer: 1,
      explain: "Birthe erklärt zuerst, WARUM es passiert (Erreichbarkeit statt Rotation) — und stellt selbst fest, dass diese Erklärung die Ungerechtigkeit nicht auflöst. Erklärung und Rechtfertigung sind für sie zwei verschiedene Dinge." },

    { t: "readq", mode: "implication", sourceId: SOURCE_ID,
      capability: "compare",
      q: "Sandra sagt in ihrem letzten Beitrag, Lukas' Einwand sei „berechtigt“. Was folgt daraus für ihre Position zu einer festen Rotation?",
      options: [
        "Dass sie eine starre Liste jetzt vollständig ablehnt.",
        "Dass sie Lukas' Bedenken ernst nimmt, ohne deshalb ihre grundsätzliche Forderung nach Fairness aufzugeben.",
        "Dass sie das Thema nicht mehr wichtig findet.",
      ],
      answer: 1,
      explain: "Sie erkennt Lukas' Punkt an, formuliert aber direkt danach ihre eigentliche Forderung neu — nicht starre Rotation, sondern ein Limit gegen dauerhafte Überlastung. Ihr Ziel bleibt bestehen, nur der Weg dahin wird offener." },

    { t: "readq", mode: "intention", sourceId: SOURCE_ID,
      capability: "compare",
      quote: "Mich stört gar nicht, dass es flexibel gehandhabt wird — mich stört, dass es dabei kein Limit gibt.",
      q: "Warum schreibt Sandra_H das ganz am Ende?",
      options: [
        "Um zuzugeben, dass ihre erste Beschwerde falsch war.",
        "Um klarzustellen, dass sie kein starres System fordert, sondern eine Obergrenze innerhalb des flexiblen Systems.",
        "Um André_K vorzuwerfen, dass er sich zu wenig einsetzt.",
        "Um vorzuschlagen, Rufbereitschaft ganz abzuschaffen.",
      ],
      answer: 1,
      explain: "Ihr erster Beitrag klingt wie eine Forderung nach gleichmäßiger Verteilung. Am Ende zeigt sich: sie akzeptiert Flexibilität, solange es eine Grenze gegen dauerhafte Mehrbelastung gibt. Wer nur ihren ersten Beitrag liest, hält sie für eine Gegnerin des flexiblen Systems. Das ist sie nicht." },
  ],
};

/* ── 2. VOCABULARY ────────────────────────────────────────────────────────── */
const vocabulary = {
  id: "exp_rufbereitschaft_chunks",
  kind: "vocabulary",
  ord: 1,
  title: "Vier Sätze, um Muster von Absicht zu trennen",
  minutes: 9,
  primary_capability: "argue",
  secondary_capabilities: ["concede", "structure"],
  checks: ["lexical_range"],
  teaches: [
    ["Das verteilt sich einfach ungleich, das liegt an niemandem persönlich.", "it just distributes unevenly, that's nobody's fault personally", "🔗"],
    ["Warum eigentlich immer die gleichen?", "why is it always the same people, actually?", "🔗"],
    ["X würde helfen, löst aber nicht alles.", "X would help, but it doesn't solve everything", "🔗"],
    ["Ich mache das gern öfter, wenn …", "I'm happy to do that more often, if …", "🔗"],
  ],
  steps: [
    { t: "story", lines: [
      "Vier Sätze aus dem Thread, den Sie gerade gelesen haben.",
      "Keine Vokabeln — vier Züge, mit denen man ein unfaires Muster anspricht, ohne anzugreifen.",
    ] },

    { t: "notice", ex: "warum_eigentlich_immer_die_gleichen", sourceId: SOURCE_ID, w: 1 },
    { t: "notice", ex: "verteilt_sich_ungleich_liegt_an_niemandem", sourceId: SOURCE_ID, w: 0 },

    { t: "chunk_choose",
      situation: "Ihnen fällt auf, dass eine unbeliebte Aufgabe fast immer bei denselben zwei Kolleginnen landet. Sie wollen das ansprechen, ohne jemandem eine böse Absicht zu unterstellen.",
      q: "Wie sprechen Sie es an?",
      options: [
        "Warum eigentlich immer die gleichen?",
        "Das verteilt sich einfach ungleich, das liegt an niemandem persönlich.",
        "X würde helfen, löst aber nicht alles.",
      ],
      answer: 0,
      exercises: ["warum_eigentlich_immer_die_gleichen"],
      explain: "A eröffnet die Frage direkt und lädt zur Erklärung ein — genau die Situation. B wäre eine mögliche spätere Antwort DARAUF, aber keine Eröffnung. C passt inhaltlich nicht, es geht noch um keine Lösung." },

    { t: "notice", ex: "wuerde_helfen_loest_aber_nicht_alles", sourceId: SOURCE_ID, w: 2 },
    { t: "notice", ex: "mache_das_gern_oefter_wenn", sourceId: SOURCE_ID, w: 3 },

    { t: "chunk_choose",
      situation: "Ein Kollege schlägt eine feste Liste für eine unbeliebte Aufgabe vor. Sie finden die Idee grundsätzlich gut, sehen aber, dass sie nicht jedes Problem löst.",
      q: "Wie kommentieren Sie den Vorschlag?",
      options: [
        "Eine feste Liste würde helfen, löst aber nicht alles.",
        "Warum eigentlich immer die gleichen?",
        "Ich mache das gern öfter, wenn es fair verteilt ist.",
      ],
      answer: 0,
      exercises: ["wuerde_helfen_loest_aber_nicht_alles"],
      explain: "A befürwortet den Vorschlag und benennt gleichzeitig seine Grenze — genau Ihre Position. B passt hier nicht, es fragt nach der Ursache eines Problems, nicht nach einer Lösung. C ist eine Bedingung, aber keine Bewertung des Vorschlags." },

    { t: "chunk_produce", ex: "verteilt_sich_ungleich_liegt_an_niemandem", sourceId: SOURCE_ID,
      context: "Eine unbeliebte Aufgabe verteilt sich bei Ihnen im Team ungleich, aber nicht, weil jemand absichtlich benachteiligt wird. Erklären Sie das.",
      hint: "Erst das Muster beschreiben, dann ausdrücklich niemanden beschuldigen." },

    { t: "chunk_produce", ex: "mache_das_gern_oefter_wenn", sourceId: SOURCE_ID,
      context: "Sie sind bereit, eine unbeliebte Aufgabe öfter zu übernehmen — aber nur unter einer bestimmten Bedingung. Formulieren Sie das.",
      hint: "Die Bereitschaft zuerst, dann die Bedingung." },
  ],
};

const EXPERIENCES = [reading, vocabulary];

module.exports = { EXPERIENCES, SOURCE_ID };
