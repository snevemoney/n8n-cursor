#!/bin/bash
set -euo pipefail
CADDY=/etc/caddy/Caddyfile

# Sanity: green ports must return 200
bash scripts/green_smoke_local.sh

# Swap upstream ports in Caddyfile (3000->3300, 3001->3301, 3002->3302, 4000->4300, 5678->5698)
sudo sed -i \
  -e 's/127\.0\.0\.1:3000/127.0.0.1:3300/g' \
  -e 's/127\.0\.0\.1:3001/127.0.0.1:3301/g' \
  -e 's/127\.0\.0\.1:3002/127.0.0.1:3302/g' \
  -e 's/127\.0\.0\.1:4000/127.0.0.1:4300/g' \
  -e 's/127\.0\.0\.1:5678/127.0.0.1:5698/g' \
  "$CADDY"

sudo caddy validate --config "$CADDY"
sudo systemctl reload caddy

echo "✅ Flipped to GREEN stack"
