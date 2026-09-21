-- Full practice papers a learner sits end to end, as opposed to the single
-- writing task b2_tasks already holds.
--
-- Structured to each board's REAL shape, because a paper that does not match
-- the exam trains the wrong thing:
--   Goethe B2 — Lesen 65min, Hören 40min, Schreiben 75min, Sprechen 15min
--   telc B2   — Leseverstehen + Sprachbausteine 90min, Hörverstehen 20min,
--               Schriftlicher Ausdruck 30min, Mündlich 15min
--
-- Nothing here reproduces a real telc or Goethe paper. Items are either
-- authored for Skillcase in the board's published format, or drawn from
-- openly licensed corpora with the licence recorded on the row.

CREATE TABLE IF NOT EXISTS b2_papers (
  id            TEXT PRIMARY KEY,
  board         TEXT NOT NULL CHECK (board IN ('goethe','telc','telc_pflege')),
  title         TEXT NOT NULL,
  minutes       INT  NOT NULL,
  source        TEXT NOT NULL,          -- provenance and licence, always
  provisional   BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS b2_paper_sections (
  id            SERIAL PRIMARY KEY,
  paper_id      TEXT NOT NULL REFERENCES b2_papers(id) ON DELETE CASCADE,
  module        TEXT NOT NULL CHECK (module IN ('lesen','hoeren','sprachbausteine','schreiben','sprechen')),
  part_no       INT  NOT NULL,
  title         TEXT NOT NULL,
  instruction   TEXT NOT NULL,
  minutes       INT,
  max_points    INT,
  passage       TEXT,                   -- reading text, or the transcript behind an audio clip
  audio_url     TEXT,
  -- A writing or speaking part points at the rubric-bearing task rather than
  -- duplicating it, so one task cannot drift out of sync with its rubric.
  task_id       TEXT REFERENCES b2_tasks(id),
  UNIQUE (paper_id, module, part_no)
);

CREATE TABLE IF NOT EXISTS b2_paper_items (
  id            SERIAL PRIMARY KEY,
  section_id    INT NOT NULL REFERENCES b2_paper_sections(id) ON DELETE CASCADE,
  item_no       INT NOT NULL,
  stem          TEXT NOT NULL,
  options       JSONB NOT NULL,         -- ["...","...","..."]
  answer        INT  NOT NULL,          -- index into options
  -- Why the key is the key. Without it a learner who guesses right learns
  -- nothing, and a learner who guesses wrong cannot tell what they missed.
  rationale     TEXT,
  UNIQUE (section_id, item_no)
);

-- One attempt at one paper, so a learner can stop and come back.
CREATE TABLE IF NOT EXISTS b2_paper_attempts (
  id            SERIAL PRIMARY KEY,
  user_id       INT NOT NULL,
  paper_id      TEXT NOT NULL REFERENCES b2_papers(id) ON DELETE CASCADE,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at   TIMESTAMPTZ,
  responses     JSONB NOT NULL DEFAULT '{}'::jsonb,
  scores        JSONB
);
CREATE INDEX IF NOT EXISTS b2_paper_attempts_user ON b2_paper_attempts (user_id, paper_id);
