/**
 * Control Panel - List All Modes
 * GET /api/v1/control-panel/modes
 */

import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling, createSuccessResponse } from '@/lib/api-error-handler';
import { behaviorConfig } from '@/config/behavior';

/**
 * GET /api/v1/control-panel/modes - Get all available modes
 */
export const GET = withErrorHandling(async () => {
  const modes = Object.entries(behaviorConfig.modes).map(([mode, config]) => ({
    mode,
    description: config.description,
    tone: config.tone,
    maxDepth: config.maxDepth,
    safetyBias: config.safetyBias,
    costBias: config.costBias,
  }));

  return createSuccessResponse({ modes });
});

