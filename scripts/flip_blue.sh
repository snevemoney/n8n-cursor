#!/bin/bash
set -euo pipefail
CADDY=/etc/caddy/Caddyfile

# Rollback: swap back to BLUE ports
sudo sed -i \
  -e 's/127\.0\.0\.1:3300/127.0.0.1:3000/g' \
  -e 's/127\.0\.0\.1:3301/127.0.0.1:3001/g' \
  -e 's/127\.0\.0\.1:3302/127.0.0.1:3002/g' \
  -e 's/127\.0\.0\.1:4300/127.0.0.1:4000/g' \
  -e 's/127\.0\.0\.1:5698/127.0.0.1:5678/g' \
  "$CADDY"

sudo caddy validate --config "$CADDY"
sudo systemctl reload caddy

echo "✅ Rolled back to BLUE stack"
