/**
 * SOURCE 14 — „Fahrtkostenzuschuss für Wechselschicht"
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
    "eine Regel auf ihre praktische Wirkung prüfen: auf dem Papier klingt das fair, in der Praxis sieht es anders aus",
    "einen Sonderfall von der Regel abgrenzen: das ist eher die Ausnahme als der Normalfall",
    "eine Forderung mit einem Vergleich stützen: anderswo wird das längst so gemacht",
    "eine eigene Unsicherheit einräumen: ganz sicher bin ich mir da selbst nicht",
  ],
  checks: [],
  experience_types: ["reading", "vocabulary"],
  exam: "Goethe Lesen Aufgabe 2 (Standpunkte zuordnen) und Schreiben Aufgabe 1 (Forumsbeitrag)",
  recognition_only: true,
};

const TITLE = "Fahrtkostenzuschuss für Wechselschicht";
const HOOK = "Fünf Beiträge zu einer Regel, die auf dem Papier gerecht aussieht — bis jemand nachrechnet.";

const SCRIPT = [
  { handle: "monika", speaker: "Monika_R", when: "Fr 07:30", de:
    "Bei uns gibt es einen Fahrtkostenzuschuss, aber nur für Frühschicht, weil da angeblich öffentliche Verkehrsmittel seltener fahren. Für mich als Nachtschicht-Kollegin fährt um halb vier morgens erst recht nichts — ich verstehe die Logik nicht." },

  { handle: "thorsten", speaker: "Thorsten_B", when: "Fr 09:10", de:
    "Auf dem Papier klingt das fair — Frühschicht ist objektiv am schwierigsten mit dem Bus zu erreichen. In der Praxis sieht es allerdings anders aus, wie du sagst: Nachtschicht hat oft überhaupt keine Verbindung, nicht nur eine seltene." },

  { handle: "carola", speaker: "Carola_Personalabteilung", when: "Fr 11:45", de:
    "Die Regel wurde vor einigen Jahren eingeführt, als es noch keine durchgehende Nachtschicht gab. Das war damals wirklich eher die Ausnahme als der Normalfall. Dass sich das inzwischen geändert hat, ist mir ehrlich gesagt neu." },

  { handle: "ben", speaker: "Ben_bewerbung", when: "Fr 14:20", de:
    "Bei meinem letzten Arbeitgeber gab es einen Zuschuss für alle Schichten mit eingeschränkter ÖPNV-Anbindung, unabhängig von der Uhrzeit. Anderswo wird das längst so gemacht — es scheint also durchaus machbar zu sein." },

  { handle: "monika", speaker: "Monika_R", when: "Fr 16:55", de:
    "Bens Beispiel zeigt eigentlich genau, worum es mir geht. Mich stört gar nicht, dass es überhaupt eine Regel gibt — mich stört, dass sie auf einer Annahme beruht, die inzwischen nicht mehr stimmt. Ganz sicher bin ich mir allerdings nicht, ob eine Anpassung wirklich so einfach ist, wie Bens Beispiel klingt." },
];

const VOICES = SCRIPT.reduce((acc, p) => {
  if (!acc.some(v => v.handle === p.handle)) acc.push({ handle: p.handle, speaker: p.speaker });
  return acc;
}, []);

const TRANSCRIPT = SCRIPT.map(p => p.de).join("\n\n");
const WORDS = TRANSCRIPT.split(/\s+/).length;

const CHUNKS = require("./chunks_fahrtkosten");

module.exports = { KIND, DECLARATION, CHUNKS, TITLE, HOOK, SCRIPT, VOICES, TRANSCRIPT, WORDS, MARKERS: [] };
