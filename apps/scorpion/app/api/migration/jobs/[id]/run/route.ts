// Run Migration Job API

import { NextRequest } from 'next/server';
import { getMigrationService } from '@/lib/migration/migrationService';
import { withErrorHandling, createSuccessResponse } from '@/lib/api-error-handler';

export const dynamic = 'force-dynamic';

/**
 * POST /api/migration/jobs/[id]/run - Run a migration job
 */
export const POST = withErrorHandling(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const jobId = params.id;
  const body = await req.json().catch(() => ({}));
  const dryRun = body.dryRun === true;

  const service = getMigrationService();
  await service.runJob(jobId, { dryRun });

  return createSuccessResponse({
    message: dryRun ? 'Migration job dry-run completed' : 'Migration job completed',
    jobId,
  });
});

