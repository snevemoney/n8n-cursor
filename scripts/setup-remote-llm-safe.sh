#!/usr/bin/env bash

# Safe Remote LLM Setup Script
# This script helps set up Ollama on KVM2 without touching n8n
# 
# Usage: Run this on your KVM2 server (after SSH'ing in)
#   cd ~/n8n-cursor  # or wherever your repo is
#   ./scripts/setup-remote-llm-safe.sh

set -euo pipefail

echo "=== Remote LLM Safe Setup ==="
echo "This script will NOT touch n8n or its database."
echo ""

# ---- 1. Identify protected containers (read-only) ----
echo "[1/5] Checking for n8n and database containers (read-only)..."
echo ""

docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'

echo ""
echo "Protected containers (DO NOT TOUCH):"

PROTECTED=$(docker ps --format '{{.Names}}' | grep -Ei 'n8n|postgres|db' || true)
if [ -n "$PROTECTED" ]; then
  echo "$PROTECTED" | sed 's/^/  - /'
else
  echo "  None detected with names containing n8n/postgres/db."
fi
echo ""

# ---- 2. Check Docker availability ----
if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: Docker is not installed or not in PATH."
  exit 1
fi

echo "[2/5] Docker is available: $(docker --version)"
echo ""

# ---- 3. Create or reuse Ollama container ----
echo "[3/5] Checking for existing 'ollama' container..."

if docker ps -a --format '{{.Names}}' | grep -wq 'ollama'; then
  echo "Found existing 'ollama' container. Not creating a new one."
  if ! docker ps --format '{{.Names}}' | grep -wq 'ollama'; then
    echo "Container exists but is stopped. Starting it..."
    docker start ollama
  fi
else
  echo "No 'ollama' container found. Creating a new one safely..."
  docker run -d \
    --name ollama \
    -p 127.0.0.1:11434:11434 \
    --restart unless-stopped \
    ollama/ollama
  echo "Started new 'ollama' container."
fi

echo ""
echo "[4/5] Checking if Ollama is running..."

if docker ps --format '{{.Names}}' | grep -wq 'ollama'; then
  docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | grep -w 'ollama' || {
    echo "ERROR: 'ollama' container is not running."
    exit 1
  }
else
  echo "ERROR: 'ollama' container is not running."
  exit 1
fi

# ---- 4. Test local Ollama endpoint ----
echo ""
echo "[5/5] Testing local Ollama endpoint (127.0.0.1:11434)..."

if curl -sS http://127.0.0.1:11434/api/tags >/dev/null; then
  echo "Local Ollama endpoint is reachable."
else
  echo "WARNING: Could not reach local Ollama endpoint."
  echo "Check 'docker logs ollama' for more details."
fi

# ---- 5. DNS & info reminder ----
echo ""
echo "REMINDER: Make sure DNS is configured:"
echo "  llm.n8ncloud.tech -> <KVM2_PUBLIC_IP>"
echo ""
echo "Next steps (manual):"
echo "  1) Add this to your Caddyfile:"
echo "       llm.n8ncloud.tech {"
echo "           reverse_proxy 127.0.0.1:11434"
echo "       }"
echo "  2) Validate: sudo caddy validate --config /etc/caddy/Caddyfile"
echo "  3) Reload:   sudo systemctl reload caddy"
echo ""
echo "Safe setup script finished."

