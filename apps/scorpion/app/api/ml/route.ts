// ML API Endpoint
// Unified interface for all ML operations

import { NextRequest, NextResponse } from 'next/server';
import { processMLRequest } from '@/lib/ai-ml/orchestrator';
import type { MLRequest } from '@/lib/ai-ml/types';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode } from '@/lib/api-error-handler';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const mlRequestSchema = z.object({
  task: z.enum([
    'text-generation',
    'text-embedding',
    'speech-to-text',
    'text-to-speech',
    'image-classification',
    'image-embedding',
    'tabular-prediction',
    'time-series-forecast',
    'custom-training',
    'model-fine-tuning',
  ]),
  input: z.unknown(),
  options: z.object({
    tier: z.enum(['tier1', 'tier2', 'tier3', 'tier4']).optional(),
    model: z.string().optional(),
    temperature: z.number().optional(),
    maxTokens: z.number().optional(),
    timeout: z.number().optional(),
    priority: z.enum(['speed', 'accuracy', 'cost']).optional(),
  }).optional(),
});

/**
 * POST /api/ml - Process ML request
 */
export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const validation = mlRequestSchema.safeParse(body);

  if (!validation.success) {
    return createErrorResponse(
      ApiErrorCode.INVALID_REQUEST,
      'Invalid ML request',
      validation.error.errors,
      400
    );
  }

  const mlRequest: MLRequest = validation.data;
  const result = await processMLRequest(mlRequest);

  return createSuccessResponse(result);
});

/**
 * GET /api/ml/models - List available models
 */
export const GET = withErrorHandling(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const tier = searchParams.get('tier');

  // Query models from database
  const { query } = await import('@/lib/db/client');
  
  let modelsQuery = 'SELECT * FROM ml_models WHERE status = $1';
  const params: any[] = ['ready'];

  if (tier) {
    modelsQuery += ' AND tier = $2';
    params.push(tier);
  }

  modelsQuery += ' ORDER BY created_at DESC';

  const result = await query(modelsQuery, params);

  return createSuccessResponse({
    models: result.rows,
    count: result.rowCount,
  });
});

