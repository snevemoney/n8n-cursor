// ML Orchestrator
// Routes ML requests to the appropriate tier based on task complexity and requirements

import type { MLRequest, MLResponse, MLTask, MLTier } from './types';
import { transcribeWithWhisper, transcribeWithLocalWhisper } from './tier1-whisper';
import { getImageEmbedding, classifyImage } from './tier1-clip';
import { runModelUnified } from '../chat/modelRunner';
import { predictWithPostgresML, trainPostgresMLModel, checkPostgresML } from './tier2-sqlml';
import { predictWithMindsDB, trainMindsDBModel, checkMindsDB } from './tier2-sqlml';

/**
 * Determine which tier to use for a given task
 */
export function selectTier(task: MLTask, options?: { priority?: 'speed' | 'accuracy' | 'cost' }): MLTier {
  const priority = options?.priority || 'speed';

  // Tier 1: Pre-trained APIs (fastest, no training needed)
  const tier1Tasks: MLTask[] = [
    'text-generation',
    'text-embedding',
    'speech-to-text',
    'text-to-speech',
    'image-classification',
    'image-embedding',
  ];

  if (tier1Tasks.includes(task)) {
    return 'tier1';
  }

  // Tier 2: SQL-ML (simple tabular predictions)
  const tier2Tasks: MLTask[] = [
    'tabular-prediction',
    'time-series-forecast',
  ];

  if (tier2Tasks.includes(task)) {
    return 'tier2';
  }

  // Tier 3: AutoML (custom models without deep ML expertise)
  if (task === 'custom-training' && priority === 'cost') {
    return 'tier3';
  }

  // Tier 4: Custom training (unique problems, deep ML)
  if (task === 'custom-training' || task === 'model-fine-tuning') {
    return 'tier4';
  }

  // Default to Tier 1 for unknown tasks
  return 'tier1';
}

/**
 * Main ML orchestrator function
 * Routes requests to appropriate tier and provider
 */
export async function processMLRequest(
  request: MLRequest
): Promise<MLResponse> {
  const tier = request.options?.tier || selectTier(request.task, request.options);
  const startTime = Date.now();

  try {
    let result: unknown;
    let model = 'unknown';

    switch (tier) {
      case 'tier1':
        result = await handleTier1(request);
        model = getTier1Model(request.task);
        break;

      case 'tier2':
        result = await handleTier2(request);
        model = 'sql-ml';
        break;

      case 'tier3':
        result = await handleTier3(request);
        model = 'autogluon';
        break;

      case 'tier4':
        result = await handleTier4(request);
        model = 'pytorch';
        break;
    }

    return {
      result,
      tier,
      model,
      latency: Date.now() - startTime,
    };
  } catch (error: any) {
    throw new Error(`ML request failed (${tier}): ${error.message}`);
  }
}

/**
 * Handle Tier 1: Pre-trained APIs
 */
async function handleTier1(request: MLRequest): Promise<unknown> {
  switch (request.task) {
    case 'text-generation':
      return await runModelUnified(
        '',
        request.input as string,
        {
          provider: 'ollama',
          model: request.options?.model || 'scorpion:latest',
          maxTokens: request.options?.maxTokens,
          temperature: request.options?.temperature,
        }
      );

    case 'speech-to-text':
      const useLocal = process.env.USE_LOCAL_WHISPER === 'true';
      if (useLocal) {
        return await transcribeWithLocalWhisper({
          audio: request.input as Buffer | string,
          language: request.options?.model, // Reuse model field for language
        });
      } else {
        return await transcribeWithWhisper({
          audio: request.input as Buffer | string,
          language: request.options?.model,
        });
      }

    case 'image-embedding':
      return await getImageEmbedding(request.input as Buffer | string);

    case 'image-classification':
      return await classifyImage({
        image: request.input as Buffer | string,
        task: 'classification',
        labels: (request.input as any).labels || [],
      });

    default:
      throw new Error(`Tier 1 task not supported: ${request.task}`);
  }
}

/**
 * Handle Tier 2: SQL-ML
 */
async function handleTier2(request: MLRequest): Promise<unknown> {
  // Try PostgresML first, fallback to MindsDB
  const hasPostgresML = await checkPostgresML();
  const hasMindsDB = await checkMindsDB();

  if (request.task === 'train' || (request.input as any).train) {
    if (hasPostgresML) {
      return await trainPostgresMLModel({
        task: 'train',
        modelName: (request.input as any).modelName || 'default',
        input: request.input as Record<string, unknown>,
        options: (request.input as any).options,
      });
    } else if (hasMindsDB) {
      return await trainMindsDBModel({
        task: 'train',
        modelName: (request.input as any).modelName || 'default',
        input: request.input as Record<string, unknown>,
        options: (request.input as any).options,
      });
    } else {
      throw new Error('No SQL-ML provider available. Install PostgresML or MindsDB.');
    }
  } else {
    if (hasPostgresML) {
      return await predictWithPostgresML({
        task: 'predict',
        modelName: (request.input as any).modelName || 'default',
        input: request.input as Record<string, unknown>,
      });
    } else if (hasMindsDB) {
      return await predictWithMindsDB({
        task: 'predict',
        modelName: (request.input as any).modelName || 'default',
        input: request.input as Record<string, unknown>,
      });
    } else {
      throw new Error('No SQL-ML provider available for prediction.');
    }
  }
}

/**
 * Handle Tier 3: AutoML
 */
async function handleTier3(request: MLRequest): Promise<unknown> {
  // Placeholder for AutoML integration
  // Would call AutoGluon, H2O, or PyCaret
  throw new Error('Tier 3 (AutoML) not yet implemented. Use Tier 2 (SQL-ML) for now.');
}

/**
 * Handle Tier 4: Custom Training
 */
async function handleTier4(request: MLRequest): Promise<unknown> {
  // Placeholder for custom training pipeline
  // Would use PyTorch, TensorFlow, or JAX
  throw new Error('Tier 4 (Custom Training) not yet implemented.');
}

/**
 * Get appropriate model name for Tier 1 tasks
 */
function getTier1Model(task: MLTask): string {
  switch (task) {
    case 'text-generation':
      return process.env.OLLAMA_MODEL || 'scorpion:latest';
    case 'speech-to-text':
      return 'whisper-1';
    case 'image-embedding':
    case 'image-classification':
      return 'clip-vit-base-patch32';
    default:
      return 'unknown';
  }
}

