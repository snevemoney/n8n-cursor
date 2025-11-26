/**
 * Model Evaluation Agent
 * Specializes in model evaluation, benchmarking, and performance analysis
 */

import { LLMAdapter } from '../llm/modelAdapter';
import { RAGStore } from '../rag/store';

export interface EvaluationBenchmark {
  name: string;
  description: string;
  metrics: string[];
  dataset: string;
  evaluationMethod: string;
  implementation: {
    steps: string[];
    code?: string;
  };
}

export interface ModelComparison {
  models: Array<{
    name: string;
    scores: Record<string, number>;
    strengths: string[];
    weaknesses: string[];
  }>;
  winner: string;
  rationale: string;
  recommendations: string[];
}

export interface FailureModeAnalysis {
  failureModes: Array<{
    type: string;
    description: string;
    examples: string[];
    frequency: number;
    severity: 'critical' | 'high' | 'medium' | 'low';
  }>;
  patterns: string[];
  improvements: string[];
}

export class ModelEvaluationAgent {
  constructor(
    private llm: LLMAdapter,
    private ragStore: RAGStore
  ) {}

  /**
   * Design evaluation benchmark for a task
   */
  async designBenchmark(
    task: string,
    requirements?: {
      metrics?: string[];
      datasetSize?: number;
      evaluationType?: 'automatic' | 'human' | 'hybrid';
    }
  ): Promise<EvaluationBenchmark> {
    console.log(`📊 ModelEvaluationAgent designing benchmark for: ${task}`);

    const knowledge = await this.ragStore.search(
      `evaluation benchmark metrics ${task} model assessment`,
      5
    );

    const context = knowledge.map(k => `${k.title}: ${k.description}`).join('\n\n');

    const prompt = `Design an evaluation benchmark for this task:

Knowledge:
${context}

Task: ${task}
${requirements ? `Requirements: ${JSON.stringify(requirements)}` : ''}

Provide:
1. Benchmark name and description
2. Relevant metrics to measure
3. Dataset requirements/suggestions
4. Evaluation method (automatic/human/hybrid)
5. Implementation steps
6. Example evaluation code (if applicable)

Return JSON matching EvaluationBenchmark interface.`;

    const response = await this.llm.generate({
      system: 'You are an expert in designing evaluation benchmarks for LLMs and AI models.',
      user: prompt,
      jsonOutput: true
    });

    try {
      return JSON.parse(response);
    } catch (e) {
      console.warn('Failed to parse benchmark response:', e);
      return {
        name: `${task} Benchmark`,
        description: 'Evaluation benchmark',
        metrics: ['accuracy', 'f1-score'],
        dataset: 'Custom dataset',
        evaluationMethod: 'automatic',
        implementation: { steps: [] }
      };
    }
  }

  /**
   * Compare model performance metrics
   */
  async compareModels(
    modelResults: Array<{
      name: string;
      metrics: Record<string, number>;
      metadata?: any;
    }>
  ): Promise<ModelComparison> {
    const knowledge = await this.ragStore.search(
      'model comparison performance metrics evaluation best practices',
      5
    );

    const context = knowledge.map(k => `${k.title}: ${k.description}`).join('\n\n');

    const prompt = `Compare these model performance results:

Knowledge:
${context}

Model Results:
${JSON.stringify(modelResults, null, 2)}

Provide:
1. Detailed comparison of each model's scores
2. Identified strengths and weaknesses for each model
3. Winner determination with rationale
4. Recommendations for which model to use when

Return JSON matching ModelComparison interface.`;

    const response = await this.llm.generate({
      system: 'You are an expert at comparing model performance and identifying trade-offs.',
      user: prompt,
      jsonOutput: true
    });

    try {
      return JSON.parse(response);
    } catch (e) {
      console.warn('Failed to parse comparison response:', e);
      return {
        models: [],
        winner: 'Unknown',
        rationale: 'Failed to parse comparison',
        recommendations: []
      };
    }
  }

  /**
   * Suggest evaluation datasets
   */
  async suggestEvaluationDatasets(
    task: string,
    domain?: string
  ): Promise<Array<{ name: string; description: string; url?: string; metrics: string[] }>> {
    const knowledge = await this.ragStore.search(
      `evaluation datasets benchmarks ${task} ${domain || ''}`,
      5
    );

    const context = knowledge.map(k => `${k.title}: ${k.description}`).join('\n\n');

    const prompt = `Suggest evaluation datasets for this task:

Knowledge:
${context}

Task: ${task}
${domain ? `Domain: ${domain}` : ''}

Provide 3-5 dataset recommendations with:
- Dataset name
- Description
- URL or source (if available)
- Metrics it measures
- Use cases

Return JSON array of dataset objects.`;

    const response = await this.llm.generate({
      system: 'You are an expert familiar with all major evaluation datasets and benchmarks.',
      user: prompt,
      jsonOutput: true
    });

    try {
      const parsed = JSON.parse(response);
      return Array.isArray(parsed) ? parsed : parsed.datasets || parsed.recommendations || [];
    } catch (e) {
      console.warn('Failed to parse dataset recommendations:', e);
      return [];
    }
  }

  /**
   * Analyze failure modes
   */
  async analyzeFailureModes(
    errors: Array<{ input: string; expected: string; actual: string; error?: string }>
  ): Promise<FailureModeAnalysis> {
    const knowledge = await this.ragStore.search(
      'failure mode analysis error patterns model mistakes',
      5
    );

    const context = knowledge.map(k => `${k.title}: ${k.description}`).join('\n\n');

    const prompt = `Analyze these model failures:

Knowledge:
${context}

Failures:
${JSON.stringify(errors, null, 2)}

Identify:
1. Failure modes (categories of errors)
2. Patterns across failures
3. Frequency and severity of each mode
4. Suggested improvements

Return JSON matching FailureModeAnalysis interface.`;

    const response = await this.llm.generate({
      system: 'You are an expert at analyzing model failure modes and identifying patterns.',
      user: prompt,
      jsonOutput: true
    });

    try {
      return JSON.parse(response);
    } catch (e) {
      console.warn('Failed to parse failure analysis:', e);
      return {
        failureModes: [],
        patterns: [],
        improvements: ['Review errors manually']
      };
    }
  }
}

