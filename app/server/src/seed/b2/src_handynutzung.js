/**
 * SOURCE 10 — „Handynutzung während der Arbeitszeit"
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
    "zwischen Absicht und Wirkung unterscheiden: so gemeint war es sicher nicht, angekommen ist es trotzdem so",
    "eine Regel für einen bestimmten Fall akzeptieren, allgemein aber ablehnen: für Notfälle ja, sonst eigentlich nicht",
    "eine Beobachtung von einer Unterstellung trennen: das ist mir aufgefallen, unterstellen will ich niemandem etwas",
    "auf eine Doppelmoral hinweisen, ohne anzugreifen: mit zweierlei Maß gemessen, oder sehe ich das falsch?",
  ],
  checks: [],
  experience_types: ["reading", "vocabulary"],
  exam: "Goethe Lesen Aufgabe 2 (Standpunkte zuordnen) und Schreiben Aufgabe 1 (Forumsbeitrag)",
  recognition_only: true,
};

const TITLE = "Handynutzung während der Arbeitszeit";
const HOOK = "Fünf Beiträge zu einer neuen Regel — und am Ende geht es weniger um das Handy als um Vertrauen.";

const SCRIPT = [
  { handle: "petra", speaker: "Petra L.", when: "Mi 12:30", de:
    "Bei uns wurde jetzt verboten, das Handy während der Arbeitszeit überhaupt sichtbar zu haben, auch in den Pausenräumen. Ich verstehe, dass es Probleme gab — aber so pauschal finde ich das übertrieben." },

  { handle: "daniel", speaker: "Daniel_R", when: "Mi 13:15", de:
    "Für Notfälle sehe ich das ein — wenn jemand ständig privat telefoniert, während Patienten warten, ist das ein echtes Problem. Sonst eigentlich nicht. Die meisten von uns nutzen das Handy verantwortungsvoll, und die werden jetzt mitbestraft." },

  { handle: "isabel", speaker: "Isabel_Stationsleitung", when: "Mi 15:40", de:
    "So gemeint war die Regel sicher nicht als Misstrauen gegenüber allen. Ausgelöst hat es ein einzelner, wiederholter Vorfall. Angekommen ist es bei euch allerdings offenbar genau so, und das kann ich nachvollziehen." },

  { handle: "felix", speaker: "Felix_B", when: "Do 08:05", de:
    "Mir ist noch etwas anderes aufgefallen: Führungskräfte haben ihr Handy weiterhin sichtbar auf dem Schreibtisch liegen, während wir es komplett wegpacken müssen. Mit zweierlei Maß gemessen, oder sehe ich das falsch? Unterstellen will ich niemandem etwas, es ist mir nur aufgefallen." },

  { handle: "petra", speaker: "Petra L.", when: "Do 11:22", de:
    "Felix' Beobachtung trifft eigentlich genau das, worum es mir geht. Mich stört gar nicht das Verbot an sich — mich stört, dass es nur für einen Teil des Teams gilt. Wenn alle dieselbe Regel hätten, hätte ich damit überhaupt kein Problem." },
];

const VOICES = SCRIPT.reduce((acc, p) => {
  if (!acc.some(v => v.handle === p.handle)) acc.push({ handle: p.handle, speaker: p.speaker });
  return acc;
}, []);

const TRANSCRIPT = SCRIPT.map(p => p.de).join("\n\n");
const WORDS = TRANSCRIPT.split(/\s+/).length;

const CHUNKS = require("./chunks_handynutzung");

module.exports = { KIND, DECLARATION, CHUNKS, TITLE, HOOK, SCRIPT, VOICES, TRANSCRIPT, WORDS, MARKERS: [] };
