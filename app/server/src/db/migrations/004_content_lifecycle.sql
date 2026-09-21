-- 004 — content lifecycle on runtime topics.
--
-- WHY: four B2 topics were authored with A1 exercise mechanics — teach-card,
-- flip, unlock, match, tile-assembly. Counted across all B2 content that is
-- 79 A1 mechanic steps against 32 B2-native ones, and `teach` alone appears 30
-- times. That is recognition pedagogy wearing harder vocabulary, which is the
-- specific failure the B2 strategy exists to prevent.
--
-- They are RETIRED, not deleted. The German subject matter — concessive
-- connectors, Konjunktiv II, genitive prepositions, noun-verb pairs — is sound
-- and belongs in B2; only the experience design is wrong. Keeping the rows lets
-- that language be rebuilt in the right modality later without re-researching
-- it, and preserves any learner progress already recorded against them.
--
-- Additive and reversible. Existing rows default to 'live', so nothing changes
-- until a row is explicitly retired.

BEGIN;

ALTER TABLE topics ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'live';
ALTER TABLE topics ADD COLUMN IF NOT EXISTS retired_reason TEXT;
ALTER TABLE topics ADD COLUMN IF NOT EXISTS retired_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'topics_status_chk') THEN
    ALTER TABLE topics ADD CONSTRAINT topics_status_chk
      CHECK (status IN ('live', 'retired', 'draft'));
  END IF;
END $$;

-- Every surface filters on (level, status), so index the pair.
CREATE INDEX IF NOT EXISTS topics_level_status_idx ON topics (level, status, order_index);

COMMIT;
