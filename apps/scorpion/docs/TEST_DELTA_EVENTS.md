# Test Delta Events - Manual Testing Guide

## Summary of Fixes Applied

### 1. Modified `safeSend` Function (lines 230-277)
- **Change**: Delta and done events are now sent even if stream is aborted
- **Why**: Client was aborting streams early, preventing delta events from being sent
- **Impact**: Messages should render even if client disconnects early

### 2. Enhanced Summarizer Abort Handling (lines 6215-6248)
- **Change**: Added guards to check if stream is aborted before/during summarizer execution
- **Why**: Streams were being aborted before summarizer could complete
- **Impact**: Provides fallback summary if stream is aborted

### 3. Enhanced Delta Streaming Loop (lines 6800-6831)
- **Change**: Removed `checkAbort()` that throws, added bounded loop, added try-catch
- **Why**: `checkAbort()` was stopping delta streaming prematurely
- **Impact**: Delta chunks continue to be sent even if stream is aborted

## Manual Testing Steps

### Step 1: Send a Test Message
1. Navigate to `http://localhost:3003/chat`
2. Type a simple message like "test delta events" or "hello"
3. Click "Send message"
4. Wait for the stream to complete (watch the "Stop message generation" button)

### Step 2: Check Server Logs
Open a terminal and run:
```bash
tail -f /private/tmp/scorpion-server.log | grep -E "\[Chat Stream\].*delta|\[Chat Stream\].*Starting to stream|\[Chat Stream\].*Finished streaming|\[Chat Stream\].*Summarizer"
```

**Expected logs:**
- `[Chat Stream] Calling orchestrator.runSummarizer` - Summarizer started
- `[Chat Stream] Summarizer completed. Summary length: X` - Summarizer finished
- `[Chat Stream] Starting to stream final answer` - Streaming started
- `[Chat Stream] Sending delta event. Content length: X, preview: ...` - Delta events being sent
- `[Chat Stream] Delta event enqueued successfully` - Delta events enqueued
- `[Chat Stream] Finished streaming final answer. Total delta chunks sent: X` - Streaming completed

### Step 3: Check Browser Console
Open Chrome DevTools (F12) → Console tab

**Expected logs:**
- `[useChatStream] Attempting to fetch /api/chat/stream`
- `[useChatStream] Fetch response received`
- `[Chat Stream] Event received: status`
- `[Chat Stream] Event received: connected`
- `[Chat Stream] Event received: delta` ← **This is the key one**
- `[Chat Stream] Delta received, assistantContent length: X`
- `[Chat Stream] Stream ended. assistantContent length: X`

### Step 4: Verify UI
1. Check if messages appear in the chat interface
2. Check if assistant message content is visible
3. Check if right panel tabs (plan, council, tool, knowledge) show content

## Troubleshooting

### If no delta events in server logs:
- Check if summarizer is being called: Look for `[Chat Stream] Calling orchestrator.runSummarizer`
- Check if stream is aborted early: Look for `[Chat Stream] Client disconnected, aborting stream`
- Check if summarizer completes: Look for `[Chat Stream] Summarizer completed`

### If delta events in server logs but not in browser:
- Check browser console for errors
- Check Network tab → `/api/chat/stream` → Response tab for raw SSE data
- Verify client-side parsing is working: Look for `[Chat Stream] Event received: delta`

### If messages don't render:
- Check if `assistantContent` is being accumulated: Look for `[Chat Stream] Delta received, assistantContent length: X`
- Check if `done` event is received: Look for `[Chat Stream] Event received: done`
- Check if message is saved: Look for `[Chat Stream] Stream ended` with non-zero `assistantContent length`

## Files Modified

1. `apps/scorpion/app/api/chat/stream/route.ts`
   - Lines 230-277: Modified `safeSend` to allow delta/done events even when aborted
   - Lines 6215-6248: Enhanced summarizer abort handling
   - Lines 6800-6831: Enhanced delta streaming loop

2. `apps/scorpion/app/(scorpion)/chat/hooks/useChatStream.ts`
   - Already has comprehensive logging (no changes needed)

## Server Log Location
`/private/tmp/scorpion-server.log`

## Next Steps After Testing

1. If delta events appear in server logs but not browser → Check client-side parsing
2. If summarizer never completes → Check LLM connection/timeout
3. If stream aborts very early → Check client-side timeout or component unmounting
4. If messages render → Success! The fixes are working.

