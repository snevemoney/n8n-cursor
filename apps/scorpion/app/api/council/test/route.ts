import { NextRequest, NextResponse } from 'next/server';
import { runCouncilLegacy } from '@/server/orchestrator/council/legacy';
import { extractDomainTags } from '@/server/council';
import { withErrorHandling, createSuccessResponse } from '@/lib/api-error-handler';

export const dynamic = 'force-dynamic';

/**
 * POST /api/council/test - Test the council system (new v2 vs old legacy)
 * 
 * Tests which council system is active and returns detailed information
 */
export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json().catch(() => ({}));
  const testMessage = body.message || 'Test council system: Should I hardcode API keys in my code?';
  const testPlan = body.plan || '1. Hardcode API key\n2. Commit to git\n3. Deploy';
  
  const councilImplementation = process.env['SCORPION_COUNCIL_IMPLEMENTATION'] || 'v2';
  
  console.log('[Council Test] Testing council system:', {
    implementation: councilImplementation,
    message: testMessage,
    system: councilImplementation === 'v2' ? 'NEW (v2)' : 'OLD (legacy)',
  });
  
  const domainTags = extractDomainTags(testMessage, testPlan);
  const councilInput = {
    goalDescription: testMessage,
    planSummary: testPlan,
    draftAnswer: undefined,
    domainTags,
    toolsUsed: [],
    planSteps: [
      { tool: 'none', description: 'Hardcode API key' },
      { tool: 'none', description: 'Commit to git' },
      { tool: 'none', description: 'Deploy' },
    ],
    userId: 'test-user',
    conversationId: 'test-conversation',
    missionId: 'test-mission',
  };
  
  const startTime = Date.now();
  let councilResult;
  let error: any = null;
  
  try {
    councilResult = await runCouncilLegacy(councilInput);
    const duration = Date.now() - startTime;
    
    return createSuccessResponse({
      system: {
        implementation: councilImplementation,
        version: councilImplementation === 'v2' ? 'NEW (v2)' : 'OLD (legacy)',
        adapter: 'runCouncilLegacy',
        routesTo: councilImplementation === 'v2' ? 'runCouncilV2 → runNewCouncil' : 'legacy fallback',
      },
      result: {
        approved: councilResult.approved,
        score: councilResult.score,
        issuesCount: councilResult.allIssues?.length || 0,
        councillorsCount: councilResult.councillorOutputs?.length || 0,
        warnings: councilResult.warnings || [],
        duration: `${duration}ms`,
      },
      issues: councilResult.allIssues || [],
      councillors: councilResult.councillorOutputs || [],
      test: {
        message: testMessage,
        plan: testPlan,
        domainTags,
      },
    });
  } catch (err: any) {
    error = err;
    const duration = Date.now() - startTime;
    
    return NextResponse.json({
      success: false,
      error: {
        message: err.message,
        stack: process.env['NODE_ENV'] === 'development' ? err.stack : undefined,
      },
      system: {
        implementation: councilImplementation,
        version: councilImplementation === 'v2' ? 'NEW (v2)' : 'OLD (legacy)',
        adapter: 'runCouncilLegacy',
        routesTo: councilImplementation === 'v2' ? 'runCouncilV2 → runNewCouncil' : 'legacy fallback',
      },
      duration: `${duration}ms`,
    }, { status: 500 });
  }
});

/**
 * GET /api/council/test - Get council system status
 */
export const GET = withErrorHandling(async () => {
  const councilImplementation = process.env['SCORPION_COUNCIL_IMPLEMENTATION'] || 'v2';
  
  return createSuccessResponse({
    system: {
      implementation: councilImplementation,
      version: councilImplementation === 'v2' ? 'NEW (v2)' : 'OLD (legacy)',
      adapter: 'runCouncilLegacy',
      routesTo: councilImplementation === 'v2' ? 'runCouncilV2 → runNewCouncil' : 'legacy fallback',
      featureFlag: 'SCORPION_COUNCIL_IMPLEMENTATION',
      currentValue: councilImplementation,
    },
    architecture: {
      chatRoute: 'Uses runCouncilLegacy adapter',
      legacyAdapter: 'Routes to runCouncilV2 (if v2) or legacy fallback (if legacy)',
      v2Implementation: 'Uses runNewCouncil from @/server/council',
      oldSystem: 'Disabled (useOldCouncil = false)',
    },
  });
});









