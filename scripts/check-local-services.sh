#!/bin/bash
# Quick check of local services status

echo "🔍 Checking Local Services Status"
echo "=================================="
echo ""

# Check Docker
echo "🐳 Docker Status:"
if docker info > /dev/null 2>&1; then
    echo "   ✅ Docker is running"
else
    echo "   ❌ Docker is NOT running"
    echo "   → Please start Docker Desktop"
    exit 1
fi

# Check /etc/hosts
echo ""
echo "📋 /etc/hosts Entries:"
REQUIRED_HOSTS=("n8n.local" "lightningflow.local" "open-webui.local" "anythingllm.local")
ALL_PRESENT=true

for host in "${REQUIRED_HOSTS[@]}"; do
    if grep -q "$host" /etc/hosts 2>/dev/null; then
        echo "   ✅ $host"
    else
        echo "   ❌ $host (missing)"
        ALL_PRESENT=false
    fi
done

if [ "$ALL_PRESENT" = false ]; then
    echo ""
    echo "   ⚠️  Missing entries. Run: ./scripts/setup-local-hosts.sh"
fi

# Check Docker services
echo ""
echo "🐳 Docker Services:"
cd "$(dirname "$0")/.."
SERVICES=$(docker compose -f infra/docker/docker-compose.dev.yml ps --services 2>/dev/null | grep -v "warning\|variable" || echo "")

if [ -n "$SERVICES" ]; then
    for service in $SERVICES; do
        STATUS=$(docker compose -f infra/docker/docker-compose.dev.yml ps "$service" 2>/dev/null | tail -n 1 | awk '{print $4}' || echo "not running")
        if [ "$STATUS" = "Up" ] || [ "$STATUS" = "running" ]; then
            echo "   ✅ $service"
        else
            echo "   ⚠️  $service (not running)"
        fi
    done
else
    echo "   ⚠️  Could not check services (compose file issue)"
fi

# Check service accessibility
echo ""
echo "🌐 Service Accessibility:"
check_url() {
    local name=$1
    local url=$2
    if curl -sf "$url" > /dev/null 2>&1; then
        echo "   ✅ $name ($url)"
        return 0
    else
        echo "   ❌ $name ($url) - not accessible"
        return 1
    fi
}

check_url "Open WebUI" "http://localhost:3004" || true
check_url "AnythingLLM" "http://localhost:3005" || true
check_url "n8n" "http://localhost:5678" || true

# Summary
echo ""
echo "📊 Summary:"
if [ "$ALL_PRESENT" = true ] && docker compose -f infra/docker/docker-compose.dev.yml ps | grep -q "Up"; then
    echo "   ✅ Setup looks good!"
    echo ""
    echo "   Access services at:"
    echo "   - http://open-webui.local"
    echo "   - http://anythingllm.local"
    echo "   - http://n8n.local"
else
    echo "   ⚠️  Setup incomplete"
    echo ""
    echo "   Next steps:"
    if [ "$ALL_PRESENT" = false ]; then
        echo "   1. Run: ./scripts/setup-local-hosts.sh"
    fi
    echo "   2. Run: ./scripts/start-local-services.sh"
fi

