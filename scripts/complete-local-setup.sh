#!/bin/bash
# Complete local setup - one command to rule them all

set -e

echo "🚀 Complete Local Setup"
echo "======================="
echo ""

# Step 1: Setup /etc/hosts
echo "📝 Step 1: Setting up /etc/hosts..."
if ! grep -q "n8n.local" /etc/hosts 2>/dev/null; then
    echo "   Adding local domains..."
    ./scripts/setup-local-hosts.sh
else
    echo "   ✅ /etc/hosts already configured"
fi

# Step 2: Check Docker
echo ""
echo "🐳 Step 2: Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    echo "   ❌ Docker is not running"
    echo "   Please start Docker Desktop and run this script again"
    exit 1
fi
echo "   ✅ Docker is running"

# Step 3: Check .env.dev
echo ""
echo "📄 Step 3: Checking environment file..."
if [ ! -f ".env.dev" ]; then
    if [ -f "env.dev.example" ]; then
        echo "   Creating .env.dev from template..."
        cp env.dev.example .env.dev
        echo "   ⚠️  Please edit .env.dev with your values:"
        echo "      - NEXT_PUBLIC_SUPABASE_URL"
        echo "      - NEXT_PUBLIC_SUPABASE_ANON_KEY"
        echo "      - SUPABASE_SERVICE_ROLE"
    else
        echo "   ⚠️  env.dev.example not found"
    fi
else
    echo "   ✅ .env.dev exists"
fi

# Step 4: Start services
echo ""
echo "🚀 Step 4: Starting Docker services..."
docker compose -f infra/docker/docker-compose.dev.yml up -d --build

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Step 5: Verify services
echo ""
echo "🔍 Step 5: Verifying services..."
FAILED=0

check_service() {
    local name=$1
    local url=$2
    
    if curl -sf "$url" > /dev/null 2>&1; then
        echo "   ✅ $name"
        return 0
    else
        echo "   ⚠️  $name (may still be starting)"
        return 1
    fi
}

check_service "n8n" "http://localhost:5678/healthz" || FAILED=$((FAILED + 1))
check_service "Open WebUI" "http://localhost:3004" || FAILED=$((FAILED + 1))
check_service "AnythingLLM" "http://localhost:3005" || FAILED=$((FAILED + 1))

# Step 6: Show status
echo ""
echo "📊 Service Status:"
docker compose -f infra/docker/docker-compose.dev.yml ps

echo ""
if [ $FAILED -eq 0 ]; then
    echo "🎉 Local setup complete!"
else
    echo "⚠️  Some services may still be starting"
    echo "   Check logs: docker compose -f infra/docker/docker-compose.dev.yml logs -f"
fi

echo ""
echo "🌐 Access your services:"
echo "   ⚡ n8n:              http://n8n.local"
echo "   🌐 LightningFlow:   http://lightningflow.local"
echo "   📊 Dashboard:        http://app.lightningflow.local"
echo "   🔧 Ops:              http://ops.lightningflow.local"
echo "   🤖 Open WebUI:       http://open-webui.local"
echo "   📚 AnythingLLM:      http://anythingllm.local"
echo "   📧 Email (MailHog):   http://mail.local"
echo "   📋 Logs (Dozzle):    http://logs.local"
echo ""
echo "🔄 To sync production data:"
echo "   ./scripts/sync-n8n-via-api.sh"

