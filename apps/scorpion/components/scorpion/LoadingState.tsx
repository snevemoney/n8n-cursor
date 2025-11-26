'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  variant?: 'spinner' | 'skeleton';
  text?: string;
  fullPage?: boolean;
  className?: string;
  skeletonLines?: number;
}

export function LoadingState({
  variant = 'spinner',
  text = 'Loading...',
  fullPage = false,
  className = '',
  skeletonLines = 3,
}: LoadingStateProps) {
  if (variant === 'skeleton') {
    const content = (
      <div className={`space-y-3 ${className}`} suppressHydrationWarning>
        {Array.from({ length: skeletonLines }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-white/5 rounded animate-pulse"
            style={{
              width: i === skeletonLines - 1 ? '60%' : '100%',
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
        {text && (
          <div className="text-sm text-white/40 sc-mono mt-4">{text}</div>
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

    return content;
  }

  // Spinner variant
  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`} suppressHydrationWarning>
      <Loader2 className="h-8 w-8 text-emerald-400 animate-spin" />
      {text && (
        <div className="text-sm text-white/60 sc-mono">{text}</div>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-[#0a0d10] via-[#0c1014] to-[#0a0d10]" suppressHydrationWarning>
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8" suppressHydrationWarning>
      {content}
    </div>
  );
}

export default LoadingState;

