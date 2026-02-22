/**
 * Video Ingest Service
 *
 * Single-video ingestion pipeline:
 *   1. Parse & normalise URL
 *   2. De-dupe check
 *   3. Create source + job records
 *   4. Resolve transcript (cascading providers)
 *   5. Store transcript
 *   6. Trigger learning proposal generation
 *
 * Guardrail: learning proposal is created as READY_FOR_REVIEW, never auto-promoted.
 */

import { createHash } from 'crypto';
import { parseYouTubeURL } from './normalize';
import { resolveTranscript } from './transcriptResolver';
import { generateLearningProposal } from './learningProposal';
import { formatErrorForStorage } from './errors';
import * as db from './db';
import {
  TranscriptStatus,
  IngestJobStatus,
  type YouTubeTranscript,
  type YouTubeIngestJob,
  type LearningProposal,
} from './types';

export interface VideoIngestResult {
  success: boolean;
  job: YouTubeIngestJob;
  transcript: YouTubeTranscript | null;
  proposal: LearningProposal | null;
  alreadyIngested: boolean;
  error?: string;
}

export async function ingestVideo(url: string): Promise<VideoIngestResult> {
  const parsed = parseYouTubeURL(url);
  if (parsed.type !== 'video') {
    throw new Error(`Expected video URL, got ${parsed.type}: ${url}`);
  }

  const videoId = parsed.id;

  const existing = await db.findTranscriptByVideoId(videoId);
  if (existing && existing.transcript_status === TranscriptStatus.TRANSCRIBED) {
    console.log(`[VideoIngest] De-dupe: ${videoId} already transcribed`);
    const source = await db.findSourceByExternalId('video', videoId);
    const job = await db.createIngestJob({
      source_type: 'video',
      source_id: source?.id ?? '',
    });
    await db.updateIngestJob(job.id, {
      status: IngestJobStatus.COMPLETED,
      completed_at: new Date().toISOString(),
      last_error: 'Already ingested (de-dupe)',
    });
    return {
      success: true,
      job,
      transcript: existing,
      proposal: null,
      alreadyIngested: true,
    };
  }

  const source = await db.upsertSource({
    type: 'video',
    url: parsed.originalUrl,
    normalized_url: parsed.normalizedUrl,
    external_id: videoId,
  });

  const job = await db.createIngestJob({
    source_type: 'video',
    source_id: source.id,
  });

  await db.updateIngestJob(job.id, {
    status: IngestJobStatus.RUNNING,
    started_at: new Date().toISOString(),
    attempts: 1,
  });

  const resolved = await resolveTranscript(videoId);

  if (!resolved.success || !resolved.transcript) {
    const failureReason = resolved.failureReason ?? 'Unknown failure';
    await db.upsertTranscript({
      video_id: videoId,
      source_url: parsed.normalizedUrl,
      transcript_text: '',
      provider_used: resolved.attempts[resolved.attempts.length - 1]?.provider ?? 'none',
      transcript_hash: '',
      transcript_status: TranscriptStatus.FAILED_TRANSCRIPT,
      failure_reason: failureReason,
      channel_id: source.channel_id,
      metadata_json: { attempts: resolved.attempts },
    });

    const updatedJob = await db.updateIngestJob(job.id, {
      status: IngestJobStatus.FAILED,
      last_error: failureReason,
      completed_at: new Date().toISOString(),
      run_summary_json: {
        total_found: 1,
        already_ingested: 0,
        transcribed: 0,
        failed: 1,
        queued_for_review: 0,
        provider_attempts: resolved.attempts,
      },
    });

    return {
      success: false,
      job: updatedJob ?? job,
      transcript: null,
      proposal: null,
      alreadyIngested: false,
      error: failureReason,
    };
  }

  const { transcript: result } = resolved;
  const hash = createHash('sha256').update(result.text).digest('hex').slice(0, 64);

  const transcript = await db.upsertTranscript({
    video_id: videoId,
    channel_id: source.channel_id,
    source_url: parsed.normalizedUrl,
    title: source.title,
    transcript_text: result.text,
    transcript_segments_json: result.segments,
    language: result.language,
    duration_seconds: result.durationSeconds,
    provider_used: result.provider,
    transcript_hash: hash,
    transcript_status: TranscriptStatus.TRANSCRIBED,
    metadata_json: {
      attempts: resolved.attempts,
      confidence: result.confidence,
    },
  });

  let proposal: LearningProposal | null = null;
  try {
    proposal = await generateLearningProposal(transcript);
    await db.updateTranscriptStatus(videoId, TranscriptStatus.READY_FOR_REVIEW);
  } catch (err) {
    console.error(`[VideoIngest] Learning proposal generation failed for ${videoId}:`, err);
  }

  const updatedJob = await db.updateIngestJob(job.id, {
    status: IngestJobStatus.COMPLETED,
    provider_used: result.provider,
    completed_at: new Date().toISOString(),
    run_summary_json: {
      total_found: 1,
      already_ingested: 0,
      transcribed: 1,
      failed: 0,
      queued_for_review: proposal ? 1 : 0,
      provider_attempts: resolved.attempts,
    },
  });

  console.log(
    `[VideoIngest] DONE ${videoId} via ${result.provider} — ` +
    `${result.text.length} chars, proposal=${proposal ? 'created' : 'skipped'}`
  );

  return {
    success: true,
    job: updatedJob ?? job,
    transcript,
    proposal,
    alreadyIngested: false,
  };
}
