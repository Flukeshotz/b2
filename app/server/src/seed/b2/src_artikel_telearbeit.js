/**
 * SOURCE 22 — „Telearbeit in der Pflege: ein Widerspruch?"
 *
 * ORIGINAL SKILLCASE CONTENT. telc Lesen Teil 3's shape: a single longer
 * text, tested with three-way items — Richtig / Falsch / Text sagt dazu
 * nichts — which forces the reader to distinguish "stated," "contradicted"
 * and "not addressed at all," a genuinely different discrimination than any
 * format built so far this session.
 */

const KIND = "text";

const DECLARATION = {
  primary_capability: "structure",
  secondary_capabilities: [],
  theme: 7,
  cefr_tier: "developing",
  difficulty: {
    content: ["implicit_cohesion", "inference_required"],
    delivery: [],
  },
  language_resources: [
    "zwischen expliziter Aussage und fehlender Information unterscheiden",
    "eine Verallgemeinerung von einer konkreten Aussage im Text trennen",
  ],
  checks: [],
  experience_types: ["reading"],
  exam: "telc Lesen Teil 3 — Richtig/Falsch/Text sagt dazu nichts",
  recognition_only: true,
};

const TITLE = "Telearbeit in der Pflege: ein Widerspruch?";
const HOOK = "Ein Sachtext, bei dem genau hinsehen wichtiger ist als schnell lesen: manches steht da, manches nicht — und der Unterschied ist die eigentliche Aufgabe.";

const SCRIPT = [
  { handle: "text", speaker: "Text", when: "", de:
    "Telearbeit gilt in vielen Berufen inzwischen als Selbstverständlichkeit. In der Pflege dagegen wirkt der Begriff auf den ersten Blick wie ein Widerspruch — schließlich erfordert die direkte Betreuung von Patientinnen und Patienten physische Anwesenheit. Ein genauerer Blick zeigt jedoch, dass ein erheblicher Teil der Arbeitszeit in der Pflege aus administrativen Tätigkeiten besteht, die grundsätzlich ortsunabhängig erledigt werden könnten: Dienstplanung, Dokumentation, Fortbildungsorganisation, Qualitätsmanagement.\n\nEinige Einrichtungen haben in den letzten Jahren begonnen, genau diese Tätigkeiten testweise ins Homeoffice zu verlagern — allerdings ausschließlich für Personal in koordinierenden oder leitenden Funktionen, nicht für das direkt patientennah tätige Pflegepersonal. Die bisherigen Rückmeldungen aus diesen Pilotprojekten fallen gemischt aus: Während die Flexibilität grundsätzlich positiv bewertet wird, berichten mehrere Einrichtungen von einem spürbaren Rückgang des informellen fachlichen Austauschs zwischen den Teams.\n\nEine oft übersehene Nebenwirkung betrifft die Sichtbarkeit dieser Arbeit innerhalb der Organisation: Wer im Homeoffice Dienstpläne erstellt, wird von den Kolleginnen und Kollegen vor Ort seltener direkt wahrgenommen, was in einzelnen Fällen zu einer unterschätzten Arbeitsbelastung geführt hat. Diese Tätigkeiten galten schon vor der Einführung von Homeoffice als wenig sichtbar, weil sie meist außerhalb der eigentlichen Stationsarbeit stattfanden — das Homeoffice hat dieses bereits bestehende Problem eher verstärkt als neu geschaffen.\n\nOb sich Telearbeit in der Pflege langfristig auf weitere Tätigkeitsbereiche ausweiten lässt, ist unter Fachleuten umstritten. Fest steht bislang nur, dass die pauschale Aussage, Pflege sei grundsätzlich nicht homeofficefähig, die tatsächliche Vielfalt der Tätigkeiten in diesem Berufsfeld nicht angemessen widerspiegelt." },
];

const VOICES = [{ handle: "text", speaker: "Text" }];
const TRANSCRIPT = SCRIPT[0].de;
const WORDS = TRANSCRIPT.split(/\s+/).length;

const CHUNKS = require("./chunks_artikel_telearbeit");

module.exports = { KIND, DECLARATION, CHUNKS, TITLE, HOOK, SCRIPT, VOICES, TRANSCRIPT, WORDS, MARKERS: [] };
