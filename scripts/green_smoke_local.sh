#!/bin/bash
set -e
# test GREEN ports directly (example: 3300=landing, 4300=api, 5698=n8n)
for u in http://127.0.0.1:3300/healthz http://127.0.0.1:4300/health http://127.0.0.1:5698/; do
  code=$(curl -sw '%{http_code}' -o /dev/null "$u")
  [ "$code" = "200" ] || { echo "Fail $u -> $code"; exit 1; }
done
echo "✅ All GREEN services healthy"
