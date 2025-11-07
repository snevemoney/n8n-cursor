/**
 * Auto Fine-Tuning Orchestrator
 * Automatically fine-tunes models based on collected data
 */

import { getTrainingDataCollector } from './collector';
import { getOllamaFineTuner, FineTuneConfig } from './ollama-tuner';
import { getOntologyStore } from '../shared-stores';

interface FineTuneSchedule {
  enabled: boolean;
  minExamples: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  baseModel: string;
  lastRun?: string;
}

class AutoFineTuningOrchestrator {
  private collector = getTrainingDataCollector();
  private tuner = getOllamaFineTuner();
  private schedule: FineTuneSchedule = {
    enabled: true,
    minExamples: 100,
    frequency: 'weekly',
    baseModel: process.env.OLLAMA_MODEL || 'llama3.2:3b'
  };
  private fineTuneInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize auto fine-tuning
   */
  async initialize() {
    if (!this.schedule.enabled) {
      console.log('🔄 Auto fine-tuning is disabled');
      return;
    }

    console.log('🔄 Initializing auto fine-tuning...');

    // Check if we should run fine-tuning
    await this.checkAndRunFineTuning();

    // Schedule periodic checks
    const intervalMs = this.getIntervalMs(this.schedule.frequency);
    this.fineTuneInterval = setInterval(() => {
      this.checkAndRunFineTuning();
    }, intervalMs);

    console.log(`✅ Auto fine-tuning initialized (${this.schedule.frequency})`);
  }

  /**
   * Check if fine-tuning should run and execute if needed
   */
  async checkAndRunFineTuning(): Promise<void> {
    try {
      const stats = this.collector.getStats();

      console.log(`📊 Training data stats: ${stats.highQuality}/${stats.total} high-quality examples`);

      if (stats.highQuality < this.schedule.minExamples) {
        console.log(`⏳ Not enough examples for fine-tuning: ${stats.highQuality}/${this.schedule.minExamples}`);
        return;
      }

      // Generate dataset
      const dataset = await this.collector.generateDataset(this.schedule.minExamples);
      if (!dataset) {
        return;
      }

      console.log(`📦 Generated dataset: ${dataset.size} examples, quality: ${dataset.qualityScore.toFixed(2)}`);

      // Fine-tune model
      const config: FineTuneConfig = {
        baseModel: this.schedule.baseModel,
        dataset,
        epochs: 3,
        learningRate: 0.0001,
        batchSize: 4
      };

      const result = await this.tuner.fineTune(config);

      if (result.success) {
        console.log(`✅ Fine-tuning successful: ${result.modelName}`);
        
        // Store fine-tuning result
        const ontologyStore = await getOntologyStore();
        await ontologyStore.store({
          id: `finetune-${Date.now()}`,
          type: 'FineTuneResult',
          createdAt: new Date(),
          updatedAt: new Date(),
          data: {
            modelName: result.modelName,
            baseModel: config.baseModel,
            datasetId: dataset.id,
            metrics: result.metrics,
            trainingTime: result.trainingTime,
            createdAt: new Date().toISOString()
          }
        });

        // Update schedule
        this.schedule.lastRun = new Date().toISOString();

        // Optionally switch to new model (with A/B testing)
        await this.considerModelSwitch(result.modelName);
      } else {
        console.error(`❌ Fine-tuning failed: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Auto fine-tuning check failed:', error);
    }
  }

  /**
   * Consider switching to new fine-tuned model
   */
  private async considerModelSwitch(newModelName: string): Promise<void> {
    // A/B test or gradual rollout logic
    // For now, just log that new model is available
    console.log(`🆕 New fine-tuned model available: ${newModelName}`);
    console.log(`💡 To use it, set OLLAMA_MODEL=${newModelName}`);
  }

  /**
   * Get interval milliseconds based on frequency
   */
  private getIntervalMs(frequency: string): number {
    switch (frequency) {
      case 'daily': return 24 * 60 * 60 * 1000;
      case 'weekly': return 7 * 24 * 60 * 60 * 1000;
      case 'monthly': return 30 * 24 * 60 * 60 * 1000;
      default: return 7 * 24 * 60 * 60 * 1000;
    }
  }

  /**
   * Stop auto fine-tuning
   */
  stop() {
    if (this.fineTuneInterval) {
      clearInterval(this.fineTuneInterval);
      this.fineTuneInterval = null;
    }
  }
}

// Singleton instance
let orchestrator: AutoFineTuningOrchestrator | null = null;

export function getAutoFineTuningOrchestrator(): AutoFineTuningOrchestrator {
  if (!orchestrator) {
    orchestrator = new AutoFineTuningOrchestrator();
  }
  return orchestrator;
}

export async function initializeAutoFineTuning() {
  const orchestrator = getAutoFineTuningOrchestrator();
  await orchestrator.initialize();
  return orchestrator;
}

