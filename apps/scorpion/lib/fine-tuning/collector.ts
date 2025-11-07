/**
 * Training Data Collector
 * Collects high-quality interactions for fine-tuning
 */

import { getOntologyStore } from '../shared-stores';
import { PersistentStore } from '@scorpion/core/storage/persistent-store';
import path from 'path';

export interface TrainingExample {
  id: string;
  input: string;
  output: string;
  context?: string;
  quality: number; // 0-1 score
  source: 'chat' | 'workflow' | 'agent' | 'feedback';
  metadata: {
    userFeedback?: 'positive' | 'negative';
    corrected?: boolean;
    usedRAG?: boolean;
    knowledgeItems?: string[];
    timestamp: string;
    mistakeId?: string;
    priority?: number;
  };
}

export interface TrainingDataset {
  id: string;
  name: string;
  examples: TrainingExample[];
  createdAt: string;
  qualityScore: number;
  size: number;
}

class TrainingDataCollector {
  private persistentStore: PersistentStore;
  private examples: TrainingExample[] = [];
  private minQualityThreshold = 0.7; // Only collect high-quality examples
  private dataDir: string;

  constructor() {
    this.dataDir = path.join(process.cwd(), 'data', 'scorpion');
    this.persistentStore = new PersistentStore(this.dataDir);
  }

  /**
   * Initialize and load from disk
   */
  async initialize(): Promise<void> {
    await this.persistentStore.initialize();
    
    // Load training data from disk
    const saved = await this.persistentStore.loadTrainingData();
    if (saved && saved.examples) {
      this.examples = saved.examples;
      console.log(`✅ Loaded ${this.examples.length} training examples from disk`);
    }
  }

  /**
   * Collect interaction for training
   */
  async collectInteraction(
    input: string,
    output: string,
    context?: {
      ragContext?: string[];
      userFeedback?: 'positive' | 'negative';
      corrected?: boolean;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    // Calculate quality score
    const quality = this.calculateQuality(input, output, context);

    // Only collect high-quality examples
    if (quality < this.minQualityThreshold) {
      return;
    }

    const example: TrainingExample = {
      id: `example-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      input,
      output,
      context: context?.ragContext?.join('\n'),
      quality,
      source: 'chat',
      metadata: {
        userFeedback: context?.userFeedback,
        corrected: context?.corrected,
        usedRAG: !!context?.ragContext,
        knowledgeItems: context?.ragContext,
        timestamp: new Date().toISOString(),
        mistakeId: context?.metadata?.mistakeId,
        priority: context?.metadata?.priority || 1
      }
    };

    this.examples.push(example);

    // Store in ontology
    const ontologyStore = await getOntologyStore();
    await ontologyStore.store({
      id: example.id,
      type: 'TrainingExample',
      createdAt: new Date(),
      updatedAt: new Date(),
      data: example
    });

    // Save to disk
    await this.save();

    // Keep only last 10,000 examples in memory
    if (this.examples.length > 10000) {
      this.examples = this.examples.slice(-10000);
    }
  }

  /**
   * Calculate quality score for an example
   */
  private calculateQuality(
    input: string,
    output: string,
    context?: {
      userFeedback?: 'positive' | 'negative';
      corrected?: boolean;
    }
  ): number {
    let score = 0.5; // Base score

    // Length checks
    if (input.length > 10 && output.length > 20) score += 0.1;
    if (input.length > 50 && output.length > 100) score += 0.1;

    // User feedback
    if (context?.userFeedback === 'positive') score += 0.2;
    if (context?.userFeedback === 'negative') score -= 0.3;
    if (context?.corrected) score += 0.2; // Corrected examples are very valuable

    // RAG context indicates good grounding
    if (context?.ragContext && context.ragContext.length > 0) score += 0.1;

    // Output quality indicators
    if (output.includes('```') || output.includes('code')) score += 0.1; // Code examples
    if (output.split('\n').length > 3) score += 0.1; // Structured responses

    return Math.min(1, Math.max(0, score));
  }

  /**
   * Generate training dataset
   */
  async generateDataset(minExamples: number = 100): Promise<TrainingDataset | null> {
    // Get high-quality examples, prioritizing corrected ones
    const highQuality = this.examples
      .filter(e => e.quality >= this.minQualityThreshold)
      .sort((a, b) => {
        // Prioritize corrected examples
        if (a.metadata.corrected && !b.metadata.corrected) return -1;
        if (!a.metadata.corrected && b.metadata.corrected) return 1;
        // Then by priority
        const priorityA = a.metadata.priority || 1;
        const priorityB = b.metadata.priority || 1;
        if (priorityA !== priorityB) return priorityB - priorityA;
        // Then by quality
        return b.quality - a.quality;
      })
      .slice(0, Math.max(minExamples, 1000));

    if (highQuality.length < minExamples) {
      console.log(`⚠️ Not enough high-quality examples: ${highQuality.length}/${minExamples}`);
      return null;
    }

    const qualityScore = highQuality.reduce((sum, e) => sum + e.quality, 0) / highQuality.length;

    const dataset: TrainingDataset = {
      id: `dataset-${Date.now()}`,
      name: `scorpion-finetune-${new Date().toISOString().split('T')[0]}`,
      examples: highQuality,
      createdAt: new Date().toISOString(),
      qualityScore,
      size: highQuality.length
    };

    // Store dataset
    const ontologyStore = await getOntologyStore();
    await ontologyStore.store({
      id: dataset.id,
      type: 'TrainingDataset',
      createdAt: new Date(),
      updatedAt: new Date(),
      data: dataset
    });

    return dataset;
  }

  /**
   * Save to disk
   */
  private async save(): Promise<void> {
    const data = {
      examples: this.examples,
      lastSaved: new Date().toISOString()
    };
    await this.persistentStore.saveTrainingData(data);
  }

  /**
   * Get collected examples count
   */
  getStats(): { total: number; highQuality: number; averageQuality: number } {
    const highQuality = this.examples.filter(e => e.quality >= this.minQualityThreshold);
    const avgQuality = this.examples.length > 0
      ? this.examples.reduce((sum, e) => sum + e.quality, 0) / this.examples.length
      : 0;

    return {
      total: this.examples.length,
      highQuality: highQuality.length,
      averageQuality: avgQuality
    };
  }
}

// Singleton instance
let collector: TrainingDataCollector | null = null;

export function getTrainingDataCollector(): TrainingDataCollector {
  if (!collector) {
    collector = new TrainingDataCollector();
  }
  return collector;
}

export async function initializeTrainingDataCollector() {
  const collector = getTrainingDataCollector();
  await collector.initialize();
  return collector;
}

