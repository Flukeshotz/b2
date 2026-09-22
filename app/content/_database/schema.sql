--
-- PostgreSQL database dump
--

\restrict hoQG2Z4Aak0xhzVg9fk5GtxgO4Z26Kdby1LdsA9F1uxOXIEQX5fVfWx3TKvyzTf

-- Dumped from database version 16.14 (Homebrew)
-- Dumped by pg_dump version 16.14 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: b2_assessment_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.b2_assessment_items (
    id integer NOT NULL,
    attempt_id integer NOT NULL,
    item_id text NOT NULL,
    slot text NOT NULL,
    version text NOT NULL,
    "position" integer NOT NULL,
    skill text NOT NULL,
    capability text,
    check_id text,
    targeted boolean DEFAULT false NOT NULL,
    response text,
    correct boolean,
    skipped boolean DEFAULT false NOT NULL,
    measured boolean DEFAULT false NOT NULL,
    evidence_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT b2_item_skip_shape CHECK (((NOT (skipped AND measured)) AND ((NOT skipped) OR (correct IS NULL))))
);


--
-- Name: b2_assessment_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.b2_assessment_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: b2_assessment_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.b2_assessment_items_id_seq OWNED BY public.b2_assessment_items.id;


--
-- Name: b2_attempt_sections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.b2_attempt_sections (
    id integer NOT NULL,
    attempt_id integer NOT NULL,
    section_id integer NOT NULL,
    ord integer NOT NULL,
    started_at timestamp with time zone,
    paused_at timestamp with time zone,
    completed_at timestamp with time zone,
    elapsed_seconds integer DEFAULT 0 NOT NULL,
    result jsonb,
    CONSTRAINT b2_attempt_sections_shape CHECK (((completed_at IS NULL) OR (started_at IS NOT NULL)))
);


--
-- Name: b2_attempt_sections_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.b2_attempt_sections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: b2_attempt_sections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.b2_attempt_sections_id_seq OWNED BY public.b2_attempt_sections.id;


--
-- Name: b2_audio_assets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.b2_audio_assets (
    id text NOT NULL,
    path text NOT NULL,
    kind text NOT NULL,
    duration_seconds real,
    transcript_available boolean DEFAULT false NOT NULL,
    voice_set text,
    source_book text,
    source_chapter text,
    source_module text,
    source_page text,
    source_type text,
    review_status text DEFAULT 'DRAFT'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT b2_audio_assets_kind_check CHECK ((kind = ANY (ARRAY['practice'::text, 'assessment'::text, 'exam'::text, 'book_licensed'::text, 'generated'::text]))),
    CONSTRAINT b2_audio_assets_review_status_check CHECK ((review_status = ANY (ARRAY['DRAFT'::text, 'AUTO_QA_PASS'::text, 'SME_REVIEWED'::text, 'SME_CHANGES_REQUIRED'::text, 'PRODUCTION'::text]))),
    CONSTRAINT b2_audio_assets_source_type_check CHECK (((source_type IS NULL) OR (source_type = ANY (ARRAY['DIRECT_LICENSED'::text, 'ADAPTED'::text, 'INSPIRED'::text, 'ORIGINAL'::text]))))
);


--
-- Name: b2_can_do_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.b2_can_do_links (
    id integer NOT NULL,
    can_do_id text NOT NULL,
    entity_type text NOT NULL,
    entity_id text NOT NULL,
    relation text NOT NULL,
    CONSTRAINT b2_can_do_links_entity_type_check CHECK ((entity_type = ANY (ARRAY['experience'::text, 'task'::text, 'speaking_task'::text, 'paper_item'::text, 'assessment_item'::text]))),
    CONSTRAINT b2_can_do_links_relation_check CHECK ((relation = ANY (ARRAY['trains'::text, 'measures'::text])))
);


--
-- Name: b2_can_do_links_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.b2_can_do_links_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: b2_can_do_links_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.b2_can_do_links_id_seq OWNED BY public.b2_can_do_links.id;


--
-- Name: b2_can_dos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.b2_can_dos (
    id text NOT NULL,
    source_book text NOT NULL,
    source_chapter text,
    source_module text,
    statement_de text NOT NULL,
    skill text NOT NULL,
    capability text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT b2_can_dos_skill_check CHECK ((skill = ANY (ARRAY['reading'::text, 'listening'::text, 'speaking'::text, 'writing'::text, 'grammar'::text, 'vocabulary'::text])))
);


--
-- Name: b2_content_reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.b2_content_reviews (
    id integer NOT NULL,
    entity_type text NOT NULL,
    entity_id text NOT NULL,
    reviewer text NOT NULL,
    reviewed_at timestamp with time zone DEFAULT now() NOT NULL,
    outcome text NOT NULL,
    reviewed_hash text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT b2_content_reviews_entity_type_check CHECK ((entity_type = ANY (ARRAY['source'::text, 'experience'::text, 'task'::text, 'speaking_task'::text, 'paper'::text, 'paper_item'::text, 'assessment_item'::text]))),
    CONSTRAINT b2_content_reviews_outcome_check CHECK ((outcome = ANY (ARRAY['SME_REVIEWED'::text, 'SME_CHANGES_REQUIRED'::text])))
);


--
-- Name: b2_content_reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.b2_content_reviews_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: b2_content_reviews_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.b2_content_reviews_id_seq OWNED BY public.b2_content_reviews.id;


--
-- Name: b2_drafts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.b2_drafts (
    user_id integer NOT NULL,
    task_id text NOT NULL,
    parent_id integer,
    text text NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: b2_evidence; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.b2_evidence (
    id integer NOT NULL,
    user_id integer NOT NULL,
    dimension text NOT NULL,
    capability text,
    check_id text,
    outcome real NOT NULL,
    weight real DEFAULT 0.6 NOT NULL,
    source_kind text NOT NULL,
    source_ref text,
    detail text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT b2_evidence_dimension_check CHECK ((dimension = ANY (ARRAY['writing'::text, 'grammar'::text, 'vocabulary'::text, 'listening'::text, 'reading'::text, 'speaking'::text]))),
    CONSTRAINT b2_evidence_outcome_check CHECK (((outcome >= (0)::double precision) AND (outcome <= (1)::double precision))),
    CONSTRAINT b2_evidence_weight_check CHECK (((weight > (0)::double precision) AND (weight <= (1)::double precision)))
);


--
-- Name: b2_evidence_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.b2_evidence_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: b2_evidence_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.b2_evidence_id_seq OWNED BY public.b2_evidence.id;


--
-- Name: b2_exam_plays; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.b2_exam_plays (
    attempt_id integer NOT NULL,
    text_no integer NOT NULL,
    requests integer DEFAULT 0 NOT NULL,
    requested_at timestamp with time zone,
    heard_at timestamp with time zone
);


--
-- Name: b2_exam_targets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.b2_exam_targets (
    id integer NOT NULL,
    user_id integer NOT NULL,
    board text NOT NULL,
    module text NOT NULL,
    exam_date date,
    centre text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT b2_exam_targets_board_check CHECK ((board = ANY (ARRAY['goethe'::text, 'telc'::text]))),
    CONSTRAINT b2_exam_targets_module_check CHECK ((module = ANY (ARRAY['schreiben'::text, 'lesen'::text, 'hoeren'::text, 'sprechen'::text])))
);


--
-- Name: b2_exam_targets_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.b2_exam_targets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: b2_exam_targets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.b2_exam_targets_id_seq OWNED BY public.b2_exam_targets.id;


--
-- Name: b2_experiences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.b2_experiences (
    id text NOT NULL,
    source_id text NOT NULL,
    kind text NOT NULL,
    ord integer DEFAULT 0 NOT NULL,
    title text NOT NULL,
    minutes integer DEFAULT 5 NOT NULL,
    primary_capability text NOT NULL,
    secondary_capabilities text[] DEFAULT '{}'::text[] NOT NULL,
    checks text[] DEFAULT '{}'::text[] NOT NULL,
    teaches jsonb DEFAULT '[]'::jsonb NOT NULL,
    steps jsonb NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    published_topic_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    source_book text,
    source_chapter text,
    source_module text,
    source_page text,
    source_type text,
    adaptation_status text,
    review_status text DEFAULT 'DRAFT'::text NOT NULL,
    difficulty text,
    CONSTRAINT b2_experiences_adaptation_status CHECK (((adaptation_status IS NULL) OR (adaptation_status = ANY (ARRAY['NOT_APPLICABLE'::text, 'DRAFT'::text, 'ADAPTATION_REQUIRED'::text, 'ADAPTED'::text, 'READY_FOR_REVIEW'::text, 'APPROVED'::text])))),
    CONSTRAINT b2_experiences_difficulty CHECK (((difficulty IS NULL) OR (difficulty = ANY (ARRAY['A'::text, 'B'::text, 'C'::text])))),
    CONSTRAINT b2_experiences_kind_check CHECK ((kind = ANY (ARRAY['listening'::text, 'vocabulary'::text, 'grammar'::text, 'reading'::text, 'speaking'::text, 'writing'::text, 'exam'::text]))),
    CONSTRAINT b2_experiences_provenance_shape CHECK (((source_type IS NULL) OR ((source_type = 'ORIGINAL'::text) AND (source_book IS NULL) AND (source_page IS NULL)) OR ((source_type <> 'ORIGINAL'::text) AND (source_book IS NOT NULL)))),
    CONSTRAINT b2_experiences_review_status CHECK ((review_status = ANY (ARRAY['DRAFT'::text, 'AUTO_QA_PASS'::text, 'SME_REVIEWED'::text, 'SME_CHANGES_REQUIRED'::text, 'PRODUCTION'::text]))),
    CONSTRAINT b2_experiences_source_type CHECK (((source_type IS NULL) OR (source_type = ANY (ARRAY['DIRECT_LICENSED'::text, 'ADAPTED'::text, 'INSPIRED'::text, 'ORIGINAL'::text])))),
    CONSTRAINT b2_experiences_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'gated'::text, 'review'::text, 'approved'::text, 'live'::text, 'rejected'::text])))
);


--
-- Name: b2_expression_state; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.b2_expression_state (
    user_id integer NOT NULL,
    expression text NOT NULL,
    source_id text,
    stage text DEFAULT 'heard'::text NOT NULL,
    occasions integer DEFAULT 0 NOT NULL,
    last_seen_at timestamp with time zone DEFAULT now() NOT NULL,
    first_seen_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT b2_expression_stage_check CHECK ((stage = ANY (ARRAY['heard'::text, 'noticed'::text, 'chosen'::text, 'produced'::text, 'defended'::text, 'examined'::text])))
);


--
-- Name: b2_findings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.b2_findings (
    id integer NOT NULL,
    submission_id integer NOT NULL,
    source text NOT NULL,
    check_id text NOT NULL,
    state text NOT NULL,
    detail text NOT NULL,
    evidence jsonb DEFAULT '[]'::jsonb NOT NULL,
    confidence real,
    CONSTRAINT b2_findings_source_check CHECK ((source = ANY (ARRAY['deterministic'::text, 'model'::text, 'human'::text]))),
    CONSTRAINT b2_findings_state_check CHECK ((state = ANY (ARRAY['pass'::text, 'warn'::text, 'fail'::text])))
);


--
-- Name: b2_findings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.b2_findings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: b2_findings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.b2_findings_id_seq OWNED BY public.b2_findings.id;


--
-- Name: b2_learner_goal; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.b2_learner_goal (
    user_id integer NOT NULL,
    goal text NOT NULL,
    board text,
    exam_date date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT b2_learner_goal_goal_check CHECK ((goal = ANY (ARRAY['anerkennung'::text, 'job'::text, 'ausbildung'::text, 'exam'::text, 'unsure'::text])))
);


--
-- Name: b2_maya_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.b2_maya_sessions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    scenario_id text NOT NULL,
    scenario_version integer DEFAULT 1 NOT NULL,
    session_id text NOT NULL,
    current_beat text NOT NULL,
    press_count integer DEFAULT 0 NOT NULL,
    learner_turns_count integer DEFAULT 0 NOT NULL,
    max_learner_turns integer DEFAULT 7 NOT NULL,
    dialogue_log jsonb DEFAULT '[]'::jsonb NOT NULL,
    turns jsonb DEFAULT '[]'::jsonb NOT NULL,
    memory jsonb DEFAULT '{}'::jsonb NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    terminal_outcome text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    finished_at timestamp with time zone,
    CONSTRAINT b2_maya_sessions_status_check CHECK ((status = ANY (ARRAY['active'::text, 'abandoned'::text, 'resolved'::text, 'unresolved'::text, 'trap_accepted'::text])))
);


--
-- Name: b2_maya_sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.b2_maya_sessions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: b2_maya_sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.b2_maya_sessions_id_seq OWNED BY public.b2_maya_sessions.id;


--
-- Name: b2_outcomes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.b2_outcomes (
    id integer NOT NULL,
    user_id integer NOT NULL,
    board text NOT NULL,
    module text NOT NULL,
    real_score integer NOT NULL,
    passed boolean NOT NULL,
    exam_date date,
    verification_tier text DEFAULT 'self_reported'::text NOT NULL,
    reported_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT b2_outcomes_verification_tier_check CHECK ((verification_tier = ANY (ARRAY['self_reported'::text, 'screenshot'::text, 'cohort_confirmed'::text])))
);


--
-- Name: b2_outcomes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.b2_outcomes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: b2_outcomes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.b2_outcomes_id_seq OWNED BY public.b2_outcomes.id;


--
-- Name: b2_paper_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.b2_paper_attempts (
    id integer NOT NULL,
    user_id integer NOT NULL,
    paper_id text,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    finished_at timestamp with time zone,
    responses jsonb DEFAULT '{}'::jsonb NOT NULL,
    scores jsonb,
    section_id integer,
    kind text DEFAULT 'paper'::text NOT NULL,
    assessment_version text,
    measured_items integer,
    skipped_items integer,
    composition jsonb,
    CONSTRAINT b2_attempt_kind CHECK ((kind = ANY (ARRAY['paper'::text, 'assessment'::text]))),
    CONSTRAINT b2_attempt_shape CHECK ((((kind = 'paper'::text) AND (paper_id IS NOT NULL)) OR ((kind = 'assessment'::text) AND (assessment_version IS NOT NULL))))
);


--
-- Name: b2_paper_attempts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.b2_paper_attempts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: b2_paper_attempts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.b2_paper_attempts_id_seq OWNED BY public.b2_paper_attempts.id;


--
-- Name: b2_paper_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.b2_paper_items (
    id integer NOT NULL,
    section_id integer NOT NULL,
    item_no integer NOT NULL,
    stem text NOT NULL,
    options jsonb NOT NULL,
    answer integer,
    rationale text,
    source_book text,
    source_chapter text,
    source_module text,
    source_page text,
    source_type text,
    adaptation_status text,
    review_status text DEFAULT 'DRAFT'::text NOT NULL,
    difficulty text,
    item_type text DEFAULT 'MCQ'::text NOT NULL,
    payload jsonb,
    answer_payload jsonb,
    scoring_mode text DEFAULT 'OBJECTIVE'::text NOT NULL,
    points real DEFAULT 1 NOT NULL,
    skill text,
    capability text,
    check_id text,
    CONSTRAINT b2_paper_items_adaptation_status CHECK (((adaptation_status IS NULL) OR (adaptation_status = ANY (ARRAY['NOT_APPLICABLE'::text, 'DRAFT'::text, 'ADAPTATION_REQUIRED'::text, 'ADAPTED'::text, 'READY_FOR_REVIEW'::text, 'APPROVED'::text])))),
    CONSTRAINT b2_paper_items_difficulty CHECK (((difficulty IS NULL) OR (difficulty = ANY (ARRAY['A'::text, 'B'::text, 'C'::text])))),
    CONSTRAINT b2_paper_items_mcq_has_key CHECK (((item_type <> 'MCQ'::text) OR (answer IS NOT NULL))),
    CONSTRAINT b2_paper_items_objective_has_key CHECK (((scoring_mode <> 'OBJECTIVE'::text) OR (answer IS NOT NULL) OR (answer_payload IS NOT NULL))),
    CONSTRAINT b2_paper_items_payload_present CHECK (((item_type = 'MCQ'::text) OR (payload IS NOT NULL) OR (item_type = ANY (ARRAY['SHORT_TEXT'::text, 'LONG_TEXT'::text, 'SPOKEN_RESPONSE'::text, 'OPEN_RESPONSE'::text, 'TRUE_FALSE'::text])))),
    CONSTRAINT b2_paper_items_productive_no_key CHECK (((item_type <> ALL (ARRAY['SHORT_TEXT'::text, 'LONG_TEXT'::text, 'SPOKEN_RESPONSE'::text, 'OPEN_RESPONSE'::text])) OR ((answer IS NULL) AND (answer_payload IS NULL)))),
    CONSTRAINT b2_paper_items_productive_scoring CHECK (((item_type <> ALL (ARRAY['SHORT_TEXT'::text, 'LONG_TEXT'::text, 'SPOKEN_RESPONSE'::text, 'OPEN_RESPONSE'::text])) OR (scoring_mode <> 'OBJECTIVE'::text))),
    CONSTRAINT b2_paper_items_provenance_shape CHECK (((source_type IS NULL) OR ((source_type = 'ORIGINAL'::text) AND (source_book IS NULL) AND (source_page IS NULL)) OR ((source_type <> 'ORIGINAL'::text) AND (source_book IS NOT NULL)))),
    CONSTRAINT b2_paper_items_review_status CHECK ((review_status = ANY (ARRAY['DRAFT'::text, 'AUTO_QA_PASS'::text, 'SME_REVIEWED'::text, 'SME_CHANGES_REQUIRED'::text, 'PRODUCTION'::text]))),
    CONSTRAINT b2_paper_items_scoring CHECK ((scoring_mode = ANY (ARRAY['OBJECTIVE'::text, 'RUBRIC'::text, 'TRANSCRIPT_ONLY'::text, 'UNSCORED'::text]))),
    CONSTRAINT b2_paper_items_source_type CHECK (((source_type IS NULL) OR (source_type = ANY (ARRAY['DIRECT_LICENSED'::text, 'ADAPTED'::text, 'INSPIRED'::text, 'ORIGINAL'::text])))),
    CONSTRAINT b2_paper_items_type CHECK ((item_type = ANY (ARRAY['MCQ'::text, 'MULTI_SELECT'::text, 'TRUE_FALSE'::text, 'MATCHING'::text, 'GAP_FILL'::text, 'ORDERING'::text, 'SHORT_TEXT'::text, 'LONG_TEXT'::text, 'SPOKEN_RESPONSE'::text, 'OPEN_RESPONSE'::text])))
);


--
-- Name: b2_paper_items_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.b2_paper_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: b2_paper_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.b2_paper_items_id_seq OWNED BY public.b2_paper_items.id;


--
-- Name: b2_paper_sections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.b2_paper_sections (
    id integer NOT NULL,
    paper_id text NOT NULL,
    module text NOT NULL,
    part_no integer NOT NULL,
    title text NOT NULL,
    instruction text NOT NULL,
    minutes integer,
    max_points integer,
    passage text,
    audio_url text,
    task_id text,
    task_type text,
    skill text,
    scoring_mode text,
    item_count integer,
    speaking_task_id text,
    time_limit_seconds integer,
    audio_required boolean DEFAULT false NOT NULL,
    audio_asset_id text,
    audio_intended_id text,
    CONSTRAINT b2_paper_sections_audio_match CHECK (((audio_asset_id IS NULL) OR (audio_intended_id IS NULL) OR (audio_asset_id = audio_intended_id))),
    CONSTRAINT b2_paper_sections_module_check CHECK ((module = ANY (ARRAY['lesen'::text, 'hoeren'::text, 'sprachbausteine'::text, 'schreiben'::text, 'sprechen'::text]))),
    CONSTRAINT b2_paper_sections_scoring CHECK (((scoring_mode IS NULL) OR (scoring_mode = ANY (ARRAY['OBJECTIVE'::text, 'RUBRIC'::text, 'TRANSCRIPT_ONLY'::text, 'UNSCORED'::text])))),
    CONSTRAINT b2_paper_sections_skill CHECK (((skill IS NULL) OR (skill = ANY (ARRAY['reading'::text, 'listening'::text, 'speaking'::text, 'writing'::text, 'grammar'::text, 'vocabulary'::text]))))
);


--
-- Name: b2_paper_sections_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.b2_paper_sections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: b2_paper_sections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.b2_paper_sections_id_seq OWNED BY public.b2_paper_sections.id;


--
-- Name: b2_papers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.b2_papers (
    id text NOT NULL,
    board text NOT NULL,
    title text NOT NULL,
    minutes integer NOT NULL,
    source text NOT NULL,
    provisional boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    source_book text,
    source_chapter text,
    source_module text,
    source_page text,
    source_type text,
    adaptation_status text,
    review_status text DEFAULT 'DRAFT'::text NOT NULL,
    difficulty text,
    exam_version text,
    alignment text,
    CONSTRAINT b2_papers_adaptation_status CHECK (((adaptation_status IS NULL) OR (adaptation_status = ANY (ARRAY['NOT_APPLICABLE'::text, 'DRAFT'::text, 'ADAPTATION_REQUIRED'::text, 'ADAPTED'::text, 'READY_FOR_REVIEW'::text, 'APPROVED'::text])))),
    CONSTRAINT b2_papers_alignment CHECK (((alignment IS NULL) OR (alignment = ANY (ARRAY['licensed_official'::text, 'exam_format_practice'::text, 'exam_aligned'::text, 'original'::text])))),
    CONSTRAINT b2_papers_board_check CHECK ((board = ANY (ARRAY['goethe'::text, 'telc'::text, 'telc_pflege'::text, 'osd'::text, 'custom'::text]))),
    CONSTRAINT b2_papers_difficulty CHECK (((difficulty IS NULL) OR (difficulty = ANY (ARRAY['A'::text, 'B'::text, 'C'::text])))),
    CONSTRAINT b2_papers_official_needs_source CHECK (((alignment IS DISTINCT FROM 'licensed_official'::text) OR ((source_type = 'DIRECT_LICENSED'::text) AND (source_book IS NOT NULL)))),
    CONSTRAINT b2_papers_provenance_shape CHECK (((source_type IS NULL) OR ((source_type = 'ORIGINAL'::text) AND (source_book IS NULL) AND (source_page IS NULL)) OR ((source_type <> 'ORIGINAL'::text) AND (source_book IS NOT NULL)))),
    CONSTRAINT b2_papers_review_status CHECK ((review_status = ANY (ARRAY['DRAFT'::text, 'AUTO_QA_PASS'::text, 'SME_REVIEWED'::text, 'SME_CHANGES_REQUIRED'::text, 'PRODUCTION'::text]))),
    CONSTRAINT b2_papers_source_type CHECK (((source_type IS NULL) OR (source_type = ANY (ARRAY['DIRECT_LICENSED'::text, 'ADAPTED'::text, 'INSPIRED'::text, 'ORIGINAL'::text]))))
);


--
-- Name: b2_profile; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.b2_profile (
    user_id integer NOT NULL,
    dimension text NOT NULL,
    band text NOT NULL,
    score real NOT NULL,
    trend text,
    evidence_n integer DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT b2_profile_band_check CHECK ((band = ANY (ARRAY['needs_practice'::text, 'developing'::text, 'good'::text, 'strong'::text]))),
    CONSTRAINT b2_profile_trend_check CHECK ((trend = ANY (ARRAY['up'::text, 'flat'::text, 'down'::text])))
);


--
-- Name: b2_rubrics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.b2_rubrics (
    id integer NOT NULL,
    board text NOT NULL,
    module text NOT NULL,
    task_type text NOT NULL,
    version integer NOT NULL,
    provisional boolean DEFAULT false NOT NULL,
    dimensions jsonb NOT NULL,
    scale_max integer DEFAULT 100 NOT NULL,
    subtest_weight real,
    pass_mark integer DEFAULT 60 NOT NULL,
    borderline_low integer NOT NULL,
    borderline_high integer NOT NULL,
    CONSTRAINT b2_rubrics_board_check CHECK ((board = ANY (ARRAY['goethe'::text, 'telc'::text, 'telc_pflege'::text, 'osd'::text, 'custom'::text])))
);


--
-- Name: b2_rubrics_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.b2_rubrics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: b2_rubrics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.b2_rubrics_id_seq OWNED BY public.b2_rubrics.id;


--
-- Name: b2_sources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.b2_sources (
    id text NOT NULL,
    kind text NOT NULL,
    title text NOT NULL,
    hook text NOT NULL,
    theme integer NOT NULL,
    context text DEFAULT 'universal'::text NOT NULL,
    cefr_tier text DEFAULT 'developing'::text NOT NULL,
    declaration jsonb DEFAULT '{}'::jsonb NOT NULL,
    script jsonb NOT NULL,
    transcript text,
    audio_url text,
    duration_s integer,
    markers jsonb DEFAULT '[]'::jsonb NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    gate_report jsonb,
    review_notes text,
    approved_by text,
    approved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    source_book text,
    source_chapter text,
    source_module text,
    source_page text,
    source_type text,
    adaptation_status text,
    review_status text DEFAULT 'DRAFT'::text NOT NULL,
    difficulty text,
    audio_required boolean DEFAULT false NOT NULL,
    audio_asset_id text,
    CONSTRAINT b2_sources_adaptation_status CHECK (((adaptation_status IS NULL) OR (adaptation_status = ANY (ARRAY['NOT_APPLICABLE'::text, 'DRAFT'::text, 'ADAPTATION_REQUIRED'::text, 'ADAPTED'::text, 'READY_FOR_REVIEW'::text, 'APPROVED'::text])))),
    CONSTRAINT b2_sources_cefr_tier_check CHECK ((cefr_tier = ANY (ARRAY['foundation'::text, 'developing'::text, 'strong'::text, 'exam'::text]))),
    CONSTRAINT b2_sources_context_check CHECK ((context = ANY (ARRAY['universal'::text, 'professional'::text]))),
    CONSTRAINT b2_sources_difficulty CHECK (((difficulty IS NULL) OR (difficulty = ANY (ARRAY['A'::text, 'B'::text, 'C'::text])))),
    CONSTRAINT b2_sources_kind_check CHECK ((kind = ANY (ARRAY['audio'::text, 'text'::text]))),
    CONSTRAINT b2_sources_provenance_shape CHECK (((source_type IS NULL) OR ((source_type = 'ORIGINAL'::text) AND (source_book IS NULL) AND (source_page IS NULL)) OR ((source_type <> 'ORIGINAL'::text) AND (source_book IS NOT NULL)))),
    CONSTRAINT b2_sources_review_status CHECK ((review_status = ANY (ARRAY['DRAFT'::text, 'AUTO_QA_PASS'::text, 'SME_REVIEWED'::text, 'SME_CHANGES_REQUIRED'::text, 'PRODUCTION'::text]))),
    CONSTRAINT b2_sources_source_type CHECK (((source_type IS NULL) OR (source_type = ANY (ARRAY['DIRECT_LICENSED'::text, 'ADAPTED'::text, 'INSPIRED'::text, 'ORIGINAL'::text])))),
    CONSTRAINT b2_sources_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'gated'::text, 'review'::text, 'approved'::text, 'live'::text, 'rejected'::text]))),
    CONSTRAINT b2_sources_theme_check CHECK (((theme >= 1) AND (theme <= 14)))
);


--
-- Name: b2_speaking_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.b2_speaking_tasks (
    id text NOT NULL,
    rubric_id integer,
    prompt_de text NOT NULL,
    instruction_de text,
    prep_seconds integer,
    speak_seconds integer NOT NULL,
    format text NOT NULL,
    evaluation_mode text NOT NULL,
    primary_capability text,
    secondary_capabilities text[],
    difficulty text,
    source_book text,
    source_chapter text,
    source_module text,
    source_page text,
    source_type text,
    adaptation_status text,
    review_status text DEFAULT 'DRAFT'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT b2_speaking_tasks_adaptation_status_check CHECK (((adaptation_status IS NULL) OR (adaptation_status = ANY (ARRAY['NOT_APPLICABLE'::text, 'DRAFT'::text, 'ADAPTATION_REQUIRED'::text, 'ADAPTED'::text, 'READY_FOR_REVIEW'::text, 'APPROVED'::text])))),
    CONSTRAINT b2_speaking_tasks_difficulty_check CHECK (((difficulty IS NULL) OR (difficulty = ANY (ARRAY['A'::text, 'B'::text, 'C'::text])))),
    CONSTRAINT b2_speaking_tasks_evaluation_mode_check CHECK ((evaluation_mode = ANY (ARRAY['RUBRIC'::text, 'TRANSCRIPT_ONLY'::text, 'UNSCORED'::text]))),
    CONSTRAINT b2_speaking_tasks_format_check CHECK ((format = ANY (ARRAY['monologue'::text, 'dialogue'::text, 'presentation'::text, 'discussion'::text, 'reaction'::text]))),
    CONSTRAINT b2_speaking_tasks_provenance_shape CHECK (((source_type IS NULL) OR ((source_type = 'ORIGINAL'::text) AND (source_book IS NULL) AND (source_page IS NULL)) OR ((source_type <> 'ORIGINAL'::text) AND (source_book IS NOT NULL)))),
    CONSTRAINT b2_speaking_tasks_review_status_check CHECK ((review_status = ANY (ARRAY['DRAFT'::text, 'AUTO_QA_PASS'::text, 'SME_REVIEWED'::text, 'SME_CHANGES_REQUIRED'::text, 'PRODUCTION'::text]))),
    CONSTRAINT b2_speaking_tasks_source_type_check CHECK (((source_type IS NULL) OR (source_type = ANY (ARRAY['DIRECT_LICENSED'::text, 'ADAPTED'::text, 'INSPIRED'::text, 'ORIGINAL'::text]))))
);


--
-- Name: b2_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.b2_submissions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    task_id text NOT NULL,
    text text NOT NULL,
    word_count integer NOT NULL,
    attempt_no integer DEFAULT 1 NOT NULL,
    compose_ms integer,
    paste_events integer DEFAULT 0 NOT NULL,
    integrity_flag text,
    submitted_at timestamp with time zone DEFAULT now() NOT NULL,
    parent_id integer,
    targeted_check text,
    experience_id text,
    CONSTRAINT b2_submissions_not_own_parent CHECK (((parent_id IS NULL) OR (parent_id <> id)))
);


--
-- Name: b2_submissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.b2_submissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: b2_submissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.b2_submissions_id_seq OWNED BY public.b2_submissions.id;


--
-- Name: b2_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.b2_tasks (
    id text NOT NULL,
    rubric_id integer NOT NULL,
    prompt_de text NOT NULL,
    content_points jsonb DEFAULT '[]'::jsonb NOT NULL,
    target_words integer,
    source text,
    information_points jsonb,
    source_book text,
    source_chapter text,
    source_module text,
    source_page text,
    source_type text,
    adaptation_status text,
    review_status text DEFAULT 'DRAFT'::text NOT NULL,
    difficulty text,
    CONSTRAINT b2_tasks_adaptation_status CHECK (((adaptation_status IS NULL) OR (adaptation_status = ANY (ARRAY['NOT_APPLICABLE'::text, 'DRAFT'::text, 'ADAPTATION_REQUIRED'::text, 'ADAPTED'::text, 'READY_FOR_REVIEW'::text, 'APPROVED'::text])))),
    CONSTRAINT b2_tasks_difficulty CHECK (((difficulty IS NULL) OR (difficulty = ANY (ARRAY['A'::text, 'B'::text, 'C'::text])))),
    CONSTRAINT b2_tasks_provenance_shape CHECK (((source_type IS NULL) OR ((source_type = 'ORIGINAL'::text) AND (source_book IS NULL) AND (source_page IS NULL)) OR ((source_type <> 'ORIGINAL'::text) AND (source_book IS NOT NULL)))),
    CONSTRAINT b2_tasks_review_status CHECK ((review_status = ANY (ARRAY['DRAFT'::text, 'AUTO_QA_PASS'::text, 'SME_REVIEWED'::text, 'SME_CHANGES_REQUIRED'::text, 'PRODUCTION'::text]))),
    CONSTRAINT b2_tasks_source_type CHECK (((source_type IS NULL) OR (source_type = ANY (ARRAY['DIRECT_LICENSED'::text, 'ADAPTED'::text, 'INSPIRED'::text, 'ORIGINAL'::text]))))
);


--
-- Name: b2_v_assessment_versions; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.b2_v_assessment_versions AS
 SELECT p.id AS version,
    p.exam_version AS comparable_group,
    p.board,
    p.alignment,
    p.review_status,
    count(i.id) AS items,
    count(i.id) FILTER (WHERE (s.module <> 'sprechen'::text)) AS comparable_items,
    count(i.id) FILTER (WHERE (((i.payload ->> 'band'::text) = 'KNOWLEDGE'::text) AND (s.module <> 'sprechen'::text))) AS knowledge,
    count(i.id) FILTER (WHERE (((i.payload ->> 'band'::text) = 'SKILL'::text) AND (s.module <> 'sprechen'::text))) AS skill,
    round(((100.0 * (count(i.id) FILTER (WHERE (((i.payload ->> 'band'::text) = 'KNOWLEDGE'::text) AND (s.module <> 'sprechen'::text))))::numeric) / (NULLIF(count(i.id) FILTER (WHERE (s.module <> 'sprechen'::text)), 0))::numeric), 1) AS knowledge_pct,
    count(i.id) FILTER (WHERE (i.scoring_mode = 'OBJECTIVE'::text)) AS objective,
    count(i.id) FILTER (WHERE (i.scoring_mode = 'RUBRIC'::text)) AS rubric_scored,
    count(i.id) FILTER (WHERE (i.scoring_mode = 'TRANSCRIPT_ONLY'::text)) AS transcript_only,
    count(DISTINCT i.capability) AS capabilities,
    count(DISTINCT i.item_type) AS item_types,
    count(i.id) FILTER (WHERE (i.difficulty = 'A'::text)) AS diff_a,
    count(i.id) FILTER (WHERE (i.difficulty = 'B'::text)) AS diff_b,
    count(i.id) FILTER (WHERE (i.difficulty = 'C'::text)) AS diff_c,
    count(i.id) FILTER (WHERE (i.source_type IS NULL)) AS missing_provenance,
    count(i.id) FILTER (WHERE (i.difficulty IS NULL)) AS missing_difficulty,
    count(i.id) FILTER (WHERE ((i.scoring_mode = 'OBJECTIVE'::text) AND (i.answer IS NULL) AND (i.answer_payload IS NULL))) AS missing_answer_key,
    sum(p.minutes) AS minutes
   FROM ((public.b2_papers p
     JOIN public.b2_paper_sections s ON ((s.paper_id = p.id)))
     LEFT JOIN public.b2_paper_items i ON ((i.section_id = s.id)))
  GROUP BY p.id, p.exam_version, p.board, p.alignment, p.review_status, p.minutes;


--
-- Name: b2_v_audio_status; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.b2_v_audio_status AS
 SELECT s.paper_id AS version,
    s.module,
    s.audio_required,
    s.audio_intended_id AS intended,
    s.audio_asset_id AS attached,
    a.path,
    a.duration_seconds,
    a.transcript_available,
    a.kind,
        CASE
            WHEN (NOT s.audio_required) THEN 'not needed'::text
            WHEN (s.audio_asset_id IS NOT NULL) THEN 'ready'::text
            WHEN (s.audio_intended_id IS NOT NULL) THEN 'not cut yet'::text
            ELSE 'required but unnamed'::text
        END AS status
   FROM (public.b2_paper_sections s
     LEFT JOIN public.b2_audio_assets a ON ((a.id = s.audio_asset_id)));


--
-- Name: b2_v_capability_coverage; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.b2_v_capability_coverage AS
 SELECT i.capability,
    count(*) AS items,
    count(DISTINCT s.paper_id) AS versions,
    count(*) FILTER (WHERE (i.scoring_mode = 'OBJECTIVE'::text)) AS objective,
    count(*) FILTER (WHERE (i.scoring_mode <> 'OBJECTIVE'::text)) AS productive,
    string_agg(DISTINCT i.skill, ', '::text ORDER BY i.skill) AS skills
   FROM (public.b2_paper_items i
     JOIN public.b2_paper_sections s ON ((s.id = i.section_id)))
  WHERE (i.capability IS NOT NULL)
  GROUP BY i.capability;


--
-- Name: b2_v_content_blockers; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.b2_v_content_blockers AS
 SELECT 'audio_not_cut'::text AS blocker,
    s.paper_id AS scope,
    (('listening audio "'::text || s.audio_intended_id) || '" has not been produced'::text) AS detail
   FROM public.b2_paper_sections s
  WHERE (s.audio_required AND (s.audio_asset_id IS NULL))
UNION ALL
 SELECT 'audio_unnamed'::text AS blocker,
    s.paper_id AS scope,
    'section requires audio but names no clip'::text AS detail
   FROM public.b2_paper_sections s
  WHERE (s.audio_required AND (s.audio_asset_id IS NULL) AND (s.audio_intended_id IS NULL))
UNION ALL
 SELECT 'no_sme_review'::text AS blocker,
    p.id AS scope,
    (('content is at '::text || p.review_status) || '; no teacher has reviewed it'::text) AS detail
   FROM public.b2_papers p
  WHERE (p.review_status = ANY (ARRAY['DRAFT'::text, 'AUTO_QA_PASS'::text]))
UNION ALL
 SELECT 'missing_provenance'::text AS blocker,
    p.id AS scope,
    (count(*) || ' item(s) carry no source_type'::text) AS detail
   FROM ((public.b2_papers p
     JOIN public.b2_paper_sections s ON ((s.paper_id = p.id)))
     JOIN public.b2_paper_items i ON ((i.section_id = s.id)))
  WHERE (i.source_type IS NULL)
  GROUP BY p.id
UNION ALL
 SELECT 'missing_answer_key'::text AS blocker,
    p.id AS scope,
    (count(*) || ' objective item(s) have no key'::text) AS detail
   FROM ((public.b2_papers p
     JOIN public.b2_paper_sections s ON ((s.paper_id = p.id)))
     JOIN public.b2_paper_items i ON ((i.section_id = s.id)))
  WHERE ((i.scoring_mode = 'OBJECTIVE'::text) AND (i.answer IS NULL) AND (i.answer_payload IS NULL))
  GROUP BY p.id
UNION ALL
 SELECT 'false_review_claim'::text AS blocker,
    p.id AS scope,
    (('claims '::text || p.review_status) || ' with no recorded review'::text) AS detail
   FROM public.b2_papers p
  WHERE ((p.review_status = ANY (ARRAY['SME_REVIEWED'::text, 'PRODUCTION'::text])) AND (NOT (EXISTS ( SELECT 1
           FROM public.b2_content_reviews r
          WHERE ((r.entity_type = 'paper'::text) AND (r.entity_id = p.id))))));


--
-- Name: b2_verdicts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.b2_verdicts (
    id integer NOT NULL,
    submission_id integer NOT NULL,
    rubric_id integer NOT NULL,
    predicted_score integer NOT NULL,
    ci_low integer NOT NULL,
    ci_high integer NOT NULL,
    borderline boolean DEFAULT false NOT NULL,
    reasons jsonb NOT NULL,
    weakness_ids jsonb DEFAULT '[]'::jsonb NOT NULL,
    next_action text,
    human_reviewed boolean DEFAULT false NOT NULL,
    model_available boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: b2_verdicts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.b2_verdicts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: b2_verdicts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.b2_verdicts_id_seq OWNED BY public.b2_verdicts.id;


--
-- Name: error_telemetry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.error_telemetry (
    id integer NOT NULL,
    user_id integer,
    error_message text NOT NULL,
    error_stack text,
    component_stack text,
    user_agent text,
    occurred_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: error_telemetry_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.error_telemetry_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: error_telemetry_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.error_telemetry_id_seq OWNED BY public.error_telemetry.id;


--
-- Name: otp_codes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.otp_codes (
    id integer NOT NULL,
    phone text NOT NULL,
    code text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: otp_codes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.otp_codes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: otp_codes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.otp_codes_id_seq OWNED BY public.otp_codes.id;


--
-- Name: review_queue; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.review_queue (
    user_id integer NOT NULL,
    de text NOT NULL,
    en text NOT NULL,
    icon text DEFAULT '❓'::text NOT NULL,
    queued_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    token text NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL
);


--
-- Name: step_telemetry; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.step_telemetry (
    id integer NOT NULL,
    user_id integer,
    topic_id text NOT NULL,
    sub_key text NOT NULL,
    step_type text NOT NULL,
    action text NOT NULL,
    occurred_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: step_telemetry_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.step_telemetry_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: step_telemetry_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.step_telemetry_id_seq OWNED BY public.step_telemetry.id;


--
-- Name: tester_feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tester_feedback (
    id integer NOT NULL,
    user_id integer,
    topic_id text NOT NULL,
    sub_key text NOT NULL,
    sentiment text NOT NULL,
    comment text,
    occurred_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: tester_feedback_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tester_feedback_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tester_feedback_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tester_feedback_id_seq OWNED BY public.tester_feedback.id;


--
-- Name: topics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.topics (
    id text NOT NULL,
    order_index integer NOT NULL,
    icon text NOT NULL,
    title text NOT NULL,
    capability text NOT NULL,
    proof text NOT NULL,
    subs jsonb NOT NULL,
    level text DEFAULT 'a1'::text NOT NULL,
    status text DEFAULT 'live'::text NOT NULL,
    retired_reason text,
    retired_at timestamp with time zone,
    CONSTRAINT topics_level_chk CHECK ((level = ANY (ARRAY['a1'::text, 'a2'::text, 'b1'::text, 'b2'::text]))),
    CONSTRAINT topics_status_chk CHECK ((status = ANY (ARRAY['live'::text, 'retired'::text, 'draft'::text])))
);


--
-- Name: user_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_progress (
    user_id integer NOT NULL,
    topic_id text NOT NULL,
    sub_key text NOT NULL,
    completed_at timestamp with time zone DEFAULT now() NOT NULL,
    duration_secs integer DEFAULT 0 NOT NULL,
    accuracy_pct integer DEFAULT 100 NOT NULL
);


--
-- Name: user_stats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_stats (
    user_id integer NOT NULL,
    streak integer DEFAULT 1 NOT NULL,
    last_day date,
    words text[] DEFAULT '{}'::text[] NOT NULL,
    best_combo integer DEFAULT 0 NOT NULL,
    listen_skip_until timestamp with time zone,
    speak_skip_until timestamp with time zone
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name text NOT NULL,
    plan text DEFAULT 'trial'::text NOT NULL,
    premium_until timestamp with time zone,
    phone text,
    country_code text DEFAULT '+91'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    last_active_at timestamp with time zone DEFAULT now() NOT NULL,
    email text,
    password_hash text
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: b2_assessment_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_assessment_items ALTER COLUMN id SET DEFAULT nextval('public.b2_assessment_items_id_seq'::regclass);


--
-- Name: b2_attempt_sections id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_attempt_sections ALTER COLUMN id SET DEFAULT nextval('public.b2_attempt_sections_id_seq'::regclass);


--
-- Name: b2_can_do_links id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_can_do_links ALTER COLUMN id SET DEFAULT nextval('public.b2_can_do_links_id_seq'::regclass);


--
-- Name: b2_content_reviews id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_content_reviews ALTER COLUMN id SET DEFAULT nextval('public.b2_content_reviews_id_seq'::regclass);


--
-- Name: b2_evidence id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_evidence ALTER COLUMN id SET DEFAULT nextval('public.b2_evidence_id_seq'::regclass);


--
-- Name: b2_exam_targets id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_exam_targets ALTER COLUMN id SET DEFAULT nextval('public.b2_exam_targets_id_seq'::regclass);


--
-- Name: b2_findings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_findings ALTER COLUMN id SET DEFAULT nextval('public.b2_findings_id_seq'::regclass);


--
-- Name: b2_maya_sessions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_maya_sessions ALTER COLUMN id SET DEFAULT nextval('public.b2_maya_sessions_id_seq'::regclass);


--
-- Name: b2_outcomes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_outcomes ALTER COLUMN id SET DEFAULT nextval('public.b2_outcomes_id_seq'::regclass);


--
-- Name: b2_paper_attempts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_paper_attempts ALTER COLUMN id SET DEFAULT nextval('public.b2_paper_attempts_id_seq'::regclass);


--
-- Name: b2_paper_items id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_paper_items ALTER COLUMN id SET DEFAULT nextval('public.b2_paper_items_id_seq'::regclass);


--
-- Name: b2_paper_sections id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_paper_sections ALTER COLUMN id SET DEFAULT nextval('public.b2_paper_sections_id_seq'::regclass);


--
-- Name: b2_rubrics id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_rubrics ALTER COLUMN id SET DEFAULT nextval('public.b2_rubrics_id_seq'::regclass);


--
-- Name: b2_submissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_submissions ALTER COLUMN id SET DEFAULT nextval('public.b2_submissions_id_seq'::regclass);


--
-- Name: b2_verdicts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_verdicts ALTER COLUMN id SET DEFAULT nextval('public.b2_verdicts_id_seq'::regclass);


--
-- Name: error_telemetry id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.error_telemetry ALTER COLUMN id SET DEFAULT nextval('public.error_telemetry_id_seq'::regclass);


--
-- Name: otp_codes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.otp_codes ALTER COLUMN id SET DEFAULT nextval('public.otp_codes_id_seq'::regclass);


--
-- Name: step_telemetry id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.step_telemetry ALTER COLUMN id SET DEFAULT nextval('public.step_telemetry_id_seq'::regclass);


--
-- Name: tester_feedback id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tester_feedback ALTER COLUMN id SET DEFAULT nextval('public.tester_feedback_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: b2_assessment_items b2_assessment_items_attempt_id_item_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_assessment_items
    ADD CONSTRAINT b2_assessment_items_attempt_id_item_id_key UNIQUE (attempt_id, item_id);


--
-- Name: b2_assessment_items b2_assessment_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_assessment_items
    ADD CONSTRAINT b2_assessment_items_pkey PRIMARY KEY (id);


--
-- Name: b2_attempt_sections b2_attempt_sections_attempt_id_section_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_attempt_sections
    ADD CONSTRAINT b2_attempt_sections_attempt_id_section_id_key UNIQUE (attempt_id, section_id);


--
-- Name: b2_attempt_sections b2_attempt_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_attempt_sections
    ADD CONSTRAINT b2_attempt_sections_pkey PRIMARY KEY (id);


--
-- Name: b2_audio_assets b2_audio_assets_path_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_audio_assets
    ADD CONSTRAINT b2_audio_assets_path_key UNIQUE (path);


--
-- Name: b2_audio_assets b2_audio_assets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_audio_assets
    ADD CONSTRAINT b2_audio_assets_pkey PRIMARY KEY (id);


--
-- Name: b2_can_do_links b2_can_do_links_can_do_id_entity_type_entity_id_relation_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_can_do_links
    ADD CONSTRAINT b2_can_do_links_can_do_id_entity_type_entity_id_relation_key UNIQUE (can_do_id, entity_type, entity_id, relation);


--
-- Name: b2_can_do_links b2_can_do_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_can_do_links
    ADD CONSTRAINT b2_can_do_links_pkey PRIMARY KEY (id);


--
-- Name: b2_can_dos b2_can_dos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_can_dos
    ADD CONSTRAINT b2_can_dos_pkey PRIMARY KEY (id);


--
-- Name: b2_content_reviews b2_content_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_content_reviews
    ADD CONSTRAINT b2_content_reviews_pkey PRIMARY KEY (id);


--
-- Name: b2_drafts b2_drafts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_drafts
    ADD CONSTRAINT b2_drafts_pkey PRIMARY KEY (user_id, task_id);


--
-- Name: b2_evidence b2_evidence_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_evidence
    ADD CONSTRAINT b2_evidence_pkey PRIMARY KEY (id);


--
-- Name: b2_exam_plays b2_exam_plays_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_exam_plays
    ADD CONSTRAINT b2_exam_plays_pkey PRIMARY KEY (attempt_id, text_no);


--
-- Name: b2_exam_targets b2_exam_targets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_exam_targets
    ADD CONSTRAINT b2_exam_targets_pkey PRIMARY KEY (id);


--
-- Name: b2_exam_targets b2_exam_targets_user_id_board_module_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_exam_targets
    ADD CONSTRAINT b2_exam_targets_user_id_board_module_key UNIQUE (user_id, board, module);


--
-- Name: b2_experiences b2_experiences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_experiences
    ADD CONSTRAINT b2_experiences_pkey PRIMARY KEY (id);


--
-- Name: b2_expression_state b2_expression_state_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_expression_state
    ADD CONSTRAINT b2_expression_state_pkey PRIMARY KEY (user_id, expression);


--
-- Name: b2_findings b2_findings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_findings
    ADD CONSTRAINT b2_findings_pkey PRIMARY KEY (id);


--
-- Name: b2_learner_goal b2_learner_goal_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_learner_goal
    ADD CONSTRAINT b2_learner_goal_pkey PRIMARY KEY (user_id);


--
-- Name: b2_maya_sessions b2_maya_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_maya_sessions
    ADD CONSTRAINT b2_maya_sessions_pkey PRIMARY KEY (id);


--
-- Name: b2_maya_sessions b2_maya_sessions_session_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_maya_sessions
    ADD CONSTRAINT b2_maya_sessions_session_id_key UNIQUE (session_id);


--
-- Name: b2_outcomes b2_outcomes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_outcomes
    ADD CONSTRAINT b2_outcomes_pkey PRIMARY KEY (id);


--
-- Name: b2_paper_attempts b2_paper_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_paper_attempts
    ADD CONSTRAINT b2_paper_attempts_pkey PRIMARY KEY (id);


--
-- Name: b2_paper_items b2_paper_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_paper_items
    ADD CONSTRAINT b2_paper_items_pkey PRIMARY KEY (id);


--
-- Name: b2_paper_items b2_paper_items_section_id_item_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_paper_items
    ADD CONSTRAINT b2_paper_items_section_id_item_no_key UNIQUE (section_id, item_no);


--
-- Name: b2_paper_sections b2_paper_sections_paper_id_module_part_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_paper_sections
    ADD CONSTRAINT b2_paper_sections_paper_id_module_part_no_key UNIQUE (paper_id, module, part_no);


--
-- Name: b2_paper_sections b2_paper_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_paper_sections
    ADD CONSTRAINT b2_paper_sections_pkey PRIMARY KEY (id);


--
-- Name: b2_papers b2_papers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_papers
    ADD CONSTRAINT b2_papers_pkey PRIMARY KEY (id);


--
-- Name: b2_profile b2_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_profile
    ADD CONSTRAINT b2_profile_pkey PRIMARY KEY (user_id, dimension);


--
-- Name: b2_rubrics b2_rubrics_board_module_task_type_version_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_rubrics
    ADD CONSTRAINT b2_rubrics_board_module_task_type_version_key UNIQUE (board, module, task_type, version);


--
-- Name: b2_rubrics b2_rubrics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_rubrics
    ADD CONSTRAINT b2_rubrics_pkey PRIMARY KEY (id);


--
-- Name: b2_sources b2_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_sources
    ADD CONSTRAINT b2_sources_pkey PRIMARY KEY (id);


--
-- Name: b2_speaking_tasks b2_speaking_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_speaking_tasks
    ADD CONSTRAINT b2_speaking_tasks_pkey PRIMARY KEY (id);


--
-- Name: b2_submissions b2_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_submissions
    ADD CONSTRAINT b2_submissions_pkey PRIMARY KEY (id);


--
-- Name: b2_tasks b2_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_tasks
    ADD CONSTRAINT b2_tasks_pkey PRIMARY KEY (id);


--
-- Name: b2_verdicts b2_verdicts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_verdicts
    ADD CONSTRAINT b2_verdicts_pkey PRIMARY KEY (id);


--
-- Name: b2_verdicts b2_verdicts_submission_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_verdicts
    ADD CONSTRAINT b2_verdicts_submission_id_key UNIQUE (submission_id);


--
-- Name: error_telemetry error_telemetry_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.error_telemetry
    ADD CONSTRAINT error_telemetry_pkey PRIMARY KEY (id);


--
-- Name: otp_codes otp_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.otp_codes
    ADD CONSTRAINT otp_codes_pkey PRIMARY KEY (id);


--
-- Name: review_queue review_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_queue
    ADD CONSTRAINT review_queue_pkey PRIMARY KEY (user_id, de);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (token);


--
-- Name: step_telemetry step_telemetry_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.step_telemetry
    ADD CONSTRAINT step_telemetry_pkey PRIMARY KEY (id);


--
-- Name: tester_feedback tester_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tester_feedback
    ADD CONSTRAINT tester_feedback_pkey PRIMARY KEY (id);


--
-- Name: topics topics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_pkey PRIMARY KEY (id);


--
-- Name: user_progress user_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_pkey PRIMARY KEY (user_id, topic_id, sub_key);


--
-- Name: user_stats user_stats_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_stats
    ADD CONSTRAINT user_stats_pkey PRIMARY KEY (user_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: b2_assessment_items_attempt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX b2_assessment_items_attempt ON public.b2_assessment_items USING btree (attempt_id, "position");


--
-- Name: b2_assessment_items_capability; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX b2_assessment_items_capability ON public.b2_assessment_items USING btree (attempt_id, capability);


--
-- Name: b2_attempt_sections_attempt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX b2_attempt_sections_attempt ON public.b2_attempt_sections USING btree (attempt_id, ord);


--
-- Name: b2_attempts_assessment; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX b2_attempts_assessment ON public.b2_paper_attempts USING btree (user_id, kind, finished_at DESC NULLS LAST);


--
-- Name: b2_can_do_links_entity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX b2_can_do_links_entity ON public.b2_can_do_links USING btree (entity_type, entity_id);


--
-- Name: b2_content_reviews_entity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX b2_content_reviews_entity ON public.b2_content_reviews USING btree (entity_type, entity_id, reviewed_at DESC);


--
-- Name: b2_evidence_user_check_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX b2_evidence_user_check_idx ON public.b2_evidence USING btree (user_id, check_id, created_at DESC);


--
-- Name: b2_evidence_user_dim_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX b2_evidence_user_dim_idx ON public.b2_evidence USING btree (user_id, dimension, created_at DESC);


--
-- Name: b2_exam_plays_heard_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX b2_exam_plays_heard_idx ON public.b2_exam_plays USING btree (attempt_id, heard_at);


--
-- Name: b2_experiences_source_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX b2_experiences_source_idx ON public.b2_experiences USING btree (source_id, ord);


--
-- Name: b2_experiences_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX b2_experiences_status_idx ON public.b2_experiences USING btree (status);


--
-- Name: b2_expression_state_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX b2_expression_state_user_idx ON public.b2_expression_state USING btree (user_id, last_seen_at DESC);


--
-- Name: b2_findings_submission_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX b2_findings_submission_idx ON public.b2_findings USING btree (submission_id);


--
-- Name: b2_maya_one_active; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX b2_maya_one_active ON public.b2_maya_sessions USING btree (user_id, scenario_id) WHERE (status = 'active'::text);


--
-- Name: b2_maya_sessions_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX b2_maya_sessions_user_idx ON public.b2_maya_sessions USING btree (user_id, scenario_id, created_at DESC);


--
-- Name: b2_one_open_assessment_per_user; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX b2_one_open_assessment_per_user ON public.b2_paper_attempts USING btree (user_id) WHERE ((kind = 'assessment'::text) AND (finished_at IS NULL));


--
-- Name: b2_one_open_paper_per_user; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX b2_one_open_paper_per_user ON public.b2_paper_attempts USING btree (user_id, paper_id) WHERE ((kind = 'paper'::text) AND (finished_at IS NULL));


--
-- Name: b2_outcomes_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX b2_outcomes_user_idx ON public.b2_outcomes USING btree (user_id, board, module);


--
-- Name: b2_paper_attempts_one_open; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX b2_paper_attempts_one_open ON public.b2_paper_attempts USING btree (user_id, paper_id) WHERE (finished_at IS NULL);


--
-- Name: b2_paper_attempts_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX b2_paper_attempts_user ON public.b2_paper_attempts USING btree (user_id, paper_id);


--
-- Name: b2_paper_items_capability; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX b2_paper_items_capability ON public.b2_paper_items USING btree (capability);


--
-- Name: b2_paper_items_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX b2_paper_items_type ON public.b2_paper_items USING btree (item_type);


--
-- Name: b2_sources_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX b2_sources_status_idx ON public.b2_sources USING btree (status);


--
-- Name: b2_submissions_parent_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX b2_submissions_parent_idx ON public.b2_submissions USING btree (parent_id);


--
-- Name: b2_submissions_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX b2_submissions_user_idx ON public.b2_submissions USING btree (user_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_user_id_idx ON public.sessions USING btree (user_id);


--
-- Name: topics_level_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX topics_level_order_idx ON public.topics USING btree (level, order_index);


--
-- Name: topics_level_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX topics_level_status_idx ON public.topics USING btree (level, status, order_index);


--
-- Name: user_progress_daily; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_progress_daily ON public.user_progress USING btree (user_id, completed_at);


--
-- Name: b2_assessment_items b2_assessment_items_attempt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_assessment_items
    ADD CONSTRAINT b2_assessment_items_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES public.b2_paper_attempts(id) ON DELETE CASCADE;


--
-- Name: b2_assessment_items b2_assessment_items_evidence_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_assessment_items
    ADD CONSTRAINT b2_assessment_items_evidence_id_fkey FOREIGN KEY (evidence_id) REFERENCES public.b2_evidence(id) ON DELETE SET NULL;


--
-- Name: b2_attempt_sections b2_attempt_sections_attempt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_attempt_sections
    ADD CONSTRAINT b2_attempt_sections_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES public.b2_paper_attempts(id) ON DELETE CASCADE;


--
-- Name: b2_attempt_sections b2_attempt_sections_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_attempt_sections
    ADD CONSTRAINT b2_attempt_sections_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.b2_paper_sections(id) ON DELETE CASCADE;


--
-- Name: b2_can_do_links b2_can_do_links_can_do_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_can_do_links
    ADD CONSTRAINT b2_can_do_links_can_do_id_fkey FOREIGN KEY (can_do_id) REFERENCES public.b2_can_dos(id) ON DELETE CASCADE;


--
-- Name: b2_drafts b2_drafts_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_drafts
    ADD CONSTRAINT b2_drafts_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.b2_submissions(id) ON DELETE CASCADE;


--
-- Name: b2_drafts b2_drafts_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_drafts
    ADD CONSTRAINT b2_drafts_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.b2_tasks(id) ON DELETE CASCADE;


--
-- Name: b2_drafts b2_drafts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_drafts
    ADD CONSTRAINT b2_drafts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: b2_evidence b2_evidence_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_evidence
    ADD CONSTRAINT b2_evidence_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: b2_exam_plays b2_exam_plays_attempt_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_exam_plays
    ADD CONSTRAINT b2_exam_plays_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES public.b2_paper_attempts(id) ON DELETE CASCADE;


--
-- Name: b2_exam_targets b2_exam_targets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_exam_targets
    ADD CONSTRAINT b2_exam_targets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: b2_experiences b2_experiences_source_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_experiences
    ADD CONSTRAINT b2_experiences_source_id_fkey FOREIGN KEY (source_id) REFERENCES public.b2_sources(id) ON DELETE CASCADE;


--
-- Name: b2_expression_state b2_expression_state_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_expression_state
    ADD CONSTRAINT b2_expression_state_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: b2_findings b2_findings_submission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_findings
    ADD CONSTRAINT b2_findings_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.b2_submissions(id) ON DELETE CASCADE;


--
-- Name: b2_learner_goal b2_learner_goal_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_learner_goal
    ADD CONSTRAINT b2_learner_goal_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: b2_maya_sessions b2_maya_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_maya_sessions
    ADD CONSTRAINT b2_maya_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: b2_outcomes b2_outcomes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_outcomes
    ADD CONSTRAINT b2_outcomes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: b2_paper_attempts b2_paper_attempts_paper_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_paper_attempts
    ADD CONSTRAINT b2_paper_attempts_paper_id_fkey FOREIGN KEY (paper_id) REFERENCES public.b2_papers(id) ON DELETE CASCADE;


--
-- Name: b2_paper_attempts b2_paper_attempts_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_paper_attempts
    ADD CONSTRAINT b2_paper_attempts_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.b2_paper_sections(id) ON DELETE CASCADE;


--
-- Name: b2_paper_items b2_paper_items_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_paper_items
    ADD CONSTRAINT b2_paper_items_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.b2_paper_sections(id) ON DELETE CASCADE;


--
-- Name: b2_paper_sections b2_paper_sections_audio_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_paper_sections
    ADD CONSTRAINT b2_paper_sections_audio_asset_id_fkey FOREIGN KEY (audio_asset_id) REFERENCES public.b2_audio_assets(id);


--
-- Name: b2_paper_sections b2_paper_sections_paper_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_paper_sections
    ADD CONSTRAINT b2_paper_sections_paper_id_fkey FOREIGN KEY (paper_id) REFERENCES public.b2_papers(id) ON DELETE CASCADE;


--
-- Name: b2_paper_sections b2_paper_sections_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_paper_sections
    ADD CONSTRAINT b2_paper_sections_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.b2_tasks(id);


--
-- Name: b2_profile b2_profile_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_profile
    ADD CONSTRAINT b2_profile_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: b2_sources b2_sources_audio_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_sources
    ADD CONSTRAINT b2_sources_audio_asset_id_fkey FOREIGN KEY (audio_asset_id) REFERENCES public.b2_audio_assets(id);


--
-- Name: b2_speaking_tasks b2_speaking_tasks_rubric_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_speaking_tasks
    ADD CONSTRAINT b2_speaking_tasks_rubric_id_fkey FOREIGN KEY (rubric_id) REFERENCES public.b2_rubrics(id);


--
-- Name: b2_submissions b2_submissions_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_submissions
    ADD CONSTRAINT b2_submissions_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.b2_submissions(id) ON DELETE SET NULL;


--
-- Name: b2_submissions b2_submissions_task_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_submissions
    ADD CONSTRAINT b2_submissions_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.b2_tasks(id);


--
-- Name: b2_submissions b2_submissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_submissions
    ADD CONSTRAINT b2_submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: b2_tasks b2_tasks_rubric_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_tasks
    ADD CONSTRAINT b2_tasks_rubric_id_fkey FOREIGN KEY (rubric_id) REFERENCES public.b2_rubrics(id);


--
-- Name: b2_verdicts b2_verdicts_rubric_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_verdicts
    ADD CONSTRAINT b2_verdicts_rubric_id_fkey FOREIGN KEY (rubric_id) REFERENCES public.b2_rubrics(id);


--
-- Name: b2_verdicts b2_verdicts_submission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.b2_verdicts
    ADD CONSTRAINT b2_verdicts_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.b2_submissions(id) ON DELETE CASCADE;


--
-- Name: error_telemetry error_telemetry_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.error_telemetry
    ADD CONSTRAINT error_telemetry_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: review_queue review_queue_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.review_queue
    ADD CONSTRAINT review_queue_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: step_telemetry step_telemetry_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.step_telemetry
    ADD CONSTRAINT step_telemetry_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: tester_feedback tester_feedback_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tester_feedback
    ADD CONSTRAINT tester_feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: user_progress user_progress_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id);


--
-- Name: user_progress user_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_stats user_stats_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_stats
    ADD CONSTRAINT user_stats_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict hoQG2Z4Aak0xhzVg9fk5GtxgO4Z26Kdby1LdsA9F1uxOXIEQX5fVfWx3TKvyzTf

