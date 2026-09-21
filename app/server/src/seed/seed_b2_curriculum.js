// Seeds the B2 topics into the shared `topics` table at level='b2'.
//
// Separate from seed.js on purpose: that one owns the A1 curriculum and deletes
// level='a1' before re-inserting. Running either must never disturb the other's
// content — or a learner's progress, which references topics(id).
const { Pool } = require("pg");
const { TOPICS, RETIRED, RETIRED_REASON } = require("./b2_curriculum");

const pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgresql://localhost/learn_german" });

async function main() {
  /* Refuse rather than quietly re-publishing retired pedagogy. Somebody running
     the seeder months from now should be told why, not silently undo a
     decision. */
  if (RETIRED) {
    console.error(`\nThese four topics are RETIRED (${RETIRED_REASON}) and will not be seeded.`);
    console.error("They were built with A1 exercise mechanics. The German is worth keeping;");
    console.error("the experience design is not. Rebuild in the B2 modality instead of");
    console.error("re-seeding — see the header of src/seed/b2_curriculum.js.");
    process.exit(1);
  }

  const has = await pool.query(
    `SELECT 1 FROM information_schema.columns WHERE table_name='topics' AND column_name='level'`);
  if (!has.rowCount) {
    console.error("topics.level is missing. Run: node tools/migrate.js --apply");
    process.exit(1);
  }

  // Upsert, never delete. A B2 topic id that disappears from this file keeps its
  // row and any progress against it, rather than failing a foreign key or
  // silently erasing what a learner finished.
  for (let i = 0; i < TOPICS.length; i++) {
    const { id, icon, title, capability, proof, subs } = TOPICS[i];
    await pool.query(
      `INSERT INTO topics (id, order_index, icon, title, capability, proof, subs, level)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'b2')
       ON CONFLICT (id) DO UPDATE SET
         order_index=$2, icon=$3, title=$4, capability=$5, proof=$6, subs=$7, level='b2'`,
      [id, i, icon, title, capability, proof, JSON.stringify(subs)]
    );
  }

  const { rows } = await pool.query("SELECT level, count(*)::int AS n FROM topics GROUP BY level ORDER BY level");
  console.log("Seeded B2 curriculum. topics by level:", rows.map(r => `${r.level}=${r.n}`).join("  "));
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
