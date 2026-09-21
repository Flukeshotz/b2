-- Only one OPEN assessment attempt per learner, enforced at the database, not
-- just by a SELECT-then-INSERT in application code.
--
-- FOUND LIVE, NOT HYPOTHETICALLY. Driving a real browser click-through of
-- core-2026b (the exact "actually drive the flow" requirement this migration
-- exists to satisfy) produced two open attempts with started_at a few
-- milliseconds apart the first time a page reload raced React StrictMode's
-- double effect-invocation in development. `startVersion`'s existing guard —
-- SELECT for an open attempt, INSERT one if none exists — is correct for a
-- single caller but not atomic across two: both selects can run before either
-- insert commits, and both see "no open attempt". The learner's answers all
-- landed on the first row; "resume" (ORDER BY id DESC LIMIT 1) picked up the
-- second, empty one, and she appeared to have lost every answer on refresh.
--
-- A partial unique index makes the second INSERT fail instead of silently
-- succeeding. The application catches that failure and resumes the row that
-- won, which is exactly what should have happened in the first place.
CREATE UNIQUE INDEX b2_one_open_assessment_per_user
  ON b2_paper_attempts (user_id)
  WHERE kind = 'assessment' AND finished_at IS NULL;
