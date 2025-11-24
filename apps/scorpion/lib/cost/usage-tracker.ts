/**
 * Usage Tracker
 * Tracks resource usage automatically from various sources
 */

import { getCostTracker } from './tracker';
import { getMetricsCollector } from '../monitoring/metrics';

export class UsageTracker {
  private costTracker = getCostTracker();
  private metrics = getMetricsCollector();

  /**
   * Track HTTP request usage
   */
  async trackHttpRequest(endpoint: string, durationMs: number, statusCode: number): Promise<void> {
    // Track as API call usage
    try {
      const resourceId = 'scorpion-nextjs-dev'; // Default resource
      
      // Estimate cost: $0.0001 per request (very low for local dev)
      const cost = 0.0001;
      
      await this.costTracker.recordUsage(resourceId, {
        apiCalls: 1,
        cost,
        periodStart: new Date(Date.now() - durationMs),
        periodEnd: new Date(),
        periodType: 'hourly',
      });
    } catch (error) {
      // Silently fail - usage tracking shouldn't break requests
      console.debug('[UsageTracker] Failed to track HTTP request:', error);
    }
  }

  /**
   * Track LLM API usage
   */
  async trackLLMUsage(
    provider: string,
    model: string,
    tokens: number,
    cost: number
  ): Promise<void> {
    try {
      const resourceId = `llm-api-${provider}-${model}`;
      
      await this.costTracker.recordUsage(resourceId, {
        llmTokens: tokens,
        cost,
        periodStart: new Date(),
        periodEnd: new Date(),
        periodType: 'hourly',
      });
      
      // Also track in metrics
      this.metrics.increment('llm_tokens_total', { provider, model }, tokens);
      this.metrics.increment('llm_cost_total', { provider, model }, cost);
    } catch (error) {
      console.debug('[UsageTracker] Failed to track LLM usage:', error);
    }
  }

  /**
   * Track database usage
   */
  async trackDatabaseUsage(queries: number, durationMs: number): Promise<void> {
    try {
      const resourceId = 'scorpion-postgres-dev';
      
      // Estimate cost: $0.00001 per query
      const cost = queries * 0.00001;
      
      await this.costTracker.recordUsage(resourceId, {
        apiCalls: queries, // Using apiCalls field for query count
        cost,
        periodStart: new Date(Date.now() - durationMs),
        periodEnd: new Date(),
        periodType: 'hourly',
      });
    } catch (error) {
      console.debug('[UsageTracker] Failed to track database usage:', error);
    }
  }

  /**
   * Track storage usage
   */
  async trackStorageUsage(storageGb: number): Promise<void> {
    try {
      const resourceId = 'scorpion-storage-dev';
      
      // Estimate cost: $0.10 per GB per month
      const monthlyCost = storageGb * 0.10;
      const hourlyCost = monthlyCost / (30 * 24);
      
      await this.costTracker.recordUsage(resourceId, {
        storageGb,
        cost: hourlyCost,
        periodStart: new Date(),
        periodEnd: new Date(),
        periodType: 'hourly',
      });
    } catch (error) {
      console.debug('[UsageTracker] Failed to track storage usage:', error);
    }
  }
}

// Singleton instance
let usageTrackerInstance: UsageTracker | null = null;

export function getUsageTracker(): UsageTracker {
  if (!usageTrackerInstance) {
    usageTrackerInstance = new UsageTracker();
  }
  return usageTrackerInstance;
}

