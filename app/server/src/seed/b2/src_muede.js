/**
 * SOURCE 01 — „Warum sind wir immer müde?"
 *
 * A ten-minute radio discussion, because that is the length Goethe's Hören
 * Aufgabe 2 actually sets. Three voices, and a real disagreement: the sleep
 * researcher says behaviour, the nurse says the roster. Neither is wrong, which
 * is what makes it a B2 source rather than a lecture — the learner has to work
 * out where each of them concedes.
 *
 * DIFFICULTY, per the complexity rule: this is everyday-domain content
 * (Gesundheit, Arbeit), so it may carry delivery difficulty — authentic speed,
 * a speaker who interrupts herself. It is deliberately NOT declared
 * abstract_topic; telc specifies standard, clean delivery for abstract material
 * and our validator refuses the combination.
 *
 * NO SPECIALIST KNOWLEDGE. Goethe: "kein Fachwissen vorausgesetzt". The nurse
 * supplies the setting; every question is answerable from the German alone.
 * Nothing here requires knowing anything about nursing or sleep medicine.
 */

const DECLARATION = {
  primary_capability: "understand_speech",
  secondary_capabilities: ["concede", "argue", "justify"],
  theme: 7,                       // Gesundheit und Hygiene, crossing into 3
  cefr_tier: "developing",
  difficulty: {
    content: ["competing_viewpoints", "inference_required", "implicit_cohesion"],
    delivery: ["authentic_speed", "self_interruption"],
  },
  language_resources: [
    "concessive connectors in natural speech: zwar…aber, das stimmt schon, nur…",
    "academic nominalisation vs colloquial register, side by side",
    "das liegt vor allem daran, dass …",
    "sich auf Dauer rächen · etwas in Kauf nehmen · im Schnitt",
    "das lässt sich nicht pauschal sagen",
  ],
  checks: ["connector_range"],
  experience_types: ["listening", "vocabulary", "grammar", "writing"],
  exam: "Goethe Hören Aufgabe 2 — ca. 10 Minuten, zweimal gehört, abschnittweise",
};

/* Three voices from the existing TTS cast. Katja and Conrad are the plain
   high-quality pair; Mia carries speaking styles, which is what lets the nurse
   sound tired rather than merely say she is. */
const V = {
  mod:  { speaker: "Moderatorin",  voice: "katja",  style: null },
  doc:  { speaker: "Dr. Bergmann", voice: "conrad", style: null },
  nurse:{ speaker: "Yvonne Krause",voice: "mia",    style: "sad" }, // read as weary, not upset
};

/* Timestamps are COMPUTED from the script, not typed. Hand-written ms drift the
   moment a line is edited, and a marker pointing at the wrong second is worse
   than no marker. 135 wpm is the middle of the natural range for a German
   discussion; the pause is the beat between speakers. */
const WPM = 135, TURN_PAUSE_MS = 550;
const t = (turn) => turn;   // ms assigned below
function withTimings(turns) {
  let ms = 0;
  return turns.map((turn) => {
    const out = { ...turn, ms: Math.round(ms) };
    ms += (turn.de.split(/\s+/).length / WPM) * 60000 + TURN_PAUSE_MS;
    return out;
  });
}

const SCRIPT = withTimings([
  t({ ...V.mod, de: "Guten Abend und willkommen bei „Nachgefragt“. Wir schlafen im Schnitt etwa siebeneinhalb Stunden pro Nacht – ein bisschen mehr als noch vor zwanzig Jahren. Trotzdem sagt fast jeder Zweite in Deutschland, er sei ständig müde. Wie passt das zusammen? Darüber spreche ich heute mit Dr. Martin Bergmann, Schlafforscher an der Universität Freiburg, und mit Yvonne Krause, Krankenpflegerin auf einer Intensivstation in Kassel. Schönen guten Abend, Ihnen beiden." }),
  t({ ...V.doc,   de: "Guten Abend." }),
  t({ ...V.nurse, de: "Hallo." }),

  t({ ...V.mod, de: "Herr Dr. Bergmann, fangen wir bei Ihnen an. Wir schlafen länger, und wir sind trotzdem müder. Wie erklären Sie das?" }),
  t({ ...V.doc, de: "Das liegt vor allem daran, dass Schlafdauer und Schlafqualität zwei völlig verschiedene Dinge sind. Die reine Zeit im Bett sagt erstaunlich wenig aus. Entscheidend ist, ob der Schlaf zur richtigen Tageszeit stattfindet und ob er durchgängig ist. Und genau da beobachten wir seit etwa fünfzehn Jahren eine deutliche Verschlechterung." }),
  t({ ...V.mod, de: "Und woran liegt diese Verschlechterung?" }),
  t({ ...V.doc, de: "Zu einem großen Teil an unserem eigenen Verhalten. Wir gehen später ins Bett, wir schauen bis kurz vor dem Einschlafen auf helle Bildschirme, wir trinken abends Koffein. Das sind alles Faktoren, die sich gut messen lassen – und die sich auf Dauer rächen." }),

  t({ ...V.mod, de: "Frau Krause, Sie schauen skeptisch." }),
  t({ ...V.nurse, de: "Ja, entschuldigen Sie. Ich … also, ich möchte dem Herrn Doktor überhaupt nicht widersprechen, was die Forschung angeht. Das stimmt ja alles. Nur – bei uns auf Station ist das eben nicht das Problem." }),
  t({ ...V.mod, de: "Sondern?" }),
  t({ ...V.nurse, de: "Der Dienstplan. Ich arbeite im Dreischichtsystem. Diese Woche Spätdienst bis halb elf, nächste Woche Frühdienst, aufstehen um Viertel vor fünf. Da können Sie abends machen, was Sie wollen. Kein Bildschirm, kein Kaffee, Meditation, was auch immer – der Körper kommt da einfach nicht hinterher." }),

  t({ ...V.doc, de: "Da haben Sie völlig recht. Schichtarbeit ist natürlich ein Sonderfall …" }),
  t({ ...V.nurse, de: "Ein Sonderfall? Entschuldigung, aber in Deutschland arbeiten etwa sechs Millionen Menschen im Schichtdienst. Das ist kein Sonderfall. Das ist der Alltag von sehr vielen Leuten." }),
  t({ ...V.doc, de: "Das ist ein berechtigter Einwand. Ich formuliere es anders: Schichtarbeit ist der Fall, in dem individuelle Schlafhygiene an ihre Grenzen stößt. Da bin ich ganz bei Ihnen." }),
  t({ ...V.nurse, de: "Danke." }),

  t({ ...V.mod, de: "Aber, Frau Krause – wenn die ganzen Ratschläge nichts bringen, was hilft denn dann?" }),
  t({ ...V.nurse, de: "Doch, sie bringen schon etwas, das will ich gar nicht kleinreden. Ich schlafe tatsächlich besser, seit das Handy nicht mehr im Schlafzimmer liegt. Das merke ich. Aber es ändert eben nichts daran, dass ich um Viertel vor fünf aufstehe. Die eine Stunde, die ich dazugewinne, hilft mir zwar – aber sie ersetzt nicht die drei, die mir fehlen." }),

  t({ ...V.mod, de: "Herr Dr. Bergmann, was passiert denn im Körper, wenn der Schlaf dauerhaft zur falschen Zeit stattfindet?" }),
  t({ ...V.doc, de: "Der Körper folgt einer inneren Uhr, die sich am Tageslicht orientiert, und diese Uhr lässt sich nicht beliebig verschieben. Wenn ich nachts arbeite und tagsüber schlafe, schüttet mein Körper trotzdem zur gewohnten Zeit die Hormone aus, die mich wach machen. Die Folge ist ein Schlaf, der zwar stattfindet, aber deutlich flacher ist. Über viele Jahre erhöht das nachweislich das Risiko für Herz-Kreislauf-Erkrankungen." }),
  t({ ...V.mod, de: "Das klingt ernst." }),
  t({ ...V.doc, de: "Es ist ernst. Ich möchte es allerdings auch nicht dramatisieren. Das Risiko steigt – das heißt nicht, dass jeder Schichtarbeiter krank wird." }),

  t({ ...V.nurse, de: "Das hört man trotzdem nicht gern. Man nimmt das ja in Kauf, wenn man den Beruf wählt. Ich wusste ganz genau, worauf ich mich einlasse. Nur – mit Mitte zwanzig denkt man darüber anders als mit vierzig." }),
  t({ ...V.mod, de: "Können Sie das etwas genauer beschreiben?" }),
  t({ ...V.nurse, de: "Ja. Also, früher – ich habe mit dreiundzwanzig angefangen – da bin ich nach dem Nachtdienst nach Hause gefahren, habe vier Stunden geschlafen und bin abends noch weggegangen. Das ging einfach. Heute brauche ich nach einer Nachtschicht zwei Tage, bis ich wieder normal bin. Zwei Tage, in denen ich zu nichts zu gebrauchen bin. Und ich bin einundvierzig. Ich bin ja nun wirklich nicht alt." }),
  t({ ...V.doc, de: "Das deckt sich mit den Daten. Die Anpassungsfähigkeit an wechselnde Schichten nimmt ab etwa vierzig deutlich ab. Das ist einer der Gründe, warum viele Pflegekräfte den Beruf genau in diesem Alter verlassen." }),
  t({ ...V.nurse, de: "Bei uns sind in zwei Jahren vier Kolleginnen gegangen. Alle zwischen vierzig und fünfzig. Und keine einzige davon, weil ihr die Arbeit nicht gefallen hätte." }),

  t({ ...V.mod, de: "Das heißt, die Verantwortung liegt woanders?" }),
  t({ ...V.doc, de: "Sie liegt jedenfalls nicht nur beim Einzelnen. Wir haben sehr lange sehr stark auf das Individuum geschaut: Was macht der Einzelne falsch? Diese Perspektive greift zu kurz. Ob ein Betrieb seine Schichten vorwärts rotieren lässt – also Früh, Spät, Nacht – oder rückwärts, hat einen messbaren Effekt auf die Erholung der Beschäftigten. Und das ist eine betriebliche Entscheidung, keine private." }),
  t({ ...V.nurse, de: "Vorwärts rotieren. Ja. Das wäre bei uns … das wäre ein Traum. Das ist bei uns seit Jahren Thema, und es ändert sich nichts." }),
  t({ ...V.mod, de: "Warum ändert sich nichts?" }),
  t({ ...V.nurse, de: "Weil es Geld kostet. Und weil es kompliziert ist. Man müsste mehr Leute einstellen oder die Dienste anders verteilen, und dafür bräuchte man Personal, das wir gar nicht haben. Das ist so ein Kreis, aus dem keiner rauskommt." }),

  t({ ...V.mod, de: "Wir haben dazu eine Zuschrift bekommen, von einem Hörer aus Dortmund. Er fragt: Wäre es nicht am einfachsten, die Nachtschichten einfach kürzer zu machen?" }),
  t({ ...V.doc, de: "Das wird tatsächlich diskutiert. Es gibt Modelle mit sechs statt acht Stunden in der Nacht, und die Ergebnisse sind durchaus vielversprechend. Die Beschäftigten erholen sich schneller, und die Fehlerquote in den frühen Morgenstunden sinkt messbar." }),
  t({ ...V.nurse, de: "Und wer übernimmt die zwei Stunden?" }),
  t({ ...V.doc, de: "Das ist die entscheidende Frage, ja." }),
  t({ ...V.nurse, de: "Sehen Sie, genau da liegt bei uns das Problem. Kürzere Schichten heißt mehr Übergaben. Und jede Übergabe kostet Zeit, in der niemand am Bett steht. Wir haben das mal durchgerechnet, im Team. Bei drei statt zwei Schichten pro Tag verlieren wir am Ende ungefähr eine Stunde Pflege – pro Station, pro Tag." }),
  t({ ...V.doc, de: "Das ist ein Punkt, den ich in der Diskussion selten höre, und er ist berechtigt. In der Forschung schauen wir sehr stark auf die Erholung der Beschäftigten. Was so ein Modell im Betrieb tatsächlich auslöst, sehen wir oft erst hinterher." }),
  t({ ...V.nurse, de: "Ich will das ja auch nicht schlechtreden. Sechs Stunden wären für mich persönlich besser, das ist überhaupt keine Frage. Nur muss man eben dazusagen, was es an anderer Stelle kostet." }),
  t({ ...V.mod, de: "Also kein einfaches Rezept." }),
  t({ ...V.doc, de: "Nein. Es gibt bei diesem Thema kein einfaches Rezept." }),
  t({ ...V.mod, de: "Herr Bergmann, ist das lösbar?" }),
  t({ ...V.doc, de: "Lösbar schon. Es lässt sich allerdings nicht pauschal sagen, was der richtige Weg ist. Was in einem großen Klinikum funktioniert, funktioniert in einem kleinen Pflegeheim noch lange nicht. Man müsste sich im Grunde jeden Betrieb einzeln ansehen." }),
  t({ ...V.mod, de: "Und wer macht das?" }),
  t({ ...V.doc, de: "Das ist eine gute Frage. Zurzeit: kaum jemand." }),
  t({ ...V.nurse, de: "Sehen Sie." }),

  t({ ...V.mod, de: "Frau Krause, eine letzte Frage an Sie. Wenn Sie sich etwas wünschen dürften – was wäre das?" }),
  t({ ...V.nurse, de: "Ganz ehrlich? Keine Schlaf-App. Keinen Ratgeber. Ich würde mir wünschen, dass ich meinen Dienstplan vier Wochen im Voraus kenne und nicht erst am Freitag davor. Planbarkeit. Das klingt langweilig, ich weiß. Aber das würde mir mehr bringen als alles andere." }),
  t({ ...V.doc, de: "Da würde ich Ihnen sogar zustimmen. Vorhersehbarkeit ist einer der stärksten Faktoren, die wir kennen. Und sie kostet vergleichsweise wenig." }),
  t({ ...V.mod, de: "Ein seltener Moment der Einigkeit. Frau Krause, Herr Dr. Bergmann – vielen Dank, dass Sie hier waren." }),
  t({ ...V.doc, de: "Sehr gerne." }),
  t({ ...V.nurse, de: "Danke Ihnen." }),
]);

const DURATION_S = Math.ceil(
  SCRIPT.reduce((n, x) => n + x.de.split(/\s+/).length, 0) / WPM * 60 + SCRIPT.length * TURN_PAUSE_MS / 1000
);

/* Expression markers.
   `phrase` is the CITATION form the learner is taught. `match` is how it
   actually occurs in the script — inflected, embedded, sometimes split. The two
   are different often enough that conflating them silently misplaces a marker,
   so the lookup below requires `match` and throws if it is not found.
   second listen. Each is corpus-attested, and each is TAKEN FROM THE SCRIPT the
   learner has just heard. That is the taught-before-tested rule enforced by the
   shape of the content rather than by a gate. */
const MARKER_SPECS = [
  { phrase: "das liegt vor allem daran, dass …", match: "liegt vor allem daran", en: "that is mainly because …",
    why: "How a German speaker opens an explanation. Sets up a reason without saying „weil“ three times." },
  { phrase: "sich auf Dauer rächen", match: "auf Dauer rächen", en: "to catch up with you eventually",
    why: "Fixed pair. The verb is the part that is fixed — never „auf Dauer bestrafen“." },
  { phrase: "im Schnitt", match: "im Schnitt", en: "on average",
    why: "Shorter and far more common in speech than „durchschnittlich“." },
  { phrase: "etwas in Kauf nehmen", match: "in Kauf", en: "to accept something as a trade-off",
    why: "Exactly what you need for conceding a downside you chose knowingly." },
  { phrase: "das lässt sich nicht pauschal sagen", match: "pauschal sagen", en: "you cannot say that across the board",
    why: "The single most useful hedge at B2. It refuses a generalisation without refusing the question." },
  { phrase: "das will ich gar nicht kleinreden", match: "kleinreden", en: "I don't want to play that down",
    why: "A concession marker. She uses it to give ground before taking it back." },
];

/* A marker's ms comes from the turn it actually occurs in — looked up, never
   asserted, so it stays correct if the script is edited. */
const MARKERS = MARKER_SPECS.map((m) => {
  const turn = SCRIPT.find(x => x.de.toLowerCase().includes(m.match.toLowerCase()));
  if (!turn) throw new Error(`marker not found in script: "${m.phrase}"`);
  return { ...m, ms: turn.ms, speaker: turn.speaker };
});

const TRANSCRIPT = SCRIPT.map(s => `${s.speaker}: ${s.de}`).join("\n\n");


/* SECTIONS — the boundaries of the second listen.
   Goethe's Hören Aufgabe 2 plays the text whole, then again in sections with the
   items for each section read beforehand. So sections are not a technical
   convenience: they are the exam format, and each one is a coherent stretch of
   argument the learner can hold in their head.

   They are also how the audio is produced. A nine-minute single SSML request is
   near the service's ceiling; per-section files are safely inside it, resumable
   when one fails, and exactly what the player needs anyway. */
const SECTIONS = [
  { id: "s1", label: "Warum wir müde sind",        startsWith: "Guten Abend und willkommen" },
  { id: "s2", label: "Der Einwand",                 startsWith: "Ja, entschuldigen Sie" },
  { id: "s3", label: "Was im Körper passiert",      startsWith: "Herr Dr. Bergmann, was passiert" },
  { id: "s4", label: "Älter werden im Schichtdienst", startsWith: "Das hört man trotzdem nicht gern" },
  { id: "s5", label: "Wer ist verantwortlich?",     startsWith: "Das heißt, die Verantwortung" },
  { id: "s6", label: "Kürzere Schichten?",          startsWith: "Wir haben dazu eine Zuschrift" },
  { id: "s7", label: "Ein Wunsch",                  startsWith: "Frau Krause, eine letzte Frage" },
];

/* Resolve each section to a turn range, and fail loudly if an anchor no longer
   matches — a section silently starting in the wrong place would mis-cue every
   item attached to it. */
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

const TITLE = "Warum sind wir immer müde?";
const HOOK = "Wir schlafen mehr als früher. Warum fühlt es sich nicht so an?";

/* The expressions worth producing from this source. See chunks_muede.js for
   why only two of the six are here. */
const CHUNKS = require("./chunks_muede");

module.exports = {
  CHUNKS, TITLE, HOOK, DECLARATION, SECTIONS, sectionRanges, SCRIPT, MARKERS, TRANSCRIPT, DURATION_S, V };
