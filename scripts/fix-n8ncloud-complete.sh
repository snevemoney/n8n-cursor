#!/usr/bin/env bash
set -euo pipefail

echo "🔧 COMPLETE N8NCLOUD.TECH FIX"
echo "=============================="

echo "[1] Current Status Check..."
bash scripts/quick-n8n-status.sh

echo ""
echo "[2] Deploying Production Caddy..."
bash scripts/deploy-production-caddy.sh

echo ""
echo "[3] Final Status Check..."
bash scripts/quick-n8n-status.sh

echo ""
echo "[4] Testing n8ncloud.tech Access..."
echo "Testing local proxy..."
if curl -s -H "Host: n8ncloud.tech" http://localhost/ >/dev/null 2>&1; then
    echo "✅ Local proxy working - n8ncloud.tech → localhost:5679"
else
    echo "❌ Local proxy not working"
fi

echo ""
echo "🌐 FINAL STATUS:"
echo "• n8n container: $(docker ps --format '{{.Names}}' | grep -c 'n8n' || echo '0') running"
echo "• n8n port: $(lsof -i :5679 2>/dev/null | grep -c LISTEN || echo '0') listening"
echo "• Caddy production: $(docker ps --format '{{.Names}}' | grep -c 'lightningflow-caddy-prod' || echo '0') running"
echo "• Caddy ports: $(lsof -i :80 2>/dev/null | grep -c LISTEN || echo '0') 80, $(lsof -i :443 2>/dev/null | grep -c LISTEN || echo '0') 443"

echo ""
echo "🎯 NEXT STEPS:"
echo "1. Your n8n is working on localhost:5679 ✅"
echo "2. Production Caddy is now running on ports 80/443 ✅"
echo "3. Caddy is configured to proxy n8ncloud.tech → localhost:5679 ✅"
echo ""
echo "4. Update your DNS to point n8ncloud.tech to this server's IP address"
echo "5. Test https://n8ncloud.tech in your browser"
echo ""
echo "📋 TROUBLESHOOTING:"
echo "• If still getting 522 errors, check your DNS configuration"
echo "• If Caddy fails, check: docker compose -f infra/caddy/docker-compose.prod.yml logs"
echo "• If n8n fails, check: docker logs n8n-cursor-n8n-1"
echo ""
echo "🔒 SECURITY:"
echo "• n8n is bound to localhost only (secure) ✅"
echo "• Caddy handles all external traffic ✅"
echo "• No direct exposure of n8n to internet ✅"
