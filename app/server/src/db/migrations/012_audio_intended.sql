-- 012 — NAME THE AUDIO THAT DOES NOT EXIST YET.
--
-- `b2_paper_sections.audio_asset_id` is a foreign key into b2_audio_assets, and
-- that is right: a section must never point at a clip that does not exist. But
-- it means a section whose audio has not been cut can only say `NULL` — the
-- IDENTITY of the missing clip is lost the moment it is needed most.
--
-- With ~200 assessment and practice clips still to produce, "some listening
-- section somewhere is missing its audio" is not an actionable report. Which
-- clip, for which section, is.
--
-- `audio_intended_id` is deliberately plain TEXT with no foreign key: its whole
-- purpose is to hold a name before the row it will eventually reference exists.
-- Once the asset is registered, `audio_asset_id` is set and the two agree — a
-- constraint checks exactly that, so the intended id cannot drift away from the
-- attached one.

BEGIN;

ALTER TABLE b2_paper_sections
  ADD COLUMN IF NOT EXISTS audio_intended_id TEXT;

-- Once the audio exists, the attached asset must be the one that was intended.
ALTER TABLE b2_paper_sections DROP CONSTRAINT IF EXISTS b2_paper_sections_audio_match;
ALTER TABLE b2_paper_sections ADD CONSTRAINT b2_paper_sections_audio_match
  CHECK (audio_asset_id IS NULL
         OR audio_intended_id IS NULL
         OR audio_asset_id = audio_intended_id);

/* "A section that requires audio must name the clip it is waiting for" is a
   real rule, and it is NOT enforced here — deliberately.

   As a CHECK it cannot be satisfied at migration time: rows already exist with
   audio_required=true and no asset, the new column starts NULL for all of them,
   and there is nothing in the database to backfill it from. The only ways to
   make the constraint pass would be to invent an id or to silently clear
   audio_required, and both destroy the very fact the column exists to record.

   So the rule lives in tools/audit_b2_core_2026b.js instead, where it can
   report WHICH section is waiting for WHICH clip — which is what anyone
   producing two hundred audio files actually needs. */

COMMIT;
