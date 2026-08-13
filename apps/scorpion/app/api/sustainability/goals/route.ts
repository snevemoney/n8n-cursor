// Sustainability Goals API

import { NextRequest, NextResponse } from 'next/server';
import { getSustainabilityGoals, createSustainabilityGoal, updateGoalProgress } from '@/lib/sustainability/goals';
import { withErrorHandling, createSuccessResponse, createErrorResponse, ApiErrorCode } from '@/lib/api-error-handler';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const goalSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['carbon_reduction', 'energy_efficiency', 'resource_optimization']),
  target: z.number(),
  unit: z.string(),
  deadline: z.string().transform(s => new Date(s)),
});

/**
 * GET /api/sustainability/goals - List all sustainability goals
 */
export const GET = withErrorHandling(async () => {
  const goals = await getSustainabilityGoals();
  return createSuccessResponse({ goals, count: goals.length });
});

/**
 * POST /api/sustainability/goals - Create a new sustainability goal
 */
export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const validation = goalSchema.safeParse(body);

  if (!validation.success) {
    return createErrorResponse(
      ApiErrorCode.INVALID_REQUEST,
      'Invalid goal data',
      validation.error.errors,
      400
    );
  }

  const goal = await createSustainabilityGoal(validation.data);
  return createSuccessResponse(goal, 201);
});

/**
 * PUT /api/sustainability/goals/[id] - Update goal progress
 */
export const PUT = withErrorHandling(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const goalId = searchParams.get('id');

  if (!goalId) {
    return createErrorResponse(
      ApiErrorCode.INVALID_REQUEST,
      'Goal ID required',
      [],
      400
    );
  }

  const goal = await updateGoalProgress(goalId);
  return createSuccessResponse(goal);
});

