#!/usr/bin/env bash
# Discover working N8N_API_KEY on VPS and append to hub .env (never prints key)
set -euo pipefail

SSH_TARGET="${HIVE_VPS_SSH:-root@69.62.66.78}"
REMOTE_ENV="${HIVE_VPS_REPO:-/root/domain-paths/n8n-cursor}/.env"
N8N_API="${N8N_API_URL:-http://127.0.0.1:5678/api/v1}"

ssh -o BatchMode=yes "$SSH_TARGET" bash -s <<'REMOTE'
set -euo pipefail
REMOTE_ENV="/root/domain-paths/n8n-cursor/.env"
N8N_API="http://127.0.0.1:5678/api/v1"
test_key() {
  local key="$1"
  [[ -n "$key" ]] || return 1
  local code
  code=$(curl -sS -o /dev/null -w '%{http_code}' -H "X-N8N-API-KEY: ${key}" "${N8N_API}/workflows?limit=1" 2>/dev/null || echo "000")
  [[ "$code" == "200" ]]
}

# Search order per plan
CANDIDATES=(
  "$(grep '^N8N_API_KEY=' "$REMOTE_ENV" 2>/dev/null | cut -d= -f2- || true)"
  "$(grep '^N8N_API_KEY=' /root/domain-paths/n8n-cursor/.env.dev 2>/dev/null | cut -d= -f2- || true)"
  "$(grep '^N8N_API_KEY=' /home/evens/n8n-cursor/.env.hive 2>/dev/null | cut -d= -f2- || true)"
  "$(docker inspect n8n-cursor-n8n-1 --format '{{range .Config.Env}}{{println .}}{{end}}' 2>/dev/null | grep '^N8N_API_KEY=' | cut -d= -f2- || true)"
)

FOUND=""
for k in "${CANDIDATES[@]}"; do
  if test_key "$k"; then
    FOUND="$k"
    break
  fi
done

if [[ -z "$FOUND" ]]; then
  echo "No working N8N_API_KEY found in env files or container."
  echo "Use CLI import instead: bash scripts/hive/n8n-import-via-cli.sh workflows/hive/....json --publish"
  echo "Or create a key in n8n UI → Settings → API → Create API key, then:"
  echo "  echo 'N8N_API_KEY=...' >> $REMOTE_ENV"
  exit 1
fi

if grep -q '^N8N_API_KEY=' "$REMOTE_ENV" 2>/dev/null; then
  sed -i "s|^N8N_API_KEY=.*|N8N_API_KEY=${FOUND}|" "$REMOTE_ENV"
else
  echo "N8N_API_KEY=${FOUND}" >> "$REMOTE_ENV"
fi
echo "OK: working N8N_API_KEY written to $REMOTE_ENV (len=${#FOUND})"
REMOTE

echo "==> discover-n8n-api-key complete"
