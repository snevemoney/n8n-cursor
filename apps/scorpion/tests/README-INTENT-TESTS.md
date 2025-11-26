# Intent Behavior Test Suite

This test suite validates that Scorpion correctly gates tool and knowledge base usage based on user intent classification.

## Test Structure

### API-Level Tests (`tests/integration/intent-gating.test.ts`)
Fast unit tests that validate:
- Intent classification for different message types
- Tool gating by intent
- Knowledge base gating by intent
- End-to-end intent → tool → KB flow

### E2E Tests (`tests/e2e/intent-behavior.spec.ts`)
Comprehensive browser tests that validate:
- Full chat flow from message → response
- UI debug panel visibility
- Browser automation hooks (`window.__SCORPION_DEBUG__`)

## Running Tests

### Run API-level tests only (fast):
```bash
cd apps/scorpion
pnpm test tests/integration/intent-gating.test.ts
```

### Run E2E tests (requires server running):
```bash
cd apps/scorpion
BASE_URL=http://localhost:3003 pnpm test:e2e tests/e2e/intent-behavior.spec.ts
```

### Run all intent tests:
```bash
cd apps/scorpion
./tests/scripts/run-intent-tests.sh
```

## Test Scenarios

### Group A - Small Talk (No Tools/KB)
- A1: "hi" → should be `small_talk`, no tools, no KB
- A2: "How are you?" → should be `small_talk`, no tools, no KB

### Group B - Simple General Questions (No Tools/KB)
- B1: "What is 2+2?" → should be `general_question`, no tools, no KB
- B2: "What is the capital of Canada?" → should be `general_question`, no tools, no KB
- B3: "Explain what Bitcoin is" → should be `general_question`, no tools, no KB

### Group C - Multi-step Reasoning (No Tools/KB)
- C1: Savings calculation → should be `general_question`, no tools, no KB
- C2: "Explain RAM vs SSD" → should be `general_question`, no tools, no KB

### Group D - Project Help (Tools/KB SHOULD be used)
- D1: "How does Scorpion's planner work?" → should be `project_help`, tools available, KB enabled
- D2: "Find chat API route" → should be `project_help`, tools available, KB enabled

### Group E - System Debug
- E1: "Why do you keep asking?" → should be `system_debug`, tools available, KB enabled

### Group G - Browser Automation Visibility
- G1: `window.__SCORPION_DEBUG__` should expose intent, plan, tools, knowledge
- G2: DOM should have `data-testid` attributes for debug elements

## Debug Information

The chat UI exposes debug information via:
1. **DOM attributes**: `data-testid="debug-plan"`, `data-testid="debug-tools"`, etc.
2. **Window object**: `window.__SCORPION_DEBUG__.lastMessage` contains:
   - `intent`: Classified intent
   - `message`: User message
   - `plan`: Plan structure
   - `toolsUsed`: Array of tools called
   - `knowledge`: KB search results

## Fixing Issues

If tests fail, check:
1. Intent classification in `lib/chat/intent.ts`
2. Tool gating in `getToolsForIntent()`
3. KB gating in `shouldUseKnowledgeBase()`
4. Debug info exposure in `hooks/useChatStream.ts`

