/**
 * Cost Tracker
 * Financial governance and cost management for Scorpion
 * 
 * Implements Cloud Digital Leader cost management principles:
 * - Resource hierarchy tracking
 * - Budget monitoring
 * - Quota enforcement
 * - Cost analytics
 */

import { emitEvent } from '../events/event-bus';
import type { CostResourceCreatedEvent, CostThresholdWarningEvent } from '../events/types';
import { query, transaction } from '../db/client';
import { randomUUID } from 'crypto';

export interface ResourceDefinition {
  organization?: string;
  product: string; // agentpilot, bitbrain, scorpion-core, r-d
  environment: 'dev' | 'staging' | 'prod';
  service: string; // n8n, api, db, web-ui, etc.
  resourceType: string; // vps, container, api-call, storage, etc.
  resourceId?: string;
  resourceName?: string;
  provider?: string;
  region?: string;
  estimatedMonthlyCost?: number;
  tags?: Record<string, string>;
}

export interface BudgetDefinition {
  organization?: string;
  product?: string;
  environment?: string;
  budgetName: string;
  monthlyBudget: number;
  currency?: string;
  warningThreshold?: number; // Percentage (default 80)
  alertThreshold?: number; // Percentage (default 100)
}

export interface QuotaDefinition {
  organization?: string;
  product?: string;
  environment?: string;
  quotaName: string;
  quotaType: string; // vps-count, storage-gb, api-calls, llm-tokens
  limitValue: number;
  unit?: string;
}

export class CostTracker {
  /**
   * Register a new resource for cost tracking
   */
  async registerResource(resource: ResourceDefinition): Promise<string> {
    const resourceId = resource.resourceId || randomUUID();
    const organization = resource.organization || 'scorpion-systems';

    try {
      // Check if DATABASE_URL is configured
      if (!process.env.DATABASE_URL) {
        // Fallback: just emit event
        await emitEvent({
          id: randomUUID(),
          type: 'cost.resource.created',
          severity: 'info',
          timestamp: new Date().toISOString(),
          source: 'cost-tracker',
          environment: resource.environment,
          data: {
            resourceId,
            resourceType: resource.resourceType,
            product: resource.product,
            environment: resource.environment,
            estimatedCost: resource.estimatedMonthlyCost,
          },
        });
        return resourceId;
      }

      const insertQuery = `
        INSERT INTO cost_resources (
          id, organization, product, environment, service,
          resource_type, resource_id, resource_name,
          provider, region, estimated_monthly_cost, tags
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (organization, product, environment, service, resource_id) 
        DO UPDATE SET
          resource_name = EXCLUDED.resource_name,
          provider = EXCLUDED.provider,
          region = EXCLUDED.region,
          estimated_monthly_cost = EXCLUDED.estimated_monthly_cost,
          tags = EXCLUDED.tags,
          updated_at = NOW()
        RETURNING id::text
      `;

      const result = await query<{ id: string }>(insertQuery, [
        randomUUID(),
        organization,
        resource.product,
        resource.environment,
        resource.service,
        resource.resourceType,
        resourceId,
        resource.resourceName || null,
        resource.provider || null,
        resource.region || null,
        resource.estimatedMonthlyCost || 0,
        JSON.stringify(resource.tags || {}),
      ]);

      // Emit event
      await emitEvent({
        id: randomUUID(),
        type: 'cost.resource.created',
        severity: 'info',
        timestamp: new Date().toISOString(),
        source: 'cost-tracker',
        environment: resource.environment,
        data: {
          resourceId,
          resourceType: resource.resourceType,
          product: resource.product,
          environment: resource.environment,
          estimatedCost: resource.estimatedMonthlyCost,
        },
      });

      return result.rows[0]?.id || resourceId;
    } catch (error) {
      console.error('[CostTracker] Failed to register resource:', error);
      // Still emit event even if DB fails
      await emitEvent({
        id: randomUUID(),
        type: 'cost.resource.created',
        severity: 'warn',
        timestamp: new Date().toISOString(),
        source: 'cost-tracker',
        environment: resource.environment,
        data: {
          resourceId,
          error: error instanceof Error ? error.message : String(error),
        },
      });
      return resourceId;
    }
  }

  /**
   * Record usage for a resource
   */
  async recordUsage(
    resourceId: string,
    usage: {
      computeHours?: number;
      storageGb?: number;
      bandwidthGb?: number;
      apiCalls?: number;
      llmTokens?: number;
      cost: number;
      periodStart: Date;
      periodEnd: Date;
      periodType?: 'hourly' | 'daily' | 'monthly';
    }
  ): Promise<void> {
    try {
      if (!process.env.DATABASE_URL) {
        console.log('[CostTracker] Usage recorded (no DB):', { resourceId, usage });
        return;
      }

      // First, find the resource by resource_id (external ID)
      const resourceQuery = `
        SELECT id FROM cost_resources 
        WHERE resource_id = $1 AND deleted_at IS NULL
        LIMIT 1
      `;
      const resourceResult = await query<{ id: string }>(resourceQuery, [resourceId]);

      if (resourceResult.rows.length === 0) {
        console.warn(`[CostTracker] Resource not found: ${resourceId}, skipping usage record`);
        return;
      }

      const dbResourceId = resourceResult.rows[0].id;

      const insertQuery = `
        INSERT INTO cost_usage (
          id, resource_id, period_start, period_end, period_type,
          compute_hours, storage_gb, bandwidth_gb, api_calls, llm_tokens,
          cost, currency, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `;

      await query(insertQuery, [
        randomUUID(),
        dbResourceId,
        usage.periodStart.toISOString(),
        usage.periodEnd.toISOString(),
        usage.periodType || 'hourly',
        usage.computeHours || 0,
        usage.storageGb || 0,
        usage.bandwidthGb || 0,
        usage.apiCalls || 0,
        usage.llmTokens || 0,
        usage.cost,
        'USD',
        JSON.stringify({}),
      ]);
    } catch (error) {
      console.error('[CostTracker] Failed to record usage:', error);
    }
  }

  /**
   * Create or update a budget
   */
  async setBudget(budget: BudgetDefinition): Promise<void> {
    try {
      if (!process.env.DATABASE_URL) {
        console.log('[CostTracker] Budget set (no DB):', budget);
        return;
      }

      const organization = budget.organization || 'scorpion-systems';
      const currency = budget.currency || 'USD';
      const warningThreshold = budget.warningThreshold || 80;
      const alertThreshold = budget.alertThreshold || 100;

      const upsertQuery = `
        INSERT INTO cost_budgets (
          id, organization, product, environment, budget_name,
          monthly_budget, currency, warning_threshold, alert_threshold, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE)
        ON CONFLICT (organization, product, environment, budget_name)
        DO UPDATE SET
          monthly_budget = EXCLUDED.monthly_budget,
          currency = EXCLUDED.currency,
          warning_threshold = EXCLUDED.warning_threshold,
          alert_threshold = EXCLUDED.alert_threshold,
          updated_at = NOW()
      `;

      await query(upsertQuery, [
        randomUUID(),
        organization,
        budget.product || null,
        budget.environment || null,
        budget.budgetName,
        budget.monthlyBudget,
        currency,
        warningThreshold,
        alertThreshold,
      ]);
    } catch (error) {
      console.error('[CostTracker] Failed to set budget:', error);
    }
  }

  /**
   * Check budgets and emit alerts if thresholds exceeded
   */
  async checkBudgets(): Promise<void> {
    try {
      if (!process.env.DATABASE_URL) {
        return;
      }

      const budgets = await this.getBudgetStatus();

      for (const budget of budgets) {
        if (budget.status === 'warning' || budget.status === 'exceeded') {
          // Check if we already sent an alert recently (avoid spam)
          const recentAlertQuery = `
            SELECT id FROM cost_budget_alerts
            WHERE budget_id = (
              SELECT id FROM cost_budgets
              WHERE organization = $1 
                AND COALESCE(product, '') = COALESCE($2, '')
                AND COALESCE(environment, '') = COALESCE($3, '')
                AND budget_name = $4
              LIMIT 1
            )
            AND alert_type = $5
            AND created_at > NOW() - INTERVAL '1 hour'
            LIMIT 1
          `;

          const recentAlert = await query(recentAlertQuery, [
            budget.organization,
            budget.product || null,
            budget.environment || null,
            budget.budgetName,
            budget.status,
          ]);

          if (recentAlert.rows.length > 0) {
            continue; // Already alerted recently
          }

          // Create alert record
          const budgetIdQuery = `
            SELECT id FROM cost_budgets
            WHERE organization = $1 
              AND COALESCE(product, '') = COALESCE($2, '')
              AND COALESCE(environment, '') = COALESCE($3, '')
              AND budget_name = $4
            LIMIT 1
          `;

          const budgetIdResult = await query<{ id: string }>(budgetIdQuery, [
            budget.organization,
            budget.product || null,
            budget.environment || null,
            budget.budgetName,
          ]);

          if (budgetIdResult.rows.length > 0) {
            const alertInsertQuery = `
              INSERT INTO cost_budget_alerts (
                id, budget_id, alert_type, current_spend, budget_amount, percentage
              ) VALUES ($1, $2, $3, $4, $5, $6)
            `;

            await query(alertInsertQuery, [
              randomUUID(),
              budgetIdResult.rows[0].id,
              budget.status,
              budget.actualSpend,
              budget.monthlyBudget,
              budget.percentageUsed,
            ]);
          }

          // Emit event
          await emitEvent({
            id: randomUUID(),
            type: 'cost.threshold.warning',
            severity: budget.status === 'exceeded' ? 'critical' : 'warn',
            timestamp: new Date().toISOString(),
            source: 'cost-tracker',
            environment: budget.environment as any,
            data: {
              budgetName: budget.budgetName,
              monthlyBudget: budget.monthlyBudget,
              actualSpend: budget.actualSpend,
              percentageUsed: budget.percentageUsed,
              status: budget.status,
            },
          });
        }
      }
    } catch (error) {
      console.error('[CostTracker] Failed to check budgets:', error);
    }
  }

  /**
   * Create or update a quota
   */
  async setQuota(quota: QuotaDefinition): Promise<void> {
    try {
      if (!process.env.DATABASE_URL) {
        console.log('[CostTracker] Quota set (no DB):', quota);
        return;
      }

      const organization = quota.organization || 'scorpion-systems';
      const unit = quota.unit || 'count';

      const upsertQuery = `
        INSERT INTO cost_quotas (
          id, organization, product, environment, quota_name,
          quota_type, limit_value, unit, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
        ON CONFLICT (organization, product, environment, quota_name)
        DO UPDATE SET
          quota_type = EXCLUDED.quota_type,
          limit_value = EXCLUDED.limit_value,
          unit = EXCLUDED.unit,
          updated_at = NOW()
      `;

      await query(upsertQuery, [
        randomUUID(),
        organization,
        quota.product || null,
        quota.environment || null,
        quota.quotaName,
        quota.quotaType,
        quota.limitValue,
        unit,
      ]);
    } catch (error) {
      console.error('[CostTracker] Failed to set quota:', error);
    }
  }

  /**
   * Check if quota would be exceeded
   */
  async checkQuota(
    quotaName: string,
    requestedAmount: number
  ): Promise<{ allowed: boolean; currentUsage: number; limit: number }> {
    try {
      if (!process.env.DATABASE_URL) {
        return { allowed: true, currentUsage: 0, limit: 0 };
      }

      const quotaQuery = `
        SELECT limit_value, current_usage, quota_type
        FROM cost_quotas
        WHERE quota_name = $1 AND is_active = TRUE
        LIMIT 1
      `;

      const quotaResult = await query<{
        limit_value: number;
        current_usage: number;
        quota_type: string;
      }>(quotaQuery, [quotaName]);

      if (quotaResult.rows.length === 0) {
        return { allowed: true, currentUsage: 0, limit: 0 };
      }

      const quota = quotaResult.rows[0];
      const newUsage = quota.current_usage + requestedAmount;
      const allowed = newUsage <= quota.limit_value;

      return {
        allowed,
        currentUsage: quota.current_usage,
        limit: quota.limit_value,
      };
    } catch (error) {
      console.error('[CostTracker] Failed to check quota:', error);
      return { allowed: true, currentUsage: 0, limit: 0 };
    }
  }

  /**
   * Get current month costs by product
   */
  async getCostSummary(): Promise<{
    organization: string;
    product: string;
    environment: string;
    totalCost: number;
    resourceCount: number;
  }[]> {
    try {
      if (!process.env.DATABASE_URL) {
        return [];
      }

      const summaryQuery = `
        SELECT 
          organization,
          product,
          environment,
          COALESCE(total_cost, 0) as total_cost,
          COALESCE(resource_count, 0) as resource_count
        FROM cost_summary_current_month
        ORDER BY organization, product, environment
      `;

      const result = await query<{
        organization: string;
        product: string;
        environment: string;
        total_cost: number;
        resource_count: number;
      }>(summaryQuery);

      return result.rows.map(row => ({
        organization: row.organization,
        product: row.product,
        environment: row.environment,
        totalCost: Number(row.total_cost),
        resourceCount: Number(row.resource_count),
      }));
    } catch (error) {
      console.error('[CostTracker] Failed to get cost summary:', error);
      return [];
    }
  }

  /**
   * Get budget vs actual comparison
   */
  async getBudgetStatus(): Promise<{
    organization: string;
    product?: string;
    environment?: string;
    budgetName: string;
    monthlyBudget: number;
    actualSpend: number;
    percentageUsed: number;
    status: 'ok' | 'warning' | 'exceeded';
  }[]> {
    try {
      if (!process.env.DATABASE_URL) {
        return [];
      }

      const statusQuery = `
        SELECT 
          organization,
          product,
          environment,
          budget_name,
          monthly_budget,
          actual_spend,
          percentage_used,
          status
        FROM cost_budget_vs_actual
        ORDER BY organization, product, environment, budget_name
      `;

      const result = await query<{
        organization: string;
        product: string | null;
        environment: string | null;
        budget_name: string;
        monthly_budget: number;
        actual_spend: number;
        percentage_used: number;
        status: string;
      }>(statusQuery);

      return result.rows.map(row => ({
        organization: row.organization,
        product: row.product || undefined,
        environment: row.environment || undefined,
        budgetName: row.budget_name,
        monthlyBudget: Number(row.monthly_budget),
        actualSpend: Number(row.actual_spend),
        percentageUsed: Number(row.percentage_used),
        status: row.status as 'ok' | 'warning' | 'exceeded',
      }));
    } catch (error) {
      console.error('[CostTracker] Failed to get budget status:', error);
      return [];
    }
  }
}

// Singleton instance
let costTrackerInstance: CostTracker | null = null;

export function getCostTracker(): CostTracker {
  if (!costTrackerInstance) {
    costTrackerInstance = new CostTracker();
  }
  return costTrackerInstance;
}

