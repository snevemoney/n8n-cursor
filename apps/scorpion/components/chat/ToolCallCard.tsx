'use client';

import { CheckCircle, XCircle, Loader2, ChevronDown, ChevronRight, ExternalLink, AlertTriangle, RefreshCw, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ToolCallCardProps {
  tool: string;
  args: any;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
  isRetry?: boolean;
  callId?: string;
  progress?: { tool: string; progress: string; status: string };
  startTime?: number;
}

/**
 * ToolCallCard - Display tool execution with collapsible details
 */
export function ToolCallCard({ tool, args, status, result, error, isRetry, callId, progress, startTime }: ToolCallCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Track elapsed time for running tools
  useEffect(() => {
    if (status === 'running' && startTime) {
      const interval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    } else if (status !== 'running') {
      setElapsedTime(0);
    }
  }, [status, startTime]);
  
  const getIcon = () => {
    if (isRetry && status === 'completed') {
      return <RefreshCw className="h-4 w-4 text-amber-400" />;
    }
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
    if (isRetry) {
      switch (status) {
        case 'completed': return 'border-amber-400/30 bg-amber-400/5';
        case 'failed': return 'border-red-400/30 bg-red-400/5';
        case 'running': return 'border-amber-400/30 bg-amber-400/5';
        default: return 'border-amber-400/20 bg-amber-400/5';
      }
    }
    switch (status) {
      case 'completed': return 'border-emerald-400/30 bg-emerald-400/5';
      case 'failed': return 'border-red-400/30 bg-red-400/5';
      case 'running': return 'border-blue-400/30 bg-blue-400/5';
      default: return 'border-white/10 bg-white/5';
    }
  };
  
  // Check if kb.search returned empty results
  const isEmptyKbSearch = tool === 'kb.search' && 
                          status === 'completed' && 
                          result?.ok === true && 
                          (!result?.hits || result.hits.length === 0);
  
  const handleTriggerExtraction = async () => {
    try {
      const response = await fetch('/api/project/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        alert('Knowledge extraction triggered! The knowledge base will be updated shortly.');
      } else {
        alert('Failed to trigger knowledge extraction.');
      }
    } catch (error) {
      console.error('Failed to trigger extraction:', error);
      alert('Failed to trigger knowledge extraction.');
    }
  };
  
  return (
    <div data-testid={`tool-call-${tool}`} className={`rounded-lg border ${getColor()} overflow-hidden`}>
      <button
        data-testid={`tool-call-button-${tool}`}
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
      >
        {getIcon()}
        
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-white">{tool}</div>
            {isRetry && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-400 border border-amber-400/30">
                🔄 Retry
              </span>
            )}
          </div>
          <div className="text-xs text-white/60 capitalize">
            {status}
            {isEmptyKbSearch && ' • No results found'}
            {isRetry && status === 'completed' && ' • Self-correction successful'}
            {status === 'running' && tool === 'research.run' && elapsedTime > 0 && (
              <span className="ml-2 text-blue-400">• {elapsedTime}s elapsed</span>
            )}
          </div>
          {/* Research Progress Indicator */}
          {status === 'running' && tool === 'research.run' && (
            <div className="mt-2 space-y-1">
              {progress?.progress && (
                <div className="text-xs text-blue-400/80 flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>{progress.progress}</span>
                </div>
              )}
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-blue-400 h-full transition-all duration-500 ease-out"
                  style={{ 
                    width: progress?.status === 'starting' ? '20%' : 
                           progress?.status === 'running' ? '60%' : 
                           elapsedTime > 30 ? '90%' : 
                           `${Math.min(90, 20 + (elapsedTime * 2))}%` 
                  }}
                />
              </div>
              {elapsedTime > 0 && (
                <div className="text-xs text-white/40">
                  Estimated: {elapsedTime < 20 ? '20-40s' : elapsedTime < 40 ? '30-50s' : '40-60s'} remaining
                </div>
              )}
            </div>
          )}
        </div>
        
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-white/40" />
        ) : (
          <ChevronRight className="h-4 w-4 text-white/40" />
        )}
      </button>
      
      {expanded && (
        <div className="border-t border-white/10 p-3 space-y-3">
          {/* Empty results warning for kb.search */}
          {isEmptyKbSearch && (
            <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-3">
              <div className="flex items-start gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs font-medium text-yellow-400 mb-1">No Knowledge Base Results</div>
                  <div className="text-xs text-white/70 leading-relaxed">
                    The knowledge base search returned no results. This could mean:
                  </div>
                  <ul className="text-xs text-white/60 mt-1 ml-4 list-disc space-y-1">
                    <li>The knowledge base hasn't been indexed yet</li>
                    <li>The query didn't match any indexed documents</li>
                    <li>Try variations like "LightningFlow" (no space) instead of "Lightning Flow"</li>
                  </ul>
                </div>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleTriggerExtraction();
                }}
                className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/30 rounded text-yellow-400 text-xs transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                Trigger Knowledge Extraction
              </button>
            </div>
          )}
          
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
              {tool === 'research.run' && result?.viewUrl && (
                <Link
                  href={result.viewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 mb-2 w-full justify-center bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 rounded text-emerald-400 text-sm transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Full Research Results
                </Link>
              )}
              
              {/* Research Summary Display */}
              {tool === 'research.run' && result?.summary && (
                <div className="mb-2 bg-emerald-500/10 border border-emerald-400/30 rounded-lg p-3">
                  <div className="text-xs font-medium text-emerald-400 mb-1">Research Summary</div>
                  <div className="text-xs text-white/80 leading-relaxed">{result.summary}</div>
                </div>
              )}
              
              {/* Research Status */}
              {tool === 'research.run' && result?.status && (
                <div className="mb-2 text-xs text-white/60">
                  Status: <span className="text-emerald-400 capitalize">{result.status}</span>
                </div>
              )}
              
              {/* Show empty results count for kb.search */}
              {tool === 'kb.search' && result.hits && (
                <div className="mb-2 text-xs text-white/60">
                  Found {result.hits.length} result{result.hits.length !== 1 ? 's' : ''}
                </div>
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

