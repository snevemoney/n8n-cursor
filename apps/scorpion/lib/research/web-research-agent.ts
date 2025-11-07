/**
 * Web Research Agent
 * Conducts automated web research using browser automation and LLM analysis
 */

import { ResearchBrowser } from './browser-pool';
import { LLMAdapter } from '@scorpion/core';
import { RAGStore } from '@scorpion/core';

export interface ResearchQuery {
  query: string;
  category: ResearchCategory;
  depth: 'shallow' | 'medium' | 'deep';
  maxSites?: number;
}

export type ResearchCategory = 
  | 'company-research'
  | 'market-analysis' 
  | 'competitor-analysis'
  | 'technical-research'
  | 'financial-research'
  | 'general';

export interface ResearchResult {
  query: string;
  category: ResearchCategory;
  sources: Source[];
  summary: string;
  keyFindings: string[];
  confidence: number;
  timestamp: Date;
  duration: number;
}

export interface Source {
  url: string;
  title: string;
  content: string;
  relevanceScore: number;
  screenshotUrl?: string;
}

export class WebResearchAgent {
  constructor(
    private llm: LLMAdapter,
    private ragStore: RAGStore
  ) {}

  async research(
    query: ResearchQuery, 
    browser: ResearchBrowser
  ): Promise<ResearchResult> {
    const startTime = Date.now();
    console.log(`🔍 Starting ${query.category} research: ${query.query}`);

    try {
      // 1. Generate optimized search queries
      const searchQueries = await this.generateSearchQueries(query);
      console.log(`📝 Generated ${searchQueries.length} search queries`);

      // 2. Execute searches and collect sources
      const sources: Source[] = [];
      for (const searchQuery of searchQueries.slice(0, 3)) { // Limit to 3 searches
        try {
          const searchResults = await this.executeSearch(searchQuery, browser);
          sources.push(...searchResults);
          
          if (sources.length >= (query.maxSites || 10)) break;
        } catch (error) {
          console.error(`Search failed for "${searchQuery}":`, error);
        }
      }

      console.log(`📦 Collected ${sources.length} potential sources`);

      // 3. Visit and enrich top sources
      const topSources = sources.slice(0, query.maxSites || 10);
      const enrichedSources = await this.enrichSources(topSources, browser, query.depth);

      console.log(`✨ Enriched ${enrichedSources.length} sources`);

      // 4. Analyze and synthesize findings
      const analysis = await this.analyzeFindings(query, enrichedSources);

      // 5. Store in RAG for future queries
      await this.storeResearch(query, analysis);

      const duration = Date.now() - startTime;
      console.log(`✅ Research completed in ${(duration / 1000).toFixed(1)}s`);

      return {
        ...analysis,
        timestamp: new Date(),
        duration
      };
    } catch (error: any) {
      console.error('Research failed:', error);
      throw new Error(`Research failed: ${error.message}`);
    }
  }

  private async generateSearchQueries(query: ResearchQuery): Promise<string[]> {
    const prompt = `Generate 3-5 specific search queries for this research request.
Each query should be optimized to find high-quality, relevant information.

Category: ${query.category}
Query: ${query.query}
Depth: ${query.depth}

Return JSON: { "queries": ["query1", "query2", ...] }`;

    const response = await this.llm.generate({
      system: 'You are a search query optimizer. Generate diverse, specific queries that cover different angles of the topic.',
      user: prompt,
      jsonOutput: true
    });

    const parsed = JSON.parse(response);
    return parsed.queries || [query.query];
  }

  private async executeSearch(
    query: string, 
    browser: ResearchBrowser
  ): Promise<Source[]> {
    console.log(`🔎 Searching for: ${query}`);

    try {
      // Use DuckDuckGo (doesn't require API key)
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      await browser.navigate(searchUrl);
      
      // Wait for results to load
      await browser.wait(2000);

      // Extract search results
      const results = await browser.extract('.result__a');
      
      return results
        .filter((r: any) => r.href && r.text)
        .slice(0, 10)
        .map((r: any) => ({
          url: r.href,
          title: r.text || 'Untitled',
          content: '',
          relevanceScore: 0
        }));
    } catch (error) {
      console.error(`Search execution failed:`, error);
      return [];
    }
  }

  private async enrichSources(
    sources: Source[], 
    browser: ResearchBrowser,
    depth: 'shallow' | 'medium' | 'deep'
  ): Promise<Source[]> {
    const enriched: Source[] = [];
    const maxSources = depth === 'shallow' ? 3 : depth === 'medium' ? 5 : 8;

    for (const source of sources.slice(0, maxSources)) {
      try {
        console.log(`📖 Visiting: ${source.url}`);
        await browser.navigate(source.url);
        await browser.wait(2000); // Wait for page to fully load
        
        // Extract main content
        const content = await this.extractMainContent(browser);
        
        if (!content || content.length < 100) {
          console.log(`⚠️ Insufficient content from ${source.url}, skipping`);
          continue;
        }

        // Calculate relevance
        const relevance = await this.calculateRelevance(source.title, content);

        enriched.push({
          ...source,
          content: content.substring(0, 5000), // Limit content length
          relevanceScore: relevance
        });

        console.log(`✅ Enriched: ${source.title} (relevance: ${relevance.toFixed(2)})`);

      } catch (error) {
        console.error(`Failed to enrich source ${source.url}:`, error);
      }
    }

    return enriched.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  private async extractMainContent(browser: ResearchBrowser): Promise<string> {
    // Try multiple selectors for main content
    const selectors = [
      'article',
      'main',
      '[role="main"]',
      '.content',
      '.post-content',
      '#content',
      '.article-body'
    ];

    for (const selector of selectors) {
      try {
        const data = await browser.extract(selector);
        if (data && data[0]?.text && data[0].text.length > 200) {
          return data[0].text;
        }
      } catch {}
    }

    // Fallback to body text
    try {
      return await browser.getTextContent();
    } catch {
      return '';
    }
  }

  private async calculateRelevance(title: string, content: string): Promise<number> {
    try {
      const preview = content.substring(0, 1000);
      const response = await this.llm.generate({
        system: 'Rate the relevance of this content on a scale of 0.0 to 1.0. Respond with only a number.',
        user: `Title: ${title}\nContent preview: ${preview}`
      });

      const score = parseFloat(response.trim());
      return isNaN(score) ? 0.5 : Math.max(0, Math.min(1, score));
    } catch {
      return 0.5; // Default relevance if calculation fails
    }
  }

  private async analyzeFindings(
    query: ResearchQuery,
    sources: Source[]
  ): Promise<Omit<ResearchResult, 'timestamp' | 'duration'>> {
    const combinedContent = sources
      .map((s, i) => `[Source ${i + 1}: ${s.title}]\n${s.content}`)
      .join('\n\n---\n\n');
    
    const prompt = `Analyze this research and provide comprehensive insights:

Query: ${query.query}
Category: ${query.category}

Sources (${sources.length}):
${sources.map((s, i) => `${i + 1}. ${s.title} (${s.url}) [Relevance: ${s.relevanceScore.toFixed(2)}]`).join('\n')}

Content:
${combinedContent.substring(0, 15000)}

Provide:
1. A comprehensive summary (2-3 paragraphs)
2. 5-10 key findings (bullet points)
3. Confidence score (0-1 based on source quality and consistency)

Return JSON: {
  "summary": "...",
  "keyFindings": ["finding1", "finding2", ...],
  "confidence": 0.85
}`;

    const analysis = await this.llm.generate({
      system: 'You are a research analyst providing objective, fact-based insights. Always cite sources and indicate confidence levels.',
      user: prompt,
      jsonOutput: true
    });

    const parsed = JSON.parse(analysis);

    return {
      query: query.query,
      category: query.category,
      sources,
      summary: parsed.summary || 'Analysis in progress...',
      keyFindings: parsed.keyFindings || [],
      confidence: parsed.confidence || 0.5
    };
  }

  private async storeResearch(query: ResearchQuery, result: Omit<ResearchResult, 'timestamp' | 'duration'>) {
    try {
      await this.ragStore.addDocument({
        content: `Research Query: ${query.query}\n\nCategory: ${query.category}\n\nSummary:\n${result.summary}\n\nKey Findings:\n${result.keyFindings.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n\nSources:\n${result.sources.map(s => `- ${s.title}: ${s.url}`).join('\n')}`,
        metadata: {
          type: 'research',
          category: query.category,
          query: query.query,
          confidence: result.confidence,
          source_count: result.sources.length,
          timestamp: new Date().toISOString()
        }
      });
      console.log('✅ Research stored in RAG');
    } catch (error) {
      console.error('Failed to store research in RAG:', error);
    }
  }
}

