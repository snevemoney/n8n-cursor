/**
 * Enhanced Council Attention Mechanism
 * 
 * Makes council members explicitly compute attention over inputs,
 * similar to transformer multi-head attention.
 * 
 * Power of 10 Rule 3: Functions ≤ 60 lines
 */

import type { CouncilVote } from '@/lib/chat/types';
import { MEMBERS } from '../council';

export interface AttentionScore {
  memberId: string;
  memberName: string;
  attentionWeight: number;  // 0-1, how much this member "attends to" the input
  focusAreas: string[];     // What parts of input they focus on
  confidence: number;       // Confidence in their attention
}

export interface CouncilAttentionResult {
  attentionScores: AttentionScore[];
  aggregatedAttention: number; // Overall attention (weighted sum)
  attentionDistribution: Record<string, number>; // Attention per focus area
}

/**
 * Calculate attention scores for council members
 * Based on their weights, confidence, and vote rationale
 */
export function calculateCouncilAttention(
  votes: CouncilVote[],
  inputText: string
): CouncilAttentionResult {
  const attentionScores: AttentionScore[] = [];
  const attentionDistribution: Record<string, number> = {};
  
  // Extract focus areas from input
  const focusAreas = extractFocusAreas(inputText);
  
  for (const vote of votes) {
    const member = MEMBERS.find(m => m.id === vote.agentId || m.name === vote.agentName);
    const weight = member?.weight || vote.weight || 1.0;
    const confidence = typeof vote.confidence === 'number' ? vote.confidence : 0.7;
    
    // Attention = weight * confidence * relevance
    const relevance = calculateRelevance(vote.rationale || '', inputText);
    const attentionWeight = Math.min(1.0, weight * confidence * relevance);
    
    // Determine focus areas from rationale
    const memberFocusAreas = determineFocusAreas(vote.rationale || '', focusAreas);
    
    attentionScores.push({
      memberId: vote.agentId || 'unknown',
      memberName: vote.agentName || 'Unknown',
      attentionWeight,
      focusAreas: memberFocusAreas,
      confidence,
    });
    
    // Aggregate attention distribution
    for (const area of memberFocusAreas) {
      attentionDistribution[area] = (attentionDistribution[area] || 0) + attentionWeight;
    }
  }
  
  // Normalize attention distribution
  const totalAttention = Object.values(attentionDistribution).reduce((a, b) => a + b, 0);
  if (totalAttention > 0) {
    for (const key in attentionDistribution) {
      attentionDistribution[key] /= totalAttention;
    }
  }
  
  // Calculate aggregated attention (weighted sum)
  const aggregatedAttention = attentionScores.reduce(
    (sum, score) => sum + score.attentionWeight,
    0
  ) / Math.max(1, attentionScores.length);
  
  return {
    attentionScores,
    aggregatedAttention,
    attentionDistribution,
  };
}

/**
 * Extract focus areas from input text
 */
function extractFocusAreas(text: string): string[] {
  const areas: string[] = [];
  const lowerText = text.toLowerCase();
  
  const areaKeywords: Record<string, string[]> = {
    security: ['security', 'secure', 'vulnerability', 'attack', 'threat'],
    performance: ['performance', 'speed', 'latency', 'optimize', 'fast'],
    ethics: ['ethics', 'bias', 'fair', 'unfair', 'discrimination'],
    architecture: ['architecture', 'design', 'structure', 'system'],
    data: ['data', 'database', 'storage', 'analytics'],
    ai: ['ai', 'model', 'llm', 'training', 'inference'],
  };
  
  for (const [area, keywords] of Object.entries(areaKeywords)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      areas.push(area);
    }
  }
  
  return areas.length > 0 ? areas : ['general'];
}

/**
 * Calculate relevance of vote rationale to input
 */
function calculateRelevance(rationale: string, input: string): number {
  if (!rationale || !input) return 0.5;
  
  const rationaleWords = rationale.toLowerCase().split(/\s+/);
  const inputWords = input.toLowerCase().split(/\s+/);
  
  // Count overlapping words
  const overlap = inputWords.filter(word => 
    rationaleWords.includes(word) && word.length > 3
  ).length;
  
  // Normalize by input length
  return Math.min(1.0, overlap / Math.max(1, inputWords.length));
}

/**
 * Determine which focus areas a member's rationale addresses
 */
function determineFocusAreas(rationale: string, availableAreas: string[]): string[] {
  const lowerRationale = rationale.toLowerCase();
  const memberAreas: string[] = [];
  
  for (const area of availableAreas) {
    const keywords: Record<string, string[]> = {
      security: ['security', 'secure', 'vulnerability'],
      performance: ['performance', 'speed', 'optimize'],
      ethics: ['ethics', 'bias', 'fair'],
      architecture: ['architecture', 'design', 'structure'],
      data: ['data', 'database', 'analytics'],
      ai: ['ai', 'model', 'llm'],
    };
    
    const areaKeywords = keywords[area] || [];
    if (areaKeywords.some(keyword => lowerRationale.includes(keyword))) {
      memberAreas.push(area);
    }
  }
  
  return memberAreas.length > 0 ? memberAreas : ['general'];
}

/**
 * Get attention-weighted consensus
 * Uses attention scores to weight votes more intelligently
 */
export function getAttentionWeightedConsensus(
  votes: CouncilVote[],
  attentionResult: CouncilAttentionResult
): {
  score: number;
  approved: boolean;
  summary: string;
} {
  let totalWeight = 0;
  let approvalWeight = 0;
  
  for (let i = 0; i < votes.length; i++) {
    const vote = votes[i];
    const attention = attentionResult.attentionScores[i];
    
    if (!attention) continue;
    
    // Weight by attention
    const weightedVoteWeight = (vote.weight || 1.0) * attention.attentionWeight;
    totalWeight += weightedVoteWeight;
    
    if (vote.vote === 'approve') {
      approvalWeight += weightedVoteWeight * (vote.confidence || 0.7);
    }
  }
  
  const approvalRatio = totalWeight > 0 ? approvalWeight / totalWeight : 0;
  const score = approvalRatio * 10;
  const approved = approvalRatio > 0.6;
  
  return {
    score,
    approved,
    summary: `Attention-weighted consensus: ${(approvalRatio * 100).toFixed(0)}% approval`,
  };
}

