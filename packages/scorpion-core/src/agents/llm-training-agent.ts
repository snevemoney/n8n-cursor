/**
 * LLM Training Agent
 * Specializes in LLM training strategies, hyperparameter optimization, and training analysis
 */

import { LLMAdapter } from '../llm/modelAdapter';
import { RAGStore } from '../rag/store';

export interface TrainingStrategy {
  type: 'lora' | 'qlora' | 'full-finetune' | 'adapter';
  description: string;
  advantages: string[];
  disadvantages: string[];
  useCase: string;
  estimatedTime: string;
  resourceRequirements: {
    gpu: string;
    memory: string;
    storage: string;
  };
}

export interface HyperparameterRecommendation {
  learningRate: number;
  batchSize: number;
  epochs: number;
  warmupSteps?: number;
  weightDecay?: number;
  rationale: string;
}

export interface TrainingAnalysis {
  issues: {
    type: 'overfitting' | 'underfitting' | 'convergence' | 'memory' | 'other';
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    suggestion: string;
  }[];
  improvements: string[];
  nextSteps: string[];
}

export class LLMTrainingAgent {
  constructor(
    private llm: LLMAdapter,
    private ragStore: RAGStore
  ) {}

  /**
   * Recommend training strategy based on use case
   */
  async recommendTrainingStrategy(
    useCase: string,
    datasetSize: number,
    constraints?: {
      gpuMemory?: string;
      trainingTime?: string;
      budget?: string;
    }
  ): Promise<TrainingStrategy[]> {
    console.log(`🎓 LLMTrainingAgent recommending strategy for: ${useCase}`);

    const knowledge = await this.ragStore.search(
      `LLM training fine-tuning LoRA QLoRA adapter strategies ${useCase}`,
      5
    );

    const context = knowledge.map(k => `${k.title}: ${k.description}`).join('\n\n');

    const prompt = `Recommend training strategies for this LLM training scenario:

Knowledge:
${context}

Use Case: ${useCase}
Dataset Size: ${datasetSize} examples
${constraints ? `Constraints: ${JSON.stringify(constraints)}` : ''}

Provide 2-4 training strategy recommendations (LoRA, QLoRA, full fine-tuning, adapters).
For each strategy, include: type, description, advantages, disadvantages, use case fit, estimated time, and resource requirements.

Return JSON array of TrainingStrategy objects.`;

    const response = await this.llm.generate({
      system: 'You are an LLM training expert specializing in efficient fine-tuning strategies like LoRA, QLoRA, and adapters.',
      user: prompt,
      jsonOutput: true
    });

    try {
      const parsed = JSON.parse(response);
      return Array.isArray(parsed) ? parsed : parsed.recommendations || parsed.strategies || [];
    } catch (e) {
      console.warn('Failed to parse training strategy response:', e);
      return [];
    }
  }

  /**
   * Suggest hyperparameters based on dataset size and model
   */
  async suggestHyperparameters(
    datasetSize: number,
    baseModel: string,
    strategy: 'lora' | 'qlora' | 'full-finetune' | 'adapter'
  ): Promise<HyperparameterRecommendation> {
    const knowledge = await this.ragStore.search(
      `hyperparameter tuning learning rate batch size epochs ${strategy} ${baseModel}`,
      5
    );

    const context = knowledge.map(k => `${k.title}: ${k.description}`).join('\n\n');

    const prompt = `Suggest optimal hyperparameters for LLM training:

Knowledge:
${context}

Dataset Size: ${datasetSize} examples
Base Model: ${baseModel}
Strategy: ${strategy}

Provide:
- Learning rate (with rationale)
- Batch size
- Number of epochs
- Warmup steps (if applicable)
- Weight decay (if applicable)
- Rationale for each choice

Return JSON matching HyperparameterRecommendation interface.`;

    const response = await this.llm.generate({
      system: 'You are a hyperparameter optimization expert for LLM training.',
      user: prompt,
      jsonOutput: true
    });

    try {
      return JSON.parse(response);
    } catch (e) {
      console.warn('Failed to parse hyperparameter response:', e);
      return {
        learningRate: 0.0001,
        batchSize: 4,
        epochs: 3,
        rationale: 'Default values - parsing failed'
      };
    }
  }

  /**
   * Analyze training logs and suggest improvements
   */
  async analyzeTrainingLogs(
    logs: string | Array<{ step: number; loss: number; learningRate?: number }>,
    metrics?: { finalLoss?: number; accuracy?: number; perplexity?: number }
  ): Promise<TrainingAnalysis> {
    const knowledge = await this.ragStore.search(
      'training analysis overfitting underfitting convergence loss curves',
      5
    );

    const context = knowledge.map(k => `${k.title}: ${k.description}`).join('\n\n');

    const logData = typeof logs === 'string' ? logs : JSON.stringify(logs, null, 2);

    const prompt = `Analyze these training logs and metrics:

Knowledge:
${context}

Training Logs:
${logData}

Metrics:
${JSON.stringify(metrics || {}, null, 2)}

Identify:
1. Issues (overfitting, underfitting, convergence problems, memory issues, etc.)
2. Suggested improvements
3. Next steps to improve training

Return JSON matching TrainingAnalysis interface.`;

    const response = await this.llm.generate({
      system: 'You are a training analysis expert who can identify issues from loss curves and training metrics.',
      user: prompt,
      jsonOutput: true
    });

    try {
      return JSON.parse(response);
    } catch (e) {
      console.warn('Failed to parse training analysis response:', e);
      return {
        issues: [],
        improvements: ['Unable to parse analysis - check logs manually'],
        nextSteps: ['Review training logs and metrics']
      };
    }
  }

  /**
   * Compare training approaches
   */
  async compareTrainingApproaches(
    approaches: Array<{ name: string; config: any; results?: any }>
  ): Promise<any> {
    const knowledge = await this.ragStore.search(
      'training comparison LoRA vs full fine-tuning efficiency trade-offs',
      5
    );

    const context = knowledge.map(k => `${k.title}: ${k.description}`).join('\n\n');

    const prompt = `Compare these training approaches:

Knowledge:
${context}

Approaches:
${JSON.stringify(approaches, null, 2)}

Provide:
1. Comparison of efficiency (time, resources)
2. Comparison of results/quality
3. Trade-offs analysis
4. Recommendation for best approach
5. When to use each approach

Return JSON.`;

    const response = await this.llm.generate({
      system: 'You are an expert at comparing different LLM training approaches.',
      user: prompt,
      jsonOutput: true
    });

    try {
      return JSON.parse(response);
    } catch (e) {
      console.warn('Failed to parse comparison response:', e);
      return { error: 'Failed to parse comparison' };
    }
  }
}

