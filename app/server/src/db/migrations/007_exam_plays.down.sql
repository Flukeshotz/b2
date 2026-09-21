DROP INDEX IF EXISTS b2_paper_attempts_one_open;
ALTER TABLE b2_paper_attempts DROP COLUMN IF EXISTS section_id;
DROP TABLE IF EXISTS b2_exam_plays;
