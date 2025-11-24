import { z } from 'zod';

export const name = 'research.run';
export const label = 'Web Research';
export const description = 'Run automated web research with depth control';

export const schema = z.object({
  query: z.string().min(1),
  depth: z.enum(['shallow', 'medium', 'deep']).default('medium'),
  category: z.enum(['general', 'company-research', 'market-analysis', 'competitor-analysis', 'technical-research', 'financial-research']).default('general'),
  maxSites: z.number().min(1).max(20).default(10),
});

export async function handler(args: z.infer<typeof schema>) {
  try {
    // Call existing research API to start research
    const response = await fetch('http://localhost:3003/api/research/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    });

    if (!response.ok) {
      throw new Error(`Research API returned ${response.status}`);
    }

    const startData = await response.json();
    const sessionId = startData.success && startData.data ? startData.data.sessionId : startData.sessionId;

    if (!sessionId) {
      throw new Error('Failed to get session ID from research API');
    }

    // CHECK 9: Timeout handling (10-15s recommended, but using 60s for reliability)
    const maxWaitTime = process.env.RESEARCH_MAX_WAIT_MS ? parseInt(process.env.RESEARCH_MAX_WAIT_MS) : 15000; // Default 15s
    const pollInterval = 2000; // 2 seconds
    const startTime = Date.now();
    let pollCount = 0;
    let consecutiveErrors = 0;
    const maxConsecutiveErrors = 3;

    console.log(`[research.run] Starting to poll for session ${sessionId}, max wait: ${maxWaitTime}ms`);

    while (Date.now() - startTime < maxWaitTime) {
      pollCount++;
      const elapsed = Date.now() - startTime;
      const progressPercent = Math.min(100, Math.round((elapsed / maxWaitTime) * 100));

      // Log progress every 5 polls (10 seconds)
      if (pollCount % 5 === 0) {
        console.log(`[research.run] Polling... ${progressPercent}% (${Math.round(elapsed / 1000)}s elapsed)`);
      }

      try {
        const pollResponse = await fetch('http://localhost:3003/api/research/start', { // Updated URL to match original start endpoint
          method: 'GET', // Changed to GET for polling status
          headers: { 'Content-Type': 'application/json' },
          // body: JSON.stringify({ action: 'get_results', id: sessionId }) // Not needed for GET with query param
        });

        if (!pollResponse.ok) {
          consecutiveErrors++;
          console.warn(`[research.run] Poll failed (${consecutiveErrors}/${maxConsecutiveErrors}): ${pollResponse.status}`);
          if (consecutiveErrors >= maxConsecutiveErrors) {
            return {
              ok: false,
              error: `Research failed: Backend unresponsive after ${consecutiveErrors} attempts.`,
              query: args.query,
            };
          }
          await new Promise(resolve => setTimeout(resolve, pollInterval));
          continue;
        }

        // Reset error count on success
        consecutiveErrors = 0;

        const statusData = await pollResponse.json();
        const session = statusData.success && statusData.data ? statusData.data : statusData;

        console.log(`[research.run] Poll result: status=${session.status}, hasResult=${!!session.result}, sourcesCount=${session.result?.sources?.length || 0}, error=${session.error || 'none'}`);

        if (session.status === 'completed' && session.result) {
          // Research completed - format and return results
          const result = session.result;

          // Extract sources with links - handle both direct result and nested data
          const rawSources = result.sources || result.data?.sources || [];

          // Map Source objects correctly (Source interface has: url, title, content, relevanceScore)
          const topSources = rawSources.slice(0, args.maxSites || 5).map((source: any, idx: number) => ({
            rank: idx + 1,
            title: source.title || source.url || 'Untitled',
            url: source.url || '',
            snippet: source.content?.slice(0, 300) || source.snippet || '',
            relevance: source.relevanceScore || source.relevance || source.score || 0,
          }));

          // If no sources found, return error
          if (topSources.length === 0) {
            return {
              ok: false,
              error: 'Research completed but no sources were found. The research may have failed or returned empty results.',
              query: args.query,
              summary: result.summary || 'No sources found',
            };
          }

          const summary = result.summary || result.data?.summary || result.keyFindings?.join('. ') || `Research completed for: "${args.query}"`;
          const keyFindings = result.keyFindings || result.data?.keyFindings || [];

          // Normalize sources to ResearchSource format
          const normalizedSources = topSources.map((s: any) => {
            let sourceHostname = 'unknown';
            try {
              if (s.url && s.url.startsWith('http')) {
                sourceHostname = new URL(s.url).hostname;
              }
            } catch (e) {
              // URL parsing failed, use fallback
            }

            return {
              title: s.title || 'Untitled',
              url: s.url || '',
              snippet: s.snippet || s.content?.slice(0, 300) || '',
              score: s.relevance || s.relevanceScore || 0,
              publishedAt: s.publishedAt || null,
              source: s.source || sourceHostname,
            };
          });

          // Write top sources to knowledge store (async, don't block)
          (async () => {
            try {
              const { getRAGStore } = await import('@/lib/shared-stores');
              const ragStore = await getRAGStore();

              // Write top 5 sources to knowledge store
              const topSourcesToStore = normalizedSources.slice(0, 5);
              for (const source of topSourcesToStore) {
                const { ExtractedKnowledge } = await import('@scorpion/core');
                const knowledge: ExtractedKnowledge = {
                  id: `research-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  source: 'web-research',
                  type: 'research',
                  category: args.category || 'general',
                  title: source.title,
                  description: source.snippet,
                  contentUrl: source.url,
                  tags: ['research', 'web', args.category || 'general', 'news'],
                  extractedAt: new Date().toISOString(),
                };
                await ragStore.addKnowledge(knowledge);
              }
              console.log(`[research.run] Wrote ${topSourcesToStore.length} sources to knowledge store`);
            } catch (error: any) {
              console.warn('[research.run] Failed to write to knowledge store:', error.message);
              // Don't fail the tool if knowledge write fails
            }
          })();

          return {
            ok: true,
            provider: 'custom' as const, // Using custom browser-based research
            query: args.query,
            summary,
            sources: normalizedSources, // CRITICAL: normalized sources array
            keyFindings,
            top3: normalizedSources.slice(0, 3).map(s => ({
              title: s.title,
              url: s.url,
              snippet: s.snippet,
            })),
            message: `Research completed. Found ${rawSources.length} sources. Top ${Math.min(3, normalizedSources.length)} results with links provided.`,
            sessionId,
            viewUrl: `/research?session=${sessionId}`,
          };
        } else if (session.status === 'failed') {
          throw new Error(session.error || 'Research failed');
        }
        // If status is still 'in_progress', continue polling
      } catch (pollError) {
        consecutiveErrors++;
        console.warn(`[research.run] Poll error (${consecutiveErrors}/${maxConsecutiveErrors}):`, pollError);
        if (consecutiveErrors >= maxConsecutiveErrors) {
          return {
            ok: false,
            error: `Research failed: Network error after ${consecutiveErrors} attempts.`,
            query: args.query,
          };
        }
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }

    // Timeout - check if we can get partial results
    console.log(`[research.run] Timeout reached, checking for partial results...`);
    try {
      const finalResponse = await fetch(`http://localhost:3003/api/research/start?sessionId=${sessionId}`);
      if (finalResponse.ok) {
        const finalData = await finalResponse.json();
        const finalSession = finalData.success && finalData.data ? finalData.data : finalData;
        if (finalSession.result && finalSession.result.sources && finalSession.result.sources.length > 0) {
          // Return partial results even if status isn't 'completed'
          const result = finalSession.result;
          const rawSources = result.sources || [];
          const topSources = rawSources.slice(0, 3).map((source: any, idx: number) => ({
            rank: idx + 1,
            title: source.title || source.url || 'Untitled',
            url: source.url || '',
            snippet: source.content?.slice(0, 300) || source.snippet || '',
          }));

          return {
            ok: true,
            query: args.query,
            summary: result.summary || 'Research in progress - partial results',
            sources: topSources,
            top3: topSources,
            message: `Research partially completed. Found ${rawSources.length} sources. Showing top ${topSources.length} results.`,
            sessionId,
          };
        }
      }
    } catch (e) {
      console.error('[research.run] Error checking for partial results:', e);
    }

    return {
      ok: false,
      error: 'Research timed out. The research may still be processing in the background.',
      query: args.query,
    };

  } catch (error: any) {
    console.error(`[research.run] Tool handler error:`, error);
    return {
      ok: false,
      error: error.message || 'Research failed',
      query: args.query,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    };
  }
}

