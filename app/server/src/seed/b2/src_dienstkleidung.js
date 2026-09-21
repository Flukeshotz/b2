/**
 * SOURCE 07 — „Dienstkleidung: wer zahlt dafür?"
 *
 * ORIGINAL SKILLCASE CONTENT. Same forum-thread shape as the earlier sources
 * in this series — five posts, four people, no clinical vocabulary.
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
    "eine Erfahrung gegen eine allgemeine Regel setzen: bei mir persönlich war das anders",
    "eine Bedingung formulieren, unter der man zustimmt: solange X gilt, bin ich einverstanden",
    "einen Unterschied zwischen zwei Fällen markieren: das eine hat mit dem anderen wenig zu tun",
    "eine Lösung vorsichtig anzweifeln: klingt gut, nur frage ich mich, ob …",
  ],
  checks: [],
  experience_types: ["reading", "vocabulary"],
  exam: "Goethe Lesen Aufgabe 2 (Standpunkte zuordnen) und Schreiben Aufgabe 1 (Forumsbeitrag)",
  recognition_only: true,
};

const TITLE = "Dienstkleidung: wer zahlt dafür?";
const HOOK = "Fünf Beiträge zu einer Frage, die klein aussieht — und am Ende geht es um etwas ganz anderes als um Geld.";

const SCRIPT = [
  { handle: "sonja", speaker: "Sonja W.", when: "Do 17:40", de:
    "Kurze Frage: bei uns müssen wir die Dienstkleidung selbst kaufen, nur die Reinigung übernimmt der Betrieb. Ist das bei euch auch so? Ich finde das ehrlich gesagt nicht in Ordnung." },

  { handle: "matteo", speaker: "Matteo_F", when: "Do 18:12", de:
    "Bei mir persönlich war das anders: mein früherer Arbeitgeber hat alles gestellt, inklusive Schuhe. Hier zahlen wir selbst, aber dafür bekommen wir einen festen Betrag jedes Jahr dazu, mit dem man das ausgleichen kann." },

  { handle: "helene", speaker: "Helene K.", when: "Fr 07:55", de:
    "Ich bin seit über zehn Jahren im Bereich Personal tätig und kenne beide Modelle. Rein rechtlich muss der Arbeitgeber nur dann zahlen, wenn eine bestimmte Kleidung vorgeschrieben ist und sie sich nicht privat nutzen lässt. Bei einfacher Arbeitskleidung ist das oft eine freiwillige Leistung, kein Anspruch." },

  { handle: "yusuf", speaker: "Yusuf D.", when: "Fr 09:30", de:
    "Das mag rechtlich stimmen, hat aber mit der Frage, was fair ist, eigentlich wenig zu tun. Solange die Kleidung für den Job vorgeschrieben ist und man sie sonst nirgends trägt, sollte der Betrieb dafür aufkommen — Anspruch hin oder her." },

  { handle: "sonja", speaker: "Sonja W.", when: "Fr 12:05", de:
    "Yusufs Punkt bringt es eigentlich auf den Kern. Mich stört gar nicht so sehr das Geld an sich — bei Matteos Modell mit dem festen Betrag könnte ich sogar leben. Mich stört, dass bei uns niemand überhaupt erklärt hat, warum es so geregelt ist. Wenn ich das wüsste, würde ich es vermutlich auch akzeptieren." },
];

const VOICES = SCRIPT.reduce((acc, p) => {
  if (!acc.some(v => v.handle === p.handle)) acc.push({ handle: p.handle, speaker: p.speaker });
  return acc;
}, []);

const TRANSCRIPT = SCRIPT.map(p => p.de).join("\n\n");
const WORDS = TRANSCRIPT.split(/\s+/).length;

const CHUNKS = require("./chunks_dienstkleidung");

module.exports = { KIND, DECLARATION, CHUNKS, TITLE, HOOK, SCRIPT, VOICES, TRANSCRIPT, WORDS, MARKERS: [] };
