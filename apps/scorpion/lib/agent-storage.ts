/**
 * Agent Storage
 * Manages dynamic agent storage with persistence
 */

import path from 'path';
import { getDataDir } from './storage/storage-config';
import { writeFileWithFallback, readFileWithFallback } from './storage/storage-error-handler';
import type { CouncilMember } from '@scorpion/core';

export interface StoredAgent extends CouncilMember {
  id: string;
  createdAt: string;
  status: 'active' | 'standby' | 'offline';
}

interface AgentStorageData {
  agents: StoredAgent[];
  lastUpdated: number;
}

let agentStorage: AgentStorageData | null = null;
let agentsFile: string | null = null;

/**
 * Initialize agent storage
 */
export async function initializeAgentStorage(): Promise<void> {
  if (agentsFile) return;
  
  const dataDir = await getDataDir();
  agentsFile = path.join(dataDir, 'agents.json');
  
  // Load existing agents
  await loadAgents();
}

/**
 * Load agents from storage
 */
async function loadAgents(): Promise<void> {
  if (!agentsFile) {
    agentStorage = { agents: [], lastUpdated: Date.now() };
    return;
  }
  
  try {
    const result = await readFileWithFallback(agentsFile);
    if (result.success && result.content) {
      agentStorage = JSON.parse(result.content);
    } else {
      agentStorage = { agents: [], lastUpdated: Date.now() };
    }
  } catch (error) {
    console.warn('[AgentStorage] Failed to load agents, starting fresh:', error);
    agentStorage = { agents: [], lastUpdated: Date.now() };
  }
}

/**
 * Save agents to storage
 */
async function saveAgents(): Promise<void> {
  if (!agentsFile || !agentStorage) return;
  
  try {
    agentStorage.lastUpdated = Date.now();
    const result = await writeFileWithFallback(
      agentsFile,
      JSON.stringify(agentStorage, null, 2),
      { ensureDir: true, maxRetries: 3 }
    );
    
    if (!result.success) {
      console.error('[AgentStorage] Failed to save agents:', result.error);
    }
  } catch (error) {
    console.error('[AgentStorage] Error saving agents:', error);
  }
}

/**
 * Get all stored agents
 */
export async function getStoredAgents(): Promise<StoredAgent[]> {
  await initializeAgentStorage();
  return agentStorage?.agents || [];
}

/**
 * Add a new agent
 */
export async function addAgent(agent: StoredAgent): Promise<void> {
  await initializeAgentStorage();
  
  if (!agentStorage) {
    agentStorage = { agents: [], lastUpdated: Date.now() };
  }
  
  // Check if agent with same ID already exists
  const existingIndex = agentStorage.agents.findIndex(a => a.id === agent.id);
  if (existingIndex >= 0) {
    // Update existing agent
    agentStorage.agents[existingIndex] = agent;
  } else {
    // Add new agent
    agentStorage.agents.push(agent);
  }
  
  await saveAgents();
}

/**
 * Get agent by ID
 */
export async function getAgentById(id: string): Promise<StoredAgent | null> {
  await initializeAgentStorage();
  return agentStorage?.agents.find(a => a.id === id) || null;
}

/**
 * Remove an agent
 */
export async function removeAgent(id: string): Promise<void> {
  await initializeAgentStorage();
  
  if (!agentStorage) return;
  
  agentStorage.agents = agentStorage.agents.filter(a => a.id !== id);
  await saveAgents();
}

/**
 * Update agent status
 */
export async function updateAgentStatus(id: string, status: 'active' | 'standby' | 'offline'): Promise<StoredAgent | null> {
  await initializeAgentStorage();
  
  if (!agentStorage) return null;
  
  const agent = agentStorage.agents.find(a => a.id === id);
  if (!agent) return null;
  
  agent.status = status;
  await saveAgents();
  
  return agent;
}

