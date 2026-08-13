/**
 * Minimal knowledge-base stub for pattern persistence.
 * Full RAG store lives elsewhere; this keeps production builds green.
 */

export type KnowledgeStoreInput = {
  id: string;
  content: string;
  metadata?: Record<string, unknown>;
};

export async function storeInKnowledgeBase(_input: KnowledgeStoreInput): Promise<void> {
  // No-op stub: pattern learning must not fail the build when KB backend is absent.
  return;
}
