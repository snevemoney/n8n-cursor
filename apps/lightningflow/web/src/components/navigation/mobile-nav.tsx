'use client';

import { memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { routes, routeUtils } from '@/lib/navigation/routes';
import {
  Home,
  Send,
  Download,
  BarChart3,
  Settings,
  Bot,
  DollarSign,
  Zap,
} from 'lucide-react';

interface MobileNavProps {
  /** Custom className */
  className?: string;
}

/**
 * MobileNav Component
 * 
 * Mobile-first navigation following principles from:
 * - High Output Management: Show only the highest-impact actions
 * - Clean Code: Simple, predictable interface
 * - User-centered design: Easy thumb navigation
 */
export const MobileNav = memo(function MobileNav({
  className,
}: MobileNavProps) {
  const pathname = usePathname();

  // Core mobile navigation items - maximum 5 for thumb accessibility
  const mobileNavItems = [
    {
      id: 'dashboard',
      label: 'Home',
      href: routes.dashboard.root,
      icon: Home,
      description: 'Dashboard overview',
    },
    {
      id: 'send',
      label: 'Send',
      href: routes.payments.send,
      icon: Send,
      description: 'Send payment',
    },
    {
      id: 'receive',
      label: 'Receive',
      href: routes.payments.receive,
      icon: Download,
      description: 'Get paid',
    },
    {
      id: 'earnings',
      label: 'Earnings',
      href: routes.earnings.root,
      icon: BarChart3,
      description: 'View earnings',
      badge: '$247',
    },
    {
      id: 'settings',
      label: 'Settings',
      href: routes.settings.root,
      icon: Settings,
      description: 'System settings',
    },
  ];

  return (
    <nav 
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 md:hidden',
        'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        'border-t border-border',
        className
      )}
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around px-2 py-2">
        {mobileNavItems.map((item) => {
          const isActive = routeUtils.isActive(pathname || '/', item.href);
          const IconComponent = item.icon;
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center',
                'min-w-0 flex-1 px-2 py-3 text-center',
                'transition-colors duration-200',
                'focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title={item.description}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative">
                <IconComponent 
                  className={cn(
                    'h-5 w-5 mb-1',
                    isActive && 'text-primary'
                  )} 
                />
                {item.badge && (
                  <Badge 
                    className="absolute -top-2 -right-2 h-4 px-1 text-xs"
                    variant={isActive ? 'default' : 'secondary'}
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <span 
                className={cn(
                  'text-xs font-medium truncate max-w-full',
                  isActive && 'text-primary'
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
});

/**
 * MobileQuickActions Component
 * 
 * Floating action buttons for critical mobile actions
 */
interface MobileQuickActionsProps {
  /** Whether to show the quick actions */
  show?: boolean;
  /** Custom className */
  className?: string;
}

export const MobileQuickActions = memo(function MobileQuickActions({
  show = true,
  className,
}: MobileQuickActionsProps) {
  const pathname = usePathname();

  // Don't show on certain pages to reduce clutter
  const hiddenPaths = ['/payments/send', '/payments/receive'];
  const shouldHide = hiddenPaths.some(path => (pathname || '').startsWith(path));

  if (!show || shouldHide) {
    return null;
  }

  return (
    <div 
      className={cn(
        'fixed right-4 bottom-20 z-40 md:hidden',
        'flex flex-col gap-3',
        className
      )}
    >
      {/* Quick Send */}
      <Link
        href={routes.payments.send}
        className={cn(
          'w-12 h-12 rounded-full bg-primary text-primary-foreground',
          'flex items-center justify-center shadow-lg',
          'hover:bg-primary/90 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary/20'
        )}
        title="Quick send payment"
      >
        <Send className="h-5 w-5" />
      </Link>

      {/* Quick Receive */}
      <Link
        href={routes.payments.receive}
        className={cn(
          'w-12 h-12 rounded-full bg-green-600 text-white',
          'flex items-center justify-center shadow-lg',
          'hover:bg-green-600/90 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-green-600/20'
        )}
        title="Quick receive payment"
      >
        <Download className="h-5 w-5" />
      </Link>
    </div>
  );
});

/**
 * MobileTopBar Component
 * 
 * Minimal top bar for mobile with essential status
 */
interface MobileTopBarProps {
  /** Page title */
  title?: string;
  /** Whether to show node status */
  showStatus?: boolean;
  /** Custom actions */
  actions?: React.ReactNode;
  /** Custom className */
  className?: string;
}

export const MobileTopBar = memo(function MobileTopBar({
  title,
  showStatus = true,
  actions,
  className,
}: MobileTopBarProps) {
  return (
    <header 
      className={cn(
        'sticky top-0 z-40 md:hidden',
        'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        'border-b border-border px-4 py-3',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* App logo/title */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
              <Zap className="h-3 w-3 text-white" />
            </div>
            {title && (
              <h1 className="text-lg font-semibold truncate">{title}</h1>
            )}
          </div>
        </div>

        {/* Status and actions */}
        <div className="flex items-center gap-3">
          {showStatus && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="hidden sm:inline">Online</span>
            </div>
          )}
          
          {actions}
        </div>
      </div>
    </header>
  );
});

export default MobileNav; 