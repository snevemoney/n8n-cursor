import { z } from 'zod';
import { withErrorHandling, createSuccessResponse, validateRequest, ApiErrorCode, createErrorResponse } from '@/lib/api-error-handler';
import { ingestChannel } from '@/lib/youtube/channelIngest';
import { InvalidURLError } from '@/lib/youtube/errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const IngestChannelSchema = z.object({
  url: z.string().min(1, 'URL is required'),
  limit: z.number().int().min(1).max(50).optional().default(15),
});

export const POST = withErrorHandling(async (request: Request) => {
  const validation = await validateRequest(request, IngestChannelSchema);
  if (!validation.success) return validation.error;

  const { url, limit } = validation.data;

  try {
    const result = await ingestChannel(url, limit);

    return createSuccessResponse({
      jobId: result.job.id,
      status: result.job.status,
      summary: result.summary,
    });
  } catch (err) {
    if (err instanceof InvalidURLError) {
      return createErrorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        err.message,
        { url },
        400
      );
    }
    throw err;
  }
});
