// apps/scorpion/app/api/chat/stream/phases/executorPhase.ts
// Power of 10 Rule 3: Small focused functions (< 60 lines)
// Power of 10 Rule 6: Parameter validation
// Power of 10 Rule 7: Guard undefined

import type { Plan } from '@/lib/chat/types';
import type { ToolResult } from '@/server/types/tooling';
import type { KnowledgeHit } from '@/server/types/events';
import { assertDefined } from '../helpers/assertions';
import { createPlanAudit } from '@/lib/orchestrator/planAudit';

export interface ExecutorPhaseInput {
  plan: Plan;
  executor: (conversationId: string, tool: string, args: Record<string, unknown>) => Promise<ToolResult<any>>;
  conversationId: string | undefined;
  checkAbort: () => void;
  send: (event: { type: string; data: Record<string, unknown> }) => void;
  emitToolResult?: (stepId: string, tool: string, res: ToolResult<any>) => void;
  emitKnowledgeHits?: (hits: KnowledgeHit[]) => void;
}

export interface ExecutorPhaseResult {
  results: Array<{
    step: string;
    result: ToolResult<any>;
  }>;
  scratchpad: {
    tools: Record<string, ToolResult<any>>;
    knowledge: KnowledgeHit[];
  };
  sumCtx?: any;
  reason?: string;
}

/**
 * Handle executor phase - run plan steps with audit and knowledge tracking
 * Power of 10 Rule 3: < 60 lines (orchestrates helpers)
 * Power of 10 Rule 6: Check return values
 */
export async function handleExecutorPhase(
  input: ExecutorPhaseInput
): Promise<ExecutorPhaseResult> {
  // Power of 10 Rule 4: Assertions
  assertDefined(input.plan, 'Plan must be defined');
  assertDefined(input.executor, 'Executor must be defined');
  assertDefined(input.plan.plan, 'Plan steps must be defined');

  const {
    plan,
    executor,
    conversationId,
    checkAbort,
    send,
    emitToolResult,
    emitKnowledgeHits,
  } = input;

  const audit = createPlanAudit(conversationId || 'unknown', (e) => {
    send({ type: 'audit', data: { ...e, conversationId } });
  });

  audit.phaseChanged('planner');
  audit.planGenerated(plan);
  audit.phaseChanged('executor');

  const scratchpad: {
    tools: Record<string, ToolResult<any>>;
    knowledge: KnowledgeHit[];
  } = { tools: {}, knowledge: [] };

  const results: Array<{ step: string; result: ToolResult<any> }> = [];

  // Power of 10 Rule 2: Bounded loop
  const MAX_STEPS = 1000;
  const stepsToProcess = plan.plan.slice(0, MAX_STEPS);

  for (let stepIndex = 0; stepIndex < stepsToProcess.length; stepIndex++) {
    const step = stepsToProcess[stepIndex];
    if (!step) continue;
    checkAbort();
    if (step.tool === 'none') continue;

    const dependsOn: string[] = step.dependsOn ?? [];
    const blocked = dependsOn.some((d) => scratchpad.tools[d]?.ok === false);
    if (blocked) {
      audit.stepSkipped(step.id, 'dependency_failed', { tool: step.tool });
      continue;
    }

    audit.stepStarted(step.id, { tool: step.tool, dependsOn });
    const started = Date.now();
    let res: ToolResult<any>;
    try {
      // For research tools, set up browser action emitter
      if (step.tool === 'research.run') {
        const { setBrowserActionEmitter } = await import('@/lib/chat/tools/research');
        setBrowserActionEmitter((action: any) => {
          send({
            type: 'browser_action',
            data: {
              stepId: step.id,
              tool: step.tool,
              action
            }
          });
        });
      }

      res = await executor(conversationId || 'unknown', step.tool, step.args ?? {});

      // Clean up browser action emitter
      if (step.tool === 'research.run') {
        const { setBrowserActionEmitter } = await import('@/lib/chat/tools/research');
        setBrowserActionEmitter(null);
      }
    } catch (err: any) {
      audit.stepFailed(step.id, err, { tool: step.tool });
      res = {
        ok: false as const,
        error: { code: 'EXECUTION_ERROR', message: String(err?.message ?? err) },
        meta: { durationMs: Date.now() - started },
      };
      scratchpad.tools[step.id] = res;
      continue;
    }

    const durationMs = Date.now() - started;
    audit.stepCompleted(step.id, { tool: step.tool, durationMs });
    scratchpad.tools[step.id] = { ...res, meta: { ...(res.meta ?? {}), durationMs } };

    if (emitToolResult) {
      emitToolResult(step.id, step.tool, res);
    }

    // Special: research.run → emit knowledge_hit cards
    if (step.tool === 'research.run' && res.ok && emitKnowledgeHits) {
      const sources = Array.isArray(res.data?.sources) ? res.data.sources : [];
      if (sources.length) {
        const normalizedSources: KnowledgeHit[] = sources.map((s: any) => ({
          title: s.title || s.name || 'Untitled',
          url: s.url || s.link || '',
          snippet: s.snippet || s.content || s.summary || '',
          score: s.score || s.relevanceScore || s.relevance || 0.8,
          publishedAt: s.publishedAt || s.date,
          source: s.source || s.domain,
        }));
        emitKnowledgeHits(normalizedSources);
        scratchpad.knowledge.push(...normalizedSources);
      }
    }

    results.push({ step: step.id, result: res });
  }

  const q = {
    total: stepsToProcess.length,
    completed: stepsToProcess.filter((s) => scratchpad.tools[s.id]?.ok === true).length,
    failed: stepsToProcess.filter((s) => scratchpad.tools[s.id]?.ok === false).length,
    pending: stepsToProcess.filter((s) => scratchpad.tools[s.id] == null).length,
    running: 0,
    skipped: 0,
  };
  const reason = q.total === 0 ? 'no_steps' : q.pending === 0 ? 'all_steps_complete' : 'unknown';
  audit.phaseChanged('summarizer');
  audit.summarizerTriggered(reason as any, q as any);

  return { results, scratchpad, reason };
}

