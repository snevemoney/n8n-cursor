#!/bin/bash
set -e
echo "🧪 Integration Environment Smoke Test"
echo "===================================="

urls=(
  "https://int.lightningflow.online/healthz"
  "https://int.lightningflow.online/api/healthz"
  "https://int.n8ncloud.tech/healthz"
)

for u in "${urls[@]}"; do
  echo -n "Testing $u... "
  code=$(curl -sw '%{http_code}' -o /dev/null "$u")
  t=$(curl -sw '%{time_total}' -o /dev/null "$u")
  echo "$code in ${t}s"
  [ "$code" = "200" ] || { echo "❌ Integration smoke test failed"; exit 1; }
done

echo "✅ Integration environment healthy"
