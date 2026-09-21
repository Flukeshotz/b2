-- Reverses 009.
--
-- Restoring paper_id NOT NULL would fail if any assessment attempt survived, so
-- assessment rows go first. That DELETE destroys real assessment history — it
-- is the honest consequence of rolling back, and it is spelled out here rather
-- than discovered afterwards.

BEGIN;

DROP TABLE IF EXISTS b2_assessment_items;

DELETE FROM b2_paper_attempts WHERE kind = 'assessment';

ALTER TABLE b2_paper_attempts DROP CONSTRAINT IF EXISTS b2_attempt_shape;
ALTER TABLE b2_paper_attempts DROP CONSTRAINT IF EXISTS b2_attempt_kind;

DROP INDEX IF EXISTS b2_attempts_assessment;

ALTER TABLE b2_paper_attempts ALTER COLUMN paper_id SET NOT NULL;

ALTER TABLE b2_paper_attempts
  DROP COLUMN IF EXISTS composition,
  DROP COLUMN IF EXISTS skipped_items,
  DROP COLUMN IF EXISTS measured_items,
  DROP COLUMN IF EXISTS assessment_version,
  DROP COLUMN IF EXISTS kind;

COMMIT;
