-- 002 — B2 authoring model: sources and derived experiences.
--
-- AUTHORING is separate from RUNTIME on purpose. Content is written and reviewed
-- here; only content at status='approved' is published into `topics` (level='b2'),
-- which is what the lesson engine, progress and review queue already understand.
-- That split means a half-finished script can never reach a learner, and the
-- runtime needs no new code to run B2 content.
--
-- Additive. Touches nothing that exists. Reversible: see 002_b2_content.down.sql.

BEGIN;

CREATE TABLE IF NOT EXISTS b2_sources (
  id            TEXT PRIMARY KEY,            -- 'src_muede'
  kind          TEXT NOT NULL CHECK (kind IN ('audio','text')),
  title         TEXT NOT NULL,
  hook          TEXT NOT NULL,               -- one line: why you would want this
  theme         INT  NOT NULL CHECK (theme BETWEEN 1 AND 14),  -- Goethe's catalogue
  context       TEXT NOT NULL DEFAULT 'universal' CHECK (context IN ('universal','professional')),
  cefr_tier     TEXT NOT NULL DEFAULT 'developing'
                CHECK (cefr_tier IN ('foundation','developing','strong','exam')),
  -- Declaration validated against b2/capabilities.js before status leaves 'draft'.
  declaration   JSONB NOT NULL DEFAULT '{}'::jsonb,
  script        JSONB NOT NULL,              -- [{speaker,voice,style,de,ms}] | text blocks
  transcript    TEXT,                        -- flattened, for reading along and gates
  audio_url     TEXT,
  duration_s    INT,
  markers       JSONB NOT NULL DEFAULT '[]'::jsonb,  -- [{ms,phrase,en,why}]
  -- One-way ratchet. Only a human moves anything to 'approved'.
  status        TEXT NOT NULL DEFAULT 'draft'
                CHECK (status IN ('draft','gated','review','approved','live','rejected')),
  gate_report   JSONB,
  review_notes  TEXT,
  approved_by   TEXT,
  approved_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS b2_experiences (
  id            TEXT PRIMARY KEY,            -- 'exp_muede_listen'
  source_id     TEXT NOT NULL REFERENCES b2_sources(id) ON DELETE CASCADE,
  kind          TEXT NOT NULL CHECK (kind IN
                ('listening','vocabulary','grammar','reading','speaking','writing','exam')),
  ord           INT  NOT NULL DEFAULT 0,     -- order within the source
  title         TEXT NOT NULL,
  minutes       INT  NOT NULL DEFAULT 5,
  -- Capability declaration. NOT NULL by design: content that maps to no
  -- capability is content we cannot recommend, explain or measure.
  primary_capability   TEXT NOT NULL,
  secondary_capabilities TEXT[] NOT NULL DEFAULT '{}',
  checks        TEXT[] NOT NULL DEFAULT '{}', -- analyse.js check_ids it practises
  teaches       JSONB NOT NULL DEFAULT '[]'::jsonb, -- [[de,en,icon]] — review-queue shaped
  steps         JSONB NOT NULL,              -- runtime steps for the lesson engine
  status        TEXT NOT NULL DEFAULT 'draft'
                CHECK (status IN ('draft','gated','review','approved','live','rejected')),
  published_topic_id TEXT,                   -- the topics row this became, once live
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS b2_experiences_source_idx ON b2_experiences (source_id, ord);
CREATE INDEX IF NOT EXISTS b2_experiences_status_idx ON b2_experiences (status);
CREATE INDEX IF NOT EXISTS b2_sources_status_idx     ON b2_sources (status);

COMMIT;
