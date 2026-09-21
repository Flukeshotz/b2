/**
 * WHAT A STRONG ANSWER CONTAINS — from the teacher, not from us.
 *
 * The interview engine could already tell a candidate their answer was short or
 * vague. It could not show them what a good one sounds like, and a verdict with
 * no model is not a lesson. These are a qualified German teacher's own bullet
 * points, September 2026.
 *
 * Deliberately NOT written as model sentences to recite. The teacher gave the
 * SHAPE of a strong answer — what has to be in it, in what order — because a
 * candidate who memorises our paragraph is rehearsing our German, not building
 * their own. `contains` is what we check for and what we show; the learner
 * supplies the words.
 *
 * `redFlags` is the more valuable half and came unprompted: answers that would
 * worry a German employer. Better taught here than discovered in a real call.
 */

const GUIDANCE = {
  vorstellen: {
    de: "Können Sie sich bitte kurz vorstellen?",
    contains: [
      "Name, Ausbildung und Qualifikation",
      "Berufserfahrung — wie viele Jahre, in welchen Bereichen",
      "ein bis zwei fachliche Schwerpunkte oder Stationen (z. B. Chirurgie, Geriatrie, Intensiv)",
      "kurzer Bezug zur Bewerbung: „deshalb interessiert mich diese Stelle“",
    ],
    shape: "Kurz und chronologisch. Nicht abschweifen.",
    redFlags: [],
  },

  unfallpatient: {
    de: "Ein Unfallpatient wird hereingebracht. Was ist Ihre Aufgabe?",
    contains: [
      "zuerst Ruhe bewahren und die Situation einschätzen: Bewusstsein, Atmung, Blutung",
      "Vitalzeichen kontrollieren",
      "Arzt oder Ärztin informieren, bzw. das Notfallteam alarmieren",
      "die eigenen Kompetenzgrenzen kennen — nur das tun, wofür man ausgebildet ist",
      "die Patientin oder den Patienten beruhigen, wenn möglich",
      "Dokumentation nicht vergessen",
    ],
    shape: "Reihenfolge zeigen: einschätzen, melden, handeln, dokumentieren.",
    redFlags: [
      { says: "Ich würde sofort selbst behandeln oder entscheiden.",
        why: "Zeigt, dass die eigenen Kompetenzgrenzen nicht klar sind. Im deutschen Pflegealltag ist das ein Warnsignal." },
    ],
  },

  aerztliche_anweisung: {
    de: "Was tun Sie, wenn Sie mit einer ärztlichen Anweisung nicht einverstanden sind?",
    contains: [
      "die Anweisung nicht einfach ignorieren und nicht eigenmächtig ändern",
      "Bedenken direkt und sachlich ansprechen, nachfragen",
      "die eigene fachliche Einschätzung begründen",
      "bei ungeklärten Sicherheitsbedenken die Vorgesetzte einbeziehen und dokumentieren",
      "das Ziel benennen: Patientensicherheit, nicht Recht haben",
    ],
    shape: "Widerspruch ja — aber im Verfahren, nicht am Verfahren vorbei.",
    redFlags: [
      { says: "Ich mache einfach, was der Arzt sagt.",
        why: "Keine Eigenverantwortung und kein kritisches Denken. In Deutschland wird beides erwartet." },
    ],
  },

  prioritaeten: {
    de: "Was hat für Sie Vorrang, wenn es sehr viel zu tun gibt?",
    contains: [
      "Prioritäten nach medizinischer Dringlichkeit setzen — Vitalzeichen, akute Verschlechterung zuerst",
      "Aufgaben strukturieren und planen, gegebenenfalls delegieren",
      "offen kommunizieren, wenn die Kapazität nicht reicht: Team und Vorgesetzte informieren",
      "Patientensicherheit vor Formalitäten",
    ],
    shape: "Ein Kriterium nennen, nach dem sortiert wird — nicht nur „alles wichtig“.",
    redFlags: [
      { says: "Ich mache alles gleichzeitig.",
        why: "Keine klare Antwort." },
      { says: "Ich mache einfach der Reihe nach, wie es kommt.",
        why: "Zeigt fehlendes Verständnis für klinische Dringlichkeit." },
    ],
  },
};

/* Applies to EVERY question, not one of them. The teacher volunteered this as a
   cross-cutting warning and it is the single most useful thing in the set. */
const UNIVERSAL_RED_FLAG = {
  pattern: "Antworten, die zeigen, dass die Person allein und ohne Rücksprache mit dem Team entscheidet.",
  why: "Teamkommunikation und Eskalation sind im deutschen Pflegeberuf zentrale Kompetenzen. Eine Antwort ohne Team ist fachlich schwach, auch wenn das Deutsch gut ist.",
};

/** What to show a candidate whose answer was thin — the shape, not a script. */
function guidanceFor(questionId) {
  const g = GUIDANCE[questionId];
  if (!g) return null;
  return { ...g, universalRedFlag: UNIVERSAL_RED_FLAG };
}

module.exports = { GUIDANCE, UNIVERSAL_RED_FLAG, guidanceFor };
