-- 010 — PRODUCTION CONTENT SCHEMA.
--
-- Makes the B2 data model capable of representing the production library in
-- B2_PRODUCTION_CONTENT_INVENTORY.md: ~228 practice experiences, 13 exam papers
-- + 3 mocks, ~66 assessment items, ~200 audio assets — each carrying provenance,
-- a review state, a difficulty, an item type and a scoring mode.
--
-- IT ADDS. It renames nothing, drops nothing, and narrows no existing CHECK.
-- Every column is nullable or defaulted, so all 8 experiences, 9 writing tasks,
-- 10 paper items and 2 exam attempts keep working untouched. See
-- B2_BATCH2_SCHEMA_AUDIT.md for the field-by-field reasoning.
--
-- NO POSTGRES ENUMS. This schema uses TEXT + CHECK everywhere (26 such
-- constraints already) because a CHECK can be widened in one transaction and an
-- enum cannot. That convention is followed, not broken.
--
-- NOTHING IS BACKFILLED THAT WOULD BE A GUESS. Existing rows get
-- review_status='DRAFT' — which is true, nothing has been reviewed — and
-- source_type stays NULL, because deciding whether the nine existing writing
-- tasks are ORIGINAL or ADAPTED is a human judgement and inventing it would be
-- fabricating provenance.

BEGIN;

-- ── CONTROLLED VOCABULARIES ────────────────────────────────────────────────
-- Declared once as comments so every CHECK below reads against one definition.
--   source_type       DIRECT_LICENSED | ADAPTED | INSPIRED | ORIGINAL
--   adaptation_status NOT_APPLICABLE | DRAFT | ADAPTATION_REQUIRED | ADAPTED
--                     | READY_FOR_REVIEW | APPROVED
--   review_status     DRAFT | AUTO_QA_PASS | SME_REVIEWED | SME_CHANGES_REQUIRED
--                     | PRODUCTION
--   difficulty        A (lower within B2) | B (standard B2) | C (higher within B2)
--                     — internal content difficulty, NOT a CEFR sub-band and NOT
--                     a Goethe/telc score.
--   scoring_mode      OBJECTIVE | RUBRIC | TRANSCRIPT_ONLY | UNSCORED

/* Applied to every content-bearing table. A function would be tidier but this
   schema has no DDL helpers and a plain repeated block is what the other
   migrations here look like. */
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['b2_sources','b2_experiences','b2_tasks','b2_papers','b2_paper_items']
  LOOP
    EXECUTE format('ALTER TABLE %I
      ADD COLUMN IF NOT EXISTS source_book       TEXT,
      ADD COLUMN IF NOT EXISTS source_chapter    TEXT,
      ADD COLUMN IF NOT EXISTS source_module     TEXT,
      ADD COLUMN IF NOT EXISTS source_page       TEXT,
      ADD COLUMN IF NOT EXISTS source_type       TEXT,
      ADD COLUMN IF NOT EXISTS adaptation_status TEXT,
      ADD COLUMN IF NOT EXISTS review_status     TEXT NOT NULL DEFAULT ''DRAFT'',
      ADD COLUMN IF NOT EXISTS difficulty        TEXT', t);

    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I', t, t||'_source_type');
    EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I CHECK (source_type IS NULL OR source_type = ANY (ARRAY[
      ''DIRECT_LICENSED'',''ADAPTED'',''INSPIRED'',''ORIGINAL'']))', t, t||'_source_type');

    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I', t, t||'_adaptation_status');
    EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I CHECK (adaptation_status IS NULL OR adaptation_status = ANY (ARRAY[
      ''NOT_APPLICABLE'',''DRAFT'',''ADAPTATION_REQUIRED'',''ADAPTED'',''READY_FOR_REVIEW'',''APPROVED'']))', t, t||'_adaptation_status');

    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I', t, t||'_review_status');
    EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I CHECK (review_status = ANY (ARRAY[
      ''DRAFT'',''AUTO_QA_PASS'',''SME_REVIEWED'',''SME_CHANGES_REQUIRED'',''PRODUCTION'']))', t, t||'_review_status');

    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I', t, t||'_difficulty');
    EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I CHECK (difficulty IS NULL OR difficulty = ANY (ARRAY[
      ''A'',''B'',''C'']))', t, t||'_difficulty');

    /* PROVENANCE INTEGRITY. Original content must not carry a book reference,
       and book-derived content must name its book. This is what stops a later
       seeder from writing source_type='ORIGINAL' with a page number, or
       'DIRECT_LICENSED' with no source at all. */
    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I', t, t||'_provenance_shape');
    EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I CHECK (
         source_type IS NULL
      OR (source_type = ''ORIGINAL'' AND source_book IS NULL AND source_page IS NULL)
      OR (source_type <> ''ORIGINAL'' AND source_book IS NOT NULL))', t, t||'_provenance_shape');
  END LOOP;
END $$;

-- ── REVIEW RECORD ──────────────────────────────────────────────────────────
-- SME_REVIEWED must mean a human actually read it. A status column alone cannot
-- carry that claim, so it points at a row here. Deliberately small: this is an
-- audit record, not a review-management product.
CREATE TABLE IF NOT EXISTS b2_content_reviews (
  id            SERIAL PRIMARY KEY,
  entity_type   TEXT NOT NULL CHECK (entity_type = ANY (ARRAY[
                  'source','experience','task','speaking_task','paper','paper_item','assessment_item'])),
  entity_id     TEXT NOT NULL,
  reviewer      TEXT NOT NULL,
  reviewed_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  outcome       TEXT NOT NULL CHECK (outcome = ANY (ARRAY['SME_REVIEWED','SME_CHANGES_REQUIRED'])),
  -- What was actually read, so a review of an edited item is not mistaken for a
  -- review of the current one.
  reviewed_hash TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS b2_content_reviews_entity
  ON b2_content_reviews (entity_type, entity_id, reviewed_at DESC);

-- ── EXAM MODEL ─────────────────────────────────────────────────────────────
-- `board` IS exam type under another name and is joined by b2_rubrics and
-- b2_tasks, so it is widened rather than duplicated by a parallel exam_type.
ALTER TABLE b2_papers DROP CONSTRAINT IF EXISTS b2_papers_board_check;
ALTER TABLE b2_papers ADD CONSTRAINT b2_papers_board_check
  CHECK (board = ANY (ARRAY['goethe','telc','telc_pflege','osd','custom']));

ALTER TABLE b2_papers
  ADD COLUMN IF NOT EXISTS exam_version TEXT,
  -- HONEST WORDING, ENFORCED. `provisional` is a boolean and cannot express the
  -- three-way distinction the product must make to a learner. Nothing may call
  -- itself an official paper unless it actually is one.
  ADD COLUMN IF NOT EXISTS alignment TEXT;

ALTER TABLE b2_papers DROP CONSTRAINT IF EXISTS b2_papers_alignment;
ALTER TABLE b2_papers ADD CONSTRAINT b2_papers_alignment
  CHECK (alignment IS NULL OR alignment = ANY (ARRAY[
    'licensed_official','exam_format_practice','exam_aligned','original']));

-- A licensed official paper must say where it came from.
ALTER TABLE b2_papers DROP CONSTRAINT IF EXISTS b2_papers_official_needs_source;
ALTER TABLE b2_papers ADD CONSTRAINT b2_papers_official_needs_source
  CHECK (alignment IS DISTINCT FROM 'licensed_official'
         OR (source_type = 'DIRECT_LICENSED' AND source_book IS NOT NULL));

-- ── PAPER SECTIONS ─────────────────────────────────────────────────────────
-- part_no / title / instruction / minutes / max_points already exist and are reused.
ALTER TABLE b2_paper_sections
  ADD COLUMN IF NOT EXISTS task_type     TEXT,
  ADD COLUMN IF NOT EXISTS skill         TEXT,
  ADD COLUMN IF NOT EXISTS scoring_mode  TEXT,
  ADD COLUMN IF NOT EXISTS item_count    INT,
  ADD COLUMN IF NOT EXISTS speaking_task_id TEXT,
  -- Separate from `minutes`, which is advisory. A hard limit is a different
  -- promise from a suggested pace and the two must not be confused.
  ADD COLUMN IF NOT EXISTS time_limit_seconds INT;

ALTER TABLE b2_paper_sections DROP CONSTRAINT IF EXISTS b2_paper_sections_skill;
ALTER TABLE b2_paper_sections ADD CONSTRAINT b2_paper_sections_skill
  CHECK (skill IS NULL OR skill = ANY (ARRAY[
    'reading','listening','speaking','writing','grammar','vocabulary']));

ALTER TABLE b2_paper_sections DROP CONSTRAINT IF EXISTS b2_paper_sections_scoring;
ALTER TABLE b2_paper_sections ADD CONSTRAINT b2_paper_sections_scoring
  CHECK (scoring_mode IS NULL OR scoring_mode = ANY (ARRAY[
    'OBJECTIVE','RUBRIC','TRANSCRIPT_ONLY','UNSCORED']));

-- ── ITEM TYPES ─────────────────────────────────────────────────────────────
-- The narrow stem+options+answer shape is kept and stays authoritative for MCQ,
-- so the 10 existing rows validate unchanged. Everything else carries its shape
-- in payload/answer_payload, checked here for presence and in JS for structure.
ALTER TABLE b2_paper_items
  ADD COLUMN IF NOT EXISTS item_type      TEXT NOT NULL DEFAULT 'MCQ',
  ADD COLUMN IF NOT EXISTS payload        JSONB,
  ADD COLUMN IF NOT EXISTS answer_payload JSONB,
  ADD COLUMN IF NOT EXISTS scoring_mode   TEXT NOT NULL DEFAULT 'OBJECTIVE',
  ADD COLUMN IF NOT EXISTS points         REAL NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS skill          TEXT,
  ADD COLUMN IF NOT EXISTS capability     TEXT,
  -- capability and check_id are different concepts and must not be collapsed:
  -- capability='argue' is what the learner is doing; check_id='connector_range'
  -- is the detector that routes her to practice.
  ADD COLUMN IF NOT EXISTS check_id       TEXT;

ALTER TABLE b2_paper_items DROP CONSTRAINT IF EXISTS b2_paper_items_type;
ALTER TABLE b2_paper_items ADD CONSTRAINT b2_paper_items_type
  CHECK (item_type = ANY (ARRAY[
    'MCQ','MULTI_SELECT','TRUE_FALSE','MATCHING','GAP_FILL','ORDERING',
    'SHORT_TEXT','LONG_TEXT','SPOKEN_RESPONSE','OPEN_RESPONSE']));

ALTER TABLE b2_paper_items DROP CONSTRAINT IF EXISTS b2_paper_items_scoring;
ALTER TABLE b2_paper_items ADD CONSTRAINT b2_paper_items_scoring
  CHECK (scoring_mode = ANY (ARRAY['OBJECTIVE','RUBRIC','TRANSCRIPT_ONLY','UNSCORED']));

/* `answer` WAS NOT NULL — the MCQ-only assumption baked into the original table.
   A productive item has no key by definition, so with the constraint below in
   place the two rules contradict each other and a LONG_TEXT row cannot be
   inserted at all. The column becomes nullable and MCQ keeps its requirement
   explicitly, which is what the NOT NULL was really expressing. All 10 existing
   rows already have a value, so nothing is affected. */
ALTER TABLE b2_paper_items ALTER COLUMN answer DROP NOT NULL;

ALTER TABLE b2_paper_items DROP CONSTRAINT IF EXISTS b2_paper_items_mcq_has_key;
ALTER TABLE b2_paper_items ADD CONSTRAINT b2_paper_items_mcq_has_key
  CHECK (item_type <> 'MCQ' OR answer IS NOT NULL);

/* PRODUCTIVE ITEMS MAY NOT CARRY AN ANSWER KEY.
   This is the database half of "never create fake answer keys for productive
   tasks". A LONG_TEXT with answer=2 is not a typo, it is a product lie, and it
   is refused here rather than caught in review. */
ALTER TABLE b2_paper_items DROP CONSTRAINT IF EXISTS b2_paper_items_productive_no_key;
ALTER TABLE b2_paper_items ADD CONSTRAINT b2_paper_items_productive_no_key
  CHECK (item_type NOT IN ('SHORT_TEXT','LONG_TEXT','SPOKEN_RESPONSE','OPEN_RESPONSE')
         OR (answer IS NULL AND answer_payload IS NULL));

/* …and they may not claim objective scoring. */
ALTER TABLE b2_paper_items DROP CONSTRAINT IF EXISTS b2_paper_items_productive_scoring;
ALTER TABLE b2_paper_items ADD CONSTRAINT b2_paper_items_productive_scoring
  CHECK (item_type NOT IN ('SHORT_TEXT','LONG_TEXT','SPOKEN_RESPONSE','OPEN_RESPONSE')
         OR scoring_mode <> 'OBJECTIVE');

/* An objectively scored item must actually have a key — in the legacy column
   for MCQ, or in answer_payload for everything else. */
ALTER TABLE b2_paper_items DROP CONSTRAINT IF EXISTS b2_paper_items_objective_has_key;
ALTER TABLE b2_paper_items ADD CONSTRAINT b2_paper_items_objective_has_key
  CHECK (scoring_mode <> 'OBJECTIVE' OR answer IS NOT NULL OR answer_payload IS NOT NULL);

/* Non-MCQ types carry their shape in payload. MCQ keeps using `options`. */
ALTER TABLE b2_paper_items DROP CONSTRAINT IF EXISTS b2_paper_items_payload_present;
ALTER TABLE b2_paper_items ADD CONSTRAINT b2_paper_items_payload_present
  CHECK (item_type = 'MCQ' OR payload IS NOT NULL
         OR item_type IN ('SHORT_TEXT','LONG_TEXT','SPOKEN_RESPONSE','OPEN_RESPONSE','TRUE_FALSE'));

CREATE INDEX IF NOT EXISTS b2_paper_items_capability ON b2_paper_items (capability);
CREATE INDEX IF NOT EXISTS b2_paper_items_type ON b2_paper_items (item_type);

-- ── SECTION-LEVEL RESUME ───────────────────────────────────────────────────
-- b2_paper_attempts.responses stays exactly as it is — one blob per paper, still
-- the answer store. This child table adds only the per-section lifecycle a
-- multi-section paper needs, so a learner who reloads mid-Hören comes back to
-- Hören and not to the start of the paper.
CREATE TABLE IF NOT EXISTS b2_attempt_sections (
  id           SERIAL PRIMARY KEY,
  attempt_id   INT NOT NULL REFERENCES b2_paper_attempts(id) ON DELETE CASCADE,
  section_id   INT NOT NULL REFERENCES b2_paper_sections(id) ON DELETE CASCADE,
  ord          INT NOT NULL,
  started_at   TIMESTAMPTZ,
  paused_at    TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  -- Seconds actually spent, accumulated across pauses, so a timed section
  -- survives a reload without either restarting or running down in the background.
  elapsed_seconds INT NOT NULL DEFAULT 0,
  result       JSONB,
  UNIQUE (attempt_id, section_id)
);
CREATE INDEX IF NOT EXISTS b2_attempt_sections_attempt ON b2_attempt_sections (attempt_id, ord);

-- A completed section must have started.
ALTER TABLE b2_attempt_sections DROP CONSTRAINT IF EXISTS b2_attempt_sections_shape;
ALTER TABLE b2_attempt_sections ADD CONSTRAINT b2_attempt_sections_shape
  CHECK (completed_at IS NULL OR started_at IS NOT NULL);

-- ── SPEAKING TASKS ─────────────────────────────────────────────────────────
-- Not folded into b2_tasks: that table is writing-shaped (target_words,
-- content_points) and a speaking prompt with a word target is technical debt.
-- The rubric is REUSED — b2_rubrics already holds telc_pflege/sprechen.
CREATE TABLE IF NOT EXISTS b2_speaking_tasks (
  id             TEXT PRIMARY KEY,
  rubric_id      INT REFERENCES b2_rubrics(id),
  prompt_de      TEXT NOT NULL,
  instruction_de TEXT,
  prep_seconds   INT,
  speak_seconds  INT NOT NULL,
  format         TEXT NOT NULL CHECK (format = ANY (ARRAY[
                   'monologue','dialogue','presentation','discussion','reaction'])),
  -- How it is judged. TRANSCRIPT_ONLY is the honest current state: we capture
  -- speech and do not band it.
  evaluation_mode TEXT NOT NULL CHECK (evaluation_mode = ANY (ARRAY[
                   'RUBRIC','TRANSCRIPT_ONLY','UNSCORED'])),
  primary_capability     TEXT,
  secondary_capabilities TEXT[],
  difficulty     TEXT CHECK (difficulty IS NULL OR difficulty = ANY (ARRAY['A','B','C'])),
  source_book TEXT, source_chapter TEXT, source_module TEXT, source_page TEXT,
  source_type TEXT CHECK (source_type IS NULL OR source_type = ANY (ARRAY[
    'DIRECT_LICENSED','ADAPTED','INSPIRED','ORIGINAL'])),
  adaptation_status TEXT CHECK (adaptation_status IS NULL OR adaptation_status = ANY (ARRAY[
    'NOT_APPLICABLE','DRAFT','ADAPTATION_REQUIRED','ADAPTED','READY_FOR_REVIEW','APPROVED'])),
  review_status  TEXT NOT NULL DEFAULT 'DRAFT' CHECK (review_status = ANY (ARRAY[
    'DRAFT','AUTO_QA_PASS','SME_REVIEWED','SME_CHANGES_REQUIRED','PRODUCTION'])),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE b2_speaking_tasks DROP CONSTRAINT IF EXISTS b2_speaking_tasks_provenance_shape;
ALTER TABLE b2_speaking_tasks ADD CONSTRAINT b2_speaking_tasks_provenance_shape
  CHECK (source_type IS NULL
      OR (source_type = 'ORIGINAL' AND source_book IS NULL AND source_page IS NULL)
      OR (source_type <> 'ORIGINAL' AND source_book IS NOT NULL));

-- ── AUDIO ASSETS ───────────────────────────────────────────────────────────
-- A registry, not a store. Existing files on disk keep working unregistered;
-- nothing here invents an asset id for audio that has not been produced.
CREATE TABLE IF NOT EXISTS b2_audio_assets (
  id            TEXT PRIMARY KEY,
  path          TEXT NOT NULL UNIQUE,
  kind          TEXT NOT NULL CHECK (kind = ANY (ARRAY[
                  'practice','assessment','exam','book_licensed','generated'])),
  duration_seconds  REAL,
  transcript_available BOOLEAN NOT NULL DEFAULT false,
  voice_set     TEXT,
  source_book TEXT, source_chapter TEXT, source_module TEXT, source_page TEXT,
  source_type TEXT CHECK (source_type IS NULL OR source_type = ANY (ARRAY[
    'DIRECT_LICENSED','ADAPTED','INSPIRED','ORIGINAL'])),
  review_status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (review_status = ANY (ARRAY[
    'DRAFT','AUTO_QA_PASS','SME_REVIEWED','SME_CHANGES_REQUIRED','PRODUCTION'])),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Content that needs audio declares it, and points at the asset once it exists.
ALTER TABLE b2_sources
  ADD COLUMN IF NOT EXISTS audio_required BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS audio_asset_id TEXT REFERENCES b2_audio_assets(id);
ALTER TABLE b2_paper_sections
  ADD COLUMN IF NOT EXISTS audio_required BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS audio_asset_id TEXT REFERENCES b2_audio_assets(id);

-- ── CAN-DO MAPPING ─────────────────────────────────────────────────────────
-- Schema only. The ~160 Arbeitsbuch Selbsteinschätzung statements are NOT
-- populated here — that is content, and content is a later batch.
CREATE TABLE IF NOT EXISTS b2_can_dos (
  id            TEXT PRIMARY KEY,
  source_book   TEXT NOT NULL,
  source_chapter TEXT,
  source_module TEXT,
  statement_de  TEXT NOT NULL,
  skill         TEXT NOT NULL CHECK (skill = ANY (ARRAY[
                  'reading','listening','speaking','writing','grammar','vocabulary'])),
  capability    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS b2_can_do_links (
  id           SERIAL PRIMARY KEY,
  can_do_id    TEXT NOT NULL REFERENCES b2_can_dos(id) ON DELETE CASCADE,
  entity_type  TEXT NOT NULL CHECK (entity_type = ANY (ARRAY[
                 'experience','task','speaking_task','paper_item','assessment_item'])),
  entity_id    TEXT NOT NULL,
  -- Whether this content TRAINS the can-do or MEASURES it. The recommendation
  -- engine needs both and must not confuse them.
  relation     TEXT NOT NULL CHECK (relation = ANY (ARRAY['trains','measures'])),
  UNIQUE (can_do_id, entity_type, entity_id, relation)
);
CREATE INDEX IF NOT EXISTS b2_can_do_links_entity ON b2_can_do_links (entity_type, entity_id);

COMMIT;
