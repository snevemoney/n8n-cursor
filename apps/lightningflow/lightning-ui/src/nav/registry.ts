export type NavItem = { 
  label: string; 
  href: string; 
  flag?: string; 
  role?: string;
  description?: string;
  icon?: string;
  badge?: string;
};

export const NAV: NavItem[] = [
  { 
    label: "Dashboard", 
    href: "/dashboard",
    description: "Overview of your Lightning node"
  },
  { 
    label: "Send Payment", 
    href: "/payments/send",
    description: "Pay anyone instantly"
  },
  { 
    label: "Get Paid", 
    href: "/payments/receive",
    description: "Create invoices & requests"
  },
  { 
    label: "Payment History", 
    href: "/payments/history",
    description: "View all transactions"
  },
  { 
    label: "Earnings Overview", 
    href: "/earnings",
    description: "Total revenue & growth"
  },
  { 
    label: "Routing Income", 
    href: "/earnings/routing",
    description: "Fees from routing payments"
  },
  { 
    label: "Network Monitor", 
    href: "/earnings/network-monitor",
    description: "Lightning network status",
    badge: "New"
  },
  { 
    label: "AI Assistants", 
    href: "/boost/ai-assistants",
    description: "Automate with AI",
    badge: "New"
  },
  { 
    label: "BTC Training", 
    href: "/boost/btc-training",
    description: "Bitcoin mindset training",
    badge: "New"
  },
  { 
    label: "Client Tools", 
    href: "/boost/client-tools",
    description: "Tools for your customers"
  },
  { 
    label: "Templates", 
    href: "/boost/templates",
    description: "Pre-built workflows"
  },
  { 
    label: "Automation", 
    href: "/boost/automation",
    description: "Workflow automation"
  },
  { 
    label: "Wallet Settings", 
    href: "/settings/wallet",
    description: "Node & wallet settings"
  },
  { 
    label: "Security", 
    href: "/settings/security",
    description: "Trust center & proofs"
  },
  { 
    label: "Integrations", 
    href: "/settings/integrations",
    description: "API keys & connections"
  },
  { 
    label: "Backup", 
    href: "/settings/backup",
    description: "Secure backups"
  },
  { 
    label: "Fee Management", 
    href: "/settings/fee-management",
    description: "Manage transaction fees"
  },
  { 
    label: "Trust Center", 
    href: "/trust-center",
    description: "Proofs & verification"
  },
  { 
    label: "AI Assistant", 
    href: "/ai-assistant",
    description: "Get help with tasks"
  },
  { 
    label: "Simulator", 
    href: "/simulator",
    description: "Test Lightning operations"
  }
];

// Group navigation items by section
export const NAV_SECTIONS = {
  payments: {
    title: "Payments Hub",
    description: "The Engine",
    items: NAV.filter(item => 
      item.href.includes('/payments/') || item.href === '/payments'
    )
  },
  earnings: {
    title: "Node Income", 
    description: "The Value Driver",
    items: NAV.filter(item => 
      item.href.includes('/earnings/') || item.href === '/earnings'
    )
  },
  boost: {
    title: "Boost Business",
    description: "The Multiplier", 
    items: NAV.filter(item => 
      item.href.includes('/boost/') || item.href === '/boost'
    )
  },
  settings: {
    title: "Control Center",
    description: "The Defense System",
    items: NAV.filter(item => 
      item.href.includes('/settings/') || item.href === '/settings'
    )
  },
  tools: {
    title: "Tools & Utilities",
    description: "Additional Features",
    items: NAV.filter(item => 
      ['/trust-center', '/ai-assistant', '/simulator'].includes(item.href)
    )
  }
};
