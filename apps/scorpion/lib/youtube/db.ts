/**
 * YouTube Ingestion - Database Access Layer
 *
 * Thin wrapper around the shared Postgres client.
 * Every query is parameterized. No raw string interpolation.
 */

import { query, transaction } from '@/lib/db/client';
import type {
  YouTubeSource,
  YouTubeTranscript,
  YouTubeIngestJob,
  LearningProposal,
  TranscriptStatusType,
  IngestJobStatusType,
  LearningProposalStatusType,
  SourceTypeValue,
  IngestRunSummary,
  IngestSummaryStats,
} from './types';

// ---------------------------------------------------------------------------
// youtube_sources
// ---------------------------------------------------------------------------

export async function upsertSource(src: {
  type: SourceTypeValue;
  url: string;
  normalized_url: string;
  external_id: string;
  title?: string | null;
  channel_name?: string | null;
  channel_id?: string | null;
  metadata_json?: Record<string, unknown>;
}): Promise<YouTubeSource> {
  const { rows } = await query<YouTubeSource>(
    `INSERT INTO youtube_sources (type, url, normalized_url, external_id, title, channel_name, channel_id, metadata_json)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (type, external_id) DO UPDATE SET
       url = EXCLUDED.url,
       normalized_url = EXCLUDED.normalized_url,
       title = COALESCE(EXCLUDED.title, youtube_sources.title),
       channel_name = COALESCE(EXCLUDED.channel_name, youtube_sources.channel_name),
       channel_id = COALESCE(EXCLUDED.channel_id, youtube_sources.channel_id),
       metadata_json = youtube_sources.metadata_json || EXCLUDED.metadata_json,
       updated_at = now()
     RETURNING *`,
    [
      src.type,
      src.url,
      src.normalized_url,
      src.external_id,
      src.title ?? null,
      src.channel_name ?? null,
      src.channel_id ?? null,
      JSON.stringify(src.metadata_json ?? {}),
    ]
  );
  return rows[0];
}

export async function findSourceByExternalId(
  type: SourceTypeValue,
  externalId: string
): Promise<YouTubeSource | null> {
  const { rows } = await query<YouTubeSource>(
    `SELECT * FROM youtube_sources WHERE type = $1 AND external_id = $2`,
    [type, externalId]
  );
  return rows[0] ?? null;
}

// ---------------------------------------------------------------------------
// youtube_ingest_jobs
// ---------------------------------------------------------------------------

export async function createIngestJob(job: {
  source_type: SourceTypeValue;
  source_id: string;
}): Promise<YouTubeIngestJob> {
  const { rows } = await query<YouTubeIngestJob>(
    `INSERT INTO youtube_ingest_jobs (source_type, source_id) VALUES ($1, $2) RETURNING *`,
    [job.source_type, job.source_id]
  );
  return rows[0];
}

export async function updateIngestJob(
  id: string,
  updates: Partial<{
    status: IngestJobStatusType;
    attempts: number;
    provider_used: string | null;
    last_error: string | null;
    run_summary_json: IngestRunSummary;
    started_at: string;
    completed_at: string;
  }>
): Promise<YouTubeIngestJob | null> {
  const setClauses: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      const dbValue = key === 'run_summary_json' ? JSON.stringify(value) : value;
      setClauses.push(`${key} = $${idx}`);
      values.push(dbValue);
      idx++;
    }
  }

  if (setClauses.length === 0) return null;

  values.push(id);
  const { rows } = await query<YouTubeIngestJob>(
    `UPDATE youtube_ingest_jobs SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return rows[0] ?? null;
}

export async function getRecentJobs(limit: number = 50): Promise<YouTubeIngestJob[]> {
  const { rows } = await query<YouTubeIngestJob>(
    `SELECT j.*, s.title as source_title, s.external_id as source_external_id, s.url as source_url
     FROM youtube_ingest_jobs j
     LEFT JOIN youtube_sources s ON j.source_id = s.id
     ORDER BY j.queued_at DESC LIMIT $1`,
    [limit]
  );
  return rows;
}

export async function getFailedJobs(): Promise<YouTubeIngestJob[]> {
  const { rows } = await query<YouTubeIngestJob>(
    `SELECT j.*, s.title as source_title, s.external_id as source_external_id, s.url as source_url
     FROM youtube_ingest_jobs j
     LEFT JOIN youtube_sources s ON j.source_id = s.id
     WHERE j.status = 'FAILED'
     ORDER BY j.queued_at DESC`
  );
  return rows;
}

// ---------------------------------------------------------------------------
// youtube_transcripts
// ---------------------------------------------------------------------------

export async function upsertTranscript(t: {
  video_id: string;
  channel_id?: string | null;
  source_url: string;
  title?: string | null;
  transcript_text: string;
  transcript_segments_json?: unknown[];
  language?: string | null;
  duration_seconds?: number | null;
  published_at?: string | null;
  provider_used: string;
  transcript_hash: string;
  transcript_status: TranscriptStatusType;
  failure_reason?: string | null;
  metadata_json?: Record<string, unknown>;
}): Promise<YouTubeTranscript> {
  const { rows } = await query<YouTubeTranscript>(
    `INSERT INTO youtube_transcripts
       (video_id, channel_id, source_url, title, transcript_text,
        transcript_segments_json, language, duration_seconds, published_at,
        provider_used, transcript_hash, transcript_status, failure_reason, metadata_json)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     ON CONFLICT (video_id) DO UPDATE SET
       transcript_text = EXCLUDED.transcript_text,
       transcript_segments_json = EXCLUDED.transcript_segments_json,
       language = EXCLUDED.language,
       duration_seconds = EXCLUDED.duration_seconds,
       provider_used = EXCLUDED.provider_used,
       transcript_hash = EXCLUDED.transcript_hash,
       transcript_status = EXCLUDED.transcript_status,
       failure_reason = EXCLUDED.failure_reason,
       metadata_json = youtube_transcripts.metadata_json || EXCLUDED.metadata_json,
       updated_at = now()
     RETURNING *`,
    [
      t.video_id,
      t.channel_id ?? null,
      t.source_url,
      t.title ?? null,
      t.transcript_text,
      t.transcript_segments_json ? JSON.stringify(t.transcript_segments_json) : null,
      t.language ?? null,
      t.duration_seconds ?? null,
      t.published_at ?? null,
      t.provider_used,
      t.transcript_hash,
      t.transcript_status,
      t.failure_reason ?? null,
      JSON.stringify(t.metadata_json ?? {}),
    ]
  );
  return rows[0];
}

export async function findTranscriptByVideoId(videoId: string): Promise<YouTubeTranscript | null> {
  const { rows } = await query<YouTubeTranscript>(
    `SELECT * FROM youtube_transcripts WHERE video_id = $1`,
    [videoId]
  );
  return rows[0] ?? null;
}

export async function getTranscripts(filters?: {
  status?: TranscriptStatusType;
  provider?: string;
  channel_id?: string;
  limit?: number;
}): Promise<YouTubeTranscript[]> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (filters?.status) {
    conditions.push(`transcript_status = $${idx++}`);
    values.push(filters.status);
  }
  if (filters?.provider) {
    conditions.push(`provider_used = $${idx++}`);
    values.push(filters.provider);
  }
  if (filters?.channel_id) {
    conditions.push(`channel_id = $${idx++}`);
    values.push(filters.channel_id);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = filters?.limit ?? 50;
  values.push(limit);

  const { rows } = await query<YouTubeTranscript>(
    `SELECT * FROM youtube_transcripts ${where} ORDER BY created_at DESC LIMIT $${idx}`,
    values
  );
  return rows;
}

export async function updateTranscriptStatus(
  videoId: string,
  status: TranscriptStatusType,
  failureReason?: string
): Promise<YouTubeTranscript | null> {
  const { rows } = await query<YouTubeTranscript>(
    `UPDATE youtube_transcripts SET transcript_status = $1, failure_reason = $2 WHERE video_id = $3 RETURNING *`,
    [status, failureReason ?? null, videoId]
  );
  return rows[0] ?? null;
}

// ---------------------------------------------------------------------------
// learning_proposals
// ---------------------------------------------------------------------------

export async function createLearningProposal(p: {
  transcript_id: string;
  video_id: string;
  summary: string;
  extracted_points_json: unknown[];
  category: string;
  system_area: string;
  contradiction_flags_json: unknown[];
  proposed_actions_json: unknown[];
  produced_asset_type: string;
  expected_impact: string;
  revenue_link?: string | null;
}): Promise<LearningProposal> {
  const { rows } = await query<LearningProposal>(
    `INSERT INTO learning_proposals
       (transcript_id, video_id, summary, extracted_points_json, category,
        system_area, contradiction_flags_json, proposed_actions_json,
        produced_asset_type, expected_impact, revenue_link)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING *`,
    [
      p.transcript_id,
      p.video_id,
      p.summary,
      JSON.stringify(p.extracted_points_json),
      p.category,
      p.system_area,
      JSON.stringify(p.contradiction_flags_json),
      JSON.stringify(p.proposed_actions_json),
      p.produced_asset_type,
      p.expected_impact,
      p.revenue_link ?? null,
    ]
  );
  return rows[0];
}

export async function updateProposalStatus(
  id: string,
  status: LearningProposalStatusType,
  reviewerNotes?: string
): Promise<LearningProposal | null> {
  const { rows } = await query<LearningProposal>(
    `UPDATE learning_proposals SET status = $1, reviewer_notes = $2 WHERE id = $3 RETURNING *`,
    [status, reviewerNotes ?? null, id]
  );
  return rows[0] ?? null;
}

export async function getProposals(filters?: {
  status?: LearningProposalStatusType;
  system_area?: string;
  limit?: number;
}): Promise<LearningProposal[]> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (filters?.status) {
    conditions.push(`lp.status = $${idx++}`);
    values.push(filters.status);
  }
  if (filters?.system_area) {
    conditions.push(`lp.system_area = $${idx++}`);
    values.push(filters.system_area);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = filters?.limit ?? 50;
  values.push(limit);

  const { rows } = await query<LearningProposal>(
    `SELECT lp.*, yt.title as transcript_title, yt.source_url
     FROM learning_proposals lp
     LEFT JOIN youtube_transcripts yt ON lp.transcript_id = yt.id
     ${where}
     ORDER BY lp.created_at DESC LIMIT $${idx}`,
    values
  );
  return rows;
}

export async function findProposalByTranscriptId(transcriptId: string): Promise<LearningProposal | null> {
  const { rows } = await query<LearningProposal>(
    `SELECT * FROM learning_proposals WHERE transcript_id = $1`,
    [transcriptId]
  );
  return rows[0] ?? null;
}

// ---------------------------------------------------------------------------
// Summary stats (for Command Center card)
// ---------------------------------------------------------------------------

export async function getIngestSummaryStats(): Promise<IngestSummaryStats> {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [transcriptsRes, failedRes, pendingRes, promotedRes] = await Promise.all([
    query<{ count: string }>(
      `SELECT COUNT(*) as count FROM youtube_transcripts WHERE transcript_status = 'TRANSCRIBED' AND created_at >= $1`,
      [oneWeekAgo]
    ),
    query<{ count: string }>(
      `SELECT COUNT(*) as count FROM youtube_ingest_jobs WHERE status = 'FAILED'`
    ),
    query<{ count: string }>(
      `SELECT COUNT(*) as count FROM learning_proposals WHERE status = 'READY_FOR_REVIEW'`
    ),
    query<{ count: string }>(
      `SELECT COUNT(*) as count FROM learning_proposals WHERE status = 'PROMOTED_TO_PLAYBOOK'`
    ),
  ]);

  return {
    transcripts_this_week: parseInt(transcriptsRes.rows[0]?.count ?? '0', 10),
    failed_jobs: parseInt(failedRes.rows[0]?.count ?? '0', 10),
    pending_review: parseInt(pendingRes.rows[0]?.count ?? '0', 10),
    promoted_count: parseInt(promotedRes.rows[0]?.count ?? '0', 10),
  };
}
