#!/usr/bin/env bash

# Remote LLM Verification via Hostinger API
# Generates verification script for browser terminal
# 
# Usage:
#   ./scripts/verify-remote-llm-hostinger-api.sh

set -euo pipefail

# Configuration
HOSTINGER_API_TOKEN="Gx0BB3W2T4U9kzCiYLKPGPNhauVbxWFym2c5Ibh6894f797c"
VPS_ID="765579"
SERVER_IP="69.62.66.78"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# Function to make API calls
api_call() {
    local method="$1"
    local endpoint="$2"
    local data="${3:-}"
    
    if [ -n "$data" ]; then
        curl -s -X "$method" \
            -H "Authorization: Bearer $HOSTINGER_API_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "https://developers.hostinger.com/api/vps/v1$endpoint"
    else
        curl -s -X "$method" \
            -H "Authorization: Bearer $HOSTINGER_API_TOKEN" \
            -H "Content-Type: application/json" \
            "https://developers.hostinger.com/api/vps/v1$endpoint"
    fi
}

# Generate verification script
generate_verify_script() {
    cat << 'VERIFY_SCRIPT'
#!/bin/bash
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
  echo ""
  echo "Available models:"
  curl -s http://127.0.0.1:11434/api/tags | jq -r '.models[]?.name // empty' 2>/dev/null | head -5 | sed 's/^/  - /' || echo "  (none yet)"
else
  echo "WARNING: Could not reach local Ollama endpoint on 127.0.0.1:11434."
fi
echo ""

# ---- 4. Test public endpoint ----
REMOTE_DOMAIN="${1-llm.n8ncloud.tech}"

echo "[4/5] Testing public endpoint: https://${REMOTE_DOMAIN}/api/tags ..."

if curl -sS "https://${REMOTE_DOMAIN}/api/tags" >/dev/null; then
  echo "Public LLM endpoint is reachable at https://${REMOTE_DOMAIN}/api/tags"
else
  echo "WARNING: Could not reach public endpoint https://${REMOTE_DOMAIN}/api/tags"
  echo "Check DNS, Caddy config, and firewall."
fi
echo ""

# ---- 5. Check Caddyfile ----
echo "[5/5] Checking Caddyfile configuration..."
CADDYFILE="/etc/caddy/Caddyfile"

if [ -f "$CADDYFILE" ]; then
  if grep -q "llm.n8ncloud.tech" "$CADDYFILE"; then
    echo "✅ llm.n8ncloud.tech block found in Caddyfile"
    
    # Validate Caddyfile
    if sudo caddy validate --config "$CADDYFILE" 2>&1 | grep -q "Valid configuration"; then
      echo "✅ Caddyfile is valid"
    else
      echo "⚠️  Caddyfile validation failed:"
      sudo caddy validate --config "$CADDYFILE" 2>&1 | sed 's/^/      /'
    fi
  else
    echo "⚠️  llm.n8ncloud.tech block not found in Caddyfile"
    echo "   Add this to Caddyfile:"
    echo "      llm.n8ncloud.tech {"
    echo "          reverse_proxy 127.0.0.1:11434"
    echo "      }"
  fi
else
  echo "⚠️  Caddyfile not found at $CADDYFILE"
fi

echo ""
echo "Summary:"
echo " - n8n/DB containers were only READ (not edited)."
echo " - Ollama container status checked."
echo " - Local and public LLM endpoints tested."
echo ""
echo "For deeper debugging:"
echo "  docker logs ollama --tail 100"
echo "  sudo caddy validate --config /etc/caddy/Caddyfile"
echo ""
echo "Safe verification complete."
VERIFY_SCRIPT
}

# Main function
main() {
    echo "🔍 Remote LLM Verification via Hostinger API"
    echo "============================================="
    echo ""
    
    print_status "Here's the verification script for browser terminal:"
    echo ""
    echo "=========================================="
    echo "COPY THE FOLLOWING INTO BROWSER TERMINAL:"
    echo "=========================================="
    echo ""
    echo "Go to: https://hpanel.hostinger.com/vps/$VPS_ID"
    echo "Click: 'Browser terminal'"
    echo ""
    echo "Then paste this script:"
    echo ""
    echo "----------------------------------------"
    
    generate_verify_script
    
    echo "----------------------------------------"
    echo ""
    print_success "Verification script generated!"
    echo ""
    echo "🔗 VPS Dashboard: https://hpanel.hostinger.com/vps/$VPS_ID"
}

main

