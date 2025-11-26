#!/bin/bash
# Start all local development services

set -e

echo "🚀 Starting Local Development Services"
echo "======================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Check if /etc/hosts entries exist
if ! grep -q "n8n.local" /etc/hosts; then
    echo "⚠️  Local domains not found in /etc/hosts"
    echo "   Run: ./scripts/setup-local-hosts.sh"
    echo ""
    read -p "Would you like to add them now? (requires sudo) [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ./scripts/setup-local-hosts.sh
    else
        echo "⚠️  Continuing without /etc/hosts entries. Services will be accessible via localhost:PORT"
    fi
fi

# Check if .env.dev exists
if [ ! -f ".env.dev" ]; then
    echo "⚠️  .env.dev not found. Creating from template..."
    if [ -f "env.dev.example" ]; then
        cp env.dev.example .env.dev
        echo "✅ Created .env.dev - please edit with your values"
    else
        echo "❌ env.dev.example not found"
        exit 1
    fi
fi

# Start services
echo ""
echo "🐳 Starting Docker services..."
cd "$(dirname "$0")/.."
docker compose -f infra/docker/docker-compose.dev.yml up -d --build

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 5

# Check service health
echo ""
echo "📊 Service Status:"
docker compose -f infra/docker/docker-compose.dev.yml ps

echo ""
echo "🎉 Services started!"
echo ""
echo "Access your services at:"
echo "  ⚡ n8n:              http://n8n.local"
echo "  🌐 LightningFlow:    http://lightningflow.local"
echo "  📊 Dashboard:        http://app.lightningflow.local"
echo "  🔧 Ops:              http://ops.lightningflow.local"
echo "  🔌 API:              http://api.lightningflow.local/healthz"
echo "  🤖 Open WebUI:       http://open-webui.local"
echo "  📚 AnythingLLM:      http://anythingllm.local"
echo "  📧 Email (MailHog):  http://mail.local"
echo "  📋 Logs (Dozzle):    http://logs.local"
echo ""
echo "To view logs: docker compose -f infra/docker/docker-compose.dev.yml logs -f"
echo "To stop:      docker compose -f infra/docker/docker-compose.dev.yml down"

