import { z } from 'zod';
import { withErrorHandling, createSuccessResponse, validateRequest, ApiErrorCode, createErrorResponse } from '@/lib/api-error-handler';
import { updateProposalStatus } from '@/lib/youtube/db';
import { LearningProposalStatus } from '@/lib/youtube/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RejectSchema = z.object({
  proposalId: z.string().uuid('Invalid proposal ID'),
  reviewerNotes: z.string().optional(),
  markAsKnowledgeOnly: z.boolean().optional().default(false),
});

export const POST = withErrorHandling(async (request: Request) => {
  const validation = await validateRequest(request, RejectSchema);
  if (!validation.success) return validation.error;

  const { proposalId, reviewerNotes, markAsKnowledgeOnly } = validation.data;

  const status = markAsKnowledgeOnly
    ? LearningProposalStatus.KNOWLEDGE_ONLY
    : LearningProposalStatus.REJECTED;

  const updated = await updateProposalStatus(proposalId, status, reviewerNotes);

  if (!updated) {
    return createErrorResponse(
      ApiErrorCode.NOT_FOUND,
      `Proposal ${proposalId} not found`,
      undefined,
      404
    );
  }

  console.log(`[YouTube Learning] ${status} proposal ${proposalId} (human decision)`);

  return createSuccessResponse({
    proposal: updated,
    action: status.toLowerCase(),
  });
});
