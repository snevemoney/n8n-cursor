/**
 * GET /api/ml/health
 * Quick health check for ML system - verifies model is loaded and functional
 */

import { NextResponse } from 'next/server';
import { getSharedAnomalyDetector } from '@/lib/ml/shared-detector';
import { getTelemetryStore } from '@/lib/telemetry/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const detector = getSharedAnomalyDetector();
    const store = getTelemetryStore();

    // Check 1: Model loaded
    const status = detector.getStatus();
    const modelLoaded = true; // If we got here, detector is initialized

    // Check 2: Model trained
    const isTrained = status.isTrained;

    // Check 3: Normalization statistics present
    const saved = detector.save();
    const normalizationLoaded = saved.normalizationStats !== null;

    // Check 4: Can make predictions (if trained)
    let predictWorking = false;
    let predictError: string | null = null;

    if (isTrained && normalizationLoaded) {
      try {
        // Try a synthetic prediction with recent data
        const events = store.getRecentEvents(100);
        if (events.length > 0) {
          const prediction = detector.predict(events, 60000);

          // Validate prediction shape
          const validShape =
            typeof prediction.score === 'number' &&
            prediction.score >= 0 &&
            prediction.score <= 1 &&
            typeof prediction.confidence === 'number' &&
            prediction.confidence >= 0 &&
            prediction.confidence <= 1;

          predictWorking = validShape;
          if (!validShape) {
            predictError = 'Invalid prediction output shape';
          }
        } else {
          // No data available, but predict function exists
          predictWorking = true;
          predictError = 'No telemetry data for test prediction';
        }
      } catch (error) {
        predictWorking = false;
        predictError = error instanceof Error ? error.message : 'Unknown prediction error';
      }
    } else {
      // Not trained, so predict not expected to work
      predictError = 'Model not trained yet';
    }

    // Determine overall health status
    let healthStatus: 'healthy' | 'degraded' | 'unhealthy';

    if (modelLoaded && isTrained && normalizationLoaded && predictWorking) {
      healthStatus = 'healthy';
    } else if (modelLoaded && !isTrained) {
      healthStatus = 'degraded'; // Needs training
    } else {
      healthStatus = 'unhealthy';
    }

    return NextResponse.json({
      ok: true,
      status: healthStatus,
      checks: {
        modelLoaded,
        modelTrained: isTrained,
        normalizationLoaded,
        predictWorking,
      },
      details: {
        trainingSamples: status.trainingSamples || 0,
        lastTrainingTime: status.lastTrainingTime || 0,
        predictError: predictError || undefined,
      },
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error('[API] /ml/health error:', error);
    return NextResponse.json(
      {
        ok: false,
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        checks: {
          modelLoaded: false,
          modelTrained: false,
          normalizationLoaded: false,
          predictWorking: false,
        },
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}
