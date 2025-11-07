/**
 * RAG Knowledge Store
 * Stores extracted knowledge in a vector database for semantic search
 */

import { ExtractedKnowledge } from '../knowledge/types';
import { RAGDocument } from './types';
import { PersistentStore } from '../storage/persistent-store';
import path from 'path';

export class RAGStore {
  private documents: Map<string, RAGDocument> = new Map();
  private ollamaUrl: string;
  private persistentStore: PersistentStore;
  private autoSaveInterval: NodeJS.Timeout | null = null;
  private dataDir?: string;

  constructor(ollamaUrl: string = 'http://localhost:11434', dataDir?: string) {
    this.ollamaUrl = ollamaUrl;
    this.dataDir = dataDir;
    this.persistentStore = new PersistentStore(dataDir);
  }

  /**
   * Initialize and load from disk
   */
  async initialize(): Promise<void> {
    await this.persistentStore.initialize();
    
    // Load from disk
    const saved = await this.persistentStore.loadRAG();
    if (saved && saved.documents) {
      for (const [id, doc] of Object.entries(saved.documents)) {
        this.documents.set(id, doc as RAGDocument);
      }
      console.log(`✅ Loaded ${this.documents.size} RAG documents from disk`);
    }

    // Auto-save every 30 seconds
    this.autoSaveInterval = setInterval(() => {
      this.save();
    }, 30 * 1000);
  }

  /**
   * Save to disk
   */
  private async save(): Promise<void> {
    const data = {
      documents: Object.fromEntries(this.documents),
      lastSaved: new Date().toISOString()
    };
    await this.persistentStore.saveRAG(data);
  }

  /**
   * Add knowledge to RAG store
   */
  async addKnowledge(knowledge: ExtractedKnowledge): Promise<void> {
    const content = this.knowledgeToText(knowledge);
    const doc: RAGDocument = {
      id: knowledge.id,
      content,
      metadata: {
        source: knowledge.source,
        type: knowledge.type,
        category: knowledge.category,
        tags: knowledge.tags,
        extractedAt: knowledge.extractedAt
      }
    };

    // Generate embedding (using Ollama)
    try {
      doc.embedding = await this.generateEmbedding(content);
    } catch (error) {
      console.warn('Failed to generate embedding, storing without embedding:', error);
    }
    
    this.documents.set(knowledge.id, doc);
    
    // Save immediately
    await this.save();
  }

  /**
   * Search for relevant knowledge
   */
  async search(query: string, limit: number = 5): Promise<ExtractedKnowledge[]> {
    try {
      const queryEmbedding = await this.generateEmbedding(query);
      
      // Find most similar documents using cosine similarity
      const results = Array.from(this.documents.values())
        .filter(doc => doc.embedding && doc.embedding.length > 0)
        .map(doc => ({
          doc,
          similarity: this.cosineSimilarity(queryEmbedding, doc.embedding!)
        }))
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      // Convert back to knowledge format
      return results.map(r => this.documentToKnowledge(r.doc));
    } catch (error) {
      console.error('Error searching RAG store:', error);
      // Fallback to keyword search
      return this.keywordSearch(query, limit);
    }
  }

  /**
   * Fallback keyword search when embeddings aren't available
   */
  private keywordSearch(query: string, limit: number): ExtractedKnowledge[] {
    const queryLower = query.toLowerCase();
    const keywords = queryLower.split(/\s+/);
    
    const results = Array.from(this.documents.values())
      .map(doc => {
        const contentLower = doc.content.toLowerCase();
        const matches = keywords.filter(kw => contentLower.includes(kw)).length;
        return { doc, score: matches };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return results.map(r => this.documentToKnowledge(r.doc));
  }

  /**
   * Find knowledge by category/tags
   */
  async findByCategory(category: string): Promise<ExtractedKnowledge[]> {
    return Array.from(this.documents.values())
      .filter(doc => doc.metadata.category === category)
      .map(doc => this.documentToKnowledge(doc));
  }

  /**
   * Find knowledge that can be combined for a use case
   */
  async findRelevantForUseCase(useCase: string): Promise<ExtractedKnowledge[]> {
    const query = `How to build ${useCase}`;
    return this.search(query, 10);
  }

  /**
   * Get all stored knowledge
   */
  getAllKnowledge(): ExtractedKnowledge[] {
    return Array.from(this.documents.values()).map(doc => this.documentToKnowledge(doc));
  }

  private knowledgeToText(knowledge: ExtractedKnowledge): string {
    return `
Title: ${knowledge.title}
Description: ${knowledge.description}
Category: ${knowledge.category}
Type: ${knowledge.type}
Source: ${knowledge.source}

Patterns:
${knowledge.patterns.map(p => `- ${p}`).join('\n')}

Use Cases:
${knowledge.useCases.map(u => `- ${u}`).join('\n')}

Code Examples:
${knowledge.codeSnippets.map(s => `${s.file}:\n${s.code.substring(0, 500)}`).join('\n\n')}

Tags: ${knowledge.tags.join(', ')}
    `.trim();
  }

  private documentToKnowledge(doc: RAGDocument): ExtractedKnowledge {
    // Parse document back to knowledge format
    // This is simplified - in production would need proper parsing
    const lines = doc.content.split('\n');
    const title = lines.find(l => l.startsWith('Title:'))?.replace('Title:', '').trim() || doc.id;
    const description = lines.find(l => l.startsWith('Description:'))?.replace('Description:', '').trim() || '';
    
    const patternsMatch = doc.content.match(/Patterns:\n((?:- .+\n?)+)/);
    const patterns = patternsMatch 
      ? patternsMatch[1].split('\n').filter(l => l.trim()).map(l => l.replace('- ', '').trim())
      : [];

    const useCasesMatch = doc.content.match(/Use Cases:\n((?:- .+\n?)+)/);
    const useCases = useCasesMatch
      ? useCasesMatch[1].split('\n').filter(l => l.trim()).map(l => l.replace('- ', '').trim())
      : [];

    return {
      id: doc.id,
      source: doc.metadata.source,
      type: doc.metadata.type as any,
      category: doc.metadata.category,
      title,
      description,
      codeSnippets: [],
      patterns,
      dependencies: [],
      useCases,
      tags: doc.metadata.tags,
      extractedAt: doc.metadata.extractedAt
    };
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await fetch(`${this.ollamaUrl}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'nomic-embed-text',
          prompt: text.substring(0, 8192) // Limit text length
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama embedding API error: ${response.status}`);
      }

      const data = await response.json();
      return data.embedding || [];
    } catch (error) {
      console.warn('Failed to generate embedding via Ollama:', error);
      // Return empty embedding - will use keyword search fallback
      return [];
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }
}

