'use client';

import { memo } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ErrorBoundary } from '../error-boundary';
import { SidebarNav } from '../navigation/sidebar-nav';
import { BreadcrumbNav, PageHeader } from '../navigation/breadcrumb-nav';
import { MobileNav, MobileQuickActions, MobileTopBar } from '../navigation/mobile-nav';
import { routeUtils } from '@/lib/navigation/routes';

interface AppLayoutProps {
  children: React.ReactNode;
  /** Override the page title */
  pageTitle?: string;
  /** Page description */
  pageDescription?: string;
  /** Actions to show in page header */
  pageActions?: React.ReactNode;
  /** Whether to show mobile quick actions */
  showQuickActions?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * AppLayout Component
 * 
 * Main application layout following principles from:
 * - The Phoenix Project: Reliable, self-healing system structure
 * - High Output Management: Clear hierarchy and information flow
 * - Clean Code: Separation of concerns between desktop/mobile
 * - Responsive design: Works across all device types
 */
function AppLayout({
  children,
  pageTitle,
  pageDescription,
  pageActions,
  showQuickActions = true,
  className,
}: AppLayoutProps) {
  const pathname = usePathname();
  
  // Auto-generate page title if not provided
  const autoTitle = pageTitle || getPageTitle(pathname || '/');
  
  // Determine if we should show navigation (hide on auth pages)
  const isAuthPage = (pathname || '').startsWith('/login') || (pathname || '').startsWith('/signup');
  const showNavigation = !isAuthPage;

  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {showNavigation && (
        <>
          {/* Desktop Sidebar */}
          <SidebarNav className="hidden lg:flex" />
          
          {/* Mobile Top Bar */}
          <MobileTopBar 
            title={autoTitle}
            actions={pageActions}
          />
        </>
      )}

      {/* Main Content Area */}
      <main 
        className={cn(
          'transition-all duration-300',
          showNavigation 
            ? 'lg:ml-72 min-h-screen' // Account for sidebar on desktop
            : 'min-h-screen'
        )}
      >
        {/* Desktop Header */}
        {showNavigation && (
          <header className="hidden lg:block sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
            <div className="px-6 py-4">
              <PageHeader
                title={autoTitle}
                description={pageDescription}
                actions={pageActions}
                showBreadcrumbs={true}
              />
            </div>
          </header>
        )}

        {/* Page Content */}
        <div 
          className={cn(
            'px-4 py-6 lg:px-6',
            showNavigation && 'pb-20 lg:pb-6' // Account for mobile nav
          )}
        >
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
      </main>

      {/* Mobile Navigation */}
      {showNavigation && (
        <>
          <MobileNav />
          <MobileQuickActions show={showQuickActions} />
        </>
      )}
    </div>
  );
}

/**
 * Get page title from pathname
 */
function getPageTitle(pathname: string): string {
  const titleMap: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/payments': 'Payments',
    '/payments/send': 'Send Payment',
    '/payments/receive': 'Receive Payment', 
    '/payments/invoices': 'Invoices',
    '/payments/history': 'Transaction History',
    '/earnings': 'Earnings Overview',
    '/earnings/routing': 'Routing Fees',
    '/earnings/fees': 'Fee Analytics',
    '/earnings/growth': 'Growth Analytics',
    '/earnings/network-monitor': 'Network Monitor',
    '/boost': 'Business Boost',
    '/boost/ai-assistants': 'AI Assistants',
    '/boost/btc-training': 'BTC Training',
    '/boost/client-tools': 'Client Tools',
    '/boost/templates': 'Templates',
    '/learn': 'Learning Center',
    '/learn/lightning': 'Lightning Tutorials',
    '/ai-assistant': 'AI Assistant',
    '/settings': 'Settings',
    '/settings/profile': 'Profile Settings',
    '/settings/node': 'Node Settings',
    '/settings/security': 'Security Settings',
    '/simulator': 'Simulator',
    '/trust': 'Trust Center',
  };

  // Try exact match first
  if (titleMap[pathname]) {
    return titleMap[pathname];
  }

  // Try partial matches for dynamic routes
  for (const [route, title] of Object.entries(titleMap)) {
    if (pathname.startsWith(route) && route !== '/') {
      return title;
    }
  }

  // Fallback to formatted pathname
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  return lastSegment 
    ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ')
    : 'Dashboard';
}

// Export as both named and default export
const MemoizedAppLayout = memo(AppLayout);
export { MemoizedAppLayout as AppLayout };
export default MemoizedAppLayout; 