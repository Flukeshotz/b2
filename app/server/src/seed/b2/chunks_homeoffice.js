/**
 * FIVE MOVES FROM THE HOMEOFFICE THREAD.
 *
 * Every one of them is an argumentative MOVE, not a hard word. The test each
 * had to pass to get in: would a B2 learner want to steal this and use it
 * tomorrow, about something completely different? Words that merely happen to
 * be difficult — „Anwesenheitspflicht", „naturgemäß", „zustande kommen" —
 * were rejected on that test, however B2 they look on a list.
 *
 * They cover four moves that the capability map says B2 turns on, and they were
 * chosen so that a learner who has all five can hold a disagreement:
 *
 *   report a justification without adopting it       → structure
 *   concede before you object                        → concede
 *   grant the premise and deny the conclusion        → argue
 *   redirect the objection to what actually bothers  → justify
 *   admit the limits of your own case                → concede
 *
 * `occurrence` is the exact substring in the source; `citation` is the
 * teachable form, which is usually not the same thing — real sentences push
 * „ehrlich gesagt" into the middle of an expression. The gate checks the
 * occurrence verbatim and checks that the citation's own content words survive
 * in it, so an expression can never drift away from the German it came from.
 *
 * `pattern` is how it looks once it has been fitted into somebody else's
 * sentence. `frame` is the structural promise it makes — the thing that is
 * missing when a learner pastes the expression in front of a sentence instead
 * of building one with it.
 */

const EXPRESSIONS = [
  {
    id: "begruendet_wird_das_mit",
    /* Every expression carries its own production context, so the ladder can
       promote it. Without one, an expression the learner has only CHOSEN has
       nowhere to climb and comes back forever as recognition. */
    produceContext: "Bei Ihnen wurde etwas entschieden, und es gab eine offizielle Begründung dafür. Geben Sie diese Begründung wieder — und lassen Sie offen, ob Sie sie überzeugend finden.",
    produceHint: "Erst die Begründung wiedergeben, dann Ihren eigenen Zweifel andeuten.",
    citation: "Begründet wird das mit …",
    gloss: "the reason they give for it is …",
    who: "Kerstin_M",
    occurrence: "Begründet wird das mit dem Zusammenhalt im Team.",
    capability: "structure",
    /* Function, not translation. The learner can look up "begründen"; what they
       cannot look up is that this word order puts the justification at arm's
       length. */
    does: "Sie geben die offizielle Begründung wieder, ohne sie selbst zu übernehmen. Das Passiv am Satzanfang lässt offen, ob Sie sie für richtig halten.",
    notThis: "Es heißt nicht „ich begründe das mit …“. Wer das sagt, macht die Begründung zu seiner eigenen — genau das vermeidet Kerstin_M hier.",
    /* Any subject, not just „das“: „Begründet wird die Regelung mit …“ is the
       same move and better writing. */
    pattern: /begründet\s+(wird|wurde|werden|wurden)\b/i,
    /* The justification itself has to arrive. "Begründet wird das." is not a
       sentence anybody would write. */
    frame: /begründet\s+(wird|wurde|werden|wurden)\b[^.!?]{0,60}?\bmit\s+\S+/i,
    novelty: 3, minWords: 8,
    help: {
      absent: "Fangen Sie mit „Begründet wird das mit …“ an — das Passiv ist hier der ganze Trick.",
      frame: "Sagen Sie auch, womit. „Begründet wird das mit …“ braucht immer ein „mit“ und das, was danach kommt.",
      good: "Genau: Sie geben die Begründung wieder und lassen offen, was Sie davon halten.",
    },
  },

  {
    id: "nicht_rundweg_ablehnen",
    /* Every expression carries its own production context, so the ladder can
       promote it. Without one, an expression the learner has only CHOSEN has
       nowhere to climb and comes back forever as recognition. */
    produceContext: "Jemand schlägt in Ihrem Team etwas vor, das Sie nicht grundsätzlich falsch finden — aber so nicht mittragen wollen. Antworten Sie.",
    produceHint: "Erst einräumen, dann der Einwand. Ohne den zweiten Teil ist es keine Antwort.",
    citation: "Ich will das gar nicht rundweg ablehnen",
    gloss: "I don't want to reject that out of hand",
    who: "Kerstin_M",
    /* The occurrence carries the follow-up as well, because the move is not the
       clause on its own — a concession that stops is not a concession. The gate
       checks each frame against its own occurrence, so an expression whose
       source line does not demonstrate the frame cannot ship. */
    occurrence: "Ich will das gar nicht rundweg ablehnen — ich habe selbst gemerkt, dass man sich im Homeoffice leichter aus dem Weg geht.",
    capability: "concede",
    does: "Sie räumen ein, bevor Sie widersprechen. Der Satz kauft Ihnen das Recht, gleich danach ein „nur …“ oder „aber …“ zu setzen, ohne dass es nach Blockade klingt.",
    notThis: "Es heißt nicht, dass Sie zustimmen. „Rundweg“ verneint nur die pauschale Ablehnung — der Einwand kommt gleich danach.",
    /* Two shapes: the modal + infinitive („will ich nicht rundweg ablehnen“)
       and the separable finite verb („lehne ich nicht rundweg ab“). Both are
       the move; only one is the citation form. */
    pattern: /nicht\s+rundweg\s+ablehnen\b|\brundweg\s+ab(lehnen|zulehnen)?\b|\blehne?\b[^.!?]{0,40}\brundweg\b[^.!?]{0,20}\bab\b/i,
    /* A concession that concedes and stops is not the move. Something has to
       follow it — that is what the concession was for. */
    frame: /rundweg\s+ablehnen[^.!?]*[,.;—-]\s*\S+|(\bnur\b|\baber\b|\ballerdings\b|\bnur\s+frage\b)/i,
    novelty: 3, minWords: 10,
    help: {
      absent: "Benutzen Sie „Ich will das gar nicht rundweg ablehnen“ — wörtlich, das ist die Formel.",
      frame: "Ein Zugeständnis allein ist kein Beitrag. Sagen Sie danach, was Sie trotzdem stört: „…, nur …“",
      good: "Gut — erst einräumen, dann widersprechen. So hört Ihnen jemand überhaupt zu.",
    },
  },

  {
    id: "nur_folgt_daraus_nicht",
    /* Every expression carries its own production context, so the ladder can
       promote it. Without one, an expression the learner has only CHOSEN has
       nowhere to climb and comes back forever as recognition. */
    produceContext: "Jemand sagt Ihnen: „Die Krankenstände sind seit dem Frühjahr gestiegen.“ Nehmen Sie an, das stimmt. Widersprechen Sie trotzdem dem Schluss, den die Person daraus zieht.",
    produceHint: "Erst zugeben, dann den Schluss angreifen.",
    citation: "Nur folgt daraus doch nicht …",
    gloss: "but that doesn't mean …",
    who: "Nadja W.",
    occurrence: "Nur folgt daraus doch nicht die Pflicht für alle.",
    capability: "argue",
    /* The best move in the thread, and the one with the widest reach: it lets
       you agree with somebody completely and still refuse what they want. */
    does: "Sie lassen die Behauptung des anderen stehen und greifen nur den Schluss an. Das ist der stärkste Widerspruch, den es gibt — Ihr Gegenüber kann nichts verteidigen, weil Sie ihm nichts weggenommen haben.",
    notThis: "Es ist kein Widerspruch gegen die Aussage selbst. Nadja W. sagt ausdrücklich, das Argument stimme vermutlich. Bestritten wird nur, was daraus folgen soll.",
    /* „Nur folgt daraus doch nicht …“ and „Daraus folgt aber nicht, dass …“
       are the same move with the adverb fronted. */
    pattern: /folgt\s+daraus\s+(doch\s+|aber\s+|noch\s+)*nicht|daraus\s+folgt\s+(doch\s+|aber\s+|noch\s+)*nicht/i,
    /* What does not follow has to be named. "Daraus folgt nicht." is a shrug. */
    frame: /(folgt\s+daraus|daraus\s+folgt)\s+(doch\s+|aber\s+|noch\s+)*nicht[,]?\s+\S+/i,
    novelty: 4, minWords: 12,
    help: {
      absent: "Sie brauchen die Formel selbst: „Nur folgt daraus doch nicht …“",
      frame: "Sagen Sie, WAS nicht folgt. „Nur folgt daraus doch nicht …“ braucht danach genau das, was Sie ablehnen.",
      good: "Stark. Sie haben die Behauptung stehen lassen und trotzdem widersprochen — das ist B2.",
    },
  },

  {
    id: "stoert_weniger_als",
    /* Every expression carries its own production context, so the ladder can
       promote it. Without one, an expression the learner has only CHOSEN has
       nowhere to climb and comes back forever as recognition. */
    produceContext: "Etwas an Ihrer Arbeit oder Ihrem Alltag stört Sie — aber nicht das, was alle vermuten. Stellen Sie das richtig.",
    produceHint: "Beide Hälften: was Sie weniger stört, und was stattdessen.",
    citation: "Mich stört weniger X als Y",
    gloss: "what bothers me is less X than Y",
    who: "Kerstin_M",
    occurrence: "Mich stört ehrlich gesagt weniger der Bürotag als die Art",
    capability: "justify",
    does: "Sie lenken den Einwand auf das, worum es Ihnen wirklich geht. Man hält Sie für eine Gegnerin der Sache — und Sie stellen richtig, dass Sie etwas anderes meinen.",
    notThis: "Es heißt nicht, dass X Sie gar nicht stört. Es ordnet zwei Dinge — und macht klar, welches davon die Diskussion wert ist.",
    pattern: /(stört|stören|ärgert|interessiert)\s+(mich|uns|ihn|sie)?[^.!?]{0,40}\bweniger\b[^.!?]{0,60}\bals\b/i,
    frame: /\bweniger\b[^.!?]{2,80}\bals\b\s*\S+/i,
    novelty: 3, minWords: 10,
    help: {
      absent: "Bauen Sie den Satz mit „weniger … als …“ — das Paar ist der Ausdruck.",
      frame: "Beide Hälften müssen da sein. Was stört Sie weniger, und was stört Sie stattdessen mehr?",
      good: "Genau so verschiebt man eine Diskussion, ohne sie zu verlassen.",
    },
  },

  {
    id: "weiss_ich_allerdings_auch_nicht",
    /* Every expression carries its own production context, so the ladder can
       promote it. Without one, an expression the learner has only CHOSEN has
       nowhere to climb and comes back forever as recognition. */
    produceContext: "Sie haben gerade überzeugend erklärt, woran etwas bei Ihnen scheitert. Eine Lösung haben Sie aber nicht. Sagen Sie das zum Schluss.",
    produceHint: "Eine indirekte Frage — „Ob …“, „Wie …“ — und dann der Satz.",
    citation: "…, weiß ich allerdings auch nicht",
    gloss: "…, I don't actually know either",
    who: "A. Reinhardt",
    occurrence: "Ob zwei feste Tage dafür das richtige Mittel sind, weiß ich allerdings auch nicht.",
    capability: "concede",
    /* Rare and worth teaching: conceding about your OWN case rather than the
       opponent's. Examiners hear it as Sprachbewusstsein, not as weakness. */
    does: "Sie räumen eine Grenze Ihres eigenen Arguments ein. Nach vier Sätzen, in denen Sie recht hatten, macht dieser Satz Sie glaubwürdiger und nicht schwächer.",
    notThis: "Es ist kein Rückzug. A. Reinhardt nimmt nichts zurück — er sagt nur, dass er die Lösung nicht kennt, obwohl er das Problem genau beschrieben hat.",
    pattern: /wei[ßss]{1,2}\s+ich\s+(allerdings\s+)?(auch\s+)?nicht/i,
    /* The thing you don't know has to be a question, not a mood. The indirect
       question in front of it is the whole construction. */
    frame: /\b(ob|wie|was|warum|wer|wann|wo)\b[^.!?]{5,90},\s*wei[ßss]{1,2}\s+ich/i,
    novelty: 4, minWords: 12,
    help: {
      absent: "Der Satz endet auf „…, weiß ich allerdings auch nicht“. Er kommt zum Schluss, nicht am Anfang.",
      frame: "Davor muss eine indirekte Frage stehen: „Ob …“, „Wie …“, „Was …“ — und dann erst „…, weiß ich allerdings auch nicht“.",
      good: "Das macht Sie glaubwürdiger, nicht schwächer. Genau dafür gibt es den Satz.",
    },
  },
];

const BY_ID = new Map(EXPRESSIONS.map(e => [e.id, e]));

module.exports = { EXPRESSIONS, BY_ID, SOURCE_ID: "src_homeoffice" };
