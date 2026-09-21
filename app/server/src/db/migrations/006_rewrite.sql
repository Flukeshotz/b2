-- THE REWRITE LOOP.
--
-- A rewrite is not a second first attempt. It is the same learner, the same
-- task, the same text, after being told ONE thing to fix — and the only reason
-- the loop is worth anything is that the system can compare the two and say
-- whether the thing actually got fixed.
--
-- Without `parent_id` the two submissions look like two independent essays, the
-- profile counts them as two occasions, and "did you improve?" is unanswerable.
-- `targeted_check` records what the learner was asked to fix, so improvement is
-- measured against what was taught rather than against whatever happened to
-- change.

ALTER TABLE b2_submissions
  ADD COLUMN IF NOT EXISTS parent_id      integer REFERENCES b2_submissions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS targeted_check text,
  ADD COLUMN IF NOT EXISTS experience_id  text;

CREATE INDEX IF NOT EXISTS b2_submissions_parent_idx ON b2_submissions (parent_id);

-- A submission cannot be its own rewrite.
ALTER TABLE b2_submissions DROP CONSTRAINT IF EXISTS b2_submissions_not_own_parent;
ALTER TABLE b2_submissions ADD CONSTRAINT b2_submissions_not_own_parent
  CHECK (parent_id IS NULL OR parent_id <> id);

-- DRAFTS. A learner who closes the tab halfway through must not lose their
-- text; losing somebody's writing is the one failure this product cannot
-- recover from. One draft per learner per task, overwritten as they type.
CREATE TABLE IF NOT EXISTS b2_drafts (
  user_id    integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_id    text    NOT NULL REFERENCES b2_tasks(id) ON DELETE CASCADE,
  parent_id  integer REFERENCES b2_submissions(id) ON DELETE CASCADE,
  text       text    NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, task_id)
);
