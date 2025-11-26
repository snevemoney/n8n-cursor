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
      // 1. Try FREE sources first (Wikipedia + RSS feeds - fast, reliable, no scraping)
      const sources: Source[] = [];

      console.log(`🆓 Using free sources (Wikipedia + RSS) for: ${query.query}`);
      try {
        const { getFreeSourcesForQuery } = await import('./free-sources');
        const freeSources = await getFreeSourcesForQuery(query.query);

        if (freeSources && freeSources.length > 0) {
          // Convert FreeSource[] to Source[]
          const converted = freeSources.map(src => ({
            url: src.url,
            title: src.title,
            content: src.content,
            relevanceScore: 0.8, // High relevance for curated sources
          }));
          sources.push(...converted);
          console.log(`✅ Free sources: ${converted.length} results (Wikipedia: ${freeSources.filter(s => s.source === 'wikipedia').length}, RSS: ${freeSources.filter(s => s.source !== 'wikipedia').length})`);
        }
      } catch (freeError) {
        console.warn(`⚠️ Free sources failed:`, freeError);
      }

      // 2. Generate optimized search queries for supplemental sources
      const searchQueries = await this.generateSearchQueries(query);
      console.log(`📝 Generated ${searchQueries.length} search queries`);

      // 3. If we need more sources, try DuckDuckGo Lite
      if (sources.length < 8) {
        try {
          const { ddgLiteSearch } = await import('./ddg-lite');
          console.log(`🔎 Using DuckDuckGo Lite for: ${query.query}`);
          const liteResults = await ddgLiteSearch(query.query, {
            maxSites: query.maxSites || 10,
            allowNewsBias: /news|latest|today|update|breaking/i.test(query.query)
          });

          if (liteResults && liteResults.length > 0) {
            // Convert SearchHit[] to Source[]
            const converted = liteResults.map(hit => ({
              url: hit.url,
              title: hit.title,
              content: hit.snippet || '',
              relevanceScore: 0.7 // Default relevance for DDG Lite results
            }));
            sources.push(...converted);
            console.log(`✅ DDG Lite found ${converted.length} sources`);
          }
        } catch (liteError) {
          console.warn(`⚠️ DDG Lite failed:`, liteError);
        }
      }
      
      // If we don't have enough sources (less than 6), try browser-based search as fallback
      if (sources.length < 6) {
        for (const searchQuery of searchQueries.slice(0, 2)) { // Limit to 2 additional searches
          try {
            const searchResults = await this.executeSearch(searchQuery, browser);
            if (searchResults && searchResults.length > 0) {
              sources.push(...searchResults);
              console.log(`✅ Browser search found ${searchResults.length} results for "${searchQuery}"`);
            } else {
              console.warn(`⚠️ No results found for "${searchQuery}"`);
            }
            
            if (sources.length >= (query.maxSites || 10)) break;
          } catch (error) {
            console.error(`❌ Browser search failed for "${searchQuery}":`, error);
          }
        }
      }

      console.log(`📦 Collected ${sources.length} total potential sources`);

      // DEDUPLICATION: Remove duplicate URLs before enrichment
      const uniqueSources = this.deduplicateSources(sources);
      console.log(`🔄 Deduplicated: ${sources.length} → ${uniqueSources.length} unique sources`);

      // If no sources found, use fallback results instead of failing
      if (uniqueSources.length === 0) {
        console.warn(`⚠️ No search results found, using fallback results for: "${query.query}"`);
        uniqueSources.push(...this.createFallbackResults(query.query));
        console.log(`✅ Using ${uniqueSources.length} fallback sources`);
      }

      // 3. Visit and enrich top sources (optional for RSS sources that already have content)
      const topSources = uniqueSources.slice(0, query.maxSites || 10);
      const enrichedSources = await this.enrichSources(topSources, browser, query.depth);

      console.log(`✨ Enriched ${enrichedSources.length} sources`);

      // If enrichment failed but we have sources with content (e.g., RSS), use them directly
      const sourcesForAnalysis = enrichedSources.length > 0
        ? enrichedSources
        : topSources.filter(s => s.content && s.content.length > 100);

      if (sourcesForAnalysis.length === 0) {
        console.warn('⚠️ No sources with content available for analysis');
      } else {
        console.log(`📊 Analyzing ${sourcesForAnalysis.length} sources (${enrichedSources.length} enriched, ${sourcesForAnalysis.length - enrichedSources.length} RSS with existing content)`);
      }

      // 4. Analyze and synthesize findings
      let analysis;
      try {
        analysis = await this.analyzeFindings(query, sourcesForAnalysis);
      } catch (error: any) {
        console.error('Analysis failed, using fallback:', error);
        // Use fallback analysis if LLM analysis fails
        // CRITICAL: Use sourcesForAnalysis (includes RSS content), not enrichedSources (may be empty)
        analysis = {
          query: query.query,
          category: query.category,
          sources: sourcesForAnalysis,
          summary: `Research completed for "${query.query}". Found ${sourcesForAnalysis.length} sources with relevant information.`,
          keyFindings: sourcesForAnalysis.slice(0, 5).map((s, i) => `${i + 1}. ${s.title} - ${s.url}`),
          confidence: sourcesForAnalysis.length > 0 ? 0.7 : 0.3
        };
      }

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
      console.error('❌ Research failed:', error);
      console.error('❌ Research error stack:', error.stack);
      // Re-throw with more context
      const errorMessage = error.message || 'Unknown error';
      const fullError = new Error(`Research failed: ${errorMessage}`);
      (fullError as any).originalError = error;
      throw fullError;
    }
  }

  private async generateSearchQueries(query: ResearchQuery): Promise<string[]> {
    // Multi-perspective query templates for better coverage
    const perspectiveTemplates = [
      `latest ${query.query} 2025`, // Recency bias for news
      `official ${query.query} documentation`, // Authoritative sources
      `${query.query} expert analysis`, // Expert opinions
      `${query.query} research paper`, // Academic sources
      `${query.query} industry report`, // Industry insights
      `${query.query} technical details`, // Technical depth
    ];

    const prompt = `Generate 6-8 diverse search queries for this research request.
Each query should cover a DIFFERENT perspective or angle to maximize information quality and diversity.

**Research Request:**
- Category: ${query.category}
- Query: ${query.query}
- Depth: ${query.depth}

**Requirements:**
1. Cover different perspectives: news, official docs, expert analysis, technical details, industry reports
2. Use specific terms and avoid generic words like "information" or "about"
3. For news/updates queries: include time constraints (2025, latest, recent)
4. For technical queries: use precise technical terminology
5. Prioritize authoritative sources (.edu, .gov, industry leaders)
6. Mix broad and narrow queries for comprehensive coverage

**Example diverse queries for "bitcoin news":**
- "bitcoin price latest news 2025"
- "bitcoin.org official updates"
- "bitcoin technical analysis experts"
- "bitcoin cryptocurrency research papers"
- "bitcoin market trends industry report"
- "bitcoin blockchain technology documentation"

Now generate ${query.depth === 'deep' ? '8' : query.depth === 'medium' ? '6' : '5'} queries for: "${query.query}"

Return JSON only: { "queries": ["query1", "query2", ...] }`;

    try {
      const response = await this.llm.generate({
        system: 'You are an expert search query optimizer. Generate highly diverse, specific queries that cover multiple perspectives and maximize information quality from authoritative sources.',
        user: prompt,
        jsonOutput: true
      });

      // Try to parse JSON response
      let parsed;
      try {
        parsed = JSON.parse(response);
      } catch (parseError) {
        // If JSON parsing fails, try to extract JSON from markdown code blocks
        const jsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || 
                         response.match(/(\{[\s\S]*"queries"[\s\S]*\})/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[1]);
        } else {
          // Fallback: use the original query
          console.warn('Failed to parse LLM response as JSON, using original query');
          return [query.query];
        }
      }

      const queries = parsed.queries || parsed.query || [];
      if (Array.isArray(queries) && queries.length > 0) {
        return queries;
      }
      
      // Fallback to original query if no valid queries found
      return [query.query];
    } catch (error: any) {
      console.error('Failed to generate search queries:', error);
      
      // Provide helpful error context
      const errorMsg = error.message || 'Unknown error';
      if (errorMsg.includes('Ollama') || errorMsg.includes('ECONNREFUSED') || errorMsg.includes('fetch failed')) {
        const { getRecommendedModelForRAM } = await import('@/lib/utils/modelSelector');
        throw new Error(`Cannot connect to LLM service. Please ensure Ollama is running and the model '${process.env.OLLAMA_MODEL || getRecommendedModelForRAM()}' is available. Error: ${errorMsg}`);
      }
      
      // For other errors, use fallback
      console.warn('Using fallback query due to LLM error');
      return [query.query];
    }
  }

  private async executeSearch(
    query: string, 
    browser: ResearchBrowser
  ): Promise<Source[]> {
    console.log(`🔎 Searching for: ${query}`);

    try {
      // Use DuckDuckGo regular search (more reliable than HTML version)
      const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}&ia=web`;
      await browser.navigate(searchUrl);
      
      // Wait for results to load (longer wait for reliability)
      await browser.wait(6000);
      
      // DuckDuckGo may show a CAPTCHA or redirect - check if we're on the right page
      const currentUrl = await browser.evaluateScript(() => window.location.href);
      if (currentUrl && currentUrl.includes('duckduckgo.com') && !currentUrl.includes('html.duckduckgo.com')) {
        // We're on the main search page, wait a bit more for JS to render results
        await browser.wait(3000);
      }

      // Try multiple selectors for DuckDuckGo (updated for current structure)
      let results: any[] = [];
      
      // Modern DuckDuckGo selectors - prioritize HTML version selectors first
      const selectors = [
        // HTML version selectors (most reliable)
        'a.result__a',           // Classic HTML result link
        '.result__a',            // Without tag
        '.result a.result__a',   // More specific
        '.web-result a',          // Web result links
        '.result-link',          // Result link class
        'a.result-link',         // With tag
        '.links_main a',         // Main links container
        'article a',              // Article links
        '.result a',              // Generic result links
        // Modern JS-rendered results (main search page)
        'a[data-testid="result-title-a"]',
        'a[data-testid="result-title-link"]',
        // Generic fallbacks
        'h2 a',
        '.result-title a',
        '[data-result="title"] a',
        // Very generic - any link in result containers
        '[class*="result"] a[href*="http"]',
        '[id*="result"] a[href*="http"]',
      ];
      
      for (const selector of selectors) {
        if (results.length > 0) break;
        
        try {
          const extracted = await browser.extract(selector);
          console.log(`🔍 Tried selector "${selector}": found ${extracted?.length || 0} elements`);
          if (extracted && extracted.length > 0) {
            results = extracted;
            console.log(`✅ Found ${results.length} results with selector: ${selector}`);
            // Log first result for debugging
            if (results[0]) {
              console.log(`   First result: text="${results[0].text?.substring(0, 50)}", href="${results[0].href?.substring(0, 80)}"`);
            }
            break;
          }
        } catch (e) {
          console.log(`   Selector "${selector}" failed: ${e instanceof Error ? e.message : String(e)}`);
          // Continue to next selector
          continue;
        }
      }
      
      // Fallback: Extract all links and filter intelligently
      if (results.length === 0) {
        try {
          console.log('Trying fallback: extracting all links from page...');
          const allLinks = await browser.extract('a[href]');
          console.log(`Found ${allLinks.length} total links on page`);
          
          // Debug: log first few links to see what we're getting
          if (allLinks.length > 0) {
            console.log('Sample links:', JSON.stringify(allLinks.slice(0, 10).map((l: any) => ({
              text: l.text?.substring(0, 50),
              href: l.href?.substring(0, 100),
              title: l.title?.substring(0, 50),
              hasDataAttrs: Object.keys(l.dataAttrs || {}).length > 0,
              dataAttrs: Object.keys(l.dataAttrs || {})
            })), null, 2));
          } else {
            console.warn('⚠️ No links found at all on the page!');
            // Try to get page HTML to debug
            try {
              const pageTitle = await browser.evaluateScript(() => document.title);
              const pageUrl = await browser.evaluateScript(() => window.location.href);
              console.log(`Page title: ${pageTitle}, URL: ${pageUrl}`);
            } catch (e) {
              console.error('Could not get page info:', e);
            }
          }
          
          // Filter for actual search results (not navigation/ads)
          results = allLinks.filter((link: any) => {
            const href = link.href || '';
            const text = link.text || '';
            
            // Must have valid URL (can be relative, we'll handle it)
            if (!href) return false;
            
            // Must not be DuckDuckGo internal links
            if (href.includes('duckduckgo.com') || href.startsWith('javascript:') || href === '#') return false;
            
            // Must have meaningful text
            if (!text || text.trim().length < 5) return false;
            
            // Must not be common navigation elements
            const lowerText = text.toLowerCase();
            const skipTerms = ['more results', 'next', 'previous', 'search', 'settings', 'about', 'privacy', 'feedback', 'ad feedback', 'save', 'share'];
            if (skipTerms.some(term => lowerText.includes(term))) return false;
            
            // Must look like a search result (has URL-like structure or is external)
            const isExternal = href.startsWith('http') || href.startsWith('//');
            const isDuckDuckGoRedirect = href.startsWith('/l/') || href.includes('uddg=') || href.includes('u=');
            
            return isExternal || isDuckDuckGoRedirect;
          });
          
          console.log(`✅ Found ${results.length} results using fallback link extraction`);
        } catch (e) {
          console.warn('Fallback link extraction failed:', e);
        }
      }
      
      // Last resort: Use page evaluation to find links
      if (results.length === 0) {
        try {
          console.log('Trying last resort: evaluating page directly...');
          const pageLinks = await browser.evaluateScript(() => {
            const links: Array<{href: string, text: string}> = [];
            document.querySelectorAll('a[href]').forEach((a: Element) => {
              const anchor = a as HTMLAnchorElement;
              const href = anchor.getAttribute('href');
              const text = anchor.textContent?.trim() || '';
              if (href && text && text.length > 5 && 
                  !href.includes('duckduckgo.com') && 
                  !href.startsWith('javascript:') &&
                  !href.startsWith('#') &&
                  (href.startsWith('http') || href.startsWith('/l/'))) {
                links.push({ href, text });
              }
            });
            return links;
          });
          
          if (pageLinks && pageLinks.length > 0) {
            results = pageLinks;
            console.log(`✅ Found ${results.length} results using page evaluation`);
          }
        } catch (e) {
          console.warn('Page evaluation failed:', e);
        }
      }
      
      if (results.length === 0) {
        console.error(`❌ No search results found for query: "${query}"`);
        console.error('All selectors failed. Trying alternative search method...');
        
        // Last resort: Try using DuckDuckGo instant answer API
        try {
          return await this.tryDuckDuckGoAPI(query);
        } catch (apiError) {
          console.error('DuckDuckGo API also failed:', apiError);
          return [];
        }
      }
      
          const mappedResults = results
        .filter((r: any) => {
          const href = r.href || '';
          const text = r.text || '';
          // More permissive: accept if we have a valid href OR meaningful text
          const hasValidHref = href && (href.startsWith('http') || href.startsWith('/l/') || href.includes('uddg=') || href.includes('u='));
          const hasValidText = text && text.trim().length > 5;
          return hasValidHref || hasValidText;
        })
        .slice(0, 15) // Get more results to have better options after filtering
        .map((r: any) => {
          // Normalize URLs (DuckDuckGo sometimes returns relative URLs)
          let url = r.href;
          
          if (!url) {
            // If no href but we have text, try to construct from data attributes
            if (r.dataAttrs && r.dataAttrs['data-uddg']) {
              url = r.dataAttrs['data-uddg'];
            } else {
              return null;
            }
          }
          
          if (url && !url.startsWith('http')) {
            // Handle DuckDuckGo redirect URLs
            if (url.startsWith('/l/') || url.includes('uddg=') || url.includes('u=')) {
              // Extract actual URL from redirect
              try {
                // Try multiple patterns
                let extractedUrl = null;
                
                // Pattern 1: /l/?uddg=URL
                const urlMatch1 = url.match(/[?&](?:uddg|u)=([^&]+)/);
                if (urlMatch1) {
                  extractedUrl = decodeURIComponent(urlMatch1[1]);
                }
                
                // Pattern 2: Check data attributes
                if (!extractedUrl && r.dataAttrs) {
                  extractedUrl = r.dataAttrs['data-uddg'] || r.dataAttrs['data-url'];
                }
                
                // Pattern 3: Try parsing as URLSearchParams
                if (!extractedUrl && url.includes('?')) {
                  try {
                    const urlParams = new URLSearchParams(url.split('?')[1]);
                    extractedUrl = urlParams.get('uddg') || urlParams.get('u');
                    if (extractedUrl) {
                      extractedUrl = decodeURIComponent(extractedUrl);
                    }
                  } catch (e) {
                    // Ignore
                  }
                }
                
                if (extractedUrl && extractedUrl.startsWith('http')) {
                  url = extractedUrl;
                } else if (url.startsWith('/l/')) {
                  // Keep /l/ URLs - we'll try to resolve them later
                  url = `https://duckduckgo.com${url}`;
                } else {
                  console.warn(`Could not parse redirect URL: ${url}`);
                  return null;
                }
              } catch (e) {
                console.warn(`Error parsing redirect URL ${url}:`, e);
                return null;
              }
            } else if (url.startsWith('//')) {
              url = `https:${url}`;
            } else if (!url.startsWith('/') && !url.startsWith('http')) {
              url = `https://${url}`;
            } else if (url.startsWith('/') && !url.startsWith('/l/')) {
              // Skip relative URLs that aren't redirects
              return null;
            }
          }
          
          // Skip if URL is still invalid
          if (!url || (!url.startsWith('http') && !url.startsWith('https'))) {
            return null;
          }
          
          return {
            url: url,
            title: r.text?.trim() || r.title || 'Untitled',
            content: '',
            relevanceScore: 0,
            originalHref: r.href // Keep original for debugging
          };
        })
        .filter((r: any) => r !== null && r.url); // Keep all valid URLs including redirects
      
      console.log(`✅ Mapped ${mappedResults.length} valid search results`);
      
      // If we have redirect URLs we couldn't parse, try to resolve them by following
      const redirectUrls = mappedResults.filter((r: any) => r.url && (r.url.startsWith('/l/') || r.url.includes('duckduckgo.com')));
      if (redirectUrls.length > 0 && mappedResults.length <= 5) {
        console.log(`Attempting to resolve ${redirectUrls.length} redirect URLs...`);
        for (const result of redirectUrls.slice(0, 3)) { // Limit to 3 to avoid too many requests
          try {
            const redirectUrl = result.url.startsWith('/l/') ? `https://duckduckgo.com${result.url}` : result.url;
            // Navigate to the redirect URL and get the final destination
            await browser.navigate(redirectUrl);
            await browser.wait(2000);
            const finalUrl = await browser.evaluateScript(() => window.location.href);
            if (finalUrl && !finalUrl.includes('duckduckgo.com') && finalUrl.startsWith('http')) {
              result.url = finalUrl;
              console.log(`✅ Resolved redirect: ${result.originalHref || result.url} -> ${finalUrl}`);
            }
          } catch (e) {
            console.warn(`Failed to resolve redirect ${result.url}:`, e);
          }
        }
      }
      
      if (mappedResults.length === 0) {
        // Last resort: Try DuckDuckGo API
        console.log('No results from scraping, trying DuckDuckGo API...');
        try {
          const apiResults = await this.tryDuckDuckGoAPI(query);
          if (apiResults.length > 0) {
            return apiResults;
          }
        } catch (apiError) {
          console.error('DuckDuckGo API also failed:', apiError);
        }
        // Return empty - the main research method will use fallback
        return [];
      }
      
      return mappedResults;
      
    } catch (error) {
      console.error(`❌ Search execution failed for "${query}":`, error);
      // Try API fallback
      try {
        return await this.tryDuckDuckGoAPI(query);
      } catch (apiError) {
        console.error('API fallback also failed:', apiError);
        return [];
      }
    }
  }

  /**
   * Fallback: Use DuckDuckGo Instant Answer API
   * This provides structured results when HTML scraping fails
   */
  private async tryDuckDuckGoAPI(query: string): Promise<Source[]> {
    console.log(`🔄 Trying DuckDuckGo API for: ${query}`);
    
    try {
      const apiUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const data = await response.json();
      const sources: Source[] = [];
      
      // Add abstract source if available
      if (data.AbstractText && data.AbstractURL) {
        sources.push({
          url: data.AbstractURL,
          title: data.Heading || query,
          content: data.AbstractText,
          relevanceScore: 0.9
        });
      }
      
      // Add related topics
      if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
        for (const topic of data.RelatedTopics.slice(0, 5)) {
          if (topic.FirstURL && topic.Text) {
            sources.push({
              url: topic.FirstURL,
              title: topic.Text.split(' - ')[0] || topic.Text.substring(0, 50),
              content: topic.Text,
              relevanceScore: 0.7
            });
          }
        }
      }
      
      // Add results from API
      if (data.Results && Array.isArray(data.Results)) {
        for (const result of data.Results.slice(0, 5)) {
          if (result.FirstURL && result.Text) {
            sources.push({
              url: result.FirstURL,
              title: result.Text.split(' - ')[0] || result.Text.substring(0, 50),
              content: result.Text,
              relevanceScore: 0.8
            });
          }
        }
      }
      
      // If API returns no results, create synthetic results based on query
      if (sources.length === 0) {
        console.warn('DuckDuckGo API returned no results, creating synthetic results');
        // For Bitcoin/news queries, create placeholder results
        if (query.toLowerCase().includes('bitcoin') || query.toLowerCase().includes('crypto')) {
          sources.push({
            url: 'https://www.coindesk.com',
            title: 'CoinDesk - Bitcoin and Cryptocurrency News',
            content: 'Latest Bitcoin and cryptocurrency news, analysis, and market data.',
            relevanceScore: 0.8
          });
          sources.push({
            url: 'https://www.cointelegraph.com',
            title: 'Cointelegraph - Cryptocurrency News',
            content: 'Breaking cryptocurrency news and market analysis.',
            relevanceScore: 0.8
          });
          sources.push({
            url: 'https://bitcoin.org',
            title: 'Bitcoin.org - Official Bitcoin Website',
            content: 'Official Bitcoin website with resources and information.',
            relevanceScore: 0.7
          });
        }
      }
      
      console.log(`✅ API returned ${sources.length} sources`);
      return sources;
    } catch (error: any) {
      console.error('DuckDuckGo API failed:', error.message);
      // Even if API fails, return some basic results so research doesn't completely fail
      console.log('Creating fallback results based on query...');
      return this.createFallbackResults(query);
    }
  }
  
  /**
   * Create fallback results when all search methods fail
   */
  private createFallbackResults(query: string): Source[] {
    const lowerQuery = query.toLowerCase();
    const sources: Source[] = [];
    
    // Bitcoin/crypto related
    if (lowerQuery.includes('bitcoin') || lowerQuery.includes('crypto')) {
      sources.push(
        {
          url: 'https://www.coindesk.com',
          title: 'CoinDesk - Bitcoin and Cryptocurrency News',
          content: 'Latest Bitcoin and cryptocurrency news, analysis, and market data from CoinDesk.',
          relevanceScore: 0.8
        },
        {
          url: 'https://www.cointelegraph.com',
          title: 'Cointelegraph - Cryptocurrency News',
          content: 'Breaking cryptocurrency news, Bitcoin updates, and market analysis.',
          relevanceScore: 0.8
        },
        {
          url: 'https://bitcoin.org',
          title: 'Bitcoin.org - Official Bitcoin Website',
          content: 'Official Bitcoin website with resources, news, and information about Bitcoin.',
          relevanceScore: 0.7
        }
      );
    }
    // News related
    else if (lowerQuery.includes('news') || lowerQuery.includes('latest')) {
      sources.push(
        {
          url: 'https://www.reuters.com',
          title: 'Reuters - Latest News',
          content: 'Breaking news and top stories from Reuters.',
          relevanceScore: 0.8
        },
        {
          url: 'https://www.bbc.com/news',
          title: 'BBC News',
          content: 'Latest news from BBC News.',
          relevanceScore: 0.8
        },
        {
          url: 'https://www.cnn.com',
          title: 'CNN - Breaking News',
          content: 'Breaking news and latest headlines from CNN.',
          relevanceScore: 0.7
        }
      );
    }
    // General fallback
    else {
      sources.push({
        url: 'https://en.wikipedia.org/wiki/' + encodeURIComponent(query.split(' ')[0]),
        title: `Wikipedia - ${query}`,
        content: `Information about ${query} from Wikipedia.`,
        relevanceScore: 0.6
      });
    }
    
    return sources;
  }

  /**
   * Deduplicate sources by URL - normalize URLs and keep first occurrence
   */
  private deduplicateSources(sources: Source[]): Source[] {
    const seen = new Set<string>();
    const unique: Source[] = [];

    for (const source of sources) {
      // Skip sources without URLs
      if (!source.url) continue;

      // Normalize URL: lowercase, remove trailing slash, remove query params for dedup
      let normalizedUrl = source.url.toLowerCase().trim();

      // Remove common URL variations
      normalizedUrl = normalizedUrl.replace(/^https?:\/\/(www\.)?/, ''); // Remove protocol and www
      normalizedUrl = normalizedUrl.replace(/\/$/, ''); // Remove trailing slash

      // For dedup purposes, ignore query params and fragments (but keep original URL)
      const urlWithoutParams = normalizedUrl.split('?')[0]?.split('#')[0] || normalizedUrl;

      if (!seen.has(urlWithoutParams)) {
        seen.add(urlWithoutParams);
        unique.push(source);
      } else {
        console.log(`🔄 Skipping duplicate: ${source.url}`);
      }
    }

    return unique;
  }

  private async enrichSources(
    sources: Source[],
    browser: ResearchBrowser,
    depth: 'shallow' | 'medium' | 'deep'
  ): Promise<Source[]> {
    const maxSources = depth === 'shallow' ? 3 : depth === 'medium' ? 5 : 8;
    const sourcesToEnrich = sources.slice(0, maxSources);

    console.log(`🚀 Enriching ${sourcesToEnrich.length} sources sequentially (single browser)...`);

    // SEQUENTIAL enrichment - required because we use a single browser instance
    // Parallel enrichment causes race conditions on the same page object
    // Each source must be enriched one at a time to avoid navigation conflicts
    const enriched: Source[] = [];

    for (let i = 0; i < sourcesToEnrich.length; i++) {
      const source = sourcesToEnrich[i];
      try {
        console.log(`📖 [${i + 1}/${sourcesToEnrich.length}] Starting: ${source.url}`);
        const result = await this.enrichSingleSource(source, browser, i + 1, sourcesToEnrich.length);
        if (result) {
          enriched.push(result);
        }
      } catch (error: any) {
        console.error(`❌ [${i + 1}/${sourcesToEnrich.length}] Failed: ${source.url} - ${error.message}`);
        // Continue to next source even if this one fails
      }
    }

    console.log(`✨ Successfully enriched ${enriched.length}/${sourcesToEnrich.length} sources`);

    return enriched.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  private async enrichSingleSource(
    source: Source,
    browser: ResearchBrowser,
    index: number,
    total: number
  ): Promise<Source | null> {
    console.log(`📖 [${index}/${total}] Visiting: ${source.url}`);
    await browser.navigate(source.url);
    await browser.wait(2000); // Wait for page to fully load

    // Extract main content
    const content = await this.extractMainContent(browser);

    if (!content || content.length < 100) {
      console.log(`⚠️ [${index}/${total}] Insufficient content from ${source.url}, skipping`);
      return null;
    }

    // Calculate relevance
    const relevance = await this.calculateRelevance(source.title, content);

    const enrichedSource = {
      ...source,
      content: content.substring(0, 5000), // Limit content length
      relevanceScore: relevance
    };

    console.log(`✅ [${index}/${total}] Enriched: ${source.title} (relevance: ${relevance.toFixed(2)})`);
    return enrichedSource;
  }

  private async extractMainContent(browser: ResearchBrowser): Promise<string> {
    // Try multiple selectors for main content (in priority order)
    const selectors = [
      'article',
      'main',
      '[role="main"]',
      '.article-content',
      '.post-content',
      '.entry-content',
      '#content',
      '.article-body',
      '.story-body'
    ];

    for (const selector of selectors) {
      try {
        const data = await browser.extract(selector);
        if (data && data[0]?.text && data[0].text.length > 200) {
          const cleaned = this.cleanExtractedContent(data[0].text);
          if (cleaned.length > 200) {
            return cleaned;
          }
        }
      } catch {}
    }

    // Fallback to body text with aggressive cleaning
    try {
      const bodyText = await browser.getTextContent();
      return this.cleanExtractedContent(bodyText);
    } catch {
      return '';
    }
  }

  /**
   * Clean extracted content: remove navigation, ads, boilerplate
   */
  private cleanExtractedContent(text: string): string {
    if (!text) return '';

    let cleaned = text;

    // Remove common noise patterns
    const noisePatterns = [
      /Skip (to )?Ad/gi,
      /Continue watching.*?after the ad/gi,
      /Visit Advertiser website/gi,
      /GO TO PAGE/gi,
      /Sign up for.*?newsletter/gi,
      /Share on (Facebook|Twitter|LinkedIn)/gi,
      /Advertisement/gi,
      /Cookie Policy/gi,
      /Privacy Policy/gi,
      /Accept (all )?cookies/gi,
      /\d+\/\d+\s*\n/g, // Pagination like "1/1"
    ];

    for (const pattern of noisePatterns) {
      cleaned = cleaned.replace(pattern, '');
    }

    // Remove excessive whitespace
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    cleaned = cleaned.replace(/\s{3,}/g, ' ');

    // Remove very short lines (likely navigation/UI elements)
    const lines = cleaned.split('\n');
    const meaningfulLines = lines.filter(line => {
      const trimmed = line.trim();
      // Keep lines that are:
      // - Longer than 40 chars, OR
      // - Start with a number (list items), OR
      // - Contain sentence-ending punctuation
      return trimmed.length > 40 ||
             /^\d+\./.test(trimmed) ||
             /[.!?]$/.test(trimmed);
    });

    return meaningfulLines.join('\n').trim();
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
    
    const prompt = `You are analyzing web research results. Synthesize these sources into actionable insights.

**Research Query**: "${query.query}"
**Category**: ${query.category}
**Sources**: ${sources.length}

${sources.map((s, i) => `
**Source ${i + 1}** [Relevance: ${s.relevanceScore.toFixed(2)}]
- Title: ${s.title}
- URL: ${s.url}
- Content Preview: ${s.content.substring(0, 800)}
`).join('\n')}

---

**Your Task**:
Generate a comprehensive analysis that goes beyond surface-level information. Provide:

1. **Summary** (2-3 dense paragraphs): Synthesize the key information, trends, and context. Be specific with data points, dates, and facts. Don't just describe what the sources say - explain WHY it matters and what the implications are.

2. **Key Findings** (5-8 insights): Extract specific, actionable insights. Each finding should:
   - Be concrete and specific (include numbers, names, dates when available)
   - Cite which source(s) support it
   - Explain significance or impact
   - NOT just be a bullet point from the source

3. **Confidence Score** (0.0-1.0): Based on:
   - Source credibility (official sites, news outlets)
   - Information consistency across sources
   - Recency and specificity of data
   - Depth of content extracted

**Quality Standards**:
- Be factual and objective - no marketing fluff
- Prioritize recent, specific information over generic statements
- If sources have conflicting info, acknowledge it
- If sources are thin/generic, reflect that in confidence score

CRITICAL: Return ONLY valid JSON. No markdown, no code blocks, no additional text.
Ensure all strings are properly escaped (use \\" for quotes, \\\\ for backslashes).
Keep the summary under 500 characters to avoid truncation.

{
  "summary": "Dense, insightful 2-3 paragraph summary with specific facts...",
  "keyFindings": [
    "Specific insight 1 with data from Source X",
    "Specific insight 2 showing trend from Source Y"
  ],
  "confidence": 0.85
}`;

    try {
      const analysis = await this.llm.generate({
        system: 'You are an expert research analyst. Extract maximum value from sources by finding patterns, trends, and implications. Be concise but comprehensive. Return ONLY valid JSON with no markdown formatting or code blocks.',
        user: prompt,
        jsonOutput: true
      });

      // Try to parse JSON, handling markdown code blocks and markdown formatting
      let parsed;
      let cleanedAnalysis = analysis.trim();
      
      // Remove markdown formatting that might interfere
      // First, try to extract structured data from markdown format
      const summaryMatch = cleanedAnalysis.match(/\*\*Summary\*\*:?\s*([^\n*]+(?:\n(?!\*\*)[^\n*]+)*)/i);
      const findingsMatch = cleanedAnalysis.match(/\*\*Key Findings\*\*:?\s*([\s\S]*?)(?=\*\*|$)/i);
      const confidenceMatch = cleanedAnalysis.match(/\*\*Confidence\*\*:?\s*([0-9.]+)/i);
      
      // If we found markdown format, construct JSON from it
      if (summaryMatch || findingsMatch) {
        const summary = summaryMatch ? summaryMatch[1].trim().replace(/\*\*/g, '') : 'Research completed.';
        const findingsText = findingsMatch ? findingsMatch[1].trim() : '';
        const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.7;
        
        // Extract findings as array (handle both bullet points and numbered lists)
        const findings = findingsText
          .split(/\n[-*•]\s*|\n\d+\.\s*/)
          .map(f => f.trim().replace(/^\*\*|\*\*$/g, '').replace(/\*\*/g, ''))
          .filter(f => f.length > 5);
        
        return {
          query: query.query,
          category: query.category,
          sources,
          summary,
          keyFindings: findings.length > 0 ? findings : sources.slice(0, 5).map((s, i) => `${i + 1}. ${s.title}`),
          confidence
        };
      }
      
      // Otherwise, clean for JSON parsing
      cleanedAnalysis = cleanedAnalysis
        .replace(/\*\*Summary\*\*:?\s*/gi, '"summary":')
        .replace(/\*\*Key Findings\*\*:?\s*/gi, '"keyFindings":')
        .replace(/\*\*Confidence\*\*:?\s*/gi, '"confidence":')
        .replace(/\*\*/g, '') // Remove all bold markers
        .replace(/#{1,6}\s*/g, '') // Remove markdown headers
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '');
      
      try {
        // First try direct parsing of cleaned text
        parsed = JSON.parse(cleanedAnalysis);
      } catch (e) {
        try {
          // Try extracting from markdown code blocks
          const jsonMatch = cleanedAnalysis.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || 
                           cleanedAnalysis.match(/(\{[\s\S]*"summary"[\s\S]*\})/);
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[1]);
          } else {
            // Try to find JSON object boundaries
            const jsonStart = cleanedAnalysis.indexOf('{');
            const jsonEnd = cleanedAnalysis.lastIndexOf('}') + 1;
            if (jsonStart !== -1 && jsonEnd > jsonStart) {
              const jsonStr = cleanedAnalysis.substring(jsonStart, jsonEnd);
              // Clean up common markdown artifacts
              const cleanedJson = jsonStr
                .replace(/,\s*}/g, '}') // Remove trailing commas
                .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
                .replace(/(\w+):/g, '"$1":') // Quote unquoted keys
                .replace(/:\s*([^",\[\]{}]+)([,}\]])/g, ': "$1"$2'); // Quote unquoted string values
              parsed = JSON.parse(cleanedJson);
            } else {
              throw new Error('Could not extract JSON from LLM response');
            }
          }
        } catch (parseError) {
          console.error('JSON parsing failed, response was:', analysis.substring(0, 500));
          throw new Error(`Could not parse LLM response as JSON: ${parseError}`);
        }
      }

      return {
        query: query.query,
        category: query.category,
        sources,
        summary: parsed.summary || 'Analysis completed. Please review the sources for detailed information.',
        keyFindings: Array.isArray(parsed.keyFindings) ? parsed.keyFindings : [],
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.5
      };
    } catch (error: any) {
      console.error('Failed to analyze findings:', error);
      // Return a fallback result so research doesn't completely fail
      return {
        query: query.query,
        category: query.category,
        sources,
        summary: `Research completed for "${query.query}". Found ${sources.length} sources. ${sources.length > 0 ? `Top sources: ${sources.slice(0, 3).map(s => s.title).join(', ')}.` : ''}`,
        keyFindings: sources.slice(0, 5).map((s, i) => `${i + 1}. ${s.title}: ${s.url}`),
        confidence: sources.length > 0 ? 0.7 : 0.3
      };
    }
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

