# 🦂 Scorpion 8GB Laptop Upgrade Guide

This document describes the upgrades made to optimize Scorpion for systems with 8GB RAM or less, based on insights from Ollama quantization and model size testing.

## Overview

Scorpion now automatically detects systems with 8GB RAM and applies aggressive optimizations to ensure smooth operation on constrained hardware.

## Key Upgrades

### 1. **Smart Model Selection** ✅

Scorpion now automatically selects the best model based on available RAM:

- **8GB or less**: `llama3.2:1b-instruct-q4_K_M` (~700MB)
- **8-16GB**: `llama3.2:3b-instruct-q4_K_M` (~2GB)
- **16GB+**: `llama3.2:3b` (~2.4GB unquantized)

**Implementation**: `apps/scorpion/lib/utils/modelSelector.ts`

### 2. **Fixed Default Model Fallback** ✅

Previously, Scorpion used `scorpion:latest` as fallback, which may not exist. Now it uses RAM-based recommendations:

- All API endpoints now use `getRecommendedModelForRAM()` as fallback
- Updated files:
  - `lib/chat/modelRunner.ts`
  - `app/api/chat/stream/route.ts`
  - `app/api/council/route.ts`
  - `app/api/research/start/route.ts`
  - `app/api/chat/test/route.ts`
  - `app/api/agents/specialized/route.ts`

### 3. **Lightweight Docker Compose** ✅

Created `infra/docker/docker-compose.lightweight.yml` with aggressive memory limits:

```yaml
scorpion:
  mem_limit: "512m"  # Reduced from 1.5-2GB
  cpus: "1"
  environment:
    - CHAT_LIGHTWEIGHT_MODE=true
    - OLLAMA_MODEL=llama3.2:1b-instruct-q4_K_M
    - NODE_OPTIONS=--max-old-space-size=384
```

**Usage**:
```bash
docker compose -f infra/docker/docker-compose.lightweight.yml up
```

### 4. **Enhanced Lightweight Mode** ✅

Lightweight mode now applies aggressive optimizations:

**Performance Config** (`lib/storage/performance-optimizer.ts`):
- Batch size: 5 → 2
- Concurrency: 3 → 1
- Cache TTL: 30min → 10min (multiplier: 1 → 0.5)
- Prefetch: Disabled
- File watcher debounce: 2000ms → 5000ms

**Chat Config** (`lib/utils/systemResources.ts`):
- RAG context chunks: 5 → 3
- Batch size: 5 → 2
- Concurrency: 3 → 1
- Cache TTL: 30min → 10min

### 5. **Memory-Aware UI** ✅

Added system information panel in Settings page showing:
- System RAM
- Lightweight mode status
- Recommended model for your system
- All model recommendations with size and RAM requirements

**API Endpoint**: `GET /api/system/info`

### 6. **Quantized Model Detection** ✅

Model selector prefers quantized models when available:
- Checks for `-q4_K_M`, `-q4_0`, `-q5_K_M`, `-q8_0` variants
- Falls back to base model if quantized version not found

## Model Recommendations

Based on Ollama testing, here are the recommended models:

| Model | Size | RAM Required | Best For |
|-------|------|--------------|----------|
| `llama3.2:1b-instruct-q4_K_M` | ~700MB | 4GB+ | 8GB systems, fastest inference |
| `llama3.2:3b-instruct-q4_K_M` | ~2GB | 8GB+ | 8-16GB systems, good balance |
| `llama3.2:3b` | ~2.4GB | 16GB+ | 16GB+ systems, better quality |
| `llama3.2:13b-instruct-q4_K_M` | ~7.4GB | 16GB+ | 16GB+ systems, best quality |

## Usage

### Automatic Detection

Scorpion automatically detects 8GB systems and enables lightweight mode. No configuration needed!

### Manual Override

To force lightweight mode:
```bash
export CHAT_LIGHTWEIGHT_MODE=true
```

To use a specific model:
```bash
export OLLAMA_MODEL=llama3.2:1b-instruct-q4_K_M
```

### Docker Usage

For 8GB systems, use the lightweight compose file:
```bash
docker compose -f infra/docker/docker-compose.lightweight.yml up scorpion
```

## Performance Impact

On an 8GB MacBook Air (M2):
- **Before**: Struggled with 13B models, high memory pressure
- **After**: Smooth operation with 1B quantized model, minimal memory pressure

## Monitoring

Check system status in Settings page:
1. Navigate to Settings
2. View "System Information & Model Recommendations" panel
3. See your RAM, lightweight mode status, and recommended models

## Troubleshooting

### High Memory Usage

1. Check lightweight mode is enabled (Settings page)
2. Verify using recommended model (`llama3.2:1b-instruct-q4_K_M` for 8GB)
3. Use lightweight docker-compose config
4. Reduce concurrent operations in settings

### Model Not Found

1. Pull the recommended model:
   ```bash
   ollama pull llama3.2:1b-instruct-q4_K_M
   ```
2. Check available models:
   ```bash
   ollama list
   ```

### Still Struggling

1. Close other applications
2. Use smallest model: `llama3.2:1b-instruct-q4_K_M`
3. Reduce max agents in settings
4. Disable RAG indexing if not needed

## Files Changed

- `apps/scorpion/lib/utils/modelSelector.ts` - New model selection logic
- `apps/scorpion/lib/utils/systemResources.ts` - Enhanced lightweight mode
- `apps/scorpion/lib/storage/performance-optimizer.ts` - RAM-aware performance config
- `apps/scorpion/lib/chat/modelRunner.ts` - Updated default model
- `apps/scorpion/app/api/*/route.ts` - Updated all API endpoints
- `apps/scorpion/app/api/system/info/route.ts` - New system info endpoint
- `apps/scorpion/app/(scorpion)/settings/page.tsx` - Added system info panel
- `infra/docker/docker-compose.lightweight.yml` - New lightweight config

## References

Based on Ollama testing insights:
- Quantized models are 4x smaller than unquantized
- 8B quantized (~2GB) works well on 8GB systems
- 13B quantized (~7.4GB) needs 16GB+ RAM
- Smaller models are faster but lower quality
- Quantization significantly improves memory efficiency

