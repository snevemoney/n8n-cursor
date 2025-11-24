# Council System - Complete Implementation Guide

## ✅ What's Been Implemented

### Council Members (5 Total)
1. **Ethics & Bias Council** - Detects high-risk domains, adds bias warnings
2. **Human-Sensitivity Council** - Understands emotions, adjusts tone (friend/tool/anxiety)
3. **AI Foundations Council** - Ensures correct AI subfield usage (ML/DL/NLP/LLM/CV)
4. **Simplicity Council** - Simplifies complex plans, reduces bloat
5. **Tools Council** - Validates tool names, detects hallucinations

### Supporting Infrastructure
- ✅ Council types and interfaces
- ✅ Council aggregator (`runCouncil`)
- ✅ Integration into chat stream
- ✅ Frontend UI components (CouncilNotes, AIFoundationsDebugPanel)
- ✅ Training datasets and unit tests
- ✅ Scorpion Academy page
- ✅ Sidebar navigation links

## 🧪 Testing Checklist

### 1. Test Ethics Council

**Test Case: Hiring Domain**
```
User: "Help me design an AI system to screen resumes based on past successful hires"
```
**Expected:**
- ✅ Ethics council detects "hiring" domain
- ✅ Adds bias warning to answer
- ✅ Logs BIAS_RISK signal
- ✅ Shows issue in Council tab

**Test Case: Loan Approval**
```
User: "Build a credit scoring system using historical loan data"
```
**Expected:**
- ✅ Detects "loans" domain
- ✅ Flags bias risk
- ✅ Recommends human oversight

### 2. Test Human-Sensitivity Council

**Test Case: Fear/Anxiety**
```
User: "I'm worried about AI taking over my job. Should I be scared?"
```
**Expected:**
- ✅ Detects fear/anxiety
- ✅ Adds reassuring note
- ✅ Logs USER_CORRECTION signal

**Test Case: Friend-like Relationship**
```
User: "I treat AI like a friend, it helps me clear my head when I'm stuck"
```
**Expected:**
- ✅ Detects friend-like relationship
- ✅ Adjusts to conversational tone
- ✅ Adds supportive note

**Test Case: Calling Out Discrimination**
```
User: "Your examples always default to white families. This is not diverse enough."
```
**Expected:**
- ✅ Detects discrimination call-out
- ✅ Acknowledges and commits to diversity
- ✅ Logs human-context signal

### 3. Test AI Foundations Council

**Test Case: Mixing CV and NLP**
```
User: "Use NLP to analyze car crash photos and classify damage"
```
**Expected:**
- ✅ Flags incorrect mixing
- ✅ Recommends Computer Vision for images
- ✅ Shows in AI Foundations debug panel

**Test Case: Using LLM for Structured Prediction**
```
User: "Use ChatGPT to predict customer churn from our CSV database"
```
**Expected:**
- ✅ Flags LLM for structured data
- ✅ Recommends traditional ML
- ✅ Shows correctness issue

**Run Unit Tests:**
```bash
# If you have tsx installed
tsx apps/scorpion/server/council/aiFoundationsCouncil.test.ts

# Or with node
node --loader ts-node/esm apps/scorpion/server/council/aiFoundationsCouncil.test.ts
```

### 4. Test Simplicity Council

**Test Case: Over-Complex Plan**
```
User: "Create a system that: 1) reads files, 2) processes data, 3) writes results, 4) sends notifications, 5) updates database, 6) generates reports, 7) creates backups, 8) validates everything"
```
**Expected:**
- ✅ Flags >5 steps
- ✅ Applies plan simplifier
- ✅ Reduces to 5 steps max

### 5. Test Tools Council

**Test Case: Invalid Tool**
```
User: "Use the tool 'magic.wand' to solve this problem"
```
**Expected:**
- ✅ Detects invalid tool
- ✅ Flags HALLUCINATED_ENDPOINT
- ✅ Shows tool validation issue

## 🔍 Verification Steps

### 1. Check Console Logs

When you send a message, you should see:
```
[Council] Running review { goal: "...", domainTags: [...], ... }
[Council] Results { approved: true, issueCount: 2, ... }
```

### 2. Check Network Tab

In browser DevTools → Network → EventStream, look for:
- `council_result` events
- `improvement-signal` events
- `next-best-action` events

### 3. Check UI

1. **Council Tab** - Should show:
   - Council Notes (if issues found)
   - AI Foundations Debug Panel (if AI issues)
   - Approval status

2. **Academy Page** - Navigate to `/academy/ai-foundations`
   - Should load educational content
   - Should be accessible from sidebar

3. **Diagnostics** - Navigate to `/ops/scorpion`
   - Should show BIAS_RISK signals
   - Should show USER_CORRECTION signals
   - Should show MISCLASSIFIED_INTENT signals

## 🚀 Quick Start Testing

### Step 1: Start Dev Server
```bash
cd apps/scorpion
npm run dev
```

### Step 2: Open Chat
Navigate to `/chat` in your browser

### Step 3: Test High-Risk Domain
Send: "Help me design an AI system to screen job applicants"

**Check:**
- ✅ Council tab shows ethics issue
- ✅ Answer includes bias warning
- ✅ Console shows council logs

### Step 4: Test Human Context
Send: "I'm anxious about using AI in my workflow"

**Check:**
- ✅ Council tab shows human-context issue
- ✅ Answer includes reassuring note
- ✅ Tone is more empathetic

### Step 5: Test AI Foundations
Send: "Use an NLP model to analyze images of damaged cars"

**Check:**
- ✅ AI Foundations debug panel appears
- ✅ Shows correctness issue
- ✅ Recommends Computer Vision

## 📊 Monitoring & Analytics

### View Council Signals

1. **Patch Report** (`/api/scorpion/patch-report`)
   - Shows aggregated improvement signals
   - Includes council-flagged issues

2. **Console Logs**
   - `[Council]` prefixed messages
   - Shows which councillors ran
   - Shows issues found

3. **Frontend State**
   - `currentCouncilResult` in chat state
   - Accessible via React DevTools

### Track Patterns Over Time

Monitor these signals:
- `BIAS_RISK` - How often high-risk domains appear
- `USER_CORRECTION` - Human-context patterns
- `MISCLASSIFIED_INTENT` - AI subfield confusion
- `OVERCOMPLEX_PLAN` - Plan complexity issues
- `HALLUCINATED_ENDPOINT` - Invalid tool usage

## 🔧 Integration Points

### Where Council Runs

1. **Chat Stream Route** (`apps/scorpion/app/api/chat/stream/route.ts`)
   - Runs after plan creation
   - Lines 3347-3416

2. **Orchestrator** (`apps/scorpion/server/orchestrator/index.ts`)
   - `runScorpionBrain()` includes council
   - Can be called with `draftAnswer` for answer review

3. **Frontend** (`apps/scorpion/app/(scorpion)/chat/components/ChatPanels.tsx`)
   - Displays council results in Council tab
   - Shows AI Foundations debug panel

## 🎯 Next Enhancements (Optional)

### 1. Council History Dashboard

Create `/ops/council-history`:
```typescript
// apps/scorpion/app/(scorpion)/ops/council-history/page.tsx
// Shows timeline of all council reviews
// Filter by domain, severity, councillor
```

### 2. Enhanced Domain Extraction

Use ML/NLP for better domain detection:
```typescript
// apps/scorpion/server/council/domainExtractor.ts
export async function extractDomainTagsML(text: string): Promise<string[]>
```

### 3. Security Council Member

Add security checks:
```typescript
// apps/scorpion/server/council/SecurityCouncilMember.ts
// Check for: SQL injection, unsafe file access, API keys in code
```

### 4. Performance Council Member

Check for performance issues:
```typescript
// apps/scorpion/server/council/PerformanceCouncilMember.ts
// Check for: Too many sequential calls, missing caching, large data processing
```

### 5. Council Result Persistence

Store council results for analysis:
```typescript
// apps/scorpion/server/council/councilStore.ts
export async function saveCouncilResult(conversationId: string, result: CouncilResult)
```

### 6. More Academy Modules

- `/academy/ethics-bias` - Ethics & Bias guide
- `/academy/human-ai-collaboration` - Human-AI relationship guide
- `/academy/rag-vs-search` - RAG vs classic search

### 7. Auto-Link to Academy

When Scorpion explains AI concepts, auto-link to Academy:
```typescript
// In answer generation
if (mentionsAIFoundations) {
  answer += '\n\n📚 Learn more: [AI Foundations Academy](/academy/ai-foundations)';
}
```

## 🐛 Troubleshooting

### Council Not Running

**Check:**
1. Is `runCouncil` imported correctly?
2. Are all council members registered in `index.ts`?
3. Check console for errors

### Issues Not Showing in UI

**Check:**
1. Is `currentCouncilResult` being set in state?
2. Is `council_result` event being sent?
3. Check React DevTools for state updates

### Tests Failing

**Check:**
1. Are sample files in correct location?
2. Are expected tags matching actual tags?
3. Run with verbose logging to see actual vs expected

## 📝 Documentation Updates Needed

1. **System Prompt** - Mention council phase
2. **User Guide** - Explain what council does
3. **Developer Guide** - How to add new council members
4. **API Docs** - Document council result structure

## 🎉 Success Criteria

You'll know everything is working when:

- ✅ Council runs on every plan
- ✅ Issues appear in Council tab
- ✅ Answers are revised with warnings/recommendations
- ✅ Signals are logged to diagnostics
- ✅ Academy page is accessible
- ✅ Tests pass
- ✅ No console errors

## 🦂 Ready to Test!

Start with the quick start testing above, then move to specific test cases. The council system is fully integrated and should work automatically.

If you encounter issues, check:
1. Console logs for `[Council]` messages
2. Network tab for `council_result` events
3. React DevTools for state
4. `/ops/scorpion` for signals

---

**Next Action:** Run the quick start tests and verify council is working! 🚀

