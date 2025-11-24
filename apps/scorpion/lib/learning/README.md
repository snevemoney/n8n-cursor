# Pattern Learning System

## Overview

The Pattern Learning System enables Scorpion to continuously improve by learning from successful interactions. Unlike traditional pre-training (which requires massive compute and datasets), this system uses **RAG-based pattern matching** to retrieve and apply successful strategies from past interactions.

## How It Works

### 1. Learning Phase (Automatic)
```
User Query → Plan → Execution → Success? → Store Pattern
```

When an interaction completes successfully:
- Extract the query, plan, tools used, and context
- Normalize and categorize the query type
- Store as a success pattern in memory + knowledge base
- Tag with metadata for future retrieval

### 2. Retrieval Phase (Before Planning)
```
New Query → Find Similar Patterns → Enhance Plan → Execute
```

Before generating a plan:
- Normalize the new query
- Search for similar successful patterns (keyword + semantic matching)
- Rank by similarity score and feedback
- Use top patterns to enhance the plan

### 3. Continuous Improvement
```
Interaction → Feedback → Update Pattern → Better Results
```

Over time:
- Patterns accumulate from every successful interaction
- Similar queries get better and better responses
- Tool selection improves based on what worked
- No manual training required

## Key Components

### PatternLearningSystem (`pattern-learning.ts`)

Core learning engine that:
- Stores success patterns
- Finds relevant patterns for new queries
- Generates improved plans based on patterns
- Tracks statistics and performance

### Integration Layer (`patternLearningIntegration.ts`)

Connects learning to chat stream:
- `learnFromSuccess()` - Store patterns after successful execution
- `enhancePlanWithLearning()` - Retrieve patterns before planning
- `generateLearningContext()` - Add pattern context to planner prompt
- `getLearningStatistics()` - Monitor learning performance

### API & UI

- **API**: `/api/learning/statistics` - Get learning metrics
- **Dashboard**: `/learning` - View patterns, success rate, top tools

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

## Usage Example

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

// Plan enhanced
enhancedPlan = {
  ...basePlan,
  plan: [
    { tool: "research.run", args: { query: "ethereum news" } }
  ]
};
```

## Integration Points

### 1. Chat Stream Route (`route.ts`)

**Before planning:**
```typescript
// Retrieve relevant patterns
const { matches } = await enhancePlanWithLearning(userQuery, basePlan);

// Add to planner context
const learningContext = generateLearningContext(matches);
plannerPrompt += learningContext;
```

**After successful execution:**
```typescript
await learnFromSuccess({
  userQuery,
  plan,
  councilResult,
  executionSuccess: true,
  conversationLength: messages.length
});
```

### 2. Planner Phase (`phases/plannerPhase.ts`)

Injects learned patterns into prompt:
```markdown
## 📚 LEARNED PATTERNS

**Past Success 1** (85% similar):
- Query: "research bitcoin"
- Tools used: research.run
- Match reason: Similar query intent • Shared keywords: research, crypto

Consider using similar tool selections for this query.
```

## Performance Benefits

### Example Metrics After 100 Interactions:

- **Total Patterns**: 100
- **Success Rate**: 85%
- **Top Tools**: research.run (45), workflows.list (30), code.readFile (15)
- **Query Types**: research (40%), workflow (30%), codebase (20%), system (10%)

### Expected Improvements:

- ✅ **Faster planning**: Reuse successful strategies instead of reasoning from scratch
- ✅ **Better tool selection**: Learn which tools work for which query types
- ✅ **Reduced errors**: Avoid tool combinations that failed in the past
- ✅ **Consistent quality**: Apply best practices learned from successful interactions

## Monitoring & Debugging

### View Statistics:

```bash
curl http://localhost:3003/api/learning/statistics
```

### Dashboard:

Visit `http://localhost:3003/learning` to see:
- Total patterns learned
- Success rate over time
- Query type distribution
- Most frequently used tools

### Logs:

```
✅ [Pattern Learning] Stored pattern: research - "research bitcoin"
🎯 [Pattern Learning] Found 2 relevant patterns for: "find ethereum news"
   - research (72%): "research bitcoin"
   - research (65%): "latest crypto updates"
🔧 [Pattern Learning] Enhanced plan using pattern from: "research bitcoin"
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

## Comparison: Pattern Learning vs Fine-Tuning

| Feature | Pattern Learning | Fine-Tuning |
|---------|-----------------|-------------|
| **Setup Time** | Immediate | Weeks |
| **Cost** | Free | $8-100+ per run |
| **Training Data** | Learns from every interaction | Requires 500+ examples |
| **Update Speed** | Real-time | Manual retraining |
| **Explainability** | Full visibility | Black box |
| **Works With** | Any LLM | Specific models |
| **Maintenance** | Automatic | Manual |

## Conclusion

The Pattern Learning System provides **"training-like" benefits** without the complexity and cost of actual fine-tuning. It's perfect for Scorpion because:

1. ✅ Works with any LLM provider (Ollama, OpenAI, Anthropic, etc.)
2. ✅ Learns continuously from every interaction
3. ✅ Zero cost and zero setup
4. ✅ Fully explainable and debuggable
5. ✅ Improves performance immediately

As Scorpion is used more, it automatically gets better at handling similar queries.
