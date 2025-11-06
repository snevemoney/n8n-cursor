#!/usr/bin/env bash
set -euo pipefail
if ! command -v caddy >/dev/null 2>&1; then
  echo "📦 Installing Caddy…"
  sudo apt-get update -y
  sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
  sudo apt-get update -y && sudo apt-get install -y caddy
fi
# open ports (safe to re-run)
if command -v ufw >/dev/null 2>&1; then sudo ufw allow 80,443/tcp || true; fi
echo "✅ Caddy ready."
