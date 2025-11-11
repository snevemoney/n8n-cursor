import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { runModelUnified, parseModelJSON } from '@/lib/chat/modelRunner';
import { runCouncilDeliberationStreaming, computeConsensus } from '@/lib/chat/council';
import { executeTool, detectUserTool, getUserToolBySlashCommand, isUserTool, tools, userTools, listTools } from '@/lib/chat/tools';
import { remember } from '@/lib/chat/memory';
import { createSSEMessage } from '@/lib/chat/events';
import type { Message, Plan } from '@/lib/chat/types';
import { detectLightweightMode } from '@/lib/utils/systemResources';
import { getRecommendedModelForRAM } from '@/lib/utils/modelSelector';

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
  try {
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
        
        // Extract user message (last message is the new one)
        const userMessage = messages[messages.length - 1]?.content || '';
        const messageId = uuidv4();
        
        // Check if this is a user tool command (slash command OR natural language)
        let detectedTool = null;
        try {
          detectedTool = detectUserTool(userMessage);
        } catch (error: any) {
          console.error('[Chat Stream] Error detecting user tool:', error);
          // Continue with normal flow if detection fails
        }
        
        if (detectedTool) {
          const { tool: userTool, argsText } = detectedTool;
          
            // This is a user tool - execute directly without planner
          console.log('[Chat Stream] User tool detected:', userTool.name);
            
            send({ type: 'status', data: { message: `Executing ${userTool.label}...`, phase: 'executing' } });
            send({ type: 'progress', data: { phase: 'executing', progress: 10, message: `Executing ${userTool.label}...` } });
            
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
                    const commonTextFields = ['text', 'query', 'content', 'prompt', 'input', 'message', 'question', 'description', 'topic', 'offer', 'productBrief'];
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
                        toolArgs[requiredField || textLikeFields[0]] = argsText;
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
                  validationError.errors.forEach((err: any) => {
                    if (err.code === 'invalid_type' && err.received === 'undefined') {
                      missingFields.push(err.path.join('.'));
                    }
                  });
                }
                
                if (missingFields.length > 0) {
                  const slashCmd = userMessage.startsWith('/') ? userMessage.split(' ')[0] : `/${userTool.name.replace('user.', '')}`;
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
                      tool: userTool.name,
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
                      content: `**Error executing ${userTool.label}**\n\n${errorMessage}`,
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
            
            send({ type: 'progress', data: { phase: 'executing', progress: 30, message: `Running ${userTool.label}...` } });
            
            try {
              // Execute user tool
              const result = await executeTool(userTool.name, toolArgs);
              
              send({ type: 'progress', data: { phase: 'executing', progress: 90, message: `${userTool.label} completed` } });
              
              // Send tool completion event
              send({
                type: 'tool',
                data: {
                  tool: userTool.name,
                  callId,
                  args: toolArgs,
                  status: 'completed',
                  result,
                },
              });
              
              // Format result as assistant message
              let resultContent = `**${userTool.label}**\n\n`;
              if (result.ok) {
                if (result.message) {
                  resultContent += `${result.message}\n\n`;
                }
                if (result.response || result.translated || result.summary || result.content) {
                  resultContent += `${result.response || result.translated || result.summary || result.content}`;
                } else if (typeof result === 'object') {
                  resultContent += `\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``;
                }
              } else {
                resultContent += `Error: ${result.error || 'Unknown error'}`;
              }
              
              send({ type: 'delta', data: { content: resultContent } });
              send({ type: 'progress', data: { phase: 'executing', progress: 100, message: 'Complete' } });
              send({ type: 'done', data: { messageId } });
              
              closed = true;
              controller.close();
              return;
            } catch (error: any) {
              console.error('[Chat Stream] User tool execution error:', error);
              
              send({
                type: 'tool',
                data: {
                  tool: userTool.name,
                  callId,
                  args: toolArgs,
                  status: 'failed',
                  error: error.message,
                },
              });
              
              send({ type: 'delta', data: { content: `**Error executing ${userTool.label}**: ${error.message}` } });
              send({ type: 'done', data: { messageId } });
              
              closed = true;
              controller.close();
              return;
            }
        }
        
        // Build conversation history from previous messages (exclude the last one which is the current message)
        const conversationHistory = messages.slice(0, -1)
          .filter((msg: any) => msg.role === 'user' || msg.role === 'assistant')
          .map((msg: any) => ({
            role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
            content: msg.content
          }));
        
        // Resource optimization: Auto-detect lightweight mode based on system RAM
        const lightweightMode = detectLightweightMode();
        // Use RAM-based model recommendation as fallback instead of scorpion:latest
        const defaultModel = model || process.env.OLLAMA_MODEL || getRecommendedModelForRAM();
        
        // Check cache first (before planning)
        const cachedResponse = getCachedResponse(userMessage);
        if (cachedResponse) {
          console.log('[Chat Stream] Using cached response');
          send({ type: 'delta', data: { content: cachedResponse } });
          send({ type: 'done', data: { messageId } });
          closed = true;
          controller.close();
          return;
        }
        
        // PHASE 1: PLANNER (ALWAYS USED - analyzes intent and determines if council is needed)
        checkAbort(); // Check before planner
        console.log('[Chat Stream] Using planner mode - analyzing intent');
        send({ type: 'status', data: { message: 'Analyzing request...', phase: 'planning' } });
        send({ type: 'progress', data: { phase: 'planning', progress: 10, message: 'Analyzing request...' } });
        
        // Use lighter model by default for better resource efficiency
        const defaultMaxTokens = lightweightMode ? 200 : 300;
        const defaultTemp = lightweightMode ? 0.1 : 0.2;
        
        send({ type: 'status', data: { message: 'Generating plan...', phase: 'planning' } });
        send({ type: 'progress', data: { phase: 'planning', progress: 30, message: 'Generating plan...' } });
        
        let plannerPrompt = readFileSync(getPromptPath('planner.system.txt'), 'utf-8');
        
        // Generate dynamic tools list from registry
        const generateToolsList = () => {
          let toolsList = '\nAI-Callable Tools (for planning):\n';
          
          // Add all AI-callable tools
          try {
            Object.entries(tools).forEach(([name, tool]) => {
              const desc = tool?.description || tool?.label || name;
              toolsList += `- ${name} → ${desc}\n`;
            });
          } catch (e) {
            console.error('[Planner] Error generating AI tools list:', e);
          }
          
          toolsList += '\nUser Tools (can be planned, but execute directly):\n';
          
          // Add implemented user tools
          try {
            Object.entries(userTools).forEach(([name, tool]) => {
              if (tool && tool.implemented !== false) {
                const desc = tool?.description || tool?.label || name;
                toolsList += `- ${name} → ${desc}\n`;
              }
            });
          } catch (e) {
            console.error('[Planner] Error generating user tools list:', e);
          }
          
          return toolsList;
        };
        
        // Inject dynamic tools list into prompt (replace the static AVAILABLE TOOLS section)
        const toolsList = generateToolsList();
        // Replace everything from "AVAILABLE TOOLS" until "CRITICAL:" or next major section
        plannerPrompt = plannerPrompt.replace(
          /AVAILABLE TOOLS[\s\S]*?(?=\nCRITICAL:|PLANNING STRATEGY|CONTEXT HINTS|OUTPUT FORMAT)/,
          `AVAILABLE TOOLS${toolsList}\n\n`
        );
        
        // Add explicit enforcement messages based on question type
        const codebaseKeywords = /(lightningflow|lightning flow|scorpion|n8n|workflow|codebase|project|app|code|implementation|repository|repo|package|module)/i;
        const operationalKeywords = /(system health|check system|system status|show logs|recent errors|system metrics|uptime|health check)/i;
        const workflowKeywords = /(trigger workflow|run workflow|workflow status|execute workflow|workflow id)/i;
        const analysisKeywords = /(analyze project|project structure|dependencies|project health|project analysis)/i;
        
        const isCodebaseQuestionCheck = codebaseKeywords.test(userMessage);
        const isOperationalQuestion = operationalKeywords.test(userMessage);
        const isWorkflowQuestion = workflowKeywords.test(userMessage);
        const isAnalysisQuestion = analysisKeywords.test(userMessage);
        
        if (isCodebaseQuestionCheck) {
          plannerPrompt += `\n\n⚠️ CRITICAL: This is a CODEBASE QUESTION. You MUST include code.readFile steps in your plan. DO NOT create a plan with only kb.search. Reading actual code files is REQUIRED.`;
        } else if (isOperationalQuestion) {
          plannerPrompt += `\n\n⚠️ CRITICAL: This is an OPERATIONAL QUESTION. Use system.health or logs.tail directly. DO NOT use kb.search - use the appropriate operational tool!`;
        } else if (isWorkflowQuestion) {
          plannerPrompt += `\n\n⚠️ CRITICAL: This is a WORKFLOW QUESTION. Use workflows.trigger or project.analyze directly. DO NOT default to kb.search!`;
        } else if (isAnalysisQuestion) {
          plannerPrompt += `\n\n⚠️ CRITICAL: This is an ANALYSIS QUESTION. Use project.analyze directly - this is the right tool! DO NOT use kb.search for project analysis.`;
        } else {
          // General question - discourage kb.search-only plans
          plannerPrompt += `\n\n⚠️ IMPORTANT: DO NOT create plans with ONLY kb.search. If kb.search is used, ensure there's a follow-up step with a different tool (research.run, code.readFile, etc.). Tool diversity is required!`;
        }
        
        const planResponse = await runModelUnified(
          plannerPrompt,
          userMessage,
          { 
            provider: provider || 'ollama', 
            model: defaultModel,
            maxTokens: defaultMaxTokens,
            temperature: defaultTemp
          },
          undefined, // No streaming for planner
          conversationHistory // Pass conversation history
        );
        
        send({ type: 'status', data: { message: 'Parsing plan...', phase: 'planning' } });
        send({ type: 'progress', data: { phase: 'planning', progress: 60, message: 'Parsing plan...' } });
        
        let plan: Plan;
        try {
          plan = parseModelJSON(planResponse);
        } catch (error: any) {
          console.error('[Chat Stream] Failed to parse plan JSON:', error);
          console.error('[Chat Stream] Plan response:', planResponse.substring(0, 500));
          
          // Fallback: Create a simple plan that uses knowledge search
          // Improved detection for fallback
          const messageLower = userMessage.toLowerCase();
          
          // Expanded technical patterns
          const isTechnicalFallback = /(implement|deploy|integrate|build|create|develop|design|architecture|system|api|database|workflow|security|performance|optimize|refactor|migrate|configure|setup|install|how to|how do|how can|error|bug|issue|problem|fix|debug)/i.test(messageLower);
          
          // Expanded casual patterns
          const isCasualFallback = /^(what is|who is|what are|who are|tell me about|more details|more analysis|define|explain what|explain who|what|who|which|when|where)\s+(is|are|was|were|about)/i.test(messageLower) ||
                                   /^(can you|could you|would you)\s+(tell|explain|describe|define)/i.test(messageLower);
          
          // Check if it's a codebase question
          const isCodebaseQuestion = /(lightningflow|lightning flow|scorpion|n8n|workflow|codebase|project|app|code|implementation)/i.test(messageLower);
          
          // Build plan steps
          const planSteps: any[] = [
            {
              id: 's1',
              title: 'Search knowledge base for relevant information',
              tool: 'kb.search',
              args: { query: userMessage, limit: 5 },
              success: 'Found relevant knowledge entries'
            }
          ];
          
          // For codebase questions, add code.readFile steps
          if (isCodebaseQuestion) {
            let appPath = 'apps/lightningflow';
            if (messageLower.includes('scorpion')) {
              appPath = 'apps/scorpion';
            } else if (messageLower.includes('n8n')) {
              appPath = 'apps/n8n-cursor';
            }
            
            planSteps.push(
              {
                id: 's2',
                title: `Read main README to understand ${appPath.includes('lightningflow') ? 'LightningFlow' : appPath.includes('scorpion') ? 'Scorpion' : 'the codebase'}`,
                tool: 'code.readFile',
                args: { path: `${appPath}/README.md`, includeDependencies: true },
                dependsOn: ['s1'],
                success: 'README file read successfully'
              },
              {
                id: 's3',
                title: 'Read package.json to understand dependencies and purpose',
                tool: 'code.readFile',
                args: { path: `${appPath}/package.json` },
                dependsOn: ['s1'],
                success: 'package.json read successfully'
              }
            );
          }
          
          plan = {
            objective: userMessage,
            assumptions: ['User wants information or to perform a simple action'],
            plan: planSteps,
            done_when: ['Information retrieved and presented'],
            fallbacks: [],
            needsCouncil: isTechnicalFallback && !isCasualFallback, // Only technical questions need council
            questionType: isCasualFallback ? 'casual' : (isTechnicalFallback ? 'technical' : 'conversational'),
            councilRationale: isTechnicalFallback ? 'Technical question requires expert review' : 'Casual/conversational question can be answered directly'
          };
          
          send({ 
            type: 'status', 
            data: { message: 'Using fallback plan (JSON parse failed)', phase: 'planning' } 
          });
        }
        
        // Plan validation: Detect and fix kb.search-heavy plans
        const kbSearchSteps = plan.plan.filter(step => step.tool === 'kb.search');
        const hasOnlyKbSearch = plan.plan.length === kbSearchSteps.length && kbSearchSteps.length > 0;
        const hasMultipleKbSearch = kbSearchSteps.length > 1;
        
        // If plan has only kb.search or multiple kb.search steps, inject appropriate tools
        if (hasOnlyKbSearch || hasMultipleKbSearch) {
          console.log('[Chat Stream] Plan validation: Detected kb.search-heavy plan, injecting appropriate tools');
          
          // Determine what tool to add based on question type
          if (isOperationalQuestion) {
            // Replace kb.search with system.health
            plan.plan = plan.plan.map(step => 
              step.tool === 'kb.search' 
                ? { ...step, tool: 'system.health', title: 'Check system health', args: { includeMetrics: true, includeAlerts: true } }
                : step
            );
          } else if (isWorkflowQuestion) {
            // Replace kb.search with project.analyze
            plan.plan = plan.plan.map(step => 
              step.tool === 'kb.search' 
                ? { ...step, tool: 'project.analyze', title: 'Analyze project and workflows', args: { includeFiles: true, includeDependencies: true } }
                : step
            );
          } else if (isAnalysisQuestion) {
            // Replace kb.search with project.analyze
            plan.plan = plan.plan.map(step => 
              step.tool === 'kb.search' 
                ? { ...step, tool: 'project.analyze', title: 'Analyze project structure', args: { includeFiles: true, includeDependencies: true } }
                : step
            );
          } else if (!isCodebaseQuestionCheck) {
            // For general questions, add research.run as follow-up
            const lastKbSearch = kbSearchSteps[kbSearchSteps.length - 1];
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
        
        // Detect if this is a codebase question and enforce code.readFile steps
        // Improved detection: Check for codebase-related keywords or questions about projects/apps
        const userMessageLower = userMessage.toLowerCase();
        // Codebase question if it mentions codebase keywords (reuse codebaseKeywords from line 361)
        const isCodebaseQuestion = codebaseKeywords.test(userMessage);
        const hasCodeReadSteps = plan.plan.some(step => step.tool === 'code.readFile');
        
        // If codebase question but no code.readFile steps, inject them
        if (isCodebaseQuestion && !hasCodeReadSteps) {
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
          let appPath = 'apps/lightningflow'; // Default to LightningFlow
          if (userMessageLower.includes('scorpion') || subjectLower.includes('scorpion')) {
            appPath = 'apps/scorpion';
          } else if (userMessageLower.includes('n8n') || subjectLower.includes('n8n')) {
            appPath = 'apps/n8n-cursor';
          } else if (userMessageLower.includes('lightningflow') || userMessageLower.includes('lightning flow') || subjectLower.includes('lightningflow') || subjectLower.includes('lightning')) {
            appPath = 'apps/lightningflow';
          }
          
          // Find kb.search step to insert after it
          const kbSearchStep = plan.plan.find(s => s.tool === 'kb.search');
          const kbSearchIndex = kbSearchStep ? plan.plan.indexOf(kbSearchStep) : -1;
          
          // Create code.readFile steps - always read README and package.json
          const codeReadSteps = [];
          let stepCounter = plan.plan.length + 1;
          
          // Step 1: Read main README
          codeReadSteps.push({
            id: `s${stepCounter++}`,
            title: `Read main README to understand ${appPath.includes('lightningflow') ? 'LightningFlow' : appPath.includes('scorpion') ? 'Scorpion' : 'the codebase'}`,
            tool: 'code.readFile',
            args: { path: `${appPath}/README.md`, includeDependencies: true },
            dependsOn: kbSearchStep ? [kbSearchStep.id] : undefined,
            success: 'README file read successfully'
          });
          
          // Step 2: Read package.json
          codeReadSteps.push({
            id: `s${stepCounter++}`,
            title: `Read package.json to understand dependencies and purpose`,
            tool: 'code.readFile',
            args: { path: `${appPath}/package.json` },
            dependsOn: kbSearchStep ? [kbSearchStep.id] : undefined,
            success: 'package.json read successfully'
          });
          
          // Step 3: Read main entry point (try multiple possible locations)
          const possibleEntryPoints = [
            `${appPath}/src/index.ts`,
            `${appPath}/src/main.ts`,
            `${appPath}/src/app.ts`,
            `${appPath}/index.ts`,
            `${appPath}/main.ts`,
            `${appPath}/app/index.ts`,
            `${appPath}/app/main.ts`
          ];
          
          codeReadSteps.push({
            id: `s${stepCounter++}`,
            title: `Read main entry point to understand architecture`,
            tool: 'code.readFile',
            args: { path: possibleEntryPoints[0], includeAST: true, includeDependencies: true },
            dependsOn: kbSearchStep ? [kbSearchStep.id] : undefined,
            success: 'Main entry point read successfully'
          });
          
          // For LightningFlow, also read key documentation files
          if (appPath === 'apps/lightningflow') {
            // Read main UI README if it exists
            codeReadSteps.push({
              id: `s${stepCounter++}`,
              title: `Read LightningFlow UI README for detailed information`,
              tool: 'code.readFile',
              args: { path: `${appPath}/lightning-ui/README.md`, includeDependencies: true },
              dependsOn: kbSearchStep ? [kbSearchStep.id] : undefined,
              success: 'UI README read successfully'
            });
          }
          
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
        
        // Determine if council is needed based on plan's needsCouncil field or fallback analysis
        // Planner should set needsCouncil, but we have fallback detection for robustness
        const needsCouncil = plan.needsCouncil !== undefined 
          ? plan.needsCouncil 
          : (() => {
              // Fallback: analyze plan to determine if council is needed
              const planTextForConsensus = (plan.objective || userMessage).toLowerCase();
              const technicalPatterns = [
                /(implement|deploy|integrate|build|create|develop|design|architecture|system|api|database|workflow|security|performance|optimize)/,
                /create (a|an) plan/,
                /make (a|an) plan/,
                /plan (to|for|how)/,
                /how (to|do|can|should)/,
              ];
              return technicalPatterns.some(pattern => pattern.test(planTextForConsensus));
            })();
        
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
        
        // For casual questions, execute knowledge base search FIRST before council deliberation
        let knowledgeHitsForCouncil: any[] = [];
        let earlyKbSearchCompleted = false;
        if (isCasual) {
          const kbSearchStep = plan.plan.find(step => step.tool === 'kb.search');
          if (kbSearchStep) {
            try {
              send({ type: 'status', data: { message: 'Searching knowledge base...', phase: 'searching' } });
              send({ type: 'progress', data: { phase: 'searching', progress: 0, message: 'Searching knowledge base...' } });
              
              // Mark step as running
              send({
                type: 'plan_step',
                data: {
                  ...kbSearchStep,
                  status: 'running',
                },
              });
              
              send({
                type: 'tool_progress',
                data: {
                  tool: 'kb.search',
                  callId: kbSearchStep.id,
                  progress: 'Searching knowledge base...',
                  status: 'running',
                },
              });
              
              // Send intermediate progress updates
              send({ type: 'progress', data: { phase: 'searching', progress: 25, message: 'Querying knowledge base...' } });
              
              const kbResult = await executeTool('kb.search', kbSearchStep.args || {});
              
              send({ type: 'progress', data: { phase: 'searching', progress: 75, message: 'Processing results...' } });
              send({ type: 'progress', data: { phase: 'searching', progress: 100, message: 'Knowledge search completed' } });
              
              if (kbResult?.ok && kbResult?.hits) {
                knowledgeHitsForCouncil = kbResult.hits;
                earlyKbSearchCompleted = true;
                
                // Mark step as completed
                send({
                  type: 'plan_step',
                  data: {
                    ...kbSearchStep,
                    status: 'completed',
                    result: kbResult,
                  },
                });
                
                send({
                  type: 'tool_progress',
                  data: {
                    tool: 'kb.search',
                    callId: kbSearchStep.id,
                    progress: `Found ${kbResult.hits.length} results`,
                    status: 'completed',
                  },
                });
                
                // Emit knowledge event
                send({
                  type: 'knowledge',
                  data: {
                    hits: kbResult.hits,
                    query: kbSearchStep.args?.query || userMessage, // Include query for Knowledge tab
                  },
                });
                
                // Send tool event for Tools tab
                send({
                  type: 'tool',
                  data: {
                    tool: 'kb.search',
                    callId: kbSearchStep.id,
                    args: kbSearchStep.args || {},
                    status: 'completed',
                    result: kbResult,
                  },
                });
              } else {
                // Mark step as completed even if no hits
                send({
                  type: 'plan_step',
                  data: {
                    ...kbSearchStep,
                    status: 'completed',
                    result: kbResult,
                  },
                });
                
                send({
                  type: 'tool_progress',
                  data: {
                    tool: 'kb.search',
                    callId: kbSearchStep.id,
                    progress: 'No results found',
                    status: 'completed',
                  },
                });
              }
            } catch (error: any) {
              console.warn('[Chat Stream] KB search before council failed:', error);
              // Mark step as failed
              send({
                type: 'plan_step',
                data: {
                  ...kbSearchStep,
                  status: 'failed',
                  error: error.message,
                },
              });
              
              send({
                type: 'tool_progress',
                data: {
                  tool: 'kb.search',
                  callId: kbSearchStep.id,
                  progress: `Failed: ${error.message}`,
                  status: 'failed',
                },
              });
            }
          }
        }
        
        // PHASE 2: COUNCIL - Conditional based on plan.needsCouncil
        let votes: any[] = [];
        let consensus: any = null;
        
        if (needsCouncil) {
          // Council is needed for technical/complex questions
          checkAbort(); // Check before council
          send({ type: 'status', data: { message: 'Council review starting...', phase: 'council' } });
          send({ type: 'progress', data: { phase: 'council', progress: 0, message: 'Council review starting...' } });
          
          const councilMaxTokens = lightweightMode ? 100 : 150;
          const councilTemp = lightweightMode ? 0.2 : 0.4;
          
          // Track council progress
          let councilVoteCount = 0;
          
          // Run council deliberation with knowledge base results (if available)
          votes = await runCouncilDeliberationStreaming(
            plan, 
            { 
              provider: provider || 'ollama', 
              model: defaultModel,
              maxTokens: councilMaxTokens,
              temperature: councilTemp
            },
            (event) => {
              // Stream all council events (including consensus)
              send(event);
              
              // Send progress updates for council events
              if (event.type === 'council_start') {
                send({ type: 'progress', data: { phase: 'council', progress: 10, message: 'Council members analyzing...' } });
              } else if (event.type === 'council_thinking') {
                // Update progress based on status
                if (event.data.status === 'analyzing') {
                  send({ type: 'progress', data: { phase: 'council', progress: 20, message: `${event.data.memberName} analyzing...` } });
                } else if (event.data.status === 'formulating') {
                  send({ type: 'progress', data: { phase: 'council', progress: 30, message: `${event.data.memberName} formulating response...` } });
                } else if (event.data.status === 'completed') {
                  send({ type: 'progress', data: { phase: 'council', progress: 40, message: `${event.data.memberName} completed analysis` } });
                }
              } else if (event.type === 'council_thinking_delta') {
                // Send incremental progress updates during thinking (throttled)
                // Estimate progress based on accumulated content length
                // Use a simple heuristic: assume ~500 chars = 15% progress per member
                const contentLength = event.data.accumulated?.length || 0;
                const estimatedProgress = Math.min(35, 20 + Math.floor((contentLength / 500) * 15));
                
                // Only send progress update every ~100 chars to avoid spam
                if (contentLength % 100 < 50) { // Rough throttling
                  send({ 
                    type: 'progress', 
                    data: { 
                      phase: 'council', 
                      progress: estimatedProgress, 
                      message: `${event.data.memberName} thinking...` 
                    } 
                  });
                }
              } else if (event.type === 'council_vote') {
                councilVoteCount++;
                const progress = Math.min(90, 50 + (councilVoteCount * 5));
                send({ type: 'progress', data: { phase: 'council', progress, message: `Vote ${councilVoteCount} received...` } });
              } else if (event.type === 'council_consensus') {
                send({ type: 'progress', data: { phase: 'council', progress: 100, message: 'Consensus reached' } });
              }
            },
            knowledgeHitsForCouncil // Pass knowledge base results
          );
          
          // Compute consensus for summarizer
          consensus = computeConsensus(votes, isCasual, userMessage);
        } else {
          // Skip council for casual/conversational questions
          console.log('[Chat Stream] Skipping council - casual/conversational question');
          send({ type: 'status', data: { message: 'Proceeding directly to execution...', phase: 'executing' } });
          // Create a simple approval consensus for summarizer
          consensus = {
            approved: true,
            score: 10,
            summary: plan.objective || userMessage
          };
        }
        
        // PHASE 3: EXECUTOR
        checkAbort(); // Check before executor
        send({ type: 'status', data: { message: 'Executing plan...', phase: 'executing' } });
        send({ type: 'progress', data: { phase: 'executing', progress: 0, message: 'Starting execution...' } });
        
        const results: any[] = [];
        const totalSteps = plan.plan.filter(s => s.tool !== 'none').length;
        let completedSteps = 0;
        
        for (const step of plan.plan) {
          checkAbort(); // Check before each step
          if (step.tool === 'none') continue;
          
          // Skip kb.search if it was already executed early for casual questions
          if (isCasual && step.tool === 'kb.search' && earlyKbSearchCompleted) {
            // Reuse the result from early execution
            const earlyResult = knowledgeHitsForCouncil.length > 0 
              ? { ok: true, hits: knowledgeHitsForCouncil }
              : { ok: true, hits: [] };
            
            results.push({ step: step.id, result: earlyResult });
            completedSteps++;
            
            // Send tool event for skipped step (already executed early) so Tools tab shows it
            send({
              type: 'tool',
              data: {
                tool: step.tool,
                callId: step.id,
                args: step.args || {},
                status: 'completed',
                result: earlyResult,
              },
            });
            
            continue;
          }
          
          // Send status update before executing step
          send({ 
            type: 'status', 
            data: { 
              message: `Executing: ${step.title}...`, 
              phase: 'executing',
              stepId: step.id 
            } 
          });
          
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
          
          // Send tool progress event
          send({
            type: 'tool_progress',
            data: {
              tool: step.tool,
              callId: step.id,
              progress: `Starting ${step.tool}...`,
              status: 'starting',
            },
          });
          
          // Update progress - calculate based on step position
          const stepProgress = Math.floor((completedSteps / totalSteps) * 100);
          const stepStartProgress = Math.floor((completedSteps / totalSteps) * 100);
          const stepEndProgress = Math.floor(((completedSteps + 1) / totalSteps) * 100);
          
          send({ 
            type: 'progress', 
            data: { 
              phase: 'executing', 
              step: step.id,
              progress: stepStartProgress, 
              message: `Starting step ${completedSteps + 1}/${totalSteps}: ${step.title}` 
            } 
          });
          
          try {
            checkAbort(); // Check before tool execution
            
            // Send tool progress update
            send({
              type: 'tool_progress',
              data: {
                tool: step.tool,
                callId: step.id,
                progress: `Running ${step.tool}...`,
                status: 'running',
              },
            });
            
            // Send intermediate progress during execution
            const midProgress = Math.floor((stepStartProgress + stepEndProgress) / 2);
            send({ 
              type: 'progress', 
              data: { 
                phase: 'executing', 
                step: step.id,
                progress: midProgress, 
                message: `Executing ${step.tool}...` 
              } 
            });
            
            const result = await executeTool(step.tool, step.args || {});
            results.push({ step: step.id, result });
            completedSteps++;
            
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
            
            // Send completion progress
            send({
              type: 'tool_progress',
              data: {
                tool: step.tool,
                callId: step.id,
                progress: `Completed ${step.tool}`,
                status: 'completed',
              },
            });
            
            // Update overall progress
            const stepProgress = Math.floor((completedSteps / totalSteps) * 100);
            send({ 
              type: 'progress', 
              data: { 
                phase: 'executing', 
                step: step.id,
                progress: stepProgress, 
                message: `Completed step ${completedSteps}/${totalSteps}: ${step.title}` 
              } 
            });
            
            // Emit dedicated knowledge event when kb.search completes successfully
            if (step.tool === 'kb.search' && result?.ok && result?.hits) {
              send({
                type: 'knowledge',
                data: {
                  hits: result.hits,
                  query: step.args?.query || userMessage, // Include query for Knowledge tab
                },
              });
            }
            
            // If kb.search returned empty results and this is a general question, trigger web research
            if (step.tool === 'kb.search' && result?.ok && result?.hits?.length === 0) {
              const query = step.args?.query || userMessage;
              const codebaseKeywordsPattern = /(lightningflow|lightning flow|scorpion|n8n|workflow|codebase|project|app|code|implementation|repository|repo|package|module)/i;
              const isCodebaseQuestion = codebaseKeywordsPattern.test(query);
              const isGeneralQuestion = /^(what|who|how|why|when|where|tell me|explain|describe)/i.test(query);
              
              if (!isCodebaseQuestion && isGeneralQuestion) {
                // This is a general knowledge question - add research step
                send({
                  type: 'status',
                  data: { message: 'No local knowledge found. Searching web...', phase: 'researching' }
                });
                
                try {
                  const researchResult = await executeTool('research.run', {
                    query: query,
                    depth: 'medium',
                    category: 'general',
                    maxSites: 5
                  });
                  
                  if (researchResult?.ok) {
                    results.push({ step: 'research_fallback', result: researchResult });
                    
                    send({
                      type: 'tool',
                      data: {
                        tool: 'research.run',
                        callId: 'research_fallback',
                        args: { query },
                        status: 'completed',
                        result: researchResult,
                      },
                    });
                    
                    send({
                      type: 'research',
                      data: {
                        sessionId: researchResult.sessionId,
                        viewUrl: researchResult.viewUrl,
                      },
                    });
                  }
                } catch (researchError: any) {
                  console.warn('[Chat Stream] Web research fallback failed:', researchError);
                }
              } else if (isCodebaseQuestion) {
                // Codebase question but no results - trigger knowledge extraction
                send({
                  type: 'status',
                  data: { message: 'Triggering knowledge extraction...', phase: 'extracting' }
                });
                
                fetch('/api/project/knowledge', { method: 'POST' }).catch(err => 
                  console.warn('[Chat Stream] Knowledge extraction trigger failed:', err)
                );
              }
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
              type: 'tool_progress',
              data: {
                tool: step.tool,
                callId: step.id,
                progress: `Failed: ${error.message}`,
                status: 'failed',
              },
            });
            
            send({
              type: 'plan_step',
              data: { ...step, status: 'failed' },
            });
            
            completedSteps++; // Count failed steps too
          }
        }
        
        // PHASE 4: SUMMARIZER
        checkAbort(); // Check before summarizer
        send({ type: 'status', data: { message: 'Summarizing results...', phase: 'summarizing' } });
        send({ type: 'progress', data: { phase: 'summarizing', progress: 0, message: 'Preparing summary...' } });
        
        send({ type: 'progress', data: { phase: 'summarizing', progress: 20, message: 'Gathering results...' } });
        
        const summarizerPrompt = readFileSync(getPromptPath('summarizer.system.txt'), 'utf-8');
        
        // Extract code.readFile results from tool results
        const codeReadResults = results
          .filter(r => {
            const step = plan.plan.find(s => s.id === r.step);
            return step?.tool === 'code.readFile' && r.result?.ok;
          })
          .map(r => {
            const step = plan.plan.find(s => s.id === r.step);
            return {
              path: step?.args?.path || 'unknown',
              content: r.result?.content || '',
              ast: r.result?.ast,
              dependencies: r.result?.dependencies || [],
              language: r.result?.language
            };
          });
        
        // Extract knowledge hits and research results from tool results - improved extraction
        const knowledgeHits = results
          .filter(r => {
            const step = plan.plan.find(s => s.id === r.step);
            return step?.tool === 'kb.search' && r.result?.hits;
          })
          .flatMap(r => r.result.hits || []);
        
        // Prioritize README files and main documentation for "what is" questions - improved detection
        const messageLower = userMessage.toLowerCase();
        const isWhatIsQuestion = /^(what is|who is|what are|who are|define|tell me about|explain what|explain who|more details|more analysis)/i.test(messageLower) ||
                                 /^(what|who|which)\s+(is|are|was|were)/i.test(messageLower);
        let prioritizedKnowledgeHits = knowledgeHits;
        
        if (isWhatIsQuestion && knowledgeHits.length > 0) {
          // Sort: README files first, then filter out internal system docs
          prioritizedKnowledgeHits = knowledgeHits
            .map((h: any) => ({
              ...h,
              isReadme: h.title?.toLowerCase().includes('readme') || 
                       h.id?.toLowerCase().includes('readme') ||
                       h.source?.toLowerCase().includes('readme') ||
                       h.url?.toLowerCase().includes('readme'),
              isInternalSystem: h.title?.toLowerCase().includes('consistency system') ||
                               h.title?.toLowerCase().includes('global consistency') ||
                               h.title?.toLowerCase().includes('implementation status') ||
                               h.title?.toLowerCase().includes('system status')
            }))
            .filter((h: any) => !h.isInternalSystem) // Remove internal system docs
            .sort((a: any, b: any) => {
              // README files first
              if (a.isReadme && !b.isReadme) return -1;
              if (!a.isReadme && b.isReadme) return 1;
              return 0;
            });
        }
        
        const researchResults = results
          .filter(r => r.step === 'research_fallback' || r.result?.sessionId)
          .map(r => r.result);
        
        // Extract tool results for better summarization
        const systemHealthResults = results
          .filter(r => {
            const step = plan.plan.find(s => s.id === r.step);
            return step?.tool === 'system.health' && r.result?.ok;
          })
          .map(r => r.result);
        
        const logsResults = results
          .filter(r => {
            const step = plan.plan.find(s => s.id === r.step);
            return step?.tool === 'logs.tail' && r.result?.ok;
          })
          .map(r => r.result);
        
        const projectAnalyzeResults = results
          .filter(r => {
            const step = plan.plan.find(s => s.id === r.step);
            return step?.tool === 'project.analyze' && r.result?.ok;
          })
          .map(r => r.result);
        
        // Build comprehensive context with actual results
        const hasKnowledge = prioritizedKnowledgeHits.length > 0;
        const hasResearch = researchResults.length > 0;
        const hasSystemHealth = systemHealthResults.length > 0;
        const hasLogs = logsResults.length > 0;
        const hasProjectAnalyze = projectAnalyzeResults.length > 0;
        const hasResults = hasKnowledge || hasResearch || hasSystemHealth || hasLogs || hasProjectAnalyze || codeReadResults.length > 0;
        
        // Use questionType from plan for adaptive summarizer output
        const finalQuestionType = questionType; // Use the determined question type
        let summaryContext = '';
        
        // Add question type context for summarizer at the start
        summaryContext += `QUESTION TYPE: ${finalQuestionType}\n`;
        summaryContext += `COUNCIL USED: ${needsCouncil ? 'yes' : 'no'}\n`;
        summaryContext += `USER QUESTION: ${userMessage}\n\n`;
        
        // Build comprehensive context with code.readFile results (HIGHEST PRIORITY)
        if (codeReadResults.length > 0) {
          summaryContext += `=== CODE FILES READ (PRIMARY SOURCE - USE THESE) ===\n`;
          codeReadResults.forEach((file, idx) => {
            summaryContext += `\n--- File ${idx + 1}: ${file.path} ---\n`;
            summaryContext += `Language: ${file.language || 'unknown'}\n`;
            summaryContext += `Content:\n${file.content}\n`;
            if (file.dependencies && file.dependencies.length > 0) {
              summaryContext += `\nDependencies: ${file.dependencies.join(', ')}\n`;
            }
            if (file.ast) {
              summaryContext += `\nStructure: ${file.ast.classes?.length || 0} classes, ${file.ast.functions?.length || 0} functions\n`;
            }
          });
          summaryContext += `\n\nCRITICAL INSTRUCTIONS:\n`;
          summaryContext += `- Use the ACTUAL CODE CONTENT above to provide comprehensive answers\n`;
          summaryContext += `- Explain what the code actually does, not just what files exist\n`;
          summaryContext += `- Understand relationships between files using dependency information\n`;
          summaryContext += `- Build comprehensive understanding from multiple code files\n`;
          summaryContext += `- For "what is X": Explain based on actual code content, architecture, and structure\n`;
          summaryContext += `- For "more details": Provide deeper analysis based on code structure and relationships\n`;
          summaryContext += `- DO NOT just reference file names - explain what the code does\n\n`;
        }
        
        if (isCasual) {
          // For casual questions, prioritize knowledge base results over council consensus
          summaryContext += `User Question: ${userMessage}\n\n`;
          
          // Add system health results if available
          if (hasSystemHealth) {
            summaryContext += `=== SYSTEM HEALTH (PRIMARY SOURCE) ===\n`;
            systemHealthResults.forEach((result, idx) => {
              summaryContext += `\nSystem Status: ${result.status || 'unknown'}\n`;
              summaryContext += `Uptime: ${result.uptime || 'N/A'} seconds\n`;
              if (result.services) {
                summaryContext += `Services:\n${JSON.stringify(result.services, null, 2)}\n`;
              }
              if (result.agents) {
                summaryContext += `Agents: ${result.agents.total || 0} total, ${result.agents.active || 0} active\n`;
              }
              if (result.workflows) {
                summaryContext += `Workflows: ${result.workflows.total || 0} total, ${result.workflows.active || 0} active\n`;
              }
              if (result.alerts && result.alerts.length > 0) {
                summaryContext += `Alerts: ${JSON.stringify(result.alerts, null, 2)}\n`;
              }
            });
            summaryContext += `\nCRITICAL: Synthesize the system health information above into a clear, intelligent answer. Explain what the metrics mean and what the status indicates.\n\n`;
          }
          
          // Add logs results if available
          if (hasLogs) {
            summaryContext += `=== LOGS (PRIMARY SOURCE) ===\n`;
            logsResults.forEach((result, idx) => {
              summaryContext += `\nLogs (${result.count || 0} entries):\n`;
              if (result.logs && result.logs.length > 0) {
                result.logs.slice(0, 20).forEach((log: any) => {
                  summaryContext += `[${log.level || 'info'}] ${log.message || log.content || JSON.stringify(log)}\n`;
                });
              }
            });
            summaryContext += `\nCRITICAL: Summarize key errors, warnings, and patterns from the logs above. Don't just list them - explain what they mean.\n\n`;
          }
          
          // Add project analysis results if available
          if (hasProjectAnalyze) {
            summaryContext += `=== PROJECT ANALYSIS (PRIMARY SOURCE) ===\n`;
            projectAnalyzeResults.forEach((result, idx) => {
              summaryContext += `\nProject Analysis:\n`;
              if (result.summary) {
                summaryContext += `Summary: ${JSON.stringify(result.summary, null, 2)}\n`;
              }
              if (result.structure) {
                summaryContext += `Structure: ${JSON.stringify(result.structure, null, 2)}\n`;
              }
              if (result.health) {
                summaryContext += `Health Score: ${result.health.score || 'N/A'}\n`;
                if (result.health.issues) {
                  summaryContext += `Issues: ${JSON.stringify(result.health.issues, null, 2)}\n`;
                }
                if (result.health.recommendations) {
                  summaryContext += `Recommendations: ${JSON.stringify(result.health.recommendations, null, 2)}\n`;
                }
              }
            });
            summaryContext += `\nCRITICAL: Synthesize the project analysis above into clear insights about project structure, health, and recommendations.\n\n`;
          }
          
          if (hasKnowledge) {
            // Highlight README files prominently
            const readmeHits = prioritizedKnowledgeHits.filter((h: any) => h.isReadme);
            const otherHits = prioritizedKnowledgeHits.filter((h: any) => !h.isReadme);
            
            if (readmeHits.length > 0) {
              summaryContext += `PRIMARY SOURCE - README Files (USE THESE FIRST):\n${readmeHits.map((h: any) => 
                `- ${h.title}${h.spans?.[0]?.text ? ': ' + h.spans[0].text.substring(0, 400) : ''}`
              ).join('\n')}\n\n`;
            }
            
            if (otherHits.length > 0) {
              summaryContext += `Additional Knowledge Base Results:\n${otherHits.map((h: any) => 
                `- ${h.title}: ${h.spans?.[0]?.text || 'No description'}`
              ).join('\n')}\n\n`;
            }
          }
          
          if (hasResearch) {
            summaryContext += `Web Research: Research session started. Check ${researchResults[0]?.viewUrl || 'research page'} for detailed findings.\n\n`;
          }
          
          // For "what is" questions, prioritize knowledge base over council consensus
          if (isWhatIsQuestion && hasKnowledge) {
            summaryContext += `Council Consensus (for reference only - prioritize README files above):\n${consensus.summary}\n\n`;
            summaryContext += `CRITICAL INSTRUCTIONS FOR "WHAT IS" QUESTIONS:
- The README FILES above are the PRIMARY SOURCE - use them FIRST and MOST IMPORTANTLY
- LightningFlow AI is a "Sovereign financial operating system built on Bitcoin Lightning Network with AI-powered automation" (from README)
- LightningFlow is a PRODUCT/PLATFORM, not just a "concept" or "architecture"
- If README files are provided, use their exact definition
- Documents about "Global Consistency System", "Implementation Status", etc. are about INTERNAL SYSTEMS within the product, NOT what the product IS
- Only use council consensus if README files don't have the answer
- If README files conflict with council consensus, TRUST THE README FILES
- DO NOT confuse internal systems documentation with product definitions
- OUTPUT FORMAT: Use a natural, conversational format. Write like explaining to a friend. NO technical jargon. Start with: "LightningFlow AI is..." based on the README definition.`;
          } else {
            summaryContext += `Council Consensus:\n${consensus.summary}\n\n`;
            summaryContext += `IMPORTANT: 
- Use ONLY the information provided above (knowledge base results, research, council consensus)
- If no knowledge base results were found, state that clearly
- If web research was started, mention that research is available
- Base your answer on the council's collective understanding
- DO NOT make up information that isn't in the sources above
- If you don't have enough information, say so clearly
- OUTPUT FORMAT: Use a natural, conversational format. Keep it simple and friendly. NO technical jargon.`;
          }
        } else {
          // Technical questions - use existing format
          summaryContext = `Plan: ${JSON.stringify(plan)}\n\nResults: ${JSON.stringify(results)}\n\nConsensus: ${consensus.summary}`;
          
          if (hasKnowledge) {
            summaryContext += `\n\nKnowledge Base Citations:\n${prioritizedKnowledgeHits.map((h: any) => `- ${h.title} (${h.url || 'N/A'})`).join('\n')}`;
          }
        }
        
        send({ type: 'progress', data: { phase: 'summarizing', progress: 40, message: 'Building context...' } });
        
        const summaryMaxTokens = lightweightMode ? 400 : 600;
        const summaryTemp = lightweightMode ? 0.3 : 0.5;
        
        send({ type: 'progress', data: { phase: 'summarizing', progress: 60, message: 'Generating summary...' } });
        
        const summary = await runModelUnified(
          summarizerPrompt,
          summaryContext,
          { 
            provider: provider || 'ollama', 
            model: defaultModel,
            maxTokens: summaryMaxTokens,
            temperature: summaryTemp
          },
          undefined, // No streaming for summarizer
          conversationHistory // Pass conversation history
        );
        
        send({ type: 'progress', data: { phase: 'summarizing', progress: 90, message: 'Finalizing response...' } });
        
        // Validate summary doesn't contain obvious false information
        // Check if summary mentions things not in the sources
        let finalSummary = summary;
        if (isCasual && !hasResults && !summary.toLowerCase().includes('not found') && !summary.toLowerCase().includes('no information')) {
          // If no results but summary doesn't acknowledge it, append a note
          finalSummary = summary + '\n\n*Note: No specific information was found in the knowledge base. The answer above is based on general knowledge.';
        }
        
        // Stream summary in chunks to ensure all content is sent
        // Split into chunks to avoid any potential truncation issues
        const summaryWords = finalSummary.split(' ');
        const summaryChunkSize = 10; // Larger chunks for summary
        for (let i = 0; i < summaryWords.length; i += summaryChunkSize) {
          checkAbort(); // Check before each chunk
          const chunk = summaryWords.slice(i, i + summaryChunkSize).join(' ');
          send({ type: 'delta', data: { content: (i > 0 ? ' ' : '') + chunk } });
          // Small delay for smooth streaming
          if (i + summaryChunkSize < summaryWords.length) {
            await new Promise(resolve => setTimeout(resolve, 10));
          }
        }
        
        // Remember in memory
        remember(conversationId, `User: ${userMessage}\nAssistant: ${summary}`);
        
        // Final progress update
        send({ type: 'progress', data: { phase: 'summarizing', progress: 100, message: 'Complete' } });
        
        // Done
        send({ type: 'done', data: { messageId } });
        
      } catch (error: any) {
        // Don't log error if it was due to client disconnection
        if (error.message === 'Client disconnected' || req.signal.aborted || aborted) {
          console.log('[Chat Stream] Stream aborted by client');
        } else {
          console.error('[Chat Stream] Fatal error:', error);
          console.error('[Chat Stream] Stack:', error.stack);
          
          // Clean up error message - remove stack traces and format nicely
          let cleanMessage = error.message || 'Unknown error occurred';
          
          // Remove stack trace if present
          if (cleanMessage.includes('at runOllama') || cleanMessage.includes('at process')) {
            const lines = cleanMessage.split('\n');
            cleanMessage = lines.filter((line: string) => 
              !line.includes('at ') && 
              !line.includes('webpack-internal') &&
              !line.includes('node:internal')
            ).join('\n');
          }
          
          // Remove duplicate troubleshooting sections
          if (cleanMessage.includes('Troubleshooting:')) {
            const parts = cleanMessage.split('Troubleshooting:');
            cleanMessage = parts[0] + '\n\n**Troubleshooting:**\n' + parts.slice(1).join('\n');
            // Remove duplicates
            const troubleshootingMatch = cleanMessage.match(/\*\*Troubleshooting:\*\*[\s\S]*?(?=\n\n|\n$|$)/);
            if (troubleshootingMatch) {
              const troubleshooting = troubleshootingMatch[0];
              cleanMessage = cleanMessage.replace(/\*\*Troubleshooting:\*\*[\s\S]*?(?=\n\n|\n$|$)/g, '');
              cleanMessage = cleanMessage.trim() + '\n\n' + troubleshooting;
            }
          }
          
          send({ 
            type: 'error', 
            data: { 
              message: cleanMessage,
              // Don't send stack trace to frontend
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

