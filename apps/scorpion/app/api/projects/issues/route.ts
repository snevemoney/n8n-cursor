import { NextResponse } from 'next/server';
import { getOrchestrator } from '@/lib/shared-stores';
import { withErrorHandling, createSuccessResponse } from '@/lib/api-error-handler';
// TechDebtAnalyzer is not exported from @scorpion/core - commenting out for now
// import { TechDebtAnalyzer } from '@scorpion/core';
import path from 'path';

interface DetailedIssue {
  id: string;
  type: 'tech-debt' | 'missing-feature' | 'typescript-error' | 'unimplemented-tool' | 'todo';
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  file: string;
  line?: number;
  message: string;
  context?: string;
  status: 'open' | 'in-progress' | 'fixed';
  lastUpdated: string;
}

/**
 * GET /api/projects/issues - Get detailed list of all critical issues
 */
export const GET = withErrorHandling(async () => {
  const orchestrator = await getOrchestrator();
  const workspaceRoot = process.cwd().replace(/\/apps\/scorpion$/, '');
  
  const issues: DetailedIssue[] = [];
  
  // 1. Get tech debt from analyzer
  // TechDebtAnalyzer is not available - skipping tech debt analysis for now
  try {
    // const analyzer = new TechDebtAnalyzer(workspaceRoot);
    // const knowledge = await analyzer.analyzeCodebase();
    
    // knowledge.forEach((item, index) => {
    //   const priority = item.tags?.some(t => t.includes('critical') || t.includes('p0')) ? 'critical' :
    //                   item.tags?.some(t => t.includes('high') || t.includes('p1')) ? 'high' :
    //                   item.tags?.some(t => t.includes('medium') || t.includes('p2')) ? 'medium' : 'low';
      
    //   issues.push({
    //     id: `tech-debt-${index}`,
    //     type: item.category === 'tech-debt' ? 'tech-debt' : 'missing-feature',
    //     priority,
    //     category: item.category || 'unknown',
    //     file: item.source || 'unknown',
    //     message: item.content || item.title || 'No description',
    //     context: item.content,
    //     status: 'open',
    //     lastUpdated: item.extractedAt || new Date().toISOString()
    //   });
    // });
  } catch (error) {
    console.error('Error analyzing tech debt:', error);
  }
  
  // 2. Scan for TypeScript errors (from audit reports)
  const typescriptErrors = [
    { file: 'packages/scorpion-core/src/llm/openai-service.ts', lines: [648, 650, 681, 683, 721, 723], message: 'Buffer type incompatibility with FormData/Blob APIs' },
    { file: 'packages/scorpion-core/src/knowledge/rag-store.ts', message: 'ragStore.query() API mismatches - filter parameter type issues' },
    { file: 'packages/scorpion-core/src/knowledge/types.ts', message: 'ExtractedKnowledge missing content property access' },
    { file: 'packages/scorpion-core/src/context/grounding.ts', message: 'AgentInfo[] type incompatibility' },
    { file: 'components/scorpion/BackpressureDial.tsx', message: 'Missing ts property in state type' },
    { file: 'components/scorpion/EventRateChart.tsx', message: 'Recharts dynamic import type issues (4 errors)' },
    { file: 'components/observability/withPathHighlight.tsx', message: 'focusNodeId type mismatch (null vs undefined)' },
    { file: 'components/scorpion/AgentBrainView.tsx', message: 'Element vs string type issues (4 errors)' },
    // { file: 'components/scorpion/DataTable.tsx', message: 'Unknown props type issues (3 errors)' }, // FIXED: Properly typed props access
    { file: 'components/scorpion/Modal.tsx', message: 'Function condition check issue' },
    { file: 'components/scorpion/StorageModeIndicator.tsx', message: 'Missing optimizationsActive property (2 errors)' },
    { file: 'components/scorpion/WorkflowViewer.tsx', message: 'Position type mismatch' },
  ];
  
  typescriptErrors.forEach((error, index) => {
    issues.push({
      id: `typescript-${index}`,
      type: 'typescript-error',
      priority: error.file.includes('scorpion-core') ? 'critical' : 'high',
      category: 'TypeScript',
      file: error.file,
      line: error.lines?.[0],
      message: error.message,
      status: 'open',
      lastUpdated: new Date().toISOString()
    });
  });
  
  // 3. Scan for unimplemented tools
  const unimplementedTools = [
    { name: 'Translation Tool', file: 'lib/chat/tools/user-tools/translate.ts', priority: 'high' },
    { name: 'Grammar Checker', file: 'lib/chat/tools/user-tools/grammar.ts', priority: 'high' },
    { name: 'Text Simplifier', file: 'lib/chat/tools/user-tools/simplify.ts', priority: 'medium' },
    { name: 'Presentation Generator', file: 'lib/chat/tools/user-tools/presentation.ts', priority: 'medium' },
    { name: 'Workflow Automation', file: 'lib/chat/tools/user-tools/workflow-auto.ts', priority: 'high' },
    { name: 'Video Clip Generator', file: 'lib/chat/tools/user-tools/video-clip.ts', priority: 'medium' },
    { name: 'Media Editor', file: 'lib/chat/tools/user-tools/media-editor.ts', priority: 'medium' },
    { name: 'Tutorial/Screen Recording', file: 'lib/chat/tools/user-tools/tutorial.ts', priority: 'low' },
  ];
  
  unimplementedTools.forEach((tool, index) => {
    issues.push({
      id: `tool-${index}`,
      type: 'unimplemented-tool',
      priority: tool.priority as 'critical' | 'high' | 'medium' | 'low',
      category: 'User Tools',
      file: tool.file,
      message: `${tool.name} - Not yet implemented`,
      status: 'open',
      lastUpdated: new Date().toISOString()
    });
  });
  
  // 4. Scan for TODOs (from grep results)
  const todos = [
    { file: 'app/api/storage/status/route.ts', line: 94, message: 'Investigate storage detection performance issues, add retry logic' },
    { file: 'app/api/selling/route.ts', line: 9, message: 'Connect to real database or payment provider (Stripe/PayPal)' },
    { file: 'app/api/project/knowledge/extract/route.ts', line: 23, message: 'Implement source-specific extraction' },
    { file: 'lib/telemetry/bus.ts', line: 32, message: 'Implement Redis Pub/Sub adapter' },
    { file: 'app/(scorpion)/agents/page.tsx', line: 268, message: 'Navigate to create agent page' },
    { file: 'components/observability/withPathHighlight.tsx', line: 36, message: 'Compute actual upstream/downstream path' },
  ];
  
  todos.forEach((todo, index) => {
    issues.push({
      id: `todo-${index}`,
      type: 'todo',
      priority: 'medium',
      category: 'TODO',
      file: todo.file,
      line: todo.line,
      message: todo.message,
      status: 'open',
      lastUpdated: new Date().toISOString()
    });
  });
  
  // Sort by priority: critical > high > medium > low
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  issues.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return a.file.localeCompare(b.file);
  });
  
  // Group by priority for summary
  const summary = {
    total: issues.length,
    critical: issues.filter(i => i.priority === 'critical').length,
    high: issues.filter(i => i.priority === 'high').length,
    medium: issues.filter(i => i.priority === 'medium').length,
    low: issues.filter(i => i.priority === 'low').length,
    byType: {
      'tech-debt': issues.filter(i => i.type === 'tech-debt').length,
      'missing-feature': issues.filter(i => i.type === 'missing-feature').length,
      'typescript-error': issues.filter(i => i.type === 'typescript-error').length,
      'unimplemented-tool': issues.filter(i => i.type === 'unimplemented-tool').length,
      'todo': issues.filter(i => i.type === 'todo').length,
    }
  };
  
  return createSuccessResponse({
    issues,
    summary,
    lastUpdated: new Date().toISOString()
  });
});
