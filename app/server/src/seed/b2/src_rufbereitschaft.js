/**
 * SOURCE 13 — „Rufbereitschaft: wer übernimmt sie?"
 *
 * ORIGINAL SKILLCASE CONTENT. Same forum-thread shape as the earlier sources
 * in this series.
 */

const KIND = "text";

const DECLARATION = {
  primary_capability: "compare",
  secondary_capabilities: ["structure", "concede", "argue"],
  theme: 3,
  cefr_tier: "developing",
  difficulty: {
    content: ["competing_viewpoints", "implicit_cohesion", "inference_required"],
    delivery: [],
  },
  language_resources: [
    "eine Verteilung als unfair markieren, ohne jemanden zu beschuldigen: das verteilt sich einfach ungleich, das liegt an niemandem persönlich",
    "eine Lösung befürworten, aber ihre Grenzen benennen: das würde helfen, löst aber nicht alles",
    "eine Frage stellen, die eine Annahme hinterfragt: warum eigentlich immer die gleichen?",
    "ein Zugeständnis mit einer Bedingung verbinden: ich mache das gern öfter, wenn es fair verteilt ist",
  ],
  checks: [],
  experience_types: ["reading", "vocabulary"],
  exam: "Goethe Lesen Aufgabe 2 (Standpunkte zuordnen) und Schreiben Aufgabe 1 (Forumsbeitrag)",
  recognition_only: true,
};

const TITLE = "Rufbereitschaft: wer übernimmt sie?";
const HOOK = "Fünf Beiträge zu einer Aufgabe, die niemand gern macht — und trotzdem regelmäßig bei denselben Leuten landet.";

const SCRIPT = [
  { handle: "sandra", speaker: "Sandra_H", when: "Do 19:15", de:
    "Mir ist aufgefallen, dass ich in den letzten drei Monaten deutlich öfter Rufbereitschaft hatte als andere aus dem Team. Warum eigentlich immer die gleichen? Ich will mich nicht drücken, aber es sollte doch gleichmäßig verteilt sein." },

  { handle: "andre", speaker: "André_K", when: "Do 20:30", de:
    "Das verteilt sich einfach ungleich, das liegt an niemandem persönlich — wer flexibel ist und in der Nähe wohnt, wird automatisch öfter gefragt. Es ist keine böswillige Entscheidung, sondern eher eine praktische." },

  { handle: "birthe", speaker: "Birthe_Stationsleitung", when: "Fr 08:00", de:
    "Wir haben tatsächlich keine feste Rotation, sondern fragen immer die Person, die am ehesten erreichbar scheint. Das erklärt, warum es sich bei manchen häuft — aber es macht es nicht automatisch gerecht." },

  { handle: "lukas", speaker: "Lukas_F", when: "Fr 10:45", de:
    "Eine feste Rotation würde helfen, löst aber nicht alles: manche haben private Gründe, warum bestimmte Wochen besser oder schlechter passen. Eine starre Liste würde das ignorieren." },

  { handle: "sandra", speaker: "Sandra_H", when: "Fr 13:20", de:
    "Lukas' Einwand ist berechtigt, das sehe ich ein. Mich stört gar nicht, dass es flexibel gehandhabt wird — mich stört, dass es dabei kein Limit gibt. Ich mache das gern öfter, wenn es fair verteilt ist und niemand dauerhaft mehr trägt als der Rest." },
];

const VOICES = SCRIPT.reduce((acc, p) => {
  if (!acc.some(v => v.handle === p.handle)) acc.push({ handle: p.handle, speaker: p.speaker });
  return acc;
}, []);

const TRANSCRIPT = SCRIPT.map(p => p.de).join("\n\n");
const WORDS = TRANSCRIPT.split(/\s+/).length;

const CHUNKS = require("./chunks_rufbereitschaft");

module.exports = { KIND, DECLARATION, CHUNKS, TITLE, HOOK, SCRIPT, VOICES, TRANSCRIPT, WORDS, MARKERS: [] };
