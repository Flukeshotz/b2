/**
 * SUGGESTED PRACTICE — the "practise" step of assess → practise → re-assess.
 *
 * Reads the learner's latest core-2026b result (assessment_store.progress, the
 * same numbers the home score card shows — no second scoring model) and ranks
 * practice papers by how much of their content targets her weakest
 * capabilities. Papers she has already finished drop to the back rather than
 * disappearing, so a module never runs out of suggestions.
 *
 * Writing and speaking are not objectively scored in the assessment, so their
 * suggestions follow her weakest capabilities overall (argue, concede, …),
 * which is also what those papers are tagged with.
 */
const pool = require("../db/pool");
const store = require("./assessment_store");
const { BY_ID } = require("./capabilities");

/* The four home modules and the section skills each one lists — mirrors the
   /practice/skill route (grammar and vocabulary sit under Reading). */
const MODULES = {
  reading: ["reading", "grammar", "vocabulary"],
  listening: ["listening"],
  writing: ["writing"],
  speaking: ["speaking"],
};
const PRACTICE_FILTER =
  "p.id NOT LIKE 'core-2026b%' AND p.id NOT LIKE '%-complete-%' AND p.id NOT LIKE 'gx\\_%'";
// One per module — the client shows a single compact suggestion, not a list.
const PER_MODULE = 1;

const labelOf = (cap) => BY_ID.get(cap)?.label || cap;
const learnerOf = (cap) => BY_ID.get(cap)?.learner || null;

async function suggestions(userId) {
  const { latest } = await store.progress(userId);
  if (!latest) return { available: false, focus: [], modules: {} };

  // Weakness weight per capability: 1 − score, only where something was measured.
  const weak = Object.entries(latest.byCapability || {})
    .filter(([, c]) => c.measured > 0 && c.score < 1)
    .map(([cap, c]) => ({ capability: cap, score: c.score, weight: 1 - c.score }))
    .sort((a, b) => a.score - b.score || b.weight - a.weight);
  const weightOf = Object.fromEntries(weak.map(w => [w.capability, w.weight]));

  const { rows } = await pool.query(
    `SELECT p.id, p.title, p.board, s.skill, i.capability, count(*)::int n
       FROM b2_papers p
       JOIN b2_paper_sections s ON s.paper_id = p.id
       JOIN b2_paper_items i ON i.section_id = s.id
      WHERE ${PRACTICE_FILTER}
      GROUP BY p.id, p.title, p.board, s.skill, i.capability`);
  const { rows: done } = await pool.query(
    `SELECT DISTINCT paper_id FROM b2_paper_attempts
      WHERE user_id=$1 AND kind='paper' AND finished_at IS NOT NULL`, [userId]);
  const finished = new Set(done.map(d => d.paper_id));

  const modules = {};
  for (const [mod, skills] of Object.entries(MODULES)) {
    const papers = new Map();
    for (const r of rows) {
      if (!skills.includes(r.skill)) continue;
      const p = papers.get(r.id) || { paperId: r.id, title: r.title, board: r.board, hit: 0, total: 0, caps: {} };
      p.total += r.n;
      const w = weightOf[r.capability] || 0;
      if (w > 0) { p.hit += w * r.n; p.caps[r.capability] = (p.caps[r.capability] || 0) + w * r.n; }
      papers.set(r.id, p);
    }
    modules[mod] = [...papers.values()]
      .filter(p => p.hit > 0)
      .map(p => ({ ...p, rank: p.hit / p.total + (finished.has(p.paperId) ? -1 : 0) }))
      .sort((a, b) => b.rank - a.rank || a.paperId.localeCompare(b.paperId))
      .slice(0, PER_MODULE)
      .map(p => {
        const top = Object.entries(p.caps).sort((a, b) => b[1] - a[1])[0][0];
        return { paperId: p.paperId, title: p.title, board: p.board,
                 capability: top, why: labelOf(top), done: finished.has(p.paperId) };
      });
  }

  return {
    available: true,
    focus: weak.slice(0, 3).map(w => ({
      capability: w.capability, label: labelOf(w.capability), learner: learnerOf(w.capability),
      score: w.score,
    })),
    modules,
  };
}

module.exports = { suggestions, MODULES };
