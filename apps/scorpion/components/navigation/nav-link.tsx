'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTransition, useState, useEffect } from 'react';
import { LucideIcon } from 'lucide-react';

interface NavLinkProps {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  isActive?: boolean;
}

/**
 * Optimized Navigation Link Component
 * Uses React transitions for smooth, non-blocking navigation
 */
export function NavLink({ href, label, icon: Icon, badge, isActive }: NavLinkProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  const active = isActive ?? pathname === href;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Use startTransition for non-blocking navigation
    startTransition(() => {
      // Navigation happens automatically via Next.js Link
      // This just marks it as a transition
    });
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      prefetch={true}
      className={`flex items-center gap-2 px-2 py-1.5 rounded-sm transition-all duration-100 ease-out relative z-[60] pointer-events-auto ${
        active
          ? 'bg-white/10 text-white border-l-2 border-emerald-400'
          : 'text-white/70 hover:bg-white/5 hover:text-white'
      } ${isPending ? 'opacity-70' : ''} max-md:text-xs md:text-xs lg:text-[13px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400/50 focus-visible:outline-offset-2 active:scale-[0.98]`}
      style={{ pointerEvents: 'auto' }}
    >
      {mounted && <Icon className="max-md:w-3.5 max-md:h-3.5 md:w-3.5 md:h-3.5 lg:w-4 lg:h-4 flex-shrink-0" />}
      <span className="max-md:truncate md:truncate">{label}</span>
      {badge && (
        <span className="ml-auto px-1.5 py-0.5 text-[10px] rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex-shrink-0">
          {badge}
        </span>
      )}
    </Link>
  );
}

