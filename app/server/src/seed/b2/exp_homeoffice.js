/**
 * Experiences derived from src_homeoffice.
 *
 * WHAT THIS IS NOT: "read the text, answer five multiple-choice questions about
 * what it said." Every item below asks for something that cannot be answered by
 * finding a sentence and copying it, because retrieval is a B1 reading skill and
 * this is a B2 source.
 *
 * The five task modes, and why each one exists:
 *
 *   attribute    Which of these people said this? Goethe's Lesen Aufgabe 2 in
 *                its own shape, and the only item type that forces the learner
 *                to hold five positions apart at once. Primary route for
 *                `compare`.
 *   stance       Is this sentence a claim or is it evidence? A B2 reader can
 *                tell an assertion from a supported point; a B1 reader treats
 *                everything printed as fact. Routes to `argue`.
 *   relation     How does this sentence stand to the one before it — does it
 *                support, restrict, contradict, or restate? This is the
 *                cohesion work `structure` names, done as reading rather than
 *                as a connector drill.
 *   implication  What follows that nobody wrote down.
 *   intention    Why did the writer put that sentence there at all.
 *
 * THE TEXT STAYS OPEN. Every task keeps the thread one tap away, on purpose. A
 * reading task that hides the text is testing memory, and memory is not the
 * capability being trained.
 */

const SOURCE_ID = "src_homeoffice";

/* ── 1. READING ───────────────────────────────────────────────────────────── */
const reading = {
  id: "exp_homeoffice_read",
  kind: "reading",
  ord: 0,
  title: "Homeoffice: wer entscheidet das eigentlich?",
  minutes: 11,
  primary_capability: "compare",
  secondary_capabilities: ["structure", "argue"],
  checks: [],
  teaches: [],
  steps: [
    { t: "story", lines: [
      "Ein Forum. Fünf Beiträge, vier Leute — und sie sind sich gründlich uneinig.",
      "Lesen Sie den ganzen Thread einmal durch. Danach bleibt er offen: Sie dürfen jederzeit zurückblättern.",
    ] },

    { t: "read_source", sourceId: SOURCE_ID },

    /* Attribution first — it is the item type that makes the learner map the
       whole thread before answering anything else. */
    { t: "readq", mode: "attribute", sourceId: SOURCE_ID,
      capability: "compare",
      q: "Wer beschreibt einen konkreten Vorgang, der im Homeoffice wegfällt?",
      options: ["kerstin", "tobi", "reinhardt", "nadja"],
      answer: 2,
      explain: "A. Reinhardt nennt nicht „die Stimmung“, sondern eine bestimmte Handlung: die Frage über den Schreibtisch hinweg, die zwei Minuten kostet statt einer Mail und zwei Tagen. Die anderen sprechen über die Regel, nicht über den Vorgang." },

    { t: "readq", mode: "attribute", sourceId: SOURCE_ID,
      capability: "compare",
      q: "Wer bezweifelt, dass die offizielle Begründung der wirkliche Grund ist?",
      options: ["kerstin", "tobi", "reinhardt", "nadja"],
      answer: 1,
      explain: "tobi_87: „Zusammenhalt ist doch nur das Wort, das man benutzt, wenn man Kontrolle meint.“ Kerstin_M zweifelt an der Wirkung der Regel, nicht an der Ehrlichkeit der Begründung — das ist ein anderer Einwand." },

    /* Claim vs. evidence. tobi's line is rhetorically strong and evidentially
       empty, which is exactly why it is the right specimen. */
    { t: "readq", mode: "stance", sourceId: SOURCE_ID,
      capability: "argue",
      quote: "Vor 2020 hat auch niemand behauptet, das Büro sei ein sozialer Ort.",
      q: "Dieser Satz von tobi_87 — was ist er?",
      options: [
        "Ein Beleg: er stützt seine These mit etwas Nachprüfbarem.",
        "Eine Behauptung: sie klingt überzeugend, wird aber nicht belegt.",
        "Ein Zugeständnis: er gibt der Gegenseite teilweise recht.",
      ],
      answer: 1,
      explain: "Er sagt nicht, woher er das weiß, und „niemand“ ist nicht überprüfbar. Der Satz wirkt wie ein Beweis, weil er konkret klingt — er ist aber nur eine zweite Behauptung. A. Reinhardt macht es an derselben Stelle anders: er beschreibt einen Vorgang, den man nachvollziehen kann." },

    /* Cohesion, read rather than drilled. */
    { t: "readq", mode: "relation", sourceId: SOURCE_ID,
      capability: "structure",
      quote: "Nur folgt daraus doch nicht die Pflicht für alle.",
      q: "Nadja W. schreibt zuerst: „Das Argument mit den Neuen höre ich oft, und es stimmt vermutlich.“ Wie steht der Satz danach zu diesem ersten Satz?",
      options: [
        "Er widerspricht ihm: sie hält das Argument doch für falsch.",
        "Er belegt ihn mit einem Beispiel aus ihrer Firma.",
        "Er lässt ihn gelten und bestreitet nur, was daraus folgen soll.",
        "Er wiederholt ihn mit anderen Worten.",
      ],
      answer: 2,
      explain: "„Nur folgt daraus doch nicht …“ greift nicht die Aussage an, sondern den Schluss. Sie räumt erst ein („es stimmt vermutlich“) und schränkt dann die Folgerung ein. Das Beispiel aus ihrer Firma kommt danach — es stützt ihren Gegenvorschlag, nicht den ersten Satz." },

    /* Nothing in the text states this. */
    { t: "readq", mode: "implication", sourceId: SOURCE_ID,
      capability: "compare",
      q: "Kerstin_M schreibt, an ihrem Bürotag säßen ausgerechnet die drei Kollegen zu Hause, mit denen sie zusammenarbeitet. Was folgt daraus für die Anwesenheitspflicht?",
      options: [
        "Sie arbeitet lieber allein als im Team.",
        "In ihrem Fall bewirkt die Regel gerade das nicht, wofür es sie gibt.",
        "Ihr Teamleiter hat die Tage absichtlich falsch verteilt.",
        "Sie hält zwei Tage im Büro für zu wenig.",
      ],
      answer: 1,
      explain: "Die Regel wird mit dem Zusammenhalt im Team begründet. Wenn sie an ihrem Bürotag niemanden aus ihrem Team antrifft, erreicht die Regel bei ihr genau dieses Ziel nicht. Von Absicht steht nichts da — das wäre hineingelesen." },

    /* The item the whole source exists for: her position is not what her first
       post looks like. */
    { t: "readq", mode: "intention", sourceId: SOURCE_ID,
      capability: "compare",
      quote: "Wäre die Regel im Team ausgehandelt worden, hätte ich sie wahrscheinlich mitgetragen",
      q: "Warum schreibt Kerstin_M das ganz am Ende?",
      options: [
        "Um zuzugeben, dass sie sich im ersten Beitrag geirrt hat.",
        "Um klarzustellen, dass sie nicht die Regel ablehnt, sondern die Art, wie sie zustande kam.",
        "Um A. Reinhardt vorzuwerfen, dass er sein Team nicht fragt.",
        "Um vorzuschlagen, die Regel wieder abzuschaffen.",
      ],
      answer: 1,
      explain: "Sie sagt selbst: „Mich stört … weniger der Bürotag als die Art, wie er zustande gekommen ist.“ Und sie geht weiter — bei einem anderen Verfahren wäre vermutlich dieselbe Regel herausgekommen. Wer nur ihren ersten Beitrag liest, hält sie für eine Gegnerin der Anwesenheitspflicht. Sie ist es nicht." },
  ],
};

/* ── 2. WRITING — the full loop ────────────────────────────────────────────
   WRITE → ASSESS → ONE WEAKNESS → MICRO-LESSON → REWRITE → COMPARE.

   The thread is the stimulus, which is what Goethe's Schreiben Aufgabe 1 does:
   you write INTO a discussion that already has positions in it. That is why
   content point 3 names a poster — a Forumsbeitrag that ignores what was
   already said is the commonest way a candidate loses Inhalt marks.

   THE TASK LIVES IN `b2_tasks`, not inline. Only a stored task carries a board,
   a rubric, a target length and detectable content points, and the loop needs
   all four: to assess against the right board, to link a rewrite to its
   original, and to say which point was missed. An inline prompt is a prompt,
   not a task.

   THE REWRITE IS THE EXPERIENCE. Assessment on its own is a score screen, and a
   score screen teaches nobody anything. What is worth an evening is being told
   ONE thing, going to work on it, and watching your own text get better —
   which is also the only honest way to demonstrate `language_awareness`. */
const writing = {
  id: "exp_homeoffice_write",
  kind: "writing",
  ord: 1,
  title: "Schreiben, überarbeiten, vergleichen",
  minutes: 25,
  primary_capability: "argue",
  secondary_capabilities: ["concede", "justify", "structure", "language_awareness"],
  /* NOT a route declaration. writing_loop.routesFor() excludes writing
     experiences on purpose: sending a learner whose writing is weak back to the
     writing task repeats the diagnosis instead of teaching. */
  checks: ["connector_range", "sentence_complexity", "lexical_range", "content_points"],
  teaches: [],
  steps: [
    { t: "story", lines: [
      "Jetzt Sie. Sie schreiben einen eigenen Beitrag in denselben Thread.",
      "Danach sagen wir Ihnen EINE Sache, die ihn stärker machen würde — und Sie schreiben ihn noch einmal.",
    ] },
    { t: "write", taskId: "g04_homeoffice_thread", sourceId: SOURCE_ID,
      experienceId: "exp_homeoffice_write" },
  ],
};

/* ── 3. VOCABULARY ────────────────────────────────────────────────────────
   Five argumentative moves from the thread the learner has just read.

   THE SHAPE IS NOT A WORD LIST. It runs
   NOTICE → UNDERSTAND → CHOOSE → PRODUCE, and only the last of those generates
   real evidence:

     notice        the expression inside the post it was written in, with what
                   it DOES and — as important — what it does not mean. The
                   plausible misreading is on the card, because that is where
                   the learner is actually going to go wrong.
     chunk_choose  a situation, not a gap. "Sie wollen zustimmen und trotzdem
                   widersprechen" — which move? Two of the three options are
                   defensible in some situation, so guessing by elimination
                   does not work.
     chunk_produce the learner writes their own sentence about their own
                   situation. Checked for the frame and for novelty, never for
                   the string alone.

   Recognition items are SKIPPED for any expression the learner has already
   produced — the ladder in b2/chunks.js decides that at serve time, not here.
   Asking somebody to pick an expression out of three, a week after they wrote
   a good sentence with it, is the most demoralising thing this product could
   do. */
const vocabulary = {
  id: "exp_homeoffice_chunks",
  kind: "vocabulary",
  ord: 2,
  title: "Fünf Sätze, mit denen man widerspricht",
  minutes: 9,
  primary_capability: "argue",
  secondary_capabilities: ["concede", "justify", "structure"],
  checks: ["lexical_range"],
  /* `teaches` stays in the A1 shape ([de, en, icon]) so the existing review
     queue and lesson engine need no changes. The real record — function,
     misreading, frame, help — lives in seed/b2/chunks_homeoffice.js, because
     regexes do not survive a trip through JSONB. */
  teaches: [
    ["Begründet wird das mit …", "the reason they give for it is …", "🔗"],
    ["Ich will das gar nicht rundweg ablehnen", "I don't want to reject that out of hand", "🔗"],
    ["Nur folgt daraus doch nicht …", "but that doesn't mean …", "🔗"],
    ["Mich stört weniger X als Y", "what bothers me is less X than Y", "🔗"],
    ["…, weiß ich allerdings auch nicht", "…, I don't actually know either", "🔗"],
  ],
  steps: [
    { t: "story", lines: [
      "Fünf Sätze aus dem Thread, den Sie gerade gelesen haben.",
      "Keine Vokabeln — fünf Züge. Damit kann man widersprechen, ohne dass es nach Streit klingt.",
    ] },

    { t: "notice", ex: "begruendet_wird_das_mit", sourceId: SOURCE_ID, w: 0 },
    { t: "notice", ex: "nicht_rundweg_ablehnen",  sourceId: SOURCE_ID, w: 1 },

    { t: "chunk_choose",
      situation: "Ihre Abteilung soll auf ein neues Programm umsteigen. Sie halten die Umstellung nicht für falsch — aber der Zeitpunkt ist schlecht, und das wollen Sie sagen, ohne als Bremser dazustehen.",
      q: "Womit fangen Sie an?",
      options: [
        "Ich will das gar nicht rundweg ablehnen — nur kommt es gerade zur Unzeit.",
        "Begründet wird das mit der neuen Software.",
        "Mich stört weniger das Programm als der Zeitpunkt.",
      ],
      answer: 0,
      exercises: ["nicht_rundweg_ablehnen", "stoert_weniger_als"],
      /* C is defensible German and would work later in the same conversation.
         It is wrong HERE because it skips the concession, and the learner said
         they did not want to look like an obstruction. */
      explain: "A räumt zuerst ein und macht damit Platz für den Einwand. C ist auch richtiges Deutsch und würde später im Gespräch gut passen — nur nimmt es das Zugeständnis nicht mit, und genau das brauchen Sie, wenn Sie nicht als Bremser gelten wollen. B gibt bloß eine fremde Begründung wieder; das ist kein Einwand." },

    { t: "notice", ex: "nur_folgt_daraus_nicht", sourceId: SOURCE_ID, w: 2 },

    { t: "chunk_choose",
      situation: "Eine Kollegin sagt: „Neue Mitarbeiter brauchen mehr Anleitung.“ Sie finden das völlig richtig. Trotzdem lehnen Sie ihren Vorschlag ab, deshalb alle Teams wöchentlich zusammenzurufen.",
      q: "Wie widersprechen Sie, ohne ihr zu widersprechen?",
      options: [
        "Das sehe ich anders — neue Mitarbeiter kommen gut allein zurecht.",
        "Nur folgt daraus doch nicht, dass alle jede Woche kommen müssen.",
        "Begründet wird das mit der Einarbeitung.",
      ],
      answer: 1,
      exercises: ["nur_folgt_daraus_nicht"],
      explain: "B lässt ihre Aussage vollständig stehen und greift nur den Schluss an — sie kann nichts verteidigen, weil Sie ihr nichts weggenommen haben. A bestreitet die Aussage selbst, was Sie gar nicht wollten. C gibt nur wieder, was gesagt wurde." },

    { t: "notice", ex: "stoert_weniger_als", sourceId: SOURCE_ID, w: 3 },
    { t: "notice", ex: "weiss_ich_allerdings_auch_nicht", sourceId: SOURCE_ID, w: 4 },

    { t: "chunk_choose",
      situation: "Sie haben in einer Besprechung vier Minuten lang erklärt, woran die Übergaben scheitern. Ihre Analyse steht. Eine Lösung haben Sie aber nicht.",
      q: "Womit hören Sie auf?",
      options: [
        "Ob ein anderer Dienstplan das löst, weiß ich allerdings auch nicht.",
        "Mich stört weniger die Übergabe als der Dienstplan.",
        "Ich will das gar nicht rundweg ablehnen.",
      ],
      answer: 0,
      exercises: ["weiss_ich_allerdings_auch_nicht", "stoert_weniger_als"],
      explain: "A räumt eine Grenze des eigenen Arguments ein — nach vier Minuten, in denen Sie recht hatten, macht das glaubwürdig statt schwach. B ordnet zwei Probleme, aber Sie haben ja schon gesagt, worum es geht. C ist ein Zugeständnis an jemand anderen; hier gab es niemanden, dem Sie etwas zugestehen müssten." },

    /* PRODUCTION. Two expressions, not five: the point is that the learner
       writes something they mean, and five prompts in one sitting turns that
       into an exercise. The other three return in later sessions at a higher
       demand — that is what the stage ladder is for. */
    { t: "chunk_produce", ex: "nur_folgt_daraus_nicht", sourceId: SOURCE_ID,
      context: "Jemand sagt Ihnen: „Die Krankenstände sind seit dem Frühjahr gestiegen.“ Nehmen Sie an, das stimmt. Widersprechen Sie trotzdem dem Schluss, den die Person daraus zieht.",
      hint: "Erst zugeben, dann den Schluss angreifen. Was soll daraus angeblich folgen — und warum folgt es nicht?" },

    { t: "chunk_produce", ex: "stoert_weniger_als", sourceId: SOURCE_ID,
      context: "Etwas an Ihrer Arbeit oder Ihrem Alltag stört Sie — aber nicht das, was alle vermuten. Stellen Sie das richtig.",
      hint: "Beide Hälften: was Sie weniger stört, und was stattdessen." },
  ],
};

/* ── 4. GRAMMAR / LANGUAGE ────────────────────────────────────────────────
   ONE SENTENCE FROM THE THREAD, and the reason it is there.

   „Wäre die Regel im Team ausgehandelt worden, hätte ich sie wahrscheinlich
   mitgetragen“ — Kerstin_M's last line, and the sentence that makes the whole
   source work. She is not daydreaming. She is using an unreal past to make a
   point she cannot make any other way: that she is not against the rule, she is
   against how it was made. That is the communicative function, and it is what
   this experience teaches. The form is how the function is delivered.

   NOTICE → CONTRAST → UNDERSTAND → USE, in that order, for a reason:

     NOTICE     three questions about MEANING before any terminology. What
                actually happened, what did not, and why she says it at all.
     CONTRAST   minimal pairs. Report vs unreal past tells them what the form
                is FOR; present vs past irrealis tells them what it costs to get
                wrong — one says the chance is still open, the other says it is
                gone. No conjugation table anywhere.
     UNDERSTAND the form, in about forty words, after they already know what it
                does. „Konjunktiv II“ appears once, as a label, and nothing in
                the experience requires knowing it.
     USE        two situations from adult working life. The learner writes their
                own unreal past — and the checker asks whether the hypothetical
                RELATIONSHIP is there, not whether a string is.

   WHY THIS IS THE FIRST REAL ROUTE TO `speculate`: the capability is not
   claimed by attaching an id. It is demonstrated when the learner states a
   condition that did not hold and the consequence that therefore did not
   follow, in their own content. The checker in b2/grammar.js names those
   conditions one by one and can say which one is missing.

   NOT REUSED FROM A1, deliberately: no `build` (word-order tiles), no
   `spotmistake` (single-token repair), no `pick` (choose the ending), no
   `translate`. Every one of those tests manipulation of a sentence somebody
   else wrote. */
const KERSTIN_IRREALIS =
  "Wäre die Regel im Team ausgehandelt worden, hätte ich sie wahrscheinlich mitgetragen";

const grammar = {
  id: "exp_homeoffice_irrealis",
  kind: "grammar",
  ord: 3,
  title: "Was gewesen wäre",
  minutes: 12,
  primary_capability: "speculate",
  secondary_capabilities: ["argue", "concede"],
  /* The checks this experience is a genuine learning ROUTE for. The writing
     loop reads these to decide which weaknesses it is allowed to surface, so
     claiming one here is a promise that a learner sent this way is actually
     taught the thing. Both hold: the construction IS a two-clause conditional
     sentence, and it IS Konjunktiv II. */
  checks: ["konjunktiv2", "sentence_complexity"],
  teaches: [],
  function_de: "Sagen, was unter anderen Umständen anders gelaufen wäre — und damit einen Punkt machen, den man sonst nicht machen kann.",
  steps: [
    { t: "story", lines: [
      "Ein Satz aus dem Thread. Der letzte von Kerstin_M — und der wichtigste.",
      "Erst schauen wir, was er bedeutet. Die Form kommt später.",
    ] },

    /* ── NOTICE ── meaning first. No terminology in any of these three. */
    { t: "readq", mode: "meaning", sourceId: SOURCE_ID, capability: "speculate",
      quote: KERSTIN_IRREALIS,
      q: "Was ist in Kerstins Firma tatsächlich passiert?",
      options: [
        "Die Regel wurde im Team ausgehandelt.",
        "Die Regel wurde ohne das Team festgelegt.",
        "Es gibt bei ihr gar keine Anwesenheitspflicht.",
      ],
      answer: 1,
      explain: "Genau umgekehrt, als der Satz auf den ersten Blick klingt. Sie beschreibt nicht, was war — sie beschreibt, was NICHT war. Im ersten Beitrag steht es direkt: „festgelegt vom Teamleiter, nicht von uns“." },

    { t: "readq", mode: "meaning", sourceId: SOURCE_ID, capability: "speculate",
      quote: KERSTIN_IRREALIS,
      q: "Und was sagt sie damit über sich selbst?",
      options: [
        "Dass sie die Regel mitgetragen hat.",
        "Dass sie die Regel künftig mitragen wird.",
        "Dass sie sie mitgetragen hätte — es aber nicht getan hat.",
      ],
      answer: 2,
      explain: "Beides zugleich, und das ist der Trick: Sie sagt, wozu sie bereit gewesen wäre, und macht damit sichtbar, dass es nicht dazu gekommen ist. Ein normaler Vergangenheitssatz kann nur eines von beidem." },

    { t: "readq", mode: "meaning", sourceId: SOURCE_ID, capability: "speculate",
      quote: KERSTIN_IRREALIS,
      q: "Sie könnte auch einfach schreiben: „Die Regel ist falsch.“ Warum tut sie das nicht?",
      options: [
        "Weil sie sich nicht traut, deutlich zu werden.",
        "Weil sie die Regel gar nicht ablehnt — sondern nur, wie sie zustande kam.",
        "Weil sie hofft, dass die Regel zurückgenommen wird.",
      ],
      answer: 1,
      explain: "Der unwirkliche Satz erledigt zwei Dinge auf einmal: Er nimmt der Gegenseite das Argument, sie sei grundsätzlich dagegen — und er benennt trotzdem, was schiefgelaufen ist. Deshalb schreibt sie danach: „dann wäre vermutlich etwas ganz Ähnliches dabei herausgekommen“." },

    /* ── CONTRAST ── two minimal pairs, both about meaning. */
    { t: "gcontrast", sourceId: SOURCE_ID,
      lead: "Zwei Sätze, fast dieselben Wörter.",
      variants: [
        { label: "A", de: "Die Regel wurde im Team ausgehandelt. Ich habe sie mitgetragen." },
        { label: "B", de: "Wäre die Regel im Team ausgehandelt worden, hätte ich sie mitgetragen." },
      ],
      q: "Welcher Satz sagt Ihnen, dass es NICHT so gelaufen ist?",
      options: ["A", "B", "Beide sagen dasselbe"],
      answer: 1,
      explain: "A berichtet: es ist passiert, und sie hat mitgetragen. B nimmt beides zurück — weder wurde ausgehandelt, noch hat sie mitgetragen. Dieselben Ereignisse, entgegengesetzte Wirklichkeit." },

    { t: "gcontrast", sourceId: SOURCE_ID,
      lead: "Und jetzt zwei unwirkliche Sätze.",
      variants: [
        { label: "C", de: "Würde die Regel im Team ausgehandelt, würde ich sie mittragen." },
        { label: "D", de: "Wäre die Regel im Team ausgehandelt worden, hätte ich sie mitgetragen." },
      ],
      q: "Bei welchem Satz ist die Sache noch offen?",
      options: ["C", "D", "Bei beiden"],
      answer: 0,
      explain: "C spricht über etwas, das noch passieren könnte — ein Angebot, fast. D spricht über eine Gelegenheit, die vorbei ist; da ist nichts mehr zu verhandeln. Wer D meint und C sagt, klingt versöhnlicher, als er ist. Kerstin meint D." },

    /* ── UNDERSTAND ── forty words, after they already know what it does. */
    { t: "gform",
      label: "Konjunktiv II, Vergangenheit",
      lead: "Jetzt die Form. Sie besteht aus zwei Hälften, und beide sehen gleich aus.",
      parts: [
        { role: "Bedingung", de: "Wäre die Regel ausgehandelt worden,", note: "was nicht der Fall war" },
        { role: "Folge",     de: "hätte ich sie mitgetragen.",           note: "und deshalb auch nicht geschah" },
      ],
      rule: "Beide Hälften: <b>hätte</b> oder <b>wäre</b> + Partizip. Mehr ist es nicht.",
      extras: [
        "„Wenn“ darf wegfallen — dann steht das Verb vorn: <b>Hätte</b> man uns gefragt, …",
        "Mit „wenn“ geht es genauso: <b>Wenn</b> man uns gefragt <b>hätte</b>, …",
      ] },

    /* ── USE ── the learner's own unreal past, twice. */
    { t: "guse", sourceId: SOURCE_ID, quote: KERSTIN_IRREALIS,
      context: "Bei Ihnen wurde einmal etwas entschieden, ohne dass jemand Sie vorher gefragt hat. Machen Sie Kerstins Zug: Sie sind nicht gegen die Entscheidung selbst — Sie sind gegen das Verfahren. Bringen Sie beides in einen Satz.",
      hint: "Die Bedingung, die gefehlt hat — und die Folge, zu der es deshalb nicht gekommen ist." },

    { t: "guse", sourceId: SOURCE_ID, quote: KERSTIN_IRREALIS,
      context: "Etwas ist bei Ihnen einmal schiefgegangen — eine Planung, eine Schicht, ein Termin. Es lag an einer einzelnen Sache: eine Information kam zu spät, jemand fiel aus, ein Raum war belegt. Schreiben Sie über den anderen Verlauf, den es deshalb nicht gab.",
      hint: "Zwei Hälften: die eine Sache, die anders sein musste — und die Folge, die daran hing." },
  ],
};

const EXPERIENCES = [reading, writing, vocabulary, grammar];

module.exports = { EXPERIENCES, SOURCE_ID };
