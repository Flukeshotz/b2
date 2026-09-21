/**
 * SOURCE 18 — „Sprachbausteine: Ein Text mit Lücken"
 *
 * ORIGINAL SKILLCASE CONTENT. telc's Sprachbausteine format — a running text
 * with numbered gaps, each gap a three-option choice of connector, particle
 * or fixed collocation, testing grammatical/lexical fit rather than content
 * comprehension. Built the same way the earlier exam-paper phase built
 * Sprachbausteine items for telc-b2-sprachbausteine-1/2 (b2_paper_items),
 * just wired into this topic/experience system instead of the exam-paper
 * one, since this is ongoing PRACTICE content, not a scored exam paper.
 *
 * Uses read_source + readq exactly like every other reading source here —
 * each gap is one readq item, the source text carries the numbered blanks
 * as literal "___(1)___" markers so the passage reads coherently around
 * them, same convention telc itself uses.
 */

const KIND = "text";

const DECLARATION = {
  primary_capability: "structure",
  secondary_capabilities: [],
  theme: 3,
  cefr_tier: "developing",
  difficulty: {
    content: ["implicit_cohesion"],
    delivery: [],
  },
  language_resources: [
    "Konnektoren im Kontext: obwohl, trotzdem, dennoch, allerdings, sowohl … als auch",
    "feste Wendungen erkennen, die nur in einer Form in die Lücke passen",
  ],
  checks: [],
  experience_types: ["reading"],
  exam: "telc Sprachbausteine — Lückentext, drei Optionen pro Lücke",
  recognition_only: true,
};

const TITLE = "Sprachbausteine: Ein Text mit Lücken";
const HOOK = "Ein zusammenhängender Text mit sechs Lücken — nicht die Bedeutung ist hier das Problem, sondern welches Wort wirklich passt.";

const SCRIPT = [
  { handle: "text", speaker: "Text", when: "", de:
    "Immer mehr Betriebe bieten inzwischen Homeoffice an, ___(1)___ längst nicht jede Tätigkeit sich dafür eignet. Wer direkten Kontakt zu Patientinnen und Patienten hat, kann seine Arbeit ___(2)___ von zu Hause noch aus dem Café erledigen. ___(3)___ diese Tätigkeiten von vornherein ausgeschlossen sind, wünschen sich viele Beschäftigte in solchen Berufen trotzdem mehr Flexibilität — etwa bei der Schichtplanung. Einige Kliniken reagieren ___(4)___ schon darauf und bieten mehr Mitspracherecht bei der Verteilung der Dienste. Andere Häuser halten dagegen ___(5)___ an starren Plänen fest, weil eine Änderung aus ihrer Sicht zu kompliziert wäre. Ob sich diese Haltung auf Dauer halten lässt, ___(6)___ sich zeigen — der Druck von Seiten der Beschäftigten wächst jedenfalls spürbar." },
];

const VOICES = [{ handle: "text", speaker: "Text" }];
const TRANSCRIPT = SCRIPT[0].de;
const WORDS = TRANSCRIPT.split(/\s+/).length;

const CHUNKS = require("./chunks_sprachbausteine_praxis");

module.exports = { KIND, DECLARATION, CHUNKS, TITLE, HOOK, SCRIPT, VOICES, TRANSCRIPT, WORDS, MARKERS: [] };
