/**
 * Request Ingestion Module
 *
 * Handles incoming chat requests:
 * - Validation (delegates to existing helper)
 * - Message extraction
 * - Intent classification
 * - Context preparation
 *
 * IMPORTANT: This module coordinates existing validation and classification
 * logic. It does NOT duplicate behavior - it calls existing helpers.
 */

import type { Message } from '@/lib/chat/types';
import type { ReadableStreamDefaultController } from 'stream/web';
import { v4 as uuidv4 } from 'uuid';
import { classifyIntent } from '@/lib/chat/intent';
import { detectLightweightMode } from '@/lib/utils/systemResources';
import { validateRequest } from '../helpers/requestValidation';
import { DEFAULT_USER_ID } from '../config/pipelineConfig';
import type { IngestedRequest, SendFunction } from './types';

// ============================================================================
// REQUEST INGESTION
// ============================================================================

/**
 * Ingest and classify incoming chat request
 *
 * This function:
 * 1. Validates the request (delegates to validateRequest helper)
 * 2. Extracts user message and generates message ID
 * 3. Classifies intent
 * 4. Detects system resource mode (lightweight vs. normal)
 * 5. Returns typed IngestedRequest object
 *
 * @param messages - Array of conversation messages
 * @param conversationId - Optional conversation identifier
 * @param send - SSE event sender function
 * @param controller - Stream controller for error handling
 * @param provider - Optional provider override (e.g., 'ollama')
 * @param model - Optional model override
 * @returns IngestedRequest object or null if validation failed
 *
 * Behavior guarantee:
 * - Uses existing validateRequest() helper - no duplicate validation logic
 * - Uses existing classifyIntent() - no duplicate classification logic
 * - Uses existing detectLightweightMode() - no duplicate resource detection
 * - Returns null if validation fails (error already sent to client)
 */
export async function ingestAndClassifyRequest(
  messages: Message[],
  conversationId: string | undefined,
  send: SendFunction,
  controller: ReadableStreamDefaultController<Uint8Array>,
  provider: string | undefined,
  model: string | undefined
): Promise<IngestedRequest | null> {
  // Step 1: Validate request using existing helper
  // This handles all validation logic and sends errors if needed
  const validatedRequest = await validateRequest(messages, send, controller);

  if (!validatedRequest) {
    // Validation failed, error already sent to client
    return null;
  }

  // Step 2: Extract validated data
  const { userMessage, messageId, filteredHistory, conversationHistory } = validatedRequest;

  // Step 3: Classify intent using existing classifier
  const intent = classifyIntent(userMessage);
  console.log('[Intent]', userMessage, '→', intent);
  console.log('[Chat Stream] Classified intent:', intent, 'for message:', userMessage.substring(0, 50));

  // Send intent to debug tab
  send({
    type: 'debug',
    data: { intent, message: userMessage.substring(0, 100) },
  });

  // Step 4: Detect system resource mode
  const lightweightMode = detectLightweightMode();

  // Step 5: Build and return ingested request object
  const ingestedRequest: IngestedRequest = {
    userMessage,
    messageId,
    conversationHistory,
    filteredHistory,
    intent,
    userId: DEFAULT_USER_ID, // Single-user JARVIS mode
    lightweightMode,
    conversationId,
    provider,
    model,
  };

  return ingestedRequest;
}

// ============================================================================
// QUERY CLASSIFICATION HELPERS
// ============================================================================

/**
 * Compute query classification flags from ingested request
 *
 * This extracts all the boolean checks used throughout the pipeline
 * into a single, cacheable object.
 *
 * @param request - Ingested request
 * @returns Query classification flags
 */
export function classifyQueryType(request: IngestedRequest) {
  const { userMessage } = request;

  // Import patterns from config
  const { QUERY_PATTERNS, isFileQuery: isFileQueryCheck } = require('../config/pipelineConfig');

  return {
    isCodebaseQuestion: QUERY_PATTERNS.CODEBASE_KEYWORDS.test(userMessage),
    isOperationalQuestion: QUERY_PATTERNS.OPERATIONAL.test(userMessage),
    isWorkflowQuestion: QUERY_PATTERNS.WORKFLOW.test(userMessage),
    isAnalysisQuestion: QUERY_PATTERNS.ANALYSIS.test(userMessage),
    isFileQuery: isFileQueryCheck(userMessage),
  };
}
