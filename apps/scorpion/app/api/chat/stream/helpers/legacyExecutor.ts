// Power of 10 Rule 4: Extract legacy executor loop to focused module
// Migration Job #1: Legacy Executor Extraction
// This module contains the legacy executor loop that was previously in processStreamStart.ts

import { v4 as uuidv4 } from 'uuid';
import type { Plan } from '@/lib/chat/types';
import { executeTool } from '@/lib/chat/tools';
import { emitEvent } from '@/lib/events/event-bus';
import { runPromptWithKillSwitch, ExecutorStepSchema, OntologyLinkerSchema, DataframeAnalystSchema, FileInspectorSchema } from '@scorpion/core';

export interface LegacyExecutorInput {
  plan: Plan;
  userMessage: string;
  conversationId: string | undefined;
  checkAbort: () => void;
  send: (event: { type: string; data: Record<string, unknown> }) => void;
  shouldUseKnowledgeBase: (intent: string) => boolean;
  intent: string;
  earlyKbSearchCompleted: boolean;
  knowledgeHitsForCouncil: any[];
  modelConfig: {
    provider: string;
    model: string;
    maxTokens: number;
    temperature: number;
  };
  runModelForPrompt: (systemPrompt: string, userPrompt: string, config: any) => Promise<any>;
}

export interface LegacyExecutorResult {
  results: Array<{ step: string; result: any }>;
  kbAttempted: boolean;
  kbHasResults: boolean;
}

/**
 * Run legacy executor loop
 * Power of 10 Rule 3: < 100 lines (orchestrator function)
 * Power of 10 Rule 4: Single responsibility - legacy executor execution
 * 
 * This function executes plan steps using the legacy executor loop.
 * It handles tool execution, progress tracking, event emission, and optional
 * post-processing (executor tracking, ontology linking, dataframe analysis, file inspection).
 */
export async function runLegacyExecutor(
  input: LegacyExecutorInput
): Promise<LegacyExecutorResult> {
  const {
    plan,
    userMessage,
    conversationId,
    checkAbort,
    send,
    shouldUseKnowledgeBase,
    intent,
    earlyKbSearchCompleted,
    knowledgeHitsForCouncil,
    modelConfig,
    runModelForPrompt,
  } = input;

  const results: Array<{ step: string; result: any }> = [];
  let kbAttempted = false;
  let kbHasResults = false;
  
  const totalSteps = plan.plan.filter(s => s.tool !== 'none').length;
  let completedSteps = 0;
  
  // If no tools in plan, send a status event so Tools tab shows something
  if (totalSteps === 0) {
    send({
      type: 'tool',
      data: {
        tool: 'none',
        callId: 'no-tools',
        status: 'completed',
        result: { ok: true, message: 'No tools required for this request' },
      },
    });
    return { results, kbAttempted, kbHasResults };
  }
  
  // Power of 10 Rule 2: Bounded loop
  const MAX_STEPS = 1000;
  const stepsToProcess = plan.plan.slice(0, MAX_STEPS);
  
  for (const step of stepsToProcess) {
    checkAbort(); // Check before each step
    if (step.tool === 'none') continue;
    
    // Skip kb.search if it was already executed early (and intent allows KB)
    if (shouldUseKnowledgeBase(intent) && step.tool === 'kb.search' && earlyKbSearchCompleted) {
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
        status: 'running',
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
      
      // PANEL EVENT GUARANTEE: Emit tool_call event with 'running' status
      send({
        type: 'tool',
        data: {
          tool: step.tool,
          callId: step.id,
          args: step.args || {},
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
      
      // PROACTIVE ERROR PREVENTION: Validate tool exists before execution
      if (!step.tool || step.tool === 'none') {
        console.warn(`[Chat Stream] Skipping step ${step.id}: invalid tool "${step.tool}"`);
        completedSteps++;
        continue;
      }
      
      // Validate tool name format
      if (typeof step.tool !== 'string' || step.tool.trim().length === 0) {
        console.error(`[Chat Stream] Invalid tool name in step ${step.id}:`, step.tool);
        send({
          type: 'tool',
          data: {
            tool: step.tool,
            callId: step.id,
            args: step.args || {},
            status: 'error',
            error: 'Invalid tool name',
          },
        });
        send({
          type: 'plan_step',
          data: { ...step, status: 'failed', error: 'Invalid tool name' },
        });
        completedSteps++;
        continue;
      }
      
      let result;
      const stepStartTime = Date.now();
      try {
        // Emit tool.requested event for plan step
        await emitEvent({
          id: uuidv4(),
          type: 'tool.requested',
          severity: 'info',
          timestamp: new Date().toISOString(),
          source: 'chat-stream',
          environment: 'dev',
          data: {
            tool: step.tool,
            callId: step.id,
            args: step.args || {},
            conversationId,
            planStep: true,
          },
        });
        
        result = await executeTool(step.tool, step.args || {});
        
        // PROACTIVE VALIDATION: Ensure result has expected structure
        if (!result || typeof result !== 'object') {
          console.warn(`[Chat Stream] Tool ${step.tool} returned invalid result:`, result);
          result = {
            ok: false,
            error: 'Tool returned invalid result format',
            originalResult: result
          };
        }
        
        // Ensure result has ok property
        if (!('ok' in result)) {
          console.warn(`[Chat Stream] Tool ${step.tool} result missing 'ok' property:`, result);
          result = {
            ok: true,
            data: result
          };
        }
      } catch (toolError: any) {
        console.error(`[Chat Stream] Tool execution error for ${step.tool}:`, toolError);
        result = {
          ok: false,
          error: toolError.message || 'Tool execution failed',
          stack: process.env.NODE_ENV === 'development' ? toolError.stack : undefined
        };
        
        // PANEL EVENT GUARANTEE: Emit tool_error event on failure
        send({
          type: 'tool',
          data: {
            tool: step.tool,
            callId: step.id,
            args: step.args || {},
            status: 'error',
            error: result.error,
          },
        });
        
        // Emit tool.result event for failed tool
        const stepDuration = Date.now() - stepStartTime;
        await emitEvent({
          id: uuidv4(),
          type: 'tool.result',
          severity: 'error',
          timestamp: new Date().toISOString(),
          source: 'chat-stream',
          environment: 'dev',
          data: {
            tool: step.tool,
            callId: step.id,
            success: false,
            duration: stepDuration,
            error: result.error,
            conversationId,
            planStep: true,
          },
        });
      }
      
      // Emit tool.result event for successful tool execution
      if (result.ok) {
        const stepDuration = Date.now() - stepStartTime;
        await emitEvent({
          id: uuidv4(),
          type: 'tool.result',
          severity: 'info',
          timestamp: new Date().toISOString(),
          source: 'chat-stream',
          environment: 'dev',
          data: {
            tool: step.tool,
            callId: step.id,
            success: true,
            duration: stepDuration,
            conversationId,
            planStep: true,
          },
        });
      }
      
      // CRITICAL: Mark system tools as contentful even if they don't have a text content field
      // System tools (system.health, stats.get) return structured data that should be treated as content
      const isSystemTool = step.tool === 'system.health' || step.tool === 'stats.get' || step.tool === 'logs.tail' || step.tool === 'project.status';
      const hasStructuredData = !!(result.data || result.status || result.uptime || result.services || result.stats);
      const hasContent = !!result.content || (isSystemTool && (result.ok && hasStructuredData));
      
      // CRITICAL: Log result before pushing
      console.log(`[Chat Stream] Tool ${step.tool} (${step.id}) completed:`, {
        ok: result.ok,
        hasContent: hasContent,
        isSystemTool: isSystemTool,
        hasStructuredData: hasStructuredData,
        hasHits: !!result.hits,
        hasData: !!result.data,
        error: result.error,
        resultKeys: Object.keys(result)
      });
      
      // Executor: Track step execution with structured logging (optional, skip if disabled)
      // Note: Tolerant parsing is now handled in runPromptWithKillSwitch via registered helpers
      if (process.env['SCORPION_ENABLE_EXECUTOR'] !== '0') {
        try {
          const executorStep = await runPromptWithKillSwitch(
            'executor.system.txt',
            {
              stepId: step.id,
              tool: step.tool,
              args: step.args,
              result: result.ok ? { ok: true, truncated: true } : { ok: false, error: result.error },
              startedAt: new Date(Date.now() - (result.latency || 0)).toISOString(),
              endedAt: new Date().toISOString(),
            },
            ExecutorStepSchema,
            modelConfig,
            runModelForPrompt
          );
          
          // Fallback: if executor parsing still fails (kill-switch activated), infer status from tool result
          if (executorStep) {
            console.log(`[Executor] Step ${step.id} tracked:`, executorStep.status);
          } else {
            // Kill-switch activated - infer status from tool result as fallback
            const inferredStatus = result.ok ? 'success' : (result.error ? 'failed' : 'skipped');
            console.log(`[Executor] Step ${step.id} tracked (inferred):`, inferredStatus);
          }
        } catch (error: any) {
          // If executor parsing fails, log once and continue (non-blocking)
          console.warn('[Chat Stream] Executor tracking failed, continuing:', error.message);
        }
      }
      
      // Ontology Linker: Extract entities and relationships from code.readFile results (optional, skip if disabled)
      if (step.tool === 'code.readFile' && result?.ok && result?.content && process.env['SCORPION_ENABLE_ONTOLOGY_LINKER'] !== '0') {
        try {
          const ontologyResult = await runPromptWithKillSwitch(
            'ontology-linker.system.txt',
            {
              code: result.content.substring(0, 5000), // Truncate to avoid token limits
              path: step.args?.['path'] || 'unknown',
            },
            OntologyLinkerSchema,
            modelConfig,
            runModelForPrompt
          );
          
          if (ontologyResult && ontologyResult.entities && ontologyResult.entities.length > 0) {
            console.log(`[Ontology Linker] Extracted ${ontologyResult.entities.length} entities from ${step.args?.['path']}`);
            // Could store in ontology store for future reference
          }
        } catch (error: any) {
          console.warn('[Chat Stream] Ontology linker failed, continuing:', error.message);
        }
      }
      
      // Dataframe Analyst: Analyze data if result contains structured data (optional, skip if disabled)
      if (result?.ok && result?.data && Array.isArray(result.data) && result.data.length > 0 && process.env['SCORPION_ENABLE_DATAFRAME_ANALYST'] !== '0') {
        try {
          // Check if data looks like a dataframe (array of objects with consistent keys)
          const firstRow = result.data[0];
          if (firstRow && typeof firstRow === 'object' && !Array.isArray(firstRow)) {
            const dataframeAnalysis = await runPromptWithKillSwitch(
              'dataframe-analyst.system.txt',
              { data: result.data.slice(0, 100) }, // Sample first 100 rows
              DataframeAnalystSchema,
              modelConfig,
              runModelForPrompt
            );
            
            if (dataframeAnalysis && dataframeAnalysis.highlights && dataframeAnalysis.highlights.length > 0) {
              console.log('[Dataframe Analyst] Highlights:', dataframeAnalysis.highlights);
              // Could add insights to context for summarizer
            }
          }
        } catch (error: any) {
          console.warn('[Chat Stream] Dataframe analyst failed, continuing:', error.message);
        }
      }
      
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
      
      // PANEL EVENT GUARANTEE: For research.run, emit knowledge_hit events for each source
      if (step.tool === 'research.run' && result.ok && result.sources && Array.isArray(result.sources) && result.sources.length > 0) {
        console.log(`[Chat Stream] ✅ Research SUCCESS (executor): Emitting ${result.sources.length} knowledge_hit events for research.run`);
        
        // Send status update first
        send({ 
          type: 'status', 
          data: { 
            message: `Research completed. Found ${result.sources.length} sources.`, 
            phase: 'executing',
            conversationId: conversationId,
          } 
        });
        
        // Emit knowledge_hit events for each source
        for (const hit of result.sources) {
          send({
            type: 'knowledge_hit',
            data: {
              title: hit.title || 'Untitled',
              url: hit.url || '',
              score: hit.score || hit.relevance || 0,
              excerpt: hit.snippet || hit.excerpt || '',
              snippet: hit.snippet || hit.excerpt || '',
              provider: result.provider || 'custom',
              publishedAt: hit.publishedAt || null,
              query: result.query || step.args?.['query'] || '',
              category: 'web',
              conversationId: conversationId,
            },
          });
        }
      }
      
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
      
      // Track KB attempts and results
      if (step.tool === 'kb.search') {
        kbAttempted = true;
        if (result?.ok && result?.hits) {
          kbHasResults = result.hits.length > 0;
          // Emit dedicated knowledge event when kb.search completes successfully
          send({
            type: 'knowledge',
            data: {
              hits: result.hits,
              query: step.args?.['query'] || userMessage, // Include query for Knowledge tab
            },
          });
        } else {
          kbHasResults = false;
        }
      }
      
      // File Inspector: Analyze files.recent results (optional, skip if disabled)
      if (step.tool === 'files.recent' && result?.ok && result?.files && process.env['SCORPION_ENABLE_FILE_INSPECTOR'] !== '0') {
        try {
          const fileInspection = await runPromptWithKillSwitch(
            'file-inspector.system.txt',
            { files: result.files },
            FileInspectorSchema,
            modelConfig,
            runModelForPrompt
          );
          
          if (fileInspection && fileInspection.notable && fileInspection.notable.length > 0) {
            console.log('[File Inspector] Notable files:', fileInspection.notable);
            // Could add these insights to context for summarizer
          }
        } catch (error: any) {
          console.warn('[Chat Stream] File inspector failed, continuing:', error.message);
        }
      }
      
      // Auto-process images returned by files.recent - execute immediately
      if (step.tool === 'files.recent' && result?.ok && result?.files) {
        const imageFiles = result.files.filter((f: any) => f.isImage && f.knowledgeBaseId);
        
        if (imageFiles.length > 0) {
          console.log(`[Chat Stream] Found ${imageFiles.length} image file(s) in files.recent result, auto-processing...`);
          
          // Process the first image (most recent) immediately
          const firstImage = imageFiles[0];
          
          // Try knowledge.get first to get OCR text that was already extracted during upload
          try {
            console.log(`[Chat Stream] Attempting knowledge.get for image: ${firstImage.path} (knowledgeBaseId: ${firstImage.knowledgeBaseId})`);
            send({
              type: 'tool',
              data: {
                tool: 'knowledge.get',
                callId: `${step.id}_image_ocr`,
                args: { id: firstImage.knowledgeBaseId },
                status: 'running',
              },
            });
            
            const knowledgeResult = await executeTool('knowledge.get', { id: firstImage.knowledgeBaseId });
            
            if (knowledgeResult?.ok && knowledgeResult?.content) {
              console.log(`[Chat Stream] Successfully retrieved OCR text from knowledge base for image: ${firstImage.path}`);
              results.push({ 
                step: `${step.id}_image_ocr`, 
                result: {
                  ok: true,
                  imagePath: firstImage.path,
                  ocrText: knowledgeResult.content,
                  source: 'knowledge_base'
                }
              });
              
              send({
                type: 'tool',
                data: {
                  tool: 'knowledge.get',
                  callId: `${step.id}_image_ocr`,
                  args: { id: firstImage.knowledgeBaseId },
                  status: 'completed',
                  result: {
                    ok: true,
                    imagePath: firstImage.path,
                    ocrText: knowledgeResult.content,
                    source: 'knowledge_base'
                  },
                },
              });
            } else {
              // If knowledge.get doesn't have OCR text, try ocr.extract
              console.log(`[Chat Stream] knowledge.get didn't return OCR text, trying ocr.extract for image: ${firstImage.path}`);
              send({
                type: 'tool',
                data: {
                  tool: 'ocr.extract',
                  callId: `${step.id}_image_ocr`,
                  args: { imageId: firstImage.knowledgeBaseId },
                  status: 'running',
                },
              });
              
              const ocrResult = await executeTool('ocr.extract', { imageId: firstImage.knowledgeBaseId });
              
              if (ocrResult?.ok && ocrResult?.text) {
                console.log(`[Chat Stream] Successfully extracted OCR text for image: ${firstImage.path}`);
                results.push({ 
                  step: `${step.id}_image_ocr`, 
                  result: {
                    ok: true,
                    imagePath: firstImage.path,
                    ocrText: ocrResult.text,
                    source: 'ocr_extraction'
                  }
                });
                
                send({
                  type: 'tool',
                  data: {
                    tool: 'ocr.extract',
                    callId: `${step.id}_image_ocr`,
                    args: { imageId: firstImage.knowledgeBaseId },
                    status: 'completed',
                    result: {
                      ok: true,
                      imagePath: firstImage.path,
                      ocrText: ocrResult.text,
                      source: 'ocr_extraction'
                    },
                  },
                });
              } else {
                console.warn(`[Chat Stream] Failed to extract OCR text for image: ${firstImage.path}`);
                results.push({ 
                  step: `${step.id}_image_ocr`, 
                  result: {
                    ok: false,
                    imagePath: firstImage.path,
                    error: 'Failed to extract OCR text',
                    source: 'none'
                  }
                });
                
                send({
                  type: 'tool',
                  data: {
                    tool: 'ocr.extract',
                    callId: `${step.id}_image_ocr`,
                    args: { imageId: firstImage.knowledgeBaseId },
                    status: 'failed',
                    error: 'Failed to extract OCR text',
                  },
                });
              }
            }
          } catch (imageError: any) {
            console.error(`[Chat Stream] Error processing image ${firstImage.path}:`, imageError);
            results.push({ 
              step: `${step.id}_image_ocr`, 
              result: {
                ok: false,
                imagePath: firstImage.path,
                error: imageError.message || 'Failed to process image',
                source: 'error'
              }
            });
            
            send({
              type: 'tool',
              data: {
                tool: 'knowledge.get',
                callId: `${step.id}_image_ocr`,
                args: { id: firstImage.knowledgeBaseId },
                status: 'failed',
                error: imageError.message || 'Failed to process image',
              },
            });
          }
        }
      }
      
      // If kb.search returned empty results and this is a general question, trigger web research
      if (step.tool === 'kb.search' && result?.ok && result?.hits?.length === 0) {
        const query = step.args?.['query'] || userMessage;
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
  
  return { results, kbAttempted, kbHasResults };
}





