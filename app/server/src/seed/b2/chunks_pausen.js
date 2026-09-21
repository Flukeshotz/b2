/**
 * FOUR MOVES FROM THE PAUSEN THREAD. Original Skillcase content.
 *
 *   name an exception before agreeing in general    → concede
 *   ask for precision instead of objecting outright  → argue
 *   redirect the real objection to what's unclear    → justify
 *   explain a rule's intent without defending every detail → structure
 */

const EXPRESSIONS = [
  {
    id: "von_ausnahmen_abgesehen",
    produceContext: "Sie stimmen einer Regel im Grundsatz zu, kennen aber eine Situation, in der sie nicht passt.",
    produceHint: "Erst die Ausnahme benennen, dann die grundsätzliche Zustimmung.",
    citation: "Von Ausnahmen wie X abgesehen, …",
    gloss: "except for cases like X, …",
    who: "Oskar_L",
    occurrence: "Von Ausnahmen wie akuten Situationen abgesehen, finde ich feste Zeiten eigentlich gut.",
    capability: "concede",
    does: "Sie räumen eine konkrete Ausnahme ein, bevor Sie einer Regel im Grundsatz zustimmen. Das macht die Zustimmung glaubwürdiger, weil sie nicht blind wirkt.",
    notThis: "Es ist keine generelle Ablehnung. Die Ausnahme ist eng begrenzt — der Rest des Satzes ist echte Zustimmung.",
    pattern: /von\s+ausnahmen\s+wie\b[^.!?]{0,60}\babgesehen\b/i,
    frame: /von\s+ausnahmen\s+wie\b[^.!?]{0,60}\babgesehen\b[^.!?]{0,60}/i,
    novelty: 3, minWords: 7,
    help: {
      absent: "Benutzen Sie „Von Ausnahmen wie X abgesehen, …“ — nennen Sie die konkrete Ausnahme.",
      frame: "Nach der Formel muss Ihre grundsätzliche Position folgen.",
      good: "Genau: Sie grenzen eine Ausnahme ein, statt die ganze Regel infrage zu stellen.",
    },
  },

  {
    id: "was_genau_meinen_sie_mit",
    produceContext: "Jemand benutzt einen Ausdruck, der mehrdeutig ist. Bevor Sie widersprechen, wollen Sie wissen, was genau gemeint ist.",
    produceHint: "Zitieren Sie den unklaren Ausdruck direkt in Ihrer Frage.",
    citation: "Was genau meinen Sie mit …?",
    gloss: "what exactly do you mean by …?",
    who: "Tarek M.",
    occurrence: "Was genau meinen Sie mit „alle gleichzeitig weg“?",
    capability: "argue",
    does: "Sie fragen gezielt nach der Bedeutung eines vagen Ausdrucks, bevor Sie ihn kritisieren. Das verhindert, dass Sie gegen eine Position argumentieren, die niemand vertreten hat.",
    notThis: "Es ist kein Widerspruch. Die Frage stellt noch keine eigene Position auf — die kommt erst danach.",
    pattern: /was\s+genau\s+meinen\s+sie\s+mit\b/i,
    frame: /was\s+genau\s+meinen\s+sie\s+mit\b[^.!?]{0,60}/i,
    novelty: 2, minWords: 5,
    help: {
      absent: "Benutzen Sie „Was genau meinen Sie mit …?“ und zitieren Sie den unklaren Ausdruck.",
      frame: "Nach der Formel muss der konkrete Ausdruck stehen, den Sie hinterfragen.",
      good: "Genau: Sie klären die Bedeutung, bevor Sie widersprechen.",
    },
  },

  {
    id: "stoert_gar_nicht_an_sich_sondern",
    produceContext: "Etwas an einer neuen Regel stört Sie — aber nicht die Regel selbst, sondern ein bestimmtes Detail daran.",
    produceHint: "Erst ausschließen, was Sie NICHT stört — dann das konkrete Detail nennen.",
    citation: "Mich stört gar nicht X an sich — mich stört, dass …",
    gloss: "it's not X itself that bothers me — what bothers me is that …",
    who: "Melanie T.",
    occurrence: "Mich stört gar nicht die feste Zeit an sich — mich stört, dass niemand gesagt hat, wie die Erreichbarkeit während der Pause geregelt ist.",
    capability: "justify",
    does: "Sie lenken die Diskussion vom naheliegenden Streitpunkt zum eigentlichen Problem um. Das korrigiert ein Missverständnis über Ihre Position.",
    notThis: "Es ist keine Zustimmung zur Regel als Ganzes. Das eigentliche Problem bleibt ungelöst, bis der zweite Teil des Satzes adressiert wird.",
    pattern: /stört\s+(mich\s+)?gar\s+nicht\b[^.!?]{0,60}\ban\s+sich\b[^.!?]{0,60}\bstört\b/i,
    frame: /stört\s+(mich\s+)?gar\s+nicht\b[^.!?]{0,140}\bstört\b[^.!?]{0,60}\bdass\b/i,
    novelty: 3, minWords: 10,
    help: {
      absent: "Benutzen Sie „Mich stört gar nicht X an sich — mich stört, dass …“",
      frame: "Nach dem zweiten „stört“ muss ein „dass“-Satz mit dem eigentlichen Problem stehen.",
      good: "Genau: Sie zeigen, worum es Ihnen wirklich geht, statt das nahliegende Thema zu bestreiten.",
    },
  },

  {
    id: "habe_die_regel_eingefuehrt_weil",
    produceContext: "Sie haben selbst eine unbeliebte Regel eingeführt und wollen erklären, welches Problem sie lösen sollte.",
    produceHint: "Nennen Sie das konkrete Problem, das vorher bestand.",
    citation: "Ich habe die Regel eingeführt, weil …",
    gloss: "I introduced the rule because …",
    who: "Birgit_Stationsleitung",
    occurrence: "Ich leite die Station seit vier Jahren und habe die Regel eingeführt, weil sich sonst niemand traut zu gehen, wenn gerade viel los ist.",
    capability: "structure",
    does: "Sie erklären die Absicht hinter einer Regel, indem Sie das ursprüngliche Problem benennen. Das macht eine Regel nachvollziehbar, ohne jedes Detail einzeln zu verteidigen.",
    notThis: "Es ist keine Behauptung, dass die Regel perfekt ist. Es erklärt nur das WARUM, nicht, dass es keine besseren Lösungen gäbe.",
    pattern: /habe\s+die\s+regel\s+eingeführt[,]?\s*weil\b/i,
    frame: /habe\s+die\s+regel\s+eingeführt[,]?\s*weil\b[^.!?]{0,80}/i,
    novelty: 3, minWords: 7,
    help: {
      absent: "Benutzen Sie „Ich habe die Regel eingeführt, weil …“ und nennen Sie das ursprüngliche Problem.",
      frame: "Nach „weil“ muss das konkrete Problem stehen, das gelöst werden sollte.",
      good: "Genau: Sie erklären die Absicht, statt jedes Detail zu rechtfertigen.",
    },
  },
];

const BY_ID = new Map(EXPRESSIONS.map(e => [e.id, e]));

module.exports = { EXPRESSIONS, BY_ID, SOURCE_ID: "src_pausen" };
