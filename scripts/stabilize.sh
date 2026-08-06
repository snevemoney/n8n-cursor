#!/usr/bin/env bash
set -euo pipefail

# Stabilization script for KVM2 box cleanup
# Usage: bash scripts/stabilize.sh [int|staging|prod]

ENV="${1:-int}"
COMPOSE="infra/docker/docker-compose.${ENV}.yml"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "🔧 Starting stabilization for environment: $ENV"
echo "📁 Compose file: $COMPOSE"
echo "⏰ Timestamp: $TIMESTAMP"

# Create stabilization directory
mkdir -p ~/stabilize && cd ~/stabilize

echo ""
echo "[1/8] 📸 Snapshot current state"
echo "=== PS (top talkers) ===" > pre_state_${TIMESTAMP}.txt
ps -eo pid,ppid,cmd,%cpu,%mem --sort=-%cpu | head -n 40 >> pre_state_${TIMESTAMP}.txt
echo -e "\n=== LISTENING PORTS ===" >> pre_state_${TIMESTAMP}.txt
ss -Hnlpt | sort -u >> pre_state_${TIMESTAMP}.txt
echo -e "\n=== DOCKER PS ===" >> pre_state_${TIMESTAMP}.txt
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}' >> pre_state_${TIMESTAMP}.txt
echo -e "\n=== SYSTEMD SERVICES (enabled) ===" >> pre_state_${TIMESTAMP}.txt
systemctl list-unit-files --type=service --state=enabled | sed '1,1d' >> pre_state_${TIMESTAMP}.txt
echo "✅ State snapshot saved to pre_state_${TIMESTAMP}.txt"

echo ""
echo "[2/8] 🛑 Stop Compose stacks cleanly"
cd ~/repo
if [ -f "$COMPOSE" ]; then
    echo "Stopping $COMPOSE..."
    docker compose -f "$COMPOSE" down
    echo "✅ Stopped $COMPOSE"
else
    echo "⚠️  No compose file found: $COMPOSE"
fi

# Stop other potential compose files
for env_file in staging prod; do
    other_compose="infra/docker/docker-compose.${env_file}.yml"
    if [ -f "$other_compose" ]; then
        echo "Stopping $other_compose..."
        docker compose -f "$other_compose" down || true
    fi
done

echo ""
echo "[3/8] 🔫 Kill stray dev servers"
# Kill any leftover dev servers
pkill -f "next dev"   || true
pkill -f "vite"       || true
pkill -f "node .*server.js" || true
pkill -f "bun.*dev"   || true
pkill -f "tsx.*watch" || true
echo "✅ Killed stray dev servers"

echo ""
echo "[4/8] 🛑 Stop PM2 if present"
if command -v pm2 >/dev/null 2>&1; then
    echo "PM2 found, saving and stopping all processes..."
    pm2 save && pm2 stop all || true
    echo "✅ PM2 processes stopped"
else
    echo "ℹ️  PM2 not found, skipping"
fi

echo ""
echo "[5/8] 🐳 Stop non-Compose containers"
echo "Current containers:"
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'

# Stop containers not part of current compose project
# Adjust these patterns based on your actual project names
for c in $(docker ps --format '{{.Names}}' | grep -Ev 'lfai|lightningflow|dozzle|codeserver|caddy|n8n'); do
    echo "Stopping stray container: $c"
    docker stop "$c" || true
done
echo "✅ Stray containers stopped"

echo ""
echo "[6/8] 🔍 Check for problematic port bindings"
echo "Ports not bound to loopback (excluding :80/:443):"
ss -Hnlpt | awk '{print $4,$6}' | grep -Ev '127\.0\.0\.1:|:80|:443' | sort -u || echo "No problematic bindings found"

echo ""
echo "[7/8] 🧹 Prune Docker junk"
echo "Removing stopped containers, dangling images, unused networks..."
docker system prune -f
echo "✅ Docker system pruned"

echo ""
echo "[8/8] 🚀 Restart Integration stack"
if [ -f "$COMPOSE" ]; then
    echo "Starting $COMPOSE..."
    docker compose -f "$COMPOSE" up -d
    echo "Waiting 10 seconds for services to start..."
    sleep 10
    echo "Container status:"
    docker compose -f "$COMPOSE" ps
    echo "✅ Stack restarted"
else
    echo "⚠️  Cannot restart: $COMPOSE not found"
fi

echo ""
echo "🎯 Verification phase"
echo "Testing public endpoints..."

# Test endpoints (adjust URLs based on your actual setup)
for url in "https://evenslouis.ca/lightningflow/healthz" "https://evenslouis.ca/lightningflow/api/healthz" "https://evenslouis.ca/n8n/healthz"; do
    if curl -fsS -I "$url" >/dev/null 2>&1; then
        echo "✅ $url - OK"
    else
        echo "❌ $url - FAILED"
    fi
done

echo ""
echo "📊 Final port check"
echo "All listening ports:"
ss -Hnlpt | sort -u

echo ""
echo "🎉 Stabilization complete!"
echo "📁 State snapshots saved in ~/stabilize/"
echo "🔍 Check pre_state_${TIMESTAMP}.txt for before/after comparison"
