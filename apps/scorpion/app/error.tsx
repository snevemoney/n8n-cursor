'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Root error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0d10] text-[#e4e8ee] flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-[#0f1318] border border-white/5 rounded-lg p-6">
        <div className="text-center space-y-4">
          <div className="text-[10px] tracking-[0.3em] uppercase text-white/40">SCORPION ERROR</div>
          <div className="text-lg font-semibold text-red-400">
            {error.message || 'An unexpected error occurred'}
          </div>
          <div className="text-sm text-white/40">
            {error.digest && (
              <div className="font-mono text-xs mb-2">Error ID: {error.digest}</div>
            )}
            The application encountered an error. Please refresh the page.
          </div>
          <button
            onClick={reset}
            className="px-4 py-2 bg-emerald-500/20 border border-emerald-400/50 rounded-sm text-sm hover:bg-emerald-500/30 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

