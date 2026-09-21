-- Rollback for 004. Retired content becomes live again — check before running.
BEGIN;
DROP INDEX IF EXISTS topics_level_status_idx;
ALTER TABLE topics DROP CONSTRAINT IF EXISTS topics_status_chk;
ALTER TABLE topics DROP COLUMN IF EXISTS retired_at;
ALTER TABLE topics DROP COLUMN IF EXISTS retired_reason;
ALTER TABLE topics DROP COLUMN IF EXISTS status;
COMMIT;
