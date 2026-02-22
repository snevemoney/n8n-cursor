/**
 * Fallback Provider 2: yt-dlp subtitle extraction
 *
 * Requires `yt-dlp` binary in PATH. Feature-flagged — if missing, the
 * resolver simply skips to the next provider.
 */

import { execFile } from 'child_process';
import { promisify } from 'util';
import { readFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { ProviderNotAvailableError, ParsingFailedError, ProviderBlockedError } from '../errors';
import type { TranscriptResult, TranscriptSegment } from '../types';
import { TranscriptProvider } from '../types';

const execFileAsync = promisify(execFile);
const PROVIDER = TranscriptProvider.YT_DLP;
const ENABLED = process.env.YOUTUBE_YTDLP_ENABLED !== 'false';

let _binaryAvailable: boolean | null = null;

export async function isAvailable(): Promise<boolean> {
  if (!ENABLED) return false;
  if (_binaryAvailable !== null) return _binaryAvailable;

  try {
    await execFileAsync('yt-dlp', ['--version']);
    _binaryAvailable = true;
  } catch {
    _binaryAvailable = false;
  }
  return _binaryAvailable;
}

export async function fetchTranscript(videoId: string): Promise<TranscriptResult> {
  const available = await isAvailable();
  if (!available) {
    throw new ProviderNotAvailableError(PROVIDER, 'yt-dlp binary not found in PATH');
  }

  const tmpFile = join(tmpdir(), `yt-sub-${videoId}-${Date.now()}`);
  const url = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    await execFileAsync('yt-dlp', [
      '--skip-download',
      '--write-auto-sub',
      '--sub-lang', 'en',
      '--sub-format', 'json3',
      '--output', tmpFile,
      url,
    ], { timeout: 60_000 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('HTTP Error 429') || msg.includes('Too Many Requests')) {
      throw new ProviderBlockedError(PROVIDER, videoId, 'Rate limited');
    }
    throw new ProviderBlockedError(PROVIDER, videoId, msg);
  }

  const subFile = `${tmpFile}.en.json3`;
  let raw: string;
  try {
    raw = await readFile(subFile, 'utf-8');
  } catch {
    throw new ParsingFailedError(PROVIDER, videoId, 'Subtitle file not written by yt-dlp');
  } finally {
    cleanup(tmpFile, subFile);
  }

  return parseJson3(videoId, raw);
}

function parseJson3(videoId: string, raw: string): TranscriptResult {
  let data: Record<string, unknown>;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new ParsingFailedError(PROVIDER, videoId, 'Invalid JSON3 subtitle file');
  }

  const events = (data['events'] ?? []) as Array<Record<string, unknown>>;
  const segments: TranscriptSegment[] = [];

  for (const ev of events) {
    const segs = ev['segs'] as Array<Record<string, unknown>> | undefined;
    if (!segs) continue;
    const text = segs.map((s) => String(s['utf8'] ?? '')).join('').trim();
    if (!text) continue;
    segments.push({
      text,
      start: Number(ev['tStartMs'] ?? 0) / 1000,
      duration: Number(ev['dDurationMs'] ?? 0) / 1000,
    });
  }

  if (segments.length === 0) {
    throw new ParsingFailedError(PROVIDER, videoId, 'No segments in JSON3');
  }

  const fullText = segments.map((s) => s.text).join(' ').trim();
  const lastSeg = segments[segments.length - 1];

  return {
    text: fullText,
    segments,
    language: 'en',
    provider: PROVIDER,
    confidence: null,
    durationSeconds: lastSeg ? Math.ceil(lastSeg.start + lastSeg.duration) : null,
  };
}

async function cleanup(...files: string[]): Promise<void> {
  for (const f of files) {
    try { await unlink(f); } catch { /* best effort */ }
  }
}
