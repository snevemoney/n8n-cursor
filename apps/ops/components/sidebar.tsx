'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Wallet,
  Users,
  Zap,
  Bot,
  BarChart,
  Settings,
  Network,
  Shield,
  Home,
  Activity
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: Home,
    description: 'System overview and health'
  },
  {
    name: 'Node Health',
    href: '/node',
    icon: Network,
    description: 'Lightning node status, channels, and liquidity'
  },
  {
    name: 'Clients',
    href: '/clients',
    icon: Users,
    description: 'Manage barbers, creators, and their wallets'
  },
  {
    name: 'Wallets',
    href: '/wallets',
    icon: Wallet,
    description: 'View and manage all Lightning wallets'
  },
  {
    name: 'AI Agents',
    href: '/agents',
    icon: Bot,
    description: 'Configure and monitor RAG-enabled agents'
  },
  {
    name: 'Lightning',
    href: '/lightning',
    icon: Zap,
    description: 'Lightning Network operations and routing'
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart,
    description: 'Platform metrics and reporting'
  },
  {
    name: 'System Health',
    href: '/health',
    icon: Activity,
    description: 'System monitoring and status'
  },
  {
    name: 'Security',
    href: '/security',
    icon: Shield,
    description: 'Access control and permissions'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'Platform configuration'
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-lg font-semibold">LightningFlow Ops</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-accent hover:text-accent-foreground'
              )}
              title={item.description}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                )}
              />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

