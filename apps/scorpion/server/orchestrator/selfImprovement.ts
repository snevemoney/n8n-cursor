// apps/scorpion/server/orchestrator/selfImprovement.ts

import {
  ImprovementSignal,
  ImprovementSignalType,
  PatchReport,
  PatchSuggestion,
} from '../types/strategy';
import { randomUUID } from 'crypto';

/**
 * In-memory store placeholder. Replace with a persistent store (DB, file, etc.)
 */
const signalBuffer: ImprovementSignal[] = [];

/**
 * Log a new improvement signal.
 */
export function logImprovementSignal(input: {
  type: ImprovementSignalType;
  message: string;
  details?: any;
  tag?: string;
  missionId?: string;
  severity?: ImprovementSignal['severity'];
}): ImprovementSignal {
  const signal: ImprovementSignal = {
    id: randomUUID(),
    type: input.type,
    message: input.message,
    details: input.details,
    tag: input.tag,
    missionId: input.missionId,
    severity: input.severity ?? 2,
    timestamp: new Date().toISOString(),
  };

  signalBuffer.push(signal);
  return signal;
}

/**
 * Very simple clustering by type → category → recommendations.
 * You can refine this over time.
 */
export function analyzeSignalsIntoPatchReport(
  missionCountAnalyzed: number,
): PatchReport {
  const signals = [...signalBuffer];

  const groupedByType = signals.reduce<Record<ImprovementSignalType, ImprovementSignal[]>>(
    (acc, s) => {
      if (!acc[s.type]) acc[s.type] = [];
      acc[s.type].push(s);
      return acc;
    },
    {} as any,
  );

  const suggestions: PatchSuggestion[] = [];

  // TOOL_FAILURE → correctness or DX
  if (groupedByType.TOOL_FAILURE?.length) {
    suggestions.push({
      id: randomUUID(),
      category: 'CORRECTNESS',
      summary: 'Tool failures are occurring during missions.',
      rationale:
        'Frequent tool failures degrade trust and slow down development. They often indicate fragile contracts or missing validation.',
      recommendations: [
        'Add stricter typing and validation around tool inputs/outputs.',
        'Add retries with clear error messaging for network-dependent tools.',
        'Log failures with payload shape so they can be replayed in tests.',
      ],
      relatedSignalIds: groupedByType.TOOL_FAILURE.map((s) => s.id),
    });
  }

  // LATENCY_HIGH → performance
  if (groupedByType.LATENCY_HIGH?.length) {
    suggestions.push({
      id: randomUUID(),
      category: 'PERFORMANCE',
      summary: 'Some operations consistently exceed the latency budget.',
      rationale:
        'High latency harms the "Jarvis" feeling and encourages context breaks. It is better to fail fast with a clear message than silently hang.',
      recommendations: [
        'Align server-side timeouts with client-side UI expectations.',
        'Short-circuit long operations with partial results + next-best action.',
        'Add lightweight health checks for the slowest services.',
      ],
      relatedSignalIds: groupedByType.LATENCY_HIGH.map((s) => s.id),
    });
  }

  // MISSING_FEATURE / BROKEN_FLOW / UNWIRED_UI → UX / architecture
  const structuralSignals = [
    ...(groupedByType.MISSING_FEATURE || []),
    ...(groupedByType.BROKEN_FLOW || []),
    ...(groupedByType.UNWIRED_UI || []),
  ];

  if (structuralSignals.length) {
    suggestions.push({
      id: randomUUID(),
      category: 'UX',
      summary: 'Some flows/UI components are missing or unwired.',
      rationale:
        'Unwired features break the mental model of Scorpion as a coherent cockpit and make the system feel unfinished.',
      recommendations: [
        'Audit navigation and ensure every visible control has a working endpoint.',
        'Hide or clearly label beta/experimental UI elements.',
        'Create a small routing contract test suite for top-level pages (home, ops, agents, research).',
      ],
      relatedSignalIds: structuralSignals.map((s) => s.id),
    });
  }

  // OVERCOMPLEX_PLAN → architecture
  if (groupedByType.OVERCOMPLEX_PLAN?.length) {
    suggestions.push({
      id: randomUUID(),
      category: 'ARCHITECTURE',
      summary: 'Some plans are overly complex relative to the mission.',
      rationale:
        'Over-planning increases cognitive load and tool spam, creating tech debt and slower iteration.',
      recommendations: [
        'Enforce a default max of 3–5 steps per plan unless explicitly overridden.',
        'Add a plan simplifier step that collapses redundant steps.',
        'Prefer small, iterative missions over huge, monolithic ones.',
      ],
      relatedSignalIds: groupedByType.OVERCOMPLEX_PLAN.map((s) => s.id),
    });
  }

  // USER_CORRECTION → DX
  if (groupedByType.USER_CORRECTION?.length) {
    suggestions.push({
      id: randomUUID(),
      category: 'DX',
      summary: 'User frequently corrects Scorpion decisions or assumptions.',
      rationale:
        'Repeated corrections mean Scorpion is misaligned with Evens mental model and rules (e.g., single-user, no client/owner logic).',
      recommendations: [
        'Update the master system prompt to reflect corrected assumptions.',
        'Introduce regression tests for previously misclassified intents.',
        'Record canonical golden missions and compare new behavior to them.',
      ],
      relatedSignalIds: groupedByType.USER_CORRECTION.map((s) => s.id),
    });
  }

  const report: PatchReport = {
    generatedAt: new Date().toISOString(),
    missionCountAnalyzed,
    signalCountAnalyzed: signals.length,
    suggestions,
  };

  return report;
}

/**
 * Optional: clear signals after generating a report.
 */
export function clearImprovementSignals() {
  signalBuffer.length = 0;
}

/**
 * Get all current signals (for debugging/admin UI).
 */
export function getImprovementSignals(): ImprovementSignal[] {
  return [...signalBuffer];
}

