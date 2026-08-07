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
import { saveResearchSession, type ResearchSession } from '@/lib/research/research-storage';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

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
    const startedAt = new Date().toISOString();
    
    // Initialize browser and agents
    const browserPool = await getBrowserPool();
    const browser = await browserPool.createResearchSession(sessionId);
    const ragStore = await getRAGStore();
    const llm = new LLMAdapter({
      provider: 'ollama',
      model: process.env['OLLAMA_MODEL'] || getRecommendedModelForRAM()
    });

    // Create initial session record
    const sessionRecord: ResearchSession = {
      sessionId,
      query,
      category,
      depth,
      maxSites,
      status: 'in_progress',
      startedAt,
    };
    
    // Persist initial session
    await saveResearchSession(sessionRecord).catch(err => {
      console.warn('[Research] Failed to persist session:', err);
    });

    // Add to active sessions immediately so polling can find it
    activeSessions.set(sessionId, {
      status: 'in_progress',
      result: undefined,
    });

    // Start research in background
    (async () => {
      const startTime = Date.now();
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

        const duration = Date.now() - startTime;
        const completedAt = new Date().toISOString();

        // Store result in memory
        activeSessions.set(sessionId, {
          status: 'completed',
          result
        });

        // Persist completed session
        await saveResearchSession({
          ...sessionRecord,
          status: 'completed',
          completedAt,
          duration,
          result,
          sourcesCount: result?.sources?.length || 0,
        }).catch(err => {
          console.warn('[Research] Failed to persist completed session:', err);
        });

        // Emit completion event
        browserPool.emit('research-complete', sessionId, result);

      } catch (error: any) {
        const duration = Date.now() - startTime;
        const completedAt = new Date().toISOString();
        console.error(`Research session ${sessionId} failed:`, error);
        const errorMessage = error.message || 'Unknown error occurred';
        
        // Store error in memory
        activeSessions.set(sessionId, {
          status: 'failed',
          error: errorMessage
        });
        
        // Persist failed session
        await saveResearchSession({
          ...sessionRecord,
          status: 'failed',
          completedAt,
          duration,
          error: errorMessage,
          errorStack: process.env['NODE_ENV'] === 'development' ? error.stack : undefined,
        }).catch(err => {
          console.warn('[Research] Failed to persist failed session:', err);
        });
        
        // Emit failure event so SSE stream can notify client
        browserPool.emit('research-failed', sessionId, {
          error: errorMessage,
          stack: process.env['NODE_ENV'] === 'development' ? error.stack : undefined
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

  // Check active sessions first
  let session = activeSessions.get(sessionId);
  
  // If not in memory, check persisted storage
  if (!session) {
    const { getResearchSession } = await import('@/lib/research/research-storage');
    const persistedSession = await getResearchSession(sessionId);
    if (persistedSession) {
      // Convert persisted session to API format
      session = {
        status: persistedSession.status,
        result: persistedSession.result,
        error: persistedSession.error,
      };
    }
  }
  
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

