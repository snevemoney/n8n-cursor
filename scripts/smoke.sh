#!/bin/bash
set -e
urls=(
  "https://lightningflow.online/healthz"
  "https://lightningflow.online/api/healthz"
  "https://n8ncloud.tech/healthz"
)
for u in "${urls[@]}"; do
  code=$(curl -sw '%{http_code}' -o /dev/null "$u")
  t=$(curl -sw '%{time_total}' -o /dev/null "$u")
  echo "$u -> $code in ${t}s"
  [ "$code" = "200" ] || exit 1
done
echo "✅ All production endpoints healthy"
