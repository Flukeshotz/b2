/**
 * B2 curriculum service.
 *
 * Two jobs, and deliberately nothing else:
 *   1. list the B2 topics with this learner's progress on them, NON-LINEARLY;
 *   2. turn an assessment finding into the one topic that practises it.
 *
 * NO AUTHENTICATION EXISTS IN THIS REPOSITORY. Every function here therefore
 * takes `userId` as its first argument rather than reading a module constant,
 * so wiring real auth later is a change at the call site and not a rewrite of
 * this file. Callers currently pass the hardcoded demo user. That is a platform
 * limitation, not multi-user security — see routes/b2.js.
 */

const pool = require("../db/pool");
const { TOPICS, trackOf } = require("../seed/b2_curriculum");

const LEVEL = "b2";

/* ── FINDING -> TOPIC ────────────────────────────────────────────────────────
   Derived from the content itself, not maintained separately: each topic
   declares the `checks` and `weaknesses` it answers, and the maps are built
   from those declarations at load. A second hand-kept table would drift from
   the lessons the moment anyone edited one.

   Deterministic by design. No model, no competency graph, no scoring — a
   finding either has a topic that teaches it or it does not, and saying "we
   have nothing for that yet" is the honest answer while only four topics exist.
*/
function indexBy(field) {
  const map = new Map();
  for (const t of TOPICS) for (const key of t[field] || []) {
    // A check answered by two topics is a content bug: the recommendation
    // would be arbitrary, and arbitrary is indistinguishable from wrong.
    if (map.has(key)) throw new Error(`b2 curriculum: ${field} "${key}" claimed by both ${map.get(key)} and ${t.id}`);
    map.set(key, t.id);
  }
  return map;
}

const BY_CHECK = indexBy("checks");
const BY_WEAKNESS = indexBy("weaknesses");

/** The topic that practises a given assessment finding, or null. */
function topicForFinding(finding) {
  if (!finding) return null;
  return BY_WEAKNESS.get(finding.weakness) || BY_CHECK.get(finding.check_id) || null;
}

/**
 * The findings worth acting on, worst first, mapped to topics.
 * `fail` before `warn`, and anything we cannot teach yet is dropped rather than
 * surfaced as advice with no way to act on it.
 */
function practiceFor(findings = []) {
  const rank = { fail: 0, warn: 1 };
  return findings
    .filter(f => f.state === "fail" || f.state === "warn")
    .map(f => ({ finding: f, topicId: topicForFinding(f) }))
    .filter(x => x.topicId)
    .sort((a, b) => rank[a.finding.state] - rank[b.finding.state])
    .filter((x, i, all) => all.findIndex(y => y.topicId === x.topicId) === i);
}

/* ── LISTING ─────────────────────────────────────────────────────────────── */

const meta = (id) => TOPICS.find(t => t.id === id);

/**
 * Every B2 topic with this learner's progress on it.
 *
 * NOT gated. A B2 topic is never locked: order is a suggestion, and the learner
 * may open Vocabulary before finishing Grammar, or take the third topic first.
 * That is the difference from A1's journey, and it is the whole reason
 * `topics.level` exists.
 */
/* Retired content is invisible here, which is what makes retirement real
   rather than a label. It stays in `topics` so its German can be rebuilt in the
   right modality later, and so any progress recorded against it survives — but
   it is not listed, not recommended, and contributes no coverage. */
async function listTopics(userId) {
  const [{ rows: topics }, { rows: progress }, { rows: experiences }] = await Promise.all([
    pool.query(
      `SELECT id, order_index, icon, title, capability, proof, subs, level
         FROM topics WHERE level = $1 AND status = 'live' ORDER BY order_index`, [LEVEL]),
    pool.query(
      `SELECT topic_id, sub_key FROM user_progress
        WHERE user_id = $1 AND topic_id IN (
                SELECT id FROM topics WHERE level = $2 AND status = 'live')`,
      [userId, LEVEL]),
    pool.query(
      `SELECT published_topic_id, minutes FROM b2_experiences WHERE status = 'live'`),
  ]);

  const expMinutesMap = new Map(experiences.map(e => [e.published_topic_id, e.minutes]));
  const MAYA_MINUTES = {
    b2_maya_schichttausch: 6,
    b2_maya_homeoffice: 8,
    b2_maya_vorschlag: 8,
    b2_maya_unerwartet: 8,
  };
  const WAVE1_MINUTES = {
    b2_register_aufklaerung: 10,
    b2_dienstplan_vergleich: 10,
    b2_fall_spekulation: 10,
    b2_beispiel_geben: 10,
  };
  const EXAM_MINUTES = {
    b2_gx_hoeren_t1_alltag_exam: 12,
  };

  const doneSet = new Set(progress.map(p => `${p.topic_id}:${p.sub_key}`));

  /* REPETITION, applied at serve time rather than authored into the content.
     A learner who has already produced an expression must not meet it again as
     a recognition item, so the steps that would do that are dropped from what
     is sent. The authored experience never changes — what changes is which of
     it this learner still has anything to gain from. */
  const expressions = require("./expressions");
  const filtered = await Promise.all(topics.map(async (t) => ({
    ...t,
    subs: await Promise.all((t.subs || []).map(async (s) => ({
      ...s, steps: await expressions.filterSteps(userId, s.steps || []),
    }))),
  })));

  return filtered.map(t => {
    const subs = t.subs.map(s => ({ ...s, done: doneSet.has(`${t.id}:${s.key}`) }));
    const doneCount = subs.filter(s => s.done).length;
    const minutes = expMinutesMap.get(t.id) || MAYA_MINUTES[t.id] || WAVE1_MINUTES[t.id] || EXAM_MINUTES[t.id] || 5;
    return {
      ...t, subs,
      track: trackOf(t.id),
      doneCount,
      total: subs.length,
      complete: doneCount === subs.length,
      // Where "Continue" resumes: first unfinished sub, else back to the start.
      nextSub: (subs.find(s => !s.done) || subs[0])?.key ?? null,
      minutes,
    };
  });
}

/* THE RECOMMENDER LIVES IN b2/profile.js.
   An order-ranking nextAction used to live here too, and both were routed at
   once: /b2/next served this one while /b2/profile served the other, so Home
   and the profile screen recommended different things to the same learner on
   the same evidence. Deleted rather than deprecated — a second implementation
   that still compiles is a second implementation somebody will call.

   What remains here is the curriculum LISTING and the check_id -> topic map.
   Neither ranks anything. */

module.exports = { LEVEL, listTopics, topicForFinding, practiceFor, BY_CHECK, BY_WEAKNESS };
