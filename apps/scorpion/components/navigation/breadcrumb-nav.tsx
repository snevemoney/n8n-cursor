'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { useMemo, useTransition } from 'react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

/**
 * Breadcrumb Navigation Component
 * 
 * Displays hierarchical navigation path showing user's current location
 * in the application structure.
 */
export function BreadcrumbNav() {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const breadcrumbs = useMemo(() => {
    if (!pathname) return [];

    const segments = pathname.split('/').filter(Boolean);
    const items: BreadcrumbItem[] = [
      { label: 'Home', href: '/' }
    ];

    // Route label mappings for better readability
    const routeLabels: Record<string, string> = {
      'agents': 'Agents',
      'specialized': 'Specialized Agents',
      'create': 'Create Agent',
      'chat': 'Chat AGI',
      'correct': 'Mistake Learning',
      'llm': 'LLM',
      'experiments': 'Experiments',
      'models': 'Models',
      'prompts': 'Prompts',
      'compare': 'Model Compare',
      'knowledge': 'Knowledge',
      'recommendations': 'Recommendations',
      'research': 'Research',
      'screenshots': 'Screenshots',
      'dashboard': 'Dashboard',
      'project': 'Project',
      'ops': 'Operations',
      'workflows': 'Workflows',
      'build': 'Build',
      'council': 'Council',
      'observability': 'Observability',
      'selling': 'Selling',
      'notifications': 'Notifications',
      'logs': 'System Logs',
      'settings': 'Settings',
      'ontology': 'Ontology',
    };

    // Build breadcrumb path from segments
    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Use mapped label if available, otherwise format from segment
      const label = routeLabels[segment] || segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      items.push({
        label,
        href: currentPath
      });
    });

    return items;
  }, [pathname]);

  // Don't show breadcrumbs on home page
  if (!pathname || pathname === '/') {
    return null;
  }

  return (
    <nav 
      className="flex items-center gap-1 text-xs text-white/60 max-md:text-[10px] pointer-events-auto"
      style={{ pointerEvents: 'auto' }}
      aria-label="Breadcrumb"
    >
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;
        
        return (
          <div key={item.href} className="flex items-center gap-1">
            {index === 0 ? (
              <Link
                href={item.href}
                prefetch={true}
                onClick={() => startTransition(() => {})}
                className={`flex items-center gap-1 hover:text-white transition-colors duration-100 pointer-events-auto active:scale-[0.98] ${isPending ? 'opacity-70' : ''}`}
                style={{ pointerEvents: 'auto' }}
              >
                <Home className="max-md:w-3 max-md:h-3 md:w-3 md:h-3 lg:w-3.5 lg:h-3.5" />
                <span className="max-md:hidden md:inline">{item.label}</span>
              </Link>
            ) : (
              <>
                <ChevronRight className="max-md:w-2.5 max-md:h-2.5 md:w-2.5 md:h-2.5 lg:w-3 lg:h-3 text-white/30" />
                {isLast ? (
                  <span className="text-white/90 font-medium max-md:truncate md:truncate">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    prefetch={true}
                    onClick={() => startTransition(() => {})}
                    className={`hover:text-white transition-colors duration-100 max-md:truncate md:truncate pointer-events-auto active:scale-[0.98] ${isPending ? 'opacity-70' : ''}`}
                    style={{ pointerEvents: 'auto' }}
                  >
                    {item.label}
                  </Link>
                )}
              </>
            )}
          </div>
        );
      })}
    </nav>
  );
}

