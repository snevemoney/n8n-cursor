import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { readFileSync } from 'fs';
import { join } from 'path';
import { runModelUnified, parseModelJSON } from '@/lib/chat/modelRunner';
import { runCouncilDeliberation, computeConsensus } from '@/lib/chat/council';
import { executeTool } from '@/lib/chat/tools';
import { remember } from '@/lib/chat/memory';
import { createSSEMessage } from '@/lib/chat/events';
import type { Message, Plan } from '@/lib/chat/types';

/**
 * POST /api/chat/stream
 * 
 * Main Chat-AGI orchestrator with SSE streaming
 * Phases: PLANNER → COUNCIL → EXECUTOR → SUMMARIZER
 */
export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();
  const { conversationId, messages, mode, tools, provider, model } = await req.json();
  
  // Create readable stream
  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      
      const send = (event: any) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(createSSEMessage(event)));
        } catch (error) {
          console.error('[Chat Stream] Error sending:', error);
        }
      };
      
      try {
        send({ type: 'connected', data: { message: 'Chat stream connected' } });
        
        // Extract user message
        const userMessage = messages[messages.length - 1]?.content || '';
        const messageId = uuidv4();
        
        // PHASE 1: PLANNER
        send({ type: 'status', data: { message: 'Planning...', phase: 'planning' } });
        
        const plannerPrompt = readFileSync(join(process.cwd(), 'lib/prompts/planner.system.txt'), 'utf-8');
        const planResponse = await runModelUnified(
          plannerPrompt,
          userMessage,
          { provider: provider || 'ollama', model: model || 'qwen2.5-coder:7b-instruct-q4_K_M' }
        );
        
        const plan: Plan = parseModelJSON(planResponse);
        
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
        
        // PHASE 2: COUNCIL
        send({ type: 'status', data: { message: 'Council review...', phase: 'council' } });
        
        const votes = await runCouncilDeliberation(plan, { provider: provider || 'ollama', model: model || 'qwen2.5-coder:7b-instruct-q4_K_M' });
        
        votes.forEach(vote => {
          send({ type: 'council_vote', data: vote });
        });
        
        const consensus = computeConsensus(votes);
        
        // PHASE 3: EXECUTOR
        send({ type: 'status', data: { message: 'Executing plan...', phase: 'executing' } });
        
        const results: any[] = [];
        
        for (const step of plan.plan) {
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
        send({ type: 'status', data: { message: 'Summarizing...', phase: 'summarizing' } });
        
        const summarizerPrompt = readFileSync(join(process.cwd(), 'lib/prompts/summarizer.system.txt'), 'utf-8');
        const summaryContext = `Plan: ${JSON.stringify(plan)}\n\nResults: ${JSON.stringify(results)}\n\nConsensus: ${consensus.summary}`;
        
        const summary = await runModelUnified(
          summarizerPrompt,
          summaryContext,
          { provider: provider || 'ollama', model: model || 'qwen2.5-coder:7b-instruct-q4_K_M' }
        );
        
        // Stream summary
        send({ type: 'delta', data: { content: summary } });
        
        // Remember in memory
        remember(conversationId, `User: ${userMessage}\nAssistant: ${summary}`);
        
        // Done
        send({ type: 'done', data: { messageId } });
        
      } catch (error: any) {
        send({ type: 'error', data: { message: error.message } });
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

