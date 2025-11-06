'use client';

import { memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { routeUtils } from '@/lib/navigation/routes';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
  isActive?: boolean;
}

interface BreadcrumbNavProps {
  /** Custom breadcrumb items (overrides auto-generation) */
  items?: BreadcrumbItem[];
  /** Whether to show home icon */
  showHome?: boolean;
  /** Custom separator */
  separator?: React.ReactNode;
  /** Maximum number of items to show */
  maxItems?: number;
  /** Custom className */
  className?: string;
}

/**
 * BreadcrumbNav Component
 * 
 * Follows principles from:
 * - Clean Code: Clear, predictable behavior
 * - High Output Management: Shows user their position in the system hierarchy
 * - UX Best Practices: Helps users understand and navigate system structure
 */
export const BreadcrumbNav = memo(function BreadcrumbNav({
  items,
  showHome = true,
  separator = <ChevronRight className="h-4 w-4 text-muted-foreground" />,
  maxItems = 5,
  className,
}: BreadcrumbNavProps) {
  const pathname = usePathname();
  
  // Auto-generate breadcrumbs if not provided
  const breadcrumbItems = items || routeUtils.getBreadcrumbs(pathname || '/');
  
  // Truncate items if too many
  const displayItems = breadcrumbItems.length > maxItems
    ? [
        breadcrumbItems[0],
        { label: '...', href: '#', isActive: false },
        ...breadcrumbItems.slice(-(maxItems - 2))
      ]
    : breadcrumbItems;

  // Mark the last item as active
  const itemsWithActive = displayItems.map((item, index) => ({
    ...item,
    isActive: index === displayItems.length - 1,
  }));

  if (itemsWithActive.length <= 1) {
    return null; // Don't show breadcrumbs for single items
  }

  return (
    <nav 
      aria-label="Breadcrumb"
      className={cn('flex items-center space-x-1 text-sm', className)}
    >
      {/* Home icon if enabled */}
      {showHome && (
        <>
          <Link
            href="/"
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
            title="Go to dashboard"
          >
            <Home className="h-4 w-4" />
          </Link>
          {breadcrumbItems.length > 0 && (
            <span className="text-muted-foreground">{separator}</span>
          )}
        </>
      )}

      {/* Breadcrumb items */}
      {itemsWithActive.map((item, index) => (
        <div key={`${item.href}-${index}`} className="flex items-center">
          {index > 0 && (
            <span className="text-muted-foreground mr-1">{separator}</span>
          )}
          
          {item.isActive ? (
            <span 
              className="font-medium text-foreground"
              aria-current="page"
            >
              {item.label}
            </span>
          ) : item.label === '...' ? (
            <span className="text-muted-foreground">...</span>
          ) : (
            <Link
              href={item.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title={`Go to ${item.label}`}
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
});

/**
 * PageHeader Component
 * 
 * Combines breadcrumbs with page title and actions
 */
interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Page description */
  description?: string;
  /** Actions to show on the right */
  actions?: React.ReactNode;
  /** Custom breadcrumb items */
  breadcrumbItems?: BreadcrumbItem[];
  /** Whether to show breadcrumbs */
  showBreadcrumbs?: boolean;
  /** Custom className */
  className?: string;
}

export const PageHeader = memo(function PageHeader({
  title,
  description,
  actions,
  breadcrumbItems,
  showBreadcrumbs = true,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-4 pb-6', className)}>
      {/* Breadcrumbs */}
      {showBreadcrumbs && (
        <BreadcrumbNav items={breadcrumbItems} />
      )}
      
      {/* Title and actions */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
});

/**
 * ContextualNav Component
 * 
 * Shows related pages and quick actions based on current context
 */
interface ContextualNavProps {
  /** Current context (e.g., 'payments', 'earnings') */
  context?: string;
  /** Quick action buttons */
  quickActions?: Array<{
    label: string;
    href: string;
    icon?: React.ReactNode;
    variant?: 'default' | 'secondary' | 'ghost';
  }>;
  /** Custom className */
  className?: string;
}

export const ContextualNav = memo(function ContextualNav({
  context,
  quickActions,
  className,
}: ContextualNavProps) {
  if (!quickActions || quickActions.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {quickActions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant || 'ghost'}
          size="sm"
          asChild
        >
          <Link href={action.href}>
            {action.icon}
            {action.label}
          </Link>
        </Button>
      ))}
    </div>
  );
});

export default BreadcrumbNav; 