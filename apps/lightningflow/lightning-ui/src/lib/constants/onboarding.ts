/**
 * Lightning AI Node Platform - Onboarding Constants
 * 
 * Configuration and constants for the Apple-style onboarding flow
 */

export const ONBOARDING_STEPS = [
  'start',
  'create',
  'name',
  'preferences', 
  'check',
  'tour',
  'finish'
] as const

export type OnboardingStep = typeof ONBOARDING_STEPS[number]

export const STEP_TITLES: Record<OnboardingStep, string> = {
  start: 'Welcome',
  create: 'Create Account',
  name: 'Name Your Workspace',
  preferences: 'Preferences',
  check: 'System Check',
  tour: 'Workspace Tour',
  finish: 'Ready to Launch'
}

export const USE_CASES = [
  {
    id: 'freelance',
    title: 'Freelance',
    description: 'Individual contractor or consultant',
    features: ['Invoice management', 'Time tracking', 'Client portal']
  },
  {
    id: 'small-business',
    title: 'Small Business',
    description: 'Local business or startup',
    features: ['Point of sale', 'Inventory', 'Customer management']
  },
  {
    id: 'agency',
    title: 'Agency',
    description: 'Creative or marketing agency',
    features: ['Project management', 'Team collaboration', 'Client billing']
  },
  {
    id: 'coach',
    title: 'Coach / Content Creator',
    description: 'Educator, coach, or content creator',
    features: ['Course sales', 'Subscription management', 'Content delivery']
  },
  {
    id: 'developer',
    title: 'Developer',
    description: 'Software developer or tech professional',
    features: ['API monetization', 'SaaS billing', 'Developer tools']
  },
  {
    id: 'exploring',
    title: 'Just Exploring',
    description: 'Learning about Lightning Network',
    features: ['Educational content', 'Safe testing', 'Guided tutorials']
  }
] as const

export const WORKSPACE_NAME_SUGGESTIONS = [
  'My Lightning Node',
  'Creator Vault',
  'Bitcoin Ops',
  'Pluto Hub',
  'Lightning Studio',
  'Sovereign Node',
  'Digital Mint',
  'Thunder Bay',
  'Satoshi Station',
  'Lightning Labs',
  'Crypto Command',
  'Bitcoin Base',
  'Lightning Forge',
  'Digital Depot',
  'Satoshi Studio'
] as const

export const TOUR_FEATURES = [
  {
    id: 'command',
    title: 'Command Center',
    description: 'Track your revenue, automations, and node status',
    appleTerm: 'Command',
    originalTerm: 'Dashboard'
  },
  {
    id: 'payments',
    title: 'Pay & Request',
    description: 'Send and receive Lightning payments instantly',
    appleTerm: 'Pay / Request',
    originalTerm: 'Send / Receive'
  },
  {
    id: 'ai',
    title: 'Ask AI',
    description: 'Get help, make decisions, and automate your workflow',
    appleTerm: 'Ask',
    originalTerm: 'AI Assistant'
  },
  {
    id: 'automations',
    title: 'Automations',
    description: 'AI agents that work for your business 24/7',
    appleTerm: 'Automations',
    originalTerm: 'AI Agents'
  },
  {
    id: 'verify',
    title: 'Verify Center',
    description: 'Cryptographic proof of every action on your node',
    appleTerm: 'Verify',
    originalTerm: 'Trust Center'
  }
] as const

export const SYSTEM_CHECKS = [
  {
    id: 'auth',
    name: 'Authentication',
    description: 'Supabase auth connection',
    critical: true
  },
  {
    id: 'lightning',
    name: 'Lightning Network',
    description: 'Node connectivity and LNbits integration',
    critical: false
  },
  {
    id: 'database',
    name: 'Database',
    description: 'Data storage and sync',
    critical: true
  },
  {
    id: 'browser',
    name: 'Browser Features',
    description: 'LocalStorage and JavaScript support',
    critical: true
  }
] as const

export const ONBOARDING_STORAGE_KEYS = {
  COMPLETION: 'lightning-onboarding-complete',
  NODE_DATA: 'lightning-node-data',
  CURRENT_STEP: 'lightning-onboarding-step',
  PREFERENCES: 'lightning-onboarding-preferences'
} as const

export const DEFAULT_ONBOARDING_DATA = {
  nodeName: '',
  useCase: 'exploring',
  aiAutomation: true,
  testMode: true,
  emailAlerts: true,
  email: '',
  password: ''
} as const 