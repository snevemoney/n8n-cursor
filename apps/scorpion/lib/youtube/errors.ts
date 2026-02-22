/**
 * YouTube Transcript System - Structured Error Classes
 *
 * Each error class carries enough context for operator inspection.
 * Tom would care that failures are visible; Patrick would care they're actionable.
 */

export class YouTubeError extends Error {
  public readonly code: string;
  public readonly retryable: boolean;
  public readonly context: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    retryable: boolean,
    context: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = 'YouTubeError';
    this.code = code;
    this.retryable = retryable;
    this.context = context;
  }
}

export class ProviderBlockedError extends YouTubeError {
  constructor(provider: string, videoId: string, detail?: string) {
    super(
      `Provider "${provider}" blocked for video ${videoId}${detail ? `: ${detail}` : ''}`,
      'PROVIDER_BLOCKED',
      true,
      { provider, videoId }
    );
    this.name = 'ProviderBlockedError';
  }
}

export class TranscriptUnavailableError extends YouTubeError {
  constructor(videoId: string, reason: string) {
    super(
      `Transcript unavailable for video ${videoId}: ${reason}`,
      'TRANSCRIPT_UNAVAILABLE',
      false,
      { videoId, reason }
    );
    this.name = 'TranscriptUnavailableError';
  }
}

export class ParsingFailedError extends YouTubeError {
  constructor(provider: string, videoId: string, detail?: string) {
    super(
      `Failed to parse transcript from "${provider}" for video ${videoId}${detail ? `: ${detail}` : ''}`,
      'PARSING_FAILED',
      true,
      { provider, videoId }
    );
    this.name = 'ParsingFailedError';
  }
}

export class RateLimitError extends YouTubeError {
  public readonly retryAfterMs: number;

  constructor(provider: string, retryAfterMs: number = 60_000) {
    super(
      `Rate limited by "${provider}". Retry after ${Math.ceil(retryAfterMs / 1000)}s.`,
      'RATE_LIMITED',
      true,
      { provider, retryAfterMs }
    );
    this.name = 'RateLimitError';
    this.retryAfterMs = retryAfterMs;
  }
}

export class InvalidURLError extends YouTubeError {
  constructor(url: string, detail?: string) {
    super(
      `Invalid YouTube URL: "${url}"${detail ? ` — ${detail}` : ''}`,
      'INVALID_URL',
      false,
      { url }
    );
    this.name = 'InvalidURLError';
  }
}

export class ChannelResolutionError extends YouTubeError {
  constructor(identifier: string, detail?: string) {
    super(
      `Could not resolve YouTube channel: "${identifier}"${detail ? ` — ${detail}` : ''}`,
      'CHANNEL_RESOLUTION_FAILED',
      true,
      { identifier }
    );
    this.name = 'ChannelResolutionError';
  }
}

export class ProviderNotAvailableError extends YouTubeError {
  constructor(provider: string, reason: string) {
    super(
      `Provider "${provider}" not available: ${reason}`,
      'PROVIDER_NOT_AVAILABLE',
      false,
      { provider, reason }
    );
    this.name = 'ProviderNotAvailableError';
  }
}

export function formatErrorForStorage(err: unknown): string {
  if (err instanceof YouTubeError) {
    return JSON.stringify({
      name: err.name,
      code: err.code,
      message: err.message,
      retryable: err.retryable,
      context: err.context,
    });
  }
  if (err instanceof Error) {
    return JSON.stringify({
      name: err.name,
      message: err.message,
    });
  }
  return String(err);
}
