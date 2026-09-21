-- Reverses 012. Sections whose audio has not been cut lose the record of which
-- clip they were waiting for.
BEGIN;
ALTER TABLE b2_paper_sections DROP CONSTRAINT IF EXISTS b2_paper_sections_audio_named;
ALTER TABLE b2_paper_sections DROP CONSTRAINT IF EXISTS b2_paper_sections_audio_match;
ALTER TABLE b2_paper_sections DROP COLUMN IF EXISTS audio_intended_id;
COMMIT;
