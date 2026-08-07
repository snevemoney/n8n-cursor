// Migration Jobs API

import { NextRequest } from 'next/server';
import { getMigrationService } from '@/lib/migration/migrationService';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode } from '@/lib/api-error-handler';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const createJobSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  sourceSystem: z.string().min(1),
  targetSystem: z.string().min(1),
  tasks: z.array(z.object({
    kind: z.enum(['schema_refactor', 'data_migration', 'workflow_import', 'file_split', 'code_refactor']),
    name: z.string().min(1),
    description: z.string().optional(),
    details: z.record(z.unknown()).optional(),
  })),
  config: z.record(z.unknown()).optional(),
});

/**
 * GET /api/migration/jobs - List all migration jobs
 */
export const GET = withErrorHandling(async () => {
  const service = getMigrationService();
  const jobs = await service.listJobs();
  return createSuccessResponse({ jobs, count: jobs.length });
});

/**
 * POST /api/migration/jobs - Create a new migration job
 */
export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const validation = createJobSchema.safeParse(body);

  if (!validation.success) {
    return createErrorResponse(
      ApiErrorCode.INVALID_REQUEST,
      'Invalid migration job data',
      validation.error.errors,
      400
    );
  }

  const service = getMigrationService();
  const jobId = await service.createJob(validation.data);

  return createSuccessResponse({ jobId, message: 'Migration job created' }, 201);
});

