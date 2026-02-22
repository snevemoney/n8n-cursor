/**
 * YouTube URL Normalization & ID Extraction
 *
 * Handles every common YouTube URL variant:
 *   - youtube.com/watch?v=ID
 *   - youtu.be/ID
 *   - youtube.com/shorts/ID
 *   - youtube.com/embed/ID
 *   - youtube.com/channel/UCID
 *   - youtube.com/c/HANDLE
 *   - youtube.com/@HANDLE
 */

import { InvalidURLError } from './errors';
import type { ParsedYouTubeURL, SourceTypeValue } from './types';

const VIDEO_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

const CHANNEL_PATTERNS: { re: RegExp; group: number }[] = [
  { re: /youtube\.com\/channel\/(UC[a-zA-Z0-9_-]{22})/, group: 1 },
  { re: /youtube\.com\/c\/([^/?&#]+)/, group: 1 },
  { re: /youtube\.com\/@([^/?&#]+)/, group: 1 },
];

const VIDEO_PATTERNS: { re: RegExp; group: number }[] = [
  { re: /(?:youtube\.com\/watch\?.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/, group: 1 },
  { re: /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/, group: 1 },
  { re: /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/, group: 1 },
  { re: /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/, group: 1 },
];

export function parseYouTubeURL(raw: string): ParsedYouTubeURL {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new InvalidURLError(raw, 'empty string');
  }

  for (const { re, group } of CHANNEL_PATTERNS) {
    const match = trimmed.match(re);
    if (match?.[group]) {
      const id = match[group];
      return {
        type: 'channel' as SourceTypeValue,
        id,
        normalizedUrl: id.startsWith('UC')
          ? `https://www.youtube.com/channel/${id}`
          : `https://www.youtube.com/@${id}`,
        originalUrl: trimmed,
      };
    }
  }

  for (const { re, group } of VIDEO_PATTERNS) {
    const match = trimmed.match(re);
    if (match?.[group]) {
      const id = match[group];
      return {
        type: 'video' as SourceTypeValue,
        id,
        normalizedUrl: `https://www.youtube.com/watch?v=${id}`,
        originalUrl: trimmed,
      };
    }
  }

  if (VIDEO_ID_RE.test(trimmed)) {
    return {
      type: 'video' as SourceTypeValue,
      id: trimmed,
      normalizedUrl: `https://www.youtube.com/watch?v=${trimmed}`,
      originalUrl: trimmed,
    };
  }

  throw new InvalidURLError(raw, 'could not extract video or channel ID');
}

export function extractVideoId(url: string): string {
  const parsed = parseYouTubeURL(url);
  if (parsed.type !== 'video') {
    throw new InvalidURLError(url, 'URL is a channel, not a video');
  }
  return parsed.id;
}

export function extractChannelId(url: string): string {
  const parsed = parseYouTubeURL(url);
  if (parsed.type !== 'channel') {
    throw new InvalidURLError(url, 'URL is a video, not a channel');
  }
  return parsed.id;
}

export function isVideoUrl(url: string): boolean {
  try {
    return parseYouTubeURL(url).type === 'video';
  } catch {
    return false;
  }
}

export function isChannelUrl(url: string): boolean {
  try {
    return parseYouTubeURL(url).type === 'channel';
  } catch {
    return false;
  }
}
