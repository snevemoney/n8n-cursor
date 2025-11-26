/**
 * Agent and Session types for Scorpion runtime
 * 
 * Agents represent persistent AI instances with identity, tools, and memory.
 * Sessions represent conversations or missions linked to an agent.
 */

export interface AgentInstance {
  id: string;
  name: string;
  role: string;
  toolsAllowed: string[];
  memoryId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  agentId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

