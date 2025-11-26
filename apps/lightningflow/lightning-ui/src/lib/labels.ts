/**
 * Lightning AI Node Platform - Apple-Style Navigation System
 * 
 * Provides consistent, intuitive UX copy that feels familiar and approachable.
 * Focus: Clarity, simplicity, progressive disclosure.
 */

// Core Navigation Labels - Simplified and User-First
export const NAV_LABELS = {
  // Core Actions (Always Visible)
  dashboard: "Dashboard",
  send: "Send", 
  receive: "Receive",
  earnings: "Earnings",
  invoices: "Invoices",
  learn: "Learn",
  settings: "Settings",
  
  // Advanced Tools (Progressive Disclosure)
  channels: "Channels",
  network: "Network",
  automations: "AI Agents",
  activity: "Activity",
  
  // Tools Section (Collapsible)
  backup: "Backup",
  sync: "Sync",
  verify: "Verify",
  routes: "Routes",
  trustCenter: "Trust Center",
  
  // Legacy/Deprecated (for migration)
  aiAssistant: "Ask",
  agents: "AI Agents",
  vault: "Secure",
  lightningTest: "Test Mode",
  analytics: "Insights",
  guides: "Tutorials",
  teamWallets: "Shared",
  paymentLinks: "Links",
  transactions: "Activity"
} as const;

// Action Button Labels
export const ACTION_LABELS = {
  generateInvoice: "Create Request",
  sendPayment: "Send Now",
  viewTransaction: "Open Receipt", 
  activateAgent: "Enable Smart Action",
  switchToMock: "Enter Preview Mode",
  switchToLive: "Go Live",
  vaultLock: "Secure Funds",
  agentSummary: "View Insights",
  testPayment: "Run Simulation",
  clearLogs: "Erase History",
  saveSettings: "Apply Changes",
  resetNode: "Reset Workspace",
  verifySignature: "Confirm Identity",
  enableAutomation: "Turn On",
  disableAutomation: "Turn Off",
  copyAddress: "Copy",
  shareLink: "Share",
  downloadReceipt: "Save Receipt",
  exportData: "Export",
  importData: "Import"
} as const;

// System Concept Labels
export const CONCEPT_LABELS = {
  node: "Workspace",
  mockMode: "Preview Mode",
  liveMode: "Active Mode", 
  cryptographicProof: "Signature",
  vaultRouting: "Smart Routing",
  earnings: "Revenue",
  aiAgent: "Smart Action",
  trustTiles: "Verified Badges",
  transactionLogs: "Receipts",
  lightningChannel: "Connection",
  balance: "Balance",
  invoice: "Request",
  payment: "Transaction",
  automation: "Smart Action",
  verification: "Verification",
  security: "Security"
} as const;

// Status Messages (Apple-style)
export const STATUS_LABELS = {
  connected: "Connected",
  disconnected: "Offline", 
  syncing: "Syncing...",
  verified: "Verified",
  pending: "Processing...",
  failed: "Failed",
  success: "Complete",
  loading: "Loading...",
  ready: "Ready",
  active: "Active",
  inactive: "Inactive",
  secure: "Secured",
  unsecure: "Unsecured",
  enabled: "On",
  disabled: "Off"
} as const;

// Error Messages (Human-friendly)
export const ERROR_LABELS = {
  networkError: "Connection lost. Please try again.",
  insufficientFunds: "Insufficient balance for this transaction.",
  invalidInvoice: "This request appears to be invalid.",
  paymentFailed: "Payment could not be completed.",
  authenticationFailed: "Unable to verify your identity.",
  serverError: "Something went wrong. Please try again.",
  timeoutError: "Request timed out. Please try again.",
  validationError: "Please check your information and try again.",
  permissionDenied: "You don't have permission for this action.",
  notFound: "The requested item could not be found."
} as const;

// Success Messages (Encouraging)
export const SUCCESS_LABELS = {
  paymentSent: "Payment sent successfully",
  invoiceCreated: "Request created and ready to share",
  settingsSaved: "Your preferences have been saved",
  automationEnabled: "Smart Action is now active",
  backupCreated: "Backup completed successfully",
  dataExported: "Data exported to your device",
  verificationComplete: "Identity verified successfully",
  connectionEstablished: "Connection established",
  syncComplete: "Sync completed successfully"
} as const;

// Page Titles - More Descriptive
export const PAGE_TITLES = {
  dashboard: "Lightning Dashboard",
  send: "Send Payment",
  receive: "Request Payment", 
  earnings: "Lightning Earnings",
  invoices: "Payment Invoices",
  channels: "Lightning Channels",
  network: "Network Status",
  automations: "AI Automations",
  activity: "Payment Activity",
  backup: "Backup & Recovery",
  sync: "Node Sync",
  verify: "Verify Transactions",
  routes: "Payment Routes",
  trustCenter: "Trust & Security",
  learn: "Tutorials & Guides",
  settings: "Node Settings"
} as const;

// Descriptions (Clear and concise)
export const DESCRIPTIONS = {
  dashboard: "Monitor your workspace activity and performance",
  send: "Send Bitcoin payments instantly via Lightning Network",
  receive: "Create payment requests and share with others", 
  transactions: "View all your payment activity and receipts",
  aiAssistant: "Get help and insights from your AI assistant",
  agents: "Automate tasks with intelligent actions",
  vault: "Secure storage for your Bitcoin funds",
  settings: "Customize your workspace preferences",
  trustCenter: "Verify transactions and view security status",
  lightningTest: "Test features safely without real Bitcoin",
  previewMode: "Safe testing environment with simulated data",
  activeMode: "Live workspace with real Bitcoin transactions"
} as const;

// Helper Functions
export const getNavLabel = (key: keyof typeof NAV_LABELS): string => {
  return NAV_LABELS[key] || key;
};

export const getActionLabel = (key: keyof typeof ACTION_LABELS): string => {
  return ACTION_LABELS[key] || key;
};

export const getConceptLabel = (key: keyof typeof CONCEPT_LABELS): string => {
  return CONCEPT_LABELS[key] || key;
};

export const getStatusLabel = (key: keyof typeof STATUS_LABELS): string => {
  return STATUS_LABELS[key] || key;
};

export const getPageTitle = (key: keyof typeof PAGE_TITLES): string => {
  return PAGE_TITLES[key] || key;
};

export const getDescription = (key: keyof typeof DESCRIPTIONS): string => {
  return DESCRIPTIONS[key] || "";
};

// Mode-aware labels
export const getModeLabel = (isMockMode: boolean) => {
  return isMockMode ? CONCEPT_LABELS.mockMode : CONCEPT_LABELS.liveMode;
};

export const getModeDescription = (isMockMode: boolean) => {
  return isMockMode ? DESCRIPTIONS.previewMode : DESCRIPTIONS.activeMode;
};

// Currency formatting (Apple Wallet style)
export const formatCurrency = (sats: number, showSats: boolean = true): string => {
  const btc = (sats / 100000000).toFixed(8);
  if (showSats) {
    return `₿ ${btc} / ${sats.toLocaleString()} sats`;
  }
  return `₿ ${btc}`;
};

// Time formatting (Apple style)
export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
};

// User Experience Mode Labels
export const UX_LABELS = {
  beginnerMode: "Beginner Mode",
  advancedMode: "Advanced Mode",
  toggleTooltip: "Switch between beginner and advanced interface",
  mockMode: "Test Mode",
  liveMode: "Live Mode"
} as const;

// Contextual Help Text
export const HELP_TEXT = {
  channels: "Lightning channels connect your node to the network",
  network: "View your node's network connections and peers",
  automations: "AI agents that automate your Lightning operations",
  backup: "Secure your node data and recovery keys",
  sync: "Keep your node synchronized with the Lightning network",
  verify: "Verify transaction signatures and proof logs"
} as const;

export default {
  NAV_LABELS,
  ACTION_LABELS,
  CONCEPT_LABELS,
  STATUS_LABELS,
  ERROR_LABELS,
  SUCCESS_LABELS,
  PAGE_TITLES,
  DESCRIPTIONS,
  getNavLabel,
  getActionLabel,
  getConceptLabel,
  getStatusLabel,
  getPageTitle,
  getDescription,
  getModeLabel,
  getModeDescription,
  formatCurrency,
  formatTime,
  UX_LABELS,
  HELP_TEXT
}; 