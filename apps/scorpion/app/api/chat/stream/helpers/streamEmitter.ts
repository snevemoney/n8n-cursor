/**
 * Stream Event Emitter
 *
 * Centralized utility for formatting and emitting SSE events to the client.
 * Eliminates duplication of send() calls throughout the codebase.
 *
 * Following CONTRIBUTING.md principles:
 * - Single source of truth for stream formatting
 * - Clear, descriptive function names
 * - No duplication across 50+ send() calls
 */

export type SendFunction = (event: { type: string; data: any }) => void;

/**
 * Emit a progress update event
 */
export function emitProgress(
  send: SendFunction,
  phase: string,
  progress: number,
  message: string
): void {
  send({
    type: 'progress',
    data: { phase, progress, message },
  });
}

/**
 * Emit a status message event
 */
export function emitStatus(
  send: SendFunction,
  message: string,
  phase: string,
  conversationId?: string
): void {
  send({
    type: 'status',
    data: {
      message,
      phase,
      ...(conversationId && { conversationId }),
    },
  });
}

/**
 * Emit an error event
 */
export function emitError(
  send: SendFunction,
  message: string,
  phase: string,
  additionalData?: Record<string, any>
): void {
  send({
    type: 'error',
    data: {
      message,
      phase,
      ...additionalData,
    },
  });
}

/**
 * Emit a tool start event
 */
export function emitToolStart(
  send: SendFunction,
  toolName: string,
  callId: string,
  args: any
): void {
  send({
    type: 'tool',
    data: {
      tool: toolName,
      callId,
      args,
      status: 'running',
    },
  });
}

/**
 * Emit a tool completion event
 */
export function emitToolComplete(
  send: SendFunction,
  toolName: string,
  callId: string,
  args: any,
  result: any
): void {
  send({
    type: 'tool',
    data: {
      tool: toolName,
      callId,
      args,
      status: 'completed',
      result,
    },
  });
}

/**
 * Emit a tool error event
 */
export function emitToolError(
  send: SendFunction,
  toolName: string,
  callId: string,
  args: any,
  error: string
): void {
  send({
    type: 'tool',
    data: {
      tool: toolName,
      callId,
      args,
      status: 'error',
      error,
    },
  });
}

/**
 * Emit an assistant message event
 */
export function emitAssistantMessage(
  send: SendFunction,
  messageId: string,
  content: string
): void {
  send({
    type: 'message',
    data: {
      id: messageId,
      role: 'assistant',
      content,
    },
  });
}

/**
 * Emit a search query event
 */
export function emitSearchQuery(
  send: SendFunction,
  query: string,
  provider: string
): void {
  send({
    type: 'search_query',
    data: {
      query,
      provider,
      timestamp: Date.now(),
    },
  });
}

/**
 * Emit a knowledge hit event
 */
export function emitKnowledgeHit(
  send: SendFunction,
  hit: {
    title: string;
    url: string;
    score: number;
    excerpt?: string;
    snippet?: string;
    provider: string;
    publishedAt?: string | null;
    query: string;
    category: string;
    conversationId?: string;
  }
): void {
  send({
    type: 'knowledge_hit',
    data: {
      title: hit.title,
      url: hit.url,
      score: hit.score,
      excerpt: hit.excerpt || hit.snippet || '',
      snippet: hit.snippet || hit.excerpt || '',
      provider: hit.provider,
      publishedAt: hit.publishedAt || null,
      query: hit.query,
      category: hit.category,
      ...(hit.conversationId && { conversationId: hit.conversationId }),
    },
  });
}

/**
 * Emit a citation event
 */
export function emitCitation(
  send: SendFunction,
  citation: {
    title: string;
    url: string;
    rank: number;
    reason: string;
    score: number;
  }
): void {
  send({
    type: 'citation',
    data: {
      title: citation.title,
      url: citation.url,
      rank: citation.rank,
      reason: citation.reason,
      score: citation.score,
      timestamp: Date.now(),
    },
  });
}

/**
 * Emit a thinking process event
 */
export function emitThinking(
  send: SendFunction,
  message: string,
  phase?: string
): void {
  send({
    type: 'thinking',
    data: {
      message,
      ...(phase && { phase }),
    },
  });
}

/**
 * Emit a debug event
 */
export function emitDebug(
  send: SendFunction,
  message: string,
  data?: any
): void {
  send({
    type: 'debug',
    data: {
      message,
      ...(data && { data }),
    },
  });
}

/**
 * Emit research sources as knowledge hits and citations
 *
 * Handles the common pattern of emitting search results from research tools.
 * Emits both knowledge_hit events for all sources and citation events for top 3.
 */
export function emitResearchSources(
  send: SendFunction,
  sources: any[],
  query: string,
  provider: string,
  conversationId?: string
): void {
  if (!sources || !Array.isArray(sources) || sources.length === 0) {
    return;
  }

  // Emit search query event
  emitSearchQuery(send, query, provider);

  // Emit status update
  emitStatus(
    send,
    sources.length === 0
      ? `Research completed but no external sources found (browser/API limits in lite mode).`
      : `Research completed. Found ${sources.length} sources.`,
    'executing',
    conversationId
  );

  // Emit knowledge hits and citations
  sources.forEach((hit, index) => {
    const rank = index + 1;

    // Emit citation for top 3
    if (rank <= 3) {
      emitCitation(send, {
        title: hit.title || 'Untitled',
        url: hit.url || '',
        rank,
        reason: `Top ${rank} result for "${query}"`,
        score: hit.score || hit.relevance || 0,
      });
    }

    // Emit knowledge hit for all sources
    emitKnowledgeHit(send, {
      title: hit.title || 'Untitled',
      url: hit.url || '',
      score: hit.score || hit.relevance || 0,
      excerpt: hit.snippet || hit.excerpt || '',
      snippet: hit.snippet || hit.excerpt || '',
      provider,
      publishedAt: hit.publishedAt || null,
      query,
      category: 'web',
      conversationId,
    });
  });
}
