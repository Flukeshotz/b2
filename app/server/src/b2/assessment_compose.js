/**
 * RETEST COMPOSITION — which items a learner gets next, and why.
 *
 * Pure. No database, no pool, no HTTP. Everything it needs is passed in, which
 * is what makes it testable in an environment where Postgres is unreachable and
 * what will make it testable in CI later. The Phase 3B route's only job is to
 * fetch `seenItemIds` and the evidence rows and hand them over.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THE CONFLICT IN THE BRIEF, AND HOW IT IS RESOLVED.
 *
 * Two requirements collide:
 *
 *   "approximately 65% of assessed weight should target the learner's current
 *    weak areas"
 *   "before calculating a delta, verify the two attempts preserve capability
 *    weighting; if they are not comparable, delta = null"
 *
 * They cannot both be satisfied by changing the slot mix. The blueprint fixes
 * capability weighting — argue 6, adapt_register 3, structure 3, concede 2,
 * speculate 2, understand_speech 2, justify 1, compare 1. If a retest is
 * re-weighted to 65% `argue`, it is no longer the same instrument as the
 * assessment it is being compared against, and the delta it produces is a
 * difference between two different tests. That is precisely the misleading
 * green arrow the brief forbids.
 *
 * So targeting operates on WHICH VARIANT FILLS EACH SLOT, never on the slot
 * mix:
 *
 *   1. The blueprint's 20 comparable slots are always all present, in the same
 *      capability proportions. Comparability is structural and is never traded.
 *   2. For every slot, an UNSEEN variant is chosen. Slots whose capability is
 *      in the learner's weak set are filled FIRST, so when the pool is thin the
 *      freshest items go where the measurement matters most.
 *   3. `targetedCoverage` is therefore a MEASURED OUTCOME, not a dial. It is
 *      the share of slots whose capability the learner is weak in.
 *
 * The consequence is worth stating plainly, because it is a content fact rather
 * than a code limitation: a learner weak in {argue, adapt_register,
 * understand_speech} gets 11/20 = 55% targeted coverage automatically. A learner
 * weak only in {justify, compare} gets 2/20 = 10%, and NOTHING in this file can
 * raise it — the blueprint only contains two such slots. Raising it needs more
 * items in those capabilities and a blueprint revision, not a cleverer selector.
 * `coverageShortfall` says so explicitly instead of silently missing the target.
 */

const { BLUEPRINT, itemsFor, variantsPerSlot } = require("../seed/b2/assessment");
const profile = require("./profile");

/* Which evidence states are allowed to call something a weakness. This is the
   existing reliability model, imported rather than re-implemented — a second
   copy of these thresholds is a second source of truth that will disagree.

   `initial` and `none` are excluded, which is what stops one wrong answer from
   becoming "you are weak at argue". */
const WEAKNESS_STATES = ["reliable", "emerging", "screening_signal"];

/* Below this, performance is not a weakness. Matches profile.js's own band
   boundary between `developing` and `good`, so the assessment and the profile
   cannot disagree about who is weak. */
const WEAK_BELOW = 0.62;

/**
 * Build the weak-capability set from raw evidence rows.
 *
 * PURE — `rows` is what `SELECT capability, outcome, weight, source_kind,
 * source_ref, created_at FROM b2_evidence WHERE user_id=$1` returns. Speaking is
 * dropped because profile.js refuses to band it and its evidence is an unbanded
 * signal; letting it steer targeting would give it influence it has not earned.
 *
 * @returns [{ capability, score, items, occasions, formats, state, severity }]
 *          sorted worst first.
 */
function weaknessSet(rows = [], { recentN = 5 } = {}) {
  const byCap = new Map();
  for (const r of rows) {
    if (!r.capability) continue;
    if (r.dimension === "speaking") continue;
    if (!byCap.has(r.capability)) byCap.set(r.capability, []);
    byCap.get(r.capability).push(r);
  }

  const out = [];
  for (const [capability, all] of byCap) {
    // Recency, not lifetime — the same rule profile.js applies per dimension.
    const recent = [...all]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, recentN);

    const w = recent.reduce((a, x) => a + (x.weight ?? 0.6), 0);
    const score = w
      ? recent.reduce((a, x) => a + x.outcome * (x.weight ?? 0.6), 0) / w
      : 0;

    /* SCORE from the recent window, STATE from everything — which is exactly
       how profile.js splits it: `recomputeDimension` averages the last N rows,
       while `getProfile` counts items, occasions and formats over the whole
       evidence table. Truncating both would make `reliable` unreachable, since
       it needs 6 items and the window holds 5.

       An OCCASION is a sitting, not an item: "screen_v1:g3" and "screen_v1:g4"
       are one demonstration. */
    const occasions = new Set(all.map(r =>
      String(r.source_ref || r.source_kind).split(":")[0])).size;
    const formats = new Set(all.map(r => r.source_kind)).size;
    const { state } = profile.evidenceState({ items: all.length, occasions, formats });

    if (!WEAKNESS_STATES.includes(state)) continue;
    if (score >= WEAK_BELOW) continue;

    out.push({
      capability, score, state,
      items: all.length, scoredOver: recent.length, occasions, formats,
      // How far below the boundary, so a group can be ranked without inventing
      // a severity scale.
      severity: Math.round((WEAK_BELOW - score) * 100) / 100,
      lastObserved: recent[0]?.created_at ?? null,
    });
  }
  // Worst first, and among equals the better-evidenced one first.
  return out.sort((a, b) =>
    b.severity - a.severity ||
    WEAKNESS_STATES.indexOf(a.state) - WEAKNESS_STATES.indexOf(b.state));
}

/**
 * Compose the next assessment.
 *
 * @param {string[]} seenItemIds  every assessment item already shown to this
 *                                learner, across all previous attempts.
 * @param {object[]} weaknesses   from weaknessSet(), or [] for a first sitting.
 * @param {string[]} satVersions  versions already completed.
 * @param {object}   config       BLUEPRINT.retestMix by default.
 */
function composeAssessment({
  seenItemIds = [],
  weaknesses = [],
  satVersions = [],
  config = BLUEPRINT.retestMix,
} = {}) {
  const seen = new Set(seenItemIds);
  const mode = satVersions.length ? "retest" : "initial";
  const explanation = [];

  /* A FIRST SITTING IS THE BASELINE, always. There is no weakness data worth
     targeting yet, and a bespoke first assessment would have nothing to be
     compared against later. It is served whole so that "V1" means one fixed
     thing for every learner — which is what makes it a baseline at all. */
  if (mode === "initial") {
    const items = BLUEPRINT.slots.map(s => {
      const [pick] = itemsFor({ slot: s.slot, version: "v1" });
      return pick && { slot: s.slot, itemId: pick.id, version: pick.version,
                       capability: pick.capability, skill: pick.skill, targeted: false };
    }).filter(Boolean);
    explanation.push("First assessment: the V1 baseline, served whole.");
    return {
      mode, items,
      baselineVersion: "v1",
      targetCapabilities: [],
      composition: { targetedSlots: 0, broadSlots: items.length, targetedCoverage: 0 },
      exhausted: [], contentExhausted: false,
      coverageShortfall: null,
      comparableItemCount: items.filter(i => i.skill !== "speaking").length,
      explanation,
    };
  }

  /* ── TARGET SET ────────────────────────────────────────────────────────────
     A GROUP, never the single worst capability. Taking only the worst one would
     concentrate the whole retest on 1–6 slots and leave every other weakness
     unmeasured, so a learner could "improve" on the one thing she practised
     while everything else quietly drifted. */
  const targetCapabilities = weaknesses.map(w => w.capability);
  if (targetCapabilities.length) {
    explanation.push(`Targeting ${targetCapabilities.length} weak ` +
      `capabilit${targetCapabilities.length === 1 ? "y" : "ies"}: ${targetCapabilities.join(", ")}.`);
  } else {
    explanation.push("No capability meets the evidence bar for a weakness; broad coverage only.");
  }
  const isTargeted = (cap) => targetCapabilities.includes(cap);

  /* ── SLOT FILLING ──────────────────────────────────────────────────────────
     Every blueprint slot is filled, in the blueprint's own proportions. Targeted
     slots are filled first so that when variants run short, the shortage lands
     on a capability we are not trying to measure closely. */
  const slots = [...BLUEPRINT.slots, BLUEPRINT.speakingSlot];
  const order = [...slots].sort((a, b) =>
    (isTargeted(b.capability) ? 1 : 0) - (isTargeted(a.capability) ? 1 : 0));

  const items = [];
  const exhausted = [];
  const used = new Set();

  for (const s of order) {
    const variants = itemsFor({ slot: s.slot });
    // Prefer a version she has never sat: a fresh version is fresh context as
    // well as a fresh item.
    const unseen = variants.filter(v => !seen.has(v.id) && !used.has(v.id));
    const unsat = unseen.filter(v => !satVersions.includes(v.version));
    const pick = unsat[0] || unseen[0] || null;

    if (!pick) {
      /* NEVER a repeat dressed as a new test. The slot is reported empty and
         the result carries that fact, because a retest that silently reuses an
         item measures memory and would be scored as if it measured German. */
      exhausted.push({ slot: s.slot, capability: s.capability,
                       reason: "every variant has been seen", variants: variants.map(v => v.id) });
      continue;
    }
    used.add(pick.id);
    items.push({
      slot: s.slot, itemId: pick.id, version: pick.version,
      capability: pick.capability, skill: pick.skill,
      targeted: isTargeted(pick.capability),
      fresh: !satVersions.includes(pick.version),
    });
  }

  items.sort((a, b) => slots.findIndex(s => s.slot === a.slot) - slots.findIndex(s => s.slot === b.slot));

  /* ── COVERAGE, MEASURED NOT FORCED ─────────────────────────────────────── */
  const core = items.filter(i => i.skill !== "speaking");
  const targetedSlots = core.filter(i => i.targeted).length;
  const broadSlots = core.length - targetedSlots;
  const targetedCoverage = core.length ? targetedSlots / core.length : 0;

  const { targeted: want, tolerance, minBroadSlots } = config;
  let coverageShortfall = null;
  if (targetCapabilities.length && targetedCoverage < want - tolerance) {
    /* The honest explanation: the blueprint simply does not contain enough
       slots in these capabilities. Naming the ceiling stops someone reading
       this as a selector bug and "fixing" it by re-weighting the test. */
    const ceiling = BLUEPRINT.slots.filter(s => isTargeted(s.capability)).length;
    coverageShortfall = {
      wanted: want,
      got: Math.round(targetedCoverage * 100) / 100,
      blueprintCeiling: Math.round((ceiling / BLUEPRINT.slots.length) * 100) / 100,
      reason: "The blueprint has only " + ceiling + " slot(s) in the weak capabilities. " +
              "Raising targeted coverage would change the capability weighting and break " +
              "comparability with the previous assessment.",
    };
    explanation.push(`Targeted coverage is ${Math.round(targetedCoverage * 100)}%, below the ` +
      `${Math.round(want * 100)}% strategy. Capability weighting was preserved instead.`);
  }

  /* BROAD COVERAGE IS STRUCTURAL HERE, and the floor only means something if
     slots can go missing.

     Every blueprint slot is always present, so the learner always gets the full
     spread — 8 grammar, 6 vocabulary, 3 reading, 2 listening, 1 written. What
     `broadSlots` counts is how many of those slots fall OUTSIDE her weak set,
     which is a label, not an amount of coverage. A learner weak in six
     capabilities scores 16 targeted / 4 broad and has lost nothing at all.

     Reporting that as "below the floor" read as a coverage failure when there
     was none, so the floor is now only applied when the blueprint is genuinely
     incomplete — which happens when the item pool is exhausted, and is already
     reported separately. */
  const blueprintComplete = core.length === BLUEPRINT.slots.length;
  if (!blueprintComplete && broadSlots < minBroadSlots) {
    explanation.push(`Broad coverage is ${broadSlots} slots, below the floor of ${minBroadSlots}, ` +
      `because ${BLUEPRINT.slots.length - core.length} slot(s) could not be filled.`);
  } else if (blueprintComplete) {
    explanation.push("Full blueprint coverage: every skill and capability in the same proportions as the baseline.");
  }

  /* OVERSHOOT IS NOT A FAULT EITHER. Targeted coverage above the strategy band
     means the weak set simply covers more of the blueprint — pushing it back
     down to 65% would mean dropping slots she is weak in, which is the opposite
     of what targeting is for. Recorded so the number is never read as a miss. */
  if (targetCapabilities.length && targetedCoverage > want + tolerance) {
    explanation.push(`Targeted coverage is ${Math.round(targetedCoverage * 100)}%, above the ` +
      `${Math.round(want * 100)}% strategy, because the weak capabilities span most of the ` +
      `blueprint. Slots were not dropped to lower it.`);
  }

  const contentExhausted = exhausted.length > 0;
  if (contentExhausted) {
    explanation.push(`${exhausted.length} slot(s) had no unused variant: ` +
      exhausted.map(e => e.slot).join(", ") + ". No item was repeated to fill them.");
  }

  return {
    mode, items, targetCapabilities,
    composition: {
      targetedSlots, broadSlots,
      targetedCoverage: Math.round(targetedCoverage * 100) / 100,
    },
    exhausted, contentExhausted, coverageShortfall,
    comparableItemCount: core.length,
    /* Structurally comparable to a full blueprint sitting only when every
       comparable slot got an item. One missing slot and the delta must not be
       computed — see assessment_progress.js, which checks this rather than
       trusting the flag. */
    comparableToBlueprint: core.length === BLUEPRINT.slots.length,
    explanation,
  };
}

/** How much retesting the pool can still support, per slot. Diagnostics. */
function poolRemaining(seenItemIds = []) {
  const seen = new Set(seenItemIds);
  const out = {};
  for (const [slot, ids] of Object.entries(variantsPerSlot())) {
    out[slot] = ids.filter(id => !seen.has(id)).length;
  }
  return out;
}

module.exports = {
  weaknessSet, composeAssessment, poolRemaining,
  WEAKNESS_STATES, WEAK_BELOW,
};
