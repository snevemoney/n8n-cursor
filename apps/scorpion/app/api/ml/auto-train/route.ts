/**
 * POST /api/ml/auto-train
 * Enable/disable automatic continuous training on telemetry stream
 */

import { NextResponse } from 'next/server';
import { getSharedAnomalyDetector } from '@/lib/ml/shared-detector';
import { getTelemetryStore } from '@/lib/telemetry/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

let autoTrainInterval: NodeJS.Timeout | null = null;
let isAutoTraining = false;

interface AutoTrainRequest {
  enabled: boolean;
  intervalMinutes?: number;
}

export async function POST(request: Request) {
  try {
    const body: AutoTrainRequest = await request.json();
    const { enabled, intervalMinutes = 5 } = body;

    if (enabled && !isAutoTraining) {
      // Start auto-training
      isAutoTraining = true;

      const trainLoop = async () => {
        try {
          console.log('[Auto-Train] Running automatic training cycle...');

          const detector = getSharedAnomalyDetector();
          const store = getTelemetryStore();

          // Get recent telemetry data
          const events = store.getRecentEvents(5000);

          if (events.length < 100) {
            console.log('[Auto-Train] Not enough telemetry data, skipping cycle');
            return;
          }

          // Train on recent data (small epoch count for continuous learning)
          await detector.train(events, {
            epochs: 10,
            batchSize: 32,
            validationSplit: 0.1,
            verbose: false,
          });

          console.log('[Auto-Train] Training cycle complete');
        } catch (error) {
          console.error('[Auto-Train] Error during training cycle:', error);
        }
      };

      // Run initial training
      trainLoop();

      // Set up interval
      autoTrainInterval = setInterval(trainLoop, intervalMinutes * 60 * 1000);

      console.log(`[Auto-Train] Enabled with ${intervalMinutes} minute interval`);

      return NextResponse.json({
        ok: true,
        message: `Auto-training enabled (${intervalMinutes} minute interval)`,
        enabled: true,
        intervalMinutes,
      });
    } else if (!enabled && isAutoTraining) {
      // Stop auto-training
      if (autoTrainInterval) {
        clearInterval(autoTrainInterval);
        autoTrainInterval = null;
      }

      isAutoTraining = false;

      console.log('[Auto-Train] Disabled');

      return NextResponse.json({
        ok: true,
        message: 'Auto-training disabled',
        enabled: false,
      });
    } else {
      return NextResponse.json({
        ok: true,
        message: `Auto-training already ${enabled ? 'enabled' : 'disabled'}`,
        enabled: isAutoTraining,
      });
    }
  } catch (error) {
    console.error('[API] /ml/auto-train error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET to check auto-train status
export async function GET() {
  return NextResponse.json({
    ok: true,
    enabled: isAutoTraining,
    message: isAutoTraining ? 'Auto-training is running' : 'Auto-training is stopped',
  });
}
