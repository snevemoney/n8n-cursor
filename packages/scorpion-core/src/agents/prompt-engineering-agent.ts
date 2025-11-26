/**
 * Prompt Engineering Agent
 * Specializes in prompt optimization, A/B testing, and prompt templates
 */

import { LLMAdapter } from '../llm/modelAdapter';
import { RAGStore } from '../rag/store';

export interface PromptOptimization {
  original: string;
  optimized: string;
  changes: Array<{
    type: 'structure' | 'clarity' | 'examples' | 'constraints' | 'format';
    description: string;
    rationale: string;
  }>;
  expectedImprovement: string;
}

export interface PromptTemplate {
  name: string;
  description: string;
  template: string;
  variables: string[];
  useCases: string[];
  example: string;
}

export interface PromptTestResult {
  prompt: string;
  metrics: {
    clarity: number;
    specificity: number;
    completeness: number;
    expectedPerformance: number;
  };
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export class PromptEngineeringAgent {
  constructor(
    private llm: LLMAdapter,
    private ragStore: RAGStore
  ) {}

  /**
   * Optimize a prompt for a specific task
   */
  async optimizePrompt(
    prompt: string,
    task: string,
    constraints?: {
      maxLength?: number;
      requiredElements?: string[];
      style?: 'conversational' | 'formal' | 'technical';
    }
  ): Promise<PromptOptimization> {
    console.log(`✏️ PromptEngineeringAgent optimizing prompt for: ${task}`);

    const knowledge = await this.ragStore.search(
      `prompt engineering optimization best practices ${task}`,
      5
    );

    const context = knowledge.map(k => `${k.title}: ${k.description}`).join('\n\n');

    const promptText = `Optimize this prompt:

Knowledge:
${context}

Original Prompt:
${prompt}

Task: ${task}
${constraints ? `Constraints: ${JSON.stringify(constraints)}` : ''}

Provide:
1. Optimized version of the prompt
2. List of changes made (structure, clarity, examples, constraints, format)
3. Rationale for each change
4. Expected improvement in results

Return JSON matching PromptOptimization interface.`;

    const response = await this.llm.generate({
      system: 'You are a prompt engineering expert specializing in optimizing prompts for LLMs.',
      user: promptText,
      jsonOutput: true
    });

    try {
      return JSON.parse(response);
    } catch (e) {
      console.warn('Failed to parse optimization response:', e);
      return {
        original: prompt,
        optimized: prompt,
        changes: [],
        expectedImprovement: 'Unable to parse optimization'
      };
    }
  }

  /**
   * A/B test prompt variations
   */
  async testPromptVariations(
    variations: Array<{ name: string; prompt: string }>,
    testCases: Array<{ input: string; expected?: string }>
  ): Promise<Array<{ variation: string; results: any; winner?: boolean }>> {
    const knowledge = await this.ragStore.search(
      'prompt A/B testing evaluation comparison best practices',
      5
    );

    const context = knowledge.map(k => `${k.title}: ${k.description}`).join('\n\n');

    const prompt = `Compare these prompt variations:

Knowledge:
${context}

Variations:
${JSON.stringify(variations, null, 2)}

Test Cases:
${JSON.stringify(testCases, null, 2)}

For each variation, provide:
1. Performance on test cases
2. Strengths and weaknesses
3. Best use cases
4. Recommendation (winner if applicable)

Return JSON array of comparison results.`;

    const response = await this.llm.generate({
      system: 'You are an expert at A/B testing prompts and comparing their effectiveness.',
      user: prompt,
      jsonOutput: true
    });

    try {
      const parsed = JSON.parse(response);
      return Array.isArray(parsed) ? parsed : parsed.results || parsed.variations || [];
    } catch (e) {
      console.warn('Failed to parse A/B test results:', e);
      return variations.map(v => ({ variation: v.name, results: {} }));
    }
  }

  /**
   * Suggest prompt templates
   */
  async suggestPromptTemplates(
    task: string,
    style?: 'conversational' | 'formal' | 'technical' | 'creative'
  ): Promise<PromptTemplate[]> {
    const knowledge = await this.ragStore.search(
      `prompt templates patterns ${task} ${style || ''}`,
      5
    );

    const context = knowledge.map(k => `${k.title}: ${k.description}`).join('\n\n');

    const prompt = `Suggest prompt templates for this task:

Knowledge:
${context}

Task: ${task}
${style ? `Style: ${style}` : ''}

Provide 3-5 prompt templates with:
- Name and description
- Template with variables
- List of variables
- Use cases
- Example usage

Return JSON array of PromptTemplate objects.`;

    const response = await this.llm.generate({
      system: 'You are an expert at creating reusable prompt templates for common tasks.',
      user: prompt,
      jsonOutput: true
    });

    try {
      const parsed = JSON.parse(response);
      return Array.isArray(parsed) ? parsed : parsed.templates || parsed.recommendations || [];
    } catch (e) {
      console.warn('Failed to parse template suggestions:', e);
      return [];
    }
  }

  /**
   * Analyze prompt performance
   */
  async analyzePrompt(
    prompt: string,
    results?: Array<{ input: string; output: string; quality?: number }>
  ): Promise<PromptTestResult> {
    const knowledge = await this.ragStore.search(
      'prompt analysis quality assessment clarity specificity',
      5
    );

    const context = knowledge.map(k => `${k.title}: ${k.description}`).join('\n\n');

    const promptText = `Analyze this prompt:

Knowledge:
${context}

Prompt:
${prompt}

${results ? `Results:\n${JSON.stringify(results, null, 2)}` : ''}

Provide:
1. Metrics (clarity, specificity, completeness, expected performance) on 0-10 scale
2. Strengths of the prompt
3. Weaknesses
4. Suggestions for improvement

Return JSON matching PromptTestResult interface.`;

    const response = await this.llm.generate({
      system: 'You are an expert at analyzing prompt quality and effectiveness.',
      user: promptText,
      jsonOutput: true
    });

    try {
      return JSON.parse(response);
    } catch (e) {
      console.warn('Failed to parse prompt analysis:', e);
      return {
        prompt,
        metrics: {
          clarity: 5,
          specificity: 5,
          completeness: 5,
          expectedPerformance: 5
        },
        strengths: [],
        weaknesses: ['Unable to parse analysis'],
        suggestions: ['Review prompt manually']
      };
    }
  }
}

