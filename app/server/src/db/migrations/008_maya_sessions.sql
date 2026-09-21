-- MAYA CONVERSATION SESSIONS
--
-- Server-authoritative conversation state for Maya scenarios.
-- Survives page refresh, stores full dialogue log, turns, memory,
-- and terminal outcome, and enforces exactly one active session per
-- learner per scenario (abandoning previous sessions on restart).

CREATE TABLE IF NOT EXISTS b2_maya_sessions (
  id                  SERIAL PRIMARY KEY,
  user_id             INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scenario_id        TEXT NOT NULL,
  scenario_version    INT NOT NULL DEFAULT 1,
  session_id         TEXT NOT NULL UNIQUE,
  current_beat        TEXT NOT NULL,
  press_count         INT NOT NULL DEFAULT 0,
  learner_turns_count INT NOT NULL DEFAULT 0,
  max_learner_turns   INT NOT NULL DEFAULT 7,
  dialogue_log        JSONB NOT NULL DEFAULT '[]'::jsonb,
  turns               JSONB NOT NULL DEFAULT '[]'::jsonb,
  memory              JSONB NOT NULL DEFAULT '{}'::jsonb,
  status              TEXT NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active', 'abandoned', 'resolved', 'unresolved', 'trap_accepted')),
  terminal_outcome    TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at         TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS b2_maya_one_active
  ON b2_maya_sessions (user_id, scenario_id)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS b2_maya_sessions_user_idx
  ON b2_maya_sessions (user_id, scenario_id, created_at DESC);
