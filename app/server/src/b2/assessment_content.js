/**
 * ASSESSMENT CONTENT PROVIDER — where an item's text and its key come from.
 *
 * Two groups, two homes, one interface:
 *
 *   core-2026a   the frozen JS registry (src/seed/b2/assessment). Untouched.
 *                It still serves every historical attempt and is not migrated.
 *   core-2026b   the DATABASE. b2_papers → b2_paper_sections → b2_paper_items.
 *                The seed files under src/seed/b2/core2026b are how those rows
 *                were written; they are never read at runtime.
 *
 * This module is the adapter the architecture requires. Without it the store
 * would have to know which group it is serving, and core-2026a would have to be
 * rewritten to match the new model — which the brief forbids and which would
 * risk the one thing that must not break.
 *
 * ── THE KEY NEVER LEAVES THIS MODULE BY ACCIDENT ────────────────────────────
 * `getItem()` returns the full row, keys included, for grading on the server.
 * `safeItem()` is what a learner may see. They are separate functions with
 * different names for the same reason a password hash and a password are not
 * the same field: one of them is not allowed out, and that should be obvious at
 * every call site.
 */

const pool = require("../db/pool");
const registry = require("../seed/b2/assessment");

const DB_GROUP = "core-2026b";

/* Exam-practice papers (Goethe/telc standalone sections and complete papers,
   seeded via seed_exam_papers.js) live in the exact same b2_papers /
   b2_paper_sections / b2_paper_items tables core-2026b does — the polymorphic
   item model and grade() below were never core-2026b-specific, only the
   naming convention gating access to them was. Recognising these prefixes
   here is the one-line change that makes every function below (itemsOf,
   getItem, safeItem, safeVersion, grade) work for them too, with no new
   content-serving code. */
function groupOf(version) {
  if (typeof version === "string" &&
      (version.startsWith("core-2026b") || version.startsWith("goethe-b2-") || version.startsWith("telc-b2-") || version.startsWith("practice-"))) {
    return DB_GROUP;
  }
  return "core-2026a";
}
const isDbBacked = (version) => groupOf(version) === DB_GROUP;

/* ── core-2026b: read from the database ─────────────────────────────────── */

const ITEM_COLUMNS = `
  i.id, i.section_id, i.item_no, i.stem, i.options, i.answer, i.rationale,
  i.item_type, i.payload, i.answer_payload, i.scoring_mode, i.points,
  i.skill, i.capability, i.check_id, i.difficulty,
  i.source_book, i.source_chapter, i.source_module, i.source_page,
  i.source_type, i.review_status,
  s.module, s.part_no, s.title AS section_title, s.instruction, s.passage,
  s.audio_required, s.audio_asset_id, s.time_limit_seconds, s.paper_id`;

/** A stable, human-readable item id: `core-2026b-v1_r1`. */
const itemIdFor = (row) => `${row.paper_id}_${slotOf(row)}`.toLowerCase();

/* The slot is not stored as its own column — b2_paper_items is the generic
   paper model and has no notion of assessment slots. It is recoverable from the
   section module plus the item number, which is how the seeder laid them out,
   and that mapping lives here rather than being duplicated in three callers. */
const SLOT_PREFIX = { lesen: "R", hoeren: "L", sprachbausteine: "K", schreiben: "P", sprechen: "S" };
function slotOf(row) {
  const p = SLOT_PREFIX[row.module] || "X";
  if (row.module === "sprachbausteine") return row.item_no === 9 ? "C1" : `K${row.item_no}`;
  if (row.module === "schreiben") return row.item_no === 3 ? "W1" : `P${row.item_no}`;
  return `${p}${row.item_no}`;
}

async function dbItems(version) {
  const { rows } = await pool.query(
    `SELECT ${ITEM_COLUMNS}
       FROM b2_paper_items i
       JOIN b2_paper_sections s ON s.id = i.section_id
      WHERE s.paper_id = $1
      ORDER BY s.part_no, i.item_no`, [version]);
  return rows.map(r => ({ ...r, item_id: itemIdFor(r), slot: slotOf(r) }));
}

/** Section-level context: the passage, the audio, the instruction. */
async function dbContext(version) {
  const { rows } = await pool.query(
    `SELECT s.module, s.title, s.instruction, s.passage, s.minutes, s.time_limit_seconds,
            s.audio_required, s.audio_asset_id, s.audio_intended_id,
            a.path AS audio_path, a.duration_seconds, a.transcript_available
       FROM b2_paper_sections s
       LEFT JOIN b2_audio_assets a ON a.id = s.audio_asset_id
      WHERE s.paper_id = $1 ORDER BY s.part_no`, [version]);

  const SKILL_OF = { lesen: "reading", hoeren: "listening", sprachbausteine: "grammar",
                     schreiben: "writing", sprechen: "speaking" };
  const out = {};
  for (const r of rows) {
    out[SKILL_OF[r.module] || r.module] = {
      title: r.title, instruction: r.instruction, text: r.passage,
      minutes: r.minutes, timeLimitSeconds: r.time_limit_seconds,
      audioRequired: r.audio_required,
      /* WHICH clip, even when it does not exist yet. `audio_asset_id` is a
         foreign key and is NULL until the file is produced, so on its own it
         cannot answer "what is this section waiting for?". `audio_intended_id`
         holds the name from the moment the section is seeded. `available`
         remains strictly about whether the file is really there. */
      audioFile: r.audio_asset_id ?? r.audio_intended_id,
      audioUrl: r.audio_path,
      durationSeconds: r.duration_seconds,
      /* The honest availability signal. `audio_required` with no registered
         asset means the clip has not been produced — the UI says so and offers
         the skip, rather than rendering a player that plays nothing. */
      available: !!r.audio_path,
      plays: 1,
    };
  }
  return out;
}

/* ── the public interface ───────────────────────────────────────────────── */

/** Every item of a version, keys INCLUDED. Server-side only. */
async function itemsOf(version) {
  if (!isDbBacked(version)) {
    return registry.itemsOf(version).map(i => ({
      item_id: i.id, slot: i.slot, item_type: i.format === "free_text" ? "LONG_TEXT" : "MCQ",
      skill: i.skill, capability: i.capability, check_id: i.check_id,
      difficulty: null, scoring_mode: i.objective ? "OBJECTIVE" : "RUBRIC",
      points: i.objective ? 1 : 0, content: i.content, legacy: true,
    }));
  }
  return dbItems(version);
}

/** One item by its id, keys INCLUDED. Server-side only. */
async function getItem(itemId) {
  const legacy = registry.ITEMS.find(i => i.id === itemId);
  if (legacy) return { item_id: legacy.id, slot: legacy.slot, skill: legacy.skill,
                       capability: legacy.capability, check_id: legacy.check_id,
                       item_type: legacy.objective ? "MCQ" : "LONG_TEXT",
                       scoring_mode: legacy.objective ? "OBJECTIVE" : "RUBRIC",
                       content: legacy.content, legacy: true };

  const { rows } = await pool.query(
    `SELECT ${ITEM_COLUMNS} FROM b2_paper_items i
       JOIN b2_paper_sections s ON s.id = i.section_id
      WHERE lower(s.paper_id || '_' || $2) = lower($1) OR i.id::text = $1
      LIMIT 1`, [itemId, ""]).catch(() => ({ rows: [] }));
  if (rows[0]) return { ...rows[0], item_id: itemIdFor(rows[0]), slot: slotOf(rows[0]) };

  // Fall back to a scan; item ids encode the paper, so this is one query.
  const paper = String(itemId).split("_").slice(0, -1).join("_");
  const all = await dbItems(paper);
  return all.find(i => i.item_id === itemId) || null;
}

/**
 * What a learner may see.
 *
 * STRIPS: `answer`, `answer_payload`, `rationale`, and the `gaps` / `mapping` /
 * `order` / `correct` structures inside a payload. A learner who can read the
 * key out of the payload is not being assessed, and a payload is exactly where
 * a key hides in a polymorphic model — `options` is safe, `answer_payload` is
 * not, and the difference is not obvious by eye.
 */
function safeItem(item) {
  if (!item) return null;
  if (item.legacy) {
    const { answer, why, ...safe } = item.content || {};
    return { itemId: item.item_id, slot: item.slot, skill: item.skill,
             capability: item.capability, itemType: item.item_type, content: safe };
  }

  const p = item.payload ? { ...item.payload } : {};
  // Internal classification — useful to us, meaningless and confusing to her.
  delete p.band;
  delete p.expected;          // the model answer
  delete p.rubric_id;

  return {
    itemId: item.item_id,
    slot: item.slot,
    itemType: item.item_type,
    skill: item.skill,
    module: item.module,
    scoringMode: item.scoring_mode,
    stem: item.stem,
    // MCQ keeps the legacy column; every other type carries its own options.
    options: Array.isArray(item.options) && item.options.length ? item.options : (p.options ?? null),
    payload: p,
    timeLimitSeconds: item.time_limit_seconds ?? null,
  };
}

/** The whole version as a learner sees it. */
async function safeVersion(version) {
  const [items, context] = await Promise.all([itemsOf(version), dbContext(version)]);
  return {
    version,
    group: groupOf(version),
    items: items.map(safeItem),
    context: isDbBacked(version) ? context : {},
  };
}

/** Grade one objective response against the stored key. */
function grade(item, response) {
  if (!item || item.scoring_mode !== "OBJECTIVE") return null;
  const a = item.answer_payload;
  switch (item.item_type) {
    case "MCQ":          return Number(response) === item.answer;
    case "TRUE_FALSE":   return (response === true || response === "true") === a?.value;
    case "MULTI_SELECT": {
      const got = [...new Set((Array.isArray(response) ? response : []).map(Number))].sort();
      const want = [...(a?.correct ?? [])].sort();
      return got.length === want.length && got.every((v, i) => v === want[i]);
    }
    case "MATCHING": {
      const map = a?.mapping ?? {};
      const got = response && typeof response === "object" ? response : {};
      const keys = Object.keys(map);
      return keys.length > 0 && keys.every(k => Number(got[k]) === Number(map[k]));
    }
    case "ORDERING": {
      const want = a?.order ?? [];
      const got = Array.isArray(response) ? response.map(Number) : [];
      return got.length === want.length && got.every((v, i) => v === want[i]);
    }
    case "GAP_FILL": {
      const gaps = a?.gaps ?? [];
      const got = Array.isArray(response) ? response : [];
      if (got.length !== gaps.length) return false;
      const rule = item.payload?.match ?? "exact";
      /* ß DOES NOT ROUND-TRIP THROUGH CASE. "geäußert".toUpperCase() is
         "GEÄUSSERT", which lowercases to "geäussert" — not the original. So a
         learner who types in capitals, or who writes the Swiss spelling
         "geäussert", would be marked wrong for a word she got right.
         Case-insensitive comparison therefore folds ß and ss together. `exact`
         still means exact, for the rare item where the distinction is the
         point. */
      const fold = (s) => s.toLowerCase().replace(/ß/g, "ss").trim();
      return gaps.every((g, i) => {
        const given = String(got[i] ?? "").trim();
        return (g.accepted ?? []).some(acc =>
          rule === "exact" ? acc === given : fold(acc) === fold(given));
      });
    }
    default: return null;
  }
}

module.exports = {
  groupOf, isDbBacked, itemsOf, getItem, safeItem, safeVersion, grade,
  slotOf, DB_GROUP,
};
