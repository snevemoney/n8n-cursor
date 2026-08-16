# Research Query Fix Summary

## Problem
Research queries like "Research the latest Bitcoin + global macro news" were:
- ✅ Correctly classified as `project_help` intent
- ❌ But using `project.analyze` tool instead of `research.run`
- ❌ Plan showed "Respond to user" or "Analyze project structure"

## Root Causes Found

1. **Anti-repetition enforcement** (line 2244-2281) was replacing `kb.search` with `project.analyze` for ALL non-codebase questions, including research queries
2. **Planner prompt** didn't have strong enough guidance for research queries
3. **Enforcement logic** only checked first step, not all steps

## Fixes Applied

### 1. Intent Classification (`apps/scorpion/lib/chat/intent.ts`)
- ✅ Added research patterns to classify research queries as `project_help`
- ✅ Updated `getToolsForIntent('general_question')` to allow research tools

### 2. Planner Prompt (`apps/scorpion/lib/prompts/planner.system.txt`)
- ✅ Added strong research query guidance with 🚨 emojis
- ✅ Updated `project_help` intent description to mention research queries

### 3. Route Prompt Building (`apps/scorpion/app/api/chat/stream/route.ts`)
- ✅ Added research query detection BEFORE codebase question check (line 1325-1334)
- ✅ Added critical warning in prompt: "🚨🚨🚨 CRITICAL: THIS IS A RESEARCH QUERY!"
- ✅ Added research query detection in tool usage guidance (line 910-914)

### 4. Enforcement Logic (`apps/scorpion/app/api/chat/stream/route.ts`)
- ✅ Fixed anti-repetition enforcement to check for research queries FIRST (line 2248-2261)
- ✅ Added ABSOLUTE FINAL enforcement that checks ALL steps (line 2284-2325)
- ✅ Removes `project.analyze` AND `code.readFile` from research queries
- ✅ Forces `research.run` if plan doesn't have it or has `project.analyze`

## Testing
Need to retest Test 1 to verify:
1. Intent is `project_help` ✅
2. Plan uses `research.run` ✅ (should be enforced)
3. Tools panel shows `research.run` execution ✅
4. No `project.analyze` in plan ✅

