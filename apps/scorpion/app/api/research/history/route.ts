/**
 * API endpoint to get research history
 */

import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode } from '@/lib/api-error-handler';
import { getResearchHistory } from '@/lib/research/research-storage';

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  
  try {
    const history = await getResearchHistory(limit);
    return createSuccessResponse({
      history,
      count: history.length,
    });
  } catch (error: any) {
    return createErrorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      'Failed to load research history',
      { error: error.message },
      500
    );
  }
});

