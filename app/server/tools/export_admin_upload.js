#!/usr/bin/env node
/**
 * ADMIN-UPLOAD EXPORT — every test, practice paper and full exam paper,
 * converted to the JSON shape the B2 admin upload (/b2admin) accepts.
 *
 *   node tools/export_content_tree.js   # first: refreshes app/content/
 *   node tools/export_admin_upload.js   # then:  writes app/content/10-admin-upload/
 *   node tools/export_admin_upload.js --zips   # also builds the media ZIPs (gitignored)
 *
 * Input is the hand-over export in app/content/ (1-placement-test,
 * 2-practice, 3-full-exam-papers). Output follows the b2-samples upload
 * guide exactly — no extra fields — so every file can be uploaded as is:
 *
 *   exercises/<reading|listening|writing|speaking>/<goethe|telc|all>/<id>.json
 *   exam-papers/<goethe|telc>/<id>.json
 *   placement-tests/<id>.json            (exam-paper shape)
 *
 * Type conversion (our item_type → upload type):
 *   MCQ → mcq_single · TRUE_FALSE → true_false · MULTI_SELECT → mcq_multi
 *   MATCHING → one matching_headers item per left-hand entry
 *   GAP_FILL → one fill_blanks item per gap
 *   ORDERING → one mcq_single item per position ("Was steht an Stelle N?")
 *   SHORT_TEXT / LONG_TEXT → writing item · SPOKEN_RESPONSE → speaking item
 * Blocks are split so matching items never share a block with other types,
 * and speaking blocks carry exactly one item (upload guide rules).
 */
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "..", "content");
const OUT = path.join(SRC, "10-admin-upload");
const ZIPS = path.join(__dirname, "..", "..", "content-upload-zips");
const MEDIA_ROOTS = [path.join(__dirname, "..", "public"), path.join(__dirname, "..", "..", "client", "public")];

const L = (i) => String.fromCharCode(65 + i);
const MODULE_FOR_SKILL = { reading: "reading", grammar: "reading", vocabulary: "reading",
  listening: "listening", writing: "writing", speaking: "speaking" };
const TAG = { goethe: "goethe", telc: "telc", custom: "all" };

function difficultyTag(paper) {
  const map = { A: 1, B: 2, C: 3 };
  const ds = paper.sections.flatMap(s => s.items.map(i => map[i.difficulty] || 2));
  const avg = ds.reduce((a, b) => a + b, 0) / (ds.length || 1);
  return avg < 1.67 ? "Easy" : avg > 2.33 ? "Hard" : "Medium";
}

const opts = (it) => it.options || it.payload?.options || [];
const clean = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== null && v !== undefined && v !== ""));

/** One of our items → one or more upload items. */
function convertItem(it, sectionTitle) {
  const p = it.payload || {}, a = it.suggested_answer || {};
  switch (it.item_type) {
    case "MCQ":
      return [{ question: it.stem, options: opts(it), answer: L(a.key), type: "mcq_single" }];
    case "TRUE_FALSE":
      return [{ question: it.stem, options: ["Richtig", "Falsch"], answer: a.key ? "A" : "B", type: "true_false" }];
    case "MULTI_SELECT":
      return [{ question: it.stem, options: opts(it), answer: a.key.map(L), type: "mcq_multi" }];
    case "MATCHING": {
      const type = /anzeige/i.test(sectionTitle || "") ? "matching_ads" : "matching_headers";
      return (p.left || []).map((left, l) => ({
        question: `${it.stem}\n${left}`, options: p.right, answer: L(a.key[l]), type }));
    }
    case "GAP_FILL": {
      const parts = String(p.text).split("___");
      return a.key.map((g, k) => {
        // The gap being asked stays "___"; the others are shown as (1), (2) … so
        // the learner still reads the whole sentence.
        const text = parts.reduce((acc, part, i) =>
          i === 0 ? part : acc + (i - 1 === k ? "___" : `(${i})`) + part, "");
        const accepted = [...new Set(g.accepted.flatMap(w => [w, w[0].toUpperCase() + w.slice(1), w[0].toLowerCase() + w.slice(1)]))];
        return { question: a.key.length > 1 ? `Lücke ${k + 1}: ${text}` : text, answer: accepted, type: "fill_blanks" };
      });
    }
    case "ORDERING":
      return a.key.map((correctIdx, pos) => ({
        question: `${it.stem}\nWas steht an Stelle ${pos + 1}?`, options: p.items, answer: L(correctIdx), type: "mcq_single" }));
    case "SHORT_TEXT":
    case "LONG_TEXT": {
      const lp = p.guidance?.length ? "\n" + p.guidance.map(g => `• ${g}`).join("\n") : "";
      return [clean({ question: it.stem + lp, word_limit: p.target_words || p.min_words || 80,
        expected_answer: a.expected_answer || a.author_criteria })];
    }
    case "SPOKEN_RESPONSE": {
      const model = a.expected_answer || null;
      return [clean({ question: it.stem, speech_time_limit: p.speak_seconds || 90, prompt_type: "text",
        reference_text: model, model_answer: model, expected_answer: model || a.author_criteria })];
    }
    default:
      throw new Error(`unmapped item_type ${it.item_type}`);
  }
}

/** One of our sections → one or more upload blocks. */
const audioSource = {};   // upload filename → path under public/ (files sit in subfolders)
function convertSection(s) {
  if (s.audio?.file) {
    const name = path.basename(s.audio.file);
    if (audioSource[name] && audioSource[name] !== s.audio.file) throw new Error(`audio name clash: ${name}`);
    audioSource[name] = s.audio.file;
  }
  const base = clean({
    title: s.title,
    audio: s.audio?.file ? path.basename(s.audio.file) : null,
    passage: [s.instruction, s.passage].filter(Boolean).join("\n\n"),
  });
  const items = s.items.flatMap(it => convertItem(it, s.title));
  const blocks = [];
  if (s.skill === "speaking") {
    // Speaking UI records one item per block.
    items.forEach((it) => blocks.push({ ...base, prompt_type: "text", items: [it] }));
  } else {
    // Matching items get their own block; everything else can share one.
    for (const it of items) {
      const kind = /^matching_/.test(it.type || "") ? it.type : "std";
      const last = blocks[blocks.length - 1];
      if (last && last._kind === kind) last.items.push(it);
      else blocks.push({ ...base, _kind: kind, items: [it] });
    }
  }
  return blocks.map(({ _kind, ...b }) => b);
}

const numbered = (blocks) => blocks.map((b, i) => ({ order: i + 1, ...b }));

function withPartLabels(blocks) {
  const byTitle = {};
  blocks.forEach(b => (byTitle[b.title] = (byTitle[b.title] || 0) + 1));
  const seen = {};
  return blocks.map(b => byTitle[b.title] > 1 ? { ...b, title: `${b.title} (${(seen[b.title] = (seen[b.title] || 0) + 1)})` } : b);
}

function toExercise(paper, orderIndex) {
  const s0 = paper.sections[0];
  return {
    module: MODULE_FOR_SKILL[s0.skill],
    tag: TAG[paper.board] || "all",
    title: paper.title,
    description: s0.instruction || s0.title,
    difficulty_tag: difficultyTag(paper),
    order_index: orderIndex,
    blocks: numbered(withPartLabels(paper.sections.flatMap(convertSection))),
  };
}

function toExamPaper(paper, orderIndex, examType) {
  const bySkill = {};
  for (const s of paper.sections) {
    const type = MODULE_FOR_SKILL[s.skill];
    (bySkill[type] ||= { type, duration_minutes: 0, questions: [] });
    bySkill[type].duration_minutes += s.minutes || 0;
    bySkill[type].questions.push(...convertSection(s));
  }
  const blocks = ["reading", "listening", "writing", "speaking"].filter(t => bySkill[t])
    .map(t => ({ ...bySkill[t], questions: numbered(withPartLabels(bySkill[t].questions)) }));
  return {
    exam_type: examType,
    paper: { title: paper.title, proficiency_level: "B2", difficulty_tag: difficultyTag(paper),
      duration_minutes: paper.minutes || blocks.reduce((n, b) => n + b.duration_minutes, 0), order_index: orderIndex },
    blocks,
  };
}

const readDir = (d) => fs.existsSync(d)
  ? fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? readDir(path.join(d, e.name)) : [path.join(d, e.name)])
  : [];
const load = (dir) => readDir(path.join(SRC, dir)).filter(f => f.endsWith(".json") && !path.basename(f).startsWith("_"))
  .map(f => JSON.parse(fs.readFileSync(f, "utf8")))
  .sort((a, b) => a.id.localeCompare(b.id, "en", { numeric: true }));

const written = [], media = {};
function write(rel, doc) {
  const f = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, JSON.stringify(doc, null, 2) + "\n");
  written.push(rel);
  const files = JSON.stringify(doc).match(/"audio":"([^"]+)"/g)?.map(m => m.slice(9, -1)) || [];
  if (files.length) media[rel] = [...new Set(files)];
}

fs.rmSync(OUT, { recursive: true, force: true });
const counts = {};
const bump = (k) => (counts[k] = (counts[k] || 0) + 1);

/* Placement tests. The upload's exam_type is telc|goethe; these are our own
   blueprint, so they carry "skillcase" — the uploader must accept it (or the
   dev maps it to a separate "placement" list). See README. */
load("1-placement-test").forEach((p, i) => { write(`placement-tests/${p.id}.json`, toExamPaper(p, i + 1, "skillcase")); bump("placement-tests"); });

load("3-full-exam-papers").forEach((p, i) => {
  write(`exam-papers/${p.board}/${p.id}.json`, toExamPaper(p, i + 1, p.board)); bump(`exam-papers/${p.board}`);
});

const order = {};
for (const p of load("2-practice")) {
  const ex = toExercise(p, 0);
  const k = `${ex.module}/${ex.tag}`;
  ex.order_index = (order[k] = (order[k] || 0) + 1);
  write(`exercises/${k}/${p.id}.json`, ex);
  bump(`exercises/${k}`);
}

/* Media: which audio files each upload needs in its ZIP. */
const allMedia = [...new Set(Object.values(media).flat())].sort();
const findMedia = (name) => MEDIA_ROOTS.map(r => path.join(r, audioSource[name] || "")).find(f => audioSource[name] && fs.existsSync(f));
const missing = allMedia.filter(n => !findMedia(n));
write("_media-manifest.json", {
  note: "Each JSON below references these audio files by filename. Upload the JSON together with a flat ZIP of exactly these files. source_files gives where each one lives in the repo. `node tools/export_admin_upload.js --zips` builds every ZIP into app/content-upload-zips/.",
  source_files: Object.fromEntries(allMedia.map(n => [n, "app/server/public" + audioSource[n]])),
  files_per_upload: media,
});
fs.copyFileSync(path.join(__dirname, "admin_upload_README.md"), path.join(OUT, "README.md"));

if (process.argv.includes("--zips")) {
  const { execFileSync } = require("child_process");
  fs.rmSync(ZIPS, { recursive: true, force: true });
  for (const [rel, files] of Object.entries(media)) {
    const zip = path.join(ZIPS, rel.replace(/\.json$/, ".zip"));
    fs.mkdirSync(path.dirname(zip), { recursive: true });
    execFileSync("zip", ["-j", "-q", zip, ...files.map(findMedia)]);
  }
  console.log(`ZIPs → ${path.relative(process.cwd(), ZIPS)}`);
}

console.log(`Wrote ${written.length} files to ${path.relative(process.cwd(), OUT)}`);
console.table(counts);
if (missing.length) { console.error("MISSING MEDIA:", missing); process.exit(1); }
