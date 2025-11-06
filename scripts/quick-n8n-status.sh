#!/usr/bin/env bash
set -euo pipefail

echo "🔍 QUICK N8N STATUS CHECK"
echo "=========================="

echo "[1] Checking if n8n container is running..."
if docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -q "n8n"; then
    echo "✅ n8n container is running"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep "n8n"
else
    echo "❌ n8n container is not running"
fi

echo ""
echo "[2] Checking n8n port binding..."
if netstat -tlnp 2>/dev/null | grep -q ":5679"; then
    echo "✅ Port 5679 is listening"
    netstat -tlnp 2>/dev/null | grep ":5679"
else
    echo "❌ Port 5679 is not listening"
fi

echo ""
echo "[3] Testing n8n health endpoint..."
if curl -s http://localhost:5679/healthz >/dev/null 2>&1; then
    echo "✅ n8n health check passed"
else
    echo "❌ n8n health check failed"
    echo "Trying alternative endpoints..."
    if curl -s http://localhost:5679/ >/dev/null 2>&1; then
        echo "✅ n8n responds on / endpoint"
    else
        echo "❌ n8n not responding on any endpoint"
    fi
fi

echo ""
echo "[4] Checking Docker logs..."
echo "Last 10 lines of n8n logs:"
docker compose -f infra/docker/docker-compose.prod.yml logs --tail=10 n8n 2>/dev/null || echo "No logs found"

echo ""
echo "[5] Checking Caddy configuration..."
if grep -q "127.0.0.1:5679" infra/caddy/Caddyfile.prod.tpl; then
    echo "✅ Caddy is configured for port 5679"
else
    echo "❌ Caddy is NOT configured for port 5679"
    echo "Current Caddy config:"
    grep -A 5 -B 5 "reverse_proxy" infra/caddy/Caddyfile.prod.tpl || echo "No reverse_proxy found"
fi

echo ""
echo "📋 SUMMARY:"
echo "• Container running: $(docker ps --format "{{.Names}}" | grep -c "n8n" || echo "0")"
echo "• Port listening: $(netstat -tlnp 2>/dev/null | grep -c ":5679" || echo "0")"
echo "• Health check: $(curl -s http://localhost:5679/healthz >/dev/null 2>&1 && echo "PASS" || echo "FAIL")"
echo "• Caddy config: $(grep -q "127.0.0.1:5679" infra/caddy/Caddyfile.prod.tpl && echo "CORRECT" || echo "WRONG")"
