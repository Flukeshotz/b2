/**
 * SOURCE 11 — „Feedbackgespräche: einmal im Jahr oder laufend?"
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
    "einen Vorteil einräumen und trotzdem widersprechen: das hat schon Vorteile, überzeugt mich trotzdem nicht ganz",
    "eine Sorge konkret benennen, statt sie nur zu behaupten: konkret befürchte ich, dass …",
    "zwischen Häufigkeit und Qualität unterscheiden: öfter heißt nicht automatisch besser",
    "eine Bedingung für die eigene Zustimmung formulieren: dafür müsste allerdings sichergestellt sein, dass …",
  ],
  checks: [],
  experience_types: ["reading", "vocabulary"],
  exam: "Goethe Lesen Aufgabe 2 (Standpunkte zuordnen) und Schreiben Aufgabe 1 (Forumsbeitrag)",
  recognition_only: true,
};

const TITLE = "Feedbackgespräche: einmal im Jahr oder laufend?";
const HOOK = "Fünf Beiträge zu einer Frage, die harmlos klingt — bis jemand zugibt, wovor er sich eigentlich fürchtet.";

const SCRIPT = [
  { handle: "verena", speaker: "Verena_S", when: "Di 09:12", de:
    "Bei uns wird jetzt vorgeschlagen, das jährliche Feedbackgespräch durch kurze monatliche Gespräche zu ersetzen. Ich finde die Idee grundsätzlich gut — häufigeres Feedback klingt sinnvoll, statt einmal im Jahr alles auf einmal zu hören." },

  { handle: "klaus2", speaker: "Klaus_M", when: "Di 10:45", de:
    "Öfter heißt aber nicht automatisch besser. Bei einem Kollegen, der das schon in einem anderen Betrieb hatte, wurde daraus schnell reine Routine — die Gespräche wurden immer kürzer und inhaltsleerer, bis kaum noch jemand sie ernst genommen hat." },

  { handle: "annette", speaker: "Annette_Teamleitung", when: "Di 14:30", de:
    "Das hat schon Vorteile, das gebe ich zu — aber es überzeugt mich trotzdem nicht ganz. Zwölf kurze Gespräche vorzubereiten kostet für mich als Leitung deutlich mehr Zeit als eines, und diese Zeit fehlt dann anderswo." },

  { handle: "juergen", speaker: "Jürgen_K", when: "Mi 08:15", de:
    "Konkret befürchte ich außerdem, dass monatliches Feedback bei Problemen zu früh und zu direkt kommt, ohne dass genug Zeit war, etwas wirklich zu verändern. Ein Jahr gibt wenigstens die Chance, sich zu entwickeln, bevor geurteilt wird." },

  { handle: "verena", speaker: "Verena_S", when: "Mi 11:50", de:
    "Jürgens Punkt trifft eigentlich genau das, was mich eigentlich beschäftigt. Mich stört gar nicht die Häufigkeit an sich — mich stört, dass niemand gesagt hat, wie kurzes Feedback von echter Beurteilung unterschieden werden soll. Dafür müsste allerdings sichergestellt sein, dass ein einzelnes schlechtes Gespräch nicht gleich als Urteil zählt." },
];

const VOICES = SCRIPT.reduce((acc, p) => {
  if (!acc.some(v => v.handle === p.handle)) acc.push({ handle: p.handle, speaker: p.speaker });
  return acc;
}, []);

const TRANSCRIPT = SCRIPT.map(p => p.de).join("\n\n");
const WORDS = TRANSCRIPT.split(/\s+/).length;

const CHUNKS = require("./chunks_feedbackgespraeche");

module.exports = { KIND, DECLARATION, CHUNKS, TITLE, HOOK, SCRIPT, VOICES, TRANSCRIPT, WORDS, MARKERS: [] };
