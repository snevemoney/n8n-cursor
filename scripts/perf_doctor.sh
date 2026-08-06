#!/usr/bin/env bash
set -e

echo "🔍 LightningFlow Performance Doctor"
echo "=================================="
echo "Timestamp: $(date)"
echo ""

echo "== System Load =="
uptime
echo ""

echo "== Top CPU Processes =="
ps -eo pid,cmd,%cpu,%mem --sort=-%cpu | head -n 8
echo ""

echo "== Memory Usage =="
free -h
echo ""

echo "== Swap Usage =="
vmstat 1 3 | tail -n 1
echo ""

echo "== Docker Container Stats =="
docker ps --format 'table {{.Names}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.Status}}'
echo ""

echo "== Redis Stats =="
if command -v redis-cli &> /dev/null; then
    redis-cli info stats | egrep 'ops_per_sec|rejected|evicted|hits|misses' || echo "Redis not accessible"
else
    echo "Redis CLI not found"
fi
echo ""

echo "== Network Connections =="
ss -Hntp | grep ':5678\|:5679\|:9001\|:8443' | wc -l | xargs echo "Active connections to services:"
echo ""

echo "== Health Check Endpoints =="
echo "Testing local endpoints..."

# Test local API
if curl -fsS http://localhost:5678/api/system-check >/dev/null 2>&1; then
    echo "✅ API (localhost:5678): OK"
else
    echo "❌ API (localhost:5678): FAILED"
fi

# Test n8n
if curl -fsS http://localhost:5679/healthz >/dev/null 2>&1; then
    echo "✅ n8n (localhost:5679): OK"
else
    echo "❌ n8n (localhost:5679): FAILED"
fi

# Test dozzle
if curl -fsS http://localhost:9001 >/dev/null 2>&1; then
    echo "✅ Dozzle (localhost:9001): OK"
else
    echo "❌ Dozzle (localhost:9001): FAILED"
fi

echo ""

echo "== External Health Checks =="
echo "Testing external endpoints..."

# Test main site
if time curl -fsS https://evenslouis.ca/lightningflow/ >/dev/null 2>&1; then
    echo "✅ lightningflow.online: OK"
else
    echo "❌ lightningflow.online: FAILED"
fi

# Test n8n site
if time curl -fsS https://evenslouis.ca/n8n/ >/dev/null 2>&1; then
    echo "✅ evenslouis.ca/n8n: OK"
else
    echo "❌ evenslouis.ca/n8n: FAILED"
fi

echo ""

echo "== Caddy Status =="
systemctl is-active caddy || echo "Caddy not running"
echo ""

echo "== Disk Usage =="
df -h / | tail -n 1
echo ""

echo "== Recent Errors =="
journalctl --since "1 hour ago" --priority=err --no-pager | tail -n 5 || echo "No recent errors"
echo ""

echo "🔍 Performance Doctor Complete"
echo "Run this script every 15 minutes during load testing"
