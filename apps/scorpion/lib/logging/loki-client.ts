/**
 * Loki Client - Ship logs to centralized Loki instance
 * Provides structured logging with retention policies
 */

interface LokiLogEntry {
  stream: Record<string, string>;
  values: Array<[string, string]>; // [timestamp, log line]
}

interface LokiClientConfig {
  url: string;
  labels?: Record<string, string>;
  batchSize?: number;
  flushInterval?: number;
  enabled?: boolean;
}

class LokiClient {
  private config: Required<LokiClientConfig>;
  private buffer: LokiLogEntry[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(config: LokiClientConfig) {
    // Disable by default in development unless explicitly enabled
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const explicitlyEnabled = process.env.LOKI_ENABLED === 'true';
    
    this.config = {
      url: config.url || process.env.LOKI_URL || 'http://localhost:3100',
      labels: {
        service: 'scorpion',
        environment: process.env.NODE_ENV || 'development',
        ...config.labels,
      },
      batchSize: config.batchSize || 100,
      flushInterval: config.flushInterval || 5000, // 5 seconds
      enabled: config.enabled ?? (explicitlyEnabled || (!isDevelopment && process.env.LOKI_ENABLED !== 'false')),
    };

    if (this.config.enabled) {
      this.startFlushTimer();
    }
  }

  /**
   * Log a message to Loki
   */
  async log(level: string, message: string, metadata?: Record<string, any>) {
    if (!this.config.enabled) return;

    const timestamp = Date.now() * 1000000; // nanoseconds
    const logLine = JSON.stringify({
      level,
      message,
      timestamp: new Date().toISOString(),
      ...metadata,
    });

    const entry: LokiLogEntry = {
      stream: {
        ...this.config.labels,
        level,
      },
      values: [[timestamp.toString(), logLine]],
    };

    this.buffer.push(entry);

    // Flush if buffer is full
    if (this.buffer.length >= this.config.batchSize) {
      await this.flush();
    }
  }

  /**
   * Flush buffered logs to Loki
   */
  async flush() {
    if (this.buffer.length === 0 || !this.config.enabled) return;

    const payload = {
      streams: this.buffer,
    };

    try {
      // Use a short timeout to avoid blocking
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

      const response = await fetch(`${this.config.url}/loki/api/v1/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Only log errors in production or if explicitly debugging
        if (process.env.NODE_ENV === 'production' || process.env.DEBUG_LOKI === 'true') {
          console.error(`[LokiClient] Failed to push logs: ${response.statusText}`);
        }
        return;
      }

      this.buffer = [];
    } catch (error: any) {
      // Suppress connection errors in development (Loki likely not running)
      const isConnectionError = error?.code === 'ECONNREFUSED' || error?.name === 'AbortError';
      if (isConnectionError && process.env.NODE_ENV !== 'production' && process.env.DEBUG_LOKI !== 'true') {
        // Silently ignore connection errors in development
        return;
      }
      
      // Only log other errors or in production
      if (!isConnectionError || process.env.NODE_ENV === 'production') {
        console.error('[LokiClient] Error pushing logs to Loki:', error);
      }
      // Don't throw - logging failures shouldn't crash the app
    }
  }

  /**
   * Start automatic flush timer
   */
  private startFlushTimer() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      // Fire and forget - don't await to avoid blocking
      this.flush().catch(() => {
        // Errors already handled in flush(), just prevent unhandled rejection
      });
    }, this.config.flushInterval);
  }

  /**
   * Stop flush timer and flush remaining logs
   */
  async shutdown() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    await this.flush();
  }
}

// Singleton instance
let lokiClient: LokiClient | null = null;

export function getLokiClient(config?: LokiClientConfig): LokiClient {
  if (!lokiClient) {
    lokiClient = new LokiClient(config || {});
  }
  return lokiClient;
}

export async function shutdownLokiClient() {
  if (lokiClient) {
    await lokiClient.shutdown();
    lokiClient = null;
  }
}

