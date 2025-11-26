/**
 * Lightning AI Platform - Unified Redirect Map
 * Centralizes all navigation logic with type safety
 */

export const redirectMap = {
  // Core Payment Actions
  "generate-invoice": "/receive",
  "send-payment": "/send",
  "view-transactions": "/transactions",
  "payment-links": "/payment-links",
  
  // Lightning Operations
  "test-lightning": "/lightning-test",
  "lightning-channels": "/channels",
  "lightning-intelligence": "/lightning-intelligence",
  
  // AI & Automation
  "ai-assistant": "/ai-assistant",
  "create-agent": "/agents",
  "agent-marketplace": "/agents/marketplace",
  
  // Analytics & Insights
  "earnings-card-click": "/dashboard#earnings",
  "analytics-dashboard": "/analytics",
  "earnings-analytics": "/analytics/earnings",
  "routing-analytics": "/analytics/routing",
  
  // Security & Trust
  "trust-check": "/trust-center",
  "security-audit": "/trust-center/audit",
  "backup-vault": "/backups",
  
  // Settings & Configuration
  "settings": "/settings",
  "system-health": "/settings/system-health",
  "node-config": "/settings/node",
  "team-settings": "/settings/team",
  
  // Onboarding & Setup
  "onboarding": "/onboarding",
  "setup-wallet": "/onboarding/wallet",
  "setup-node": "/onboarding/node",
  "first-invoice": "/onboarding/first-payment",
  
  // Dashboard Navigation
  "dashboard": "/dashboard",
  "dashboard-overview": "/dashboard",
  "quick-actions": "/dashboard#actions",
  
  // Development & Testing
  "tailwind-test": "/tailwind-test",
  "component-test": "/test/components",
  
  // External Links (with confirmation)
  "lightning-docs": "https://lightning.network/docs",
  "bitcoin-docs": "https://bitcoin.org/en/developer-documentation",
  "support": "https://support.lightning-ai.com",
} as const;

export type RedirectAction = keyof typeof redirectMap;

/**
 * Validates that a redirect action exists in the map
 */
export function isValidRedirectAction(action: string): action is RedirectAction {
  return action in redirectMap;
}

/**
 * Gets the path for a redirect action with validation
 */
export function getRedirectPath(action: RedirectAction): string {
  const path = redirectMap[action];
  if (!path) {
    throw new Error(`Invalid redirect action: ${action}`);
  }
  return path;
}

/**
 * Checks if a redirect is external (requires confirmation)
 */
export function isExternalRedirect(action: RedirectAction): boolean {
  const path = redirectMap[action];
  return path.startsWith('http://') || path.startsWith('https://');
} 