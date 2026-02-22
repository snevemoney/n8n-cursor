/**
 * Fallback Provider 3 (optional): Whisper transcription
 *
 * Downloads audio via yt-dlp, then sends to OpenAI Whisper API.
 * Feature-flagged: requires OPENAI_API_KEY and yt-dlp.
 * This is the last-resort fallback for when no captions exist at all.
 */

import { execFile } from 'child_process';
import { promisify } from 'util';
import { readFile, unlink, stat } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { ProviderNotAvailableError, ProviderBlockedError, ParsingFailedError } from '../errors';
import type { TranscriptResult, TranscriptSegment } from '../types';
import { TranscriptProvider } from '../types';

const execFileAsync = promisify(execFile);
const PROVIDER = TranscriptProvider.WHISPER;
const ENABLED = process.env['YOUTUBE_WHISPER_ENABLED'] === 'true';
const OPENAI_API_KEY = process.env['OPENAI_API_KEY'];
const MAX_AUDIO_SIZE_MB = 25;

export async function isAvailable(): Promise<boolean> {
  if (!ENABLED) return false;
  if (!OPENAI_API_KEY) return false;

  try {
    await execFileAsync('yt-dlp', ['--version']);
    return true;
  } catch {
    return false;
  }
}

export async function fetchTranscript(videoId: string): Promise<TranscriptResult> {
  const available = await isAvailable();
  if (!available) {
    throw new ProviderNotAvailableError(PROVIDER, 'Whisper requires YOUTUBE_WHISPER_ENABLED=true, OPENAI_API_KEY, and yt-dlp');
  }

  const audioFile = join(tmpdir(), `yt-audio-${videoId}-${Date.now()}.mp3`);
  const url = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    await execFileAsync('yt-dlp', [
      '-x',
      '--audio-format', 'mp3',
      '--audio-quality', '5',
      '-o', audioFile,
      url,
    ], { timeout: 120_000 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new ProviderBlockedError(PROVIDER, videoId, `Audio download failed: ${msg}`);
  }

  try {
    const stats = await stat(audioFile);
    const sizeMb = stats.size / (1024 * 1024);
    if (sizeMb > MAX_AUDIO_SIZE_MB) {
      throw new ProviderBlockedError(PROVIDER, videoId, `Audio file too large (${sizeMb.toFixed(1)}MB, max ${MAX_AUDIO_SIZE_MB}MB)`);
    }
  } catch (err) {
    if (err instanceof ProviderBlockedError) throw err;
    throw new ProviderBlockedError(PROVIDER, videoId, 'Audio file not found after download');
  }

  try {
    const audioBuffer = await readFile(audioFile);
    return await transcribeWithWhisper(videoId, audioBuffer);
  } finally {
    cleanup(audioFile);
  }
}

async function transcribeWithWhisper(videoId: string, audioBuffer: Buffer): Promise<TranscriptResult> {
  const formData = new FormData();
  const blob = new Blob([new Uint8Array(audioBuffer)], { type: 'audio/mpeg' });
  formData.append('file', blob, 'audio.mp3');
  formData.append('model', 'whisper-1');
  formData.append('response_format', 'verbose_json');
  formData.append('timestamp_granularities[]', 'segment');

  let response: Response;
  try {
    response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: formData,
      signal: AbortSignal.timeout(120_000),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new ProviderBlockedError(PROVIDER, videoId, `Whisper API call failed: ${msg}`);
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new ProviderBlockedError(PROVIDER, videoId, `Whisper API HTTP ${response.status}: ${errText}`);
  }

  let data: Record<string, unknown>;
  try {
    data = await response.json() as Record<string, unknown>;
  } catch {
    throw new ParsingFailedError(PROVIDER, videoId, 'Invalid JSON from Whisper API');
  }

  const text = String(data['text'] ?? '');
  const language = String(data['language'] ?? 'en');
  const duration = Number(data['duration'] ?? 0);

  const rawSegments = (data['segments'] ?? []) as Array<Record<string, unknown>>;
  const segments: TranscriptSegment[] = rawSegments.map((seg) => ({
    text: String(seg['text'] ?? ''),
    start: Number(seg['start'] ?? 0),
    duration: Number(seg['end'] ?? 0) - Number(seg['start'] ?? 0),
  }));

  if (!text) {
    throw new ParsingFailedError(PROVIDER, videoId, 'Whisper returned empty text');
  }

  return {
    text,
    segments,
    language,
    provider: PROVIDER,
    confidence: typeof data['confidence'] === 'number' ? data['confidence'] : null,
    durationSeconds: duration || null,
  };
}

async function cleanup(...files: string[]): Promise<void> {
  for (const f of files) {
    try { await unlink(f); } catch { /* best effort */ }
  }
}
