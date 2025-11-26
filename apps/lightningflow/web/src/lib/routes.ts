/**
 * Lightning AI Platform - Core Business Routes
 * 
 * Organized around the core nucleus:
 * "Making business payments and earning money from your Lightning node"
 */

export const ROUTES = {
  // Core app
  HOME: '/',
  DASHBOARD: '/dashboard',
  
  // 🏦 PILLAR 1: PAYMENTS HUB (The Engine)
  PAYMENTS: {
    HUB: '/payments',
    SEND: '/payments/send',
    RECEIVE: '/payments/receive',
    INVOICES: '/payments/invoices',
    HISTORY: '/payments/history'
  },
  
  // 💰 PILLAR 2: NODE EARNINGS (The Value Driver)
  EARNINGS: {
    OVERVIEW: '/earnings',
    ROUTING: '/earnings/routing',
    FEES: '/earnings/fees',
    ANALYTICS: '/earnings/analytics',
    GROWTH: '/earnings/growth'
  },
  
  // 🚀 PILLAR 3: BUSINESS BOOST (The Multiplier)
  BOOST: {
    OVERVIEW: '/boost',
    AI_ASSISTANTS: '/boost/ai-assistants',
    CLIENT_TOOLS: '/boost/client-tools',
    TEMPLATES: '/boost/templates',
    AUTOMATION: '/boost/automation'
  },
  
  // ⚙️ PILLAR 4: CONTROL CENTER (The Defense System)
  SETTINGS: {
    OVERVIEW: '/settings',
    WALLET: '/settings/wallet',
    INTEGRATIONS: '/settings/integrations',
    SECURITY: '/settings/security',
    BACKUP: '/settings/backup',
    LNURL: '/settings/lnurl'
  },
  
  // Special flows
  ONBOARDING: '/onboarding',
  TRUST_CENTER: '/settings/security/trust-center', // Moved under security
  
  // Legacy redirects (backward compatibility)
  LEGACY: {
    SEND: '/send',
    RECEIVE: '/receive',
    TRANSACTIONS: '/transactions',
    AGENTS: '/agents',
    ANALYTICS: '/analytics'
  }
} as const

// Smart redirect mappings for the new structure
export const REDIRECT_MAP = {
  // Core actions
  'SEND': ROUTES.PAYMENTS.SEND,
  'RECEIVE': ROUTES.PAYMENTS.RECEIVE,
  'PAY': ROUTES.PAYMENTS.SEND,
  'INVOICE': ROUTES.PAYMENTS.INVOICES,
  'MONEY': ROUTES.PAYMENTS.HUB,
  
  // Earnings & Growth
  'EARN': ROUTES.EARNINGS.OVERVIEW,
  'INCOME': ROUTES.EARNINGS.OVERVIEW,
  'PROFIT': ROUTES.EARNINGS.ANALYTICS,
  'GROW': ROUTES.EARNINGS.GROWTH,
  
  // Business tools
  'AI': ROUTES.BOOST.AI_ASSISTANTS,
  'AUTOMATE': ROUTES.BOOST.AUTOMATION,
  'TOOLS': ROUTES.BOOST.CLIENT_TOOLS,
  'SCALE': ROUTES.BOOST.OVERVIEW,
  
  // Settings & Security
  'SECURE': ROUTES.SETTINGS.SECURITY,
  'BACKUP': ROUTES.SETTINGS.BACKUP,
  'CONFIG': ROUTES.SETTINGS.OVERVIEW,
  'TRUST': ROUTES.SETTINGS.SECURITY,
  
  // Quick actions
  'START': ROUTES.ONBOARDING,
  'HOME': ROUTES.DASHBOARD,
  'LEARN': '/docs',
  
  // Additional mappings for components
  'SETTINGS': ROUTES.SETTINGS.OVERVIEW,
  'AUTOMATIONS': ROUTES.BOOST.AUTOMATION,
  'DASHBOARD': ROUTES.DASHBOARD,
  'TRANSACTIONS': ROUTES.PAYMENTS.HISTORY,
  'LIGHTNING_TEST': '/lightning-test',
  
  // Payment actions (for useSmartRedirect compatibility)
  'send-payment': ROUTES.PAYMENTS.SEND,
  'generate-invoice': ROUTES.PAYMENTS.RECEIVE,
  'earnings-analytics': ROUTES.EARNINGS.ANALYTICS,
  'lightning-channels': ROUTES.SETTINGS.WALLET,
  'trust-check': ROUTES.TRUST_CENTER
} as const

// Business-focused labels
export const BUSINESS_LABELS = {
  // Core pillars
  PAYMENTS_HUB: 'Payments Hub',
  NODE_EARNINGS: 'Node Income',
  BUSINESS_BOOST: 'Boost Business',
  CONTROL_CENTER: 'Settings',
  
  // Payment actions
  SEND_MONEY: 'Send Payment',
  RECEIVE_MONEY: 'Get Paid',
  CREATE_INVOICE: 'Request Payment',
  VIEW_HISTORY: 'Payment History',
  
  // Earnings focus
  ROUTING_INCOME: 'Routing Earnings',
  FEE_REVENUE: 'Fee Revenue',
  NODE_PERFORMANCE: 'Node Performance',
  GROWTH_METRICS: 'Growth Analytics',
  
  // Business tools
  AI_ASSISTANTS: 'AI Assistants',
  CLIENT_TOOLS: 'Client Tools',
  AUTOMATION: 'Automation',
  TEMPLATES: 'Templates',
  
  // Value propositions
  SAVE_ON_FEES: 'Save 90% on Fees',
  OWN_YOUR_NODE: 'Own Your Infrastructure',
  SCALE_BUSINESS: 'Scale Your Business',
  SOVEREIGN_PAYMENTS: 'Sovereign Payments'
} as const

// Helper to get business-focused route
export function getBusinessRoute(action: keyof typeof REDIRECT_MAP): string {
  return REDIRECT_MAP[action] || ROUTES.DASHBOARD
}

// Type exports for useSmartRedirect
export type RouteKey = keyof typeof ROUTES | 'PAYMENTS.HUB' | 'PAYMENTS.SEND' | 'PAYMENTS.RECEIVE' | 'PAYMENTS.INVOICES' | 'PAYMENTS.HISTORY' | 'EARNINGS.OVERVIEW' | 'EARNINGS.ROUTING' | 'EARNINGS.FEES' | 'EARNINGS.ANALYTICS' | 'EARNINGS.GROWTH' | 'BOOST.OVERVIEW' | 'BOOST.AI_ASSISTANTS' | 'BOOST.CLIENT_TOOLS' | 'BOOST.TEMPLATES' | 'BOOST.AUTOMATION' | 'SETTINGS.OVERVIEW' | 'SETTINGS.WALLET' | 'SETTINGS.INTEGRATIONS' | 'SETTINGS.SECURITY' | 'SETTINGS.BACKUP' | 'SETTINGS.LNURL'
export type RedirectAction = keyof typeof REDIRECT_MAP
export type PaymentRoute = keyof typeof ROUTES.PAYMENTS
export type EarningsRoute = keyof typeof ROUTES.EARNINGS
export type BoostRoute = keyof typeof ROUTES.BOOST
export type SettingsRoute = keyof typeof ROUTES.SETTINGS

// Functions for useSmartRedirect
export function getRedirectPath(action: RedirectAction): string {
  return REDIRECT_MAP[action] || ROUTES.DASHBOARD
}

export function parseRoute(path: string): { route: string; section?: string } {
  const [route, section] = path.split('#')
  return { route, section }
} 