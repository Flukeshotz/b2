/**
 * FOUR MOVES FROM THE TEAMBESPRECHUNG THREAD. Original Skillcase content.
 *
 *   draw a line between two situations               → argue
 *   mark a guess as a guess                            → structure
 *   propose a third option instead of picking a side   → argue
 *   support an observation with a number                → justify
 */

const EXPRESSIONS = [
  {
    id: "fuer_x_funktioniert_das_fuer_y_nicht_mehr",
    produceContext: "Etwas funktioniert in einer Situation gut, in einer anderen nicht mehr. Ziehen Sie die Grenze zwischen beiden.",
    produceHint: "Erst die Situation, in der es funktioniert, dann die, in der nicht.",
    citation: "Für X funktioniert das, für Y nicht mehr.",
    gloss: "for X that works, for Y it doesn't anymore",
    who: "Bernd_T",
    occurrence: "Für kurze Absprachen funktioniert digital eigentlich ganz gut, für längere Diskussionen nicht mehr.",
    capability: "argue",
    does: "Sie unterteilen eine pauschale Frage (digital ja oder nein) in zwei Fälle mit unterschiedlichen Antworten. Das verhindert eine Debatte, die an der falschen Stelle geführt wird.",
    notThis: "Es ist keine generelle Ablehnung von digitalen Formaten. Die Grenze ist präzise: ein Fall funktioniert, der andere nicht.",
    pattern: /für\s+[^.!?]{2,30}\s+funktioniert\b[^.!?]{0,60}\bfür\s+[^.!?]{2,30}\s+nicht\s+mehr\b/i,
    frame: /funktioniert\b[^.!?]{0,100}\bnicht\s+mehr\b/i,
    novelty: 3, minWords: 8,
    help: {
      absent: "Benutzen Sie „Für X funktioniert das, für Y nicht mehr.“",
      frame: "Beide Situationen müssen genannt werden — die, in der es funktioniert, und die, in der nicht.",
      good: "Genau: Sie trennen zwei Fälle, statt eine pauschale Antwort zu geben.",
    },
  },

  {
    id: "ich_vermute_dass_es_eher_daran_liegt_dass",
    produceContext: "Sie haben eine Vermutung über die eigentliche Ursache eines Verhaltens, sind sich aber nicht sicher.",
    produceHint: "Markieren Sie es ausdrücklich als Vermutung, nicht als Tatsache.",
    citation: "Ich vermute, dass es eher daran liegt, dass …",
    gloss: "I suspect it's actually more because …",
    who: "Bernd_T",
    occurrence: "Ich vermute, dass es eher daran liegt, dass sich digital niemand die Zeit nimmt, einen Raum zu buchen — es ist einfach bequemer, einen Link zu schicken.",
    capability: "structure",
    does: "Sie bieten eine alternative Erklärung an und markieren sie ausdrücklich als Vermutung, nicht als bewiesene Tatsache.",
    notThis: "Es ist keine sichere Behauptung. „Ich vermute“ hält die Erklärung bewusst offen für Widerspruch.",
    pattern: /ich\s+vermute[,]?\s*dass\s+es\s+eher\s+daran\s+liegt[,]?\s*dass\b/i,
    frame: /ich\s+vermute\b[^.!?]{0,150}\bdass\b/i,
    novelty: 3, minWords: 8,
    help: {
      absent: "Benutzen Sie „Ich vermute, dass es eher daran liegt, dass …“",
      frame: "Nach der Formel muss die vermutete Ursache mit „dass“ folgen.",
      good: "Genau: Sie markieren die Erklärung als Vermutung, nicht als Tatsache.",
    },
  },

  {
    id: "warum_nicht_beides_kombinieren_je_nach_anlass",
    produceContext: "Zwei Optionen stehen sich gegenüber. Sie glauben, beide haben ihre Berechtigung, je nach Situation.",
    produceHint: "Schlagen Sie vor, situativ zu entscheiden, statt sich für eine Seite zu entscheiden.",
    citation: "Warum nicht beides kombinieren, je nach Anlass?",
    gloss: "why not combine both, depending on the occasion?",
    who: "Simone_K",
    occurrence: "Warum nicht beides kombinieren, je nach Anlass, statt immer dasselbe Format zu nehmen?",
    capability: "argue",
    does: "Sie lösen einen Entweder-oder-Streit auf, indem Sie vorschlagen, die Wahl vom konkreten Fall abhängig zu machen, statt sich einmal für immer festzulegen.",
    notThis: "Es ist keine Unentschlossenheit. Der Vorschlag ist eine dritte, oft bessere Option, kein Ausweichen vor der Frage.",
    pattern: /warum\s+nicht\s+beides\s+kombinieren\b/i,
    frame: /warum\s+nicht\s+beides\s+kombinieren\b[^.!?]{0,60}/i,
    novelty: 3, minWords: 5,
    help: {
      absent: "Benutzen Sie „Warum nicht beides kombinieren, je nach Anlass?“",
      frame: "Die Formel funktioniert am besten mit „je nach …“ danach.",
      good: "Genau: Sie schlagen eine situative Lösung vor, statt sich festzulegen.",
    },
  },

  {
    id: "von_den_letzten_x_war_ungefaehr_die_haelfte",
    produceContext: "Sie haben eine Beobachtung gemacht und wollen sie mit einer ungefähren Zahl stützen, ohne genau gezählt zu haben.",
    produceHint: "Eine ungefähre Zahl reicht — es muss keine exakte Statistik sein.",
    citation: "Von den letzten X war ungefähr die Hälfte …",
    gloss: "of the last X, about half were …",
    who: "Yara_P",
    occurrence: "Von den letzten zehn Besprechungen war ungefähr die Hälfte reine Information ohne echte Diskussion.",
    capability: "justify",
    does: "Sie stützen eine Beobachtung mit einer ungefähren, aber konkreten Zahl. Das macht eine Aussage überprüfbarer als ein vager Eindruck, ohne echte Statistik vorzutäuschen.",
    notThis: "Es ist keine exakte wissenschaftliche Erhebung. „Ungefähr“ signalisiert ausdrücklich, dass es eine Schätzung ist.",
    pattern: /von\s+den\s+letzten\s+\w+\b[^.!?]{0,40}\bungefähr\s+die\s+hälfte\b/i,
    frame: /von\s+den\s+letzten\s+\w+\b[^.!?]{0,80}/i,
    novelty: 3, minWords: 7,
    help: {
      absent: "Benutzen Sie „Von den letzten X war ungefähr die Hälfte …“",
      frame: "Nach der Formel muss beschrieben werden, was die Hälfte ausmacht.",
      good: "Genau: Sie stützen Ihre Beobachtung mit einer ungefähren Zahl.",
    },
  },
];

const BY_ID = new Map(EXPRESSIONS.map(e => [e.id, e]));

module.exports = { EXPRESSIONS, BY_ID, SOURCE_ID: "src_teambesprechung" };
