#!/bin/bash
set -e
urls=(
  "https://evenslouis.ca/lightningflow/healthz"
  "https://evenslouis.ca/lightningflow/api/healthz"
  "https://evenslouis.ca/lightningflow/ops/healthz"
  "https://evenslouis.ca/pro/api/health"
  "https://evenslouis.ca/n8n/healthz"
  "https://lightningflow.online/"
  "https://evenslouis.pro/"
)
for u in "${urls[@]}"; do
  code=$(curl -Lsw '%{http_code}' -o /dev/null "$u")
  t=$(curl -Lsw '%{time_total}' -o /dev/null "$u")
  echo "$u -> $code in ${t}s"
  [ "$code" = "200" ] || exit 1
done
echo "✅ All production endpoints healthy"
