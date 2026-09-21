-- Rollback for 003. Destroys all learner evidence and profiles.
BEGIN;
DROP TABLE IF EXISTS b2_evidence;
DROP TABLE IF EXISTS b2_profile;
DROP TABLE IF EXISTS b2_learner_goal;
COMMIT;
