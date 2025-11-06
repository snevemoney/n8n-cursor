#!/bin/bash
# Verify local setup is complete and ready

set -e

echo "🔍 Verifying Local Setup"
echo "========================"

# Check Docker
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running"
    exit 1
fi
echo "✅ Docker is running"

# Check /etc/hosts entries
echo ""
echo "📋 Checking /etc/hosts entries..."
REQUIRED_HOSTS=("n8n.local" "lightningflow.local" "open-webui.local" "anythingllm.local")
MISSING_HOSTS=()

for host in "${REQUIRED_HOSTS[@]}"; do
    if grep -q "$host" /etc/hosts 2>/dev/null; then
        echo "  ✅ $host"
    else
        echo "  ❌ $host (missing)"
        MISSING_HOSTS+=("$host")
    fi
done

if [ ${#MISSING_HOSTS[@]} -gt 0 ]; then
    echo ""
    echo "⚠️  Missing /etc/hosts entries. Run: ./scripts/setup-local-hosts.sh"
fi

# Check docker-compose file
echo ""
echo "🐳 Validating docker-compose.dev.yml..."
if docker compose -f infra/docker/docker-compose.dev.yml config > /dev/null 2>&1; then
    echo "✅ docker-compose.dev.yml is valid"
else
    echo "❌ docker-compose.dev.yml has errors"
    docker compose -f infra/docker/docker-compose.dev.yml config 2>&1 | grep -i error || true
fi

# Check services
echo ""
echo "📦 Checking configured services..."
SERVICES=$(docker compose -f infra/docker/docker-compose.dev.yml config --services 2>/dev/null | grep -v "warning\|variable" || echo "")
if [ -n "$SERVICES" ]; then
    echo "$SERVICES" | while read service; do
        echo "  ✅ $service"
    done
else
    echo "  ⚠️  Could not list services (non-critical)"
fi

# Check .env.dev
echo ""
if [ -f ".env.dev" ]; then
    echo "✅ .env.dev exists"
else
    echo "⚠️  .env.dev not found - create from env.dev.example"
fi

echo ""
echo "🎯 Setup Status:"
if [ ${#MISSING_HOSTS[@]} -eq 0 ] && docker compose -f infra/docker/docker-compose.dev.yml config > /dev/null 2>&1; then
    echo "✅ Local setup is ready!"
    echo ""
    echo "Next steps:"
    echo "1. Run: ./scripts/start-local-services.sh"
    echo "2. Access services at:"
    echo "   - http://n8n.local"
    echo "   - http://lightningflow.local"
    echo "   - http://open-webui.local"
    echo "   - http://anythingllm.local"
else
    echo "⚠️  Setup incomplete - fix issues above"
fi

