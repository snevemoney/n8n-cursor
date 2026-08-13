#!/usr/bin/env bash
# Deploy evenslouis.ca path stack (Scorpion + optional services) on VPS
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SSH_TARGET="${HIVE_VPS_SSH:-root@69.62.66.78}"
REMOTE_ROOT="${HIVE_VPS_REPO:-/root/domain-paths/n8n-cursor}"
COMPOSE_FILE="infra/docker/docker-compose.evenslouis-paths.yml"
SERVICE="${HIVE_DEPLOY_SERVICE:-scorpion}"

echo "==> Sync hub → $SSH_TARGET:$REMOTE_ROOT"
rsync -az --delete \
  --exclude node_modules --exclude .git --exclude '.next' --exclude test-results \
  --exclude apps/lightningflow --exclude apps/portfolio --exclude apps/n8n-cursor \
  --exclude logs --exclude '.scorpion/conversations' \
  --exclude .env --exclude '.env.*' \
  "$ROOT/" "$SSH_TARGET:$REMOTE_ROOT/"

echo "==> Rebuild $SERVICE on VPS"
ssh -o BatchMode=yes "$SSH_TARGET" bash -s <<EOF
set -euo pipefail
cd "$REMOTE_ROOT/infra/docker"
docker compose --env-file ../../.env -f docker-compose.evenslouis-paths.yml build "$SERVICE"
docker compose --env-file ../../.env -f docker-compose.evenslouis-paths.yml up -d "$SERVICE"
docker compose --env-file ../../.env -f docker-compose.evenslouis-paths.yml ps "$SERVICE"
curl -fsS -o /dev/null -w "healthz: %{http_code}\n" --max-time 15 http://127.0.0.1:3003/scorpion/healthz
curl -fsS -o /dev/null -w "knowledge: %{http_code} time:%{time_total}s\n" --max-time 20 http://127.0.0.1:3003/scorpion/api/knowledge || true
EOF

echo "==> Deploy complete"
