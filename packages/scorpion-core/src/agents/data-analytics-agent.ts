/**
 * Data Analytics Agent
 * Specializes in data analysis, visualization, ML pipelines, and metrics
 */

import { LLMAdapter } from '../llm/modelAdapter';
import { RAGStore } from '../rag/store';

export interface AnalyticsQuery {
  type: 'descriptive' | 'diagnostic' | 'predictive' | 'prescriptive';
  data?: any;
  question: string;
  context?: Record<string, any>;
}

export interface VisualizationRecommendation {
  chartType: 'line' | 'bar' | 'pie' | 'scatter' | 'heatmap' | 'box';
  reasoning: string;
  dataFormat: string;
  libraries: string[];
}

export interface MetricSuggestion {
  name: string;
  description: string;
  formula: string;
  category: string;
  relevance: number;
}

export class DataAnalyticsAgent {
  constructor(
    private llm: LLMAdapter,
    private ragStore: RAGStore
  ) {}

  /**
   * Analyze data and provide insights
   */
  async analyze(query: AnalyticsQuery): Promise<any> {
    console.log(`📊 DataAnalyticsAgent analyzing: ${query.type} - ${query.question}`);

    // Get relevant analytics knowledge from RAG
    const knowledge = await this.ragStore.search(
      `data-analytics ${query.type} analytics ${query.question}`,
      10
    );

    const context = knowledge.map(k => `${k.title}\n${k.description}`).join('\n\n');

    const prompt = `You are a data analytics expert. Use the following knowledge base to answer the query.

Knowledge:
${context}

Query Type: ${query.type}
Question: ${query.question}
${query.data ? `Data: ${JSON.stringify(query.data, null, 2)}` : ''}
${query.context ? `Context: ${JSON.stringify(query.context, null, 2)}` : ''}

Provide a comprehensive analysis following the ${query.type} analytics framework.`;

    const response = await this.llm.generate({
      system: 'You are a data analytics expert specializing in descriptive, diagnostic, predictive, and prescriptive analytics.',
      user: prompt,
      jsonOutput: true
    });

    return JSON.parse(response);
  }

  /**
   * Recommend appropriate visualization for data
   */
  async recommendVisualization(
    dataDescription: string,
    goal: string
  ): Promise<VisualizationRecommendation> {
    const knowledge = await this.ragStore.search(
      'data-analytics data visualization chart types best practices',
      10
    );

    const context = knowledge.map(k => `${k.title}\n${k.description}`).join('\n\n');

    const prompt = `Based on data visualization best practices:

Knowledge:
${context}

Data Description: ${dataDescription}
Goal: ${goal}

Recommend the best chart type with reasoning, required data format, and implementation libraries.
Return JSON: { chartType, reasoning, dataFormat, libraries }`;

    const response = await this.llm.generate({
      system: 'You are a data visualization expert.',
      user: prompt,
      jsonOutput: true
    });

    return JSON.parse(response);
  }

  /**
   * Suggest relevant metrics for a business domain
   */
  async suggestMetrics(
    domain: string,
    description: string
  ): Promise<MetricSuggestion[]> {
    const knowledge = await this.ragStore.search(
      `data-analytics ${domain} metrics KPIs business analytics`,
      10
    );

    const context = knowledge.map(k => `${k.title}\n${k.description}`).join('\n\n');

    const prompt = `Suggest 5-10 key metrics for this business scenario:

Knowledge:
${context}

Domain: ${domain}
Description: ${description}

Return JSON array: [{ name, description, formula, category, relevance }]
Relevance is a score from 0-1 indicating how relevant this metric is.`;

    const response = await this.llm.generate({
      system: 'You are a business analytics expert.',
      user: prompt,
      jsonOutput: true
    });

    return JSON.parse(response).metrics;
  }

  /**
   * Design ML pipeline for a use case
   */
  async designMLPipeline(useCase: string): Promise<any> {
    const knowledge = await this.ragStore.search(
      'data-analytics ML system data pipelines machine learning workflow',
      10
    );

    const context = knowledge.map(k => `${k.title}\n${k.description}`).join('\n\n');

    const prompt = `Design a complete ML pipeline for this use case:

Knowledge:
${context}

Use Case: ${useCase}

Provide:
1. Pipeline stages (ingestion, processing, training, evaluation, deployment)
2. Recommended algorithms
3. Data quality checks
4. Evaluation metrics
5. Deployment strategy

Return structured JSON.`;

    const response = await this.llm.generate({
      system: 'You are a machine learning engineer specializing in ML system design.',
      user: prompt,
      jsonOutput: true
    });

    return JSON.parse(response);
  }

  /**
   * Perform root cause analysis (diagnostic analytics)
   */
  async diagnose(issue: string, data: any): Promise<any> {
    return this.analyze({
      type: 'diagnostic',
      question: `What is the root cause of: ${issue}`,
      data,
    });
  }

  /**
   * Generate forecast (predictive analytics)
   */
  async forecast(metric: string, historicalData: any): Promise<any> {
    return this.analyze({
      type: 'predictive',
      question: `Forecast future values of ${metric}`,
      data: historicalData,
    });
  }

  /**
   * Provide optimization recommendations (prescriptive analytics)
   */
  async optimize(goal: string, constraints: any): Promise<any> {
    return this.analyze({
      type: 'prescriptive',
      question: `How to optimize for: ${goal}`,
      data: constraints,
    });
  }
}

