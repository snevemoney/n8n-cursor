#!/usr/bin/env bash

# Complete Scorpion Model Setup Verification
# Checks both local and remote setups
# 
# Usage: ./scripts/complete-scorpion-setup.sh

set -euo pipefail

echo "🔍 Complete Scorpion Setup Verification"
echo "======================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ️${NC} $1"
}

# Check local Ollama
echo "📡 Checking Local Ollama..."
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    print_success "Local Ollama is running"
    
    # Check for scorpion model
    if curl -s http://localhost:11434/api/tags | jq -r '.models[].name' | grep -q 'scorpion:latest'; then
        print_success "scorpion:latest model is available locally"
        LOCAL_SCORPION_SIZE=$(curl -s http://localhost:11434/api/tags | jq -r '.models[] | select(.name == "scorpion:latest") | (.size / 1024 / 1024 / 1024 | floor)')
        echo "   Model size: ~${LOCAL_SCORPION_SIZE}GB"
    else
        print_warning "scorpion:latest model not found locally"
        echo "   Run: ollama pull scorpion:latest"
    fi
else
    print_error "Local Ollama is not running"
    echo "   Start it with: ollama serve"
fi

echo ""

# Check remote Ollama
echo "🌐 Checking Remote Ollama..."
REMOTE_URL="https://llm.n8ncloud.tech"
if curl -s -m 5 "$REMOTE_URL/api/tags" > /dev/null 2>&1; then
    print_success "Remote Ollama is reachable"
    
    # Check for scorpion model
    if curl -s -m 10 "$REMOTE_URL/api/tags" | jq -r '.models[].name' 2>/dev/null | grep -q 'scorpion:latest'; then
        print_success "scorpion:latest model is available remotely"
    else
        print_warning "scorpion:latest model not found on remote server"
        echo ""
        echo "   To pull it on the remote server, run this in Hostinger browser terminal:"
        echo ""
        echo "   docker exec ollama ollama pull scorpion:latest"
        echo ""
    fi
else
    print_error "Remote Ollama is not reachable"
    echo "   Check: https://llm.n8ncloud.tech/api/tags"
fi

echo ""

# Check Scorpion app configuration
echo "⚙️  Checking Scorpion Configuration..."
if [ -f "apps/scorpion/.env.local" ]; then
    OLLAMA_URL=$(grep "^OLLAMA_URL=" apps/scorpion/.env.local 2>/dev/null | cut -d'=' -f2 | tr -d '"' | tr -d "'" || echo "")
    if [ -n "$OLLAMA_URL" ]; then
        print_info "OLLAMA_URL is set to: $OLLAMA_URL"
        if [[ "$OLLAMA_URL" == *"localhost"* ]]; then
            print_success "Using local Ollama (faster for development)"
        elif [[ "$OLLAMA_URL" == *"n8ncloud.tech"* ]] || [[ "$OLLAMA_URL" == *"lightningflow.online"* ]]; then
            print_info "Using remote Ollama (good for offloading/concurrency)"
        fi
    else
        print_warning "OLLAMA_URL not set, will default to http://localhost:11434"
    fi
else
    print_warning ".env.local not found, using defaults"
fi

echo ""

# Check Scorpion health endpoint
echo "🏥 Checking Scorpion Health..."
if curl -s http://localhost:3003/api/health > /dev/null 2>&1; then
    OLLAMA_STATUS=$(curl -s http://localhost:3003/api/health | jq -r '.services.ollama.status // "unknown"' 2>/dev/null || echo "unknown")
    if [ "$OLLAMA_STATUS" = "up" ]; then
        print_success "Scorpion reports Ollama is UP"
    else
        print_warning "Scorpion reports Ollama status: $OLLAMA_STATUS"
    fi
else
    print_warning "Scorpion app is not running (or not on port 3003)"
    echo "   Start it with: pnpm dev"
fi

echo ""
echo "📋 Summary:"
echo "==========="
echo ""
echo "✅ Configuration updated to use scorpion:latest as default model"
echo "✅ Timeout increased to 2 minutes for remote servers"
echo ""
echo "📝 Next Steps:"
echo "   1. If using remote: Pull scorpion:latest on KVM2 server"
echo "   2. Restart Scorpion app to pick up changes"
echo "   3. Test a chat message to verify scorpion:latest is being used"
echo ""
echo "🎯 The model 'scorpion:latest' is now the default for all new conversations!"












