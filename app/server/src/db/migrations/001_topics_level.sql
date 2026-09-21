-- 001 — topics.level
--
-- WHY: `topics` is one shared table, and Home.jsx unlocks topics strictly in
-- order_index sequence: the first unfinished topic is open, everything after it
-- is locked. Inserting B2 rows into that table without a level column would
-- bury every B2 topic behind all thirty A1 lessons. This column is what lets
-- A1 keep its linear journey while B2 is reached from its own door.
--
-- SAFETY: additive only. No column is dropped, renamed, retyped or reordered;
-- no row is deleted or updated by this file. The DEFAULT backfills every
-- existing row to 'a1' in the same statement that adds the column, so there is
-- no window in which a row is NULL and no separate UPDATE to get wrong.
-- Idempotent: safe to run twice. Reversible: see 001_topics_level.down.sql.

BEGIN;

ALTER TABLE topics ADD COLUMN IF NOT EXISTS level TEXT NOT NULL DEFAULT 'a1';

-- CEFR ladder, not an open string. A typo'd level ('A1', 'b2 ', 'B2') would
-- silently vanish from both surfaces at once: absent from the A1 journey and
-- absent from the B2 listing, with no error anywhere. Cheaper to refuse it here.
-- a2/b1 are permitted now so the levels between do not need another migration.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'topics_level_chk') THEN
    ALTER TABLE topics ADD CONSTRAINT topics_level_chk
      CHECK (level IN ('a1', 'a2', 'b1', 'b2'));
  END IF;
END $$;

-- Both surfaces read (level, order_index) together and nothing else.
CREATE INDEX IF NOT EXISTS topics_level_order_idx ON topics (level, order_index);

COMMIT;
