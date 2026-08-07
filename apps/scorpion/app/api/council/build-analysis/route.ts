import { NextRequest, NextResponse } from 'next/server';
import { runCouncil } from '@/server/council';
import { extractDomainTags } from '@/server/council/runCouncil';
import type { CouncilInput, CouncilResult } from '@/server/types/council';

export const dynamic = 'force-dynamic';

interface BuildAnalysisRequest {
  workflowName: string;
  workflowStatus: 'success' | 'failure' | 'cancelled';
  branch: string;
  commitSha: string;
  commitMessage: string;
  changedFiles?: string[];
  buildLogs?: string;
  errorMessages?: string[];
  testResults?: {
    passed: number;
    failed: number;
    skipped: number;
  };
  buildDuration?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Format build context for specific council member duties
 */
function formatBuildContextForCouncil(
  buildData: BuildAnalysisRequest
): string {
  const {
    workflowName,
    workflowStatus,
    branch,
    commitSha,
    commitMessage,
    changedFiles = [],
    buildLogs = '',
    errorMessages = [],
    testResults,
    buildDuration,
  } = buildData;

  // Extract relevant patterns for different council members
  const allText = `${buildLogs}\n${commitMessage}\n${errorMessages.join('\n')}`.toLowerCase();
  
  // Security Council context (API keys, secrets, auth, SQL, XSS, CORS)
  const securityContext = `
SECURITY ANALYSIS CONTEXT:
- Workflow: ${workflowName} (${workflowStatus})
- Changed files: ${changedFiles.filter(f => 
    f.includes('.env') || 
    f.includes('secret') || 
    f.includes('auth') || 
    f.includes('api') ||
    f.includes('config')
  ).join(', ') || 'none'}
- Errors mentioning secrets/auth: ${errorMessages.filter(e => 
    /secret|key|token|auth|password|credential/i.test(e)
  ).length}
- SQL queries in logs: ${/sql|query|database/i.test(allText) ? 'detected' : 'none'}
- File operations: ${/file|fs\.|read|write|delete/i.test(allText) ? 'detected' : 'none'}
- CORS configuration: ${/cors|cross-origin/i.test(allText) ? 'detected' : 'none'}
`.trim();

  // Performance Council context (N+1, caching, algorithms, payloads, blocking)
  const performanceContext = `
PERFORMANCE ANALYSIS CONTEXT:
- Build duration: ${buildDuration ? `${buildDuration}s` : 'unknown'}
- Test results: ${testResults ? `${testResults.passed} passed, ${testResults.failed} failed` : 'none'}
- Loop + query patterns: ${/loop|foreach|map.*query|iterate.*fetch/i.test(allText) ? 'detected' : 'none'}
- Caching mentioned: ${/cache|redis|memoize/i.test(allText) ? 'yes' : 'no'}
- Large payloads: ${/large|all.*data|entire.*dataset|fetch.*all/i.test(allText) ? 'detected' : 'none'}
- Blocking operations: ${/synchronous|blocking|sleep|wait/i.test(allText) ? 'detected' : 'none'}
- Database indexes: ${/index|database.*index/i.test(allText) ? 'mentioned' : 'not mentioned'}
`.trim();

  // Architectus context (architecture, modularity, scalability, legacy)
  const architectureContext = `
ARCHITECTURE ANALYSIS CONTEXT:
- Workflow type: ${workflowName}
- Changed workflow files: ${changedFiles.filter(f => 
    f.includes('.github/workflows') || 
    f.includes('docker') ||
    f.includes('compose')
  ).join(', ') || 'none'}
- Legacy patterns: ${/legacy|old|deprecated|simple_planner|basic_council/i.test(allText) ? 'detected' : 'none'}
- Modular architecture: ${/orchestrator|planner|executor|council|tool.*registry/i.test(allText) ? 'mentioned' : 'not mentioned'}
- Scalability concerns: ${/scale|performance|bottleneck|concurrent/i.test(allText) ? 'detected' : 'none'}
`.trim();

  // Pragmaton context (execution, n8n, API, error handling)
  const executionContext = `
EXECUTION ANALYSIS CONTEXT:
- Workflow status: ${workflowStatus}
- n8n workflows: ${/n8n|workflow|automation/i.test(allText) ? 'detected' : 'none'}
- API calls: ${/api|endpoint|http|fetch|request/i.test(allText) ? 'detected' : 'none'}
- Tool usage: ${changedFiles.filter(f => 
    f.includes('tool') || 
    f.includes('tools/')
  ).length} tool-related files
- Error handling: ${errorMessages.length > 0 ? `${errorMessages.length} errors` : 'no errors'}
- Dependencies: ${/depends|before|after|sequence/i.test(allText) ? 'mentioned' : 'not mentioned'}
`.trim();

  // Sentinel context (security & performance monitoring)
  const sentinelContext = `
SECURITY & PERFORMANCE MONITORING:
- Security-sensitive operations: ${/security|auth|permission|vulnerability/i.test(allText) ? 'detected' : 'none'}
- Performance issues: ${/slow|bottleneck|timeout|latency/i.test(allText) ? 'detected' : 'none'}
- System integrity: ${/system|infrastructure|server|deployment/i.test(allText) ? 'mentioned' : 'not mentioned'}
- Build health: ${workflowStatus === 'failure' ? 'FAILED' : workflowStatus === 'success' ? 'HEALTHY' : 'UNKNOWN'}
`.trim();

  // Analytica context (knowledge, RAG, information quality)
  const knowledgeContext = `
KNOWLEDGE & RAG ANALYSIS:
- Knowledge base usage: ${/kb\.search|knowledge|rag|retrieval|ontology/i.test(allText) ? 'detected' : 'none'}
- External research: ${/research|web|external|source/i.test(allText) ? 'detected' : 'none'}
- Information quality: ${/low.*quality|poor|inaccurate|outdated/i.test(allText) ? 'concerns' : 'ok'}
- Knowledge reuse: ${/reuse|existing|past|similar/i.test(allText) ? 'mentioned' : 'not mentioned'}
`.trim();

  // Oracle context (metrics, analytics, data quality)
  const analyticsContext = `
DATA & ANALYTICS ANALYSIS:
- Metrics mentioned: ${/metric|analytics|insight|trend|statistic/i.test(allText) ? 'detected' : 'none'}
- Predictive analytics: ${/predict|forecast|future|trend/i.test(allText) ? 'detected' : 'none'}
- Data quality: ${/quality|accuracy|reliable|verify|validate/i.test(allText) ? 'mentioned' : 'not mentioned'}
- System metrics: ${/system.*metric|performance.*metric|health/i.test(allText) ? 'detected' : 'none'}
`.trim();

  // Mentor context (LLM training, prompts, model evaluation)
  const llmContext = `
LLM TRAINING & EVALUATION:
- LLM/model operations: ${/llm|model|training|fine-tuning|prompt/i.test(allText) ? 'detected' : 'none'}
- Training strategy: ${/train|fine-tun|tune|optimize/i.test(allText) ? 'detected' : 'none'}
- Prompt engineering: ${/prompt|instruction|system.*prompt/i.test(allText) ? 'detected' : 'none'}
- Model evaluation: ${/evaluate|test|metric|score|quality/i.test(allText) ? 'detected' : 'none'}
- Training data: ${/training.*data|dataset|examples/i.test(allText) ? 'detected' : 'none'}
`.trim();

  // Satori context (alignment, privacy, safety, business rules)
  const alignmentContext = `
ALIGNMENT & SAFETY ANALYSIS:
- User-focused operations: ${/user|client|customer|person/i.test(allText) ? 'detected' : 'none'}
- Privacy concerns: ${/privacy|data|personal|sensitive|pii|gdpr/i.test(allText) ? 'detected' : 'none'}
- Safety issues: ${/safety|harm|risk|danger|unsafe/i.test(allText) ? 'detected' : 'none'}
- Business rules: ${/business|rule|policy|compliance|regulation/i.test(allText) ? 'mentioned' : 'not mentioned'}
`.trim();

  // Catalyst context (innovation, ROI, new tech)
  const innovationContext = `
INNOVATION ANALYSIS:
- Innovation opportunities: ${/innovate|new|cutting-edge|experimental/i.test(allText) ? 'detected' : 'none'}
- Complexity trade-offs: ${/complex|complicated|difficult/i.test(allText) ? 'detected' : 'none'}
- ROI considerations: ${/cost|time|effort|benefit|value|return/i.test(allText) ? 'mentioned' : 'not mentioned'}
- New technologies: ${/llm|ai|model|mcp|agent/i.test(allText) ? 'detected' : 'none'}
`.trim();

  // Nexus context (integration, API contracts, data flows, webhooks)
  const integrationContext = `
INTEGRATION ANALYSIS:
- Integration operations: ${/integrate|api|webhook|endpoint|service/i.test(allText) ? 'detected' : 'none'}
- Module integration: ${/orchestrator|planner|executor|council/i.test(allText) ? 'detected' : 'none'}
- API contracts: ${/api|endpoint|contract|schema|interface/i.test(allText) ? 'detected' : 'none'}
- Data flows: ${/data.*flow|pipeline|stream|event|message/i.test(allText) ? 'detected' : 'none'}
- Webhooks: ${/webhook|callback|notification|event/i.test(allText) ? 'detected' : 'none'}
`.trim();

  // DataOps context (data workflows, Excel/CSV/PDF, privacy, verification)
  const dataOpsContext = `
DATA OPERATIONS ANALYSIS:
- Data workflows: ${/excel|csv|pdf|spreadsheet|tabular/i.test(allText) ? 'detected' : 'none'}
- Data comparison: ${/compare|differences|similarities|year.*over.*year/i.test(allText) ? 'detected' : 'none'}
- Data cleaning: ${/clean|duplicates|deduplicate|missing.*data|enrich/i.test(allText) ? 'detected' : 'none'}
- Sensitive data: ${/personal|pii|sensitive|names|address|phone/i.test(allText) ? 'detected' : 'none'}
- Data verification: ${/verify|validate|check|review/i.test(allText) ? 'mentioned' : 'not mentioned'}
`.trim();

  // Combine all contexts
  return `
BUILD ANALYSIS: ${workflowName}
Status: ${workflowStatus}
Branch: ${branch}
Commit: ${commitSha.substring(0, 7)}
Message: ${commitMessage}
Duration: ${buildDuration ? `${buildDuration}s` : 'unknown'}
Changed Files: ${changedFiles.length} files

${securityContext}

${performanceContext}

${architectureContext}

${executionContext}

${sentinelContext}

${knowledgeContext}

${analyticsContext}

${llmContext}

${alignmentContext}

${innovationContext}

${integrationContext}

${dataOpsContext}

ERRORS (${errorMessages.length}):
${errorMessages.slice(0, 10).map(e => `- ${e}`).join('\n')}
${errorMessages.length > 10 ? `... and ${errorMessages.length - 10} more` : ''}

BUILD LOGS (last 2000 chars):
${buildLogs.slice(-2000)}
`.trim();
}

export async function POST(req: NextRequest) {
  try {
    const body: BuildAnalysisRequest = await req.json();
    
    // Format comprehensive context for council
    const buildContext = formatBuildContextForCouncil(body);

    // Create council input with specialized context
    const councilInput: CouncilInput = {
      goalDescription: `Analyze GitHub Actions build: ${body.workflowName} (${body.workflowStatus})`,
      planSummary: buildContext,
      draftAnswer: `Build analysis for ${body.workflowName} workflow`,
      domainTags: extractDomainTags(
        `Build analysis: ${body.workflowName}`,
        buildContext
      ).concat(['ci-cd', 'build-analysis', body.workflowStatus, 'github-actions']),
      toolsUsed: body.changedFiles
        ?.filter(f => f.endsWith('.yml') || f.endsWith('.yaml') || f.includes('workflow'))
        .map(f => `workflow:${f}`) || [],
      planSteps: body.changedFiles?.slice(0, 10).map(file => ({
        tool: file.includes('.github/workflows') ? 'github-actions' : undefined,
        description: `Changed: ${file}`,
      })) || [],
      userId: 'github-actions',
      conversationId: `build-${body.commitSha}`,
      missionId: `build-analysis-${body.workflowName}-${Date.now()}`,
    };

    // Run council analysis - each member will analyze based on their duties
    const councilResult: CouncilResult = await runCouncil(councilInput);

    // Organize reports by council member with their specific duties
    const reportsByMember: Record<string, {
      councillorName: string;
      councillorId: string;
      description: string;
      issues: Array<{
        severity: number;
        tag: string;
        message: string;
        recommendation?: string;
      }>;
      approved: boolean;
    }> = {};

    if (councilResult.councillorOutputs) {
      // Import MEMBERS to get descriptions
      const { MEMBERS } = await import('@/server/council');
      
      for (const output of councilResult.councillorOutputs) {
        // Get council member description from the member itself
        const member = MEMBERS.find(m => m.id === output.councillorId);
        
        reportsByMember[output.councillorId] = {
          councillorName: output.councillorName,
          councillorId: output.councillorId,
          description: member?.description || `${output.councillorName} analysis`,
          issues: (output.issues as any[]).map(issue => ({
            severity: issue.severity || 1,
            tag: issue.tag || 'general',
            message: issue.message || '',
            recommendation: issue.recommendation,
          })),
          approved: output.approved,
        };
      }
    }

    // Build comprehensive report organized by council member duties
    const report = {
      buildInfo: {
        workflowName: body.workflowName,
        status: body.workflowStatus,
        branch: body.branch,
        commitSha: body.commitSha,
        commitMessage: body.commitMessage,
        duration: body.buildDuration,
        timestamp: new Date().toISOString(),
      },
      overallApproval: councilResult.approved,
      summary: {
        totalIssues: councilResult.allIssues?.length || 0,
        criticalIssues: councilResult.allIssues?.filter(i => i.severity >= 5).length || 0,
        highIssues: councilResult.allIssues?.filter(i => i.severity >= 4).length || 0,
        mediumIssues: councilResult.allIssues?.filter(i => i.severity === 3).length || 0,
        lowIssues: councilResult.allIssues?.filter(i => i.severity <= 2).length || 0,
        warnings: councilResult.warnings?.length || 0,
      },
      reportsByMember, // Each council member's specific analysis
      allIssues: councilResult.allIssues || [],
      warnings: councilResult.warnings || [],
    };

    return NextResponse.json(report, { status: 200 });
  } catch (error: any) {
    console.error('[Build Analysis] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze build' },
      { status: 500 }
    );
  }
}

