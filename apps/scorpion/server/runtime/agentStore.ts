/**
 * In-memory Agent and Session store
 * 
 * Later we can swap this with Supabase/Postgres persistence
 */

import { AgentInstance, Session } from './agentTypes';
import { randomUUID } from 'crypto';

const agents = new Map<string, AgentInstance>();
const sessions = new Map<string, Session>();

/**
 * Create a new agent instance
 */
export function createAgent(
  name: string,
  role: string = 'assistant',
  toolsAllowed: string[] = [],
  memoryId?: string,
): AgentInstance {
  const now = new Date().toISOString();
  const agent: AgentInstance = {
    id: randomUUID(),
    name,
    role,
    toolsAllowed,
    memoryId,
    createdAt: now,
    updatedAt: now,
  };
  
  agents.set(agent.id, agent);
  return agent;
}

/**
 * Get an agent by ID
 */
export function getAgent(id: string): AgentInstance | undefined {
  return agents.get(id);
}

/**
 * Get or create default agent
 */
export function getOrCreateDefaultAgent(): AgentInstance {
  // Check if default agent exists
  const existing = Array.from(agents.values()).find(a => a.name === 'scorpion.core');
  if (existing) {
    return existing;
  }
  
  // Create default agent
  return createAgent(
    'scorpion.core',
    'assistant',
    [], // All tools allowed by default
  );
}

/**
 * List all agents
 */
export function listAgents(): AgentInstance[] {
  return Array.from(agents.values());
}

/**
 * Create a new session
 */
export function createSession(
  agentId: string,
  title: string = 'New Session',
): Session {
  const now = new Date().toISOString();
  const session: Session = {
    id: randomUUID(),
    agentId,
    title,
    createdAt: now,
    updatedAt: now,
  };
  
  sessions.set(session.id, session);
  return session;
}

/**
 * Get a session by ID
 */
export function getSession(id: string): Session | undefined {
  return sessions.get(id);
}

/**
 * Get or create session for a conversation
 */
export function getOrCreateSessionForConversation(
  conversationId: string,
  agentId?: string,
): Session {
  // Check if session exists for this conversation
  const existing = Array.from(sessions.values()).find(
    s => s.id === conversationId || s.title === conversationId
  );
  if (existing) {
    return existing;
  }
  
  // Create new session with default agent if needed
  const agent = agentId ? getAgent(agentId) : getOrCreateDefaultAgent();
  if (!agent) {
    throw new Error('Agent not found');
  }
  
  return createSession(agent.id, `Session ${conversationId}`);
}

/**
 * List all sessions (optionally filtered by agent)
 */
export function listSessions(agentId?: string): Session[] {
  let result = Array.from(sessions.values());
  
  if (agentId) {
    result = result.filter(s => s.agentId === agentId);
  }
  
  return result.sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

/**
 * Update a session
 */
export function updateSession(id: string, patch: Partial<Session>): Session | undefined {
  const existing = sessions.get(id);
  if (!existing) return undefined;
  
  const updated: Session = {
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  
  sessions.set(id, updated);
  return updated;
}

