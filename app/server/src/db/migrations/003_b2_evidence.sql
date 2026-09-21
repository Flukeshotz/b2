-- 003 — evidence and profile.
--
-- ONE evidence table for every skill. Writing, grammar, vocabulary, listening,
-- reading, Maya and exam all write the same row shape, weighted by how much we
-- trust the source. That is what makes six skills one product rather than six
-- features, and it is why the recommendation engine needs no per-skill logic.
--
-- No authentication exists in this repository, so user_id is the demo user.
-- Every query takes it as a parameter regardless — see b2/profile.js.

BEGIN;

CREATE TABLE IF NOT EXISTS b2_evidence (
  id            SERIAL PRIMARY KEY,
  user_id       INT  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dimension     TEXT NOT NULL CHECK (dimension IN
                ('writing','grammar','vocabulary','listening','reading','speaking')),
  capability    TEXT,                        -- from b2/capabilities.js, when known
  check_id      TEXT,                        -- analyse.js vocabulary, when applicable
  outcome       REAL NOT NULL CHECK (outcome BETWEEN 0 AND 1),
  -- Confidence in the SOURCE, not in the learner. Writing is 1.0 because it is
  -- the only skill held out against expert ratings; speaking is low because it
  -- is uncalibrated and must inform recommendations without setting a band.
  weight        REAL NOT NULL DEFAULT 0.6 CHECK (weight > 0 AND weight <= 1),
  source_kind   TEXT NOT NULL,               -- 'screening' | 'experience' | 'submission' | 'paper'
  source_ref    TEXT,                        -- experience id, submission id, …
  detail        TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS b2_evidence_user_dim_idx ON b2_evidence (user_id, dimension, created_at DESC);
CREATE INDEX IF NOT EXISTS b2_evidence_user_check_idx ON b2_evidence (user_id, check_id, created_at DESC);

-- The learner's current standing. Derived from recent evidence, never a lifetime
-- average: a learner who has improved must not stay labelled by her worst early
-- work. Bands are words, not numbers — there is no defensible total.
CREATE TABLE IF NOT EXISTS b2_profile (
  user_id       INT  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dimension     TEXT NOT NULL,
  band          TEXT NOT NULL CHECK (band IN ('needs_practice','developing','good','strong')),
  score         REAL NOT NULL,               -- internal only, never shown
  trend         TEXT CHECK (trend IN ('up','flat','down')),
  evidence_n    INT  NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, dimension)
);

-- The goal, captured once in onboarding. It filters what matters BEFORE the
-- profile ranks: two learners with identical profiles and different goals
-- should not get the same first recommendation.
CREATE TABLE IF NOT EXISTS b2_learner_goal (
  user_id       INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  goal          TEXT NOT NULL CHECK (goal IN ('anerkennung','job','ausbildung','exam','unsure')),
  board         TEXT,                        -- 'goethe' | 'telc' | 'telc_pflege' | null
  exam_date     DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMIT;
