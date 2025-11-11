/**
 * LLM Experiments API
 * List and create training experiments
 */

import { NextRequest } from 'next/server';
import { withErrorHandling, createSuccessResponse, validateRequest, createErrorResponse, ApiErrorCode } from '@/lib/api-error-handler';
import { getExperimentTracker } from '@/lib/llm/experiment-tracker';
import { z } from 'zod';

const createExperimentSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  baseModel: z.string().min(1),
  strategy: z.enum(['lora', 'qlora', 'full-finetune', 'adapter']),
  hyperparameters: z.object({
    learningRate: z.number().positive(),
    batchSize: z.number().int().positive(),
    epochs: z.number().int().positive(),
    warmupSteps: z.number().int().nonnegative().optional(),
    weightDecay: z.number().nonnegative().optional(),
  }),
  dataset: z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    size: z.number().int().positive(),
    qualityScore: z.number().min(0).max(1).optional(),
  }),
});

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as any;
  const baseModel = searchParams.get('baseModel');
  const strategy = searchParams.get('strategy') as any;

  const tracker = getExperimentTracker();
  await tracker.initialize();

  const experiments = await tracker.listExperiments({
    status,
    baseModel: baseModel || undefined,
    strategy,
  });

  return createSuccessResponse({
    experiments,
    count: experiments.length,
  });
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const validation = await validateRequest(request, createExperimentSchema);
  if (!validation.success) {
    return validation.error;
  }

  const tracker = getExperimentTracker();
  await tracker.initialize();

  const experiment = await tracker.createExperiment(validation.data);

  return createSuccessResponse(experiment, 201);
});

