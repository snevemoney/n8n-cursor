#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT/env/env.production"
[[ -f "$ENV_FILE" ]] || { echo "Missing $ENV_FILE"; exit 1; }
source "$ENV_FILE"

need(){ command -v "$1" >/dev/null || { echo "Missing $1"; exit 1; }; }
need curl; need jq

AUTH=(-H "Authorization: Bearer ${CF_API_TOKEN}" -H "Content-Type: application/json")

echo "🔎 Zone lookup…"
ZONE_ID=$(curl -fsSL "https://api.cloudflare.com/client/v4/zones?name=${CF_ZONE_NAME}" "${AUTH[@]}" | jq -r '.result[0].id')
[[ "$ZONE_ID" != "null" && -n "$ZONE_ID" ]] || { echo "❌ Zone not found in Cloudflare"; exit 1; }
echo "✅ Zone: $CF_ZONE_NAME ($ZONE_ID)"

PROXIED="${CF_PROXIED:-true}"

upsert_a () {
  local host="$1" ip="$2"
  local fqdn="${host}"
  [[ "$host" == "@" ]] || fqdn="${host}.${CF_ZONE_NAME}"
  echo "↻ A ${fqdn} → ${ip} (proxied=${PROXIED})"
  RID=$(curl -fsSL "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records?type=A&name=${fqdn}" "${AUTH[@]}" | jq -r '.result[0].id')
  PAYLOAD=$(jq -n --arg type A --arg name "$host" --arg ip "$ip" --argjson prox "$PROXIED" '{type:$type,name:$name,content:$ip,ttl:1,proxied:$prox}')
  if [[ "$RID" != "null" && -n "$RID" ]]; then
    curl -fsSL -X PATCH "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records/${RID}" "${AUTH[@]}" --data "$PAYLOAD" >/dev/null
  else
    curl -fsSL -X POST  "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records"         "${AUTH[@]}" --data "$PAYLOAD" >/dev/null
  fi
}

upsert_a "@"   "$VPS_PUBLIC_IP"
upsert_a "www" "$VPS_PUBLIC_IP"
upsert_a "api" "$VPS_PUBLIC_IP"
echo "✅ DNS synced."
