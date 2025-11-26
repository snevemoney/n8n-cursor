# Remote LLM Setup Guide

## Overview

This guide explains how to configure Scorpion to use a remote LLM server on your KVM2 (n8ncloud.tech / lightningflow.online) while keeping the UI running on localhost.

## Architecture

```
┌─────────────────┐
│  UI (localhost) │  Browser → http://localhost:3003
└────────┬────────┘
         │
┌────────▼────────────────────────┐
│  Scorpion Backend (localhost)   │  Node.js orchestrator
│  • Planner                       │
│  • Council                       │
│  • Executor                      │
│  • Summarizer                   │
└────────┬────────────────────────┘
         │
         │ HTTPS
         ▼
┌─────────────────────────────┐
│  Remote LLM (KVM2 Server)   │  https://llm.n8ncloud.tech
│  • Ollama / vLLM            │
│  • OpenAI-compatible API     │
└─────────────────────────────┘
```

## Configuration

### Step 1: Update Environment Variable

Edit `apps/scorpion/.env.local`:

```bash
# Ollama Configuration (Remote KVM2 Server)
OLLAMA_URL=https://llm.n8ncloud.tech
```

Or use lightningflow.online:

```bash
OLLAMA_URL=https://llm.lightningflow.online
```

### Step 2: Verify Configuration

Run the verification script:

```bash
cd apps/scorpion
./scripts/verify-remote-llm.sh
```

### Step 3: Restart Scorpion

```bash
cd apps/scorpion
pnpm dev
```

### Step 4: Test Health Endpoint

```bash
curl http://localhost:3003/api/health | jq
```

You should see:

```json
{
  "services": {
    "ollama": {
      "status": "up",
      "model": "..."
    }
  }
}
```

## Testing

### Single Chat Test

```bash
curl -X POST http://localhost:3003/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Say hi and return a simple plan"}
    ]
  }'
```

### Concurrent Tests

Run multiple tests in parallel:

```bash
cd apps/scorpion
./scripts/test-concurrency.sh 8
```

This will:
- Run 8 concurrent chat requests
- Test different prompts
- Measure latency
- Show event counts

### Using Existing Test Script

```bash
cd apps/scorpion
pnpm test:chat --concurrency=8
```

## Concurrency Limits

Based on KVM2 CPU-only setup:

| Model Size | Safe Concurrent Tests | Max Bursts |
|------------|----------------------|------------|
| 1B–3B      | 10–12                | 15–20      |
| 7B–8B      | 4–5                  | 6–8        |
| 14B CPU    | 1–2                  | 3 (slow)   |

**Recommendation**: Start with 5–8 concurrent tests.

## Troubleshooting

### LLM Not Reachable

1. **Check server is running**:
   ```bash
   curl https://llm.n8ncloud.tech/api/tags
   ```

2. **Check Caddy/reverse proxy**:
   - Verify domain points to KVM2
   - Check SSL certificate
   - Verify port forwarding

3. **Check authentication**:
   - Some setups require API keys
   - Check if basic auth is needed

### Health Check Fails

1. **Verify OLLAMA_URL is set**:
   ```bash
   grep OLLAMA_URL apps/scorpion/.env.local
   ```

2. **Check Scorpion logs**:
   - Look for connection errors
   - Check timeout settings

3. **Test direct connection**:
   ```bash
   curl -v https://llm.n8ncloud.tech/api/tags
   ```

### Slow Responses

1. **Check server load**:
   ```bash
   ssh root@your-kvm2-server
   htop
   ```

2. **Reduce concurrency**:
   - Lower concurrent test count
   - Use smaller models

3. **Check network latency**:
   ```bash
   ping llm.n8ncloud.tech
   ```

## File Locations

| Component | File Location |
|-----------|---------------|
| **Environment Config** | `apps/scorpion/.env.local` |
| **LLM Client** | `apps/scorpion/lib/chat/modelRunner.ts` |
| **Health Check** | `apps/scorpion/app/api/health/route.ts` |
| **Test Script** | `apps/scorpion/scripts/test-concurrency.sh` |
| **Verification Script** | `apps/scorpion/scripts/verify-remote-llm.sh` |

## How It Works

1. **UI stays local**: Browser connects to `http://localhost:3003`
2. **Backend stays local**: Node.js orchestrator runs on your Mac
3. **LLM runs remote**: All LLM calls go to `https://llm.n8ncloud.tech`

### Request Flow

```
User Message
    ↓
POST /api/chat/stream (localhost:3003)
    ↓
ScorpionOrchestrator.handleChat()
    ↓
┌─────────────────────────────────────┐
│ Phase 1: Planner                     │
│   → LLM call to https://llm...       │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Phase 2: Council (if needed)        │
│   → LLM call to https://llm...       │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Phase 3: Executor                    │
│   → Tool calls (local)               │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Phase 4: Summarizer                 │
│   → LLM call to https://llm...       │
└─────────────────────────────────────┘
    ↓
SSE Stream → UI (localhost:3003)
```

## Benefits

✅ **Offloads heavy computation** from your MacBook  
✅ **Enables concurrent testing** without maxing out local resources  
✅ **UI stays responsive** on localhost  
✅ **Easy to switch** between local and remote LLM  

## Next Steps

1. ✅ Configure `OLLAMA_URL` in `.env.local`
2. ✅ Verify setup with `verify-remote-llm.sh`
3. ✅ Restart Scorpion
4. ✅ Test with single chat request
5. ✅ Run concurrent tests (5–8 to start)
6. ✅ Monitor KVM2 server load
7. ✅ Adjust concurrency based on performance

