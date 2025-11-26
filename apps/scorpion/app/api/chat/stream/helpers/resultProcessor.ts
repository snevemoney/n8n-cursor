// apps/scorpion/app/api/chat/stream/helpers/resultProcessor.ts
// Phase 4.2: Result Processor - Extract result processing from processStreamStart.ts
// Power of 10 Rule 4: Focused module for result extraction and formatting

/**
 * This module centralizes all the logic that:
 * - walks execution results,
 * - extracts per-tool outputs (code.readFile, system.health, logs.tail, etc.),
 * - builds "knowledge hits", "research results", and "sources" structures
 * used later by the answer & summarizer phases.
 *
 * The implementation is extracted from processStreamStart.ts.
 */

import {
  extractKnowledgeHits as extractKnowledgeHitsHelper,
  extractResearchResults as extractResearchResultsHelper,
  formatResearchSources as formatResearchSourcesHelper
} from './ragIntegration';

export interface ProcessedResults {
  codeReadResults: Array<{
    path: string;
    content: string;
    ast?: any;
    dependencies?: string[];
    language?: string;
  }>;
  knowledgeHits: any[];
  researchResults: any[];
  researchSources: Array<{
    title: string;
    url: string;
    snippet?: string;
    score?: number;
    publishedAt?: string | null;
    source?: string | null;
  }>;
  systemHealthResults: any[];
  logsResults: any[];
  projectAnalyzeResults: any[];
  filesRecentResults: any[];
  otherToolResults: any[];
}

export interface ResultProcessorParams {
  results: any[];   // raw toolExecution results from executor phase
  plan: any;        // current plan (for correlating steps → results)
}

/**
 * Main entry point:
 *  - Walks all results from executor phase
 *  - Routes each tool result to the appropriate bucket
 *  - Returns a normalized ProcessedResults object
 *
 * This must remain PURE (no SSE, no I/O).
 *
 * Extracted from: processStreamStart.ts lines ~3003-3160
 */
export function processExecutionResults(
  params: ResultProcessorParams
): ProcessedResults {
  const { results, plan } = params;

  // PROACTIVE VALIDATION: Validate results array before processing
  if (!results || !Array.isArray(results)) {
    console.error('[Result Processor] Invalid results array:', results);
    return {
      codeReadResults: [],
      knowledgeHits: [],
      researchResults: [],
      researchSources: [],
      systemHealthResults: [],
      logsResults: [],
      projectAnalyzeResults: [],
      filesRecentResults: [],
      otherToolResults: [],
    };
  }

  // CRITICAL: Log what results we have before filtering
  console.log('[Result Processor] Total results collected:', results.length);
  console.log('[Result Processor] Results summary:', results.map(r => ({
    step: r.step,
    tool: plan.plan.find((s: any) => s && s.id === r.step)?.tool,
    ok: r.result?.ok,
    hasContent: !!r.result?.content,
    hasHits: !!r.result?.hits,
    error: r.result?.error
  })));

  // Extract code.readFile results from tool results
  const codeReadResults = results
    .filter(r => {
      if (!r || !r.step || !r.result) {
        console.warn('[Result Processor] Filtering out invalid result:', { step: r?.step, hasResult: !!r?.result });
        return false;
      }
      const step = plan.plan.find((s: any) => s && s.id === r.step);
      const isCodeRead = step?.tool === 'code.readFile';
      const isOk = r.result?.ok === true;
      if (isCodeRead && !isOk) {
        console.warn('[Result Processor] code.readFile step failed:', { step: r.step, error: r.result?.error });
      }
      return isCodeRead && isOk;
    })
    .map(r => {
      const step = plan.plan.find((s: any) => s && s.id === r.step);
      const fileResult = {
        path: step?.args?.['path'] || 'unknown',
        content: r.result?.content || '',
        ast: r.result?.ast,
        dependencies: Array.isArray(r.result?.dependencies) ? r.result.dependencies : [],
        language: r.result?.language || 'unknown'
      };
      console.log('[Result Processor] Extracted code.readFile result:', {
        path: fileResult.path,
        contentLength: fileResult.content.length,
        hasContent: fileResult.content.length > 0
      });
      return fileResult;
    });

  console.log('[Result Processor] codeReadResults count:', codeReadResults.length);
  console.log('[Result Processor] codeReadResults paths:', codeReadResults.map(f => f.path));

  // Extract knowledge hits and research results from tool results
  const knowledgeHits = extractKnowledgeHits(results);

  // Extract research.run results and their sources
  const researchResults = extractResearchResults(results, plan);

  console.log(`[Result Processor] Research extraction:`, {
    researchResultsCount: researchResults.length,
    hasResults: researchResults.length > 0,
    firstResult: researchResults[0] ? {
      ok: researchResults[0].ok,
      hasSources: !!(researchResults[0].sources && Array.isArray(researchResults[0].sources)),
      sourcesCount: researchResults[0].sources?.length || 0,
      hasTop3: !!(researchResults[0].top3 && Array.isArray(researchResults[0].top3)),
    } : null,
  });

  // Collect all research sources for summarizer context
  const researchSources = formatResearchSources(researchResults);

  console.log(`[Result Processor] Research sources extracted:`, {
    researchResultsCount: researchResults.length,
    researchSourcesCount: researchSources.length,
    hasValidSources: researchSources.length > 0,
    sampleSource: researchSources[0] ? {
      title: researchSources[0].title,
      url: researchSources[0].url,
      hasSnippet: !!researchSources[0].snippet,
    } : null,
    allResultsOk: researchResults.map(r => ({ ok: r.ok, hasSources: !!(r.sources || r.data?.sources), sourcesCount: (r.sources || r.data?.sources || []).length })),
  });

  // Extract tool results for better summarization with validation
  const systemHealthResults = results
    .filter(r => {
      if (!r || !r.step || !r.result) return false;
      const step = plan.plan.find((s: any) => s && s.id === r.step);
      return step?.tool === 'system.health' && r.result?.ok === true;
    })
    .map(r => {
      // Handle both formats: ToolResult v2 ({ ok, data, ... }) and legacy ({ ok, status, ... })
      const result = r.result;
      if (result.data && typeof result.data === 'object') {
        // ToolResult v2 format: extract data
        return { ...result.data, ok: result.ok };
      }
      // Legacy format or direct format: use result as-is
      return result;
    })
    .filter(r => r && typeof r === 'object');

  const logsResults = results
    .filter(r => {
      if (!r || !r.step || !r.result) return false;
      const step = plan.plan.find((s: any) => s && s.id === r.step);
      return step?.tool === 'logs.tail' && r.result?.ok === true;
    })
    .map(r => {
      // Handle both formats: ToolResult v2 ({ ok, data, ... }) and legacy ({ ok, logs, ... })
      const result = r.result;
      if (result.data && typeof result.data === 'object') {
        // ToolResult v2 format: extract data
        return { ...result.data, ok: result.ok };
      }
      // Legacy format or direct format: use result as-is
      return result;
    })
    .filter(r => r && typeof r === 'object');

  const projectAnalyzeResults = results
    .filter(r => {
      if (!r || !r.step || !r.result) return false;
      const step = plan.plan.find((s: any) => s && s.id === r.step);
      return step?.tool === 'project.analyze' && r.result?.ok === true;
    })
    .map(r => r.result)
    .filter(r => r && typeof r === 'object');

  // Extract files.recent results
  const filesRecentResults = results
    .filter(r => {
      if (!r || !r.step || !r.result) return false;
      const step = plan.plan.find((s: any) => s && s.id === r.step);
      return step?.tool === 'files.recent' && r.result?.ok === true && r.result?.files;
    })
    .map(r => r.result)
    .filter(r => r && typeof r === 'object' && Array.isArray(r.files));

  // Collect other tool results that don't fit the above categories
  const otherToolResults = results
    .filter(r => {
      if (!r || !r.step || !r.result) return false;
      const step = plan.plan.find((s: any) => s && s.id === r.step);
      const tool = step?.tool;
      // Exclude tools we've already extracted
      return tool &&
        tool !== 'code.readFile' &&
        tool !== 'kb.search' &&
        tool !== 'research.run' &&
        tool !== 'system.health' &&
        tool !== 'logs.tail' &&
        tool !== 'project.analyze' &&
        tool !== 'files.recent';
    })
    .map(r => r.result);

  return {
    codeReadResults,
    knowledgeHits,
    researchResults,
    researchSources,
    systemHealthResults,
    logsResults,
    projectAnalyzeResults,
    filesRecentResults,
    otherToolResults,
  };
}

/**
 * Extract knowledge hits from tool results
 *
 * Extracted from: processStreamStart.ts line ~3038
 *
 * @param results - Tool execution results
 * @returns Array of knowledge hits
 */
function extractKnowledgeHits(results: any[]): any[] {
  return extractKnowledgeHitsHelper(results);
}

/**
 * Extract research.run results from tool results
 *
 * Extracted from: processStreamStart.ts line ~3041
 *
 * @param results - Tool execution results
 * @param plan - Current plan
 * @returns Array of research results
 */
function extractResearchResults(results: any[], plan: any): any[] {
  return extractResearchResultsHelper(results, plan);
}

/**
 * Format research sources from research results
 *
 * Extracted from: processStreamStart.ts line ~3056
 *
 * @param researchResults - Research results from extractResearchResults
 * @returns Array of formatted research sources
 */
function formatResearchSources(researchResults: any[]): Array<{ title: string; url: string; snippet?: string; score?: number; publishedAt?: string | null; source?: string | null }> {
  return formatResearchSourcesHelper(researchResults);
}
