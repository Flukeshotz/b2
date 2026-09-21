-- Reverses 010.
--
-- Drops the new tables and columns. Any provenance, review status, difficulty,
-- item type or section-resume state recorded since the migration is DESTROYED —
-- that is the honest consequence of rolling back a schema that exists to hold
-- exactly those facts, and it is stated here rather than discovered afterwards.
--
-- b2_papers.board is narrowed back to its original three values, so roll back
-- only after removing any osd/custom paper.

BEGIN;

DROP TABLE IF EXISTS b2_can_do_links;
DROP TABLE IF EXISTS b2_can_dos;
DROP TABLE IF EXISTS b2_attempt_sections;
DROP TABLE IF EXISTS b2_speaking_tasks;
DROP TABLE IF EXISTS b2_content_reviews;

ALTER TABLE b2_sources         DROP COLUMN IF EXISTS audio_asset_id;
ALTER TABLE b2_paper_sections  DROP COLUMN IF EXISTS audio_asset_id;
DROP TABLE IF EXISTS b2_audio_assets;

ALTER TABLE b2_sources        DROP COLUMN IF EXISTS audio_required;
ALTER TABLE b2_paper_sections DROP COLUMN IF EXISTS audio_required,
  DROP COLUMN IF EXISTS task_type, DROP COLUMN IF EXISTS skill,
  DROP COLUMN IF EXISTS scoring_mode, DROP COLUMN IF EXISTS item_count,
  DROP COLUMN IF EXISTS speaking_task_id, DROP COLUMN IF EXISTS time_limit_seconds;

-- Restore the MCQ-only NOT NULL. Fails if any keyless productive item exists —
-- remove those first, since they cannot be represented in the old schema.
ALTER TABLE b2_paper_items ALTER COLUMN answer SET NOT NULL;

ALTER TABLE b2_paper_items
  DROP COLUMN IF EXISTS item_type, DROP COLUMN IF EXISTS payload,
  DROP COLUMN IF EXISTS answer_payload, DROP COLUMN IF EXISTS scoring_mode,
  DROP COLUMN IF EXISTS points, DROP COLUMN IF EXISTS skill,
  DROP COLUMN IF EXISTS capability, DROP COLUMN IF EXISTS check_id;

ALTER TABLE b2_papers DROP COLUMN IF EXISTS exam_version, DROP COLUMN IF EXISTS alignment;
ALTER TABLE b2_papers DROP CONSTRAINT IF EXISTS b2_papers_board_check;
ALTER TABLE b2_papers ADD CONSTRAINT b2_papers_board_check
  CHECK (board = ANY (ARRAY['goethe','telc','telc_pflege']));

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['b2_sources','b2_experiences','b2_tasks','b2_papers','b2_paper_items']
  LOOP
    EXECUTE format('ALTER TABLE %I
      DROP COLUMN IF EXISTS source_book, DROP COLUMN IF EXISTS source_chapter,
      DROP COLUMN IF EXISTS source_module, DROP COLUMN IF EXISTS source_page,
      DROP COLUMN IF EXISTS source_type, DROP COLUMN IF EXISTS adaptation_status,
      DROP COLUMN IF EXISTS review_status, DROP COLUMN IF EXISTS difficulty', t);
  END LOOP;
END $$;

COMMIT;
