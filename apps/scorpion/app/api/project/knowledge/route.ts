import { NextRequest, NextResponse } from 'next/server';
import { ProjectKnowledgeOrchestrator, RAGStore } from '@scorpion/core';
import { getOrchestrator, getRAGStore } from '@/lib/shared-stores';

async function getOrchestratorInstance(): Promise<ProjectKnowledgeOrchestrator> {
  return await getOrchestrator();
}

/**
 * POST /api/project/knowledge/ingest - Ingest all project knowledge
 */
export async function POST(request: NextRequest) {
  try {
    const orchestrator = await getOrchestratorInstance();
    const result = await orchestrator.ingestAll();

    return NextResponse.json({
      success: true,
      ingested: result.knowledge.length,
      summary: {
        workspace: result.workspace ? Object.keys(result.workspace.apps || {}).length : 0,
        databases: result.databases.length,
        workflows: result.workflows.length,
        services: result.services.length,
        status: result.status
      },
      ingestedAt: result.ingestedAt
    });
  } catch (error: any) {
    console.error('Error ingesting project knowledge:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to ingest project knowledge' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/project/knowledge - Get project knowledge summary
 */
export async function GET(request: NextRequest) {
  try {
    const orchestrator = await getOrchestratorInstance();
    const summary = await orchestrator.getSummary();
    const ragStore = await getRAGStore();

    return NextResponse.json({
      summary,
      knowledge: ragStore.getAllKnowledge().map(k => ({
        id: k.id,
        source: k.source,
        type: k.type,
        category: k.category,
        title: k.title,
        tags: k.tags
      })) || []
    });
  } catch (error: any) {
    console.error('Error getting project knowledge:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get project knowledge' },
      { status: 500 }
    );
  }
}

