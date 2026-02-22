import { withErrorHandling, createSuccessResponse } from '@/lib/api-error-handler';
import { getTranscripts } from '@/lib/youtube/db';
import type { TranscriptStatusType } from '@/lib/youtube/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withErrorHandling(async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as TranscriptStatusType | null;
  const provider = searchParams.get('provider');
  const channelId = searchParams.get('channel_id');
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10), 200);

  const transcripts = await getTranscripts({
    status: status ?? undefined,
    provider: provider ?? undefined,
    channel_id: channelId ?? undefined,
    limit,
  });

  return createSuccessResponse({ transcripts, count: transcripts.length });
});
