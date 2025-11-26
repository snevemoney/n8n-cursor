/**
 * AI Tools Agent
 * Specializes in AI tool selection, agent design patterns, and AI workflow orchestration
 */

import { LLMAdapter } from '../llm/modelAdapter';
import { RAGStore } from '../rag/store';

export interface ToolRecommendation {
  name: string;
  category: string;
  level: number; // 1-5 from foundation to user-facing
  purpose: string;
  alternatives: string[];
  integrationComplexity: 'low' | 'medium' | 'high';
  cost: 'free' | 'freemium' | 'paid';
  links: string[];
}

export interface AgentDesign {
  pattern: 'reflection' | 'tool-use' | 'react' | 'planning' | 'multi-agent';
  description: string;
  implementation: {
    steps: string[];
    pseudocode: string;
    tools_needed: string[];
  };
  use_cases: string[];
  trade_offs: {
    pros: string[];
    cons: string[];
  };
}

export class AIToolsAgent {
  constructor(
    private llm: LLMAdapter,
    private ragStore: RAGStore
  ) {}

  /**
   * Recommend AI tools for a use case
   */
  async recommendTools(useCase: string): Promise<ToolRecommendation[]> {
    console.log(`🤖 AIToolsAgent recommending tools for: ${useCase}`);

    const knowledge = await this.ragStore.search(
      `ai-tools AI tools hierarchy ${useCase} machine learning frameworks`,
      10
    );

    const context = knowledge.map(k => `${k.title}\n${k.description}`).join('\n\n');

    const prompt = `Recommend AI tools for this use case:

Knowledge:
${context}

Use Case: ${useCase}

Provide 3-5 tool recommendations organized by the AI Tools Hierarchy (Level 1-5).
For each tool, include: name, category, level, purpose, alternatives, integration complexity, cost, and links.

Return JSON array of ToolRecommendation objects.`;

    const response = await this.llm.generate({
      system: 'You are an AI tools expert familiar with all major AI frameworks, libraries, and platforms.',
      user: prompt,
      jsonOutput: true
    });

    return JSON.parse(response).recommendations;
  }

  /**
   * Design an AI agent using agentic patterns
   */
  async designAgent(requirements: {
    goal: string;
    capabilities: string[];
    constraints?: string[];
  }): Promise<AgentDesign> {
    const knowledge = await this.ragStore.search(
      'ai-tools agentic AI design patterns reflection tool use ReAct planning multi-agent',
      10
    );

    const context = knowledge.map(k => `${k.title}\n${k.description}`).join('\n\n');

    const prompt = `Design an AI agent for these requirements:

Knowledge:
${context}

Goal: ${requirements.goal}
Capabilities: ${requirements.capabilities.join(', ')}
${requirements.constraints ? `Constraints: ${requirements.constraints.join(', ')}` : ''}

Choose the most appropriate agentic design pattern and provide:
1. Pattern name and description
2. Implementation steps with pseudocode
3. Tools/capabilities needed
4. Use cases where this excels
5. Trade-offs (pros and cons)

Return JSON matching AgentDesign interface.`;

    const response = await this.llm.generate({
      system: 'You are an expert in autonomous AI agent design and agentic patterns.',
      user: prompt,
      jsonOutput: true
    });

    return JSON.parse(response);
  }

  /**
   * Design a multi-agent system
   */
  async designMultiAgentSystem(scenario: string): Promise<any> {
    const knowledge = await this.ragStore.search(
      'ai-tools multi-agent system hierarchical collaborative specialized agents',
      10
    );

    const context = knowledge.map(k => `${k.title}\n${k.description}`).join('\n\n');

    const prompt = `Design a multi-agent system for this scenario:

Knowledge:
${context}

Scenario: ${scenario}

Provide:
1. System architecture (hierarchical/collaborative/specialized)
2. Agent roles and responsibilities
3. Communication protocols
4. Consensus mechanisms
5. Example workflow
6. Failure handling strategy

Return JSON.`;

    const response = await this.llm.generate({
      system: 'You are a multi-agent systems architect.',
      user: prompt,
      jsonOutput: true
    });

    return JSON.parse(response);
  }

  /**
   * Recommend ML framework for a project
   */
  async recommendMLFramework(projectType: string, requirements: string[]): Promise<any> {
    const knowledge = await this.ragStore.search(
      'ai-tools machine learning frameworks TensorFlow PyTorch scikit-learn',
      10
    );

    const context = knowledge.map(k => `${k.title}\n${k.description}`).join('\n\n');

    const prompt = `Recommend the best ML framework:

Knowledge:
${context}

Project Type: ${projectType}
Requirements: ${requirements.join(', ')}

Compare top options and recommend the best fit with:
- Framework name
- Strengths for this project
- Learning curve
- Community and ecosystem
- Production readiness
- Example getting started code

Return JSON.`;

    const response = await this.llm.generate({
      system: 'You are an ML engineering expert.',
      user: prompt,
      jsonOutput: true
    });

    return JSON.parse(response);
  }

  /**
   * Design a tool-use system for an agent
   */
  async designToolSystem(agentPurpose: string, availableAPIs: string[]): Promise<any> {
    const knowledge = await this.ragStore.search(
      'ai-tools tool use pattern AI agent tool integration error handling',
      10
    );

    const context = knowledge.map(k => `${k.title}\n${k.description}`).join('\n\n');

    const prompt = `Design a tool-use system for an AI agent:

Knowledge:
${context}

Agent Purpose: ${agentPurpose}
Available APIs: ${availableAPIs.join(', ')}

Provide:
1. Tool registry design
2. Tool selection strategy
3. Error handling approach
4. Security and permissions
5. Performance optimization
6. Example implementation code

Return JSON.`;

    const response = await this.llm.generate({
      system: 'You are an AI agent tooling expert.',
      user: prompt,
      jsonOutput: true
    });

    return JSON.parse(response);
  }

  /**
   * Evaluate AI agent performance
   */
  async evaluateAgent(agentDescription: string, metrics: any): Promise<any> {
    const knowledge = await this.ragStore.search(
      'ai-tools AI agent evaluation metrics testing success rate efficiency quality',
      10
    );

    const context = knowledge.map(k => `${k.title}\n${k.description}`).join('\n\n');

    const prompt = `Evaluate this AI agent:

Knowledge:
${context}

Agent: ${agentDescription}
Metrics: ${JSON.stringify(metrics, null, 2)}

Provide:
1. Performance analysis
2. Identified strengths
3. Identified weaknesses
4. Improvement recommendations
5. Benchmark comparison
6. Testing strategy

Return JSON.`;

    const response = await this.llm.generate({
      system: 'You are an AI evaluation expert.',
      user: prompt,
      jsonOutput: true
    });

    return JSON.parse(response);
  }
}

