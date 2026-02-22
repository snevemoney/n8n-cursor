import { withErrorHandling, createSuccessResponse } from '@/lib/api-error-handler';
import { getRecentJobs, getFailedJobs } from '@/lib/youtube/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withErrorHandling(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const failedOnly = searchParams.get('failed') === 'true';
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 200);

  const jobs = failedOnly
    ? await getFailedJobs()
    : await getRecentJobs(limit);

  return createSuccessResponse({ jobs, count: jobs.length });
});
