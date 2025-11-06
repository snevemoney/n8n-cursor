#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV="$ROOT/env/env.production"
[[ -f "$ENV" ]] || { echo "Missing $ENV"; exit 1; }
source "$ENV"

# 0) deps
command -v jq >/dev/null || sudo apt-get update -y && sudo apt-get install -y jq gettext-base

# 1) Caddy
bash "$ROOT/caddy/install_or_update_caddy.sh"

# 2) Sync DNS (also flips to orange-cloud if CF_PROXIED=true)
bash "$ROOT/cloudflare/sync_dns.sh"

# 3) Render Caddyfile
PRIMARY_DOMAIN="$CF_ZONE_NAME"
sudo mkdir -p /var/www/lightningflow
sudo bash -c "PRIMARY_DOMAIN='${PRIMARY_DOMAIN}' API_UPSTREAM='${API_UPSTREAM}' LOGS_UPSTREAM='${LOGS_UPSTREAM}' IDE_UPSTREAM='${IDE_UPSTREAM}' envsubst < '$ROOT/caddy/Caddyfile.prod.tpl' > /etc/caddy/Caddyfile"
sudo systemctl reload caddy || sudo systemctl restart caddy

# 4) Docker / Compose
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker $USER
fi
if ! docker compose version >/dev/null 2>&1; then
  sudo apt-get update -y && sudo apt-get install -y docker-compose-plugin
fi
mkdir -p "${PROD_DATA_ROOT}" "${N8N_DATA}" "${DOZZLE_DATA}" "${CODE_SERVER_DATA}"

# 5) Bring up stack
docker compose -f "$ROOT/docker/docker-compose.prod.yml" --env-file "$ENV" up -d

# 6) systemd unit
SVC=/etc/systemd/system/lf-prod.service
sudo bash -c "REPO_DIR='$(cd "$ROOT/.." && pwd)' envsubst < '$ROOT/systemd/lf-prod.service.tpl' > '$SVC'"
sudo systemctl daemon-reload
sudo systemctl enable lf-prod.service
sudo systemctl restart lf-prod.service

echo "🎉 Production bootstrap finished for https://${PRIMARY_DOMAIN}"
