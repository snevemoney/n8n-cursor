#!/bin/bash

# Test LLM Endpoint - Run this on KVM2 server
# Tests all endpoints to verify setup

echo "🧪 Testing LLM Endpoint Setup"
echo "=============================="
echo ""

# Test 1: Local Ollama
echo "[1/4] Testing local Ollama endpoint..."
LOCAL_TEST=$(curl -s http://127.0.0.1:11434/api/tags 2>&1)
if echo "$LOCAL_TEST" | grep -q "models"; then
  echo "✅ Local Ollama is working"
  echo "$LOCAL_TEST" | head -3
else
  echo "❌ Local Ollama test failed"
  echo "$LOCAL_TEST"
fi
echo ""

# Test 2: HTTP with Host header
echo "[2/4] Testing HTTP endpoint with Host header..."
HTTP_TEST=$(curl -s -H "Host: llm.n8ncloud.tech" http://69.62.66.78/api/tags 2>&1)
if echo "$HTTP_TEST" | grep -q "models"; then
  echo "✅ HTTP endpoint is working"
  echo "$HTTP_TEST" | head -3
else
  echo "⚠️  HTTP endpoint test:"
  echo "$HTTP_TEST" | head -5
fi
echo ""

# Test 3: HTTPS with Host header (bypass DNS)
echo "[3/4] Testing HTTPS endpoint with Host header (bypass DNS)..."
HTTPS_TEST=$(curl -s -k -H "Host: llm.n8ncloud.tech" https://69.62.66.78/api/tags 2>&1)
if echo "$HTTPS_TEST" | grep -q "models"; then
  echo "✅ HTTPS endpoint is working (with -k flag)"
  echo "$HTTPS_TEST" | head -3
else
  echo "⚠️  HTTPS endpoint test:"
  echo "$HTTPS_TEST" | head -5
fi
echo ""

# Test 4: Direct domain test
echo "[4/4] Testing direct domain (requires DNS)..."
DOMAIN_TEST=$(curl -s -k https://llm.n8ncloud.tech/api/tags 2>&1)
if echo "$DOMAIN_TEST" | grep -q "models"; then
  echo "✅ Domain endpoint is working"
  echo "$DOMAIN_TEST" | head -3
else
  echo "⚠️  Domain endpoint test:"
  echo "$DOMAIN_TEST" | head -5
fi
echo ""

# Summary
echo "📋 Summary:"
echo "  - Local Ollama: $(curl -s http://127.0.0.1:11434/api/tags >/dev/null 2>&1 && echo '✅ Working' || echo '❌ Not working')"
echo "  - HTTP via Caddy: $(curl -s -H 'Host: llm.n8ncloud.tech' http://69.62.66.78/api/tags >/dev/null 2>&1 && echo '✅ Working' || echo '❌ Not working')"
echo "  - HTTPS via Caddy: $(curl -s -k -H 'Host: llm.n8ncloud.tech' https://69.62.66.78/api/tags >/dev/null 2>&1 && echo '✅ Working' || echo '❌ Not working')"
echo "  - Domain DNS: $(dig +short llm.n8ncloud.tech | grep -q '69.62.66.78' && echo '✅ Resolving' || echo '❌ Not resolving')"
echo ""
echo "💡 If local works but Caddy doesn't, check:"
echo "   1. Caddyfile configuration: sudo cat /etc/caddy/Caddyfile | grep llm"
echo "   2. Caddy logs: sudo journalctl -u caddy -n 20"
echo "   3. Caddy status: sudo systemctl status caddy"

