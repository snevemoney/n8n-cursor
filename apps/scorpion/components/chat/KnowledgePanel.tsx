'use client';

import { Book, ExternalLink } from 'lucide-react';

interface KnowledgeHit {
  id: string;
  title: string;
  url: string;
  spans: Array<{ text: string }>;
  relevance?: number;
}

interface KnowledgePanelProps {
  hits: KnowledgeHit[];
  onSelect?: (hit: KnowledgeHit) => void;
}

/**
 * KnowledgePanel - Display RAG/KB search results
 */
export function KnowledgePanel({ hits, onSelect }: KnowledgePanelProps) {
  if (hits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Book className="h-12 w-12 text-white/20 mb-3" />
        <div className="text-sm text-white/40">No knowledge hits</div>
        <div className="text-xs text-white/30 mt-1">Try searching the knowledge base</div>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-white/60 mb-3">
        Knowledge Base ({hits.length})
      </div>
      
      {hits.map((hit) => (
        <button
          key={hit.id}
          onClick={() => onSelect?.(hit)}
          className="w-full p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-400/30 rounded-lg text-left transition-colors"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <div className="text-sm font-medium text-white mb-1">{hit.title}</div>
              <div className="text-xs text-white/60 line-clamp-2">
                {hit.spans[0]?.text || 'No description'}
              </div>
            </div>
            
            {hit.relevance !== undefined && (
              <div className="flex-shrink-0 px-2 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded text-xs text-emerald-400">
                {(hit.relevance * 100).toFixed(0)}%
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-xs text-white/40">
            <ExternalLink className="h-3 w-3" />
            <span className="font-mono truncate">{hit.url}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

