/**
 * SOURCE 15 — „Weiterbildungsbudget: pro Kopf oder nach Bedarf?"
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
    "eine Regel als einfach, aber ungenau kritisieren: einfach zu verwalten schon, gerecht aber nicht unbedingt",
    "eine Befürchtung mit einer Bedingung entkräften: nur, wenn klare Kriterien gelten, sonst nicht",
    "einen Vorschlag mit dem eigenen Zweifel versehen: ob das in der Praxis funktioniert, wage ich zu bezweifeln",
    "eine Erfahrung als Einzelfall relativieren: das war bei mir vielleicht einfach Glück",
  ],
  checks: [],
  experience_types: ["reading", "vocabulary"],
  exam: "Goethe Lesen Aufgabe 2 (Standpunkte zuordnen) und Schreiben Aufgabe 1 (Forumsbeitrag)",
  recognition_only: true,
};

const TITLE = "Weiterbildungsbudget: pro Kopf oder nach Bedarf?";
const HOOK = "Fünf Beiträge zu einer Frage, die zunächst nach Geld klingt — und eigentlich nach Vertrauen.";

const SCRIPT = [
  { handle: "elena", speaker: "Elena_W", when: "Mo 10:20", de:
    "Bei uns bekommt jeder pro Jahr denselben Betrag für Weiterbildung, egal ob jemand einen teuren Kurs braucht oder gar keinen möchte. Einfach zu verwalten schon, gerecht aber nicht unbedingt — wer wirklich etwas Teures braucht, geht leer aus." },

  { handle: "hakan", speaker: "Hakan_T", when: "Mo 11:35", de:
    "Bei einer Vergabe nach Bedarf hätte ich allerdings Bedenken: wer entscheidet dann, wessen Bedarf größer ist? Nur, wenn klare Kriterien gelten, würde ich das unterstützen — sonst wird es schnell zu einer Frage von Sympathie." },

  { handle: "petra2", speaker: "Petra_L2", when: "Mo 14:10", de:
    "Bei mir persönlich hat die Vergabe nach Bedarf bisher gut funktioniert — ich habe letztes Jahr einen teuren Kurs bekommen, den ich wirklich brauchte. Das war bei mir vielleicht einfach Glück, ich will das nicht verallgemeinern." },

  { handle: "michael2", speaker: "Michael_D", when: "Di 08:50", de:
    "Ob das in der Praxis für alle so fair läuft wie bei Petra, wage ich allerdings zu bezweifeln. Gerade wer sich weniger traut, seinen Bedarf laut zu äußern, geht bei einer reinen Bedarfsvergabe eher leer aus als bei einem festen Betrag für alle." },

  { handle: "elena", speaker: "Elena_W", when: "Di 12:15", de:
    "Michaels Einwand trifft eigentlich genau das, was mich beschäftigt. Mich stört gar nicht die Idee einer bedarfsgerechten Verteilung an sich — mich stört, dass dabei genau die leiser Sprechenden übersehen werden könnten. Vielleicht bräuchte es beides: einen kleinen Grundbetrag für alle und zusätzlich eine Bedarfsvergabe." },
];

const VOICES = SCRIPT.reduce((acc, p) => {
  if (!acc.some(v => v.handle === p.handle)) acc.push({ handle: p.handle, speaker: p.speaker });
  return acc;
}, []);

const TRANSCRIPT = SCRIPT.map(p => p.de).join("\n\n");
const WORDS = TRANSCRIPT.split(/\s+/).length;

const CHUNKS = require("./chunks_weiterbildungsbudget");

module.exports = { KIND, DECLARATION, CHUNKS, TITLE, HOOK, SCRIPT, VOICES, TRANSCRIPT, WORDS, MARKERS: [] };
