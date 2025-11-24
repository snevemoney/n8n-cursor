'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  fullPage?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
  className = '',
  fullPage = false,
}: EmptyStateProps) {
  const content = (
    <div className={`flex flex-col items-center justify-center text-center space-y-4 ${className}`} suppressHydrationWarning>
      {Icon && (
        <div className="p-4 rounded-full bg-white/5 border border-white/10">
          <Icon className="h-8 w-8 text-white/40" />
        </div>
      )}
      <div>
        <h3 className="text-lg font-semibold text-white/80 mb-2">{title}</h3>
        {message && (
          <p className="text-sm text-white/60 max-w-md leading-relaxed">{message}</p>
        )}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-sm hover:bg-emerald-500/30 transition-all hover:scale-105 sc-mono text-emerald-400"
          suppressHydrationWarning
        >
          {action.label}
        </button>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-[#0a0d10] via-[#0c1014] to-[#0a0d10]" suppressHydrationWarning>
        <div className="max-w-md w-full p-6">{content}</div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4" suppressHydrationWarning>
      {content}
    </div>
  );
}

