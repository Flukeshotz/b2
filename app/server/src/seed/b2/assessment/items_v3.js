/**
 * ASSESSMENT V3 — the third full bank.
 *
 * Same blueprint as V1 and V2, third distinct set of content. With three banks
 * a learner can be assessed, practise, be reassessed and be assessed a third
 * time without meeting the same item twice — which is the minimum needed before
 * "did you improve?" can mean anything.
 *
 * PROVENANCE: original, authored for Skillcase. No Goethe or telc material.
 * Listening audio is Azure TTS from the transcript below.
 *
 * REVIEW: `draft` throughout. No teacher or SME has read it.
 *
 * THEME: Konsum und Online-Bewertungen. Deliberately outside the workplace, so
 * that a learner strong on work vocabulary cannot carry V1's and V2's topic
 * familiarity into V3. That is a small, accepted departure from strict content
 * comparability, taken because topic REUSE across versions would be the worse
 * error — it is the thing that makes a retest a memory test.
 */

const grammar = {
  minutes: 2,
  instruction: "Welcher Satz passt besser?",
  note: "Es geht nicht um richtig und falsch, sondern darum, was ein Prüfer erwarten würde.",
  items: [
    { id: "v3_g1", slot: "G1", check_id: "connector_range", capability: "concede",
      context: "Sie widersprechen einer Kundin, ohne sie vor den Kopf zu stoßen.",
      options: ["Ihre Kritik ist berechtigt. Ich sehe das anders.",
                "Ihre Kritik ist berechtigt, dennoch sehe ich das anders."],
      answer: 1,
      why: "„dennoch“ zeigt, dass Sie den Einwand aufnehmen und trotzdem widersprechen." },

    { id: "v3_g2", slot: "G2", check_id: "konjunktiv2", capability: "speculate",
      context: "Sie bringen eine Idee in die Besprechung ein, ohne sie durchzusetzen.",
      options: ["Es wäre denkbar, die Schulung online anzubieten.",
                "Wir bieten die Schulung online an."],
      answer: 0,
      why: "„Es wäre denkbar“ öffnet eine Möglichkeit; der Indikativ verkündet eine Entscheidung." },

    { id: "v3_g3", slot: "G3", check_id: "genitiv_praep", capability: "adapt_register",
      context: "Sie schreiben einen kurzen Bericht für die Leitung.",
      options: ["Während der Umbauphase bleibt der Eingang gesperrt.",
                "Während dem Umbau bleibt der Eingang gesperrt."],
      answer: 0,
      why: "Gesprochen ist „während dem“ üblich. Geschrieben verlangt „während“ den Genitiv." },

    { id: "v3_g4", slot: "G4", check_id: "connector_range", capability: "justify",
      context: "Sie begründen in einer E-Mail, warum ein Bericht später kommt.",
      options: ["Der Bericht kommt später. Die Daten liegen erst am Freitag vor.",
                "Der Bericht kommt später, weil die Daten erst am Freitag vorliegen."],
      answer: 1,
      why: "Der Konnektor benennt den Grund. Zwei Aussagen nebeneinander sind noch keine Begründung." },

    { id: "v3_g5", slot: "G5", check_id: "register", capability: "adapt_register",
      context: "Eine E-Mail an eine Vorgesetzte, die Sie siezen.",
      options: ["Ich fänd's gut, wenn wir das nochmal angucken.",
                "Ich halte es für sinnvoll, das noch einmal zu prüfen."],
      answer: 1,
      why: "Verkürzte Formen und „angucken“ gehören in ein Gespräch, nicht in eine schriftliche Aufgabe." },

    { id: "v3_g6", slot: "G6", check_id: "sentence_complexity", capability: "argue",
      context: "Sie erklären, warum Sie eine Fortbildung trotz der Kosten empfehlen.",
      options: ["Der Kurs ist teuer. Er dauert lang. Er bringt viel.",
                "Obwohl der Kurs teuer ist und lange dauert, halte ich ihn für lohnend, weil er direkt in der Praxis hilft."],
      answer: 1,
      why: "Auf B2 werden Einwand und Bewertung in einem Satzgefüge verbunden, nicht aufgezählt." },

    { id: "v3_g7", slot: "G7", check_id: "connector_range", capability: "compare",
      context: "Sie stellen zwei Varianten gegenüber.",
      options: ["Die eine Lösung ist schneller, die andere ist günstiger.",
                "Die eine Lösung ist zwar schneller, die andere dafür deutlich günstiger."],
      answer: 1,
      why: "„zwar … dafür“ wägt ab; die reine Aufzählung überlässt die Gewichtung dem Leser." },

    { id: "v3_g8", slot: "G8", check_id: "konjunktiv2", capability: "speculate",
      context: "Sie bitten einen Kollegen um einen Gefallen.",
      options: ["Hätten Sie kurz Zeit, sich das anzusehen?",
                "Haben Sie kurz Zeit, sich das anzusehen?"],
      answer: 0,
      why: "Der Konjunktiv macht aus der Frage eine Bitte und lässt ein Nein zu." },
  ],
};

const vocabulary = {
  minutes: 1.5,
  instruction: "Welches Wort fehlt?",
  items: [
    { id: "v3_v1", slot: "V1", check_id: "nvv", capability: "argue",
      sentence: "Diese Entwicklung ___ uns vor ein echtes Problem.",
      options: ["stellt", "macht", "setzt"],
      answer: 0, why: "„jemanden vor ein Problem stellen“ — feste Verbindung." },

    { id: "v3_v2", slot: "V2", check_id: "nvv", capability: "argue",
      sentence: "Der Plan ___ bisher keine Rücksicht auf die Kosten.",
      options: ["nimmt", "macht", "hält"],
      answer: 0, why: "„Rücksicht nehmen“ — nie „Rücksicht machen“." },

    { id: "v3_v3", slot: "V3", check_id: "lexical_range", capability: "argue",
      sentence: "Die Untersuchung liefert dafür einen klaren ___.",
      options: ["Beleg", "Fall", "Punkt"],
      answer: 0, why: "Auf B2 wird ein präzises Nomen wie „Beleg“ erwartet." },

    { id: "v3_v4", slot: "V4", check_id: "lexical_range", capability: "argue",
      sentence: "Die ___ der neuen Software verlief ohne Probleme.",
      options: ["Einführigung", "Einführung", "Einführen"],
      answer: 1, why: "Nominalisierungen wie „Einführung“ gehören zum B2-Wortschatz. „Einführigung“ gibt es nicht." },

    { id: "v3_v5", slot: "V5", check_id: "connector_range", capability: "concede",
      sentence: "Die Umstellung war anstrengend. ___ würde ich sie wieder machen.",
      options: ["Trotz allem", "Deshalb", "Ebenso"],
      answer: 0, why: "Ein Einwand wird eingeräumt und dann überstimmt." },

    { id: "v3_v6", slot: "V6", check_id: "register", capability: "adapt_register",
      /* Again all three are grammatical in the frame; only the opener differs
         in register. */
      sentence: "___ teile ich Ihnen mit, dass der Termin verschoben wurde. (formelle E-Mail)",
      options: ["Hiermit", "Also", "Übrigens"],
      answer: 0, why: "„Hiermit“ gehört in die schriftliche Mitteilung. „Also“ und „Übrigens“ sind gesprochene Anschlüsse." },
  ],
};

/* Reading — 124 words. Same structure as V1 and V2: a position the author has
   revised, held together with a concession he does not resolve. */
const reading = {
  minutes: 2.5,
  instruction: "Lesen Sie den Forumsbeitrag und beantworten Sie drei Fragen.",
  title: "Forum: Wie viel sagen Online-Bewertungen?",
  text: `Ich habe jahrelang nichts bestellt, ohne vorher die Bewertungen zu lesen.
Fünf Sterne hieß für mich: passt schon.

Das sehe ich seit einer Weile anders, und zwar nicht, weil ich schlechte Erfahrungen
gemacht hätte. Es liegt eher daran, dass ich verstanden habe, wer überhaupt schreibt.
Zufriedene Kundinnen melden sich selten; wer sich ärgert, schreibt sofort. Was am Ende
dasteht, ist also nicht der Durchschnitt, sondern der Rand.

Nützlich finde ich die Texte trotzdem, allerdings anders als früher. Ich lese nicht
mehr die Note, sondern wonach sich die Leute richten. Wenn drei Personen dasselbe
Detail erwähnen, sagt mir das mehr als vierhundert Sterne.

Ganz ohne Bewertungen würde ich aber auch heute nichts bestellen.`,
  items: [
    { id: "v3_r1", slot: "R1", kind: "main_idea", check_id: null, capability: "structure",
      q: "Wie nutzt der Autor Bewertungen heute?",
      options: ["Er achtet auf wiederkehrende Details statt auf die Gesamtnote.",
                "Er vertraut Bewertungen grundsätzlich nicht mehr.",
                "Er liest inzwischen nur noch die negativen Bewertungen."],
      answer: 0,
      why: "„Ich lese nicht mehr die Note, sondern wonach sich die Leute richten.“" },

    { id: "v3_r2", slot: "R2", kind: "detail", check_id: null, capability: "structure",
      q: "Warum hält der Autor Bewertungen nicht für repräsentativ?",
      options: ["Weil viele Bewertungen gekauft sind.",
                "Weil überwiegend verärgerte Kunden schreiben.",
                "Weil die Portale schlechte Bewertungen löschen."],
      answer: 1,
      why: "„Zufriedene Kundinnen melden sich selten; wer sich ärgert, schreibt sofort.“" },

    { id: "v3_r3", slot: "R3", kind: "inference", check_id: null, capability: "structure",
      q: "Was sagt der letzte Satz über die Haltung des Autors?",
      options: ["Er hält seine eigene Kritik inzwischen für übertrieben.",
                "Seine Skepsis hat seine Gewohnheit nicht ersetzt.",
                "Er will künftig ganz auf Bewertungen verzichten."],
      answer: 1,
      why: "Er kritisiert die Bewertungen und bestellt trotzdem nicht ohne sie. Die Einschränkung hebt die Kritik nicht auf." },
  ],
};

/* Listening — authored dialogue, Azure TTS. Distinct from V1 (src_muede),
   from V2 (Dienstplan-App) and from every practice source. The decisive
   information is again a change of plan mid-conversation. */
const listening = {
  minutes: 2,
  instruction: "Hören Sie das Gespräch einmal und beantworten Sie zwei Fragen.",
  audioId: "asr_v3_kursplatz",
  plays: 1,
  situation: "Ein Anruf in der Verwaltung. Ein Mitarbeiter fragt nach einem Kursplatz.",
  turns: [
    { voice: "conrad", speaker: "Anrufer",
      text: "Guten Tag, ich wollte fragen, ob ich noch einen Platz im Hygienekurs bekomme. Für den im März." },
    { voice: "katja", speaker: "Verwaltung",
      text: "Im März … einen Moment. Der März ist voll, da steht schon eine Warteliste. Im April hätte ich noch etwas frei, und es ist derselbe Kurs." },
    { voice: "conrad", speaker: "Anrufer",
      text: "April wäre eigentlich auch in Ordnung. Muss ich mich dann neu anmelden?" },
    { voice: "katja", speaker: "Verwaltung",
      text: "Nein, ich setze Sie einfach um. Die Bestätigung kommt per E-Mail, nicht per Post — das machen wir seit dem Sommer nicht mehr." },
    { voice: "conrad", speaker: "Anrufer",
      text: "Gut. Und wenn im März doch noch jemand abspringt?" },
    { voice: "katja", speaker: "Verwaltung",
      text: "Dann melde ich mich natürlich. Ich würde ehrlich gesagt aber nicht darauf warten. Der April ist die sichere Variante." },
  ],
  items: [
    { id: "v3_l1", slot: "L1", kind: "detail", check_id: null, capability: "understand_speech",
      q: "Für welchen Kurs ist der Anrufer am Ende angemeldet?",
      options: ["Für den Kurs im März.",
                "Für den Kurs im April.",
                "Er steht auf der Warteliste für März."],
      answer: 1,
      why: "Der März ist voll; sie setzt ihn auf April um. Auf die Warteliste kommt er nicht." },

    { id: "v3_l2", slot: "L2", kind: "attitude", check_id: null, capability: "understand_speech",
      q: "Wie bewertet die Mitarbeiterin die Chance auf einen Platz im März?",
      options: ["Sie hält sie für gut.",
                "Sie schließt sie aus.",
                "Sie hält sie für möglich, rät aber davon ab, darauf zu warten."],
      answer: 2,
      why: "„Dann melde ich mich natürlich. Ich würde ehrlich gesagt aber nicht darauf warten.“" },
  ],
};

const writing = {
  minutes: 3.5,
  minWords: 60,
  slot: "W1",
  id: "v3_w1",
  prompt: "Viele Menschen lesen vor jedem Kauf Online-Bewertungen. Wie zuverlässig finden Sie solche Bewertungen?",
  guidance: ["Sagen Sie, was Sie denken.", "Begründen Sie es.", "Nennen Sie auch, was dagegen spricht."],
};

const speaking = {
  minutes: 2,
  slot: "S1",
  id: "v3_s1",
  minSeconds: 60,
  maxSeconds: 90,
  instruction: "Sprechen Sie etwa eine Minute. Sie hören sich danach selbst.",
  prompt: "In manchen Teams macht die Leitung den Dienstplan, in anderen tauschen die Kolleginnen untereinander. Was funktioniert Ihrer Meinung nach besser? Begründen Sie Ihre Meinung und gehen Sie kurz auf die Nachteile der anderen Möglichkeit ein.",
  elicits: ["argue", "justify", "concede"],
  expectedAnswer: "Eine klare Position, mindestens zwei Begründungen und ein eingeräumter Punkt der Gegenseite.",
  scoring: "transcript_only",
};

const V3 = {
  id: "screen_v3",
  version: "v3",
  totalMinutes: 13.5,
  theme: "Konsum und Online-Bewertungen",
  sections: [
    { key: "grammar", label: "Grammatik", ...grammar },
    { key: "vocabulary", label: "Wortschatz", ...vocabulary },
    { key: "reading", label: "Lesen", ...reading },
    { key: "listening", label: "Hören", ...listening },
    { key: "writing", label: "Schreiben", ...writing },
    { key: "speaking", label: "Sprechen", ...speaking },
  ],
};

module.exports = { V3 };
