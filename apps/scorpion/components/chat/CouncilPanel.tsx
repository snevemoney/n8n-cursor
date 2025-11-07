'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { CouncilVote } from '@/lib/chat/types';

interface CouncilPanelProps {
  votes: CouncilVote[];
}

/**
 * CouncilPanel - Display council votes and consensus
 */
export function CouncilPanel({ votes }: CouncilPanelProps) {
  const [expandedVote, setExpandedVote] = useState<string | null>(null);
  
  if (votes.length === 0) {
    return (
      <div className="text-sm text-white/40 text-center py-8">
        No council votes yet
      </div>
    );
  }
  
  // Calculate consensus
  const totalWeight = votes.reduce((sum, v) => sum + v.weight, 0);
  const approvals = votes.filter(v => v.vote === 'approve');
  const revisions = votes.filter(v => v.vote === 'revise');
  const rejections = votes.filter(v => v.vote === 'reject');
  
  const approvalWeight = approvals.reduce((sum, v) => sum + v.weight * v.confidence, 0);
  const approvalPercent = (approvalWeight / totalWeight) * 100;
  
  const getVoteColor = (vote: string) => {
    switch (vote) {
      case 'approve': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
      case 'revise': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'reject': return 'text-red-400 bg-red-400/10 border-red-400/30';
      default: return 'text-white/60 bg-white/5 border-white/10';
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Consensus Bar */}
      <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/60">Council Consensus</span>
          <span className="text-lg font-bold text-white">{approvalPercent.toFixed(0)}%</span>
        </div>
        
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              approvalPercent >= 60 ? 'bg-emerald-400' : 'bg-yellow-400'
            }`}
            style={{ width: `${approvalPercent}%` }}
          />
        </div>
        
        <div className="flex justify-between mt-2 text-xs">
          <span className="text-emerald-400">{approvals.length} Approve</span>
          <span className="text-yellow-400">{revisions.length} Revise</span>
          <span className="text-red-400">{rejections.length} Reject</span>
        </div>
      </div>
      
      {/* Individual Votes */}
      <div className="space-y-2">
        {votes.map((vote) => (
          <div key={vote.agentId} className="border border-white/10 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpandedVote(expandedVote === vote.agentId ? null : vote.agentId)}
              className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
            >
              <div className="flex-1 flex items-center gap-3">
                <div className="text-sm font-medium text-white">{vote.agentName}</div>
                <div className={`px-2 py-1 rounded text-xs border ${getVoteColor(vote.vote)}`}>
                  {vote.vote.toUpperCase()}
                </div>
                <div className="text-xs text-white/40">
                  {(vote.confidence * 100).toFixed(0)}% confidence
                </div>
              </div>
              
              {expandedVote === vote.agentId ? (
                <ChevronDown className="h-4 w-4 text-white/40" />
              ) : (
                <ChevronRight className="h-4 w-4 text-white/40" />
              )}
            </button>
            
            {expandedVote === vote.agentId && (
              <div className="border-t border-white/10 p-3 space-y-3 bg-black/20">
                {/* Rationale */}
                <div>
                  <div className="text-xs text-white/40 mb-1">Rationale:</div>
                  <div className="text-sm text-white/80">{vote.rationale}</div>
                </div>
                
                {/* Scores */}
                {vote.scores && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-white/5 rounded">
                      <div className="text-xs text-white/40">Scope Fit</div>
                      <div className="text-sm font-medium text-white">{vote.scores.scope}/10</div>
                    </div>
                    <div className="p-2 bg-white/5 rounded">
                      <div className="text-xs text-white/40">Risk</div>
                      <div className="text-sm font-medium text-white">{vote.scores.risk}/10</div>
                    </div>
                    <div className="p-2 bg-white/5 rounded">
                      <div className="text-xs text-white/40">Cost/Time</div>
                      <div className="text-sm font-medium text-white">{vote.scores.cost}/10</div>
                    </div>
                    <div className="p-2 bg-white/5 rounded">
                      <div className="text-xs text-white/40">Success Prob</div>
                      <div className="text-sm font-medium text-white">{vote.scores.prob}/10</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

