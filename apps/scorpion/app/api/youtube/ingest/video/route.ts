import { z } from 'zod';
import { withErrorHandling, createSuccessResponse, validateRequest, ApiErrorCode, createErrorResponse } from '@/lib/api-error-handler';
import { ingestVideo } from '@/lib/youtube/videoIngest';
import { InvalidURLError } from '@/lib/youtube/errors';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const IngestVideoSchema = z.object({
  url: z.string().min(1, 'URL is required'),
});

export const POST = withErrorHandling(async (request: Request) => {
  const validation = await validateRequest(request, IngestVideoSchema);
  if (!validation.success) return validation.error;

  const { url } = validation.data as z.infer<typeof IngestVideoSchema>;

  try {
    const result = await ingestVideo(url);

    return createSuccessResponse({
      jobId: result.job.id,
      videoId: result.transcript?.video_id ?? null,
      status: result.job.status,
      alreadyIngested: result.alreadyIngested,
      provider: result.transcript?.provider_used ?? null,
      transcriptLength: result.transcript?.transcript_text?.length ?? 0,
      proposalId: result.proposal?.id ?? null,
      error: result.error ?? null,
    }, result.success ? 200 : 207);
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
