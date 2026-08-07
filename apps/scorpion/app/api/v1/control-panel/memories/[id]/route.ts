/**
 * Control Panel - Memory Management (Individual)
 * DELETE /api/v1/control-panel/memories/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling, createSuccessResponse } from '@/lib/api-error-handler';
import { getMemoryStore } from '@/lib/memory/store';

export const dynamic = 'force-dynamic';

/**
 * DELETE /api/v1/control-panel/memories/[id] - Delete a memory
 */
export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const store = getMemoryStore();
  await store.deleteMemory(params.id);

  return createSuccessResponse({ message: 'Memory deleted' });
});

