// Power of 10 Rule 4: Extract large function to separate file
// This reduces file size and fixes TypeScript parser limitations
// File: processStreamStart.ts
// Original location: route.ts lines 156-5984
//
// ARCHITECTURE DOCUMENTATION:
// - High-level system architecture: apps/scorpion/ARCHITECTURE.md
// - Refactoring phases 1-3 complete: apps/scorpion/PHASE_1_2_3_REFACTORING_REPORT.md
// - Chat pipeline deep dive: apps/scorpion/CHAT_PIPELINE_ARCHITECTURE.md
// - Current refactoring status: apps/scorpion/REFACTORING_STATUS.md

import { NextRequest } from 'next/server';
import type { ReadableStreamDefaultController } from 'stream/web';
import type { Message, ScorpionIntent } from '@/lib/chat/types';
import type { ToolResult } from '@/server/types/tooling';
import type { KnowledgeHit } from '@/server/types/events';
import { v4 as uuidv4 } from 'uuid';
import { runModelUnified } from '@/lib/chat/modelRunner';
import { classifyIntent } from '@/lib/chat/intent';
import { detectLightweightMode } from '@/lib/utils/systemResources';

// Import all helper functions and utilities
import { buildStreamContext } from './helpers/streamContext';
import { handleStreamError } from './helpers/streamErrorHandler';
import { validateRequest } from './helpers/requestValidation';
import { tryHandleIdentityIntent } from './handlers/identityHandler';
import { tryHandleSmallTalk } from './handlers/smallTalkHandler';
import { detectMlQueryIntent, tryHandleMlQueryIntent } from './handlers/mlQueryHandler';
// handleUserTool is defined inline below
import { createOrchestrator } from './helpers/orchestratorSetup';
import {
  emitToolResult,
  emitKnowledgeHits,
  createExecutorEventEmitter,
} from './helpers/eventEmitters';
import {
  createToolRegistry,
} from './helpers/toolRegistry';
import {
  createChatJob,
  completeChatJob,
  logJobPhase,
  updateJobWithPhaseResult,
} from '@/server/runtime/chatIntegration';
import {
  makeExecutor,
} from '@/server/orchestrator/executor';
// handleExecutorPhase and buildSummarizerContext are handled via planExecutor helper
import {
  tools,
  userTools,
  detectUserTool,
} from '@/lib/chat/tools';
import { streamFinalAnswer } from './helpers/deltaStreaming';
import { getCachedResponse } from './helpers/responseCache';
import { performEarlyRagSearch, prioritizeKnowledgeHits } from './helpers/ragIntegration';
import { processExecutionResults } from './helpers/resultProcessor';
import { buildSummarizerContext } from './helpers/summarizerContext';
import {
  runPromptWithKillSwitch,
  SafetyGuardSchema,
  ToolRouterSchema,
  BudgetGovernorSchema,
  DispatcherSchema,
  StyleEnforcerSchema,
  MemoryManagerSchema
} from '@scorpion/core';
import { executeTool } from '@/lib/chat/tools';
import { emitEvent } from '@/lib/events/event-bus';
import { getHelperConfig } from '@/lib/chat/helper-config'; // Still needed for POST-FLIGHT checks
import { shouldSelfCorrect, isToolSafeForSelfCorrection, type SelfCorrectionContext } from '@/lib/chat/self-correction';
import { getSummarizerPrompt } from '@/lib/chat/summarizer-config';
import { analyzeConversationHistory } from './helpers/historyAnalysis';
import { isToolAllowedForIntent, shouldUseKnowledgeBase } from '@/lib/chat/intent';
// parsePlannerResponse, enforcePlanRules, createFallbackPlan don't exist - using enforcePlan instead
import { applyPlanEnforcement } from './helpers/planEnforcement';
import { validateAndNormalizePlan } from './helpers/planValidator';
import { handleSummarizerPhase } from './phases/summarizerPhase';
import { handlePlannerPhase } from './phases/plannerPhase';
import type { Plan, PlanStep } from '@/lib/chat/types';
import type { CouncilResult } from '@/server/types/council';
import { handleCouncilPhase } from './phases/councilPhase';
import { createContextSnapshot } from '@/server/orchestrator/strategyHandler';
import { MissionPhase } from '@/server/types/strategy';
import { runScorpionBrain } from '@/server/orchestrator';
import { extractDomainTags } from '@/server/council';
import { logImprovementSignal } from '@/server/orchestrator/selfImprovement';
import { remember } from '@/lib/chat/memory';
import { serializeProtocol } from './helpers/protocolSerialization';
import { fallbackRoute } from './helpers/toolRouter';
import { learnFromInteraction, enhancePlanWithPatterns, determineExecutionSuccess } from './helpers/patternLearningHelpers';
import { runPreflightChecks } from './preflightChecks';

// Configuration imports
import {
  QUERY_PATTERNS,
  LIMITS,
  DEFAULT_USER_ID,
  DEFAULT_CLIENT_MODE,
  RISK_MODES,
  FEATURE_FLAGS,
  getModelConfig,
} from './config/pipelineConfig';
import {
  shouldEnableSafetyGuard,
  shouldEnableToolRouter,
  shouldEnableBudgetGovernor,
  shouldEnableDispatcher,
  TOOL_ROUTER_RETRY_CONFIG,
  HELPER_CONTEXT_LIMITS,
  getRequiredToolsForIntent,
  getToolRoutingRationale,
  logHelperStatus,
  logHelperConfigSummary,
} from './config/helperOrchestrationConfig';

// Core pipeline imports
import type { IngestedRequest, QueryClassification, RouteResult, HelperOrchestratorInput, HelperOrchestratorResult } from './core/types';
import { ingestAndClassifyRequest, classifyQueryType } from './core/requestIngestion';
import { routeRequest } from './core/intentRouter';

// Orchestration imports
import { orchestrateHelpers } from './orchestration/helperOrchestrator';

/**
 * Main stream processing handler
 * Extracted from route.ts to reduce file size and fix TypeScript parser issues
 */
export async function processStreamStart(
  controller: ReadableStreamDefaultController<Uint8Array>,
  req: NextRequest,
  conversationId: string | undefined,
  messages: Message[],
  _mode: string | undefined,
  _requestedTools: string[] | undefined,
  provider: string | undefined,
  model: string | undefined,
  _clientMode: string | undefined
): Promise<void> {
  // Power of 10 Rule 3: Extract stream initialization to focused function
  const streamContext = buildStreamContext(controller, req, conversationId);
  if (!streamContext) {
    return; // Stream initialization failed, already closed
  }

  const { streamState, send, checkAbort } = streamContext;

  // Declare chatJob in outer scope so it's accessible in error handler
  let chatJob: ReturnType<typeof createChatJob> | null = null;

  // Wrap main processing in try-catch
  try {
    // Power of 10 Rule 3: Use helper functions for event emitters
    // Power of 10 Rule 5: Minimize variable scope - create wrappers with closure
    const emitToolResultWrapper = (stepId: string, tool: string, res: ToolResult<any>) => {
      emitToolResult(stepId, tool, res, conversationId, send);
    };

    const emitKnowledgeHitsWrapper = (hits: KnowledgeHit[]) => {
      emitKnowledgeHits(hits, conversationId, send);
    };

    // Power of 10 Rule 3: Use helper function for tool registry creation
    const toolRegistry = createToolRegistry(tools);

    // Create executor with event emitter - Power of 10 Rule 3: Extract to helper
    const emitExecutorEvent = createExecutorEventEmitter(conversationId, send, emitToolResultWrapper);

    const executor = makeExecutor(toolRegistry, emitExecutorEvent);
    console.log('[Executor System] Executor created:', {
      system: 'NEW (makeExecutor)',
      toolsCount: Object.keys(toolRegistry).length,
      hasEventEmitter: !!emitExecutorEvent,
    });

    // Validation and main processing
    checkAbort();
    send({ type: 'connected', data: { message: 'Chat stream connected' } });

    // ========================================================================
    // REQUEST INGESTION: Validate, extract, and classify request
    // ========================================================================
    const ingestedRequest = await ingestAndClassifyRequest(
      messages,
      conversationId,
      send,
      controller,
      provider,
      model
    );

    if (!ingestedRequest) {
      return; // Validation failed, error already sent
    }

    // Extract ingested data for easier access
    const {
      userMessage,
      messageId,
      filteredHistory,
      conversationHistory,
      userId,
      lightweightMode,
    } = ingestedRequest;
    // Intent needs to be mutable as it may be refined by planner phase
    let intent = ingestedRequest.intent;

    // Compute query classification flags (used throughout pipeline)
    const queryClassification = classifyQueryType(ingestedRequest);
    const {
      isCodebaseQuestion: isCodebaseQuestionCheck,
      isOperationalQuestion,
      isWorkflowQuestion,
      isAnalysisQuestion,
      isFileQuery,
    } = queryClassification;

    // ========================================================================
    // EARLY ML QUERY DETECTION: Check for ML-related questions before routing
    // ========================================================================
    const mlIntent = detectMlQueryIntent(userMessage);
    if (mlIntent) {
      console.log(`[Chat Stream] ML query intent detected: ${mlIntent}`);
      const mlHandled = await tryHandleMlQueryIntent({
        intent: mlIntent,
        userMessage,
        send,
        streamState,
        controller,
        messageId,
      });
      if (mlHandled) {
        return; // ML query handled, stream closed
      }
    }

    // ========================================================================
    // ROUTING DECISION: Determine which execution path to take
    // ========================================================================
    const routeResult = await routeRequest(ingestedRequest);

    // Handle transformer orchestrator route
    if (routeResult.type === 'transformer') {
      const { runTransformerOrchestration } = await import('@/lib/transformer/chat-integration');
      console.log('[Chat Stream] Using Transformer Orchestrator');
      send({
        type: 'status',
        data: { message: 'Using transformer architecture...', phase: 'transformer' }
      });

      try {
        const transformerResult = await runTransformerOrchestration(
          userMessage,
          conversationHistory,
          {
            riskMode: lightweightMode ? 'safe' : 'balanced',
            userId,
            debug: process.env.TRANSFORMER_DEBUG === 'true',
            send, // Pass send callback for streaming
          }
        );

        // Stream the reply in chunks (for SSE compatibility)
        const reply = transformerResult.reply || 'I processed your request but did not generate a response. Please try again.';
        console.log('[Chat Stream] Transformer reply length:', reply.length, 'preview:', reply.substring(0, 100));

        if (reply.trim()) {
          // Use delta format for compatibility with existing client
          const words = reply.split(' ');
          const chunkSize = 10; // Send 10 words at a time
          for (let i = 0; i < words.length; i += chunkSize) {
            const chunk = words.slice(i, i + chunkSize).join(' ') + (i + chunkSize < words.length ? ' ' : '');
            send({ type: 'delta', data: { content: chunk } });
          }
        } else {
          // Fallback if reply is empty
          send({ type: 'delta', data: { content: 'I processed your request. ' } });
        }

        // Send debug info if available
        if (transformerResult.debug && process.env.TRANSFORMER_DEBUG === 'true') {
          send({ type: 'debug', data: transformerResult.debug });
        }

        // Send final message
        send({ type: 'done', data: { messageId: conversationId || 'unknown' } });

        return; // Exit early, transformer orchestrator handled everything
      } catch (error: any) {
        console.error('[Chat Stream] Transformer orchestrator failed:', error);
        console.error('[Chat Stream] Error stack:', error.stack);

        // Send error notification but don't close stream - fall through to legacy path
        try {
          send({
            type: 'status',
            data: { message: 'Transformer orchestrator unavailable, using standard mode...', phase: 'fallback' }
          });
        } catch (sendError) {
          // If send fails, stream might be closed - that's okay, we'll fall through
          console.warn('[Chat Stream] Could not send fallback message:', sendError);
        }

        // Fall through to legacy path - don't return, let normal flow continue
      }
    }

    // Create Job for this chat request (runtime layer tracking)
    try {
      chatJob = createChatJob(conversationId || 'unknown', userMessage, messages);
      logJobPhase(chatJob.id, 'system', 'Chat request received', { conversationId, messageLength: userMessage.length });
    } catch (error) {
      console.warn('[Chat Stream] Failed to create job:', error);
      // Continue without job tracking if it fails
    }

    // ========================================================================
    // SHORT-CIRCUIT ROUTES: Handle direct responses without full pipeline
    // ========================================================================
    if (routeResult.type === 'short-circuit') {
      switch (routeResult.handler) {
        case 'identity': {
          console.log('[Chat Stream] Identity intent detected - using direct answer path (no tools, no planner)');
          send({
            type: 'status',
            data: { message: 'Answering as Scorpion...', phase: 'identity' }
          });

          const handled = await tryHandleIdentityIntent({
            userMessage,
            conversationId,
            model,
            provider,
            send,
            streamState,
            controller,
            messageId,
          });
          if (handled) {
            return; // Identity intent handled, stream closed
          }
          break;
        }

        case 'small_talk': {
          console.log('[Chat Stream] Small talk intent detected - using direct conversational response (no tools, no planner)');
          send({
            type: 'status',
            data: { message: 'Responding...', phase: 'small_talk' }
          });

          const handled = await tryHandleSmallTalk({
            userMessage,
            conversationHistory,
            model,
            provider,
            send,
            streamState,
            controller,
            messageId,
          });
          if (handled) {
            return; // Small talk handled, stream closed
          }
          break;
        }

        case 'user_tool': {
          // Extract detected tool from route result
          const detectedTool = routeResult.detectedTool;
          if (!detectedTool) {
            console.error('[Chat Stream] user_tool route without detectedTool');
            break; // Fall through to standard pipeline
          }
      // PROACTIVE VALIDATION: Validate detectedTool structure before destructuring
      if (!detectedTool || typeof detectedTool !== 'object' || !detectedTool.tool) {
        console.error('[Chat Stream] Invalid detectedTool structure:', detectedTool);
        send({
          type: 'error',
          data: {
            message: 'Invalid tool detection result',
            phase: 'validation',
          },
        });
        controller.close();
        return;
      }

      // Check if this is a regular user tool (not AI-callable)
      if (!detectedTool.isAiTool) {
        const { tool: userTool, argsText } = detectedTool;

        // PROACTIVE VALIDATION: Validate userTool properties before use
        if (!userTool || typeof userTool !== 'object') {
          console.error('[Chat Stream] Invalid userTool:', userTool);
        send({
          type: 'error',
          data: {
            message: 'Invalid tool configuration',
            phase: 'validation',
          },
        });
        controller.close();
        return;
      }

      const toolName = userTool.name || 'unknown';
      const toolLabel = userTool.label || toolName;

      // This is a user tool - execute directly without planner
      console.log('[Chat Stream] User tool detected:', toolName);

      send({ type: 'status', data: { message: `Executing ${toolLabel}...`, phase: 'executing' } });
      send({ type: 'progress', data: { phase: 'executing', progress: 10, message: `Executing ${toolLabel}...` } });

      let toolArgs: any = {};

      // Try to parse JSON if provided, otherwise use as text input
      if (argsText) {
        try {
          toolArgs = JSON.parse(argsText);
        } catch {
          // Not JSON, treat as text input
          // Map common fields based on tool schema
          if (userTool.schema && typeof userTool.schema === 'object' && 'parse' in userTool.schema) {
            const schemaShape = (userTool.schema as any)._def || {};
            // Try to infer field names
            if (schemaShape.shape) {
              const fields = Object.keys(schemaShape.shape);
              const fieldDefs = schemaShape.shape;

              // Check for common text input fields first (in priority order)
              // Priority: message → text → query → content → prompt → input (and others)
              const commonTextFields = ['message', 'text', 'query', 'content', 'prompt', 'input', 'question', 'description', 'topic', 'offer', 'productBrief'];
              const foundField = commonTextFields.find(f => fields.includes(f));

              if (foundField) {
                toolArgs[foundField] = argsText;
              } else {
                // For tools with required fields, try to infer from field names
                // Check if there's a field that looks like it should contain the text
                const textLikeFields = fields.filter(f => {
                  const fLower = f.toLowerCase();
                  return ['text', 'query', 'content', 'input', 'prompt', 'message', 'question', 'description', 'topic', 'offer', 'brief', 'subject', 'title'].some(pattern => fLower.includes(pattern));
                });
                if (textLikeFields.length > 0) {
                  // Prefer required fields over optional ones
                  const requiredField = textLikeFields.find(f => {
                    const fieldDef = fieldDefs[f];
                    return fieldDef && fieldDef._def?.typeName === 'ZodString' && !fieldDef._def?.typeName?.includes('Optional');
                  });
                  // Power of 10 Rule 7: Guard undefined - ensure field exists before using as index
                  const fieldName = requiredField || textLikeFields[0];
                  if (fieldName) {
                    toolArgs[fieldName] = argsText;
                  }
                } else {
                  // Default: use first required string field, or first optional string field, or just 'text'
                  const firstRequiredStringField = fields.find(f => {
                    const fieldDef = fieldDefs[f];
                    return fieldDef && fieldDef._def?.typeName === 'ZodString' && !fieldDef._def?.typeName?.includes('Optional');
                  });
                  const firstOptionalStringField = fields.find(f => {
                    const fieldDef = fieldDefs[f];
                    return fieldDef && (
                      fieldDef._def?.typeName === 'ZodOptional' ||
                      (fieldDef._def?.typeName === 'ZodString' && fieldDef._def?.checks?.some((c: any) => c.kind === 'min' && c.value === 0))
                    );
                  });
                  if (firstRequiredStringField) {
                    toolArgs[firstRequiredStringField] = argsText;
                  } else if (firstOptionalStringField) {
                    toolArgs[firstOptionalStringField] = argsText;
                  } else {
                    toolArgs.text = argsText;
                  }
                }
              }
            } else {
              toolArgs.text = argsText;
            }
          } else {
            toolArgs.text = argsText;
          }
        }
      }

      // Special handling for array fields: if tool has a 'commands' field and we have text input,
      // wrap the text in an array
      if (argsText && !toolArgs.commands && userTool.schema) {
        const schemaShape = (userTool.schema as any)._def || {};
        if (schemaShape.shape && schemaShape.shape.commands) {
          const commandsDef = schemaShape.shape.commands;
          // Check if commands is an array type (handle ZodDefault wrapping)
          const innerDef = commandsDef._def?.innerType?._def || commandsDef._def;
          if (innerDef?.typeName === 'ZodArray' || commandsDef._def?.typeName === 'ZodArray') {
            // If we have text input but no commands, wrap text in array
            if (toolArgs.text || toolArgs.query || toolArgs.content) {
              const textValue = toolArgs.text || toolArgs.query || toolArgs.content;
              toolArgs.commands = [textValue];
              // Remove the text field to avoid conflicts
              delete toolArgs.text;
              delete toolArgs.query;
              delete toolArgs.content;
            }
          }
        }
      }

      // Validate required fields before executing
      if (userTool.schema && typeof userTool.schema === 'object' && 'parse' in userTool.schema) {
        try {
          // Try to parse/validate - this will throw if required fields are missing
          userTool.schema.parse(toolArgs);
        } catch (validationError: any) {
          // Extract missing required fields
          const missingFields: string[] = [];
          if (validationError.errors) {
            // Power of 10 Rule 2: Bounded loop
            const MAX_ERRORS = 1000;
            const errorsToCheck = validationError.errors.slice(0, MAX_ERRORS);
            for (let i = 0; i < errorsToCheck.length; i++) {
              const err = errorsToCheck[i];
              if (!err || typeof err !== 'object') continue;
              const errorObj = err as Record<string, unknown>;
              if (errorObj.code === 'invalid_type' && errorObj.received === 'undefined') {
                const path = errorObj.path;
                if (Array.isArray(path)) {
                  missingFields.push(path.join('.'));
                }
              }
            }
          }

          if (missingFields.length > 0) {
            const toolNameSafe = toolName || 'unknown';
            const slashCmd = userMessage.startsWith('/') ? userMessage.split(' ')[0] : `/${toolNameSafe.replace('user.', '')}`;
            const errorMessage = `Missing required ${missingFields.length === 1 ? 'field' : 'fields'}: ${missingFields.join(', ')}.\n\nUsage: ${slashCmd} <${missingFields[0]}>\nExample: ${slashCmd} your description here`;

            send({
              type: 'error',
              data: {
                message: errorMessage,
                phase: 'validation',
              },
            });

            send({
              type: 'tool',
              data: {
                tool: toolNameSafe,
                callId: uuidv4(),
                args: toolArgs,
                status: 'error',
                error: errorMessage,
              },
            });

            // Send final message
            send({
              type: 'message',
              data: {
                id: messageId,
                role: 'assistant',
                content: `**Error executing ${toolLabel}**\n\n${errorMessage}`,
              },
            });

            controller.close();
            return;
          }
        }
      }

      const callId = uuidv4();

      // Send tool start event
      send({
        type: 'tool',
        data: {
          tool: userTool.name,
          callId,
          args: toolArgs,
          status: 'running',
        },
      });

      send({ type: 'progress', data: { phase: 'executing', progress: 30, message: `Running ${toolLabel}...` } });

      // For research.run, send immediate status update
      if (toolName === 'research.run') {
        send({
          type: 'status',
          data: {
            message: 'Starting web research... This typically takes 20-40 seconds.',
            phase: 'executing'
          }
        });
        send({
          type: 'progress',
          data: {
            phase: 'executing',
            progress: 40,
            message: 'Research in progress...'
          }
        });
      }

      try {
        // PROACTIVE VALIDATION: Validate tool name before execution
        if (!toolName || typeof toolName !== 'string' || toolName.trim().length === 0) {
          throw new Error('Invalid tool name');
        }

        // Emit tool.requested event
        const toolStartTime = Date.now();
        await emitEvent({
          id: uuidv4(),
          type: 'tool.requested',
          severity: 'info',
          timestamp: new Date().toISOString(),
          source: 'chat-stream',
          environment: 'dev',
          data: {
            tool: toolName,
            callId,
            args: toolArgs,
            conversationId,
          },
        });

        // Execute user tool
        const result = await executeTool(toolName, toolArgs);

        // PROACTIVE VALIDATION: Validate result structure
        if (!result || typeof result !== 'object') {
          throw new Error('Tool execution returned invalid result');
        }

        send({ type: 'progress', data: { phase: 'executing', progress: 90, message: `${toolLabel} completed` } });

        // Send tool completion event
        send({
          type: 'tool',
          data: {
            tool: toolName,
            callId,
            args: toolArgs,
            status: 'completed',
            result,
          },
        });

        // Emit tool.result event
        const toolDuration = Date.now() - toolStartTime;
        await emitEvent({
          id: uuidv4(),
          type: 'tool.result',
          severity: result.ok ? 'info' : 'error',
          timestamp: new Date().toISOString(),
          source: 'chat-stream',
          environment: 'dev',
          data: {
            tool: toolName,
            callId,
            success: result.ok,
            duration: toolDuration,
            error: result.ok ? undefined : (result.error || 'Unknown error'),
            conversationId,
          },
        });

        // CHECK 3 & 4: Log tool return shape and emit both events
        // CRITICAL: For research.run, emit knowledge_hit events for each source
        if (toolName === 'research.run') {
          // CHECK 3: Log raw tool result shape (first 800 chars)
          console.log(`[Chat Stream] [CHECK 3] research.run result shape:`, JSON.stringify(result).slice(0, 800));
          console.log(`[Chat Stream] research.run result:`, {
            ok: result.ok,
            hasSources: !!(result.sources && Array.isArray(result.sources)),
            sourcesCount: result.sources?.length || 0,
            hasTop3: !!(result.top3 && Array.isArray(result.top3)),
            top3Count: result.top3?.length || 0,
            hasError: !!result.error,
            error: result.error,
            summary: result.summary?.substring(0, 100),
            provider: result.provider,
          });

          // CHECK 4: Emit both tool_result (already done above) AND knowledge_hit events
          if (result.ok && result.sources && Array.isArray(result.sources) && result.sources.length > 0) {
            console.log(`[Chat Stream] ✅ Research SUCCESS: Emitting ${result.sources.length} knowledge_hit events for research.run`);
            console.log(`[Chat Stream] Sample source:`, {
              title: result.sources[0]?.title,
              url: result.sources[0]?.url,
              hasSnippet: !!result.sources[0]?.snippet,
              score: result.sources[0]?.score,
            });

            // Send status update first
            const sourceCount = result.sources?.length || 0;
            send({
              type: 'status',
              data: {
                message: sourceCount === 0
                  ? `Research completed but no external sources found (browser/API limits in lite mode).`
                  : `Research completed. Found ${sourceCount} sources.`,
                phase: 'executing',
                conversationId: conversationId,
              }
            });

            // CHECK 5: Emit knowledge_hit with correct field names (excerpt/snippet both supported)
            // Also emit search_query and citation events
            if (result.query) {
              send({
                type: 'search_query',
                data: {
                  query: result.query,
                  provider: result.provider || 'custom',
                  timestamp: Date.now(),
                },
              });
            }

            for (const hit of result.sources) {
              // Emit citation for top 3
              const rank = result.sources.indexOf(hit) + 1;
              if (rank <= 3) {
                send({
                  type: 'citation',
                  data: {
                    title: hit.title || 'Untitled',
                    url: hit.url || '',
                    rank,
                    reason: `Top ${rank} result for "${result.query || toolArgs.query}"`,
                    score: hit.score || hit.relevance || 0,
                    timestamp: Date.now(),
                  },
                });
              }

              send({
                type: 'knowledge_hit',
                data: {
                  title: hit.title || 'Untitled',
                  url: hit.url || '',
                  score: hit.score || hit.relevance || 0,
                  excerpt: hit.snippet || hit.excerpt || '', // CHECK 5: Both excerpt and snippet supported
                  snippet: hit.snippet || hit.excerpt || '', // Include both for compatibility
                  provider: result.provider || 'custom',
                  publishedAt: hit.publishedAt || null,
                  query: result.query || toolArgs.query || '',
                  category: 'web',
                  conversationId: conversationId, // CHECK 6: Include conversationId
                },
              });
            }
          } else {
            console.warn(`[Chat Stream] ⚠️ Research completed but NO SOURCES:`, {
              ok: result.ok,
              hasSources: !!(result.sources && Array.isArray(result.sources)),
              sourcesCount: result.sources?.length || 0,
              error: result.error,
              message: result.message,
            });

            // Research is still in progress - send status update
            send({
              type: 'status',
              data: {
                message: 'Research is processing... This may take up to 1 minute.',
                phase: 'executing',
                conversationId: conversationId,
              }
            });
          }
        }

        // Format result as assistant message
        let resultContent = `**${toolLabel}**\n\n`;
        if (result.ok) {
          // Special formatting for research.run results
          if (toolName === 'research.run') {
            if (result.top3 && Array.isArray(result.top3) && result.top3.length > 0) {
              // Success case: We have results with links
              resultContent += `${result.summary || result.message || 'Research completed'}\n\n`;
              resultContent += `**Top ${result.top3.length} Results with Links:**\n\n`;
              result.top3.forEach((item: any, idx: number) => {
                resultContent += `${idx + 1}. **${item.title || 'Untitled'}**\n`;
                if (item.url) {
                  resultContent += `   ${item.url}\n`;
                }
                if (item.snippet) {
                  resultContent += `   ${item.snippet}\n`;
                }
                resultContent += `\n`;
              });
              if (result.sources && result.sources.length > result.top3.length) {
                resultContent += `\n*Found ${result.sources.length} total sources. Showing top ${result.top3.length}.*\n`;
              }
            } else if (result.error) {
              // Error case: Research failed or returned empty
              resultContent += `❌ Research Error: ${result.error}\n\n`;
              resultContent += `The research tool was executed but did not return any sources. This could mean:\n`;
              resultContent += `- The research query didn't match any results\n`;
              resultContent += `- The research API encountered an error\n`;
              resultContent += `- The research timed out\n\n`;
              if (result.summary) {
                resultContent += `Summary: ${result.summary}\n`;
              }
            } else {
              // Empty results case
              resultContent += `⚠️ Research completed but no sources were found.\n\n`;
              resultContent += `The research tool executed successfully but did not return any sources with links.\n`;
              if (result.summary) {
                resultContent += `\nSummary: ${result.summary}\n`;
              }
              if (result.message) {
                resultContent += `\n${result.message}\n`;
              }
            }
          } else if (result.message) {
            resultContent += `${result.message}\n\n`;
          }
          if (result.response || result.translated || result.summary || result.content) {
            // Only add if we haven't already added research results above
            if (!(toolName === 'research.run' && result.top3)) {
              resultContent += `${result.response || result.translated || result.summary || result.content}`;
            }
          } else if (typeof result === 'object' && !(toolName === 'research.run' && result.top3)) {
            // Extract meaningful information instead of raw JSON dump
            const keys = Object.keys(result).filter(k => k !== 'ok' && k !== 'top3' && k !== 'sources' && result[k] !== undefined && result[k] !== null);
            if (keys.length > 0) {
              keys.slice(0, 3).forEach(key => {
                const value = result[key];
                if (typeof value === 'string' && value.length < 200) {
                  resultContent += `${key}: ${value}\n`;
                } else if (typeof value === 'number' || typeof value === 'boolean') {
                  resultContent += `${key}: ${value}\n`;
                }
              });
            }
          }
        } else {
          resultContent += `Error: ${result.error || 'Unknown error'}`;
        }

        send({ type: 'delta', data: { content: resultContent } });
        send({ type: 'progress', data: { phase: 'executing', progress: 100, message: 'Complete' } });
        send({ type: 'done', data: { messageId } });

        streamState.closed = true;
        controller.close();
        return;
      } catch (error: any) {
        console.error('[Chat Stream] User tool execution error:', error);

        const errorMessage = error?.message || error?.toString() || 'Unknown error occurred';

        send({
          type: 'tool',
          data: {
            tool: toolName,
            callId,
            args: toolArgs,
            status: 'failed',
            error: errorMessage,
          },
        });

        send({ type: 'delta', data: { content: `**Error executing ${toolLabel}**: ${errorMessage}` } });
        send({ type: 'done', data: { messageId } });

        streamState.closed = true;
        controller.close();
        return;
      }
      } else {
        // AI-callable tool detected via slash command - execute directly
      const { tool: aiTool, argsText } = detectedTool;
      const toolName = aiTool.name || 'unknown';
      const toolLabel = aiTool.label || toolName;

      console.log('[Chat Stream] AI-callable tool detected via slash command:', toolName);

      send({ type: 'status', data: { message: `Executing ${toolLabel}...`, phase: 'executing' } });
      send({ type: 'progress', data: { phase: 'executing', progress: 10, message: `Executing ${toolLabel}...` } });

      let toolArgs: any = {};

      // Extract arguments for AI-callable tool
      if (argsText) {
        try {
          toolArgs = JSON.parse(argsText);
        } catch {
          // Not JSON, treat as text input and try common field names
          // Priority order: message, text, query, content
          toolArgs.message = argsText;
          // Also try common fallback names
          if (!toolArgs.text) toolArgs.text = argsText;
        }
      } else {
        // No arguments provided, use empty object
        toolArgs = {};
      }

      const callId = uuidv4();

      // Send tool start event
      send({
        type: 'tool',
        data: {
          tool: toolName,
          callId,
          args: toolArgs,
          status: 'running',
        },
      });

      send({ type: 'progress', data: { phase: 'executing', progress: 30, message: `Running ${toolLabel}...` } });

      try {
        // Validate tool name
        if (!toolName || typeof toolName !== 'string' || toolName.trim().length === 0) {
          throw new Error('Invalid tool name');
        }

        // Emit tool.requested event
        const toolStartTime = Date.now();
        await emitEvent({
          id: uuidv4(),
          type: 'tool.requested',
          severity: 'info',
          timestamp: new Date().toISOString(),
          source: 'chat-stream',
          environment: 'dev',
          data: {
            tool: toolName,
            callId,
            args: toolArgs,
            conversationId,
          },
        });

        // Execute AI-callable tool via executeTool
        const result = await executeTool(toolName, toolArgs);

        send({ type: 'progress', data: { phase: 'executing', progress: 90, message: `${toolLabel} completed` } });

        // Send tool completion event
        send({
          type: 'tool',
          data: {
            tool: toolName,
            callId,
            args: toolArgs,
            status: 'completed',
            result,
          },
        });

        // Emit tool.result event
        const toolDuration = Date.now() - toolStartTime;
        await emitEvent({
          id: uuidv4(),
          type: 'tool.result',
          severity: result.ok ? 'info' : 'error',
          timestamp: new Date().toISOString(),
          source: 'chat-stream',
          environment: 'dev',
          data: {
            tool: toolName,
            callId,
            success: result.ok,
            duration: toolDuration,
            error: result.ok ? undefined : (result.error || 'Unknown error'),
            conversationId,
          },
        });

        // Format result for display
        let resultContent = '';
        if (result.ok) {
          if (typeof result.data === 'string') {
            resultContent = result.data;
          } else if (typeof result.data === 'object') {
            resultContent = JSON.stringify(result.data, null, 2);
          } else if (typeof result === 'object' && result.message) {
            resultContent = result.message;
          } else {
            resultContent = JSON.stringify(result, null, 2);
          }
        } else {
          resultContent = `**Error**: ${result.error || 'Unknown error'}`;
        }

        send({ type: 'delta', data: { content: resultContent } });
        send({ type: 'progress', data: { phase: 'executing', progress: 100, message: 'Complete' } });
        send({ type: 'done', data: { messageId } });

        streamState.closed = true;
        controller.close();
        return;
      } catch (error: any) {
        console.error('[Chat Stream] AI-callable tool execution error:', error);

        const errorMessage = error?.message || error?.toString() || 'Unknown error occurred';

        send({
          type: 'tool',
          data: {
            tool: toolName,
            callId,
            args: toolArgs,
            status: 'failed',
            error: errorMessage,
          },
        });

        send({ type: 'delta', data: { content: `**Error executing ${toolLabel}**: ${errorMessage}` } });
        send({ type: 'done', data: { messageId } });

        streamState.closed = true;
        controller.close();
        return;
      }
      }
      break; // End of user_tool case
        }
      }
    }

    // If we reach here after short-circuit handling, either:
    // 1. Route type was 'standard-pipeline' (no short-circuit)
    // 2. Short-circuit handler didn't return (fell through - shouldn't happen normally)
    // Continue to standard pipeline

    // conversationHistory is already defined above - reuse it here
    // lightweightMode is already defined earlier - reuse it here
    // Prefer scorpion:latest (personal training AI) as default
    // Fallback chain: user model → env var → scorpion:latest → safe fallback
    let defaultModel = model || process.env['OLLAMA_MODEL'] || 'scorpion:latest';
    // Ensure we use a model that exists - fallback to available models if needed
    if (!defaultModel) {
      defaultModel = 'scorpion:latest'; // Primary default
    }
    // If scorpion doesn't exist, fallback to llama3.2:1b (will be handled by model runner)

    // Check cache first (before planning)
    const cachedResponse = getCachedResponse(userMessage);
    if (cachedResponse) {
      console.log('[Chat Stream] Using cached response');
      send({ type: 'delta', data: { content: cachedResponse } });
      send({ type: 'done', data: { messageId } });
      streamState.closed = true;
      controller.close();
      return;
    }

    // ========================================================================
    // PRE-FLIGHT: Safety Guard → Tool Router → Budget Governor → Dispatcher
    // ========================================================================
    // Optimized model config for lightweight resource usage
    const modelConfig = {
      provider: provider || 'ollama',
      model: defaultModel,
      maxTokens: lightweightMode ? 400 : 1200, // Increased slightly to reduce incomplete responses
      temperature: lightweightMode ? 0.05 : 0.07, // Lower temperature reduces computation overhead
    };

    // Wrapper for runModelUnified to match prompt adapter signature
    // Add error handling to catch model errors early
    const runModelForPrompt = async (systemPrompt: string, userPrompt: string, config: any) => {
      try {
        return await runModelUnified(systemPrompt, userPrompt, config);
      } catch (error: any) {
        // Check if it's a model not found error
        const errorMsg = error?.message || String(error);
        if (errorMsg.includes('not found') || errorMsg.includes('404')) {
          // Send error to client immediately
          send({
            type: 'error',
            data: {
              message: `Model error: ${errorMsg}. Please check your Ollama installation and ensure the model is available.`,
              phase: 'model',
            },
          });
        }
        throw error; // Re-throw to let caller handle it
      }
    };

    // JARVIS MODE: Single-user system (Evens Louis is the owner)
    // Always treat as owner with full access to all tools and data
    const context = {
      clientMode: 'owner', // Always owner - this is a single-user local AI system
      conversationId: conversationId || 'unknown',
      intent,
      lightweightMode,
    };

    // Run preflight checks (Safety Guard, Tool Router, Budget Governor)
    // Power of 10 Rule 3: Extracted to preflightChecks/ modules
    const preflightResult = await runPreflightChecks({
      userMessage,
      conversationHistory,
      intent,
      lightweightMode,
      clientMode: context.clientMode,
      modelConfig,
      runModelForPrompt,
      send,
    });

    // If preflight checks block the request, return early
    if (preflightResult.blocked) {
      const { safety } = preflightResult;
      send({
        type: 'error',
        data: {
          message: safety.safeAlternative || 'Request blocked by safety checks',
          phase: 'safety',
        },
      });
      send({
        type: 'message',
        data: {
          id: messageId,
          role: 'assistant',
          content: safety.safeAlternative || 'I cannot fulfill this request due to safety concerns.',
        },
      });
      send({ type: 'done', data: { messageId } });
      streamState.closed = true;
      controller.close();
      return;
    }

    // Extract results from preflight checks
    const { routing, budget } = preflightResult;
    let finalIntent = preflightResult.finalIntent;

    // Update intent if tool router refined it
    if (finalIntent !== intent) {
      console.log(`[Preflight] Intent refined: ${intent} → ${finalIntent}`);
      intent = finalIntent;
    }

    // Log preflight results for debugging
    console.log(`[Preflight] Complete - Intent: ${intent}, Tools: ${routing.tools.length}, Budget: ${budget.budget || 'default'}`);

    // Get helper config for post-flight checks (Style Enforcer, Memory Manager)
    const helperConfig = getHelperConfig(intent, lightweightMode);

    // 4. Dispatcher (optional, only if multi-machine setup) - NOT YET EXTRACTED
    const dispatcherEnabled = process.env['SCORPION_ENABLE_DISPATCHER'] !== '0' && process.env['SCORPION_MULTI_MACHINE'] === '1';
    console.log('[Dispatcher] System status:', {
      enabled: dispatcherEnabled,
      envFlag: process.env['SCORPION_ENABLE_DISPATCHER'],
      multiMachine: process.env['SCORPION_MULTI_MACHINE'],
      system: dispatcherEnabled ? 'ACTIVE' : 'DISABLED',
    });

    let dispatcher: any = null;
    if (dispatcherEnabled) {
      try {
        dispatcher = await runPromptWithKillSwitch(
          'dispatcher.system.txt',
          { routing: routing || { intent, tools: [] }, budget },
          DispatcherSchema,
          modelConfig,
          runModelForPrompt
        );

        if (dispatcher) {
          console.log('[Dispatcher] Placements:', dispatcher.placements);
        }
      } catch (error: any) {
        console.warn('[Chat Stream] Dispatcher failed, using local execution:', error.message);
      }
    }

    // Create orchestrator instance with injected dependencies
    // Power of 10 Rule 3: Extract orchestrator setup to focused function
    const orchestrator = createOrchestrator(provider, defaultModel, conversationId, lightweightMode);

    // Get file tracker for context injection (if available)
    // Power of 10 Rule 5: Typed tracker
    let tracker: unknown = null;
    try {
      const { getFileTracker } = await import('@/lib/chat/file-tracker');
      tracker = getFileTracker();
    } catch (e) {
      // File tracker not available, continue without it
    }

    // PHASE 1: PLANNER (ALWAYS USED - analyzes intent and determines if council is needed)
    checkAbort(); // Check before planner
    console.log('[Chat Stream] Using planner mode - analyzing intent');
    send({ type: 'status', data: { message: 'Analyzing request...', phase: 'planning' } });
    send({ type: 'progress', data: { phase: 'planning', progress: 10, message: 'Analyzing request...' } });

    // Aggressively optimized for lightweight resource usage
    const defaultMaxTokens = lightweightMode ? 500 : 1500; // Increased to reduce multiple passes
    const defaultTemp = lightweightMode ? 0.05 : 0.08; // Lower temperature reduces computation overhead

    send({ type: 'status', data: { message: 'Generating plan...', phase: 'planning' } });
    send({ type: 'progress', data: { phase: 'planning', progress: 30, message: 'Generating plan...' } });

    // PROACTIVE VALIDATION: Validate model configuration before calling
    if (!defaultModel || typeof defaultModel !== 'string' || defaultModel.trim().length === 0) {
      console.error('[Chat Stream] Invalid model configuration:', defaultModel);
      send({
        type: 'error',
        data: {
          message: 'Invalid model configuration. Please check server configuration.',
          phase: 'planning',
        },
      });
      controller.close();
      return;
    }

    // Power of 10 Rule 3: Extract planner prompt building to focused function
    let plannerPrompt: string;
    let historyAnalysis: ReturnType<typeof analyzeConversationHistory>;
    try {
      const { buildPlannerPrompt } = await import('./helpers/plannerPromptBuilder');
      const promptResult = await buildPlannerPrompt({
        intent,
        userMessage,
        conversationHistory,
        conversationId,
        tools,
        userTools,
        lightweightMode,
      });
      plannerPrompt = promptResult.prompt;
      historyAnalysis = promptResult.historyAnalysis;
      console.debug('[Chat Stream] History analysis preview:', historyAnalysis.historyText.substring(0, 500));
      console.debug('[Chat Stream] Frequently used tools:', historyAnalysis.frequentlyUsedTools);
      console.debug('[Chat Stream] Unused tools:', historyAnalysis.unusedTools);
    } catch (error: any) {
      console.error('[Chat Stream] Error building planner prompt:', error);
      send({
        type: 'error',
        data: {
          message: 'Failed to load planner configuration. Please check server logs.',
          phase: 'planning',
        },
      });
      controller.close();
      return;
    }

    // PROACTIVE VALIDATION: Validate prompts before calling model
    if (!userMessage || userMessage.trim().length === 0) {
      throw new Error('User message is empty');
    }

    // Power of 10 Rule 3: Use phase module instead of inline planner logic
    console.log('[Planner System] Starting planner phase:', {
      system: 'NEW (handlePlannerPhase)',
      intent: intent,
      hasHistory: conversationHistory.length > 0,
      toolsCount: tools['length'] || 0,
      hasEnhancedPrompt: !!plannerPrompt,
    });

    let plan: Plan;
    try {
      // Power of 10 Rule 3: Extract planner phase to focused module
      const plannerResult = await handlePlannerPhase({
        userMessage,
        conversationHistory,
        intent,
        tools,
        plannerPrompt,
        orchestrator,
        send,
        checkAbort,
        tracker,
      });

      plan = plannerResult.plan;
      // Planner may further refine intent from preflight result
      if (plannerResult.intent && plannerResult.intent !== intent) {
        console.log(`[Planner] Intent further refined: ${intent} → ${plannerResult.intent}`);
        intent = plannerResult.intent;
      }

      // Log PLAN phase completion
      if (chatJob && plan) {
        logJobPhase(chatJob.id, 'PLAN', 'Plan generated successfully', {
          stepsCount: plan.plan?.length || 0,
          objective: plan.objective?.substring(0, 100) || ''
        });
        updateJobWithPhaseResult(chatJob.id, 'PLAN', plan);
      }

      // Power of 10 Rule 3: Use helper functions for plan validation and normalization
      // The plannerPhase module already returns a normalized plan, but we validate it here for safety
      if (!plan || typeof plan !== 'object' || !plan.plan || !Array.isArray(plan.plan)) {
        console.warn('[Planner] Plan structure invalid from plannerPhase, creating fallback...');
        // Create a simple fallback plan
        plan = {
          objective: userMessage,
          assumptions: [],
          plan: [{
            id: 's1',
            title: 'Respond to user',
            tool: 'none',
            args: {},
          }],
          done_when: ['User receives response'],
          needsCouncil: false,
          questionType: 'casual',
          councilRationale: 'Fallback plan - planner failed',
        } as Plan;
        console.log('[Planner] Created fallback plan');
      }

      // Log if reasoning is missing (for debugging)
      if (!plan.reasoning) {
        console.warn('[Planner] Plan generated without reasoning field. LLM may not be following instructions.');
      } else {
        console.log('[Planner] Plan includes reasoning:', plan.reasoning.substring(0, 100) + '...');
      }

      // Power of 10 Rule 3: Use helper function for step normalization
      // Normalize plan steps to ensure all required fields are present
      const { normalizePlanSteps } = await import('./helpers/planHelpers');
      const normalizedSteps = normalizePlanSteps(plan.plan);
      plan.plan = normalizedSteps;

      // FRONTIER-LEVEL: Enforce plan rules (system health, tool validation, etc.)
      // Enforcement happens via applyPlanEnforcement below

      // Ensure plan has at least one step (even if it's a no-op)
      if (plan.plan.length === 0) {
        console.warn('[Chat Stream] Plan has no steps, using fallback plan');
        plan = {
          objective: userMessage,
          assumptions: [],
          plan: [{ id: 's1', title: 'Respond to user', tool: 'none', args: {} }],
          done_when: ['User receives response'],
          needsCouncil: false,
          questionType: 'casual',
          councilRationale: 'Fallback plan',
        } as Plan;
      }

      // ENHANCED ENFORCEMENT: Check for ALL frequently used tools and patterns, not just kb.search
      // Also enforce smart planning for "what is" questions even on first message
      // BUT: Skip enforcement for identity intent - identity questions are handled directly
      // Power of 10 Rule 7: Guard type narrowing - cast to string for comparison
      // Note: isWhatIsQuestion is declared later in the code, so we skip it here to avoid duplicate declaration

      if (plan.plan && plan.plan.length > 0) {
        // CRITICAL: File query enforcement must happen FIRST and be protected from override
        // Use historyAnalysis data for enforcement
        const enforcementData = {
          frequentlyUsedTools: historyAnalysis.frequentlyUsedTools,
          frequentlyUsedFiles: historyAnalysis.frequentlyUsedFiles,
          unusedTools: historyAnalysis.unusedTools,
          usedSequences: historyAnalysis.usedSequences,
          usedPatterns: historyAnalysis.usedPatterns,
        };

        // Apply enforcement logic using historyAnalysis data
        // (The rest of the enforcement logic continues here...)
      }

      // ... (rest of the code continues)

      // REMOVED: Large inline analyzeConversationHistory function (now in helpers/historyAnalysis.ts)
      // REMOVED: Large inline question type hints logic (now in helpers/promptBuilder.ts)

      // Apply enforcement logic using historyAnalysis data
      console.debug('[Chat Stream] History analysis length:', historyAnalysis.historyText.length);
      console.debug('[Chat Stream] History analysis preview:', historyAnalysis.historyText.substring(0, 500));
      console.debug('[Chat Stream] Frequently used tools:', historyAnalysis.frequentlyUsedTools);
      console.debug('[Chat Stream] Unused tools:', historyAnalysis.unusedTools);
      plannerPrompt += historyAnalysis.historyText;

      // Add file tracking context
      try {
        const { getFileTracker } = await import('@/lib/chat/file-tracker');
        const tracker = getFileTracker();
        const fileContext = tracker.getContextForPlanner(conversationId, 10);
        if (fileContext) {
          plannerPrompt += fileContext;
        }
      } catch (error) {
        console.debug('[Chat Stream] File tracker not available:', error);
      }

      // Pattern Learning: Retrieve relevant patterns from past successes
      try {
        const { learningContext } = await enhancePlanWithPatterns({
          userMessage,
          basePlan: { plan: [], objective: userMessage }, // Minimal plan for retrieval
        });

        if (learningContext) {
          plannerPrompt += learningContext;
          console.log('[Pattern Learning] Added learned patterns context to planner prompt');
        }
      } catch (error) {
        console.debug('[Pattern Learning] Failed to retrieve patterns:', error);
      }

      // Power of 10 Rule 3: Question type hints are now handled by addQuestionTypeHints helper (called above)

      // PROACTIVE VALIDATION: Validate prompts before calling model
      if (!plannerPrompt || plannerPrompt.trim().length === 0) {
        throw new Error('Planner prompt is empty');
      }
      if (!userMessage || userMessage.trim().length === 0) {
        throw new Error('User message is empty');
      }

      // Power of 10 Rule 3: Use phase module instead of inline planner logic
      console.log('[Planner System] Starting planner phase:', {
        system: 'NEW (handlePlannerPhase)',
        intent: intent,
        hasHistory: conversationHistory.length > 0,
        toolsCount: tools['length'] || 0,
        hasEnhancedPrompt: !!plannerPrompt,
      });

      try {
        // Power of 10 Rule 3: Extract planner phase to focused module
        const plannerResult = await handlePlannerPhase({
          userMessage,
          conversationHistory,
          intent,
          tools,
          plannerPrompt,
          orchestrator,
          send,
          checkAbort,
          tracker,
        });

        plan = plannerResult.plan;
        finalIntent = plannerResult.intent;
        // Update intent to use the final intent from planner (may have been refined)
        intent = finalIntent;

        // Log PLAN phase completion
        if (chatJob && plan) {
          logJobPhase(chatJob.id, 'PLAN', 'Plan generated successfully', {
            stepsCount: plan.plan?.length || 0,
            objective: plan.objective?.substring(0, 100) || ''
          });
          updateJobWithPhaseResult(chatJob.id, 'PLAN', plan);
        }

        // Phase 4.1: Validate and normalize plan using extracted helper
        // This orchestrates all plan validation, normalization, and enforcement
        const planValidation = validateAndNormalizePlan(plan, {
          intent: finalIntent,
          userMessage,
          isFileQuery,
          historyAnalysis,
          conversationHistory,
        });

        if (!planValidation.isValid) {
          throw new Error(`Plan validation failed: ${planValidation.issues.join(', ')}`);
        }

        plan = planValidation.plan;

        // Log any warnings from validation
        if (planValidation.warnings && planValidation.warnings.length > 0) {
          console.warn('[Chat Stream] Plan validation warnings:', planValidation.warnings);
        }
      } catch (error: any) {
        console.error('[Chat Stream] Failed to generate plan:', error);
        console.error('[Chat Stream] Error details:', {
          message: error?.message,
          stack: error?.stack?.split('\n').slice(0, 5).join('\n'),
        });

        // Check if it's a critical model error that requires stopping
        const errorMsg = error?.message || String(error);
        const isCriticalModelError = (errorMsg.includes('not found') && errorMsg.includes('404')) ||
          errorMsg.includes('Ollama connection refused') ||
          errorMsg.includes('ECONNREFUSED');

        // Power of 10 Rule 7: Only stop stream for critical errors, not timeouts
        // Timeouts should have been handled by the inner try-catch and should have a fallback plan
        if (isCriticalModelError) {
          // Send clear error message to user
          send({
            type: 'error',
            data: {
              message: `Model error: ${errorMsg.includes('not found') ? 'Model not found. Please pull the model first: `ollama pull ' + defaultModel + '`' : errorMsg}.`,
              phase: 'planning',
            },
          });

          // Send a helpful message to the user
          send({
            type: 'message',
            data: {
              id: messageId,
              role: 'assistant',
              content: `I'm unable to process your request because the AI model is not available. Please check:\n\n1. Ollama is running: \`ollama serve\`\n2. Model is available: \`ollama list\`\n3. Pull the model if needed: \`ollama pull ${defaultModel}\`\n\nError: ${errorMsg.substring(0, 200)}`,
            },
          });

          send({ type: 'done', data: { messageId } });
          streamState.closed = true;
          controller.close();
          return;
        }

        // For timeout and other recoverable errors, create a fallback plan and continue
        // Power of 10 Rule 7: Always have a fallback - never leave plan undefined
        if (!plan) {
          console.warn('[Chat Stream] Creating fallback plan after error');
          plan = {
            objective: userMessage,
            assumptions: [],
            plan: [{
              id: 's1',
              title: 'Respond to user',
              tool: 'none',
              args: {},
            }],
            done_when: ['User receives response'],
            needsCouncil: false,
            questionType: 'casual',
            councilRationale: 'Fallback plan - planner failed'
          } as Plan;
        }

        // Send warning event but continue with fallback plan
        send({
          type: 'status',
          data: {
            message: `Planner encountered an issue: ${error?.message || 'Unknown error'}. Using fallback plan.`,
            phase: 'planning',
          },
        });

        // Fallback: Create a simple plan that uses knowledge search
        // Improved detection for fallback
        const messageLower = userMessage.toLowerCase();

        // Expanded technical patterns - includes architectural and design questions
        const isTechnicalFallback = /(implement|deploy|integrate|build|create|develop|design|architecture|microservices|distributed|system design|api|database|workflow|security|performance|optimize|refactor|migrate|configure|setup|install|how to|how do|how can|how should|how would|error|bug|issue|problem|fix|debug|best practice|recommend|strategy|approach|pattern)/i.test(messageLower);

        // Expanded casual patterns - improved to catch "scorpion", "what is scorpion", etc.
        const isCasualFallback = /^(what is|who is|what are|who are|tell me about|more details|more analysis|define|explain what|explain who|what|who|which|when|where)\s+(is|are|was|were|about)/i.test(messageLower) ||
          /^(can you|could you|would you)\s+(tell|explain|describe|define)/i.test(messageLower) ||
          /^(scorpion|lightningflow|n8n)$/i.test(messageLower.trim()) ||
          /^(what|who|tell me|explain|describe)\s+(scorpion|lightningflow|n8n)/i.test(messageLower);

        // Check if it's a codebase question - improved detection
        const isCodebaseQuestion = /(lightningflow|lightning flow|scorpion|n8n|workflow|codebase|project|app|code|implementation)/i.test(messageLower) ||
          /^(scorpion|lightningflow|n8n)$/i.test(messageLower.trim());

        // Build plan steps
        const planSteps: any[] = [];

        // CRITICAL: Check intent FIRST - for identity and small_talk, create minimal plan with NO tools
        if ((intent as string) === 'identity') {
          planSteps.push({
            id: 's1',
            title: 'Answer as Scorpion - describe identity as local AI brain and orchestrator',
            tool: 'none',
            args: {},
            success: 'Identity response provided'
          });

          plan = {
            objective: userMessage,
            assumptions: ['User is asking about Scorpion\'s identity'],
            plan: planSteps,
            done_when: ['Identity response provided as Scorpion orchestrator'],
            fallbacks: [],
            needsCouncil: false,
            questionType: 'casual',
            councilRationale: 'Identity questions do not require council review',
            intent: 'other' as const, // Map 'identity' to 'other' for Plan type compatibility
          };

          send({
            type: 'status',
            data: { message: 'Using identity fallback plan (no tools, direct answer)', phase: 'planning' }
          });
          console.log('[Chat Stream] Identity intent detected - using direct answer path (no tools)');
          // Skip the rest of fallback plan generation for identity
        } else if ((intent as string) === 'small_talk') {
          planSteps.push({
            id: 's1',
            title: 'Recognize greeting and respond politely',
            tool: 'none',
            args: {},
            success: 'Greeting recognized'
          });

          plan = {
            objective: userMessage,
            assumptions: ['User is greeting or making casual conversation'],
            plan: planSteps,
            done_when: ['Polite response provided'],
            fallbacks: [],
            needsCouncil: false,
            questionType: 'casual',
            councilRationale: 'Small talk does not require council review',
            intent: 'small_talk'
          };

          send({
            type: 'status',
            data: { message: 'Using small_talk fallback plan (no tools)', phase: 'planning' }
          });
          // Skip the rest of fallback plan generation for small_talk
        } else {
          // For non-small_talk intents, continue with normal fallback plan generation

          // Check if this is a "what is" question - prioritize documentation files
          const isWhatIsQuestion = /^(what is|what are|who is|who are|tell me about|explain what|explain who)\s+(scorpion|lightningflow|lightning flow|n8n|the project|this app|this codebase)/i.test(messageLower) ||
            /^(what|who|tell me|explain|describe)\s+(is|are)\s+(scorpion|lightningflow|lightning flow|n8n)/i.test(messageLower);

          // For "what is" questions, start with documentation files instead of kb.search
          if (isWhatIsQuestion && isCodebaseQuestion) {
            // Determine project path
            let appPath = 'apps/scorpion';
            let appName = 'Scorpion';
            if (messageLower.includes('lightningflow') || messageLower.includes('lightning flow')) {
              appPath = 'apps/lightningflow';
              appName = 'LightningFlow';
            } else if (messageLower.includes('n8n')) {
              appPath = 'apps/n8n-cursor';
              appName = 'n8n-cursor';
            }

            // Start with README.md (highest priority for "what is" questions)
            planSteps.push({
              id: 's1',
              title: `Read README.md to understand ${appName}`,
              tool: 'code.readFile',
              args: { path: `${appPath}/README.md` },
              success: 'README.md read successfully'
            });

            // Add package.json as second step
            planSteps.push({
              id: 's2',
              title: `Read package.json for ${appName} metadata`,
              tool: 'code.readFile',
              args: { path: `${appPath}/package.json` },
              dependsOn: ['s1'],
              success: 'package.json read successfully'
            });
          } else {
            // For other questions, start with knowledge search
            // BUT only if intent allows kb.search (project_help or system_debug only)
            // general_question should NOT use KB - it's for general knowledge questions
            if (shouldUseKnowledgeBase(intent)) {
              planSteps.push({
                id: 's1',
                title: 'Search knowledge base for relevant information',
                tool: 'kb.search',
                args: { query: userMessage, limit: 5 },
                success: 'Found relevant knowledge entries'
              });
            } else {
              // For small_talk, general_question, or other intents that don't allow kb.search, create minimal plan
              planSteps.push({
                id: 's1',
                title: 'Respond to user message',
                tool: 'none',
                args: {},
                success: 'Response provided'
              });
            }
          }

          // For codebase questions (including "scorpion"), add VARIED code.readFile steps
          // CRITICAL: Vary the number of steps and tools based on question complexity
          // BUT ONLY if intent allows project/repo tools (project_help or system_debug)
          if (isCodebaseQuestion && (intent === 'project_help' || intent === 'system_debug')) {
            // IMPORTANT: Check for workflow-related questions FIRST
            const isWorkflowQuestion = /(workflow|n8n|execution|orchestration|automation|trigger workflow|run workflow)/i.test(messageLower);

            let appPath = 'apps/scorpion'; // Default to Scorpion
            let appName = 'Scorpion';
            if (isWorkflowQuestion) {
              appPath = 'apps/n8n-cursor';
              appName = 'n8n-cursor';
            } else if (messageLower.includes('scorpion') || messageLower.trim() === 'scorpion') {
              appPath = 'apps/scorpion';
              appName = 'Scorpion';
            } else if (messageLower.includes('n8n')) {
              appPath = 'apps/n8n-cursor';
              appName = 'n8n-cursor';
            } else if (messageLower.includes('lightningflow') || messageLower.includes('lightning flow')) {
              appPath = 'apps/lightningflow';
              appName = 'LightningFlow';
            }

            // Analyze conversation history to avoid repeating files
            const previouslyReadFiles = new Set<string>();
            if (conversationHistory && conversationHistory.length > 0) {
              const assistantMessages = conversationHistory
                .filter((msg: any) => msg.role === 'assistant')
                .map((msg: any) => msg.content)
                .join('\n');

              const filePatterns = [/README\.md/gi, /package\.json/gi, /src\/index\.ts/gi, /app\/page\.tsx/gi];
              filePatterns.forEach(pattern => {
                if (pattern.test(assistantMessages)) {
                  const fileName = pattern.source.replace(/[\\^$.*+?()[\]{}|]/g, '');
                  previouslyReadFiles.add(fileName.toLowerCase());
                }
              });
            }

            // Vary file selection based on what was read before
            const fileOptions: Array<{ path: string, title: string, includeAST?: boolean, includeDependencies?: boolean }> = [];

            // Check what files we've already added (for "what is" questions)
            const alreadyAddedFiles = new Set(planSteps.map((step: any) => step.args?.path));

            if (appPath === 'apps/scorpion') {
              fileOptions.push(
                { path: `${appPath}/tsconfig.json`, title: 'Read TypeScript configuration' },
                { path: `${appPath}/app/layout.tsx`, title: 'Read root layout', includeAST: true },
                { path: `${appPath}/next.config.js`, title: 'Read Next.js configuration' },
                { path: `${appPath}/README.md`, title: 'Read main README', includeDependencies: true },
                { path: `${appPath}/package.json`, title: 'Read package.json' },
                { path: `${appPath}/app/page.tsx`, title: 'Read main page component', includeAST: true },
                { path: `${appPath}/lib/chat/types.ts`, title: 'Read chat types' },
                { path: `${appPath}/tailwind.config.ts`, title: 'Read Tailwind configuration' },
              );

              // Filter out files we've already added
              const filteredOptions = fileOptions.filter(opt => !alreadyAddedFiles.has(opt.path));
              fileOptions.length = 0;
              fileOptions.push(...filteredOptions);
            } else if (appPath === 'apps/lightningflow') {
              fileOptions.push(
                { path: `${appPath}/tsconfig.json`, title: 'Read TypeScript configuration' },
                { path: `${appPath}/lightning-ui/README.md`, title: 'Read UI README', includeDependencies: true },
                { path: `${appPath}/README.md`, title: 'Read main README', includeDependencies: true },
                { path: `${appPath}/package.json`, title: 'Read package.json' },
                { path: `${appPath}/src/index.ts`, title: 'Read main entry point', includeAST: true },
              );

              // Filter out files we've already added
              const filteredOptions = fileOptions.filter(opt => !alreadyAddedFiles.has(opt.path));
              fileOptions.length = 0;
              fileOptions.push(...filteredOptions);
            } else if (appPath === 'apps/n8n-cursor') {
              // n8n-cursor has backend subdirectory
              fileOptions.push(
                { path: `${appPath}/backend/tsconfig.json`, title: 'Read backend TypeScript configuration' },
                { path: `${appPath}/backend/README.md`, title: 'Read backend README', includeDependencies: true },
                { path: `${appPath}/backend/package.json`, title: 'Read backend package.json' },
                { path: `${appPath}/backend/src/index.ts`, title: 'Read backend entry point', includeAST: true },
                { path: `${appPath}/backend/src/workers/workflow-worker.ts`, title: 'Read workflow worker implementation', includeAST: true },
              );

              // Filter out files we've already added
              const filteredOptions = fileOptions.filter(opt => !alreadyAddedFiles.has(opt.path));
              fileOptions.length = 0;
              fileOptions.push(...filteredOptions);
            } else {
              fileOptions.push(
                { path: `${appPath}/tsconfig.json`, title: 'Read TypeScript configuration' },
                { path: `${appPath}/README.md`, title: 'Read main README', includeDependencies: true },
                { path: `${appPath}/package.json`, title: 'Read package.json' },
                { path: `${appPath}/src/index.ts`, title: 'Read main entry point', includeAST: true },
              );

              // Filter out files we've already added
              const filteredOptions = fileOptions.filter(opt => !alreadyAddedFiles.has(opt.path));
              fileOptions.length = 0;
              fileOptions.push(...filteredOptions);
            }

            // Filter out previously read files and pick VARIED number (2-5) based on question complexity
            const unusedFiles = fileOptions.filter(file => {
              const fileName = file.path.split('/').pop() || '';
              return !previouslyReadFiles.has(fileName.toLowerCase());
            });

            // Vary number of files based on question complexity and what's already been read
            const questionComplexity = isWhatIsQuestion ? 2 : (isTechnicalFallback ? 4 : 3);
            const numFilesToRead = Math.min(
              Math.max(questionComplexity - planSteps.length, 2), // At least 2, account for already added steps
              Math.min(unusedFiles.length || fileOptions.length, 5) // Max 5 files
            );

            const filesToRead = unusedFiles.length >= numFilesToRead
              ? unusedFiles.slice(0, numFilesToRead)
              : fileOptions.slice(0, numFilesToRead); // Fallback if all were used

            // Add varied file reading steps with proper dependencies
            filesToRead.forEach((file, index) => {
              const stepId = `s${planSteps.length + 1}`;
              const dependsOn = index === 0 && planSteps.length > 0
                ? [planSteps[planSteps.length - 1].id]
                : (index === 0 ? [] : [`s${planSteps.length}`]);

              planSteps.push({
                id: stepId,
                title: file.title + ` to understand ${appName}`,
                tool: 'code.readFile',
                args: {
                  path: file.path,
                  includeAST: file.includeAST || false,
                  includeDependencies: file.includeDependencies || false
                },
                dependsOn: dependsOn.length > 0 ? dependsOn : undefined,
                success: `${file.path.split('/').pop()} read successfully`
              });
            });

            // For complex questions, add project.analyze as an alternative/additional tool
            // BUT ONLY if intent allows project tools
            if (isTechnicalFallback && planSteps.length < 6 && (intent === 'project_help' || intent === 'system_debug')) {
              planSteps.push({
                id: `s${planSteps.length + 1}`,
                title: `Analyze ${appName} project structure`,
                tool: 'project.analyze',
                args: { scope: appPath },
                dependsOn: planSteps.length > 0 ? [planSteps[planSteps.length - 1].id] : undefined,
                success: 'Project analysis completed'
              });
            }
          } else if (isCasualFallback) {
            // For casual questions (but NOT small_talk), add research as fallback if KB is empty
            // BUT only if intent allows it - general_question should NOT use research tools
            // Only project_help and system_debug should use research.run
            if (shouldUseKnowledgeBase(intent)) {
              planSteps.push({
                id: 's2',
                title: 'Research online if knowledge base insufficient',
                tool: 'research.run',
                args: { query: userMessage, depth: 'medium', category: 'general', maxSites: 5 },
                dependsOn: ['s1'],
                success: 'Research completed'
              });
            }
          }

          // Only create plan if we haven't already created one (for small_talk)
          if (!plan || plan.plan.length === 0 || plan.plan[0]?.tool !== 'none' || plan.plan[0]?.id !== 's1') {
            // Determine if council is needed - ONLY for truly complex questions OR council-related questions
            // Skip council for most questions to keep responses snappy
            const isTrulyComplex = /(enterprise|scalable|high availability|fault tolerance|distributed system|production|mission critical)/i.test(userMessage);

            // CRITICAL: Questions about the council itself should trigger council deliberation
            // This allows council members to explain their own process from their perspectives
            const isCouncilQuestion = /(council|deliberation|how.*council|what.*council|explain.*council|describe.*council|council.*process|council.*work|council.*deliberate|how.*deliberation|what.*deliberation)/i.test(userMessage);

            const needsCouncilForFallback = isTrulyComplex || isCouncilQuestion; // Use council for complex questions OR council-related questions

            plan = {
              objective: userMessage,
              assumptions: ['User wants information or to perform a simple action'],
              reasoning: `Fallback plan: ${isCasualFallback ? 'Casual question detected' : isTechnicalFallback ? 'Technical question detected' : 'Conversational question detected'}. Using simplified plan structure due to JSON parsing failure. This plan will gather basic information to answer the user's question.`,
              plan: planSteps,
              done_when: ['Information retrieved and presented'],
              fallbacks: [],
              needsCouncil: needsCouncilForFallback, // Technical/architectural questions need council review
              questionType: isCasualFallback ? 'casual' : (isTechnicalFallback ? 'technical' : 'conversational'),
              councilRationale: needsCouncilForFallback
                ? 'Technical/architectural question requires council deliberation for comprehensive analysis'
                : 'Casual/conversational question can be answered directly without council review',
              intent: intent // Add intent to plan
            };
          }

          send({
            type: 'status',
            data: { message: 'Using fallback plan (JSON parse failed)', phase: 'planning' }
          });
        } // Close the else block for non-small_talk fallback plans
      } // Close the outer error catch block

      // Ensure plan is defined before proceeding
      if (!plan) {
        console.error('[Chat Stream] Plan is undefined after parsing attempts');
        send({ type: 'error', data: { message: 'Failed to create plan' } });
        controller.close();
        return;
      }


      // Add intent to plan object for frontend display
      const planWithIntent = {
        ...plan,
        intent, // Add intent classification
      };

      // Send intent separately for debug tab
      send({
        type: 'intent',
        data: { intent, message: userMessage.substring(0, 100) }
      });

      // Send the full plan structure first (for saving in message content)
      send({
        type: 'plan',
        data: {
          plan: planWithIntent,
          planJson: JSON.stringify(planWithIntent) // Include JSON string for easy extraction
        }
      });

      // Stream plan steps incrementally with progress updates
      send({ type: 'status', data: { message: `Creating ${plan.plan.length} plan steps...`, phase: 'planning' } });
      send({ type: 'progress', data: { phase: 'planning', progress: 80, message: `Creating ${plan.plan.length} plan steps...` } });

      plan.plan.forEach((step, index) => {
        send({
          type: 'plan_step',
          data: {
            ...step,
            status: 'pending',
          },
        });

        // Send progress update for each step
        send({
          type: 'progress',
          data: {
            phase: 'planning',
            step: step.id,
            progress: 80 + Math.floor((index + 1) / plan.plan.length * 20),
            message: `Plan step ${index + 1}/${plan.plan.length}: ${step.title}`
          }
        });
      });

      send({ type: 'progress', data: { phase: 'planning', progress: 100, message: 'Plan created successfully' } });

      // Power of 10 Rule 3: Use phase module instead of inline council logic
      let councilResult: CouncilResult | null = null;
      let consensus: {
        approved: boolean;
        score: number;
        summary: string;
        issues?: unknown[];
      } | null = null;
      let votes: Array<{
        member: string;
        approved: boolean;
        issues: number;
      }> = [];
      try {
        const councilPhaseResult = await handleCouncilPhase({
          plan,
          intent: finalIntent,
          userMessage,
          conversationId: conversationId || '',
          userId: userId || 'evens',
          send,
          checkAbort,
        });

        councilResult = councilPhaseResult.councilResult;
        consensus = councilPhaseResult.consensus;
        votes = councilPhaseResult.votes;

        // Apply council revisions to plan if available
        if (councilResult) {
          const revisedPlanSummary = councilResult.revisedPlanSummary;
          if (revisedPlanSummary && typeof revisedPlanSummary === 'string') {
            plan.objective = revisedPlanSummary;
          }
        }
      } catch (error: unknown) {
        const err = error as { message?: string; stack?: string };
        console.warn('[Council] Failed to run council phase:', err.message, err.stack);
        // Don't fail the request if council fails, but create a minimal result
        // Power of 10 Rule 6: Return value check - create valid CouncilResult fallback
        councilResult = {
          approved: true,
          allIssues: [],
          warnings: [],
          councillorOutputs: [],
        } as CouncilResult;
        consensus = { approved: true, score: 10, summary: plan.objective || userMessage };
        votes = [];
      }

      // STRATEGY SYSTEM: Compute Next-Best-Action, similar missions, and creative pipeline
      try {
        const snapshot = createContextSnapshot(
          userMessage,
          filteredHistory,
          'PLAN' as MissionPhase,
          plan.objective,
          plan.plan.map(s => s.tool).filter(Boolean),
          conversationId,
        );

        // Use runScorpionBrain which includes creative pipeline selection
        // Pass the already-computed council result to avoid running it twice
        const strategyStartTime = Date.now();
        console.log('[Strategy System] Starting runScorpionBrain:', {
          system: 'NEW (v2)',
          hasPlan: !!plan.objective,
          hasCouncilResult: !!councilResult,
          hasHistory: filteredHistory.length > 0,
          conversationId: conversationId || 'none',
        });

        const brain = await runScorpionBrain(snapshot, {
          planSummaryOverride: plan.objective,
          domainTags: extractDomainTags(userMessage, plan.objective || ''),
          councilResult: councilResult, // Fixed: Now properly typed as CouncilResult | null
        });

        const strategyDuration = Date.now() - strategyStartTime;
        console.log('[Strategy System] Completed runScorpionBrain:', {
          system: 'NEW (v2)',
          duration: `${strategyDuration}ms`,
          hasNextBestAction: !!brain.nextBestAction,
          similarMissionsCount: brain.similar?.length || 0,
          hasCreativePipeline: !!brain.creativePipeline,
        });

        // Send Next-Best-Action to frontend
        send({
          type: 'next-best-action',
          conversationId: conversationId || 'default',
          payload: brain.nextBestAction,
        });

        // Send similar missions to frontend
        if (brain.similar.length > 0) {
          send({
            type: 'similar-missions',
            conversationId: conversationId || 'default',
            payload: brain.similar,
          });
          console.log('[Strategy] Found similar missions:', brain.similar.map(m => m.title));
        }

        // Send council result to frontend
        // Use brain.council if available, otherwise fall back to the pre-computed councilResult
        const finalCouncilResult = brain.council || councilResult;
        if (finalCouncilResult) {
          send({
            type: 'council_result',
            conversationId: conversationId || 'default',
            payload: finalCouncilResult,
          });
          console.log('[Strategy] Council result sent:', {
            approved: finalCouncilResult.approved,
            issuesCount: finalCouncilResult.allIssues?.length || 0,
            councillors: finalCouncilResult.councillorOutputs?.length || 0,
            source: brain.council ? 'brain.council' : 'councilResult',
          });
        } else {
          console.warn('[Strategy] No council result available - brain.council:', brain.council ? 'present' : 'null', 'councilResult:', councilResult ? 'present' : 'null');
        }

        // Send creative pipeline decision to frontend
        if (brain.creativePipeline && brain.creativePipeline.id !== 'NO_CREATIVE_PIPELINE') {
          send({
            type: 'creative-pipeline',
            conversationId: conversationId || 'default',
            payload: brain.creativePipeline,
          });
          console.log('[Strategy] Creative pipeline selected:', brain.creativePipeline.id);
        }

        // Send data workflow decision to frontend
        if (brain.dataWorkflow && brain.dataWorkflow.id !== 'NONE') {
          send({
            type: 'data-workflow',
            conversationId: conversationId || 'default',
            payload: brain.dataWorkflow,
          });
          console.log('[Strategy] Data workflow selected:', brain.dataWorkflow.id);
        }
      } catch (error: any) {
        // Don't fail the request if strategy computation fails
        console.warn('[Strategy] Failed to compute strategy:', error.message);
        // Log as improvement signal
        const signal = logImprovementSignal({
          type: 'BROKEN_FLOW',
          message: `Strategy computation failed: ${error.message}`,
          tag: 'strategy-system',
          missionId: conversationId,
          severity: 3,
        });
        // Send signal to frontend
        send({
          type: 'improvement-signal',
          conversationId: conversationId || 'default',
          payload: signal,
        });
      }

      // Determine if council is needed - ONLY for truly complex questions OR council-related questions
      // Skip council for most questions to keep responses snappy
      const isTrulyComplex = /(enterprise|scalable|high availability|fault tolerance|distributed system|production|mission critical)/i.test(userMessage);

      // CRITICAL: Questions about the council itself should trigger council deliberation
      // This allows council members to explain their own process from their perspectives
      const isCouncilQuestion = /(council|deliberation|how.*council|what.*council|explain.*council|describe.*council|council.*process|council.*work|council.*deliberate|how.*deliberation|what.*deliberation)/i.test(userMessage);

      const needsCouncil = (plan.needsCouncil === true && isTrulyComplex) || isCouncilQuestion;

      console.log('[Chat Stream] Council decision:', {
        needsCouncil,
        isCouncilQuestion,
        isTrulyComplex,
        planNeedsCouncil: plan.needsCouncil,
        userMessage,
      });

      // Determine question type for summarizer - improved detection
      const questionType = plan.questionType || (() => {
        const planText = (plan.objective || userMessage).toLowerCase();
        const messageText = userMessage.toLowerCase();

        // Expanded casual patterns
        const casualPatterns = [
          /^(what is|who is|what are|who are|tell me about|more details|more analysis|define|explain what|explain who)/i,
          /^(what|who|which|when|where)\s+(is|are|was|were)/i,
          /^(can you|could you|would you)\s+(tell|explain|describe|define)/i,
          /^(give me|show me|provide)\s+(info|information|details|an explanation)/i,
        ];

        // Expanded technical patterns
        const technicalPatterns = [
          /(implement|deploy|integrate|build|create|develop|design|architecture|system|api|database|workflow|security|performance|optimize|refactor|migrate|configure|setup|install)/i,
          /(how to|how do|how can|how should|how would)/i,
          /(error|bug|issue|problem|fix|debug|troubleshoot|resolve)/i,
          /(plan|strategy|approach|solution|method|technique|best practice)/i,
          /(code|script|function|class|module|component|service)/i,
        ];

        // Check technical patterns first (higher priority)
        if (technicalPatterns.some(pattern => pattern.test(planText) || pattern.test(messageText))) {
          return 'technical';
        }

        // Check casual patterns
        if (casualPatterns.some(pattern => pattern.test(planText) || pattern.test(messageText))) {
          return 'casual';
        }

        // Default to conversational for unclear cases
        return 'conversational';
      })();

      const isCasual = questionType === 'casual' || questionType === 'conversational';

      // INTENT-AWARE KB USAGE: Only execute KB search if intent allows it
      // For small_talk and general_question, skip KB entirely
      // Power of 10 Rule 3: Use helper function for RAG integration
      const {
        knowledgeHitsForCouncil,
        earlyKbSearchCompleted,
        kbAttempted,
      } = await performEarlyRagSearch({
        plan,
        intent: intent as string,
        userMessage,
        conversationHistory,
        conversationId,
        send,
        modelConfig,
        runModelForPrompt,
      });

      // Declare kbHasResults as mutable since it may be updated during self-correction
      let kbHasResults = false;

      // PHASE 2: COUNCIL - SKIP OLD COUNCIL SYSTEM
      // We already ran the new council system (runCouncil) above at line 3367
      // The old orchestrator.runCouncil is disabled to avoid timeouts and conflicts
      // consensus and votes are already declared above (lines 2374-2384)

      // Skip old council system - we use the new council system instead
      const useOldCouncil = false; // Disabled - using new council system

      if (needsCouncil && useOldCouncil) {
        // Council is needed for technical/complex questions
        checkAbort(); // Check before council

        // Normalize plan intent for orchestrator compatibility
        const normalizedPlan = {
          ...plan,
          intent: ((plan.intent as string) === 'identity' ? 'other' : plan.intent) as import('@scorpion/core').ScorpionIntent | undefined,
        };

        // Add timeout for council deliberation (30 seconds for council questions, 15s for others)
        const councilTimeoutDuration = isCouncilQuestion ? 30000 : 15000;
        const councilTimeout = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`Council deliberation timeout after ${councilTimeoutDuration / 1000}s`)), councilTimeoutDuration);
        });

        // Track if council has started (to ensure events are sent even on timeout)
        let councilStarted = false;

        const councilPromise = orchestrator.runCouncil(
          normalizedPlan,
          userMessage,
          (event) => {
            // Stream all council events (including consensus)
            console.log('[Chat Stream] Council event:', event.type, event.data);

            // Mark council as started when we receive the first event
            if (event.type === 'council_start') {
              councilStarted = true;
            }

            send(event);

            // Send progress updates for council events (enhanced progress tracking)
            if (event.type === 'council_start') {
              send({ type: 'progress', data: { phase: 'council', progress: 10, message: 'Council members analyzing...' } });
            } else if (event.type === 'council_thinking') {
              // Update progress based on status - Power of 10 Rule 7: Guard unknown types
              const data = event.data as { status?: string; memberName?: string } | undefined;
              if (data && data.status === 'analyzing' && data.memberName) {
                send({ type: 'progress', data: { phase: 'council', progress: 20, message: `${data.memberName} analyzing...` } });
              } else if (data && data.status === 'formulating' && data.memberName) {
                send({ type: 'progress', data: { phase: 'council', progress: 30, message: `${data.memberName} formulating response...` } });
              } else if (data && data.status === 'completed' && data.memberName) {
                send({ type: 'progress', data: { phase: 'council', progress: 40, message: `${data.memberName} completed analysis` } });
              }
            } else if (event.type === 'council_thinking_delta') {
              // Send incremental progress updates during thinking (throttled) - Power of 10 Rule 7: Guard unknown types
              const data = event.data as { accumulated?: string; memberName?: string } | undefined;
              const contentLength = data?.accumulated?.length || 0;
              const estimatedProgress = Math.min(35, 20 + Math.floor((contentLength / 500) * 15));

              // Only send progress update every ~100 chars to avoid spam
              if (contentLength % 100 < 50) {
                send({
                  type: 'progress',
                  data: {
                    phase: 'council',
                    progress: estimatedProgress,
                    message: `${(event.data as { memberName?: string } | undefined)?.memberName || 'Council member'} thinking...`
                  }
                });
              }
            } else if (event.type === 'council_vote') {
              const councilVoteCount = (event.data as any).voteCount || 0;
              const progress = Math.min(90, 50 + (councilVoteCount * 5));
              send({ type: 'progress', data: { phase: 'council', progress, message: `Vote ${councilVoteCount} received...` } });
            } else if (event.type === 'council_consensus') {
              send({ type: 'progress', data: { phase: 'council', progress: 100, message: 'Consensus reached' } });
            } else if (event.type === 'council_error') {
              console.error('[Chat Stream] Council error event:', event.data);
              send({ type: 'progress', data: { phase: 'council', progress: 0, message: 'Council error occurred' } });
            }
          },
          checkAbort,
          knowledgeHitsForCouncil // Pass knowledge base results
        );

        // Run council with timeout protection
        try {
          consensus = await Promise.race([councilPromise, councilTimeout]);

          // Extract votes from consensus object
          if (consensus) {
            votes = consensus.votes || consensus.data?.votes || [];
          }
        } catch (error: any) {
          console.error('[Chat Stream] Council timeout or error:', error);

          // If council started but timed out, send error event to frontend
          if (councilStarted) {
            send({
              type: 'council_error',
              data: {
                message: `Council deliberation ${error.message?.includes('timeout') ? 'timed out' : 'failed'}: ${error.message}`,
              },
            });
          }

          // Create fallback consensus
          consensus = {
            approved: true,
            score: 7,
            summary: plan.objective || userMessage,
          };
          votes = []; // No votes on timeout/error
        }
      } else {
        // Skip old council system - we already ran the new council system above
        console.log('[Chat Stream] Using new council system result - skipping old orchestrator council');
        send({ type: 'status', data: { message: 'Proceeding to execution with council review...', phase: 'executing' } });
        // Create consensus from new council result if available, otherwise simple approval
        if (councilResult) {
          consensus = {
            approved: councilResult.approved,
            score: councilResult.approved ? 8 : 5,
            summary: councilResult.revisedPlanSummary || plan.objective || userMessage,
            issues: councilResult.allIssues,
          };
          votes = councilResult.councillorOutputs?.map(co => ({
            member: co.councillorName || co.councillorId,
            approved: co.approved,
            issues: co.issues.length,
          })) || [];
        } else {
          // Fallback if new council didn't run
          consensus = {
            approved: true,
            score: 10,
            summary: plan.objective || userMessage
          };
          votes = [];
        }
      }

      // PHASE 3: EXECUTOR (NEW CONTRACT SYSTEM)
      checkAbort(); // Check before executor

      // For council questions, skip tool execution if plan has no meaningful tools
      const hasMeaningfulTools = plan.plan.some((step: any) =>
        step.tool && step.tool !== 'none' && step.tool !== 'notifications.post'
      );

      // For small_talk with tool: 'none', mark steps as completed immediately
      if ((intent as string) === 'small_talk') {
        plan.plan.forEach((step: any) => {
          if (step.tool === 'none') {
            send({
              type: 'plan_step',
              data: {
                ...step,
                status: 'completed',
              },
            });
          }
        });
      }

      // Power of 10 Rule 3: Extract plan execution to focused function
      let results: any[] = [];
      let executorResult: { scratchpad: any; sumCtx: any; reason: string } | null = null;

      try {
        const { executePlanToStream } = await import('./helpers/planExecutor');
        const executionResult = await executePlanToStream({
          plan,
          userMessage,
          conversationHistory,
          conversationId,
          defaultModel,
          executor,
          checkAbort,
          send,
          emitToolResult: emitToolResultWrapper,
          emitKnowledgeHits: emitKnowledgeHitsWrapper,
          isCouncilQuestion,
          hasMeaningfulTools,
          intent: intent as string,
          earlyKbSearchCompleted,
          knowledgeHitsForCouncil,
          shouldUseKnowledgeBase,
          modelConfig,
          runModelForPrompt,
        });
        results = executionResult.results;
        executorResult = executionResult.executorResult;
      } catch (executionError: any) {
        console.error('[Chat Stream] Plan execution error:', executionError);
        send({
          type: 'error',
          data: {
            message: `Execution failed: ${executionError.message}`,
            phase: 'executing',
          },
        });
      }

      // Legacy executor is now extracted to helpers/legacyExecutor.ts
      // It's called via executePlanToStream in planExecutor.ts when SCORPION_USE_LEGACY_EXECUTOR=1
      // or when the new executor fails
      // Migration Job #1: Legacy Executor Extraction - COMPLETE

      // PHASE 4: SUMMARIZER
      checkAbort(); // Check before summarizer
      send({ type: 'status', data: { message: 'Summarizing results...', phase: 'summarizing' } });
      send({ type: 'progress', data: { phase: 'summarizing', progress: 0, message: 'Preparing summary...' } });

      send({ type: 'progress', data: { phase: 'summarizing', progress: 20, message: 'Gathering results...' } });

      // FRONTIER-LEVEL: Intent-aware summarizer prompt selection
      let summarizerPrompt: string;
      try {
        summarizerPrompt = getSummarizerPrompt(intent);
      } catch (error: any) {
        console.error('[Chat Stream] Error reading summarizer prompt:', error);
        send({
          type: 'error',
          data: {
            message: 'Failed to load summarizer configuration. Please check server logs.',
            phase: 'summarizing',
          },
        });
        controller.close();
        return;
      }

      // PROACTIVE VALIDATION: Validate results array before processing
      if (!results || !Array.isArray(results)) {
        console.error('[Chat Stream] Invalid results array:', results);
        results = [];
      }

      // Phase 4.2: Process execution results using extracted helper
      const processedResults = processExecutionResults({
        results,
        plan,
      });

      // Destructure processed results
      const {
        codeReadResults,
        knowledgeHits,
        researchResults,
        researchSources,
        systemHealthResults,
        logsResults,
        projectAnalyzeResults,
        filesRecentResults,
      } = processedResults;

      // Extract knowledge search query from plan steps
      const knowledgeSearchStep = plan.plan.find((s: any) => s.tool === 'kb.search');
      const knowledgeSearchQuery = knowledgeSearchStep?.args?.['query'] || userMessage;

      // Re-calculate isWhatIsQuestion for later use in summarizer
      const userMessageLowerForWhatIs = userMessage.toLowerCase();
      const isWhatIsQuestion = /^(what is|who is|what are|who are|define|tell me about|explain what|explain who|more details|more analysis)/i.test(userMessageLowerForWhatIs) ||
        /^(what|who|which)\s+(is|are|was|were)/i.test(userMessageLowerForWhatIs);

      // Prioritize README files and main documentation for "what is" questions - improved detection
      let prioritizedKnowledgeHits = prioritizeKnowledgeHits(knowledgeHits, userMessage);

      // Debug logging for file query results
      if (isFileQuery) {
        console.log('[Chat Stream] File query - filesRecentResults:', JSON.stringify(filesRecentResults, null, 2));
        filesRecentResults.forEach((result, idx) => {
          console.log(`[Chat Stream] File query result ${idx}:`, {
            hasFiles: !!result.files,
            filesLength: result.files?.length || 0,
            total: result.total,
            files: result.files?.slice(0, 3).map((f: any) => ({ path: f.path, ageMinutes: f.ageMinutes }))
          });
        });
      }

      // Phase 4.3: Build summarizer context using extracted helper
      // Check if research API keys are available
      const hasResearchKeys = !!(process.env['TAVILY_API_KEY'] || process.env['NEWS_API_KEY'] || process.env['SERPAPI_KEY']);

      const summarizerContextResult = buildSummarizerContext({
        userMessage,
        questionType,
        intent,
        plan,
        results,
        processedResults,
        prioritizedKnowledgeHits,
        knowledgeSearchQuery,
        isCasual,
        isWhatIsQuestion,
        isFileQuery,
        needsCouncil,
        votes,
        consensus,
        hasResearchKeys,
        executorResult,
      });

      let summaryContext = summarizerContextResult.summaryContext;
      const hasKnowledge = summarizerContextResult.hasKnowledge;
      const hasResearch = summarizerContextResult.hasResearch;
      const hasSystemHealth = summarizerContextResult.hasSystemHealth;
      const hasLogs = summarizerContextResult.hasLogs;
      const hasProjectAnalyze = summarizerContextResult.hasProjectAnalyze;
      const hasFilesRecent = summarizerContextResult.hasFilesRecent;
      const hasActualFiles = summarizerContextResult.hasActualFiles;
      const hasResults = summarizerContextResult.hasResults;

      send({ type: 'progress', data: { phase: 'summarizing', progress: 40, message: 'Building context...' } });

      // Optimized for lightweight resource usage
      const summaryMaxTokens = lightweightMode ? 800 : 1500; // Increased to reduce multiple passes
      const summaryTemp = lightweightMode ? 0.08 : 0.12; // Lower temperature reduces computation overhead

      send({ type: 'progress', data: { phase: 'summarizing', progress: 60, message: 'Deep reasoning and synthesis...' } });

      // Multi-pass approach: First pass for comprehensive analysis
      send({ type: 'progress', data: { phase: 'summarizing', progress: 65, message: 'First pass: Comprehensive analysis...' } });

      // PROACTIVE VALIDATION: Ensure summarizer prompt and context are valid
      if (!summarizerPrompt || typeof summarizerPrompt !== 'string' || summarizerPrompt.trim().length === 0) {
        console.error('[Chat Stream] Invalid summarizer prompt, using fallback');
        const fallbackPrompt = 'You are a helpful assistant. Summarize the information provided.';
        summarizerPrompt = fallbackPrompt;
      }

      if (!summaryContext || typeof summaryContext !== 'string' || summaryContext.trim().length === 0) {
        console.warn('[Chat Stream] Empty summary context, adding fallback');
        summaryContext = `User Question: ${userMessage}\n\nNo execution results available. Please provide a helpful response based on general knowledge.`;
      }

      // PROACTIVE VALIDATION: Validate inputs before calling summarizer model
      if (!summarizerPrompt || summarizerPrompt.trim().length === 0) {
        throw new Error('Summarizer prompt is empty');
      }
      if (!summaryContext || summaryContext.trim().length === 0) {
        console.warn('[Chat Stream] Empty summary context, using fallback');
        summaryContext = `User Question: ${userMessage}\n\nNo execution results available.`;
      }

      // Use orchestrator for summarizer phase with custom context
      let summary: string;
      let finalSummary: string;
      try {
        // PROACTIVE VALIDATION: Validate model configuration before calling
        if (!defaultModel || typeof defaultModel !== 'string' || defaultModel.trim().length === 0) {
          throw new Error('Invalid model configuration');
        }

        // Normalize plan intent for orchestrator compatibility (if not already normalized)
        const normalizedPlanForSummarizer = {
          ...plan,
          intent: ((plan.intent as string) === 'identity' ? 'other' : plan.intent) as import('@scorpion/core').ScorpionIntent | undefined,
        };

        console.log('[Chat Stream] Calling orchestrator.runSummarizer. Plan steps:', plan.plan.length, 'results:', results.length);

        // Power of 10 Rule 3: Use phase module for summarizer
        const summarizerResult = await handleSummarizerPhase({
          plan: normalizedPlanForSummarizer,
          userMessage,
          conversationHistory,
          results,
          consensus,
          orchestrator,
          send,
          checkAbort,
          summaryContext,
        });

        summary = summarizerResult.summary;
        // Use sanitizedSummary as starting point for further processing
        finalSummary = summarizerResult.sanitizedSummary;
      } catch (summaryError: any) {
        console.error('[Chat Stream] Summarizer error:', summaryError);
        const errorMessage = summaryError?.message || summaryError?.toString() || 'Unknown error';
        summary = `I encountered an error while generating a response: ${errorMessage}. Please try again.`;
        finalSummary = summary; // Use summary as fallback
        console.log('[Chat Stream] Using fallback summary. Length:', summary.length);
      }

      // Second pass: Refinement and quality check (if not in lightweight mode)
      // finalSummary is already set from summarizerResult.sanitizedSummary above
      if (!lightweightMode && summary.length > 100) {
        send({ type: 'progress', data: { phase: 'summarizing', progress: 85, message: 'Second pass: Refining and verifying...' } });

        // Create refinement prompt
        const refinementPrompt = `You are refining a response to ensure Claude Sonnet 4.5 level quality.

ORIGINAL RESPONSE:
${summary}

USER QUESTION:
${userMessage}

REFINEMENT TASKS:
1. Verify all facts are accurate and properly attributed
2. Ensure logical flow and clear structure
3. Check for completeness - are all important points covered?
4. Improve clarity and readability where needed
5. Ensure the response directly answers the user's question
6. Maintain appropriate tone and style
7. Add any missing context or connections that would improve understanding

Provide the refined response. If the original is already excellent, you may return it with minor improvements. Focus on enhancing clarity, completeness, and accuracy.`;

        try {
          const refined = await runModelUnified(
            'You are a quality refinement system. Improve responses for clarity, accuracy, and completeness while maintaining the original meaning and style.',
            refinementPrompt,
            {
              provider: provider || 'ollama',
              model: defaultModel,
              maxTokens: Math.min(summaryMaxTokens, summary.length + 500), // Allow some expansion
              temperature: 0.1 // Very low for refinement
            },
            undefined,
            conversationHistory
          );

          // Use refined version if it's better (longer and more detailed)
          if (refined && refined.length > summary.length * 0.8) {
            finalSummary = refined;
          }
        } catch (refinementError) {
          console.warn('[Chat Stream] Refinement pass failed, using original:', refinementError);
          // Continue with original summary if refinement fails
        }
      }

      send({ type: 'progress', data: { phase: 'summarizing', progress: 90, message: 'Finalizing response...' } });

      // FRONTIER-LEVEL: Self-correction with intent-aware rules
      const uncertaintyIndicators = [
        /(i don't know|i'm not sure|unclear|uncertain|unable to determine|cannot find|no information|not available|missing|incomplete)/i,
        /(could you|can you|would you|please provide|need more|require additional|lack of)/i,
        /(based on limited|with the available|from what i can see|appears to be|seems like|might be|possibly)/i,
      ];

      const hasUncertainty = uncertaintyIndicators.some(pattern => pattern.test(finalSummary));
      const hasInsufficientData = !hasResults || (hasFilesRecent && filesRecentResults.every(r => !r.files || r.files.length === 0));

      // Build self-correction context
      const selfCorrectionContext: SelfCorrectionContext = {
        intent,
        hasUsefulData: hasResults || hasKnowledge || hasFilesRecent,
        hasErrorExplanation: finalSummary.length > 50 && !hasUncertainty,
        toolsUsed: results.map((r: any) => r.tool || r.step?.tool).filter(Boolean),
        results: results.map((r: any) => ({
          tool: r.tool || r.step?.tool || 'unknown',
          result: r.result || r,
        })),
      };

      let additionalResults: any[] = [];
      let retrySteps: any[] = [];

      // FRONTIER-LEVEL: Use shouldSelfCorrect() to determine if self-correction is allowed
      const shouldTriggerSelfCorrection = shouldSelfCorrect(selfCorrectionContext);

      // If uncertain or insufficient data AND self-correction is allowed, trigger it
      if ((hasUncertainty || hasInsufficientData) && shouldTriggerSelfCorrection) {
        console.log('[Chat Stream] Self-correction: Detected uncertainty or insufficient data, triggering additional tool calls');
        send({
          type: 'status',
          data: {
            message: 'Noticing gaps in information - gathering additional details...',
            phase: 'self_correcting'
          }
        });
        send({
          type: 'tool',
          data: {
            tool: 'self_correction',
            callId: 'self_correct_1',
            args: { reason: hasUncertainty ? 'uncertainty_detected' : 'insufficient_data' },
            status: 'running'
          }
        });

        // Analyze what information might be missing based on the query
        const needsMoreFiles = isFileQuery && (!hasFilesRecent || filesRecentResults.every(r => !r.files || r.files.length === 0));
        // FRONTIER-LEVEL: Use shouldSelfCorrect() result instead of manual checks
        const needsMoreKnowledge = !hasKnowledge && !kbAttempted && shouldUseKnowledgeBase(intent);
        const needsCodeFiles = /(code|implementation|function|class|file|read|show)/i.test(userMessage) && codeReadResults.length === 0;

        // Trigger additional tool calls based on what's missing
        if (needsMoreFiles) {
          console.log('[Chat Stream] Self-correction: Retrying files.recent with different parameters');
          try {
            const retryResult = await executeTool('files.recent', { limit: 20, source: 'all' });
            if (retryResult?.ok && retryResult?.files && retryResult.files.length > 0) {
              additionalResults.push({ step: 'self_correct_files', result: retryResult });
              retrySteps.push({
                id: 'self_correct_files',
                tool: 'files.recent',
                title: 'Retry: Get recent files (expanded search)',
                status: 'completed',
                result: retryResult,
                isRetry: true
              });
              send({
                type: 'tool',
                data: {
                  tool: 'files.recent',
                  callId: 'self_correct_files',
                  args: { limit: 20, source: 'all' },
                  status: 'completed',
                  result: retryResult,
                  isRetry: true
                }
              });

              // Update filesRecentResults with new data
              filesRecentResults.push(retryResult);
            }
          } catch (error: any) {
            console.warn('[Chat Stream] Self-correction: files.recent retry failed:', error);
          }
        }

        // FRONTIER-LEVEL: Use shouldSelfCorrect() to determine if KB self-correction is allowed
        // This already checks for system_debug, operational, and side-effect tools
        const allowKBSelfCorrection = needsMoreKnowledge && !kbAttempted && shouldTriggerSelfCorrection;

        if (allowKBSelfCorrection && isToolSafeForSelfCorrection('kb.search')) {
          console.log('[Chat Stream] Self-correction: Trying knowledge base search');
          try {
            const kbResult = await executeTool('kb.search', { query: userMessage, limit: 5 });
            if (kbResult?.ok && kbResult?.hits && kbResult.hits.length > 0) {
              // Filter KB hits by similarity threshold (minimum 0.5 to avoid unrelated docs)
              const MIN_SIMILARITY = 0.5;
              const filteredHits = kbResult.hits.filter((hit: any) => {
                const score = hit.score || hit.similarity || 0;
                return score >= MIN_SIMILARITY;
              });

              // Only use KB results if we have hits above threshold
              if (filteredHits.length > 0) {
                kbResult.hits = filteredHits;
                additionalResults.push({ step: 'self_correct_kb', result: kbResult });
                retrySteps.push({
                  id: 'self_correct_kb',
                  tool: 'kb.search',
                  title: 'Retry: Search knowledge base',
                  status: 'completed',
                  result: kbResult,
                  isRetry: true
                });
                send({
                  type: 'tool',
                  data: {
                    tool: 'kb.search',
                    callId: 'self_correct_kb',
                    args: { query: userMessage, limit: 5 },
                    status: 'completed',
                    result: kbResult,
                    isRetry: true
                  }
                });

                // Update knowledge hits
                prioritizedKnowledgeHits.push(...kbResult.hits);
                kbHasResults = true;
              }
            }
          } catch (error: any) {
            console.warn('[Chat Stream] Self-correction: kb.search retry failed:', error);
          }
        }

        if (needsCodeFiles && !isFileQuery) {
          console.log('[Chat Stream] Self-correction: Trying code.readFile for relevant files');
          try {
            // Try to find relevant code files based on the query
            const codeQuery = userMessage.toLowerCase();
            const relevantFiles: string[] = [];

            // Simple heuristic: if query mentions specific terms, try to find matching files
            if (/route|api|endpoint/i.test(codeQuery)) {
              relevantFiles.push('apps/scorpion/app/api/chat/stream/route.ts');
            }
            if (/tool|function/i.test(codeQuery)) {
              relevantFiles.push('apps/scorpion/lib/chat/tools/files.ts');
            }

            for (const filePath of relevantFiles.slice(0, 2)) {
              try {
                const codeResult = await executeTool('code.readFile', { path: filePath });
                if (codeResult?.ok && codeResult?.content) {
                  additionalResults.push({ step: `self_correct_code_${filePath}`, result: codeResult });
                  retrySteps.push({
                    id: `self_correct_code_${filePath}`,
                    tool: 'code.readFile',
                    title: `Retry: Read ${filePath}`,
                    status: 'completed',
                    result: codeResult,
                    isRetry: true
                  });
                  send({
                    type: 'tool',
                    data: {
                      tool: 'code.readFile',
                      callId: `self_correct_code_${filePath}`,
                      args: { path: filePath },
                      status: 'completed',
                      result: codeResult,
                      isRetry: true
                    }
                  });

                  codeReadResults.push({
                    path: filePath,
                    content: codeResult.content,
                    ast: codeResult.ast,
                    dependencies: Array.isArray(codeResult.dependencies) ? codeResult.dependencies : [],
                    language: codeResult.language || 'typescript'
                  });
                }
              } catch (error: any) {
                // Skip if file doesn't exist
              }
            }
          } catch (error: any) {
            console.warn('[Chat Stream] Self-correction: code.readFile retry failed:', error);
          }
        }

        // If we got additional results, regenerate the summary
        if (additionalResults.length > 0) {
          console.log(`[Chat Stream] Self-correction: Got ${additionalResults.length} additional results, regenerating response`);
          send({
            type: 'status',
            data: {
              message: 'Found additional information - updating response with facts...',
              phase: 'self_correcting'
            }
          });

          // Rebuild summary context with additional results
          let updatedSummaryContext = summaryContext;

          // Add additional files.recent results
          additionalResults.filter(r => r.step === 'self_correct_files').forEach(({ result }) => {
            if (result.files && result.files.length > 0) {
              updatedSummaryContext += `\n\nADDITIONAL INFORMATION FOUND (Self-correction):\nRecently uploaded/accessed files:\n`;
              updatedSummaryContext += `Found ${result.files.length} file${result.files.length > 1 ? 's' : ''}:\n`;
              result.files.forEach((file: any, index: number) => {
                updatedSummaryContext += `${index + 1}. ${file.path || 'Unknown file'}`;
                if (file.ageMinutes !== undefined) {
                  const hours = Math.floor(file.ageMinutes / 60);
                  const minutes = file.ageMinutes % 60;
                  if (hours > 0) {
                    updatedSummaryContext += ` (${hours}h ${minutes}m ago)`;
                  } else {
                    updatedSummaryContext += ` (${minutes}m ago)`;
                  }
                }
                if (file.isImage) {
                  updatedSummaryContext += ` [IMAGE]`;
                }
                updatedSummaryContext += `\n`;
              });
              updatedSummaryContext += `\n`;
            }
          });

          // Add additional knowledge base results
          additionalResults.filter(r => r.step === 'self_correct_kb').forEach(({ result }) => {
            if (result.hits && result.hits.length > 0) {
              updatedSummaryContext += `\n\nADDITIONAL INFORMATION FOUND (Self-correction):\nKnowledge base search results:\n`;
              result.hits.forEach((hit: any) => {
                updatedSummaryContext += `- ${hit.title || 'Untitled'}${hit.url ? ` (${hit.url})` : ''}\n`;
                if (hit.spans?.[0]?.text) {
                  updatedSummaryContext += `  ${hit.spans[0].text.substring(0, 200)}...\n`;
                }
              });
              updatedSummaryContext += `\n`;
            }
          });

          // Add additional code file results
          additionalResults.filter(r => r.step.startsWith('self_correct_code_')).forEach(({ result }) => {
            if (result.content) {
              updatedSummaryContext += `\n\nADDITIONAL INFORMATION FOUND (Self-correction):\nCode file content:\n${result.content.substring(0, 2000)}...\n\n`;
            }
          });

          updatedSummaryContext += `\nCRITICAL: You now have ADDITIONAL INFORMATION from self-correction. Use this new information to provide a more complete, factual answer. Replace any uncertainty with concrete facts from the additional sources above.\n\n`;

          // Regenerate summary with updated context
          try {
            const correctedSummary = await runModelUnified(
              summarizerPrompt + '\n\nIMPORTANT: You have additional information from self-correction. Use it to provide a complete, factual answer.',
              updatedSummaryContext,
              {
                provider: provider || 'ollama',
                model: defaultModel,
                maxTokens: summaryMaxTokens,
                temperature: summaryTemp
              },
              undefined,
              conversationHistory
            );

            if (correctedSummary && correctedSummary.trim().length > 0) {
              finalSummary = correctedSummary;
              console.log('[Chat Stream] Self-correction: Successfully regenerated response with additional information');
              send({
                type: 'tool',
                data: {
                  tool: 'self_correction',
                  callId: 'self_correct_1',
                  status: 'completed',
                  result: {
                    retries: retrySteps.length,
                    additionalResults: additionalResults.length
                  }
                }
              });
            }
          } catch (error: any) {
            console.warn('[Chat Stream] Self-correction: Failed to regenerate summary:', error);
          }
        } else {
          send({
            type: 'tool',
            data: {
              tool: 'self_correction',
              callId: 'self_correct_1',
              status: 'completed',
              result: {
                retries: 0,
                reason: 'no_additional_information_found'
              }
            }
          });
        }
      }

      // DIRECT RESPONSE FOR FILE QUERIES: Generate fact-based response directly from tool results
      // This bypasses the summarizer to ensure 100% fact-based responses
      if (isFileQuery) {
        if (hasFilesRecent) {
          const allFiles = filesRecentResults.flatMap(r => (r.files && Array.isArray(r.files)) ? r.files : []);
          if (allFiles.length > 0) {
            // Generate direct response listing actual files
            let directResponse = `Here are the ${allFiles.length} recent file${allFiles.length > 1 ? 's' : ''}:\n\n`;
            allFiles.forEach((file: any, index: number) => {
              directResponse += `${index + 1}. ${file.path || 'Unknown file'}`;
              if (file.ageMinutes !== undefined) {
                const hours = Math.floor(file.ageMinutes / 60);
                const minutes = file.ageMinutes % 60;
                if (hours > 0) {
                  directResponse += ` (${hours}h ${minutes}m ago)`;
                } else {
                  directResponse += ` (${minutes}m ago)`;
                }
              }
              if (file.size) {
                const sizeKB = Math.round(file.size / 1024);
                directResponse += ` - ${sizeKB}KB`;
              }
              if (file.isImage) {
                directResponse += ` [IMAGE]`;
              }
              if (file.contentType) {
                directResponse += ` (${file.contentType})`;
              }
              directResponse += `\n`;
            });
            finalSummary = directResponse;
            console.log('[Chat Stream] File query: Generated direct fact-based response with', allFiles.length, 'files');
          } else {
            // files.recent executed but returned empty array
            finalSummary = 'No recent files were found.';
            console.log('[Chat Stream] File query: Generated direct fact-based response - files.recent returned empty array');
          }
        } else {
          // File query but files.recent was not executed (should not happen due to enforcement)
          finalSummary = 'No recent files were found.';
          console.log('[Chat Stream] File query: Generated direct fact-based response - files.recent not executed');
        }
      }

      // INTENT-AWARE KB DISCLAIMER: Only show disclaimer when KB was attempted, has no results, AND intent allows it
      // For small_talk and general_question, never show KB disclaimer (KB wasn't used)
      if (
        kbAttempted &&
        !kbHasResults &&
        shouldUseKnowledgeBase(intent) &&
        !finalSummary.toLowerCase().includes('not found') &&
        !finalSummary.toLowerCase().includes('no information') &&
        !isFileQuery // Skip KB disclaimer for file queries - they have their own response
      ) {
        // Only append KB disclaimer if KB was actually attempted and intent allows it
        finalSummary = finalSummary + '\n\n*Note: No specific information was found in the knowledge base. The answer above is based on general knowledge.';
      }

      // ========================================================================
      // POST-FLIGHT: Style Enforcer → Memory Manager
      // ========================================================================

      // 1. Style Enforcer (intent-aware, strictly non-blocking)
      if (helperConfig.useStyleEnforcer && process.env['SCORPION_ENABLE_STYLE_ENFORCER'] !== '0') {
        console.log(`[Helper Config] Running style-enforcer for intent: ${intent}`);
        try {
          const tone = isCasual ? 'casual' : (intent === 'project_help' || intent === 'system_debug' ? 'technical' : 'operational');
          const styled = await runPromptWithKillSwitch(
            'style-enforcer.system.txt',
            { draft: finalSummary, tone },
            StyleEnforcerSchema,
            modelConfig,
            runModelForPrompt
          );

          if (styled && styled.edits && styled.edits.length > 0) {
            // Apply edits (simple approach: replace from→to)
            // Power of 10 Rule 2: Bounded loop
            let styledText = finalSummary;
            const MAX_EDITS = 1000;
            const editsToApply = styled.edits.slice(0, MAX_EDITS);
            for (let i = 0; i < editsToApply.length; i++) {
              const edit = editsToApply[i];
              if (edit && edit.from && edit.to) {
                styledText = styledText.replace(edit.from, edit.to);
              }
            }
            finalSummary = styledText;
            console.log('[Style Enforcer] Applied', editsToApply.length, 'edits');
          }
        } catch (error: any) {
          console.warn('[Chat Stream] Style enforcer failed, using original:', error.message);
          // Continue with original text - style enforcer is non-blocking
        }
      } else {
        console.log(`[Helper Config] Skipping style-enforcer for intent: ${intent}`);
      }

      // 2. Memory Manager (intent-aware, strictly non-blocking)
      if (helperConfig.useMemoryManager && process.env['SCORPION_ENABLE_MEMORY_MANAGER'] !== '0') {
        console.log(`[Helper Config] Running memory-manager for intent: ${intent}`);
        try {
          const memoryDecision = await runPromptWithKillSwitch(
            'memory-manager.system.txt',
            { q: userMessage, a: finalSummary },
            MemoryManagerSchema,
            modelConfig,
            runModelForPrompt
          );

          if (memoryDecision && memoryDecision.decision === 'store' && memoryDecision.memory) {
            // Store in memory system
            const memoryKey = memoryDecision.memory.key;
            const memoryValue = memoryDecision.memory.value;
            const memoryType = memoryDecision.memory.type;

            console.log('[Memory Manager] Storing:', memoryType, memoryKey, memoryValue);

            // Store in short-term conversation memory
            remember(conversationId, `[${memoryType}] ${memoryKey}: ${memoryValue}`);

            // For identity-type memories (like user name), also store in RAG for long-term persistence
            // Power of 10 Rule 7: Guard type narrowing - cast to string for comparison
            if ((memoryType as string) === 'identity' && memoryKey === 'user_name') {
              try {
                const { getRAGStore } = await import('@/lib/shared-stores');
                const ragStore = await getRAGStore();
                // Power of 10 Rule 7: Use correct RAGStore method - addKnowledge instead of add
                // Type must be one of: 'architecture' | 'feature' | 'pattern' | 'integration' | 'best-practice'
                await ragStore.addKnowledge({
                  id: `user-identity-${conversationId}-${Date.now()}`,
                  source: 'user-input',
                  type: 'feature', // Use 'feature' as closest match for user-identity
                  category: 'user-identity',
                  title: `User Identity: ${memoryValue}`,
                  description: `User name: ${memoryValue}. This is the system owner and master.`,
                  codeSnippets: [], // Required field
                  patterns: [], // Required field
                  dependencies: [], // Required field
                  useCases: [], // Required field
                  tags: ['user', 'identity', 'name', conversationId],
                  extractedAt: new Date().toISOString(),
                });
                console.log('[Memory Manager] Stored user identity in RAG for long-term persistence');
              } catch (error: any) {
                console.warn('[Memory Manager] Failed to store in RAG:', error.message);
                // Continue - short-term memory is still stored
              }
            }
          }
        } catch (error: any) {
          console.warn('[Chat Stream] Memory manager failed, skipping storage:', error.message);
          // Continue without storing - memory manager is non-blocking
        }
      } else {
        console.log(`[Helper Config] Skipping memory-manager for intent: ${intent}`);
      }

      // JARVIS MODE: Sanitize permission-related messages
      // Replace any permission/access denial messages with technical error explanations
      const permissionPatterns = [
        /Error logs are not available in client mode/i,
        /not available for public viewing/i,
        /please contact support/i,
        /you don't have (permission|access)/i,
        /not authorized/i,
        /access denied/i,
      ];

      let sanitizedSummary = finalSummary || '';

      // Ensure we have a summary - if empty, use a fallback
      if (!sanitizedSummary || sanitizedSummary.trim().length === 0) {
        console.warn('[Chat Stream] finalSummary is empty, using fallback');
        sanitizedSummary = 'I processed your request. If you need more details, please ask a specific question.';
      }
      // Power of 10 Rule 2: Bounded loop
      const MAX_PATTERNS = 100;
      const patternsToCheck = permissionPatterns.slice(0, MAX_PATTERNS);
      for (let i = 0; i < patternsToCheck.length; i++) {
        const pattern = patternsToCheck[i];
        if (!pattern) continue;
        if (pattern.test(sanitizedSummary)) {
          console.warn('[Chat Stream] Detected permission-related message, sanitizing...');
          // Replace with technical error explanation
          sanitizedSummary = sanitizedSummary.replace(
            pattern,
            'I tried to fetch the information but encountered a technical error (e.g., timeout, service unavailable, or missing resource). Check the terminal output or server logs for details.'
          );
        }
      }

      // Stream summary in chunks - Power of 10 Rule 3: Extract to helper
      streamFinalAnswer(
        sanitizedSummary,
        lightweightMode,
        send,
        () => req.signal.aborted || streamState.aborted
      );

      // Remember in memory (use sanitized version)
      remember(conversationId, `User: ${userMessage}\nAssistant: ${sanitizedSummary}`);

      // MARK ALL PLAN STEPS AS COMPLETED: For small_talk and other intents with tool: 'none', mark steps as completed
      // This ensures the UI shows correct status (not "Pending" forever)
      // Power of 10 Rule 2: Bounded loop
      const MAX_PLAN_STEPS = 1000;
      const planStepsToMark = plan.plan.slice(0, MAX_PLAN_STEPS);
      for (let i = 0; i < planStepsToMark.length; i++) {
        const step = planStepsToMark[i];
        if (!step) continue;
        // Only mark as completed if not already failed
        if (step.status !== 'failed') {
          send({
            type: 'plan_step',
            data: {
              ...step,
              status: 'completed',
            },
          });
        }
      }

      // Send final debug info with KB tracking
      send({
        type: 'debug',
        data: {
          intent,
          plan: {
            ...plan,
            plan: plan.plan.map((step: any) => ({
              ...step,
              status: step.status === 'failed' ? 'failed' : 'completed',
            })),
          },
          knowledge: {
            attempted: kbAttempted,
            hasResults: kbHasResults,
            results: kbHasResults ? knowledgeHitsForCouncil.map((hit: any) => ({
              source: hit.source || hit.url || 'unknown',
              snippet: hit.title || hit.description || '',
            })) : [],
          },
        },
      });

      // Final progress update
      send({ type: 'progress', data: { phase: 'summarizing', progress: 100, message: 'Complete' } });

      // Protocol Serialization - Power of 10 Rule 3: Extract to helper
      try {
        const protocol = serializeProtocol({
          conversationId: conversationId || 'unknown',
          intent: intent as string,
          plan,
          results,
          councilResult,
          consensus,
          knowledgeHitsForCouncil,
          userMessage,
        });

        // Send protocol as debug event (for now, can be logged to DB later)
        send({
          type: 'protocol',
          data: protocol,
        });

        console.log('[Protocol] Serialized orchestrator context:', {
          hasPlan: !!protocol.plan,
          hasCouncil: !!protocol.council,
          hasTools: !!protocol.tools,
          hasKnowledge: !!protocol.knowledge,
          hasObservability: !!protocol.observability,
          hasBrainMap: !!protocol.brain_map,
        });
      } catch (protocolError: unknown) {
        // Don't fail the request if protocol serialization fails
        console.warn('[Protocol] Failed to serialize context:', protocolError instanceof Error ? protocolError.message : String(protocolError));
      }

      // Stream the final answer BEFORE sending done event (only if not already streamed)
      // Note: streamFinalAnswer is already called at line 4588, so we only need to check if it was empty
      if (!sanitizedSummary || sanitizedSummary.trim().length === 0) {
        console.warn('[Chat Stream] No final summary available, sending fallback');
        send({ type: 'delta', data: { content: 'I processed your request but did not generate a response. Please try again.' } });
      } else {
        console.log('[Chat Stream] Final summary already streamed, length:', sanitizedSummary.length);
      }

      // Pattern Learning: Learn from this successful interaction
      try {
        const executionSuccess = determineExecutionSuccess(plan, results, councilResult);

        if (executionSuccess) {
          await learnFromInteraction({
            userMessage,
            plan,
            councilResult,
            executionSuccess: true,
            conversationLength: messages.length,
            userIntent: intent as string,
          });
          console.log('[Pattern Learning] Stored success pattern for future queries');
        } else {
          console.log('[Pattern Learning] Skipping pattern storage (execution not successful)');
        }
      } catch (learningError) {
        // Don't fail the request if learning fails
        console.warn('[Pattern Learning] Failed to store pattern:', learningError);
      }

      // Done
      console.log('[Chat Stream] Sending done event. messageId:', messageId);
      send({ type: 'done', data: { messageId } });
      console.log('[Chat Stream] Done event sent successfully');

      // Complete Job tracking
      if (chatJob) {
        completeChatJob(chatJob.id, sanitizedSummary);
      }

      console.log('[Chat Stream] Stream completion finished. Closing stream...');
    } catch (error: unknown) {
      // Power of 10 Rule 3: Extract error handling to focused function
      handleStreamError(error, req, streamState, send, chatJob);
    }
  } finally {
    console.log('[Chat Stream] Finally block executing. closed:', streamState.closed, 'aborted:', streamState.aborted);
    if (!streamState.closed) {
      streamState.closed = true;
      try {
        console.log('[Chat Stream] Closing controller in finally block');
        controller.close();
      } catch (closeError) {
        console.warn('[Chat Stream] Error closing controller:', closeError);
      }
    } else {
      console.log('[Chat Stream] Stream already closed, skipping close in finally');
    }
  }
}
