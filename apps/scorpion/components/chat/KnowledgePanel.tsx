'use client';

import { Book, ExternalLink, RefreshCw, AlertTriangle, ArrowRight, Clock, Folder, FileText, Tag, Layers, Link as LinkIcon, Code, Package, Download } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface KnowledgeHit {
  id: string;
  title: string;
  url: string;
  spans: Array<{ text: string }>;
  relevance?: number;
}

interface KnowledgeCard {
  type: 'category' | 'recent' | 'readme' | 'documentation' | 'type';
  title: string;
  description: string;
  items: Array<{
    id: string;
    title: string;
    url: string;
    spans: Array<{ text: string }>;
    category?: string;
    type?: string;
  }>;
  icon: string;
}

interface PDFBundle {
  id: string;
  title: string;
  description: string;
  categories: string[];
  items: Array<{
    id: string;
    title: string;
    url: string;
    spans?: Array<{ text: string }>;
    category?: string;
    type?: string;
  }>;
  icon: string;
}

interface Recommendations {
  cards: KnowledgeCard[];
  bundles: PDFBundle[];
  stats?: {
    total: number;
    categories: number;
    types: number;
    sources: number;
    readmes: number;
    docs: number;
  };
}

interface KnowledgePanelProps {
  hits: KnowledgeHit[];
  onSelect?: (hit: KnowledgeHit) => void;
  searchQuery?: string; // Optional: show what was searched
}

const iconMap: Record<string, any> = {
  folder: Folder,
  clock: Clock,
  book: Book,
  'file-text': FileText,
  tag: Tag,
  layers: Layers,
  link: LinkIcon,
  code: Code,
  package: Package,
};

/**
 * KnowledgePanel - Display RAG/KB search results
 */
export function KnowledgePanel({ hits, onSelect, searchQuery }: KnowledgePanelProps) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  
  useEffect(() => {
    if (hits.length === 0) {
      loadRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hits.length]);

  const loadRecommendations = async () => {
    setLoadingRecommendations(true);
    try {
      const response = await fetch('/api/knowledge/recommendations');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          setRecommendations(result.data);
        }
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleTriggerExtraction = async () => {
    setIsExtracting(true);
    try {
      const response = await fetch('/api/project/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        // Show success message
        alert('Knowledge extraction triggered! The knowledge base will be updated shortly. You may need to search again after extraction completes.');
      } else {
        throw new Error('Failed to trigger extraction');
      }
    } catch (error) {
      console.error('Failed to trigger extraction:', error);
      alert('Failed to trigger knowledge extraction. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDownloadBundle = async (bundle: PDFBundle) => {
    try {
      setIsExtracting(true);
      
      // Generate bundle from API
      const response = await fetch('/api/knowledge/bundle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bundleId: bundle.id,
          title: bundle.title,
          itemIds: bundle.items.map(item => item.id)
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        const data = result.success && result.data ? result.data : result;
        
        // Create a blob and download
        const blob = new Blob([data.htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${bundle.title.replace(/[^a-z0-9]/gi, '_')}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Also open in new window for print-to-PDF
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(data.htmlContent);
          printWindow.document.close();
          // Auto-trigger print dialog with minimal delay for window to be ready
          setTimeout(() => {
            printWindow.print();
          }, 100);
        }
      } else {
        throw new Error('Failed to generate bundle');
      }
    } catch (error) {
      console.error('Failed to download bundle:', error);
      alert('Failed to generate PDF bundle. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };
  
  if (hits.length === 0) {
    return (
      <div className="flex flex-col py-6 px-4 overflow-y-auto max-h-full">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Book className="h-5 w-5 text-white/60" />
            <div className="text-sm font-medium text-white/60">No search results</div>
          </div>
          
          {searchQuery && (
            <div className="text-xs text-white/40 mb-2">
              Searched for: <span className="font-mono text-white/60">"{searchQuery}"</span>
            </div>
          )}
        </div>

        {/* Loading state */}
        {loadingRecommendations && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-5 w-5 text-white/40 animate-spin" />
            <span className="ml-2 text-sm text-white/40">Loading recommendations...</span>
          </div>
        )}

        {/* Recommendations */}
        {!loadingRecommendations && recommendations && (
          <div className="space-y-6">
            {/* Knowledge Cards */}
            {recommendations.cards && recommendations.cards.length > 0 && (
              <div>
                <div className="text-xs font-medium text-white/60 mb-3">Knowledge Cards</div>
                <div className="space-y-3">
                  {recommendations.cards.map((card, idx) => {
                    const IconComponent = iconMap[card.icon] || Book;
                    return (
                      <div
                        key={idx}
                        className="bg-white/5 border border-white/10 rounded-lg p-3 hover:border-emerald-400/30 transition-colors"
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <IconComponent className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <div className="text-xs font-medium text-white mb-1">{card.title}</div>
                            <div className="text-xs text-white/60 mb-2">{card.description}</div>
                          </div>
                        </div>
                        
                        {card.items && card.items.length > 0 && (
                          <div className="space-y-1.5 mt-2">
                            {card.items.map((item) => (
                              <button
                                key={item.id}
                                onClick={() => onSelect?.(item as KnowledgeHit)}
                                className="w-full text-left p-2 bg-black/20 hover:bg-black/30 rounded text-xs transition-colors"
                              >
                                <div className="text-white/90 font-medium truncate">{item.title}</div>
                                {item.spans && item.spans[0] && (
                                  <div className="text-white/50 line-clamp-1 mt-0.5">
                                    {item.spans[0].text}
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PDF Bundles */}
            {recommendations.bundles && recommendations.bundles.length > 0 && (
              <div>
                <div className="text-xs font-medium text-white/60 mb-3">PDF Bundles</div>
                <div className="space-y-3">
                  {recommendations.bundles.map((bundle) => {
                    const IconComponent = iconMap[bundle.icon] || Package;
                    return (
                      <div
                        key={bundle.id}
                        className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-400/20 rounded-lg p-4 hover:border-emerald-400/40 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-start gap-2 flex-1">
                            <IconComponent className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <div className="text-sm font-medium text-white mb-1">{bundle.title}</div>
                              <div className="text-xs text-white/60 mb-2">{bundle.description}</div>
                              {bundle.categories && bundle.categories.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {bundle.categories.map((cat) => (
                                    <span
                                      key={cat}
                                      className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-400/30 rounded text-xs text-emerald-400"
                                    >
                                      {cat}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDownloadBundle(bundle)}
                            className="flex-shrink-0 p-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 rounded transition-colors"
                            title="Download PDF Bundle"
                          >
                            <Download className="h-4 w-4 text-emerald-400" />
                          </button>
                        </div>
                        
                        {bundle.items && bundle.items.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <div className="text-xs text-white/40 mb-2">
                              {bundle.items.length} items in bundle:
                            </div>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {bundle.items.slice(0, 5).map((item) => (
                                <div
                                  key={item.id}
                                  className="text-xs text-white/70 truncate pl-2 border-l-2 border-emerald-400/30"
                                >
                                  {item.title}
                                </div>
                              ))}
                              {bundle.items.length > 5 && (
                                <div className="text-xs text-white/40 pl-2">
                                  +{bundle.items.length - 5} more items
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stats */}
            {recommendations.stats && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <div className="text-xs font-medium text-white/60 mb-2">Knowledge Base Stats</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-white/70">
                    <span className="text-white/40">Total:</span> {recommendations.stats.total}
                  </div>
                  <div className="text-white/70">
                    <span className="text-white/40">Categories:</span> {recommendations.stats.categories}
                  </div>
                  <div className="text-white/70">
                    <span className="text-white/40">Types:</span> {recommendations.stats.types}
                  </div>
                  <div className="text-white/70">
                    <span className="text-white/40">Sources:</span> {recommendations.stats.sources}
                  </div>
                </div>
              </div>
            )}

            {/* Help section */}
            <div className="bg-yellow-500/10 border border-yellow-400/30 rounded-lg p-3">
              <div className="flex items-start gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs font-medium text-yellow-400 mb-1">No search results?</div>
                  <ul className="text-xs text-white/60 mt-1 ml-4 list-disc space-y-1 text-left">
                    <li>The query might not match indexed documents</li>
                    <li>Try variations: "LightningFlow" vs "Lightning Flow"</li>
                    <li>Browse the knowledge cards above for related content</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleTriggerExtraction}
                disabled={isExtracting}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 rounded text-emerald-400 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`h-4 w-4 ${isExtracting ? 'animate-spin' : ''}`} />
                {isExtracting ? 'Triggering Extraction...' : 'Trigger Knowledge Extraction'}
              </button>
              
              <Link
                href="/knowledge"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-white/60 hover:text-white text-sm transition-colors"
              >
                <Book className="h-4 w-4" />
                View Knowledge Base
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {/* No recommendations available */}
        {!loadingRecommendations && (!recommendations || (recommendations.cards.length === 0 && recommendations.bundles.length === 0)) && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Book className="h-12 w-12 text-white/20 mb-4" />
            <div className="text-sm font-medium text-white/60 mb-2">No knowledge available</div>
            <div className="text-xs text-white/40 mb-4 max-w-md">
              The knowledge base may not be indexed yet. Trigger extraction to get started.
            </div>
            <button
              onClick={handleTriggerExtraction}
              disabled={isExtracting}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 rounded text-emerald-400 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${isExtracting ? 'animate-spin' : ''}`} />
              {isExtracting ? 'Triggering Extraction...' : 'Trigger Knowledge Extraction'}
            </button>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-white/60">
          Knowledge Base ({hits.length})
        </div>
        {searchQuery && (
          <div className="text-xs text-white/40">
            Query: <span className="font-mono text-white/60">"{searchQuery}"</span>
          </div>
        )}
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

