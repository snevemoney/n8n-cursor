/**
 * System Preflight Check API
 * Validates system readiness before planning/execution
 * Caches results in Redis (if available) for performance
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkPlannerPreflight } from '@scorpion/core';

export interface PreflightResult {
  planner: {
    ready: boolean;
    provider: 'ollama' | 'openai' | 'none';
    model?: string;
    errors: string[];
    warnings: string[];
  };
  services: {
    ollama: { reachable: boolean; error?: string };
    openai: { configured: boolean };
    tavily: { configured: boolean };
    brave: { configured: boolean };
    serpapi: { configured: boolean };
    n8n: { configured: boolean; reachable?: boolean };
  };
  overall: {
    ready: boolean;
    blockingIssues: string[];
    warnings: string[];
  };
  timestamp: string;
}

/**
 * Check service reachability
 */
async function checkServiceReachability(name: string, url: string, timeout: number = 3000): Promise<{ reachable: boolean; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return { reachable: response.ok };
  } catch (error: any) {
    return { 
      reachable: false, 
      error: error.name === 'AbortError' ? 'Timeout' : error.message 
    };
  }
}

/**
 * GET /api/system/preflight
 * Run preflight checks
 */
export async function GET(req: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Check planner readiness
    const plannerPreflight = await checkPlannerPreflight();
    
    // Check services
    const ollamaUrl = process.env['OLLAMA_URL'] || 'http://localhost:11434';
    const ollamaReachability = await checkServiceReachability('Ollama', `${ollamaUrl}/api/tags`);
    
    const openaiConfigured = !!(process.env['OPENAI_API_KEY'] && process.env['OPENAI_API_KEY'].trim().length > 0);
    
    const tavilyConfigured = !!(process.env['TAVILY_API_KEY'] && process.env['TAVILY_API_KEY'].trim().length > 0);
    const braveConfigured = !!(process.env['BRAVE_API_KEY'] && process.env['BRAVE_API_KEY'].trim().length > 0);
    const serpapiConfigured = !!(process.env['SERPAPI_KEY'] && process.env['SERPAPI_KEY'].trim().length > 0);
    
    // Check n8n
    let n8nConfigured = false;
    let n8nReachable: boolean | undefined;
    try {
      const n8nUrl = process.env['N8N_API_URL'] || process.env['N8N_BASE_URL']?.replace('/webhook', '') || 'http://localhost:5678';
      n8nConfigured = !!(process.env['N8N_API_KEY'] || process.env['N8N_BASE_URL']);
      if (n8nConfigured) {
        const n8nReachability = await checkServiceReachability('n8n', `${n8nUrl}/healthz`);
        n8nReachable = n8nReachability.reachable;
      }
    } catch (e) {
      // n8n check failed, but not blocking
    }
    
    // Compile overall status
    const blockingIssues: string[] = [];
    const warnings: string[] = [];
    
    if (!plannerPreflight.ready) {
      blockingIssues.push(...plannerPreflight.errors);
    }
    warnings.push(...plannerPreflight.warnings);
    
    if (!ollamaReachability.reachable && !openaiConfigured) {
      blockingIssues.push('No LLM provider available (Ollama unreachable and OpenAI not configured)');
    }
    
    if (!tavilyConfigured && !braveConfigured && !serpapiConfigured) {
      warnings.push('No search providers configured - research.run will have limited functionality');
    }
    
    const result: PreflightResult = {
      planner: plannerPreflight,
      services: {
        ollama: ollamaReachability,
        openai: { configured: openaiConfigured },
        tavily: { configured: tavilyConfigured },
        brave: { configured: braveConfigured },
        serpapi: { configured: serpapiConfigured },
        n8n: { configured: n8nConfigured, reachable: n8nReachable },
      },
      overall: {
        ready: blockingIssues.length === 0,
        blockingIssues,
        warnings,
      },
      timestamp: new Date().toISOString(),
    };
    
    const duration = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      data: result,
      duration,
    });
  } catch (error: any) {
    console.error('[Preflight] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Preflight check failed',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

