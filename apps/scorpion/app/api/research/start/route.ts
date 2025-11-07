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

// Store active sessions
const activeSessions = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, category = 'general', depth = 'medium', maxSites = 10 } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Create session ID
    const sessionId = uuidv4();
    
    // Initialize browser and agents
    const browserPool = await getBrowserPool();
    const browser = await browserPool.createResearchSession(sessionId);
    const ragStore = await getRAGStore();
    const llm = new LLMAdapter({
      provider: 'ollama',
      model: process.env.OLLAMA_MODEL || 'llama3.2:3b-instruct-q4_K_M'
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
        activeSessions.set(sessionId, {
          status: 'failed',
          error: error.message
        });
      } finally {
        // Clean up browser session
        setTimeout(async () => {
          await browserPool.closeSession(sessionId);
          activeSessions.delete(sessionId);
        }, 60000); // Keep for 1 minute after completion
      }
    })();

    return NextResponse.json({
      sessionId,
      message: 'Research started',
      status: 'in_progress'
    });

  } catch (error: any) {
    console.error('Failed to start research:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to start research' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const session = activeSessions.get(sessionId);
    
    if (!session) {
      return NextResponse.json(
        { status: 'not_found' },
        { status: 404 }
      );
    }

    return NextResponse.json(session);

  } catch (error: any) {
    console.error('Failed to get research status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get research status' },
      { status: 500 }
    );
  }
}

