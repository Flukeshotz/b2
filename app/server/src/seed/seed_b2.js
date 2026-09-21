// Seeds the B2 verdict engine: schema, one Goethe Schreiben rubric, one task.
//   node src/seed/seed_b2.js
//
// Both boards are seeded, each against its OWN criteria, taken from the boards'
// own documents -- Goethe's Durchfuehrungsbestimmungen and telc's 2019 Handbuch
// Deutsch B2 (p.43). They are genuinely different products:
//
//   Goethe  forum post + formal message, 4 dimensions, scored /100, pass 60
//   telc    semi-formal EMAIL replying to an advert, 3 criteria, scored /45,
//           15% of the exam, min 150 words, one task chosen from two
//
// Generalising one rubric onto the other would have produced a confidently
// wrong verdict on the board our sharpest customer is actually sitting.
//
// Tasks here are ORIGINAL, written in each board's format. Board papers are
// linked, never copied -- see b2/resources.js.

const fs = require("fs");
const path = require("path");
const pool = require("../db/pool");

const GOETHE_SCHREIBEN_DIMENSIONS = [
  { id: "erfuellung",  label: "Aufgabenerfüllung",        weight: 0.3 },
  { id: "kohaerenz",   label: "Kohärenz und Textaufbau",  weight: 0.25 },
  { id: "wortschatz",  label: "Wortschatz",               weight: 0.25 },
  { id: "korrektheit", label: "Grammatische Korrektheit", weight: 0.2 },
];

const CONTENT_POINTS = [
  { id: "meinung",   label_de: "Eigene Meinung",           detector: "(meiner meinung nach|ich finde|ich denke|ich glaube|ich bin (der (meinung|ansicht)|dafür|dagegen)|aus meiner sicht|meines erachtens|ich halte)" },
  { id: "argument",  label_de: "Argument dafür",           detector: "(zum einen|erstens|ein (wichtiges )?argument|spricht daf(ü|ue)r|ein vorteil|studien|zeigen|belegen|zum beispiel|beispielsweise)" },
  { id: "gegenarg",  label_de: "Gegenargument + Reaktion", detector: "(allerdings|jedoch|andererseits|kritiker|einwand|einwenden|zwar|dennoch|trotzdem|gegner|manche (leute )?sagen)" },
  { id: "vorschlag", label_de: "Vorschlag",                detector: "(vorschlag|ich schlage vor|sollte man|k(ö|oe)nnte man|m(ü|ue)sste man|lie(ß|ss)e sich|w(ä|ae)re es sinnvoll|denkbar w(ä|ae)re|man sollte|man k(ö|oe)nnte)" },
];

(async () => {
  const ddl = fs.readFileSync(path.join(__dirname, "../db/b2_schema.sql"), "utf8");
  await pool.query(ddl);

  const r = await pool.query(
    `INSERT INTO b2_rubrics (board, module, task_type, version, provisional, dimensions,
                             pass_mark, borderline_low, borderline_high)
     VALUES ('goethe','schreiben','forumsbeitrag',1,false,$1,60,55,65)
     ON CONFLICT (board, module, task_type, version) DO UPDATE SET dimensions = EXCLUDED.dimensions
     RETURNING id`,
    [JSON.stringify(GOETHE_SCHREIBEN_DIMENSIONS)]
  );
  const rubricId = r.rows[0].id;

  await pool.query(
    `INSERT INTO b2_tasks (id, rubric_id, prompt_de, content_points, target_words, source)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (id) DO UPDATE SET prompt_de = EXCLUDED.prompt_de, content_points = EXCLUDED.content_points`,
    [
      "s01_vier_tage_woche",
      rubricId,
      "Sie haben online die Diskussion über die Vier-Tage-Woche gelesen. Schreiben Sie einen Forumsbeitrag von ca. 150 Wörtern. Gehen Sie dabei auf folgende Punkte ein: 1. Ihre eigene Meinung zur Vier-Tage-Woche. 2. Ein Argument, das für Ihre Position spricht. 3. Ein Gegenargument und Ihre Reaktion darauf. 4. Ein Vorschlag, wie eine Umsetzung gelingen könnte.",
      JSON.stringify(CONTENT_POINTS),
      150,
      "authored — /Users/harsh/B2/content/s01_vier_tage_woche.md",
    ]
  );

  // ---- telc Deutsch B2, Schriftlicher Ausdruck ----
  // Criteria names verbatim from the telc Handbuch Deutsch B2 (2019), p.43.
  // Secondary sites give criterion 1 as "Behandlung des Schreibanlasses" -- that
  // is the B1 wording. The handbook is authoritative.
  const TELC_DIMENSIONS = [
    { id: "leitpunkte",  label: "Berücksichtigung der Leitpunkte", weight: 0.34 },
    { id: "gestaltung",  label: "Kommunikative Gestaltung",        weight: 0.33 },
    { id: "richtigkeit", label: "Formale Richtigkeit",             weight: 0.33 },
  ];

  const TELC_LEITPUNKTE = [
    { id: "grund",       label_de: "Grund für Ihr Schreiben",  detector: "(ich schreibe|ich habe (ihre|die) anzeige|ich interessiere mich|mit interesse|bezug nehmend|ich beziehe mich)" },
    { id: "vorkenntnis", label_de: "Ihre Vorkenntnisse",       detector: "(ich habe .{0,40}(erfahrung|kenntnisse|gelernt|besucht)|seit .{0,20}(jahr|monat)|zurzeit lerne|ich verf(ü|ue)ge)" },
    { id: "frage",       label_de: "Ihre Frage zum Angebot",   detector: "(k(ö|oe)nnten sie|w(ä|ae)re es m(ö|oe)glich|ich m(ö|oe)chte (gerne )?wissen|d(ü|ue)rfte ich fragen|meine frage|\\?)" },
    { id: "bitte",       label_de: "Bitte um Information",     detector: "(ich bitte sie|(ü|ue)ber eine (kurze )?antwort|ich w(ü|ue)rde mich freuen|senden sie mir|teilen sie mir mit|informationen)" },
  ];

  const t = await pool.query(
    `INSERT INTO b2_rubrics (board, module, task_type, version, provisional, dimensions,
                             scale_max, subtest_weight, pass_mark, borderline_low, borderline_high)
     VALUES ('telc','schreiben','halbformelle_email',1,true,$1,45,0.15,60,55,65)
     ON CONFLICT (board, module, task_type, version) DO UPDATE SET dimensions = EXCLUDED.dimensions
     RETURNING id`,
    [JSON.stringify(TELC_DIMENSIONS)]
  );
  const telcRubricId = t.rows[0].id;

  await pool.query(
    `INSERT INTO b2_tasks (id, rubric_id, prompt_de, content_points, target_words, source)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (id) DO UPDATE SET prompt_de = EXCLUDED.prompt_de, content_points = EXCLUDED.content_points`,
    [
      "t01_sprachkurs_anfrage",
      telcRubricId,
      "Sie haben im Internet folgende Anzeige gelesen:\n\n„Sprachschule Rheinbogen — Intensivkurse Deutsch B2/C1. Kleine Gruppen (max. 8 Personen), " +
      "Abend- und Wochenendkurse, Prüfungsvorbereitung inklusive. Weitere Auskünfte per E-Mail.\"\n\n" +
      "Schreiben Sie eine E-Mail an die Sprachschule (mindestens 150 Wörter). Gehen Sie auf alle vier Leitpunkte ein:\n" +
      "1. Grund für Ihr Schreiben\n2. Ihre bisherigen Deutschkenntnisse\n3. Eine Frage zu den Kurszeiten\n4. Bitte um Informationen zu den Kosten\n\n" +
      "Vergessen Sie Anrede und Grußformel nicht.",
      JSON.stringify(TELC_LEITPUNKTE),
      150,
      "original — authored for Skillcase in telc format. Not derived from any telc paper.",
    ]
  );

  console.log(`Seeded Goethe rubric (id ${rubricId}) + task s01_vier_tage_woche.`);
  console.log(`Seeded telc rubric  (id ${telcRubricId}) + task t01_sprachkurs_anfrage.`);
  console.log("");
  console.log("NOTE: telc rubric is marked provisional=true. Criteria names and weighting come");
  console.log("from telc's own handbook, but the per-criterion BAND DESCRIPTORS (what earns an");
  console.log("A vs a B on each criterion) are held only by licensed telc raters. Until we hold");
  console.log("them, telc verdicts are provisional and excluded from published calibration.");
  await pool.end();
})().catch(e => { console.error(e); process.exit(1); });
