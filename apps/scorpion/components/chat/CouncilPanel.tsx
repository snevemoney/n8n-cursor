'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, Users, CheckCircle2, AlertCircle, XCircle, TrendingUp, Shield, Brain, Zap } from 'lucide-react';
import type { CouncilVote } from '@/lib/chat/types';


// Council member roles and their contributions to Scorpion
const councilRoles: Record<string, { icon: any; bgColor: string; borderColor: string; iconColor: string; contribution: string }> = {
  'Architectus': { 
    icon: Shield, 
    bgColor: 'bg-emerald-500/20', 
    borderColor: 'border-emerald-400/30', 
    iconColor: 'text-emerald-400',
    contribution: 'Ensures system architecture aligns with Scorpion\'s operational goals' 
  },
  'Analytica': { 
    icon: Brain, 
    bgColor: 'bg-blue-500/20', 
    borderColor: 'border-blue-400/30', 
    iconColor: 'text-blue-400',
    contribution: 'Optimizes knowledge retrieval and RAG strategies for Scorpion' 
  },
  'Pragmaton': { 
    icon: Zap, 
    bgColor: 'bg-yellow-500/20', 
    borderColor: 'border-yellow-400/30', 
    iconColor: 'text-yellow-400',
    contribution: 'Focuses on execution reliability and practical implementation' 
  },
  'Satori': { 
    icon: Shield, 
    bgColor: 'bg-purple-500/20', 
    borderColor: 'border-purple-400/30', 
    iconColor: 'text-purple-400',
    contribution: 'Maintains alignment with Scorpion\'s safety and ethical standards' 
  },
  'Nexus': { 
    icon: TrendingUp, 
    bgColor: 'bg-cyan-500/20', 
    borderColor: 'border-cyan-400/30', 
    iconColor: 'text-cyan-400',
    contribution: 'Manages integrations and API contracts for seamless operations' 
  },
  'Sentinel': { 
    icon: Shield, 
    bgColor: 'bg-red-500/20', 
    borderColor: 'border-red-400/30', 
    iconColor: 'text-red-400',
    contribution: 'Monitors security and performance to protect Scorpion\'s infrastructure' 
  },
  'Catalyst': { 
    icon: Zap, 
    bgColor: 'bg-orange-500/20', 
    borderColor: 'border-orange-400/30', 
    iconColor: 'text-orange-400',
    contribution: 'Balances innovation with complexity for sustainable growth' 
  },
  'Oracle': { 
    icon: TrendingUp, 
    bgColor: 'bg-indigo-500/20', 
    borderColor: 'border-indigo-400/30', 
    iconColor: 'text-indigo-400',
    contribution: 'Tracks metrics and observability to optimize Scorpion\'s performance' 
  },
};

interface CouncilPanelProps {
  votes: CouncilVote[];
  thinking?: Record<string, string>; // memberId -> thinking content
  communications?: any[]; // Array of communication events
}

/**
 * CouncilPanel - Enhanced display showing how council helps Scorpion
 * Now displays real-time thinking process and communications
 */
export function CouncilPanel({ votes, thinking = {}, communications = [] }: CouncilPanelProps) {
  const [expandedVote, setExpandedVote] = useState<string | null>(null);

  if (votes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-400/20 mb-4">
          <Users className="h-8 w-8 text-emerald-400" />
        </div>
        <h3 className="text-sm font-semibold text-white mb-2">Scorpion Council</h3>
        <p className="text-sm text-white/40">
          The council will deliberate on your request to ensure optimal outcomes for Scorpion operations.
        </p>
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
  
  const getVoteIcon = (vote: string) => {
    switch (vote) {
      case 'approve': return CheckCircle2;
      case 'revise': return AlertCircle;
      case 'reject': return XCircle;
      default: return Users;
    }
  };
  
  const getVoteColor = (vote: string) => {
    switch (vote) {
      case 'approve': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
      case 'revise': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'reject': return 'text-red-400 bg-red-400/10 border-red-400/30';
      default: return 'text-white/60 bg-white/5 border-white/10';
    }
  };
  
  const getMemberInfo = (name: string) => {
    return councilRoles[name] || { 
      icon: Users, 
      bgColor: 'bg-gray-500/20', 
      borderColor: 'border-gray-400/30', 
      iconColor: 'text-gray-400',
      contribution: 'Provides expert guidance to Scorpion' 
    };
  };
  
  const getScoreColor = (value: number, threshold: number = 5) => {
    return value > threshold ? 'emerald' : 'yellow';
  };
  
  const getScoreColorClasses = (color: 'emerald' | 'yellow') => {
    return color === 'emerald' 
      ? { text: 'text-emerald-400', bg: 'bg-emerald-400' }
      : { text: 'text-yellow-400', bg: 'bg-yellow-400' };
  };
  
  return (
    <div className="space-y-4">
      {/* Header - How Council Helps Scorpion */}
      <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-400/20 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center border border-emerald-400/30">
            <Users className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white mb-1">Scorpion Council Deliberation</h3>
            <p className="text-xs text-white/60 leading-relaxed">
              The council evaluates each plan to ensure it aligns with Scorpion's operational goals, 
              security standards, and performance requirements. Their collective expertise helps optimize 
              outcomes and minimize risks.
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Consensus Bar */}
      <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-sm font-medium text-white">Council Consensus</span>
            <p className="text-xs text-white/40 mt-0.5">Weighted approval score</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-white">{approvalPercent.toFixed(0)}%</span>
            <p className={`text-xs mt-0.5 ${
              approvalPercent >= 70 ? 'text-emerald-400' : 
              approvalPercent >= 50 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {approvalPercent >= 70 ? 'Strong Approval' : 
               approvalPercent >= 50 ? 'Conditional' : 'Needs Revision'}
            </p>
          </div>
        </div>
        
        <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-3">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              approvalPercent >= 70 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 
              approvalPercent >= 50 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' : 
              'bg-gradient-to-r from-red-400 to-red-500'
            }`}
            style={{ width: `${approvalPercent}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs">
          <div className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            <span>{approvals.length} Approve</span>
          </div>
          <div className="flex items-center gap-1 text-yellow-400">
            <AlertCircle className="h-3 w-3" />
            <span>{revisions.length} Revise</span>
          </div>
          <div className="flex items-center gap-1 text-red-400">
            <XCircle className="h-3 w-3" />
            <span>{rejections.length} Reject</span>
          </div>
        </div>
      </div>
      
      {/* Individual Votes - Enhanced with Member Info */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wide px-1">
          Council Members
        </h4>
        {votes.map((vote) => {
          const VoteIcon = getVoteIcon(vote.vote);
          const memberInfo = getMemberInfo(vote.agentName);
          const MemberIcon = memberInfo.icon;
          
          return (
            <div key={vote.agentId} className="border border-white/10 rounded-lg overflow-hidden bg-[#0f1318]/50 hover:bg-[#0f1318]/70 transition-colors">
              <button
                onClick={() => setExpandedVote(expandedVote === vote.agentId ? null : vote.agentId)}
                className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors"
              >
                {/* Member Avatar with Role Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${memberInfo.bgColor} ${memberInfo.borderColor} border flex items-center justify-center`}>
                  <MemberIcon className={`h-5 w-5 ${memberInfo.iconColor}`} />
                </div>
                
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-white">{vote.agentName}</span>
                    <div className={`px-2 py-0.5 rounded text-xs border flex items-center gap-1 ${getVoteColor(vote.vote)}`}>
                      <VoteIcon className="h-3 w-3" />
                      <span>{vote.vote.toUpperCase()}</span>
                    </div>
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed">{memberInfo.contribution}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-white/40">
                      {(vote.confidence * 100).toFixed(0)}% confidence
                    </span>
                    <span className="text-xs text-white/40">
                      Weight: {vote.weight.toFixed(1)}x
                    </span>
                  </div>
                </div>
                
                {expandedVote === vote.agentId ? (
                  <ChevronDown className="h-4 w-4 text-white/40 flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-white/40 flex-shrink-0" />
                )}
              </button>
              
              {expandedVote === vote.agentId && (
                <div className="border-t border-white/10 p-4 space-y-4 bg-black/20">
                  {/* Thinking Process - Show real-time thinking */}
                  {thinking[vote.agentId] && (
                    <div>
                      <div className="text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide flex items-center gap-2">
                        <Brain className="h-3 w-3" />
                        Thinking Process
                      </div>
                      <div className="text-sm text-white/70 leading-relaxed bg-emerald-500/10 p-3 rounded border border-emerald-400/20 font-mono text-xs max-h-48 overflow-y-auto">
                        {thinking[vote.agentId]}
                      </div>
                    </div>
                  )}
                  
                  {/* Communications - Show what member said */}
                  {communications.filter(c => c.memberId === vote.agentId).map((comm, i) => (
                    <div key={i}>
                      <div className="text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        Communication
                      </div>
                      <div className="text-sm text-white/80 leading-relaxed bg-blue-500/10 p-3 rounded border border-blue-400/20">
                        {comm.message}
                      </div>
                      <div className="text-xs text-white/40 mt-2">
                        Vote: <span className="font-semibold">{comm.vote}</span> • Confidence: {(comm.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                  
                  {/* Rationale */}
                  <div>
                    <div className="text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide">
                      Final Rationale
                    </div>
                    <div className="text-sm text-white/80 leading-relaxed bg-white/5 p-3 rounded border border-white/10">
                      {vote.rationale}
                    </div>
                  </div>
                  
                  {/* Scores Grid */}
                  {vote.scores && (
                    <div>
                      <div className="text-xs font-semibold text-white/60 mb-2 uppercase tracking-wide">
                        Evaluation Scores
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: 'Scope Fit', value: vote.scores.scope, color: getScoreColor(vote.scores.scope, 5) },
                          { label: 'Risk Level', value: vote.scores.risk, color: getScoreColor(vote.scores.risk, 5) },
                          { label: 'Cost/Time', value: vote.scores.cost, color: getScoreColor(vote.scores.cost, 5) },
                          { label: 'Success Prob', value: vote.scores.prob, color: getScoreColor(vote.scores.prob, 7) },
                        ].map((score, i) => {
                          const colorClasses = getScoreColorClasses(score.color as 'emerald' | 'yellow');
                          return (
                            <div key={i} className="p-3 bg-white/5 rounded border border-white/10">
                              <div className="text-xs text-white/40 mb-1">{score.label}</div>
                              <div className="flex items-center gap-2">
                                <div className={`text-sm font-bold ${colorClasses.text}`}>
                                  {score.value}/10
                                </div>
                                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${colorClasses.bg} rounded-full`}
                                    style={{ width: `${(score.value / 10) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

