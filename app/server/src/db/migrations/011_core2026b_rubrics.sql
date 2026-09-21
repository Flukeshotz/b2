-- 011 — A RUBRIC MAY BELONG TO NOBODY BUT US.
--
-- core-2026b's short productive items (summarise, ask_followup) are marked
-- against a Skillcase rubric, not an exam board's. `b2_rubrics.board` allowed
-- only goethe / telc / telc_pflege, so the only way to store one was to label
-- it `goethe` — which would be a false provenance claim sitting in the database
-- and eventually leaking into a learner-facing result.
--
-- `custom` is added instead. It is the same value `b2_papers.board` already
-- accepts after migration 010, so the two vocabularies stay in step.
--
-- Additive: the three existing values are untouched and all 4 existing rubric
-- rows keep validating.

BEGIN;

ALTER TABLE b2_rubrics DROP CONSTRAINT IF EXISTS b2_rubrics_board_check;
ALTER TABLE b2_rubrics ADD CONSTRAINT b2_rubrics_board_check
  CHECK (board = ANY (ARRAY['goethe','telc','telc_pflege','osd','custom']));

COMMIT;
