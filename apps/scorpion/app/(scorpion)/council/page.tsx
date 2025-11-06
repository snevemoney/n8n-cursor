'use client';

import { useState, useEffect } from 'react';
import { Panel, Metric, LogRow } from '@/components/scorpion';

interface CouncilMember {
  name: string;
  role: string;
  specialty: string;
  weight: number;
  goal: string;
  reply?: string;
}

interface CouncilResult {
  members: CouncilMember[];
  consensus: {
    score: number;
    summary: string;
  };
}

export default function CouncilPage() {
  const [topic, setTopic] = useState('How should we integrate the local model?');
  const [result, setResult] = useState<CouncilResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<CouncilMember[]>([]);

  useEffect(() => {
    fetch('/api/council')
      .then(res => res.json())
      .then(data => setMembers(data.members || []))
      .catch(err => console.error('Failed to load members:', err));
  }, []);

  async function runCouncil() {
    if (!topic.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/council', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-full grid grid-cols-[280px_1.1fr_0.7fr] gap-4 p-4 overflow-y-auto">
      <Panel title="Council Members">
        <div className="space-y-2">
          {members.map((member) => (
            <div key={member.name} className="border border-white/5 rounded-sm p-2 bg-white/0 hover:bg-white/5 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm font-semibold">{member.name}</div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
              </div>
              <div className="text-xs text-white/40">{member.role}</div>
              <div className="text-[10px] text-white/30 mt-1">Weight: {member.weight}x</div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="space-y-4">
        <Panel title="Hold Council Meeting">
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full bg-white/5 border border-white/5 rounded-sm px-3 py-2 text-sm mb-2 focus:outline-none focus:border-emerald-400/50 text-white placeholder-white/30"
            rows={3}
            disabled={loading}
            placeholder="Enter topic for council deliberation..."
          />
          <button
            onClick={runCouncil}
            disabled={loading}
            className="px-4 py-2 bg-emerald-500/20 border border-emerald-400/50 rounded-sm text-sm hover:bg-emerald-500/30 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Deliberating...' : 'Run Council'}
          </button>
        </Panel>

        {result && (
          <>
            <Metric label="Consensus Score" value={`${result.consensus.score}/10`} />
            <Panel title="Deliberation Transcript">
              <div className="space-y-3">
                {result.members.map((m, idx) => (
                  <details key={idx} className="border border-white/5 rounded-sm p-2">
                    <summary className="cursor-pointer text-sm font-semibold mb-2">
                      {m.name} — {m.role}
                    </summary>
                    <div className="text-xs text-white/70 mt-2 whitespace-pre-wrap">{m.reply}</div>
                  </details>
                ))}
              </div>
            </Panel>
          </>
        )}
      </div>

      <Panel title="Decision Log">
        <div className="space-y-0">
          <LogRow time="2025-06-27 14:33" text="Deploy new feature - Consensus: 8.2/10" />
          <LogRow time="2025-06-27 12:04" text="Optimize workflow - Consensus: 7.5/10" />
          <LogRow time="2025-06-27 10:52" text="Train model - Consensus: 6.8/10" />
        </div>
      </Panel>
    </div>
  );
}

