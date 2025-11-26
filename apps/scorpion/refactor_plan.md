# Refactoring Plan for processStreamStart.ts

## Objective
Split `processStreamStart.ts` into helpers to improve modularity without changing behavior.

## Tasks
1. [ ] Extract Legacy Executor Loop
   - Target: `apps/scorpion/app/api/chat/stream/helpers/legacyExecutor.ts`
   - Source: Identify the loop handling tool execution and legacy agent logic.
2. [ ] Extract RAG / Knowledge Integration
   - Target: `apps/scorpion/app/api/chat/stream/helpers/ragIntegration.ts`
   - Source: Identify RAG, Pinecone, or knowledge base query logic.
3. [ ] Update `processStreamStart.ts`
   - Import and use the new helpers.
   - Remove extracted code.
