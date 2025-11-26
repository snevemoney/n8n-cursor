# Research Methodology Improvements - Beat Frontier Models

## Analysis of Frontier Model Research Patterns

### Claude Research Approach
1. **Multi-Perspective Query Generation** - Generates 5-8 diverse queries covering different angles
2. **Source Quality Prioritization** - Prefers authoritative domains (.edu, .gov, established news)
3. **Progressive Disclosure** - Shows partial results immediately, updates as more data arrives
4. **Relevance Scoring** - Uses semantic similarity to filter low-quality results
5. **Citation-Rich Summaries** - Every claim is backed by a specific source
6. **Real-time Browser Visibility** - Shows exactly what it's doing (navigation, extraction)

### ChatGPT Research Approach
1. **Parallel Source Processing** - Visits multiple sites concurrently (5-10 parallel)
2. **Smart Content Extraction** - Identifies main content, ignores ads/navigation
3. **Incremental Analysis** - Analyzes each source as it's enriched, doesn't wait for all
4. **Confidence Scoring** - Each finding has a confidence score based on source count
5. **Time-Aware Results** - Prioritizes recent content for news/updates queries

### Perplexity Research Approach
1. **Real-Time Search** - Uses actual search APIs, not just web scraping
2. **Source Diversity** - Ensures results from multiple perspectives (news, academic, social)
3. **Fast Initial Response** - Returns first 3 sources in <10 seconds
4. **Follow-Up Questions** - Suggests related queries to explore deeper
5. **Transparent Sourcing** - Shows confidence % and source count for each claim

## Current Weaknesses in Scorpion Research

### 1. Sequential Processing (SLOW)
- **Current**: Enriches sources one-by-one in a loop
- **Impact**: 3 sources × 30s each = 90s total
- **Frontier**: Parallel enrichment = 30s for all 3

### 2. Poor Query Generation
- **Current**: Generates 3-5 queries, often too similar
- **Impact**: Misses diverse perspectives and authoritative sources
- **Frontier**: 5-8 diverse queries covering different angles

### 3. No Incremental Results
- **Current**: Returns nothing until all research is done (3+ minutes)
- **Impact**: User sees nothing, thinks it's stuck
- **Frontier**: Shows first result in 10-15 seconds

### 4. Weak Relevance Scoring
- **Current**: Uses fixed 0.7 score for all DDG results
- **Impact**: Can't filter low-quality or off-topic sources
- **Frontier**: Semantic similarity scoring filters noise

### 5. No Source Quality Checks
- **Current**: Accepts any URL from search results
- **Impact**: May include spam, ads, or low-quality content
- **Frontier**: Prioritizes .edu, .gov, established news domains

### 6. Single Search Method
- **Current**: Only uses DuckDuckGo (falls back to browser)
- **Impact**: Limited result diversity
- **Frontier**: Multiple search engines + knowledge graphs

## Improvement Plan

### Phase 1: Parallel Processing ⚡ (30-40% faster)
**Goal**: Reduce enrichment time from 90s to 30s

**Changes**:
```typescript
// BEFORE: Sequential enrichment
for (const source of sources) {
  const enriched = await enrichSource(source);
  enrichedSources.push(enriched);
}

// AFTER: Parallel enrichment with concurrency limit
const CONCURRENCY = 3;
const enrichedSources = await Promise.all(
  sources.map(source => enrichSource(source))
);
```

**Impact**:
- 3x faster source enrichment
- Better resource utilization
- Still respects browser pool limits

### Phase 2: Progressive Result Streaming 📊 (Perceived 3x faster)
**Goal**: Show first results in 10-15 seconds

**Changes**:
1. Emit `research_progress` events as sources are enriched
2. Stream partial summaries every 30 seconds
3. Update UI in real-time with new sources

**New Events**:
```typescript
{
  type: 'research_progress',
  data: {
    phase: 'search' | 'enrichment' | 'analysis',
    progress: 0.3, // 30%
    sourcesFound: 8,
    sourcesEnriched: 2,
    partialSummary?: string
  }
}
```

**Impact**:
- User sees progress immediately
- Reduces perceived wait time by 60-70%
- Can cancel early if enough info is found

### Phase 3: Multi-Perspective Query Generation 🎯 (Better quality)
**Goal**: Generate 6-8 diverse, high-quality queries

**Improvements**:
1. Add query perspective templates:
   - "Official documentation for [topic]"
   - "Latest news about [topic] 2025"
   - "Expert analysis of [topic]"
   - "Technical details [topic]"
   - "Comparison [topic] vs alternatives"
   - "Industry reports [topic]"

2. Use LLM to generate queries with constraints:
   ```typescript
   const prompt = `Generate 6-8 diverse search queries for: "${query}"

   Requirements:
   - Cover different angles (news, technical, analysis, official)
   - Use specific terms (avoid generic words)
   - Include time constraints for news queries (2025, latest, recent)
   - Mix broad and narrow queries
   - Prioritize authoritative sources (.edu, .gov, industry reports)

   Return JSON: { "queries": [...] }`;
   ```

**Impact**:
- 40-50% more relevant sources
- Better source diversity
- Fewer low-quality results

### Phase 4: Intelligent Relevance Scoring 🎓 (Filter noise)
**Goal**: Filter out 30-40% of low-quality sources

**Scoring Factors**:
1. **Domain Authority** (0-1.0):
   - .edu, .gov, .org: 1.0
   - Established news (nytimes, wsj, reuters): 0.9
   - Industry sites (techcrunch, arstechnica): 0.8
   - Unknown/new domains: 0.5

2. **Content Quality** (0-1.0):
   - Length: 200+ words = 0.8, 500+ = 1.0
   - Structure: Has headings/sections = +0.1
   - References: Has external links = +0.1
   - Ads/Spam: Many ads = -0.3

3. **Relevance** (0-1.0):
   - Use LLM to score: "How relevant is this content to query?"
   - Keyword matching: +0.2 per key term found

4. **Freshness** (0-1.0):
   - News queries: Recent (2024-2025) = 1.0, Old (2020) = 0.3
   - Evergreen queries: Ignore date

**Final Score** = (domain_score × 0.3) + (content_score × 0.3) + (relevance_score × 0.4)

**Impact**:
- Filter 30-40% of noise
- Higher quality summaries
- Faster analysis (less content to process)

### Phase 5: Source Quality Checks 🛡️ (Better sources)
**Goal**: Ensure only high-quality sources are enriched

**Checks**:
1. **Domain Whitelist**:
   - Prefer: .edu, .gov, wikipedia.org, established news
   - Avoid: Ad farms, content farms, spam domains

2. **Content Validation**:
   - Min content length: 200 characters
   - Has proper title (not generic)
   - No excessive ads/pop-ups

3. **Accessibility Check**:
   - Page loads successfully (200 status)
   - No CAPTCHA or paywalls
   - Content is extractable

**Implementation**:
```typescript
async function validateSource(source: Source): Promise<boolean> {
  // Check domain quality
  const domain = new URL(source.url).hostname;
  if (SPAM_DOMAINS.includes(domain)) return false;

  // Check content length
  if (source.content.length < 200) return false;

  // Check for spam patterns
  if (containsSpamPatterns(source.content)) return false;

  return true;
}
```

**Impact**:
- 50% fewer low-quality sources
- Faster enrichment (skip bad sources early)
- Better summary quality

### Phase 6: Real-Time Browser Visibility ✅ (Already implemented!)
**Status**: ✅ Complete (see BROWSER_VISIBILITY_IMPLEMENTED.md)

**Features**:
- Shows navigation, clicks, screenshots in real-time
- Browser action cards in UI
- SSE event streaming

**Impact**:
- Users see what's happening
- Builds trust and transparency
- Matches frontier model UX

## Performance Targets

### Current Performance
- **Search**: 10-20 seconds
- **Enrichment**: 90-120 seconds (3 sources × 30-40s each)
- **Analysis**: 20-30 seconds
- **Total**: 120-170 seconds (2-3 minutes)
- **First Result**: 120 seconds (nothing until done)

### Target Performance (After Improvements)
- **Search**: 5-10 seconds (parallel queries)
- **Enrichment**: 30-40 seconds (3 sources parallel)
- **Analysis**: 15-20 seconds (incremental)
- **Total**: 50-70 seconds (< 1.5 minutes)
- **First Result**: 10-15 seconds (progressive streaming)

**Overall Improvement**: 60-70% faster perceived time

## Implementation Priority

### Must-Have (Week 1)
1. ✅ Fix timeout issue (timeoutMs: 0 → Infinity)
2. ⏳ Parallel source enrichment (30-40% faster)
3. ⏳ Progressive result streaming (3x perceived speed)
4. ⏳ Multi-perspective query generation (better quality)

### Should-Have (Week 2)
5. ⏳ Intelligent relevance scoring (filter 30% noise)
6. ⏳ Source quality checks (50% fewer bad sources)
7. ⏳ Incremental analysis (faster summaries)

### Nice-to-Have (Week 3)
8. ⏳ Multiple search engines (Google Custom Search API)
9. ⏳ Follow-up question suggestions
10. ⏳ Source diversity analysis

## Testing Plan

### Unit Tests
- Test parallel enrichment with 3/5/10 sources
- Test relevance scoring with sample content
- Test query generation for different categories

### Integration Tests
- Test full research flow with real LLM
- Test progressive streaming events
- Test timeout handling (should never timeout)

### Performance Tests
- Measure enrichment time: Sequential vs Parallel
- Measure time-to-first-result
- Measure total research time

### Quality Tests
- Compare summary quality: Current vs Improved
- Compare source relevance: Current vs Improved
- User acceptance testing (UAT)

## Success Metrics

### Speed
- ✅ Total research time: < 70 seconds (current: 120-170s)
- ✅ Time to first result: < 15 seconds (current: 120s)
- ✅ Enrichment time: < 40 seconds (current: 90-120s)

### Quality
- ✅ Source relevance: > 0.7 average (current: varies)
- ✅ Summary accuracy: > 85% (manual review)
- ✅ Key findings: 5-8 actionable points (current: 3-5)

### User Experience
- ✅ Real-time visibility: 100% (already implemented)
- ✅ Progressive updates: Every 15-30 seconds
- ✅ No timeouts: 100% (fixed with Infinity)

## Next Steps

1. ✅ **Immediate**: Fix executor timeout (DONE)
2. **Today**: Implement parallel source enrichment
3. **Today**: Add progressive result streaming
4. **Tomorrow**: Improve query generation
5. **This Week**: Add relevance scoring and quality checks

## Files to Modify

1. `/lib/research/web-research-agent.ts` - Main research logic
2. `/lib/research/browser-pool.ts` - Browser management
3. `/lib/chat/tools/research.ts` - Tool integration
4. `/app/api/research/events/route.ts` - Event streaming (already done)
5. `/components/chat/BrowserActionCard.tsx` - UI (already done)

## Expected Outcome

**Scorpion Research** will:
- ✅ Match or beat Claude/ChatGPT speed (50-70s vs 60-90s)
- ✅ Match or beat source quality (relevance scoring + quality checks)
- ✅ Provide better transparency (real-time browser visibility)
- ✅ Never timeout (infinite timeout for research)
- ✅ Stream results progressively (perceived 3x faster)

**Competitive Advantage**:
- Open source (vs closed source Claude/ChatGPT)
- Self-hosted (no API costs)
- Customizable (can tune for specific use cases)
- Transparent (shows exactly how research is done)
