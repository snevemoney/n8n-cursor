'use client';

import { useState, useEffect, useMemo } from 'react';
import { Panel, DataTable, useToast } from '@/components/scorpion';

interface KnowledgeItem {
  id: string;
  source: string;
  type: string;
  title: string;
  category: string;
  extracted: string;
  description?: string;
}

export default function KnowledgePage() {
  const { showToast } = useToast();
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]);
  const [selected, setSelected] = useState<KnowledgeItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  // Filter states
  const [sourceFilter, setSourceFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    setMounted(true);
    loadKnowledge();
  }, []);

  const loadKnowledge = async () => {
    try {
      const response = await fetch('/api/project/knowledge');
      if (response.ok) {
        const data = await response.json();
        setKnowledge(data.knowledge || []);
      } else {
        const fallbackResponse = await fetch('/api/build');
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          setKnowledge(fallbackData.knowledge || []);
        }
      }
    } catch (error) {
      console.error('Failed to load knowledge:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewFull = async (item: KnowledgeItem) => {
    showToast('info', `Viewing ${item.title} - full preview coming soon!`);
    // TODO: Open modal with full content
    // setSelected(item);
    // openDetailModal();
  };

  const handleExtract = async (item: KnowledgeItem) => {
    try {
      showToast('info', 'Starting content extraction...');
      const response = await fetch('/api/project/knowledge/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, source: item.source })
      });
      
      if (response.ok) {
        showToast('success', 'Content extraction started! Knowledge base will be updated.');
        await loadKnowledge(); // Refresh
      } else {
        throw new Error('Extraction failed');
      }
    } catch (error) {
      console.error('Extract failed:', error);
      showToast('error', 'Failed to extract content. Please try again.');
    }
  };

  const handleExport = (item: KnowledgeItem) => {
    // Export as JSON
    const dataStr = JSON.stringify(item, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `knowledge-${item.id}.json`;
    link.click();
  };

  const displayKnowledge = knowledge;

  // Apply filters
  const filteredKnowledge = useMemo(() => {
    return displayKnowledge.filter(item => {
      if (sourceFilter !== 'all' && item.source !== sourceFilter) return false;
      if (typeFilter !== 'all' && item.type !== typeFilter) return false;
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      return true;
    });
  }, [displayKnowledge, sourceFilter, typeFilter, categoryFilter]);

  // Extract unique filter options
  const sources = useMemo(() => ['all', ...new Set(displayKnowledge.map(k => k.source))], [displayKnowledge]);
  const types = useMemo(() => ['all', ...new Set(displayKnowledge.map(k => k.type))], [displayKnowledge]);
  const categories = useMemo(() => ['all', ...new Set(displayKnowledge.map(k => k.category))], [displayKnowledge]);

  // Don't render content until client-side hydration is complete
  if (!mounted || loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-sm text-white/40">Loading knowledge...</div>
      </div>
    );
  }

  return (
    <div className="h-full max-w-[1000px] mx-auto grid grid-cols-[180px_1fr_240px] gap-2 p-3 overflow-y-auto">
      <Panel title="Filters">
        <div className="space-y-3">
          <div>
            <div className="sc-title mb-2">Source</div>
            <select 
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-sm px-2 py-1 text-xs focus:outline-none focus:border-emerald-400/50 text-white"
            >
              <option value="all">All Sources</option>
              {sources.filter(s => s !== 'all').map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="sc-title mb-2">Type</div>
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-sm px-2 py-1 text-xs focus:outline-none focus:border-emerald-400/50 text-white"
            >
              <option value="all">All Types</option>
              {types.filter(t => t !== 'all').map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="sc-title mb-2">Category</div>
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-sm px-2 py-1 text-xs focus:outline-none focus:border-emerald-400/50 text-white"
            >
              <option value="all">All Categories</option>
              {categories.filter(c => c !== 'all').map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          {/* Active Filters Summary */}
          {(sourceFilter !== 'all' || typeFilter !== 'all' || categoryFilter !== 'all') && (
            <div className="pt-2 border-t border-white/10">
              <div className="text-xs text-white/60">
                Showing {filteredKnowledge.length} of {displayKnowledge.length} items
              </div>
              <button
                onClick={() => {
                  setSourceFilter('all');
                  setTypeFilter('all');
                  setCategoryFilter('all');
                }}
                className="mt-2 text-xs text-blue-400 hover:text-blue-300"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </Panel>

      <Panel title="Knowledge Base">
        {loading ? (
          <div className="text-sm text-white/40">Loading knowledge...</div>
        ) : (
          <DataTable
            columns={[
              { key: 'id', label: 'ID' },
              { key: 'source', label: 'Source' },
              { key: 'type', label: 'Type' },
              { key: 'title', label: 'Title' },
              { key: 'extracted', label: 'Extracted' },
            ]}
            data={filteredKnowledge.map(k => ({
              id: <span className="sc-mono cursor-pointer hover:text-emerald-300" onClick={() => setSelected(k)}>{k.id}</span>,
              source: k.source,
              type: k.type,
              title: k.title,
              extracted: k.extracted,
            }))}
          />
        )}
      </Panel>

      <Panel title="Preview">
        {selected ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-white/40 mb-1">ID: {selected.id}</div>
                <div className="text-sm font-semibold">{selected.title}</div>
              </div>
              <button
                onClick={() => handleViewFull(selected)}
                className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded transition-colors"
              >
                View Full
              </button>
            </div>
            
            <div className="text-xs text-white/60 space-y-1">
              <div><span className="text-white/40">Source:</span> {selected.source}</div>
              <div><span className="text-white/40">Type:</span> {selected.type}</div>
              <div><span className="text-white/40">Category:</span> {selected.category}</div>
              <div><span className="text-white/40">Extracted:</span> {selected.extracted}</div>
            </div>

            {/* Content Preview */}
            <div className="mt-4 border-t border-white/10 pt-3">
              <div className="text-xs text-white/40 mb-2">Content Preview:</div>
              <div className="bg-black/30 rounded p-3 max-h-[400px] overflow-y-auto">
                {selected.description ? (
                  <div className="text-sm text-white/80 whitespace-pre-wrap">
                    {selected.description}
                  </div>
                ) : (
                  <div className="text-xs text-white/40 italic">
                    No content available for preview.
                    <br /><br />
                    This knowledge item contains metadata only.
                    Click "View Full" to see all details or "Extract" to pull content from source.
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleExtract(selected)}
                className="flex-1 px-3 py-2 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors"
              >
                Extract Full Content
              </button>
              <button
                onClick={() => handleExport(selected)}
                className="flex-1 px-3 py-2 text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors"
              >
                Export
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm text-white/40 flex flex-col items-center justify-center h-full gap-3">
            <div>Select an item to preview</div>
            <div className="text-xs text-white/30 text-center max-w-xs">
              Click on any knowledge item in the list to view its details, content preview, and available actions.
            </div>
          </div>
        )}
      </Panel>
    </div>
  );
}

