'use client';

import { memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { routeUtils } from '@/lib/navigation/routes';
import * as Icons from 'lucide-react';

interface NavItemProps {
  /** Unique identifier for the nav item */
  id: string;
  /** Display label */
  label: string;
  /** Navigation path */
  href: string;
  /** Lucide icon name */
  icon?: keyof typeof Icons;
  /** Optional badge text */
  badge?: string;
  /** Helper description for tooltips */
  description?: string;
  /** Visual variant */
  variant?: 'default' | 'compact' | 'minimal';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Force active state (useful for nested routes) */
  forceActive?: boolean;
  /** Click handler for analytics or custom behavior */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * NavItem Component
 * 
 * A clean, reusable navigation item that follows:
 * - Single Responsibility: Only handles navigation item rendering
 * - Clean Code: Clear prop names and predictable behavior
 * - Pragmatic Programmer: Composable and flexible design
 */
export const NavItem = memo(function NavItem({
  id,
  label,
  href,
  icon,
  badge,
  description,
  variant = 'default',
  size = 'md',
  forceActive = false,
  onClick,
  className,
}: NavItemProps) {
  const pathname = usePathname();
  const isActive = forceActive || routeUtils.isActive(pathname || '/', href);
  
  // Dynamic icon rendering
  const IconComponent = icon ? Icons[icon] as any : null;
  
  // Size-based styling
  const sizeClasses = {
    sm: 'px-2 py-1.5 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };
  
  // Variant-based styling
  const variantClasses = {
    default: 'rounded-lg transition-all duration-200',
    compact: 'rounded-md transition-colors duration-150',
    minimal: 'transition-colors duration-150',
  };
  
  // Icon sizes based on component size
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };
  
  // Active state styling
  const activeClasses = isActive
    ? 'bg-primary/10 text-primary border-primary/20'
    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50';
  
  const baseClasses = cn(
    'flex items-center gap-3 font-medium border border-transparent',
    'focus:outline-none focus:ring-2 focus:ring-primary/20',
    sizeClasses[size],
    variantClasses[variant],
    activeClasses,
    className
  );

  const content = (
    <>
      {IconComponent && (
        <IconComponent className={cn(iconSizes[size], 'flex-shrink-0')} />
      )}
      
      <span className="flex-1 truncate">{label}</span>
      
      {badge && (
        <Badge 
          variant={isActive ? 'default' : 'secondary'} 
          className="text-xs"
        >
          {badge}
        </Badge>
      )}
    </>
  );

  const handleClick = () => {
    onClick?.();
    
    // Analytics tracking (following High Output Management - measure what matters)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'navigation_click', {
        nav_item_id: id,
        nav_item_label: label,
        nav_item_href: href,
        nav_is_external: href.startsWith('http')
      });
    }
  };

  return (
    <Link
      href={href}
      className={baseClasses}
      onClick={handleClick}
      title={description || label}
      data-nav-item={id}
      aria-current={isActive ? 'page' : undefined}
    >
      {content}
    </Link>
  );
});

/**
 * NavSection Component
 * 
 * Groups related navigation items with an optional header
 */
interface NavSectionProps {
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Child nav items */
  children: React.ReactNode;
  /** Whether section is collapsible */
  collapsible?: boolean;
  /** Initial collapsed state */
  defaultCollapsed?: boolean;
  /** Custom styling */
  className?: string;
}

export const NavSection = memo(function NavSection({
  title,
  description,
  children,
  collapsible = false,
  defaultCollapsed = false,
  className,
}: NavSectionProps) {
  return (
    <div className={cn('space-y-1', className)}>
      {title && (
        <div className="px-3 py-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-muted-foreground/70 mt-1">
              {description}
            </p>
          )}
        </div>
      )}
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
});

/**
 * NavDivider Component
 * 
 * Simple visual separator for navigation sections
 */
export const NavDivider = memo(function NavDivider({ 
  className 
}: { 
  className?: string 
}) {
  return (
    <div 
      className={cn('h-px bg-border mx-3 my-2', className)}
      role="separator" 
    />
  );
});

export default NavItem; 