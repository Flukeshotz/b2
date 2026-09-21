/**
 * SOURCE 02 — „Homeoffice: zwei Tage im Büro — Pflicht oder Unsinn?"
 *
 * A READING source, and the first one. Everything before this was audio, so the
 * shape is deliberately the same — authored turns with a named speaker — but
 * the turns are forum posts, and that is not a cosmetic difference.
 *
 * WHY A FORUM THREAD. Goethe's Schreiben Aufgabe 1 asks for a Forumsbeitrag,
 * and its Lesen tasks include matching positions to people. A thread gives both
 * from one text: the learner reads five positions that genuinely conflict, and
 * then writes into the same thread. It also lets register vary honestly inside
 * one source — tobi_87 writes the way people write in forums, A. Reinhardt
 * writes the way a team lead writes — which is `adapt_register` exposure the
 * learner does not have to be told about.
 *
 * THE THING THAT MAKES IT B2 RATHER THAN A COMPREHENSION TEXT: the person who
 * starts the thread does not hold the position her first post implies. She
 * objects to the rule; by her second post it is clear she objects to how the
 * rule was made, and would have accepted the same rule from a different
 * process. Nothing states that. A learner who only retrieves facts will miss
 * it, which is exactly the difference between B1 and B2 reading.
 *
 * COMPLEXITY RULE: content difficulty is high (competing viewpoints, implicit
 * cohesion, inference). Delivery difficulty is therefore empty — and for a text
 * source it should be: there is no delivery. Loading both would break the rule
 * the validator enforces.
 *
 * KEIN FACHWISSEN. Office work is everyday-domain (Goethe theme 3). No item
 * requires knowing anything about employment law, contracts or any industry.
 */

const KIND = "text";               // b2_sources.kind: audio or text

const DECLARATION = {
  /* `compare` is primary, not `structure`: the work the learner does here is
     holding five positions apart and seeing where they actually overlap. */
  primary_capability: "compare",
  secondary_capabilities: ["structure", "concede", "argue"],
  theme: 3,                        // Tägliches Leben, Arbeit
  cefr_tier: "developing",
  difficulty: {
    content: ["competing_viewpoints", "implicit_cohesion", "inference_required"],
    delivery: [],                  // a text has none — see the header
  },
  language_resources: [
    "Zugeständnis vor Widerspruch: ich will das gar nicht rundweg ablehnen …, nur …",
    "Einschränkung einer Folgerung: nur folgt daraus doch nicht …",
    "Standpunkt markieren: ich sehe das naturgemäß anders",
    "Irrealis für ein nicht gewähltes Verfahren: wäre … ausgehandelt worden, hätte ich …",
    "abschwächende Sicherheitsmarker: vermutlich · wahrscheinlich · schlicht",
  ],
  checks: [],
  experience_types: ["reading", "writing"],
  exam: "Goethe Lesen Aufgabe 2 (Standpunkte zuordnen) und Schreiben Aufgabe 1 (Forumsbeitrag)",
};

const TITLE = "Homeoffice: zwei Tage im Büro — Pflicht oder Unsinn?";
const HOOK = "Fünf Leute, ein Streit, und die Person, die ihn angefangen hat, meint am Ende etwas anderes, als es zuerst aussah.";

/* The thread. `speaker` is the display name; `handle` is the stable key the
   attribution items answer with, so renaming a poster never silently changes an
   answer key. */
const SCRIPT = [
  { handle: "kerstin", speaker: "Kerstin_M", when: "Mo 19:42", de:
    "Bei uns in der Firma gilt seit dem Frühjahr wieder Anwesenheitspflicht: mindestens zwei Tage pro Woche im Büro, festgelegt vom Teamleiter, nicht von uns. Begründet wird das mit dem Zusammenhalt im Team. Ich will das gar nicht rundweg ablehnen — ich habe selbst gemerkt, dass man sich im Homeoffice leichter aus dem Weg geht. Nur frage ich mich, ob ausgerechnet ein fester Wochentag das löst. An meinem Bürotag sitzen die drei Kollegen, mit denen ich tatsächlich zusammenarbeite, zu Hause." },

  { handle: "tobi", speaker: "tobi_87", when: "Mo 20:15", de:
    "Ehrlich? Zusammenhalt ist doch nur das Wort, das man benutzt, wenn man Kontrolle meint. Vor 2020 hat auch niemand behauptet, das Büro sei ein sozialer Ort. Da war es einfach der Ort, an dem der Rechner stand." },

  { handle: "reinhardt", speaker: "A. Reinhardt", when: "Di 08:03", de:
    "Ich leite ein Team von elf Leuten und sehe das naturgemäß anders. Verloren gegangen ist in den letzten Jahren nicht die Stimmung, sondern das Beiläufige: die Frage über den Schreibtisch hinweg, die zwei Minuten kostet und sonst eine Mail und zwei Tage kostet. Bei den Erfahrenen fällt das kaum auf. Bei denen, die neu anfangen, fällt es sofort auf — die trauen sich in einer Videokonferenz mit acht Teilnehmern schlicht nicht zu fragen. Ob zwei feste Tage dafür das richtige Mittel sind, weiß ich allerdings auch nicht." },

  { handle: "nadja", speaker: "Nadja W.", when: "Di 09:37", de:
    "@A. Reinhardt Das Argument mit den Neuen höre ich oft, und es stimmt vermutlich. Nur folgt daraus doch nicht die Pflicht für alle. Wenn das Problem bei den ersten sechs Monaten liegt, dann regelt man die ersten sechs Monate und lässt die übrigen in Ruhe. Bei uns läuft es seit anderthalb Jahren genau so, und beschwert hat sich bisher niemand." },

  { handle: "kerstin", speaker: "Kerstin_M", when: "Di 12:20", de:
    "Das trifft es ganz gut. Mich stört ehrlich gesagt weniger der Bürotag als die Art, wie er zustande gekommen ist. Es hat vorher niemand gefragt, wie wir eigentlich arbeiten. Wäre die Regel im Team ausgehandelt worden, hätte ich sie wahrscheinlich mitgetragen — und dann wäre vermutlich etwas ganz Ähnliches dabei herausgekommen." },
];

/* Who is in the thread, in posting order, deduplicated. The attribution items
   take their options from here rather than repeating the names, so an option
   list can never drift out of sync with the text. */
const VOICES = SCRIPT.reduce((acc, p) => {
  if (!acc.some(v => v.handle === p.handle)) acc.push({ handle: p.handle, speaker: p.speaker });
  return acc;
}, []);

const TRANSCRIPT = SCRIPT.map(p => p.de).join("\n\n");
const WORDS = TRANSCRIPT.split(/\s+/).length;

/* The expressions this source teaches, attached to the source rather than to
   the experience: they belong to the German, and the same five will be met
   again through Maya, through writing and eventually under exam conditions.
   They carry regexes, so they live in code and never in the database. */
const CHUNKS = require("./chunks_homeoffice");

module.exports = { KIND, DECLARATION, CHUNKS, TITLE, HOOK, SCRIPT, VOICES, TRANSCRIPT, WORDS, MARKERS: [] };
