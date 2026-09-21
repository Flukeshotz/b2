/**
 * SOURCE 05 — „Überstunden: auszahlen oder abbauen?"
 *
 * ORIGINAL SKILLCASE CONTENT. Same forum-thread shape as src_homeoffice and
 * src_fortbildung (Goethe Lesen Aufgabe 2 / Schreiben Aufgabe 1) — five posts,
 * four people, a genuine disagreement about a workplace policy.
 *
 * WHY THIS TOPIC. A third angle on the same wedge as the earlier two sources
 * (scheduling, continuing education): what happens to hours worked beyond the
 * roster. No clinical vocabulary anywhere — the dispute is about pay and time,
 * not medicine.
 *
 * THE B2 TURN: the poster who opens the thread sounding firmly in favour of
 * cash payout turns out, two posts later, to actually want choice rather than
 * one fixed rule for everyone — the same shape as Kerstin_M's and Nina K.'s
 * arcs in the earlier two sources, deliberately repeated because it is
 * exactly the inference Goethe's Lesen Aufgabe 2 rewards and a B1 reader
 * reliably misses.
 */

const KIND = "text";

const DECLARATION = {
  primary_capability: "compare",
  secondary_capabilities: ["structure", "concede", "argue"],
  theme: 3,                        // Tägliches Leben, Arbeit
  cefr_tier: "developing",
  difficulty: {
    content: ["competing_viewpoints", "implicit_cohesion", "inference_required"],
    delivery: [],
  },
  language_resources: [
    "eine Verallgemeinerung zurückweisen: das mag für X gelten, für Y aber nicht",
    "eine Bedingung an eine Zustimmung knüpfen: ja, aber nur, wenn …",
    "eine fremde Position vorsichtig infrage stellen: ist das wirklich so eindeutig?",
    "einen Kompromiss vorschlagen, ohne ihn zu fordern: denkbar wäre doch, …",
  ],
  checks: [],
  experience_types: ["reading", "vocabulary"],
  exam: "Goethe Lesen Aufgabe 2 (Standpunkte zuordnen) und Schreiben Aufgabe 1 (Forumsbeitrag)",
  recognition_only: true,
};

const TITLE = "Überstunden: auszahlen oder abbauen?";
const HOOK = "Fünf Beiträge zu einer Frage, die fast jede Station beschäftigt — und die Person, die den Streit anfängt, will am Ende gar keine allgemeine Regel mehr.";

const SCRIPT = [
  { handle: "leon", speaker: "Leon B.", when: "Mi 18:22", de:
    "Bei uns werden Überstunden grundsätzlich mit Freizeit ausgeglichen, ausgezahlt wird nur in Ausnahmefällen. Ehrlich gesagt verstehe ich das nicht. Ich habe die Stunden gearbeitet, ich will sie bezahlt bekommen, nicht irgendwann als freien Tag, den ich wegen der Personallage sowieso nie nehmen kann." },

  { handle: "franzi", speaker: "Franzi_R", when: "Mi 19:05", de:
    "Kann ich verstehen, nur: bei uns ist es umgekehrt, und die meisten sind froh drüber. Freizeit lässt sich nicht einfach ausgeben, das stimmt schon — aber Geld verschwindet auch. Am Ende des Jahres hat kaum noch jemand das Gefühl, dass sich die Mehrarbeit gelohnt hat." },

  { handle: "dennis", speaker: "Dennis K.", when: "Do 07:41", de:
    "Ich leite unser Team seit zwei Jahren und sehe naturgemäß beide Seiten. Rein rechtlich ist Auszahlung meistens die teurere Option für den Betrieb, deshalb bevorzugen viele Häuser den Freizeitausgleich. Das ist keine böse Absicht, sondern schlicht Kalkulation." },

  { handle: "priya2", speaker: "Priya S.", when: "Do 09:14", de:
    "@Dennis K. Das mag für die Kalkulation gelten, für die Beschäftigten aber nicht unbedingt. Ist das wirklich so eindeutig? Bei uns wird seit letztem Jahr individuell entschieden: wer will, lässt sich auszahlen, wer will, nimmt frei. Die Kosten sind kaum gestiegen, weil sich das ungefähr die Waage hält." },

  { handle: "leon", speaker: "Leon B.", when: "Do 12:30", de:
    "Priyas Lösung trifft eigentlich genau das, was ich eigentlich wollte. Mich stört gar nicht so sehr der Freizeitausgleich an sich — mich stört, dass niemand gefragt wurde, was zu wem passt. Denkbar wäre doch, dass jeder für sich wählt, statt dass eine Regel für alle gilt." },
];

const VOICES = SCRIPT.reduce((acc, p) => {
  if (!acc.some(v => v.handle === p.handle)) acc.push({ handle: p.handle, speaker: p.speaker });
  return acc;
}, []);

const TRANSCRIPT = SCRIPT.map(p => p.de).join("\n\n");
const WORDS = TRANSCRIPT.split(/\s+/).length;

const CHUNKS = require("./chunks_ueberstunden");

module.exports = { KIND, DECLARATION, CHUNKS, TITLE, HOOK, SCRIPT, VOICES, TRANSCRIPT, WORDS, MARKERS: [] };
