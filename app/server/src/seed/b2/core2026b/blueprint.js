/**
 * core-2026b — THE PRODUCTION ASSESSMENT BLUEPRINT.
 *
 * A NEW comparable group. `core-2026a` (screen_v1/v2/v3) is frozen, untouched,
 * and still serves every attempt already in the database. Nothing here changes
 * it, and the two groups are never compared — assessment_progress.comparable()
 * refuses across groups before it counts anything.
 *
 * ── WHY THIS EXISTS ─────────────────────────────────────────────────────────
 * core-2026a is 74% grammar and vocabulary recognition: 14 of its 19 objective
 * items are two-option or gap-fill knowledge questions. It answers "does she
 * recognise the right form?" when the product's question is "what is stopping
 * her performing at B2?".
 *
 * This blueprint is 35% knowledge / 65% skill, by construction and by audit —
 * see KNOWLEDGE_TARGET below and tools/audit_b2_core_2026b.js, which computes
 * the real split from the seeded rows rather than trusting this comment.
 *
 * ── WHAT "COMPARABLE" MEANS, AGAIN ──────────────────────────────────────────
 * Same slots, same skill split, same capability split, same check_id split,
 * same item-type split, same timing. It is a STRUCTURAL claim. It is NOT a
 * claim that the three versions are of equal difficulty — that needs item
 * statistics from real learners, which do not exist — and it is never a claim
 * of Goethe, telc or ÖSD equivalence.
 *
 * ── THE DATABASE IS AUTHORITATIVE ───────────────────────────────────────────
 * This file and its version files are SEED CONVENIENCE. At runtime the learner
 * API reads b2_papers → b2_paper_sections → b2_paper_items. Deleting these
 * files does not change what a learner sits; it only removes the ability to
 * re-seed. tools/audit_b2_core_2026b.js queries the database for the same
 * reason.
 */

const GROUP = "core-2026b";

/* ── SLOTS ───────────────────────────────────────────────────────────────────
   23 comparable slots + 1 speaking slot outside the comparable core.

   `band` is the internal knowledge/skill classification, audited afterwards.
   KNOWLEDGE = recognising a form, a connector, a collocation.
   SKILL     = doing something with meaning: interpreting a text, extracting
               information from speech, choosing a response in a situation,
               producing language.

   A contextual-LOOKING multiple choice is not automatically SKILL. K1–K8 below
   all sit in a realistic situation and are still KNOWLEDGE, because what they
   actually test is whether the learner can pick the B2 form. Classifying them
   as SKILL would hit the 65% target on paper and measure nothing new. */
const SLOTS = [
  // ── READING · one ~185-word passage, six items ──────────────────────────
  // Not six local lookups: two require reading the passage as a whole (R1, R6),
  // and R3/R4 turn on what the author is DOING, not on where a word appears.
  { slot: "R1", module: "lesen", skill: "reading", capability: "structure",
    check_id: null, item_type: "MCQ",          band: "SKILL", difficulty: "B" },
  { slot: "R2", module: "lesen", skill: "reading", capability: "structure",
    check_id: null, item_type: "TRUE_FALSE",   band: "SKILL", difficulty: "A" },
  { slot: "R3", module: "lesen", skill: "reading", capability: "concede",
    check_id: null, item_type: "MCQ",          band: "SKILL", difficulty: "C" },
  { slot: "R4", module: "lesen", skill: "reading", capability: "justify",
    check_id: null, item_type: "MCQ",          band: "SKILL", difficulty: "B" },
  { slot: "R5", module: "lesen", skill: "reading", capability: "compare",
    check_id: null, item_type: "MULTI_SELECT", band: "SKILL", difficulty: "C" },
  { slot: "R6", module: "lesen", skill: "reading", capability: "structure",
    check_id: null, item_type: "ORDERING",     band: "SKILL", difficulty: "B" },

  // ── LISTENING · one ~60-second dialogue, heard ONCE, five items ─────────
  // The decisive information is a change of plan (L1) and a stance (L2); L5
  // asks what an utterance is DOING, which is the ask_followup diagnostic.
  { slot: "L1", module: "hoeren", skill: "listening", capability: "understand_speech",
    check_id: null, item_type: "MCQ",         band: "SKILL", difficulty: "B" },
  { slot: "L2", module: "hoeren", skill: "listening", capability: "understand_speech",
    check_id: null, item_type: "MCQ",         band: "SKILL", difficulty: "C" },
  { slot: "L3", module: "hoeren", skill: "listening", capability: "understand_speech",
    check_id: null, item_type: "TRUE_FALSE",  band: "SKILL", difficulty: "B" },
  { slot: "L4", module: "hoeren", skill: "listening", capability: "understand_speech",
    check_id: null, item_type: "MCQ",         band: "SKILL", difficulty: "A" },
  { slot: "L5", module: "hoeren", skill: "listening", capability: "ask_followup",
    check_id: null, item_type: "MATCHING",    band: "SKILL", difficulty: "C" },

  // ── LANGUAGE · eight knowledge items ────────────────────────────────────
  // This is the whole knowledge budget: 8 of 23. In core-2026a it was 14 of 19.
  { slot: "K1", module: "sprachbausteine", skill: "grammar", capability: "concede",
    check_id: "connector_range",     item_type: "MCQ",      band: "KNOWLEDGE", difficulty: "A" },
  { slot: "K2", module: "sprachbausteine", skill: "grammar", capability: "speculate",
    check_id: "konjunktiv2",         item_type: "MCQ",      band: "KNOWLEDGE", difficulty: "B" },
  { slot: "K3", module: "sprachbausteine", skill: "grammar", capability: "adapt_register",
    check_id: "genitiv_praep",       item_type: "MCQ",      band: "KNOWLEDGE", difficulty: "B" },
  { slot: "K4", module: "sprachbausteine", skill: "grammar", capability: "argue",
    check_id: "sentence_complexity", item_type: "MCQ",      band: "KNOWLEDGE", difficulty: "C" },
  { slot: "K5", module: "sprachbausteine", skill: "vocabulary", capability: "argue",
    check_id: "nvv",                 item_type: "GAP_FILL", band: "KNOWLEDGE", difficulty: "B" },
  { slot: "K6", module: "sprachbausteine", skill: "vocabulary", capability: "argue",
    check_id: "lexical_range",       item_type: "GAP_FILL", band: "KNOWLEDGE", difficulty: "C" },
  { slot: "K7", module: "sprachbausteine", skill: "vocabulary", capability: "argue",
    check_id: "nvv",                 item_type: "MATCHING", band: "KNOWLEDGE", difficulty: "A" },
  { slot: "K8", module: "sprachbausteine", skill: "vocabulary", capability: "adapt_register",
    check_id: "register",            item_type: "MCQ",      band: "KNOWLEDGE", difficulty: "A" },

  /* ── ONE INTERACTION ITEM ──────────────────────────────────────────────────
     SKILL, not knowledge: it asks what to DO when interrupted, which is a
     discourse choice rather than a form choice.

     `skill: "grammar"` — meaning the Sprachbausteine section it sits in — and
     NOT "speaking", which is what it was first given. The comparable core
     excludes speaking and writing because those have no objective key, so
     labelling an objectively-scored multiple-choice item "speaking" quietly
     dropped it out of the score: 20 items were answered and only 19 counted.
     The discourse meaning is carried by `capability: maintain_discussion`,
     which is where it belongs; `skill` here names the section, not the mode. */
  { slot: "C1", module: "sprachbausteine", skill: "grammar", capability: "maintain_discussion",
    check_id: "register",            item_type: "MCQ",      band: "SKILL", difficulty: "B" },

  // ── PRODUCTION · three written items, rubric-scored, no answer keys ─────
  { slot: "P1", module: "schreiben", skill: "writing", capability: "summarise",
    check_id: null, item_type: "SHORT_TEXT", band: "SKILL", difficulty: "B" },
  { slot: "P2", module: "schreiben", skill: "writing", capability: "ask_followup",
    check_id: null, item_type: "SHORT_TEXT", band: "SKILL", difficulty: "A" },
  { slot: "W1", module: "schreiben", skill: "writing", capability: "argue",
    check_id: null, item_type: "LONG_TEXT",  band: "SKILL", difficulty: "B" },
];

/* Outside the comparable core, and it must stay outside until speech is
   actually scored. Captured, transcript-only, never banded — see
   B2_CORE_2026B.md, which records this as a launch blocker rather than a
   footnote. */
const SPEAKING_SLOT = {
  slot: "S1", module: "sprechen", skill: "speaking", capability: "argue",
  check_id: null, item_type: "SPOKEN_RESPONSE", band: "SKILL", difficulty: "B",
  comparable: false, banded: false, scoring_mode: "TRANSCRIPT_ONLY",
};

/* ── TIMING ─────────────────────────────────────────────────────────────── */
const MINUTES = {
  lesen: 3, hoeren: 2.5, sprachbausteine: 2.5, schreiben: 5, sprechen: 2,
};
const CORE_MINUTES = MINUTES.lesen + MINUTES.hoeren + MINUTES.sprachbausteine + MINUTES.schreiben;
const TOTAL_MINUTES = CORE_MINUTES + MINUTES.sprechen;   // 15.0

/* Audited, not asserted. tools/audit_b2_core_2026b.js recomputes this from the
   seeded database rows and fails if it drifts. */
const KNOWLEDGE_TARGET = { knowledge: 0.35, skill: 0.65, tolerance: 0.06 };

const countBy = (key, slots = SLOTS) => slots.reduce((a, s) => {
  const k = s[key]; if (k == null) return a;
  a[k] = (a[k] || 0) + 1; return a;
}, {});

const BLUEPRINT = {
  group: GROUP,
  versions: ["core-2026b-v1", "core-2026b-v2", "core-2026b-v3"],
  slots: SLOTS,
  speakingSlot: SPEAKING_SLOT,
  minutes: MINUTES,
  coreMinutes: CORE_MINUTES,
  totalMinutes: TOTAL_MINUTES,
  knowledgeTarget: KNOWLEDGE_TARGET,

  get comparableItemCount() { return SLOTS.length; },              // 23
  get skillWeighting()      { return countBy("skill"); },
  get capabilityWeighting() { return countBy("capability"); },
  get checkWeighting()      { return countBy("check_id"); },
  get itemTypeWeighting()   { return countBy("item_type"); },
  get difficultyWeighting() { return countBy("difficulty"); },
  get bandWeighting()       { return countBy("band"); },

  /* What the product may never say on this evidence. Carried here so the audit
     can grep the seeded rows against it. */
  forbiddenClaims: [
    "Goethe score", "telc score", "ÖSD score", "probability of passing",
    "exact CEFR level", "equivalent difficulty", "calibrated",
  ],
  permittedClaim: "Comparable assessment structure",
};

module.exports = { BLUEPRINT, SLOTS, SPEAKING_SLOT, GROUP };
