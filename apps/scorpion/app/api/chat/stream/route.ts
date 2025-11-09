import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { runModelUnified, parseModelJSON } from '@/lib/chat/modelRunner';
import { runCouncilDeliberationStreaming, computeConsensus } from '@/lib/chat/council';
import { executeTool } from '@/lib/chat/tools';
import { remember } from '@/lib/chat/memory';
import { createSSEMessage } from '@/lib/chat/events';
import type { Message, Plan } from '@/lib/chat/types';
import { detectLightweightMode } from '@/lib/utils/systemResources';

/**
 * Resolve prompt file path correctly regardless of cwd
 */
function getPromptPath(filename: string): string {
  const cwd = process.cwd();
  
  // If we're already in apps/scorpion, use relative path
  if (cwd.endsWith('apps/scorpion') || cwd.includes('/apps/scorpion/')) {
    const relativePath = join(cwd, 'lib/prompts', filename);
    if (existsSync(relativePath)) {
      return relativePath;
    }
  }
  
  // Try project root path
  const rootPath = join(cwd, 'apps/scorpion/lib/prompts', filename);
  if (existsSync(rootPath)) {
    return rootPath;
  }
  
  // Fallback: remove duplicate apps/scorpion if present
  const cleanCwd = cwd.replace(/\/apps\/scorpion.*$/, '');
  const fallbackPath = join(cleanCwd, 'apps/scorpion/lib/prompts', filename);
  
  return fallbackPath;
}

/**
 * Simple response cache for common queries
 */
const responseCache = new Map<string, { response: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(message: string): string {
  return message.toLowerCase().trim().substring(0, 100);
}

function getCachedResponse(message: string): string | null {
  const key = getCacheKey(message);
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.response;
  }
  return null;
}

function setCachedResponse(message: string, response: string): void {
  const key = getCacheKey(message);
  responseCache.set(key, { response, timestamp: Date.now() });
  
  // Clean old cache entries (keep cache under 100 entries)
  if (responseCache.size > 100) {
    const oldest = Array.from(responseCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
    responseCache.delete(oldest[0]);
  }
}

/**
 * POST /api/chat/stream
 * 
 * Main Chat-AGI orchestrator with SSE streaming
 * Phases: PLANNER → COUNCIL → EXECUTOR → SUMMARIZER
 */
export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();
  
  let requestData;
  try {
    requestData = await req.json();
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: `Invalid request: ${error.message}` }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  const { conversationId, messages, mode, tools, provider, model } = requestData;
  
  // Create readable stream
  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      let aborted = false;
      
      // Detect client disconnection
      req.signal.addEventListener('abort', () => {
        console.log('[Chat Stream] Client disconnected, aborting stream');
        aborted = true;
        closed = true;
        try {
          controller.close();
        } catch (error) {
          // Already closed
        }
      });
      
      const send = (event: any) => {
        if (closed || aborted) return;
        try {
          controller.enqueue(encoder.encode(createSSEMessage(event)));
          // Force flush by sending empty line (if needed)
          // controller.enqueue(encoder.encode('\n'));
        } catch (error) {
          // Client disconnected, stop sending
          closed = true;
          aborted = true;
        }
      };
      
      // Check abort status before processing
      const checkAbort = () => {
        if (req.signal.aborted || aborted) {
          throw new Error('Client disconnected');
        }
      };
      
      try {
        checkAbort();
        send({ type: 'connected', data: { message: 'Chat stream connected' } });
        
        // Extract user message
        const userMessage = messages[messages.length - 1]?.content || '';
        const messageId = uuidv4();
        
        // Resource optimization: Auto-detect lightweight mode based on system RAM
        const lightweightMode = detectLightweightMode();
        const defaultModel = model || 'llama3.2:1b';
        
        // SIMPLE CHAT MODE - Bypass planner for basic messages
        // Questions about capabilities don't need planning
        // BUT: Council-related queries should always use full planner mode
        // AND: Knowledge-seeking questions should use planner to search KB
        const isQuestion = userMessage.toLowerCase().match(/^(can you|what|how|do you|are you|will you)/);
        const mentionsCouncil = userMessage.toLowerCase().includes('council') || 
                               userMessage.toLowerCase().includes('deliberat');
        
        // Detect knowledge-seeking questions that need KB search
        const knowledgeSeekingPatterns = [
          /what (do you know|is|are|was|were) (about|of)?/i,
          /tell me (about|more about)/i,
          /explain (what|who|how|why|when|where)/i,
          /who (is|are|was|were)/i,
          /describe (what|who|how)/i,
          /(what|who) (is|are|was|were) .+/i, // "what is X" or "who is Y"
          /(what|who) do you know about/i,
        ];
        const isKnowledgeSeeking = knowledgeSeekingPatterns.some(pattern => pattern.test(userMessage));
        
        const isSimpleMessage = (!userMessage.startsWith('/') && 
                                userMessage.length < 200 && 
                                !userMessage.includes('research') &&
                                !userMessage.includes('workflow') &&
                                !userMessage.includes('plan') &&
                                !mentionsCouncil &&
                                !isKnowledgeSeeking) || // Exclude knowledge-seeking questions
                                (isQuestion && userMessage.length < 150 && !mentionsCouncil && !isKnowledgeSeeking); // Exclude knowledge-seeking from simple questions
        
        if (isSimpleMessage) {
          console.log('[Chat Stream] Using simple chat mode for:', userMessage.substring(0, 50));
          
          // Check cache first
          const cachedResponse = getCachedResponse(userMessage);
          if (cachedResponse) {
            console.log('[Chat Stream] Using cached response');
            send({ type: 'delta', data: { content: cachedResponse } });
            send({ type: 'done', data: { messageId } });
            closed = true;
            controller.close();
            return;
          }
          
          send({ type: 'status', data: { message: 'Thinking...', phase: 'planning' } });
          
          const startTime = Date.now();
          try {
            // Optimized concise system prompt (reduced from ~2000 to ~300 tokens)
            const systemPrompt = `You are Scorpion Chat-AGI with backend access.

CAPABILITIES: kb.search, code.readFile, research.run, workflows.trigger (162+ workflows), system.health, logs.tail, project.analyze, agent.deploy, backup.create, notifications.post.

ACCESS: API endpoints, databases, file system, n8n cloud, Ollama models, RAG store.

RESPONSE: Be confident, mention tools when relevant, keep concise. For complex tasks, suggest /commands or planner mode.

When asked about capabilities, mention: "I can search knowledge base, read code files with AST parsing, trigger workflows, run research, check system health, access APIs and databases."`;

            // Use lightweight mode settings
            const defaultMaxTokens = lightweightMode ? 80 : 100;
            const defaultTemp = lightweightMode ? 0.3 : 0.5;
            
            // For simple questions that might benefit from context, try RAG search
            // (Note: Knowledge-seeking questions are now excluded from simple mode)
            let enhancedPrompt = userMessage;
            let hasRAGContext = false;
            
            // Only do RAG search for questions that might need context
            if (isQuestion && userMessage.length > 20) {
              try {
                const { getRAGStore } = await import('@/lib/shared-stores');
                const store = await getRAGStore();
                const relevantKnowledge = await store.search(userMessage, 3); // Smaller limit for simple mode
                
                if (relevantKnowledge.length > 0) {
                  const ragContext = relevantKnowledge.map(k => `${k.title}: ${k.description}`).join('\n');
                  enhancedPrompt = `Context from knowledge base:\n${ragContext}\n\nUser question: ${userMessage}`;
                  hasRAGContext = true;
                  
                  // Emit knowledge event for frontend (even in simple mode)
                  send({
                    type: 'knowledge',
                    data: {
                      hits: relevantKnowledge.map(r => ({
                        id: r.id,
                        title: r.title,
                        url: `/knowledge?id=${r.id}`,
                        spans: [{ text: r.description.slice(0, 200) }],
                        relevance: r.similarity,
                      })),
                    },
                  });
                }
              } catch (error) {
                console.warn('[Chat Stream] RAG search failed in simple mode:', error);
                // Continue without RAG context
              }
            }
            
            checkAbort(); // Check before LLM call
            
            const simpleResponse = await runModelUnified(
              systemPrompt,
              enhancedPrompt, // Use enhanced prompt with RAG context if available
              { 
                provider: provider || 'ollama', 
                model: defaultModel,
                maxTokens: defaultMaxTokens, // Reduced for faster generation
                temperature: defaultTemp // Lower for faster, more deterministic responses
              }
            );
            
            checkAbort(); // Check after LLM call
            
            const duration = Date.now() - startTime;
            console.log(`[Chat Stream] LLM response time: ${duration}ms`);
            
            // Cache the response
            setCachedResponse(userMessage, simpleResponse);
            
            // Stream response in chunks (5 words at a time) for better performance
            const words = simpleResponse.split(' ');
            const chunkSize = 5;
            for (let i = 0; i < words.length; i += chunkSize) {
              checkAbort(); // Check before each chunk
              const chunk = words.slice(i, i + chunkSize).join(' ');
              send({ type: 'delta', data: { content: (i > 0 ? ' ' : '') + chunk } });
              // Minimal delay for smooth streaming (5ms instead of 50ms)
              if (i + chunkSize < words.length) {
                await new Promise(resolve => setTimeout(resolve, 5));
              }
            }
            
            send({ type: 'done', data: { messageId } });
            closed = true;
            controller.close();
            return;
          } catch (error: any) {
            console.error('[Chat Stream] Simple mode error:', error);
            send({ type: 'error', data: { message: error.message, details: error.stack } });
            closed = true;
            controller.close();
            return;
          }
        }
        
        // PHASE 1: PLANNER (for complex queries)
        checkAbort(); // Check before planner
        console.log('[Chat Stream] Using full planner mode');
        send({ type: 'status', data: { message: 'Planning...', phase: 'planning' } });
        
        // Use lighter model by default for better resource efficiency
        const defaultMaxTokens = lightweightMode ? 200 : 300;
        const defaultTemp = lightweightMode ? 0.1 : 0.2;
        
        const plannerPrompt = readFileSync(getPromptPath('planner.system.txt'), 'utf-8');
        const planResponse = await runModelUnified(
          plannerPrompt,
          userMessage,
          { 
            provider: provider || 'ollama', 
            model: defaultModel,
            maxTokens: defaultMaxTokens, // Reduced for faster plan generation
            temperature: defaultTemp // Lower for more deterministic planning
          }
        );
        
        let plan: Plan;
        try {
          plan = parseModelJSON(planResponse);
        } catch (error: any) {
          console.error('[Chat Stream] Failed to parse plan JSON:', error);
          console.error('[Chat Stream] Plan response:', planResponse.substring(0, 500));
          
          // Fallback: Create a simple plan that uses knowledge search
          plan = {
            objective: userMessage,
            assumptions: ['User wants information or to perform a simple action'],
            plan: [
              {
                id: 's1',
                title: 'Search knowledge base for relevant information',
                tool: 'kb.search',
                args: { query: userMessage, limit: 5 },
                success: 'Found relevant knowledge entries'
              }
            ],
            done_when: ['Information retrieved and presented'],
            fallbacks: []
          };
          
          send({ 
            type: 'status', 
            data: { message: 'Using fallback plan (JSON parse failed)', phase: 'planning' } 
          });
        }
        
        // Send plan steps
        plan.plan.forEach(step => {
          send({
            type: 'plan_step',
            data: {
              ...step,
              status: 'pending',
            },
          });
        });
        
        // PHASE 2: COUNCIL - Stream deliberation process
        checkAbort(); // Check before council
        send({ type: 'status', data: { message: 'Council review...', phase: 'council' } });
        
        const councilMaxTokens = lightweightMode ? 100 : 150;
        const councilTemp = lightweightMode ? 0.2 : 0.4;
        
        // Run council deliberation (consensus is streamed internally)
        const votes = await runCouncilDeliberationStreaming(plan, { 
          provider: provider || 'ollama', 
          model: defaultModel,
          maxTokens: councilMaxTokens,
          temperature: councilTemp
        }, (event) => {
          // Stream all council events (including consensus)
          send(event);
        });
        
        // Compute consensus for summarizer (detect if casual)
        const planText = plan.objective?.toLowerCase() || '';
        const isCasual = planText.match(/^(movie|film|show|book|game|food|drink|color|weather|which|what.*better|prefer|favorite)/) !== null &&
                        !planText.match(/(implement|deploy|integrate|build|create|develop|design|architecture|system|api|database|workflow)/);
        const consensus = computeConsensus(votes, isCasual);
        
        // PHASE 3: EXECUTOR
        checkAbort(); // Check before executor
        send({ type: 'status', data: { message: 'Executing plan...', phase: 'executing' } });
        
        const results: any[] = [];
        
        for (const step of plan.plan) {
          checkAbort(); // Check before each step
          if (step.tool === 'none') continue;
          
          send({
            type: 'plan_step',
            data: { ...step, status: 'running' },
          });
          
          send({
            type: 'tool',
            data: {
              tool: step.tool,
              callId: step.id,
              args: step.args || {},
              status: 'started',
            },
          });
          
          try {
            checkAbort(); // Check before tool execution
            const result = await executeTool(step.tool, step.args || {});
            results.push({ step: step.id, result });
            
            send({
              type: 'tool',
              data: {
                tool: step.tool,
                callId: step.id,
                args: step.args || {},
                status: 'completed',
                result,
              },
            });
            
            // Emit dedicated knowledge event when kb.search completes successfully
            if (step.tool === 'kb.search' && result?.ok && result?.hits) {
              send({
                type: 'knowledge',
                data: {
                  hits: result.hits,
                },
              });
            }
            
            send({
              type: 'plan_step',
              data: { ...step, status: 'completed', result },
            });
          } catch (error: any) {
            send({
              type: 'tool',
              data: {
                tool: step.tool,
                callId: step.id,
                args: step.args || {},
                status: 'failed',
                error: error.message,
              },
            });
            
            send({
              type: 'plan_step',
              data: { ...step, status: 'failed' },
            });
          }
        }
        
        // PHASE 4: SUMMARIZER
        checkAbort(); // Check before summarizer
        send({ type: 'status', data: { message: 'Summarizing...', phase: 'summarizing' } });
        
        const summarizerPrompt = readFileSync(getPromptPath('summarizer.system.txt'), 'utf-8');
        const summaryContext = `Plan: ${JSON.stringify(plan)}\n\nResults: ${JSON.stringify(results)}\n\nConsensus: ${consensus.summary}`;
        
        const summaryMaxTokens = lightweightMode ? 150 : 200;
        const summaryTemp = lightweightMode ? 0.3 : 0.5;
        
        const summary = await runModelUnified(
          summarizerPrompt,
          summaryContext,
          { 
            provider: provider || 'ollama', 
            model: defaultModel,
            maxTokens: summaryMaxTokens, // Reduced for faster summaries
            temperature: summaryTemp // Lower for faster generation
          }
        );
        
        // Stream summary
        send({ type: 'delta', data: { content: summary } });
        
        // Remember in memory
        remember(conversationId, `User: ${userMessage}\nAssistant: ${summary}`);
        
        // Done
        send({ type: 'done', data: { messageId } });
        
      } catch (error: any) {
        // Don't log error if it was due to client disconnection
        if (error.message === 'Client disconnected' || req.signal.aborted || aborted) {
          console.log('[Chat Stream] Stream aborted by client');
        } else {
          console.error('[Chat Stream] Fatal error:', error);
          console.error('[Chat Stream] Stack:', error.stack);
          send({ 
            type: 'error', 
            data: { 
              message: error.message || 'Unknown error occurred',
              details: error.stack || String(error)
            } 
          });
        }
      } finally {
        closed = true;
        try {
          controller.close();
        } catch {}
      }
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}

