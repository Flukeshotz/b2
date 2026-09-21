DROP TABLE IF EXISTS b2_drafts;
ALTER TABLE b2_submissions DROP CONSTRAINT IF EXISTS b2_submissions_not_own_parent;
ALTER TABLE b2_submissions DROP COLUMN IF EXISTS parent_id,
  DROP COLUMN IF EXISTS targeted_check, DROP COLUMN IF EXISTS experience_id;
