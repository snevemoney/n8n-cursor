#!/usr/bin/env bash
# Apply storage env to running Scorpion without rebuild (pair with code deploy for full fix)
set -euo pipefail
SSH_TARGET="${HIVE_VPS_SSH:-root@69.62.66.78}"
REMOTE_ROOT="${HIVE_VPS_REPO:-/root/domain-paths/n8n-cursor}"

ssh -o BatchMode=yes "$SSH_TARGET" bash -s <<EOF
set -euo pipefail
cd "$REMOTE_ROOT/infra/docker"
docker compose -f docker-compose.evenslouis-paths.yml up -d scorpion
sleep 5
curl -fsS -o /dev/null -w "knowledge: %{http_code} time:%{time_total}s\\n" --max-time 25 http://127.0.0.1:3003/scorpion/api/knowledge || true
EOF
