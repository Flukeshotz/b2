-- Learn German with Maya — PERN prototype schema
-- Curriculum content (topics/subs/steps) stays JSONB — the step shapes are
-- deliberately heterogeneous per type (9 types), and this content is authored/
-- edited as a unit in the prototype, not queried field-by-field.

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS topics (
  id            TEXT PRIMARY KEY,          -- e.g. 'a1l1'
  order_index   INT NOT NULL,
  icon          TEXT NOT NULL,
  title         TEXT NOT NULL,
  capability    TEXT NOT NULL,
  proof         TEXT NOT NULL,
  subs          JSONB NOT NULL,            -- [{key,label,teaches,steps}, ...]
  -- One table serves every CEFR level. A1 unlocks strictly in order_index
  -- sequence; B2 does not, and is reached from its own door. Without this
  -- column a B2 topic would sit locked behind all thirty A1 lessons.
  -- Existing databases get this via src/db/migrations/001_topics_level.sql.
  level         TEXT NOT NULL DEFAULT 'a1' CHECK (level IN ('a1','a2','b1','b2'))
);
CREATE INDEX IF NOT EXISTS topics_level_order_idx ON topics (level, order_index);

CREATE TABLE IF NOT EXISTS user_progress (
  user_id       INT NOT NULL REFERENCES users(id),
  topic_id      TEXT NOT NULL REFERENCES topics(id),
  sub_key       TEXT NOT NULL,             -- 'learn' | 'practice' | 'apply'
  completed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, topic_id, sub_key)
);

CREATE TABLE IF NOT EXISTS review_queue (
  user_id       INT NOT NULL REFERENCES users(id),
  de            TEXT NOT NULL,
  en            TEXT NOT NULL,
  icon          TEXT NOT NULL DEFAULT '❓',
  queued_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, de)
);

CREATE TABLE IF NOT EXISTS user_stats (
  user_id             INT PRIMARY KEY REFERENCES users(id),
  streak              INT NOT NULL DEFAULT 1,
  last_day            DATE,
  words               TEXT[] NOT NULL DEFAULT '{}',
  best_combo          INT NOT NULL DEFAULT 0,
  listen_skip_until   TIMESTAMPTZ,
  speak_skip_until    TIMESTAMPTZ
);
