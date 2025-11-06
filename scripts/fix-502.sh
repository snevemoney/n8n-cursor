#!/bin/bash
set -e

echo "🔧 Fixing 502 Bad Gateway issues..."
echo "=================================="

# Check if we're on the VPS
if [ ! -f "/etc/caddy/Caddyfile" ]; then
    echo "❌ This script should be run on the VPS"
    exit 1
fi

echo "1. Stopping any existing services..."
docker compose -f infra/docker/docker-compose.int.yml down 2>/dev/null || true
docker compose -f infra/docker/docker-compose.prod.yml down 2>/dev/null || true

echo "2. Starting services..."
# Try integration first, fallback to prod
if [ -f "infra/docker/docker-compose.int.yml" ]; then
    echo "Starting Integration stack..."
    docker compose -f infra/docker/docker-compose.int.yml up -d
elif [ -f "infra/docker/docker-compose.prod.yml" ]; then
    echo "Starting Production stack..."
    docker compose -f infra/docker/docker-compose.prod.yml up -d
else
    echo "❌ No compose files found. Please ensure you're in the project root."
    exit 1
fi

echo "3. Waiting for services to start..."
sleep 10

echo "4. Checking service health..."
docker ps --format 'table {{.Names}}\t{{.Status}}'

echo "5. Testing local connectivity..."
echo "Testing n8n (port 5678):"
curl -sS http://127.0.0.1:5678/ | head -n1 || echo "❌ n8n not responding"

echo "Testing API (port 4000):"
curl -sS http://127.0.0.1:4000/health || echo "❌ API not responding"

echo "Testing landing (port 3000):"
curl -sS http://127.0.0.1:3000/healthz || echo "❌ Landing not responding"

echo "6. Configuring Caddy..."
if [ -f "infra/caddy/Caddyfile.prod" ]; then
    sudo cp infra/caddy/Caddyfile.prod /etc/caddy/Caddyfile
elif [ -f "infra/caddy/Caddyfile.3ui" ]; then
    sudo cp infra/caddy/Caddyfile.3ui /etc/caddy/Caddyfile
else
    echo "❌ No Caddyfile found. Please check infra/caddy/"
    exit 1
fi

echo "7. Validating and reloading Caddy..."
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy

echo "8. Testing external connectivity..."
echo "Testing n8ncloud.tech:"
curl -sS -I https://n8ncloud.tech/healthz || echo "❌ n8ncloud.tech not responding"

echo "Testing lightningflow.online:"
curl -sS -I https://lightningflow.online/healthz || echo "❌ lightningflow.online not responding"

echo "✅ Fix complete! Check the results above."
echo ""
echo "If you still see 502 errors:"
echo "1. Check Cloudflare SSL/TLS mode is 'Full (strict)'"
echo "2. Verify DNS is pointing to this VPS"
echo "3. Check Caddy logs: sudo journalctl -u caddy -f"
echo "4. Run diagnostic: ./scripts/diagnose-502.sh"
