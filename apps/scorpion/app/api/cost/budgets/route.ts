/**
 * GET /api/cost/budgets
 * Get budget status (budget vs actual)
 * 
 * POST /api/cost/budgets
 * Create or update a budget
 */

import { NextResponse } from 'next/server';
import { getCostTracker } from '@/lib/cost/tracker';
import { withErrorHandling, createSuccessResponse } from '@/lib/api-error-handler';
import type { BudgetDefinition } from '@/lib/cost/tracker';

export const dynamic = 'force-dynamic';

export const GET = withErrorHandling(async () => {
  const tracker = getCostTracker();
  const budgets = await tracker.getBudgetStatus();
  
  return createSuccessResponse({
    budgets,
    timestamp: new Date().toISOString(),
  });
});

export const POST = withErrorHandling(async (request: Request) => {
  const body = await request.json() as BudgetDefinition;
  const tracker = getCostTracker();
  
  await tracker.setBudget(body);
  
  return createSuccessResponse({
    message: 'Budget created/updated successfully',
    budget: body,
  });
});

