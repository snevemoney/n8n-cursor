#!/usr/bin/env bash
# Rebuild and redeploy the full Scorpion Next.js app on the evenslouis path stack.
# Intended to run inside cursor-ops (host roots mounted at /root-host).
set -euo pipefail

REPO="${REPO:-/root-host/domain-paths/n8n-cursor}"
COMPOSE="infra/docker/docker-compose.evenslouis-paths.yml"
MARKER="${MARKER:-MARKER_RESTORE_SCORPION}"

echo "$MARKER"
cd "$REPO"

echo "== git =="
git fetch origin cursor/n8n-domain-migration-59dd
git checkout cursor/n8n-domain-migration-59dd
git pull --ff-only origin cursor/n8n-domain-migration-59dd
git rev-parse --short HEAD
git log -1 --oneline

echo "== disk before =="
df -h / /root-host 2>/dev/null || df -h /

echo "== docker prune (safe) =="
docker container prune -f >/dev/null || true
docker image prune -f >/dev/null || true
docker builder prune -f --filter 'until=24h' >/dev/null || true
# Drop failed/partial scorpion build layers if present
docker images --format '{{.Repository}}:{{.Tag}} {{.ID}} {{.Size}}' | head -40 || true

echo "== disk after prune =="
df -h / /root-host 2>/dev/null || df -h /

echo "== build scorpion =="
export DOCKER_BUILDKIT=1
docker compose -f "$COMPOSE" build --progress=plain scorpion

echo "== up scorpion =="
docker compose -f "$COMPOSE" up -d --no-deps scorpion

echo "== wait health =="
ok=0
for i in $(seq 1 40); do
  body="$(curl -fsS http://127.0.0.1:3003/scorpion/healthz 2>/dev/null || true)"
  echo "try=$i body=${body:0:200}"
  if echo "$body" | grep -q '"ok":true' && ! echo "$body" | grep -q '"mode":"stub"'; then
    ok=1
    break
  fi
  sleep 3
done

echo "== containers =="
docker compose -f "$COMPOSE" ps scorpion || true
docker ps --filter name=scorpion --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Size}}' || true

if [[ "$ok" -ne 1 ]]; then
  echo "RESTORE_FAILED: still stub or unhealthy"
  docker compose -f "$COMPOSE" logs --tail=80 scorpion || true
  exit 1
fi

echo "RESTORE_OK: full Scorpion is up"
echo "$body"
