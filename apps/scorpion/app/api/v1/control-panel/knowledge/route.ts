/**
 * Control Panel - Knowledge Source Weights
 * GET/POST /api/v1/control-panel/knowledge
 */

import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode, validateRequest } from '@/lib/api-error-handler';
import { z } from 'zod';
import { knowledgeSourceWeights, type KnowledgeSource } from '@/config/knowledge';

const weightSchema = z.object({
  source: z.string(),
  weight: z.number().min(0).max(5),
});

/**
 * GET /api/v1/control-panel/knowledge - Get knowledge source weights
 */
export const GET = withErrorHandling(async () => {
  const sources = Object.entries(knowledgeSourceWeights).map(([source, weight]) => ({
    source,
    weight,
  }));

  return createSuccessResponse({ sources });
});

/**
 * POST /api/v1/control-panel/knowledge - Update knowledge source weight
 * 
 * Note: This updates the config at runtime. For persistence, implement database storage.
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const validation = await validateRequest(request, weightSchema);
  if (!validation.success) {
    return validation.error;
  }

  const { source, weight } = validation.data;

  // Update weight in config (runtime only, not persisted)
  // TODO: Implement database persistence for knowledge weights
  (knowledgeSourceWeights as any)[source] = weight;

  return createSuccessResponse({
    source,
    weight,
    message: 'Weight updated (note: this is a temporary change, implement persistence for production)',
  });
});

