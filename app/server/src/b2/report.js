/**
 * THE PERFORMANCE REPORT — deterministic, evidence-only.
 *
 * Composes three things that already exist rather than inventing a fourth
 * scoring system: `assessment_store.progress()` (latest/previous/delta, with
 * its own non-negotiable comparability rule), `profile.getProfile()` (the
 * six-dimension evidence ladder — band, or an honest hedge when there isn't
 * enough evidence to print one), and `profile.nextAction()` (the same
 * recommendation the Home screen's "practise your weak areas" row already
 * uses, so the report can never recommend something Home would not).
 *
 * NOTHING HERE COMPUTES A SCORE OF ITS OWN. No Goethe/telc number, no CEFR
 * claim, no pass probability — this module only reads what evidence already
 * says and reports it in one place. If that is ever tempting to add, the
 * place to resist it is here, not in the caller.
 */

const pool = require("../db/pool");
const profile = require("./profile");
const store = require("./assessment_store");
const { CAPABILITIES } = require("./capabilities");

/* Capability-level detail is coarser than the six-dimension profile — "argue"
   or "adapt_register" rather than "grammar" — and the report needs it for
   "what specifically is holding you back", not just which skill. Same
   evidence table, same minimum-items floor as the dimension model (3 items),
   no new threshold invented for this. */
const MIN_CAPABILITY_ITEMS = 3;
const STRONG_AT = 0.62; // same boundary assessment_store.result() already uses

async function capabilityCoverage(userId, progressCapabilities = {}) {
  const { rows } = await pool.query(
    `SELECT capability, count(*)::int AS items, avg(outcome)::float AS mean
       FROM b2_evidence
      WHERE user_id=$1 AND capability IS NOT NULL
      GROUP BY capability`, [userId]);

  const evidenceMap = new Map();
  for (const r of rows) {
    evidenceMap.set(r.capability, r);
  }

  return CAPABILITIES.map(c => {
    const ev = evidenceMap.get(c.id);
    const items = ev ? ev.items : 0;
    const mean = ev ? ev.mean : null;

    let status = "unmeasured";
    if (items >= MIN_CAPABILITY_ITEMS) {
      status = "reliable";
    } else if (items >= 1) {
      status = "emerging";
    }

    const movement = progressCapabilities[c.id] || null;

    return {
      id: c.id,
      capability: c.id,
      label: c.label,
      de: c.de,
      learner: c.learner,
      items,
      status,
      measured: status === "reliable",
      score: mean,
      band: mean != null ? profile.bandFor(mean) : null,
      movement: movement ? movement.direction : null,
      delta: movement ? movement.delta : null,
      resources: c.resources || [],
    };
  });
}

/**
 * The whole report. Computed fresh on every call — deterministic, evidence-backed.
 */
async function buildReport(userId) {
  const [prog, prof, next] = await Promise.all([
    store.progress(userId),
    profile.getProfile(userId),
    profile.nextAction(userId).catch(() => null),
  ]);

  const caps = await capabilityCoverage(userId, prog.capabilities || {});

  const reliable = caps.filter(c => c.status === "reliable");
  const emerging = caps.filter(c => c.status === "emerging");
  const unmeasured = caps.filter(c => c.status === "unmeasured");

  const strongest = reliable.filter(c => c.score >= STRONG_AT)
    .sort((a, b) => b.score - a.score).slice(0, 3);
  const weakest = reliable.filter(c => c.score < STRONG_AT)
    .sort((a, b) => a.score - b.score).slice(0, 3);

  return {
    generatedAt: new Date().toISOString(),
    assessment: {
      latest: prog.latest, previous: prog.previous, delta: prog.delta,
      reason: prog.reason, skills: prog.skills,
    },
    profile: prof,
    capabilities: {
      all: caps,
      reliable,
      emerging,
      unmeasured,
      measured: reliable,
      strongest,
      weakest,
      unmeasuredCount: unmeasured.length,
    },
    recommendation: next,
    claim: "B2 performance report",
    notAnExamScore: true,
  };
}

module.exports = { buildReport, capabilityCoverage };

