/**
 * THE PRODUCTION CONTENT MODEL — item types, scoring modes, and what makes a
 * piece of content fit to serve a learner.
 *
 * Pure. No database, no HTTP. Migration 010 enforces what a CHECK constraint
 * can: controlled vocabularies, and the structural rules that do not need to
 * look inside JSON. This module enforces what it cannot — the SHAPE of a
 * MATCHING payload, whether an MCQ has exactly one key, whether a GAP_FILL
 * declares how it is marked.
 *
 * THE DIVISION OF LABOUR IS DELIBERATE. A constraint you can only express in
 * application code is a constraint someone will eventually bypass with a direct
 * INSERT, so anything expressible in SQL lives in SQL. What remains here is
 * JSON-shaped and genuinely cannot.
 *
 * TWO RULES RUN THROUGH EVERYTHING:
 *   1. Never manufacture an answer key for a productive task. A LONG_TEXT with
 *      a "correct" answer is not a bug, it is the product lying.
 *   2. Skipped is not wrong. Nothing here may turn an absent answer into a
 *      negative mark; that distinction is the assessment's whole basis.
 */

/* ── CONTROLLED VOCABULARIES ────────────────────────────────────────────────
   Kept in step with migration 010's CHECK constraints by test, not by hope —
   b2_content_model.test.js asserts these arrays against the live schema. */

const ITEM_TYPES = [
  "MCQ", "MULTI_SELECT", "TRUE_FALSE", "MATCHING", "GAP_FILL", "ORDERING",
  "SHORT_TEXT", "LONG_TEXT", "SPOKEN_RESPONSE", "OPEN_RESPONSE",
];

const SCORING_MODES = ["OBJECTIVE", "RUBRIC", "TRANSCRIPT_ONLY", "UNSCORED"];

const SOURCE_TYPES = ["DIRECT_LICENSED", "ADAPTED", "INSPIRED", "ORIGINAL"];

const ADAPTATION_STATUS = [
  "NOT_APPLICABLE", "DRAFT", "ADAPTATION_REQUIRED", "ADAPTED",
  "READY_FOR_REVIEW", "APPROVED",
];

const REVIEW_STATUS = [
  "DRAFT", "AUTO_QA_PASS", "SME_REVIEWED", "SME_CHANGES_REQUIRED", "PRODUCTION",
];

/* A = lower difficulty within the B2 target · B = standard B2 · C = higher.
   INTERNAL CONTENT DIFFICULTY. Not a CEFR sub-band, not a Goethe or telc score,
   and not shown to learners. */
const DIFFICULTY = ["A", "B", "C"];

/* Items whose answer is a judgement, never a key. The database refuses a key on
   these; this list is why. */
const PRODUCTIVE_TYPES = ["SHORT_TEXT", "LONG_TEXT", "SPOKEN_RESPONSE", "OPEN_RESPONSE"];

const isProductive = (t) => PRODUCTIVE_TYPES.includes(t);

/* ── ITEM SHAPES ────────────────────────────────────────────────────────────
   One validator per type. Each returns an array of problems; empty means valid.
   `item` is the row shape: { item_type, stem, options, answer, payload,
   answer_payload, scoring_mode, points }.

   MCQ deliberately reads the LEGACY columns (`options`, `answer`) rather than
   payload, because ten rows already exist in that shape and the exam seeder
   writes it. Every other type carries its shape in `payload`. */
const SHAPES = {
  MCQ(item) {
    const p = [];
    const opts = item.options;
    if (!Array.isArray(opts) || opts.length < 2) p.push("MCQ needs at least 2 options");
    if (!Number.isInteger(item.answer)) p.push("MCQ needs an integer answer index");
    else if (Array.isArray(opts) && (item.answer < 0 || item.answer >= opts.length)) {
      p.push(`MCQ answer ${item.answer} is outside its ${opts.length} options`);
    }
    if (Array.isArray(opts) && new Set(opts.map(norm)).size !== opts.length) {
      p.push("MCQ repeats an option");
    }
    return p;
  },

  MULTI_SELECT(item) {
    const p = [];
    const opts = item.payload?.options;
    const keys = item.answer_payload?.correct;
    if (!Array.isArray(opts) || opts.length < 3) p.push("MULTI_SELECT needs at least 3 options");
    if (!Array.isArray(keys) || keys.length < 2) {
      // Fewer than two correct answers is an MCQ wearing the wrong label, and
      // it changes how the learner is told to answer.
      p.push("MULTI_SELECT needs at least 2 correct answers — use MCQ for one");
    } else if (Array.isArray(opts)) {
      if (keys.some(k => !Number.isInteger(k) || k < 0 || k >= opts.length)) {
        p.push("MULTI_SELECT key is outside its options");
      }
      if (new Set(keys).size !== keys.length) p.push("MULTI_SELECT repeats a key");
      if (keys.length === opts.length) p.push("MULTI_SELECT marks every option correct");
    }
    return p;
  },

  TRUE_FALSE(item) {
    const a = item.answer_payload?.value;
    return typeof a === "boolean" ? [] : ["TRUE_FALSE needs a boolean answer"];
  },

  MATCHING(item) {
    const p = [];
    const left = item.payload?.left, right = item.payload?.right;
    const map = item.answer_payload?.mapping;
    if (!Array.isArray(left) || !left.length) p.push("MATCHING needs left items");
    if (!Array.isArray(right) || !right.length) p.push("MATCHING needs right items");
    if (!map || typeof map !== "object" || Array.isArray(map)) {
      p.push("MATCHING needs a mapping");
    } else if (Array.isArray(left) && Array.isArray(right)) {
      /* Every left item must be mapped. A partial mapping silently marks the
         unmapped ones wrong, which is the skipped-is-not-wrong rule broken at
         the content layer instead of the scoring one. */
      const unmapped = left.map((_, i) => i).filter(i => !(String(i) in map));
      if (unmapped.length) p.push(`MATCHING leaves ${unmapped.length} left item(s) unmapped`);
      const bad = Object.values(map).filter(v => !Number.isInteger(v) || v < 0 || v >= right.length);
      if (bad.length) p.push("MATCHING maps to a right item that does not exist");
    }
    return p;
  },

  GAP_FILL(item) {
    const p = [];
    const text = item.payload?.text;
    const gaps = item.answer_payload?.gaps;
    if (typeof text !== "string" || !text.includes("___")) {
      p.push("GAP_FILL needs a text containing ___ for each gap");
    }
    if (!Array.isArray(gaps) || !gaps.length) {
      p.push("GAP_FILL needs accepted answers");
    } else {
      if (typeof text === "string") {
        const n = (text.match(/___/g) || []).length;
        if (n !== gaps.length) p.push(`GAP_FILL has ${n} gap(s) but ${gaps.length} answer set(s)`);
      }
      gaps.forEach((g, i) => {
        if (!Array.isArray(g?.accepted) || !g.accepted.length) {
          p.push(`GAP_FILL gap ${i + 1} has no accepted answer`);
        }
      });
    }
    // How it is marked is part of the item, not an assumption: "genau" rejects
    // a near-miss, "ignore_case" does not, and a learner deserves to know which.
    const m = item.payload?.match;
    if (m && !["exact", "ignore_case", "any_of"].includes(m)) {
      p.push(`GAP_FILL has unknown match rule "${m}"`);
    }
    return p;
  },

  ORDERING(item) {
    const p = [];
    const ids = item.payload?.items;
    const order = item.answer_payload?.order;
    if (!Array.isArray(ids) || ids.length < 3) p.push("ORDERING needs at least 3 items");
    if (!Array.isArray(order)) p.push("ORDERING needs an expected order");
    else if (Array.isArray(ids)) {
      if (order.length !== ids.length) p.push("ORDERING order does not cover every item");
      if (new Set(order).size !== order.length) p.push("ORDERING repeats a position");
      if (order.some(i => !Number.isInteger(i) || i < 0 || i >= ids.length)) {
        p.push("ORDERING refers to an item that does not exist");
      }
    }
    return p;
  },

  /* Productive types share one validator. They need a prompt and an honest
     evaluation mode, and they must NOT have a key. */
  SHORT_TEXT: productive, LONG_TEXT: productive,
  OPEN_RESPONSE: productive, SPOKEN_RESPONSE: productive,
};

function productive(item) {
  const p = [];
  const prompt = item.stem || item.payload?.prompt;
  if (!prompt || !String(prompt).trim()) p.push(`${item.item_type} needs a prompt`);
  if (item.answer != null || item.answer_payload != null) {
    p.push(`${item.item_type} must not carry an answer key`);
  }
  if (item.scoring_mode === "OBJECTIVE") {
    p.push(`${item.item_type} cannot be scored OBJECTIVE`);
  }
  if (item.item_type === "SPOKEN_RESPONSE") {
    const s = item.payload?.speak_seconds;
    if (!Number.isFinite(s) || s <= 0) p.push("SPOKEN_RESPONSE needs an expected speaking time");
    if (item.scoring_mode === "RUBRIC" && !item.payload?.rubric_id) {
      // Claiming rubric scoring without naming the rubric is how a band appears
      // from nowhere.
      p.push("SPOKEN_RESPONSE scored by RUBRIC must name the rubric");
    }
  }
  if (["SHORT_TEXT", "LONG_TEXT"].includes(item.item_type)
      && item.scoring_mode === "RUBRIC" && !item.payload?.rubric_id) {
    p.push(`${item.item_type} scored by RUBRIC must name the rubric`);
  }
  return p;
}

const norm = (s) => String(s ?? "").toLowerCase().replace(/\s+/g, " ").trim();

/**
 * Validate one item's type and payload shape.
 * @returns {{ valid: boolean, problems: string[] }}
 */
function validateItem(item = {}) {
  const problems = [];
  const t = item.item_type;

  if (!ITEM_TYPES.includes(t)) return { valid: false, problems: [`unknown item_type "${t}"`] };

  const mode = item.scoring_mode ?? "OBJECTIVE";
  if (!SCORING_MODES.includes(mode)) problems.push(`unknown scoring_mode "${mode}"`);

  /* An objectively scored item must be markable without a human. That is the
     whole meaning of OBJECTIVE, and asserting it for a type that has no key is
     how an unscorable item ends up counted in a score. */
  if (mode === "OBJECTIVE" && isProductive(t)) {
    problems.push(`${t} cannot be scored OBJECTIVE`);
  }
  if (mode === "TRANSCRIPT_ONLY" && t !== "SPOKEN_RESPONSE") {
    problems.push("TRANSCRIPT_ONLY applies only to SPOKEN_RESPONSE");
  }
  if (item.points != null && (!Number.isFinite(item.points) || item.points < 0)) {
    problems.push("points must be a non-negative number");
  }
  // A scored item worth nothing is either a mistake or a hidden freebie.
  if (mode === "OBJECTIVE" && item.points === 0) problems.push("an OBJECTIVE item worth 0 points");
  if (mode === "UNSCORED" && item.points > 0) problems.push("an UNSCORED item carrying points");

  problems.push(...(SHAPES[t] ? SHAPES[t](item) : []));
  return { valid: problems.length === 0, problems };
}

/* ── PROVENANCE ─────────────────────────────────────────────────────────────
   Mirrors the database's provenance_shape CHECK, so a seeder can fail fast with
   a readable message rather than a constraint violation. */
function validateProvenance(row = {}, { required = false } = {}) {
  const problems = [];
  const t = row.source_type;

  if (t == null) {
    if (required) problems.push("source_type is required for production content");
    return { valid: problems.length === 0, problems };
  }
  if (!SOURCE_TYPES.includes(t)) return { valid: false, problems: [`unknown source_type "${t}"`] };

  if (t === "ORIGINAL") {
    // Never fabricate a book reference for content we wrote ourselves.
    if (row.source_book) problems.push("ORIGINAL content must not name a source book");
    if (row.source_page) problems.push("ORIGINAL content must not cite a page");
  } else if (!row.source_book) {
    problems.push(`${t} content must name its source book`);
  }

  if (row.adaptation_status != null && !ADAPTATION_STATUS.includes(row.adaptation_status)) {
    problems.push(`unknown adaptation_status "${row.adaptation_status}"`);
  }
  /* Adapted content must say where in its adaptation it is. "ADAPTED" with no
     status is the state in which an unfinished adaptation quietly ships. */
  if (t === "ADAPTED" && (row.adaptation_status == null || row.adaptation_status === "NOT_APPLICABLE")) {
    problems.push("ADAPTED content needs a real adaptation_status");
  }
  if (t === "ORIGINAL" && row.adaptation_status
      && !["NOT_APPLICABLE", "DRAFT", "APPROVED"].includes(row.adaptation_status)) {
    problems.push("ORIGINAL content cannot be mid-adaptation");
  }
  return { valid: problems.length === 0, problems };
}

/* ── REVIEW LIFECYCLE ───────────────────────────────────────────────────────
   DRAFT → AUTO_QA_PASS → SME_REVIEWED → PRODUCTION, with SME_CHANGES_REQUIRED
   as the one branch back.

   THE RULE THAT MATTERS: SME_REVIEWED means a human read it. It may only be set
   alongside a real review record, and automated QA can never produce it. */
const REVIEW_TRANSITIONS = {
  DRAFT: ["AUTO_QA_PASS"],
  AUTO_QA_PASS: ["SME_REVIEWED", "SME_CHANGES_REQUIRED", "DRAFT"],
  SME_CHANGES_REQUIRED: ["DRAFT", "AUTO_QA_PASS"],
  SME_REVIEWED: ["PRODUCTION", "SME_CHANGES_REQUIRED"],
  PRODUCTION: ["SME_CHANGES_REQUIRED"],
};

function canTransition(from, to, { review = null } = {}) {
  const problems = [];
  if (!REVIEW_STATUS.includes(from)) problems.push(`unknown review_status "${from}"`);
  if (!REVIEW_STATUS.includes(to)) problems.push(`unknown review_status "${to}"`);
  if (problems.length) return { allowed: false, problems };

  if (from === to) return { allowed: true, problems: [] };
  if (!(REVIEW_TRANSITIONS[from] || []).includes(to)) {
    problems.push(`${from} → ${to} is not a valid review transition`);
  }
  if (to === "SME_REVIEWED") {
    if (!review || !review.reviewer || !review.reviewed_at) {
      problems.push("SME_REVIEWED requires a recorded review with a reviewer and a date");
    }
    if (review && review.outcome !== "SME_REVIEWED") {
      problems.push("the review record does not record an approval");
    }
  }
  return { allowed: problems.length === 0, problems };
}

/* ── PRODUCTION READINESS ───────────────────────────────────────────────────
   What must be true before a piece of content may serve a learner.

   Seeding does NOT make content production-ready. A seeder that writes
   review_status='PRODUCTION' without passing here is the failure mode this
   function exists to make impossible.

   `requireSme` defaults to false: the product decision is to launch on
   AUTO_QA_PASS with review status documented and a teacher reviewing against
   the live product. It is a parameter, not a hard-coded assumption, so the bar
   can be raised without editing this logic. */
function validateForProduction(row = {}, { requireSme = false, requireAudio = false } = {}) {
  const problems = [];

  if (!REVIEW_STATUS.includes(row.review_status)) {
    problems.push(`unknown review_status "${row.review_status}"`);
  } else if (row.review_status === "DRAFT" || row.review_status === "SME_CHANGES_REQUIRED") {
    problems.push(`content at ${row.review_status} is not fit to serve`);
  } else if (requireSme && !["SME_REVIEWED", "PRODUCTION"].includes(row.review_status)) {
    problems.push("SME review is required and has not happened");
  }

  if (!DIFFICULTY.includes(row.difficulty)) {
    problems.push(`production content needs a difficulty (A/B/C), got "${row.difficulty}"`);
  }
  if (!row.skill) problems.push("production content needs a skill");

  problems.push(...validateProvenance(row, { required: true }).problems);

  if (row.item_type != null) problems.push(...validateItem(row).problems);

  /* Declared audio must actually point somewhere. A listening item that says it
     needs audio and names no asset is the "not ready yet" state shipped as if
     it were content. */
  if ((row.audio_required || requireAudio) && !row.audio_asset_id) {
    problems.push("audio is required but no audio asset is attached");
  }
  return { ready: problems.length === 0, problems };
}

module.exports = {
  ITEM_TYPES, SCORING_MODES, SOURCE_TYPES, ADAPTATION_STATUS, REVIEW_STATUS,
  DIFFICULTY, PRODUCTIVE_TYPES, REVIEW_TRANSITIONS,
  isProductive, validateItem, validateProvenance, canTransition, validateForProduction,
};
