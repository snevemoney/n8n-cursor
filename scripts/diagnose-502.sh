#!/bin/bash
set -e

echo "🔍 Diagnosing 502 Bad Gateway issues..."
echo "======================================"

echo "1. Checking Caddy status:"
sudo systemctl status caddy --no-pager -l

echo -e "\n2. Checking what's listening on ports:"
ss -Hlnpt | grep -E ':80|:443|:3000|:3001|:3002|:4000|:5678' || echo "No services listening on expected ports"

echo -e "\n3. Checking Docker containers:"
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' || echo "No Docker containers running"

echo -e "\n4. Testing local service connectivity:"
echo "Testing n8n (port 5678):"
curl -sS http://127.0.0.1:5678/ | head -n1 || echo "❌ n8n not responding"

echo "Testing API (port 4000):"
curl -sS http://127.0.0.1:4000/api/healthz || echo "❌ API not responding"

echo "Testing landing (port 3000):"
curl -sS http://127.0.0.1:3000/healthz || echo "❌ Landing not responding"

echo -e "\n5. Testing Caddy routing:"
echo "Testing n8ncloud.tech routing:"
curl -sS -H 'Host: n8ncloud.tech' http://127.0.0.1:80/ | head -n1 || echo "❌ Caddy routing failed"

echo "Testing lightningflow.online routing:"
curl -sS -H 'Host: lightningflow.online' http://127.0.0.1:80/healthz || echo "❌ Caddy routing failed"

echo -e "\n6. Checking Caddy logs (last 10 lines):"
sudo journalctl -u caddy -n 10 --no-pager

echo -e "\n✅ Diagnosis complete!"
