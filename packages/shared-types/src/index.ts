// Shared TypeScript types for LightningFlow AI and n8n-cursor

// Export event and command schemas
export * from './events';
export * from './commands';

// Lightning Network types
export interface LightningInvoice {
  payment_request: string;
  amount_sats: number;
  description?: string;
  created_at: Date;
  expires_at: Date;
  settled: boolean;
}

export interface LightningPayment {
  payment_hash: string;
  amount_sats: number;
  fee_sats: number;
  timestamp: Date;
  status: 'pending' | 'complete' | 'failed';
}

// AI Agent types
export interface AIAgent {
  id: string;
  name: string;
  type: 'sentiment' | 'balance' | 'routing' | 'custom';
  config: Record<string, any>;
  enabled: boolean;
  last_run?: Date;
}

export interface AIJob {
  id: string;
  agent_id: string;
  input: Record<string, any>;
  status: 'queued' | 'running' | 'completed' | 'failed';
  result?: Record<string, any>;
  created_at: Date;
  completed_at?: Date;
}

// n8n Workflow types
export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: N8nNode[];
  connections: Record<string, any>;
  meta: {
    version: string;
    owner: string;
    description?: string;
  };
}

export interface N8nNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, any>;
}

// User and Business types
export interface User {
  id: string;
  email: string;
  business_name?: string;
  lightning_node_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface BusinessNode {
  id: string;
  user_id: string;
  name: string;
  type: 'freelancer' | 'creator' | 'business';
  lightning_enabled: boolean;
  ai_agents: AIAgent[];
  created_at: Date;
}

// API Response types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
