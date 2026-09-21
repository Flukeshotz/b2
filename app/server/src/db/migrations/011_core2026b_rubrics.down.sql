-- Reverses 011. Fails if any custom or osd rubric exists — remove those first,
-- since they cannot be represented under the narrower vocabulary.
BEGIN;
ALTER TABLE b2_rubrics DROP CONSTRAINT IF EXISTS b2_rubrics_board_check;
ALTER TABLE b2_rubrics ADD CONSTRAINT b2_rubrics_board_check
  CHECK (board = ANY (ARRAY['goethe','telc','telc_pflege']));
COMMIT;
