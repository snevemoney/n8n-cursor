# Hybrid AI Compute Stack Guide

Scorpion now supports a progressive enhancement approach to the AI compute stack, allowing you to start simple and scale up as needed.

## Overview

The hybrid approach provides three layers of capability:

1. **Training & Inference Layer**: Ollama (default) → llama.cpp (optional, concurrent) → VLLM (optional GPU) → OpenAI (optional cloud)
2. **Distributed Computing Layer**: Ray (planned for future)
3. **Cluster Orchestration Layer**: Docker Compose (default) → Kubernetes (optional)

## Current Setup (Default)

By default, Scorpion uses:
- **Ollama** for local CPU inference
- **Docker Compose** for orchestration
- **No GPU required**
- **Zero configuration needed**

This works perfectly for:
- Local development
- Single-user systems
- Small to medium workloads
- Budget-conscious deployments

## Progressive Enhancement

### Phase 1: Add llama.cpp (Concurrent Local Inference)

**When to use:**
- You need concurrent request handling (multiple agents/users)
- You want better performance than Ollama
- You want a Web UI for model experimentation
- You're running multi-agent workflows

**Setup:**

1. **Build llama.cpp from source:**
   ```bash
   cd ~/code
   git clone https://github.com/ggerganov/llama.cpp.git
   cd llama.cpp
   cmake -B build
   cmake --build build -j8
   ```

2. **Start llama.cpp server:**
   ```bash
   cd build/bin
   ./llama-server --hf-repo ggml-org/Qwen2.5-0.5B-Instruct-GGUF:Q4_K_M --port 8033
   ```

3. **Configure Scorpion:**
   ```bash
   export LLAMACPP_ENABLED=true
   export LLAMACPP_BASE_URL=http://localhost:8033
   export LLM_PROVIDER_PRIORITY=ollama,llamacpp,vllm,openai
   ```

See `docs/LLAMACPP_SETUP.md` for detailed setup instructions.

### Phase 2: Add VLLM (GPU Inference)

**When to use:**
- You have a GPU available
- You need faster inference
- You want to run larger models (7B+)
- You're serving production traffic

**Setup:**

1. **Docker Compose (Recommended for local):**
   ```bash
   # Start VLLM with GPU
   docker compose --profile gpu up vllm
   
   # Configure Scorpion
   export VLLM_ENABLED=true
   export VLLM_API_URL=http://localhost:8000
   export VLLM_MODEL=mistralai/Mistral-7B-Instruct-v0.2
   export LLM_PROVIDER_PRIORITY=ollama,llamacpp,vllm,openai
   ```

2. **Kubernetes (Production):**
   ```bash
   kubectl apply -f infra/k8s/vllm-deployment.yaml
   kubectl apply -f infra/k8s/scorpion-deployment.yaml
   ```

**Benefits:**
- 10-100x faster inference than CPU
- Can run larger models
- Better throughput for concurrent requests
- Production-ready performance

**Cost:**
- GPU instance: ~$0.50-$5/hour depending on GPU type
- Still falls back to Ollama if GPU unavailable

### Phase 2: Add Kubernetes (Production Orchestration)

**When to use:**
- You need high availability
- You want auto-scaling
- You're deploying to production
- You need multi-cloud support

**Setup:**
```bash
# Deploy to Kubernetes
kubectl apply -f infra/k8s/scorpion-deployment.yaml

# With VLLM
kubectl apply -f infra/k8s/vllm-deployment.yaml
```

**Benefits:**
- Auto-scaling based on demand
- High availability with multiple replicas
- Resource management and isolation
- Multi-cloud deployment (AWS, GCP, Azure)

**Cost:**
- Managed Kubernetes: ~$50-200/month
- Plus GPU nodes if using VLLM

### Phase 3: Add Ray (Distributed Computing - Future)

**When to use:**
- You need distributed training
- You're processing large batches
- You need to scale across multiple machines
- You're running complex AI pipelines

**Status:** Planned for future release

## Provider Selection Logic

Scorpion automatically selects providers using this logic:

1. **Check Priority Order**: Uses `LLM_PROVIDER_PRIORITY` or default: `ollama,vllm,openai`
2. **Health Checks**: Verifies each provider is available and healthy
3. **Cascading Fallback**: Tries providers in order until one succeeds
4. **Smart Selection**: Uses `providerSelector.ts` for optimal choice

### Example Scenarios

**Scenario 1: Local Development (Default)**
```
Priority: ollama,vllm,openai
Available: ollama ✓
Result: Uses Ollama
```

**Scenario 2: GPU Available**
```
Priority: ollama,vllm,openai
Available: ollama ✓, vllm ✓
Result: Uses Ollama (first in priority)
```

**Scenario 3: Ollama Down, VLLM Available**
```
Priority: ollama,vllm,openai
Available: ollama ✗, vllm ✓
Result: Falls back to VLLM
```

**Scenario 4: All Local Down, OpenAI Available**
```
Priority: ollama,vllm,openai
Available: ollama ✗, vllm ✗, openai ✓
Result: Falls back to OpenAI
```

## Configuration Examples

### Local Development (Default)
```bash
# No configuration needed - uses Ollama by default
pnpm dev
```

### With VLLM (GPU)
```bash
# .env.local
VLLM_ENABLED=true
VLLM_API_URL=http://localhost:8000
VLLM_MODEL=mistralai/Mistral-7B-Instruct-v0.2
LLM_PROVIDER_PRIORITY=ollama,vllm,openai
```

### Production (Kubernetes + VLLM)
```yaml
# Kubernetes ConfigMap
env:
  - name: VLLM_ENABLED
    value: "true"
  - name: VLLM_API_URL
    value: "http://vllm-service:8000"
  - name: LLM_PROVIDER_PRIORITY
    value: "vllm,ollama,openai"  # Prefer VLLM in production
```

### Cloud-Only (No Local)
```bash
# .env.production
LLM_PROVIDER_PRIORITY=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

## Testing Provider Selection

Check which provider is being used:

```typescript
import { getProviderStatus } from '@/lib/utils/providerSelector';

const status = await getProviderStatus();
console.log('Selected provider:', status.selected);
console.log('All providers:', status.all);
console.log('Recommendation:', status.recommendation);
```

## Migration Path

### From Current Setup to VLLM

1. **Keep current setup working** ✓ (no changes needed)
2. **Add VLLM service** (optional, opt-in)
3. **Enable VLLM in environment** (set `VLLM_ENABLED=true`)
4. **Test fallback chain** (verify Ollama → VLLM → OpenAI works)
5. **Monitor performance** (compare Ollama vs VLLM)

### From Docker Compose to Kubernetes

1. **Keep Docker Compose for local dev** ✓
2. **Create Kubernetes manifests** ✓ (already done)
3. **Deploy to K8s cluster** (production only)
4. **Test in staging first**
5. **Gradually migrate workloads**

## Troubleshooting

### VLLM Not Available

```bash
# Check VLLM health
curl http://localhost:8000/health

# Check if GPU is available
docker run --rm --gpus all nvidia/cuda:11.0.3-base-ubuntu20.04 nvidia-smi

# Check VLLM logs
docker compose logs vllm
```

### Provider Selection Issues

```bash
# Check provider status
node -e "import('./apps/scorpion/lib/utils/providerSelector.js').then(m => m.getProviderStatus().then(console.log))"

# Force specific provider
export LLM_PROVIDER_PRIORITY=ollama  # Only use Ollama
```

### Kubernetes Deployment Issues

```bash
# Check pod status
kubectl get pods -l app=scorpion
kubectl get pods -l app=vllm

# Check logs
kubectl logs -f deployment/scorpion
kubectl logs -f deployment/vllm

# Check GPU availability
kubectl describe node <gpu-node> | grep nvidia.com/gpu
```

## Best Practices

1. **Start Simple**: Use default Ollama setup first
2. **Add VLLM When Needed**: Only enable if you have GPU and need performance
3. **Use Kubernetes for Production**: Docker Compose is fine for dev/staging
4. **Monitor Fallback**: Log which provider is being used
5. **Test Fallback Chain**: Verify all providers work before production
6. **Cost Awareness**: GPU instances are expensive - use only when needed

## Cost Comparison

| Setup | Monthly Cost | Use Case |
|-------|-------------|----------|
| Ollama (CPU) | $0-20 | Local dev, small workloads |
| Ollama + VLLM (GPU) | $200-500 | Production, medium workloads |
| Kubernetes + VLLM | $500-2000 | Production, large scale |
| Cloud-Only (OpenAI) | $50-500 | No infrastructure, pay-per-use |

## Next Steps

1. ✅ **VLLM Integration** - Complete
2. ✅ **Kubernetes Manifests** - Complete
3. ⏳ **Ray Integration** - Planned
4. ⏳ **Auto-Scaling** - Planned
5. ⏳ **Multi-Cloud Support** - Planned

