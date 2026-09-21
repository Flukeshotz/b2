/**
 * THE ASSESSMENT BLUEPRINT — version-independent.
 *
 * One explicit contract that every assessment version must satisfy. It is data,
 * not logic, and it lives here rather than inside a selector so that "is V3
 * comparable to V1?" is a question anyone can answer by reading a file.
 *
 * IT WAS DERIVED FROM V1, NOT IMPOSED ON IT. `screen_v1` already had a shape —
 * eight grammar items on five check_ids, six vocabulary items, a passage with
 * main-idea/detail/inference, two single-play listening items, one short written
 * response. This file writes that shape down so V2 and V3 can be built to it.
 * V1 itself is unmodified; see ./index.js for how it is annotated rather than
 * rewritten.
 *
 * WHAT "COMPARABLE" MEANS HERE, and what it does not.
 * Two versions are comparable when they carry the same SLOTS: same count, same
 * skill split, same capability split, same check_id split, same formats, same
 * response burden. That is a STRUCTURAL claim and it is the only one we are
 * entitled to make. It is deliberately NOT a claim that the two versions are of
 * precisely equal difficulty — that needs item statistics from real learners,
 * which do not exist. The product must say "comparable assessment structure"
 * and never "equivalent difficulty".
 *
 * THE COMPARABLE CORE is the 19 objective items plus the written response.
 * Speaking sits outside it on purpose — see SPEAKING below.
 */

/* ── TIME ────────────────────────────────────────────────────────────────────
   V1 declares 11 minutes of work. The founder's target is "about 15", and the
   gap is exactly where speaking goes. Budgets are the learner's time on task,
   not including instructions. */
const TIME = {
  targetMinutes: 15,
  toleranceMinutes: 2,
  sections: {
    grammar: 2, vocabulary: 1.5, reading: 2.5, listening: 2, writing: 3.5, speaking: 2,
  },
  get comparableCoreMinutes() {
    const s = this.sections;
    return s.grammar + s.vocabulary + s.reading + s.listening + s.writing; // 11.5
  },
};

/* ── SLOTS ───────────────────────────────────────────────────────────────────
   The unit of comparability. A slot is "one grammar item testing connector_range
   in service of conceding", and every version fills every slot with a DIFFERENT
   item. Slot ids are stable across versions; item ids are not.

   `check_id` is the load-bearing field. It is what makes the screening, the
   writing analyser and the recommendation engine one system: a weakness found
   by a screening item routes to the same practice a real piece of writing would
   route to. An item without a check_id can diagnose a skill but cannot route. */
const SLOTS = [
  // Grammar — "Welcher Satz passt besser?" Two options, one is B2-appropriate.
  { slot: "G1", skill: "grammar", check_id: "connector_range",    capability: "concede",        format: "mc2" },
  { slot: "G2", skill: "grammar", check_id: "konjunktiv2",        capability: "speculate",      format: "mc2" },
  { slot: "G3", skill: "grammar", check_id: "genitiv_praep",      capability: "adapt_register", format: "mc2" },
  { slot: "G4", skill: "grammar", check_id: "connector_range",    capability: "justify",        format: "mc2" },
  { slot: "G5", skill: "grammar", check_id: "register",           capability: "adapt_register", format: "mc2" },
  { slot: "G6", skill: "grammar", check_id: "sentence_complexity", capability: "argue",         format: "mc2" },
  { slot: "G7", skill: "grammar", check_id: "connector_range",    capability: "compare",        format: "mc2" },
  { slot: "G8", skill: "grammar", check_id: "konjunktiv2",        capability: "speculate",      format: "mc2" },

  // Vocabulary — "Welches Wort fehlt?" Three options, gap in a sentence.
  { slot: "V1", skill: "vocabulary", check_id: "nvv",             capability: "argue",          format: "gap3" },
  { slot: "V2", skill: "vocabulary", check_id: "nvv",             capability: "argue",          format: "gap3" },
  { slot: "V3", skill: "vocabulary", check_id: "lexical_range",   capability: "argue",          format: "gap3" },
  { slot: "V4", skill: "vocabulary", check_id: "lexical_range",   capability: "argue",          format: "gap3" },
  { slot: "V5", skill: "vocabulary", check_id: "connector_range", capability: "concede",        format: "gap3" },
  { slot: "V6", skill: "vocabulary", check_id: "register",        capability: "adapt_register", format: "gap3" },

  // Reading — one passage, three items, escalating from stated to implied.
  { slot: "R1", skill: "reading", check_id: null, capability: "structure", format: "mc3", kind: "main_idea" },
  { slot: "R2", skill: "reading", check_id: null, capability: "structure", format: "mc3", kind: "detail" },
  { slot: "R3", skill: "reading", check_id: null, capability: "structure", format: "mc3", kind: "inference" },

  // Listening — one passage, heard ONCE.
  { slot: "L1", skill: "listening", check_id: null, capability: "understand_speech", format: "mc3", kind: "detail" },
  { slot: "L2", skill: "listening", check_id: null, capability: "understand_speech", format: "mc3", kind: "attitude" },

  // Writing — free production, marked by the existing analyser.
  { slot: "W1", skill: "writing", check_id: null, capability: "argue", format: "free_text" },
];

/* Speaking is a slot, but NOT part of the comparable core. Three reasons, all
   of them existing facts rather than choices made here:

   1. profile.js refuses to band speaking at any evidence level, because the
      pipeline is uncalibrated. Evidence from it steers recommendations and may
      never state a level.
   2. There is no capability scoring for a spoken transcript. The writing
      analyser's genres are written genres, and adding a spoken profile means
      changing writing analysis — out of scope for this phase and a real
      calibration question, not a config change.
   3. Its evidence therefore cannot enter a comparable score, so including it in
      the core would let a version look comparable on a number that speaking
      never contributed to.

   It is still captured in every version, because a transcript with fluency and
   pronunciation data is useful to a human reader and is the raw material the
   scoring work will need. It simply does not count toward the delta. */
const SPEAKING_SLOT = {
  slot: "S1", skill: "speaking", check_id: null, capability: "argue",
  format: "spoken_response", comparable: false, banded: false,
};

/* ── WEIGHTING ───────────────────────────────────────────────────────────────
   Derived from SLOTS, never typed by hand — a hand-typed weighting is a second
   source of truth that silently stops matching the items. */
const countBy = (key, slots = SLOTS) => slots.reduce((a, s) => {
  const k = s[key];
  if (k == null) return a;
  a[k] = (a[k] || 0) + 1;
  return a;
}, {});

/* ── THE BOOKS ARE A REFERENCE, NOT THE ARCHITECTURE ─────────────────────────
   Three B2 course books (Kontext B2; Aspekte neu B2 Lehrbuch; Aspekte neu B2
   Arbeitsbuch) were audited as a pedagogical reference layer — see
   B2_BOOK_SOURCE_AUDIT.md. This note is here rather than only in that document
   because the temptation to drift acts on THIS file.

   SKILLCASE IS NOT A CHAPTER-BASED COURSE. There is no Kapitel 1 → Kapitel 2
   progression, no sequential unlock, and finishing book material is never a
   prerequisite for anything. The loop is: assess → diagnose → target →
   practise → retest → compare. A chapter ladder is a different product and
   would quietly replace this one.

   GRAMMAR AND VOCABULARY ARE REMEDIATION, NOT A TRACK. They are how a
   demonstrated weakness gets fixed. Both books attach grammar to a
   communicative function and give it 2 of 4 modules; neither treats it as a
   destination. `language` was deliberately removed as a top-level area and
   must not return because a book has grammar chapters.

   NOTHING IS COPIED. All three books are in copyright. Their Redemittel
   appendices are the most useful and most copyable thing in them, and are used
   ONLY as a checklist of which communicative functions a B2 learner must
   perform. No phrase list, reading text, transcript, exercise or answer key is
   imported verbatim, and no affiliation with or alignment to either series may
   be claimed.

   The audit found real gaps — summarise, ask_followup, propose, productive
   structure, Passiv, indirekte Rede. They are FUTURE CANDIDATES for a new
   comparable group, recorded in B2_BOOK_INTEGRATION_PLAN.md. None of them may
   be bolted onto the group below. */

const BLUEPRINT = {
  id: "b2_assessment_blueprint",
  version: 1,

  /* ── COMPARABLE GROUP ──────────────────────────────────────────────────────
     THE LOAD-BEARING FIELD FOR EVERY IMPROVEMENT CLAIM WE MAKE.

     A delta between two assessments is only meaningful when both were built to
     the same instrument. Until now that was inferred — assessment_progress.js
     compared slot, skill and capability tallies and refused when they differed.
     That works, but it is emergent, and it left the door open for someone to
     "just adjust" a weight here and silently invalidate every stored delta.

     So the group is NAMED. `core-2026a` is V1/V2/V3 and it is FROZEN: its
     weighting, its slots and its item composition do not change again. A
     rebalanced blueprint — and the book audit argues for one, since 74% of this
     core is grammar and vocabulary recognition — becomes `core-2026b`, a
     separate group, running alongside. Attempts in different groups are never
     compared; they are reported as incomparable, with a reason.

     Changing `comparableGroup` while leaving the slots alone would be worse
     than useless: it would orphan the existing attempts. Changing the slots
     while leaving the group alone would be worse still: it would compare two
     different tests and call the difference improvement. */
  comparableGroup: "core-2026a",
  comparableGroupFrozen: true,
  time: TIME,
  slots: SLOTS,
  speakingSlot: SPEAKING_SLOT,

  get comparableItemCount() { return SLOTS.length; },              // 20 (19 objective + 1 written)
  get objectiveItemCount() { return SLOTS.filter(s => s.format !== "free_text").length; }, // 19
  get skillWeighting() { return countBy("skill"); },
  get capabilityWeighting() { return countBy("capability"); },
  get checkWeighting() { return countBy("check_id"); },
  get formatWeighting() { return countBy("format"); },

  /* ── DIFFICULTY EXPECTATIONS ───────────────────────────────────────────────
     Stated as the FEATURES that make an item B2 rather than a number, using the
     taxonomy already in b2/capabilities.js (DIFFICULTY.content / .delivery).
     A number here would be a difficulty estimate we have no data for. */
  difficulty: {
    tier: "developing",     // from capabilities.CEFR_TIERS — the screening's job
                            // is to place, so it aims at the middle of B2, not
                            // at the exam ceiling.
    grammar:    { note: "Both options are grammatical. The wrong one is wrong for the SITUATION — register, directness or cohesion — never a broken sentence. A learner who can only spot errors cannot pass these." },
    vocabulary: { note: "Distractors are real German words that collocate wrongly, not nonsense. 'unter Druck haben' must look plausible." },
    reading:    { content: ["competing_viewpoints", "implicit_cohesion", "inference_required"],
                  note: "One 110–130 word text carrying a position the author partly argues against. The inference item must not be answerable by keyword match." },
    listening:  { delivery: ["authentic_speed", "single_play", "self_interruption"],
                  content: ["inference_required"],
                  note: "40–60 seconds, heard once. The decisive information is a correction, a hedge or a change of mind — not a keyword." },
    writing:    { note: "60-word floor. Enough for the analyser's detectors to fire, short enough to finish on a phone." },
    speaking:   { note: "60–90 seconds. One prompt that forces a position AND a concession, so the language is B2 by task design rather than by instruction." },
  },

  /* ── SKIP BEHAVIOUR ────────────────────────────────────────────────────────
     Already correct in the current implementation and written down here so a
     future version cannot quietly change it. An unanswered item produces NO
     evidence row, so it cannot depress a band and cannot create a weakness.
     Skipped is "not measured yet", never "wrong". There is no negative marking
     anywhere in this product. */
  skip: {
    allowed: true,
    scoredAsWrong: false,
    producesEvidence: false,
    learnerLabel: "Not measured yet",
    // Below this many answered objective items the version has not been
    // meaningfully sat and must not produce a comparable result. Matches
    // profile.js's `reliable` floor of 6 items so the two cannot disagree.
    minMeasuredForComparableResult: 6,
  },

  /* ── WRITING TREATMENT ─────────────────────────────────────────────────────
     Kept in. The prompt already exists, already runs through the same
     assessForTask engine as real submissions, and already fails safe: under the
     floor it records `skipped: true` with a reason instead of banding on forty
     words. The mobile objection is a completion-rate risk, not a validity one,
     and the floor already handles the failure mode. */
  writing: {
    minWords: 60, targetWords: 90, budgetMinutes: 3.5,
    floorBehaviour: "Under minWords: no writing evidence recorded, reason shown. Not a fail.",
    engine: "task_profiles.assessForTask with the free_response profile",
  },

  /* ── SPEAKING TREATMENT ────────────────────────────────────────────────────
     See SPEAKING_SLOT. Capture works today via POST /api/b2/speaking — a
     stateless one-shot endpoint that returns transcript, pronunciation, fluency
     and weak words. Maya is deliberately NOT used: it is a 6–8 minute multi-turn
     FSM designed as practice, its four scenarios ARE practice content, and
     dropping it into a 15-minute assessment would both blow the budget and
     reintroduce the practice overlap this phase exists to remove. */
  speaking: {
    budgetMinutes: 2, minSeconds: 60, maxSeconds: 90,
    capture: "POST /api/b2/speaking (existing, stateless)",
    scoring: "NOT IMPLEMENTED — transcript and fluency captured, capability scoring deferred",
    banded: false,
    reason: "profile.js refuses to band speaking at any evidence level; the pipeline is uncalibrated.",
  },

  /* ── TARGETED vs BROAD, for the future retest selector ─────────────────────
     Config, not a product rule, and deliberately not implemented in this phase.
     Recorded here so the item pool can be checked against it: a retest that is
     65% targeted at one capability needs enough unused items carrying that
     capability to fill those slots without repeating. */
  retestMix: { targeted: 0.65, broad: 0.35, tolerance: 0.05, minBroadSlots: 6 },

  /* What the product may never say, at any point, on this evidence. */
  forbiddenClaims: [
    "Goethe score", "telc score", "probability of passing",
    "exact CEFR level", "statistical equivalence between versions",
    "equivalent difficulty",
  ],
  permittedClaim: "Comparable assessment structure",
};

module.exports = { BLUEPRINT, SLOTS, SPEAKING_SLOT, TIME };
