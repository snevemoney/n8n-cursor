/**
 * Query Rewriter
 * Rewrites user queries for better retrieval accuracy
 *
 * Handles:
 * - Intent classification
 * - Query condensing (remove greetings, EOL, etc.)
 * - Query expansion (add synonyms, related terms)
 * - Multi-query generation for complex questions
 */

import type { RAGIntent } from './config';
import type { ScorpionIntent } from '@/lib/chat/types';

/**
 * Classify RAG intent from user message
 */
export function classifyRAGIntent(message: string, scorpionIntent?: ScorpionIntent): RAGIntent {
  if (!message) return 'general';

  const lower = message.toLowerCase().trim();

  // CODE queries
  const codePatterns = [
    /\b(function|class|interface|type|component|module|import|export|variable|constant)\b/i,
    /\b(typescript|javascript|react|next\.?js|node\.?js|python|code)\b/i,
    /\.(ts|tsx|js|jsx|py|go|rs|java|cpp|c)\b/i,
    /\b(implementation|refactor|bug|debug|fix|error|exception)\b/i,
    /\b(how does.*work|how is.*implemented|where is.*defined|what does.*do)\b/i,
  ];

  for (const pattern of codePatterns) {
    if (pattern.test(lower)) {
      return 'code_query';
    }
  }

  // ML queries
  const mlPatterns = [
    /\b(machine learning|ml|neural network|model|training|inference|embedding|transformer)\b/i,
    /\b(pattern learning|feature extraction|normalization|activation|layer|matrix)\b/i,
    /\b(predict|classification|regression|clustering|optimization)\b/i,
  ];

  for (const pattern of mlPatterns) {
    if (pattern.test(lower)) {
      return 'ml_query';
    }
  }

  // N8N schema queries
  const n8nPatterns = [
    /\b(n8n|workflow|node|execution|trigger|credential|schema)\b/i,
    /\b(agentpilot|agent.*pilot|workflow.*execution)\b/i,
  ];

  for (const pattern of n8nPatterns) {
    if (pattern.test(lower)) {
      return 'n8n_schema';
    }
  }

  // Infrastructure queries
  const infraPatterns = [
    /\b(deployment|docker|kubernetes|k8s|cloud|aws|gcp|azure|server|kvm|vm)\b/i,
    /\b(infrastructure|infra|devops|ci\/cd|pipeline|container)\b/i,
    /\b(redis|postgres|database|cache|queue)\b/i,
  ];

  for (const pattern of infraPatterns) {
    if (pattern.test(lower)) {
      return 'infrastructure';
    }
  }

  // Architecture queries
  const archPatterns = [
    /\b(architecture|system.*design|design.*pattern|macro.*pattern|micro.*pattern)\b/i,
    /\b(orchestrator|dispatcher|executor|planner|summarizer|council)\b/i,
    /\b(phase|strategy|protocol|mission)\b/i,
    /\b(how.*scorpion.*work|scorpion.*architecture|system.*architecture)\b/i,
  ];

  for (const pattern of archPatterns) {
    if (pattern.test(lower)) {
      return 'architecture';
    }
  }

  // RAG config queries
  const ragPatterns = [
    /\b(rag|retrieval|embedding|vector|pinecone|knowledge.*base|semantic.*search)\b/i,
    /\b(indexing|chunking|rerank|similarity|context.*window)\b/i,
  ];

  for (const pattern of ragPatterns) {
    if (pattern.test(lower)) {
      return 'rag_config';
    }
  }

  // Agent policy queries
  const agentPatterns = [
    /\b(agent|policy|behavior|role|persona|council.*member)\b/i,
    /\b(executor|planner|summarizer|self.*correction|helper)\b/i,
  ];

  for (const pattern of agentPatterns) {
    if (pattern.test(lower)) {
      return 'agent_policy';
    }
  }

  // Tool spec queries
  const toolPatterns = [
    /\b(tool|api|endpoint|route|function|method|call)\b/i,
    /\b(web.*search|file.*read|code.*execute|research\.run)\b/i,
  ];

  for (const pattern of toolPatterns) {
    if (pattern.test(lower)) {
      return 'tool_spec';
    }
  }

  // Default to general
  return 'general';
}

/**
 * Rewritten query result
 */
export interface RewrittenQuery {
  original: string;
  rewritten: string;
  intent: RAGIntent;
  keywords: string[];
  expansion?: string[];
  subQueries?: string[];
}

/**
 * Extract keywords from query
 */
function extractKeywords(query: string): string[] {
  // Remove common stopwords
  const stopwords = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
    'could', 'can', 'may', 'might', 'must', 'shall', 'of', 'at', 'by',
    'for', 'with', 'about', 'against', 'between', 'into', 'through',
    'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up',
    'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further',
    'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all',
    'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
    'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's',
    't', 'just', 'don', 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain',
    'aren', 'couldn', 'didn', 'doesn', 'hadn', 'hasn', 'haven', 'isn',
    'ma', 'mightn', 'mustn', 'needn', 'shan', 'shouldn', 'wasn', 'weren',
    'won', 'wouldn', 'what', 'which', 'who', 'whom', 'this', 'that', 'these',
    'those', 'am', 'or', 'because', 'as', 'until', 'while', 'if', 'else',
    'hi', 'hello', 'hey', 'thanks', 'please', 'tell', 'me', 'you', 'your',
  ]);

  const words = query
    .toLowerCase()
    .replace(/[^\w\s.-]/g, ' ')  // Keep dots and hyphens for file extensions
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopwords.has(word));

  return [...new Set(words)];
}

/**
 * Remove noise from query (greetings, punctuation, etc.)
 */
function removeQueryNoise(query: string): string {
  let cleaned = query.trim();

  // Remove greeting patterns
  cleaned = cleaned.replace(/^(hi|hello|hey|yo|greetings|good morning|good afternoon|good evening)[,!\s]*/i, '');
  cleaned = cleaned.replace(/^(thanks|thank you|thx|ty)[,!\s]*/i, '');
  cleaned = cleaned.replace(/^(please|can you|could you|would you)[,!\s]*/i, '');

  // Remove trailing punctuation (but keep important punctuation)
  cleaned = cleaned.replace(/[?!.]+$/, '');

  // Clean up multiple spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

/**
 * Expand query with synonyms and related terms
 */
function expandQuery(query: string, intent: RAGIntent): string[] {
  const expansions: string[] = [];
  const lower = query.toLowerCase();

  // Code-related expansions
  if (intent === 'code_query') {
    if (lower.includes('function')) {
      expansions.push(query.replace(/function/gi, 'method'));
      expansions.push(query.replace(/function/gi, 'procedure'));
    }
    if (lower.includes('class')) {
      expansions.push(query.replace(/class/gi, 'component'));
      expansions.push(query.replace(/class/gi, 'type'));
    }
    if (lower.includes('bug')) {
      expansions.push(query.replace(/bug/gi, 'error'));
      expansions.push(query.replace(/bug/gi, 'issue'));
    }
  }

  // ML-related expansions
  if (intent === 'ml_query') {
    if (lower.includes('model')) {
      expansions.push(query.replace(/model/gi, 'neural network'));
      expansions.push(query.replace(/model/gi, 'network'));
    }
    if (lower.includes('train')) {
      expansions.push(query.replace(/train/gi, 'fit'));
      expansions.push(query.replace(/train/gi, 'learning'));
    }
  }

  // Architecture expansions
  if (intent === 'architecture') {
    if (lower.includes('orchestrator')) {
      expansions.push(query.replace(/orchestrator/gi, 'brain'));
      expansions.push(query.replace(/orchestrator/gi, 'coordinator'));
    }
  }

  return expansions;
}

/**
 * Break complex query into sub-queries
 */
function generateSubQueries(query: string): string[] | undefined {
  const subQueries: string[] = [];

  // Check for compound questions (multiple questions joined by "and", "also", etc.)
  const compoundPatterns = [
    /\band\s+(?:also\s+)?(?:how|what|where|when|why|who)/i,
    /\balso[,\s]+(?:how|what|where|when|why|who)/i,
    /\bplus[,\s]+(?:how|what|where|when|why|who)/i,
  ];

  for (const pattern of compoundPatterns) {
    if (pattern.test(query)) {
      // Split on connectors
      const parts = query.split(/\s+(?:and|also|plus)\s+/i);
      if (parts.length > 1) {
        return parts.map(p => p.trim()).filter(p => p.length > 10);
      }
    }
  }

  // Check for multi-part questions (numbered lists)
  if (/\d+[.)]\s+/.test(query)) {
    const parts = query.split(/\d+[.)]\s+/).filter(p => p.trim().length > 10);
    if (parts.length > 1) {
      return parts.map(p => p.trim());
    }
  }

  return subQueries.length > 0 ? subQueries : undefined;
}

/**
 * Rewrite query for better retrieval
 */
export function rewriteQuery(query: string, scorpionIntent?: ScorpionIntent): RewrittenQuery {
  const intent = classifyRAGIntent(query, scorpionIntent);

  // Remove noise (greetings, filler words)
  const cleaned = removeQueryNoise(query);

  // Extract keywords
  const keywords = extractKeywords(cleaned);

  // Generate query expansions
  const expansion = expandQuery(cleaned, intent);

  // Generate sub-queries for complex questions
  const subQueries = generateSubQueries(cleaned);

  // Build final rewritten query
  let rewritten = cleaned;

  // Add context based on intent
  if (intent === 'code_query') {
    rewritten = `TypeScript code implementation: ${cleaned}`;
  } else if (intent === 'ml_query') {
    rewritten = `Machine learning system: ${cleaned}`;
  } else if (intent === 'n8n_schema') {
    rewritten = `n8n workflow schema: ${cleaned}`;
  } else if (intent === 'infrastructure') {
    rewritten = `Infrastructure deployment: ${cleaned}`;
  } else if (intent === 'architecture') {
    rewritten = `System architecture pattern: ${cleaned}`;
  } else if (intent === 'rag_config') {
    rewritten = `RAG retrieval configuration: ${cleaned}`;
  } else if (intent === 'agent_policy') {
    rewritten = `Agent behavior policy: ${cleaned}`;
  } else if (intent === 'tool_spec') {
    rewritten = `Tool API specification: ${cleaned}`;
  }

  return {
    original: query,
    rewritten,
    intent,
    keywords,
    expansion: expansion.length > 0 ? expansion : undefined,
    subQueries,
  };
}

/**
 * Batch rewrite queries
 */
export function rewriteQueries(queries: string[], scorpionIntent?: ScorpionIntent): RewrittenQuery[] {
  return queries.map(q => rewriteQuery(q, scorpionIntent));
}
