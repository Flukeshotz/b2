-- SINGLE-PLAY STATE.
--
-- The one irreversible action in this product. Everywhere else a reload costs
-- the learner nothing; here a reload must not hand back a listen the exam only
-- gives once — and, pulling the other way, a learner whose audio failed to load
-- must not be charged for a listen they never had.
--
-- Both requirements are settled here rather than in the browser, because a
-- client-side flag is a promise the learner can break by pressing F5, and a
-- practice section that can be replayed is not practising the thing that makes
-- Teil 1 hard.
--
--   requested_at  the learner asked for the audio. Consumes nothing: a request
--                 that never becomes sound is a failed load.
--   heard_at      playback actually started, confirmed by the client. From this
--                 moment no URL is issued for this text again, ever.
--   requests      how many times the URL was handed out. Surfaced as an
--                 integrity note, never used to block a retry — refusing the
--                 second request would punish the honest failure to deter a
--                 cheat that only spoils the cheater's own practice.

CREATE TABLE IF NOT EXISTS b2_exam_plays (
  attempt_id   integer NOT NULL REFERENCES b2_paper_attempts(id) ON DELETE CASCADE,
  text_no      integer NOT NULL,
  requests     integer NOT NULL DEFAULT 0,
  requested_at timestamptz,
  heard_at     timestamptz,
  PRIMARY KEY (attempt_id, text_no)
);

CREATE INDEX IF NOT EXISTS b2_exam_plays_heard_idx ON b2_exam_plays (attempt_id, heard_at);

-- Which section an attempt belongs to. b2_paper_attempts predates sections.
ALTER TABLE b2_paper_attempts
  ADD COLUMN IF NOT EXISTS section_id integer REFERENCES b2_paper_sections(id) ON DELETE CASCADE;

-- One OPEN attempt per learner per paper. Two open attempts would let somebody
-- start a second one to hear the texts again.
CREATE UNIQUE INDEX IF NOT EXISTS b2_paper_attempts_one_open
  ON b2_paper_attempts (user_id, paper_id) WHERE finished_at IS NULL;
