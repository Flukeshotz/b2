/**
 * FOUR MOVES FROM THE FEEDBACKGESPRÄCHE THREAD. Original Skillcase content.
 *
 *   deny that more frequent automatically means better  → argue
 *   concede an advantage and still remain unconvinced     → concede
 *   name a concrete fear instead of a vague objection      → justify
 *   attach a condition to eventual agreement                → concede
 */

const EXPRESSIONS = [
  {
    id: "oefter_heisst_nicht_automatisch_besser",
    produceContext: "Jemand schlägt vor, etwas häufiger zu tun, in der Annahme, das sei automatisch besser. Sie zweifeln daran.",
    produceHint: "Widersprechen Sie der Annahme selbst, nicht dem Vorschlag insgesamt.",
    citation: "Öfter heißt nicht automatisch besser.",
    gloss: "more often doesn't automatically mean better",
    who: "Klaus_M",
    occurrence: "Öfter heißt aber nicht automatisch besser. Bei einem Kollegen, der das schon in einem anderen Betrieb hatte, wurde daraus schnell reine Routine",
    capability: "argue",
    does: "Sie bestreiten eine implizite Annahme — dass mehr Häufigkeit automatisch mehr Qualität bedeutet —, ohne den ursprünglichen Vorschlag komplett abzulehnen.",
    notThis: "Es ist keine Ablehnung von Häufigkeit an sich. Es bestreitet nur den automatischen Zusammenhang zwischen Häufigkeit und Qualität.",
    pattern: /öfter\s+heißt\s+(aber\s+)?nicht\s+automatisch\s+besser\b/i,
    frame: /öfter\s+heißt\b[^.!?]{0,60}\bbesser\b/i,
    novelty: 3, minWords: 5,
    help: {
      absent: "Benutzen Sie „Öfter heißt nicht automatisch besser.“",
      frame: "Die Formel steht meist für sich, oft gefolgt von einem konkreten Beispiel.",
      good: "Genau: Sie bestreiten die Annahme, nicht den ganzen Vorschlag.",
    },
  },

  {
    id: "hat_schon_vorteile_ueberzeugt_mich_trotzdem_nicht",
    produceContext: "Ein Vorschlag hat echte Vorteile, die Sie anerkennen — trotzdem bleiben Sie insgesamt skeptisch.",
    produceHint: "Erst den Vorteil zugeben, dann die verbleibende Skepsis.",
    citation: "Das hat schon Vorteile, das gebe ich zu — überzeugt mich trotzdem nicht ganz.",
    gloss: "that does have advantages, I'll admit — it still doesn't fully convince me",
    who: "Annette_Teamleitung",
    occurrence: "Das hat schon Vorteile, das gebe ich zu — aber es überzeugt mich trotzdem nicht ganz.",
    capability: "concede",
    does: "Sie geben einen echten Vorteil zu, ohne dass daraus automatisch Zustimmung zum ganzen Vorschlag folgt.",
    notThis: "Es ist keine halbe Zustimmung. Das Zugeständnis und die Skepsis bestehen beide vollständig nebeneinander.",
    pattern: /hat\s+schon\s+vorteile\b[^.!?]{0,40}\bgebe\s+ich\s+zu\b[^.!?]{0,40}überzeugt\s+mich\s+trotzdem\s+nicht\b/i,
    frame: /vorteile\b[^.!?]{0,80}überzeugt\s+mich\b[^.!?]{0,40}\bnicht\b/i,
    novelty: 3, minWords: 8,
    help: {
      absent: "Benutzen Sie „Das hat schon Vorteile, das gebe ich zu — überzeugt mich trotzdem nicht ganz.“",
      frame: "Beide Hälften müssen stehen: das Zugeständnis UND die verbleibende Skepsis.",
      good: "Genau: Sie geben den Vorteil zu, ohne deshalb zuzustimmen.",
    },
  },

  {
    id: "konkret_befuerchte_ich_dass",
    produceContext: "Sie haben eine vage Sorge zu einem Vorschlag. Machen Sie sie konkret, statt nur allgemein skeptisch zu klingen.",
    produceHint: "Nennen Sie genau, was im schlechtesten Fall passieren könnte.",
    citation: "Konkret befürchte ich, dass …",
    gloss: "specifically, I'm worried that …",
    who: "Jürgen_K",
    occurrence: "Konkret befürchte ich außerdem, dass monatliches Feedback bei Problemen zu früh und zu direkt kommt, ohne dass genug Zeit war, etwas wirklich zu verändern.",
    capability: "justify",
    does: "Sie machen eine allgemeine Sorge konkret und nachvollziehbar, statt nur ein diffuses Unbehagen zu äußern.",
    notThis: "Es ist keine sichere Vorhersage. „Befürchten“ markiert eine mögliche, nicht eine sichere Folge.",
    pattern: /konkret\s+befürchte\s+ich\b/i,
    frame: /konkret\s+befürchte\s+ich\b[^.!?]{0,100}\bdass\b/i,
    novelty: 3, minWords: 6,
    help: {
      absent: "Benutzen Sie „Konkret befürchte ich, dass …“ und nennen Sie danach die genaue Sorge.",
      frame: "Nach der Formel muss ein „dass“-Satz mit der konkreten Sorge stehen.",
      good: "Genau: Sie machen die Sorge konkret, statt nur allgemein skeptisch zu wirken.",
    },
  },

  {
    id: "dafuer_muesste_allerdings_sichergestellt_sein",
    produceContext: "Sie könnten einem Vorschlag zustimmen — aber nur, wenn vorher eine bestimmte Sache geklärt wird.",
    produceHint: "Formulieren Sie die Bedingung als Voraussetzung für Ihre Zustimmung, nicht als Forderung.",
    citation: "Dafür müsste allerdings sichergestellt sein, dass …",
    gloss: "for that, though, it would have to be ensured that …",
    who: "Verena_S",
    occurrence: "Dafür müsste allerdings sichergestellt sein, dass ein einzelnes schlechtes Gespräch nicht gleich als Urteil zählt.",
    capability: "concede",
    does: "Sie machen Ihre eventuelle Zustimmung von einer konkreten Voraussetzung abhängig, statt pauschal zuzustimmen oder abzulehnen.",
    notThis: "Es ist keine Zustimmung ohne Bedingung. Ohne die genannte Voraussetzung bleibt die Zustimmung offen.",
    pattern: /dafür\s+müsste\s+allerdings\s+sichergestellt\s+sein\b/i,
    frame: /dafür\s+müsste\s+allerdings\s+sichergestellt\s+sein\b[^.!?]{0,100}\bdass\b/i,
    novelty: 4, minWords: 8,
    help: {
      absent: "Benutzen Sie „Dafür müsste allerdings sichergestellt sein, dass …“",
      frame: "Nach der Formel muss die konkrete Voraussetzung mit „dass“ folgen.",
      good: "Genau: Sie machen die Zustimmung von einer klaren Bedingung abhängig.",
    },
  },
];

const BY_ID = new Map(EXPRESSIONS.map(e => [e.id, e]));

module.exports = { EXPRESSIONS, BY_ID, SOURCE_ID: "src_feedbackgespraeche" };
