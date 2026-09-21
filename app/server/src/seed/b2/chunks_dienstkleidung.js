/**
 * FOUR MOVES FROM THE DIENSTKLEIDUNG THREAD. Original Skillcase content.
 *
 *   set personal experience against a stated rule       → structure
 *   separate what is legal from what is fair             → argue
 *   accept a condition without conceding the whole point → concede
 *   redirect to the real objection: transparency, not money → justify
 */

const EXPRESSIONS = [
  {
    id: "bei_mir_persoenlich_war_das_anders",
    produceContext: "Jemand beschreibt eine Regel als allgemeingültig. Ihre eigene Erfahrung war anders — nennen Sie sie, ohne die andere Person zu widerlegen.",
    produceHint: "Stellen Sie Ihre eigene Erfahrung neben die Aussage, statt sie zu bestreiten.",
    citation: "Bei mir persönlich war das anders: …",
    gloss: "for me personally it was different: …",
    who: "Matteo_F",
    occurrence: "Bei mir persönlich war das anders: mein früherer Arbeitgeber hat alles gestellt, inklusive Schuhe.",
    capability: "structure",
    does: "Sie stellen eine eigene Erfahrung neben eine verallgemeinernde Aussage, ohne diese direkt zu bestreiten. Das öffnet den Vergleich, statt einen Streit zu beginnen.",
    notThis: "Es ist kein Beweis, dass die andere Erfahrung falsch ist. Zwei Erfahrungen können nebeneinander wahr sein.",
    pattern: /bei\s+mir\s+persönlich\s+war\s+das\s+anders\b/i,
    frame: /bei\s+mir\s+persönlich\s+war\s+das\s+anders\b[^.!?]{0,80}/i,
    novelty: 3, minWords: 8,
    help: {
      absent: "Benutzen Sie „Bei mir persönlich war das anders: …“ und nennen Sie Ihre eigene Erfahrung.",
      frame: "Nach der Formel muss die konkrete andere Erfahrung folgen.",
      good: "Genau: Sie stellen Erfahrungen nebeneinander, statt eine für falsch zu erklären.",
    },
  },

  {
    id: "mag_rechtlich_stimmen_hat_aber_mit_fair_wenig_zu_tun",
    produceContext: "Jemand argumentiert mit dem, was rechtlich vorgeschrieben ist. Sie wollen zugeben, dass das stimmt, aber trotzdem eine andere Frage stellen: die nach Fairness.",
    produceHint: "Die rechtliche Aussage stehen lassen, dann die Frage der Fairness getrennt davon aufmachen.",
    citation: "Das mag rechtlich stimmen, hat aber mit X wenig zu tun.",
    gloss: "that may be legally correct, but it has little to do with X",
    who: "Yusuf D.",
    occurrence: "Das mag rechtlich stimmen, hat aber mit der Frage, was fair ist, eigentlich wenig zu tun.",
    capability: "argue",
    does: "Sie trennen zwei verschiedene Maßstäbe — was erlaubt ist und was gerecht ist — und akzeptieren den einen, ohne ihn für den anderen gelten zu lassen.",
    notThis: "Es ist kein Bestreiten der rechtlichen Aussage selbst. Der Widerspruch betrifft nur, ob sie die eigentliche Frage beantwortet.",
    pattern: /mag\s+rechtlich\s+stimmen\b[^.!?]{0,60}\baber\s+mit\b[^.!?]{0,60}\bwenig\s+zu\s+tun\b/i,
    frame: /mag\s+rechtlich\s+stimmen\b[^.!?]{0,140}\bwenig\s+zu\s+tun\b/i,
    novelty: 4, minWords: 10,
    help: {
      absent: "Benutzen Sie „Das mag rechtlich stimmen, hat aber mit X wenig zu tun.“",
      frame: "Nach „hat aber mit“ muss der andere Maßstab (z. B. Fairness) benannt werden.",
      good: "Genau: Sie trennen zwei verschiedene Fragen, statt eine gegen die andere auszuspielen.",
    },
  },

  {
    id: "solange_x_gilt_bin_ich_einverstanden",
    produceContext: "Sie stimmen einer Regel zu — aber nur unter einer bestimmten Bedingung.",
    produceHint: "Die Bedingung zuerst, dann die Zustimmung.",
    citation: "Wenn ich X wüsste, würde ich es vermutlich auch akzeptieren.",
    gloss: "if I knew X, I would probably accept it",
    who: "Sonja W.",
    occurrence: "Wenn ich das wüsste, würde ich es vermutlich auch akzeptieren.",
    capability: "concede",
    does: "Sie machen Ihre Zustimmung von einer Bedingung abhängig, statt sie pauschal zu geben oder zu verweigern.",
    notThis: "Es ist keine bedingungslose Zustimmung. Ohne die Bedingung bleibt der Einwand bestehen.",
    pattern: /wenn\s+ich\s+[^.!?]{1,20}\s+wüsste\b[^.!?]{0,60}\bakzeptieren\b/i,
    frame: /wenn\s+ich\s+[^.!?]{1,20}\s+wüsste\b[^.!?]{0,60}\bwürde\s+ich\b[^.!?]{0,60}\bakzeptieren\b/i,
    novelty: 3, minWords: 6,
    help: {
      absent: "Benutzen Sie eine Wenn-Bedingung mit „würde ich … akzeptieren“.",
      frame: "Die Bedingung muss klar benannt sein, nicht nur angedeutet.",
      good: "Genau: Ihre Zustimmung hängt an einer konkreten Bedingung.",
    },
  },

  {
    id: "stoert_nicht_geld_sondern_erklaerung",
    produceContext: "Bei einer unpopulären Regel stört Sie eigentlich nicht die Regel selbst, sondern dass niemand sie erklärt hat.",
    produceHint: "Erst ausschließen, was Sie nicht stört — dann das eigentliche Problem nennen.",
    citation: "Mich stört gar nicht so sehr X an sich — mich stört, dass …",
    gloss: "it's not really X itself that bothers me — what bothers me is that …",
    who: "Sonja W.",
    occurrence: "Mich stört gar nicht so sehr das Geld an sich — bei Matteos Modell mit dem festen Betrag könnte ich sogar leben. Mich stört, dass bei uns niemand überhaupt erklärt hat, warum es so geregelt ist.",
    capability: "justify",
    does: "Sie lenken die Diskussion vom naheliegenden Streitpunkt (Geld) zum eigentlichen Problem (fehlende Erklärung) um.",
    notThis: "Es ist keine Aussage, dass Geld unwichtig wäre. Es zeigt nur, dass ein anderer Punkt für Sie wichtiger ist.",
    pattern: /stört\s+(mich\s+)?gar\s+nicht\s+so\s+sehr\b[\s\S]{0,140}?\bstört\b[^.!?]{0,60}\bdass\b/i,
    frame: /stört\s+(mich\s+)?gar\s+nicht\s+so\s+sehr\b[\s\S]{0,200}?\bdass\b/i,
    novelty: 3, minWords: 12,
    help: {
      absent: "Benutzen Sie „Mich stört gar nicht so sehr X an sich — mich stört, dass …“",
      frame: "Nach dem zweiten „stört“ muss ein „dass“-Satz mit dem eigentlichen Problem stehen.",
      good: "Genau: Sie zeigen das eigentliche Problem, statt beim naheliegenden Thema zu bleiben.",
    },
  },
];

const BY_ID = new Map(EXPRESSIONS.map(e => [e.id, e]));

module.exports = { EXPRESSIONS, BY_ID, SOURCE_ID: "src_dienstkleidung" };
