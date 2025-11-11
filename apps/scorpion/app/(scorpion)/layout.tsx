'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useCallback, useMemo, useRef, useTransition } from 'react';
import { ErrorBoundary } from '@/components/scorpion/ErrorBoundary';
import { ToastProvider } from '@/components/scorpion';
import { StorageModeIndicator } from '@/components/scorpion/StorageModeIndicator';
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
    title: 'Project & Operations',
    items: [
      { href: '/project', label: 'Project', icon: FolderKanban },
      { href: '/ops', label: 'Operations', icon: Network },
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
    title: 'Knowledge & Research',
    items: [
      { href: '/knowledge', label: 'Knowledge', icon: BookOpen },
      { href: '/ontology', label: 'Ontology', icon: Database },
      { href: '/research', label: 'Research', icon: Search },
    ],
  },
  {
    title: 'AI & Agents',
    items: [
      { href: '/council', label: 'Council', icon: Users },
      { href: '/agents', label: 'Agents', icon: Bot },
      { href: '/agents/specialized', label: 'Specialized', icon: Sparkles },
      { href: '/agents/create', label: 'Create Agent', icon: Plus },
      { href: '/chat', label: 'Chat', icon: MessageSquare },
      { href: '/llm/experiments', label: 'LLM Experiments', icon: Brain },
      { href: '/llm/models', label: 'LLM Models', icon: List },
      { href: '/llm/prompts', label: 'LLM Prompts', icon: FileText },
    ],
  },
  {
    title: 'Monitoring & Business',
    items: [
      { href: '/observability', label: 'Observability', icon: Eye },
      { href: '/selling', label: 'Selling', icon: ShoppingCart },
    ],
  },
  {
    title: 'System',
    items: [
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

  // Load sidebar state from localStorage on mount and set mounted flag
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('scorpion-sidebar-open');
    if (saved === 'true') {
      setSidebarOpen(true);
    } else {
      // Default to open on desktop, closed on mobile
      if (typeof window !== 'undefined') {
        const isDesktop = window.innerWidth >= 768;
        setSidebarOpen(isDesktop);
      }
    }
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (!sidebarOpen) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (window.innerWidth < 768 && !target.closest('aside') && !target.closest('button[aria-label*="sidebar"]')) {
        setSidebarOpen(false);
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

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden">
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
          className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#0f1318] border-r border-white/10 flex flex-col transition-transform duration-200 ease-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
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
              className="md:hidden p-1.5 hover:bg-white/10 rounded transition-colors"
              aria-label="Toggle sidebar"
            >
              <ChevronLeft className="w-4 h-4 text-white/70" />
            </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-2">
            {navigationSections.map((section, sectionIdx) => (
              <div key={section.title} className={sectionIdx > 0 ? 'mt-6' : ''}>
                <div className="px-2 mb-2">
                  <span className="sc-title text-[10px] text-white/40">{section.title}</span>
                </div>
                <div className="space-y-1">
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
          <div className="p-4 border-t border-white/10">
            <div className="text-xs text-white/40 sc-mono">
              v0.1.0
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Top bar with toggle button */}
          <div className="flex items-center gap-2 p-2 border-b border-white/10 bg-[#0f1318]">
            {mounted && (
            <button
              onClick={toggleSidebar}
              className="md:hidden p-2 hover:bg-white/10 rounded transition-colors"
              aria-label="Toggle sidebar"
            >
              <ChevronRight className="w-5 h-5 text-white/70" />
            </button>
            )}
            <BreadcrumbNav />
          </div>
          
          {/* Page content */}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}

