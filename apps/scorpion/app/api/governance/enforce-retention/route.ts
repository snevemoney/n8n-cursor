// Retention Enforcement API

import { NextRequest, NextResponse } from 'next/server';
import { getGovernanceService } from '@/lib/governance/governanceService';
import { withErrorHandling, createSuccessResponse } from '@/lib/api-error-handler';

/**
 * POST /api/governance/enforce-retention - Trigger retention enforcement
 */
export const POST = withErrorHandling(async () => {
  const service = getGovernanceService();
  const result = await service.enforceRetention();

  return createSuccessResponse({
    ...result,
    message: `Retention enforcement completed: ${result.deleted} deleted, ${result.flagged} flagged`,
  });
});

