/**
 * CONTENT INVENTORY — four columns, because a row in a table is not coverage.
 *
 *   RAW        it exists somewhere in the repo or the database
 *   USABLE     a learner can actually reach and complete it today
 *   B2-QUALITY it passes the pedagogy bar: right modality, real production or
 *              judgement, not A1 mechanics in harder vocabulary
 *   LIVE       both usable AND B2-quality, and published
 *
 * The distinction exists because every previous inventory in this project
 * overstated what we had. "4 B2 topics" was four A1 lessons. "23 interview
 * questions" is not a job pathway. "1 audio source" is not a listening
 * curriculum. A number in the RAW column means almost nothing on its own.
 *
 *   node tools/inventory.js
 */

const fs = require("node:fs");
const path = require("node:path");
require("../src/env")();
const pool = require("../src/db/pool");

const n = (v) => String(v).padStart(5);
/* TEACHER and PROTO are separate columns because collapsing them is exactly how
   an inventory starts lying: "approved" would count content nobody qualified
   has read. B2Q means it passed the pedagogy bar; TEACHER means a person
   confirmed the German. Both are needed, and neither implies the other. */
const row = (label, raw, usable, quality, live, note, proto = "", teacher = "") =>
  `  ${label.padEnd(24)}${n(raw)}${n(usable)}${n(quality)}${n(proto)}${n(teacher)}${n(live)}   ${note || ""}`;

(async () => {
  const q = async (sql, p = []) => (await pool.query(sql, p)).rows;
  const one = async (sql, p = []) => Number((await q(sql, p))[0]?.n ?? 0);

  const out = [];
  out.push("\n  CONTENT INVENTORY");
  out.push("  " + "─".repeat(74));
  out.push("  " + "".padEnd(24) + "  RAW USABLE  B2Q PROTO TEACH LIVE   note");

  /* ── Sources, counted per kind and per approver.
     TEACHER-APPROVED IS NOT THE SAME AS APPROVED. Prototypes built to prove an
     experience type are published under `prototype:` so they can be reached and
     judged; counting them as B2-quality would be the exact overstatement this
     table exists to prevent. They go in LIVE and stay out of B2Q. */
  const byKind = async (kind) => {
    const raw   = await one("SELECT count(*) n FROM b2_sources WHERE kind=$1", [kind]);
    const live  = await one("SELECT count(*) n FROM b2_sources WHERE kind=$1 AND status='live'", [kind]);
    const teach = await one(
      `SELECT count(*) n FROM b2_sources WHERE kind=$1 AND status='live'
         AND approved_by IS NOT NULL AND approved_by NOT LIKE 'prototype:%'`, [kind]);
    return { raw, live, teach };
  };
  const audio = await byKind("audio");
  const text  = await byKind("text");
  const audioReady = await one(
    "SELECT count(*) n FROM b2_sources WHERE kind='audio' AND status='live' AND audio_url IS NOT NULL");
  out.push(row("Audio sources", audio.raw, audioReady, audio.teach, audio.live,
    audio.teach ? "audio verified" : "live but not teacher-reviewed",
    audio.live - audio.teach, audio.teach));
  out.push(row("Reading sources", text.raw, text.live, text.teach, text.live,
    text.live && !text.teach ? "awaiting teacher review" : (text.live ? "teacher-approved" : "none"),
    text.live - text.teach, text.teach));

  /* ── Derived experiences, listed by kind so "6 experiences" can never again
     stand in for six different ways of learning. */
  const { rows: expByKind } = await pool.query(
    `SELECT kind, count(*)::int AS raw,
            count(*) FILTER (WHERE status='live')::int AS live
       FROM b2_experiences GROUP BY kind ORDER BY kind`);
  const protoSrc = new Set((await q(
    `SELECT id FROM b2_sources WHERE approved_by LIKE 'prototype:%'`)).map(r => r.id));
  const { rows: expSrc } = await pool.query(
    `SELECT kind, source_id FROM b2_experiences WHERE status='live'`);
  for (const e of expByKind) {
    const live = e.live;
    const reviewed = expSrc.filter(x => x.kind === e.kind && !protoSrc.has(x.source_id)).length;
    /* Source dependency, spelled out: an experience is only as available as the
       source it derives from. */
    const srcs = [...new Set(expSrc.filter(x => x.kind === e.kind).map(x => x.source_id))];
    out.push(row(`  experiences: ${e.kind}`, e.raw, live, reviewed, live,
      srcs.join(", ") || "", live - reviewed, reviewed));
  }

  // ── Retired A1-shaped topics — the row that proves the point
  const retired = await one("SELECT count(*) n FROM topics WHERE level='b2' AND status='retired'");
  out.push(row("A1-shaped B2 topics", retired, 0, 0, 0,
    "retired: a1_methodology_conflict"));

  /* ── Maya. USABLE means a learner can reach it in the app, which is why this
     row read 0 for as long as the engine existed without a step component. It
     is counted from the published topics, not from the scenario files. */
  const mayaFiles = fs.readdirSync(path.join(__dirname, "../src/seed/b2/maya"))
    .filter(f => f.endsWith(".js")).length;
  const mayaLive = await one(
    "SELECT count(*) n FROM topics WHERE level='b2' AND status='live' AND id LIKE 'b2_maya_%'");
  out.push(row("Maya scenarios", mayaFiles, mayaLive, mayaLive, mayaLive,
    mayaLive ? "playable in-app; speaking evidence unbanded" : "not reachable in the app"));

  /* ── Expressions. RAW is what has been authored; USABLE is what a learner
     can meet in a live experience; B2-QUALITY additionally requires that the
     expression can be PRODUCED — an expression with no frame can only ever be
     recognised, and a recognition-only expression is a word list entry. */
  const expr = require("../src/b2/expressions");
  const liveSourceIds = new Set((await q("SELECT id FROM b2_sources WHERE status='live'")).map(r => r.id));
  const teacherSourceIds = new Set((await q(
    `SELECT id FROM b2_sources WHERE status='live'
       AND approved_by IS NOT NULL AND approved_by NOT LIKE 'prototype:%'`)).map(r => r.id));
  const all = [...expr.BY_ID.values()];
  const reachable = all.filter(x => liveSourceIds.has(x.sourceId));
  const producible = reachable.filter(x => x.frame);
  const teacherSeen = producible.filter(x => teacherSourceIds.has(x.sourceId));
  out.push(row("Expressions", all.length, reachable.length, teacherSeen.length, reachable.length,
    `${producible.length} producible; ${[...new Set(reachable.map(x => x.sourceId))].join(", ")}`,
    reachable.length - teacherSeen.length, teacherSeen.length));

  /* ── Writing. USABLE means a task a learner can actually reach through a live
     experience; a task row nobody can open is not a writing experience. B2Q
     additionally requires the REWRITE LOOP — assessment that stops at a verdict
     is a score screen, and the capability it claims cannot be demonstrated. */
  const tasksRaw = await one("SELECT count(*) n FROM b2_tasks");
  const { rows: wired } = await pool.query(
    `SELECT e.id, e.steps, e.status, e.source_id, e.checks, e.primary_capability,
            e.secondary_capabilities
       FROM b2_experiences e WHERE e.kind='writing'`);
  const reachableTasks = new Set();
  let rewriteLoops = 0;
  for (const e of wired) {
    for (const st of e.steps || []) {
      if (st.t === "write" && st.taskId) { reachableTasks.add(st.taskId); if (e.status === "live") rewriteLoops++; }
    }
  }
  out.push(row("Writing tasks", tasksRaw, reachableTasks.size, rewriteLoops, reachableTasks.size,
    `${rewriteLoops} with the rewrite loop; ${tasksRaw - reachableTasks.size} authored but unreachable`,
    reachableTasks.size - rewriteLoops, 0));
  const { rows: taskDetail } = await pool.query(
    `SELECT t.id, r.board, r.task_type, t.target_words,
            jsonb_array_length(t.content_points) AS points
       FROM b2_tasks t JOIN b2_rubrics r ON r.id=t.rubric_id
      WHERE t.id = ANY($1::text[]) ORDER BY t.id`, [[...reachableTasks]]);
  for (const t of taskDetail) {
    const p = require("../src/b2/task_profiles").profileFor(t.task_type);
    out.push(`    ${("live task: " + t.id).padEnd(38)}${t.board}/${t.task_type}, ${t.target_words}w, ` +
      `${t.points} Leitpunkte, checks: ${p.applies.length}, suppressed: ${p.suppresses.length}`);
  }

  // ── Interview
  const iv = require("../src/b2/interview").QUESTIONS.length;
  out.push(row("Interview questions", iv, 0, iv, 0, "unreachable without Maya delivery"));

  // ── Screening
  const { SCREENING } = require("../src/seed/b2/screening");
  const scrItems = SCREENING.sections.reduce((a, s) => a + (s.items || []).length, 0);
  out.push(row("Screening sets", 1, 1, 1, 1, `${scrItems} items + 1 writing`));

  // ── Exam
  const papers = await one("SELECT count(*) n FROM b2_papers");
  out.push(row("Goethe papers", papers, 0, 0, 0, "blueprint unverified — do not author"));
  out.push(row("telc B2 papers", papers, 0, 0, 0, "Sprachbausteine has no analogue"));
  const pflege = await one("SELECT count(*) n FROM b2_tasks t JOIN b2_rubrics r ON r.id=t.rubric_id WHERE r.board='telc_pflege'");
  out.push(row("telc Pflege tasks", pflege, pflege, pflege, pflege, "scorer + teacher model"));

  out.push("  " + "─".repeat(74));

  // ── Capability coverage, counted from LIVE content only
  const caps = require("../src/b2/capabilities");
  const { rows: liveExp } = await pool.query(
    `SELECT primary_capability, secondary_capabilities FROM b2_experiences WHERE status='live'`);
  const covered = new Set();
  const add = (primary, secondary) => {
    covered.add(primary);
    (secondary || []).forEach(c => covered.add(c));
  };
  /* language_awareness IS NOT ROUTED BY BEING LISTED. It is earned by noticing
     and correcting your own weakness, which needs the rewrite loop — a live
     writing experience with a `write` step. A writing experience that assesses
     and stops has the capability in its column and no way to demonstrate it,
     and counting that is exactly the inflation this table exists to prevent. */
  const loopLive = wired.some(e => e.status === "live" && (e.steps || []).some(st => st.t === "write"));
  for (const e of liveExp) {
    const secondary = (e.secondary_capabilities || [])
      .filter(c => c !== "language_awareness" || loopLive);
    add(e.primary_capability, secondary);
  }
  /* Maya is published straight to `topics`, not through b2_experiences, so
     counting capabilities from that table alone reported her two capabilities
     as unrouted while she was live and playable. Any route counts, whichever
     table it happens to live in. */
  for (const f of fs.readdirSync(path.join(__dirname, "../src/seed/b2/maya")).filter(f => f.endsWith(".js"))) {
    const sc = require(path.join(__dirname, "../src/seed/b2/maya", f));
    const isLive = await one(
      "SELECT count(*) n FROM topics WHERE level='b2' AND status='live' AND id=$1", [`b2_${sc.id}`]);
    if (isLive) add(sc.declaration.primary_capability, sc.declaration.secondary_capabilities);
  }
  const withRoute = caps.CAPABILITIES.filter(c => covered.has(c.id));
  const without = caps.CAPABILITIES.filter(c => !covered.has(c.id));
  out.push(`\n  Capabilities with a LIVE route:    ${withRoute.length}/12  ${withRoute.map(c => c.id).join(", ")}`);
  out.push(`  Capabilities with NO live route:   ${without.length}/12  ${without.map(c => c.id).join(", ")}`);

  /* Capabilities routed only through Maya, reported against whether Maya is
     actually reachable rather than against a hand-typed sentence. */
  const mayaOnly = ["maintain_discussion", "react_unexpected"];
  out.push(`\n  Reachable ONLY through Maya: ${mayaOnly.join(", ")} — Maya is ${
    mayaLive ? `playable (${mayaLive} scenario${mayaLive === 1 ? "" : "s"})` : "NOT reachable"}.`);
  const unreviewed = await one(
    "SELECT count(*) n FROM b2_sources WHERE status='live' AND approved_by LIKE 'prototype:%'");
  if (unreviewed) out.push(`  ${unreviewed} live source(s) are prototypes awaiting teacher review — counted LIVE, not B2-QUALITY.`);

  // ── Themes
  /* ── Which experience kinds carry each capability. "9/12 covered" hides the
     thing that matters: a capability reachable only one way is one retired
     source away from being reachable no way at all. */
  const routes = new Map();
  const note = (cap, kind) => {
    if (!cap) return;
    if (!routes.has(cap)) routes.set(cap, new Set());
    routes.get(cap).add(kind);
  };
  const { rows: liveKinds } = await pool.query(
    `SELECT kind, primary_capability, secondary_capabilities FROM b2_experiences WHERE status='live'`);
  for (const e of liveKinds) {
    note(e.primary_capability, e.kind);
    for (const c of e.secondary_capabilities || []) {
      if (c === "language_awareness" && !loopLive) continue;
      note(c, e.kind === "writing" ? "writing (rewrite loop)" : e.kind);
    }
  }
  for (const f of fs.readdirSync(path.join(__dirname, "../src/seed/b2/maya")).filter(f => f.endsWith(".js"))) {
    const sc = require(path.join(__dirname, "../src/seed/b2/maya", f));
    if (!(await one("SELECT count(*) n FROM topics WHERE level='b2' AND status='live' AND id=$1", [`b2_${sc.id}`]))) continue;
    note(sc.declaration.primary_capability, "speaking");
    for (const c of sc.declaration.secondary_capabilities || []) note(c, "speaking");
  }
  out.push("\n  Capability routes (by live experience kind):");
  for (const c of caps.CAPABILITIES) {
    const r = [...(routes.get(c.id) || [])];
    out.push(`    ${c.id.padEnd(22)}${r.length ? r.join(", ") : "— no live route"}`);
  }

  /* ── GOAL RELEVANCE. A goal is served when the dimensions it turns on have
     live content behind them — not when a goal string exists in a config. */
  const GOALS = {
    anerkennung: ["writing", "vocabulary", "listening"],
    job:         ["speaking", "listening"],
    ausbildung:  ["writing", "reading"],
    exam:        ["writing", "reading", "listening", "speaking"],
    general:     ["writing", "reading", "listening", "speaking", "vocabulary", "grammar"],
  };
  const liveKindSet = new Set(liveKinds.map(e => e.kind));
  if (mayaLive) liveKindSet.add("speaking");
  out.push("\n  Goal pathways (critical dimensions with live content):");
  for (const [g, dims] of Object.entries(GOALS)) {
    const have = dims.filter(d => liveKindSet.has(d));
    const miss = dims.filter(d => !liveKindSet.has(d));
    out.push(`    ${g.padEnd(13)}${have.length}/${dims.length}${miss.length ? `   missing: ${miss.join(", ")}` : "   complete"}`);
  }

  const { rows: themes } = await pool.query(
    `SELECT DISTINCT theme FROM b2_sources WHERE status='live' ORDER BY theme`);
  out.push(`\n  Goethe themes covered by live content: ${themes.length}/14  (${themes.map(t => t.theme).join(", ") || "none"})`);

  console.log(out.join("\n") + "\n");
  await pool.end();
})().catch(e => { console.error(e.message); process.exit(1); });
