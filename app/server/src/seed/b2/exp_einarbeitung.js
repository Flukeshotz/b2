/**
 * Experiences derived from src_einarbeitung. Original Skillcase content, same
 * shape as the earlier sources in this series.
 */

const SOURCE_ID = "src_einarbeitung";

/* ── 1. READING ───────────────────────────────────────────────────────────── */
const reading = {
  id: "exp_einarbeitung_read",
  kind: "reading",
  ord: 0,
  title: "Einarbeitung neuer Kolleginnen: wer bezahlt die Zeit?",
  minutes: 11,
  primary_capability: "compare",
  secondary_capabilities: ["structure", "argue"],
  checks: [],
  teaches: [],
  steps: [
    { t: "story", lines: [
      "Ein Forum. Fünf Beiträge, vier Leute — die Frage: wie wird die Zeit für die Einarbeitung neuer Kolleginnen eingeplant?",
      "Lesen Sie den ganzen Thread einmal durch. Danach bleibt er offen: Sie dürfen jederzeit zurückblättern.",
    ] },

    { t: "read_source", sourceId: SOURCE_ID },

    { t: "readq", mode: "attribute", sourceId: SOURCE_ID,
      capability: "compare",
      q: "Wer beschreibt eine offizielle Regelung, die in der Praxis nicht so funktioniert wie geplant?",
      options: ["carla", "robert", "gisela", "peter"],
      answer: 1,
      explain: "Robert_H beschreibt eine Regel (reduzierte Aufgaben für Mentorinnen), die auf dem Papier gut klingt, aber „in der Praxis“ trotzdem dazu führt, dass eine Person beides gleichzeitig macht. Carla beschreibt dagegen eine Situation ganz ohne offizielle Regel." },

    { t: "readq", mode: "attribute", sourceId: SOURCE_ID,
      capability: "compare",
      q: "Wer erklärt eine organisatorische Einschränkung aus der Perspektive der Leitung?",
      options: ["carla", "robert", "gisela", "peter"],
      answer: 2,
      explain: "Gisela_Stationsleitung erklärt, warum reduzierte Aufgaben für Mentorinnen bei der aktuellen Personallage nicht immer möglich sind — aus der Position, die diese Entscheidung tatsächlich trifft." },

    { t: "readq", mode: "stance", sourceId: SOURCE_ID,
      capability: "argue",
      quote: "Das ist kein Grund, das ist eine Ausrede — mit Verlaub.",
      q: "Dieser Satz von Peter_W — was macht er vor allem?",
      options: [
        "Er bestreitet, dass Gisela die Personallage korrekt beschreibt.",
        "Er bestreitet, dass die Personallage die einzig mögliche Erklärung für das Problem ist.",
        "Er stimmt Gisela vollständig zu.",
      ],
      answer: 1,
      explain: "Peter zweifelt nicht an den Fakten der Personallage — er zweifelt daran, ob diese Fakten die einzige oder ausreichende Erklärung sind. Das ist ein feiner, aber wichtiger Unterschied: er könnte trotzdem zustimmen, dass die Lage angespannt ist." },

    { t: "readq", mode: "relation", sourceId: SOURCE_ID,
      capability: "structure",
      quote: "Erst wenn genug Personal gesichert ist, kann Einarbeitung überhaupt funktionieren.",
      q: "Wie steht dieser Satz zu Peters vorherigem Satz über die „Ausrede“?",
      options: [
        "Er widerspricht dem vorherigen Satz.",
        "Er liefert die Begründung, warum Peter die Erklärung für unzureichend hält.",
        "Er wiederholt den vorherigen Satz mit anderen Worten.",
        "Er wechselt komplett das Thema.",
      ],
      answer: 1,
      explain: "Der erste Satz behauptet nur, dass die Erklärung nicht ausreicht. Der zweite Satz erklärt WARUM: ohne ausreichend Personal ist Einarbeitung strukturell unmöglich, egal wie die Regel formuliert ist." },

    { t: "readq", mode: "implication", sourceId: SOURCE_ID,
      capability: "compare",
      q: "Carla schreibt, sie hätte das Wort „Ausrede“ nicht gewählt, stimmt Peter aber inhaltlich zu. Was zeigt das über ihre Position?",
      options: [
        "Dass sie Peters Argument insgesamt ablehnt.",
        "Dass sie den Inhalt seines Arguments teilt, aber eine andere Tonlage bevorzugt.",
        "Dass sie sich noch keine eigene Meinung gebildet hat.",
      ],
      answer: 1,
      explain: "Sie trennt den Inhalt (dem sie zustimmt) von der Wortwahl (die sie anders gewählt hätte). Das zeigt eine differenzierte Position, die weder volle Zustimmung noch Ablehnung ist." },

    { t: "readq", mode: "intention", sourceId: SOURCE_ID,
      capability: "compare",
      quote: "Mich stört gar nicht, dass Gisela ehrlich über die Personallage spricht — mich stört, dass die Einarbeitungszeit trotzdem offiziell so eingeplant wird, als gäbe es das Problem nicht.",
      q: "Warum schreibt Carla N. das ganz am Ende?",
      options: [
        "Um Gisela vorzuwerfen, dass sie unehrlich ist.",
        "Um klarzustellen, dass ihr eigentliches Problem die Lücke zwischen offizieller Planung und ehrlich beschriebener Realität ist, nicht die Personallage selbst.",
        "Um zuzugeben, dass ihre erste Beschwerde übertrieben war.",
        "Um vorzuschlagen, die Einarbeitung ganz abzuschaffen.",
      ],
      answer: 1,
      explain: "Sie lobt Gisela sogar für die Ehrlichkeit über die Personallage — ihr Problem liegt woanders: dass die offizielle Planung diese Realität ignoriert. Wer nur ihren ersten Beitrag liest, könnte sie für eine generelle Kritikerin der Station halten. Das ist sie nicht." },
  ],
};

/* ── 2. VOCABULARY ────────────────────────────────────────────────────────── */
const vocabulary = {
  id: "exp_einarbeitung_chunks",
  kind: "vocabulary",
  ord: 1,
  title: "Vier Sätze, um Gründe von Ausreden zu unterscheiden",
  minutes: 9,
  primary_capability: "argue",
  secondary_capabilities: ["concede", "structure"],
  checks: ["lexical_range"],
  teaches: [
    ["Das kenne ich, bei uns ist es aber anders geregelt: …", "I know that, but where I work it's handled differently: …", "🔗"],
    ["Das ist kein Grund, das ist eine Ausrede.", "that's not a reason, that's an excuse", "🔗"],
    ["Erst wenn X gesichert ist, kann Y funktionieren.", "Y can only work once X is secured", "🔗"],
    ["Genauer gesagt: …", "more precisely: …", "🔗"],
  ],
  steps: [
    { t: "story", lines: [
      "Vier Sätze aus dem Thread, den Sie gerade gelesen haben.",
      "Keine Vokabeln — vier Züge, mit denen man Gründe von Ausreden trennt.",
    ] },

    { t: "notice", ex: "das_kenne_ich_bei_uns_ist_es_anders", sourceId: SOURCE_ID, w: 0 },
    { t: "notice", ex: "genauer_gesagt_meine_ich_damit", sourceId: SOURCE_ID, w: 3 },

    { t: "chunk_choose",
      situation: "Eine Kollegin beschreibt ein Problem, das Sie auch kennen. Bei Ihnen wird es allerdings anders gehandhabt.",
      q: "Wie reagieren Sie?",
      options: [
        "Das kenne ich, bei uns ist es aber anders geregelt: …",
        "Das ist kein Grund, das ist eine Ausrede.",
        "Erst wenn mehr Personal da ist, kann das funktionieren.",
      ],
      answer: 0,
      exercises: ["das_kenne_ich_bei_uns_ist_es_anders"],
      explain: "A erkennt ihre Erfahrung an und stellt Ihre eigene daneben — genau die Situation. B unterstellt ihr eine Ausrede, was hier nicht gemeint ist. C passt inhaltlich nicht zur Situation." },

    { t: "notice", ex: "kein_grund_das_ist_eine_ausrede", sourceId: SOURCE_ID, w: 1 },
    { t: "notice", ex: "erst_wenn_x_gesichert_ist_kann_y_funktionieren", sourceId: SOURCE_ID, w: 2 },

    { t: "chunk_choose",
      situation: "Ihr Vorgesetzter sagt, eine bessere Einarbeitung sei „leider gerade nicht drin“, wegen Zeitmangel. Sie glauben, dass es an der fehlenden Planung liegt, nicht wirklich an der Zeit.",
      q: "Wie widersprechen Sie deutlich, aber sachlich?",
      options: [
        "Das ist kein Grund, das ist eine Ausrede — mit Verlaub.",
        "Das kenne ich, bei uns ist es aber anders geregelt.",
        "Genauer gesagt, meine ich damit etwas anderes.",
      ],
      answer: 0,
      exercises: ["kein_grund_das_ist_eine_ausrede"],
      explain: "A bestreitet direkt, dass die genannte Ursache zwingend ist — genau Ihre Position. B und C passen inhaltlich nicht: es geht hier weder um eine andere Erfahrung noch um eine Präzisierung Ihrer eigenen Aussage." },

    { t: "chunk_produce", ex: "erst_wenn_x_gesichert_ist_kann_y_funktionieren", sourceId: SOURCE_ID,
      context: "Sie glauben, dass eine Verbesserung bei Ihnen nur funktioniert, wenn zuerst eine bestimmte Voraussetzung erfüllt ist. Formulieren Sie das.",
      hint: "Erst die Voraussetzung, dann das, was davon abhängt." },

    { t: "chunk_produce", ex: "genauer_gesagt_meine_ich_damit", sourceId: SOURCE_ID,
      context: "Ihre erste Aussage in einer Diskussion war zu allgemein formuliert und wurde missverstanden. Präzisieren Sie, was Sie eigentlich meinen.",
      hint: "Nicht zurückrudern — nur genauer werden." },
  ],
};

const EXPERIENCES = [reading, vocabulary];

module.exports = { EXPERIENCES, SOURCE_ID };
