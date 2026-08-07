/**
 * Control Panel - Memory Management
 * GET/POST /api/v1/control-panel/memories
 */

import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode, validateRequest } from '@/lib/api-error-handler';
import { z } from 'zod';
import { getMemoryStore } from '@/lib/memory/store';

export const dynamic = 'force-dynamic';

const memorySchema = z.object({
  scope: z.string(),
  content: z.string().min(1),
  weight: z.number().min(1).max(5),
  tags: z.array(z.string()).optional(),
});

/**
 * GET /api/v1/control-panel/memories - Get all memories
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get('scope') || undefined;

  const store = getMemoryStore();
  const memories = await store.getMemories({ scope, limit: 100 });

  return createSuccessResponse({ memories });
});

/**
 * POST /api/v1/control-panel/memories - Create a new memory
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const validation = await validateRequest(request, memorySchema);
  if (!validation.success) {
    return validation.error;
  }

  const store = getMemoryStore();
  const id = await store.createMemory(validation.data);

  return createSuccessResponse({ id, message: 'Memory created' }, 201);
});

