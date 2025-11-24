// Data Governance Service
// Centralized access control, policy enforcement, and audit logging

import { query } from '@/lib/db/client';
import { randomUUID } from 'crypto';
import type {
  GovernanceAction,
  GovernanceContext,
  SensitivityLevel,
  DataAsset,
  GovernancePolicy,
  PolicyConfig,
} from './types';

export class GovernanceService {
  /**
   * Register a data asset in the governance system
   */
  async registerAsset(params: {
    name: string;
    resourceType: string;
    resourceId: string;
    ownerUserId: string | null;
    sensitivity?: SensitivityLevel;
  }): Promise<string> {
    const assetId = randomUUID();
    const sensitivity = params.sensitivity || 'medium';

    await query(
      `INSERT INTO data_assets (id, name, resource_type, resource_id, owner_user_id, sensitivity)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (resource_type, resource_id) DO UPDATE
       SET name = $2, owner_user_id = $5, sensitivity = $6, updated_at = NOW()
       RETURNING id`,
      [assetId, params.name, params.resourceType, params.resourceId, params.ownerUserId, sensitivity]
    );

    return assetId;
  }

  /**
   * Check if an action is allowed on an asset
   * Evaluates policies and bindings, then logs the result
   */
  async checkAccess(params: {
    action: GovernanceAction;
    assetId?: string;
    resourceType?: string;
    resourceId?: string;
    context: GovernanceContext;
  }): Promise<'allowed' | 'denied'> {
    // Resolve asset if not provided
    const assetId = await this.resolveAssetId(params);
    if (!assetId) {
      // If asset doesn't exist, allow by default (for backward compatibility)
      await this.logAccess({
        ...params,
        assetId: undefined,
        result: 'allowed',
      });
      return 'allowed';
    }

    // Load asset
    const asset = await this.loadAsset(assetId);
    if (!asset) {
      await this.logAccess({
        ...params,
        assetId,
        result: 'denied',
      });
      return 'denied';
    }

    // Check ownership
    if (asset.ownerUserId && params.context.userId === asset.ownerUserId) {
      // Owner has full access
      await this.logAccess({
        ...params,
        assetId,
        result: 'allowed',
      });
      return 'allowed';
    }

    // Load applicable policies
    const policies = await this.loadApplicablePolicies(assetId, params.context);
    
    // Evaluate policies
    const result = await this.evaluatePolicies(policies, params.action, asset, params.context);

    // Log access
    await this.logAccess({
      ...params,
      assetId,
      result,
    });

    return result;
  }

  /**
   * Log an access attempt
   */
  async logAccess(params: {
    action: GovernanceAction;
    result: 'allowed' | 'denied';
    assetId?: string;
    resourceType?: string;
    resourceId?: string;
    context: GovernanceContext;
  }): Promise<void> {
    await query(
      `INSERT INTO access_logs (
        id, actor_user_id, action, asset_id, resource_type, resource_id,
        result, context_json
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        randomUUID(),
        params.context.userId || null,
        params.action,
        params.assetId || null,
        params.resourceType || null,
        params.resourceId || null,
        params.result,
        JSON.stringify({
          ip: params.context.ip,
          userAgent: params.context.userAgent,
          workflowId: params.context.workflowId,
          agentId: params.context.agentId,
          tenantId: params.context.tenantId,
        }),
      ]
    );
  }

  /**
   * Enforce retention rules
   * Returns count of deleted/flagged assets
   */
  async enforceRetention(): Promise<{ deleted: number; flagged: number }> {
    const rules = await this.loadRetentionRules();
    let deleted = 0;
    let flagged = 0;

    for (const rule of rules) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - rule.retentionDays);

      // Find assets older than retention period
      const assetsResult = await query(
        `SELECT id, resource_type, resource_id
         FROM data_assets
         WHERE resource_type = $1
         AND created_at < $2`,
        [rule.assetType, cutoffDate]
      );

      for (const asset of assetsResult.rows) {
        if (rule.hardDelete) {
          // Hard delete: remove from database
          await this.deleteAsset(asset.id, asset.resource_type, asset.resource_id);
          deleted++;
        } else {
          // Soft delete: mark for deletion (could add deleted_at column)
          await query(
            `UPDATE data_assets SET updated_at = NOW() WHERE id = $1`,
            [asset.id]
          );
          flagged++;
        }
      }
    }

    return { deleted, flagged };
  }

  // Helper methods (Power of 10: keep functions small)

  private async resolveAssetId(params: {
    assetId?: string;
    resourceType?: string;
    resourceId?: string;
  }): Promise<string | null> {
    if (params.assetId) {
      return params.assetId;
    }

    if (params.resourceType && params.resourceId) {
      const result = await query(
        `SELECT id FROM data_assets
         WHERE resource_type = $1 AND resource_id = $2
         LIMIT 1`,
        [params.resourceType, params.resourceId]
      );
      return result.rows[0]?.id || null;
    }

    return null;
  }

  private async loadAsset(assetId: string): Promise<DataAsset | null> {
    const result = await query(
      `SELECT * FROM data_assets WHERE id = $1`,
      [assetId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      resourceType: row.resource_type,
      resourceId: row.resource_id,
      sensitivity: row.sensitivity,
      ownerUserId: row.owner_user_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private async loadApplicablePolicies(
    assetId: string,
    context: GovernanceContext
  ): Promise<GovernancePolicy[]> {
    // Load global policies
    const globalPoliciesResult = await query(
      `SELECT p.* FROM governance_policies p
       WHERE p.scope = 'global' AND p.enabled = TRUE`
    );

    // Load asset-specific bindings
    const bindingsResult = await query(
      `SELECT p.* FROM governance_policies p
       INNER JOIN policy_bindings b ON b.policy_id = p.id
       WHERE (b.asset_id = $1 OR b.asset_id IS NULL)
       AND p.enabled = TRUE
       AND (
         (b.principal_type = 'user' AND b.principal_id = $2)
         OR (b.principal_type = 'tenant' AND b.principal_id = $3)
       )`,
      [assetId, context.userId || '', context.tenantId || '']
    );

    const policies = [...globalPoliciesResult.rows, ...bindingsResult.rows];
    
    return policies.map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      scope: row.scope,
      config: row.config_json as PolicyConfig,
      enabled: row.enabled,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  private async evaluatePolicies(
    policies: GovernancePolicy[],
    action: GovernanceAction,
    asset: DataAsset,
    context: GovernanceContext
  ): Promise<'allowed' | 'denied'> {
    // If no policies, allow by default (backward compatibility)
    if (policies.length === 0) {
      return 'allowed';
    }

    // Check each policy
    for (const policy of policies) {
      const config = policy.config;

      // Check if action is allowed
      if (config.allowedActions && !config.allowedActions.includes(action)) {
        return 'denied';
      }

      // Check sensitivity restrictions
      if (asset.sensitivity === 'secret' && action !== 'read' && !context.userId) {
        return 'denied';
      }

      // Check export restrictions
      if (action === 'export' && config.allowExport === false) {
        return 'denied';
      }

      // Check share restrictions
      if (action === 'share' && config.allowShare === false) {
        return 'denied';
      }
    }

    // If all policies pass, allow
    return 'allowed';
  }

  private async loadRetentionRules() {
    const result = await query(
      `SELECT * FROM retention_rules WHERE enabled = TRUE`
    );

    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      assetType: row.asset_type,
      retentionDays: row.retention_days,
      hardDelete: row.hard_delete,
      config: row.config_json,
      enabled: row.enabled,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  private async deleteAsset(
    assetId: string,
    resourceType: string,
    resourceId: string
  ): Promise<void> {
    // Delete from data_assets (cascade will handle bindings)
    await query(`DELETE FROM data_assets WHERE id = $1`, [assetId]);

    // Log the deletion
    await this.logAccess({
      action: 'delete',
      assetId,
      resourceType,
      resourceId,
      result: 'allowed',
      context: { userId: 'system' },
    });
  }
}

// Singleton instance
let governanceServiceInstance: GovernanceService | null = null;

export function getGovernanceService(): GovernanceService {
  if (!governanceServiceInstance) {
    governanceServiceInstance = new GovernanceService();
  }
  return governanceServiceInstance;
}

