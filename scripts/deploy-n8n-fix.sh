#!/usr/bin/env bash
set -euo pipefail

echo "🚀 DEPLOYING N8N FIXES..."
echo "=========================="

# Check if we're in the right directory
if [ ! -f "infra/docker/docker-compose.prod.yml" ]; then
    echo "❌ Error: Run this script from the project root directory"
    exit 1
fi

echo "[1] Creating data directory..."
mkdir -p ./data/n8n_data
chmod 755 ./data/n8n_data

echo "[2] Setting up environment file..."
if [ ! -f ".env.production" ]; then
    cat > .env.production << 'EOF'
# Production Environment Variables
NODE_ENV=production
PROD_DATA_ROOT=./data

# n8n Configuration
N8N_ENCRYPTION_KEY=your-super-secret-encryption-key-change-this-now
N8N_DATABASE_TYPE=sqlite
N8N_DATABASE_SQLITE_VACUUM_ON_STARTUP=true

# API Configuration
API_UPSTREAM=127.0.0.1:4000
LOGS_UPSTREAM=127.0.0.1:9001
IDE_UPSTREAM=127.0.0.1:8443

# Primary Domain
PRIMARY_DOMAIN=lightningflow.online
EOF
    echo "✅ Created .env.production (CHANGE THE ENCRYPTION KEY!)"
else
    echo "✅ .env.production already exists"
fi

echo "[3] Stopping any existing containers..."
docker compose -f infra/docker/docker-compose.prod.yml down 2>/dev/null || true

echo "[4] Cleaning up Docker..."
docker system prune -f

echo "[5] Starting n8n service..."
docker compose -f infra/docker/docker-compose.prod.yml up -d n8n

echo "[6] Waiting for n8n to start..."
sleep 10

echo "[7] Checking n8n status..."
if curl -s http://localhost:5679/healthz >/dev/null 2>&1; then
    echo "✅ n8n is running and healthy!"
    echo "🌐 Access your n8n at: https://n8ncloud.tech"
else
    echo "❌ n8n health check failed. Checking logs..."
    docker compose -f infra/docker/docker-compose.prod.yml logs n8n
fi

echo ""
echo "🔧 NEXT STEPS:"
echo "1. Update your Caddy configuration with the new port (5678)"
echo "2. Restart Caddy to pick up the changes"
echo "3. Test access to https://n8ncloud.tech"
echo ""
echo "📋 TROUBLESHOOTING:"
echo "• Check logs: docker compose -f infra/docker/docker-compose.prod.yml logs n8n"
echo "• Check status: docker compose -f infra/docker/docker-compose.prod.yml ps"
echo "• Manual test: curl -v http://localhost:5679/healthz"
