-- Real per-request identity, replacing the hardcoded USER_ID=1 that every
-- route ran as. The audit found the service layer already takes userId as an
-- explicit argument everywhere (assessment_store, profile, maya, exam_attempt)
-- — this migration is what lets a route finally supply a REAL one instead of
-- a constant.
--
-- Minimal by design: email + scrypt password hash (Node's built-in crypto,
-- no new native dependency to compile in a sandboxed environment) and a
-- session-token table. No OAuth, no email verification, no password reset —
-- those are real gaps, listed as such, not hidden behind this migration.

ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE TABLE IF NOT EXISTS sessions (
  token       TEXT PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
