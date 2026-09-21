/**
 * SOURCE 21 — „Vier Überschriften, vier Absätze"
 *
 * ORIGINAL SKILLCASE CONTENT. telc Lesen Teil 1's shape: several short
 * paragraphs (here, on one connected topic), each needing the one headline
 * that actually summarizes it — not just the one sharing a keyword. Built
 * on read_source + readq, same mechanism as src_anzeigen_kurse's ad-matching,
 * but headline-to-paragraph rather than situation-to-ad.
 */

const KIND = "text";

const DECLARATION = {
  primary_capability: "structure",
  secondary_capabilities: [],
  theme: 7,
  cefr_tier: "developing",
  difficulty: {
    content: ["implicit_cohesion"],
    delivery: [],
  },
  language_resources: [
    "eine Überschrift als Zusammenfassung erkennen, nicht als Stichwortliste",
    "einen Absatz auf seinen Kernpunkt reduzieren",
  ],
  checks: [],
  experience_types: ["reading"],
  exam: "telc Lesen Teil 1 — Überschriften zuordnen",
  recognition_only: true,
};

const TITLE = "Vier Überschriften, vier Absätze";
const HOOK = "Vier kurze Absätze zu einem Thema — und mehr als eine Überschrift, die auf den ersten Blick passen könnte.";

const SCRIPT = [
  { handle: "p1", speaker: "Absatz 1", when: "", de:
    "Eine aktuelle Erhebung unter Pflegekräften zeigt: Die Zahl der Bewerbungen auf offene Stellen ist gestiegen, seit mehrere Kliniken in der Region begonnen haben, feste Dienstpläne vier Wochen im Voraus zu veröffentlichen. Bewerberinnen und Bewerber gaben in Befragungen an, dass Planbarkeit für sie inzwischen wichtiger sei als ein höheres Gehalt allein." },

  { handle: "p2", speaker: "Absatz 2", when: "", de:
    "Nicht jede Einrichtung kann sich diesem Trend allerdings anschließen. Kleinere Häuser mit knapper Personaldecke berichten, dass sich Dienstpläne wegen kurzfristiger Krankheitsausfälle kaum vier Wochen im Voraus verlässlich festlegen lassen — jede Änderung müsste sonst ständig neu kommuniziert werden, was den erhofften Vorteil zunichtemachen würde." },

  { handle: "p3", speaker: "Absatz 3", when: "", de:
    "Ein Modellprojekt aus einer mittelgroßen Klinik zeigt einen möglichen Mittelweg: Der Dienstplan wird vier Wochen im Voraus veröffentlicht, gilt aber ausdrücklich als vorläufig. Änderungen sind weiterhin möglich, müssen jedoch spätestens 48 Stunden vorher mitgeteilt werden — außer bei echten Notfällen. Die Rückmeldungen der Beschäftigten fallen bisher überwiegend positiv aus." },

  { handle: "p4", speaker: "Absatz 4", when: "", de:
    "Langfristig, so sind sich Expertinnen und Experten einig, wird sich am grundlegenden Problem wenig ändern, solange der Personalmangel in der Pflege bestehen bleibt. Bessere Planungswerkzeuge könnten die Situation zwar spürbar entschärfen — sie ersetzen aber keine zusätzlichen Arbeitskräfte, die in vielen Regionen schlicht fehlen." },
];

const VOICES = SCRIPT.map(p => ({ handle: p.handle, speaker: p.speaker }));
const TRANSCRIPT = SCRIPT.map(p => `${p.speaker}\n${p.de}`).join("\n\n");
const WORDS = TRANSCRIPT.split(/\s+/).length;

const CHUNKS = require("./chunks_ueberschriften_pflege");

module.exports = { KIND, DECLARATION, CHUNKS, TITLE, HOOK, SCRIPT, VOICES, TRANSCRIPT, WORDS, MARKERS: [] };
