/**
 * Shared Store Instances
 * Ensures all APIs use the same RAG and Ontology store instances
 */

import { RAGStore, OntologyStore, ProjectKnowledgeOrchestrator } from '@scorpion/core';
import { getMCPn8nClient } from './mcp-n8n-client';
import { getDataDir, initializeStorageConfig } from './storage/storage-config';
import path from 'path';

let ragStore: RAGStore | null = null;
let ontologyStore: OntologyStore | null = null;
let orchestrator: ProjectKnowledgeOrchestrator | null = null;
let initialized = false;
let dataDir: string | null = null;
let initializationPromise: Promise<void> | null = null;

export async function getRAGStore(): Promise<RAGStore> {
  // If already initialized, return immediately
  if (ragStore) return ragStore;
  
  // If initializing, wait for it
  if (initializationPromise) {
    await initializationPromise;
    return ragStore!;
  }
  
  // Start initialization (non-blocking for other calls)
  initializationPromise = (async () => {
    if (!dataDir) {
      await initializeStorageConfig();
      dataDir = await getDataDir();
    }
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    ragStore = new RAGStore(ollamaUrl, dataDir!);
    await ragStore.initialize();
  })();
  
  await initializationPromise;
  return ragStore!;
}

export async function getOntologyStore(): Promise<OntologyStore> {
  if (!ontologyStore) {
    const ragStore = await getRAGStore();
    if (!dataDir) {
      dataDir = await getDataDir();
    }
    ontologyStore = new OntologyStore(ragStore, dataDir!);
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

// Alias for compatibility with auto-sync
export const getOrchestratorAsync = getOrchestrator;

/**
 * Initialize all stores (call on startup)
 */
export async function initializeStores(): Promise<void> {
  if (initialized) return;
  
  // Initialize storage configuration first
  const config = await initializeStorageConfig();
  dataDir = await getDataDir();
  
  if (config.isSSD) {
    console.log(`⚡⚡⚡ SUPER POWERS ACTIVATED ⚡⚡⚡`);
    console.log(`🚀 SSD MODE - Using ${dataDir}`);
    console.log(`   ✨ Performance optimizations enabled`);
    console.log(`   🚀 4x batch sizes, 3.3x concurrency, 5x file capacity`);
    console.log(`   💾 All data automatically migrated to SSD`);
    console.log(`   ⚡ Backups, cache, and logs optimized for SSD`);
  } else {
    console.log(`💾 Using default storage: ${dataDir}`);
    console.log(`   💡 Connect an external SSD to unlock super powers!`);
  }
  
  await getRAGStore();
  await getOntologyStore();
  await getOrchestrator();
  
  initialized = true;
  console.log('✅ All stores initialized and loaded from disk');
  
  // Start storage reconnect monitoring in background (non-blocking)
  // Defer to allow server to start faster
  // Power of 10 Rule 4: Explicit void prefix for ignored promises
  void Promise.resolve().then(async () => {
    try {
      // Increased delay for better startup performance (configurable via env)
      const reconnectDelayMs = process.env.STORAGE_RECONNECT_DELAY_MS
        ? parseInt(process.env.STORAGE_RECONNECT_DELAY_MS, 10)
        : 3000; // 3 seconds (increased from 1s for better startup performance)
      await new Promise(resolve => setTimeout(resolve, reconnectDelayMs));
      
      const { startReconnectMonitoring } = await import('./storage/storage-reconnect-monitor');
      await startReconnectMonitoring({
        checkInterval: 10000, // Check every 10 seconds
        autoMigrate: true, // Automatically migrate data back to SSD
        enabled: true,
      });
      console.log('📡 Storage reconnect monitoring started');
    } catch (error) {
      console.debug('Storage reconnect monitoring not available:', error);
    }
  }).catch(() => {
    // Silent fail - monitoring is optional
  });
}

