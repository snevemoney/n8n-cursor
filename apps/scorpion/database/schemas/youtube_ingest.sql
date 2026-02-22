-- YouTube Transcript Ingestion System - Schema Migration
-- Additive, safe: uses CREATE TABLE IF NOT EXISTS.
-- Human-gated learning pipeline: no auto-modify, no auto-promote.
-- Run with: psql $DATABASE_URL -f database/schemas/youtube_ingest.sql

-- ---------------------------------------------------------------------------
-- 1. youtube_sources — video or channel records
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS youtube_sources (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type          VARCHAR(10)   NOT NULL CHECK (type IN ('video', 'channel')),
  url           TEXT          NOT NULL,
  normalized_url TEXT         NOT NULL,
  external_id   VARCHAR(128)  NOT NULL,
  title         TEXT,
  channel_name  TEXT,
  channel_id    VARCHAR(128),
  metadata_json JSONB         NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_youtube_sources_external_id
  ON youtube_sources (type, external_id);

CREATE INDEX IF NOT EXISTS idx_youtube_sources_channel_id
  ON youtube_sources (channel_id) WHERE channel_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 2. youtube_ingest_jobs — tracks each ingest run
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS youtube_ingest_jobs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type      VARCHAR(10)   NOT NULL CHECK (source_type IN ('video', 'channel')),
  source_id        UUID          REFERENCES youtube_sources(id) ON DELETE SET NULL,
  status           VARCHAR(32)   NOT NULL DEFAULT 'QUEUED'
                   CHECK (status IN ('QUEUED','RUNNING','COMPLETED','PARTIALLY_COMPLETED','FAILED')),
  attempts         INT           NOT NULL DEFAULT 0,
  provider_used    VARCHAR(32),
  last_error       TEXT,
  run_summary_json JSONB,
  queued_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
  started_at       TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_youtube_ingest_jobs_status
  ON youtube_ingest_jobs (status);

CREATE INDEX IF NOT EXISTS idx_youtube_ingest_jobs_source
  ON youtube_ingest_jobs (source_id);

-- ---------------------------------------------------------------------------
-- 3. youtube_transcripts — the actual transcript content
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS youtube_transcripts (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id                 VARCHAR(32)  NOT NULL UNIQUE,
  channel_id               VARCHAR(128),
  source_url               TEXT         NOT NULL,
  title                    TEXT,
  transcript_text          TEXT         NOT NULL DEFAULT '',
  transcript_segments_json JSONB,
  language                 VARCHAR(16),
  duration_seconds         INT,
  published_at             TIMESTAMPTZ,
  provider_used            VARCHAR(32)  NOT NULL,
  transcript_hash          VARCHAR(64)  NOT NULL DEFAULT '',
  transcript_status        VARCHAR(32)  NOT NULL DEFAULT 'PENDING'
                           CHECK (transcript_status IN (
                             'PENDING','FETCHING','TRANSCRIBED',
                             'FAILED_TRANSCRIPT','READY_FOR_REVIEW',
                             'PROMOTED_TO_PLAYBOOK','REJECTED','KNOWLEDGE_ONLY'
                           )),
  failure_reason           TEXT,
  metadata_json            JSONB        NOT NULL DEFAULT '{}',
  created_at               TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_youtube_transcripts_status
  ON youtube_transcripts (transcript_status);

CREATE INDEX IF NOT EXISTS idx_youtube_transcripts_channel
  ON youtube_transcripts (channel_id) WHERE channel_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_youtube_transcripts_provider
  ON youtube_transcripts (provider_used);

-- ---------------------------------------------------------------------------
-- 4. learning_proposals — human-gated knowledge pipeline
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS learning_proposals (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id            UUID          REFERENCES youtube_transcripts(id) ON DELETE CASCADE,
  video_id                 VARCHAR(32)   NOT NULL,
  summary                  TEXT          NOT NULL DEFAULT '',
  extracted_points_json    JSONB         NOT NULL DEFAULT '[]',
  category                 VARCHAR(32)   NOT NULL DEFAULT 'operations',
  system_area              VARCHAR(16)   NOT NULL DEFAULT 'Improve'
                           CHECK (system_area IN ('Acquire','Deliver','Improve')),
  contradiction_flags_json JSONB         NOT NULL DEFAULT '[]',
  proposed_actions_json    JSONB         NOT NULL DEFAULT '[]',
  produced_asset_type      VARCHAR(32)   NOT NULL DEFAULT 'knowledge_only',
  expected_impact          VARCHAR(16)   NOT NULL DEFAULT 'Improve'
                           CHECK (expected_impact IN ('Acquire','Deliver','Improve')),
  revenue_link             TEXT,
  status                   VARCHAR(32)   NOT NULL DEFAULT 'READY_FOR_REVIEW'
                           CHECK (status IN (
                             'READY_FOR_REVIEW','PROMOTED_TO_PLAYBOOK','REJECTED','KNOWLEDGE_ONLY'
                           )),
  reviewer_notes           TEXT,
  created_at               TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_learning_proposals_status
  ON learning_proposals (status);

CREATE INDEX IF NOT EXISTS idx_learning_proposals_transcript
  ON learning_proposals (transcript_id);

CREATE INDEX IF NOT EXISTS idx_learning_proposals_system_area
  ON learning_proposals (system_area);

-- ---------------------------------------------------------------------------
-- Updated-at trigger (reuse if you already have one)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER youtube_sources_updated_at
    BEFORE UPDATE ON youtube_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER youtube_transcripts_updated_at
    BEFORE UPDATE ON youtube_transcripts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER learning_proposals_updated_at
    BEFORE UPDATE ON learning_proposals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
