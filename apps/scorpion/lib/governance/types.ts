// Data Governance Type Definitions

export type GovernanceAction = 'read' | 'write' | 'delete' | 'export' | 'share' | 'admin';

export type SensitivityLevel = 'low' | 'medium' | 'high' | 'secret';

export type PolicyScope = 'global' | 'project' | 'tenant';

export type PrincipalType = 'user' | 'role' | 'tenant';

export interface GovernanceContext {
  userId: string | null;
  tenantId?: string | null;
  ip?: string;
  userAgent?: string;
  workflowId?: string;
  agentId?: string;
}

export interface DataAsset {
  id: string;
  name: string;
  resourceType: string;
  resourceId: string;
  sensitivity: SensitivityLevel;
  ownerUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GovernancePolicy {
  id: string;
  name: string;
  description?: string;
  scope: PolicyScope;
  config: PolicyConfig;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PolicyConfig {
  allowedActions?: GovernanceAction[];
  requiredRoles?: string[];
  maxRetentionDays?: number;
  allowExport?: boolean;
  allowShare?: boolean;
  requireApproval?: boolean;
  [key: string]: unknown;
}

export interface PolicyBinding {
  id: string;
  policyId: string;
  principalType: PrincipalType;
  principalId: string;
  assetId?: string;
  createdAt: Date;
}

export interface AccessLog {
  id: string;
  timestamp: Date;
  actorUserId?: string;
  action: GovernanceAction;
  assetId?: string;
  resourceType?: string;
  resourceId?: string;
  result: 'allowed' | 'denied';
  context: Record<string, unknown>;
}

export interface RetentionRule {
  id: string;
  name: string;
  assetType: string;
  retentionDays: number;
  hardDelete: boolean;
  config: Record<string, unknown>;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

