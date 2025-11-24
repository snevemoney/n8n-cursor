# Council System - Next Steps

## ✅ What's Already Done

1. **Council Types** - All interfaces defined
2. **Three Council Members** - Ethics, Simplicity, Tools
3. **Council Aggregator** - `runCouncil()` function
4. **Orchestrator Integration** - `runScorpionBrain()` with council support
5. **Chat Stream Integration** - Council runs after plan creation
6. **Frontend UI** - CouncilNotes component displays results
7. **BIAS_RISK Signal** - Added to improvement signals

## 🧪 Testing Steps

### 1. Test Ethics Council (Bias Detection)

**Test Case 1: Hiring Domain**
```
User: "Help me design an AI system to screen resumes based on past successful hires"
```
**Expected:**
- Ethics council detects "hiring" domain
- Adds bias warning to answer
- Logs BIAS_RISK signal
- Shows issue in Council Notes UI

**Test Case 2: Loan Approval**
```
User: "Build a credit scoring system using historical loan data"
```
**Expected:**
- Detects "loans" domain
- Flags bias risk
- Recommends human oversight

### 2. Test Simplicity Council

**Test Case: Over-Complex Plan**
```
User: "Create a comprehensive system that: 1) reads files, 2) processes data, 3) writes results, 4) sends notifications, 5) updates database, 6) generates reports, 7) creates backups, 8) validates everything"
```
**Expected:**
- Simplicity council flags >5 steps
- Applies plan simplifier
- Reduces to 5 steps max
- Shows complexity issue

### 3. Test Tools Council

**Test Case: Invalid Tool**
```
User: "Use the tool 'magic.wand' to solve this problem"
```
**Expected:**
- Tools council detects invalid tool
- Flags HALLUCINATED_ENDPOINT
- Shows tool validation issue

### 4. Test Full Integration

**Test Case: High-Risk Domain with Complex Plan**
```
User: "Design an AI system to automatically approve or deny loan applications using machine learning on historical data. The system should: 1) fetch applicant data, 2) run ML model, 3) check credit score, 4) verify employment, 5) calculate risk, 6) make decision, 7) send notification, 8) update database"
```

**Expected Results:**
- ✅ Ethics: Detects "loans" → adds bias warning
- ✅ Simplicity: Flags 8 steps → simplifies to 5
- ✅ Tools: Validates all tool names
- ✅ Council Notes shows all issues
- ✅ Plan revised with safety measures
- ✅ Answer includes ethics warning

## 🔧 Integration Improvements

### Option 1: Use `runScorpionBrain` in Chat Stream

Currently, the chat stream uses `handleScorpionStrategy` separately. You could consolidate to use `runScorpionBrain` which includes council:

**Current (lines 3418-3439):**
```typescript
const strategy = await handleScorpionStrategy(snapshot);
```

**Improved:**
```typescript
const brain = await runScorpionBrain(snapshot, {
  planSummaryOverride: plan.objective,
  domainTags: extractDomainTags(userMessage, plan.objective || ''),
});

// Use brain.council, brain.nextBestAction, brain.similar
```

### Option 2: Apply Council Revisions to Draft Answer

After execution, you could run council again on the final answer:

```typescript
// After generating final answer
const finalCouncil = await runCouncil({
  goalDescription: userMessage,
  planSummary: plan.objective,
  draftAnswer: finalAnswer, // The answer about to be sent
  domainTags: domainTags,
  toolsUsed: executedTools,
});

// Use finalCouncil.revisedAnswer if council modified it
```

## 🚀 Additional Features

### 1. Council History Dashboard

Create `/ops/council-history` to view all council reviews:

```typescript
// apps/scorpion/app/(scorpion)/ops/council-history/page.tsx
'use client';

export default function CouncilHistory() {
  // Fetch council results from storage
  // Show timeline of all reviews
  // Filter by domain, severity, councillor
}
```

### 2. Enhanced Domain Tag Extraction

Use NLP/ML to better extract domains:

```typescript
// apps/scorpion/server/council/domainExtractor.ts
export async function extractDomainTagsML(text: string): Promise<string[]> {
  // Use embedding similarity to known domain examples
  // Or use a small classifier model
}
```

### 3. Security Council Member

Add security checks:

```typescript
// apps/scorpion/server/council/SecurityCouncilMember.ts
export class SecurityCouncilMember implements CouncilMember {
  id = 'security';
  name = 'Security Councillor';
  
  run(input: CouncilInput): CouncilOutput {
    // Check for:
    // - SQL injection risks
    // - File system access without validation
    // - API keys in code
    // - Unsafe tool combinations
  }
}
```

### 4. Performance Council Member

Check for performance issues:

```typescript
// apps/scorpion/server/council/PerformanceCouncilMember.ts
export class PerformanceCouncilMember implements CouncilMember {
  id = 'performance';
  name = 'Performance Councillor';
  
  run(input: CouncilInput): CouncilOutput {
    // Check for:
    // - Too many sequential tool calls
    // - Missing caching opportunities
    // - Large data processing without batching
  }
}
```

### 5. Council Result Persistence

Store council results for analysis:

```typescript
// apps/scorpion/server/council/councilStore.ts
export async function saveCouncilResult(
  conversationId: string,
  result: CouncilResult
) {
  // Save to database or file
  // Include timestamp, issues, revisions
}
```

### 6. Council Analytics

Track patterns over time:

```typescript
// apps/scorpion/app/api/council/analytics/route.ts
export async function GET() {
  // Return:
  // - Most common issues
  // - Domains with highest bias risk
  // - Plan complexity trends
  // - Tool validation failures
}
```

## 📊 Monitoring & Debugging

### 1. Add Council Logging

```typescript
// In runCouncil()
console.log('[Council] Running review', {
  goal: input.goalDescription.slice(0, 100),
  domainTags: input.domainTags,
  stepCount: input.planSteps?.length,
  toolCount: input.toolsUsed?.length,
});

console.log('[Council] Results', {
  approved: result.approved,
  issueCount: result.allIssues.length,
  warnings: result.warnings.length,
});
```

### 2. Council Metrics

Track council performance:

```typescript
// apps/scorpion/server/council/metrics.ts
export function trackCouncilMetrics(result: CouncilResult) {
  // Track:
  // - Average issues per review
  // - Approval rate
  // - Most active councillor
  // - Response time
}
```

### 3. Test Coverage

Add tests for council members:

```typescript
// apps/scorpion/tests/council/ethics.test.ts
describe('EthicsCouncilMember', () => {
  it('should detect hiring domain', () => {
    const input = {
      goalDescription: 'Screen resumes',
      planSummary: 'Use ML to rank candidates',
      domainTags: [],
    };
    const result = EthicsCouncilMember.run(input);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].tag).toBe('bias');
  });
});
```

## 🎯 Quick Wins

1. **Add Council to Golden Missions** - Test that council runs correctly
2. **Improve Error Handling** - Better fallbacks if council fails
3. **Add Council to Patch Report** - Show council issues in diagnostics
4. **Council Tooltips** - Explain what each councillor does in UI
5. **Export Council Results** - Allow exporting reviews as JSON/CSV

## 📝 Documentation Updates

1. Update system prompt to mention council phase
2. Add council examples to user guide
3. Document how to add new council members
4. Create council troubleshooting guide

## 🔍 Verification Checklist

- [ ] Council runs on every plan
- [ ] Ethics detects high-risk domains
- [ ] Simplicity simplifies complex plans
- [ ] Tools validates tool names
- [ ] Council results appear in UI
- [ ] Improvement signals are logged
- [ ] Plan revisions are applied
- [ ] Answer revisions are applied
- [ ] No errors in console
- [ ] Performance is acceptable (<100ms)

## 🎬 Ready to Test

Start your dev server and try the test cases above. Check:

1. **Console logs** - Should see `[Council]` messages
2. **Network tab** - Should see `council_result` events
3. **UI** - Council tab should show issues
4. **Patch report** - `/ops/scorpion` should show BIAS_RISK signals

---

**Next Action:** Run the test cases and verify council is working correctly!

