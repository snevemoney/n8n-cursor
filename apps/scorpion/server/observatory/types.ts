/**
 * Scorpion Brain Graph Types
 * Power of 10 Rule 3: Small, focused types
 */

export type BrainNodeKind =
  | 'llm'
  | 'lrm'
  | 'agent'
  | 'expert'  // MoE expert nodes
  | 'tool'
  | 'rag'
  | 'data_source'
  | 'workflow'
  | 'safety'
  | 'telemetry';

export interface BrainNodeMetrics {
  lastUsedAt?: string;          // ISO timestamp
  callsLastHour?: number;
  callsLast24h?: number;
  avgLatencyMs?: number;
  p95LatencyMs?: number;
  errorRatePct?: number;
  techDebtScore?: number;       // from 0..1 or 0..100 if available
}

export interface BrainNodeParams {
  // generic parameter interface; keep it flat & JSON-serializable
  [key: string]: string | number | boolean | null | string[] | number[];
}

export interface BrainNode {
  id: string;
  kind: BrainNodeKind;
  label: string;
  layer: string;                // e.g. 'llm', 'agents', 'tools', 'rag', ...
  description?: string;
  params?: BrainNodeParams;
  metrics?: BrainNodeMetrics;
}

export interface BrainEdge {
  id: string;
  from: string;    // node id
  to: string;      // node id
  label?: string;  // e.g. 'calls', 'uses', 'queries'
  attentionWeight?: number; // 0-1, how much attention this connection receives (for visualization)
}

export interface BrainGraph {
  nodes: BrainNode[];
  edges: BrainEdge[];
  generatedAt: string; // ISO timestamp
}

