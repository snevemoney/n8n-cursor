'use client';

import { useState, useEffect } from 'react';
import { Panel, PageLoadingBar } from '@/components/scorpion';
import { BookOpen, Clock, Folder, FileText, Package, Link as LinkIcon, Layers } from 'lucide-react';
import Link from 'next/link';

interface KnowledgeCard {
  type: string;
  title: string;
  description: string;
  items: Array<{
    id: string;
    title: string;
    url: string;
    spans: Array<{ text: string }>;
    category: string;
    type: string;
  }>;
  icon: string;
}

interface KnowledgeBundle {
  id: string;
  title: string;
  description: string;
  categories: string[];
  items: Array<{
    id: string;
    title: string;
    url: string;
    spans: Array<{ text: string }>;
    category: string;
    type: string;
  }>;
  icon: string;
}

interface RecommendationsData {
  cards: KnowledgeCard[];
  bundles: KnowledgeBundle[];
  stats: {
    total: number;
    categories: number;
    types: number;
    sources: number;
    readmes: number;
    docs: number;
  };
}

export default function KnowledgeRecommendationsPage() {
  const [data, setData] = useState<RecommendationsData | null>(null);
  const [loading, setLoading] = useState(false); // Start false so page renders immediately

  useEffect(() => {
    // Defer data fetch aggressively so page renders instantly
    const loadData = () => {
      loadRecommendations();
    };
    
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(loadData, { timeout: 0 }); // Immediate - no delay
    } else {
      setTimeout(loadData, 0); // Immediate fallback
    }
  }, []);

  const loadRecommendations = async () => {
    try {
      // Only show loading spinner on initial load
      if (!data) {
        setLoading(true);
      }
      const response = await fetch('/api/knowledge/recommendations');
      if (response.ok) {
        const result = await response.json();
        setData(result.success ? result.data : result);
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      folder: Folder,
      clock: Clock,
      book: BookOpen,
      'file-text': FileText,
      package: Package,
      link: LinkIcon,
      layers: Layers,
      tag: FileText,
    };
    return icons[iconName] || FileText;
  };

  return (
    <>
      <PageLoadingBar loading={loading && !data} />
      <div className="h-full flex flex-col gap-4 p-4 overflow-y-auto">
        <Panel title="Knowledge Recommendations">
        <p className="text-sm text-white/60 mb-4">
          Curated knowledge cards and bundles based on your project. Discover relevant knowledge organized by category, type, and usage patterns.
        </p>
        {loading && !data ? (
          <div className="text-center py-8 text-white/40">Loading recommendations...</div>
        ) : !data ? (
          <div className="text-center py-8 text-red-400">Failed to load recommendations</div>
        ) : data?.stats ? (
          <>
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-white/5 border border-white/10 rounded-lg">
            <div className="text-2xl font-bold text-emerald-400">{data.stats.total}</div>
            <div className="text-xs text-white/60">Total Items</div>
          </div>
          <div className="text-center p-3 bg-white/5 border border-white/10 rounded-lg">
            <div className="text-2xl font-bold text-emerald-400">{data.stats.categories}</div>
            <div className="text-xs text-white/60">Categories</div>
          </div>
          <div className="text-center p-3 bg-white/5 border border-white/10 rounded-lg">
            <div className="text-2xl font-bold text-emerald-400">{data.stats.readmes}</div>
            <div className="text-xs text-white/60">READMEs</div>
          </div>
          <div className="text-center p-3 bg-white/5 border border-white/10 rounded-lg">
            <div className="text-2xl font-bold text-emerald-400">{data.stats.docs}</div>
            <div className="text-xs text-white/60">Docs</div>
          </div>
        </div>
          </>
        ) : (
          <div className="text-center py-8 text-yellow-400">Data loaded but stats are unavailable</div>
        )}
      </Panel>

      {data && (
        <>
      <div>
        <h2 className="text-lg font-semibold mb-4">Knowledge Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.cards.map((card, idx) => {
            const Icon = getIcon(card.icon);
            return (
              <Panel key={idx} title={card.title} className="h-full transition-all duration-100 ease-out hover:scale-[1.02] hover:shadow-lg">
                <p className="text-xs text-white/60 mb-4">{card.description}</p>
                <div className="space-y-2">
                  {card.items.slice(0, 5).map((item) => (
                    <Link
                      key={item.id}
                      href={item.url}
                      className="block p-2 rounded border border-white/10 bg-white/5 hover:bg-white/10 hover:border-emerald-400/30 transition-all duration-100 ease-out hover:scale-[1.01] hover:shadow-md"
                    >
                      <div className="text-sm font-medium mb-1">{item.title}</div>
                      <div className="text-xs text-white/60 line-clamp-2">
                        {item.spans[0]?.text || 'No description'}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <span className="px-1.5 py-0.5 text-[10px] rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                          {item.category}
                        </span>
                        <span className="px-1.5 py-0.5 text-[10px] rounded bg-white/10 text-white/60 border border-white/10">
                          {item.type}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
                {card.items.length > 5 && (
                  <div className="mt-3 text-xs text-white/40 text-center">
                    +{card.items.length - 5} more items
                  </div>
                )}
              </Panel>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Knowledge Bundles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.bundles.map((bundle) => {
            const Icon = getIcon(bundle.icon);
            return (
              <Panel key={bundle.id} title={bundle.title} className="h-full">
                <p className="text-xs text-white/60 mb-4">{bundle.description}</p>
                <div className="mb-3 flex flex-wrap gap-1">
                  {bundle.categories.map((cat) => (
                    <span
                      key={cat}
                      className="px-2 py-0.5 text-[10px] rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {bundle.items.map((item) => (
                    <Link
                      key={item.id}
                      href={item.url}
                      className="block p-2 rounded border border-white/10 bg-white/5 hover:bg-white/10 hover:border-emerald-400/30 transition-all"
                    >
                      <div className="text-sm font-medium mb-1">{item.title}</div>
                      <div className="text-xs text-white/60 line-clamp-2">
                        {item.spans[0]?.text || 'No description'}
                      </div>
                    </Link>
                  ))}
                </div>
              </Panel>
            );
          })}
        </div>
          </div>
        </>
        )}
      </div>
    </>
  );
}

