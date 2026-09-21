/**
 * SOURCE 09 — „Urlaubsplanung: nach Dienstalter oder nach Wunsch?"
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
    "ein Prinzip verteidigen, ohne den Einzelfall zu bestreiten: als Prinzip finde ich das richtig, in diesem Fall aber …",
    "eine Regel auf ihre Herkunft zurückführen: die Regel stammt noch aus einer Zeit, als …",
    "eine Alternative als Kompromiss anbieten: ein Mittelweg wäre doch …",
    "zwischen Sicherheit und Fairness unterscheiden: sicher schon, aber ist es auch fair?",
  ],
  checks: [],
  experience_types: ["reading", "vocabulary"],
  exam: "Goethe Lesen Aufgabe 2 (Standpunkte zuordnen) und Schreiben Aufgabe 1 (Forumsbeitrag)",
  recognition_only: true,
};

const TITLE = "Urlaubsplanung: nach Dienstalter oder nach Wunsch?";
const HOOK = "Fünf Beiträge zu einer alten Regel, die kaum jemand mehr für zeitgemäß hält — und trotzdem hat sie auch heute noch Verteidiger.";

const SCRIPT = [
  { handle: "annika", speaker: "Annika F.", when: "Mo 16:05", de:
    "Bei uns bekommen die Wünsche für die Sommerferien immer noch nach Dienstalter Vorrang. Ich bin erst seit zwei Jahren dabei und habe kleine Kinder — trotzdem bekomme ich fast nie die Woche, die ich brauche." },

  { handle: "wolfgang", speaker: "Wolfgang_D", when: "Mo 17:30", de:
    "Als Prinzip finde ich Dienstalter eigentlich richtig — wer lange dabei ist, sollte etwas davon haben. In deinem Fall mit kleinen Kindern klingt das allerdings hart, das gebe ich zu." },

  { handle: "renate", speaker: "Renate_Stationsleitung", when: "Di 08:12", de:
    "Diese Regelung stammt noch aus einer Zeit, als die meisten Kolleginnen keine schulpflichtigen Kinder hatten und die Ferienzeiten weniger Konflikte verursachten. Damals war sie eine Frage der Gerechtigkeit gegenüber langjährigen Mitarbeiterinnen. Ob sie das heute noch ist, frage ich mich inzwischen selbst." },

  { handle: "murat", speaker: "Murat_K", when: "Di 10:45", de:
    "Ein Mittelweg wäre doch, Eltern schulpflichtiger Kinder bei den Sommerferien Vorrang zu geben und Dienstalter für alle anderen Zeiträume beizubehalten. Dann bleibt das Prinzip erhalten, ohne dass es an der Stelle hart wird, wo es am meisten wehtut." },

  { handle: "annika", speaker: "Annika F.", when: "Di 14:20", de:
    "Murats Vorschlag trifft eigentlich genau das, was ich wollte. Mich stört gar nicht das Dienstalter als Prinzip — mich stört, dass es ausgerechnet bei den Schulferien keine Ausnahme gibt, obwohl das der einzige Zeitraum ist, in dem ich wirklich keine Wahl habe." },
];

const VOICES = SCRIPT.reduce((acc, p) => {
  if (!acc.some(v => v.handle === p.handle)) acc.push({ handle: p.handle, speaker: p.speaker });
  return acc;
}, []);

const TRANSCRIPT = SCRIPT.map(p => p.de).join("\n\n");
const WORDS = TRANSCRIPT.split(/\s+/).length;

const CHUNKS = require("./chunks_urlaubsplanung");

module.exports = { KIND, DECLARATION, CHUNKS, TITLE, HOOK, SCRIPT, VOICES, TRANSCRIPT, WORDS, MARKERS: [] };
