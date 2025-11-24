#!/usr/bin/env bash

# Remote LLM Setup via Hostinger API
# Generates safe setup script for browser terminal (no SSH needed)
# 
# Usage:
#   ./scripts/setup-remote-llm-hostinger-api.sh

set -euo pipefail

# Configuration
HOSTINGER_API_TOKEN="Gx0BB3W2T4U9kzCiYLKPGPNhauVbxWFym2c5Ibh6894f797c"
VPS_ID="765579"  # Your VPS ID
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

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
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

# Check VPS status
check_vps_status() {
    print_status "Checking VPS status via Hostinger API..."
    
    local vps_data=$(api_call "GET" "/vps/$VPS_ID")
    
    if [ $? -ne 0 ] || [ -z "$vps_data" ]; then
        print_error "Failed to get VPS status. Check API token and VPS ID."
        return 1
    fi
    
    local state=$(echo "$vps_data" | jq -r '.state // .status // "unknown"' 2>/dev/null || echo "unknown")
    local hostname=$(echo "$vps_data" | jq -r '.hostname // "unknown"' 2>/dev/null || echo "unknown")
    local ip=$(echo "$vps_data" | jq -r '.ipv4[0].address // .ip // "unknown"' 2>/dev/null || echo "unknown")
    
    echo "VPS Details:"
    echo "  State: $state"
    echo "  Hostname: $hostname"
    echo "  IP: $ip"
    echo ""
    
    if [ "$state" = "running" ] || [ "$state" = "active" ]; then
        print_success "VPS is running and ready"
        return 0
    else
        print_warning "VPS state: $state (may still work)"
        return 0
    fi
}

# Generate safe setup script
generate_setup_script() {
    cat << 'SETUP_SCRIPT'
#!/bin/bash
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
  echo ""
  echo "Available models:"
  curl -s http://127.0.0.1:11434/api/tags | jq -r '.models[]?.name // empty' 2>/dev/null | head -5 | sed 's/^/  - /' || echo "  (none yet - pull a model with: docker exec -it ollama ollama pull llama3.2:1b)"
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
SETUP_SCRIPT
}

# Main function
main() {
    echo "🛡️  Remote LLM Setup via Hostinger API"
    echo "======================================="
    echo ""
    
    # Check VPS status
    if ! check_vps_status; then
        print_error "Cannot proceed without VPS access"
        exit 1
    fi
    
    echo ""
    print_status "VPS is ready! Here's the safe setup script:"
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
    
    generate_setup_script
    
    echo "----------------------------------------"
    echo ""
    print_success "Script generated!"
    echo ""
    echo "📋 Next steps:"
    echo "  1. Open Hostinger browser terminal"
    echo "  2. Copy and paste the script above"
    echo "  3. Press Enter to run"
    echo "  4. Wait for completion"
    echo "  5. Configure Caddy (add llm.n8ncloud.tech block)"
    echo ""
    echo "🔗 VPS Dashboard: https://hpanel.hostinger.com/vps/$VPS_ID"
    echo "🔗 API Documentation: https://developers.hostinger.com/"
}

main

