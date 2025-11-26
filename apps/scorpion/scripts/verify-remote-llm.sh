#!/bin/bash

# Verify Remote LLM Setup
# Checks that OLLAMA_URL is configured and reachable

set -e

echo "🔍 Verifying Remote LLM Setup"
echo ""

# Check .env.local exists
ENV_FILE="apps/scorpion/.env.local"
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ .env.local not found at $ENV_FILE"
  exit 1
fi

echo "✅ Found .env.local"

# Extract OLLAMA_URL
OLLAMA_URL=$(grep "^OLLAMA_URL=" "$ENV_FILE" 2>/dev/null | cut -d'=' -f2 | tr -d '"' | tr -d "'" || echo "")

if [ -z "$OLLAMA_URL" ]; then
  echo "⚠️  OLLAMA_URL not set in .env.local"
  echo "   Using default: http://localhost:11434"
  OLLAMA_URL="http://localhost:11434"
else
  echo "✅ OLLAMA_URL configured: $OLLAMA_URL"
fi

echo ""

# Test connection
echo "📡 Testing LLM connection..."

# Try Ollama endpoint
if curl -s -m 5 "$OLLAMA_URL/api/tags" > /dev/null 2>&1; then
  echo "   ✅ Ollama endpoint reachable: $OLLAMA_URL/api/tags"
  echo "   Response:"
  curl -s -m 5 "$OLLAMA_URL/api/tags" | head -5 | sed 's/^/      /'
elif curl -s -m 5 "$OLLAMA_URL/v1/models" > /dev/null 2>&1; then
  echo "   ✅ OpenAI-compatible endpoint reachable: $OLLAMA_URL/v1/models"
  echo "   Response:"
  curl -s -m 5 "$OLLAMA_URL/v1/models" | head -5 | sed 's/^/      /'
elif curl -s -m 5 "$OLLAMA_URL/health" > /dev/null 2>&1; then
  echo "   ✅ Health endpoint reachable: $OLLAMA_URL/health"
  echo "   Response:"
  curl -s -m 5 "$OLLAMA_URL/health" | head -5 | sed 's/^/      /'
else
  echo "   ⚠️  Could not reach LLM at $OLLAMA_URL"
  echo "   This may be normal if:"
  echo "     - Server requires authentication"
  echo "     - Server uses a different endpoint path"
  echo "     - Server is not yet configured"
  echo ""
  echo "   Testing basic connectivity..."
  if curl -s -m 5 "$OLLAMA_URL" > /dev/null 2>&1; then
    echo "   ✅ Server is reachable (may need specific endpoint)"
  else
    echo "   ❌ Server is not reachable"
    echo "   Check:"
    echo "     1. Is the KVM2 server running?"
    echo "     2. Is the domain correct?"
    echo "     3. Is Caddy/reverse proxy configured?"
  fi
fi

echo ""
echo "📋 Configuration Summary:"
echo "   OLLAMA_URL: $OLLAMA_URL"
echo ""
echo "💡 Next steps:"
echo "   1. Restart Scorpion: pnpm dev (in apps/scorpion)"
echo "   2. Check health: curl http://localhost:3003/api/health | jq"
echo "   3. Test single chat: curl -X POST http://localhost:3003/api/chat/stream \\"
echo "      -H 'Content-Type: application/json' \\"
echo "      -d '{\"messages\":[{\"role\":\"user\",\"content\":\"hi\"}]}'"
echo "   4. Run concurrent tests: ./scripts/test-concurrency.sh 8"

