// Board recommendation — docs/08-v1-build-plan.md WP-2.
//
// A decision table, not a model. The inputs are a skill profile and a handful of
// facts about the two boards; an LLM here would add latency, cost and the ability
// to be confidently wrong about a €250 decision.
//
// Recommend, never decide: if an employer, agency or recognition authority names
// a board, that overrides everything here. The caller passes `mandated` and we
// step aside.

// Verified facts, not judgement. Update these when they change -- especially
// availability, which is the most volatile and currently the most decisive.
const BOARDS = {
  goethe: {
    label: "Goethe-Zertifikat B2",
    feeIndia: "₹21,200",
    retakeIndia: "₹5,300 per module",
    modular: true,
    availabilityIndia: "no dates currently listed; reported booked months ahead",
    writingTask: "forum post plus a formal message — open argument",
    hasSprachbausteine: false,
  },
  telc: {
    label: "telc Deutsch B2",
    feeIndia: "₹12,000–13,500",
    retakeIndia: "partial examination permitted",
    modular: true,
    availabilityIndia: "bookable within about a month in most cities",
    writingTask: "semi-formal email answering an advert — fixed conventions",
    hasSprachbausteine: true,
  },
};

// A profile is uneven when one skill sits well below the rest. That is the
// condition under which Goethe's module retake is worth real money, and it is
// the only performance signal here strong enough to move a recommendation.
const UNEVEN_SPREAD = 25;

// A missing skill is not a zero. An unheard speaking answer is UNKNOWN, not bad,
// and treating it as bad is how you send someone to the wrong exam.
const ALL_SKILLS = ["writing", "reading", "listening", "speaking"];

/**
 * Does the missing skill actually change the answer?
 *
 * Rather than refusing to recommend, or quietly recommending on partial data as
 * if it were complete, run the decision at both plausible extremes for the skill
 * we do not have. If it lands on the same board either way, the gap is
 * irrelevant and the learner gets a straight answer. If it flips, that is
 * exactly the case where guessing is unaffordable.
 *
 * This is not hypothetical: one interviewed learner PASSED telc speaking and
 * failed the written side twice. Her speaking was the outlier, so a profile
 * missing it would have looked even when it was not.
 */
function sensitivity(skills, missing, opts) {
  const known = Object.values(skills).filter(Number.isFinite);
  if (!known.length) return null;

  // Bounds are ±15 around the MEAN of what we know, not ±20 from the extremes.
  // The first version used the extremes and every missing skill then looked
  // uneven — the bounds themselves manufactured a spread wider than the
  // threshold, so the analysis said "uneven" no matter what the learner did.
  // Skills correlate; a plausible unknown sits near the others, not beyond them.
  const mean = known.reduce((a, b) => a + b, 0) / known.length;
  const lo = Math.max(0, Math.round(mean - 15));
  const hi = Math.min(100, Math.round(mean + 15));

  const at = (guess) => {
    const filled = { ...skills };
    for (const m of missing) filled[m] = guess;
    return core(filled, opts).board;
  };
  const low = at(lo), high = at(hi);
  return { robust: low === high, board: low, lo, hi };
}

/**
 * @param {object} skills  { writing, reading, listening, speaking } 0-100, any subset
 * @param {object} opts    { mandated?: 'goethe'|'telc', weeksToExam?: number }
 */
function recommend(skills = {}, opts = {}) {
  const missing = ALL_SKILLS.filter(k => !Number.isFinite(skills[k]));
  const base = core(skills, opts);
  if (!missing.length || base.confidence === "mandated" || base.confidence === "insufficient") {
    return { ...base, missing };
  }

  const sens = sensitivity(skills, missing, opts);
  const names = missing.join(" and ");

  if (sens?.robust) {
    // The gap does not change the answer. Report the board the ANALYSIS reached,
    // not the one computed on the partial profile: a spread measured over three
    // skills instead of four is a different quantity, and using it here was the
    // second bug in this function.
    const settled = core({ ...skills, ...Object.fromEntries(missing.map(m => [m, Math.round((sens.lo + sens.hi) / 2)])) }, opts);
    return {
      ...settled, missing,
      reasons: [...settled.reasons,
        `You skipped ${names} — doesn't change the answer either way.`],
    };
  }

  // The gap DOES change the answer. Do not pick one and hope. Name the
  // dependency, and ask for the single thing that would settle it.
  return {
    ...base, missing, confidence: "depends",
    reasons: [
      `This depends on your ${names}, which you skipped.`,
      `Strong ${names} → ${BOARDS.telc.label}. Weak ${names} → ${BOARDS.goethe.label}.`,
      `Two minutes to check — the boards differ by ~₹9,000, one has no India dates.`,
    ],
    action: { label: `Record the ${names} part`, skill: missing[0] },
  };
}

function core(skills = {}, opts = {}) {
  const vals = Object.values(skills).filter(v => Number.isFinite(v));
  const reasons = [];

  if (opts.mandated && BOARDS[opts.mandated]) {
    return {
      board: opts.mandated,
      label: BOARDS[opts.mandated].label,
      confidence: "mandated",
      reasons: ["Your employer, agency or recognition authority requires this board."],
      alternative: null,
    };
  }

  if (vals.length < 2) {
    return {
      board: null, label: null, confidence: "insufficient",
      reasons: ["Not enough of the check completed to recommend a board yet."],
      alternative: null,
    };
  }

  const spread = Math.max(...vals) - Math.min(...vals);
  const uneven = spread >= UNEVEN_SPREAD;

  // Weak free composition with sound accuracy suits telc: its writing task is a
  // formulaic email, and Sprachbausteine rewards exactly that kind of learner.
  const formulaic = Number.isFinite(skills.schreiben) && Number.isFinite(skills.lesen)
    && skills.schreiben < skills.lesen - 10;

  /* SHORT CLAUSES, NOT JUSTIFYING PARAGRAPHS. Each reason keeps the one number
     or fact that makes it checkable and drops the explanatory sentence around
     it — the "why" screens were flagged as the most text-heavy in the whole
     product, and a recommendation is exactly the place where a learner needs
     three facts, not three paragraphs. */
  let board;
  if (uneven) {
    board = "goethe";
    reasons.push(`Uneven profile — ${spread} points between strongest and weakest.`);
    reasons.push("Goethe is modular: retake one module (~₹5,300) instead of everything.");
    // Availability can still overturn it, and often will. Say so rather than
    // recommending a board they cannot actually sit.
    reasons.push(`Availability: Goethe India ${BOARDS.goethe.availabilityIndia}.`);
  } else {
    board = "telc";
    reasons.push("Fairly level profile — Goethe's retake advantage is worth less to you.");
    reasons.push(`Availability: telc ${BOARDS.telc.availabilityIndia}; Goethe ${BOARDS.goethe.availabilityIndia}.`);
    reasons.push(`Cost: telc ${BOARDS.telc.feeIndia} vs. Goethe ${BOARDS.goethe.feeIndia}.`);
    if (formulaic) reasons.push("telc's writing task is a fixed-format email — more learnable than Goethe's open argument.");
  }

  if (opts.weeksToExam != null && opts.weeksToExam < 6 && board === "goethe") {
    reasons.push(`Only ${opts.weeksToExam} weeks left — if Goethe has no dates, sit telc instead.`);
  }

  const other = board === "goethe" ? "telc" : "goethe";
  return {
    board,
    label: BOARDS[board].label,
    confidence: uneven ? "clear" : "leaning",
    spread,
    reasons,
    alternative: {
      board: other,
      label: BOARDS[other].label,
      when: other === "goethe"
        ? "Worth it if one skill sits far below the others — you retake just that module."
        : "Worth it if you need a seat sooner or the fee matters.",
    },
    overrideNote: "If your employer, agency or the recognition authority names a board, go with theirs.",
  };
}

module.exports = { recommend, BOARDS, UNEVEN_SPREAD, ALL_SKILLS };
