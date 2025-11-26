/**
 * Experiment Tracker
 * Tracks LLM training experiments with hyperparameters and metrics
 */

import { getOntologyStore } from '../shared-stores';

export interface Experiment {
  id: string;
  name: string;
  description?: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  baseModel: string;
  strategy: 'lora' | 'qlora' | 'full-finetune' | 'adapter';
  hyperparameters: {
    learningRate: number;
    batchSize: number;
    epochs: number;
    warmupSteps?: number;
    weightDecay?: number;
    [key: string]: any;
  };
  dataset: {
    id?: string;
    name: string;
    size: number;
    qualityScore?: number;
  };
  metrics?: {
    loss?: number;
    accuracy?: number;
    perplexity?: number;
    [key: string]: any;
  };
  metricsHistory?: Array<{
    step: number;
    timestamp: string;
    metrics: Record<string, number>;
  }>;
  trainedModelName?: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  logs?: string[];
  metadata?: Record<string, any>;
}

class ExperimentTracker {
  private experiments: Map<string, Experiment> = new Map();

  /**
   * Create a new experiment
   */
  async createExperiment(experiment: Omit<Experiment, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<Experiment> {
    const id = `exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const fullExperiment: Experiment = {
      ...experiment,
      id,
      status: 'pending',
      createdAt: now,
      updatedAt: now
    };

    this.experiments.set(id, fullExperiment);
    
    // Store in ontology
    const ontologyStore = await getOntologyStore();
    await ontologyStore.store({
      id,
      type: 'LLMExperiment',
      createdAt: new Date(fullExperiment.createdAt),
      updatedAt: new Date(fullExperiment.updatedAt),
      data: fullExperiment
    });

    return fullExperiment;
  }

  /**
   * Get experiment by ID
   */
  async getExperiment(id: string): Promise<Experiment | null> {
    // Check in-memory first
    if (this.experiments.has(id)) {
      return this.experiments.get(id)!;
    }

    // Load from ontology
    const ontologyStore = await getOntologyStore();
    const entity = ontologyStore.get(id);
    if (entity && entity.type === 'LLMExperiment') {
      const experiment = entity.data as Experiment;
      this.experiments.set(id, experiment);
      return experiment;
    }

    return null;
  }

  /**
   * List all experiments
   */
  async listExperiments(filters?: {
    status?: Experiment['status'];
    baseModel?: string;
    strategy?: Experiment['strategy'];
  }): Promise<Experiment[]> {
    // Load all experiments from ontology
    const ontologyStore = await getOntologyStore();
    const allEntities = ontologyStore.query({ type: 'LLMExperiment' });
    
    const experiments: Experiment[] = [];
    for (const entity of allEntities) {
      const experiment = entity.data as Experiment;
      this.experiments.set(experiment.id, experiment);
      
      // Apply filters
      if (filters) {
        if (filters.status && experiment.status !== filters.status) continue;
        if (filters.baseModel && experiment.baseModel !== filters.baseModel) continue;
        if (filters.strategy && experiment.strategy !== filters.strategy) continue;
      }
      
      experiments.push(experiment);
    }

    // Sort by created date (newest first)
    return experiments.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Update experiment
   */
  async updateExperiment(
    id: string,
    updates: Partial<Omit<Experiment, 'id' | 'createdAt'>> & { status?: Experiment['status'] }
  ): Promise<Experiment | null> {
    const experiment = await this.getExperiment(id);
    if (!experiment) {
      return null;
    }

    const updated: Experiment = {
      ...experiment,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Set timestamps based on status changes
    if (updates.status === 'running' && experiment.status !== 'running') {
      updated.startedAt = new Date().toISOString();
    }
    if (updates.status === 'completed' && experiment.status !== 'completed') {
      updated.completedAt = new Date().toISOString();
    }

    this.experiments.set(id, updated);

    // Update in ontology
    const ontologyStore = await getOntologyStore();
    await ontologyStore.store({
      id,
      type: 'LLMExperiment',
      createdAt: new Date(experiment.createdAt),
      updatedAt: new Date(updated.updatedAt),
      data: updated
    });

    return updated;
  }

  /**
   * Add metrics to experiment
   */
  async addMetrics(
    experimentId: string,
    metrics: Record<string, number>,
    step?: number
  ): Promise<void> {
    const experiment = await this.getExperiment(experimentId);
    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    // Update current metrics
    const updatedMetrics = {
      ...experiment.metrics,
      ...metrics
    };

    // Add to history if step provided
    const metricsHistory = experiment.metricsHistory || [];
    if (step !== undefined) {
      metricsHistory.push({
        step,
        timestamp: new Date().toISOString(),
        metrics
      });
    }

    await this.updateExperiment(experimentId, {
      metrics: updatedMetrics,
      metricsHistory: metricsHistory.slice(-1000) // Keep last 1000 entries
    });
  }

  /**
   * Add log entry to experiment
   */
  async addLog(experimentId: string, log: string): Promise<void> {
    const experiment = await this.getExperiment(experimentId);
    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    const logs = experiment.logs || [];
    logs.push(`[${new Date().toISOString()}] ${log}`);

    await this.updateExperiment(experimentId, {
      logs: logs.slice(-1000) // Keep last 1000 log entries
    });
  }

  /**
   * Initialize and load experiments from disk
   */
  async initialize(): Promise<void> {
    // Load all experiments from ontology
    const ontologyStore = await getOntologyStore();
    const entities = ontologyStore.query({ type: 'LLMExperiment' });
    
    for (const entity of entities) {
      const experiment = entity.data as Experiment;
      this.experiments.set(experiment.id, experiment);
    }

    console.log(`✅ Loaded ${this.experiments.size} experiments from disk`);
  }
}

// Singleton instance
let tracker: ExperimentTracker | null = null;

export function getExperimentTracker(): ExperimentTracker {
  if (!tracker) {
    tracker = new ExperimentTracker();
  }
  return tracker;
}

export async function initializeExperimentTracker(): Promise<ExperimentTracker> {
  const tracker = getExperimentTracker();
  await tracker.initialize();
  return tracker;
}

