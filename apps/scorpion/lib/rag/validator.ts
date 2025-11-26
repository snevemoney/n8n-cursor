/**
 * Generation Validator
 * Enforces citation requirements and prevents hallucination
 *
 * Features:
 * - Citation extraction and validation
 * - Hallucination detection
 * - Answer quality scoring
 * - Insufficient context handling
 */

import type { RerankedChunk } from './reranker';
import { GENERATION_CONFIG } from './config';

/**
 * Citation in generated text
 */
export interface Citation {
  text: string;              // Cited text snippet
  source: string;            // Source file path
  chunkId: string;           // Referenced chunk ID
  location: string;          // Citation location (e.g., "L120-150")
}

/**
 * Validation result
 */
export interface ValidationResult {
  isValid: boolean;
  hasCitations: boolean;
  citations: Citation[];
  issues: ValidationIssue[];
  score: number;             // Answer quality score (0-1)
  shouldReject: boolean;     // Should reject and show insufficient context message?
}

/**
 * Validation issue
 */
export interface ValidationIssue {
  type: 'missing_citation' | 'hallucination' | 'insufficient_context' | 'length_exceeded';
  severity: 'error' | 'warning';
  message: string;
  location?: string;
}

/**
 * Extract citations from generated text
 */
function extractCitations(text: string, chunks: RerankedChunk[]): Citation[] {
  const citations: Citation[] = [];

  // Pattern 1: Markdown-style citations [source.ts:L120-150]
  const mdCitationPattern = /\[([^\]]+\.(?:ts|tsx|js|jsx|py|go|rs|md|txt)[^\]]*)\]/g;
  let match;

  while ((match = mdCitationPattern.exec(text)) !== null) {
    const citation = match[1];
    const [source, location] = citation.split(':');

    // Find matching chunk
    const chunk = chunks.find(c => c.source.includes(source));
    if (chunk) {
      citations.push({
        text: chunk.content.substring(0, 100) + '...',
        source: chunk.source,
        chunkId: chunk.id,
        location: location || `chunk ${chunk.chunkIndex}`,
      });
    }
  }

  // Pattern 2: Inline citations "according to source.ts..."
  const inlinePattern = /(?:according to|as stated in|from|in)\s+([a-zA-Z0-9_-]+\.(?:ts|tsx|js|jsx|py|go|rs|md|txt))/gi;

  while ((match = inlinePattern.exec(text)) !== null) {
    const source = match[1];

    // Find matching chunk
    const chunk = chunks.find(c => c.source.includes(source));
    if (chunk) {
      citations.push({
        text: chunk.content.substring(0, 100) + '...',
        source: chunk.source,
        chunkId: chunk.id,
        location: chunk.citation,
      });
    }
  }

  // Pattern 3: "Sources:" section at the end
  const sourcesPattern = /Sources?:\s*\n((?:[-*]\s+.+\n?)+)/i;
  const sourcesMatch = text.match(sourcesPattern);

  if (sourcesMatch) {
    const sourcesList = sourcesMatch[1];
    const sourceLines = sourcesList.split('\n').filter(l => l.trim().startsWith('-') || l.trim().startsWith('*'));

    for (const line of sourceLines) {
      const sourceText = line.replace(/^[-*]\s+/, '').trim();
      const [source, location] = sourceText.split(':');

      const chunk = chunks.find(c => c.source.includes(source));
      if (chunk) {
        citations.push({
          text: chunk.content.substring(0, 100) + '...',
          source: chunk.source,
          chunkId: chunk.id,
          location: location || chunk.citation,
        });
      }
    }
  }

  return citations;
}

/**
 * Detect hallucination by checking if facts in answer exist in retrieved chunks
 */
function detectHallucination(
  generatedText: string,
  chunks: RerankedChunk[]
): { isHallucinating: boolean; confidence: number } {
  // Extract factual statements from generated text
  const statements = generatedText
    .split(/[.!?]\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && !/^(the|a|an|this|that|these|those)\s/i.test(s));

  if (statements.length === 0) {
    return { isHallucinating: false, confidence: 0 };
  }

  // Check each statement against chunks
  let supportedStatements = 0;

  for (const statement of statements) {
    const statementLower = statement.toLowerCase();
    const statementWords = statementLower.split(/\s+/).filter(w => w.length > 3);

    // Check if any chunk supports this statement
    const isSupported = chunks.some(chunk => {
      const chunkLower = chunk.content.toLowerCase();
      // At least 60% of words in statement must appear in chunk
      const matchedWords = statementWords.filter(w => chunkLower.includes(w));
      return matchedWords.length / statementWords.length >= 0.6;
    });

    if (isSupported) {
      supportedStatements++;
    }
  }

  const supportRatio = supportedStatements / statements.length;

  // If less than 70% of statements are supported, likely hallucinating
  const isHallucinating = supportRatio < 0.7;
  const confidence = 1 - supportRatio;

  return { isHallucinating, confidence };
}

/**
 * Calculate answer quality score
 */
function calculateQualityScore(
  generatedText: string,
  chunks: RerankedChunk[],
  citations: Citation[]
): number {
  let score = 0;

  // Factor 1: Has citations (40%)
  if (citations.length > 0) {
    score += 0.4;
  }

  // Factor 2: Citation density (20%)
  const words = generatedText.split(/\s+/).length;
  const citationDensity = Math.min(citations.length / (words / 100), 1);  // 1 citation per 100 words
  score += citationDensity * 0.2;

  // Factor 3: Chunk coverage (20%)
  const citedChunkIds = new Set(citations.map(c => c.chunkId));
  const chunkCoverage = Math.min(citedChunkIds.size / Math.max(chunks.length, 1), 1);
  score += chunkCoverage * 0.2;

  // Factor 4: No hallucination (20%)
  const { isHallucinating, confidence } = detectHallucination(generatedText, chunks);
  if (!isHallucinating) {
    score += 0.2;
  } else {
    score += (1 - confidence) * 0.2;
  }

  return score;
}

/**
 * Validate generated answer
 */
export function validateAnswer(
  generatedText: string,
  chunks: RerankedChunk[]
): ValidationResult {
  const issues: ValidationIssue[] = [];

  // 1. Extract citations
  const citations = extractCitations(generatedText, chunks);
  const hasCitations = citations.length > 0;

  // 2. Check citation requirement
  if (GENERATION_CONFIG.requireCitations && !hasCitations) {
    issues.push({
      type: 'missing_citation',
      severity: 'error',
      message: 'Generated answer lacks required citations',
    });
  }

  // 3. Check length limit
  if (generatedText.length > GENERATION_CONFIG.maxResponseLength) {
    issues.push({
      type: 'length_exceeded',
      severity: 'warning',
      message: `Answer exceeds maximum length (${generatedText.length} > ${GENERATION_CONFIG.maxResponseLength})`,
    });
  }

  // 4. Detect hallucination
  const { isHallucinating, confidence } = detectHallucination(generatedText, chunks);
  if (!GENERATION_CONFIG.allowHallucination && isHallucinating && confidence > 0.5) {
    issues.push({
      type: 'hallucination',
      severity: 'error',
      message: `Potential hallucination detected (confidence: ${(confidence * 100).toFixed(1)}%)`,
    });
  }

  // 5. Check if we have sufficient context
  if (chunks.length === 0) {
    issues.push({
      type: 'insufficient_context',
      severity: 'error',
      message: 'No retrieved context available for answer generation',
    });
  }

  // 6. Calculate quality score
  const score = calculateQualityScore(generatedText, chunks, citations);

  // 7. Determine if answer should be rejected
  const hasErrors = issues.some(i => i.severity === 'error');
  const shouldReject = hasErrors || score < 0.5;

  return {
    isValid: !shouldReject,
    hasCitations,
    citations,
    issues,
    score,
    shouldReject,
  };
}

/**
 * Format insufficient context message
 */
export function formatInsufficientContextMessage(
  query: string,
  reason?: string
): string {
  let message = GENERATION_CONFIG.insufficientContextMessage;

  if (reason) {
    message += `\n\n**Specific issue:** ${reason}`;
  }

  message += `\n\n**Your query:** ${query}`;

  return message;
}

/**
 * Append citations to answer
 */
export function appendCitations(
  answer: string,
  chunks: RerankedChunk[]
): string {
  // Check if answer already has a Sources section
  if (/Sources?:/i.test(answer)) {
    return answer;
  }

  // Build sources section
  const sources = chunks
    .slice(0, 5)  // Top 5 chunks
    .map(chunk => `- [${chunk.source}](${chunk.source}) (${chunk.citation})`)
    .join('\n');

  return `${answer}\n\n**Sources:**\n${sources}`;
}

/**
 * Pre-generation validation (before LLM call)
 */
export function validatePreGeneration(chunks: RerankedChunk[]): {
  canGenerate: boolean;
  reason?: string;
} {
  if (chunks.length === 0) {
    return {
      canGenerate: false,
      reason: 'No relevant context retrieved from knowledge base',
    };
  }

  const totalContent = chunks.reduce((sum, c) => sum + c.content.length, 0);
  if (totalContent < 100) {
    return {
      canGenerate: false,
      reason: 'Retrieved context too short (< 100 chars)',
    };
  }

  const avgRerankScore = chunks.reduce((sum, c) => sum + c.rerankScore, 0) / chunks.length;
  if (avgRerankScore < 0.3) {
    return {
      canGenerate: false,
      reason: `Average relevance score too low (${avgRerankScore.toFixed(2)})`,
    };
  }

  return { canGenerate: true };
}

/**
 * Post-generation validation (after LLM call)
 */
export function validatePostGeneration(
  generatedText: string,
  chunks: RerankedChunk[]
): ValidationResult {
  return validateAnswer(generatedText, chunks);
}
