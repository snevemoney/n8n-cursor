import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

/**
 * Tool execution event recorded by spy
 */
export interface ToolSpyEvent {
  tool: string;
  args: any;
  startedAt: number;
  finishedAt?: number;
  ms?: number;
  ok: boolean;
  error?: string;
  resultDigest?: string;
  phase?: string;
  stepId?: string;
}

/**
 * Wraps an executeTool function to spy on all tool calls
 */
export function withToolSpy(
  executeTool: (name: string, args: any) => Promise<any>,
  onEvent: (event: ToolSpyEvent) => void
): (name: string, args: any) => Promise<any> {
  return async (name: string, args: any): Promise<any> => {
    const startedAt = Date.now();
    const event: ToolSpyEvent = {
      tool: name,
      args,
      startedAt,
      ok: false,
    };

    try {
      const result = await executeTool(name, args);
      const finishedAt = Date.now();
      event.finishedAt = finishedAt;
      event.ms = finishedAt - startedAt;
      event.ok = true;
      
      // Create digest of result
      if (typeof result === 'string') {
        event.resultDigest = result.slice(0, 200);
      } else if (result !== null && typeof result === 'object') {
        try {
          const jsonStr = JSON.stringify(result);
          event.resultDigest = jsonStr.slice(0, 200);
        } catch {
          event.resultDigest = '[non-serializable object]';
        }
      } else {
        event.resultDigest = String(result);
      }

      onEvent(event);
      return result;
    } catch (error: any) {
      const finishedAt = Date.now();
      event.finishedAt = finishedAt;
      event.ms = finishedAt - startedAt;
      event.ok = false;
      event.error = error?.message || String(error);
      onEvent(event);
      throw error;
    }
  };
}

/**
 * Tool matrix report structure
 */
export interface ToolMatrixReport {
  timestamp: string;
  nodeVersion: string;
  env: {
    ALLOW_DESTRUCTIVE_TESTS?: string;
    ALLOW_DEPLOY_TESTS?: string;
    ALLOW_LLM_EVAL?: string;
  };
  coverage: {
    totalTools: number;
    toolsAttempted: number;
    toolsSucceeded: number;
    toolsFailed: number;
    coveragePercent: number;
  };
  tools: Record<string, {
    calls: number;
    ok: number;
    failed: number;
    msTotal: number;
    avgMs: number;
    lastError?: string;
  }>;
  scenarios: Array<{
    id: string;
    label: string;
    status: 'passed' | 'failed' | 'skipped';
    plannerOk: boolean;
    forcedOk: boolean;
    toolsSeen: string[];
    notes: string[];
  }>;
  errors: Array<{
    tool: string;
    message: string;
    count: number;
  }>;
}

/**
 * Write tool matrix reports (JSON + Markdown)
 */
export function writeReports(
  report: ToolMatrixReport,
  options: { jsonPath: string; mdPath: string }
): void {
  // Ensure directories exist
  mkdirSync(dirname(options.jsonPath), { recursive: true });
  mkdirSync(dirname(options.mdPath), { recursive: true });

  // Write JSON
  writeFileSync(options.jsonPath, JSON.stringify(report, null, 2), 'utf-8');

  // Write Markdown
  const md = generateMarkdownReport(report);
  writeFileSync(options.mdPath, md, 'utf-8');
}

function generateMarkdownReport(report: ToolMatrixReport): string {
  const lines: string[] = [];

  lines.push('# Tool Matrix Test Report');
  lines.push('');
  lines.push(`**Generated:** ${report.timestamp}`);
  lines.push(`**Node Version:** ${report.nodeVersion}`);
  lines.push('');

  // Environment summary
  lines.push('## Environment');
  lines.push('');
  lines.push('| Variable | Value |');
  lines.push('|---------|-------|');
  lines.push(`| ALLOW_DESTRUCTIVE_TESTS | ${report.env.ALLOW_DESTRUCTIVE_TESTS || 'not set'} |`);
  lines.push(`| ALLOW_DEPLOY_TESTS | ${report.env.ALLOW_DEPLOY_TESTS || 'not set'} |`);
  lines.push(`| ALLOW_LLM_EVAL | ${report.env.ALLOW_LLM_EVAL || 'not set'} |`);
  lines.push('');

  // Coverage summary
  lines.push('## Coverage Summary');
  lines.push('');
  lines.push(`- **Total Tools:** ${report.coverage.totalTools}`);
  lines.push(`- **Tools Attempted:** ${report.coverage.toolsAttempted}`);
  lines.push(`- **Tools Succeeded:** ${report.coverage.toolsSucceeded}`);
  lines.push(`- **Tools Failed:** ${report.coverage.toolsFailed}`);
  lines.push(`- **Coverage:** ${report.coverage.coveragePercent.toFixed(1)}%`);
  lines.push('');

  // Tools table
  lines.push('## Tool Statistics');
  lines.push('');
  lines.push('| Tool | Calls | OK | Failed | Avg MS | Last Error |');
  lines.push('|------|-------|----|--------|--------|------------|');
  
  const sortedTools = Object.entries(report.tools).sort((a, b) => b[1].calls - a[1].calls);
  for (const [tool, stats] of sortedTools) {
    const lastError = stats.lastError ? stats.lastError.slice(0, 50) + '...' : '-';
    lines.push(`| ${tool} | ${stats.calls} | ${stats.ok} | ${stats.failed} | ${stats.avgMs.toFixed(0)} | ${lastError} |`);
  }
  lines.push('');

  // Scenario results
  lines.push('## Scenario Results');
  lines.push('');
  lines.push('| Status | ID | Label | Tools Seen | Notes |');
  lines.push('|--------|----|-------|-----------|-------|');
  
  for (const scenario of report.scenarios) {
    const statusIcon = scenario.status === 'passed' ? '✓' : scenario.status === 'failed' ? '✗' : '—';
    const toolsSeen = scenario.toolsSeen.length > 0 ? scenario.toolsSeen.join(', ') : 'none';
    const notes = scenario.notes.length > 0 ? scenario.notes.join('; ') : '-';
    lines.push(`| ${statusIcon} | ${scenario.id} | ${scenario.label} | ${toolsSeen} | ${notes} |`);
  }
  lines.push('');

  // Top errors
  if (report.errors.length > 0) {
    lines.push('## Top Errors');
    lines.push('');
    for (const error of report.errors.slice(0, 10)) {
      lines.push(`### ${error.tool} (${error.count}x)`);
      lines.push('');
      lines.push(`\`\`\``);
      lines.push(error.message);
      lines.push(`\`\`\``);
      lines.push('');
    }
  }

  return lines.join('\n');
}

