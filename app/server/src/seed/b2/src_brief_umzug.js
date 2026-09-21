/**
 * SOURCE 16 — „Brief: Der neue Arbeitsplatz"
 *
 * ORIGINAL SKILLCASE CONTENT. DELIBERATELY A DIFFERENT FORMAT from every
 * source before it: a single personal letter, not a multi-voice forum
 * thread, tested with detail comprehension rather than attribution/stance/
 * relation/implication/intention. This is Goethe Lesen Teil 1's actual shape
 * (Korrespondenz lesen, Richtig/Falsch on a personal letter) — the format
 * gap the persona audit flagged: every prior reading source, including
 * src_homeoffice from before this session, used the Teil-2 opinion-thread
 * shape exclusively.
 *
 * `readq` only has five declared modes in the gate (attribute, stance,
 * relation, implication, intention) plus `meaning`, used elsewhere for
 * grammar noticing. `meaning` is reused here for straightforward detail
 * comprehension — it fits: "what does the text actually say happened" is a
 * meaning question, just a simpler one than the Teil-2 items. No new step
 * type invented; the existing engine renders this correctly.
 */

const KIND = "text";

const DECLARATION = {
  primary_capability: "structure",
  secondary_capabilities: [],
  theme: 3,
  cefr_tier: "developing",
  difficulty: {
    content: ["inference_required"],
    delivery: [],
  },
  language_resources: [
    "einen Umzug/Wechsel chronologisch erzählen: zuerst … dann … inzwischen …",
    "eine gemischte Bilanz ziehen: nicht nur gut, nicht nur schlecht",
    "eine Erwartung einer Realität gegenüberstellen: ich hatte erwartet … tatsächlich ist es aber …",
  ],
  checks: [],
  experience_types: ["reading"],
  exam: "Goethe Lesen Teil 1 — Korrespondenz lesen, Richtig/Falsch",
  recognition_only: true,
};

const TITLE = "Brief: Der neue Arbeitsplatz";
const HOOK = "Ein Brief an eine Freundin, drei Monate nach dem Stellenwechsel — mit allem, was dazwischen wirklich passiert ist.";

/* A single letter, one voice — the format difference from every forum
   source is the whole point, so SCRIPT is one turn, not five. */
const SCRIPT = [
  { handle: "annelie", speaker: "Annelie", when: "Brief", de:
    "Liebe Karin,\n\nendlich komme ich dazu, dir zu schreiben — drei Monate sind schon vergangen, seit ich die Stelle gewechselt habe! Du erinnerst dich sicher, wie unsicher ich vorher war. Ich hatte erwartet, dass mir vor allem das neue Team fremd vorkommen würde. Tatsächlich ist es aber genau umgekehrt gekommen: Das Team hat mich von Anfang an gut aufgenommen, die Kollegin, die mich eingearbeitet hat, ist inzwischen fast eine Freundin geworden.\n\nSchwierig war eher etwas ganz anderes, mit dem ich nicht gerechnet hatte: die neue Software für die Dokumentation. In den ersten Wochen habe ich für einfache Einträge doppelt so lange gebraucht wie meine Kolleginnen. Erst letzte Woche hatte ich endlich das Gefühl, wirklich mitzukommen.\n\nDie Fahrtzeit ist mit vierzig Minuten länger als vorher, das stört mich ehrlich gesagt schon. Zum Ausgleich habe ich aber flexiblere Arbeitszeiten als früher, worüber ich froh bin — besonders seit die Kinder in die Schule gehen.\n\nInsgesamt würde ich sagen: es war die richtige Entscheidung, auch wenn nicht alles so gelaufen ist, wie ich es mir vorgestellt hatte. Am meisten überrascht hat mich, wie wenig am Ende die Sorgen gestimmt haben, die ich vorher hatte — und wie sehr mich stattdessen eine Kleinigkeit beschäftigt hat, an die ich vorher gar nicht gedacht hatte.\n\nErzähl mir bald, wie es bei euch läuft!\n\nHerzliche Grüße,\nAnnelie" },
];

const VOICES = [{ handle: "annelie", speaker: "Annelie" }];

const TRANSCRIPT = SCRIPT[0].de;
const WORDS = TRANSCRIPT.split(/\s+/).length;

const CHUNKS = require("./chunks_brief_umzug");

module.exports = { KIND, DECLARATION, CHUNKS, TITLE, HOOK, SCRIPT, VOICES, TRANSCRIPT, WORDS, MARKERS: [] };
