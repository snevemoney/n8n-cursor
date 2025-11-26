import { Command, CommandResult, generateIdempotencyKey } from '@lf/shared-types';

export interface LFAConfig {
  baseUrl: string;
  serviceToken: string;
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
}

export interface LFARequestOptions {
  correlationId?: string;
  workflowId?: string;
  executionId?: string;
  timeout?: number;
}

export class LFAClient {
  private config: Required<LFAConfig>;
  private idempotencyCache = new Map<string, CommandResult>();

  constructor(config: LFAConfig) {
    this.config = {
      timeout: 30000,
      maxRetries: 3,
      retryDelay: 1000,
      ...config
    };
  }

  /**
   * Execute a command on LFA with idempotency and retries
   */
  async executeCommand<T = any>(
    action: Command['action'],
    payload: any,
    options: LFARequestOptions = {}
  ): Promise<CommandResult> {
    const idempotencyKey = generateIdempotencyKey(
      options.workflowId || 'unknown',
      options.executionId || 'unknown',
      action
    );

    // Check idempotency cache
    const cached = this.idempotencyCache.get(idempotencyKey);
    if (cached) {
      console.log(`[LFA SDK] Returning cached result for ${idempotencyKey}`);
      return cached;
    }

    const command: Command = {
      idempotencyKey,
      action,
      payload,
      source: 'n8n',
      workflow_id: options.workflowId,
      execution_id: options.executionId,
      correlation_id: options.correlationId,
      timestamp: new Date().toISOString(),
      version: '1'
    };

    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const result = await this.makeRequest<CommandResult>(
          '/api/internal/commands',
          {
            method: 'POST',
            body: JSON.stringify(command),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.config.serviceToken}`,
              'X-Correlation-ID': options.correlationId || '',
              'X-Workflow-ID': options.workflowId || '',
              'X-Execution-ID': options.executionId || ''
            }
          },
          options.timeout || this.config.timeout
        );

        // Cache successful result
        this.idempotencyCache.set(idempotencyKey, result);
        
        // Clean up old cache entries (keep last 1000)
        if (this.idempotencyCache.size > 1000) {
          const keys = Array.from(this.idempotencyCache.keys());
          keys.slice(0, 100).forEach(key => this.idempotencyCache.delete(key));
        }

        return result;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.config.maxRetries) {
          const delay = this.config.retryDelay * Math.pow(2, attempt);
          console.log(`[LFA SDK] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    throw new Error(`Command execution failed after ${this.config.maxRetries + 1} attempts: ${lastError?.message}`);
  }

  /**
   * Convenience methods for common commands
   */
  async applyCredit(userId: string, amountSats: number, reason: string, options?: LFARequestOptions) {
    return this.executeCommand('credit.apply', {
      user_id: userId,
      amount_sats: amountSats,
      reason
    }, options);
  }

  async createInvoice(userId: string, amountSats: number, description: string, options?: LFARequestOptions) {
    return this.executeCommand('invoice.create', {
      user_id: userId,
      amount_sats: amountSats,
      description
    }, options);
  }

  async sendNotification(
    userId: string,
    channel: 'email' | 'push' | 'sms' | 'slack' | 'discord',
    template: string,
    data: Record<string, any>,
    options?: LFARequestOptions
  ) {
    return this.executeCommand('notify.send', {
      user_id: userId,
      channel,
      template,
      data
    }, options);
  }

  async enqueueContent(
    userId: string,
    type: 'article' | 'video' | 'social' | 'email',
    title: string,
    prompt: string,
    options?: LFARequestOptions
  ) {
    return this.executeCommand('content.enqueue', {
      user_id: userId,
      type,
      title,
      prompt
    }, options);
  }

  async rebalancePortfolio(
    userId: string,
    rules: Array<{ asset: string; target_percentage: number; threshold: number }>,
    options?: LFARequestOptions
  ) {
    return this.executeCommand('portfolio.rebalance', {
      user_id: userId,
      rules
    }, options);
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.serviceToken}`
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Clear idempotency cache
   */
  clearCache(): void {
    this.idempotencyCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.idempotencyCache.size,
      keys: Array.from(this.idempotencyCache.keys())
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit,
    timeout: number
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Request timeout after ${timeout}ms`);
        }
        throw error;
      }
      
      throw new Error('Unknown error occurred');
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Factory function to create LFA client
 */
export const createLFAClient = (config: LFAConfig): LFAClient => {
  return new LFAClient(config);
};

/**
 * Default client instance (for convenience)
 */
export let defaultClient: LFAClient | null = null;

export const setDefaultClient = (config: LFAConfig): void => {
  defaultClient = createLFAClient(config);
};

export const getDefaultClient = (): LFAClient => {
  if (!defaultClient) {
    throw new Error('Default LFA client not configured. Call setDefaultClient() first.');
  }
  return defaultClient;
};
