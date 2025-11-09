'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ErrorBoundary } from '@/components/scorpion/ErrorBoundary';
import { ToastProvider } from '@/components/scorpion';
import { 
  Home,
  Activity, 
  Workflow, 
  Sparkles, 
  Database, 
  Users, 
  Bot, 
  FileText, 
  Settings,
  Bell,
  Search,
  MessageSquare,
  Eye,
  ShoppingCart,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function ScorpionLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  // All hooks must be called before any conditional returns (Rules of Hooks)
  useEffect(() => {
    setMounted(true);
    // Restore sidebar state from localStorage (only on client)
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('scorpion-sidebar-open');
      if (saved !== null) {
        setSidebarOpen(saved === 'true');
      }
    }
  }, []);

  useEffect(() => {
    // Save sidebar state to localStorage (only on client)
    if (typeof window !== 'undefined') {
      localStorage.setItem('scorpion-sidebar-open', String(sidebarOpen));
    }
  }, [sidebarOpen]);

  // Return same loading state on both server and client to prevent hydration mismatch
  // Don't render anything until mounted to prevent hydration errors
  if (typeof window === 'undefined' || !mounted) {
    return (
      <div className="h-screen bg-[#0a0d10] flex items-center justify-center">
        <div className="text-sm text-white/40">Loading...</div>
      </div>
    );
  }

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/dashboard', label: 'Dashboard', icon: Activity },
    { href: '/project', label: 'Project', icon: Activity },
    { href: '/ops', label: 'Operations', icon: Activity },
    { href: '/workflows', label: 'Workflows', icon: Workflow },
    { href: '/build', label: 'Build', icon: Sparkles },
    { href: '/knowledge', label: 'Knowledge', icon: Database },
    { href: '/research', label: 'Research', icon: Search },
    { href: '/council', label: 'Council', icon: Users },
    { href: '/agents', label: 'Agents', icon: Bot },
    { href: '/chat', label: 'Chat AGI', icon: MessageSquare, badge: 'New' },
    { href: '/observability', label: 'Observability', icon: Eye, badge: 'Live' },
    { href: '/selling', label: 'Selling', icon: ShoppingCart },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/logs', label: 'System Logs', icon: FileText },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <ToastProvider>
      <div className="flex h-screen bg-[#0a0d10] text-[#e4e8ee]">
        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`fixed left-0 top-16 z-50 p-2 bg-[#0c1014]/90 backdrop-blur border-r border-b border-white/5 transition-all duration-300 ${
            sidebarOpen ? 'translate-x-56' : 'translate-x-0'
          } hover:bg-white/5`}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-4 w-4 text-white/60" />
          ) : (
            <ChevronRight className="h-4 w-4 text-white/60" />
          )}
        </button>

        {/* Left Rail */}
        <aside className={`border-r border-white/5 bg-[#0c1014]/80 backdrop-blur flex flex-col shrink-0 transition-all duration-300 ${
          sidebarOpen ? 'w-56' : 'w-0 overflow-hidden'
        }`}>
          <div className={`h-12 flex items-center px-4 border-b border-white/5 transition-opacity ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="text-[10px] tracking-[0.4em] uppercase font-semibold">SCORPION</div>
          </div>
          <nav className={`flex-1 px-2 py-4 space-y-1 overflow-y-auto transition-opacity ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === '/' 
                ? pathname === '/' 
                : pathname === item.href || (pathname?.startsWith(item.href + '/') && item.href !== '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-sm text-[13px] transition-colors relative ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                  {'badge' in item && (
                    <span className="ml-auto px-1.5 py-0.5 text-[10px] rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="h-12 border-b border-white/5 flex items-center justify-between px-4 bg-[#0c1014]/60 backdrop-blur shrink-0">
            <div className="text-[10px] tracking-[0.3em] uppercase text-white/40">
              Scorpion Operations Environment
            </div>
            <div className="text-xs text-white/35">
              Status: <span className="text-emerald-300">Online</span>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <ErrorBoundary>
              {mounted ? children : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-sm text-white/40">Loading...</div>
                </div>
              )}
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}

