-- Rollback for 001.
--
-- Dropping `level` returns `topics` to its pre-migration shape exactly. Every
-- A1 row is untouched by the migration, so A1 is whole again the moment the
-- column is gone.
--
-- DESTRUCTIVE FOR B2 ONLY: any B2 topic rows become indistinguishable from A1
-- rows and would appear inside the A1 journey. Delete B2 rows BEFORE rolling
-- back, or the A1 learner sees them:
--
--   DELETE FROM user_progress WHERE topic_id IN (SELECT id FROM topics WHERE level <> 'a1');
--   DELETE FROM topics WHERE level <> 'a1';
--
-- The runner refuses to roll back while B2 rows exist rather than doing this
-- for you — deleting learner progress is not a thing a migration script should
-- decide on its own.

BEGIN;
DROP INDEX IF EXISTS topics_level_order_idx;
ALTER TABLE topics DROP CONSTRAINT IF EXISTS topics_level_chk;
ALTER TABLE topics DROP COLUMN IF EXISTS level;
COMMIT;
