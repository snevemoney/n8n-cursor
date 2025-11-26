/**
 * LLM Experiment Detail API
 * Get and update individual experiments
 */

import { NextRequest } from 'next/server';
import { withErrorHandling, createSuccessResponse, validateRequest, createErrorResponse, ApiErrorCode } from '@/lib/api-error-handler';
import { getExperimentTracker } from '@/lib/llm/experiment-tracker';
import { z } from 'zod';

const updateExperimentSchema = z.object({
  status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']).optional(),
  metrics: z.record(z.any()).optional(),
  trainedModelName: z.string().optional(),
  error: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;

  const tracker = getExperimentTracker();
  await tracker.initialize();

  const experiment = await tracker.getExperiment(id);

  if (!experiment) {
    return createErrorResponse(
      ApiErrorCode.NOT_FOUND,
      'Experiment not found',
      { id },
      404
    );
  }

  return createSuccessResponse(experiment);
});

export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;

  const validation = await validateRequest(request, updateExperimentSchema);
  if (!validation.success) {
    return validation.error;
  }

  const tracker = getExperimentTracker();
  await tracker.initialize();

  const experiment = await tracker.updateExperiment(id, validation.data);

  if (!experiment) {
    return createErrorResponse(
      ApiErrorCode.NOT_FOUND,
      'Experiment not found',
      { id },
      404
    );
  }

  return createSuccessResponse(experiment);
});

