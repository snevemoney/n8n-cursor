'use client';

import { memo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { NavItem, NavSection, NavDivider } from './nav-item';
import { routes, routeUtils } from '@/lib/navigation/routes';
import { 
  Menu, 
  X, 
  Home,
  DollarSign,
  TrendingUp,
  Rocket,
  BookOpen,
  Settings,
  Bot,
  Zap,
  Send,
  Download,
  Receipt,
  History,
  BarChart3,
  Route,
  Coins,
  Target,
  Wrench,
  FileText,
  Shield,
  Network,
  Users,
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SidebarNavProps {
  /** Whether sidebar starts collapsed */
  defaultCollapsed?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * SidebarNav Component
 * 
 * Applies principles from:
 * - High Output Management: Organize by business outputs (Engine, Value Driver, Multiplier)
 * - Clean Code: Clear section separation and consistent patterns
 * - Domain Driven Design: Group by business domains, not technical structure
 * - The Sovereign Individual: Emphasize user autonomy and control
 */
export const SidebarNav = memo(function SidebarNav({
  defaultCollapsed = false,
  className,
}: SidebarNavProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  // Core navigation structure organized by business value
  const navigationSections = [
    {
      id: 'core',
      title: 'Command Center',
      description: 'Mission Control',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          href: routes.dashboard.root,
          icon: 'Home' as const,
          description: 'System overview and status',
        },
      ],
    },
    {
      id: 'payments',
      title: 'Payments Hub',
      description: 'The Engine',
      items: [
        {
          id: 'send',
          label: 'Send Payment',
          href: routes.payments.send,
          icon: 'Send' as const,
          description: 'Pay anyone instantly via Lightning',
        },
        {
          id: 'receive',
          label: 'Get Paid',
          href: routes.payments.receive,
          icon: 'Download' as const,
          description: 'Create invoices & payment requests',
        },
        {
          id: 'invoices',
          label: 'Invoices',
          href: routes.payments.invoices,
          icon: 'Receipt' as const,
          description: 'Manage payment requests',
        },
        {
          id: 'history',
          label: 'Transaction History',
          href: routes.payments.history,
          icon: 'History' as const,
          description: 'View all payments & receipts',
        },
      ],
    },
    {
      id: 'earnings',
      title: 'Node Income',
      description: 'The Value Driver',
      badge: '$247',
      items: [
        {
          id: 'earnings-overview',
          label: 'Earnings Overview',
          href: routes.earnings.root,
          icon: 'BarChart3' as const,
          description: 'Total revenue & growth metrics',
        },
        {
          id: 'routing-income',
          label: 'Routing Fees',
          href: routes.earnings.routing,
          icon: 'Route' as const,
          description: 'Income from routing payments',
        },
        {
          id: 'network-monitor',
          label: 'Network Monitor',
          href: routes.earnings.networkMonitor,
          icon: 'Network' as const,
          description: 'Lightning network status',
          badge: 'Live',
        },
        {
          id: 'fee-revenue',
          label: 'Fee Analytics',
          href: routes.earnings.fees,
          icon: 'Coins' as const,
          description: 'Transaction fee earnings',
        },
      ],
    },
    {
      id: 'node',
      title: 'Node Operations',
      description: 'The Infrastructure',
      items: [
        {
          id: 'node-peers',
          label: 'Peers',
          href: routes.node.peers,
          icon: 'Users' as const,
          description: 'Connected Lightning nodes',
        },
        {
          id: 'node-channels',
          label: 'Channels',
          href: routes.node.channels,
          icon: 'Activity' as const,
          description: 'Payment channel management',
        },
        {
          id: 'node-liquidity',
          label: 'Liquidity',
          href: routes.node.liquidity,
          icon: 'Zap' as const,
          description: 'Channel balance optimization',
        },
      ],
    },
    {
      id: 'boost',
      title: 'Business Boost',
      description: 'The Multiplier',
      items: [
        {
          id: 'ai-assistants',
          label: 'AI Assistants',
          href: routes.boost.aiAssistants,
          icon: 'Bot' as const,
          description: 'Automate with AI agents',
          badge: 'Beta',
        },
        {
          id: 'btc-training',
          label: 'BTC Training',
          href: routes.boost.btcTraining,
          icon: 'Target' as const,
          description: 'Bitcoin mindset training',
        },
        {
          id: 'client-tools',
          label: 'Client Tools',
          href: routes.boost.clientTools,
          icon: 'Wrench' as const,
          description: 'Tools for your customers',
        },
        {
          id: 'templates',
          label: 'Templates',
          href: routes.boost.templates,
          icon: 'FileText' as const,
          description: 'Business automation templates',
        },
      ],
    },
    {
      id: 'learn',
      title: 'Learning Center',
      description: 'Master Lightning',
      items: [
        {
          id: 'lightning-tutorials',
          label: 'Lightning Tutorials',
          href: routes.learn.lightning,
          icon: 'BookOpen' as const,
          description: 'Interactive Lightning Network guides',
        },
        {
          id: 'ai-assistant-help',
          label: 'AI Assistant',
          href: routes.ai.assistant,
          icon: 'Bot' as const,
          description: 'Get smart help & troubleshooting',
        },
      ],
    },
  ];

  const secondaryItems = [
    {
      id: 'settings',
      label: 'Settings',
      href: routes.settings.root,
      icon: 'Settings' as const,
      description: 'Control Center - system configuration',
    },
  ];

  // Toggle functions
  const toggleCollapsed = () => setIsCollapsed(!isCollapsed);
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={toggleMobile}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full bg-card border-r border-border',
          'transition-all duration-300 ease-in-out',
          'lg:relative lg:z-auto',
          // Desktop width management
          isCollapsed ? 'w-16' : 'w-72',
          // Mobile positioning
          isMobileOpen 
            ? 'translate-x-0 w-72' 
            : '-translate-x-full lg:translate-x-0',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Lightning AI</h2>
                <p className="text-xs text-muted-foreground">Sovereign Node</p>
              </div>
            </div>
          )}
          
          {/* Desktop collapse toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapsed}
            className="hidden lg:flex"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
          
          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation content */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-6">
            {/* Main navigation sections */}
            {navigationSections.map((section) => (
              <NavSection
                key={section.id}
                title={isCollapsed ? undefined : section.title}
                description={isCollapsed ? undefined : section.description}
                className="space-y-1"
              >
                {section.items.map((item) => (
                  <NavItem
                    key={item.id}
                    id={item.id}
                    label={isCollapsed ? '' : item.label}
                    href={item.href}
                    icon={item.icon}
                    badge={(item as any).badge}
                    description={item.description}
                    variant={isCollapsed ? 'minimal' : 'default'}
                    size={isCollapsed ? 'sm' : 'md'}
                    className={isCollapsed ? 'justify-center px-3' : ''}
                  />
                ))}
                
                {/* Section badge for earnings */}
                {section.badge && !isCollapsed && (
                  <div className="px-3 py-1">
                    <Badge variant="secondary" className="text-xs">
                      {section.badge}
                    </Badge>
                  </div>
                )}
              </NavSection>
            ))}

            <NavDivider />

            {/* Secondary navigation */}
            <NavSection title={isCollapsed ? undefined : 'System'}>
              {secondaryItems.map((item) => (
                <NavItem
                  key={item.id}
                  id={item.id}
                  label={isCollapsed ? '' : item.label}
                  href={item.href}
                  icon={item.icon}
                  description={item.description}
                  variant={isCollapsed ? 'minimal' : 'default'}
                  size={isCollapsed ? 'sm' : 'md'}
                  className={isCollapsed ? 'justify-center px-3' : ''}
                />
              ))}
            </NavSection>
          </nav>
        </ScrollArea>

        {/* Footer status */}
        {!isCollapsed && (
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Node online</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
});

export default SidebarNav; 