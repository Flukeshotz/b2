/**
 * SOURCE 19 — „Boreout: Wenn Unterforderung krank macht"
 *
 * ORIGINAL SKILLCASE CONTENT. Goethe Lesen Teil 4's shape: one longer
 * argumentative text, single authorial voice (not a forum thread), building
 * a case across several paragraphs. Different again from Teil 1 (letter),
 * Teil 2 (thread), and Teil 3 (short ads) — this is sustained single-author
 * argument, which needs its own comprehension questions: not "who said
 * this" (there's only one voice) but "what does the argument actually
 * claim, and where does it hedge or qualify itself."
 */

const KIND = "text";

const DECLARATION = {
  primary_capability: "structure",
  secondary_capabilities: ["argue"],
  theme: 7,
  cefr_tier: "developing",
  difficulty: {
    content: ["implicit_cohesion", "inference_required"],
    delivery: [],
  },
  language_resources: [
    "eine These vorsichtig einführen: Es spricht einiges dafür, dass …",
    "eine Gegenposition vorwegnehmen, um sie zu entkräften: Man könnte einwenden, dass … Das greift jedoch zu kurz",
    "eine Einschränkung markieren: Das gilt allerdings nur, wenn …",
    "einen Schluss vorsichtig ziehen: All das legt nahe, dass …, auch wenn sich das nicht abschließend beweisen lässt",
  ],
  checks: [],
  experience_types: ["reading"],
  exam: "Goethe Lesen Teil 4 — längerer Sachtext, Detailfragen",
  recognition_only: true,
};

const TITLE = "Boreout: Wenn Unterforderung krank macht";
const HOOK = "Über Stress am Arbeitsplatz wird viel geschrieben. Über sein Gegenteil kaum — dabei kann es genauso krank machen.";

const SCRIPT = [
  { handle: "artikel", speaker: "Artikel", when: "", de:
    "Über Überlastung am Arbeitsplatz gibt es unzählige Studien, Ratgeber und Präventionsprogramme. Sein Gegenteil dagegen fristet ein Schattendasein in der öffentlichen Diskussion, obwohl es Betroffene ähnlich stark belasten kann: das Boreout, die chronische Unterforderung im Beruf.\n\nEs spricht einiges dafür, dass Boreout länger unerkannt bleibt als sein bekannterer Gegenpart. Wer über zu viel Arbeit klagt, wird ernst genommen. Wer zugibt, dass ihm bei der Arbeit langweilig ist, riskiert dagegen schnell den Vorwurf der Undankbarkeit — schließlich hat man doch einen sicheren Job, wofür also beschweren? Diese soziale Erwartung führt häufig dazu, dass Betroffene ihre Situation aktiv verbergen: durch demonstrative Betriebsamkeit, durch das gezielte Strecken einfacher Aufgaben, durch das Vortäuschen von Beschäftigung, die niemand einfordert.\n\nMan könnte einwenden, dass Unterforderung doch eigentlich ein angenehmer Zustand sein müsste — weniger Druck, weniger Stress, mehr freie Zeit während der Arbeit. Das greift jedoch zu kurz. Arbeitspsychologische Untersuchungen zeigen, dass ein gewisses Maß an Herausforderung für das Wohlbefinden notwendig ist. Fehlt dieses Element dauerhaft, stellen sich häufig dieselben Symptome ein wie bei klassischer Überlastung: Erschöpfung, Schlafstörungen, ein Gefühl der Sinnlosigkeit. Der Unterschied liegt vor allem darin, wie schwer sich Betroffene selbst und ihrem Umfeld gegenüber rechtfertigen können.\n\nDas gilt allerdings nur, wenn die Unterforderung dauerhaft und unfreiwillig ist. Eine bewusst gewählte, vorübergehende ruhigere Phase im Berufsleben — etwa nach einer anstrengenden Projektphase — fällt ausdrücklich nicht unter diese Beschreibung. Entscheidend ist die fehlende Kontrolle über die eigene Situation: wer weiß, dass eine Verbesserung in Sicht ist, erlebt Unterforderung anders als jemand, der keinen Ausweg sieht.\n\nWas also hilft? Arbeitspsychologen empfehlen selten den naheliegenden Rat, sich einfach eine neue Stelle zu suchen — das greift oft ebenfalls zu kurz, insbesondere wenn äußere Umstände wie Familie oder Region den Wechsel erschweren. Stattdessen wird häufig empfohlen, das offene Gespräch mit Vorgesetzten zu suchen und konkret nach anspruchsvolleren Aufgaben zu fragen — ein Schritt, der vielen Betroffenen gerade wegen der beschriebenen sozialen Erwartung besonders schwerfällt.\n\nAll das legt nahe, dass Boreout kein Randphänomen einzelner Unzufriedener ist, sondern eine strukturelle Frage der Arbeitsgestaltung, auch wenn sich das Ausmaß des Problems mangels verlässlicher Zahlen nicht abschließend beweisen lässt. Solange Unterforderung als Luxusproblem gilt, werden die Betroffenen jedoch weiterhin vor allem eines tun: schweigen." },
];

const VOICES = [{ handle: "artikel", speaker: "Artikel" }];
const TRANSCRIPT = SCRIPT[0].de;
const WORDS = TRANSCRIPT.split(/\s+/).length;

const CHUNKS = require("./chunks_artikel_boreout");

module.exports = { KIND, DECLARATION, CHUNKS, TITLE, HOOK, SCRIPT, VOICES, TRANSCRIPT, WORDS, MARKERS: [] };
