-- 013 — CONTENT STATUS, WITHOUT A TERMINAL.
--
-- Everything anyone has needed to know about the content so far has required a
-- hand-written join across b2_papers → b2_paper_sections → b2_paper_items →
-- b2_audio_assets, typed into psql. That is fine once; it is not fine as the
-- library grows to hundreds of items and somebody other than the person who
-- wrote the schema needs an answer.
--
-- These are VIEWS, not tables: they store nothing, cannot drift from the rows
-- they summarise, and cost nothing to keep correct. GET /api/b2/content/status
-- serves them, so the same facts are one browser request away.
--
-- Read-only by construction. Nothing here can change content.

BEGIN;

/* One row per assessment version: counts, the knowledge/skill split, the audio
   situation and the review state. The knowledge/skill split is computed from
   payload->>'band' rather than trusted from a source file, which is the whole
   reason the classification is persisted. */
CREATE OR REPLACE VIEW b2_v_assessment_versions AS
SELECT
  p.id                                        AS version,
  p.exam_version                              AS comparable_group,
  p.board, p.alignment, p.review_status,
  count(i.id)                                 AS items,
  count(i.id) FILTER (WHERE s.module <> 'sprechen')            AS comparable_items,
  count(i.id) FILTER (WHERE i.payload->>'band' = 'KNOWLEDGE'
                        AND s.module <> 'sprechen')            AS knowledge,
  count(i.id) FILTER (WHERE i.payload->>'band' = 'SKILL'
                        AND s.module <> 'sprechen')            AS skill,
  round(100.0 * count(i.id) FILTER (WHERE i.payload->>'band' = 'KNOWLEDGE'
                                      AND s.module <> 'sprechen')
        / NULLIF(count(i.id) FILTER (WHERE s.module <> 'sprechen'), 0), 1)
                                              AS knowledge_pct,
  count(i.id) FILTER (WHERE i.scoring_mode = 'OBJECTIVE')      AS objective,
  count(i.id) FILTER (WHERE i.scoring_mode = 'RUBRIC')         AS rubric_scored,
  count(i.id) FILTER (WHERE i.scoring_mode = 'TRANSCRIPT_ONLY') AS transcript_only,
  count(DISTINCT i.capability)                AS capabilities,
  count(DISTINCT i.item_type)                 AS item_types,
  count(i.id) FILTER (WHERE i.difficulty = 'A') AS diff_a,
  count(i.id) FILTER (WHERE i.difficulty = 'B') AS diff_b,
  count(i.id) FILTER (WHERE i.difficulty = 'C') AS diff_c,
  /* The three things that most often go wrong silently. */
  count(i.id) FILTER (WHERE i.source_type IS NULL)             AS missing_provenance,
  count(i.id) FILTER (WHERE i.difficulty IS NULL)              AS missing_difficulty,
  count(i.id) FILTER (WHERE i.scoring_mode = 'OBJECTIVE'
                        AND i.answer IS NULL
                        AND i.answer_payload IS NULL)          AS missing_answer_key,
  sum(p.minutes)                              AS minutes
FROM b2_papers p
JOIN b2_paper_sections s ON s.paper_id = p.id
LEFT JOIN b2_paper_items i ON i.section_id = s.id
GROUP BY p.id, p.exam_version, p.board, p.alignment, p.review_status, p.minutes;

/* Every section that needs audio, and whether it has it. `intended` is what
   makes this actionable: a missing clip is named, not merely counted. */
CREATE OR REPLACE VIEW b2_v_audio_status AS
SELECT
  s.paper_id                              AS version,
  s.module,
  s.audio_required,
  s.audio_intended_id                     AS intended,
  s.audio_asset_id                        AS attached,
  a.path, a.duration_seconds, a.transcript_available, a.kind,
  CASE
    WHEN NOT s.audio_required                       THEN 'not needed'
    WHEN s.audio_asset_id IS NOT NULL               THEN 'ready'
    WHEN s.audio_intended_id IS NOT NULL            THEN 'not cut yet'
    ELSE 'required but unnamed'
  END                                     AS status
FROM b2_paper_sections s
LEFT JOIN b2_audio_assets a ON a.id = s.audio_asset_id;

/* What still stands between the library and production, as rows rather than as
   a paragraph in a document. Anything appearing here is a blocker. */
CREATE OR REPLACE VIEW b2_v_content_blockers AS
  SELECT 'audio_not_cut'   AS blocker, s.paper_id AS scope,
         'listening audio "' || s.audio_intended_id || '" has not been produced' AS detail
    FROM b2_paper_sections s
   WHERE s.audio_required AND s.audio_asset_id IS NULL
UNION ALL
  SELECT 'audio_unnamed', s.paper_id,
         'section requires audio but names no clip'
    FROM b2_paper_sections s
   WHERE s.audio_required AND s.audio_asset_id IS NULL AND s.audio_intended_id IS NULL
UNION ALL
  SELECT 'no_sme_review', p.id,
         'content is at ' || p.review_status || '; no teacher has reviewed it'
    FROM b2_papers p
   WHERE p.review_status IN ('DRAFT', 'AUTO_QA_PASS')
UNION ALL
  SELECT 'missing_provenance', p.id,
         count(*) || ' item(s) carry no source_type'
    FROM b2_papers p
    JOIN b2_paper_sections s ON s.paper_id = p.id
    JOIN b2_paper_items i ON i.section_id = s.id
   WHERE i.source_type IS NULL
   GROUP BY p.id
UNION ALL
  SELECT 'missing_answer_key', p.id,
         count(*) || ' objective item(s) have no key'
    FROM b2_papers p
    JOIN b2_paper_sections s ON s.paper_id = p.id
    JOIN b2_paper_items i ON i.section_id = s.id
   WHERE i.scoring_mode = 'OBJECTIVE' AND i.answer IS NULL AND i.answer_payload IS NULL
   GROUP BY p.id
UNION ALL
  /* A claim of review with nothing behind it is the most serious of these. */
  SELECT 'false_review_claim', p.id,
         'claims ' || p.review_status || ' with no recorded review'
    FROM b2_papers p
   WHERE p.review_status IN ('SME_REVIEWED', 'PRODUCTION')
     AND NOT EXISTS (SELECT 1 FROM b2_content_reviews r
                      WHERE r.entity_type = 'paper' AND r.entity_id = p.id);

/* Capability coverage across the whole library — the question "what can we
   actually measure?" without a hand-written GROUP BY. */
CREATE OR REPLACE VIEW b2_v_capability_coverage AS
SELECT
  i.capability,
  count(*)                                                   AS items,
  count(DISTINCT s.paper_id)                                 AS versions,
  count(*) FILTER (WHERE i.scoring_mode = 'OBJECTIVE')       AS objective,
  count(*) FILTER (WHERE i.scoring_mode <> 'OBJECTIVE')      AS productive,
  string_agg(DISTINCT i.skill, ', ' ORDER BY i.skill)        AS skills
FROM b2_paper_items i
JOIN b2_paper_sections s ON s.id = i.section_id
WHERE i.capability IS NOT NULL
GROUP BY i.capability;

COMMIT;
