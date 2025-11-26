// apps/scorpion/app/api/chat/stream/helpers/toolRegistry.ts
// Power of 10 Rule 3: Small focused functions (< 60 lines)
// Power of 10 Rule 2: All loops have fixed upper bounds
// Power of 10 Rule 6: Check return values

import { executeTool } from '@/lib/chat/tools';
import type { ToolResult } from '@/server/types/tooling';

/**
 * Create tool registry from available tools
 * Power of 10 Rule 3: < 60 lines
 * Power of 10 Rule 2: Bounded loop
 */
export function createToolRegistry(
  tools: Record<string, unknown>
): Record<string, (args: any) => Promise<ToolResult<any>>> {
  const toolRegistry: Record<string, (args: any) => Promise<ToolResult<any>>> = {};
  
  // Power of 10 Rule 2: Bounded loop
  const toolEntries = Object.entries(tools);
  const MAX_TOOLS = 1000;
  const toolsToRegister = toolEntries.slice(0, MAX_TOOLS);
  
  for (let i = 0; i < toolsToRegister.length; i++) {
    const [toolName, toolSpec] = toolsToRegister[i];
    if (!toolName || !toolSpec) continue;
    
    toolRegistry[toolName] = async (invokeArgs: any) => {
      try {
        const result = await executeTool(toolName, invokeArgs.args || {});
        
        // Convert to ToolResult format
        if (result.ok === false || result.error) {
          const errorObj = typeof result.error === 'string'
            ? { code: 'TOOL_ERROR', message: result.error }
            : (result.error?.code ? result.error : { code: 'TOOL_ERROR', message: String(result.error) });
          
          return {
            ok: false as const,
            error: errorObj,
            meta: result.meta || { took_ms: result.latency || 0 },
          };
        }
        
        // Special handling for research.run - ensure sources are accessible
        if (toolName === 'research.run') {
          const sources = result.sources || result.data?.sources || result.top3 || [];
          const normalizedSources = Array.isArray(sources) ? sources.map((s: any) => ({
            title: s.title || s.name || 'Untitled',
            url: s.url || s.link || '',
            snippet: s.snippet || s.excerpt || s.content || '',
            score: s.score || s.relevance || s.relevanceScore || 0.8,
            publishedAt: s.publishedAt || s.date || null,
            source: s.source || s.domain || null,
          })) : [];
          
          return {
            ok: true as const,
            data: {
              provider: result.provider || 'custom',
              sources: normalizedSources,
              summary: result.summary || result.message || 'Research completed',
              query: result.query || '',
              top3: normalizedSources.slice(0, 3),
            },
            sources: normalizedSources,
            top3: normalizedSources.slice(0, 3),
            summary: result.summary || result.message || 'Research completed',
            query: result.query || '',
            meta: result.meta || { took_ms: result.latency || 0 },
          };
        }
        
        return {
          ok: true as const,
          data: result.data || result.content || result.hits || result,
          meta: result.meta || { took_ms: result.latency || 0 },
        };
      } catch (err: any) {
        return {
          ok: false as const,
          error: {
            code: err?.name || 'RUNTIME_ERROR',
            message: err?.message || String(err),
            details: err?.stack,
          },
          meta: { took_ms: 0 },
        };
      }
    };
  }
  
  return toolRegistry;
}

