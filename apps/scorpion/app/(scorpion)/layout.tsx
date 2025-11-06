'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Activity, 
  Workflow, 
  Sparkles, 
  Database, 
  Users, 
  Bot, 
  FileText, 
  Settings 
} from 'lucide-react';

export default function ScorpionLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/ops', label: 'Operations', icon: Activity },
    { href: '/workflows', label: 'Workflows', icon: Workflow },
    { href: '/build', label: 'Build', icon: Sparkles },
    { href: '/knowledge', label: 'Knowledge', icon: Database },
    { href: '/council', label: 'Council', icon: Users },
    { href: '/agents', label: 'Agents', icon: Bot },
    { href: '/chat', label: 'Chat', icon: Bot },
    { href: '/logs', label: 'System Logs', icon: FileText },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#0a0d10] text-[#e4e8ee]">
      {/* Left Rail */}
      <aside className="w-56 border-r border-white/5 bg-[#0c1014]/80 backdrop-blur flex flex-col shrink-0">
        <div className="h-12 flex items-center px-4 border-b border-white/5">
          <div className="text-[10px] tracking-[0.4em] uppercase font-semibold">SCORPION</div>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (pathname?.startsWith(item.href + '/') && item.href !== '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-2 py-1.5 rounded-sm text-[13px] transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
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
          {children}
        </main>
      </div>
    </div>
  );
}

