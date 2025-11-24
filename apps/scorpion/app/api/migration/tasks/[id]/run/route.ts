// Run Migration Task API

import { NextRequest, NextResponse } from 'next/server';
import { getMigrationService } from '@/lib/migration/migrationService';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode } from '@/lib/api-error-handler';

/**
 * POST /api/migration/tasks/[id]/run - Run a single migration task
 */
export const POST = withErrorHandling(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const taskId = params.id;
  const body = await req.json().catch(() => ({}));
  const dryRun = body.dryRun === true;

  const service = getMigrationService();
  await service.runTask(taskId, { dryRun });

  return createSuccessResponse({
    message: dryRun ? 'Migration task dry-run completed' : 'Migration task completed',
    taskId,
  });
});

