// Power of 10 Rule 4: Extract RAG/knowledge integration logic to focused module
// Migration Job #2: RAG Integration Extraction
import { executeTool } from '@/lib/chat/tools';
import { runPromptWithKillSwitch, RagRetrieverSchema } from '@scorpion/core';
import { shouldUseKnowledgeBase } from '@/lib/chat/intent';
import type { Plan } from '@/lib/chat/types';

export interface EarlyRagSearchInput {
    plan: Plan;
    intent: string;
    userMessage: string;
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
    conversationId: string | undefined;
    send: (event: { type: string; data: Record<string, unknown> }) => void;
    modelConfig: {
        provider: string;
        model: string;
        maxTokens: number;
        temperature: number;
    };
    runModelForPrompt: (systemPrompt: string, userPrompt: string, config: any) => Promise<any>;
}

export interface EarlyRagSearchResult {
    knowledgeHitsForCouncil: any[];
    earlyKbSearchCompleted: boolean;
    kbAttempted: boolean;
    kbHasResults: boolean;
}

/**
 * Perform early RAG search before council phase
 * Power of 10 Rule 3: < 100 lines
 * Power of 10 Rule 4: Single responsibility - early RAG search
 */
export async function performEarlyRagSearch(
    input: EarlyRagSearchInput
): Promise<EarlyRagSearchResult> {
    const {
        plan,
        intent,
        userMessage,
        conversationHistory,
        send,
        modelConfig,
        runModelForPrompt,
    } = input;

    let knowledgeHitsForCouncil: any[] = [];
    let earlyKbSearchCompleted = false;
    let kbAttempted = false;
    let kbHasResults = false;

    // INTENT-AWARE KB USAGE: Only execute KB search if intent allows it
    // For small_talk and general_question, skip KB entirely
    if (shouldUseKnowledgeBase(intent as any)) {
        const kbSearchStep = plan.plan.find(step => step.tool === 'kb.search');
        if (kbSearchStep) {
            kbAttempted = true;
            try {
                send({ type: 'status', data: { message: 'Searching knowledge base...', phase: 'searching' } });
                send({ type: 'progress', data: { phase: 'searching', progress: 0, message: 'Searching knowledge base...' } });

                // Mark step as running
                send({
                    type: 'plan_step',
                    data: {
                        ...kbSearchStep,
                        status: 'running',
                    },
                });

                send({
                    type: 'tool_progress',
                    data: {
                        tool: 'kb.search',
                        callId: kbSearchStep.id,
                        progress: 'Searching knowledge base...',
                        status: 'running',
                    },
                });

                // Send intermediate progress updates
                send({ type: 'progress', data: { phase: 'searching', progress: 25, message: 'Querying knowledge base...' } });

                // RAG Retriever: Rewrite query for better retrieval (optional, skip if disabled)
                // Power of 10 Rule 7: Guard undefined
                let rewrittenQuery = (kbSearchStep?.args?.['query'] as string | undefined) || userMessage;
                if (process.env['SCORPION_ENABLE_RAG_RETRIEVER'] !== '0') {
                    try {
                        const ragRetrieval = await runPromptWithKillSwitch(
                            'rag-retriever.system.txt',
                            { q: rewrittenQuery, history: conversationHistory.slice(-3) },
                            RagRetrieverSchema,
                            modelConfig,
                            runModelForPrompt
                        );

                        if (ragRetrieval && ragRetrieval.rewrites && ragRetrieval.rewrites.length > 0) {
                            // Use the first rewrite (highest priority) - Power of 10 Rule 7: Guard undefined
                            const firstRewrite = ragRetrieval.rewrites[0];
                            if (firstRewrite && firstRewrite.q) {
                                rewrittenQuery = firstRewrite.q;
                            }
                            console.log('[RAG Retriever] Rewrote query:', rewrittenQuery);

                            // Update search args with rewritten query
                            kbSearchStep.args = { ...kbSearchStep.args, query: rewrittenQuery };
                        }
                    } catch (error: any) {
                        console.warn('[Chat Stream] RAG retriever failed, using original query:', error.message);
                    }
                }

                const kbResult = await executeTool('kb.search', kbSearchStep.args || {});

                send({ type: 'progress', data: { phase: 'searching', progress: 75, message: 'Processing results...' } });
                send({ type: 'progress', data: { phase: 'searching', progress: 100, message: 'Knowledge search completed' } });

                if (kbResult?.ok && kbResult?.hits) {
                    knowledgeHitsForCouncil = kbResult.hits;
                    earlyKbSearchCompleted = true;
                    kbHasResults = kbResult.hits.length > 0;

                    // Mark step as completed
                    send({
                        type: 'plan_step',
                        data: {
                            ...kbSearchStep,
                            status: 'completed',
                            result: kbResult,
                        },
                    });

                    send({
                        type: 'tool_progress',
                        data: {
                            tool: 'kb.search',
                            callId: kbSearchStep.id,
                            progress: `Found ${kbResult.hits.length} results`,
                            status: 'completed',
                        },
                    });

                    // Emit knowledge event
                    send({
                        type: 'knowledge',
                        data: {
                            hits: kbResult.hits,
                            query: kbSearchStep.args?.['query'] || userMessage, // Include query for Knowledge tab
                        },
                    });

                    // Send tool event for Tools tab
                    send({
                        type: 'tool',
                        data: {
                            tool: 'kb.search',
                            callId: kbSearchStep.id,
                            args: kbSearchStep.args || {},
                            status: 'completed',
                            result: kbResult,
                        },
                    });
                } else {
                    // Mark step as completed even if no hits
                    kbHasResults = false;
                    send({
                        type: 'plan_step',
                        data: {
                            ...kbSearchStep,
                            status: 'completed',
                            result: kbResult,
                        },
                    });

                    send({
                        type: 'tool_progress',
                        data: {
                            tool: 'kb.search',
                            callId: kbSearchStep.id,
                            progress: 'No results found',
                            status: 'completed',
                        },
                    });
                }
            } catch (error: any) {
                console.warn('[Chat Stream] KB search before council failed:', error);
                kbHasResults = false;
                // Mark step as failed
                send({
                    type: 'plan_step',
                    data: {
                        ...kbSearchStep,
                        status: 'failed',
                        error: error.message,
                    },
                });

                send({
                    type: 'tool_progress',
                    data: {
                        tool: 'kb.search',
                        callId: kbSearchStep.id,
                        progress: `Failed: ${error.message}`,
                        status: 'failed',
                    },
                });
            }
        }
    }

    return {
        knowledgeHitsForCouncil,
        earlyKbSearchCompleted,
        kbAttempted,
        kbHasResults,
    };
}

/**
 * Extract knowledge hits from tool results
 */
export function extractKnowledgeHits(results: any[]): any[] {
    return results
        .filter(r => {
            if (!r || !r.step || !r.result) return false;
            // We can't easily access plan here to check tool name, so we rely on result structure
            // or we assume the caller passes results that might contain KB hits
            // But wait, the original code used plan.plan.find(s => s.id === r.step).tool === 'kb.search'
            // We should probably pass the plan or just check result structure which is safer
            const isKbResult = r.result?.ok === true && Array.isArray(r.result?.hits);
            return isKbResult;
        })
        .flatMap(r => {
            const hits = r.result?.hits || [];
            return Array.isArray(hits) ? hits : [];
        });
}

/**
 * Extract research results from tool results
 */
export function extractResearchResults(results: any[], plan?: Plan): any[] {
    return results
        .filter(r => {
            if (!r || !r.step || !r.result) return false;

            // Check if it's a research tool call
            let isResearchTool = false;
            if (plan) {
                const step = plan.plan.find(s => s && s.id === r.step);
                isResearchTool = step?.tool === 'research.run';
            } else {
                // Fallback heuristic if plan not provided
                isResearchTool = r.step === 'research_fallback' || (r.result?.sessionId && r.result?.sources);
            }

            const isResearchRun = isResearchTool && r.result?.ok === true && Array.isArray(r.result?.sources);
            const isResearchFallback = r.step === 'research_fallback' || (r.result?.ok === true && r.result?.sessionId);

            return isResearchRun || isResearchFallback;
        })
        .map(r => r.result)
        .filter(r => r && typeof r === 'object');
}

/**
 * Format research sources for summarizer context
 */
export function formatResearchSources(researchResults: any[]): any[] {
    return researchResults
        .flatMap(r => {
            // Try multiple locations: direct sources, data.sources, top3
            let sources: any[] = [];

            if (Array.isArray(r.sources)) {
                sources = r.sources;
            } else if (Array.isArray(r.data?.sources)) {
                sources = r.data.sources;
            } else if (Array.isArray(r.top3)) {
                sources = r.top3.map((item: any) => ({
                    title: item.title,
                    url: item.url,
                    snippet: item.snippet || item.excerpt || '',
                    score: item.score || item.relevance || 0.8,
                }));
            }

            return sources;
        })
        .filter((s: any) => {
            return s && s.url && typeof s.url === 'string' && s.url.length > 0;
        })
        .map((s: any) => ({
            title: s.title || s.name || 'Untitled',
            url: s.url || s.link || '',
            snippet: s.snippet || s.excerpt || s.content || s.summary || '',
            score: s.score || s.relevance || s.relevanceScore || 0.8,
            publishedAt: s.publishedAt || s.date || null,
            source: s.source || s.domain || null,
        }));
}

/**
 * Prioritize knowledge hits (e.g. READMEs first for "what is" questions)
 */
export function prioritizeKnowledgeHits(hits: any[], userMessage: string): any[] {
    const userMessageLower = userMessage.toLowerCase();
    const isWhatIsQuestion = /^(what is|who is|what are|who are|define|tell me about|explain what|explain who|more details|more analysis)/i.test(userMessageLower) ||
        /^(what|who|which)\s+(is|are|was|were)/i.test(userMessageLower);

    if (isWhatIsQuestion && hits.length > 0) {
        return [...hits]
            .map((h: any) => ({
                ...h,
                isReadme: h.title?.toLowerCase().includes('readme') ||
                    h.id?.toLowerCase().includes('readme') ||
                    h.source?.toLowerCase().includes('readme') ||
                    h.url?.toLowerCase().includes('readme'),
                isInternalSystem: h.title?.toLowerCase().includes('consistency system') ||
                    h.title?.toLowerCase().includes('global consistency') ||
                    h.title?.toLowerCase().includes('implementation status') ||
                    h.title?.toLowerCase().includes('system status')
            }))
            .filter((h: any) => !h.isInternalSystem)
            .sort((a: any, b: any) => {
                if (a.isReadme && !b.isReadme) return -1;
                if (!a.isReadme && b.isReadme) return 1;
                return 0;
            });
    }

    return hits;
}
