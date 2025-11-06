/**
 * Scorpion AI Agent
 * Uses RAG knowledge to build new side hustles intelligently
 */

import { RAGStore } from '../rag/store';
import { ExtractedKnowledge } from '../knowledge/types';
import { BuildRequest, BuildPlan } from './types';

class BrowserResearch {
  async search(query: string): Promise<string> {
    // TODO: Implement browser research using browser automation
    // For now, return mock data
    return `Research results for: ${query}\n\nBased on web research, here are best practices and patterns for implementing this feature.`;
  }
}

export class ScorpionAgent {
  private ragStore: RAGStore;
  private browserResearch: BrowserResearch;
  private ollamaUrl: string;

  constructor(ragStore: RAGStore, ollamaUrl: string = 'http://localhost:11434') {
    this.ragStore = ragStore;
    this.browserResearch = new BrowserResearch();
    this.ollamaUrl = ollamaUrl;
  }

  /**
   * Main method: Build a new side hustle using accumulated knowledge
   */
  async buildSideHustle(request: BuildRequest): Promise<BuildPlan> {
    // Step 1: Query RAG for relevant knowledge
    const relevantKnowledge = await this.findRelevantKnowledge(request);
    
    // Step 2: Research missing pieces
    const researchResults = await this.researchMissingKnowledge(request, relevantKnowledge);
    
    // Step 3: Combine knowledge and create build plan
    const plan = await this.createBuildPlan(request, relevantKnowledge, researchResults);
    
    return plan;
  }

  /**
   * Find relevant knowledge from RAG
   */
  private async findRelevantKnowledge(request: BuildRequest): Promise<ExtractedKnowledge[]> {
    const queries = [
      `How to build ${request.target}`,
      ...request.features.map(f => `How to implement ${f}`),
      request.requirements
    ];

    const allKnowledge: ExtractedKnowledge[] = [];
    for (const query of queries) {
      const results = await this.ragStore.search(query, 5);
      allKnowledge.push(...results);
    }

    // Deduplicate and rank by relevance
    return this.deduplicateKnowledge(allKnowledge);
  }

  /**
   * Research missing knowledge via browser
   */
  private async researchMissingKnowledge(
    request: BuildRequest,
    existingKnowledge: ExtractedKnowledge[]
  ): Promise<Record<string, string>> {
    const missing = this.identifyMissingKnowledge(request, existingKnowledge);
    const research: Record<string, string> = {};

    for (const topic of missing) {
      const result = await this.browserResearch.search(topic);
      research[topic] = result;
    }

    return research;
  }

  /**
   * Create build plan combining knowledge
   */
  private async createBuildPlan(
    request: BuildRequest,
    knowledge: ExtractedKnowledge[],
    research: Record<string, string>
  ): Promise<BuildPlan> {
    // Group knowledge by type
    const architecturePatterns = knowledge.filter(k => k.type === 'architecture');
    const features = knowledge.filter(k => k.type === 'feature' || k.type === 'pattern');

    // Find best patterns for multi-tenant (if needed)
    const multiTenantPattern = architecturePatterns.find(k => k.category === 'multi-tenant');
    const paymentPattern = architecturePatterns.find(k => k.category === 'payment');
    
    // Find feature implementations
    const chatbotFeature = features.find(k => k.category === 'chatbot');
    const workflowFeature = features.find(k => k.category === 'workflow');

    // Generate reasoning
    const reasoning = this.generateReasoning(request, architecturePatterns, features);

    return {
      name: this.generateName(request),
      description: this.generateDescription(request, knowledge),
      architecture: {
        patterns: architecturePatterns,
        reasoning
      },
      features: request.features.map(feature => {
        const featureKnowledge = features.filter(k => 
          k.category === feature || 
          k.tags.some(tag => tag.includes(feature))
        );
        
        return {
          knowledge: featureKnowledge,
          implementation: this.generateImplementationPlan(feature, featureKnowledge)
        };
      }),
      codeStructure: {
        files: this.generateFileStructure(knowledge, request.features),
        dependencies: this.extractDependencies(knowledge)
      },
      researchNeeded: Object.keys(research)
    };
  }

  private deduplicateKnowledge(knowledge: ExtractedKnowledge[]): ExtractedKnowledge[] {
    const seen = new Set<string>();
    return knowledge.filter(k => {
      if (seen.has(k.id)) return false;
      seen.add(k.id);
      return true;
    });
  }

  private identifyMissingKnowledge(
    request: BuildRequest,
    knowledge: ExtractedKnowledge[]
  ): string[] {
    const missing: string[] = [];
    const categories = new Set(knowledge.map(k => k.category));
    const tags = new Set(knowledge.flatMap(k => k.tags));

    // Check if we have knowledge for requested features
    for (const feature of request.features) {
      const hasCategory = categories.has(feature);
      const hasTag = Array.from(tags).some(tag => tag.includes(feature.toLowerCase()));
      
      if (!hasCategory && !hasTag) {
        missing.push(`How to implement ${feature} for ${request.target}`);
      }
    }

    return missing;
  }

  private generateName(request: BuildRequest): string {
    // Simple name generation - could use LLM for better names
    const targetClean = request.target.replace(/\s+/g, '');
    return `${targetClean.charAt(0).toUpperCase() + targetClean.slice(1)}Platform`;
  }

  private generateDescription(request: BuildRequest, knowledge: ExtractedKnowledge[]): string {
    const sources = [...new Set(knowledge.map(k => k.source))];
    return `A platform for ${request.target} using proven patterns from ${sources.join(', ')}. Features include ${request.features.join(', ')}.`;
  }

  private generateReasoning(
    request: BuildRequest,
    architecturePatterns: ExtractedKnowledge[],
    features: ExtractedKnowledge[]
  ): string {
    const reasons: string[] = [];

    if (architecturePatterns.length > 0) {
      reasons.push(`Using ${architecturePatterns.map(p => p.source).join(' and ')} architecture patterns for proven scalability.`);
    }

    if (features.length > 0) {
      reasons.push(`Leveraging ${features.map(f => f.source).join(', ')} feature implementations.`);
    }

    return reasons.join(' ') || 'Building from scratch with best practices.';
  }

  private generateImplementationPlan(feature: string, knowledge: ExtractedKnowledge[]): string {
    if (knowledge.length === 0) {
      return `Implement ${feature} from scratch using best practices.`;
    }

    const sources = knowledge.map(k => k.source).join(' and ');
    return `Combine ${sources} implementations of ${feature}, adapting for the target use case.`;
  }

  private generateFileStructure(knowledge: ExtractedKnowledge[], features: string[]): string[] {
    const files = new Set<string>();
    
    // Common Next.js structure
    files.add('app/');
    files.add('lib/');
    files.add('components/');
    files.add('api/');

    // Add feature-specific files
    if (features.includes('chatbot')) {
      files.add('app/chat/');
      files.add('lib/chat/');
    }

    if (features.includes('multi-tenant')) {
      files.add('lib/tenant/');
      files.add('middleware.ts');
    }

    if (features.includes('payment')) {
      files.add('lib/payment/');
      files.add('api/webhooks/');
    }

    return Array.from(files);
  }

  private extractDependencies(knowledge: ExtractedKnowledge[]): string[] {
    const deps = new Set<string>();
    
    knowledge.forEach(k => {
      k.dependencies.forEach(d => deps.add(d));
    });

    // Add common dependencies
    deps.add('next');
    deps.add('react');
    deps.add('typescript');

    return Array.from(deps);
  }
}

