import { NextRequest, NextResponse } from 'next/server';
import { runCouncilDeliberationStreaming, computeConsensus } from '@/lib/chat/council';
import { createSSEMessage } from '@/lib/chat/events';
import type { Plan } from '@/lib/chat/types';
import { detectLightweightMode } from '@/lib/utils/systemResources';

// Default council members (matching council.ts)
const defaultCouncilMembers = [
  { id: 'E-001', name: 'Architectus', weight: 1.5, role: 'System Architect' },
  { id: 'A-002', name: 'Analytica', weight: 1.2, role: 'Knowledge & RAG Strategist' },
  { id: 'P-003', name: 'Pragmaton', weight: 1.3, role: 'Execution Engineer' },
  { id: 'S-004', name: 'Satori', weight: 1.0, role: 'Alignment & Safety' },
  { id: 'N-005', name: 'Nexus', weight: 1.1, role: 'Integration Specialist' },
  { id: 'S-006', name: 'Sentinel', weight: 1.2, role: 'Security & Performance' },
  { id: 'C-007', name: 'Catalyst', weight: 0.9, role: 'Innovation Advisor' },
  { id: 'O-008', name: 'Oracle', weight: 1.1, role: 'Data & Analytics' },
];

/**
 * GET /api/council - Get council members info
 */
export async function GET() {
  try {
    return NextResponse.json({
      members: defaultCouncilMembers.map(m => ({
        name: m.name,
        role: m.role,
        specialty: m.role,
        weight: m.weight,
        goal: `Provide expert ${m.role.toLowerCase()} perspective`,
      })),
      count: defaultCouncilMembers.length
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to load council members' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/council - Run a council meeting with SSE streaming
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
  
  const { topic } = requestData;
  if (!topic || typeof topic !== 'string') {
    return new Response(
      JSON.stringify({ error: 'Topic is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  // Create a simple plan from the topic
  const plan: Plan = {
    summary: topic,
    plan: [
      {
        id: '1',
        step: 1,
        description: `Deliberate on: ${topic}`,
        tool: 'none',
        args: {},
      }
    ],
  };
  
  // Create readable stream
  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      
      const send = (event: any) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(createSSEMessage(event)));
        } catch (error) {
          console.error('[Council Stream] Error sending:', error);
        }
      };
      
      try {
        send({ type: 'connected', data: { message: 'Council stream connected' } });
        
        // Get model config: Auto-detect lightweight mode based on system RAM
        const lightweightMode = detectLightweightMode();
        const defaultModel = 'llama3.2:1b';
        // Increased tokens to allow full responses (was 100-150, now 500-800)
        const councilMaxTokens = lightweightMode ? 500 : 800;
        const councilTemp = lightweightMode ? 0.3 : 0.5;
        
        // Detect if casual question (consensus will be computed internally)
        
        // Run council deliberation with streaming
        const votes = await runCouncilDeliberationStreaming(plan, {
          provider: 'ollama',
          model: defaultModel,
          maxTokens: councilMaxTokens,
          temperature: councilTemp
        }, (event) => {
          // Stream all council events immediately
          send(event);
        });
        
        // Consensus is already sent by runCouncilDeliberationStreaming
        
        // Send completion
        send({
          type: 'done',
          data: { message: 'Council deliberation complete' },
        });
        
      } catch (error: any) {
        console.error('[Council Stream] Fatal error:', error);
        send({
          type: 'error',
          data: {
            message: error.message || 'Unknown error occurred',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
          },
        });
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
