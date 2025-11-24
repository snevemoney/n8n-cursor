/**
 * SLI/SLO Definitions and Tracking
 * Service Level Indicators and Objectives
 */

import { getMetricsCollector } from './metrics';
import { getGoldenSignalsTracker } from './golden-signals';
import type { SLI, SLO } from './types';

export class SLISLOTracker {
  private slis: Map<string, SLI> = new Map();
  private slos: Map<string, SLO> = new Map();
  private metrics = getMetricsCollector();
  private goldenSignals = getGoldenSignalsTracker();

  /**
   * Define an SLI
   */
  defineSLI(sli: SLI): void {
    this.slis.set(sli.id, sli);
  }

  /**
   * Define an SLO
   */
  defineSLO(slo: SLO): void {
    this.slos.set(slo.id, slo);
  }

  /**
   * Evaluate an SLI
   */
  async evaluateSLI(sliId: string): Promise<number> {
    const sli = this.slis.get(sliId);
    if (!sli) {
      throw new Error(`SLI ${sliId} not found`);
    }

    // Get metrics matching the SLI
    const metrics = this.metrics.getMetrics();
    const matchingMetrics = metrics.filter(m => {
      if (m.name !== sli.metric) return false;
      
      // Check labels match
      if (sli.labels) {
        for (const [key, value] of Object.entries(sli.labels)) {
          if (m.labels?.[key] !== value) return false;
        }
      }
      
      return true;
    });

    if (matchingMetrics.length === 0) {
      return 0; // No data
    }

    // Calculate SLI value based on threshold
    // For now, simple implementation - can be enhanced
    const values = matchingMetrics.map(m => m.value);
    const thresholdValue = this.percentile(values, sli.threshold);
    
    return thresholdValue;
  }

  /**
   * Evaluate an SLO
   */
  async evaluateSLO(sloId: string): Promise<SLO> {
    const slo = this.slos.get(sloId);
    if (!slo) {
      throw new Error(`SLO ${sloId} not found`);
    }

    const sliValue = await this.evaluateSLI(slo.sliId);
    const compliance = sliValue >= slo.target ? 1 : 0;
    const errorBudget = (1 - compliance) * 100;

    // Determine status
    let status: 'healthy' | 'warning' | 'breach' = 'healthy';
    if (errorBudget > 10) {
      status = 'breach';
    } else if (errorBudget > 5) {
      status = 'warning';
    }

    return {
      ...slo,
      errorBudget,
      status,
    };
  }

  /**
   * Get default SLIs for Scorpion
   */
  getDefaultSLIs(): SLI[] {
    return [
      {
        id: 'http-availability',
        name: 'HTTP Availability',
        description: 'Percentage of successful HTTP requests',
        metric: 'http_requests_total',
        threshold: 0.95, // 95th percentile
        window: '5m',
      },
      {
        id: 'http-latency-p95',
        name: 'HTTP Latency P95',
        description: '95th percentile request latency',
        metric: 'http_request_duration_seconds_p95',
        threshold: 0.95,
        window: '5m',
      },
      {
        id: 'error-rate',
        name: 'Error Rate',
        description: 'Percentage of requests that result in errors',
        metric: 'http_errors_total',
        threshold: 0.05, // 5% error rate threshold
        window: '5m',
      },
    ];
  }

  /**
   * Get default SLOs for Scorpion
   */
  getDefaultSLOs(): SLO[] {
    return [
      {
        id: 'scorpion-api-availability',
        name: 'Scorpion API Availability',
        description: '99.9% of requests should succeed',
        sliId: 'http-availability',
        target: 0.999,
        window: '30d',
        errorBudget: 100,
        status: 'healthy',
      },
      {
        id: 'scorpion-api-latency',
        name: 'Scorpion API Latency',
        description: '95% of requests should complete in under 2 seconds',
        sliId: 'http-latency-p95',
        target: 2.0, // seconds
        window: '30d',
        errorBudget: 100,
        status: 'healthy',
      },
      {
        id: 'scorpion-error-rate',
        name: 'Scorpion Error Rate',
        description: 'Error rate should be below 1%',
        sliId: 'error-rate',
        target: 0.01, // 1%
        window: '30d',
        errorBudget: 100,
        status: 'healthy',
      },
    ];
  }

  /**
   * Initialize default SLIs and SLOs
   */
  initializeDefaults(): void {
    for (const sli of this.getDefaultSLIs()) {
      this.defineSLI(sli);
    }
    
    for (const slo of this.getDefaultSLOs()) {
      this.defineSLO(slo);
    }
  }

  /**
   * Get all SLIs
   */
  getSLIs(): SLI[] {
    return Array.from(this.slis.values());
  }

  /**
   * Get all SLOs
   */
  async getSLOs(): Promise<SLO[]> {
    const slos: SLO[] = [];
    
    for (const slo of this.slos.values()) {
      const evaluated = await this.evaluateSLO(slo.id);
      slos.push(evaluated);
    }
    
    return slos;
  }

  /**
   * Calculate percentile
   */
  private percentile(values: number[], p: number): number {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
  }
}

// Singleton instance
let sliSloTrackerInstance: SLISLOTracker | null = null;

export function getSLISLOTracker(): SLISLOTracker {
  if (!sliSloTrackerInstance) {
    sliSloTrackerInstance = new SLISLOTracker();
    sliSloTrackerInstance.initializeDefaults();
  }
  
  return sliSloTrackerInstance;
}

