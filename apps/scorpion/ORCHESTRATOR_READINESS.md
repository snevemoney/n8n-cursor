# Orchestrator Readiness Test Matrix

## Overview

This document defines the golden test scenarios to verify frontier-level behavior. Run these after any major changes to ensure the orchestrator behaves deterministically.

## Test Scenarios

### 1. System Health Check

**Prompt**: `Check system health`

**Expected Behavior**:
- ✅ Intent: `system_debug`
- ✅ Tools: `system.health` + `stats.get` (MUST have both)
- ✅ NO `kb.search`, NO `research.run`
- ✅ Answer mentions status/uptime/services, NO "web sources"
- ✅ No JSON validation errors in logs
- ✅ Latency: < 5 seconds

**Logs to Verify**:
```
[Helper Config] Intent: system_debug, Lightweight: false
[Helper Config] Safety: true, Budget: false, Memory: false, Style: false
[Planner Enforcement] ✅ Enforced system.health. Final plan steps: system.health, stats.get
[Chat Stream] Using intent-specific summarizer for system_debug
```

**Failure Indicators**:
- ❌ "Bad safety-guard JSON" errors
- ❌ "Bad executor JSON" errors
- ❌ "Self-correction: Trying knowledge base search" for system_debug
- ❌ "I was unable to find web sources..." in response
- ❌ Storage detection spam (more than once at startup)

---

### 2. System Logs Query

**Prompt**: `Show last 20 error logs`

**Expected Behavior**:
- ✅ Intent: `system_debug`
- ✅ Tools: `logs.tail`
- ✅ NO KB or research
- ✅ Clean log output in response

**Logs to Verify**:
```
[Helper Config] Intent: system_debug
[Planner] Plan includes: logs.tail
```

---

### 3. Internal Docs Query

**Prompt**: `Explain how the planner works in Scorpion`

**Expected Behavior**:
- ✅ Intent: `project_help`
- ✅ Tools: `kb.search` (+ maybe `knowledge.get`)
- ✅ NO `system.health`
- ✅ Answer based on knowledge base

**Logs to Verify**:
```
[Helper Config] Intent: project_help
[Helper Config] Safety: true, Budget: true, Memory: true, Style: false
[Planner] Plan includes: kb.search
```

---

### 4. Web Research (Unavailable)

**Prompt**: `Research latest Bitcoin news. Give top 3 with links.`

**Expected Behavior** (with no API keys):
- ✅ Research tools NOT registered (logged at startup)
- ✅ Planner explicitly says research is unavailable
- ✅ Either uses KB if Bitcoin docs exist, or answers with reasoning only
- ✅ NO "I was unable to find web sources" if KB was used

**Logs to Verify**:
```
[Tool Registry] ⚠️ No research API keys found - research.run and research.start will be disabled
[Planner] ⚠️ NOTE: Web research tools are disabled (no API keys configured)
```

---

### 5. Self-Correction Path

**Prompt**: Something ambiguous that first triggers a weak answer, forcing self-correction

**Example**: `What files were uploaded recently?` (if files.recent initially returns empty)

**Expected Behavior**:
- ✅ Self-correction calls KB or another tool (if allowed by intent)
- ✅ NO JSON validation error spam
- ✅ Self-correction respects intent boundaries (no KB for system_debug)

**Logs to Verify**:
```
[Chat Stream] Self-correction: Detected uncertainty or insufficient data
[Chat Stream] Self-correction: Trying knowledge base search (if allowed)
```

---

### 6. Failure Handling

**Test**: Temporarily break `system.health` (e.g., throw inside route) and run `Check system health`

**Expected Behavior**:
- ✅ Clear degraded answer like: "System health check partially failed: health endpoint timed out. Stats and n8n connection are still available."
- ✅ NO crash, NO unhandled exception
- ✅ Partial results still summarized

**Logs to Verify**:
```
[Executor] Tool system.health failed (attempt 1/1)
[Chat Stream] Partial results available, generating degraded summary
```

---

### 7. Side-Effect Tool Safety

**Prompt**: `Trigger workflow X in n8n`

**Expected Behavior**:
- ✅ Tool executes once
- ✅ NO self-correction that re-triggers the workflow
- ✅ Summarizer clearly states: "Triggered workflow X in n8n and got status SUCCESS"

**Logs to Verify**:
```
[Chat Stream] Self-correction: Skipped (side-effect tool used: workflows.trigger)
```

---

### 8. Unknown Intent Fallback

**Prompt**: `What is 2+2?` (simple math, no tools needed)

**Expected Behavior**:
- ✅ Intent: `general_question` or `small_talk`
- ✅ Plan may have `tool: 'none'` or minimal tools
- ✅ Direct answer without tool execution
- ✅ NO JSON validation errors

---

## Running the Tests

### Manual Testing

1. Start dev server: `pnpm --filter scorpion dev`
2. Open UI at `http://localhost:3003`
3. For each test scenario:
   - Send the prompt
   - Watch terminal logs for expected patterns
   - Verify response content matches expectations
   - Check for absence of error patterns

### Automated Testing

Run the test suite:
```bash
cd apps/scorpion
pnpm tsx scripts/test-frontier-fixes.ts
```

---

## Success Criteria

All tests pass when:
- ✅ No JSON validation errors from helpers
- ✅ No storage detection spam (only at startup)
- ✅ Intent-aware helper config working
- ✅ Self-correction respects intent boundaries
- ✅ Summarizer uses correct prompt per intent
- ✅ Planner enforcement working (system health always uses system.health)
- ✅ Tolerant JSON parsing prevents enum errors

---

## Known Issues / Future Improvements

- [ ] Per-intent latency budgets (system_debug < 5s, general_question < 30s)
- [ ] Per-tool reliability metadata (logs.tail = reliable, research.run = flaky)
- [ ] Automated eval harness with regression detection
- [ ] Conversation state persistence for follow-ups

---

## Architecture Checklist

### ✅ Completed
- [x] Tolerant JSON parsing (safety-guard, executor)
- [x] Intent-aware helper config
- [x] Self-correction rules (no KB for system_debug)
- [x] Intent-specific summarizer
- [x] Storage centralization
- [x] Planner enforcement (system health)
- [x] Frontier-style fallback behavior

### 🟡 In Progress
- [ ] Planner tolerant parsing (needs integration test)
- [ ] All helper failures use defaults (needs verification)

### 📋 Future
- [ ] Per-intent latency budgets
- [ ] Per-tool reliability scores
- [ ] Automated eval harness
















