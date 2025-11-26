#!/usr/bin/env bash
set -euo pipefail

# Port Check - Validates that no public port bindings exist
# Usage: ./scripts/validate/ports-check.sh

echo "🔍 Checking for public port bindings..."

# Check Docker Compose files for public port bindings
COMPOSE_FILES=$(find infra/docker -name "docker-compose*.yml" -type f)

VIOLATIONS=()
for compose_file in $COMPOSE_FILES; do
    echo "📄 Checking $compose_file"
    
    # Look for 0.0.0.0:PORT:PORT patterns
    if grep -q "0\.0\.0\.0:[0-9]\+:[0-9]\+" "$compose_file"; then
        echo "❌ Found public port binding in $compose_file:"
        grep -n "0\.0\.0\.0:[0-9]\+:[0-9]\+" "$compose_file" | while read -r line; do
            echo "  Line $line"
            VIOLATIONS+=("$compose_file:$line")
        done
    fi
    
    # Look for PORT:PORT patterns (without 127.0.0.1)
    if grep -q "^[[:space:]]*-[[:space:]]*\"[0-9]\+:[0-9]\+\"" "$compose_file"; then
        echo "❌ Found unbound port in $compose_file:"
        grep -n "^[[:space:]]*-[[:space:]]*\"[0-9]\+:[0-9]\+\"" "$compose_file" | while read -r line; do
            echo "  Line $line"
            VIOLATIONS+=("$compose_file:$line")
        done
    fi
done

# Check for any running containers with public bindings
echo "🐳 Checking running containers..."
if command -v docker >/dev/null 2>&1; then
    RUNNING_CONTAINERS=$(docker ps --format "{{.Names}}" 2>/dev/null || echo "")
    if [ -n "$RUNNING_CONTAINERS" ]; then
        for container in $RUNNING_CONTAINERS; do
            echo "📦 Checking container: $container"
            # Get port bindings for this container
            PORTS=$(docker port "$container" 2>/dev/null || echo "")
            if [ -n "$PORTS" ]; then
                echo "$PORTS" | while read -r port_binding; do
                    if [[ "$port_binding" == 0.0.0.0:* ]]; then
                        echo "❌ Container $container has public binding: $port_binding"
                        VIOLATIONS+=("container:$container:$port_binding")
                    fi
                done
            fi
        done
    fi
fi

# Check system listening ports
echo "🌐 Checking system listening ports..."
if command -v ss >/dev/null 2>&1; then
    PUBLIC_PORTS=$(ss -Hnlpt | awk '{print $4}' | grep -E '^0\.0\.0\.0:[0-9]+$' | grep -v ':80$' | grep -v ':443$' || echo "")
    if [ -n "$PUBLIC_PORTS" ]; then
        echo "❌ Found public listening ports:"
        echo "$PUBLIC_PORTS" | while read -r port; do
            echo "  $port"
            VIOLATIONS+=("system:$port")
        done
    fi
fi

# Report results
if [ ${#VIOLATIONS[@]} -gt 0 ]; then
    echo ""
    echo "❌ PORT BINDING VIOLATIONS DETECTED:"
    for violation in "${VIOLATIONS[@]}"; do
        echo "  - $violation"
    done
    echo ""
    echo "🔧 FIX: Use 127.0.0.1:PORT:PORT for all container ports"
    echo "🔧 FIX: Only Caddy should bind to 0.0.0.0 for public ingress"
    exit 1
fi

echo "✅ No public port binding violations found"
exit 0