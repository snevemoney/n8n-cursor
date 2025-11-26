# llama.cpp Integration Guide

This guide explains how to set up and use llama.cpp with Scorpion.

## Overview

llama.cpp is now integrated as a first-class LLM provider in Scorpion, alongside Ollama, VLLM, and OpenAI. It offers:

- **Concurrent request handling**: Unlike Ollama's single-request model, llama.cpp can handle multiple parallel requests
- **Web UI**: Built-in web interface for model experimentation
- **GGUF format**: Efficient quantized model format
- **Cross-platform**: Works on Mac, Linux, and Windows

## Prerequisites

1. **Build llama.cpp from source** (recommended for latest features):

```bash
cd ~/code
git clone https://github.com/ggerganov/llama.cpp.git
cd llama.cpp
cmake -B build
cmake --build build -j8  # Adjust -j8 based on your CPU cores
```

2. **Download a GGUF model** from Hugging Face (e.g., from [GGML organization](https://huggingface.co/ggml-org)):

```bash
# Example: Download a small model for testing
# Visit https://huggingface.co/ggml-org/Qwen2.5-0.5B-Instruct-GGUF
# Download the Q4_K_M quantized version (~2.5GB)
```

## Configuration

### Environment Variables

Add these to your `.env.local` file:

```bash
# Enable llama.cpp
LLAMACPP_ENABLED=true

# Base URL (default: http://localhost:8033)
LLAMACPP_BASE_URL=http://localhost:8033

# Optional: Model name if using multi-model support
LLAMACPP_MODEL=

# Update provider priority to include llamacpp
LLM_PROVIDER_PRIORITY=ollama,llamacpp,vllm,openai
```

### Starting the llama.cpp Server

From the `build/bin` directory:

```bash
cd ~/code/llama.cpp/build/bin

# Option 1: Using Hugging Face model identifier
./llama-server --hf-repo ggml-org/Qwen2.5-0.5B-Instruct-GGUF:Q4_K_M --port 8033 --ctx-size 4096

# Option 2: Using local GGUF file
./llama-server --model /path/to/model.gguf --port 8033 --ctx-size 4096
```

The server will:
- Download the model if using `--hf-repo` (first time only)
- Start on `http://localhost:8033`
- Serve both the Web UI and API

## Usage

### In Scorpion Chat

llama.cpp is automatically available in the provider fallback chain. When you send a message:

1. Scorpion tries providers in priority order: `ollama → llamacpp → vllm → openai`
2. If llama.cpp is enabled and healthy, it will be used if earlier providers fail
3. You can also explicitly select llama.cpp as the provider

### Web UI Access

1. **Via Tool**: Use the `llamacpp.webui` tool in chat to get the URL
2. **Direct Access**: Open `http://localhost:8033` in your browser
3. **Features**:
   - Interactive chat interface
   - Model settings (temperature, context length)
   - Token statistics and performance metrics
   - Reasoning/thinking visualization (for thinking models)
   - Context usage monitoring

### API Endpoints

llama.cpp Web UI exposes OpenAI-compatible endpoints:

- **Chat**: `POST /v1/chat/completions` or `POST /api/chat`
- **Health**: `GET /health` or `GET /`

## Concurrency Benefits

Unlike Ollama, llama.cpp can handle multiple concurrent requests:

```bash
# Test concurrency: Open multiple browser tabs to http://localhost:8033
# Send requests simultaneously - they'll process in parallel!
```

This is especially useful for:
- **Multi-agent workflows**: Multiple agents can query the model simultaneously
- **Parallel research**: Multiple research queries at once
- **High-throughput scenarios**: Better total tokens/second when handling multiple users

## Model Recommendations

For **8GB RAM systems** (like MacBook M3):
- **Qwen2.5-0.5B Q4_K_M**: ~2.5GB, fast, good for testing
- **Llama 3.2 3B Q4_K_M**: ~2GB, better quality
- **Phi-3 Mini Q4_K_M**: ~2.3GB, excellent for coding

For **16GB+ systems**:
- **Qwen2.5-7B Q4_K_M**: ~4.5GB, excellent quality
- **Llama 3.1 8B Q4_K_M**: ~5GB, great for general tasks
- **Mistral 7B Q4_K_M**: ~4.5GB, strong performance

## Troubleshooting

### Server won't start

```bash
# Check if port 8033 is available
lsof -i :8033

# Try a different port
./llama-server --model model.gguf --port 8034
# Then update LLAMACPP_BASE_URL=http://localhost:8034
```

### Model not found

```bash
# Verify model file exists
ls -lh /path/to/model.gguf

# Check model format (must be GGUF)
file model.gguf
```

### Health check fails

```bash
# Test health endpoint manually
curl http://localhost:8033/health

# Check server logs for errors
# Look for error messages in terminal where you started llama-server
```

### Concurrency not working

- Ensure you're using the latest llama.cpp (Web UI feature is recent)
- Check that you're using the Web UI server (`llama-server`), not just `llama-cli`
- Verify multiple requests are actually being sent (check browser network tab)

## Comparison: Ollama vs llama.cpp

| Feature | Ollama | llama.cpp |
|---------|--------|-----------|
| **Installation** | Easy (brew install) | Build from source |
| **Concurrency** | Single request | Multiple parallel |
| **Web UI** | Basic | Advanced (metrics, reasoning) |
| **Model Format** | Own format | GGUF |
| **Performance** | Good | Excellent (better optimization) |
| **Use Case** | Quick setup, single user | Production, multi-user/agent |

## Next Steps

1. **Test locally**: Start with a small model on your MacBook
2. **Experiment with concurrency**: Open multiple chat tabs
3. **Compare performance**: Test same prompts with Ollama vs llama.cpp
4. **Deploy to KVM2**: Once comfortable, deploy llama.cpp server on your remote server

## Related Files

- Health check: `apps/scorpion/lib/utils/llamacpp-health.ts`
- Model runner: `apps/scorpion/lib/chat/modelRunner.ts`
- Config: `apps/scorpion/lib/config/llm-config.ts`
- Tool: `apps/scorpion/lib/chat/tools/llamacpp-webui.ts`

