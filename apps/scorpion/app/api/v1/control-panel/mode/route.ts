/**
 * Control Panel - Mode Management
 * GET/POST /api/v1/control-panel/mode
 */

import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode, validateRequest } from '@/lib/api-error-handler';
import { z } from 'zod';
import { behaviorConfig, type ScorpionMode } from '@/config/behavior';

export const dynamic = 'force-dynamic';

const modeSchema = z.object({
  mode: z.enum(['owner', 'safe_saas', 'nursing_study', 'bitcoin_research', 'architecture_planner']),
});

/**
 * GET /api/v1/control-panel/mode - Get current mode
 */
export const GET = withErrorHandling(async () => {
  // In a real implementation, this would be stored in database or session
  // For now, return default mode
  return createSuccessResponse({
    mode: behaviorConfig.defaultMode,
  });
});

/**
 * POST /api/v1/control-panel/mode - Set current mode
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const validation = await validateRequest(request, modeSchema);
  if (!validation.success) {
    return validation.error;
  }

  const { mode } = validation.data;

  // In a real implementation, this would be stored in database or session
  // For now, just update the default (or use a global state)
  // TODO: Store mode preference in database or user session

  return createSuccessResponse({
    mode,
    message: 'Mode updated (note: this is a temporary change, implement persistence for production)',
  });
});

