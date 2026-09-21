const { Pool } = require("pg");

// Managed Postgres on Railway/Render requires SSL for external connections;
// a local dev Postgres has none to offer. Explicit opt-in rather than
// guessing from the hostname, since "localhost" can also be a DB container
// on the same host as the app in a real deployment.
module.exports = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://localhost/learn_german",
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});
