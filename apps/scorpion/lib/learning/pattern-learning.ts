/**
 * Pattern Learning System
 * Learns from successful interactions and retrieves relevant patterns for similar queries
 */

import type { Plan } from '@scorpion/core';

export interface SuccessPattern {
  id: string;
  userQuery: string;
  normalizedQuery: string;
  queryType: 'research' | 'workflow' | 'codebase' | 'system' | 'general';
  plan: Plan;
  toolsUsed: string[];
  executionSuccess: boolean;
  councilApproval: boolean;
  feedbackScore?: number;
  timestamp: string;
  context?: {
    conversationLength?: number;
    previousQueries?: string[];
    userIntent?: string;
  };
}

export interface PatternMatch {
  pattern: SuccessPattern;
  similarityScore: number;
  matchReason: string;
}

export class PatternLearningSystem {
  private patterns: Map<string, SuccessPattern> = new Map();

  /**
   * Store a successful interaction pattern
   */
  async storeSuccessPattern(interaction: {
    userQuery: string;
    plan: Plan;
    councilResult?: any;
    executionSuccess: boolean;
    feedbackScore?: number;
    context?: SuccessPattern['context'];
  }): Promise<void> {
    const pattern: SuccessPattern = {
      id: this.generatePatternId(interaction.userQuery),
      userQuery: interaction.userQuery,
      normalizedQuery: this.normalizeQuery(interaction.userQuery),
      queryType: this.detectQueryType(interaction.userQuery),
      plan: interaction.plan,
      toolsUsed: this.extractToolsFromPlan(interaction.plan),
      executionSuccess: interaction.executionSuccess,
      councilApproval: interaction.councilResult?.approved ?? true,
      feedbackScore: interaction.feedbackScore,
      timestamp: new Date().toISOString(),
      context: interaction.context,
    };

    this.patterns.set(pattern.id, pattern);

    // Optionally persist to database/file
    await this.persistPattern(pattern);

    console.log(`✅ [Pattern Learning] Stored pattern: ${pattern.queryType} - "${interaction.userQuery}"`);
  }

  /**
   * Find relevant patterns for a new query
   */
  async findRelevantPatterns(query: string, limit = 5): Promise<PatternMatch[]> {
    const normalizedQuery = this.normalizeQuery(query);
    const queryType = this.detectQueryType(query);
    const queryKeywords = this.extractKeywords(query);

    const matches: PatternMatch[] = [];

    for (const pattern of this.patterns.values()) {
      // Skip failed patterns
      if (!pattern.executionSuccess || !pattern.councilApproval) continue;

      const similarity = this.calculateSimilarity(
        normalizedQuery,
        pattern.normalizedQuery,
        queryKeywords,
        this.extractKeywords(pattern.userQuery)
      );

      if (similarity > 0.3) { // Threshold for relevance
        matches.push({
          pattern,
          similarityScore: similarity,
          matchReason: this.generateMatchReason(query, pattern, similarity)
        });
      }
    }

    // Sort by similarity and feedback score
    matches.sort((a, b) => {
      const scoreA = a.similarityScore * (a.pattern.feedbackScore || 1.0);
      const scoreB = b.similarityScore * (b.pattern.feedbackScore || 1.0);
      return scoreB - scoreA;
    });

    const topMatches = matches.slice(0, limit);

    if (topMatches.length > 0) {
      console.log(`🎯 [Pattern Learning] Found ${topMatches.length} relevant patterns for: "${query}"`);
      topMatches.forEach(m => {
        console.log(`   - ${m.pattern.queryType} (${(m.similarityScore * 100).toFixed(0)}%): "${m.pattern.userQuery}"`);
      });
    }

    return topMatches;
  }

  /**
   * Generate improved plan based on learned patterns
   */
  generateImprovedPlan(
    query: string,
    basePlan: Plan,
    relevantPatterns: PatternMatch[]
  ): Plan {
    if (relevantPatterns.length === 0) return basePlan;

    // Find the best matching pattern
    const bestPattern = relevantPatterns[0].pattern;

    // Merge strategies from successful patterns
    const improvedPlan: Plan = {
      ...basePlan,
      // Use tools that worked in similar queries
      plan: this.mergeSteps(basePlan.plan || [], bestPattern.plan.plan || []),
      // Enhance with learned context
      assumptions: [
        ...(basePlan.assumptions || []),
        `Similar query "${bestPattern.userQuery}" was successful using: ${bestPattern.toolsUsed.join(', ')}`
      ]
    };

    console.log(`🔧 [Pattern Learning] Enhanced plan using pattern from: "${bestPattern.userQuery}"`);

    return improvedPlan;
  }

  /**
   * Get statistics about learned patterns
   */
  getStatistics(): {
    totalPatterns: number;
    byQueryType: Record<string, number>;
    successRate: number;
    topTools: Array<{ tool: string; count: number }>;
  } {
    const stats = {
      totalPatterns: this.patterns.size,
      byQueryType: {} as Record<string, number>,
      successRate: 0,
      topTools: [] as Array<{ tool: string; count: number }>
    };

    const toolCounts = new Map<string, number>();
    let successCount = 0;

    for (const pattern of this.patterns.values()) {
      // Count by query type
      stats.byQueryType[pattern.queryType] = (stats.byQueryType[pattern.queryType] || 0) + 1;

      // Count success rate
      if (pattern.executionSuccess && pattern.councilApproval) {
        successCount++;
      }

      // Count tool usage
      for (const tool of pattern.toolsUsed) {
        toolCounts.set(tool, (toolCounts.get(tool) || 0) + 1);
      }
    }

    stats.successRate = this.patterns.size > 0 ? successCount / this.patterns.size : 0;

    // Get top 10 most used tools
    stats.topTools = Array.from(toolCounts.entries())
      .map(([tool, count]) => ({ tool, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return stats;
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  private generatePatternId(query: string): string {
    return `${Date.now()}_${query.substring(0, 20).replace(/\s+/g, '_')}`;
  }

  private normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ')
      .trim();
  }

  private detectQueryType(query: string): SuccessPattern['queryType'] {
    const lower = query.toLowerCase();

    if (/research|find|search|discover|latest|news|competitors/.test(lower)) {
      return 'research';
    }
    if (/workflow|n8n|trigger|execute/.test(lower)) {
      return 'workflow';
    }
    if (/code|file|function|class|implement/.test(lower)) {
      return 'codebase';
    }
    if (/system|health|status|logs/.test(lower)) {
      return 'system';
    }

    return 'general';
  }

  private extractToolsFromPlan(plan: Plan): string[] {
    if (!plan.plan) return [];

    return plan.plan
      .map(step => step.tool)
      .filter((tool): tool is string => !!tool && tool !== 'none');
  }

  private extractKeywords(query: string): string[] {
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'my', 'your', 'how', 'what', 'when', 'where', 'why', 'which']);

    return this.normalizeQuery(query)
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
  }

  private calculateSimilarity(
    query1: string,
    query2: string,
    keywords1: string[],
    keywords2: string[]
  ): number {
    // Calculate keyword overlap
    const overlap = keywords1.filter(k => keywords2.includes(k)).length;
    const maxKeywords = Math.max(keywords1.length, keywords2.length);
    const keywordSimilarity = maxKeywords > 0 ? overlap / maxKeywords : 0;

    // Calculate string similarity (simple Levenshtein approximation)
    const stringSimilarity = this.stringSimilarity(query1, query2);

    // Weighted combination
    return keywordSimilarity * 0.7 + stringSimilarity * 0.3;
  }

  private stringSimilarity(s1: string, s2: string): number {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    if (longer.length === 0) return 1.0;

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  private levenshteinDistance(s1: string, s2: string): number {
    const costs: number[] = [];
    for (let i = 0; i <= s2.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= s1.length; j++) {
        if (i === 0) {
          costs[j] = j;
        } else if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(j - 1) !== s2.charAt(i - 1)) {
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          }
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[s1.length] = lastValue;
    }
    return costs[s1.length];
  }

  private generateMatchReason(query: string, pattern: SuccessPattern, similarity: number): string {
    const reasons: string[] = [];

    if (similarity > 0.8) {
      reasons.push('Very similar query structure');
    } else if (similarity > 0.5) {
      reasons.push('Similar query intent');
    }

    const queryKeywords = this.extractKeywords(query);
    const patternKeywords = this.extractKeywords(pattern.userQuery);
    const commonKeywords = queryKeywords.filter(k => patternKeywords.includes(k));

    if (commonKeywords.length > 0) {
      reasons.push(`Shared keywords: ${commonKeywords.join(', ')}`);
    }

    if (pattern.feedbackScore && pattern.feedbackScore > 0.8) {
      reasons.push('High user satisfaction');
    }

    return reasons.join(' • ');
  }

  private mergeSteps(baseSteps: any[], patternSteps: any[]): any[] {
    // If base plan is empty or generic, prefer pattern steps
    if (baseSteps.length === 0 || baseSteps[0]?.tool === 'none') {
      return patternSteps;
    }

    // Otherwise, keep base steps but add pattern steps if they use different tools
    const baseTools = new Set(baseSteps.map(s => s.tool));
    const additionalSteps = patternSteps.filter(s => !baseTools.has(s.tool));

    return [...baseSteps, ...additionalSteps.slice(0, 2)]; // Add max 2 additional steps
  }

  private async persistPattern(pattern: SuccessPattern): Promise<void> {
    try {
      // Store in knowledge base for RAG retrieval
      const kb = await import('../knowledge-base');
      await kb.storeInKnowledgeBase({
        id: pattern.id,
        content: JSON.stringify(pattern),
        metadata: {
          type: 'success_pattern',
          queryType: pattern.queryType,
          userQuery: pattern.userQuery,
          toolsUsed: pattern.toolsUsed.join(','),
          timestamp: pattern.timestamp,
        }
      });
    } catch (error) {
      console.warn('[Pattern Learning] Failed to persist pattern:', error);
    }
  }
}

// Export singleton instance
export const patternLearning = new PatternLearningSystem();
