/**
 * Pattern Learning Integration
 * Connects the pattern learning system to the chat stream
 */

import { patternLearning, type PatternMatch } from '@/lib/learning/pattern-learning';
import type { Plan } from '@/lib/chat/types';

export interface LearningContext {
  userQuery: string;
  plan: Plan;
  councilResult?: any;
  executionSuccess: boolean;
  conversationLength: number;
  userIntent?: string;
}

/**
 * Learn from successful interaction (call at end of successful execution)
 */
export async function learnFromSuccess(context: LearningContext): Promise<void> {
  try {
    // Only learn from successful interactions
    if (!context.executionSuccess) {
      console.log('[Pattern Learning] Skipping failed interaction');
      return;
    }

    await patternLearning.storeSuccessPattern({
      userQuery: context.userQuery,
      plan: context.plan,
      councilResult: context.councilResult,
      executionSuccess: context.executionSuccess,
      context: {
        conversationLength: context.conversationLength,
        userIntent: context.userIntent
      }
    });

    console.log(`✅ [Pattern Learning] Learned from: "${context.userQuery}"`);
  } catch (error) {
    console.warn('[Pattern Learning] Failed to store pattern:', error);
  }
}

/**
 * Enhance plan with learned patterns (call before plan execution)
 */
export async function enhancePlanWithLearning(
  userQuery: string,
  basePlan: Plan
): Promise<{ enhancedPlan: Plan; matches: PatternMatch[] }> {
  try {
    // Find relevant patterns from past successful interactions
    const matches = await patternLearning.findRelevantPatterns(userQuery, 3);

    if (matches.length === 0) {
      console.log('[Pattern Learning] No relevant patterns found, using base plan');
      return { enhancedPlan: basePlan, matches: [] };
    }

    // Generate improved plan based on patterns
    const enhancedPlan = patternLearning.generateImprovedPlan(userQuery, basePlan, matches);

    console.log(`🚀 [Pattern Learning] Enhanced plan using ${matches.length} pattern(s)`);

    return { enhancedPlan, matches };
  } catch (error) {
    console.warn('[Pattern Learning] Failed to enhance plan:', error);
    return { enhancedPlan: basePlan, matches: [] };
  }
}

/**
 * Add learned patterns to planner prompt context
 */
export function generateLearningContext(matches: PatternMatch[]): string {
  if (matches.length === 0) return '';

  const context = matches
    .map(
      (m, i) => `
**Past Success ${i + 1}** (${(m.similarityScore * 100).toFixed(0)}% similar):
- Query: "${m.pattern.userQuery}"
- Tools used: ${m.pattern.toolsUsed.join(', ')}
- Query type: ${m.pattern.queryType}
- Match reason: ${m.matchReason}
`
    )
    .join('\n');

  return `
---
## 📚 LEARNED PATTERNS (from past successful interactions)

The following patterns from similar queries were successful:

${context}

Consider using similar tool selections and approaches for this query.
---
`;
}

/**
 * Get statistics for monitoring/debugging
 */
export function getLearningStatistics() {
  return patternLearning.getStatistics();
}

/**
 * Provide feedback on an interaction (for future learning)
 */
export async function provideFeedback(
  userQuery: string,
  feedbackScore: number // 0.0 - 1.0
): Promise<void> {
  try {
    // Find the pattern for this query
    const matches = await patternLearning.findRelevantPatterns(userQuery, 1);

    if (matches.length > 0) {
      const pattern = matches[0].pattern;

      // Update pattern with feedback
      await patternLearning.storeSuccessPattern({
        ...pattern,
        feedbackScore
      });

      console.log(`✅ [Pattern Learning] Updated feedback for: "${userQuery}" (score: ${feedbackScore})`);
    }
  } catch (error) {
    console.warn('[Pattern Learning] Failed to provide feedback:', error);
  }
}
