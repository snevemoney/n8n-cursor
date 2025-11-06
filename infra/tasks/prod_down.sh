#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV="$ROOT/env/env.production"
[[ -f "$ENV" ]] || { echo "Missing $ENV"; exit 1; }
source "$ENV"
sudo systemctl stop lf-prod.service || true
docker compose -f "$ROOT/docker/docker-compose.prod.yml" --env-file "$ENV" down
echo "✅ Stack stopped."
