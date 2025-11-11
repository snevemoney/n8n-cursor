'use client';

import { CheckCircle, XCircle, Loader2, ChevronDown, ChevronRight, ExternalLink, AlertTriangle, RefreshCw } from 'lucide-react';
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
    <div className={`rounded-lg border ${getColor()} overflow-hidden`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
      >
        {getIcon()}
        
        <div className="flex-1 text-left">
          <div className="text-sm font-medium text-white">{tool}</div>
          <div className="text-xs text-white/60 capitalize">
            {status}
            {isEmptyKbSearch && ' • No results found'}
          </div>
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
              {tool === 'research.run' && result.viewUrl && (
                <Link
                  href={result.viewUrl}
                  className="inline-flex items-center gap-2 px-3 py-2 mb-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 rounded text-emerald-400 text-sm transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Full Research Results
                </Link>
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

