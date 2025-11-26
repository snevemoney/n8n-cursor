/**
 * Centralized Navigation Routes
 * 
 * Following principles from:
 * - Domain Driven Design: Organize by business domain
 * - Clean Code: Single source of truth for routes
 * - High Output Management: Routes reflect system outputs
 */

export const routes = {
  // Core Authentication & Landing
  home: '/',
  login: '/login',
  signup: '/signup',
  onboarding: '/onboarding',

  // Dashboard Hub - Main Operating Center
  dashboard: {
    root: '/dashboard',
    monitor: '/dashboard/monitor',
  },

  // Payments Domain - The Engine
  payments: {
    root: '/payments',
    send: '/payments/send',
    receive: '/payments/receive',
    invoices: '/payments/invoices',
    history: '/payments/history',
    invoice: (id: string) => `/payments/invoices/${id}`,
    transaction: (id: string) => `/payments/history/${id}`,
  },

  // Earnings Domain - The Value Driver
  earnings: {
    root: '/earnings',
    analytics: '/earnings/analytics',
    routing: '/earnings/routing',
    fees: '/earnings/fees',
    growth: '/earnings/growth',
    networkMonitor: '/earnings/network-monitor',
  },

  // Node Operations Domain - The Infrastructure
  node: {
    status: '/dashboard/node/status',
    peers: '/dashboard/node/peers',
    channels: '/dashboard/node/channels',
    liquidity: '/dashboard/node/liquidity',
    peer: (id: string) => `/dashboard/node/peers/${id}`,
    channel: (id: string) => `/dashboard/node/channels/${id}`,
  },

  // Business Enhancement Domain - The Multiplier  
  boost: {
    root: '/boost',
    aiAssistants: '/boost/ai-assistants',
    automation: '/boost/automation',
    btcTraining: '/boost/btc-training',
    clientTools: '/boost/client-tools',
    templates: '/boost/templates',
  },

  // Learning Domain - Knowledge & Growth
  learn: {
    root: '/learn',
    lightning: '/learn/lightning',
    tutorial: (id: string) => `/learn/lightning/${id}`,
    troubleshooting: '/learn/troubleshooting',
    advanced: '/learn/advanced',
  },

  // Settings Domain - Control Center
  settings: {
    root: '/settings',
    profile: '/settings/profile',
    node: '/settings/node',
    security: '/settings/security',
    integrations: '/settings/integrations',
    backup: '/settings/backup',
    feeManagement: '/settings/fee-management',
    autoRebalancer: '/settings/auto-rebalancer',
    systemHealth: '/settings/system-health',
    wallet: '/settings/wallet',
    pricing: '/settings/pricing',
  },

  // Simulator Domain - Testing & Development
  simulator: {
    root: '/simulator',
    loopOut: '/simulate/loop-out',
    openChannel: '/simulate/open-channel',
  },

  // Trust & Compliance Domain
  trust: {
    root: '/trust',
    center: '/trust-center',
  },

  // AI Assistant Domain
  ai: {
    assistant: '/ai-assistant',
    troubleshooter: '/ai-assistant/troubleshooter',
  },

  // API Domains - For programmatic access
  api: {
    // AI Services
    ai: {
      assistant: '/api/ai/assistant',
      loopTroubleshooter: '/api/ai/loop-troubleshooter',
      recommendLiquidity: '/api/ai/recommend-liquidity',
      searchLoop: '/api/ai/search-loop',
    },
    
    // Lightning Services
    lightning: {
      nodeInfo: '/api/lightning/node-info',
      invoiceStatus: (id: string) => `/api/lightning/invoice/status/${id}`,
    },
    
    // Payment Services
    payments: {
      send: '/api/sendPayment',
      lnurlPay: '/api/lnurl-pay/callback',
      lnurlWithdraw: '/api/lnurl-withdraw',
    },
    
    // Tracking & Analytics
    track: {
      feedback: '/api/track/feedback',
      onboarding: '/api/track/onboarding',
    },
    
    // System Health
    system: {
      check: '/api/system-check',
      nodeStatus: '/api/node/status-check',
    },
  },
} as const;

/**
 * Route Utilities
 * Following "Pragmatic Programmer" principles - build tools to reduce friction
 */

export const routeUtils = {
  /**
   * Check if current path matches a route pattern
   */
  isActive: (pathname: string, route: string): boolean => {
    if (route === pathname) return true;
    if (route !== '/' && pathname.startsWith(route)) return true;
    return false;
  },

  /**
   * Get breadcrumb trail for current path
   */
  getBreadcrumbs: (pathname: string): Array<{ label: string; href: string }> => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs: Array<{ label: string; href: string }> = [{ label: 'Dashboard', href: routes.dashboard.root as string }];
    
    let currentPath = '';
    for (const segment of segments) {
      currentPath += `/${segment}`;
      
      // Map common segments to readable labels
      const labelMap: Record<string, string> = {
        dashboard: 'Dashboard',
        payments: 'Payments',
        earnings: 'Earnings',
        boost: 'Business Boost',
        settings: 'Settings',
        learn: 'Learning Center',
        lightning: 'Lightning Network',
        'ai-assistants': 'AI Assistants',
        'fee-management': 'Fee Management',
        'auto-rebalancer': 'Auto Rebalancer',
        'network-monitor': 'Network Monitor',
      };
      
      const label = labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
      breadcrumbs.push({ label, href: currentPath });
    }
    
    return breadcrumbs;
  },

  /**
   * Build query string for filtered routes
   */
  withQuery: (baseRoute: string, params: Record<string, string | number | boolean>): string => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      query.set(key, String(value));
    });
    const queryString = query.toString();
    return queryString ? `${baseRoute}?${queryString}` : baseRoute;
  },

  /**
   * Get route category for styling/grouping
   */
  getCategory: (pathname: string): string => {
    if (pathname.startsWith('/payments')) return 'payments';
    if (pathname.startsWith('/earnings')) return 'earnings';
    if (pathname.startsWith('/boost')) return 'boost';
    if (pathname.startsWith('/settings')) return 'settings';
    if (pathname.startsWith('/learn')) return 'learn';
    if (pathname.startsWith('/dashboard')) return 'dashboard';
    return 'other';
  },
};

/**
 * Navigation Items Configuration
 * Organized by business value, not technical structure
 */
export type NavItem = {
  id: string;
  label: string;
  href: string;
  icon?: string;
  badge?: string;
  description?: string;
  category: string;
};

export const navigationConfig = {
  main: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: routes.dashboard.root,
      icon: 'Home',
      category: 'core',
      description: 'System overview',
    },
    {
      id: 'payments',
      label: 'Payments',
      href: routes.payments.root,
      icon: 'DollarSign',
      category: 'payments',
      description: 'The Engine',
    },
    {
      id: 'earnings',
      label: 'Earnings',
      href: routes.earnings.root,
      icon: 'TrendingUp',
      category: 'earnings',
      description: 'The Value Driver',
      badge: 'New',
    },
    {
      id: 'boost',
      label: 'Business Boost',
      href: routes.boost.root,
      icon: 'Rocket',
      category: 'boost',
      description: 'The Multiplier',
    },
    {
      id: 'learn',
      label: 'Learning Center',
      href: routes.learn.root,
      icon: 'BookOpen',
      category: 'learn',
      description: 'Master Lightning',
    },
  ],
  
  secondary: [
    {
      id: 'settings',
      label: 'Settings',
      href: routes.settings.root,
      icon: 'Settings',
      category: 'settings',
      description: 'Control Center',
    },
    {
      id: 'ai-assistant',
      label: 'AI Assistant',
      href: routes.ai.assistant,
      icon: 'Bot',
      category: 'ai',
      description: 'Smart Help',
    },
  ],
} as const;

/**
 * Type exports for TypeScript autocomplete
 */
export type Routes = typeof routes;
export type RouteUtils = typeof routeUtils; 