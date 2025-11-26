#!/usr/bin/env bash

# Safe Setup Verification Script
# Verifies remote LLM setup without touching n8n
# 
# Usage: Run this on your KVM2 server (after SSH'ing in)
#   cd ~/n8n-cursor  # or wherever your repo is
#   ./scripts/verify-setup-safe.sh [domain]
#   ./scripts/verify-setup-safe.sh llm.n8ncloud.tech

set -euo pipefail

echo "=== Remote LLM Safe Verification ==="
echo "Read-only checks (no modifications will be made)."
echo ""

# ---- 1. Show protected containers ----
echo "[1/5] Listing containers related to n8n and DB (read-only)..."
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}' | grep -Ei 'n8n|postgres|db' || {
  echo "No running containers matching n8n/postgres/db."
}
echo ""

# ---- 2. Check Ollama container ----
echo "[2/5] Checking 'ollama' container status..."

if docker ps -a --format '{{.Names}}' | grep -wq 'ollama'; then
  docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | grep -w 'ollama' || {
    echo "WARNING: 'ollama' container exists but is not running."
  }
else
  echo "WARNING: 'ollama' container does not exist."
fi
echo ""

# ---- 3. Test local Ollama endpoint ----
echo "[3/5] Testing local Ollama endpoint: http://127.0.0.1:11434/api/tags ..."

if curl -sS http://127.0.0.1:11434/api/tags >/dev/null; then
  echo "Local Ollama endpoint is reachable."
else
  echo "WARNING: Could not reach local Ollama endpoint on 127.0.0.1:11434."
fi
echo ""

# ---- 4. Test public endpoint (if domain provided) ----
REMOTE_DOMAIN="${1-llm.n8ncloud.tech}"

echo "[4/5] Testing public endpoint: https://${REMOTE_DOMAIN}/api/tags ..."

if curl -sS "https://${REMOTE_DOMAIN}/api/tags" >/dev/null; then
  echo "Public LLM endpoint is reachable at https://${REMOTE_DOMAIN}/api/tags"
else
  echo "WARNING: Could not reach public endpoint https://${REMOTE_DOMAIN}/api/tags"
  echo "Check DNS, Caddy config, and firewall."
fi
echo ""

# ---- 5. Summary ----
echo "[5/5] Summary:"
echo " - n8n/DB containers were only READ (not edited)."
echo " - Ollama container status checked."
echo " - Local and public LLM endpoints tested."
echo ""
echo "For deeper debugging:"
echo "  docker logs ollama --tail 100"
echo "  sudo caddy validate --config /etc/caddy/Caddyfile"
echo ""
echo "Safe verification complete."

