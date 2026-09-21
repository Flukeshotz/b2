// Loads schema.sql, then seeds the 10-topic curriculum (extracted verbatim
// from prototype/index.html's A1 array) plus one demo user for the prototype.
const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL || "postgresql://localhost/learn_german" });

async function main() {
  const schema = fs.readFileSync(path.join(__dirname, "../db/schema.sql"), "utf8");
  await pool.query(schema);

  const a1 = JSON.parse(fs.readFileSync(path.join(__dirname, "a1_curriculum.json"), "utf8"));

  // Scoped to a1: this seeder owns the A1 curriculum only. An unscoped DELETE
  // would drop the B2 topics too — and their user_progress rows reference
  // topics(id), so the delete would either fail or take real progress with it.
  await pool.query("DELETE FROM topics WHERE level = 'a1'");
  for (let i = 0; i < a1.length; i++) {
    const t = a1[i];
    // Level is written explicitly rather than left to the column default, so
    // re-seeding can never silently reclassify a topic that has moved level.
    await pool.query(
      `INSERT INTO topics (id, order_index, icon, title, capability, proof, subs, level)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (id) DO UPDATE SET order_index=$2, icon=$3, title=$4, capability=$5, proof=$6, subs=$7, level=$8`,
      [t.id, i, t.icon, t.title, t.capability, t.proof, JSON.stringify(t.subs), t.level || "a1"]
    );
  }

  // No unique constraint on users.name, so this checks explicitly instead of
  // relying on ON CONFLICT — that silently inserted a fresh duplicate user
  // (and orphaned user_id=1, which the API hardcodes) every time seed ran.
  const existing = await pool.query("SELECT id FROM users WHERE name='Priya Sharma' LIMIT 1");
  let userId = existing.rows[0]?.id;
  if (!userId) {
    const inserted = await pool.query("INSERT INTO users (name) VALUES ('Priya Sharma') RETURNING id");
    userId = inserted.rows[0].id;
  }
  await pool.query(
    `INSERT INTO user_stats (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
    [userId]
  );

  console.log(`Seeded ${a1.length} topics. Demo user id=${userId}`);
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
