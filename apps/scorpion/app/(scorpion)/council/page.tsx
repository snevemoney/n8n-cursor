'use client';

import { useState, useEffect } from 'react';
import { Panel, Metric, LogRow, LoadingState, ErrorState, EmptyState, PageLoadingBar } from '@/components/scorpion';
import { Users } from 'lucide-react';

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

interface CouncilThinking {
  [memberId: string]: string;
}

interface CouncilCommunication {
  memberId: string;
  memberName: string;
  message: string;
  vote: string;
  confidence: number;
}

export default function CouncilPage() {
  const [topic, setTopic] = useState('How should we integrate the local model?');
  const [result, setResult] = useState<CouncilResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [councilError, setCouncilError] = useState<Error | null>(null);
  const [members, setMembers] = useState<CouncilMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false); // Start false so page renders immediately
  const [membersError, setMembersError] = useState<Error | null>(null);
  const [liveResponses, setLiveResponses] = useState<CouncilMember[]>([]);
  const [currentSpeaker, setCurrentSpeaker] = useState<string | null>(null);
  const [councilThinking, setCouncilThinking] = useState<CouncilThinking>({});
  const [councilCommunications, setCouncilCommunications] = useState<CouncilCommunication[]>([]);
  const [consensus, setConsensus] = useState<{ score: number; summary: string } | null>(null);

  useEffect(() => {
    // Defer data fetch aggressively so page renders instantly
    const loadMembers = async () => {
      try {
        setMembersError(null);
        // Only show loading spinner on initial load
        if (members.length === 0) {
          setMembersLoading(true);
        }
        const response = await fetch('/api/council');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setMembers(result.data.members || []);
          } else {
            // Fallback for old API format
            setMembers(result.members || []);
          }
        } else {
          throw new Error(`Failed to load council members: ${response.statusText}`);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to load council members');
        console.error('Failed to load members:', error);
        setMembersError(error);
      } finally {
        setMembersLoading(false);
      }
    };
    
    const loadData = () => {
      loadMembers();
    };
    
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(loadData, { timeout: 0 }); // Immediate - no delay
    } else {
      setTimeout(loadData, 0); // Immediate fallback
    }
  }, []);

  async function runCouncil() {
    if (!topic.trim() || loading) return;
    setLoading(true);
    setCouncilError(null);
    setResult(null);
    setLiveResponses([]);
    setCurrentSpeaker(null);
    setCouncilThinking({});
    setCouncilCommunications([]);
    setConsensus(null);
    
    try {
      const response = await fetch('/api/council', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('No response body');
      }
      
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue;
          
          try {
            const event = JSON.parse(line.slice(6));
            
            switch (event.type) {
              case 'connected':
                console.log('[Council] Connected:', event.data.message);
                break;
                
              case 'council_start':
                console.log('[Council] Meeting started');
                break;
                
              case 'council_thinking':
                if (event.data.memberName) {
                  // Update thinking state immediately
                  if (event.data.status === 'starting' || event.data.status === 'analyzing' || event.data.status === 'formulating') {
                    setCurrentSpeaker(event.data.memberName);
                    // Initialize thinking content if not present
                    setCouncilThinking(prev => ({
                      ...prev,
                      [event.data.memberId]: prev[event.data.memberId] || `${event.data.memberName} is ${event.data.status}...`,
                    }));
                  }
                  
                  // If completed, add to live responses with FULL text
                  if (event.data.status === 'completed' && event.data.fullResponse) {
                    // Use full response, not truncated thinking
                    const fullResponse = event.data.fullResponse;
                    
                    setLiveResponses(prev => {
                      // Avoid duplicates - update existing if present
                      if (prev.some(r => r.name === event.data.memberName)) {
                        return prev.map(r => 
                          r.name === event.data.memberName 
                            ? { ...r, reply: fullResponse }
                            : r
                        );
                      }
                      return [...prev, {
                        name: event.data.memberName,
                        role: event.data.memberRole || 'Specialist',
                        specialty: '',
                        weight: 1.0,
                        goal: '',
                        reply: fullResponse, // Full text, not truncated
                      }];
                    });
                    
                    // Keep thinking visible briefly, then clear (with delay)
                    setTimeout(() => {
                      setCouncilThinking(prev => {
                        const next = { ...prev };
                        delete next[event.data.memberId];
                        return next;
                      });
                    }, 2000); // Keep visible for 2 seconds after completion
                    
                    setCurrentSpeaker(null);
                  }
                }
                break;
                
              case 'council_thinking_delta':
                // Update thinking content in real-time
                setCouncilThinking(prev => ({
                  ...prev,
                  [event.data.memberId]: event.data.accumulated,
                }));
                
                // Update current speaker
                if (event.data.memberName) {
                  setCurrentSpeaker(event.data.memberName);
                }
                break;
                
              case 'council_communication':
                setCouncilCommunications(prev => [...prev, event.data]);
                break;
                
              case 'council_consensus':
                setConsensus(event.data);
                setResult({
                  members: liveResponses,
                  consensus: event.data,
                });
                break;
                
              case 'done':
                setLoading(false);
                setCurrentSpeaker(null);
                break;
                
              case 'error':
                console.error('[Council] Error:', event.data);
                const errorMessage = event.data?.message || 'Council deliberation failed';
                setCouncilError(new Error(errorMessage));
                setLoading(false);
                break;
            }
          } catch (e) {
            console.error('[Council] Failed to parse event:', e, line);
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to run council meeting. Please try again.';
      setCouncilError(new Error(errorMessage));
      setLoading(false);
      setCurrentSpeaker(null);
    }
  }

  return (
    <>
      <PageLoadingBar loading={membersLoading && members.length === 0} />
    <div className="h-full grid grid-cols-[280px_1.1fr_0.7fr] gap-4 p-4 overflow-y-auto">
      <Panel title="Council Members">
        {membersLoading ? (
          <LoadingState text="Loading members..." />
        ) : membersError ? (
          <ErrorState
            error={membersError}
            onRetry={() => window.location.reload()}
            title="Failed to load members"
            fullPage={false}
          />
        ) : members.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No council members"
            message="Council members could not be loaded"
            fullPage={false}
          />
        ) : (
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
        )}
      </Panel>

      <div className="space-y-4">
        <Panel title="Hold Council Meeting">
          {councilError && (
            <div className="mb-4">
              <ErrorState
                error={councilError}
                onRetry={() => {
                  setCouncilError(null);
                  runCouncil();
                }}
                title="Council deliberation failed"
                fullPage={false}
              />
            </div>
          )}
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
        {(loading || liveResponses.length > 0 || Object.keys(councilThinking).length > 0) && (
          <Panel title="Live Deliberation Feed">
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {/* Show completed responses first - full text, highly recognizable */}
              {liveResponses.map((m, idx) => {
                const member = members.find(mem => mem.name === m.name);
                const memberWeight = member?.weight || 1.0;
                
                return (
                  <div key={`${m.name}-${idx}`} className="border-2 border-emerald-500/30 rounded-lg p-5 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 animate-fade-in shadow-lg">
                    <div className="flex items-start gap-4 mb-3">
                      {/* Large, recognizable avatar/indicator */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-emerald-400/50 flex items-center justify-center">
                          <div className="w-6 h-6 bg-emerald-400 rounded-full"></div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        {/* Agent header - very recognizable */}
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <div className="text-lg font-bold text-emerald-300 sc-title">{m.name}</div>
                          <div className="text-sm text-white/60 sc-mono">— {m.role}</div>
                          <div className="px-2 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded text-xs text-emerald-300 sc-mono">
                            Weight: {memberWeight}x
                          </div>
                        </div>
                        {/* Full response text - no truncation */}
                        <div className="text-sm text-white/90 whitespace-pre-wrap leading-relaxed pl-2 border-l-3 border-emerald-500/40 pl-4">
                          {m.reply || 'No response'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Show thinking in progress - don't clear immediately */}
              {Object.entries(councilThinking).map(([memberId, thinking]) => {
                // Only show if not already in liveResponses (with delay)
                const alreadyShown = liveResponses.some(r => {
                  const comm = councilCommunications.find(c => c.memberId === memberId);
                  return comm?.memberName === r.name;
                });
                
                if (alreadyShown) return null;
                
                const comm = councilCommunications.find(c => c.memberId === memberId);
                const memberName = comm?.memberName || memberId;
                const member = members.find(m => m.name === memberName);
                const memberRole = member?.role || 'Specialist';
                const memberWeight = member?.weight || 1.0;
                
                return (
                  <div key={memberId} className="border-2 border-yellow-500/30 rounded-lg p-5 bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 animate-fade-in shadow-lg">
                    <div className="flex items-start gap-4 mb-2">
                      {/* Large, recognizable avatar/indicator */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-yellow-500/20 border-2 border-yellow-400/50 flex items-center justify-center">
                          <div className="w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        {/* Agent header */}
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <div className="text-lg font-bold text-yellow-300 sc-title">{memberName}</div>
                          <div className="text-sm text-white/60 sc-mono">— {memberRole}</div>
                          <div className="px-2 py-1 bg-yellow-500/20 border border-yellow-400/30 rounded text-xs text-yellow-300 sc-mono">
                            Weight: {memberWeight}x
                          </div>
                          <div className="text-xs text-yellow-400/70 sc-mono italic animate-pulse">thinking...</div>
                        </div>
                        {/* Full thinking text - no truncation */}
                        <div className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed pl-2 border-l-3 border-yellow-500/40 pl-4">
                          {thinking}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Show current speaker thinking (fallback) */}
              {currentSpeaker && !councilThinking[currentSpeaker] && !liveResponses.some(r => r.name === currentSpeaker) && (
                <div className="border border-yellow-500/20 rounded-lg p-4 bg-yellow-500/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-500/20 border border-yellow-400/50 flex items-center justify-center">
                      <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                    </div>
                    <div className="text-base font-semibold text-yellow-300">{currentSpeaker}</div>
                    <div className="text-sm text-white/50 sc-mono italic">is preparing their response...</div>
                  </div>
                </div>
              )}
            </div>
          </Panel>
        )}

        {/* Final Consensus */}
        {consensus && !loading && (
          <Panel title="Final Consensus">
            <div className="space-y-3">
              <Metric label="Consensus Score" value={`${consensus.score.toFixed(1)}/10`} />
              {consensus.summary && (
                <div className="text-sm text-white/80 whitespace-pre-wrap mt-3 p-3 bg-white/5 rounded-sm border border-white/10">
                  {consensus.summary}
                </div>
              )}
            </div>
          </Panel>
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
    </>
  );
}
