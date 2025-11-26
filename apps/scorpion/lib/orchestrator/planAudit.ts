// apps/scorpion/lib/orchestrator/planAudit.ts
export type FinalizeReason =
  | 'all_steps_complete'
  | 'planner_error'
  | 'no_steps'
  | 'max_steps_reached'
  | 'timeout'
  | 'fast_summary_flag'
  | 'route_custom_prompt'
  | 'tool_forced'
  | 'dependency_failed'
  | 'unknown';

export type AuditEvent = {
  type: 'audit';
  at: number;
  conversationId: string;
  phase: 'planner' | 'executor' | 'summarizer';
  op:
    | 'plan_generated'
    | 'step_started'
    | 'step_completed'
    | 'step_failed'
    | 'step_skipped'
    | 'phase_changed'
    | 'summarizer_triggered';
  data?: Record<string, any>;
};

type EmitFn = (evt: AuditEvent) => void;

export function createPlanAudit(conversationId: string, emit: EmitFn) {
  const now = () => Date.now();

  return {
    planGenerated(plan: any) {
      emit({
        type: 'audit',
        at: now(),
        conversationId,
        phase: 'planner',
        op: 'plan_generated',
        data: {
          steps: Array.isArray(plan?.steps) ? plan.steps.map((s: any) => s.id) : [],
          totalSteps: plan?.steps?.length ?? 0,
          objective: plan?.objective ?? null,
        },
      });
    },

    stepStarted(stepId: string, meta?: any) {
      emit({
        type: 'audit',
        at: now(),
        conversationId,
        phase: 'executor',
        op: 'step_started',
        data: { stepId, tool: meta?.tool, dependsOn: meta?.dependsOn ?? [] },
      });
    },

    stepCompleted(stepId: string, meta?: any) {
      emit({
        type: 'audit',
        at: now(),
        conversationId,
        phase: 'executor',
        op: 'step_completed',
        data: { stepId, tool: meta?.tool, durationMs: meta?.durationMs },
      });
    },

    stepFailed(stepId: string, error: any, meta?: any) {
      emit({
        type: 'audit',
        at: now(),
        conversationId,
        phase: 'executor',
        op: 'step_failed',
        data: {
          stepId,
          tool: meta?.tool,
          message: String(error?.message ?? error),
          code: error?.code ?? null,
        },
      });
    },

    stepSkipped(stepId: string, reason: string, meta?: any) {
      emit({
        type: 'audit',
        at: now(),
        conversationId,
        phase: 'executor',
        op: 'step_skipped',
        data: { stepId, reason, tool: meta?.tool },
      });
    },

    phaseChanged(phase: 'planner' | 'executor' | 'summarizer') {
      emit({
        type: 'audit',
        at: now(),
        conversationId,
        phase,
        op: 'phase_changed',
      });
    },

    summarizerTriggered(reason: FinalizeReason, queueStats: {
      total: number; completed: number; running: number; failed: number; pending: number; skipped: number;
    }) {
      emit({
        type: 'audit',
        at: now(),
        conversationId,
        phase: 'summarizer',
        op: 'summarizer_triggered',
        data: { reason, queueStats },
      });
    },
  };
}

