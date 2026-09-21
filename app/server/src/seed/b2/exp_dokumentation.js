/**
 * Experiences derived from src_dokumentation. Original Skillcase content,
 * same shape as exp_muede.js: nothing taught that was not heard, item kinds
 * following the boards (main_idea, detail, inference, attitude).
 */

const SOURCE_ID = "src_dokumentation";

/* ── 1. LISTENING ─────────────────────────────────────────────────────────── */
const listening = {
  id: "exp_dokumentation_listen",
  kind: "listening",
  ord: 0,
  title: "Dokumentation: Tablet oder Papier?",
  minutes: 8,
  primary_capability: "understand_speech",
  secondary_capabilities: ["concede", "argue"],
  checks: [],
  teaches: [],
  steps: [
    { t: "story", lines: [
      "Ein kurzes Gespräch zwischen zwei Kollegen. Eine neue App, ein Streit — und am Ende geht es um etwas anderes, als es zuerst klang.",
      "Sie hören es zweimal: einmal ganz, dann in Abschnitten. Genau wie in der Prüfung.",
    ] },
    { t: "listen_source", sourceId: SOURCE_ID, plays: 2, mode: "whole" },

    { t: "sourceq", kind: "detail", sourceId: SOURCE_ID,
      q: "Was hat Markus letzte Woche mit der App erlebt?",
      options: [
        "Die App hat einen Widerspruch zwischen zwei Einträgen gefunden.",
        "Die App ist bei ihm mehrmals abgestürzt.",
        "Er hat die App zum ersten Mal benutzt.",
      ],
      answer: 0,
      explain: "Er sagt es direkt: „letzte Woche hat die App bei mir einen Fehler gefunden … Zwei Einträge, die sich widersprochen haben.“",
      ms: 12111 },

    { t: "sourceq", kind: "detail", sourceId: SOURCE_ID,
      q: "Warum findet Sabine Papier trotzdem oft schneller?",
      options: [
        "Weil sie nicht warten muss, bis ein Gerät hochgefahren ist.",
        "Weil sie mit Tablets grundsätzlich nicht gut umgehen kann.",
        "Weil Papier weniger Fehler enthält.",
      ],
      answer: 0,
      explain: "Sie sagt es genau so: „Ich muss nicht warten, bis das Gerät hochgefahren ist.“ Über ihre technischen Fähigkeiten oder die Fehlerquote von Papier sagt sie nichts.",
      ms: 53167 },

    { t: "sourceq", kind: "inference", sourceId: SOURCE_ID,
      q: "Markus sagt: „Das ist doch eher ein Problem mit den alten Geräten, oder? Nicht mit der Idee an sich.“ Was macht er damit?",
      options: [
        "Er gibt zu, dass die ganze App eine schlechte Idee war.",
        "Er trennt zwischen der Technik, die man verbessern kann, und dem Prinzip, das er verteidigen will.",
        "Er fordert, sofort neue Geräte zu kaufen.",
      ],
      answer: 1,
      explain: "Indem er das Problem auf „die alten Geräte“ schiebt, rettet er die grundsätzliche Idee der App vor Sabines Kritik — ohne ihren Punkt (das Hochfahren nervt) zu bestreiten.",
      ms: 65222 },

    { t: "sourceq", kind: "main_idea", sourceId: SOURCE_ID,
      q: "Worum geht es Sabine am Ende wirklich?",
      options: [
        "Sie lehnt die App insgesamt ab und will zu Papier zurück.",
        "Sie stört sich weniger an der App als am fehlenden Training und am schlechten Zeitpunkt der Einführung.",
        "Sie ist mit allem einverstanden, solange die Geräte neu sind.",
      ],
      answer: 1,
      explain: "Ihr letzter Beitrag macht es klar: „Mich stört ehrlich gesagt weniger die App selbst als der Zeitpunkt.“ Wer nur ihren ersten Satz hört, hält sie für eine grundsätzliche Gegnerin der App. Das ist sie nicht.",
      ms: 76833 },

    { t: "sourceq", kind: "attitude", sourceId: SOURCE_ID,
      q: "Wie reagiert Markus, als Sabine sagt, es habe an einer Einweisung gefehlt?",
      options: [
        "Er widerspricht ihr und verteidigt die Einführung.",
        "Er stimmt ihr zu, ohne etwas hinzuzufügen.",
        "Er wechselt sofort das Thema zurück zur Technik.",
      ],
      answer: 1,
      explain: "„Da hast du recht. Eine Schulung vorher wäre besser gewesen.“ Kurz und ohne Einschränkung — anders als bei den Punkten davor, wo er jeweils noch ein Gegenargument brachte.",
      ms: 88000 },
  ],
};

/* ── 2. VOCABULARY ──────────────────────────────────────────────────────── */
const vocabulary = {
  id: "exp_dokumentation_chunks",
  kind: "vocabulary",
  ord: 1,
  title: "Vier Sätze für einen Streit, der nicht eskaliert",
  minutes: 8,
  primary_capability: "argue",
  secondary_capabilities: ["concede"],
  checks: ["lexical_range"],
  teaches: [
    ["Bevor du das sagst — …", "before you say that — …", "🔗"],
    ["In der Theorie … in der Praxis …", "in theory … in practice …", "🔗"],
    ["…, es sei denn, …", "…, unless …", "🔗"],
    ["Ich bin ja nicht grundsätzlich dagegen …", "I'm not fundamentally against it …", "🔗"],
  ],
  steps: [
    { t: "story", lines: [
      "Vier Sätze aus dem Gespräch, das Sie gerade gehört haben.",
      "Kein Streit muss eskalieren — mit diesen Zügen bleibt er sachlich.",
    ] },

    { t: "notice", ex: "in_der_theorie_in_der_praxis", sourceId: SOURCE_ID, w: 1 },
    { t: "notice", ex: "nicht_grundsaetzlich_dagegen", sourceId: SOURCE_ID, w: 3 },

    { t: "chunk_choose",
      situation: "Ein Kollege schlägt eine neue Arbeitsweise vor. Die Idee überzeugt Sie logisch völlig — trotzdem wissen Sie aus Erfahrung, dass sie im Alltag an einer bestimmten Stelle scheitern wird.",
      q: "Wie sagen Sie das?",
      options: [
        "In der Theorie überzeugt mich das. In der Praxis wird es an X scheitern.",
        "Ich bin grundsätzlich dagegen.",
        "Bevor du das sagst — das stimmt überhaupt nicht.",
      ],
      answer: 0,
      exercises: ["in_der_theorie_in_der_praxis"],
      explain: "A erkennt die Logik an UND benennt das praktische Problem — beides zugleich. B lehnt pauschal ab, ohne die gute Logik anzuerkennen. C passt nicht: Sie widersprechen hier keinem vorweggenommenen Einwand, sondern äußern selbst einen." },

    { t: "notice", ex: "bevor_du_das_sagst", sourceId: SOURCE_ID, w: 0 },
    { t: "notice", ex: "es_sei_denn", sourceId: SOURCE_ID, w: 2 },

    { t: "chunk_choose",
      situation: "Sie wollen einen Vorschlag machen, von dem Sie genau wissen, dass eine Kollegin sofort sagen wird: „Das kostet zu viel Zeit.“ Sie haben aber ein gutes Gegenbeispiel parat.",
      q: "Wie fangen Sie an?",
      options: [
        "Bevor du das ablehnst — letzte Woche hat genau das uns eine Stunde gespart.",
        "Es sei denn, du bist dagegen.",
        "Ich bin ja nicht grundsätzlich dagegen.",
      ],
      answer: 0,
      exercises: ["bevor_du_das_sagst"],
      explain: "A nimmt den erwarteten Einwand vorweg und liefert sofort ein Gegenbeispiel — das ist genau die Situation, für die die Formel gemacht ist. B und C passen inhaltlich nicht: Sie widersprechen ja nicht der eigenen Idee." },

    { t: "chunk_produce", ex: "nicht_grundsaetzlich_dagegen", sourceId: SOURCE_ID,
      context: "In Ihrem Team wird eine neue Regel diskutiert, die Sie überwiegend gut finden — bis auf einen einzigen Punkt. Stellen Sie klar, dass Sie nicht generell dagegen sind.",
      hint: "Erst die Position einschränken, dann den einen konkreten Punkt nennen." },

    { t: "chunk_produce", ex: "es_sei_denn", sourceId: SOURCE_ID,
      context: "Sie stimmen einer allgemeinen Aussage zu — außer in einem bestimmten Fall. Formulieren Sie beides in einem Satz.",
      hint: "Erst die allgemeine Zustimmung, dann „es sei denn“ und die eine Ausnahme." },
  ],
};

const EXPERIENCES = [listening, vocabulary];

module.exports = { EXPERIENCES, SOURCE_ID };
