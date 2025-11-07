import { NextRequest, NextResponse } from 'next/server';
import { ScorpionAgent, KnowledgeExtractor } from '@scorpion/core';
import { getRAGStore, getOrchestrator } from '@/lib/shared-stores';
import path from 'path';

/**
 * Build a new side hustle using accumulated knowledge
 */
export async function POST(request: NextRequest) {
  try {
    const { target, features, requirements } = await request.json();

    if (!target || !features || !Array.isArray(features)) {
      return NextResponse.json(
        { error: 'Missing required fields: target, features' },
        { status: 400 }
      );
    }

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

    return NextResponse.json({ plan });
  } catch (error: any) {
    console.error('Error building side hustle:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to build side hustle' },
      { status: 500 }
    );
  }
}

/**
 * Extract knowledge from a side hustle codebase
 */
export async function PUT(request: NextRequest) {
  try {
    const { sideHustleId, codebasePath } = await request.json();

    if (!sideHustleId || !codebasePath) {
      return NextResponse.json(
        { error: 'Missing required fields: sideHustleId, codebasePath' },
        { status: 400 }
      );
    }

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

    return NextResponse.json({ 
      extracted: knowledge.length,
      knowledge: knowledge.map(k => ({
        id: k.id,
        title: k.title,
        category: k.category,
        type: k.type
      }))
    });
  } catch (error: any) {
    console.error('Error extracting knowledge:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to extract knowledge' },
      { status: 500 }
    );
  }
}

/**
 * Get all stored knowledge
 */
export async function GET() {
  try {
    const store = await getRAGStore();
    const knowledge = store.getAllKnowledge();
    
    return NextResponse.json({ 
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
  } catch (error: any) {
    console.error('Error getting knowledge:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get knowledge' },
      { status: 500 }
    );
  }
}

