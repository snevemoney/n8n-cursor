# ✅ Scorpion Model Setup - Complete

**Date:** November 13, 2025  
**Status:** ✅ **COMPLETE** (Local) | ⚠️ **Remote Pending**

---

## 🎯 What Was Done

### 1. **Default Model Changed to `scorpion:latest`** ✅

Your personal training AI (`scorpion:latest`) is now the default model for all Scorpion conversations.

**Files Updated:**
- `apps/scorpion/lib/utils/modelSelector.ts` - Returns `scorpion:latest` by default
- `apps/scorpion/lib/chat/modelRunner.ts` - Uses `scorpion:latest` as default
- `apps/scorpion/app/api/chat/stream/route.ts` - Both model selection points prefer `scorpion:latest`

### 2. **Timeout Fix for Remote Servers** ✅

Increased timeout from 30 seconds to 2 minutes for remote LLM servers (CPU-only inference is slower).

**File Updated:**
- `apps/scorpion/lib/chat/modelRunner.ts` - Auto-detects remote servers and uses longer timeout

### 3. **Local Setup Verified** ✅

- ✅ Local Ollama is running
- ✅ `scorpion:latest` model is available locally (~1GB, Q4_K_M quantization)
- ✅ Scorpion health endpoint reports Ollama is UP

---

## 📋 Current Configuration

**Environment:**
- `OLLAMA_URL=https://llm.n8ncloud.tech` (remote server)
- Default model: `scorpion:latest`

**Model Details:**
- **Name:** `scorpion:latest`
- **Size:** ~1GB
- **Quantization:** Q4_K_M (3.2B parameters)
- **Status:** ✅ Available locally | ⚠️ Not yet on remote

---

## 🚀 Next Steps (Remote Server)

To complete the setup for remote usage, pull the model on your KVM2 server:

### Option 1: Browser Terminal (Recommended)

1. Open Hostinger VPS control panel
2. Go to **Browser Terminal**
3. Run this command:

```bash
docker exec ollama ollama pull scorpion:latest
```

This will:
- Pull the `scorpion:latest` model (~1GB download)
- Make it available at `https://llm.n8ncloud.tech`
- Take a few minutes to complete

### Option 2: Use Local Ollama (Faster)

If you want faster responses, switch back to local Ollama:

```bash
# In apps/scorpion/.env.local
OLLAMA_URL=http://localhost:11434
```

Then restart Scorpion:
```bash
pnpm dev
```

---

## ✅ Verification

After pulling the model on the remote server, verify it works:

```bash
# Check remote model list
curl -s https://llm.n8ncloud.tech/api/tags | jq -r '.models[].name' | grep scorpion

# Test the model
curl -s -X POST https://llm.n8ncloud.tech/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model":"scorpion:latest","prompt":"Say hi","stream":false}' | jq -r '.response'
```

Or use the verification script:
```bash
./scripts/complete-scorpion-setup.sh
```

---

## 🎯 Summary

✅ **Code Changes Complete:**
- Default model set to `scorpion:latest`
- Timeout increased for remote servers
- All model selection points updated

✅ **Local Setup Complete:**
- `scorpion:latest` available locally
- Scorpion configured correctly

⚠️ **Remote Setup Pending:**
- Need to pull `scorpion:latest` on KVM2 server
- Command provided above

---

## 📝 Notes

- **Local vs Remote:** Local Ollama is faster (M3 MacBook > CPU-only VPS), but remote is good for offloading and concurrent tests
- **Model Size:** `scorpion:latest` is ~1GB, suitable for 8GB+ systems
- **Timeout:** Remote servers now have 2-minute timeout (was 30 seconds) to handle slower CPU inference

---

**🎉 Your personal training AI (`scorpion:latest`) is now the default model!**












