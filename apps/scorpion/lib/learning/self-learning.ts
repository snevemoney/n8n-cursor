/**
 * Self-Learning System for Agents
 * Captures and learns from successful patterns to improve future performance
 */

import { getRAGStore } from '@/lib/shared-stores';
import { getTrainingDataCollector } from '@/lib/fine-tuning/collector';

export interface LearningPattern {
  id: string;
  type: 'tool_usage' | 'plan_structure' | 'council_pattern' | 'summarization' | 'question_type';
  pattern: Record<string, any>;
  successMetrics: {
    userSatisfaction?: number;
    executionTime?: number;
    toolAccuracy?: number;
    answerQuality?: number;
  };
  context: {
    questionType?: string;
    questionKeywords?: string[];
    toolsUsed?: string[];
    outcome?: 'success' | 'partial' | 'failure';
  };
  learnedAt: string;
  appliedCount: number;
  successRate: number;
}

export interface AgentLearning {
  agentId: string;
  agentName: string;
  patterns: LearningPattern[];
  totalInteractions: number;
  improvementRate: number;
  lastUpdated: string;
}

class SelfLearningSystem {
  private learnings: Map<string, AgentLearning> = new Map();
  private patternCache: Map<string, LearningPattern[]> = new Map();

  /**
   * Learn from a successful interaction
   */
  async learnFromSuccess(
    agentId: string,
    agentName: string,
    type: LearningPattern['type'],
    pattern: Record<string, any>,
    context: LearningPattern['context'],
    metrics: LearningPattern['successMetrics']
  ): Promise<void> {
    const learning = this.getOrCreateLearning(agentId, agentName);
    
    const learningPattern: LearningPattern = {
      id: `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      pattern,
      successMetrics: metrics,
      context,
      learnedAt: new Date().toISOString(),
      appliedCount: 0,
      successRate: 1.0, // Start with 100% for new patterns
    };

    learning.patterns.push(learningPattern);
    learning.totalInteractions++;
    learning.lastUpdated = new Date().toISOString();

    // Store in RAG for retrieval
    try {
      const ragStore = await getRAGStore();
      const { ExtractedKnowledge } = await import('@scorpion/core');
      
      const knowledge: ExtractedKnowledge = {
        id: learningPattern.id,
        source: 'self-learning',
        type: 'pattern', // Valid type from ExtractedKnowledge
        category: 'agent-learning',
        title: `${agentName} - ${type} pattern`,
        description: JSON.stringify({
          type,
          pattern,
          context,
          metrics,
        }),
        codeSnippets: [], // Required field
        tags: ['learning', agentId, type, context.questionType || 'general'],
        extractedAt: new Date().toISOString(),
        patterns: [],
        dependencies: [],
        useCases: [],
      };
      
      await ragStore.addKnowledge(knowledge);
    } catch (error) {
      console.warn('[Self-Learning] Failed to store in RAG:', error);
      // Continue even if RAG storage fails - learning still works in memory
    }

    // Cache for fast retrieval
    this.updatePatternCache(agentId, type, learningPattern);

    // Also collect for fine-tuning
    if (metrics.answerQuality && metrics.answerQuality > 0.8) {
      const collector = getTrainingDataCollector();
      await collector.collectInteraction(
        context.questionKeywords?.join(' ') || '',
        JSON.stringify(pattern),
        {
          userFeedback: 'positive',
          metadata: {
            agentId,
            agentName,
            patternType: type,
            quality: metrics.answerQuality,
          },
        }
      );
    }
  }

  /**
   * Retrieve relevant learning patterns for a given context
   */
  async getRelevantPatterns(
    agentId: string,
    questionType: string,
    questionKeywords: string[],
    type?: LearningPattern['type']
  ): Promise<LearningPattern[]> {
    const learning = this.learnings.get(agentId);
    if (!learning) return [];

    // Check cache first
    const cacheKey = `${agentId}-${type || 'all'}-${questionType}`;
    if (this.patternCache.has(cacheKey)) {
      return this.patternCache.get(cacheKey)!;
    }

    // Filter patterns by relevance
    let relevant = learning.patterns.filter(p => {
      if (type && p.type !== type) return false;
      
      // Match by question type
      if (p.context.questionType && p.context.questionType !== questionType) {
        // Allow partial matches for similar types
        const similarTypes: Record<string, string[]> = {
          casual: ['conversational'],
          technical: ['operational', 'analysis'],
          operational: ['technical'],
        };
        const similar = similarTypes[p.context.questionType] || [];
        if (!similar.includes(questionType)) return false;
      }

      // Match by keywords (at least 2 keywords match)
      if (questionKeywords.length > 0 && p.context.questionKeywords) {
        const matches = questionKeywords.filter(kw =>
          p.context.questionKeywords!.some(pkw => 
            pkw.toLowerCase().includes(kw.toLowerCase()) ||
            kw.toLowerCase().includes(pkw.toLowerCase())
          )
        );
        if (matches.length < Math.min(2, questionKeywords.length)) return false;
      }

      // Only return patterns with good success rate
      return p.successRate >= 0.6 && p.appliedCount > 0;
    });

    // Sort by success rate and application count
    relevant.sort((a, b) => {
      const scoreA = a.successRate * (1 + Math.log(a.appliedCount + 1));
      const scoreB = b.successRate * (1 + Math.log(b.appliedCount + 1));
      return scoreB - scoreA;
    });

    // Return top 5 most relevant
    const topPatterns = relevant.slice(0, 5);
    
    // Cache results
    this.patternCache.set(cacheKey, topPatterns);
    
    return topPatterns;
  }

  /**
   * Apply a learning pattern and track its success
   */
  async applyPattern(
    patternId: string,
    success: boolean
  ): Promise<void> {
    for (const learning of this.learnings.values()) {
      const pattern = learning.patterns.find(p => p.id === patternId);
      if (pattern) {
        pattern.appliedCount++;
        const totalSuccesses = pattern.successRate * (pattern.appliedCount - 1) + (success ? 1 : 0);
        pattern.successRate = totalSuccesses / pattern.appliedCount;
        
        // Update learning improvement rate
        const successfulPatterns = learning.patterns.filter(p => p.successRate > 0.7);
        learning.improvementRate = successfulPatterns.length / learning.patterns.length;
        learning.lastUpdated = new Date().toISOString();
        
        // Clear cache to force refresh
        this.patternCache.clear();
        break;
      }
    }
  }

  /**
   * Learn from tool usage patterns
   */
  async learnToolUsage(
    agentId: string,
    agentName: string,
    questionType: string,
    questionKeywords: string[],
    toolsUsed: string[],
    outcome: 'success' | 'partial' | 'failure',
    executionTime: number
  ): Promise<void> {
    await this.learnFromSuccess(
      agentId,
      agentName,
      'tool_usage',
      {
        tools: toolsUsed,
        toolOrder: toolsUsed,
        toolCount: toolsUsed.length,
      },
      {
        questionType,
        questionKeywords,
        toolsUsed,
        outcome,
      },
      {
        executionTime,
        toolAccuracy: outcome === 'success' ? 1.0 : outcome === 'partial' ? 0.5 : 0.0,
      }
    );
  }

  /**
   * Learn from plan structures
   */
  async learnPlanStructure(
    agentId: string,
    agentName: string,
    questionType: string,
    questionKeywords: string[],
    planStructure: {
      steps: number;
      toolDiversity: number;
      hasCodeRead: boolean;
      hasKnowledgeSearch: boolean;
      hasSystemHealth: boolean;
    },
    outcome: 'success' | 'partial' | 'failure',
    answerQuality: number
  ): Promise<void> {
    await this.learnFromSuccess(
      agentId,
      agentName,
      'plan_structure',
      planStructure,
      {
        questionType,
        questionKeywords,
        outcome,
      },
      {
        answerQuality,
      }
    );
  }

  /**
   * Learn from council patterns
   */
  async learnCouncilPattern(
    agentId: string,
    agentName: string,
    questionType: string,
    councilPattern: {
      approvalRate: number;
      highConfidenceCount: number;
      concernsCount: number;
      consensusStrength: number;
    },
    outcome: 'success' | 'partial' | 'failure',
    userSatisfaction: number
  ): Promise<void> {
    await this.learnFromSuccess(
      agentId,
      agentName,
      'council_pattern',
      councilPattern,
      {
        questionType,
        outcome,
      },
      {
        userSatisfaction,
      }
    );
  }

  /**
   * Get or create learning record for an agent
   */
  private getOrCreateLearning(agentId: string, agentName: string): AgentLearning {
    if (!this.learnings.has(agentId)) {
      this.learnings.set(agentId, {
        agentId,
        agentName,
        patterns: [],
        totalInteractions: 0,
        improvementRate: 0,
        lastUpdated: new Date().toISOString(),
      });
    }
    return this.learnings.get(agentId)!;
  }

  /**
   * Update pattern cache
   */
  private updatePatternCache(
    agentId: string,
    type: LearningPattern['type'],
    pattern: LearningPattern
  ): void {
    const cacheKey = `${agentId}-${type}`;
    const cached = this.patternCache.get(cacheKey) || [];
    cached.push(pattern);
    // Keep only top 10 patterns per cache entry
    cached.sort((a, b) => b.successRate - a.successRate);
    this.patternCache.set(cacheKey, cached.slice(0, 10));
  }

  /**
   * Get learning statistics for an agent
   */
  getLearningStats(agentId: string): AgentLearning | null {
    return this.learnings.get(agentId) || null;
  }

  /**
   * Get all learnings
   */
  getAllLearnings(): AgentLearning[] {
    return Array.from(this.learnings.values());
  }
}

// Singleton instance
let learningSystem: SelfLearningSystem | null = null;

export function getSelfLearningSystem(): SelfLearningSystem {
  if (!learningSystem) {
    learningSystem = new SelfLearningSystem();
  }
  return learningSystem;
}

