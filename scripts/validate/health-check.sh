#!/usr/bin/env bash
set -euo pipefail

# Health Check - Validates that all services have health endpoints
# Usage: ./scripts/validate/health-check.sh [ENV]
#
# Presence is read from the compose file. A failed `docker compose config`
# (missing env file, invalid extension key) is not evidence that a
# healthcheck is missing.

ENV="${1:-int}"
COMPOSE_FILE="infra/docker/docker-compose.${ENV}.yml"

echo "🔍 Checking health endpoints for environment: $ENV"

if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ ERROR: Compose file not found: $COMPOSE_FILE"
    exit 1
fi

echo "📄 Checking $COMPOSE_FILE"

PARSE_OUT="$(mktemp)"
PARSE_ERR="$(mktemp)"
trap 'rm -f "$PARSE_OUT" "$PARSE_ERR"' EXIT

set +e
python3 - "$COMPOSE_FILE" >"$PARSE_OUT" 2>"$PARSE_ERR" << 'PY'
import sys
from pathlib import Path

path = Path(sys.argv[1])
lines = path.read_text(encoding="utf-8").splitlines()
in_services = False
current = None
order = []
has_healthcheck = {}
host_port = {}

def is_service_header(line: str) -> bool:
    if not line.startswith("  ") or line.startswith("   ") or line.startswith("  #"):
        return False
    name = line.strip()
    return name.endswith(":") and " " not in name[:-1] and name[:-1] != ""

for raw in lines:
    if not in_services:
        if raw.startswith("services:"):
            in_services = True
        continue
    if raw and not raw.startswith((" ", "#", "\t")):
        break
    if is_service_header(raw):
        current = raw.strip()[:-1]
        order.append(current)
        has_healthcheck[current] = False
        host_port[current] = ""
        continue
    if current is None:
        continue
    if raw.startswith("    healthcheck:"):
        has_healthcheck[current] = True
        continue
    # "127.0.0.1:HOST:CONTAINER" on a ports line. First host port only.
    if "127.0.0.1:" in raw and not host_port[current]:
        token = raw.split("127.0.0.1:", 1)[1]
        host = token.split(":", 1)[0].strip().strip('"').strip("'")
        if host.isdigit():
            host_port[current] = host

if not in_services or not order:
    print("no service map in compose file", file=sys.stderr)
    sys.exit(2)

for name in order:
    flag = "yes" if has_healthcheck[name] else "no"
    print(f"{name}\t{flag}\t{host_port[name]}")
PY
PARSE_RC=$?
set -e

if [ "$PARSE_RC" -ne 0 ]; then
    echo "❌ ERROR: Could not read services from $COMPOSE_FILE"
    cat "$PARSE_ERR"
    exit 1
fi

VIOLATIONS=()
HEALTH_ENDPOINTS=()

while IFS="$(printf '\t')" read -r service present port; do
    [ -n "$service" ] || continue
    echo "🔍 Checking service: $service"
    if [ "$present" != "yes" ]; then
        echo "❌ Service $service missing healthcheck configuration"
        VIOLATIONS+=("$service:missing_healthcheck")
    fi
    if [ -n "$port" ]; then
        HEALTH_URL="http://localhost:$port/healthz"
        HEALTH_ENDPOINTS+=("$HEALTH_URL")
        echo "  📍 Health endpoint: $HEALTH_URL"
    fi
done <"$PARSE_OUT"

echo ""
echo "🏥 Testing health endpoints..."

if command -v docker >/dev/null 2>&1; then
    if docker compose -f "$COMPOSE_FILE" ps --services --filter "status=running" 2>/dev/null | grep -q .; then
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
else
    echo "ℹ️  Docker is not installed, skipping live health endpoint tests"
fi

echo ""
echo "🔍 Checking for health endpoint implementations..."

API_PATHS=("apps/lightningflow/api/src" "apps/api/src" "packages/lf-sdk/src")
for path in "${API_PATHS[@]}"; do
    if [ -d "$path" ]; then
        echo "📁 Checking $path for health endpoints"
        if ! find "$path" \( -name "*.ts" -o -name "*.js" \) -print0 | xargs -0 grep -l "healthz\|health" >/dev/null 2>&1; then
            echo "❌ No health endpoint implementation found in $path"
            VIOLATIONS+=("$path:missing_health_implementation")
        fi
    fi
done

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
