/**
 * SOURCE 06 — „Pausenregelung: feste Zeiten oder flexibel?"
 *
 * ORIGINAL SKILLCASE CONTENT. Same forum-thread shape as src_homeoffice,
 * src_fortbildung and src_ueberstunden — five posts, four people, a genuine
 * workplace disagreement, no clinical vocabulary.
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
    "eine Ausnahme benennen, bevor man widerspricht: von Ausnahmen abgesehen, …",
    "ein Argument entkräften, indem man es zeitlich einordnet: das galt, solange …",
    "eine Sache relativieren: so schlimm, wie es klingt, ist es in der Praxis nicht",
    "höflich um Präzisierung bitten: was genau meinen Sie mit …?",
  ],
  checks: [],
  experience_types: ["reading", "vocabulary"],
  exam: "Goethe Lesen Aufgabe 2 (Standpunkte zuordnen) und Schreiben Aufgabe 1 (Forumsbeitrag)",
  recognition_only: true,
};

const TITLE = "Pausenregelung: feste Zeiten oder flexibel?";
const HOOK = "Fünf Beiträge zu einer Frage, die banal klingt und es nicht ist — und die Person, die zuerst am lautesten protestiert, meint am Ende etwas Konkreteres.";

const SCRIPT = [
  { handle: "melanie", speaker: "Melanie T.", when: "Mo 13:10", de:
    "Bei uns wurde jetzt eine feste Pausenzeit eingeführt: zwölf bis halb eins, für alle gleich. Vorher konnte jeder selbst entscheiden, wann es gerade passt. Ich finde das eine Verschlechterung — meine Arbeit lässt sich nicht einfach um zwölf Uhr unterbrechen." },

  { handle: "oskar", speaker: "Oskar_L", when: "Mo 14:03", de:
    "Von Ausnahmen wie akuten Situationen abgesehen, finde ich feste Zeiten eigentlich gut. Bei uns hat vorher jeder selbst entschieden, und am Ende hat die Hälfte gar keine richtige Pause gemacht, sondern nur zwischendurch etwas gegessen." },

  { handle: "birgit", speaker: "Birgit_Stationsleitung", when: "Mo 16:22", de:
    "Ich leite die Station seit vier Jahren und habe die Regel eingeführt, weil sich sonst niemand traut zu gehen, wenn gerade viel los ist. Mit einer festen Zeit für alle fühlt sich niemand schuldig, weil eben alle gleichzeitig weg sind." },

  { handle: "tarek", speaker: "Tarek M.", when: "Di 08:47", de:
    "@Birgit_Stationsleitung Was genau meinen Sie mit „alle gleichzeitig weg“? Bei uns würde das bedeuten, dass eine halbe Stunde lang niemand ansprechbar ist. Das kann doch eigentlich nicht die Absicht sein." },

  { handle: "melanie", speaker: "Melanie T.", when: "Di 11:15", de:
    "Tareks Frage bringt es eigentlich auf den Punkt. Mich stört gar nicht die feste Zeit an sich — mich stört, dass niemand gesagt hat, wie die Erreichbarkeit während der Pause geregelt ist. Wenn das geklärt wäre, hätte ich mit einer festen Zeit kein Problem mehr." },
];

const VOICES = SCRIPT.reduce((acc, p) => {
  if (!acc.some(v => v.handle === p.handle)) acc.push({ handle: p.handle, speaker: p.speaker });
  return acc;
}, []);

const TRANSCRIPT = SCRIPT.map(p => p.de).join("\n\n");
const WORDS = TRANSCRIPT.split(/\s+/).length;

const CHUNKS = require("./chunks_pausen");

module.exports = { KIND, DECLARATION, CHUNKS, TITLE, HOOK, SCRIPT, VOICES, TRANSCRIPT, WORDS, MARKERS: [] };
