/**
 * SOURCE 12 — „Digitale Teambesprechungen: sinnvoll oder Zeitverschwendung?"
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
    "eine Grenze zwischen zwei Situationen ziehen: für X funktioniert das, für Y nicht mehr",
    "eine Vermutung als Vermutung markieren: ich vermute, dass es eher daran liegt, dass …",
    "eine dritte Möglichkeit vorschlagen: warum nicht beides kombinieren, je nach Anlass",
    "eine Beobachtung mit einer Zahl stützen: von den letzten X Besprechungen war ungefähr die Hälfte …",
  ],
  checks: [],
  experience_types: ["reading", "vocabulary"],
  exam: "Goethe Lesen Aufgabe 2 (Standpunkte zuordnen) und Schreiben Aufgabe 1 (Forumsbeitrag)",
  recognition_only: true,
};

const TITLE = "Digitale Teambesprechungen: sinnvoll oder Zeitverschwendung?";
const HOOK = "Fünf Beiträge zu einer Gewohnheit, die sich eingeschlichen hat — und niemand mehr infrage stellt, bis es jemand tut.";

const SCRIPT = [
  { handle: "simone", speaker: "Simone_K", when: "Mo 09:30", de:
    "Seit einem Jahr laufen unsere wöchentlichen Teambesprechungen nur noch digital, auch wenn alle im selben Gebäude arbeiten. Ich frage mich langsam, warum eigentlich — wir könnten genauso gut im selben Raum sitzen." },

  { handle: "bernd", speaker: "Bernd_T", when: "Mo 10:50", de:
    "Für kurze Absprachen funktioniert digital eigentlich ganz gut, für längere Diskussionen nicht mehr. Ich vermute, dass es eher daran liegt, dass sich digital niemand die Zeit nimmt, einen Raum zu buchen — es ist einfach bequemer, einen Link zu schicken." },

  { handle: "walter", speaker: "Walter_L", when: "Mo 13:05", de:
    "Ich habe das digitale Format damals eingeführt, weil wir zeitweise im Homeoffice waren. Dass daraus eine Gewohnheit wurde, ohne dass jemand eine neue Entscheidung getroffen hat, ist mir ehrlich gesagt selbst erst kürzlich aufgefallen." },

  { handle: "yara", speaker: "Yara_P", when: "Di 08:20", de:
    "Von den letzten zehn Besprechungen war ungefähr die Hälfte reine Information ohne echte Diskussion. Für diese Art würde ich sogar sagen: digital ist da klarer strukturiert als im Raum, wo sich Gespräche leicht in Nebengespräche auflösen." },

  { handle: "simone", speaker: "Simone_K", when: "Di 11:40", de:
    "Yaras Punkt bringt es eigentlich auf den Kern. Mich stört gar nicht das digitale Format an sich — mich stört, dass wir nie unterscheiden, wofür es passt und wofür nicht. Warum nicht beides kombinieren, je nach Anlass, statt immer dasselbe Format zu nehmen?" },
];

const VOICES = SCRIPT.reduce((acc, p) => {
  if (!acc.some(v => v.handle === p.handle)) acc.push({ handle: p.handle, speaker: p.speaker });
  return acc;
}, []);

const TRANSCRIPT = SCRIPT.map(p => p.de).join("\n\n");
const WORDS = TRANSCRIPT.split(/\s+/).length;

const CHUNKS = require("./chunks_teambesprechung");

module.exports = { KIND, DECLARATION, CHUNKS, TITLE, HOOK, SCRIPT, VOICES, TRANSCRIPT, WORDS, MARKERS: [] };
