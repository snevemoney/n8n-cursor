import { withErrorHandling, createSuccessResponse } from '@/lib/api-error-handler';
import { getProposals } from '@/lib/youtube/db';
import type { LearningProposalStatusType } from '@/lib/youtube/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withErrorHandling(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as LearningProposalStatusType | null;
  const systemArea = searchParams.get('system_area');
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 200);

  const proposals = await getProposals({
    status: status ?? undefined,
    system_area: systemArea ?? undefined,
    limit,
  });

  return createSuccessResponse({ proposals, count: proposals.length });
});
