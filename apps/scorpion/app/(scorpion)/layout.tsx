'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo, useRef, useTransition } from 'react';
import { ErrorBoundary } from '@/components/scorpion/ErrorBoundary';
import { ToastProvider } from '@/components/scorpion';
import { StorageModeIndicator } from '@/components/scorpion/StorageModeIndicator';
import { ErrorOverlay } from './components/ErrorOverlay';
import { NavLink } from '@/components/navigation/nav-link';
import { BreadcrumbNav } from '@/components/navigation/breadcrumb-nav';
import {
  Home,
  LayoutDashboard,
  FolderKanban,
  Settings2,
  Workflow,
  Hammer,
  Database,
  BookOpen,
  Network,
  Search,
  Camera,
  Users,
  Bot,
  MessageSquare,
  Brain,
  Sparkles,
  BarChart3,
  Eye,
  ShoppingCart,
  Bell,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  List,
  Plus,
  Sliders,
  Activity,
  GitBranch,
  Wrench,
  type LucideIcon
} from 'lucide-react';

interface NavSection {
  title: string;
  items: Array<{
    href: string;
    label: string;
    icon: LucideIcon;
  }>;
}

const navigationSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { href: '/', label: 'Home', icon: Home },
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Core Operations',
    items: [
      { href: '/project', label: 'Planner', icon: FolderKanban },
      { href: '/council', label: 'Council', icon: Users },
      { href: '/tools', label: 'Tools', icon: Wrench },
      { href: '/knowledge', label: 'Knowledge', icon: BookOpen },
    ],
  },
  {
    title: 'Project & Ops',
    items: [
      { href: '/ops', label: 'Operations', icon: Network },
      { href: '/ops/council-analytics', label: 'Council Analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'Automation',
    items: [
      { href: '/workflows', label: 'Workflows', icon: Workflow },
      { href: '/build', label: 'Build', icon: Hammer },
    ],
  },
  {
    title: 'Research',
    items: [
      { href: '/knowledge/recommendations', label: 'Recommendations', icon: Sparkles },
      { href: '/ontology', label: 'Ontology', icon: Database },
      { href: '/research', label: 'Research', icon: Search },
    ],
  },
  {
    title: 'Academy',
    items: [
      { href: '/academy/ai-foundations', label: 'AI Foundations', icon: BookOpen },
      { href: '/academy/origins-of-genai', label: 'Origins of Generative AI', icon: Sparkles },
      { href: '/academy/prompting-basics', label: 'Prompting Essentials', icon: FileText },
      { href: '/academy/ai-for-data', label: 'AI for Excel & Data', icon: Database },
    ],
  },
  {
    title: 'AI & Agents',
    items: [
      { href: '/agents', label: 'Agents', icon: Bot },
      { href: '/agents/specialized', label: 'Specialized', icon: Sparkles },
      { href: '/agents/create', label: 'Create Agent', icon: Plus },
      { href: '/chat', label: 'Chat', icon: MessageSquare },
      { href: '/llm/experiments', label: 'LLM Experiments', icon: Brain },
      { href: '/llm/models', label: 'LLM Models', icon: List },
      { href: '/llm/compare', label: 'Model Compare', icon: GitBranch },
      { href: '/llm/prompts', label: 'LLM Prompts', icon: FileText },
    ],
  },
  {
    title: 'Monitoring & Business',
    items: [
      { href: '/observability', label: 'Observability', icon: Eye },
      { href: '/observatory', label: 'Observatory', icon: Brain },
      { href: '/selling', label: 'Selling', icon: ShoppingCart },
    ],
  },
  {
    title: 'System',
    items: [
      { href: '/control-panel', label: 'Control Panel', icon: Sliders },
      { href: '/diagnostics', label: 'Diagnostics', icon: Activity },
      { href: '/ops/scorpion', label: 'Scorpion Diagnostics', icon: GitBranch },
      { href: '/notifications', label: 'Notifications', icon: Bell },
      { href: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

// Throttle function for resize events
function throttle<T extends (...args: any[]) => void>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout | null = null;
  let previous = 0;
  return ((...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = wait - (now - previous);
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func(...args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = null;
        func(...args);
      }, remaining);
    }
  }) as T;
}

// Debounce function for localStorage writes
function debounce<T extends (...args: any[]) => void>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout | null = null;
  return ((...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

// SIMPLIFIED LAYOUT - Remove most hooks
export default function ScorpionLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Minimal error handler - only essential suppression
  useEffect(() => {
    const originalWindowError = window.onerror;
    window.onerror = function (msg, url, line, col, error) {
      const msgStr = String(msg || '').toLowerCase();
      if (msgStr.includes('nextjs') || msgStr.includes('portal') || msgStr.includes('__next') ||
        msgStr.includes('element not found') || msgStr.includes('script failed')) {
        return true;
      }
      if (originalWindowError) return originalWindowError.apply(this, arguments as any);
      return false;
    };

    return () => {
      window.onerror = originalWindowError;
    };
  }, []);

  // Removed heavy portal handling - handled by root layout script instead

  // Load sidebar state from localStorage on mount and set mounted flag
  // Always start closed - user can manually open if needed
  useEffect(() => {
    setMounted(true);
    // Always start with sidebar closed on page load
    setSidebarOpen(false);
    localStorage.setItem('scorpion-sidebar-open', 'false');
  }, []);

  // Removed heavy sidebar button hiding - not critical for performance


  // Close sidebar when clicking in main content area (all screen sizes)
  useEffect(() => {
    if (!sidebarOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Check if click is outside sidebar and not on sidebar toggle buttons
      const isOutsideSidebar = !target.closest('aside');
      const isNotSidebarButton = !target.closest('button[aria-label*="sidebar"]') &&
        !target.closest('button[aria-label*="Toggle"]') &&
        !target.closest('button[aria-label*="Collapse"]') &&
        !target.closest('button[aria-label*="Expand"]');

      // Check if click is in the main content area
      const isInMainContent = target.closest('main');

      // Check if the target itself is an interactive element (not just closest)
      // This allows clicking on empty space between/around links/buttons
      const targetTag = target.tagName.toLowerCase();
      const isTargetInteractive = targetTag === 'button' ||
        targetTag === 'a' ||
        targetTag === 'input' ||
        targetTag === 'textarea' ||
        targetTag === 'select' ||
        target.getAttribute('role') === 'button' ||
        target.getAttribute('role') === 'link' ||
        target.getAttribute('role') === 'combobox' ||
        target.getAttribute('role') === 'option' ||
        target.closest('button, a[href], input, textarea, select, [role="button"], [role="link"]');

      // Collapse sidebar when clicking in main content area on non-interactive elements
      if (isOutsideSidebar && isNotSidebarButton && isInMainContent && !isTargetInteractive) {
        setSidebarOpen(false);
        localStorage.setItem('scorpion-sidebar-open', 'false');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen(prev => {
      const newState = !prev;
      localStorage.setItem('scorpion-sidebar-open', String(newState));
      return newState;
    });
  };

  // Auto-hide sidebar when navigating to a new page or on initial load
  useEffect(() => {
    if (pathname) {
      setSidebarOpen(false);
      localStorage.setItem('scorpion-sidebar-open', 'false');
    }
  }, [pathname]); // Close sidebar whenever pathname changes (including initial load)

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden" suppressHydrationWarning>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={toggleSidebar}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0f1318] border-r border-white/10 flex flex-col transition-transform duration-200 ease-out`}
          style={{
            transform: sidebarOpen
              ? 'translateX(0)'
              : 'translateX(-100%)'
          }}
          suppressHydrationWarning
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="text-emerald-400 font-bold text-lg">🦂</div>
              <span className="text-sm font-semibold text-white">SCORPION</span>
            </div>
            {mounted && (
              <button
                onClick={toggleSidebar}
                className="p-1.5 hover:bg-white/10 rounded transition-colors"
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4 text-white/70" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-2 [&_button]:!hidden" suppressHydrationWarning>
            {navigationSections.map((section, sectionIdx) => (
              <div key={section.title} className={sectionIdx > 0 ? 'mt-6' : ''} suppressHydrationWarning>
                <div className="px-2 mb-2" suppressHydrationWarning>
                  <span className="sc-title text-[10px] text-white/40">{section.title}</span>
                </div>
                <div className="space-y-1" suppressHydrationWarning>
                  {section.items.map((item) => (
                    <NavLink
                      key={item.href}
                      href={item.href}
                      label={item.label}
                      icon={item.icon}
                      isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-white/10 [&_button]:!hidden">
            <div className="text-xs text-white/40 sc-mono">
              v0.1.0
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0" suppressHydrationWarning>
          {/* Top bar with toggle button */}
          <div className="flex items-center gap-2 p-2 border-b border-white/10 bg-[#0f1318]" suppressHydrationWarning>
            {mounted && (
              <>
                {/* Expand button (shown when sidebar is collapsed) */}
                {!sidebarOpen && (
                  <button
                    onClick={toggleSidebar}
                    className="flex p-2 hover:bg-white/10 rounded transition-colors"
                    aria-label="Expand sidebar"
                    title="Expand sidebar"
                  >
                    <ChevronRight className="w-5 h-5 text-white/70" />
                  </button>
                )}
              </>
            )}
            <BreadcrumbNav />
          </div>

          {/* Page content */}
          <div className="flex-1 overflow-auto" suppressHydrationWarning>
            {children}
          </div>
        </main>
      </div>
      <ErrorOverlay />
    </ToastProvider>
  );
}

