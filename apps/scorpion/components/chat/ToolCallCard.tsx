'use client';

import { CheckCircle, XCircle, Loader2, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface ToolCallCardProps {
  tool: string;
  args: any;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

/**
 * ToolCallCard - Display tool execution with collapsible details
 */
export function ToolCallCard({ tool, args, status, result, error }: ToolCallCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  const getIcon = () => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />;
      default:
        return <div className="w-4 h-4 border-2 border-white/20 rounded-full" />;
    }
  };
  
  const getColor = () => {
    switch (status) {
      case 'completed': return 'border-emerald-400/30 bg-emerald-400/5';
      case 'failed': return 'border-red-400/30 bg-red-400/5';
      case 'running': return 'border-blue-400/30 bg-blue-400/5';
      default: return 'border-white/10 bg-white/5';
    }
  };
  
  return (
    <div className={`rounded-lg border ${getColor()} overflow-hidden`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
      >
        {getIcon()}
        
        <div className="flex-1 text-left">
          <div className="text-sm font-medium text-white">{tool}</div>
          <div className="text-xs text-white/60 capitalize">{status}</div>
        </div>
        
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-white/40" />
        ) : (
          <ChevronRight className="h-4 w-4 text-white/40" />
        )}
      </button>
      
      {expanded && (
        <div className="border-t border-white/10 p-3 space-y-3">
          {/* Arguments */}
          <div>
            <div className="text-xs text-white/40 mb-1">Arguments:</div>
            <pre className="text-xs bg-black/30 p-2 rounded overflow-x-auto">
              {JSON.stringify(args, null, 2)}
            </pre>
          </div>
          
          {/* Result */}
          {result && (
            <div>
              <div className="text-xs text-white/40 mb-1">Result:</div>
              
              {/* Special handling for research tool */}
              {tool === 'research.run' && result.viewUrl && (
                <Link
                  href={result.viewUrl}
                  className="inline-flex items-center gap-2 px-3 py-2 mb-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 rounded text-emerald-400 text-sm transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Full Research Results
                </Link>
              )}
              
              <pre className="text-xs bg-black/30 p-2 rounded overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
          
          {/* Error */}
          {error && (
            <div>
              <div className="text-xs text-red-400 mb-1">Error:</div>
              <div className="text-xs bg-red-900/20 text-red-300 p-2 rounded">
                {error}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

