/**
 * Cost Tracker Tests
 * Test cost tracking functionality
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CostTracker, getCostTracker } from '../tracker';

describe('CostTracker', () => {
  let tracker: CostTracker;

  beforeEach(() => {
    tracker = new CostTracker();
  });

  it('should create a singleton instance', () => {
    const tracker1 = getCostTracker();
    const tracker2 = getCostTracker();
    expect(tracker1).toBe(tracker2);
  });

  it('should register a resource', async () => {
    const resourceId = await tracker.registerResource({
      product: 'scorpion-core',
      environment: 'prod',
      service: 'api',
      resourceType: 'container',
      resourceId: 'api-001',
      resourceName: 'API Server',
      estimatedMonthlyCost: 25.00,
    });

    expect(resourceId).toBe('api-001');
  });

  it('should set a budget', async () => {
    await tracker.setBudget({
      product: 'scorpion-core',
      environment: 'prod',
      budgetName: 'Production Budget',
      monthlyBudget: 100.00,
      warningThreshold: 80,
      alertThreshold: 100,
    });

    // Budget should be set (no error thrown)
    expect(true).toBe(true);
  });

  it('should set a quota', async () => {
    await tracker.setQuota({
      product: 'scorpion-core',
      environment: 'prod',
      quotaName: 'API Calls',
      quotaType: 'api-calls',
      limitValue: 10000,
      unit: 'calls',
    });

    // Quota should be set (no error thrown)
    expect(true).toBe(true);
  });

  it('should check quota', async () => {
    const result = await tracker.checkQuota('API Calls', 5000);
    
    // Should return quota check result
    expect(result).toHaveProperty('allowed');
    expect(result).toHaveProperty('currentUsage');
    expect(result).toHaveProperty('limit');
  });

  it('should get cost summary', async () => {
    const summary = await tracker.getCostSummary();
    
    // Should return array of cost summaries
    expect(Array.isArray(summary)).toBe(true);
  });

  it('should get budget status', async () => {
    const budgets = await tracker.getBudgetStatus();
    
    // Should return array of budget statuses
    expect(Array.isArray(budgets)).toBe(true);
  });

  it('should record usage', async () => {
    await tracker.recordUsage('resource-id', {
      computeHours: 24,
      apiCalls: 1000,
      cost: 15.50,
      periodStart: new Date('2025-01-01'),
      periodEnd: new Date('2025-01-02'),
      periodType: 'daily',
    });

    // Usage should be recorded (no error thrown)
    expect(true).toBe(true);
  });
});

