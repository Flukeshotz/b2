-- Reverses 013. Views only — no content is affected.
BEGIN;
DROP VIEW IF EXISTS b2_v_capability_coverage;
DROP VIEW IF EXISTS b2_v_content_blockers;
DROP VIEW IF EXISTS b2_v_audio_status;
DROP VIEW IF EXISTS b2_v_assessment_versions;
COMMIT;
