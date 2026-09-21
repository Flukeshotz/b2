/**
 * Publish an exam practice section.
 *
 *   node tools/seed_exam_section.js hoeren_t1_alltag
 *
 * THREE GATES, in order, and the order is the point:
 *   1. the content validates against the official blueprint
 *   2. the audio exists for every text
 *   3. the audio has been verified (verify_exam_audio.js writes the receipt)
 *
 * Audio is the one artefact a learner cannot appeal — Teil 1 is heard once. A
 * section whose recording nobody checked is not practice, it is a coin toss.
 */

require("../src/env")();
const fs = require("node:fs");
const path = require("node:path");
const { Pool } = require("pg");
const { validateSection } = require("../src/b2/exam_section");
const blueprint = require("../src/b2/exam/goethe_b2");

const pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgresql://localhost/learn_german" });
const AUDIO_DIR = path.join(__dirname, "../public/b2/audio/exam");
const RECEIPT = path.join(AUDIO_DIR, "verified.json");

(async () => {
  const id = process.argv[2] || "hoeren_t1_alltag";
  const { SECTION, TEXTS } = require(path.join(__dirname, `../src/seed/b2/exam/${id}.js`));
  const bp = blueprint.teil(SECTION.teil);
  const publish = process.argv.includes("--publish");

  const v = validateSection(SECTION, TEXTS);
  for (const w of v.warns) console.warn(`  WARN  ${w}`);
  if (!v.ok) {
    console.error(`\nBLOCKED — ${v.fails.length} failure(s):`);
    for (const f of v.fails) console.error(`  FAIL  ${f}`);
    process.exit(1);
  }

  const missing = TEXTS.filter(t => !fs.existsSync(path.join(AUDIO_DIR, `${SECTION.id}_t${t.no}.mp3`)));
  if (missing.length) {
    console.error(`\nBLOCKED — no audio for text(s) ${missing.map(t => t.no).join(", ")}. ` +
                  `Run: node tools/build_exam_audio.js ${id}`);
    process.exit(1);
  }

  const receipt = fs.existsSync(RECEIPT) ? JSON.parse(fs.readFileSync(RECEIPT, "utf8")) : {};
  if (!receipt[SECTION.id]?.passed) {
    console.error(`\nBLOCKED — the audio has not passed verification. ` +
                  `Run: node tools/verify_exam_audio.js ${id}`);
    console.error(`  Teil 1 is heard once; audio nobody checked is not practice.`);
    process.exit(1);
  }

  await pool.query(
    `INSERT INTO b2_papers (id, board, title, minutes, source, provisional)
     VALUES ($1,$2,$3,$4,$5,true)
     ON CONFLICT (id) DO UPDATE SET title=$3, minutes=$4, source=$5`,
    [SECTION.paperId, SECTION.board, blueprint.PRACTICE_LABEL(SECTION.teil), bp.readSeconds ? 12 : 12,
     "Skillcase-authored in the format of the Goethe Modellsatz Vs1.5_160426. Not official material."]);

  const { rows } = await pool.query(
    `INSERT INTO b2_paper_sections (paper_id, module, part_no, title, instruction, minutes, max_points)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
    [SECTION.paperId, SECTION.module, SECTION.teil, SECTION.title, bp.instruction, 12, bp.items]);
  const sectionId = rows[0].id;

  let n = 0;
  for (const t of TEXTS) {
    for (const it of t.items) {
      n++;
      await pool.query(
        `INSERT INTO b2_paper_items (section_id, item_no, stem, options, answer, rationale)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (section_id, item_no) DO UPDATE SET stem=$3, options=$4, answer=$5, rationale=$6`,
        [sectionId, n, it.stem,
         JSON.stringify(it.type === "rf" ? ["Richtig", "Falsch"] : it.options),
         it.type === "rf" ? (it.answer ? 0 : 1) : it.answer, it.because]);
    }
  }
  console.log(`\nSeeded ${SECTION.id}: section ${sectionId}, ${n} items, audio verified.`);

  if (publish) {
    await pool.query(
      `INSERT INTO topics (id, order_index, icon, title, capability, proof, subs, level, status)
       VALUES ($1,(SELECT COALESCE(MAX(order_index),-1)+1 FROM topics WHERE level='b2'),
               '📋',$2,$3,$4,$5,'b2','live')
       ON CONFLICT (id) DO UPDATE SET title=$2, capability=$3, proof=$4, subs=$5, status='live'`,
      [`b2_${SECTION.id}_exam`, SECTION.title,
       "Was Sie beim ersten Hören mitbekommen",
       blueprint.PRACTICE_LABEL(SECTION.teil),
       JSON.stringify([{ key: "main", label: SECTION.title, teaches: [],
                         steps: [{ t: "hoeren_t1", sectionId: SECTION.id }] }])]);
    console.log(`Published as topic b2_${SECTION.id}_exam.`);
  }
  await pool.end();
})().catch(e => { console.error(e.message); process.exit(1); });
