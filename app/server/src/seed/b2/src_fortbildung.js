/**
 * SOURCE 03 — „Pflichtfortbildungen: Arbeitszeit oder Freizeit?"
 *
 * ORIGINAL SKILLCASE CONTENT. Not derived from any published textbook or exam
 * paper — written for this product, in the same authored-thread shape as
 * src_homeoffice (Goethe Lesen Aufgabe 2 / Schreiben Aufgabe 1), because that
 * shape is what lets one text carry both attribution-reading and a
 * Forumsbeitrag stimulus.
 *
 * WHY THIS TOPIC. The nursing-shift wedge this product is built around means
 * the learner has almost certainly sat in exactly this argument: mandatory
 * continuing education scheduled outside the roster, and whether the hours
 * count as work. No clinical vocabulary is required anywhere in the source —
 * the dispute is about scheduling and pay, not medicine, so the gate's
 * KEIN FACHWISSEN rule is satisfied by construction, not by editing around it.
 *
 * THE B2 TURN, same device as src_homeoffice: the person who starts the
 * thread sounding entirely against the policy is, by her last post, revealed
 * to be against how it was decided rather than the policy itself. A learner
 * who only retrieves what each post says will misread her position; a B2
 * reader tracks how it changes across five posts.
 *
 * COMPLEXITY RULE: content difficulty is high (competing viewpoints, implicit
 * cohesion, inference). Delivery difficulty stays empty — this is a text
 * source, so there is no delivery to rate.
 */

const KIND = "text";

const DECLARATION = {
  primary_capability: "compare",
  secondary_capabilities: ["structure", "concede", "argue"],
  theme: 7,                        // Gesundheit und Hygiene — workplace, not clinical
  cefr_tier: "developing",
  difficulty: {
    content: ["competing_viewpoints", "implicit_cohesion", "inference_required"],
    delivery: [],
  },
  language_resources: [
    "Zugeständnis vor Widerspruch: keine Frage, X ist wichtig — nur …",
    "Eine Unterscheidung einführen: es kommt darauf an, ob …",
    "Eine Vermutung vorsichtig formulieren: das dürfte kaum …",
    "Konjunktiv II für ein nicht gewähltes Verfahren: hätte man uns gefragt, dann …",
    "eine fremde Position zusammenfassen, bevor man ihr widerspricht: wenn ich Sie richtig verstehe, …",
  ],
  checks: [],
  experience_types: ["reading", "vocabulary"],
  exam: "Goethe Lesen Aufgabe 2 (Standpunkte zuordnen) und Schreiben Aufgabe 1 (Forumsbeitrag)",
  /* No writing/speaking experience ships with this source yet — this thread
     is used for reading + vocabulary only for now. A production experience
     belongs here later (the same Forumsbeitrag shape as exp_homeoffice's
     writing loop), it just is not authored yet, and the gate's own rule is
     not to manufacture one just to avoid this flag. */
  recognition_only: true,
};

const TITLE = "Pflichtfortbildungen: Arbeitszeit oder Freizeit?";
const HOOK = "Fünf Beiträge zu einer Frage, die in jeder Station irgendwann auftaucht — und die Person, die den Streit anfängt, will am Ende etwas anderes, als es zuerst klingt.";

/* `speaker` is the display name; `handle` is the stable key the attribution
   items answer with, so a later rename never silently changes an answer key. */
const SCRIPT = [
  { handle: "nina", speaker: "Nina K.", when: "Mo 21:04", de:
    "Kurze Frage in die Runde: Bei uns wurden die zwei Pflichtfortbildungen für dieses Quartal auf 16 bis 18 Uhr gelegt — direkt nach der Spätschicht, nicht während der Dienstzeit. Zählt das bei euch als Arbeitszeit, oder wird erwartet, dass man einfach bleibt?" },

  { handle: "jonas", speaker: "Jonas_P", when: "Mo 21:31", de:
    "Bei uns ist das schon immer so gelaufen. Die Themen sind vorgeschrieben, die Termine sind knapp, und irgendwann muss es eben stattfinden. Ich verstehe den Unmut, aber ganz ehrlich: davon geht die Welt nicht unter." },

  { handle: "wagner", speaker: "Stationsleitung Wagner", when: "Di 07:52", de:
    "Ich leite die Station seit drei Jahren und sehe das naturgemäß von der anderen Seite. Das Budget für Fortbildungen wird zentral vergeben, und die Referenten sind an feste Termine gebunden — wir suchen sie uns nicht aus. Innerhalb der Dienstzeit müssten wir dafür die Besetzung reduzieren, und das geht bei der aktuellen Personallage schlicht nicht auf." },

  { handle: "priya", speaker: "Priya S.", when: "Di 09:18", de:
    "@Stationsleitung Wagner Wenn ich Sie richtig verstehe, ist das Problem also die Besetzung, nicht der Wille. Das leuchtet mir ein — nur folgt daraus doch nicht automatisch, dass die Zeit unbezahlt bleibt. Bei uns wird genau dieselbe Konstellation gelöst, indem die Fortbildungszeit separat erfasst und im Folgemonat als Freizeit ausgeglichen wird. Beschwert hat sich seitdem niemand mehr." },

  { handle: "nina", speaker: "Nina K.", when: "Di 12:47", de:
    "Priyas Lösung trifft es eigentlich genau. Mich stört ehrlich gesagt weniger die Fortbildung selbst — die ist ja sinnvoll — als der Umstand, dass niemand vorher gefragt hat, wie das mit unseren Diensten überhaupt zusammenpasst. Hätte man uns vorher gefragt, dann wäre vermutlich sofort eine Lösung wie Priyas dabei herausgekommen, und wir würden jetzt nicht darüber streiten." },
];

const VOICES = SCRIPT.reduce((acc, p) => {
  if (!acc.some(v => v.handle === p.handle)) acc.push({ handle: p.handle, speaker: p.speaker });
  return acc;
}, []);

const TRANSCRIPT = SCRIPT.map(p => p.de).join("\n\n");
const WORDS = TRANSCRIPT.split(/\s+/).length;

const CHUNKS = require("./chunks_fortbildung");

module.exports = { KIND, DECLARATION, CHUNKS, TITLE, HOOK, SCRIPT, VOICES, TRANSCRIPT, WORDS, MARKERS: [] };
