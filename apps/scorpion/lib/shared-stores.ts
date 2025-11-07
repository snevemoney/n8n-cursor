/**
 * Shared Store Instances
 * Ensures all APIs use the same RAG and Ontology store instances
 */

import { RAGStore, OntologyStore, ProjectKnowledgeOrchestrator } from '@scorpion/core';
import { getMCPn8nClient } from './mcp-n8n-client';
import path from 'path';

let ragStore: RAGStore | null = null;
let ontologyStore: OntologyStore | null = null;
let orchestrator: ProjectKnowledgeOrchestrator | null = null;
let initialized = false;

const dataDir = path.join(process.cwd(), 'data', 'scorpion');

export async function getRAGStore(): Promise<RAGStore> {
  if (!ragStore) {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    ragStore = new RAGStore(ollamaUrl, dataDir);
    await ragStore.initialize(); // Load from disk
  }
  return ragStore;
}

export async function getOntologyStore(): Promise<OntologyStore> {
  if (!ontologyStore) {
    const ragStore = await getRAGStore();
    ontologyStore = new OntologyStore(ragStore, dataDir);
    await ontologyStore.initialize(); // Load from disk
  }
  return ontologyStore;
}

export async function getOrchestrator(): Promise<ProjectKnowledgeOrchestrator> {
  if (!orchestrator) {
    // Resolve to monorepo root (not apps/scorpion)
    const workspaceRoot = path.resolve(process.cwd(), '../..');
    const mcpClient = getMCPn8nClient();
    const compatClient = {
      listWorkflows: () => mcpClient.listWorkflows(),
      getWorkflow: (id: string) => mcpClient.getWorkflow(id),
      exportWorkflow: (id: string) => mcpClient.exportWorkflow(id)
    } as any;
    
    orchestrator = new ProjectKnowledgeOrchestrator(
      workspaceRoot,
      await getRAGStore(),
      await getOntologyStore(),
      compatClient
    );
  }
  return orchestrator;
}

/**
 * Initialize all stores (call on startup)
 */
export async function initializeStores(): Promise<void> {
  if (initialized) return;
  
  await getRAGStore();
  await getOntologyStore();
  await getOrchestrator();
  
  initialized = true;
  console.log('✅ All stores initialized and loaded from disk');
}

