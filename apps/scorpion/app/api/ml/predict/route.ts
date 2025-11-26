/**
 * GET /api/ml/predict
 * Get real-time anomaly prediction based on recent telemetry
 * Supports MC Dropout uncertainty estimation via query parameter
 */

import { NextResponse } from 'next/server';
import { getSharedAnomalyDetector } from '@/lib/ml/shared-detector';
import { getTelemetryStore } from '@/lib/telemetry/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const withUncertainty = searchParams.get('withUncertainty') === 'true';

    const detector = getSharedAnomalyDetector();
    const store = getTelemetryStore();

    // Check if network is trained
    const status = detector.getStatus();
    if (!status.isTrained) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Network not trained yet',
        },
        { status: 400 }
      );
    }

    // Get recent telemetry events (last 5 minutes)
    const events = store.getRecentEvents(1000);

    if (events.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: 'No recent telemetry data available',
        },
        { status: 400 }
      );
    }

    // Get model config to check if MC Dropout is enabled
    const saved = detector.save();
    const modelConfig = saved.modelConfig;
    const mcDropoutEnabled = modelConfig.mcDropoutEnabled && modelConfig.mcDropoutSamples > 1;

    // Make prediction with latency tracking
    // PERFORMANCE NOTE: If mcDropoutEnabled, this runs N forward passes (default: 10)
    // Cost: ~10× CPU time vs single pass. Consider fast path for high-frequency predictions.
    const startTime = Date.now();
    const prediction = detector.predict(events, 60000); // 1 minute window
    const elapsedMs = Date.now() - startTime;

    // Log prediction performance metrics
    console.log('[ML Predict]', {
      mcDropoutEnabled,
      mcDropoutSamples: mcDropoutEnabled ? modelConfig.mcDropoutSamples : 1,
      elapsedMs,
      timestamp: Date.now(),
    });

    // Build response with optional MC Dropout info
    const response: any = {
      ok: true,
      prediction: {
        isAnomaly: prediction.isAnomaly,
        score: prediction.score,
        confidence: prediction.confidence,
        timestamp: prediction.timestamp,
        features: prediction.features,
      },
    };

    // Include MC Dropout metadata if requested or if it's being used
    if (withUncertainty || mcDropoutEnabled) {
      response.mcDropout = {
        enabled: mcDropoutEnabled,
        samples: mcDropoutEnabled ? modelConfig.mcDropoutSamples : 1,
        // Note: confidence already reflects MC Dropout uncertainty if enabled
        uncertaintyNote: mcDropoutEnabled
          ? `Confidence estimated using ${modelConfig.mcDropoutSamples} forward passes with dropout`
          : 'MC Dropout not enabled - using single forward pass',
      };
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('[API] /ml/predict error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
