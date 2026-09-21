/**
 * FOUR MOVES FROM THE HANDYNUTZUNG THREAD. Original Skillcase content.
 *
 *   separate the intention of a rule from how it landed → concede
 *   accept a rule for one case, reject it in general    → concede
 *   separate an observation from an accusation           → argue
 *   point at unequal treatment without attacking          → argue
 */

const EXPRESSIONS = [
  {
    id: "so_gemeint_war_es_nicht_angekommen_ist_es_so",
    produceContext: "Eine Entscheidung, die Sie getroffen haben, kam bei anderen anders an, als Sie es gemeint hatten. Erkennen Sie das an, ohne sich für die Absicht zu entschuldigen.",
    produceHint: "Erst die Absicht klarstellen, dann die tatsächliche Wirkung anerkennen.",
    citation: "So gemeint war es sicher nicht, angekommen ist es allerdings genau so.",
    gloss: "it certainly wasn't meant that way, but that's how it came across anyway",
    who: "Isabel_Stationsleitung",
    occurrence: "So gemeint war die Regel sicher nicht als Misstrauen gegenüber allen. Ausgelöst hat es ein einzelner, wiederholter Vorfall. Angekommen ist es bei euch allerdings offenbar genau so, und das kann ich nachvollziehen.",
    capability: "concede",
    does: "Sie trennen die eigene Absicht von der tatsächlichen Wirkung bei anderen — und erkennen die Wirkung an, ohne die Absicht zurückzunehmen.",
    notThis: "Es ist keine Entschuldigung für die Entscheidung selbst. Es erkennt nur an, wie sie wahrgenommen wurde.",
    pattern: /so\s+gemeint\s+war\b[\s\S]{0,160}?\bangekommen\s+ist\s+es\b/i,
    frame: /so\s+gemeint\s+war\b[\s\S]{0,200}?\bangekommen\s+ist\s+es\b[^.!?]{0,60}/i,
    novelty: 4, minWords: 10,
    help: {
      absent: "Benutzen Sie „So gemeint war es sicher nicht, angekommen ist es trotzdem so.“",
      frame: "Beide Hälften müssen stehen — die Absicht UND die tatsächliche Wirkung.",
      good: "Genau: Sie trennen Absicht und Wirkung, statt eine gegen die andere auszuspielen.",
    },
  },

  {
    id: "fuer_x_sehe_ich_das_ein_sonst_eigentlich_nicht",
    produceContext: "Sie akzeptieren eine Regel für einen bestimmten Ausnahmefall, lehnen sie aber als generelle Regel ab.",
    produceHint: "Erst den akzeptierten Fall nennen, dann die allgemeine Ablehnung.",
    citation: "Für X sehe ich das ein — sonst eigentlich nicht.",
    gloss: "for X I can see that — otherwise not really",
    who: "Daniel_R",
    occurrence: "Für Notfälle sehe ich das ein — wenn jemand ständig privat telefoniert, während Patienten warten, ist das ein echtes Problem. Sonst eigentlich nicht.",
    capability: "concede",
    does: "Sie grenzen Ihre Zustimmung auf einen konkreten Fall ein und lehnen die allgemeine Regel gleichzeitig ab.",
    notThis: "Es ist keine vollständige Zustimmung zur Regel. Nur der genannte Fall wird akzeptiert.",
    pattern: /für\s+notfälle\s+sehe\s+ich\s+das\s+ein\b[\s\S]{0,120}?\bsonst\s+eigentlich\s+nicht\b/i,
    frame: /sehe\s+ich\s+das\s+ein\b[\s\S]{0,150}?\bsonst\b[^.!?]{0,40}/i,
    novelty: 3, minWords: 8,
    help: {
      absent: "Benutzen Sie „Für X sehe ich das ein — sonst eigentlich nicht.“",
      frame: "Beide Hälften müssen stehen: der akzeptierte Fall und die allgemeine Ablehnung.",
      good: "Genau: Sie akzeptieren einen engen Ausnahmefall, ohne die Regel insgesamt gutzuheißen.",
    },
  },

  {
    id: "mit_zweierlei_mass_gemessen_oder_sehe_ich_das_falsch",
    produceContext: "Sie bemerken, dass eine Regel für zwei Gruppen unterschiedlich angewendet wird. Weisen Sie darauf hin, ohne direkt anzugreifen.",
    produceHint: "Formulieren Sie es als Frage, nicht als Vorwurf.",
    citation: "Mit zweierlei Maß gemessen, oder sehe ich das falsch?",
    gloss: "measured with double standards, or am I wrong?",
    who: "Felix_B",
    occurrence: "Mit zweierlei Maß gemessen, oder sehe ich das falsch?",
    capability: "argue",
    does: "Sie benennen eine mögliche Ungleichbehandlung als Frage statt als Anschuldigung. Das lässt Raum für eine harmlose Erklärung, ohne den Punkt fallen zu lassen.",
    notThis: "Es ist keine sichere Anschuldigung. Die Frageform hält bewusst offen, dass es eine Erklärung geben könnte.",
    pattern: /mit\s+zweierlei\s+maß\s+gemessen\b[^.!?]{0,40}\bsehe\s+ich\s+das\s+falsch\b/i,
    frame: /mit\s+zweierlei\s+maß\s+gemessen\b\??[^.!?]{0,60}/i,
    novelty: 4, minWords: 6,
    help: {
      absent: "Benutzen Sie „Mit zweierlei Maß gemessen, oder sehe ich das falsch?“",
      frame: "Die Formel funktioniert nur als Frage — mit dem Zusatz „oder sehe ich das falsch?“",
      good: "Genau: Sie deuten die Ungleichbehandlung an, ohne direkt anzugreifen.",
    },
  },

  {
    id: "aufgefallen_unterstellen_will_ich_niemandem_etwas",
    produceContext: "Ihnen ist etwas aufgefallen, das nach Ungerechtigkeit aussieht. Sie wollen es ansprechen, ohne jemandem böse Absicht zu unterstellen.",
    produceHint: "Erst die Beobachtung als Beobachtung markieren, dann ausdrücklich keine Unterstellung machen.",
    citation: "Mir ist aufgefallen, dass X. Unterstellen will ich niemandem etwas.",
    gloss: "I noticed that X. I don't mean to accuse anyone of anything",
    who: "Felix_B",
    occurrence: "Mir ist noch etwas anderes aufgefallen: Führungskräfte haben ihr Handy weiterhin sichtbar auf dem Schreibtisch liegen, während wir es komplett wegpacken müssen. Mit zweierlei Maß gemessen, oder sehe ich das falsch? Unterstellen will ich niemandem etwas, es ist mir nur aufgefallen.",
    capability: "argue",
    does: "Sie markieren eine Beobachtung ausdrücklich als Beobachtung und trennen sie von jeder Unterstellung von Absicht.",
    notThis: "Es ist keine Rücknahme der Beobachtung selbst. Nur die Interpretation (böse Absicht) wird ausdrücklich ausgeschlossen.",
    pattern: /mir\s+ist\b[^.!?]{0,60}\baufgefallen\b[\s\S]{0,180}?\bunterstellen\s+will\s+ich\s+niemandem\s+etwas\b/i,
    frame: /aufgefallen\b[\s\S]{0,180}?\bunterstellen\s+will\s+ich\s+niemandem\s+etwas\b/i,
    novelty: 4, minWords: 10,
    help: {
      absent: "Benutzen Sie „Mir ist aufgefallen, dass … Unterstellen will ich niemandem etwas.“",
      frame: "Beide Teile müssen stehen: die Beobachtung UND der ausdrückliche Verzicht auf Unterstellung.",
      good: "Genau: Sie sprechen die Beobachtung an, ohne jemanden anzuklagen.",
    },
  },
];

const BY_ID = new Map(EXPRESSIONS.map(e => [e.id, e]));

module.exports = { EXPRESSIONS, BY_ID, SOURCE_ID: "src_handynutzung" };
