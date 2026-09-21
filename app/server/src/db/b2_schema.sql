-- Skillcase B2 — verdict engine schema
-- Design rationale lives in /Users/harsh/B2/docs/04-architecture.md §15.
--
-- Unlike the A1 curriculum (heterogeneous step shapes, authored as a unit,
-- so JSONB), B2 submissions ARE queried field-by-field: calibration slices by
-- board, module and rubric version, and those slices are the entire moat.
-- So these are real columns, not a JSONB blob.

CREATE TABLE IF NOT EXISTS b2_exam_targets (
  id            SERIAL PRIMARY KEY,
  user_id       INT NOT NULL REFERENCES users(id),
  board         TEXT NOT NULL CHECK (board IN ('goethe','telc','telc_pflege')),
  module        TEXT NOT NULL CHECK (module IN ('schreiben','lesen','hoeren','sprechen')),
  exam_date     DATE,
  centre        TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, board, module)
);

-- Rubrics are versioned data, never edited in place. A board changing its
-- format must produce a NEW version, so predictions made under the old one
-- stay attributable to it -- see docs/05-edge-cases.md §4.4.
CREATE TABLE IF NOT EXISTS b2_rubrics (
  id                SERIAL PRIMARY KEY,
  board             TEXT NOT NULL CHECK (board IN ('goethe','telc','telc_pflege')),
  module            TEXT NOT NULL,
  task_type         TEXT NOT NULL,
  version           INT  NOT NULL,
  provisional       BOOLEAN NOT NULL DEFAULT false,  -- true until the board's real criteria are held
  dimensions        JSONB NOT NULL,                  -- [{id,label,weight,bands:[...]}]
  scale_max         INT  NOT NULL DEFAULT 100,  -- board-native display scale (telc SA = 45)
  subtest_weight    REAL,                        -- share of the whole exam (telc SA = 0.15)
  pass_mark         INT  NOT NULL DEFAULT 60,    -- normalised %, NOT board-native points
  borderline_low    INT  NOT NULL,                   -- the band in which the board itself
  borderline_high   INT  NOT NULL,                   -- would trigger a third rater
  UNIQUE (board, module, task_type, version)
);

CREATE TABLE IF NOT EXISTS b2_tasks (
  id             TEXT PRIMARY KEY,
  rubric_id      INT NOT NULL REFERENCES b2_rubrics(id),
  prompt_de      TEXT NOT NULL,
  content_points JSONB NOT NULL DEFAULT '[]',        -- [{id,label_de,detector}]
  target_words   INT,
  source         TEXT
);

CREATE TABLE IF NOT EXISTS b2_submissions (
  id             SERIAL PRIMARY KEY,
  user_id        INT  NOT NULL REFERENCES users(id),
  task_id        TEXT NOT NULL REFERENCES b2_tasks(id),
  text           TEXT NOT NULL,
  word_count     INT  NOT NULL,
  attempt_no     INT  NOT NULL DEFAULT 1,
  -- Composition telemetry. integrity_flag excludes the row from calibration
  -- but never from the learner's own verdict -- docs/05-edge-cases.md §2.1.
  compose_ms     INT,
  paste_events   INT NOT NULL DEFAULT 0,
  integrity_flag TEXT,
  submitted_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS b2_findings (
  id             SERIAL PRIMARY KEY,
  submission_id  INT NOT NULL REFERENCES b2_submissions(id) ON DELETE CASCADE,
  source         TEXT NOT NULL CHECK (source IN ('deterministic','model','human')),
  check_id       TEXT NOT NULL,
  state          TEXT NOT NULL CHECK (state IN ('pass','warn','fail')),
  detail         TEXT NOT NULL,
  evidence       JSONB NOT NULL DEFAULT '[]',        -- spans from the learner's own text
  confidence     REAL
);

CREATE TABLE IF NOT EXISTS b2_verdicts (
  id                SERIAL PRIMARY KEY,
  submission_id     INT NOT NULL UNIQUE REFERENCES b2_submissions(id) ON DELETE CASCADE,
  rubric_id         INT NOT NULL REFERENCES b2_rubrics(id),
  predicted_score   INT NOT NULL,
  ci_low            INT NOT NULL,                    -- never a bare point estimate:
  ci_high           INT NOT NULL,                    -- the board triggers a 3rd rater at the line
  borderline        BOOLEAN NOT NULL DEFAULT false,
  reasons           JSONB NOT NULL,                  -- exactly two -- triage is the product
  weakness_ids      JSONB NOT NULL DEFAULT '[]',
  next_action       TEXT,
  human_reviewed    BOOLEAN NOT NULL DEFAULT false,
  model_available   BOOLEAN NOT NULL DEFAULT false,  -- false => deterministic-only, said so in the UI
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The moat. Nothing else in this schema matters without rows in here.
CREATE TABLE IF NOT EXISTS b2_outcomes (
  id                 SERIAL PRIMARY KEY,
  user_id            INT NOT NULL REFERENCES users(id),
  board              TEXT NOT NULL,
  module             TEXT NOT NULL,
  real_score         INT  NOT NULL,
  passed             BOOLEAN NOT NULL,
  exam_date          DATE,
  verification_tier  TEXT NOT NULL DEFAULT 'self_reported'
                     CHECK (verification_tier IN ('self_reported','screenshot','cohort_confirmed')),
  reported_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS b2_submissions_user_idx ON b2_submissions(user_id);
CREATE INDEX IF NOT EXISTS b2_findings_submission_idx ON b2_findings(submission_id);
CREATE INDEX IF NOT EXISTS b2_outcomes_user_idx ON b2_outcomes(user_id, board, module);
