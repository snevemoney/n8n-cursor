/**
 * RAG Knowledge Store
 * Stores extracted knowledge in a vector database for semantic search
 */

import { ExtractedKnowledge } from '../knowledge/types';
import { RAGDocument } from './types';
import { PersistentStore } from '../storage/persistent-store';
import path from 'path';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class RAGStore {
  private documents: Map<string, RAGDocument> = new Map();
  private ollamaUrl: string;
  private persistentStore: PersistentStore;
  private autoSaveInterval: NodeJS.Timeout | null = null;
  private dataDir?: string;
  
  // Caching for query optimization
  private embeddingCache = new Map<string, number[]>(); // query -> embedding
  private queryResultCache = new Map<string, CacheEntry<ExtractedKnowledge[]>>(); // query:limit -> results
  private readonly QUERY_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly EMBEDDING_CACHE_MAX_SIZE = 1000; // Max cached embeddings
  
  // Pre-compiled query patterns (reuse instead of compiling each time)
  private readonly queryPatterns = {
    whatIs: /^(what is|who is|define|tell me about|explain)/i,
    howTo: /^(how to|how do|how does|how can)/i,
    technical: /(implement|deploy|integrate|build|create|develop|design|architecture|system|api|database|workflow|security|performance|optimize|refactor)/i,
    casual: /^(which|what.*better|prefer|favorite|best.*between|yes|no|maybe|sure|ok)/i
  };

  /**
   * Determine adaptive similarity threshold based on query type
   */
  private getAdaptiveThreshold(query: string, isWhatIsQuery: boolean, isHowToQuery: boolean): number {
    const isTechnical = this.queryPatterns.technical.test(query);
    const isCasual = this.queryPatterns.casual.test(query);
    
    // "What is" queries need higher threshold to avoid irrelevant matches
    if (isWhatIsQuery) {
      return 0.4; // Higher threshold for definition questions
    }
    
    // "How to" queries need moderate threshold
    if (isHowToQuery) {
      return 0.35; // Moderate threshold for procedural questions
    }
    
    // Technical queries can have lower threshold (more permissive)
    if (isTechnical) {
      return 0.3; // Lower threshold for technical queries (more results needed)
    }
    
    // Casual queries need higher threshold (avoid noise)
    if (isCasual) {
      return 0.4; // Higher threshold for casual questions
    }
    
    // Default threshold for general queries
    return 0.35;
  }

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
      let migratedCount = 0;
      for (const [id, doc] of Object.entries(saved.documents)) {
        const ragDoc = doc as RAGDocument;
        
        // Backfill pre-computed metadata flags for existing documents (migration)
        if (ragDoc.metadata.isTestFile === undefined) {
          ragDoc.metadata.isTestFile = this.computeIsTestFile(
            ragDoc.id,
            ragDoc.metadata.source,
            ragDoc.content
          );
          ragDoc.metadata.isReadme = this.computeIsReadme(
            ragDoc.id,
            ragDoc.metadata.source,
            ragDoc.metadata.category
          );
          ragDoc.metadata.isDoc = this.computeIsDoc(
            ragDoc.id,
            ragDoc.metadata.source,
            ragDoc.metadata.category
          );
          migratedCount++;
        }
        
        this.documents.set(id, ragDoc);
      }
      console.log(`✅ Loaded ${this.documents.size} RAG documents from disk`);
      if (migratedCount > 0) {
        console.log(`  ✓ Migrated ${migratedCount} documents with pre-computed flags`);
        // Save migrated documents
        await this.save();
      }
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
    
    // Extract primary file path from codeSnippets if available
    const primaryFilePath = knowledge.filePath || 
                           (knowledge.codeSnippets && knowledge.codeSnippets.length > 0 
                             ? knowledge.codeSnippets[0].file 
                             : undefined);
    
    const doc: RAGDocument = {
      id: knowledge.id,
      content,
      metadata: {
        source: knowledge.source,
        type: knowledge.type,
        category: knowledge.category,
        tags: knowledge.tags,
        extractedAt: knowledge.extractedAt,
        indexingStrategy: 'chunk', // Default strategy
        // Pre-compute metadata flags for fast filtering
        isTestFile: this.computeIsTestFile(knowledge.id, knowledge.source, content),
        isReadme: this.computeIsReadme(knowledge.id, knowledge.source, knowledge.category),
        isDoc: this.computeIsDoc(knowledge.id, knowledge.source, knowledge.category),
        // Preserve file path information
        filePath: primaryFilePath,
        contentUrl: knowledge.contentUrl,
        codeSnippets: knowledge.codeSnippets // Preserve code snippets for later retrieval
      }
    };

    // Generate embedding (using Ollama)
    try {
      doc.embedding = await this.generateEmbedding(content);
    } catch (error) {
      console.warn('Failed to generate embedding, storing without embedding:', error);
    }
    
    this.documents.set(knowledge.id, doc);
    
    // Invalidate query cache (new knowledge added)
    this.invalidateQueryCache();
    
    // Save immediately
    await this.save();
  }

  /**
   * Pre-compute: Check if document is a test file
   */
  private computeIsTestFile(id: string, source: string, content: string): boolean {
    const idLower = id.toLowerCase();
    const sourceLower = source.toLowerCase();
    const contentLower = content.toLowerCase();
    
    return !!(
      sourceLower.includes('test-') ||
      contentLower.includes('test-174857') ||
      idLower.includes('test-') ||
      idLower.match(/test-\d+/) ||
      sourceLower.match(/test-\d+/)
    );
  }

  /**
   * Pre-compute: Check if document is a README
   */
  private computeIsReadme(id: string, source: string, category: string): boolean {
    const idLower = id.toLowerCase();
    const sourceLower = source.toLowerCase();
    
    return !!(
      idLower.includes('readme') ||
      sourceLower.includes('readme') ||
      category === 'documentation' && idLower.includes('readme')
    );
  }

  /**
   * Pre-compute: Check if document is documentation
   */
  private computeIsDoc(id: string, source: string, category: string): boolean {
    const idLower = id.toLowerCase();
    const sourceLower = source.toLowerCase();
    
    return !!(
      idLower.includes('doc-') ||
      sourceLower.includes('docs/') ||
      category === 'documentation'
    );
  }

  /**
   * Add a summary entry for a knowledge item (Summary Indexing strategy)
   */
  async addSummaryEntry(
    originalId: string,
    summary: string,
    metadata: {
      source: string;
      type: string;
      category: string;
      tags: string[];
      extractedAt: string;
    }
  ): Promise<void> {
    const id = `${originalId}-summary`;
    const content = `Summary: ${summary}`;
    const doc: RAGDocument = {
      id,
      content,
      metadata: {
        ...metadata,
        indexingStrategy: 'summary',
        originalId,
        // Pre-compute metadata flags
        isTestFile: this.computeIsTestFile(id, metadata.source, content),
        isReadme: this.computeIsReadme(id, metadata.source, metadata.category),
        isDoc: this.computeIsDoc(id, metadata.source, metadata.category)
      }
    };

    try {
      doc.embedding = await this.generateEmbedding(doc.content);
    } catch (error) {
      console.warn('Failed to generate embedding for summary:', error);
    }

    this.documents.set(id, doc);
    this.invalidateQueryCache(); // Invalidate cache on new entry
    await this.save();
  }

  /**
   * Add a query entry for a knowledge item (Query Indexing strategy)
   */
  async addQueryEntry(
    originalId: string,
    query: string,
    metadata: {
      source: string;
      type: string;
      category: string;
      tags: string[];
      extractedAt: string;
    }
  ): Promise<void> {
    const id = `${originalId}-query-${query.toLowerCase().replace(/\s+/g, '-').substring(0, 50)}`;
    const content = `Question: ${query}`;
    const doc: RAGDocument = {
      id,
      content,
      metadata: {
        ...metadata,
        indexingStrategy: 'query',
        originalId,
        // Pre-compute metadata flags
        isTestFile: this.computeIsTestFile(id, metadata.source, content),
        isReadme: this.computeIsReadme(id, metadata.source, metadata.category),
        isDoc: this.computeIsDoc(id, metadata.source, metadata.category)
      }
    };

    try {
      doc.embedding = await this.generateEmbedding(doc.content);
    } catch (error) {
      console.warn('Failed to generate embedding for query:', error);
    }

    this.documents.set(id, doc);
    this.invalidateQueryCache(); // Invalidate cache on new entry
    await this.save();
  }

  /**
   * Add a sub-chunk entry (Sub-chunks Indexing strategy)
   */
  async addSubChunkEntry(
    originalId: string,
    chunkContent: string,
    chunkIndex: number,
    chunkTotal: number,
    metadata: {
      source: string;
      type: string;
      category: string;
      tags: string[];
      extractedAt: string;
    }
  ): Promise<void> {
    const id = `${originalId}-chunk-${chunkIndex}`;
    const doc: RAGDocument = {
      id,
      content: chunkContent,
      metadata: {
        ...metadata,
        indexingStrategy: 'sub-chunk',
        originalId,
        chunkIndex,
        chunkTotal,
        // Pre-compute metadata flags
        isTestFile: this.computeIsTestFile(id, metadata.source, chunkContent),
        isReadme: this.computeIsReadme(id, metadata.source, metadata.category),
        isDoc: this.computeIsDoc(id, metadata.source, metadata.category)
      }
    };

    try {
      doc.embedding = await this.generateEmbedding(chunkContent);
    } catch (error) {
      console.warn('Failed to generate embedding for sub-chunk:', error);
    }

    this.documents.set(id, doc);
    this.invalidateQueryCache(); // Invalidate cache on new entry
    await this.save();
  }

  /**
   * Remove knowledge from RAG store by ID
   */
  async removeKnowledge(id: string): Promise<boolean> {
    const removed = this.documents.delete(id);
    if (removed) {
      this.invalidateQueryCache(); // Invalidate cache on removal
      await this.save();
    }
    return removed;
  }

  /**
   * Remove multiple knowledge entries by IDs
   */
  async removeKnowledgeBatch(ids: string[]): Promise<number> {
    let removed = 0;
    for (const id of ids) {
      if (this.documents.delete(id)) {
        removed++;
      }
    }
    if (removed > 0) {
      this.invalidateQueryCache(); // Invalidate cache on removal
      await this.save();
    }
    return removed;
  }

  /**
   * Invalidate query result cache (call when knowledge is added/removed)
   */
  private invalidateQueryCache(): void {
    this.queryResultCache.clear();
  }

  /**
   * Get cached embedding or generate new one
   */
  private async getCachedEmbedding(query: string): Promise<number[]> {
    // Check cache first
    const cached = this.embeddingCache.get(query);
    if (cached) {
      return cached;
    }

    // Generate new embedding
    const embedding = await this.generateEmbedding(query);
    
    // Cache it (with size limit)
    if (this.embeddingCache.size >= this.EMBEDDING_CACHE_MAX_SIZE) {
      // Remove oldest entry (simple FIFO)
      const firstKey = this.embeddingCache.keys().next().value;
      if (firstKey) {
        this.embeddingCache.delete(firstKey);
      }
    }
    this.embeddingCache.set(query, embedding);
    
    return embedding;
  }

  /**
   * Search for relevant knowledge with strategy-aware prioritization and caching
   */
  async search(query: string, limit: number = 5): Promise<ExtractedKnowledge[]> {
    try {
      // Check query result cache first (Phase 1 optimization: Cache where it counts)
      const cacheKey = `query:${query}:${limit}`;
      const cachedResult = this.queryResultCache.get(cacheKey);
      if (cachedResult) {
        const age = Date.now() - cachedResult.timestamp;
        if (age < this.QUERY_CACHE_TTL) {
          return cachedResult.data; // Cache hit!
        }
        // Cache expired, remove it
        this.queryResultCache.delete(cacheKey);
      }

      // Get cached embedding or generate new one (Phase 1 optimization: Cache embeddings)
      const queryEmbedding = await this.getCachedEmbedding(query);
      
      // Detect query type using pre-compiled patterns (Phase 1 optimization: Parameterize & reuse)
      const isWhatIsQuery = this.queryPatterns.whatIs.test(query);
      const isHowToQuery = this.queryPatterns.howTo.test(query);
      
      // Get adaptive similarity threshold based on query type
      const minSimilarity = this.getAdaptiveThreshold(query, isWhatIsQuery, isHowToQuery);
      
      // EARLY FILTERING: Filter BEFORE expensive similarity computation (Phase 1 optimization: Shape the query)
      const candidateDocs = Array.from(this.documents.values())
        .filter(doc => {
          // Early exit: must have embedding
          if (!doc.embedding || doc.embedding.length === 0) return false;
          
          // Early exit: filter test files using pre-computed flag (Phase 1 optimization: Denormalize selectively)
          if (doc.metadata.isTestFile) return false;
          
          // Early exit: filter by strategy for query type (skip irrelevant strategies)
          const strategy = doc.metadata.indexingStrategy || 'chunk';
          if (isWhatIsQuery && strategy === 'query') return false; // Skip query entries for "what is"
          if (isHowToQuery && strategy === 'summary' && !doc.metadata.isReadme) return false; // Skip non-README summaries for "how to"
          
          return true;
        });

      // Compute similarity only for filtered candidates (Phase 1 optimization: Less IO)
      const results = candidateDocs
        .map(doc => ({
          doc,
          similarity: this.cosineSimilarity(queryEmbedding, doc.embedding!)
        }))
        // Strategy-aware boosting using pre-computed flags (Phase 1 optimization: Denormalize)
        .map(r => {
          const strategy = r.doc.metadata.indexingStrategy || 'chunk';
          let boost = 0;
          
          // Adaptive boosting based on query type and document characteristics
          if (isWhatIsQuery) {
            // For "what is" queries, prioritize summary entries and README files
            if (strategy === 'summary') {
              boost = 0.4; // Strong boost for summaries
            } else if (strategy === 'chunk') {
              boost = r.doc.metadata.isReadme ? 0.3 : (r.doc.metadata.isDoc ? 0.15 : 0);
            }
            // Penalize code files that aren't READMEs for "what is" queries
            if (!r.doc.metadata.isReadme && r.doc.metadata.type === 'code') {
              boost -= 0.15; // Reduce similarity for non-README code files
            }
          } else if (isHowToQuery) {
            // For "how to" queries, prioritize query entries and sub-chunks
            if (strategy === 'query') {
              boost = 0.3; // Boost for query-indexed entries
            } else if (strategy === 'sub-chunk') {
              boost = 0.15; // Boost for sub-chunks (more granular)
            } else if (strategy === 'chunk' && r.doc.metadata.isReadme) {
              boost = 0.2; // README files are good for "how to" too
            }
          } else {
            // For other queries, prefer summaries and sub-chunks
            if (strategy === 'summary') {
              boost = 0.2;
            } else if (strategy === 'sub-chunk') {
              boost = 0.1;
            } else if (strategy === 'chunk' && r.doc.metadata.isReadme) {
              boost = 0.15; // README files are generally useful
            }
          }
          
          return {
            ...r,
            similarity: Math.min(1.0, r.similarity + boost)
          };
        })
        .sort((a, b) => b.similarity - a.similarity)
        .filter(r => {
          // Apply adaptive similarity threshold - filter out low-quality matches
          return r.similarity >= minSimilarity;
        })
        .slice(0, limit);

      // Convert back to knowledge format, resolving original IDs if needed
      const knowledgeResults = results.map(r => {
        const doc = r.doc;
        let knowledge: ExtractedKnowledge;
        
        // If this is a summary/query/sub-chunk entry, try to get the original knowledge
        if (doc.metadata.originalId && this.documents.has(doc.metadata.originalId)) {
          const originalDoc = this.documents.get(doc.metadata.originalId)!;
          // Merge summary/query info with original knowledge
          knowledge = this.documentToKnowledge(originalDoc);
          // Enhance description with summary/query context
          if (doc.metadata.indexingStrategy === 'summary') {
            knowledge.description = `Summary: ${doc.content.replace('Summary: ', '')}\n\n${knowledge.description}`;
          } else if (doc.metadata.indexingStrategy === 'query') {
            knowledge.description = `Answers: ${doc.content.replace('Question: ', '')}\n\n${knowledge.description}`;
          }
        } else {
          knowledge = this.documentToKnowledge(doc);
        }
        
        // Attach similarity score to knowledge object for use in tool handler
        (knowledge as any).similarity = r.similarity;
        
        return knowledge;
      });

      // Cache results (Phase 1 optimization: Cache where it counts)
      this.queryResultCache.set(cacheKey, {
        data: knowledgeResults,
        timestamp: Date.now()
      });

      return knowledgeResults;
    } catch (error) {
      console.error('Error searching RAG store:', error);
      // Fallback to keyword search
      return this.keywordSearch(query, limit);
    }
  }

  /**
   * Fallback keyword search when embeddings aren't available (optimized with early filtering)
   */
  private keywordSearch(query: string, limit: number): ExtractedKnowledge[] {
    const queryLower = query.toLowerCase();
    const keywords = queryLower.split(/\s+/);
    
    // Early filtering: filter test files BEFORE keyword matching (Phase 1 optimization: Shape the query)
    const candidateDocs = Array.from(this.documents.values())
      .filter(doc => {
        // Use pre-computed flag instead of string operations (Phase 1 optimization: Denormalize)
        return !doc.metadata.isTestFile;
      });
    
    const results = candidateDocs
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
    // Include full file content in code examples (not truncated)
    const codeExamples = knowledge.codeSnippets.map(s => {
      // For full file content, include it all (up to reasonable limit)
      // For very large files, we still truncate but at a higher limit
      const maxSnippetSize = 50000; // 50KB per snippet
      const code = s.code.length > maxSnippetSize
        ? s.code.substring(0, maxSnippetSize) + '\n... (truncated)'
        : s.code;
      
      return `${s.file}:\n${code}`;
    }).join('\n\n');

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
${codeExamples}

Tags: ${knowledge.tags.join(', ')}
    `.trim();
  }

  /**
   * Store a file directly in RAG (for full file content storage)
   */
  async storeFile(
    filePath: string,
    content: string,
    metadata?: {
      source?: string;
      type?: string;
      category?: string;
      tags?: string[];
      ast?: any;
    }
  ): Promise<void> {
    const id = `file-${filePath.replace(/[^a-zA-Z0-9]/g, '-')}`;
    const doc: RAGDocument = {
      id,
      content: content,
      metadata: {
        source: metadata?.source || 'file-system',
        type: metadata?.type || 'code',
        category: metadata?.category || 'file',
        tags: metadata?.tags || [],
        extractedAt: new Date().toISOString()
      }
    };

    // Generate embedding
    try {
      doc.embedding = await this.generateEmbedding(content);
    } catch (error) {
      console.warn('Failed to generate embedding for file:', error);
    }

    this.documents.set(id, doc);
    await this.save();
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

    // Restore code snippets from metadata if available, otherwise parse from content
    let codeSnippets: Array<{ file: string; language: string; code: string; explanation: string }> = [];
    if (doc.metadata.codeSnippets && doc.metadata.codeSnippets.length > 0) {
      codeSnippets = doc.metadata.codeSnippets;
    } else {
      // Try to parse code snippets from content (fallback)
      const codeExamplesMatch = doc.content.match(/Code Examples:\n((?:.+\n?)+)/);
      if (codeExamplesMatch) {
        const codeExamples = codeExamplesMatch[1];
        // Simple parsing - extract file paths and code
        const fileMatches = codeExamples.match(/([^\n:]+):\n/g);
        if (fileMatches) {
          fileMatches.forEach((match, idx) => {
            const file = match.replace(':', '').trim();
            const nextMatch = fileMatches[idx + 1];
            const codeStart = codeExamples.indexOf(match) + match.length;
            const codeEnd = nextMatch ? codeExamples.indexOf(nextMatch) : codeExamples.length;
            const code = codeExamples.substring(codeStart, codeEnd).trim();
            
            if (file && code) {
              codeSnippets.push({
                file,
                language: this.detectLanguage(file),
                code: code.substring(0, 1000), // Limit size
                explanation: `Code from ${file}`
              });
            }
          });
        }
      }
    }

    return {
      id: doc.id,
      source: doc.metadata.source,
      type: doc.metadata.type as any,
      category: doc.metadata.category,
      title,
      description,
      codeSnippets,
      patterns,
      dependencies: [],
      useCases,
      tags: Array.isArray(doc.metadata.tags) ? doc.metadata.tags : [],
      extractedAt: doc.metadata.extractedAt,
      // Restore file path information
      filePath: doc.metadata.filePath,
      contentUrl: doc.metadata.contentUrl
    };
  }
  
  private detectLanguage(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase() || '';
    const langMap: Record<string, string> = {
      'js': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'jsx': 'javascript',
      'sh': 'bash',
      'md': 'markdown',
      'yaml': 'yaml',
      'yml': 'yaml',
      'json': 'json',
      'py': 'python',
      'go': 'go',
      'rs': 'rust',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c'
    };
    return langMap[ext] || 'text';
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    // HYBRID APPROACH: Use OpenAI embeddings if available, fallback to Ollama
    const useOpenAIEmbeddings = process.env.USE_OPENAI_EMBEDDINGS === 'true' && process.env.OPENAI_API_KEY;
    
    if (useOpenAIEmbeddings) {
      try {
        // Dynamic import to avoid breaking if OpenAI service not available
        const { getOpenAIService } = await import('../llm/openai-service');
        const openai = getOpenAIService();
        
        // Use OpenAI embeddings for better quality
        const embedding = await openai.embedText(text.substring(0, 8192), 'text-embedding-3-small');
        
        if (embedding && embedding.length > 0) {
          return embedding;
        }
      } catch (error) {
        console.warn('Failed to generate embedding via OpenAI, falling back to Ollama:', error);
        // Fall through to Ollama
      }
    }
    
    // Fallback to Ollama (default, fast, local)
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

