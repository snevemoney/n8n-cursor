#!/usr/bin/env bash
set -euo pipefail

echo "=== CONTAINER SECURITY CHECK ==="
echo ""

echo "[1] Checking for running containers with security issues..."
echo "Containers running as root:"
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}" | while read line; do
  if [[ $line == *"root"* ]] || [[ $line == *"0:0"* ]]; then
    echo "⚠️  $line"
  fi
done

echo ""
echo "[2] Checking for containers with privileged mode..."
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}" | while read line; do
  if [[ $line == *"privileged"* ]]; then
    echo "⚠️  $line"
  fi
done

echo ""
echo "[3] Checking for containers with docker.sock mounted..."
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}" | while read line; do
  if [[ $line == *"docker.sock"* ]]; then
    echo "⚠️  $line"
  fi
done

echo ""
echo "[4] Checking for containers with read-only filesystem..."
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}" | while read line; do
  if [[ $line == *"read-only"* ]]; then
    echo "✅ $line"
  fi
done

echo ""
echo "[5] Resource usage check..."
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"

echo ""
echo "[6] Checking for suspicious network connections..."
docker ps --format "{{.Names}}" | while read container; do
  echo "Checking $container..."
  docker exec "$container" sh -c "netstat -tuln 2>/dev/null | grep -E ':(3333|4444|5555|7777|8080|9999)'" || true
done

echo ""
echo "[7] Scanning for known vulnerabilities in running images..."
docker images --format "{{.Repository}}:{{.Tag}}" | while read image; do
  echo "Scanning $image..."
  trivy image --exit-code 0 --severity CRITICAL,HIGH --ignore-unfixed "$image" || true
done

echo ""
echo "=== SECURITY CHECK COMPLETE ==="
