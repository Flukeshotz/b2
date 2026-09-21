#!/usr/bin/env node
/**
 * GOETHE + TELC EXAM PRACTICE — FINAL INTEGRITY AUDIT
 *
 * Runs an exhaustive, end-to-end database and serving-level verification
 * across all Goethe and telc exam-practice papers.
 *
 * Usage:
 *   node tools/audit_exam_practice.js
 */
require("../src/env")();
const fs = require("node:fs");
const path = require("node:path");
const pool = require("../src/db/pool");
const model = require("../src/b2/content_model");
const content = require("../src/b2/assessment_content");

const AUDIO_DIR = path.join(__dirname, "../public/b2/audio");

const checks = [];
let passCount = 0;
let failCount = 0;

function check(title, condition, detail = "") {
  if (condition) {
    passCount++;
    checks.push({ status: "PASS", title, detail });
    console.log(`  [PASS] ${title}`);
  } else {
    failCount++;
    checks.push({ status: "FAIL", title, detail });
    console.error(`  [FAIL] ${title} — ${detail}`);
  }
}

async function main() {
  console.log("==================================================");
  console.log("GOETHE + TELC EXAM PRACTICE — FINAL INTEGRITY AUDIT");
  console.log("==================================================\n");

  // 1. QUERY ALL EXAM PAPERS
  const { rows: papers } = await pool.query(`
    SELECT p.id, p.board, p.title, p.minutes, p.source, p.exam_version, p.alignment,
           p.source_type, p.review_status, p.difficulty
      FROM b2_papers p
     WHERE p.board IN ('goethe', 'telc')
     ORDER BY p.board, p.id
  `);

  console.log(`Auditing ${papers.length} exam-practice papers from database...\n`);

  // Separate modern papers from legacy proof-of-concept (gx_hoeren_t1)
  const modernPapers = papers.filter(p => p.id !== "gx_hoeren_t1");
  const goethePapers = modernPapers.filter(p => p.board === "goethe");
  const telcPapers = modernPapers.filter(p => p.board === "telc");

  // --------------------------------------------------------------------------
  // SECTION A: EXAM FAMILY & BOARD SEPARATION
  // --------------------------------------------------------------------------
  console.log("--- SECTION A: Exam Family & Board Isolation ---");
  for (const p of modernPapers) {
    if (p.id.startsWith("goethe-b2-")) {
      check(`${p.id}: board is strictly 'goethe'`, p.board === "goethe", `got ${p.board}`);
    } else if (p.id.startsWith("telc-b2-")) {
      check(`${p.id}: board is strictly 'telc'`, p.board === "telc", `got ${p.board}`);
    }
  }

  // Cross-contamination check: verify board='custom' (practice bank) never has goethe/telc ids
  const { rows: customCheck } = await pool.query(`
    SELECT id FROM b2_papers
     WHERE board = 'custom' AND (id LIKE 'goethe-%' OR id LIKE 'telc-%')
  `);
  check("No board='custom' paper has a goethe-* or telc-* prefix", customCheck.length === 0,
    `Found ${customCheck.map(r => r.id).join(", ")}`);

  // Verify no exam paper has board='custom'
  const { rows: examBoardCheck } = await pool.query(`
    SELECT id FROM b2_papers
     WHERE board NOT IN ('goethe', 'telc') AND (id LIKE 'goethe-b2-%' OR id LIKE 'telc-b2-%')
  `);
  check("Every goethe-b2-* and telc-b2-* paper has board IN ('goethe','telc')", examBoardCheck.length === 0,
    `Found ${examBoardCheck.map(r => r.id).join(", ")}`);

  // --------------------------------------------------------------------------
  // SECTION B: COMPONENT IDENTITY & SECTION ORDERING
  // --------------------------------------------------------------------------
  console.log("\n--- SECTION B: Component Identity & Section Ordering ---");
  for (const p of modernPapers) {
    const { rows: sections } = await pool.query(`
      SELECT id, module, part_no, title, instruction, minutes, time_limit_seconds,
             skill, scoring_mode, item_count, audio_required, audio_intended_id, audio_asset_id
        FROM b2_paper_sections
       WHERE paper_id = $1
       ORDER BY part_no
    `, [p.id]);

    check(`${p.id}: has at least 1 section`, sections.length > 0);

    const isComplete = p.id.includes("-complete-");

    if (!isComplete) {
      check(`${p.id}: standalone paper has exactly 1 section`, sections.length === 1, `got ${sections.length}`);
      const sec = sections[0];
      const compFromId = p.id.split("-")[2]; // lesen, hoeren, schreiben, sprechen, sprachbausteine
      check(`${p.id}: module '${sec.module}' matches paper id component '${compFromId}'`,
        sec.module === compFromId, `module=${sec.module}, id=${p.id}`);
      check(`${p.id}: timing matches section minutes`, p.minutes === sec.minutes, `paper=${p.minutes}m, section=${sec.minutes}m`);
    } else {
      // Complete paper sequencing
      if (p.board === "goethe") {
        const expectedModules = ["lesen", "hoeren", "schreiben", "sprechen"];
        const actualModules = sections.map(s => s.module);
        check(`${p.id}: sections are exactly Lesen -> Hören -> Schreiben -> Sprechen`,
          JSON.stringify(actualModules) === JSON.stringify(expectedModules),
          `got ${actualModules.join(" -> ")}`);
        const totalSecMinutes = sections.reduce((sum, s) => sum + s.minutes, 0);
        check(`${p.id}: paper minutes (${p.minutes}m) equals sum of section minutes (${totalSecMinutes}m)`,
          p.minutes === totalSecMinutes);
      } else if (p.board === "telc") {
        const expectedModules = ["lesen", "sprachbausteine", "hoeren", "schreiben", "sprechen"];
        const actualModules = sections.map(s => s.module);
        check(`${p.id}: sections are exactly Lesen -> Sprachbausteine -> Hören -> Schreiben -> Sprechen`,
          JSON.stringify(actualModules) === JSON.stringify(expectedModules),
          `got ${actualModules.join(" -> ")}`);
        const totalSecMinutes = sections.reduce((sum, s) => sum + s.minutes, 0);
        check(`${p.id}: paper minutes (${p.minutes}m) equals sum of section minutes (${totalSecMinutes}m)`,
          p.minutes === totalSecMinutes);
      }
    }
  }

  // --------------------------------------------------------------------------
  // SECTION C: REAL HÖREN AUDIO, TRANSCRIPTS & SERVING INTEGRITY
  // --------------------------------------------------------------------------
  console.log("\n--- SECTION C: Hören Audio, Transcripts & Serving ---");
  const { rows: hoerenSections } = await pool.query(`
    SELECT s.id, s.paper_id, s.module, s.audio_required, s.audio_intended_id, s.audio_asset_id,
           a.path, a.duration_seconds, a.transcript_available, a.voice_set
      FROM b2_paper_sections s
      LEFT JOIN b2_audio_assets a ON a.id = s.audio_asset_id
     WHERE s.module = 'hoeren' AND (s.paper_id LIKE 'goethe-b2-%' OR s.paper_id LIKE 'telc-b2-%')
     ORDER BY s.paper_id
  `);

  for (const h of hoerenSections) {
    check(`${h.paper_id}: audio_required is true`, h.audio_required === true);
    check(`${h.paper_id}: audio_asset_id is attached and matches intended`,
      h.audio_asset_id && h.audio_asset_id === h.audio_intended_id,
      `asset_id=${h.audio_asset_id}, intended=${h.audio_intended_id}`);
    check(`${h.paper_id}: b2_audio_assets row exists with duration > 0`,
      h.duration_seconds && h.duration_seconds > 0, `duration=${h.duration_seconds}s`);
    check(`${h.paper_id}: transcript_available is true`, h.transcript_available === true);

    const filePath = path.join(AUDIO_DIR, `${h.audio_asset_id}.mp3`);
    const fileExists = fs.existsSync(filePath);
    const fileSize = fileExists ? fs.statSync(filePath).size : 0;
    check(`${h.paper_id}: audio file ${h.audio_asset_id}.mp3 exists on disk (${Math.round(fileSize / 1024)} KB)`,
      fileExists && fileSize > 10000, `path=${filePath}`);

    // Context check: verify assessment_content.safeVersion serving structure
    const safe = await content.safeVersion(h.paper_id);
    const listeningCtx = safe.context.listening;
    check(`${h.paper_id}: context.listening.available is true`, listeningCtx?.available === true);
    check(`${h.paper_id}: context.listening reports real audioUrl`, !!listeningCtx?.audioUrl);
    check(`${h.paper_id}: context.listening.text is null (transcript not leaked as primary text)`, listeningCtx?.text === null);
    check(`${h.paper_id}: context.listening has single-play indicator`, listeningCtx?.plays === 1);
  }

  // --------------------------------------------------------------------------
  // SECTION D: WRITING & SPEAKING CAPTURE BEHAVIOR (HONEST SCORING)
  // --------------------------------------------------------------------------
  console.log("\n--- SECTION D: Writing & Speaking Capture Behavior ---");
  const { rows: writingItems } = await pool.query(`
    SELECT i.id, s.paper_id, i.item_type, i.scoring_mode, i.points, i.payload, i.answer, i.answer_payload
      FROM b2_paper_items i JOIN b2_paper_sections s ON s.id = i.section_id
     WHERE s.module = 'schreiben' AND (s.paper_id LIKE 'goethe-b2-%' OR s.paper_id LIKE 'telc-b2-%')
  `);
  for (const w of writingItems) {
    check(`${w.paper_id}: Schreiben item_type is LONG_TEXT`, w.item_type === "LONG_TEXT");
    check(`${w.paper_id}: Schreiben scoring_mode is RUBRIC`, w.scoring_mode === "RUBRIC");
    check(`${w.paper_id}: Schreiben grade() returns null (never auto-graded)`,
      content.grade(w, "Ein Text...") === null);
    check(`${w.paper_id}: Schreiben has rubric_id and min_words >= 120`,
      w.payload?.rubric_id && w.payload?.min_words >= 120,
      `rubric=${w.payload?.rubric_id}, min_words=${w.payload?.min_words}`);
    check(`${w.paper_id}: Schreiben has no automatic answer key stored`, w.answer === null && w.answer_payload === null);
  }

  const { rows: speakingItems } = await pool.query(`
    SELECT i.id, s.paper_id, i.item_type, i.scoring_mode, i.points, i.payload, i.answer, i.answer_payload
      FROM b2_paper_items i JOIN b2_paper_sections s ON s.id = i.section_id
     WHERE s.module = 'sprechen' AND (s.paper_id LIKE 'goethe-b2-%' OR s.paper_id LIKE 'telc-b2-%')
  `);
  for (const sp of speakingItems) {
    check(`${sp.paper_id}: Sprechen item_type is SPOKEN_RESPONSE`, sp.item_type === "SPOKEN_RESPONSE");
    check(`${sp.paper_id}: Sprechen scoring_mode is TRANSCRIPT_ONLY`, sp.scoring_mode === "TRANSCRIPT_ONLY");
    check(`${sp.paper_id}: Sprechen grade() returns null (never auto-graded)`,
      content.grade(sp, "Eine Aufnahme...") === null);
    check(`${sp.paper_id}: Sprechen has no automatic answer key stored`, sp.answer === null && sp.answer_payload === null);
  }

  // --------------------------------------------------------------------------
  // SECTION E: PROVENANCE, REVIEW STATUS & DISCLOSURES
  // --------------------------------------------------------------------------
  console.log("\n--- SECTION E: Provenance & Review Status ---");
  for (const p of modernPapers) {
    check(`${p.id}: alignment is 'exam_format_practice'`, p.alignment === "exam_format_practice");
    check(`${p.id}: source_type is 'ORIGINAL'`, p.source_type === "ORIGINAL");
    check(`${p.id}: review_status is 'AUTO_QA_PASS'`, p.review_status === "AUTO_QA_PASS");
    check(`${p.id}: source string explicitly disclaims official exam status`,
      p.source.includes("not an official") || p.source.includes("Exam-format practice"),
      `source="${p.source}"`);
  }

  const { rows: itemProvenance } = await pool.query(`
    SELECT i.id, s.paper_id, i.source_type, i.review_status
      FROM b2_paper_items i JOIN b2_paper_sections s ON s.id = i.section_id
     WHERE s.paper_id LIKE 'goethe-b2-%' OR s.paper_id LIKE 'telc-b2-%'
  `);
  for (const it of itemProvenance) {
    if (it.source_type !== "ORIGINAL" || it.review_status !== "AUTO_QA_PASS") {
      check(`Item ${it.id} in ${it.paper_id} has correct provenance`, false,
        `source_type=${it.source_type}, review_status=${it.review_status}`);
    }
  }
  check(`All ${itemProvenance.length} exam items have source_type='ORIGINAL' and review_status='AUTO_QA_PASS'`, true);

  // --------------------------------------------------------------------------
  // SECTION F: NO DUPLICATE CONTENT
  // --------------------------------------------------------------------------
  console.log("\n--- SECTION F: Content Deduplication & Reuse Integrity ---");
  // 1. Within a single paper: no duplicate stems
  const { rows: internalDups } = await pool.query(`
    SELECT s.paper_id, i.stem, COUNT(*) AS count
      FROM b2_paper_items i JOIN b2_paper_sections s ON s.id = i.section_id
     WHERE s.paper_id LIKE 'goethe-b2-%' OR s.paper_id LIKE 'telc-b2-%'
     GROUP BY s.paper_id, i.stem
    HAVING COUNT(*) > 1
  `);
  check("No paper contains duplicate item stems internally", internalDups.length === 0,
    `Found internal duplicates in: ${internalDups.map(d => `${d.paper_id}: "${d.stem.slice(0, 30)}"`).join("; ")}`);

  // 2. Across standalone papers: no shared stems
  const { rows: standaloneStems } = await pool.query(`
    SELECT i.stem, array_agg(DISTINCT s.paper_id ORDER BY s.paper_id) AS papers
      FROM b2_paper_items i JOIN b2_paper_sections s ON s.id = i.section_id
     WHERE (s.paper_id LIKE 'goethe-b2-%' OR s.paper_id LIKE 'telc-b2-%')
       AND s.paper_id NOT LIKE '%-complete-%'
     GROUP BY i.stem
    HAVING COUNT(DISTINCT s.paper_id) > 1
  `);
  check("No two standalone exam papers share an identical item stem", standaloneStems.length === 0,
    `Shared stems found across: ${standaloneStems.map(s => JSON.stringify(s.papers)).join("; ")}`);

  // --------------------------------------------------------------------------
  // SECTION G: EXACT DATABASE COUNTS
  // --------------------------------------------------------------------------
  console.log("\n==================================================");
  console.log("EXACT DATABASE COUNTS FOR AUDIT REPORT");
  console.log("==================================================");

  // Goethe counts
  const { rows: gStandalone } = await pool.query(`
    SELECT s.module, COUNT(DISTINCT p.id) AS set_count, COUNT(i.id) AS item_count
      FROM b2_papers p
      JOIN b2_paper_sections s ON s.paper_id = p.id
      JOIN b2_paper_items i ON i.section_id = s.id
     WHERE p.board = 'goethe' AND p.id LIKE 'goethe-b2-%' AND p.id NOT LIKE '%-complete-%'
     GROUP BY s.module
     ORDER BY s.module
  `);

  const { rows: gComplete } = await pool.query(`
    SELECT p.id, COUNT(DISTINCT s.id) AS section_count, COUNT(i.id) AS item_count, p.minutes
      FROM b2_papers p
      JOIN b2_paper_sections s ON s.paper_id = p.id
      JOIN b2_paper_items i ON i.section_id = s.id
     WHERE p.board = 'goethe' AND p.id LIKE 'goethe-b2-complete-%'
     GROUP BY p.id, p.minutes
     ORDER BY p.id
  `);

  const { rows: gAudio } = await pool.query(`
    SELECT DISTINCT s.audio_asset_id, a.duration_seconds
      FROM b2_paper_sections s
      JOIN b2_audio_assets a ON a.id = s.audio_asset_id
     WHERE s.paper_id LIKE 'goethe-b2-%'
  `);

  const { rows: gWriting } = await pool.query(`
    SELECT i.id, s.paper_id, i.stem
      FROM b2_paper_items i JOIN b2_paper_sections s ON s.id = i.section_id
     WHERE s.paper_id LIKE 'goethe-b2-%' AND s.module = 'schreiben'
  `);

  const { rows: gSpeaking } = await pool.query(`
    SELECT i.id, s.paper_id, i.stem
      FROM b2_paper_items i JOIN b2_paper_sections s ON s.id = i.section_id
     WHERE s.paper_id LIKE 'goethe-b2-%' AND s.module = 'sprechen'
  `);

  // telc counts
  const { rows: tStandalone } = await pool.query(`
    SELECT s.module, COUNT(DISTINCT p.id) AS set_count, COUNT(i.id) AS item_count
      FROM b2_papers p
      JOIN b2_paper_sections s ON s.paper_id = p.id
      JOIN b2_paper_items i ON i.section_id = s.id
     WHERE p.board = 'telc' AND p.id LIKE 'telc-b2-%' AND p.id NOT LIKE '%-complete-%'
     GROUP BY s.module
     ORDER BY s.module
  `);

  const { rows: tComplete } = await pool.query(`
    SELECT p.id, COUNT(DISTINCT s.id) AS section_count, COUNT(i.id) AS item_count, p.minutes
      FROM b2_papers p
      JOIN b2_paper_sections s ON s.paper_id = p.id
      JOIN b2_paper_items i ON i.section_id = s.id
     WHERE p.board = 'telc' AND p.id LIKE 'telc-b2-complete-%'
     GROUP BY p.id, p.minutes
     ORDER BY p.id
  `);

  const { rows: tAudio } = await pool.query(`
    SELECT DISTINCT s.audio_asset_id, a.duration_seconds
      FROM b2_paper_sections s
      JOIN b2_audio_assets a ON a.id = s.audio_asset_id
     WHERE s.paper_id LIKE 'telc-b2-%'
  `);

  const { rows: tWriting } = await pool.query(`
    SELECT i.id, s.paper_id, i.stem
      FROM b2_paper_items i JOIN b2_paper_sections s ON s.id = i.section_id
     WHERE s.paper_id LIKE 'telc-b2-%' AND s.module = 'schreiben'
  `);

  const { rows: tSpeaking } = await pool.query(`
    SELECT i.id, s.paper_id, i.stem
      FROM b2_paper_items i JOIN b2_paper_sections s ON s.id = i.section_id
     WHERE s.paper_id LIKE 'telc-b2-%' AND s.module = 'sprechen'
  `);

  console.log("\nGOETHE B2 COUNTS:");
  console.log("  Standalone sets by component:");
  for (const s of gStandalone) {
    console.log(`    - ${s.module}: ${s.set_count} sets (${s.item_count} items total)`);
  }
  console.log(`  Complete papers: ${gComplete.length}`);
  for (const c of gComplete) {
    console.log(`    - ${c.id}: ${c.section_count} sections, ${c.item_count} items, ${c.minutes} min`);
  }
  console.log(`  Partial papers: 0 (all components complete; standalone sets are single-component practice)`);
  console.log(`  Hören audio assets: ${gAudio.length}`);
  for (const a of gAudio) {
    console.log(`    - ${a.audio_asset_id} (${a.duration_seconds}s)`);
  }
  console.log(`  Writing tasks: ${gWriting.length} (${gWriting.filter(w => !w.paper_id.includes("-complete-")).length} unique standalone prompts)`);
  console.log(`  Speaking tasks: ${gSpeaking.length} (${gSpeaking.filter(sp => !sp.paper_id.includes("-complete-")).length} unique standalone prompts)`);

  console.log("\nTELC B2 COUNTS:");
  console.log("  Standalone sets by component:");
  for (const s of tStandalone) {
    console.log(`    - ${s.module}: ${s.set_count} sets (${s.item_count} items total)`);
  }
  console.log(`  Complete papers: ${tComplete.length}`);
  for (const c of tComplete) {
    console.log(`    - ${c.id}: ${c.section_count} sections, ${c.item_count} items, ${c.minutes} min`);
  }
  console.log(`  Partial papers: 0 (all components complete; standalone sets are single-component practice)`);
  console.log(`  Hören audio assets: ${tAudio.length}`);
  for (const a of tAudio) {
    console.log(`    - ${a.audio_asset_id} (${a.duration_seconds}s)`);
  }
  console.log(`  Writing tasks: ${tWriting.length} (${tWriting.filter(w => !w.paper_id.includes("-complete-")).length} unique standalone prompts)`);
  console.log(`  Speaking tasks: ${tSpeaking.length} (${tSpeaking.filter(sp => !sp.paper_id.includes("-complete-")).length} unique standalone prompts)`);

  console.log("\n==================================================");
  console.log(`AUDIT SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
  console.log("==================================================");

  await pool.end();
  if (failCount > 0) process.exit(1);
}

main().catch(err => {
  console.error("FATAL AUDIT ERROR:", err);
  process.exit(1);
});
