/**
 * API endpoint to start a research session
 */

import { NextRequest, NextResponse } from 'next/server';
import { getBrowserPool } from '@/lib/research/browser-pool';
import { WebResearchAgent } from '@/lib/research/web-research-agent';
import { CompanyResearchAgent } from '@/lib/research/company-research-agent';
import { getRAGStore } from '@/lib/shared-stores';
import { LLMAdapter } from '@scorpion/core';
import { v4 as uuidv4 } from 'uuid';
import { getRecommendedModelForRAM } from '@/lib/utils/modelSelector';
import { withErrorHandling, createSuccessResponse, createErrorResponse, validateRequest, ApiErrorCode } from '@/lib/api-error-handler';
import { z } from 'zod';

// Store active sessions
const activeSessions = new Map<string, any>();

const researchStartSchema = z.object({
  query: z.string().min(1),
  category: z.enum(['general', 'company-research']).optional(),
  depth: z.enum(['shallow', 'medium', 'deep']).optional(),
  maxSites: z.number().min(1).max(50).optional(),
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  const validation = await validateRequest(request, researchStartSchema);
  if (!validation.success) {
    return validation.error;
  }
  
  const { query, category = 'general', depth = 'medium', maxSites = 10 } = validation.data;

    // Create session ID
    const sessionId = uuidv4();
    
    // Initialize browser and agents
    const browserPool = await getBrowserPool();
    const browser = await browserPool.createResearchSession(sessionId);
    const ragStore = await getRAGStore();
    const llm = new LLMAdapter({
      provider: 'ollama',
      model: process.env.OLLAMA_MODEL || getRecommendedModelForRAM()
    });

    // Start research in background
    (async () => {
      try {
        let result;
        
        if (category === 'company-research') {
          const agent = new CompanyResearchAgent(llm, ragStore);
          const companyProfile = await agent.research(query, browser);
          result = {
            type: 'company-profile',
            data: companyProfile
          };
        } else {
          const agent = new WebResearchAgent(llm, ragStore);
          result = await agent.research(
            { query, category, depth, maxSites },
            browser
          );
        }

        // Store result
        activeSessions.set(sessionId, {
          status: 'completed',
          result
        });

        // Emit completion event
        browserPool.emit('research-complete', sessionId, result);

      } catch (error: any) {
        console.error(`Research session ${sessionId} failed:`, error);
        const errorMessage = error.message || 'Unknown error occurred';
        activeSessions.set(sessionId, {
          status: 'failed',
          error: errorMessage
        });
        
        // Emit failure event so SSE stream can notify client
        browserPool.emit('research-failed', sessionId, {
          error: errorMessage,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
      } finally {
        // Clean up browser session
        setTimeout(async () => {
          await browserPool.closeSession(sessionId);
          activeSessions.delete(sessionId);
        }, 60000); // Keep for 1 minute after completion
      }
    })();

    return createSuccessResponse({
      sessionId,
      message: 'Research started',
      status: 'in_progress'
    });
});

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return createErrorResponse(
      ApiErrorCode.MISSING_PARAMETER,
      'Session ID is required',
      undefined,
      400
    );
  }

  const session = activeSessions.get(sessionId);
  
  if (!session) {
    return createErrorResponse(
      ApiErrorCode.NOT_FOUND,
      'Research session not found',
      { sessionId },
      404
    );
  }

  return createSuccessResponse(session);
});

