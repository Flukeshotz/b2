/**
 * Experiences derived from src_muede.
 *
 * Every one of them is DOWNSTREAM of the listening: no chunk is taught that was
 * not heard, no grammar item uses a sentence that did not occur, and the writing
 * prompt is the question the two speakers actually disagreed about. That is the
 * taught-before-tested rule enforced by the shape of the content.
 *
 * Item kinds follow the boards: Globalverstehen (main idea), Detailverstehen,
 * plus inference and attitude, which Goethe's Hören Aufgabe 2 explicitly tests
 * ("nicht nur den Informationsgehalt, sondern auch Standpunkte und Einstellungen").
 *
 * KEIN FACHWISSEN: every key is derivable from the German alone. Nothing here
 * needs any knowledge of nursing, shift systems or sleep medicine.
 */

const SOURCE_ID = "src_muede";

/* ── 1. LISTENING ─────────────────────────────────────────────────────────── */
const listening = {
  id: "exp_muede_listen",
  kind: "listening",
  ord: 0,
  title: "Warum sind wir immer müde?",
  minutes: 12,
  primary_capability: "understand_speech",
  secondary_capabilities: ["concede"],
  checks: [],
  teaches: [],
  steps: [
    { t: "story", lines: [
      "Ein Radiogespräch. Ein Schlafforscher und eine Pflegerin – und sie sind sich nicht einig.",
      "You will hear it twice: once whole, then in sections. Same as the real exam.",
    ] },
    // Goethe's Aufgabe 2 shape: heard whole first, then sectioned.
    { t: "listen_source", sourceId: SOURCE_ID, plays: 2, mode: "whole" },

    { t: "sourceq", kind: "main_idea", sourceId: SOURCE_ID,
      q: "Worüber sind sich Dr. Bergmann und Frau Krause am Ende einig?",
      options: [
        "Dass gute Schlafgewohnheiten wichtiger sind als der Dienstplan.",
        "Dass planbare Dienstpläne mehr bringen würden als Ratschläge.",
        "Dass kürzere Nachtschichten die beste Lösung sind.",
      ],
      answer: 1,
      explain: "Am Ende sagt Frau Krause, sie wünsche sich Planbarkeit – und Dr. Bergmann stimmt ihr ausdrücklich zu: „Vorhersehbarkeit ist einer der stärksten Faktoren, die wir kennen.“",
      ms: 406000 },

    { t: "sourceq", kind: "detail", sourceId: SOURCE_ID,
      q: "Was hat sich für Frau Krause mit dem Alter verändert?",
      options: [
        "Sie schläft insgesamt weniger als früher.",
        "Sie arbeitet inzwischen weniger Nachtschichten.",
        "Sie braucht nach einer Nachtschicht länger, bis sie sich erholt hat.",
      ],
      answer: 2,
      explain: "Mit dreiundzwanzig hat sie nach dem Nachtdienst vier Stunden geschlafen und ist abends weggegangen. Heute braucht sie zwei Tage.",
      ms: 246000 },

    { t: "sourceq", kind: "detail", sourceId: SOURCE_ID,
      q: "Warum sind kürzere Nachtschichten aus Sicht von Frau Krause ein Problem?",
      options: [
        "Weil mehr Übergaben Zeit kosten, in der niemand bei den Patienten ist.",
        "Weil die Beschäftigten sich dann schlechter erholen.",
        "Weil in den frühen Morgenstunden mehr Fehler passieren.",
      ],
      answer: 0,
      explain: "„Kürzere Schichten heißt mehr Übergaben. Und jede Übergabe kostet Zeit, in der niemand am Bett steht.“ Die beiden anderen Punkte kommen vor – aber als Argumente FÜR kürzere Schichten.",
      ms: 0 },

    // The inference item. Nothing in the audio states this; it has to be worked out.
    { t: "sourceq", kind: "inference", sourceId: SOURCE_ID,
      q: "Nachdem Dr. Bergmann sagt „Zurzeit: kaum jemand“, antwortet Frau Krause nur: „Sehen Sie.“ Was will sie damit sagen?",
      options: [
        "Dass sie seine Antwort nicht verstanden hat.",
        "Dass er ihr gerade selbst recht gegeben hat.",
        "Dass sie seinen Vorschlag gut findet.",
      ],
      answer: 1,
      explain: "Sie hat vorher gesagt, es ändere sich nichts. Er räumt ein, dass sich kaum jemand darum kümmert. „Sehen Sie“ heißt hier: genau das war mein Punkt.",
      ms: 391000 },

    { t: "sourceq", kind: "attitude", sourceId: SOURCE_ID,
      q: "Wie reagiert Dr. Bergmann auf ihren Einwand zu den Übergaben?",
      options: [
        "Er weist den Einwand zurück.",
        "Er wechselt das Thema.",
        "Er gibt ihr recht und räumt eine Lücke in der Forschung ein.",
      ],
      answer: 2,
      explain: "„Das ist ein Punkt, den ich in der Diskussion selten höre, und er ist berechtigt.“ Er widerspricht nicht – er räumt ein, dass die Forschung diesen Effekt oft erst hinterher sieht.",
      ms: 0 },
  ],
};

/* ── 2. VOCABULARY ────────────────────────────────────────────────────────── */
const vocabulary = {
  id: "exp_muede_chunks",
  kind: "vocabulary",
  ord: 1,
  title: "Six expressions from the discussion",
  minutes: 6,
  primary_capability: "argue",
  secondary_capabilities: ["concede", "justify"],
  checks: ["lexical_range"],
  // Phrases, not words. review_queue.de is TEXT, so these are legal keys.
  teaches: [
    ["das liegt vor allem daran, dass", "that is mainly because", "🔗"],
    ["sich auf Dauer rächen", "to catch up with you eventually", "🔗"],
    ["etwas in Kauf nehmen", "to accept something as a trade-off", "🔗"],
    ["das lässt sich nicht pauschal sagen", "you cannot say that across the board", "🔗"],
    ["das will ich nicht kleinreden", "I don't want to play that down", "🔗"],
    ["im Schnitt", "on average", "🔗"],
  ],
  steps: [
    { t: "story", lines: ["Sechs Ausdrücke aus dem Gespräch. Sie haben sie alle schon gehört."] },
    { t: "chunk", w: 0, quote: "Das liegt vor allem daran, dass Schlafdauer und Schlafqualität zwei völlig verschiedene Dinge sind.", who: "Dr. Bergmann" },
    { t: "chunk", w: 1, quote: "Das sind alles Faktoren, die sich gut messen lassen – und die sich auf Dauer rächen.", who: "Dr. Bergmann" },
    { t: "chunk", w: 2, quote: "Man nimmt das ja in Kauf, wenn man den Beruf wählt.", who: "Yvonne Krause" },
    /* Was a `pick` — "which expression fits the gap". A gap can be filled by
       elimination; a situation cannot. */
    { t: "chunk_choose",
      situation: "Sie haben den Beruf mit offenen Augen gewählt. Die Schichten waren Ihnen vorher klar, und Sie beschweren sich nicht darüber — aber jemand tut gerade so, als hätten Sie sich das nicht überlegt.",
      q: "Was sagen Sie?",
      options: [
        "Das nimmt man in Kauf, wenn man sich für den Beruf entscheidet.",
        "Das liegt vor allem daran, dass die Schichten wechseln.",
        "Das lässt sich nicht pauschal sagen.",
      ],
      answer: 0,
      exercises: ["in_kauf_nehmen"],
      explain: "A sagt beides auf einmal: der Nachteil ist echt, und Sie haben sich trotzdem dafür entschieden. B erklärt eine Ursache, die hier niemand bestritten hat. C weist eine Verallgemeinerung zurück — nur hat Ihr Gegenüber gar nicht verallgemeinert." },
    { t: "chunk", w: 3, quote: "Es lässt sich allerdings nicht pauschal sagen, was der richtige Weg ist.", who: "Dr. Bergmann" },
    { t: "chunk", w: 4, quote: "Doch, sie bringen schon etwas, das will ich gar nicht kleinreden.", who: "Yvonne Krause" },
    { t: "chunk_choose",
      situation: "Eine Kollegin hat sich viel Mühe mit einem neuen Übergabezettel gegeben. Er hilft — aber er löst das eigentliche Problem nicht, und das wollen Sie sagen, ohne ihre Arbeit abzuwerten.",
      q: "Womit fangen Sie an?",
      options: [
        "Der Zettel bringt schon etwas, das will ich gar nicht kleinreden.",
        "Das lässt sich nicht pauschal sagen.",
        "Das rächt sich auf Dauer.",
      ],
      answer: 0,
      /* No `exercises`: "das will ich gar nicht kleinreden" is taught here but
         is not one of the two expressions with a production record, so there is
         nothing for this item to move up the ladder. Tagging it with a
         different expression's id would file the evidence under the wrong
         German — the gate now refuses that. */
      explain: "A erkennt ihre Arbeit ausdrücklich an und macht damit Platz für den Einwand, der gleich kommt. B weist eine Verallgemeinerung zurück — nur hat hier niemand verallgemeinert. C ist eine Warnung, kein Zugeständnis, und würde ihre Mühe erst recht abwerten." },
    /* Was a `translate` — assemble the English from tiles. That tests whether
       the learner can reconstruct a translation, which is not why anybody
       learns this phrase. */
    { t: "chunk_choose",
      situation: "In einer Fortbildung fragt jemand, ob Nachtdienste jungen Pflegekräften generell schaden. Sie wissen aus Erfahrung: bei manchen ja, bei manchen kaum — es hängt an den Ruhezeiten.",
      q: "Wie antworten Sie, ohne die Frage abzuwürgen?",
      options: [
        "Das lässt sich nicht pauschal sagen — es kommt sehr auf die Ruhezeiten an.",
        "Das liegt vor allem daran, dass die Ruhezeiten zu kurz sind.",
        "Das will ich gar nicht kleinreden.",
      ],
      answer: 0,
      exercises: ["laesst_sich_nicht_pauschal_sagen"],
      explain: "A weist die Verallgemeinerung zurück und sagt im selben Atemzug, wovon es abhängt — die Frage bleibt offen, statt beantwortet zu werden. B behauptet genau die Verallgemeinerung, die Sie vermeiden wollten. C räumt etwas ein, aber hier hat niemand etwas kleingeredet." },

    /* PRODUCTION. This experience ended at recognition until the gate refused
       it, and the gate was right: recognising an expression is not being able
       to use one. Two of the six get a production step — the two that are
       actual moves. Drilling somebody on writing "im Schnitt" would be the
       padding this product exists to avoid. */
    { t: "notice", ex: "laesst_sich_nicht_pauschal_sagen", sourceId: SOURCE_ID, w: 3 },
    { t: "chunk_produce", ex: "laesst_sich_nicht_pauschal_sagen", sourceId: SOURCE_ID,
      context: "Jemand fragt Sie, ob Schichtarbeit auf Dauer krank macht. Sie halten die Frage für zu grob gestellt — es kommt darauf an. Sagen Sie das.",
      hint: "Erst die Verallgemeinerung zurückweisen, dann sagen, wovon es abhängt." },

    { t: "notice", ex: "in_kauf_nehmen", sourceId: SOURCE_ID, w: 2 },
    { t: "chunk_produce", ex: "in_kauf_nehmen", sourceId: SOURCE_ID,
      context: "Etwas an Ihrer Arbeit oder Ihrem Alltag ist eindeutig ein Nachteil — und Sie haben sich trotzdem dafür entschieden. Erklären Sie, warum.",
      hint: "Nennen Sie den Nachteil und das, wofür Sie ihn hinnehmen." },
  ],
};

/* ── 3. GRAMMAR — the CONCEDE move, as it occurred ─────────────────────────
   REBUILT. The first version taught this with `spotmistake` and `build` — find
   the wrong token, drag the tiles into order. Both can be completed without
   understanding what the sentence is FOR, which is why the grammar gate now
   refuses them in a B2 experience, and the gate was right: the content moved
   rather than the rule.

   Same shape as the Homeoffice grammar experience, because the shape is the
   pedagogy: NOTICE → CONTRAST → UNDERSTAND → USE. Meaning first, terminology
   last, and the learner writes their own by the end. */
const grammar = {
  id: "exp_muede_grammar",
  kind: "grammar",
  ord: 2,
  title: "Erst zugeben, dann widersprechen",
  minutes: 10,
  primary_capability: "concede",
  secondary_capabilities: ["argue"],
  checks: ["connector_range"],
  teaches: [],
  function_de: "Widersprechen, ohne dass Ihr Gegenüber dichtmacht: erst etwas gelten lassen, dann sagen, was trotzdem nicht stimmt.",
  steps: [
    { t: "story", lines: [
      "Frau Krause widerspricht dem Schlafforscher dreimal — und jedes Mal gibt sie zuerst etwas zu.",
      "Zuerst schauen wir, warum das wirkt. Die Form kommt danach.",
    ] },

    /* ── NOTICE ── three questions about meaning. No terminology anywhere. */
    { t: "readq", mode: "meaning", sourceId: SOURCE_ID, capability: "concede",
      quote: "Das stimmt ja alles. Nur – bei uns auf Station ist das eben nicht das Problem.",
      q: "Was hält Frau Krause von dem, was der Schlafforscher gesagt hat?",
      options: [
        "Sie hält es für falsch.",
        "Sie hält es für richtig — nur nicht für ihr Problem.",
        "Sie hat es nicht verstanden.",
      ],
      answer: 1,
      explain: "„Das stimmt ja alles.“ Sie bestreitet nichts. Ihr Einwand ist ein anderer: Für ihre Station beschreibt seine Erklärung nicht das, woran es liegt." },

    { t: "readq", mode: "meaning", sourceId: SOURCE_ID, capability: "concede",
      quote: "Doch, sie bringen schon etwas, das will ich gar nicht kleinreden.",
      q: "Warum sagt sie das, bevor sie ihren Einwand bringt?",
      options: [
        "Damit ihr Einwand nicht wie Widerspruch um jeden Preis klingt.",
        "Weil sie ihre Meinung geändert hat.",
        "Weil sie höflich sein muss, ohne es zu meinen.",
      ],
      answer: 0,
      explain: "Wer sofort widerspricht, wird als Gegner gehört und nicht als Argument. Indem sie zuerst etwas gelten lässt, nimmt sie der Gegenseite die einfachste Antwort — „Sie sind ja grundsätzlich dagegen“ — und ihr Einwand muss beantwortet werden." },

    /* ── CONTRAST ── both pairs are about what the sentence DOES. */
    { t: "gcontrast", sourceId: SOURCE_ID,
      lead: "Derselbe Einwand, zweimal.",
      variants: [
        { label: "A", de: "Bei uns auf Station ist das nicht das Problem." },
        { label: "B", de: "Das stimmt ja alles. Nur – bei uns auf Station ist das nicht das Problem." },
      ],
      q: "Nach welchem Satz ist es schwerer, einfach dagegenzuhalten?",
      options: ["A", "B", "Kein Unterschied"],
      answer: 1,
      explain: "A lässt sich mit „doch, ist es“ beantworten — es steht Behauptung gegen Behauptung. Bei B hat sie die Forschung schon anerkannt; wer jetzt antwortet, muss auf ihre Station eingehen. Das Zugeständnis kostet sie nichts und verengt die Antwort des anderen." },

    { t: "gcontrast", sourceId: SOURCE_ID,
      lead: "Und noch einmal, mit einer Maßnahme, die tatsächlich etwas bringt.",
      variants: [
        { label: "C", de: "Die eine Stunde hilft mir nicht." },
        { label: "D", de: "Die eine Stunde, die ich dazugewinne, hilft mir zwar – aber sie ersetzt nicht die drei, die mir fehlen." },
      ],
      q: "Welcher Satz ist schwerer zu widerlegen?",
      options: ["C", "D", "Beide gleich"],
      answer: 1,
      explain: "C ist angreifbar, weil es nicht stimmt: die Stunde hilft ja. D gibt genau das zu und verschiebt den Streit auf die Menge — und dort hat sie recht. Ein Zugeständnis, das der Wahrheit entspricht, macht das eigene Argument härter, nicht weicher." },

    /* ── UNDERSTAND ── the form, once the learner knows what it is for. */
    { t: "gform",
      label: "zwar … aber",
      lead: "Die Form ist eine Klammer aus zwei Teilen.",
      parts: [
        { role: "Zugeständnis", de: "Die Stunde hilft mir zwar –", note: "was Sie gelten lassen" },
        { role: "Einwand",      de: "aber sie ersetzt die drei nicht.", note: "und was trotzdem gilt" },
      ],
      rule: "Wer mit <b>zwar</b> anfängt, muss <b>aber</b> nachliefern. Ohne den zweiten Teil bleibt nur die Zustimmung stehen.",
      extras: [
        "Ohne „zwar“ geht es genauso: <b>Das stimmt.</b> <b>Nur</b> – bei uns ist das anders.",
        "Statt „aber“ auch: <b>nur</b>, <b>allerdings</b>, <b>trotzdem</b>.",
      ] },

    /* ── USE ── the learner's own concession, twice. */
    { t: "guse", check: "concede_first", sourceId: SOURCE_ID,
      quote: "Das stimmt ja alles. Nur – bei uns auf Station ist das eben nicht das Problem.",
      context: "Jemand erklärt Ihnen etwas über Ihre Arbeit, das im Grundsatz stimmt — aber an Ihrer Situation vorbeigeht. Antworten Sie so, dass die Person Ihnen zuhört.",
      hint: "Erst das, was Sie gelten lassen. Dann das, was trotzdem nicht passt." },

    { t: "guse", check: "concede_first", sourceId: SOURCE_ID,
      quote: "Doch, sie bringen schon etwas, das will ich gar nicht kleinreden.",
      context: "Bei Ihnen wurde eine Maßnahme eingeführt, die tatsächlich etwas gebracht hat — nur längst nicht genug. Sagen Sie das, ohne die Maßnahme schlechtzureden.",
      hint: "Geben Sie zu, was sie bringt. Und sagen Sie dann, was sie nicht ersetzt." },
  ],
};

/* ── 4. PRODUCTION — the step that makes this a product ───────────────────── */
const produce = {
  id: "exp_muede_produce",
  kind: "writing",
  ord: 3,
  title: "Whose side are you on?",
  minutes: 12,
  primary_capability: "argue",
  secondary_capabilities: ["concede", "justify", "exemplify"],
  // The full deterministic pass runs on this. It is our strongest evidence.
  checks: ["connector_range", "konjunktiv2", "genitiv_praep", "register",
           "sentence_complexity", "lexical_range", "repetition"],
  teaches: [],
  steps: [
    { t: "story", lines: [
      "Jetzt Sie. Kurz – etwa 80 Wörter reichen.",
      "Sie haben beide Seiten gehört. Für welche entscheiden Sie sich?",
    ] },
    { t: "produce", mode: "write", minWords: 70,
      /* Explicit, not accidental. Before task-awareness had a visible fallback
         state, this step's assessment landed on `free_response` only because
         nothing was declared — the right check set for this content, but by
         luck, not by design. The content gate now refuses to publish a
         `produce` step without this line. */
      taskType: "free_response",
      prompt: "Dr. Bergmann sagt, wir seien müde, weil wir uns falsch verhalten. Frau Krause sagt, es liege am Dienstplan. Wem stimmen Sie eher zu – und warum?",
      guidance: [
        "Geben Sie der Gegenseite zuerst etwas zu.",
        "Begründen Sie Ihre Meinung.",
        "Ein Beispiel aus Ihrem eigenen Alltag hilft.",
      ],
      // Shown only AFTER she has written, never before — otherwise it is a
      // gap-fill with extra steps rather than production.
      afterHints: ["zwar … aber", "das liegt vor allem daran, dass", "das lässt sich nicht pauschal sagen"],
      capabilities: ["argue", "concede", "justify"],
    },
  ],
};

module.exports = { SOURCE_ID, EXPERIENCES: [listening, vocabulary, grammar, produce] };
