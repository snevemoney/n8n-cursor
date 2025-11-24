/**
 * POST /api/ml/train
 * Train the neural network on historical telemetry data
 * Supports ModelConfig overrides for custom architectures
 */

import { NextResponse } from 'next/server';
import { getSharedAnomalyDetector } from '@/lib/ml/shared-detector';
import { getTelemetryStore } from '@/lib/telemetry/store';
import {
  type ModelConfig,
  DEFAULT_UPGRADED_CONFIG,
  DEFAULT_LEGACY_CONFIG,
  createCustomConfig,
  validateModelConfig,
  getModelConfigSummary,
  calculateParameterCount,
  getArchitectureSummary,
} from '@/lib/ml/model-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface TrainRequest {
  // Training options
  epochs?: number;
  batchSize?: number;
  validationSplit?: number;

  // Model config options (NEW)
  mode?: 'legacy' | 'upgraded'; // Quick mode selector
  configOverrides?: Partial<ModelConfig>; // Custom overrides
}

export async function POST(request: Request) {
  try {
    const body: TrainRequest = await request.json();
    const {
      epochs,
      batchSize,
      validationSplit = 0.2,
      mode = 'upgraded',
      configOverrides,
    } = body;

    const detector = getSharedAnomalyDetector();
    const store = getTelemetryStore();

    // Determine which base config to use
    const baseConfig = mode === 'legacy' ? DEFAULT_LEGACY_CONFIG : DEFAULT_UPGRADED_CONFIG;

    // Apply any custom overrides
    let modelConfig: ModelConfig;
    if (configOverrides) {
      try {
        modelConfig = createCustomConfig(baseConfig, configOverrides);
      } catch (error) {
        return NextResponse.json(
          {
            ok: false,
            error: `Invalid model configuration: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
          { status: 400 }
        );
      }
    } else {
      modelConfig = baseConfig;
    }

    // Validate configuration
    try {
      validateModelConfig(modelConfig);
    } catch (error) {
      return NextResponse.json(
        {
          ok: false,
          error: `Model configuration validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        },
        { status: 400 }
      );
    }

    // Get historical telemetry data
    const events = store.getRecentEvents(10000); // Last 10k events

    if (events.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: 'No telemetry data available for training',
        },
        { status: 400 }
      );
    }

    console.log(`[API] Training neural network on ${events.length} events...`);
    console.log('[API] Model Configuration:');
    console.log(getModelConfigSummary(modelConfig));

    // Train the network with model config
    const history = await detector.train(events, {
      epochs: epochs ?? modelConfig.epochs,
      batchSize: batchSize ?? modelConfig.batchSize,
      validationSplit,
      verbose: true,
    });

    // Evaluate performance
    const evaluation = detector.evaluate(events);

    console.log(`[API] Training complete. Accuracy: ${(evaluation.accuracy * 100).toFixed(2)}%`);

    return NextResponse.json({
      ok: true,
      message: 'Training complete',
      history,
      evaluation,
      // NEW: Include model config info in response
      modelInfo: {
        configSummary: getModelConfigSummary(modelConfig),
        architecture: getArchitectureSummary(modelConfig),
        parameterCount: calculateParameterCount(modelConfig),
        mode,
      },
    });
  } catch (error) {
    console.error('[API] /ml/train error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
