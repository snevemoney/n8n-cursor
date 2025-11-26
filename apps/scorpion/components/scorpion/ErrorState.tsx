'use client';

import React, { useState } from 'react';
import { XCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface ErrorStateProps {
  error: string | Error | null;
  onRetry?: () => void;
  title?: string;
  className?: string;
  fullPage?: boolean;
  showDetails?: boolean;
}

export function ErrorState({
  error,
  onRetry,
  title = 'Failed to load data',
  className = '',
  fullPage = false,
  showDetails = process.env.NODE_ENV === 'development',
}: ErrorStateProps) {
  const [showErrorDetails, setShowErrorDetails] = useState(false);

  const errorMessage = error instanceof Error ? error.message : error || 'An unknown error occurred';
  const errorStack = error instanceof Error ? error.stack : undefined;

  const content = (
    <div className={`flex flex-col items-center justify-center text-center space-y-4 ${className}`} suppressHydrationWarning>
      <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20">
        <XCircle className="h-8 w-8 text-red-400" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-red-400 mb-2">{title}</h3>
        <p className="text-sm text-white/60 max-w-md leading-relaxed">{errorMessage}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-sm hover:bg-emerald-500/30 transition-all hover:scale-105 flex items-center gap-2 sc-mono text-emerald-400"
          suppressHydrationWarning
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      )}
      {showDetails && errorStack && (
        <div className="w-full max-w-2xl mt-4">
          <button
            onClick={() => setShowErrorDetails(!showErrorDetails)}
            className="flex items-center gap-2 text-xs text-white/40 hover:text-white/60 transition-colors sc-mono"
            suppressHydrationWarning
          >
            {showErrorDetails ? (
              <>
                <ChevronUp className="h-3 w-3" />
                Hide Error Details
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                Show Error Details
              </>
            )}
          </button>
          {showErrorDetails && (
            <pre className="mt-2 p-3 bg-white/5 border border-white/10 rounded text-xs text-white/60 overflow-auto max-h-64 sc-mono text-left">
              {errorStack}
            </pre>
          )}
        </div>
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

