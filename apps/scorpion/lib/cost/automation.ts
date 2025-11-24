/**
 * Cost Automation
 * Auto-registers resources and tracks usage on startup
 */

import { getCostTracker } from './tracker';
import type { ResourceDefinition, BudgetDefinition } from './tracker';

/**
 * Default resources to register on startup
 */
const DEFAULT_RESOURCES: ResourceDefinition[] = [
  // Scorpion Core Services
  {
    product: 'scorpion-core',
    environment: 'dev',
    service: 'nextjs-app',
    resourceType: 'application',
    resourceId: 'scorpion-nextjs-dev',
    resourceName: 'Scorpion Next.js App (Dev)',
    provider: 'local',
    estimatedMonthlyCost: 0, // Local dev, no cost
  },
  {
    product: 'scorpion-core',
    environment: 'dev',
    service: 'postgres',
    resourceType: 'database',
    resourceId: 'scorpion-postgres-dev',
    resourceName: 'Scorpion Postgres (Dev)',
    provider: 'local',
    estimatedMonthlyCost: 0,
  },
  {
    product: 'scorpion-core',
    environment: 'dev',
    service: 'llm-api',
    resourceType: 'api-call',
    resourceId: 'scorpion-llm-api-dev',
    resourceName: 'Scorpion LLM API (Dev)',
    provider: 'ollama', // Default to Ollama (local)
    estimatedMonthlyCost: 0,
  },
  
  // n8n Integration
  {
    product: 'scorpion-core',
    environment: 'dev',
    service: 'n8n-integration',
    resourceType: 'api-integration',
    resourceId: 'scorpion-n8n-dev',
    resourceName: 'Scorpion n8n Integration (Dev)',
    provider: 'n8n',
    estimatedMonthlyCost: 0, // Using n8n cloud free tier or self-hosted
  },
];

/**
 * Default budgets
 */
const DEFAULT_BUDGETS: BudgetDefinition[] = [
  {
    product: 'scorpion-core',
    environment: 'dev',
    budgetName: 'Scorpion Core Development',
    monthlyBudget: 50.00,
    currency: 'USD',
    warningThreshold: 80,
    alertThreshold: 100,
  },
];

/**
 * Initialize cost automation
 * Registers default resources and budgets on startup
 */
export async function initializeCostAutomation(): Promise<void> {
  try {
    const tracker = getCostTracker();
    
    console.log('[Cost Automation] Registering default resources...');
    
    // Register all default resources
    for (const resource of DEFAULT_RESOURCES) {
      try {
        await tracker.registerResource(resource);
        console.log(`  ✅ Registered: ${resource.resourceName || resource.resourceId}`);
      } catch (error) {
        console.warn(`  ⚠️ Failed to register ${resource.resourceId}:`, error);
      }
    }
    
    // Set default budgets
    console.log('[Cost Automation] Setting default budgets...');
    for (const budget of DEFAULT_BUDGETS) {
      try {
        await tracker.setBudget(budget);
        console.log(`  ✅ Budget set: ${budget.budgetName}`);
      } catch (error) {
        console.warn(`  ⚠️ Failed to set budget ${budget.budgetName}:`, error);
      }
    }
    
    // Start budget checking scheduler
    startBudgetChecker();
    
    console.log('[Cost Automation] ✅ Cost automation initialized');
  } catch (error) {
    console.error('[Cost Automation] Failed to initialize:', error);
  }
}

/**
 * Start budget checking scheduler
 * Checks budgets every hour and emits warnings if thresholds are exceeded
 */
function startBudgetChecker(): void {
  // Check budgets immediately
  checkBudgets();
  
  // Then check every hour
  setInterval(() => {
    checkBudgets();
  }, 3600000); // 1 hour
}

/**
 * Check all budgets and emit warnings if needed
 */
async function checkBudgets(): Promise<void> {
  try {
    const tracker = getCostTracker();
    const budgets = await tracker.getBudgetStatus();
    
    for (const budget of budgets) {
      if (budget.status === 'warning' || budget.status === 'exceeded') {
        // Budget checking is already handled in tracker.checkBudgets()
        // This is just a safety check
        console.log(`[Cost Automation] Budget ${budget.budgetName} status: ${budget.status}`);
      }
    }
  } catch (error) {
    console.error('[Cost Automation] Failed to check budgets:', error);
  }
}

/**
 * Register a custom resource
 */
export async function registerCustomResource(resource: ResourceDefinition): Promise<string> {
  const tracker = getCostTracker();
  return await tracker.registerResource(resource);
}

/**
 * Get all registered resources
 */
export async function getRegisteredResources(): Promise<any[]> {
  // This would query the database, but for now return default resources
  return DEFAULT_RESOURCES;
}

