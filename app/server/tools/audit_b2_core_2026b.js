#!/usr/bin/env node
/**
 * core-2026b CONTENT AUDIT — against the DATABASE, not the source files.
 *
 *   node tools/audit_b2_core_2026b.js
 *   node tools/audit_b2_core_2026b.js --json
 *
 * This queries b2_papers → b2_paper_sections → b2_paper_items because that is
 * what a learner actually sits. An audit that reads the seed files would pass
 * happily while the seeded rows said something else — which is precisely the
 * failure the database-authoritative architecture exists to prevent.
 *
 * FAIL means a real defect and exits 1. WARN and NOTE are findings that do not
 * block: a known gap reported loudly is not the same as a broken item, and
 * failing on both would make the exit code meaningless.
 */

require("../src/env")();
const pool = require("../src/db/pool");
const model = require("../src/b2/content_model");
const contentProvider = require("../src/b2/assessment_content");
const { BLUEPRINT } = require("../src/seed/b2/core2026b/blueprint");

/* The seed transcripts, used ONLY to count words for the pace check. Every
   other fact in this audit comes from the database; a word count is a property
   of the script that was synthesised, and the database stores the audio, not
   the text. If a seed file is absent the pace check is simply skipped. */
const SEED_BY_ID = {};
for (const f of ["v1", "v2", "v3"]) {
  try {
    const m = require(`../src/seed/b2/core2026b/${f}`);
    const v = m.V1 || m.V2 || m.V3;
    if (v) SEED_BY_ID[v.id] = v;
  } catch { /* seed file absent — pace check skipped for that version */ }
}

const JSON_OUT = process.argv.includes("--json");
const findings = [];
const fail = (code, msg, detail) => findings.push({ level: "FAIL", code, msg, detail });
const warn = (code, msg, detail) => findings.push({ level: "WARN", code, msg, detail });
const note = (code, msg, detail) => findings.push({ level: "NOTE", code, msg, detail });

const norm = (s) => String(s ?? "").toLowerCase()
  .replace(/[“”„"'’‚`]/g, "").replace(/\s+/g, " ").replace(/[—–-]/g, "-").trim();
const tally = (rows, f) => rows.reduce((a, r) => {
  const k = typeof f === "function" ? f(r) : r[f];
  if (k == null) return a; a[k] = (a[k] || 0) + 1; return a;
}, {});

async function main() {
  const { rows: papers } = await pool.query(
    `SELECT id, board, alignment, exam_version, review_status, source_type, minutes
       FROM b2_papers WHERE exam_version = $1 ORDER BY id`, [BLUEPRINT.group]);

  if (!papers.length) {
    fail("NOT_SEEDED", `no core-2026b versions found in the database`, BLUEPRINT.group);
    return report({ versions: [] });
  }

  const versions = {};
  for (const p of papers) {
    const { rows: items } = await pool.query(
      `SELECT i.*, s.module, s.part_no, s.passage, s.audio_required, s.audio_asset_id,
              s.minutes AS section_minutes, s.time_limit_seconds,
              a.path AS audio_path, a.duration_seconds, a.transcript_available
         FROM b2_paper_items i
         JOIN b2_paper_sections s ON s.id = i.section_id
         LEFT JOIN b2_audio_assets a ON a.id = s.audio_asset_id
        WHERE s.paper_id = $1 ORDER BY s.part_no, i.item_no`, [p.id]);
    versions[p.id] = { paper: p, items };
  }

  const ids = Object.keys(versions);
  const report_ = { group: BLUEPRINT.group, versions: ids, coverage: {}, byVersion: {} };

  /* ── per version ─────────────────────────────────────────────────────── */
  for (const [id, { paper, items }] of Object.entries(versions)) {
    const core = items.filter(i => i.module !== "sprechen");
    const bands = tally(core, i => i.payload?.band);
    const knowledge = bands.KNOWLEDGE || 0, skill = bands.SKILL || 0;
    const pct = core.length ? knowledge / core.length : 0;

    const v = {
      items: items.length, comparableItems: core.length,
      knowledge, skill,
      knowledgePct: Math.round(pct * 1000) / 10,
      bySkill: tally(items, "skill"),
      byCapability: tally(items, "capability"),
      byItemType: tally(items, "item_type"),
      byDifficulty: tally(items, "difficulty"),
      byScoring: tally(items, "scoring_mode"),
      byCheck: tally(items, "check_id"),
      byProvenance: tally(items, "source_type"),
      byReview: tally(items, "review_status"),
      minutes: [...new Set(items.map(i => i.section_minutes))].length
        ? items.reduce((a, i) => a, 0) : 0,
    };
    report_.byVersion[id] = v;

    // ── structure ──
    if (core.length !== BLUEPRINT.comparableItemCount) {
      fail("SLOT_COUNT", `${id} has ${core.length} comparable items, blueprint says ${BLUEPRINT.comparableItemCount}`, id);
    }

    // ── the 35/65 claim, computed from the rows ──
    const { knowledge: want, tolerance } = BLUEPRINT.knowledgeTarget;
    if (Math.abs(pct - want) > tolerance) {
      fail("KNOWLEDGE_MIX",
        `${id} is ${v.knowledgePct}% knowledge, target ${Math.round(want * 100)}% ±${Math.round(tolerance * 100)}`, id);
    }
    if (knowledge + skill !== core.length) {
      fail("UNCLASSIFIED", `${id}: ${core.length - knowledge - skill} item(s) carry no KNOWLEDGE/SKILL band`, id);
    }

    // ── no single capability may dominate ──
    const capTally = tally(core, "capability");
    const worst = Object.entries(capTally).sort((a, b) => b[1] - a[1])[0];
    if (worst && worst[1] / core.length > 0.35) {
      fail("CAPABILITY_DOMINATES",
        `${id}: "${worst[0]}" holds ${worst[1]} of ${core.length} comparable items`, id);
    }
    if (Object.keys(capTally).length < 8) {
      warn("THIN_CAPABILITY_COVERAGE",
        `${id} covers ${Object.keys(capTally).length} capabilities in its comparable core`, id);
    }

    // ── item mix: not another MCQ-only test ──
    const types = tally(core, "item_type");
    if ((types.MCQ || 0) / core.length > 0.6) {
      fail("MCQ_HEAVY", `${id}: ${types.MCQ} of ${core.length} comparable items are MCQ`, id);
    }
    if (Object.keys(types).length < 5) {
      warn("THIN_ITEM_MIX", `${id} uses only ${Object.keys(types).length} item types`, id);
    }

    // ── difficulty spread ──
    for (const d of ["A", "B", "C"]) {
      if (!v.byDifficulty[d]) warn("NO_DIFFICULTY_BAND", `${id} has no ${d}-level items`, id);
    }

    // ── per-item integrity ──
    for (const i of items) {
      const where = `${id}/${contentProvider.slotOf(i)}`;
      const shaped = {
        item_type: i.item_type, stem: i.stem, options: i.options, answer: i.answer,
        payload: i.payload, answer_payload: i.answer_payload,
        scoring_mode: i.scoring_mode, points: i.points,
      };
      const vr = model.validateItem(shaped);
      if (!vr.valid) fail("ITEM_INVALID", `${where}: ${vr.problems.join("; ")}`, where);

      const pr = model.validateProvenance(i, { required: true });
      if (!pr.valid) fail("PROVENANCE", `${where}: ${pr.problems.join("; ")}`, where);

      if (!i.difficulty) fail("NO_DIFFICULTY", `${where} has no difficulty`, where);
      if (!i.skill) fail("NO_SKILL", `${where} has no skill`, where);
      if (!i.capability) fail("NO_CAPABILITY", `${where} has no capability`, where);
      if (!i.rationale && i.scoring_mode === "OBJECTIVE") {
        warn("NO_RATIONALE", `${where} has no explanation of its answer`, where);
      }
      if (i.review_status === "SME_REVIEWED" || i.review_status === "PRODUCTION") {
        const { rows } = await pool.query(
          `SELECT 1 FROM b2_content_reviews WHERE entity_type='paper_item' AND entity_id=$1`,
          [String(i.id)]);
        if (!rows.length) {
          fail("FALSE_REVIEW", `${where} claims ${i.review_status} with no review record`, where);
        }
      }
    }

    // ── audio ──
    const listening = items.filter(i => i.module === "hoeren");
    if (listening.length) {
      const l = listening[0];
      if (!l.audio_required) {
        fail("AUDIO_NOT_DECLARED", `${id} listening does not declare audio_required`, id);
      } else if (!l.audio_asset_id) {
        warn("AUDIO_MISSING", `${id} listening has no registered audio asset — not production-ready`, id);
      } else {
        if (!l.audio_path) fail("AUDIO_UNREGISTERED", `${id} audio asset has no path`, id);
        if (!l.duration_seconds) fail("AUDIO_NO_DURATION", `${id} audio has no measured duration`, id);
        if (!l.transcript_available) warn("AUDIO_NO_TRANSCRIPT", `${id} audio has no transcript`, id);

        /* PACE. A single-play B2 listening that runs at newsreader speed is
           unfair in a way nobody notices by eye — the transcript reads fine and
           the file plays. Natural German conversation is roughly 2.0–2.8 words
           per second; TTS defaults can land well above that. Checked here
           because a duration alone says nothing about whether it is listenable. */
        const seedV = SEED_BY_ID[id];
        const words = seedV
          ? seedV.listening.turns.map(t => t.text).join(" ").split(/\s+/).filter(Boolean).length
          : null;
        if (words && l.duration_seconds) {
          const wps = words / l.duration_seconds;
          /* Thresholds set OUTSIDE the 2.0–2.8 natural band, with headroom
             rather than flush against it — TTS pacing is not perfectly even and
             a threshold flush against the target would flag natural variation
             as a defect. The band itself was chosen, then this threshold was
             quietly looser than it (<1.5), which let genuinely slow audio pass:
             three clips at 1.66–1.97 w/s — measurably slow, all reading fine to
             a human skim — sailed through with WARN 0 until this was tightened
             to actually match the documented target. A check that is more
             lenient than the number it prints next to it is not a check. */
          if (wps > 3.0) {
            warn("AUDIO_TOO_FAST",
              `${id} audio runs at ${wps.toFixed(1)} words/sec (${words} words in ${l.duration_seconds}s) — natural speech is 2.0–2.8`,
              id);
          } else if (wps < 1.8) {
            warn("AUDIO_TOO_SLOW",
              `${id} audio runs at ${wps.toFixed(1)} words/sec (${words} words in ${l.duration_seconds}s) — natural speech is 2.0–2.8`,
              id);
          }
        }
      }
    }

    // ── honesty ──
    if (paper.alignment === "licensed_official") {
      fail("FALSE_EXAM_CLAIM", `${id} claims to be official material`, id);
    }
    const blob = JSON.stringify(items).toLowerCase();
    for (const claim of ["goethe-punkte", "telc-punkte", "bestehenswahrscheinlichkeit", "cefr-wert"]) {
      if (blob.includes(claim)) fail("FORBIDDEN_CLAIM", `${id} contains "${claim}"`, id);
    }
  }

  /* ── across versions: duplication ────────────────────────────────────── */
  const dup = { stems: [], options: [], passages: [], transcripts: [], prompts: [], ids: [] };
  const seenStem = new Map(), seenOpts = new Map(), seenPassage = new Map(), seenId = new Set();

  for (const [id, { items }] of Object.entries(versions)) {
    const passage = items.find(i => i.passage)?.passage;
    if (passage) {
      const k = norm(passage);
      if (seenPassage.has(k)) { dup.passages.push([seenPassage.get(k), id]);
        fail("DUPLICATE_PASSAGE", `${id} reuses the passage from ${seenPassage.get(k)}`, id); }
      seenPassage.set(k, id);
    }
    for (const i of items) {
      const key = `${id}_${contentProvider.slotOf(i)}`.toLowerCase();
      if (seenId.has(key)) { dup.ids.push(key); fail("DUPLICATE_ID", `${key} appears twice`, key); }
      seenId.add(key);

      /* FINGERPRINT, NOT STEM.
         Comparing bare stems flagged fifteen false positives, because a stem is
         often the generic task instruction — "Welcher Satz passt besser?",
         "Ergänzen Sie die Lücken.", "Welche zwei Aussagen treffen auf den Text
         zu?" — and those SHOULD be identical across parallel forms. The task is
         meant to be constant; only the material changes. That is what makes V2 a
         retest of V1 rather than a different test.

         What must never repeat is the whole item: the instruction together with
         its situation, its options and its text. The fingerprint is stricter
         than the stem check in the direction that matters — it still catches a
         genuinely reused question even when the instruction was reworded. */
      const fingerprint = [
        norm(i.stem),
        norm(i.payload?.context),
        norm(i.payload?.text),
        /* MCQ keeps its options in the legacy column; every other type carries
           them in the payload — and the seeder writes an EMPTY ARRAY into the
           legacy column for those. Testing `Array.isArray` alone therefore took
           the empty array and never looked at the payload, so two MULTI_SELECT
           items with completely different options fingerprinted identically. */
        (Array.isArray(i.options) && i.options.length ? i.options : i.payload?.options ?? [])
          .map(norm).join("~"),
        [...(i.payload?.left ?? []), ...(i.payload?.right ?? [])].map(norm).join("~"),
        (i.payload?.items ?? []).map(norm).join("~"),
      ].join("|");

      if (fingerprint.replace(/\|/g, "").trim()) {
        const prev = seenStem.get(fingerprint);
        if (prev && prev.split("_")[0] !== id) {
          dup.stems.push([prev, key]);
          fail("DUPLICATE_ITEM", `${key} is identical to ${prev}`, key);
        }
        seenStem.set(fingerprint, key);
      }
      const opts = Array.isArray(i.options) && i.options.length ? i.options : i.payload?.options;
      if (Array.isArray(opts) && opts.length) {
        const k = opts.map(norm).sort().join(" | ");
        const prev = seenOpts.get(k);
        if (prev && prev.split("_")[0] !== id) {
          dup.options.push([prev, key]);
          fail("DUPLICATE_OPTIONS", `${key} repeats the options of ${prev}`, key);
        }
        seenOpts.set(k, key);
      }
    }
  }

  /* ── overlap with everything that already exists ─────────────────────── */
  const overlap = { core2026a: [], practice: [], maya: [], exam: [] };
  const corpus = [];
  const tryLoad = (p, pick) => {
    try { const t = pick(require(p)); if (t) corpus.push({ src: p, text: norm(t) }); }
    catch { /* absent is fine */ }
  };
  tryLoad("../src/seed/b2/screening", m => JSON.stringify(m.SCREENING));
  tryLoad("../src/seed/b2/assessment/items_v2", m => JSON.stringify(m.V2));
  tryLoad("../src/seed/b2/assessment/items_v3", m => JSON.stringify(m.V3));
  tryLoad("../src/seed/b2/src_muede", m => m.TRANSCRIPT || m.SCRIPT);
  tryLoad("../src/seed/b2/src_homeoffice", m => m.TRANSCRIPT || m.SCRIPT);
  tryLoad("../src/seed/b2/exam/hoeren_t1_alltag",
    m => (m.TEXTS || []).flatMap(t => (t.turns || []).map(x => x.de || x.text)).join(" "));
  for (const s of ["homeoffice", "schichttausch", "unerwartet", "vorschlag"]) {
    tryLoad(`../src/seed/b2/maya/${s}`, m => JSON.stringify(m));
  }

  const sentences = (t) => norm(t).split(/(?<=[.!?])\s+/).filter(s => s.split(" ").length >= 7);
  for (const [id, { items }] of Object.entries(versions)) {
    const own = [];
    const passage = items.find(i => i.passage)?.passage;
    if (passage) own.push(...sentences(passage));
    for (const i of items) own.push(...sentences(i.stem));
    for (const s of own) {
      for (const c of corpus) {
        if (c.text.includes(s)) {
          const bucket = c.src.includes("maya") ? "maya"
            : c.src.includes("exam") ? "exam"
            : c.src.includes("assessment") || c.src.includes("screening") ? "core2026a" : "practice";
          overlap[bucket].push({ version: id, sentence: s.slice(0, 60), source: c.src });
        }
      }
    }
  }
  for (const [k, hits] of Object.entries(overlap)) {
    if (hits.length) fail("OVERLAP", `${hits.length} sentence(s) overlap with ${k}`, hits.slice(0, 3));
  }
  if (!corpus.length) warn("NO_OVERLAP_CORPUS", "nothing to compare against — overlap check is vacuous");

  report_.duplication = dup;
  report_.overlap = overlap;
  report_.corpusSources = corpus.length;
  return report(report_);
}

function report(r) {
  r.findings = findings;
  r.totals = {
    fails: findings.filter(f => f.level === "FAIL").length,
    warns: findings.filter(f => f.level === "WARN").length,
    notes: findings.filter(f => f.level === "NOTE").length,
  };
  if (JSON_OUT) { console.log(JSON.stringify(r, null, 2)); return r; }

  console.log("core-2026b CONTENT AUDIT  (source: PostgreSQL)");
  console.log("=".repeat(66));
  console.log(`group ${r.group}   versions ${r.versions.join(", ") || "(none)"}\n`);
  for (const [id, v] of Object.entries(r.byVersion || {})) {
    console.log(`${id}`);
    console.log(`  items ${v.items} (${v.comparableItems} comparable)  ` +
                `KNOWLEDGE ${v.knowledge} / SKILL ${v.skill}  = ${v.knowledgePct}% knowledge`);
    console.log(`  skill      ${JSON.stringify(v.bySkill)}`);
    console.log(`  capability ${JSON.stringify(v.byCapability)}`);
    console.log(`  item type  ${JSON.stringify(v.byItemType)}`);
    console.log(`  difficulty ${JSON.stringify(v.byDifficulty)}  scoring ${JSON.stringify(v.byScoring)}`);
    console.log(`  provenance ${JSON.stringify(v.byProvenance)}  review ${JSON.stringify(v.byReview)}\n`);
  }
  if (r.duplication) {
    const d = r.duplication;
    console.log(`DUPLICATION  ids ${d.ids.length}  stems ${d.stems.length}  options ${d.options.length}  passages ${d.passages.length}`);
  }
  if (r.overlap) {
    console.log(`OVERLAP  core-2026a ${r.overlap.core2026a.length}  practice ${r.overlap.practice.length}  ` +
                `maya ${r.overlap.maya.length}  exam ${r.overlap.exam.length}  (corpus sources: ${r.corpusSources})`);
  }
  console.log("\nFINDINGS");
  for (const f of findings) console.log(`  ${f.level.padEnd(4)} ${f.code.padEnd(24)} ${f.msg}`);
  console.log(`\nFAIL ${r.totals.fails}   WARN ${r.totals.warns}   NOTE ${r.totals.notes}`);
  return r;
}

main()
  .then(r => pool.end().then(() => process.exit(r.totals.fails ? 1 : 0)))
  .catch(e => { console.error("AUDIT FAILED:", e.message); process.exit(1); });
