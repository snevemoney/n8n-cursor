# Intent Behavior Test Suite - Implementation Summary

## ✅ Completed Implementation

### 1. Test Files Created

#### API-Level Tests (`tests/integration/intent-gating.test.ts`)
- **Purpose**: Fast unit tests for intent classification and gating logic
- **Coverage**: All test groups (A-G) from the specification
- **Validates**:
  - Intent classification accuracy
  - Tool gating by intent (`getToolsForIntent`)
  - KB gating by intent (`shouldUseKnowledgeBase`)
  - End-to-end intent → tool → KB flow

#### E2E Tests (`tests/e2e/intent-behavior.spec.ts`)
- **Purpose**: Comprehensive browser tests for full chat flow
- **Coverage**: All test groups with UI validation
- **Validates**:
  - Full message → response flow
  - Response content (no KB mentions for simple questions)
  - Debug panel visibility
  - Browser automation hooks

### 2. Debug UI Enhancements

#### Data-TestID Attributes Added
- `data-testid="debug-plan"` - Plan panel container
- `data-testid="debug-plan-empty"` - Empty plan state
- `data-testid="debug-council"` - Council panel container
- `data-testid="debug-council-empty"` - Empty council state
- `data-testid="debug-tools"` - Tools panel container
- `data-testid="debug-tools-empty"` - Empty tools state
- `data-testid="debug-knowledge"` - Knowledge panel container
- `data-testid="chat-message"` - Message elements (for E2E tests)

#### Window Debug Object (`window.__SCORPION_DEBUG__`)
Exposes debug information for browser automation:
```javascript
window.__SCORPION_DEBUG__.lastMessage = {
  intent: 'small_talk' | 'general_question' | 'project_help' | 'system_debug',
  message: 'user message text',
  timestamp: 1234567890,
  plan: { /* plan structure */ },
  toolsUsed: [ /* array of tool calls */ ],
  knowledge: {
    attempted: true/false,
    hasResults: true/false,
    results: [ /* KB search results */ ]
  }
}
```

### 3. Bug Fixes

#### Fixed: `userMessage` Reference Error
- **File**: `apps/scorpion/app/(scorpion)/chat/hooks/useChatStream.ts`
- **Issue**: Line 259 referenced `userMessage` which wasn't in scope
- **Fix**: Captured `content` parameter as `userMessageContent` before closure
- **Impact**: Prevents runtime errors when exposing debug info

### 4. Documentation

#### Test Runner Script (`tests/scripts/run-intent-tests.sh`)
- Executable bash script
- Runs both API-level and E2E tests
- Configurable BASE_URL environment variable

#### README (`tests/README-INTENT-TESTS.md`)
- Complete test documentation
- Test scenario descriptions
- Running instructions
- Debug information guide
- Troubleshooting tips

## Test Coverage

### Group A - Small Talk ✅
- A1: "hi" → `small_talk`, no tools, no KB
- A2: "How are you?" → `small_talk`, no tools, no KB

### Group B - Simple General Questions ✅
- B1: "What is 2+2?" → `general_question`, no tools, no KB
- B2: "What is the capital of Canada?" → `general_question`, no tools, no KB
- B3: "Explain what Bitcoin is" → `general_question`, no tools, no KB

### Group C - Multi-step Reasoning ✅
- C1: Savings calculation → `general_question`, no tools, no KB
- C2: "Explain RAM vs SSD" → `general_question`, no tools, no KB

### Group D - Project Help ✅
- D1: "How does Scorpion's planner work?" → `project_help`, tools available, KB enabled
- D2: "Find chat API route" → `project_help`, tools available, KB enabled
- D3: Workflow question → `project_help`, tools available, KB enabled

### Group E - System Debug ✅
- E1: "Why do you keep asking?" → `system_debug`, tools available, KB enabled
- E2: Meta question about tool usage → `system_debug` or `project_help`

### Group F - Edge Cases ✅
- F1: "Tell me about nursing" → `general_question`, no tools
- F2: Missing info question → `general_question`, no tools

### Group G - Browser Automation ✅
- G1: `window.__SCORPION_DEBUG__` exposes debug info
- G2: DOM has `data-testid` attributes for debug elements

## Running Tests

### Quick Start
```bash
cd apps/scorpion

# API-level tests only (fast)
pnpm test tests/integration/intent-gating.test.ts

# E2E tests (requires server)
BASE_URL=http://localhost:3003 pnpm test:e2e tests/e2e/intent-behavior.spec.ts

# All tests
./tests/scripts/run-intent-tests.sh
```

## Key Features

1. **Intent-Based Gating**: Tools and KB are gated based on classified intent
2. **Debug Visibility**: Full debug info exposed via DOM and window object
3. **Browser Automation Ready**: Test IDs and debug hooks for automation tools
4. **Comprehensive Coverage**: All test scenarios from specification implemented
5. **Fast Feedback**: API-level tests run quickly for rapid iteration

## Next Steps

1. Run the test suite to verify all scenarios pass
2. Add more edge cases as they're discovered
3. Monitor test results in CI/CD pipeline
4. Use debug hooks for browser automation testing

## Files Modified

- `apps/scorpion/tests/integration/intent-gating.test.ts` (new)
- `apps/scorpion/tests/e2e/intent-behavior.spec.ts` (new)
- `apps/scorpion/app/(scorpion)/chat/hooks/useChatStream.ts` (modified - bug fix)
- `apps/scorpion/app/(scorpion)/chat/components/ChatPanels.tsx` (modified - added test IDs)
- `apps/scorpion/components/chat/MessageList.tsx` (modified - added test ID)
- `apps/scorpion/tests/scripts/run-intent-tests.sh` (new)
- `apps/scorpion/tests/README-INTENT-TESTS.md` (new)

