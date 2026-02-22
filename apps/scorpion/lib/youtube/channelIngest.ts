/**
 * Channel Ingest Service
 *
 * Resolves a channel URL → recent video list → queues individual video ingests.
 * Uses RSS feed (no API key needed) with configurable concurrency.
 *
 * Guardrails:
 *   - Concurrency capped at 3 (safe default)
 *   - Per-video de-dupe
 *   - Run summary tracked per channel job
 */

import { parseYouTubeURL } from './normalize';
import { ingestVideo } from './videoIngest';
import { ChannelResolutionError } from './errors';
import * as db from './db';
import {
  IngestJobStatus,
  type YouTubeIngestJob,
  type IngestRunSummary,
  type ProviderAttempt,
} from './types';

const DEFAULT_LIMIT = 15;
const MAX_LIMIT = 50;
const CONCURRENCY = 3;

export interface ChannelIngestResult {
  job: YouTubeIngestJob;
  summary: IngestRunSummary;
}

interface ChannelVideoEntry {
  videoId: string;
  title: string;
  publishedAt: string;
  url: string;
}

export async function ingestChannel(
  url: string,
  limit: number = DEFAULT_LIMIT
): Promise<ChannelIngestResult> {
  const parsed = parseYouTubeURL(url);
  if (parsed.type !== 'channel') {
    throw new Error(`Expected channel URL, got ${parsed.type}: ${url}`);
  }

  const effectiveLimit = Math.min(Math.max(limit, 1), MAX_LIMIT);
  const channelIdentifier = parsed.id;

  const source = await db.upsertSource({
    type: 'channel',
    url: parsed.originalUrl,
    normalized_url: parsed.normalizedUrl,
    external_id: channelIdentifier,
    metadata_json: { limit: effectiveLimit },
  });

  const job = await db.createIngestJob({
    source_type: 'channel',
    source_id: source.id,
  });

  await db.updateIngestJob(job.id, {
    status: IngestJobStatus.RUNNING,
    started_at: new Date().toISOString(),
  });

  let videos: ChannelVideoEntry[];
  try {
    videos = await resolveChannelVideos(channelIdentifier, effectiveLimit);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const updatedJob = await db.updateIngestJob(job.id, {
      status: IngestJobStatus.FAILED,
      last_error: msg,
      completed_at: new Date().toISOString(),
    });
    return {
      job: updatedJob ?? job,
      summary: {
        total_found: 0,
        already_ingested: 0,
        transcribed: 0,
        failed: 1,
        queued_for_review: 0,
        provider_attempts: [],
      },
    };
  }

  console.log(`[ChannelIngest] Found ${videos.length} videos for channel ${channelIdentifier}`);

  const summary: IngestRunSummary = {
    total_found: videos.length,
    already_ingested: 0,
    transcribed: 0,
    failed: 0,
    queued_for_review: 0,
    provider_attempts: [],
  };

  const chunks = chunkArray(videos, CONCURRENCY);
  for (const chunk of chunks) {
    const results = await Promise.allSettled(
      chunk.map(async (video) => {
        try {
          const result = await ingestVideo(video.url);
          if (result.alreadyIngested) {
            summary.already_ingested++;
          } else if (result.success) {
            summary.transcribed++;
            if (result.proposal) summary.queued_for_review++;
          } else {
            summary.failed++;
          }
        } catch (err) {
          console.error(`[ChannelIngest] Video ${video.videoId} failed:`, err);
          summary.failed++;
        }
      })
    );
  }

  const finalStatus =
    summary.failed === 0
      ? IngestJobStatus.COMPLETED
      : summary.transcribed > 0
        ? IngestJobStatus.PARTIALLY_COMPLETED
        : IngestJobStatus.FAILED;

  const updatedJob = await db.updateIngestJob(job.id, {
    status: finalStatus,
    completed_at: new Date().toISOString(),
    run_summary_json: summary,
    last_error: summary.failed > 0 ? `${summary.failed} video(s) failed` : null,
  });

  console.log(
    `[ChannelIngest] DONE ${channelIdentifier}: ` +
    `${summary.transcribed} transcribed, ${summary.already_ingested} dupes, ${summary.failed} failed`
  );

  return { job: updatedJob ?? job, summary };
}

// ---------------------------------------------------------------------------
// Channel video resolution (RSS-based, no API key)
// ---------------------------------------------------------------------------

async function resolveChannelVideos(
  identifier: string,
  limit: number
): Promise<ChannelVideoEntry[]> {
  const channelId = identifier.startsWith('UC')
    ? identifier
    : await resolveHandleToChannelId(identifier);

  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

  let xml: string;
  try {
    const res = await fetch(rssUrl, {
      headers: { 'Accept': 'application/xml' },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      throw new ChannelResolutionError(identifier, `RSS feed HTTP ${res.status}`);
    }
    xml = await res.text();
  } catch (err) {
    if (err instanceof ChannelResolutionError) throw err;
    const msg = err instanceof Error ? err.message : String(err);
    throw new ChannelResolutionError(identifier, `RSS fetch failed: ${msg}`);
  }

  return parseRssFeed(xml).slice(0, limit);
}

async function resolveHandleToChannelId(handle: string): Promise<string> {
  const cleanHandle = handle.startsWith('@') ? handle : `@${handle}`;
  const pageUrl = `https://www.youtube.com/${cleanHandle}`;

  let html: string;
  try {
    const res = await fetch(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      throw new ChannelResolutionError(handle, `Channel page HTTP ${res.status}`);
    }
    html = await res.text();
  } catch (err) {
    if (err instanceof ChannelResolutionError) throw err;
    const msg = err instanceof Error ? err.message : String(err);
    throw new ChannelResolutionError(handle, `Channel page fetch failed: ${msg}`);
  }

  const idMatch = html.match(/"externalId"\s*:\s*"(UC[a-zA-Z0-9_-]{22})"/);
  if (idMatch?.[1]) return idMatch[1];

  const linkMatch = html.match(/youtube\.com\/channel\/(UC[a-zA-Z0-9_-]{22})/);
  if (linkMatch?.[1]) return linkMatch[1];

  const rssMatch = html.match(/channel_id=(UC[a-zA-Z0-9_-]{22})/);
  if (rssMatch?.[1]) return rssMatch[1];

  throw new ChannelResolutionError(handle, 'Could not find channel ID in page HTML');
}

function parseRssFeed(xml: string): ChannelVideoEntry[] {
  const entries: ChannelVideoEntry[] = [];
  const entryRe = /<entry>([\s\S]*?)<\/entry>/g;

  let m: RegExpExecArray | null;
  while ((m = entryRe.exec(xml)) !== null) {
    const block = m[1];
    const videoId = block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1];
    const title = block.match(/<media:title>([^<]+)<\/media:title>/)?.[1]
      ?? block.match(/<title>([^<]+)<\/title>/)?.[1];
    const published = block.match(/<published>([^<]+)<\/published>/)?.[1];

    if (videoId) {
      entries.push({
        videoId,
        title: title ?? 'Untitled',
        publishedAt: published ?? new Date().toISOString(),
        url: `https://www.youtube.com/watch?v=${videoId}`,
      });
    }
  }

  return entries;
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}
