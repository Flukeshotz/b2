#!/usr/bin/env node
/**
 * CONTENT TREE EXPORT — every piece of B2 content, one JSON file per unit,
 * in a folder structure a developer can read without a walkthrough.
 *
 *   node tools/export_content_tree.js            → writes app/content/
 *
 * Source of truth is the live database (the same rows the app serves), plus
 * two in-code banks that never lived in the DB (interview questions, the
 * capability spine). Answer keys ARE included: this is a hand-over export,
 * not a learner-facing payload.
 *
 * Re-running wipes and rewrites app/content/ so it never drifts.
 */
require("../src/env")();
const fs = require("fs");
const path = require("path");
const pool = require("../src/db/pool");

const OUT = path.join(__dirname, "..", "..", "content");
const q = (sql, p) => pool.query(sql, p).then(r => r.rows);
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
const written = [];

/* Guidance + expected answer for open tasks — see tools/generate_model_answers.js. */
const MODEL_ANSWERS_FILE = path.join(__dirname, "../src/seed/b2/model_answers.json");
const MODEL_ANSWERS = fs.existsSync(MODEL_ANSWERS_FILE) ? JSON.parse(fs.readFileSync(MODEL_ANSWERS_FILE, "utf8")) : {};

function write(rel, data) {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
  written.push(rel);
}

/* The four Home tiles, and which section skills each one lists (grammar and
   vocabulary drills sit under Reading, exactly as the app shows them). */
const TILE_FOR_SKILL = {
  reading: "reading", grammar: "reading", vocabulary: "reading",
  listening: "listening", writing: "writing", speaking: "speaking",
};
const BOARD_FOLDER = { goethe: "goethe", telc: "telc", custom: "skillcase" };

/** A human-readable form of the correct answer, next to the raw key. */
function suggestedAnswer(it, paperId, module) {
  const p = it.payload || {}, a = it.answer_payload || {};
  const opts = (it.options && it.options.length) ? it.options : (p.options || []);
  switch (it.item_type) {
    case "MCQ":          return { key: it.answer, text: opts[it.answer] ?? null };
    case "TRUE_FALSE":   return { key: a.value, text: a.value ? "Richtig" : "Falsch" };
    case "MULTI_SELECT": return { key: a.correct, text: (a.correct || []).map(i => opts[i]) };
    case "MATCHING":     return { key: a.mapping, text: Object.entries(a.mapping || {}).map(([l, r]) => `${(p.left || [])[l]} → ${(p.right || [])[r]}`) };
    case "ORDERING":     return { key: a.order, text: (a.order || []).map(i => (p.items || [])[i]) };
    case "GAP_FILL":     return { key: a.gaps, text: (a.gaps || []).map(g => g.accepted.join(" / ")) };
    default: {           // LONG_TEXT / SHORT_TEXT / SPOKEN_RESPONSE — rubric or transcript scored
      const m = MODEL_ANSWERS[`${paperId}#${module}#${it.item_no}`] || {};
      return {
        key: null,
        task_guidance: p.guidance || null,          // leitpunkte printed on the task itself, if any
        author_criteria: p.expected || null,        // what the item author said a good answer does
        guidance: m.guidance || null,               // points a strong B2 answer covers
        expected_answer: m.expected_answer || null, // one B2 model answer
        expected_answer_status: m.review_status || null,
        note: "Open answer — no single correct text. Scored against the rubric; expected_answer is one good example, not the only right one.",
      };
    }
  }
}

async function paperDoc(paper, audioById, scripts = {}) {
  const sections = await q(
    `SELECT * FROM b2_paper_sections WHERE paper_id=$1 ORDER BY part_no, id`, [paper.id]);
  const out = [];
  for (const s of sections) {
    const items = await q(`SELECT * FROM b2_paper_items WHERE section_id=$1 ORDER BY item_no`, [s.id]);
    const audio = s.audio_asset_id ? audioById[s.audio_asset_id] : null;
    out.push({
      part_no: s.part_no, module: s.module, skill: s.skill, title: s.title,
      instruction: s.instruction, minutes: s.minutes, scoring_mode: s.scoring_mode,
      passage: s.passage || null,
      audio: audio ? { file: audio.path, duration_seconds: audio.duration_seconds, voices: audio.voice_set }
           : (s.audio_url ? { file: s.audio_url } : null),
      listening_script: scripts[s.module] || null,
      items: items.map(it => ({
        item_no: it.item_no, item_type: it.item_type, skill: it.skill,
        capability: it.capability, difficulty: it.difficulty,
        scoring_mode: it.scoring_mode, points: it.points,
        stem: it.stem,
        options: (it.options && it.options.length) ? it.options : (it.payload?.options || null),
        payload: it.payload || null,
        suggested_answer: suggestedAnswer(it, paper.id, s.module),
        explanation: it.rationale || null,
      })),
    });
  }
  return {
    id: paper.id, board: paper.board, title: paper.title, minutes: paper.minutes,
    source: paper.source, review_status: paper.review_status, difficulty: paper.difficulty,
    item_count: out.reduce((n, s) => n + s.items.length, 0),
    sections: out,
  };
}

(async () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  const audio = await q(`SELECT * FROM b2_audio_assets ORDER BY id`);
  const audioById = Object.fromEntries(audio.map(a => [a.id, a]));
  const papers = await q(`SELECT * FROM b2_papers ORDER BY id`);
  const counts = {};
  const bump = (k) => (counts[k] = (counts[k] || 0) + 1);

  /* 1 — placement tests (the 15-minute diagnostic, 10 comparable versions).
     Dialogue scripts come from the seed files: the DB stores the audio, not
     the text that was synthesised. */
  for (const p of papers.filter(p => p.id.startsWith("core-2026b"))) {
    let scripts = {};
    try {
      const n = p.id.split("-v")[1];
      const seed = require(`../src/seed/b2/core2026b/v${n}.js`)[`V${n}`];
      scripts.hoeren = seed.listening.turns.map(t => ({ speaker: t.speaker, text: t.text }));
    } catch { /* no seed file — script omitted */ }
    write(`1-placement-test/${p.id}.json`, await paperDoc(p, audioById, scripts));
    bump("1-placement-test");
  }
  try {
    write("1-placement-test/_blueprint.json", require("../src/seed/b2/core2026b/blueprint").BLUEPRINT);
  } catch { /* optional */ }

  /* 2 — practice papers, by Home tile then by board. 3 — full exam papers. */
  for (const p of papers) {
    if (p.id.startsWith("core-2026b")) continue;
    if (p.id.includes("-complete-")) {
      write(`3-full-exam-papers/${BOARD_FOLDER[p.board] || p.board}/${slug(p.id)}.json`, await paperDoc(p, audioById));
      bump("3-full-exam-papers");
      continue;
    }
    if (p.id.startsWith("gx_")) {
      write(`9-reference/legacy-exam-engine/${slug(p.id)}.json`, await paperDoc(p, audioById));
      bump("9-reference/legacy-exam-engine");
      continue;
    }
    const [sec] = await q(`SELECT skill, module FROM b2_paper_sections WHERE paper_id=$1 ORDER BY part_no LIMIT 1`, [p.id]);
    const tile = TILE_FOR_SKILL[sec?.skill] || (sec?.module === "hoeren" ? "listening" : "reading");
    write(`2-practice/${tile}/${BOARD_FOLDER[p.board] || p.board}/${slug(p.id)}.json`, await paperDoc(p, audioById));
    bump(`2-practice/${tile}`);
  }

  /* 4 — guided lessons ("Themen"). */
  for (const t of await q(`SELECT * FROM topics WHERE level='b2' ORDER BY order_index`)) {
    write(`4-lessons/${slug(t.id)}.json`, t);
    bump("4-lessons");
  }

  /* 5 — learning experiences (the step sequences lessons are built from). */
  for (const e of await q(`SELECT * FROM b2_experiences ORDER BY ord NULLS LAST, id`)) {
    write(`5-learning-experiences/${slug(e.id)}.json`, e);
    bump("5-learning-experiences");
  }

  /* 6 — listening/reading sources (scripts, transcripts, audio). */
  for (const s of await q(`SELECT * FROM b2_sources ORDER BY id`)) {
    write(`6-sources/${slug(s.id)}.json`, s);
    bump("6-sources");
  }

  /* 7 — writing tasks and the rubrics they are scored against. */
  for (const r of await q(`SELECT * FROM b2_rubrics ORDER BY id`)) {
    write(`7-writing-tasks-and-rubrics/rubrics/${slug(r.board + "-" + r.task_type + "-v" + r.version)}.json`, r);
    bump("7-rubrics");
  }
  for (const t of await q(`SELECT * FROM b2_tasks ORDER BY id`)) {
    write(`7-writing-tasks-and-rubrics/tasks/${slug(t.id)}.json`, t);
    bump("7-tasks");
  }

  /* 8 — interview practice (in-code bank, not DB). */
  const iv = require("../src/b2/interview");
  for (const qu of iv.QUESTIONS) {
    write(`8-interview-practice/${slug(qu.id)}.json`,
      { ...qu, model_answer: iv.MODEL_ANSWERS?.[qu.id] || null });
    bump("8-interview-practice");
  }
  write("8-interview-practice/_categories.json", iv.CATEGORIES);

  /* 9 — reference: the capability spine and the audio registry. */
  write("9-reference/capabilities.json", require("../src/b2/capabilities").CAPABILITIES);
  write("9-reference/audio-assets.json", audio);

  /* README for whoever picks this up, and a data-only SQL dump of the content
     tables so the content loads without the seed scripts (two of which read
     source JSON from outside this repo). */
  fs.copyFileSync(path.join(__dirname, "content_README.md"), path.join(OUT, "README.md"));
  written.push("README.md");
  const { execFileSync } = require("child_process");
  const dbUrl = process.env.DATABASE_URL || "postgresql://localhost/learn_german";
  const tables = ["topics", "b2_audio_assets", "b2_rubrics", "b2_tasks", "b2_sources", "b2_experiences",
                  "b2_papers", "b2_paper_sections", "b2_paper_items"];
  try {
    const sql = execFileSync("pg_dump", ["--data-only", "--no-owner", "--no-privileges",
      ...tables.flatMap(t => ["-t", t]), dbUrl], { maxBuffer: 1 << 28 }).toString();
    fs.mkdirSync(path.join(OUT, "_database"), { recursive: true });
    fs.writeFileSync(path.join(OUT, "_database", "b2_content_data.sql"), sql);
    written.push("_database/b2_content_data.sql");
    // Full schema (every table, view, index — no data), so a fresh database
    // is one psql call instead of replaying 32 migrations in the right order.
    const schema = execFileSync("pg_dump", ["--schema-only", "--no-owner", "--no-privileges", dbUrl],
      { maxBuffer: 1 << 28 }).toString();
    fs.writeFileSync(path.join(OUT, "_database", "schema.sql"), schema);
    written.push("_database/schema.sql");
  } catch (e) { console.warn("pg_dump skipped:", e.message); }

  write("manifest.json", {
    generated_at: new Date().toISOString(),
    generated_by: "app/server/tools/export_content_tree.js",
    counts,
    files: written.slice().sort(),
  });

  console.log(`Wrote ${written.length} files to ${path.relative(process.cwd(), OUT)}`);
  console.table(counts);
  await pool.end();
})().catch(e => { console.error(e); process.exit(1); });
