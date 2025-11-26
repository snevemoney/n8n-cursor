# Realistic Next Improvements (Local Setup Optimized)

## Your Setup Constraints

Based on your local environment:
- **LLM**: Ollama running locally (llama3.2:3b or similar)
- **RAM**: Likely 8-16GB (running macOS + Ollama + Browser Pool + Next.js)
- **CPU**: Apple Silicon (M-series chip)
- **Browser Pool**: 3 concurrent Playwright browsers already consuming resources
- **Database**: PostgreSQL + Redis running locally

## ❌ Don't Do These (Too Resource-Intensive)

### 1. ~~True Multi-Session Parallel Enrichment~~
**Why Skip**: Would create 3+ concurrent browser sessions, each consuming:
- ~300-500MB RAM per browser context
- ~20-30% CPU per active browser
- With 3 sources × 3 browsers = potential 9 browser contexts = 3-4GB RAM

**Your Current Setup**: Single session with 3 browsers in pool is already optimal

---

### 2. ~~Multiple Search Engines (Google/Bing APIs)~~
**Why Skip**:
- Requires API keys and costs money
- DuckDuckGo Lite is free and works well
- Adding more search engines = more HTTP requests = slower

**Your Current Setup**: DuckDuckGo Lite + browser fallback is sufficient

---

### 3. ~~Semantic Similarity Scoring with Embeddings~~
**Why Skip**:
- Requires embedding model (another 500MB-1GB RAM)
- Adds 2-3 seconds per source for embedding generation
- Your local LLM is already doing relevance scoring

**Your Current Setup**: LLM-based relevance scoring is good enough

---

## ✅ Do These (Local-Friendly Improvements)

### 1. **Reduce LLM Calls in Relevance Scoring** (10-20s faster)

**Current Issue**: Calls LLM for EVERY source to calculate relevance
```typescript
// lib/research/web-research-agent.ts:769-778
const relevance = await this.llm.generate({
  system: 'Rate the relevance of this content...',
  user: `Title: ${title}\nContent preview: ${preview}`
});
```

**Problem**: With 3 sources × 2s per LLM call = 6 seconds just for relevance scoring

**Solution**: Use simple heuristic scoring instead
```typescript
private calculateRelevanceHeuristic(
  query: string,
  title: string,
  content: string
): number {
  const queryTerms = query.toLowerCase().split(' ');
  const titleLower = title.toLowerCase();
  const contentLower = content.toLowerCase();

  let score = 0.5; // Base score

  // Title relevance (most important)
  const titleMatches = queryTerms.filter(term => titleLower.includes(term)).length;
  score += (titleMatches / queryTerms.length) * 0.3;

  // Content relevance
  const contentMatches = queryTerms.filter(term => contentLower.includes(term)).length;
  score += (contentMatches / queryTerms.length) * 0.2;

  // Domain authority bonus
  const url = new URL(source.url);
  if (url.hostname.endsWith('.edu')) score += 0.15;
  else if (url.hostname.endsWith('.gov')) score += 0.15;
  else if (url.hostname.endsWith('.org')) score += 0.1;

  // Content length bonus (longer = more substantive)
  if (content.length > 1000) score += 0.1;
  else if (content.length > 2000) score += 0.15;

  return Math.min(1.0, score);
}
```

**Impact**: 6 seconds saved, no LLM calls needed

---

### 2. **Reduce Query Generation Count** (3-5s faster)

**Current Issue**: Generates 6-8 queries via LLM, but only uses first 2 for fallback search

```typescript
// lib/research/web-research-agent.ts:91
for (const searchQuery of searchQueries.slice(0, 2)) {
```

**Problem**: Generating 6-8 queries but only using 2 = wasted LLM time

**Solution**: Generate 3-4 queries max
```typescript
Now generate ${query.depth === 'deep' ? '4' : query.depth === 'medium' ? '3' : '3'} queries
```

**Impact**: 2-3 seconds saved on LLM generation

---

### 3. **Cache Query Generation Results** (5-10s faster on repeated queries)

**Current Issue**: Every research generates new queries, even for similar topics

**Solution**: Simple in-memory cache
```typescript
private queryCache = new Map<string, { queries: string[]; timestamp: number }>();

private async generateSearchQueries(query: ResearchQuery): Promise<string[]> {
  const cacheKey = `${query.category}:${query.query}:${query.depth}`;
  const cached = this.queryCache.get(cacheKey);

  // Cache for 1 hour
  if (cached && Date.now() - cached.timestamp < 3600000) {
    console.log('📦 Using cached queries');
    return cached.queries;
  }

  // Generate new queries
  const queries = await this.generateSearchQueriesImpl(query);
  this.queryCache.set(cacheKey, { queries, timestamp: Date.now() });

  return queries;
}
```

**Impact**: 5-10 seconds saved on repeated similar queries

---

### 4. **Skip Enrichment for Low-Quality Domains** (15-30s faster)

**Current Issue**: Tries to enrich every source, even spam/low-quality sites

**Solution**: Prefilter before enrichment
```typescript
const SPAM_DOMAINS = [
  'youtube.com',      // Video sites (can't extract text well)
  'facebook.com',     // Social media (paywalled)
  'twitter.com',      // Social media (paywalled)
  'instagram.com',    // Social media (paywalled)
  'pinterest.com',    // Image aggregator
  'reddit.com',       // Forum (noisy)
];

const PREFERRED_DOMAINS = [
  '.edu',             // Educational
  '.gov',             // Government
  '.org',             // Non-profit
  'wikipedia.org',    // Wikipedia
  'github.com',       // Code/docs
];

private shouldEnrichSource(url: string): boolean {
  const hostname = new URL(url).hostname;

  // Skip spam domains
  if (SPAM_DOMAINS.some(spam => hostname.includes(spam))) {
    console.log(`⏭️ Skipping spam domain: ${hostname}`);
    return false;
  }

  return true;
}

// In enrichSources:
const sourcesToEnrich = sources
  .filter(s => this.shouldEnrichSource(s.url))
  .slice(0, maxSources);
```

**Impact**: 10-20 seconds saved by skipping useless sources

---

### 5. **Reduce Browser Wait Times** (6-9s faster)

**Current Issue**: Waits 2 seconds after every page load
```typescript
// lib/research/web-research-agent.ts:743
await browser.wait(2000); // Wait for page to fully load
```

**Problem**: With 3 sources × 2s = 6 seconds of pure waiting

**Solution**: Adaptive wait based on page complexity
```typescript
private async enrichSingleSource(...): Promise<Source | null> {
  await browser.navigate(source.url);

  // Quick content check - if content is already available, don't wait
  let content = await this.extractMainContent(browser);
  if (!content || content.length < 100) {
    // Content not ready, wait a bit
    await browser.wait(1000); // Reduced from 2000ms
    content = await this.extractMainContent(browser);
  }

  // If still no content after 1s, skip
  if (!content || content.length < 100) {
    console.log(`⚠️ [${index}/${total}] Insufficient content from ${source.url}, skipping`);
    return null;
  }

  // ... rest of enrichment
}
```

**Impact**: 3-6 seconds saved (2s → 0-1s per source)

---

### 6. **Reduce LLM Token Usage in Analysis** (5-10s faster)

**Current Issue**: Sends full content (5000 chars per source) to LLM for analysis

**Problem**: More tokens = slower generation on local LLM

**Solution**: Send summaries instead of full content
```typescript
private async analyzeFindings(
  query: ResearchQuery,
  sources: Source[]
): Promise<any> {
  // Create concise summaries instead of full content
  const summaries = sources.map((s, i) =>
    `[${i + 1}] ${s.title} (${s.url})\n${s.content.substring(0, 500)}...`
  ).join('\n\n');

  // Much shorter prompt = faster generation
  const prompt = `Analyze these ${sources.length} sources for: "${query.query}"

${summaries}

Provide:
1. Summary (2-3 sentences)
2. Key findings (3-5 bullet points)
3. Confidence (0.0-1.0)

Return JSON: { "summary": "...", "keyFindings": [...], "confidence": 0.8 }`;
```

**Impact**: 5-10 seconds saved on LLM generation (fewer tokens)

---

## Expected Performance After Local-Friendly Improvements

### Current Performance
- Query Generation: 5-8s
- Search: 10-15s
- Enrichment: 30-40s (with waits)
- Relevance Scoring: 6s (3 sources × 2s LLM)
- Analysis: 20-30s
- **Total**: ~70-100 seconds

### After Local-Friendly Improvements
- Query Generation: 3-5s (cached or fewer queries)
- Search: 10-15s (no change)
- Enrichment: 15-25s (adaptive waits, skip spam)
- Relevance Scoring: 1s (heuristic instead of LLM)
- Analysis: 10-15s (shorter prompts)
- **Total**: ~40-65 seconds

**Improvement**: 30-40% faster WITHOUT adding resource load

---

## Implementation Priority

### Immediate (< 30 mins each)
1. ✅ Reduce query generation count (3-4 instead of 6-8)
2. ✅ Skip enrichment for spam domains
3. ✅ Use heuristic relevance scoring instead of LLM

### Quick Wins (< 1 hour each)
4. ✅ Reduce browser wait times (adaptive waiting)
5. ✅ Shorten analysis prompts (summaries not full content)

### Nice to Have (< 2 hours)
6. ✅ Add query generation cache
7. ⏳ Add domain authority prefiltering

---

## What NOT to Do (Resource Intensive)

❌ Multiple concurrent browser sessions (3+ GB RAM)
❌ Embedding models for semantic search (1GB+ RAM)
❌ Multiple search engine APIs (costs money)
❌ Real-time progressive streaming (complex state management)
❌ Running multiple LLM instances (doubles RAM usage)

---

## Testing Strategy

Test each improvement individually to measure impact:

```bash
# Test 1: Baseline (current implementation)
time curl -X POST http://localhost:3003/api/research/start \
  -H 'Content-Type: application/json' \
  -d '{"query":"bitcoin news","category":"general","depth":"shallow","maxSites":3}'

# Test 2: With heuristic scoring
# (implement change, restart, test again)

# Test 3: With adaptive waits
# (implement change, restart, test again)

# Compare times
```

---

## Summary

✅ **Focus on**: Reducing LLM calls, smarter waiting, filtering spam
❌ **Avoid**: Multi-session parallelism, embeddings, paid APIs
🎯 **Goal**: 40-65 seconds (30-40% faster) with SAME resource usage

Your local setup is already well-optimized! The improvements above work within your constraints while still delivering meaningful speed gains.
