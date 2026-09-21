/**
 * SOURCE 04 — „Dokumentation: Tablet oder Papier?"
 *
 * ORIGINAL SKILLCASE CONTENT. A short two-voice workplace dialogue, on the
 * shape src_muede uses (computed timings, sections for a second listen,
 * corpus-attested markers) but deliberately shorter — two speakers instead of
 * three, about three minutes instead of ten — so it fills a different slot:
 * Goethe Hören Aufgabe 1 territory (a shorter exchange) rather than Aufgabe 2.
 *
 * WHY THIS TOPIC. Same wedge as src_muede and src_fortbildung: something a
 * shift worker in care has actually argued about. Sabine trusts what she can
 * check by hand; Markus has watched the digital system catch a mistake she
 * would not have caught herself. Neither is simply right, and by the end
 * Sabine's real objection turns out to be narrower than her opening line —
 * the same device src_homeoffice and src_fortbildung both use.
 *
 * NO SPECIALIST KNOWLEDGE. The dispute is about a workflow — how something
 * gets written down and by whom — never about a medical fact. No item
 * requires knowing anything about nursing beyond what the dialogue itself
 * explains.
 */

const DECLARATION = {
  primary_capability: "understand_speech",
  secondary_capabilities: ["concede", "argue"],
  theme: 7,                       // Gesundheit und Hygiene, crossing into 3
  cefr_tier: "developing",
  difficulty: {
    content: ["competing_viewpoints", "inference_required"],
    delivery: ["authentic_speed"],
  },
  language_resources: [
    "einen Einwand vorwegnehmen: bevor du das sagst — …",
    "eine Erfahrung gegen ein Argument setzen: in der Theorie … in der Praxis …",
    "eine Bedingung nachschieben: es sei denn, …",
    "eine Position einschränken, nicht aufgeben: ich bin ja nicht grundsätzlich dagegen",
  ],
  checks: [],
  experience_types: ["listening", "vocabulary"],
  exam: "Goethe Hören Aufgabe 1 — kurzes Gespräch, zweimal gehört",
  /* No writing/speaking experience ships with this source yet, matching
     src_fortbildung's flag for the same reason: not manufacturing a
     production task just to avoid the gate's shape check. */
  recognition_only: true,
};

const V = {
  sabine: { speaker: "Sabine",  voice: "katja",  style: null },
  markus: { speaker: "Markus",  voice: "conrad", style: null },
};

const WPM = 135, TURN_PAUSE_MS = 500;
function withTimings(turns) {
  let ms = 0;
  return turns.map((turn) => {
    const out = { ...turn, ms: Math.round(ms) };
    ms += (turn.de.split(/\s+/).length / WPM) * 60000 + TURN_PAUSE_MS;
    return out;
  });
}

const SCRIPT = withTimings([
  { ...V.markus, de: "Du wirkst genervt. Was ist los?" },
  { ...V.sabine, de: "Die neue Dokumentations-App. Ich soll jetzt jede Übergabe zusätzlich ins Tablet tippen. Als hätte ich sonst nichts zu tun." },
  { ...V.markus, de: "Ich weiß, es kostet erstmal Zeit. Aber bevor du das ganz ablehnst — letzte Woche hat die App bei mir einen Fehler gefunden, den ich selbst nicht gesehen hätte. Zwei Einträge, die sich widersprochen haben." },
  { ...V.sabine, de: "Das mag sein. In der Theorie klingt das großartig. In der Praxis heißt es: ich stehe am Bett und tippe, statt mit dem Patienten zu sprechen." },
  { ...V.markus, de: "Ich bin ja nicht grundsätzlich gegen Papier. Nur, ehrlich gesagt, bei Papier hat's bei uns auch schon Fehler gegeben. Die Handschrift von der Nachtschicht, die keiner lesen konnte." },
  { ...V.sabine, de: "Das stimmt, das war ärgerlich. Es sei denn, jemand schreibt wirklich unleserlich, finde ich Papier trotzdem schneller. Ich muss nicht warten, bis das Gerät hochgefahren ist." },
  { ...V.markus, de: "Das mit dem Hochfahren nervt mich auch. Aber das ist doch eher ein Problem mit den alten Geräten, oder? Nicht mit der Idee an sich." },
  { ...V.sabine, de: "Vielleicht. Mich stört ehrlich gesagt weniger die App selbst als der Zeitpunkt. Mitten im Spätdienst, ohne Einweisung, das war einfach zu viel auf einmal." },
  { ...V.markus, de: "Da hast du recht. Eine Schulung vorher wäre besser gewesen." },
  { ...V.sabine, de: "Wenn wir das nächste Mal eine Einweisung bekommen und genug Zeit zum Üben, dann rede ich noch mal drüber. Aber bitte nicht wieder so." },
]);

const DURATION_S = Math.ceil(
  SCRIPT.reduce((n, x) => n + x.de.split(/\s+/).length, 0) / WPM * 60 + SCRIPT.length * TURN_PAUSE_MS / 1000
);

const MARKER_SPECS = [
  { phrase: "bevor du das sagst …", match: "bevor du das ganz ablehnst", en: "before you say that …",
    why: "Names the objection you expect and heads it off before it lands." },
  { phrase: "in der Theorie … in der Praxis …", match: "in der Theorie", en: "in theory … in practice …",
    why: "Grants an idea's logic while denying it holds up once it meets real conditions." },
  { phrase: "es sei denn, …", match: "es sei denn", en: "unless …",
    why: "Attaches one exception to a claim without withdrawing the claim itself." },
  { phrase: "ich bin ja nicht grundsätzlich dagegen", match: "nicht grundsätzlich gegen", en: "I'm not fundamentally against it",
    why: "Narrows a position from opposition to a specific objection — the move the whole dialogue turns on." },
];

const MARKERS = MARKER_SPECS.map((m) => {
  const turn = SCRIPT.find(x => x.de.toLowerCase().includes(m.match.toLowerCase()));
  if (!turn) throw new Error(`marker not found in script: "${m.phrase}"`);
  return { ...m, ms: turn.ms, speaker: turn.speaker };
});

const TRANSCRIPT = SCRIPT.map(s => `${s.speaker}: ${s.de}`).join("\n\n");

const SECTIONS = [
  { id: "s1", label: "Die Beschwerde",       startsWith: "Du wirkst genervt" },
  { id: "s2", label: "Zwei Fehlerarten",     startsWith: "Ich bin ja nicht grundsätzlich" },
  { id: "s3", label: "Was sie wirklich stört", startsWith: "Vielleicht. Mich stört" },
];

function sectionRanges() {
  const starts = SECTIONS.map((sec) => {
    const i = SCRIPT.findIndex(t => t.de.startsWith(sec.startsWith));
    if (i < 0) throw new Error(`section "${sec.id}" anchor not found: "${sec.startsWith}"`);
    return { ...sec, from: i };
  });
  return starts.map((sec, k) => ({
    ...sec,
    to: k + 1 < starts.length ? starts[k + 1].from - 1 : SCRIPT.length - 1,
    ms: SCRIPT[sec.from].ms,
  }));
}

const TITLE = "Dokumentation: Tablet oder Papier?";
const HOOK = "Zwei Kollegen, ein neues Tablet, und ein Streit, der am Ende gar nicht mehr vom Tablet handelt.";

const CHUNKS = require("./chunks_dokumentation");

module.exports = {
  CHUNKS, TITLE, HOOK, DECLARATION, SECTIONS, sectionRanges, SCRIPT, MARKERS, TRANSCRIPT, DURATION_S, V };
