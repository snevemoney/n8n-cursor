#!/bin/bash
set -e
echo "🧪 Staging Environment Smoke Test"
echo "================================="

urls=(
  "https://staging.lightningflow.online/healthz"
  "https://staging.lightningflow.online/api/healthz"
  "https://staging.n8ncloud.tech/healthz"
)

for u in "${urls[@]}"; do
  echo -n "Testing $u... "
  code=$(curl -sw '%{http_code}' -o /dev/null "$u")
  t=$(curl -sw '%{time_total}' -o /dev/null "$u")
  echo "$code in ${t}s"
  [ "$code" = "200" ] || { echo "❌ Staging smoke test failed"; exit 1; }
done

echo "✅ Staging environment healthy"
