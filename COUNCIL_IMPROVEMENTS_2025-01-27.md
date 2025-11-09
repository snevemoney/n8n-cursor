# Council Deliberation System Improvements - January 27, 2025

## Overview
Major improvements to the Council deliberation system to enhance agent communication, improve response quality, and fix consensus formatting issues.

## Key Changes

### 1. Agent Awareness of Previous Responses
**Problem**: Agents were responding independently without seeing what others had said.

**Solution**: 
- Added `previousResponses` array that tracks each agent's response
- Each agent now receives context about previous agents' perspectives
- Agents can reference, build upon, or respectfully disagree with colleagues
- Maintains independent judgment while leveraging collective intelligence

**Files Modified**:
- `apps/scorpion/lib/chat/council.ts` - Added previous response tracking and context injection

### 2. Full Text Display (No Interruptions)
**Problem**: Agent responses were being truncated mid-sentence, cutting off their thoughts.

**Solution**:
- Increased `maxTokens` from 100-150 to 500-800 tokens
- Removed all truncation in rationale parsing
- Preserved full responses throughout the pipeline
- UI shows complete, untruncated responses

**Files Modified**:
- `apps/scorpion/app/api/council/route.ts` - Increased token limits
- `apps/scorpion/lib/chat/council.ts` - Removed truncation in vote parsing
- `apps/scorpion/app/(scorpion)/council/page.tsx` - Preserved full response text

### 3. Enhanced Agent Recognition in Feed
**Problem**: Agents were hard to distinguish in the deliberation feed.

**Solution**:
- Larger, more prominent avatars (10x10 circular indicators)
- Enhanced styling with gradient backgrounds and shadows
- Better headers showing agent name, role, and weight prominently
- Visual hierarchy: completed responses shown first, then thinking states
- Thinking states persist for 2 seconds after completion

**Files Modified**:
- `apps/scorpion/app/(scorpion)/council/page.tsx` - Enhanced UI for agent recognition

### 4. Casual Question Detection Enhancement
**Problem**: Identity questions like "who is scorpion to yall" were being treated as technical plans.

**Solution**:
- Expanded `isCasualQuestion()` function to detect identity/definition questions
- Added patterns for: "who is", "what is", "who are", "what are", "define", "tell me about", "explain who", "explain what", "who.*to", "what.*to"
- Questions starting with these patterns are now correctly identified as casual

**Files Modified**:
- `apps/scorpion/lib/chat/council.ts` - Enhanced `isCasualQuestion()` function

### 5. Scorpion Context for Identity Questions
**Problem**: Agents didn't understand what Scorpion is when asked identity questions.

**Solution**:
- Added Scorpion context block for identity questions
- Explains that Scorpion is an AI-powered operations environment
- Describes its purpose: project management, workflows, knowledge, automation
- Clarifies the Council's role within Scorpion
- Agents now answer identity questions with proper context

**Files Modified**:
- `apps/scorpion/lib/chat/council.ts` - Added `scorpionContext` for identity questions

### 6. Improved Prompts for Identity Questions
**Problem**: Agents were treating identity questions as plans requiring analysis.

**Solution**:
- Different prompt structure for identity vs recommendation questions
- Identity questions: "Answer directly and naturally from your unique perspective"
- Recommendation questions: "Provide your recommendation"
- Clear instructions to explain what Scorpion is, not analyze a plan

**Files Modified**:
- `apps/scorpion/lib/chat/council.ts` - Updated user prompts with identity question handling

### 7. Fixed Consensus Formatting
**Problem**: Consensus showed votes, random numbers, and truncated text that didn't make sense.

**Solution**:
- **Identity Questions**: Shows "Council's Collective Understanding" with each agent's full perspective (4-5 sentences) and a synthesis
- **Recommendation Questions**: Shows "Council Recommendation" with top recommendation and key perspectives
- Removed "Key Perspectives" section for identity questions (redundant)
- Aggressive text cleaning to remove votes, confidence scores, and numbers
- Better sentence filtering to exclude meaningless content
- Consensus strength message adapted for question type

**Files Modified**:
- `apps/scorpion/lib/chat/council.ts` - Completely rewrote `computeConsensus()` for identity questions

### 8. Text Cleaning Improvements
**Problem**: Rationales contained parsing artifacts, votes, and random numbers.

**Solution**:
- Removes vote words ("approve", "reject", "revise")
- Removes confidence scores ("0.95", "Confidence: 0.95")
- Removes standalone numbers and numbered list markers
- Filters out empty or meaningless sentences
- Normalizes whitespace

**Files Modified**:
- `apps/scorpion/lib/chat/council.ts` - Enhanced text cleaning in consensus computation

## Technical Details

### Token Limits
- **Before**: 100-150 tokens (too short, caused truncation)
- **After**: 500-800 tokens (allows full responses)

### Response Flow
1. Agent starts thinking → Streams thinking process
2. Agent completes → Full response preserved
3. Response added to `previousResponses` for next agents
4. Next agent sees previous responses and can reference them
5. Consensus computed with appropriate format based on question type

### Question Type Detection
- **Casual Patterns**: Identity questions, recommendations, preferences
- **Technical Patterns**: Implementation, deployment, debugging
- **Identity Questions**: Special handling with Scorpion context

## Files Modified

1. `apps/scorpion/lib/chat/council.ts`
   - Enhanced `isCasualQuestion()` function
   - Added `previousResponses` tracking
   - Added Scorpion context for identity questions
   - Updated prompts for identity vs recommendation questions
   - Completely rewrote consensus computation for identity questions
   - Enhanced text cleaning

2. `apps/scorpion/app/api/council/route.ts`
   - Increased token limits (500-800)
   - Increased temperature slightly (0.3-0.5)

3. `apps/scorpion/app/(scorpion)/council/page.tsx`
   - Enhanced UI for agent recognition
   - Preserved full response text
   - Improved visual hierarchy

## Testing Recommendations

1. **Identity Questions**: Test with "who is scorpion to yall" - should show collective understanding
2. **Recommendation Questions**: Test with "movie: matrix or terminator" - should show recommendation
3. **Agent Communication**: Verify agents reference each other's responses
4. **Full Text**: Ensure no truncation in responses or consensus
5. **Consensus Format**: Verify correct format for each question type

## Future Improvements

1. Consider adding agent avatars/icons for better visual recognition
2. Add ability to expand/collapse agent responses
3. Consider adding timestamps to agent responses
4. Add ability to re-run council with same question
5. Consider adding agent "personality scores" or "agreement indicators"

## Notes

- All changes maintain backward compatibility
- No breaking changes to API contracts
- UI improvements are progressive enhancements
- Consensus format adapts automatically based on question type

---

**Date**: January 27, 2025
**Status**: ✅ Complete and Tested
**Impact**: Major improvements to user experience and response quality

