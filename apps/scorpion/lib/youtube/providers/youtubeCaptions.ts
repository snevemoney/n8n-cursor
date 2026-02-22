/**
 * Fallback Provider 1: YouTube Captions (innertube / timedtext)
 *
 * Scrapes the video page for caption track URLs and fetches the timed text XML.
 * No API key required but subject to bot-detection.
 */

import { ProviderBlockedError, ParsingFailedError, TranscriptUnavailableError } from '../errors';
import type { TranscriptResult, TranscriptSegment } from '../types';
import { TranscriptProvider } from '../types';

const PROVIDER = TranscriptProvider.YOUTUBE_CAPTIONS;
const ENABLED = process.env['YOUTUBE_CAPTIONS_ENABLED'] !== 'false';

export async function isAvailable(): Promise<boolean> {
  return ENABLED;
}

export async function fetchTranscript(videoId: string): Promise<TranscriptResult> {
  const pageUrl = `https://www.youtube.com/watch?v=${videoId}`;

  let html: string;
  try {
    const res = await fetch(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      throw new ProviderBlockedError(PROVIDER, videoId, `Page fetch HTTP ${res.status}`);
    }
    html = await res.text();
  } catch (err) {
    if (err instanceof ProviderBlockedError) throw err;
    const msg = err instanceof Error ? err.message : String(err);
    throw new ProviderBlockedError(PROVIDER, videoId, `Page fetch failed: ${msg}`);
  }

  const captionUrl = extractCaptionUrl(html, videoId);
  if (!captionUrl) {
    throw new TranscriptUnavailableError(videoId, 'No caption tracks found on page');
  }

  let xml: string;
  try {
    const res = await fetch(captionUrl, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) {
      throw new ProviderBlockedError(PROVIDER, videoId, `Caption fetch HTTP ${res.status}`);
    }
    xml = await res.text();
  } catch (err) {
    if (err instanceof ProviderBlockedError) throw err;
    const msg = err instanceof Error ? err.message : String(err);
    throw new ProviderBlockedError(PROVIDER, videoId, `Caption fetch failed: ${msg}`);
  }

  return parseTimedTextXml(videoId, xml);
}

function extractCaptionUrl(html: string, _videoId: string): string | null {
  const captionTrackRe = /"captionTracks":\s*\[(.*?)\]/s;
  const match = html.match(captionTrackRe);
  if (!match?.[1]) return null;

  try {
    const tracks = JSON.parse(`[${match[1]}]`) as Array<Record<string, string>>;
    const english = tracks.find((t) => t['languageCode']?.startsWith('en'));
    const first = english ?? tracks[0];
    const baseUrl = first?.['baseUrl'];
    if (!baseUrl) return null;
    return baseUrl.replace(/\\u0026/g, '&');
  } catch {
    const urlMatch = match[1].match(/"baseUrl"\s*:\s*"([^"]+)"/);
    if (!urlMatch?.[1]) return null;
    return urlMatch[1].replace(/\\u0026/g, '&');
  }
}

function parseTimedTextXml(videoId: string, xml: string): TranscriptResult {
  const segmentRe = /<text\s+start="([^"]+)"\s+dur="([^"]+)"[^>]*>([\s\S]*?)<\/text>/g;
  const segments: TranscriptSegment[] = [];

  let m: RegExpExecArray | null;
  while ((m = segmentRe.exec(xml)) !== null) {
    segments.push({
      start: parseFloat(m[1] ?? '0'),
      duration: parseFloat(m[2] ?? '0'),
      text: decodeXmlEntities(m[3] ?? ''),
    });
  }

  if (segments.length === 0) {
    throw new ParsingFailedError(PROVIDER, videoId, 'No segments parsed from timed text XML');
  }

  const fullText = segments.map((s) => s.text).join(' ').trim();
  const lastSeg = segments[segments.length - 1];
  const durationSeconds = lastSeg ? Math.ceil(lastSeg.start + lastSeg.duration) : null;

  const langMatch = xml.match(/<transcript[^>]+lang="([^"]+)"/i)
    ?? xml.match(/<timedtext[^>]+lang="([^"]+)"/i);

  return {
    text: fullText,
    segments,
    language: langMatch?.[1] ?? 'en',
    provider: PROVIDER,
    confidence: null,
    durationSeconds,
  };
}

function decodeXmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/<[^>]+>/g, '');
}
