// Governance Integration Helpers
// Wrappers for common operations that need governance checks

import { getGovernanceService } from './governanceService';
import type { GovernanceContext, GovernanceAction } from './types';

/**
 * Check access to knowledge/RAG documents before reading
 */
export async function checkKnowledgeAccess(
  resourceIds: string[],
  context: GovernanceContext
): Promise<{ allowed: string[]; denied: string[] }> {
  const service = getGovernanceService();
  const allowed: string[] = [];
  const denied: string[] = [];

  for (const resourceId of resourceIds) {
    const result = await service.checkAccess({
      action: 'read',
      resourceType: 'rag_document',
      resourceId,
      context,
    });

    if (result === 'allowed') {
      allowed.push(resourceId);
    } else {
      denied.push(resourceId);
    }
  }

  return { allowed, denied };
}

/**
 * Register a knowledge document as a data asset
 */
export async function registerKnowledgeAsset(params: {
  name: string;
  resourceId: string;
  ownerUserId: string | null;
  sensitivity?: 'low' | 'medium' | 'high' | 'secret';
}): Promise<string> {
  const service = getGovernanceService();
  return await service.registerAsset({
    name: params.name,
    resourceType: 'rag_document',
    resourceId: params.resourceId,
    ownerUserId: params.ownerUserId,
    sensitivity: params.sensitivity,
  });
}

/**
 * Check export access before exporting data
 */
export async function checkExportAccess(
  resourceType: string,
  resourceId: string,
  context: GovernanceContext
): Promise<boolean> {
  const service = getGovernanceService();
  const result = await service.checkAccess({
    action: 'export',
    resourceType,
    resourceId,
    context,
  });
  return result === 'allowed';
}

