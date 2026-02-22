/**
 * Transcript Resolver — Cascading Fallback Pipeline
 *
 * Provider order:
 *   1. TranscriptAPI (fast, no binary needed)
 *   2. YouTube Captions (page-scrape, no key needed)
 *   3. yt-dlp (binary, robust subtitle download)
 *   4. Whisper (optional, requires OpenAI key + yt-dlp)
 *
 * Each provider is tried once. If retryable errors occur the resolver
 * logs them and moves to the next provider. Non-retryable errors (e.g.
 * "no captions exist") skip straight to the next provider without retry.
 *
 * The caller gets back either a TranscriptResult or a structured failure
 * with every attempt logged.
 */

import * as transcriptApi from './providers/transcriptApi';
import * as youtubeCaptions from './providers/youtubeCaptions';
import * as ytDlp from './providers/ytDlp';
import * as whisper from './providers/whisper';
import { YouTubeError } from './errors';
import type { TranscriptResult, ProviderAttempt, TranscriptProviderType } from './types';

interface ProviderEntry {
  name: TranscriptProviderType;
  isAvailable: () => Promise<boolean>;
  fetchTranscript: (videoId: string) => Promise<TranscriptResult>;
}

const PROVIDERS: ProviderEntry[] = [
  { name: 'transcript_api', isAvailable: transcriptApi.isAvailable, fetchTranscript: transcriptApi.fetchTranscript },
  { name: 'youtube_captions', isAvailable: youtubeCaptions.isAvailable, fetchTranscript: youtubeCaptions.fetchTranscript },
  { name: 'yt_dlp', isAvailable: ytDlp.isAvailable, fetchTranscript: ytDlp.fetchTranscript },
  { name: 'whisper', isAvailable: whisper.isAvailable, fetchTranscript: whisper.fetchTranscript },
];

export interface ResolverResult {
  success: boolean;
  transcript: TranscriptResult | null;
  attempts: ProviderAttempt[];
  failureReason: string | null;
}

export async function resolveTranscript(videoId: string): Promise<ResolverResult> {
  const attempts: ProviderAttempt[] = [];

  for (const provider of PROVIDERS) {
    const available = await provider.isAvailable().catch(() => false);
    if (!available) {
      console.log(`[TranscriptResolver] Skipping ${provider.name} — not available`);
      continue;
    }

    const start = Date.now();
    try {
      console.log(`[TranscriptResolver] Trying ${provider.name} for ${videoId}...`);
      const result = await provider.fetchTranscript(videoId);

      attempts.push({
        provider: provider.name,
        success: true,
        durationMs: Date.now() - start,
      });

      console.log(
        `[TranscriptResolver] SUCCESS via ${provider.name} for ${videoId} ` +
        `(${result.text.length} chars, ${result.segments.length} segments)`
      );

      return { success: true, transcript: result, attempts, failureReason: null };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      const retryable = err instanceof YouTubeError ? err.retryable : true;

      attempts.push({
        provider: provider.name,
        success: false,
        error: errorMsg,
        durationMs: Date.now() - start,
      });

      console.warn(
        `[TranscriptResolver] ${provider.name} failed for ${videoId}: ${errorMsg}` +
        ` (retryable=${retryable})`
      );
    }
  }

  const lastError = attempts[attempts.length - 1]?.error ?? 'All providers exhausted';
  console.error(`[TranscriptResolver] ALL PROVIDERS FAILED for ${videoId}`);

  return {
    success: false,
    transcript: null,
    attempts,
    failureReason: `All ${attempts.length} provider(s) failed. Last: ${lastError}`,
  };
}
