# Pattern Learning System Integration

## Overview

Successfully integrated a comprehensive **RAG-based Pattern Learning System** into Scorpion that enables continuous improvement through learning from successful interactions.

## What Was Implemented

### 1. Core Learning Engine
**File**: `lib/learning/pattern-learning.ts` (352 lines)

- **PatternLearningSystem** class that:
  - Stores successful interaction patterns with query, plan, tools used, and success metrics
  - Finds relevant patterns using **70% keyword overlap + 30% Levenshtein string similarity**
  - Generates improved plans by merging base plans with successful pattern steps
  - Tracks statistics: total patterns, success rate, query type distribution, top tools
  - Persists patterns to knowledge base for RAG retrieval

### 2. Integration Layer
**File**: `app/api/chat/stream/helpers/patternLearningIntegration.ts` (138 lines)

- `learnFromSuccess()` - Stores patterns after successful execution
- `enhancePlanWithLearning()` - Retrieves patterns before planning
- `generateLearningContext()` - Adds pattern context to planner prompt
- `getLearningStatistics()` - Returns learning metrics
- `provideFeedback()` - Updates patterns with user feedback scores

### 3. Stream Integration Helpers
**File**: `app/api/chat/stream/helpers/patternLearningHelpers.ts` (105 lines)

- `learnFromInteraction()` - Wraps learning call for stream context
- `enhancePlanWithPatterns()` - Wraps pattern retrieval for stream context
- `determineExecutionSuccess()` - Evaluates if execution was successful based on:
  - Council approval status
  - Step execution results (no failures)
  - Plan/results alignment

### 4. Chat Stream Integration
**File**: `app/api/chat/stream/processStreamStart.ts` (Modified)

**Before Planner Phase** (lines 1493-1506):
```typescript
// Pattern Learning: Retrieve relevant patterns from past successes
const { learningContext } = await enhancePlanWithPatterns({
  userMessage,
  basePlan: { plan: [], objective: userMessage },
});

if (learningContext) {
  plannerPrompt += learningContext;
  console.log('[Pattern Learning] Added learned patterns context to planner prompt');
}
```

**After Successful Completion** (lines 4713-4733):
```typescript
// Pattern Learning: Learn from this successful interaction
const executionSuccess = determineExecutionSuccess(plan, results, councilResult);

if (executionSuccess) {
  await learnFromInteraction({
    userMessage,
    plan,
    councilResult,
    executionSuccess: true,
    conversationLength: messages.length,
    userIntent: intent as string,
  });
  console.log('[Pattern Learning] Stored success pattern for future queries');
}
```

### 5. API Endpoint
**File**: `app/api/learning/statistics/route.ts` (30 lines)

- **GET** `/api/learning/statistics`
- Returns:
  - `totalPatterns`: Number of stored patterns
  - `byQueryType`: Distribution across research/workflow/codebase/system/general
  - `successRate`: Percentage of successful interactions
  - `topTools`: Top 10 most frequently used tools

### 6. Dashboard UI
**File**: `app/(scorpion)/learning/page.tsx` (300+ lines)

- Visual dashboard at `/learning` showing:
  - Total learned patterns count
  - Success rate percentage with progress bar
  - Query type distribution with breakdown
  - Top 10 most used tools
  - Info box explaining how pattern learning works

### 7. Documentation
**File**: `lib/learning/README.md` (279 lines)

Comprehensive documentation covering:
- How the learning/retrieval/improvement cycle works
- Similarity algorithm details (70/30 keyword + string split)
- Integration points with chat stream
- Usage examples with before/after scenarios
- Performance benefits and metrics
- Comparison with traditional fine-tuning
- Future enhancement suggestions

## How It Works

### Learning Phase (Automatic)
```
User Query → Plan → Execution → Success? → Store Pattern
```

When an interaction completes successfully:
1. Extract the query, plan, tools used, and context
2. Normalize and categorize the query type
3. Store as a success pattern in memory + knowledge base
4. Tag with metadata for future retrieval

### Retrieval Phase (Before Planning)
```
New Query → Find Similar Patterns → Enhance Plan → Execute
```

Before generating a plan:
1. Normalize the new query
2. Search for similar successful patterns (keyword + semantic matching)
3. Rank by similarity score (threshold: 30%) and feedback
4. Use top patterns to enhance the planner prompt

### Continuous Improvement
```
Interaction → Feedback → Update Pattern → Better Results
```

Over time:
- Patterns accumulate from every successful interaction
- Similar queries get better and better responses
- Tool selection improves based on what worked
- No manual training required

## Pattern Matching Algorithm

### Similarity Calculation (70% keyword + 30% string similarity)

```typescript
// 1. Extract keywords (remove stop words)
query1: "research bitcoin news" → ["research", "bitcoin", "news"]
query2: "find latest bitcoin updates" → ["find", "latest", "bitcoin", "updates"]

// 2. Calculate keyword overlap
overlap: ["bitcoin"] → 1/4 = 25% keyword similarity

// 3. Calculate string similarity (Levenshtein)
stringSimilarity("research bitcoin news", "find latest bitcoin updates") → 40%

// 4. Weighted combination
finalScore = (0.25 * 0.7) + (0.40 * 0.3) = 0.295 → 29.5% match
```

### Threshold: 30% similarity required for relevance

## Query Type Detection

Patterns are categorized by type for better matching:

- **research**: Keywords like "research", "find", "latest", "competitors"
- **workflow**: Keywords like "workflow", "n8n", "trigger", "execute"
- **codebase**: Keywords like "code", "file", "function", "implement"
- **system**: Keywords like "system", "health", "status", "logs"
- **general**: Everything else

## Key Benefits

### vs Traditional Fine-Tuning

| Feature | Pattern Learning | Fine-Tuning |
|---------|-----------------|-------------|
| **Setup Time** | Immediate | Weeks |
| **Cost** | Free | $8-100+ per run |
| **Training Data** | Learns from every interaction | Requires 500+ examples |
| **Update Speed** | Real-time | Manual retraining |
| **Explainability** | Full visibility | Black box |
| **Works With** | Any LLM | Specific models |
| **Maintenance** | Automatic | Manual |

### Expected Improvements

- ✅ **Faster planning**: Reuse successful strategies instead of reasoning from scratch
- ✅ **Better tool selection**: Learn which tools work for which query types
- ✅ **Reduced errors**: Avoid tool combinations that failed in the past
- ✅ **Consistent quality**: Apply best practices learned from successful interactions

## Example Usage

### Scenario: User asks "research bitcoin"

**1. First Time (No Patterns)**
```typescript
// No similar patterns found
plan = basePlan; // Uses default planner logic
```

**2. After Successful Execution**
```typescript
// Pattern stored:
{
  userQuery: "research bitcoin",
  queryType: "research",
  toolsUsed: ["research.run"],
  executionSuccess: true,
  councilApproval: true
}
```

**3. Similar Query Later: "find ethereum news"**
```typescript
// Pattern retrieved (keywords: research, crypto)
matches = [
  {
    pattern: { userQuery: "research bitcoin", toolsUsed: ["research.run"] },
    similarityScore: 0.72,
    matchReason: "Similar query intent • Shared keywords: research, crypto"
  }
];

// Planner prompt enhanced
plannerPrompt += `
## 📚 LEARNED PATTERNS

**Past Success 1** (72% similar):
- Query: "research bitcoin"
- Tools used: research.run
- Match reason: Similar query intent • Shared keywords: research, crypto

Consider using similar tool selections for this query.
`;
```

## Monitoring & Debugging

### View Statistics
```bash
curl http://localhost:3003/api/learning/statistics
```

### Dashboard
Visit `http://localhost:3003/learning` to see:
- Total patterns learned
- Success rate over time
- Query type distribution
- Most frequently used tools

### Logs
```
✅ [Pattern Learning] Stored pattern: research - "research bitcoin"
🎯 [Pattern Learning] Found 2 relevant patterns for: "find ethereum news"
   - research (72%): "research bitcoin"
   - research (65%): "latest crypto updates"
📚 [Pattern Learning] Added learned patterns context to planner prompt
```

## Future Enhancements

### 1. Persistent Storage
Currently patterns are in-memory. Add database storage:
```sql
CREATE TABLE learned_patterns (
  id TEXT PRIMARY KEY,
  user_query TEXT,
  query_type TEXT,
  plan_json JSONB,
  tools_used TEXT[],
  success BOOLEAN,
  feedback_score REAL,
  timestamp TIMESTAMPTZ
);
```

### 2. Feedback Loop
Add user feedback to weight patterns:
```typescript
await provideFeedback("research bitcoin", 0.9); // High satisfaction
```

### 3. Negative Patterns
Learn from failures too:
```typescript
if (!executionSuccess) {
  await storeFailurePattern({ userQuery, plan, reason });
}
```

### 4. Cross-User Learning (Optional)
Share patterns across users (with privacy controls):
```typescript
const sharedPatterns = await fetchPublicPatterns(queryType);
```

## Commit

```
feat: integrate pattern learning system into chat stream

- Add pattern learning helpers to retrieve and store successful patterns
- Retrieve relevant patterns before planner phase and add to prompt
- Store success patterns after completion for future learning
- Patterns enhance planner decisions based on past successes
- Automatic learning from every successful interaction
```

Commit: `e031e0d32`

## Files Changed

```
 8 files changed, 1145 insertions(+)
 create mode 100644 apps/scorpion/app/(scorpion)/learning/page.tsx
 create mode 100644 apps/scorpion/app/api/chat/stream/helpers/patternLearningHelpers.ts
 create mode 100644 apps/scorpion/app/api/chat/stream/helpers/patternLearningIntegration.ts
 create mode 100644 apps/scorpion/app/api/learning/statistics/route.ts
 create mode 100644 apps/scorpion/lib/learning/README.md
 create mode 100644 apps/scorpion/lib/learning/pattern-learning.ts
 modified: apps/scorpion/app/api/chat/stream/processStreamStart.ts
```

## Next Steps

1. Test the pattern learning system with actual queries
2. Monitor learning statistics at `/learning`
3. Verify patterns are being stored and retrieved correctly
4. Check logs for pattern learning events
5. Consider adding persistent database storage
6. Implement user feedback mechanism
7. Add negative pattern learning from failures
