-- THE REPETITION MODEL, made durable.
--
-- An expression is not learned or unlearned; it moves through demonstrations of
-- increasing communicative demand:
--
--   heard      it occurred in a source the learner consumed
--   noticed    they were shown what it does, in its own context
--   chosen     they picked it correctly for a situation (recognition)
--   produced   they used it themselves in a new context (production)
--   defended   they used it in a conversation where they were pushed back on
--   examined   they used it under exam conditions
--
-- WHY THIS TABLE EXISTS. Without it, every session would offer the same
-- expression at the same level, and a learner who has already written a good
-- sentence with "nur folgt daraus doch nicht" would be asked, next week, to
-- pick it out of a list of three. That is the single most demoralising thing a
-- language product does, and it is what the standing rule forbids: once
-- production is demonstrated, recognition is over for that expression.
--
-- The stage only ever moves FORWARD. A learner who muddles a later attempt has
-- not unlearned the expression; they have had a bad evening.

CREATE TABLE IF NOT EXISTS b2_expression_state (
  user_id       integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expression    text    NOT NULL,          -- the citation form, stable across sources
  source_id     text,                      -- where it was first met
  stage         text    NOT NULL DEFAULT 'heard',
  occasions     integer NOT NULL DEFAULT 0,
  last_seen_at  timestamptz NOT NULL DEFAULT now(),
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, expression),
  CONSTRAINT b2_expression_stage_check CHECK (
    stage IN ('heard','noticed','chosen','produced','defended','examined'))
);

CREATE INDEX IF NOT EXISTS b2_expression_state_user_idx
  ON b2_expression_state (user_id, last_seen_at DESC);
