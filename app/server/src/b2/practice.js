/**
 * PRACTICE MODE — targeted skill/capability development, distinct from EXAM
 * PRACTICE (Goethe/telc `exam_paper.js`, board IN goethe/telc). No new content
 * engine: this reads the same `b2_papers`/`b2_paper_sections`/`b2_paper_items`
 * tables, filtered to `board='custom'` — the boundary that already separates
 * "Skillcase original practice" from "exam-format simulation" (see
 * seed_practice_bank.js). A learner starts/answers/finishes through the exact
 * same `exam_paper.js` functions either way; only discovery and the
 * weak-area recommendation are new here.
 *
 * Reuses profile.getProfile() for weakness ranking — no second scoring model.
 */
const pool = require("../db/pool");
const profile = require("./profile");

const CATEGORY_META = {
  reading:    { label: "Reading",    blurb: "Improve understanding of written German" },
  listening:  { label: "Listening",  blurb: "Improve understanding of spoken German" },
  speaking:   { label: "Speaking",   blurb: "Practise expressing and defending ideas" },
  writing:    { label: "Writing",    blurb: "Practise structured written responses" },
  grammar:    { label: "Grammar",    blurb: "Strengthen specific language patterns" },
  vocabulary: { label: "Vocabulary", blurb: "Build useful B2 vocabulary" },
  // Workplace has no b2_papers row at all — it reuses the existing interview
  // question bank (src/b2/interview.js) wholesale, not a paper. Marked
  // available unconditionally because that content already exists and works;
  // see routes/b2.js's /interview/* routes, unchanged by this module.
  workplace:  { label: "Workplace",  blurb: "Practise professional situations" },
};

/** Only 'custom'-board papers count as Practice content — Goethe/telc board
    papers are Exam Practice and must never surface here, or the two surfaces
    the product depends on being distinct silently merge back into one. */
async function categories() {
  const { rows } = await pool.query(
    /* board='custom' alone is not enough: core-2026b's own diagnostic papers
       (core-2026b-v1/v2/v3) also carry board='custom' and alignment='original'
       — they are the ASSESS half of assess->weakness->practice->reassess, not
       Practice content, so they are excluded by id prefix explicitly. */
    `SELECT s.skill, p.id AS paper_id, p.title, count(i.id)::int AS items
       FROM b2_papers p
       JOIN b2_paper_sections s ON s.paper_id = p.id
       JOIN b2_paper_items i ON i.section_id = s.id
      WHERE p.board = 'custom' AND p.review_status <> 'DRAFT' AND s.skill IS NOT NULL
        AND p.id NOT LIKE 'core-2026b%'
      GROUP BY s.skill, p.id, p.title
      ORDER BY s.skill, p.id`);

  const bySkill = {};
  for (const r of rows) (bySkill[r.skill] ||= []).push({ paperId: r.paper_id, title: r.title, items: r.items });

  return Object.keys(CATEGORY_META).map(skill => ({
    skill, ...CATEGORY_META[skill],
    available: skill === "workplace" ? true : !!bySkill[skill]?.length,
    papers: bySkill[skill] || [],
  }));
}

/** The single "practise your weak area" recommendation. Ranks by the same
    b2_profile scores Report/Coach already show — never a separate number. */
async function weakAreaRecommendation(userId) {
  const prof = await profile.getProfile(userId);
  const measured = prof.filter(p => p.evidence_n > 0 && p.score !== null);
  if (!measured.length) {
    return { available: false, message: "Take the quick test first to see what you should practise." };
  }

  const cats = await categories();
  const withContent = new Map(cats.filter(c => c.available && c.papers.length).map(c => [c.skill, c]));

  const ranked = [...measured].sort((a, b) => a.score - b.score);
  for (const weak of ranked) {
    // Speaking is never banded (uncalibrated) — never steer a recommendation off it.
    if (weak.dimension === "speaking") continue;
    const cat = withContent.get(weak.dimension);
    if (!cat) continue; // honest: no dedicated practice content for this dimension yet
    return {
      available: true,
      dimension: weak.dimension,
      label: cat.label,
      paperId: cat.papers[0].paperId,
      message: `${cat.label} needs more practice.`,
    };
  }
  return { available: false,
    message: "No dedicated practice content for your weakest area yet — try Grammar or Vocabulary instead." };
}

module.exports = { categories, weakAreaRecommendation, CATEGORY_META };
