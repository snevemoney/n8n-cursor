/**
 * Shared Anomaly Detector Instance
 * Singleton instance shared across all API routes and workers
 */

import { AnomalyDetector } from './anomaly-detector';
import { DEFAULT_UPGRADED_CONFIG } from './model-config';

let sharedDetector: AnomalyDetector | null = null;

/**
 * Get or create the shared anomaly detector instance
 * Ensures only one detector exists across the application
 * Uses DEFAULT_UPGRADED_CONFIG by default (11 features, [64, 32, 16] architecture)
 */
export function getSharedAnomalyDetector(): AnomalyDetector {
  if (!sharedDetector) {
    console.log('[ML] Initializing shared anomaly detector with upgraded config...');
    sharedDetector = new AnomalyDetector({
      modelConfig: DEFAULT_UPGRADED_CONFIG,
    });
  }
  return sharedDetector;
}

/**
 * Destroy the shared detector (for testing/cleanup)
 */
export function destroySharedDetector(): void {
  if (sharedDetector) {
    sharedDetector.reset();
    sharedDetector = null;
    console.log('[ML] Shared anomaly detector destroyed');
  }
}
