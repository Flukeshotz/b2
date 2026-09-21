/**
 * Author → gate → database. Does NOT publish to runtime; only a human does that.
 *
 *   node tools/seed_b2_source.js src_muede
 *   node tools/seed_b2_source.js src_muede --publish   # after approval
 *
 * The two halves are deliberately separate commands. Seeding writes authoring
 * rows at status='gated'; publishing copies APPROVED content into `topics`,
 * which is the only thing a learner can reach.
 */

const path = require("path");
const { Pool } = require("pg");
const { gateSource } = require("./gate_b2_source");

const pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgresql://localhost/learn_german" });

async function seed(id) {
  const src = require(path.join(__dirname, `../src/seed/b2/${id}.js`));
  const { EXPERIENCES } = require(path.join(__dirname, `../src/seed/b2/exp_${id.replace(/^src_/, "")}.js`));

  const gate = gateSource(src, EXPERIENCES);
  if (!gate.ok) {
    console.error(`\nBLOCKED by gates — ${gate.fails.length} failure(s). Nothing written.`);
    for (const f of gate.fails) console.error(`  FAIL  ${f}`);
    process.exit(1);
  }

  const d = src.DECLARATION;
  await pool.query(
    `INSERT INTO b2_sources
       (id, kind, title, hook, theme, context, cefr_tier, declaration, script,
        transcript, duration_s, markers, status, gate_report)
     VALUES ($1,$13,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'gated',$12)
     ON CONFLICT (id) DO UPDATE SET
       kind=$13, title=$2, hook=$3, theme=$4, context=$5, cefr_tier=$6, declaration=$7,
       script=$8, transcript=$9, duration_s=$10, markers=$11,
       -- Re-seeding RESETS approval. Content that changed after a teacher signed
       -- off is not the content they signed off on.
       status='gated', gate_report=$12, approved_by=NULL, approved_at=NULL, updated_at=now()`,
    [id, src.TITLE || d.title || titleOf(src), hookOf(src), d.theme,
     d.context || "universal", d.cefr_tier, JSON.stringify(d),
     JSON.stringify(src.SCRIPT), src.TRANSCRIPT, src.DURATION_S || null,
     JSON.stringify(src.MARKERS || []), JSON.stringify(gate), src.KIND || "audio"]
  );

  for (const e of EXPERIENCES) {
    await pool.query(
      `INSERT INTO b2_experiences
         (id, source_id, kind, ord, title, minutes, primary_capability,
          secondary_capabilities, checks, teaches, steps, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'gated')
       ON CONFLICT (id) DO UPDATE SET
         kind=$3, ord=$4, title=$5, minutes=$6, primary_capability=$7,
         secondary_capabilities=$8, checks=$9, teaches=$10, steps=$11,
         status='gated', updated_at=now()`,
      [e.id, id, e.kind, e.ord, e.title, e.minutes, e.primary_capability,
       e.secondary_capabilities || [], e.checks || [],
       JSON.stringify(e.teaches || []), JSON.stringify(e.steps)]
    );
  }

  console.log(`\nSeeded ${id} at status='gated' with ${EXPERIENCES.length} experiences.`);
  if (gate.warns.length) console.log(`  ${gate.warns.length} warning(s) recorded for the reviewer.`);
  console.log(`  Next: a teacher reviews and approves. Nothing is reachable by a learner yet.`);
}

const titleOf = (src) => src.SCRIPT?.[0]?.de?.slice(0, 60) || "Untitled";
const hookOf = (src) => src.HOOK || "—";

/**
 * Publish APPROVED experiences into `topics` (level='b2').
 *
 * The runtime knows nothing about sources. It sees a topic with subs and steps,
 * exactly like A1 — which is why progress, review injection and the lesson
 * runner need no new code.
 */
async function publish(id) {
  const { rows: src } = await pool.query(`SELECT * FROM b2_sources WHERE id=$1`, [id]);
  if (!src[0]) { console.error(`no such source: ${id}`); process.exit(1); }
  if (src[0].status !== "approved") {
    console.error(`\nRefusing to publish: ${id} is at status='${src[0].status}', not 'approved'.`);
    console.error(`Only a human reviewer moves content to 'approved'. See the review page.`);
    process.exit(1);
  }

  const { rows: exps } = await pool.query(
    `SELECT * FROM b2_experiences WHERE source_id=$1 AND status='approved' ORDER BY ord`, [id]);
  if (!exps.length) { console.error(`no approved experiences for ${id}`); process.exit(1); }

  const base = await pool.query(`SELECT COALESCE(MAX(order_index), -1) + 1 AS n FROM topics WHERE level='b2'`);
  let ord = base.rows[0].n;

  for (const e of exps) {
    const topicId = `b2_${e.id.replace(/^exp_/, "")}`;
    const ICON = { listening: "🎧", vocabulary: "🔗", grammar: "📐",
                   writing: "✍️", reading: "📄", speaking: "🎙️", exam: "📋" };
    await pool.query(
      `INSERT INTO topics (id, order_index, icon, title, capability, proof, subs, level)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'b2')
       ON CONFLICT (id) DO UPDATE SET
         order_index=$2, icon=$3, title=$4, capability=$5, proof=$6, subs=$7, level='b2'`,
      [topicId, ord++, ICON[e.kind] || "📘", e.title,
       // `capability` is the learner-facing line the A1 home already renders.
       require("../src/b2/capabilities").phrase(e.primary_capability) || e.title,
       src[0].title,
       JSON.stringify([{ key: "main", label: e.title, teaches: e.teaches, steps: e.steps }])]
    );
    await pool.query(
      `UPDATE b2_experiences SET status='live', published_topic_id=$2, updated_at=now() WHERE id=$1`,
      [e.id, topicId]);
    console.log(`  published ${e.id} → topics/${topicId}`);
  }
  await pool.query(`UPDATE b2_sources SET status='live', updated_at=now() WHERE id=$1`, [id]);
  console.log(`\n${id} is live. ${exps.length} experiences reachable.`);
}

(async () => {
  const id = process.argv[2] || "src_muede";
  if (process.argv.includes("--publish")) await publish(id);
  else await seed(id);
  await pool.end();
})().catch(e => { console.error(e.message); process.exit(1); });
