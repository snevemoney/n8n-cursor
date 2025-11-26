#!/usr/bin/env bash
set -euo pipefail

echo "🚀 DEPLOYING PRODUCTION CADDY FOR N8NCLOUD.TECH"
echo "================================================"

# Check if we're in the right directory
if [ ! -f "infra/caddy/docker-compose.prod.yml" ]; then
    echo "❌ Error: Run this script from the project root directory"
    exit 1
fi

echo "[1] Stopping any existing production Caddy..."
docker compose -f infra/caddy/docker-compose.prod.yml down 2>/dev/null || true

echo "[2] Checking if ports 80/443 are available..."
if lsof -i :80 2>/dev/null | grep -q LISTEN; then
    echo "⚠️  Port 80 is already in use. Stopping conflicting service..."
    sudo lsof -i :80 | grep LISTEN | awk '{print $2}' | xargs -r sudo kill -9 2>/dev/null || true
fi

if lsof -i :443 2>/dev/null | grep -q LISTEN; then
    echo "⚠️  Port 443 is already in use. Stopping conflicting service..."
    sudo lsof -i :443 | grep LISTEN | awk '{print $2}' | xargs -r sudo kill -9 2>/dev/null || true
fi

echo "[3] Starting production Caddy..."
cd infra/caddy
docker compose -f docker-compose.prod.yml up -d

echo "[4] Waiting for Caddy to start..."
sleep 5

echo "[5] Checking Caddy status..."
if docker ps --format "{{.Names}}" | grep -q "lightningflow-caddy-prod"; then
    echo "✅ Production Caddy is running"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep "lightningflow-caddy-prod"
else
    echo "❌ Production Caddy failed to start"
    docker compose -f docker-compose.prod.yml logs
    exit 1
fi

echo "[6] Testing Caddy endpoints..."
echo "Testing n8ncloud.tech proxy..."
if curl -s -H "Host: n8ncloud.tech" http://localhost/ >/dev/null 2>&1; then
    echo "✅ Caddy is responding to n8ncloud.tech requests"
else
    echo "❌ Caddy is not responding to n8ncloud.tech requests"
    echo "Checking Caddy logs..."
    docker compose -f docker-compose.prod.yml logs caddy-prod
fi

echo ""
echo "🔧 NEXT STEPS:"
echo "1. Update your DNS to point n8ncloud.tech to this server's IP"
echo "2. Test access to https://n8ncloud.tech"
echo "3. Check Caddy logs if there are issues"
echo ""
echo "📋 TROUBLESHOOTING:"
echo "• Check Caddy logs: docker compose -f infra/caddy/docker-compose.prod.yml logs"
echo "• Check Caddy status: docker compose -f infra/caddy/docker-compose.prod.yml ps"
echo "• Test local proxy: curl -H 'Host: n8ncloud.tech' http://localhost/"
echo "• Check port binding: lsof -i :80 && lsof -i :443"
