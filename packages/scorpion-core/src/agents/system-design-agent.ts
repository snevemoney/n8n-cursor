/**
 * System Design Agent
 * Specializes in software architecture, scalability, and system design patterns
 */

import { LLMAdapter } from '../llm/modelAdapter';
import { RAGStore } from '../rag/store';

export interface SystemRequirements {
  type: 'api' | 'web-app' | 'mobile-app' | 'data-pipeline' | 'microservice';
  description: string;
  scale?: {
    users?: number;
    requests?: string;
    data?: string;
  };
  constraints?: string[];
  priorities?: ('performance' | 'scalability' | 'reliability' | 'cost')[];
}

export interface SystemDesign {
  architecture: {
    components: Component[];
    connections: Connection[];
  };
  technologies: {
    category: string;
    recommendation: string;
    reasoning: string;
  }[];
  scalability: {
    pattern: string;
    implementation: string;
  }[];
  observability: {
    metrics: string[];
    logging: string;
    tracing: string;
  };
  estimated_cost?: string;
  trade_offs: string[];
}

interface Component {
  name: string;
  type: string;
  purpose: string;
  technology?: string;
}

interface Connection {
  from: string;
  to: string;
  protocol: string;
}

export class SystemDesignAgent {
  constructor(
    private llm: LLMAdapter,
    private ragStore: RAGStore
  ) {}

  /**
   * Generate complete system design
   */
  async design(requirements: SystemRequirements): Promise<SystemDesign> {
    console.log(`🏗️ SystemDesignAgent designing: ${requirements.type} - ${requirements.description}`);

    // Get relevant system design knowledge
    const knowledge = await this.ragStore.search(
      `system-design system design ${requirements.type} architecture patterns scalability`,
      10
    );

    const context = knowledge.map(k => `${k.title}\n${k.description}`).join('\n\n');

    const prompt = `Design a production-ready system architecture:

Knowledge Base:
${context}

Requirements:
- Type: ${requirements.type}
- Description: ${requirements.description}
${requirements.scale ? `- Scale: ${JSON.stringify(requirements.scale)}` : ''}
${requirements.constraints ? `- Constraints: ${requirements.constraints.join(', ')}` : ''}
${requirements.priorities ? `- Priorities: ${requirements.priorities.join(', ')}` : ''}

Provide:
1. Architecture (components and connections)
2. Technology recommendations with reasoning
3. Scalability patterns
4. Observability strategy (metrics, logging, tracing)
5. Estimated cost
6. Trade-offs

Return structured JSON matching the SystemDesign interface.`;

    const response = await this.llm.generate({
      system: 'You are a senior software architect specializing in distributed systems and scalable architectures.',
      user: prompt,
      jsonOutput: true
    });

    return JSON.parse(response);
  }

  /**
   * Recommend specific design pattern for a problem
   */
  async recommendPattern(
    category: 'networking' | 'storage' | 'compute' | 'security' | 'observability',
    problem: string
  ): Promise<any> {
    const knowledge = await this.ragStore.search(
      `system-design ${category} patterns ${problem}`,
      10
    );

    const context = knowledge.map(k => `${k.title}\n${k.description}`).join('\n\n');

    const prompt = `Recommend the best design pattern for this problem:

Knowledge:
${context}

Category: ${category}
Problem: ${problem}

Provide:
- Pattern name
- Description
- When to use
- Implementation guidance
- Trade-offs
- Example architecture

Return JSON.`;

    const response = await this.llm.generate({
      system: 'You are a system design expert.',
      user: prompt,
      jsonOutput: true
    });

    return JSON.parse(response);
  }

  /**
   * Analyze scalability of existing system
   */
  async analyzeScalability(systemDescription: string): Promise<any> {
    const knowledge = await this.ragStore.search(
      'system-design scalability patterns horizontal vertical sharding caching',
      10
    );

    const context = knowledge.map(k => `${k.title}\n${k.description}`).join('\n\n');

    const prompt = `Analyze the scalability of this system:

Knowledge:
${context}

System: ${systemDescription}

Identify:
1. Current scalability limitations
2. Bottlenecks
3. Recommended improvements
4. Scalability patterns to apply
5. Estimated capacity with improvements

Return JSON.`;

    const response = await this.llm.generate({
      system: 'You are a scalability expert.',
      user: prompt,
      jsonOutput: true
    });

    return JSON.parse(response);
  }

  /**
   * Design database schema and strategy
   */
  async designDatabase(requirements: {
    dataModel: string;
    accessPatterns: string[];
    scale: string;
    consistency: 'strong' | 'eventual';
  }): Promise<any> {
    const knowledge = await this.ragStore.search(
      'system-design database design SQL NoSQL sharding indexing',
      10
    );

    const context = knowledge.map(k => `${k.title}\n${k.description}`).join('\n\n');

    const prompt = `Design a database architecture:

Knowledge:
${context}

Requirements:
${JSON.stringify(requirements, null, 2)}

Provide:
1. Database type recommendation (SQL/NoSQL/Hybrid)
2. Schema design
3. Indexing strategy
4. Sharding strategy (if needed)
5. Caching strategy
6. Backup and recovery plan

Return JSON.`;

    const response = await this.llm.generate({
      system: 'You are a database architect.',
      user: prompt,
      jsonOutput: true
    });

    return JSON.parse(response);
  }

  /**
   * Generate API design
   */
  async designAPI(specification: {
    purpose: string;
    resources: string[];
    authentication: string;
    rateLimit: boolean;
  }): Promise<any> {
    const knowledge = await this.ragStore.search(
      'system-design API design REST GraphQL gateway authentication rate limiting',
      10
    );

    const context = knowledge.map(k => `${k.title}\n${k.description}`).join('\n\n');

    const prompt = `Design a production-ready API:

Knowledge:
${context}

Specification:
${JSON.stringify(specification, null, 2)}

Provide:
1. API style (REST/GraphQL/gRPC)
2. Endpoint design
3. Authentication/authorization strategy
4. Rate limiting configuration
5. Versioning strategy
6. Error handling
7. Documentation approach

Return JSON with OpenAPI-style specification.`;

    const response = await this.llm.generate({
      system: 'You are an API architect.',
      user: prompt,
      jsonOutput: true
    });

    return JSON.parse(response);
  }

  /**
   * Design observability stack
   */
  async designObservability(systemType: string): Promise<any> {
    const knowledge = await this.ragStore.search(
      'system-design observability metrics logging tracing monitoring alerting',
      10
    );

    const context = knowledge.map(k => `${k.title}\n${k.description}`).join('\n\n');

    const prompt = `Design a comprehensive observability strategy:

Knowledge:
${context}

System Type: ${systemType}

Provide:
1. Metrics to track (Golden Signals + custom)
2. Logging strategy (structured logging, retention)
3. Distributed tracing setup
4. Alerting rules
5. Dashboard design
6. Tools recommendation

Return JSON.`;

    const response = await this.llm.generate({
      system: 'You are a DevOps/SRE expert specializing in observability.',
      user: prompt,
      jsonOutput: true
    });

    return JSON.parse(response);
  }
}

