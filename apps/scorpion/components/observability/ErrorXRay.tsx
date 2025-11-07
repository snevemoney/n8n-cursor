'use client';

import { useState, useEffect } from 'react';
import { useTelemetryStore } from '@/lib/telemetry/store';
import { XCircle, Copy } from 'lucide-react';

/**
 * ErrorXRay - Overlay showing console errors and HTTP failures
 * Aligned to UI via data-attributes where possible
 */
export function ErrorXRay() {
  const [enabled, setEnabled] = useState(false);
  const logs = useTelemetryStore(state => state.logs);
  const [errors, setErrors] = useState<any[]>([]);
  
  useEffect(() => {
    if (!enabled) return;
    
    // Filter errors and critical issues
    const errorLogs = logs.filter(l => 
      l.level === 'error' || l.level === 'critical'
    ).slice(-15); // Last 15 errors
    
    setErrors(errorLogs);
  }, [logs, enabled]);
  
  const copyTrace = (error: any) => {
    const trace = `[${new Date(error.ts).toISOString()}] ${error.level.toUpperCase()}\n${error.source}\n${error.message}`;
    navigator.clipboard.writeText(trace);
  };
  
  if (!enabled) {
    return (
      <button
        onClick={() => setEnabled(true)}
        className="fixed bottom-4 right-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg flex items-center gap-2 z-50 transition-colors"
        title="Enable Error X-Ray overlay"
      >
        <XCircle className="h-4 w-4" />
        Error X-Ray
      </button>
    );
  }
  
  return (
    <>
      {/* Overlay backdrop */}
      <div className="fixed inset-0 bg-black/20 pointer-events-none z-40" />
      
      {/* Error panel */}
      <div className="fixed inset-0 pointer-events-none z-40 flex items-start justify-end p-4">
        <div className="w-96 max-h-[80vh] pointer-events-auto">
          <div className="bg-red-900/95 backdrop-blur-lg border border-red-400/50 rounded-lg shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-red-400/30 bg-red-950/50">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-300" />
                <div>
                  <div className="text-white font-medium">Error X-Ray</div>
                  <div className="text-xs text-red-300">{errors.length} errors detected</div>
                </div>
              </div>
              <button
                onClick={() => setEnabled(false)}
                className="p-1.5 hover:bg-white/10 rounded transition-colors text-white/60 hover:text-white"
                title="Close X-Ray"
              >
                ✕
              </button>
            </div>
            
            {/* Error list */}
            <div className="max-h-[calc(80vh-80px)] overflow-y-auto p-3 space-y-2">
              {errors.length === 0 ? (
                <div className="text-center text-white/40 py-8 text-sm">
                  No errors detected. System healthy! ✓
                </div>
              ) : (
                errors.map((error, i) => (
                  <div
                    key={`${error.id}-${i}`}
                    className="p-3 bg-black/40 rounded-lg border border-red-400/20 hover:border-red-400/40 transition-colors"
                  >
                    {/* Timestamp and level */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-red-300 font-mono">
                        {new Date(error.ts).toLocaleTimeString()}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                        error.level === 'critical'
                          ? 'bg-red-600 text-white'
                          : 'bg-red-400/20 text-red-300'
                      }`}>
                        {error.level.toUpperCase()}
                      </span>
                    </div>
                    
                    {/* Source */}
                    <div className="text-xs text-white/40 mb-1">
                      [{error.source}]
                    </div>
                    
                    {/* Message */}
                    <div className="text-sm text-white/90 font-mono break-all mb-2">
                      {error.message}
                    </div>
                    
                    {/* Copy button */}
                    <button
                      onClick={() => copyTrace(error)}
                      className="flex items-center gap-1 text-xs text-white/60 hover:text-white transition-colors"
                    >
                      <Copy className="h-3 w-3" />
                      Copy trace
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

