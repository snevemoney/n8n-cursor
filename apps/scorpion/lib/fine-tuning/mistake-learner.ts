/**
 * Mistake Learning System
 * Tracks mistakes, corrections, and learns from them
 */

import { PersistentStore } from '@scorpion/core/storage/persistent-store';
import { getTrainingDataCollector } from './collector';
import path from 'path';

export interface Mistake {
  id: string;
  originalInput: string;
  wrongOutput: string;
  correctedOutput: string;
  correction: string; // User's correction explanation
  timestamp: string;
  learned: boolean; // Whether it's been incorporated into training
  priority: number; // Higher priority = more important to learn
}

export interface Correction {
  mistakeId: string;
  originalInput: string;
  wrongOutput: string;
  correctedOutput: string;
  correction: string;
  timestamp: string;
}

class MistakeLearner {
  private persistentStore: PersistentStore;
  private collector = getTrainingDataCollector();
  private mistakes: Mistake[] = [];
  private dataDir: string;

  constructor() {
    this.dataDir = path.join(process.cwd(), 'data', 'scorpion');
    this.persistentStore = new PersistentStore(this.dataDir);
  }

  /**
   * Initialize and load mistakes from disk
   */
  async initialize(): Promise<void> {
    await this.persistentStore.initialize();
    this.mistakes = await this.persistentStore.loadMistakes();
    console.log(`✅ Loaded ${this.mistakes.length} mistakes from memory`);
  }

  /**
   * Record a mistake
   */
  async recordMistake(
    originalInput: string,
    wrongOutput: string,
    correctedOutput: string,
    correction: string
  ): Promise<void> {
    const mistake: Mistake = {
      id: `mistake-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      originalInput,
      wrongOutput,
      correctedOutput,
      correction,
      timestamp: new Date().toISOString(),
      learned: false,
      priority: this.calculatePriority(correction)
    };

    this.mistakes.push(mistake);
    
    // Save to disk immediately
    await this.persistentStore.appendMistake(mistake);

    // Add corrected example to training data (high priority)
    await this.collector.collectInteraction(
      originalInput,
      correctedOutput,
      {
        corrected: true,
        userFeedback: 'positive',
        metadata: {
          mistakeId: mistake.id,
          wrongOutput,
          correction,
          priority: mistake.priority
        }
      }
    );

    console.log(`📝 Mistake recorded and added to training data`);
  }

  /**
   * Learn from all unlearned mistakes
   */
  async learnFromMistakes(): Promise<void> {
    const unlearned = this.mistakes.filter(m => !m.learned);
    
    if (unlearned.length === 0) {
      console.log('✅ No new mistakes to learn from');
      return;
    }

    console.log(`🧠 Learning from ${unlearned.length} mistakes...`);

    // Prioritize mistakes by priority
    const prioritized = unlearned.sort((a, b) => b.priority - a.priority);

    // Add all corrections to training data
    for (const mistake of prioritized) {
      await this.collector.collectInteraction(
        mistake.originalInput,
        mistake.correctedOutput,
        {
          corrected: true,
          userFeedback: 'positive',
          metadata: {
            mistakeId: mistake.id,
            wrongOutput: mistake.wrongOutput,
            correction: mistake.correction,
            priority: mistake.priority,
            learned: true
          }
        }
      );

      // Mark as learned
      mistake.learned = true;
    }

    // Save updated mistakes
    await this.persistentStore.saveMistakes(this.mistakes);

    console.log(`✅ Learned from ${prioritized.length} mistakes`);
  }

  /**
   * Get mistake patterns (for proactive prevention)
   */
  getMistakePatterns(): Array<{ pattern: string; count: number; examples: Mistake[] }> {
    const patterns = new Map<string, Mistake[]>();

    for (const mistake of this.mistakes) {
      // Extract pattern from input (simplified)
      const pattern = this.extractPattern(mistake.originalInput);
      
      if (!patterns.has(pattern)) {
        patterns.set(pattern, []);
      }
      patterns.get(pattern)!.push(mistake);
    }

    return Array.from(patterns.entries())
      .map(([pattern, examples]) => ({
        pattern,
        count: examples.length,
        examples: examples.slice(0, 3) // Top 3 examples
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Calculate priority based on correction
   */
  private calculatePriority(correction: string): number {
    let priority = 1;

    // Critical keywords increase priority
    if (correction.toLowerCase().includes('critical') || 
        correction.toLowerCase().includes('important') ||
        correction.toLowerCase().includes('wrong')) {
      priority += 2;
    }

    // Length of correction indicates importance
    if (correction.length > 100) priority += 1;

    return Math.min(10, priority);
  }

  /**
   * Extract pattern from input
   */
  private extractPattern(input: string): string {
    // Simple pattern extraction (in production, use NLP)
    const words = input.toLowerCase().split(/\s+/);
    const keywords = words.filter(w => w.length > 4).slice(0, 3);
    return keywords.join('-');
  }

  /**
   * Get statistics
   */
  getStats(): {
    total: number;
    learned: number;
    unlearned: number;
    topPatterns: Array<{ pattern: string; count: number }>;
  } {
    const learned = this.mistakes.filter(m => m.learned).length;
    const patterns = this.getMistakePatterns().slice(0, 5);

    return {
      total: this.mistakes.length,
      learned,
      unlearned: this.mistakes.length - learned,
      topPatterns: patterns.map(p => ({ pattern: p.pattern, count: p.count }))
    };
  }
}

// Singleton instance
let mistakeLearner: MistakeLearner | null = null;

export function getMistakeLearner(): MistakeLearner {
  if (!mistakeLearner) {
    mistakeLearner = new MistakeLearner();
  }
  return mistakeLearner;
}

export async function initializeMistakeLearner() {
  const learner = getMistakeLearner();
  await learner.initialize();
  return learner;
}

