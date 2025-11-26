/**
 * GET /api/ml/status
 * Returns neural network status, architecture, model config, and normalization info
 */

import { NextResponse } from 'next/server';
import { getSharedAnomalyDetector } from '@/lib/ml/shared-detector';
import { FeatureExtractorConfig } from '@/lib/ml/feature-extractor';
import {
  getModelConfigSummary,
  calculateParameterCount,
  getArchitectureSummary,
} from '@/lib/ml/model-config';
import { getNormalizationSummary } from '@/lib/ml/normalization';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const detector = getSharedAnomalyDetector();
    const status = detector.getStatus();

    // Get model config from detector (accessing private field via save())
    const saved = detector.save();
    const modelConfig = saved.modelConfig;
    const normalizationStats = saved.normalizationStats;

    // Architecture info
    const architecture = {
      inputSize: modelConfig.inputSize,
      hiddenLayers: modelConfig.hiddenLayers,
      outputSize: modelConfig.outputSize,
      dropoutRates: modelConfig.dropoutRates,
      totalParameters: calculateParameterCount(modelConfig),
      summary: getArchitectureSummary(modelConfig),
    };

    // Model config summary
    const modelInfo = {
      name: modelConfig.name,
      version: modelConfig.version,
      summary: getModelConfigSummary(modelConfig),
      mcDropoutSamples: modelConfig.mcDropoutSamples,
      mcDropoutEnabled: modelConfig.mcDropoutEnabled && modelConfig.mcDropoutSamples > 1,
    };

    // Normalization info
    const normalization = normalizationStats
      ? {
          hasStats: true,
          summary: getNormalizationSummary(normalizationStats),
          sampleCount: normalizationStats.sampleCount,
          featureCount: normalizationStats.means.length,
        }
      : {
          hasStats: false,
          summary: 'No normalization statistics available – train the model first',
          sampleCount: 0,
          featureCount: 0,
        };

    // Feature extractor info
    const features = {
      count: FeatureExtractorConfig.numFeatures,
      names: FeatureExtractorConfig.featureNames,
      windowMs: FeatureExtractorConfig.windowMs,
      samplingIntervalMs: FeatureExtractorConfig.samplingIntervalMs,
    };

    return NextResponse.json({
      ok: true,
      status,
      architecture,
      modelInfo,
      normalization,
      features,
    });
  } catch (error) {
    console.error('[API] /ml/status error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
