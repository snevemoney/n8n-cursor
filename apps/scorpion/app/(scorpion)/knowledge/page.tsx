'use client';

import { useState, useEffect } from 'react';
import { Panel, DataTable } from '@/components/scorpion';

interface KnowledgeItem {
  id: string;
  source: string;
  type: string;
  title: string;
  category: string;
  extracted: string;
}

export default function KnowledgePage() {
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]);
  const [selected, setSelected] = useState<KnowledgeItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKnowledge();
  }, []);

  const loadKnowledge = async () => {
    try {
      // Try new project knowledge API first
      const response = await fetch('/api/project/knowledge');
      if (response.ok) {
        const data = await response.json();
        setKnowledge(data.knowledge || []);
      } else {
        // Fallback to old API
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

  const MOCK_KNOWLEDGE: KnowledgeItem[] = [
    { id: 'K-001', source: 'LightningFlow', type: 'Architecture', title: 'Multi-tenant Payment System', category: 'payment', extracted: '2024-01-15' },
    { id: 'K-002', source: 'n8n-cursor', type: 'Pattern', title: 'Workflow Orchestration', category: 'automation', extracted: '2024-02-01' },
    { id: 'K-003', source: 'LightningFlow', type: 'Feature', title: 'Lightning Invoice Generation', category: 'payment', extracted: '2024-01-20' },
  ];

  const displayKnowledge = knowledge.length > 0 ? knowledge : MOCK_KNOWLEDGE;

  return (
    <div className="h-full grid grid-cols-[280px_1fr_400px] gap-4 p-4 overflow-y-auto">
      <Panel title="Filters">
        <div className="space-y-3">
          <div>
            <div className="sc-title mb-2">Source</div>
            <select className="w-full bg-white/5 border border-white/5 rounded-sm px-2 py-1 text-xs focus:outline-none focus:border-emerald-400/50 text-white">
              <option>All Sources</option>
              <option>LightningFlow</option>
              <option>n8n-cursor</option>
            </select>
          </div>
          <div>
            <div className="sc-title mb-2">Type</div>
            <select className="w-full bg-white/5 border border-white/5 rounded-sm px-2 py-1 text-xs focus:outline-none focus:border-emerald-400/50 text-white">
              <option>All Types</option>
              <option>Architecture</option>
              <option>Pattern</option>
              <option>Feature</option>
            </select>
          </div>
          <div>
            <div className="sc-title mb-2">Category</div>
            <select className="w-full bg-white/5 border border-white/5 rounded-sm px-2 py-1 text-xs focus:outline-none focus:border-emerald-400/50 text-white">
              <option>All Categories</option>
              <option>Payment</option>
              <option>Automation</option>
            </select>
          </div>
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
            data={displayKnowledge.map(k => ({
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
            <div>
              <div className="sc-title mb-1">Title</div>
              <div className="text-sm">{selected.title}</div>
            </div>
            <div>
              <div className="sc-title mb-1">Source</div>
              <div className="text-xs text-white/40">{selected.source}</div>
            </div>
            <div>
              <div className="sc-title mb-1">Type</div>
              <div className="text-xs text-white/40">{selected.type}</div>
            </div>
            <div>
              <div className="sc-title mb-1">Category</div>
              <div className="text-xs text-white/40">{selected.category}</div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-white/70">Select a knowledge item to preview...</div>
        )}
      </Panel>
    </div>
  );
}

