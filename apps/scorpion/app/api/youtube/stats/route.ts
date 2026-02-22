import { withErrorHandling, createSuccessResponse } from '@/lib/api-error-handler';
import { getIngestSummaryStats } from '@/lib/youtube/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withErrorHandling(async () => {
  const stats = await getIngestSummaryStats();
  return createSuccessResponse(stats);
});
