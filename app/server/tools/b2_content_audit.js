#!/usr/bin/env node
/**
 * B2 CONTENT AUDIT — machine-readable, run against the real DB.
 *
 *   node tools/b2_content_audit.js
 *
 * Reuses `content_model.js`'s existing per-item validators (validateItem,
 * validateProvenance, validateForProduction) rather than inventing a second
 * set of content rules — this tool adds only the checks that need to see
 * MORE than one row at a time (duplicates, orphans, empty sections), which
 * content_model.js cannot do by design (it validates one row in isolation).
 *
 * Output: one line per finding, tiered FAIL / WARN / NOTE, plus a summary.
 * Exit code is 1 if any FAIL exists, so this can gate CI later without
 * being wired to anything today.
 */
require("../src/env")();
const pool = require("../src/db/pool");
const model = require("../src/b2/content_model");

const findings = []; // {tier, area, id, message}
const add = (tier, area, id, message) => findings.push({ tier, area, id, message });

async function main() {
  const { rows: items } = await pool.query(`
    SELECT i.id, i.item_no, i.stem, i.item_type, i.scoring_mode, i.points, i.skill, i.capability,
           i.difficulty, i.source_type, i.source_book, i.source_page, i.adaptation_status,
           i.review_status, i.options, i.answer, i.answer_payload, i.payload,
           s.id AS section_id, s.module, s.skill AS section_skill, s.passage, s.item_count,
           p.id AS paper_id, p.board, p.alignment, p.source_type AS paper_source_type,
           p.source_book AS paper_source_book, p.review_status AS paper_review_status
      FROM b2_paper_items i
      JOIN b2_paper_sections s ON s.id = i.section_id
      JOIN b2_papers p ON p.id = s.paper_id
     ORDER BY p.id, s.part_no, i.item_no`);

  // ── PER-ITEM: reuse content_model.js exactly as production serving does ──
  for (const it of items) {
    const label = `${it.paper_id}/${it.section_id}#${it.item_no ?? it.id}`;
    // A DRAFT item is not "broken" — it is a known, pre-authoring-pass legacy
    // row (gx_hoeren_t1) that simply has not been through the current content
    // pipeline yet. Its missing fields are a consequence of DRAFT, not a
    // separate list of bugs, so it collapses to one NOTE, not four FAILs.
    if (it.review_status === "DRAFT") {
      add("NOTE", "item", label, "review_status=DRAFT — not yet through the current content pipeline (legacy row)");
      continue;
    }
    const asRow = { ...it, audio_required: false };
    const result = model.validateForProduction(asRow, { requireSme: false });
    if (!result.ready) for (const p of result.problems) add("FAIL", "item", label, p);
  }

  // A `*-complete-*` paper is BY DESIGN composed from an already-authored
  // standalone paper's sections/items (see seed_exam_papers.js) — the two
  // papers sharing a stem/passage is the intended composition, not a
  // copy-paste accident. Likewise `*-tN-sM` papers (e.g.
  // telc-b2-sprachbausteine-t1-s1/-s2) are deliberate gap-batches carved out
  // of the SAME real letter/article — s1 tests gaps 1-5, s2 tests gaps 6-10,
  // and both need the full passage for context, so the shared text is the
  // point, not an accident. Stripping the trailing "-sM" and comparing bases
  // catches that family without hardcoding paper ids. Anything else sharing
  // text is worth a look.
  const batchBase = (id) => id.replace(/-s\d+$/, "");
  const isComposedPair = (a, b) => a.includes("-complete-") || b.includes("-complete-")
    || (batchBase(a) !== a && batchBase(a) === batchBase(b));

  // ── DUPLICATE STEMS — same exact question text used twice is very likely
  //    a copy-paste error, not a deliberate design choice, UNLESS it's (a) a
  //    complete-paper composition, or (b) core-2026b's own versions sharing
  //    anchor items on purpose — the entire mechanism V1→V2→V3 comparability
  //    depends on. Both are downgraded to NOTE: still visible, not alarming. ──
  const byStem = new Map();
  for (const it of items) {
    if (!it.stem) continue;
    (byStem.get(it.stem) || byStem.set(it.stem, []).get(it.stem)).push({ paperId: it.paper_id, loc: `${it.paper_id}#${it.item_no}` });
  }
  for (const [stem, locs] of byStem) {
    if (locs.length <= 1) continue;
    const papers_ = locs.map(l => l.paperId);
    const allCore2026b = papers_.every(p => p.startsWith("core-2026b"));
    const allComposed = papers_.every((p, i) => i === 0 || isComposedPair(p, papers_[0]));
    const tier = (allCore2026b || allComposed) ? "NOTE" : "WARN";
    const why = allCore2026b ? " (expected: shared anchor item across V1/V2/V3 for comparability)"
      : allComposed ? " (expected: complete-paper composition reusing a standalone set)" : "";
    add(tier, "duplicate-stem", locs.map(l => l.loc).join(", "), `identical stem repeated${why}: "${stem.slice(0, 60)}…"`);
  }

  // ── REPEATED PASSAGES — same reading/listening passage reused across
  //    different sections. Same composed-paper exception as duplicate stems. ──
  const bySections = await pool.query(`
    SELECT s.id, s.paper_id, s.passage FROM b2_paper_sections s WHERE s.passage IS NOT NULL`);
  const byPassage = new Map();
  for (const s of bySections.rows) {
    (byPassage.get(s.passage) || byPassage.set(s.passage, []).get(s.passage)).push({ paperId: s.paper_id, loc: `${s.paper_id}/${s.id}` });
  }
  for (const [, locs] of byPassage) {
    if (locs.length <= 1) continue;
    const papers_ = locs.map(l => l.paperId);
    const allComposed = papers_.every((p, i) => i === 0 || isComposedPair(p, papers_[0]));
    add(allComposed ? "NOTE" : "FAIL", "repeated-passage", locs.map(l => l.loc).join(", "),
      allComposed ? "expected: complete-paper composition reusing a standalone section" : "identical passage text served under more than one unrelated section");
  }

  // ── EMPTY SECTIONS — a section that claims N items but has fewer rows. ──
  const { rows: sectionCounts } = await pool.query(`
    SELECT s.id, s.paper_id, s.item_count AS declared, count(i.id)::int AS actual
      FROM b2_paper_sections s LEFT JOIN b2_paper_items i ON i.section_id = s.id
     GROUP BY s.id, s.paper_id, s.item_count`);
  for (const s of sectionCounts) {
    if (s.actual === 0) add("FAIL", "empty-section", `${s.paper_id}/${s.id}`, "section has zero items");
    else if (s.declared != null && s.declared !== s.actual) add("WARN", "count-mismatch", `${s.paper_id}/${s.id}`, `declared item_count=${s.declared} but ${s.actual} rows exist`);
    else if (s.declared == null) add("NOTE", "count-mismatch", `${s.paper_id}/${s.id}`, "item_count not recorded (legacy row, predates this field)");
  }

  // ── UNSUPPORTED EXAM CLAIMS — alignment='licensed_official' without a
  //    named source is exactly the claim rule 19 forbids. ──
  const { rows: papers } = await pool.query(`SELECT id, board, alignment, source_type, source_book FROM b2_papers`);
  for (const p of papers) {
    if (p.alignment === "licensed_official" && (p.source_type !== "DIRECT_LICENSED" || !p.source_book)) {
      add("FAIL", "exam-claim", p.id, "alignment='licensed_official' without a DIRECT_LICENSED source — unsupported official claim");
    }
    if (["goethe", "telc", "telc_pflege", "osd"].includes(p.board) && p.source_type === "ORIGINAL" && p.alignment === "licensed_official") {
      add("FAIL", "exam-claim", p.id, "ORIGINAL content cannot also claim licensed_official");
    }
  }

  // ── ORPHANED / UNREACHABLE — a paper with no sections at all. ──
  const { rows: orphanPapers } = await pool.query(`
    SELECT p.id FROM b2_papers p LEFT JOIN b2_paper_sections s ON s.paper_id = p.id
     WHERE s.id IS NULL`);
  for (const p of orphanPapers.rows || orphanPapers) add("FAIL", "orphaned-paper", p.id, "paper has no sections — unreachable");

  // ── SUSPECT ANSWER KEY — every TRUE_FALSE item in one paper sharing the
  //    same answer is not a plausible real exam paper (this caught a real
  //    bug: 8 telc Hören papers where a broken generator defaulted every
  //    item to Richtig). One or two items is fine; every item is not. ──
  const { rows: tfRows } = await pool.query(`
    SELECT s.paper_id, p.review_status, i.answer_payload->>'value' AS val
      FROM b2_paper_items i JOIN b2_paper_sections s ON s.id = i.section_id
      JOIN b2_papers p ON p.id = s.paper_id
     WHERE i.item_type = 'TRUE_FALSE'`);
  const tfByPaper = new Map();
  for (const r of tfRows) {
    const g = tfByPaper.get(r.paper_id) || tfByPaper.set(r.paper_id, { status: r.review_status, vals: [] }).get(r.paper_id);
    g.vals.push(r.val);
  }
  for (const [paperId, g] of tfByPaper) {
    if (g.vals.length < 4 || new Set(g.vals).size > 1) continue;
    // DRAFT means this exact problem is already known and the paper is
    // already unservable (see exam_paper.js's startPaper gate) — same
    // "known, tracked, not currently a live risk" downgrade every other
    // DRAFT check in this file gets, not a fresh alarm.
    const draft = g.status === "DRAFT";
    // A human writing 3-4 true/false items by hand landing on all-same is not
    // rare enough to alarm on (confirmed real case: telc-b2-lesen-1/complete-1,
    // genuinely authored, all 4 verified false against their real passage).
    // The bug this check exists for showed up as 5-10 items per paper, always
    // true, across 8 separate papers — a much stronger signal. Small counts
    // still get a NOTE so a reviewer can glance at them, just not a FAIL.
    const tier = draft ? "NOTE" : g.vals.length >= 5 ? "FAIL" : "NOTE";
    const why = draft ? " (already quarantined as DRAFT — not currently servable)"
      : g.vals.length < 5 ? " (small sample — worth a glance, not necessarily a bug)" : "";
    add(tier, "suspect-answer-key", paperId,
      `all ${g.vals.length} TRUE_FALSE items share the same answer (${g.vals[0]})${why} — check this is a real answer key, not a default`);
  }

  // ── REPORT ──
  const tiers = { FAIL: [], WARN: [], NOTE: [] };
  for (const f of findings) tiers[f.tier].push(f);

  console.log(`B2 CONTENT AUDIT — ${new Date().toISOString()}`);
  console.log(`Items audited: ${items.length} · Papers: ${papers.length}\n`);
  for (const tier of ["FAIL", "WARN", "NOTE"]) {
    console.log(`${tier} (${tiers[tier].length})`);
    for (const f of tiers[tier]) console.log(`  [${f.area}] ${f.id}: ${f.message}`);
    console.log("");
  }
  console.log(`SUMMARY: ${tiers.FAIL.length} FAIL, ${tiers.WARN.length} WARN, ${tiers.NOTE.length} NOTE`);

  await pool.end();
  process.exit(tiers.FAIL.length ? 1 : 0);
}

main().catch(e => { console.error("AUDIT CRASHED:", e); process.exit(2); });
