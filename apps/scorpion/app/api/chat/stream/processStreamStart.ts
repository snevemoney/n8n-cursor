// Power of 10 Rule 4: Extract large function to separate file
// This reduces file size and fixes TypeScript parser limitations
// File: processStreamStart.ts
// Original location: route.ts lines 156-5984

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
import { handleIdentityIntent, handleSmallTalkIntent, isSimpleGreeting } from './helpers/intentHandlers';
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
import { performEarlyRagSearch, extractKnowledgeHits, extractResearchResults, formatResearchSources, prioritizeKnowledgeHits } from './helpers/ragIntegration';
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
import { getHelperConfig, getHelperDefaults } from '@/lib/chat/helper-config';
import { shouldSelfCorrect, isToolSafeForSelfCorrection, type SelfCorrectionContext } from '@/lib/chat/self-correction';
import { getSummarizerPrompt } from '@/lib/chat/summarizer-config';
import { analyzeConversationHistory } from './helpers/historyAnalysis';
import { isToolAllowedForIntent, shouldUseKnowledgeBase } from '@/lib/chat/intent';
// parsePlannerResponse, enforcePlanRules, createFallbackPlan don't exist - using enforcePlan instead
import { applyPlanEnforcement } from './helpers/planEnforcement';
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

    // Power of 10 Rule 3: Extract request validation to focused function
    const validatedRequest = await validateRequest(messages, send, controller);
    if (!validatedRequest) {
      return; // Validation failed, error already sent
    }

    const { userMessage, messageId, filteredHistory, conversationHistory } = validatedRequest;

    // Power of 10 Rule 4: Define query classification variables close to usage
    const codebaseKeywords = /(lightningflow|lightning flow|scorpion|n8n|workflow|codebase|project|app|code|implementation|repository|repo|package|module)/i;
    const isCodebaseQuestionCheck = codebaseKeywords.test(userMessage);

    const isOperationalQuestion = /(system health|check system|system status|show logs|recent errors|system metrics|uptime|health check)/i.test(userMessage);
    const isWorkflowQuestion = /(trigger workflow|run workflow|workflow status|execute workflow|workflow id)/i.test(userMessage);
    const isAnalysisQuestion = /(analyze|analysis|investigate|debug|why|how|explain|trace|track|monitor)/i.test(userMessage);
    const isFileQuery = /(file|read|show|content|code|implementation|function|class)/i.test(userMessage) &&
      /(recent|latest|last|new|modified|updated|created|change)/i.test(userMessage);

    // Extract userId from request or use default
    const userId = 'evens'; // TODO: Extract from request if needed

    // Resource optimization: Auto-detect lightweight mode early (needed for transformer orchestrator)
    const lightweightMode = detectLightweightMode();

    // TRANSFORMER ORCHESTRATOR: Check if we should use transformer architecture
    // Check if transformer orchestrator is enabled
    const USE_TRANSFORMER = process.env.USE_TRANSFORMER_ORCHESTRATOR === 'true';

    if (USE_TRANSFORMER) {
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

    // INTENT CLASSIFICATION: Classify user intent BEFORE planning
    let intent: ScorpionIntent = classifyIntent(userMessage);
    console.log('[Intent]', userMessage, '→', intent);
    console.log('[Chat Stream] Classified intent:', intent, 'for message:', userMessage.substring(0, 50));

    // Send intent to debug tab
    send({
      type: 'debug',
      data: { intent, message: userMessage.substring(0, 100) }
    });

    // SHORT-CIRCUIT: Handle identity intent directly (no tools, no planner, no council)
    // Power of 10 Rule 3: Extract intent handling to focused function
    if (intent === 'identity') {
      console.log('[Chat Stream] Identity intent detected - using direct answer path (no tools, no planner)');
      send({
        type: 'status',
        data: { message: 'Answering as Scorpion...', phase: 'identity' }
      });

      const handled = await handleIdentityIntent(
        userMessage,
        conversationId,
        model,
        provider,
        send,
        streamState,
        controller,
        messageId
      );
      if (handled) {
        return; // Identity intent handled, stream closed
      }
    }

    // SHORT-CIRCUIT: Handle small_talk intent and simple greetings directly (no tools, no planner, no council)
    // Power of 10 Rule 7: Guard simple queries - bypass expensive operations for trivial messages
    // Power of 10 Rule 3: Extract greeting check to focused function
    if (intent === 'small_talk' || isSimpleGreeting(userMessage)) {
      console.log('[Chat Stream] Small talk intent detected - using direct conversational response (no tools, no planner)');
      send({
        type: 'status',
        data: { message: 'Responding...', phase: 'small_talk' }
      });

      // Power of 10 Rule 3: Extract small talk handling to focused function
      const handled = await handleSmallTalkIntent(
        userMessage,
        conversationHistory,
        model,
        provider,
        send,
        streamState,
        controller,
        messageId
      );
      if (handled) {
        return; // Small talk handled, stream closed
      }
    }

    // Continue with normal flow if small talk wasn't handled
    // Check if this is a user tool command (slash command OR natural language) or AI-callable tool with slash
    let detectedTool = null;
    try {
      detectedTool = detectUserTool(userMessage);
    } catch (error: any) {
      console.error('[Chat Stream] Error detecting user tool:', error);
      // Continue with normal flow if detection fails
    }

    if (detectedTool && !detectedTool.isAiTool) {
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
    } else if (detectedTool && detectedTool.isAiTool) {
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

    // conversationHistory is already defined above (line 651) - reuse it here

    // lightweightMode is already defined earlier (line 115) - reuse it here
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

    // Get intent-aware helper configuration
    const helperConfig = getHelperConfig(intent, lightweightMode);
    const helperDefaults = getHelperDefaults();

    // Log helper configuration for debugging
    console.log(`[Helper Config] Intent: ${intent}, Lightweight: ${lightweightMode}, ClientMode: ${context.clientMode}`);
    console.log(`[Helper Config] Safety: ${helperConfig.useSafetyGuard}, Budget: ${helperConfig.useBudgetGovernor}, Memory: ${helperConfig.useMemoryManager}, Style: ${helperConfig.useStyleEnforcer}`);

    // 1. Safety Guard (intent-aware, strictly non-blocking with tolerant parsing, mode-aware)
    const safetyGuardEnabled = helperConfig.useSafetyGuard && process.env['SCORPION_ENABLE_SAFETY_GUARD'] !== '0';
    console.log('[Safety Guard] System status:', {
      enabled: safetyGuardEnabled,
      envFlag: process.env['SCORPION_ENABLE_SAFETY_GUARD'],
      configFlag: helperConfig.useSafetyGuard,
      system: safetyGuardEnabled ? 'ACTIVE' : 'DISABLED',
    });
    // Note: Tolerant parsing is now handled in runPromptWithKillSwitch via registered helpers
    let safetyCheck: any = null;
    if (helperConfig.useSafetyGuard && process.env['SCORPION_ENABLE_SAFETY_GUARD'] !== '0') {
      try {
        // JARVIS MODE: Single-user system - use standard safety guard prompt
        // No need to customize based on clientMode since we're always owner
        const rawResponse = await runPromptWithKillSwitch(
          'safety-guard.system.txt',
          { question: userMessage, draft: '', clientMode: context.clientMode },
          SafetyGuardSchema,
          modelConfig,
          runModelForPrompt
        );

        // If kill-switch activated (rawResponse is null), use safe defaults immediately
        if (rawResponse) {
          safetyCheck = rawResponse;
        } else {
          // Kill-switch activated - use safe defaults (non-blocking)
          console.warn('[Chat Stream] Safety guard kill-switch activated, using safe defaults');
          safetyCheck = helperDefaults.safetyGuard;
        }

        if (safetyCheck && !safetyCheck.allowed) {
          send({
            type: 'error',
            data: {
              message: safetyCheck.safeAlternative || 'Request blocked by safety guard',
              phase: 'safety',
            },
          });
          send({
            type: 'message',
            data: {
              id: messageId,
              role: 'assistant',
              content: safetyCheck.safeAlternative || 'I cannot fulfill this request due to safety concerns.',
            },
          });
          send({ type: 'done', data: { messageId } });
          streamState.closed = true;
          controller.close();
          return;
        }
      } catch (error: any) {
        // Network/model errors - use safe defaults immediately
        console.warn('[Chat Stream] Safety guard failed, using defaults:', error.message);
        safetyCheck = helperDefaults.safetyGuard; // Use default: allowed=true
      }
    } else if (helperConfig.useSafetyGuard === false) {
      // Skip safety guard for this intent, use default
      console.log(`[Helper Config] Skipping safety-guard for intent: ${intent}`);
      safetyCheck = helperDefaults.safetyGuard;
    }

    // Deterministic fallback routing for critical intents (before LLM-based router)
    // Power of 10 Rule 3: Extracted to helpers/toolRouter.ts

    // 2. Tool Router (skip for identity/small_talk - they have no tools)
    const toolRouterEnabled = (intent as string) !== 'identity' && (intent as string) !== 'small_talk' && process.env['SCORPION_ENABLE_TOOL_ROUTER'] !== '0';
    console.log('[Tool Router] System status:', {
      enabled: toolRouterEnabled,
      intent: intent,
      envFlag: process.env['SCORPION_ENABLE_TOOL_ROUTER'],
      system: toolRouterEnabled ? 'ACTIVE' : 'DISABLED',
    });

    let routing: any = null;
    // Type assertion: intent can be 'identity' from local classifyIntent, but we handle it separately
    if (toolRouterEnabled) {
      // Check fallback first for critical queries
      const fallback = fallbackRoute(userMessage);
      if (fallback) {
        console.log('[Tool Router] Using deterministic fallback for:', userMessage);
        routing = {
          intent: fallback.intent,
          tools: fallback.tools.map((tool: string) => ({
            tool,
            reason: `Deterministic routing for ${fallback.intent}`,
            priority: 5
          })),
          notes: 'Deterministic fallback routing'
        };
      } else {
        // Try LLM-based router with retry and fallback
        // Power of 10 Rule 2: Bounded loop - explicit max retries
        const MAX_RETRIES = 2;
        let retries = MAX_RETRIES;
        let lastError: any = null;
        let iterationCount = 0;
        const MAX_ITERATIONS = 10; // Safety limit for while loop

        while (retries > 0 && iterationCount < MAX_ITERATIONS) {
          iterationCount++;
          try {
            routing = await runPromptWithKillSwitch(
              'tool-router.system.txt',
              { question: userMessage, history: conversationHistory.slice(-5) },
              ToolRouterSchema,
              modelConfig,
              runModelForPrompt
            );

            if (routing) {
              console.log('[Tool Router] Intent:', routing.intent, 'Tools:', routing.tools.map((t: any) => t.tool).join(', '));
              // Tool router can override intent classification
              if (routing.intent && routing.intent !== intent) {
                console.log(`[Tool Router] Overriding intent: ${intent} → ${routing.intent}`);
              }
              break; // Success, exit retry loop
            }
          } catch (error: any) {
            lastError = error;
            console.warn(`[Tool Router] Attempt ${MAX_RETRIES - retries + 1} failed:`, error.message);
            retries--;

            if (retries === 0) {
              // Final fallback: use deterministic routing if available, otherwise use default
              const finalFallback = fallbackRoute(userMessage);
              if (finalFallback) {
                console.log('[Tool Router] Using fallback after LLM failures');
                routing = {
                  intent: finalFallback.intent,
                  tools: finalFallback.tools.map((tool: string) => ({
                    tool,
                    reason: `Fallback routing after LLM failure`,
                    priority: 5
                  })),
                  notes: 'Fallback after JSON parsing failures'
                };
              } else {
                console.warn('[Chat Stream] Tool router failed after retries, using default intent:', lastError?.message);
              }
            }
          }
        }

        // Power of 10 Rule 2: Safety check
        if (iterationCount >= MAX_ITERATIONS) {
          console.warn('[Tool Router] Reached MAX_ITERATIONS limit, exiting retry loop');
        }
      }
    }

    // SPECIAL HANDLING: For web_research intent, force research.run tool to be included
    // The tool-router LLM may not suggest tools correctly for research queries
    if (intent === 'web_research') {
      console.log('[Tool Router] web_research intent detected - forcing research.run tool');
      if (!routing || !routing.tools || routing.tools.length === 0) {
        routing = {
          intent: 'web_research',
          tools: [
            {
              tool: 'research.run',
              why: 'Web research query requires the research.run tool for searching and analyzing web content',
              priority: 10
            }
          ],
          notes: 'Auto-configured for web_research intent'
        };
        console.log('[Tool Router] Created routing for web_research:', routing);
      } else if (!routing.tools.some((t: any) => t.tool === 'research.run')) {
        // Add research.run if not already present
        routing.tools.push({
          tool: 'research.run',
          why: 'Web research query requires the research.run tool',
          priority: 10
        });
        console.log('[Tool Router] Added research.run to existing routing');
      }
    }

    // 3. Budget Governor (intent-aware, strictly non-blocking)
    const budgetGovernorEnabled = helperConfig.useBudgetGovernor && process.env['SCORPION_ENABLE_BUDGET_GOVERNOR'] !== '0';
    console.log('[Budget Governor] System status:', {
      enabled: budgetGovernorEnabled,
      envFlag: process.env['SCORPION_ENABLE_BUDGET_GOVERNOR'],
      configFlag: helperConfig.useBudgetGovernor,
      system: budgetGovernorEnabled ? 'ACTIVE' : 'DISABLED',
    });

    let budget: any = null;
    if (budgetGovernorEnabled) {
      try {
        budget = await runPromptWithKillSwitch(
          'budget-governor.system.txt',
          { routing: routing || { intent, tools: [] } },
          BudgetGovernorSchema,
          modelConfig,
          runModelForPrompt
        );

        if (budget) {
          console.log('[Budget Governor] Budget:', budget.budget, 'Model choices:', budget.modelChoices);
          // Could override model selection based on budget recommendations
        }
      } catch (error: any) {
        console.warn('[Chat Stream] Budget governor failed, using defaults:', error.message);
        budget = helperDefaults.budgetGovernor; // Use default budget
      }
    } else if (helperConfig.useBudgetGovernor === false) {
      // Skip budget governor for this intent, use default
      console.log(`[Helper Config] Skipping budget-governor for intent: ${intent}`);
      budget = helperDefaults.budgetGovernor;
    }

    // 4. Dispatcher (optional, only if multi-machine setup)
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
    let finalIntent: ScorpionIntent = intent;
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

        // Power of 10 Rule 3: Use helper functions for plan validation and normalization
        // The plannerPhase module already returns a normalized plan, but we validate it here for safety
        if (!plan || typeof plan !== 'object' || !plan.plan || !Array.isArray(plan.plan)) {
          console.warn('[Planner] Plan structure invalid from plannerPhase, attempting tolerant parse...');
          // If plan is a string (raw response), try parsing it
          if (typeof plan === 'string') {
            const parsed = parsePlannerResponse(plan);
            if (parsed) {
              plan = parsed;
              console.log('[Planner] Successfully parsed plan from raw string');
            } else {
              throw new Error('Failed to parse plan JSON even with tolerant parser');
            }
          } else {
            throw new Error('Plan structure invalid and not parseable');
          }
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
        plan = enforcePlanRules(plan, finalIntent, userMessage);

        // Ensure plan has at least one step (even if it's a no-op)
        if (plan.plan.length === 0) {
          console.warn('[Chat Stream] Plan has no steps, using fallback plan');
          plan = createFallbackPlan(intent, userMessage);
        }

        // Power of 10 Rule 3: Use helper function for enhanced plan enforcement
        // Note: isWhatIsQuestion is declared in the fallback plan section below, so we skip duplicate declaration here

        if (plan.plan && plan.plan.length > 0) {
          // Power of 10 Rule 3: Use helper function for plan enforcement
          plan = applyPlanEnforcement({
            plan,
            userMessage,
            intent: finalIntent,
            historyAnalysis,
            isFileQuery,
          });
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

      // Plan validation: Detect and fix kb.search-heavy plans
      // BUT ONLY for intents that allow project tools - skip for small_talk AND file queries
      // CRITICAL: Skip this validation for file queries - they should use files.recent, not project.analyze/research.run
      if ((intent as string) !== 'small_talk' && !isFileQuery) {
        const kbSearchSteps = plan.plan.filter(step => step.tool === 'kb.search');
        const hasOnlyKbSearch = plan.plan.length === kbSearchSteps.length && kbSearchSteps.length > 0;
        const hasMultipleKbSearch = kbSearchSteps.length > 1;

        // If plan has only kb.search or multiple kb.search steps, inject appropriate tools
        if (hasOnlyKbSearch || hasMultipleKbSearch) {
          console.log('[Chat Stream] Plan validation: Detected kb.search-heavy plan, injecting appropriate tools');

          // Determine what tool to add based on question type AND intent
          if (isOperationalQuestion && (intent === 'project_help' || intent === 'system_debug')) {
            // Replace kb.search with system.health (only for project/system intents)
            plan.plan = plan.plan.map(step =>
              step.tool === 'kb.search'
                ? { ...step, tool: 'system.health', title: 'Check system health', args: { includeMetrics: true, includeAlerts: true } }
                : step
            );
          } else if (isWorkflowQuestion && (intent === 'project_help' || intent === 'system_debug')) {
            // Replace kb.search with project.analyze (only for project/system intents)
            plan.plan = plan.plan.map(step =>
              step.tool === 'kb.search'
                ? { ...step, tool: 'project.analyze', title: 'Analyze project and workflows', args: { includeFiles: true, includeDependencies: true } }
                : step
            );
          } else if (isAnalysisQuestion && (intent === 'project_help' || intent === 'system_debug')) {
            // Replace kb.search with project.analyze (only for project/system intents)
            plan.plan = plan.plan.map(step =>
              step.tool === 'kb.search'
                ? { ...step, tool: 'project.analyze', title: 'Analyze project structure', args: { includeFiles: true, includeDependencies: true } }
                : step
            );
          } else if (intent === 'general_question' || !isCodebaseQuestionCheck) {
            // For general questions, add research.run as follow-up (allowed for general_question)
            const lastKbSearch = kbSearchSteps[kbSearchSteps.length - 1];
            // Power of 10 Rule 7: Guard undefined
            if (lastKbSearch && lastKbSearch.id) {
              const lastKbSearchIndex = plan.plan.indexOf(lastKbSearch);
              if (lastKbSearchIndex >= 0) {
                plan.plan.splice(lastKbSearchIndex + 1, 0, {
                  id: `s${plan.plan.length + 1}`,
                  title: 'Research online if knowledge base insufficient',
                  tool: 'research.run',
                  args: { query: userMessage, depth: 'medium', category: 'general', maxSites: 5 },
                  dependsOn: [lastKbSearch.id],
                  success: 'Research completed'
                });
              }
            }
          }
        }
      }

      // Detect if this is a codebase question and enforce code.readFile steps
      // BUT ONLY for project_help/system_debug intents - skip for small_talk/general_question
      // Improved detection: Check for codebase-related keywords or questions about projects/apps
      const userMessageLower = userMessage.toLowerCase();
      // Codebase question if it mentions codebase keywords (reuse codebaseKeywords from line 361)
      const isCodebaseQuestion = codebaseKeywords.test(userMessage);
      const hasCodeReadSteps = plan.plan.some(step => step.tool === 'code.readFile');

      // If codebase question but no code.readFile steps, inject them
      // BUT ONLY if intent allows project/repo tools
      if (isCodebaseQuestion && !hasCodeReadSteps && (intent === 'project_help' || intent === 'system_debug')) {
        console.log('[Chat Stream] Codebase question detected but no code.readFile steps - injecting them');

        // Extract the subject (e.g., "LightningFlow" from various question patterns)
        const subjectPatterns = [
          /(?:what is|who is|tell me about|more details about|detailed analysis of|even more|even more detailed)\s+(?:about\s+)?([A-Za-z]+(?:\s+[A-Za-z]+)?)/i,
          /(?:about|on|regarding)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)/i
        ];

        let subject = null;
        for (const pattern of subjectPatterns) {
          const match = userMessage.match(pattern);
          if (match && match[1]) {
            subject = match[1].trim();
            break;
          }
        }

        const subjectLower = subject ? subject.toLowerCase() : userMessageLower;

        // Determine which app/package to read based on subject or message content
        // IMPORTANT: Check for workflow-related questions FIRST (before defaulting)
        const isWorkflowQuestion = /(workflow|n8n|execution|orchestration|automation|trigger workflow|run workflow)/i.test(userMessageLower) ||
          /(workflow|n8n|execution|orchestration)/i.test(subjectLower);

        let appPath = 'apps/scorpion'; // Default to Scorpion (the chat system itself)
        if (isWorkflowQuestion) {
          appPath = 'apps/n8n-cursor';
        } else if (userMessageLower.includes('scorpion') || subjectLower.includes('scorpion')) {
          appPath = 'apps/scorpion';
        } else if (userMessageLower.includes('n8n') || subjectLower.includes('n8n')) {
          appPath = 'apps/n8n-cursor';
        } else if (userMessageLower.includes('lightningflow') || userMessageLower.includes('lightning flow') || subjectLower.includes('lightningflow') || subjectLower.includes('lightning')) {
          appPath = 'apps/lightningflow';
        }

        // Find kb.search step to insert after it
        const kbSearchStep = plan.plan.find(s => s.tool === 'kb.search');
        const kbSearchIndex = kbSearchStep ? plan.plan.indexOf(kbSearchStep) : -1;

        // Analyze conversation history to see what files were read before
        const previouslyReadFiles = new Set<string>();
        if (conversationHistory && conversationHistory.length > 0) {
          const assistantMessages = conversationHistory
            .filter((msg: any) => msg.role === 'assistant')
            .map((msg: any) => msg.content)
            .join('\n');

          // Detect previously read files
          const filePatterns = [
            /README\.md/gi,
            /package\.json/gi,
            /src\/index\.ts/gi,
            /app\/page\.tsx/gi,
            /tsconfig\.json/gi,
          ];

          filePatterns.forEach(pattern => {
            if (pattern.test(assistantMessages)) {
              const fileName = pattern.source.replace(/[\\^$.*+?()[\]{}|]/g, '');
              previouslyReadFiles.add(fileName.toLowerCase());
            }
          });
        }

        // Create code.readFile steps with VARIED file selection to avoid repetition
        const codeReadSteps: PlanStep[] = [];
        let stepCounter = plan.plan.length + 1;

        // Define available file options for different apps
        const fileOptions: Record<string, Array<{ path: string, title: string, includeAST?: boolean, includeDependencies?: boolean }>> = {
          'apps/scorpion': [
            { path: `${appPath}/README.md`, title: 'Read main README', includeDependencies: true },
            { path: `${appPath}/package.json`, title: 'Read package.json' },
            { path: `${appPath}/app/page.tsx`, title: 'Read main page component', includeAST: true },
            { path: `${appPath}/tsconfig.json`, title: 'Read TypeScript configuration' },
            { path: `${appPath}/next.config.js`, title: 'Read Next.js configuration' },
            { path: `${appPath}/app/layout.tsx`, title: 'Read root layout', includeAST: true },
            { path: `${appPath}/lib/chat/types.ts`, title: 'Read type definitions' },
            { path: `${appPath}/tailwind.config.ts`, title: 'Read Tailwind configuration' },
          ],
          'apps/lightningflow': [
            { path: `${appPath}/README.md`, title: 'Read main README', includeDependencies: true },
            { path: `${appPath}/package.json`, title: 'Read package.json' },
            { path: `${appPath}/src/index.ts`, title: 'Read main entry point', includeAST: true, includeDependencies: true },
            { path: `${appPath}/tsconfig.json`, title: 'Read TypeScript configuration' },
            { path: `${appPath}/lightning-ui/README.md`, title: 'Read UI README', includeDependencies: true },
            { path: `${appPath}/lightning-ui/package.json`, title: 'Read UI package.json' },
            { path: `${appPath}/.env.example`, title: 'Read environment configuration' },
          ],
          'apps/n8n-cursor': [
            { path: `${appPath}/backend/README.md`, title: 'Read backend README', includeDependencies: true },
            { path: `${appPath}/backend/src/workers/workflow-worker.ts`, title: 'Read workflow worker implementation', includeAST: true },
            { path: `${appPath}/backend/src/index.ts`, title: 'Read backend entry point', includeAST: true },
            { path: `${appPath}/backend/package.json`, title: 'Read backend package.json' },
            { path: `docs/workflows/master-orchestration-guide.md`, title: 'Read workflow orchestration guide' },
            { path: `docs/workflows/workflow-overview.md`, title: 'Read workflow overview documentation' },
          ],
        };

        // Get file options for this app, or use default
        const availableFiles = fileOptions[appPath] || fileOptions['apps/scorpion'];

        // Power of 10 Rule 7: Guard undefined
        if (!availableFiles || availableFiles.length === 0) {
          console.warn('[Chat Stream] No available files for codebase question');
          return;
        }

        // Filter out files that were read before (to avoid repetition)
        const unusedFiles = availableFiles.filter(file => {
          const fileName = file.path.split('/').pop() || '';
          return !previouslyReadFiles.has(fileName.toLowerCase());
        });

        // Use unused files if available, otherwise use all files but shuffle
        const filesToRead = unusedFiles.length > 0
          ? unusedFiles.slice(0, Math.min(3, unusedFiles.length)) // Read up to 3 different files
          : availableFiles.slice(0, Math.min(3, availableFiles.length)); // Fallback: read first 3

        // If we still don't have enough variety, shuffle and pick different ones
        if (filesToRead.length < 2 && availableFiles.length > 2) {
          const shuffled = [...availableFiles].sort(() => Math.random() - 0.5);
          filesToRead.push(...shuffled.slice(0, 2 - filesToRead.length));
        }

        // Create steps for selected files
        filesToRead.forEach((file, index) => {
          codeReadSteps.push({
            id: `s${stepCounter++}`,
            title: (file.title || 'Read file') + ` to understand ${appPath.includes('lightningflow') ? 'LightningFlow' : appPath.includes('scorpion') ? 'Scorpion' : 'the codebase'}`,
            tool: 'code.readFile',
            args: {
              path: file.path || '',
              includeAST: file.includeAST || false,
              includeDependencies: file.includeDependencies || false
            },
            dependsOn: kbSearchStep?.id ? [kbSearchStep.id] : (index > 0 && codeReadSteps[index - 1] && codeReadSteps[index - 1]!.id ? [codeReadSteps[index - 1]!.id] : undefined),
            success: `${file.path.split('/').pop()} read successfully`
          });
        });

        // Insert code.readFile steps after kb.search
        if (kbSearchIndex >= 0) {
          plan.plan.splice(kbSearchIndex + 1, 0, ...codeReadSteps);
        } else {
          // If no kb.search, prepend code.readFile steps
          plan.plan.unshift(...codeReadSteps);
        }

        send({
          type: 'status',
          data: { message: 'Injected code.readFile steps for codebase question', phase: 'planning' }
        });
      }

      // ENFORCE INTENT-BASED TOOL GATING: Remove disallowed tools based on intent
      if (plan.plan && plan.plan.length > 0) {
        // For small_talk, remove ALL tools
        if ((intent as string) === 'small_talk') {
          console.log('[Chat Stream] Intent: small_talk - Removing all tools from plan');
          plan.plan = plan.plan.map(step => ({
            ...step,
            tool: 'none',
            title: step.title.replace(/analyze|search|read|trigger|check/i, 'respond'),
          }));
        } else {
          // For other intents, filter out disallowed tools (only for identity/small_talk)
          // FRONTIER MODEL APPROACH: All other intents allow all tools
          plan.plan = plan.plan.map(step => {
            if (!isToolAllowedForIntent(step.tool, intent as string, userMessage)) {
              console.log(`[Chat Stream] Intent: ${intent} - Removing disallowed tool: ${step.tool}`);
              // Replace with 'none' or remove the step
              return {
                ...step,
                tool: 'none',
                title: step.title.replace(/project\.analyze|code\.readFile|system\.health/i, 'general inquiry'),
              };
            }
            return step;
          });
        }
      }

      // ENFORCE ANTI-REPETITION AGAIN: Double-check before sending (in case enforcement above didn't work)
      // BUT ONLY for project_help/system_debug intents - skip for small_talk/general_question
      if (plan.plan && plan.plan.length > 0 && conversationHistory && conversationHistory.length > 0 &&
        (intent === 'project_help' || intent === 'system_debug')) {
        const firstStep = plan.plan[0];
        // Power of 10 Rule 7: Guard undefined
        if (!firstStep) return;
        if (firstStep.tool === 'kb.search') {
          console.debug('[Chat Stream] Final enforcement: Replacing kb.search before sending plan');
          const messageLower = userMessage.toLowerCase();

          // CRITICAL: Research queries MUST use research.run, NOT project.analyze
          const isResearchQuery = /(research|find.*latest|latest.*news|current.*news|recent.*news|bitcoin|ethereum|crypto|stock|market|macro.*economic|give.*top.*with.*links)/i.test(messageLower);
          if (isResearchQuery) {
            console.log('[Chat Stream] Research query detected - enforcing research.run instead of kb.search');
            plan.plan[0] = {
              ...firstStep,
              tool: 'research.run',
              args: {
                query: userMessage,
                depth: 'medium',
                maxSites: 5
              },
              title: 'Research latest news and information',
            };
          } else {
            const isCodebaseQuestion = /(lightningflow|lightning flow|scorpion|n8n|workflow|codebase|project|app|code|implementation|architecture|structure|components)/i.test(messageLower);

            if (isCodebaseQuestion) {
              plan.plan[0] = {
                ...firstStep,
                tool: 'project.analyze',
                args: { path: 'apps/scorpion', includeAST: true, includeDependencies: true },
                title: 'Analyze project structure and components',
              };
            } else {
              plan.plan[0] = {
                ...firstStep,
                tool: 'project.analyze',
                args: { path: 'apps/scorpion' },
                title: 'Analyze project structure',
              };
            }
          }
        }
      }

      // ABSOLUTE FINAL ENFORCEMENT: Research queries MUST use research.run
      // This runs right before executor to ensure research queries use the right tool
      const isResearchQueryFinal = /(research|find.*latest|latest.*news|current.*news|recent.*news|bitcoin|ethereum|crypto|stock|market|macro.*economic|give.*top.*with.*links)/i.test(userMessage.toLowerCase());

      // Check if research tools are available
      const hasResearchKeys = !!(process.env['TAVILY_API_KEY'] || process.env['NEWS_API_KEY'] || process.env['SERPAPI_KEY']);

      console.log('[Chat Stream] Research query enforcement check:', {
        isResearchQueryFinal,
        hasResearchKeys,
        intent,
        planLength: plan?.plan?.length,
        firstStepTool: plan?.plan?.[0]?.tool,
        allTools: plan?.plan?.map((s: any) => s.tool).join(', ')
      });

      // Enforce research.run for research queries across ALL intents (not just project_help/system_debug)
      if (isResearchQueryFinal && plan && plan.plan && plan.plan.length > 0) {

        // Check if research tools are available OR if DuckDuckGo is available (no API key needed)
        // DuckDuckGo is built into research.run and doesn't require API keys
        const hasResearchCapability = hasResearchKeys || true; // DuckDuckGo is always available

        if (hasResearchCapability) {
          // Check ALL steps, not just first
          const hasResearchTool = plan.plan.some((step: any) => step.tool === 'research.run' || step.tool === 'research.start');
          const hasProjectAnalyze = plan.plan.some((step: any) => step.tool === 'project.analyze');
          const hasCodeReadFile = plan.plan.some((step: any) => step.tool === 'code.readFile');

          // If plan doesn't use research.run OR has project.analyze OR has code.readFile, force research.run
          if (!hasResearchTool || hasProjectAnalyze || hasCodeReadFile) {
            console.log('[Chat Stream] 🚨 ABSOLUTE FINAL Enforcement: Research query detected - FORCING research.run');
            console.log('[Chat Stream] Current plan tools:', plan.plan.map((s: any) => s.tool).join(', '));
            console.log('[Chat Stream] Has research tool:', hasResearchTool, 'Has project.analyze:', hasProjectAnalyze, 'Has code.readFile:', hasCodeReadFile);

            // Replace first step with research.run if it's not already a research tool - Power of 10 Rule 7: Guard undefined
            if (plan.plan[0] && plan.plan[0].tool !== 'research.run' && plan.plan[0].tool !== 'research.start') {
              console.log('[Chat Stream] Replacing first step tool from', plan.plan[0].tool, 'to research.run');

              // Extract number from query if present (e.g., "latest 3 bitcoin news" → maxSites: 3)
              const numberMatch = userMessage.match(/(?:latest|last|top|first)\s+(\d+)/i);
              const maxSites = numberMatch ? parseInt(numberMatch[1], 10) : 5;

              plan.plan[0] = {
                ...plan.plan[0],
                id: plan.plan[0]?.id || 's1',
                tool: 'research.run',
                args: {
                  query: userMessage,
                  depth: 'medium',
                  maxSites: maxSites
                },
                title: `Research latest news and information (${maxSites} sources)`,
              };
            }

            // Remove ALL project.analyze steps for research queries
            const beforeFilter = plan.plan.length;
            plan.plan = plan.plan.filter((step: any) => {
              return step.tool !== 'project.analyze';
            });
            if (plan.plan.length < beforeFilter) {
              console.log('[Chat Stream] Removed', beforeFilter - plan.plan.length, 'project.analyze steps');
            }

            // Also remove code.readFile steps for research queries (not needed)
            const beforeCodeFilter = plan.plan.length;
            plan.plan = plan.plan.filter((step: any) => {
              return step.tool !== 'code.readFile';
            });
            if (plan.plan.length < beforeCodeFilter) {
              console.log('[Chat Stream] Removed', beforeCodeFilter - plan.plan.length, 'code.readFile steps');
            }

            console.log('[Chat Stream] ✅ ABSOLUTE FINAL: Enforced research.run. Final plan steps:', plan.plan.map((s: any) => s.tool).join(', '));
          } else {
            console.log('[Chat Stream] ✅ Research query already uses research.run correctly');
          }
        } else {
          // Research tools not available - inform user and use kb.search as fallback
          console.log('[Chat Stream] ⚠️ Research query detected but research tools are disabled (no API keys). Using kb.search fallback.');

          // Replace research.run with kb.search if present
          const hasResearchTool = plan.plan.some((step: any) => step.tool === 'research.run' || step.tool === 'research.start');
          if (hasResearchTool) {
            plan.plan = plan.plan.map((step: any) => {
              if (step.tool === 'research.run' || step.tool === 'research.start') {
                return {
                  ...step,
                  tool: 'kb.search',
                  args: { query: userMessage },
                  title: 'Search knowledge base for information',
                };
              }
              return step;
            });
            console.log('[Chat Stream] Replaced research.run with kb.search (research tools unavailable)');
          }
        }
      } else if (isResearchQueryFinal) {
        console.log('[Chat Stream] ⚠️ Research query detected but enforcement skipped:', {
          hasPlan: !!plan,
          planLength: plan?.plan?.length,
          intent,
          condition: intent === 'project_help' || intent === 'system_debug'
        });
      }

      // ABSOLUTE FINAL ENFORCEMENT: File queries MUST use files.recent - run right before executor
      // This is the last chance to fix the plan before execution
      if (isFileQuery && plan.plan && plan.plan.length > 0) {
        const firstStepTool = plan.plan[0]?.tool;
        if (firstStepTool !== 'files.recent') {
          console.log('[Chat Stream] ABSOLUTE FINAL Enforcement: File query detected but plan uses', firstStepTool, '- forcing files.recent');

          // Replace first step with files.recent - Power of 10 Rule 7: Guard undefined
          const currentStep = plan.plan[0];
          if (currentStep) {
            plan.plan[0] = {
              ...currentStep,
              id: currentStep.id || 's1',
              tool: 'files.recent',
              args: { limit: 10, source: 'upload' },
              title: 'Get recently uploaded files',
            };
          }

          // Remove ALL non-file-related steps
          plan.plan = plan.plan.filter((step: any, index: number) => {
            if (index === 0) return true; // Keep first step (files.recent)
            // Keep only file-related or image processing steps
            const allowedTools = ['knowledge.get', 'ocr.extract', 'files.recent'];
            return allowedTools.includes(step.tool);
          });

          console.log('[Chat Stream] ABSOLUTE FINAL: Enforced files.recent. Final plan steps:', plan.plan.map((s: any) => s.tool).join(', '));
        }
      }

      // ABSOLUTE FINAL ENFORCEMENT: System health queries MUST use system.health
      const isSystemHealthQuery = /(check system health|system health|health check|test system health|system.*health|analyze.*system.*health)/i.test(userMessage.toLowerCase());
      const isLogsQuery = /(check.*logs|recent.*logs|show.*logs|tail.*logs|get.*logs|analyze.*logs)/i.test(userMessage.toLowerCase());
      const isCombinedQuery = isSystemHealthQuery && isLogsQuery;

      if (isSystemHealthQuery && plan.plan) {
        const hasSystemHealth = plan.plan.some((step: any) => step.tool === 'system.health');
        const hasStatsGet = plan.plan.some((step: any) => step.tool === 'stats.get');
        const hasLogsTail = plan.plan.some((step: any) => step.tool === 'logs.tail');

        if (!hasSystemHealth) {
          console.log('[Chat Stream] 🚨 ABSOLUTE FINAL Enforcement: System health query detected - FORCING system.health');

          // Replace first step with system.health if it's not already a system health tool - Power of 10 Rule 7: Guard undefined
          if (plan.plan[0] && plan.plan[0].tool !== 'system.health' && plan.plan[0].tool !== 'stats.get' && plan.plan[0].tool !== 'logs.tail') {
            console.log('[Chat Stream] Replacing first step tool from', plan.plan[0].tool, 'to system.health');
            plan.plan[0] = {
              ...plan.plan[0],
              id: plan.plan[0]?.id || 's1',
              tool: 'system.health',
              title: 'Check system health and status',
              args: { includeMetrics: true, includeAlerts: true },
            };
          }

          // Add stats.get as second step if not present - Power of 10 Rule 7: Guard undefined
          if (!hasStatsGet && plan.plan.length > 0 && plan.plan[0]) {
            plan.plan.splice(1, 0, {
              id: 's2',
              title: 'Get system statistics',
              tool: 'stats.get',
              args: {},
              dependsOn: [plan.plan[0].id],
              success: 'System statistics retrieved'
            });
          }

          // For combined queries, also add logs.tail
          if (isCombinedQuery && !hasLogsTail) {
            console.log('[Chat Stream] 🚨 Combined query detected - FORCING logs.tail');
            const lastStep = plan.plan[plan.plan.length - 1];
            // Power of 10 Rule 7: Guard undefined
            if (lastStep && lastStep.id) {
              plan.plan.push({
                id: `s${plan.plan.length + 1}`,
                title: 'Get recent system logs',
                tool: 'logs.tail',
                args: { window: 300000, level: 'error' }, // Last 5 minutes, error level
                dependsOn: [lastStep.id],
                success: 'Recent logs retrieved'
              });
            }
          }

          console.log('[Chat Stream] ✅ ABSOLUTE FINAL: Enforced system.health. Final plan steps:', plan.plan.map((s: any) => s.tool).join(', '));
        } else {
          console.log('[Chat Stream] ✅ System health query already uses system.health correctly');

          // Still check for logs in combined queries
          if (isCombinedQuery && !hasLogsTail) {
            console.log('[Chat Stream] 🚨 Combined query - adding logs.tail');
            const lastStep = plan.plan[plan.plan.length - 1];
            // Power of 10 Rule 7: Guard undefined
            if (lastStep && lastStep.id) {
              plan.plan.push({
                id: `s${plan.plan.length + 1}`,
                title: 'Get recent system logs',
                tool: 'logs.tail',
                args: { window: 300000, level: 'error' },
                dependsOn: [lastStep.id],
                success: 'Recent logs retrieved'
              });
            }
          }
        }
      }

      // Also enforce logs.tail for standalone logs queries
      if (isLogsQuery && !isSystemHealthQuery && plan.plan) {
        const hasLogsTail = plan.plan.some((step: any) => step.tool === 'logs.tail');
        if (!hasLogsTail) {
          console.log('[Chat Stream] 🚨 Logs query detected - FORCING logs.tail');
          const firstStep = plan.plan[0];
          // Power of 10 Rule 7: Guard undefined
          if (firstStep && firstStep.tool !== 'logs.tail') {
            plan.plan[0] = {
              ...firstStep,
              id: firstStep.id || 's1',
              tool: 'logs.tail',
              title: 'Get recent system logs',
              args: { window: 300000, level: 'error' },
            };
          }
        }
      }

      // FIX INCORRECT FILE PATHS: Correct paths based on question type
      // Reuse messageLower from above (line 1241) - don't redeclare
      const isWorkflowQuestionForPathFix = /(workflow|n8n|execution|orchestration|automation|trigger workflow|run workflow)/i.test(userMessage.toLowerCase());

      if (isWorkflowQuestionForPathFix && plan.plan) {
        console.debug('[Chat Stream] Fixing file paths for workflow question');
        plan.plan.forEach((step: any) => {
          if (step.tool === 'code.readFile' && step.args && step.args.path) {
            // If step is trying to read lightningflow files for a workflow question, fix it
            // Power of 10 Rule 8: Limit pointer dereferencing - use intermediate variable
            const stepPath = step.args?.['path'];
            if (stepPath && typeof stepPath === 'string' && stepPath.includes('apps/lightningflow')) {
              const fileName = stepPath.split('/').pop();
              // Map to correct n8n-cursor paths
              if (fileName === 'tsconfig.json') {
                step.args.path = 'apps/n8n-cursor/backend/tsconfig.json';
                step.title = 'Read n8n-cursor backend TypeScript configuration';
              } else if (fileName === 'README.md' && stepPath.includes('lightning-ui')) {
                step.args.path = 'apps/n8n-cursor/backend/README.md';
                step.title = 'Read n8n-cursor backend README';
              } else if (fileName === 'README.md') {
                step.args.path = 'apps/n8n-cursor/backend/README.md';
                step.title = 'Read n8n-cursor backend README';
              } else {
                // Default to workflow worker
                step.args.path = 'apps/n8n-cursor/backend/src/workers/workflow-worker.ts';
                step.title = 'Read workflow worker implementation';
              }
              console.debug(`[Chat Stream] Fixed path: ${step.args.path}`);
            }
          }
        });
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

      // Extract code.readFile results from tool results
      // CRITICAL: Log what results we have before filtering
      console.log('[Chat Stream] Total results collected:', results.length);
      console.log('[Chat Stream] Results summary:', results.map(r => ({
        step: r.step,
        tool: plan.plan.find(s => s && s.id === r.step)?.tool,
        ok: r.result?.ok,
        hasContent: !!r.result?.content,
        hasHits: !!r.result?.hits,
        error: r.result?.error
      })));

      const codeReadResults = results
        .filter(r => {
          if (!r || !r.step || !r.result) {
            console.warn('[Chat Stream] Filtering out invalid result:', { step: r?.step, hasResult: !!r?.result });
            return false;
          }
          const step = plan.plan.find(s => s && s.id === r.step);
          const isCodeRead = step?.tool === 'code.readFile';
          const isOk = r.result?.ok === true;
          if (isCodeRead && !isOk) {
            console.warn('[Chat Stream] code.readFile step failed:', { step: r.step, error: r.result?.error });
          }
          return isCodeRead && isOk;
        })
        .map(r => {
          const step = plan.plan.find(s => s && s.id === r.step);
          const fileResult = {
            path: step?.args?.['path'] || 'unknown',
            content: r.result?.content || '',
            ast: r.result?.ast,
            dependencies: Array.isArray(r.result?.dependencies) ? r.result.dependencies : [],
            language: r.result?.language || 'unknown'
          };
          console.log('[Chat Stream] Extracted code.readFile result:', {
            path: fileResult.path,
            contentLength: fileResult.content.length,
            hasContent: fileResult.content.length > 0
          });
          return fileResult;
        });

      console.log('[Chat Stream] codeReadResults count:', codeReadResults.length);
      console.log('[Chat Stream] codeReadResults paths:', codeReadResults.map(f => f.path));

      // Extract knowledge hits and research results from tool results - improved extraction
      const knowledgeHits = extractKnowledgeHits(results);

      // Extract research.run results and their sources (merged logic)
      const researchResults = extractResearchResults(results, plan);

      console.log(`[Chat Stream] Research extraction:`, {
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
      // CRITICAL: Handle multiple possible locations for sources
      const researchSources = formatResearchSources(researchResults);

      console.log(`[Chat Stream] Research sources extracted:`, {
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

      // Extract knowledge search query from plan steps
      const knowledgeSearchStep = plan.plan.find((s: any) => s.tool === 'kb.search');
      const knowledgeSearchQuery = knowledgeSearchStep?.args?.['query'] || userMessage;

      // Re-calculate isWhatIsQuestion for later use in summarizer
      const userMessageLowerForWhatIs = userMessage.toLowerCase();
      const isWhatIsQuestion = /^(what is|who is|what are|who are|define|tell me about|explain what|explain who|more details|more analysis)/i.test(userMessageLowerForWhatIs) ||
        /^(what|who|which)\s+(is|are|was|were)/i.test(userMessageLowerForWhatIs);

      // Prioritize README files and main documentation for "what is" questions - improved detection
      let prioritizedKnowledgeHits = prioritizeKnowledgeHits(knowledgeHits, userMessage);

      // Extract tool results for better summarization with validation
      const systemHealthResults = results
        .filter(r => {
          if (!r || !r.step || !r.result) return false;
          const step = plan.plan.find(s => s && s.id === r.step);
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
          const step = plan.plan.find(s => s && s.id === r.step);
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
          const step = plan.plan.find(s => s && s.id === r.step);
          return step?.tool === 'project.analyze' && r.result?.ok === true;
        })
        .map(r => r.result)
        .filter(r => r && typeof r === 'object');

      // Extract files.recent results
      const filesRecentResults = results
        .filter(r => {
          if (!r || !r.step || !r.result) return false;
          const step = plan.plan.find(s => s && s.id === r.step);
          return step?.tool === 'files.recent' && r.result?.ok === true && r.result?.files;
        })
        .map(r => r.result)
        .filter(r => r && typeof r === 'object' && Array.isArray(r.files));

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

      // Build comprehensive context with actual results
      const hasKnowledge = prioritizedKnowledgeHits.length > 0;
      const hasResearch = researchResults.length > 0;
      const hasSystemHealth = systemHealthResults.length > 0;
      const hasLogs = logsResults.length > 0;
      const hasProjectAnalyze = projectAnalyzeResults.length > 0;
      // hasFilesRecent: true if files.recent was executed (even if it returned empty array)
      const hasFilesRecent = filesRecentResults.length > 0;
      // hasActualFiles: true only if files.recent returned actual files
      const hasActualFiles = hasFilesRecent && filesRecentResults.some(r => r.files && Array.isArray(r.files) && r.files.length > 0);
      const hasResults = hasKnowledge || hasResearch || hasSystemHealth || hasLogs || hasProjectAnalyze || codeReadResults.length > 0 || hasActualFiles;

      // Use questionType from plan for adaptive summarizer output
      const finalQuestionType = questionType; // Use the determined question type
      let summaryContext = '';

      // For tool testing requests, add comprehensive tool result summary
      const isToolTestingRequest = /(test.*all.*tool|test.*your.*tool|test.*every.*tool|test.*each.*tool|verify.*all.*tool|check.*all.*tool)/i.test(userMessage);
      if (isToolTestingRequest && results && results.length > 0) {
        summaryContext += `TOOL TESTING RESULTS:\n\n`;

        const successfulTools: string[] = [];
        const failedTools: Array<{ tool: string; error: string }> = [];

        results.forEach((r: any) => {
          const step = plan.plan.find((s: any) => s && s.id === r.step);
          const toolName = step?.tool || r.step;

          if (r.result?.ok === true) {
            successfulTools.push(toolName);
          } else {
            const errorMsg = r.result?.error?.message || r.result?.error || 'Unknown error';
            failedTools.push({ tool: toolName, error: errorMsg });
          }
        });

        summaryContext += `✅ SUCCESSFUL TOOLS (${successfulTools.length}):\n`;
        successfulTools.forEach(tool => {
          summaryContext += `- ${tool}\n`;
        });

        if (failedTools.length > 0) {
          summaryContext += `\n❌ FAILED TOOLS (${failedTools.length}):\n`;
          failedTools.forEach(({ tool, error }) => {
            summaryContext += `- ${tool}: ${error}\n`;
          });
        }

        summaryContext += `\nSUMMARY: Tested ${results.length} tools. ${successfulTools.length} succeeded, ${failedTools.length} failed.\n\n`;
        summaryContext += `CRITICAL: Report the exact results above. List which tools succeeded and which failed with their error messages. Do not make up results or use generic language.\n\n`;
      }

      // Add question context in natural format
      summaryContext += `User Question: ${userMessage}\n`;
      summaryContext += `Question Type: ${finalQuestionType}\n`;
      if (needsCouncil) {
        summaryContext += `Expert review was consulted\n`;
      }

      // Add note if research was requested but tools are unavailable
      // Reuse hasResearchKeys from earlier enforcement check (line 3104)
      const isResearchQueryForSummary = /(research|find.*latest|latest.*news|current.*news|recent.*news|bitcoin|ethereum|crypto|stock|market|macro.*economic|give.*top.*with.*links)/i.test(userMessage.toLowerCase());
      if (isResearchQueryForSummary && !hasResearchKeys) {
        summaryContext += `\n⚠️ NOTE: This appears to be a research query, but research tools are currently unavailable (no API keys configured: TAVILY_API_KEY, NEWS_API_KEY, or SERPAPI_KEY). I've searched the knowledge base instead, but for real-time news and information, please configure a research API key.\n`;
      }

      summaryContext += `\n`;

      // Add plan details in natural language
      summaryContext += `To answer this question, I:\n`;
      plan.plan.forEach((step: any) => {
        const stepResult = results.find((r: any) => r.step === step.id);
        const toolName = step.tool.replace(/\./g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
        const status = stepResult?.result?.ok ? 'successfully completed' : stepResult ? 'encountered an issue' : 'was not executed';
        summaryContext += `- ${toolName}: ${status}`;
        if (step.title) {
          summaryContext += ` (${step.title})`;
        }
        summaryContext += `\n`;
      });
      summaryContext += `\n`;

      // Build comprehensive context with code.readFile results (HIGHEST PRIORITY)
      if (codeReadResults.length > 0) {
        console.log('[Chat Stream] Adding code.readFile results to summarizer context');
        summaryContext += `Code files reviewed (${codeReadResults.length} file${codeReadResults.length > 1 ? 's' : ''}):\n`;
        codeReadResults.forEach((file, idx) => {
          console.log(`[Chat Stream] Adding file ${idx + 1}/${codeReadResults.length}: ${file.path} (${file.content.length} chars)`);
          summaryContext += `\nFile: ${file.path}`;
          if (file.language) {
            summaryContext += ` (${file.language})`;
          }
          summaryContext += `\n`;
          // CRITICAL: Include actual content, not empty string
          if (file.content && file.content.length > 0) {
            summaryContext += `${file.content}\n`;
          } else {
            console.warn(`[Chat Stream] File ${file.path} has no content!`);
            summaryContext += `[File content not available]\n`;
          }
          if (file.dependencies && file.dependencies.length > 0) {
            summaryContext += `Dependencies: ${file.dependencies.join(', ')}\n`;
          }
          if (file.ast) {
            const classes = file.ast.classes?.length || 0;
            const functions = file.ast.functions?.length || 0;
            if (classes > 0 || functions > 0) {
              summaryContext += `Structure: ${classes} class${classes !== 1 ? 'es' : ''}, ${functions} function${functions !== 1 ? 's' : ''}\n`;
            }
          }
        });
        summaryContext += `\nIMPORTANT: Use the actual code content above to provide specific, detailed answers. Reference actual function names, endpoints, and file paths from the code. Explain what the code does with concrete examples, not generic descriptions.\n\n`;
      }

      if (isCasual) {
        // For casual questions, prioritize knowledge base results over council consensus
        summaryContext += `User Question: ${userMessage}\n\n`;

        // Add system health results if available
        if (hasSystemHealth) {
          summaryContext += `System status:\n`;
          systemHealthResults.forEach((result) => {
            // Extract health data (handle both nested and flat formats)
            const health = result.data || result;

            summaryContext += `Status: ${health.status || 'unknown'}\n`;
            if (health.uptime) {
              const hours = Math.floor(health.uptime / 3600);
              const minutes = Math.floor((health.uptime % 3600) / 60);
              summaryContext += `Uptime: ${hours}h ${minutes}m\n`;
            }
            if (health.services) {
              const serviceNames = Object.keys(health.services);
              if (serviceNames.length > 0) {
                summaryContext += `Services: ${serviceNames.join(', ')}\n`;
              }
            }
            if (health.agents) {
              summaryContext += `Agents: ${health.agents.active || 0} active out of ${health.agents.total || 0} total\n`;
            }
            if (health.workflows) {
              summaryContext += `Workflows: ${health.workflows.active || 0} active out of ${health.workflows.total || 0} total\n`;
            }
            if (health.alerts && Array.isArray(health.alerts) && health.alerts.length > 0) {
              summaryContext += `Alerts: ${health.alerts.length} alert${health.alerts.length > 1 ? 's' : ''} found\n`;
              health.alerts.slice(0, 3).forEach((alert: any) => {
                summaryContext += `- ${alert.message || alert.type || 'Alert'}\n`;
              });
            }
          });
          summaryContext += `\n`;
        }

        // Add logs results if available
        if (hasLogs) {
          summaryContext += `Recent logs (${logsResults.reduce((sum, r) => {
            const logs = r.logs || r.data?.logs || [];
            return sum + (r.count || r.data?.count || logs.length || 0);
          }, 0)} entries):\n`;
          logsResults.forEach((result) => {
            // Extract logs data (handle both nested and flat formats)
            const logs = result.logs || result.data?.logs || [];
            if (Array.isArray(logs) && logs.length > 0) {
              logs.slice(0, 10).forEach((log: any) => {
                const level = log.level || 'info';
                const message = log.message || log.content || 'Log entry';
                const timestamp = log.timestamp || log.time || '';
                summaryContext += `${timestamp ? `[${timestamp}] ` : ''}[${level}] ${message}\n`;
              });
            } else {
              summaryContext += `No log entries found.\n`;
            }
          });
          summaryContext += `\nCRITICAL: Summarize key errors, warnings, and patterns from the logs above. Don't just list them - explain what they mean.\n\n`;
        } else if (intent === 'system_debug' && userMessage.toLowerCase().includes('log')) {
          // If logs were requested but not found, explain why
          summaryContext += `\n⚠️ Logs query detected but no logs.tail tool results found. The logs.tail tool may not have been executed or may have failed.\n\n`;
        }

        // Add project analysis results if available
        if (hasProjectAnalyze) {
          summaryContext += `Project analysis:\n`;
          projectAnalyzeResults.forEach((result) => {
            if (result.summary) {
              const summary = typeof result.summary === 'string' ? result.summary : JSON.stringify(result.summary);
              summaryContext += `${summary}\n`;
            }
            // Power of 10 Rule 8: Limit pointer dereferencing - use intermediate variable
            const health = result.health;
            if (health) {
              const healthScore = health.score;
              summaryContext += `Health score: ${healthScore || 'N/A'}/10\n`;

              // Power of 10 Rule 8: Limit pointer dereferencing
              const healthIssues = health.issues;
              if (healthIssues && Array.isArray(healthIssues) && healthIssues.length > 0) {
                summaryContext += `Issues found: ${healthIssues.length}\n`;
                healthIssues.slice(0, 3).forEach((issue: any) => {
                  const issueText = typeof issue === 'string' ? issue : issue.message || issue.type || 'Issue';
                  summaryContext += `- ${issueText}\n`;
                });
              }

              // Power of 10 Rule 8: Limit pointer dereferencing
              const healthRecommendations = health.recommendations;
              if (healthRecommendations && Array.isArray(healthRecommendations) && healthRecommendations.length > 0) {
                summaryContext += `Recommendations:\n`;
                healthRecommendations.slice(0, 3).forEach((rec: any) => {
                  const recText = typeof rec === 'string' ? rec : rec.message || rec.text || 'Recommendation';
                  summaryContext += `- ${recText}\n`;
                });
              }
            }
          });
          summaryContext += `\n`;
        }

        // Add files.recent results if available (CRITICAL for file queries)
        if (hasFilesRecent) {
          summaryContext += `Recently uploaded/accessed files:\n`;
          filesRecentResults.forEach((result) => {
            if (result.files && Array.isArray(result.files) && result.files.length > 0) {
              summaryContext += `Found ${result.files.length} file${result.files.length > 1 ? 's' : ''}:\n`;
              result.files.forEach((file: any, index: number) => {
                summaryContext += `${index + 1}. ${file.path || 'Unknown file'}`;
                if (file.ageMinutes !== undefined) {
                  const hours = Math.floor(file.ageMinutes / 60);
                  const minutes = file.ageMinutes % 60;
                  if (hours > 0) {
                    summaryContext += ` (${hours}h ${minutes}m ago)`;
                  } else {
                    summaryContext += ` (${minutes}m ago)`;
                  }
                }
                if (file.size) {
                  const sizeKB = Math.round(file.size / 1024);
                  summaryContext += ` - ${sizeKB}KB`;
                }
                if (file.isImage) {
                  summaryContext += ` [IMAGE]`;
                }
                if (file.contentType) {
                  summaryContext += ` (${file.contentType})`;
                }
                summaryContext += `\n`;
                if (file.contentPreview && file.contentPreview.length > 0) {
                  summaryContext += `   Preview: ${file.contentPreview.substring(0, 200)}${file.contentPreview.length > 200 ? '...' : ''}\n`;
                }
              });
              summaryContext += `\n`;
            } else {
              summaryContext += `No recent files found.\n\n`;
            }
          });

          // Add special instructions for file queries
          if (isFileQuery) {
            const hasActualFiles = filesRecentResults.some(r => r.files && Array.isArray(r.files) && r.files.length > 0);
            if (hasActualFiles) {
              const totalFiles = filesRecentResults.reduce((sum, r) => sum + (r.files?.length || 0), 0);
              summaryContext += `\n🚨 CRITICAL FILE QUERY INSTRUCTIONS - FILES FOUND (${totalFiles} file${totalFiles > 1 ? 's' : ''}):\n`;
              summaryContext += `YOU MUST RESPOND WITH THE EXACT FILE LIST FROM ABOVE.\n`;
              summaryContext += `RESPONSE FORMAT (MANDATORY):\n`;
              summaryContext += `1. Start with: "Here are the ${totalFiles} recent file${totalFiles > 1 ? 's' : ''}:"\n`;
              summaryContext += `2. List each file EXACTLY as shown above with:\n`;
              summaryContext += `   - File number (1, 2, 3...)\n`;
              summaryContext += `   - Full file path\n`;
              summaryContext += `   - Timestamp (Xh Ym ago)\n`;
              summaryContext += `   - File size if available\n`;
              summaryContext += `   - File type if available\n`;
              summaryContext += `3. DO NOT use vague language like "looks like", "seems like", "appears"\n`;
              summaryContext += `4. DO NOT generalize - list the EXACT files\n`;
              summaryContext += `5. DO NOT say "we don't have files" - you HAVE ${totalFiles} file${totalFiles > 1 ? 's' : ''} listed above\n`;
              summaryContext += `EXAMPLE: "Here are the 2 recent files:\n1. /path/to/file1.txt (5m ago) - 2KB\n2. /path/to/file2.jpg (10m ago) [IMAGE]"\n\n`;
            } else {
              summaryContext += `\n🚨🚨🚨 CRITICAL FILE QUERY INSTRUCTIONS - NO FILES FOUND 🚨🚨🚨\n`;
              summaryContext += `The files.recent tool executed successfully but returned an EMPTY files array (files.length = 0, total = 0).\n`;
              summaryContext += `THIS MEANS THERE ARE ZERO FILES - NOT "looks like" or "seems like" - ZERO FILES.\n\n`;
              summaryContext += `YOUR RESPONSE MUST START WITH EXACTLY ONE OF THESE:\n`;
              summaryContext += `1. "No recent files were found."\n`;
              summaryContext += `2. "There are no recently uploaded files."\n`;
              summaryContext += `3. "No files have been uploaded recently."\n\n`;
              summaryContext += `FORBIDDEN PHRASES (DO NOT USE):\n`;
              summaryContext += `- "looks like we don't have any files"\n`;
              summaryContext += `- "it seems there are no files"\n`;
              summaryContext += `- "we don't have any files to share"\n`;
              summaryContext += `- "looks like we don't have any recently uploaded files"\n`;
              summaryContext += `- "it appears there are no files"\n`;
              summaryContext += `- Any phrase with "looks like", "seems like", "appears", "might be"\n\n`;
              summaryContext += `REQUIRED: State the fact directly. Be concise. One sentence is enough.\n\n`;
            }
          }
        } else if (isFileQuery) {
          // File query but no files found
          summaryContext += `No recent files were found.\n\n`;
          summaryContext += `CRITICAL: The user asked about recent files, but no files were found. Clearly state that no recent files are available.\n\n`;
        }

        if (hasKnowledge) {
          // Highlight README files prominently
          const readmeHits = prioritizedKnowledgeHits.filter((h: any) => h.isReadme);
          const otherHits = prioritizedKnowledgeHits.filter((h: any) => !h.isReadme);

          summaryContext += `Found ${prioritizedKnowledgeHits.length} relevant document${prioritizedKnowledgeHits.length > 1 ? 's' : ''}:\n\n`;

          if (readmeHits.length > 0) {
            summaryContext += `README files (primary source - use these first):\n`;
            readmeHits.forEach((h: any) => {
              summaryContext += `- ${h.title || 'Untitled'}`;
              if (h.url) {
                summaryContext += ` (${h.url})`;
              }
              summaryContext += `\n`;
              if (h.spans?.[0]?.text) {
                summaryContext += `  ${h.spans[0].text.substring(0, 300)}${h.spans[0].text.length > 300 ? '...' : ''}\n`;
              }
            });
            summaryContext += `\n`;
          }

          if (otherHits.length > 0) {
            summaryContext += `Additional documents:\n`;
            otherHits.forEach((h: any) => {
              summaryContext += `- ${h.title || 'Untitled'}`;
              if (h.url) {
                summaryContext += ` (${h.url})`;
              }
              summaryContext += `\n`;
              if (h.spans?.[0]?.text) {
                summaryContext += `  ${h.spans[0].text.substring(0, 200)}${h.spans[0].text.length > 200 ? '...' : ''}\n`;
              }
            });
            summaryContext += `\n`;
          }
        } else {
          // Only mention KB search failure if we don't have research sources (research is primary for research queries)
          if (researchSources.length === 0) {
            summaryContext += `Knowledge base search: No results found for "${knowledgeSearchQuery || 'the query'}"\n\n`;
          } else {
            // If we have research sources, don't emphasize KB failure - research is the primary source
            summaryContext += `Knowledge base search: No results found (using web research instead)\n\n`;
          }
        }

        // Add research sources to context (CRITICAL for research queries)
        if (researchSources.length > 0) {
          console.log(`[Chat Stream] ✅ Adding ${researchSources.length} research sources to summarizer context`);

          // Also add sources from executor result if available
          if (executorResult && executorResult.scratchpad?.knowledge?.length > 0) {
            const executorSources = executorResult.scratchpad.knowledge;
            console.log(`[Chat Stream] ✅ Also injecting ${executorSources.length} knowledge hits from executor`);
            // Merge with researchSources (dedupe by URL)
            const existingUrls = new Set(researchSources.map((s: any) => s.url));
            executorSources.forEach((hit: KnowledgeHit) => {
              if (!existingUrls.has(hit.url)) {
                researchSources.push({
                  title: hit.title,
                  url: hit.url,
                  snippet: hit.snippet,
                  score: hit.score,
                  publishedAt: hit.publishedAt,
                  source: hit.source,
                });
              }
            });
          }

          // CRITICAL: Put research sources FIRST and make them prominent
          summaryContext += `\n🚨🚨🚨 PRIMARY SOURCE: WEB RESEARCH RESULTS 🚨🚨🚨\n`;
          summaryContext += `RESEARCH COMPLETED SUCCESSFULLY - ${researchSources.length} SOURCES FOUND\n`;
          summaryContext += `YOU HAVE CONCRETE RESEARCH RESULTS BELOW - USE THEM AS YOUR PRIMARY ANSWER\n\n`;

          summaryContext += `Web Research Sources (${researchSources.length}):\n\n`;
          researchSources.slice(0, 10).forEach((source: any, idx: number) => {
            const title = source.title || 'Untitled';
            const url = source.url || '';
            const snippet = source.snippet || '';

            // Format as markdown link for easy reference
            summaryContext += `${idx + 1}. [${title}](${url})\n`;
            if (snippet) {
              summaryContext += `   ${snippet.substring(0, 200)}${snippet.length > 200 ? '...' : ''}\n`;
            }
            if (source.score) {
              summaryContext += `   Relevance: ${(source.score * 100).toFixed(0)}%\n`;
            }
            summaryContext += `\n`;
          });
          if (researchSources.length > 10) {
            summaryContext += `\n*Showing top 10 of ${researchSources.length} research sources.*\n\n`;
          }

          // CRITICAL: Explicitly instruct summarizer to include links in response
          summaryContext += `\n🚨🚨🚨 CRITICAL RESEARCH QUERY INSTRUCTIONS 🚨🚨🚨\n`;
          summaryContext += `YOU HAVE ${researchSources.length} RESEARCH SOURCES ABOVE - THEY ARE YOUR PRIMARY ANSWER\n`;
          summaryContext += `\nMANDATORY RESPONSE REQUIREMENTS:\n`;
          summaryContext += `1. START your answer with a confident synthesis based on the research sources above\n`;
          summaryContext += `2. You MUST include at least 2-3 source links formatted as markdown: [Title](URL)\n`;
          summaryContext += `3. Use the actual titles and URLs from the sources listed above\n`;
          summaryContext += `4. Include the top ${Math.min(3, researchSources.length)} most relevant sources\n`;
          summaryContext += `5. Synthesize the information from the snippets/summaries provided\n\n`;
          summaryContext += `FORBIDDEN PHRASES (DO NOT USE):\n`;
          summaryContext += `- "I couldn't find sources" - YOU HAVE ${researchSources.length} SOURCES ABOVE\n`;
          summaryContext += `- "no results were found" - YOU HAVE RESULTS ABOVE\n`;
          summaryContext += `- "unfortunately, I couldn't find" - YOU HAVE SOURCES\n`;
          summaryContext += `- "I don't have access to" - YOU HAVE RESEARCH RESULTS\n`;
          summaryContext += `- Any phrase suggesting sources weren't found\n\n`;
          summaryContext += `CORRECT APPROACH:\n`;
          summaryContext += `- Start confidently: "Based on recent research, here's what I found..."\n`;
          summaryContext += `- Synthesize the key findings from the snippets above\n`;
          summaryContext += `- List sources as: "Here are the top sources:\n  1. [Title](URL)\n  2. [Title](URL)\n  3. [Title](URL)"\n\n`;
        } else {
          // CRITICAL: This block executes when researchSources.length === 0
          // Only add web research failure instructions if:
          // 1. Research was actually attempted (hasResearch is true)
          // 2. Intent is NOT system_debug (system queries don't use web research)
          const researchWasAttempted = hasResearch && researchResults.length > 0;
          const isResearchQuery = intent === 'general_question' || intent === 'project_help';

          // Note: isResearchQuery already excludes 'system_debug', so no need to check again
          if (researchWasAttempted && isResearchQuery) {
            // Research was attempted but returned no sources - add anti-hallucination instructions
            console.warn(`[Chat Stream] ⚠️ NO research sources to add to summarizer context!`);
            console.warn(`[Chat Stream] Research results analysis:`, {
              researchResultsCount: researchResults.length,
              researchResults: researchResults.map(r => ({
                ok: r.ok,
                hasSources: !!(r.sources && Array.isArray(r.sources)),
                sourcesCount: (r.sources || []).length,
                hasDataSources: !!(r.data?.sources && Array.isArray(r.data.sources)),
                dataSourcesCount: (r.data?.sources || []).length,
                error: r.error,
                sessionId: r.sessionId,
              })),
              finalResearchSourcesCount: researchSources.length,
            });

            // CRITICAL: Add explicit NO HALLUCINATION instructions when research fails
            summaryContext += `\n🚨🚨🚨🚨🚨 CRITICAL: WEB RESEARCH FAILED OR RETURNED NO RESULTS 🚨🚨🚨🚨🚨\n`;
            summaryContext += `\nTHE WEB RESEARCH TOOL WAS EXECUTED BUT RETURNED ZERO VALID SOURCES.\n`;
            summaryContext += `THIS MEANS YOU HAVE ABSOLUTELY NO WEB RESEARCH RESULTS AVAILABLE.\n`;
            summaryContext += `YOU CANNOT AND MUST NOT INVENT OR HALLUCINATE SOURCES.\n\n`;

            summaryContext += `🚨 STRICT RESPONSE REQUIREMENTS (MANDATORY):\n`;
            summaryContext += `1. You MUST start your response with: "I was unable to find web sources for this query" or "Web research returned no results"\n`;
            summaryContext += `2. You MUST NOT invent, fabricate, or hallucinate ANY source URLs\n`;
            summaryContext += `3. You MUST NOT cite Bloomberg, Reuters, IMF, NYT, WSJ, or ANY publication without a real URL provided above\n`;
            summaryContext += `4. You MUST NOT create fake links like "https://www.bloomberg.com/..." or any other domain\n`;
            summaryContext += `5. You MUST NOT pretend you found sources when you didn't\n`;
            summaryContext += `6. Instead, you MUST offer to help refine the search or suggest alternative approaches\n\n`;

            summaryContext += `🚨 FORBIDDEN BEHAVIORS (DO NOT DO THESE):\n`;
            summaryContext += `- Creating fake URLs of any kind\n`;
            summaryContext += `- Inventing article titles or publication names\n`;
            summaryContext += `- Using phrases like "According to Bloomberg" or "A report by Reuters" without real sources\n`;
            summaryContext += `- Saying "I found some interesting articles" when you have no sources\n`;
            summaryContext += `- Providing any markdown links [Title](URL) unless the URL was provided above\n`;
            summaryContext += `- Making up citations or references\n\n`;

            summaryContext += `✅ CORRECT RESPONSE FORMAT:\n`;
            summaryContext += `"I attempted to search for web sources on this topic, but the search didn't return any results. This could be due to:\n`;
            summaryContext += `- Search service connectivity issues\n`;
            summaryContext += `- The query might need refinement\n`;
            summaryContext += `- The topic might be too specific or recent\n\n`;
            summaryContext += `Would you like me to help refine the search query, or would you like to ask a different question?"\n\n`;

            summaryContext += `🚨 FINAL REMINDER: If you don't have real sources in the context above, you HAVE NO SOURCES. Do not invent them.\n\n`;
          } else if (intent === 'system_debug') {
            // For system_debug queries, provide specialized instructions for system status responses
            summaryContext += `\n📊 SYSTEM STATUS QUERY INSTRUCTIONS:\n`;
            summaryContext += `This is a system health/status query. Use ONLY the system tool results provided above.\n\n`;
            summaryContext += `🚨 CRITICAL RULES FOR SYSTEM_DEBUG QUERIES:\n`;
            summaryContext += `- DO NOT mention "knowledge base search" or "we didn't find any results in search"\n`;
            summaryContext += `- DO NOT mention "web sources" or "research" - this is an internal system query\n`;
            summaryContext += `- DO NOT reference external websites or publications\n`;
            summaryContext += `- DO NOT suggest searching online or using web-based resources\n`;
            summaryContext += `- DO NOT say "we didn't find any results" - instead explain what the tools returned\n`;
            summaryContext += `- This query uses system.health and logs.tail tools, NOT knowledge base search\n\n`;

            // Check if we have actual tool results
            if (!hasSystemHealth && !hasLogs) {
              summaryContext += `⚠️ CRITICAL: NO TOOL RESULTS FOUND\n`;
              summaryContext += `The system.health and logs.tail tools did not return any results.\n`;
              summaryContext += `DO NOT invent or guess system status. Instead, state:\n`;
              summaryContext += `"I attempted to check the system health and retrieve recent logs, but the tools did not return any data. This could indicate:\n`;
              summaryContext += `- The tools failed to execute\n`;
              summaryContext += `- The system health API is unavailable\n`;
              summaryContext += `- There was an error retrieving system status or logs\n\n`;
              summaryContext += `Please check the server logs or try again."\n\n`;
            } else {
              summaryContext += `✅ TOOL RESULTS AVAILABLE - USE THEM:\n`;
              summaryContext += `- If system health data is above, use the EXACT status, uptime, services, and metrics shown\n`;
              summaryContext += `- If logs are above, summarize the actual log entries shown\n`;
              summaryContext += `- DO NOT invent status values like "Urgent" or "Critical" unless they appear in the tool results\n`;
              summaryContext += `- DO NOT mention knowledge base search - this query uses system tools, not KB search\n`;
              summaryContext += `- If tool results show "healthy", say "healthy" - don't change it to "urgent" or other values\n\n`;
            }
          }
        }

        if (hasResearch) {
          summaryContext += `Web Research: Research session started. Check ${researchResults[0]?.viewUrl || 'research page'} for detailed findings.\n\n`;
        }

        // For "what is" questions, prioritize code files and README over everything else
        if (isWhatIsQuestion) {
          if (codeReadResults.length > 0) {
            // Check if this is a workflow question
            const isWorkflowQuestionInContext = /(workflow|n8n|execution|orchestration)/i.test(userMessage);
            const hasN8nCursorFiles = codeReadResults.some((f: any) => f.path.includes('n8n-cursor'));
            const hasLightningFlowFiles = codeReadResults.some((f: any) => f.path.includes('lightningflow'));

            summaryContext += `🚨 CRITICAL INSTRUCTIONS FOR "WHAT IS SCORPION" QUESTIONS 🚨
- The README.md file above is the ABSOLUTE PRIMARY SOURCE - use it EXACTLY as written
- DO NOT invent features, CLI tools, or capabilities that are NOT in the README.md
- DO NOT say Scorpion is "built on top of LightningFlow" - README.md says LightningFlow is a SIDE HUSTLE managed BY Scorpion
- DO NOT invent a "Scorpion CLI tool" - only mention tools/features that are EXPLICITLY in the README
- DO NOT make up workflow examples or code snippets - only use what's in the provided files
- Use the EXACT language from README.md: "Scorpion is the Central Operations Orchestrator"
- Follow the EXACT structure from README.md: Architecture section, Features, etc.
- OUTPUT FORMAT: Start with "Here is a detailed answer based on the provided code:" then provide comprehensive answer
- Include sections: What is Scorpion, Key Features, Architecture, How it Works (all from README.md)
- Quote directly from README.md when possible - preserve the exact meaning
- If README.md says "Scorpion (scorpion.local / port 3003) - Main operations console and orchestrator", use that EXACTLY
- NEVER confuse Scorpion with LightningFlow - Scorpion is the CENTRAL SYSTEM, LightningFlow is a SIDE HUSTLE it manages`;

            // Add workflow-specific context if needed
            if (isWorkflowQuestionInContext) {
              if (hasN8nCursorFiles) {
                summaryContext += `\n\n🎯 WORKFLOW QUESTION CONTEXT - BE SPECIFIC:
- You have n8n-cursor backend files - these are CORRECT for workflow execution questions
- Use SPECIFIC DETAILS from workflow-worker.ts: function names, workflow types, queue processing logic
- Use SPECIFIC DETAILS from backend README.md: actual endpoints (POST /api/workflows/0/run), architecture flow, dependencies
- Use SPECIFIC DETAILS from package.json: actual dependency versions (bullmq@4.15.0, express@4.18.2, etc.)
- Use SPECIFIC DETAILS from index.ts: actual API routes, middleware, error handling
- This is the n8n workflow automation system, NOT LightningFlow or Salesforce
- QUOTE ACTUAL CODE: "processWorkflow() function", "5 workflow types: ai-saas, research, content, support, analytics", "BullMQ queue", "Redis status storage"
- USE ACTUAL PATHS: "apps/n8n-cursor/backend/src/workers/workflow-worker.ts", not "the worker file"`;
              } else if (hasLightningFlowFiles) {
                summaryContext += `\n\n⚠️ ERROR DETECTED:
- This is a workflow question but you received LightningFlow files instead of n8n-cursor files
- Acknowledge this error: "The plan attempted to read incorrect files. Based on available information..."
- Do NOT confuse LightningFlow with the workflow execution system
- Work with what's available but note the mismatch`;
              }
            }
          } else if (hasKnowledge) {
            // Add specific council details if council was used - natural format
            if (needsCouncil && votes.length > 0) {
              summaryContext += `Expert review by ${votes.length} specialist${votes.length > 1 ? 's' : ''}:\n`;
              votes.forEach((vote: any) => {
                const agentName = vote.agentName || vote.agentId || 'Expert';
                const confidence = Math.round((vote.confidence || 0.7) * 100);
                summaryContext += `- ${agentName} (${confidence}% confident): ${vote.rationale || 'No specific comment'}\n`;
              });
              summaryContext += `\nOverall consensus: ${consensus.summary}\n\n`;
            } else if (consensus.summary) {
              summaryContext += `Expert consensus (for reference - prioritize README files above): ${consensus.summary}\n\n`;
            }
            summaryContext += `CRITICAL INSTRUCTIONS FOR "WHAT IS" QUESTIONS:
- The README FILES above are the PRIMARY SOURCE - use them FIRST and MOST IMPORTANTLY
- If README files are provided, use their exact definition
- Documents about "Global Consistency System", "Implementation Status", etc. are about INTERNAL SYSTEMS within the product, NOT what the product IS
- Only use council consensus if README files don't have the answer
- If README files conflict with council consensus, TRUST THE README FILES
- DO NOT confuse internal systems documentation with product definitions
- DO NOT ask for clarification - answer based on what you have
- OUTPUT FORMAT: Use a natural, conversational format. Write like explaining to a friend. NO technical jargon. Start with: "Scorpion is..." or "LightningFlow is..." based on the README definition.`;
          } else {
            // Add specific council details if council was used - natural format
            if (needsCouncil && votes.length > 0) {
              summaryContext += `Expert review by ${votes.length} specialist${votes.length > 1 ? 's' : ''}:\n`;
              votes.forEach((vote: any) => {
                const agentName = vote.agentName || vote.agentId || 'Expert';
                const confidence = Math.round((vote.confidence || 0.7) * 100);
                summaryContext += `- ${agentName} (${confidence}% confident): ${vote.rationale || 'No specific comment'}\n`;
              });
              summaryContext += `\nOverall consensus: ${consensus.summary}\n\n`;
            } else if (consensus.summary) {
              summaryContext += `Expert consensus: ${consensus.summary}\n\n`;
            }
            summaryContext += `IMPORTANT: Answer the question directly and naturally based on the information above. Use a conversational tone.`;
          }
        } else {
          // Add specific council details if council was used - natural format
          if (needsCouncil && votes.length > 0) {
            summaryContext += `Expert review by ${votes.length} specialist${votes.length > 1 ? 's' : ''}:\n`;
            votes.forEach((vote: any) => {
              const agentName = vote.agentName || vote.agentId || 'Expert';
              const confidence = Math.round((vote.confidence || 0.7) * 100);
              summaryContext += `- ${agentName} (${confidence}% confident): ${vote.rationale || 'No specific comment'}\n`;
            });
            summaryContext += `\nOverall consensus: ${consensus.summary}\n\n`;
          } else if (consensus.summary) {
            summaryContext += `Expert consensus: ${consensus.summary}\n\n`;
          }
          summaryContext += `IMPORTANT: 
- Use ONLY the information provided above (code files, knowledge base results, research, council consensus)
- If code files are available, they are the PRIMARY SOURCE - use them first
- If no knowledge base results were found, state that clearly
- If web research was started, mention that research is available
- Base your answer on the available sources
- DO NOT make up information that isn't in the sources above
- DO NOT ask for clarification - answer based on what you have
- If you don't have enough information, say so clearly but still provide what you can
- OUTPUT FORMAT: Use a natural, conversational format. Keep it simple and friendly. NO technical jargon.`;
        }
      } else {
        // Technical questions - use natural, conversational format
        summaryContext = `User Question: ${plan.objective || userMessage}\n\n`;

        // Describe what was done in natural language
        summaryContext += `To answer this question, I:\n`;
        plan.plan.forEach((step: any, idx: number) => {
          const stepResult = results.find((r: any) => r.step === step.id);
          const status = stepResult?.result?.ok ? 'successfully completed' : stepResult ? 'encountered an issue' : 'was not executed';
          const toolName = step.tool.replace(/\./g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
          summaryContext += `- ${toolName}: ${status}\n`;
        });
        summaryContext += `\n`;

        // Add results in natural format - extract key information, don't dump JSON
        const successfulResults = results.filter((r: any) => r.result?.ok);
        if (successfulResults.length > 0) {
          summaryContext += `Key findings:\n`;
          successfulResults.forEach((result: any) => {
            const step = plan.plan.find((s: any) => s.id === result.step);
            if (step) {
              const toolName = step.tool.replace(/\./g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
              // Power of 10 Rule 8: Limit pointer dereferencing - use intermediate variable
              const resultData = result.result;
              if (resultData) {
                const resultDataValue = resultData.data;
                if (resultDataValue) {
                  const dataText = typeof resultDataValue === 'string' ? resultDataValue.substring(0, 200) : 'Results available';
                  summaryContext += `- ${toolName} found: ${dataText}\n`;
                } else {
                  const resultMessage = resultData.message;
                  if (resultMessage) {
                    summaryContext += `- ${toolName}: ${resultMessage}\n`;
                  }
                }
              }
            }
          });
          summaryContext += `\n`;
        }

        // Council deliberation in natural format
        if (needsCouncil && votes.length > 0) {
          summaryContext += `Expert review:\n`;
          votes.forEach((vote: any) => {
            const agentName = vote.agentName || vote.agentId || 'Expert';
            const confidence = Math.round((vote.confidence || 0.7) * 100);
            summaryContext += `- ${agentName} (${confidence}% confident): ${vote.rationale || 'No specific comment'}\n`;
          });
          summaryContext += `\nOverall consensus: ${consensus.summary}\n\n`;
        } else if (consensus.summary) {
          summaryContext += `Expert consensus: ${consensus.summary}\n\n`;
        }

        // Knowledge base results in natural format
        if (hasKnowledge && prioritizedKnowledgeHits.length > 0) {
          summaryContext += `Found ${prioritizedKnowledgeHits.length} relevant document${prioritizedKnowledgeHits.length > 1 ? 's' : ''}:\n`;
          prioritizedKnowledgeHits.forEach((h: any) => {
            summaryContext += `- ${h.title}${h.url ? ` (${h.url})` : ''}\n`;
          });
          summaryContext += `\n`;
        }

        // Add files.recent results for technical questions too
        if (hasFilesRecent) {
          summaryContext += `Recently uploaded/accessed files:\n`;
          filesRecentResults.forEach((result) => {
            if (result.files && Array.isArray(result.files) && result.files.length > 0) {
              summaryContext += `Found ${result.files.length} file${result.files.length > 1 ? 's' : ''}:\n`;
              result.files.forEach((file: any, index: number) => {
                summaryContext += `${index + 1}. ${file.path || 'Unknown file'}`;
                if (file.ageMinutes !== undefined) {
                  const hours = Math.floor(file.ageMinutes / 60);
                  const minutes = file.ageMinutes % 60;
                  if (hours > 0) {
                    summaryContext += ` (${hours}h ${minutes}m ago)`;
                  } else {
                    summaryContext += ` (${minutes}m ago)`;
                  }
                }
                if (file.size) {
                  const sizeKB = Math.round(file.size / 1024);
                  summaryContext += ` - ${sizeKB}KB`;
                }
                if (file.isImage) {
                  summaryContext += ` [IMAGE]`;
                }
                summaryContext += `\n`;
              });
              summaryContext += `\n`;
            } else {
              summaryContext += `No recent files found.\n\n`;
            }
          });
        }

        summaryContext += `IMPORTANT: 
- Answer the question in a natural, conversational way
- Use the information above to provide a clear, helpful answer
- Be specific about what was found, but explain it simply
- NO technical jargon or raw data dumps
- Write like you're explaining to a colleague, not writing a technical report
- Keep it simple and friendly`;
      }

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
