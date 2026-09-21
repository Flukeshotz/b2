-- Rollback for 002. Drops authoring content only; published `topics` rows and
-- any learner progress against them survive, because runtime is a separate copy.
BEGIN;
DROP TABLE IF EXISTS b2_experiences;
DROP TABLE IF EXISTS b2_sources;
COMMIT;
