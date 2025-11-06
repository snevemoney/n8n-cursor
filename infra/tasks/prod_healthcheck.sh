#!/usr/bin/env bash
set -euo pipefail
DOMAIN="${1:-lightningflow.online}"
echo "🔎 Health: https://${DOMAIN}"
set +e
curl -sS -I https://"${DOMAIN}"        | head -n1
curl -sS -I https://"${DOMAIN}"/api    | head -n1
curl -sS -I https://"${DOMAIN}"/logs   | head -n1
curl -sS -I https://"${DOMAIN}"/ide    | head -n1
set -e
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
