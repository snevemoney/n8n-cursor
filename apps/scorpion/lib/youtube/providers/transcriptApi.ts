/**
 * Primary Provider: TranscriptAPI (youtube-full skill)
 *
 * Uses the installed TranscriptAPI skill via npx / direct fetch.
 * Falls back to the public transcript API endpoint.
 */

import { ProviderBlockedError, ParsingFailedError, RateLimitError, ProviderNotAvailableError } from '../errors';
import type { TranscriptResult, TranscriptSegment } from '../types';
import { TranscriptProvider } from '../types';

const PROVIDER = TranscriptProvider.TRANSCRIPT_API;
const TRANSCRIPT_API_BASE = process.env.TRANSCRIPT_API_URL || 'https://yt.lemnoslife.com/noKey';
const ENABLED = process.env.YOUTUBE_TRANSCRIPT_API_ENABLED !== 'false';

export async function isAvailable(): Promise<boolean> {
  return ENABLED;
}

export async function fetchTranscript(videoId: string): Promise<TranscriptResult> {
  if (!ENABLED) {
    throw new ProviderNotAvailableError(PROVIDER, 'YOUTUBE_TRANSCRIPT_API_ENABLED is false');
  }

  const url = `${TRANSCRIPT_API_BASE}/videos?part=transcript&id=${videoId}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new ProviderBlockedError(PROVIDER, videoId, `Network error: ${msg}`);
  }

  if (response.status === 429) {
    throw new RateLimitError(PROVIDER, 60_000);
  }

  if (!response.ok) {
    throw new ProviderBlockedError(PROVIDER, videoId, `HTTP ${response.status}`);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new ParsingFailedError(PROVIDER, videoId, 'Invalid JSON response');
  }

  return parseTranscriptApiResponse(videoId, data);
}

function parseTranscriptApiResponse(videoId: string, data: unknown): TranscriptResult {
  const obj = data as Record<string, unknown>;
  const items = Array.isArray(obj['items']) ? obj['items'] : [];

  if (items.length === 0) {
    throw new ParsingFailedError(PROVIDER, videoId, 'No items in response');
  }

  const item = items[0] as Record<string, unknown>;
  const transcriptData = item['transcript'] as Record<string, unknown> | undefined;

  if (!transcriptData) {
    throw new ParsingFailedError(PROVIDER, videoId, 'No transcript field in item');
  }

  const content = transcriptData['content'] as Array<Record<string, unknown>> | undefined
    ?? transcriptData['segments'] as Array<Record<string, unknown>> | undefined;

  if (!content || content.length === 0) {
    throw new ParsingFailedError(PROVIDER, videoId, 'Empty transcript content');
  }

  const segments: TranscriptSegment[] = content.map((seg) => ({
    text: String(seg['text'] ?? seg['content'] ?? ''),
    start: Number(seg['start'] ?? seg['offset'] ?? 0),
    duration: Number(seg['duration'] ?? seg['dur'] ?? 0),
  }));

  const fullText = segments.map((s) => s.text).join(' ').trim();
  const lastSeg = segments[segments.length - 1];
  const durationSeconds = lastSeg ? Math.ceil(lastSeg.start + lastSeg.duration) : null;

  const lang = transcriptData['languageCode'] as string
    ?? transcriptData['language'] as string
    ?? 'en';

  return {
    text: fullText,
    segments,
    language: lang,
    provider: PROVIDER,
    confidence: null,
    durationSeconds,
  };
}
