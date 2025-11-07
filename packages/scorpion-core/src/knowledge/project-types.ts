/**
 * Project knowledge types
 * Extended knowledge types for comprehensive project ingestion
 */

import { ExtractedKnowledge } from './types';

// ProjectKnowledge is a variant of ExtractedKnowledge with extended type support
export interface ProjectKnowledge extends Omit<ExtractedKnowledge, 'type'> {
  type: ExtractedKnowledge['type'] | 'workspace' | 'database' | 'workflow' | 'documentation' | 'infrastructure' | 'service';
  metadata?: Record<string, any>;
}

export interface WorkspaceStructure {
  apps: {
    id: string;
    name: string;
    role: string;
    isSideHustle?: boolean;
    isCentral?: boolean;
    description?: string;
    framework: string;
    entry: string;
    envFile?: string;
    doc?: string;
    importsAllowedFrom: string[];
    importsDeniedFrom: string[];
    subApps?: {
      name: string;
      entry: string;
      port: number;
      description: string;
    }[];
  }[];
  packages: {
    name: string;
    path: string;
  }[];
  policies: {
    naming?: Record<string, string>;
    commits?: string;
    testingMinimum?: string[];
  };
}

export interface DatabaseSchema {
  name: string;
  path: string;
  tables: string[];
  relationships: {
    from: string;
    to: string;
    type: string;
  }[];
  migrations: {
    name: string;
    path: string;
    applied: boolean;
  }[];
}

export interface WorkflowInfo {
  id: string;
  name: string;
  path: string;
  trigger?: string;
  nodes: number;
  active: boolean;
  syncedToN8n: boolean;
  n8nId?: string;
  lastSync?: string;
  executions?: {
    id: string;
    status: string;
    startedAt: string;
    finishedAt?: string;
  }[];
}

export interface ServiceStatus {
  name: string;
  type: 'n8n' | 'ollama' | 'database' | 'redis' | 'caddy' | 'other';
  status: 'online' | 'offline' | 'unknown';
  url?: string;
  port?: number;
  healthCheck?: string;
  lastChecked?: string;
}

export interface ProjectStatus {
  overallHealth: 'healthy' | 'degraded' | 'critical';
  techDebt: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  missingFeatures: {
    p0: number;
    p1: number;
    p2: number;
  };
  services: ServiceStatus[];
  lastIngestion: string;
}

