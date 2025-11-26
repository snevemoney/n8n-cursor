# Frontier Model Approach - Tool Access

## Philosophy Change

**Before**: Strict intent-based tool gating (like a restricted system)
- `general_question` → only kb.search, research.run
- `project_help` → full access
- `system_debug` → full access

**After**: Frontier model approach (like GPT-4/Claude)
- All intents (except identity/small_talk) → **ALL TOOLS AVAILABLE**
- Model decides which tools to use based on the task
- More flexible, more capable, more intelligent

## Changes Made

### 1. `getToolsForIntent()` - Now Returns Empty Array for "All Tools"

**Before**:
```typescript
case 'general_question':
  return ['kb.search', 'research.run', 'research.start'];
```

**After**:
```typescript
case 'general_question':
case 'project_help':
case 'system_debug':
default:
  return []; // Empty = all tools available (frontier model approach)
```

### 2. `isToolAllowedForIntent()` - Only Blocks Identity/Small Talk

**Before**:
- Checked if tool was in allowed list
- Blocked tools not in list

**After**:
- Only blocks for `identity` and `small_talk`
- All other intents: **allow all tools**

### 3. Tool List Generation - Handles "All Tools"

**Before**:
- Only showed tools in allowed list
- Limited tool descriptions

**After**:
- Detects when `allowedTools.length === 0` (all tools)
- Shows ALL tools from registry
- Tells model: "You have access to ALL tools. Use them intelligently."

## Benefits

1. **More Capable**: Like GPT-4/Claude, Scorpion can use any tool when appropriate
2. **More Flexible**: No artificial restrictions
3. **More Intelligent**: Model decides tool selection, not hard rules
4. **Tool Testing**: Works naturally - all tools available for testing

## Exceptions

Only two intents still block tools:
- **`identity`**: No tools (answer directly as Scorpion)
- **`small_talk`**: No tools (conversational only)

## Tool Testing

Tool testing requests now:
- Don't need special intent classification
- Get all tools automatically
- Work with any intent (except identity/small_talk)

## Example

**Before**:
- User: "Research Bitcoin news"
- Intent: `general_question`
- Available tools: `['kb.search', 'research.run']`
- Model: Can only use these 2 tools

**After**:
- User: "Research Bitcoin news"
- Intent: `general_question`
- Available tools: **ALL TOOLS** (empty array = all tools)
- Model: Can use any tool, intelligently chooses `research.run`

## Migration Notes

- Old code that checked `getToolsForIntent()` length will now see `0` for most intents
- This is intentional - `0` means "all tools"
- Route handler detects this and provides all tools from registry









