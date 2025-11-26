#!/usr/bin/env bash
set -euo pipefail

# Health Check - Validates that all services have health endpoints
# Usage: ./scripts/validate/health-check.sh [ENV]

ENV="${1:-int}"
COMPOSE_FILE="infra/docker/docker-compose.${ENV}.yml"

echo "🔍 Checking health endpoints for environment: $ENV"

if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ ERROR: Compose file not found: $COMPOSE_FILE"
    exit 1
fi

echo "📄 Checking $COMPOSE_FILE"

# Extract services and their ports from compose file
SERVICES=$(docker compose -f "$COMPOSE_FILE" config --services 2>/dev/null || echo "")

if [ -z "$SERVICES" ]; then
    echo "ℹ️  No services found in compose file"
    exit 0
fi

echo "📦 Found services: $SERVICES"

VIOLATIONS=()
HEALTH_ENDPOINTS=()

for service in $SERVICES; do
    echo "🔍 Checking service: $service"
    
    # Check if service has healthcheck defined
    if ! docker compose -f "$COMPOSE_FILE" config | grep -A 10 "services:" | grep -A 10 "$service:" | grep -q "healthcheck:"; then
        echo "❌ Service $service missing healthcheck configuration"
        VIOLATIONS+=("$service:missing_healthcheck")
    fi
    
    # Get service port
    PORT=$(docker compose -f "$COMPOSE_FILE" config | grep -A 20 "services:" | grep -A 20 "$service:" | grep -o "127\.0\.0\.1:[0-9]\+:[0-9]\+" | head -1 | cut -d: -f2 || echo "")
    
    if [ -n "$PORT" ]; then
        HEALTH_URL="http://localhost:$PORT/healthz"
        HEALTH_ENDPOINTS+=("$HEALTH_URL")
        echo "  📍 Health endpoint: $HEALTH_URL"
    fi
done

# Test health endpoints if services are running
echo ""
echo "🏥 Testing health endpoints..."

if command -v docker >/dev/null 2>&1; then
    # Check if compose stack is running
    if docker compose -f "$COMPOSE_FILE" ps --services --filter "status=running" | grep -q .; then
        echo "📦 Services are running, testing health endpoints..."
        
        for endpoint in "${HEALTH_ENDPOINTS[@]}"; do
            echo "🔍 Testing $endpoint"
            if curl -fsS --max-time 10 "$endpoint" >/dev/null 2>&1; then
                echo "  ✅ $endpoint - OK"
            else
                echo "  ❌ $endpoint - FAILED"
                VIOLATIONS+=("$endpoint:health_check_failed")
            fi
        done
    else
        echo "ℹ️  Services not running, skipping health endpoint tests"
    fi
fi

# Check for required health endpoints in code
echo ""
echo "🔍 Checking for health endpoint implementations..."

# Look for health endpoint implementations in API code
API_PATHS=("apps/lightningflow/api/src" "apps/api/src" "packages/lf-sdk/src")
for path in "${API_PATHS[@]}"; do
    if [ -d "$path" ]; then
        echo "📁 Checking $path for health endpoints"
        if ! find "$path" -name "*.ts" -o -name "*.js" | xargs grep -l "healthz\|health" >/dev/null 2>&1; then
            echo "❌ No health endpoint implementation found in $path"
            VIOLATIONS+=("$path:missing_health_implementation")
        fi
    fi
done

# Report results
if [ ${#VIOLATIONS[@]} -gt 0 ]; then
    echo ""
    echo "❌ HEALTH CHECK VIOLATIONS DETECTED:"
    for violation in "${VIOLATIONS[@]}"; do
        echo "  - $violation"
    done
    echo ""
    echo "🔧 FIX: Add healthcheck configuration to compose services"
    echo "🔧 FIX: Implement /healthz endpoints in all services"
    echo "🔧 FIX: Ensure health endpoints return 200 OK when healthy"
    exit 1
fi

echo "✅ All health checks passed"
exit 0
