-- 009 — ASSESSMENT ATTEMPTS.
--
-- The screening has never been an ATTEMPT. `/screening/submit` wrote evidence
-- rows and nothing else: no id, no start, no completion, no version, no score,
-- no per-item record. So a learner's past results were unrecoverable and
-- "did I improve?" had nothing to read. This migration is what makes that
-- question answerable.
--
-- IT GENERALISES b2_paper_attempts RATHER THAN ADDING A SECOND ATTEMPTS TABLE.
-- That table already enforces every invariant an assessment needs and has the
-- scars to prove it (see b2/exam_attempt.js): a completed attempt is immutable,
-- finish is idempotent so a reload cannot record a second sitting, responses
-- survive a refresh, and abandonment closes the old attempt instead of losing
-- it. Reimplementing that next door would mean reimplementing those bugs.
--
-- THE EXAM PATH MUST NOT NOTICE. paper_id becomes nullable, which on its own
-- would weaken a live table holding real exam attempts — so the invariant is
-- restored as a CHECK: a 'paper' attempt still requires paper_id, exactly as
-- the NOT NULL did. Every existing row is 'paper' by default, and every exam
-- query filters on paper_id, which an assessment row (paper_id NULL) can never
-- match.

BEGIN;

ALTER TABLE b2_paper_attempts
  ADD COLUMN IF NOT EXISTS kind TEXT NOT NULL DEFAULT 'paper',
  ADD COLUMN IF NOT EXISTS assessment_version TEXT,
  ADD COLUMN IF NOT EXISTS measured_items INT,
  ADD COLUMN IF NOT EXISTS skipped_items INT,
  -- How the sitting was put together: target capabilities, targeted/broad
  -- split, coverage shortfall, exhausted slots. Stored because a result has to
  -- stay explainable after the content registry moves on.
  ADD COLUMN IF NOT EXISTS composition JSONB;

ALTER TABLE b2_paper_attempts ALTER COLUMN paper_id DROP NOT NULL;

DO $$ BEGIN
  ALTER TABLE b2_paper_attempts ADD CONSTRAINT b2_attempt_kind
    CHECK (kind IN ('paper','assessment'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE b2_paper_attempts ADD CONSTRAINT b2_attempt_shape CHECK (
    (kind = 'paper'      AND paper_id IS NOT NULL) OR
    (kind = 'assessment' AND assessment_version IS NOT NULL)
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS b2_attempts_assessment
  ON b2_paper_attempts (user_id, kind, finished_at DESC NULLS LAST);

-- ONE ROW PER ITEM THE LEARNER WAS SHOWN.
--
-- The row's existence means "shown". No row means "never shown". That
-- distinction is the whole reason this table exists rather than a jsonb blob:
-- shown-and-skipped is a fact about the sitting, and a future version of the
-- content must not be able to change what a past attempt presented.
--
-- `correct` IS NULLABLE ON PURPOSE, and it is the most important column here.
--   true   answered, right
--   false  answered, wrong
--   NULL   not measured — skipped, or not objectively scorable at all
-- A skipped item is therefore never false. It cannot depress a score, cannot
-- create a weakness, and reads as "Not measured yet". There is no negative
-- marking anywhere in this product and this column is where that is enforced.
CREATE TABLE IF NOT EXISTS b2_assessment_items (
  id           SERIAL PRIMARY KEY,
  attempt_id   INT  NOT NULL REFERENCES b2_paper_attempts(id) ON DELETE CASCADE,
  -- Denormalised from the registry ON PURPOSE. A completed attempt has to stay
  -- reproducible even if the item is later edited, re-slotted or withdrawn, so
  -- the sitting records what it actually asked rather than a pointer to what
  -- that id means today.
  item_id      TEXT NOT NULL,
  slot         TEXT NOT NULL,
  version      TEXT NOT NULL,
  position     INT  NOT NULL,
  skill        TEXT NOT NULL,
  capability   TEXT,
  check_id     TEXT,
  targeted     BOOLEAN NOT NULL DEFAULT false,
  response     TEXT,
  correct      BOOLEAN,
  skipped      BOOLEAN NOT NULL DEFAULT false,
  measured     BOOLEAN NOT NULL DEFAULT false,
  -- Which evidence row this produced, so a weakness can be traced back to the
  -- assessment that found it.
  evidence_id  INT REFERENCES b2_evidence(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (attempt_id, item_id)
);

-- A skipped item is never measured, and a measured item is never skipped.
-- Belt and braces: the application already refuses to do this, and a constraint
-- means a future caller cannot.
DO $$ BEGIN
  ALTER TABLE b2_assessment_items ADD CONSTRAINT b2_item_skip_shape CHECK (
    NOT (skipped AND measured) AND
    (NOT skipped OR correct IS NULL)
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS b2_assessment_items_attempt
  ON b2_assessment_items (attempt_id, position);
CREATE INDEX IF NOT EXISTS b2_assessment_items_capability
  ON b2_assessment_items (attempt_id, capability);

COMMIT;
