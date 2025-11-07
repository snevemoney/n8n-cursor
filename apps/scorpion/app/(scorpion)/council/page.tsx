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
  const [liveResponses, setLiveResponses] = useState<CouncilMember[]>([]);
  const [currentSpeaker, setCurrentSpeaker] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/council')
      .then(res => res.json())
      .then(data => setMembers(data.members || []))
      .catch(err => console.error('Failed to load members:', err));
  }, []);

  async function runCouncil() {
    if (!topic.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setLiveResponses([]);
    setCurrentSpeaker(null);
    
    try {
      const res = await fetch('/api/council', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      
      // Validate response structure
      if (data.error) {
        console.error('Council error:', data.error);
        alert(`Council meeting failed: ${data.error}`);
        setLoading(false);
        return;
      }
      
      if (!data.consensus || !data.members) {
        console.error('Invalid council response:', data);
        alert('Received invalid response from council. Please try again.');
        setLoading(false);
        return;
      }
      
      // Simulate real-time agent responses streaming in
      const agentResponses = data.members;
      for (let i = 0; i < agentResponses.length; i++) {
        setCurrentSpeaker(agentResponses[i].name);
        
        // Simulate thinking time (500-1500ms per agent)
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
        
        setLiveResponses(prev => [...prev, agentResponses[i]]);
        setCurrentSpeaker(null);
        
        // Small delay before next agent
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to run council meeting. Please try again.');
    } finally {
      setLoading(false);
      setCurrentSpeaker(null);
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

        {/* Live Deliberation Feed */}
        {(loading || liveResponses.length > 0) && (
          <Panel title="Live Deliberation Feed">
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {liveResponses.map((m, idx) => (
                <div key={idx} className="border border-emerald-500/20 rounded-sm p-3 bg-emerald-500/5 animate-fade-in">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <div className="text-sm font-semibold">{m.name}</div>
                    <div className="text-xs text-white/40">— {m.role}</div>
                  </div>
                  <div className="text-xs text-white/70 whitespace-pre-wrap pl-4 border-l-2 border-emerald-500/30">
                    {m.reply || 'No response'}
                  </div>
                </div>
              ))}
              
              {currentSpeaker && (
                <div className="border border-yellow-500/20 rounded-sm p-3 bg-yellow-500/5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <div className="text-sm font-semibold text-yellow-300">{currentSpeaker}</div>
                    <div className="text-xs text-white/40">is thinking...</div>
                  </div>
                </div>
              )}
            </div>
          </Panel>
        )}

        {/* Final Consensus */}
        {result && result.consensus && !loading && (
          <>
            <Panel title="Final Consensus">
              <div className="space-y-3">
                <Metric label="Consensus Score" value={`${result.consensus.score.toFixed(1)}/10`} />
                {result.consensus.summary && (
                  <div className="text-sm text-white/80 whitespace-pre-wrap mt-3 p-3 bg-white/5 rounded-sm border border-white/10">
                    {result.consensus.summary}
                  </div>
                )}
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

