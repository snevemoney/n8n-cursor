import { NextRequest } from 'next/server';
// Initialize orchestrator tools on module load
import '@/lib/orchestrator';
import { v4 as uuidv4 } from 'uuid';
import { emitEvent } from '@/lib/events/event-bus';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { runModelUnified, parseModelJSON } from '@/lib/chat/modelRunner';
import { computeConsensus } from '@/lib/chat/council';
import { runCouncilDeliberationStreamingLegacy } from '@/server/orchestrator/council/legacy';
import { executeTool, detectUserTool, getUserToolBySlashCommand, isUserTool, tools, userTools, listTools } from '@/lib/chat/tools';
import { remember } from '@/lib/chat/memory';
import { createSSEMessage } from '@/lib/chat/events';
import type { Message, Plan, PlanStep, ScorpionIntent } from '@/lib/chat/types';
import { detectLightweightMode } from '@/lib/utils/systemResources';
import { getRecommendedModelForRAM } from '@/lib/utils/modelSelector';
import { classifyIntent, getToolsForIntent, isToolAllowedForIntent, shouldUseKnowledgeBase } from '@/lib/chat/intent';
import { getHelperConfig, getHelperDefaults } from '@/lib/chat/helper-config';
import { shouldSelfCorrect, getAllowedSelfCorrectionTools, isToolSafeForSelfCorrection, type SelfCorrectionContext } from '@/lib/chat/self-correction';
import { getSummarizerPrompt } from '@/lib/chat/summarizer-config';
import { parsePlannerResponse, enforcePlanRules, createFallbackPlan } from '@/lib/chat/planner-enforcement';
import { ScorpionOrchestrator, runPrompt, runPromptWithKillSwitch, SafetyGuardSchema, ToolRouterSchema, BudgetGovernorSchema, DispatcherSchema, RagRetrieverSchema, StyleEnforcerSchema, MemoryManagerSchema, FileInspectorSchema, ExecutorStepSchema, KnowledgeIngestSchema, OntologyLinkerSchema, DataframeAnalystSchema } from '@scorpion/core';
import { createPlanAudit } from '@/lib/orchestrator/planAudit';
import { makeExecutor } from '@/server/orchestrator/executor';
import { buildSummarizerContext } from '@/server/orchestrator/summarizer';
import type { ToolResult } from '@/server/types/tooling';
import { createProtocolFromContext } from '@/server/orchestrator/protocol';
import type { KnowledgeHit } from '@/server/types/events';
import { handleScorpionStrategy, createContextSnapshot } from '@/server/orchestrator/strategyHandler';
import { MissionPhase } from '@/server/types/strategy';
import { logImprovementSignal } from '@/server/orchestrator/selfImprovement';
import { extractDomainTags } from '@/server/council';
import { runCouncilLegacy } from '@/server/orchestrator/council/legacy';
import { runScorpionBrain } from '@/server/orchestrator';
import type { CouncilResult } from '@/server/types/council';
// Runtime layer integration
import { createChatJob, logJobPhase, updateJobWithPhaseResult, completeChatJob, failChatJob } from '@/server/runtime/chatIntegration';
import {
  handleRequestPhase,
  handlePlannerPhase,
  handleCouncilPhase,
  handleExecutorPhase,
  handleSummarizerPhase,
  sendInitialConnectionEvent,
  setupAbortListener,
  type StreamState,
} from './phases';
import { createSafeSend, createCheckAbort } from './helpers/streamHelpers';
import { analyzeConversationHistory } from './helpers/historyAnalysis';
import { generateToolsList, addQuestionTypeHints } from './helpers/promptBuilder';
import { createToolRegistry } from './helpers/toolRegistry';
import { applyPlanEnforcement } from './helpers/planEnforcement';
import { streamFinalAnswer } from './helpers/deltaStreaming';
import { serializeProtocol } from './helpers/protocolSerialization';
import { fallbackRoute } from './helpers/toolRouter';
import { emitToolResult, emitKnowledgeHits, createExecutorEventEmitter } from './helpers/eventEmitters';
import { assertDefined, assertArray, assertString } from './helpers/assertions';
// Configuration imports
import { getCachedResponse } from './config/promptConfig';

// CHECK 1: Runtime configuration - CRITICAL for external HTTP calls
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// CHECK 2: API keys verification (log at startup, mask secrets)
function logApiKeysStatus() {
  const keys = {
    TAVILY_API_KEY: !!process.env['TAVILY_API_KEY'],
    NEWS_API_KEY: !!process.env['NEWS_API_KEY'],
    SERPAPI_KEY: !!process.env['SERPAPI_KEY'],
  };
  console.log('[Chat Stream] [CHECK 2] API Keys Status:', keys);
  if (!keys.TAVILY_API_KEY && !keys.NEWS_API_KEY && !keys.SERPAPI_KEY) {
    console.warn('[Chat Stream] ⚠️ No research API keys found. Research may fail.');
  }
}

// Log API keys status once at module load
logApiKeysStatus();

/**
 * POST /api/chat/stream
 * 
 * Main Chat-AGI orchestrator with SSE streaming
 * Phases: PLANNER → COUNCIL → EXECUTOR → SUMMARIZER
 */
// Power of 10 Rule 4: Extract large function to separate file
// Import from separate file to reduce file size and fix TypeScript parser limitations
import { processStreamStart } from './processStreamStart';

// Power of 10 Rule 4: Keep POST function small and focused
export async function POST(req: NextRequest) {
  console.log('[API] POST /api/chat/stream called', {
    timestamp: Date.now(),
    url: req.url,
    method: req.method
  });
  
  try {
    // Parse and validate request
    let requestData;
    try {
      requestData = await req.json();
      console.log('[API] Request data parsed', {
        hasConversationId: !!requestData?.conversationId,
        messagesCount: requestData?.messages?.length || 0,
        provider: requestData?.provider,
        model: requestData?.model
      });
    } catch (error: any) {
      console.error('[API] Failed to parse request JSON', error);
      return new Response(
        JSON.stringify({ error: `Invalid request: ${error.message}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate request structure
    if (!requestData || typeof requestData !== 'object') {
      return new Response(
        JSON.stringify({ error: 'Invalid request: request body must be a JSON object' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const { conversationId, messages, mode, tools: requestedTools, provider, model, clientMode } = requestData;
    
    // Validate optional fields
    if (conversationId !== undefined && typeof conversationId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid request: conversationId must be a string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (mode !== undefined && typeof mode !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid request: mode must be a string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (provider !== undefined && typeof provider !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid request: provider must be a string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (model !== undefined && typeof model !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid request: model must be a string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Create readable stream and delegate to processStreamStart
    const stream = new ReadableStream({
      async start(controller) {
        try {
        await processStreamStart(
          controller,
          req,
          conversationId,
          messages,
          mode,
          requestedTools,
          provider,
          model,
          clientMode
        );
        } catch (error: any) {
          console.error('[Chat Stream] Unhandled error in stream start:', error);
          // Try to send error and close gracefully
          try {
            const encoder = new TextEncoder();
            const errorEvent = {
              type: 'error',
              data: {
                message: `Stream error: ${error?.message || 'Unknown error'}`,
                phase: 'error',
              },
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`));
            const doneEvent = { type: 'done', data: {} };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(doneEvent)}\n\n`));
          } catch (sendError) {
            console.error('[Chat Stream] Failed to send error event:', sendError);
          } finally {
            try {
              controller.close();
            } catch (closeError) {
              // Ignore close errors
            }
          }
        }
      },
      cancel() {
        console.log('[Chat Stream] Stream cancelled by client');
      },
    });
    
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('[Chat Stream] Fatal error in POST handler:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

