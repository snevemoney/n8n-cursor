/**
 * POST /api/youtube/learning/promote
 *
 * HUMAN-GATED: Manual promotion of a learning proposal to playbook status.
 * This is the ONLY path from READY_FOR_REVIEW → PROMOTED_TO_PLAYBOOK.
 * No automatic promotion. No self-modification.
 */

import { z } from 'zod';
import { withErrorHandling, createSuccessResponse, validateRequest, ApiErrorCode, createErrorResponse } from '@/lib/api-error-handler';
import { updateProposalStatus } from '@/lib/youtube/db';
import { LearningProposalStatus } from '@/lib/youtube/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PromoteSchema = z.object({
  proposalId: z.string().uuid('Invalid proposal ID'),
  reviewerNotes: z.string().optional(),
  confirmPromotion: z.literal(true, {
    errorMap: () => ({ message: 'Must explicitly confirm promotion with confirmPromotion: true' }),
  }),
});

export const POST = withErrorHandling(async (request: Request) => {
  const validation = await validateRequest(request, PromoteSchema);
  if (!validation.success) return validation.error;

  const { proposalId, reviewerNotes } = validation.data;

  const updated = await updateProposalStatus(
    proposalId,
    LearningProposalStatus.PROMOTED_TO_PLAYBOOK,
    reviewerNotes
  );

  if (!updated) {
    return createErrorResponse(
      ApiErrorCode.NOT_FOUND,
      `Proposal ${proposalId} not found`,
      undefined,
      404
    );
  }

  console.log(`[YouTube Learning] PROMOTED proposal ${proposalId} to playbook (human decision)`);

  return createSuccessResponse({
    proposal: updated,
    action: 'promoted_to_playbook',
  });
});
