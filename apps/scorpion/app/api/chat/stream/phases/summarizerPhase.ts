// apps/scorpion/app/api/chat/stream/phases/summarizerPhase.ts
// Power of 10 Rule 3: Small focused functions (< 60 lines)
// Power of 10 Rule 6: Parameter validation

import type { Plan } from '@/lib/chat/types';
import { assertDefined } from '../helpers/assertions';

export interface SummarizerPhaseInput {
  plan: Plan;
  userMessage: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  results: Array<{ step: string; result: unknown }>;
  consensus: {
    approved: boolean;
    score: number;
    summary: string;
    issues?: unknown[];
  };
  orchestrator: {
    runSummarizer: (
      plan: Plan,
      consensus: unknown,
      results: unknown[],
      userMessage: string,
      history: unknown[],
      send: (event: { type: string; data: Record<string, unknown> }) => void,
      checkAbort: () => void,
      context?: string
    ) => Promise<string>;
  };
  send: (event: { type: string; data: Record<string, unknown> }) => void;
  checkAbort: () => void;
  summaryContext?: string;
}

export interface SummarizerPhaseResult {
  summary: string;
  sanitizedSummary: string;
}

/**
 * Handle summarizer phase with timeout and fallback
 * Power of 10 Rule 3: < 60 lines
 * Power of 10 Rule 6: Check return values
 */
export async function handleSummarizerPhase(
  input: SummarizerPhaseInput
): Promise<SummarizerPhaseResult> {
  // Power of 10 Rule 4: Assertions
  assertDefined(input.plan, 'Plan must be defined');
  assertDefined(input.orchestrator, 'Orchestrator must be defined');
  assertDefined(input.orchestrator.runSummarizer, 'runSummarizer must be defined');

  const {
    plan,
    userMessage,
    conversationHistory,
    results,
    consensus,
    orchestrator,
    send,
    checkAbort,
    summaryContext,
  } = input;

  // Power of 10 Rule 7: Guard timeout - Use dynamic timeout based on request type
  const isToolTestingRequest = /(test.*all.*tool|test.*your.*tool|test.*every.*tool|test.*each.*tool|verify.*all.*tool|check.*all.*tool)/i.test(userMessage);
  const timeoutDuration = isToolTestingRequest ? 180_000 : 80_000; // 180s for tool testing, 80s for normal
  const summarizerTimeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Summarizer timeout after ${timeoutDuration / 1000}s`)), timeoutDuration);
  });

  let summary: string;
  try {
    // Power of 10 Rule 7: Guard abort - check before calling summarizer
    checkAbort(); // This will throw if aborted
    
    const summarizerPromise = orchestrator.runSummarizer(
      plan,
      consensus,
      results,
      userMessage,
      conversationHistory,
      send,
      checkAbort,
      summaryContext
    );
    
    summary = await Promise.race([summarizerPromise, summarizerTimeout]);
  } catch (raceError: unknown) {
    const error = raceError as { message?: string };
    // Power of 10 Rule 7: Guard race error - handle timeout or abort gracefully
    try {
      checkAbort(); // Check if aborted
    } catch {
      // Stream was aborted
      console.warn('[Chat Stream] Stream aborted during summarizer execution, using fallback');
      summary = 'I apologize, but the connection was interrupted. Please try again.';
      return { summary, sanitizedSummary: summary };
    }
    
    if (error?.message?.includes('timeout')) {
      console.warn('[Chat Stream] Summarizer timeout, using fallback');
      summary = 'I apologize, but generating the response took too long. Please try again with a simpler question.';
    } else {
      console.warn('[Chat Stream] Summarizer error, using fallback:', error?.message);
      summary = 'I apologize, but I was unable to generate a response. Please try again.';
    }
  }
  
  // PROACTIVE VALIDATION: Ensure summary is valid
  if (!summary || typeof summary !== 'string') {
    console.error('[Chat Stream] Invalid summary from model:', summary);
    summary = 'I apologize, but I encountered an error generating a response. Please try again.';
  }
  
  if (summary.trim().length === 0) {
    console.warn('[Chat Stream] Empty summary from model');
    summary = 'I was unable to generate a response. Please try rephrasing your question.';
  }

  // Sanitize summary (remove permission-related messages, etc.)
  let sanitizedSummary = summary;
  const permissionPatterns = [
    /Error logs are not available in client mode/i,
    /not available for public viewing/i,
    /please contact support/i,
    /you don't have (permission|access)/i,
    /not authorized/i,
    /access denied/i,
  ];

  // Power of 10 Rule 2: Bounded loop
  const MAX_PATTERNS = 100;
  const patternsToCheck = permissionPatterns.slice(0, MAX_PATTERNS);
  for (let i = 0; i < patternsToCheck.length; i++) {
    const pattern = patternsToCheck[i];
    if (!pattern) continue;
    if (pattern.test(sanitizedSummary)) {
      sanitizedSummary = sanitizedSummary.replace(
        pattern,
        'I tried to fetch the information but encountered a technical error (e.g., timeout, service unavailable, or missing resource). Check the terminal output or server logs for details.'
      );
    }
  }

  // Power of 10 Rule 7: Guard empty summary
  if (!sanitizedSummary || sanitizedSummary.trim().length === 0) {
    sanitizedSummary = 'I apologize, but I was unable to generate a response. Please try again.';
  }

  return { summary, sanitizedSummary };
}

