#!/usr/bin/env bash
# Targeted hotfix — sync only storage/knowledge files, rebuild Scorpion on VPS
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SSH_TARGET="${HIVE_VPS_SSH:-root@69.62.66.78}"
REMOTE_ROOT="${HIVE_VPS_REPO:-/root/domain-paths/n8n-cursor}"

FILES=(
  apps/scorpion/lib/storage/storage-detector.ts
  apps/scorpion/lib/shared-stores.ts
  apps/scorpion/app/api/knowledge/route.ts
  apps/scorpion/app/api/knowledge/recommendations/route.ts
  apps/scorpion/app/api/knowledge/bundle/route.ts
  "apps/scorpion/app/api/knowledge/[id]/route.ts"
  apps/scorpion/app/layout.tsx
  apps/scorpion/app/api/layout.ts
  apps/scorpion/next.config.js
  apps/scorpion/package.json
  apps/scorpion/Dockerfile.evenslouis
  infra/docker/docker-compose.evenslouis-paths.yml
  .dockerignore
)

for f in "${FILES[@]}"; do
  rsync -az "$ROOT/$f" "$SSH_TARGET:$REMOTE_ROOT/$f"
done

ssh -o BatchMode=yes "$SSH_TARGET" bash -s <<EOF
set -euo pipefail
cd "$REMOTE_ROOT/infra/docker"
docker compose -f docker-compose.evenslouis-paths.yml build scorpion
docker compose -f docker-compose.evenslouis-paths.yml up -d scorpion
sleep 8
curl -fsS -o /dev/null -w "healthz: %{http_code}\\n" --max-time 15 http://127.0.0.1:3003/scorpion/healthz
curl -fsS -o /dev/null -w "knowledge: %{http_code} time:%{time_total}s\\n" --max-time 20 http://127.0.0.1:3003/scorpion/api/knowledge || true
EOF

echo "Hotfix deploy complete"
