# Council System - Testing Guide

## Quick Test Script

Run these test cases in your chat to verify each council member:

### Test 1: Ethics Council ✅

**Input:**
```
Help me design an AI system to automatically screen job applicants based on their resumes and past hiring data.
```

**Expected Output:**
- Council tab shows: `[BIAS] High-risk domain with a history of algorithmic bias`
- Answer includes: "⚠️ **Ethics & Bias Warning**: AI systems trained on historical data..."
- Console shows: `[Council] ethics-bias detected hiring domain`

---

### Test 2: Human-Sensitivity Council ✅

**Input:**
```
I'm really anxious about AI. Everyone says I need to use it everywhere, but I'm worried it will replace me.
```

**Expected Output:**
- Council tab shows: `[HUMAN-CONTEXT] User may feel anxious or under pressure`
- Answer includes: "You are not required to adopt every AI tool..."
- Tone is reassuring and calm

---

### Test 3: AI Foundations Council ✅

**Input:**
```
I want to use an NLP model to analyze images of car crashes and classify the damage level.
```

**Expected Output:**
- AI Foundations debug panel appears
- Shows: `[CORRECTNESS] Mixed Computer Vision with NLP`
- Recommendation: "Use Computer Vision for image analysis"

---

### Test 4: Simplicity Council ✅

**Input:**
```
Create a comprehensive system that: 1) reads files, 2) processes data, 3) writes results, 4) sends notifications, 5) updates database, 6) generates reports, 7) creates backups, 8) validates everything, 9) archives old data, 10) monitors performance
```

**Expected Output:**
- Council tab shows: `[COMPLEXITY] Plan has 10 steps, which may be unnecessarily complex`
- Plan is simplified to 5 steps max
- Recommendation: "Simplify to 3-5 focused steps"

---

### Test 5: Tools Council ✅

**Input:**
```
Use the tool 'magic.wand' to automatically solve all my problems, and also use 'unicorn.database' to store the results.
```

**Expected Output:**
- Council tab shows: `[TOOLS] Plan references potentially invalid tools`
- Flags: `magic.wand`, `unicorn.database`
- Recommendation: "Verify tool names exist in the tool registry"

---

## Combined Test (All Councils)

**Input:**
```
I'm worried about AI bias, but I need to build a system that uses deep learning neural networks to automatically screen resumes and predict which candidates will be successful, using an NLP chatbot to interview them, and then use a magic.wand tool to make the final hiring decision. The system should have 15 steps.
```

**Expected Output:**
- ✅ Ethics: Flags hiring domain + bias risk
- ✅ Human-Sensitivity: Detects anxiety, adds reassurance
- ✅ AI Foundations: Flags mixing DL/NLP for wrong tasks
- ✅ Simplicity: Flags 15 steps as too complex
- ✅ Tools: Flags invalid `magic.wand` tool

---

## Manual Verification Checklist

After each test, verify:

- [ ] Council tab shows issues
- [ ] Answer is revised with recommendations
- [ ] Console shows `[Council]` logs
- [ ] Network tab shows `council_result` event
- [ ] No errors in console
- [ ] UI updates correctly

---

## Automated Test Suite

Run the AI Foundations test suite:

```bash
# Option 1: Using tsx
npx tsx apps/scorpion/server/council/aiFoundationsCouncil.test.ts

# Option 2: Using ts-node
npx ts-node apps/scorpion/server/council/aiFoundationsCouncil.test.ts

# Option 3: Add to package.json
# "test:council": "tsx apps/scorpion/server/council/aiFoundationsCouncil.test.ts"
```

Expected output:
```
🧪 Testing AI Foundations Council with 8 samples...

✅ [insurance-risk-ml-correct] OK
✅ [simple-nlp-chatbot] OK
✅ [youtube-recommendation-ml] OK
✅ [cv-task-correct] OK
❌ [confuse-genai-with-prediction] Missing expected tags: correctness
...

📊 Results: 6 passed, 2 failed
```

---

## Debugging Tips

### Council Not Running?

1. Check `apps/scorpion/app/api/chat/stream/route.ts` line 3347
2. Verify `runCouncil` is imported
3. Check console for errors

### Issues Not Showing?

1. Check `currentCouncilResult` in React DevTools
2. Verify `council_result` event in Network tab
3. Check `ChatPanels.tsx` renders `CouncilNotes`

### Wrong Issues Detected?

1. Check council member logic in individual files
2. Review detection patterns
3. Add console.logs to debug

---

## Performance Testing

Monitor council performance:

```typescript
// Add timing to runCouncil
const start = Date.now();
const result = await runCouncil(input);
console.log(`[Council] Took ${Date.now() - start}ms`);
```

Target: < 100ms per council run

---

## Integration Testing

Test full flow:

1. Send message → Plan created
2. Council runs → Issues detected
3. Answer revised → Includes warnings
4. Frontend updates → Shows council notes
5. Signals logged → Appear in diagnostics

All should happen automatically in < 2 seconds.

