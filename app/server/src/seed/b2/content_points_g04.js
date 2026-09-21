/**
 * Content-point rules for g04_homeoffice_thread.
 *
 * NOTE ON THE GAP PATTERNS. They use `[\s\S]{0,n}?` rather than `[^.!?]{0,n}?`.
 * Keeping a match inside one sentence is the WINDOW's job now, and doing it
 * again inside the pattern broke two real cases: it could not span the sentence
 * break in "Kerstin_M schreibt … . Da stimme ich ihr zu", and it treated the
 * period in an initial — "Nadja W." — as a wall.
 *
 * Written from the two failure classes the adversarial set exposed, not from
 * the individual sentences in it. Each point gets:
 *
 *   any      one pattern per SIGNAL FAMILY. German states a position by
 *            inversion as readily as by "ich finde", and a reason by a
 *            preposition as readily as by "weil" — those are different
 *            families, not more alternatives.
 *   anchors  what the sentence must also be about, which is what stops a
 *            marker in an unrelated clause from scoring the point.
 *   none     the frames that look right and are not: reporting somebody
 *            else's view, an email address, a generalisation.
 */

/* The subject matter. A sentence that carries none of this is not addressing
   the task, whatever markers it contains. `ich`/`wir` count as anchors too:
   a first-person clause in a text about this thread is on topic by position. */
/* WORD BOUNDARY, UNICODE-SAFE. JavaScript's \b is defined on ASCII word
   characters, so "\b(ü…" can never match: there is no boundary between a space
   and "ü". Every umlaut-initial alternative behind a leading \b was therefore
   dead — "überzeugen mich nicht" and "überflüssig" among them — and silently,
   because a pattern that never fires looks exactly like a learner who never
   wrote it. B is the idiom analyse.js already uses for connectors. */
const B = "(?:^|[^\\wäöüß])";

const TOPIC = "\\b(homeoffice|anwesenheitspflicht|b(ü|ue)rotag|b(ü|ue)ro|pr(ä|ae)senz|regel|regelung|" +
  "pflicht|vorschrift|absprache|team|anfahrt|arbeit|zusammenarbeit|vertrauen|kontrolle)";
/* `kolleg` is deliberately NOT a topic anchor. It is the commonest word in any
   workplace anecdote, so anchoring on it let "Eine Kollegin konnte nicht
   kommen, weil ihr Zug ausgefallen war" count as a justification of the
   learner's position. */
const FIRST_PERSON = "\\b(ich|mir|mich|mein|meine|meinem|meiner|wir|uns|unser|unsere)\\b";

/* Somebody else's view, reported. The commonest false positive across three of
   the four points: every stance and reason marker also appears when you are
   describing what another person thinks. */
const REPORTED = "\\b(kerstin|kerstin_m|tobi|tobi_87|reinhardt|nadja)\\w*\\b[\\s\\S]{0,60}?" +
  "\\b(schreibt|schrieb|sagt|sagte|meint|meinte|findet|begr(ü|ue)ndet|nennt|argumentiert|behauptet)\\b";
const CROWD = "\\b(viele|manche|einige|die meisten|alle|man)\\b[\\s\\S]{0,40}?" +
  "\\b(denken|denkt|finden|findet|glauben|glaubt|meinen|meint|sagen|sagt)\\b";

const CONTENT_POINTS = [
  {
    id: "meinung",
    label_de: "Ihre eigene Position",
    any: [
      /* explicit stance frame */
      "(meiner meinung nach|meines erachtens|aus meiner sicht|f(ü|ue)r mich (spricht|ist|w(ä|ae)re)|ich pers(ö|oe)nlich)",
      /* first-person stance verb ANYWHERE in the sentence — this is the family
         that fixes inversion, which no adjacency pattern can catch */
      "\\bich\\b[\\s\\S]{0,80}?\\b(finde|denke|glaube|halte|meine|neige|sehe|befürworte|bef(ü|ue)rworte|lehne|pl(ä|ae)diere|bin daf(ü|ue)r|bin dagegen)\\b",
      "\\b(finde|denke|glaube|halte|meine|neige|sehe|lehne)\\b[\\s\\S]{0,60}?\\bich\\b",
      /* stance without a verb of opinion: an evaluative predicate on the topic */
      "(ist|sind|w(ä|ae)re|w(ä|ae)ren|halte|scheint|bleibt)[\\s\\S]{0,60}?" + B + "(falsch|richtig|sinnvoll|unsinnig|(ü|ue)berfl(ü|ue)ssig|problematisch|der falsche weg|nicht zeitgem(ä|ae)ß|verfehlt|unn(ö|oe)tig)\\b",
      "\\b(falsche[rnms]? weg|halte ich (wenig|nichts) von|halte wenig davon)\\b",
      /* modal stance about the topic */
      "\\b(sollte|sollten|m(ü|ue)sste|d(ü|ue)rfte)\\b[\\s\\S]{0,60}?\\b(nicht|kein|keine|gar nicht|niemals)\\b",
      /* hypothetical stance — "ich würde das nicht einführen" is a position,
         not a speculation, and dropping it lost a whole family */
      "\\bich\\b[\\s\\S]{0,60}?\\bw(ü|ue)rde\\b[\\s\\S]{0,60}?\\b(nicht|kein|keine|niemals)\\b",
      "\\bw(ü|ue)rde ich\\b[\\s\\S]{0,60}?\\b(nicht|kein|keine)\\b",
      /* the topic as subject of a verdict verb: "Feste Bürotage überzeugen
         mich nicht", "Das leuchtet mir nicht ein" */
      B + "((ü|ue)berzeug\\w+|leuchte[nt]?\\w*)\\b[\\s\\S]{0,40}?\\b(mich|mir)\\b[\\s\\S]{0,30}?\\bnicht\\b",
      /* A reverse-order twin of the pattern above was here and matched nothing:
         "Mir leuchtet nicht ein, …" puts the negation between the verb and its
         particle, which it could not express. Deleted rather than rewritten —
         that sentence is in the held-out batch, and repairing a pattern against
         held-out data turns the only honest accuracy measure into another tuned
         one. It stays a known miss, recorded for the teacher. */
      /* bare declaration of side */
      "\\bich bin (klar |eindeutig |ganz )?(daf(ü|ue)r|dagegen)\\b",
      /* taking a side against a named thing rather than with a pro-form */
      "\\bich bin (klar |eindeutig |ganz |grunds(ä|ae)tzlich )?(f(ü|ue)r|gegen)\\s+\\w+",
    ],
    anchors: [TOPIC, FIRST_PERSON],
    none: [REPORTED, CROWD],
  },

  {
    id: "begruendung",
    label_de: "Eine Begründung",
    any: [
      /* conjunction */
      "\\b(weil|denn|da\\s+\\w+\\s+\\w+)\\b",
      /* consequence adverb — the sentence it opens is the learner's own */
      "\\b(deshalb|deswegen|daher|folglich|somit|mithin|entsprechend|dementsprechend|infolgedessen|aus diesem grund)\\b",
      /* nominal / prepositional causality, which German prefers and the old
         detector could not see at all */
      "\\b(wegen|aufgrund|angesichts|dank|infolge)\\s+\\w+",
      /* explicit reason statements */
      "\\b(liegt (vor allem |haupts(ä|ae)chlich )?daran|der (wichtigste |eigentliche )?(grund|punkt) daf(ü|ue)r|das hat den grund)\\b",
    ],
    anchors: [TOPIC, FIRST_PERSON],
    none: [REPORTED, CROWD,
      /* Somebody else's private circumstances. "Meine Nachbarin arbeitet im
         Homeoffice, weil ihr Kind noch klein ist" is a reason, and not the
         learner's reason for their own position. */
      "\\b(mein|meine|unser|unsere)[nrms]?\\s+(nachbar\\w+|schwester|bruder|mutter|vater|kind\\w*|freund\\w+)\\b"],
  },

  {
    id: "bezug",
    label_de: "Bezug auf eine Person aus dem Thread",
    any: [
      /* a participant named, with engagement in the same sentence */
      "\\b(kerstin|kerstin_m|tobi|tobi_87|reinhardt|nadja)\\w*\\b[\\s\\S]{0,90}?" +
        "" + B + "(stimme|zustimmen|recht|widerspreche|(ü|ue)berzeugt|teile|einleuchtend|leuchtet|trifft|beschreibt|punkt|halte|finde|sehe)\\b",
      "\\b(stimme|zustimmen|recht|widerspreche|teile)\\b[\\s\\S]{0,90}?\\b(kerstin|tobi|reinhardt|nadja)\\w*\\b",
      /* an @-mention that is not an address */
      "@\\s*[A-ZÄÖÜ]",
      /* by role rather than by name */
      "\\b(der teamleiter|die person|der beitrag|der kommentar|der vorredner)\\b[\\s\\S]{0,60}?\\b(im thread|oben|hier)\\b",
      "\\b(im thread|hier im forum)\\b[\\s\\S]{0,80}?\\b(stimme|recht|beschreibt|schreibt)\\b",
      /* a position from the thread quoted and evaluated. Inflected: German puts
         it in the dative as readily as the nominative — "Dem Einwand … stimme
         ich zu" is the same move as "Der Einwand … überzeugt mich nicht". */
      "\\b(die|der|dem|den|das) (aussage|behauptung|argument|einwand|satz|punkt|vorschlag|gedanke)\\b" +
        "[\\s\\S]{0,120}?" + B + "(halte|finde|(ü|ue)berzeugt|stimme|stimmt|teile|zeigt|zu\\b)",
      /* a free relative reporting what somebody in the thread wrote, then a
         verdict: "Was tobi_87 über Kontrolle schreibt, halte ich für …" */
      "\\bwas\\b[\\s\\S]{0,60}?\\b(schreibt|sagt|meint|nennt)\\b[\\s\\S]{0,40}?\\b(halte|finde|sehe|stimme|teile)\\b",
    ],
    /* Reference and stance are routinely two sentences apart in German. */
    window: 2,
    anchors: [],
    none: [
      /* a colleague of the learner's who happens to share a name */
      "\\b(mein|meine|unser|unsere)[nrms]?\\s+(kolleg\\w+|chef\\w+|freund\\w+|nachbar\\w+)\\s+\\w+",
      /* an email address */
      "\\w+@\\w+\\.\\w+",
    ],
  },

  {
    id: "beispiel",
    label_de: "Ein Beispiel aus Ihrem Alltag",
    any: [
      /* explicit */
      "\\b(zum beispiel|beispielsweise|ein beispiel)\\b",
      /* a dated instance from the learner's own life: first person plus a real
         time anchor. This is the family that catches narration with no marker
         at all, which is how most people actually give an example. */
      "(\\b(ich|wir|mein|meine|unser|unsere)\\b[\\s\\S]{0,90}?)?\\b(vorletzte|letzte|vergangene)[nrms]?\\s+(woche|monat|jahr|jahre|sommer|winter)\\b",
      "\\b(im|seit|ab)\\s+(januar|februar|m(ä|ae)rz|april|mai|juni|juli|august|september|oktober|november|dezember)\\b",
      "\\b(neulich|damals|k(ü|ue)rzlich|vor kurzem|als ich|als wir)\\b",
      /* the learner's own workplace, made concrete by a quantity or a span */
      "\\b(bei uns|in meinem team|in meiner abteilung|in unserem betrieb|in meiner firma)\\b[\\s\\S]{0,120}?" +
        "\\b(\\d+|ein halbes|anderthalb|zwei|drei|vier|f(ü|ue)nf|sechs|zw(ö|oe)lf)\\b",
      /* A mirror of the pattern above (quantity first, then the person) was
         here and matched nothing: it listed only digits and two spelled
         numerals, so ordinary German — "seit zwei Jahren" — slipped past it.
         Removed rather than extended: the workplace-anchor family already
         covers this, and a near-duplicate of a held-out sentence is not a
         legitimate way to justify keeping a pattern alive. */
    ],
    anchors: [],
    none: [
      /* a generalisation is not an example, however concrete it sounds */
      "^\\W*(letztendlich|grunds(ä|ae)tzlich|im grunde|generell|allgemein|insgesamt)\\b",
      "\\b(viele|die meisten|man)\\b[\\s\\S]{0,40}?\\b(arbeiten|arbeitet|machen|macht|nutzen|nutzt)\\b",
    ],
  },
];

module.exports = { CONTENT_POINTS };
