#!/bin/bash

# Fix Caddy LLM Proxy - Run this on KVM2 server
# Diagnoses and fixes Caddy proxy issues

echo "🔧 Diagnosing Caddy LLM Proxy"
echo "=============================="
echo ""

# Check Caddy status
echo "[1/5] Checking Caddy status..."
sudo systemctl status caddy --no-pager | head -15
echo ""

# Check what Caddy is listening on
echo "[2/5] Checking what ports Caddy is listening on..."
sudo netstat -tlnp | grep caddy || sudo ss -tlnp | grep caddy
echo ""

# Check Caddyfile syntax
echo "[3/5] Validating Caddyfile..."
sudo caddy validate --config /etc/caddy/Caddyfile 2>&1
echo ""

# Test local Ollama
echo "[4/5] Testing local Ollama..."
LOCAL_RESPONSE=$(curl -s http://127.0.0.1:11434/api/tags)
if echo "$LOCAL_RESPONSE" | grep -q "models"; then
  echo "✅ Local Ollama is working"
else
  echo "❌ Local Ollama not responding"
fi
echo ""

# Check Caddy logs for errors
echo "[5/5] Recent Caddy errors..."
sudo journalctl -u caddy -n 30 --no-pager | grep -i "error\|llm\|11434" | tail -10
echo ""

# Try to fix: Restart Caddy
echo "🔄 Attempting to fix by restarting Caddy..."
sudo systemctl restart caddy
sleep 3

# Test again
echo ""
echo "🧪 Testing after restart..."
echo "HTTP test:"
curl -s -H "Host: llm.n8ncloud.tech" http://69.62.66.78/api/tags | head -3
echo ""
echo "HTTPS test (with -k):"
curl -s -k -H "Host: llm.n8ncloud.tech" https://69.62.66.78/api/tags | head -3
echo ""

echo "✅ Diagnosis complete. Check output above for issues."

