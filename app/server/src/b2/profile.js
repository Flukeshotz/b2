/**
 * Evidence → profile → next action.
 *
 * Deterministic and inspectable. Every recommendation must be explainable in one
 * sentence the learner actually reads; a rule that cannot produce that sentence
 * does not belong here. No model, no competency graph, no lifetime averages.
 *
 * NO AUTHENTICATION EXISTS. Every function takes userId explicitly so wiring
 * real auth later is a change at the call site, not a rewrite.
 */

const pool = require("../db/pool");
const caps = require("./capabilities");

const DIMENSIONS = ["writing", "grammar", "vocabulary", "listening", "reading", "speaking"];

/* Confidence in the SOURCE, not the learner.
   Writing is 1.0 because it is the only skill held out against 1,033
   expert-rated texts. Speaking is 0.2 because the pipeline works and the
   scoring is uncalibrated — it may steer a recommendation, never set a band. */
const WEIGHTS = {
  submission: 1.0,   // a real piece of writing, marked
  paper: 0.9,        // performed under exam timing
  screening: 0.7,    // deliberate, but short
  experience: 0.6,   // a training session, first attempt only
  conversation: 0.2, // Maya — indicative only
};

/* Recency, not lifetime. A learner who has improved must not stay labelled by
   her worst early work — that is both wrong and demoralising. */
const RECENT_N = 5;

const BANDS = [
  { band: "strong",         min: 0.80 },
  { band: "good",           min: 0.62 },
  { band: "developing",     min: 0.42 },
  { band: "needs_practice", min: 0 },
];
const bandFor = (score) => BANDS.find(b => score >= b.min).band;

/* HOW MUCH DO WE ACTUALLY KNOW?
   A score computed from one screening item is not a level, and stating it as
   one is the most common way an assessment product lies to a learner. The band
   is unchanged; what changes is how confidently we are allowed to say it.

   `formats` is the load-bearing condition at the top tier: six multiple-choice
   items are six samples of the same behaviour, whereas items PLUS a piece of
   production are evidence about the skill. */
/* An OCCASION is a distinct demonstration, not a clock interval. The screening
   is one occasion however many items it contains; each completed experience or
   submission is another. Counting by wall-clock hour was wrong in both
   directions — it merged a screening and a lesson done back to back, and split
   one long session across an hour boundary. */
const EVIDENCE_STATES = [
  { state: "reliable", minItems: 6, minOccasions: 2, minFormats: 2,
    hedge: null },
  /* SCREENING SIGNAL and EMERGING say the same thing to the learner and are
     deliberately NOT the same thing internally. Both hedge with "so far";
     only one of them rests on more than a single sitting. Collapsing them
     would let an eleven-minute diagnostic masquerade as accumulated evidence,
     which is precisely the false precision this model exists to prevent. */
  /* DEVIATION FROM THE WRITTEN THRESHOLD, recorded deliberately.
     The strategy specifies emerging as "3–5 items across ≥2 sessions". Applied
     literally, an eleven-minute screening is ONE occasion, so it would produce
     no band for any dimension and "Where you stand" would show six rows of
     "Too early to say" — which empties the screening of its purpose.
     A screening is designed, structured coverage rather than incidental
     evidence, so three items from it earn a HEDGED band. The two-occasion
     requirement is kept where it matters: for a plain, unhedged band. */
  { state: "emerging", minItems: 3, minOccasions: 2, minFormats: 1,
    hedge: "so far" },
  { state: "screening_signal", minItems: 3, minOccasions: 1, minFormats: 1,
    hedge: "so far", screeningOnly: true },
  { state: "initial",  minItems: 1, minOccasions: 1, minFormats: 1,
    hedge: "Too early to say" },
  { state: "none",     minItems: 0, minOccasions: 0, minFormats: 0,
    hedge: "Not measured yet" },
];

function evidenceState({ items = 0, occasions = 0, formats = 0 }) {
  return EVIDENCE_STATES.find(s =>
    items >= s.minItems && occasions >= s.minOccasions && formats >= s.minFormats)
    || EVIDENCE_STATES[EVIDENCE_STATES.length - 1];
}

/** Words, never numbers. A percentage invites a total, and there is no defensible total. */
const BAND_LABEL = {
  strong: "Strong", good: "Good", developing: "Developing", needs_practice: "Needs practice",
};

/**
 * Record one piece of evidence. Called by every experience type.
 * @param {number} userId
 * @param {{dimension, outcome, sourceKind, capability?, checkId?, sourceRef?, detail?, weight?}} e
 */
async function record(userId, e) {
  if (!DIMENSIONS.includes(e.dimension)) throw new Error(`unknown dimension "${e.dimension}"`);
  const outcome = Math.max(0, Math.min(1, Number(e.outcome)));
  const weight = e.weight ?? WEIGHTS[e.sourceKind] ?? 0.6;
  // Derive the capability from the check when the caller did not name one, so
  // the learner-facing sentence is available even for raw analyse.js findings.
  const capability = e.capability || (e.checkId ? caps.capabilityForCheck(e.checkId) : null);

  await pool.query(
    `INSERT INTO b2_evidence (user_id, dimension, capability, check_id, outcome, weight, source_kind, source_ref, detail)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [userId, e.dimension, capability, e.checkId || null, outcome, weight, e.sourceKind, e.sourceRef || null, e.detail || null]
  );
  await recomputeDimension(userId, e.dimension);
}

/** Record several at once — one session usually produces a handful. */
async function recordMany(userId, list) {
  for (const e of list) await record(userId, e);
}

/**
 * Recompute one dimension's band from its most recent evidence.
 * Weighted mean over the last N rows; trend compares that against the N before.
 */
async function recomputeDimension(userId, dimension) {
  const { rows } = await pool.query(
    `SELECT outcome, weight, source_kind, source_ref
       FROM b2_evidence
      WHERE user_id=$1 AND dimension=$2
      ORDER BY created_at DESC, id DESC LIMIT $3`,
    [userId, dimension, RECENT_N * 2]
  );
  if (!rows.length) return null;

  const mean = (r) => {
    const w = r.reduce((a, x) => a + x.weight, 0);
    return w ? r.reduce((a, x) => a + x.outcome * x.weight, 0) / w : 0;
  };
  const recent = rows.slice(0, RECENT_N);
  const prior = rows.slice(RECENT_N);
  const score = mean(recent);

  let trend = "flat";
  if (prior.length >= 2) {
    const d = score - mean(prior);
    trend = d > 0.08 ? "up" : d < -0.08 ? "down" : "flat";
  }

  /* How confidently we may state it. A "format" is the KIND of demonstration —
     a screening item and a written submission are different evidence about the
     same skill; two screening items are the same evidence twice. */
  /* One screening is ONE occasion however many items it contains. Counting
     each item separately made a single sitting look like nineteen
     demonstrations of ability. */
  const occasions = new Set(recent.map(r =>
    (r.source_ref || r.source_kind).split(":")[0])).size;
  const formats = new Set(recent.map(r => r.source_kind)).size;
  const conf = evidenceState({ items: recent.length, occasions, formats });

  await pool.query(
    `INSERT INTO b2_profile (user_id, dimension, band, score, trend, evidence_n, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6, now())
     ON CONFLICT (user_id, dimension) DO UPDATE
       SET band=$3, score=$4, trend=$5, evidence_n=$6, updated_at=now()`,
    [userId, dimension, bandFor(score), score, trend, recent.length]
  );
  return score;
}

/** The six rows the learner sees on "Where you stand". */
async function getProfile(userId) {
  const { rows } = await pool.query(
    `SELECT dimension, band, score, trend, evidence_n FROM b2_profile WHERE user_id=$1`, [userId]);
  const byDim = Object.fromEntries(rows.map(r => [r.dimension, r]));
  /* Recompute confidence at read time from the evidence itself rather than
     trusting a stored flag — the rows are the truth. */
  const { rows: counts } = await pool.query(
    `SELECT dimension, count(*)::int AS items,
            count(DISTINCT COALESCE(split_part(source_ref, ':', 1), source_kind))::int AS occasions,
            count(DISTINCT source_kind)::int AS formats
       FROM b2_evidence WHERE user_id=$1 GROUP BY dimension`, [userId]);
  const conf = Object.fromEntries(counts.map(c => [c.dimension, evidenceState(c)]));

  const liveItems = Object.fromEntries(counts.map(c => [c.dimension, c.items]));

  return DIMENSIONS.map(d => {
    const state = conf[d]?.state || "none";
    /* THE ROWS ARE THE TRUTH, and that has to hold for the numbers as well as
       the state. b2_profile caches a band and a score; the evidence it was
       computed from can go away — a source retired, a bad sitting deleted — and
       the cache does not. That produced a learner-facing contradiction:
       "Not measured yet" printed next to a score of 0.9 over five items, none
       of which existed any more. The cache never outlives its evidence now. */
    const items = liveItems[d] || 0;
    const cached = items > 0 ? byDim[d] : null;
    /* Speaking is EXCLUDED regardless of how much evidence accumulates: the
       pipeline works and the scoring is uncalibrated, so it may steer a
       recommendation and must never state a level. Widening the banded states
       dropped this guard once already — hence the regression test. */
    const banded = cached && d !== "speaking"
      && ["reliable", "emerging", "screening_signal"].includes(state);
    return ({
    dimension: d,
    evidence_state: state,
    // A band is only PRINTED once there is enough behind it. The score still
    // steers recommendations at every state — we act on thin evidence, we just
    // do not announce a level from it.
    band: banded ? cached.band : null,
    label: banded
      ? BAND_LABEL[cached.band] + (state === "reliable" ? "" : " so far")
      : (conf[d]?.hedge || "Not measured yet"),
    score: cached?.score ?? null,
    trend: cached?.trend || null,
    evidence_n: items,
    // Speaking is collected but never banded until calibrated. Saying so is
    // cheaper than putting a wrong number on the most emotive skill.
    indicative: d === "speaking",
  });
  });
}

/* ── GOAL ────────────────────────────────────────────────────────────────
   Asked once, and it governs before the profile ranks. Two learners with
   identical profiles and different goals must not get the same first action. */

const GOALS = {
  anerkennung: {
    label: "Recognition as a nurse",
    board: "telc_pflege",
    critical: ["writing", "vocabulary", "listening"],
    // The exam is decided in writing; the rest supports it.
    lead: "writing",
    why: "For Anerkennung, the exam turns on your writing.",
  },
  job: {
    label: "A job in Germany",
    board: null,
    critical: ["speaking", "listening"],
    lead: "speaking",
    // From a real screening call: candidates were hired below B2, and weak
    // spoken German capped the placement — not the certificate.
    why: "Interviews are decided on how you speak, not on a certificate.",
  },
  ausbildung: {
    label: "Ausbildung",
    board: "telc",
    critical: ["writing", "reading"],
    lead: "writing",
    why: "Ausbildung applications are read before you are heard.",
  },
  exam: {
    label: "A B2 exam",
    board: null,
    critical: ["writing", "reading", "listening", "speaking"],
    lead: null,
    why: "Your weakest exam skill first.",
  },
  unsure: {
    label: "Not sure yet",
    board: null,
    critical: DIMENSIONS,
    lead: null,
    why: "Building a full picture first.",
  },
};

async function setGoal(userId, { goal, board = null, examDate = null }) {
  if (!GOALS[goal]) throw new Error(`unknown goal "${goal}"`);
  await pool.query(
    `INSERT INTO b2_learner_goal (user_id, goal, board, exam_date)
     VALUES ($1,$2,$3,$4)
     ON CONFLICT (user_id) DO UPDATE SET goal=$2, board=$3, exam_date=$4, updated_at=now()`,
    [userId, goal, board || GOALS[goal].board, examDate]
  );
}

async function getGoal(userId) {
  const { rows } = await pool.query(`SELECT * FROM b2_learner_goal WHERE user_id=$1`, [userId]);
  if (!rows[0]) return { goal: "unsure", ...GOALS.unsure };
  return { ...rows[0], ...GOALS[rows[0].goal] };
}

/* ── RECOMMENDATION ──────────────────────────────────────────────────────
   Goal filters, then the profile ranks. Returns ONE action and ONE sentence. */

const WEEKS = (d) => (Date.now() - new Date(d).getTime()) / 6048e5;

/**
 * The single thing to put behind the primary button.
 * @returns {{experienceId, title, minutes, kind, reason, dimension, capability}|null}
 */
async function nextAction(userId) {
  const [goal, profile] = await Promise.all([getGoal(userId), getProfile(userId)]);

  const { rows: available } = await pool.query(
    `SELECT e.id, e.title, e.minutes, e.kind, e.primary_capability, e.source_id,
            s.title AS source_title
       FROM b2_experiences e JOIN b2_sources s ON s.id = e.source_id
      WHERE e.status IN ('approved','live') AND s.status IN ('approved','live')
      ORDER BY e.ord`);
  if (!available.length) return null;

  const { rows: done } = await pool.query(
    `SELECT source_ref FROM b2_evidence
      WHERE user_id=$1 AND source_kind='experience' AND source_ref IS NOT NULL`, [userId]);
  const completed = new Set(done.map(d => d.source_ref));

  // Which dimension an experience kind produces evidence for.
  const DIM_OF = { listening: "listening", reading: "reading", grammar: "grammar",
                   vocabulary: "vocabulary", writing: "writing", speaking: "speaking", exam: "writing" };

  const fresh = available.filter(e => !completed.has(e.id));
  const pool_ = fresh.length ? fresh : available; // everything done → allow a repeat

  /* 1 — GOAL-CRITICAL WEAKNESS. The lowest band among the skills this goal
     makes load-bearing. Outranks a worse band in a skill the goal does not need. */
  /* The goal's LEAD skill is the one that exam or that job actually turns on, so
     it wins unless another critical skill is clearly worse. Without this the
     ranking is pure score, and two learners with the same weaknesses and
     different goals get the same answer — which is the whole thing we are
     claiming not to do. The bonus is deliberately small: a genuinely weaker
     critical skill still overtakes it. */
  const LEAD_PRIORITY = 0.12;
  const measured = profile.filter(p => p.band && !p.indicative);
  const critical = measured.filter(p => goal.critical.includes(p.dimension))
    .map(p => ({ ...p, rank: p.score - (p.dimension === goal.lead ? LEAD_PRIORITY : 0) }))
    .sort((a, b) => a.rank - b.rank);
  for (const weak of critical) {
    if (weak.rank >= 0.62) break; // nothing critical is actually weak
    const hit = pool_.find(e => DIM_OF[e.kind] === weak.dimension);
    if (hit) return action(hit, goal.lead === weak.dimension ? goal.why : reasonFor(weak));
  }

  /* 2 — MOST RECENT SERIOUS WEAKNESS, from the newest evidence of any kind. */
  const { rows: recentBad } = await pool.query(
    `SELECT check_id, capability, dimension FROM b2_evidence
      WHERE user_id=$1 AND outcome < 0.5 AND check_id IS NOT NULL
      ORDER BY created_at DESC, id DESC LIMIT 5`, [userId]);
  for (const r of recentBad) {
    const hit = pool_.find(e => e.primary_capability === (r.capability || caps.capabilityForCheck(r.check_id)));
    if (hit) {
      const phrase = caps.phrase(hit.primary_capability);
      return action(hit, phrase ? `Because ${phrase} was the weak point last time.` : "From your last session.");
    }
  }

  /* 3 — NO EVIDENCE AT ALL in a load-bearing dimension.
     `measured` only contains dimensions that already have a band, so filtering
     it for evidence_n === 0 could never match — an unmeasured dimension is
     absent from that list entirely. A learner whose goal turns on writing and
     who skipped the writing section was therefore sent anywhere but writing,
     which is the one thing we most need from her. */
  const unmeasured = profile.filter(p => !p.band && !p.indicative && goal.critical.includes(p.dimension));
  for (const u of unmeasured) {
    const hit = pool_.find(e => DIM_OF[e.kind] === u.dimension);
    if (hit) return action(hit, u.dimension === goal.lead
      ? goal.why
      : "We haven't seen this one from you yet.");
  }

  /* 4 — VARIETY, then order. Never the same kind three sessions running. */
  const { rows: lastKinds } = await pool.query(
    `SELECT e.kind FROM b2_evidence ev JOIN b2_experiences e ON e.id = ev.source_ref
      WHERE ev.user_id=$1 AND ev.source_kind='experience'
      ORDER BY ev.created_at DESC LIMIT 2`, [userId]);
  const repeated = lastKinds.length === 2 && lastKinds[0].kind === lastKinds[1].kind ? lastKinds[0].kind : null;
  const varied = repeated ? pool_.filter(e => e.kind !== repeated) : pool_;

  const pick = (varied.length ? varied : pool_)[0];
  return action(pick, fresh.length ? "Next up." : "You've done these — go again?");
}

const action = (e, reason) => ({
  experienceId: e.id,
  topicId: `b2_${e.id.replace(/^exp_/, "")}`,
  subKey: "main",
  sourceId: e.source_id,
  title: e.title,
  sourceTitle: e.source_title,
  minutes: e.minutes,
  kind: e.kind,
  capability: e.primary_capability,
  reason,
});

function reasonFor(p) {
  const nice = { writing: "writing", grammar: "grammar", vocabulary: "vocabulary",
                 listening: "listening", reading: "reading", speaking: "speaking" };
  return `Your ${nice[p.dimension]} came out lowest.`;
}

module.exports = {
  DIMENSIONS, WEIGHTS, GOALS, BAND_LABEL, EVIDENCE_STATES, evidenceState,
  record, recordMany, recomputeDimension, getProfile,
  setGoal, getGoal, nextAction, bandFor,
};
