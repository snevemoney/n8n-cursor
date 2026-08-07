import { NextRequest, NextResponse } from 'next/server';
import { ScorpionAgent, KnowledgeExtractor } from '@scorpion/core';
import { getRAGStore, getOrchestrator } from '@/lib/shared-stores';
import path from 'path';
import { withErrorHandling, createSuccessResponse, validateRequest } from '@/lib/api-error-handler';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const buildSchema = z.object({
  target: z.string().min(1),
  features: z.array(z.string()).min(1),
  requirements: z.string().optional(),
});

/**
 * Build a new side hustle using accumulated knowledge
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const validation = await validateRequest(request, buildSchema);
  if (!validation.success) {
    return validation.error;
  }
  
  const { target, features, requirements } = validation.data;

    const store = await getRAGStore();
    
    // Ensure project knowledge is ingested before building
    try {
      const orchestrator = await getOrchestrator();
      // Quick check if knowledge exists, if not ingest
      const summary = await orchestrator.getSummary();
      if (summary.totalKnowledge === 0) {
        console.log('No knowledge found, ingesting project knowledge...');
        await orchestrator.ingestAll();
      }
    } catch (error) {
      console.warn('Failed to ensure project knowledge:', error);
    }
    
    const agent = new ScorpionAgent(store);

    const plan = await agent.buildSideHustle({
      target,
      features,
      requirements: requirements || ''
    });

    return createSuccessResponse({ plan });
});

const extractSchema = z.object({
  sideHustleId: z.string().min(1),
  codebasePath: z.string().min(1),
});

/**
 * Extract knowledge from a side hustle codebase
 */
export const PUT = withErrorHandling(async (request: NextRequest) => {
  const validation = await validateRequest(request, extractSchema);
  if (!validation.success) {
    return validation.error;
  }
  
  const { sideHustleId, codebasePath } = validation.data;

    // Resolve path relative to workspace root
    const workspaceRoot = process.cwd();
    const fullPath = path.isAbsolute(codebasePath) 
      ? codebasePath 
      : path.join(workspaceRoot, codebasePath);

    const extractor = new KnowledgeExtractor(fullPath);
    const knowledge = await extractor.extractKnowledge(sideHustleId);

    const store = await getRAGStore();
    for (const k of knowledge) {
      await store.addKnowledge(k);
    }

    return createSuccessResponse({ 
      extracted: knowledge.length,
      knowledge: knowledge.map(k => ({
        id: k.id,
        title: k.title,
        category: k.category,
        type: k.type
      }))
    });
});

/**
 * Get all stored knowledge
 */
export const GET = withErrorHandling(async () => {
  const store = await getRAGStore();
  const knowledge = store.getAllKnowledge();
  
  return createSuccessResponse({ 
    count: knowledge.length,
    knowledge: knowledge.map(k => ({
      id: k.id,
      source: k.source,
      title: k.title,
      category: k.category,
      type: k.type,
      tags: k.tags
    }))
  });
});

