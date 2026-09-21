/**
 * SOURCE 08 — „Einarbeitung neuer Kolleginnen: wer bezahlt die Zeit?"
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
    "eine fremde Erfahrung anerkennen, bevor man die eigene nennt: das kenne ich, bei uns ist es aber …",
    "eine Ursache von einer Ausrede unterscheiden: das ist kein Grund, das ist eine Ausrede",
    "eine Forderung an eine Voraussetzung koppeln: erst wenn X gesichert ist, kann Y funktionieren",
    "eine Position präzisieren, ohne sie aufzugeben: genauer gesagt, meine ich damit …",
  ],
  checks: [],
  experience_types: ["reading", "vocabulary"],
  exam: "Goethe Lesen Aufgabe 2 (Standpunkte zuordnen) und Schreiben Aufgabe 1 (Forumsbeitrag)",
  recognition_only: true,
};

const TITLE = "Einarbeitung neuer Kolleginnen: wer bezahlt die Zeit?";
const HOOK = "Fünf Beiträge zu einer Frage, die auf jeder Station auftaucht, sobald jemand Neues anfängt.";

const SCRIPT = [
  { handle: "carla", speaker: "Carla N.", when: "Mo 08:15", de:
    "Bei uns übernehmen erfahrene Kolleginnen die Einarbeitung zusätzlich zu ihrer normalen Arbeit — ohne dass dafür Zeit eingeplant wird. Das führt dazu, dass die Einarbeitung entweder zu kurz kommt oder die reguläre Arbeit liegen bleibt." },

  { handle: "robert", speaker: "Robert_H", when: "Mo 09:40", de:
    "Das kenne ich, bei uns ist es aber anders geregelt: wer einarbeitet, bekommt für diese Zeit offiziell reduzierte eigene Aufgaben. Klingt gut in der Theorie, in der Praxis übernimmt trotzdem meistens dieselbe Person beides gleichzeitig." },

  { handle: "gisela", speaker: "Gisela_Stationsleitung", when: "Mo 13:02", de:
    "Ich leite unsere Station seit sechs Jahren. Reduzierte Aufgaben für Mentorinnen einzuplanen ist bei aktueller Personallage schlicht nicht immer möglich — nicht, weil wir es nicht wollen, sondern weil dann eine andere Aufgabe komplett unbesetzt bliebe." },

  { handle: "peter", speaker: "Peter_W", when: "Di 07:20", de:
    "@Gisela_Stationsleitung Das ist kein Grund, das ist eine Ausrede — mit Verlaub. Erst wenn genug Personal gesichert ist, kann Einarbeitung überhaupt funktionieren. Ohne das bleibt es immer beim Improvisieren, egal wie gut die Regel auf dem Papier klingt." },

  { handle: "carla", speaker: "Carla N.", when: "Di 11:48", de:
    "Peters Punkt trifft es eigentlich genau, auch wenn ich das Wort „Ausrede“ nicht gewählt hätte. Mich stört gar nicht, dass Gisela ehrlich über die Personallage spricht — mich stört, dass die Einarbeitungszeit trotzdem offiziell so eingeplant wird, als gäbe es das Problem nicht. Genauer gesagt: ich will keine perfekte Lösung, nur eine ehrliche Planung." },
];

const VOICES = SCRIPT.reduce((acc, p) => {
  if (!acc.some(v => v.handle === p.handle)) acc.push({ handle: p.handle, speaker: p.speaker });
  return acc;
}, []);

const TRANSCRIPT = SCRIPT.map(p => p.de).join("\n\n");
const WORDS = TRANSCRIPT.split(/\s+/).length;

const CHUNKS = require("./chunks_einarbeitung");

module.exports = { KIND, DECLARATION, CHUNKS, TITLE, HOOK, SCRIPT, VOICES, TRANSCRIPT, WORDS, MARKERS: [] };
