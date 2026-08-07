#!/usr/bin/env bash
# Phase 4 / 18: fail if OpenClaw gateway.bind is not loopback.
set -euo pipefail
CFG="${OPENCLAW_CONFIG:-/root/.openclaw/openclaw.json}"
if [[ ! -f "$CFG" ]]; then
  echo "MISSING_CONFIG $CFG"
  exit 2
fi
bind=$(node -e "const d=require(process.argv[1]); console.log(d.gateway&&d.gateway.bind)" "$CFG")
echo "bind=$bind"
if [[ "$bind" != "loopback" ]]; then
  echo "FAIL expected loopback"
  exit 1
fi
# Prefer ss if present
if command -v ss >/dev/null 2>&1; then
  if ss -lntp | grep -E '0\.0\.0\.0:18789'; then
    echo "FAIL listening on 0.0.0.0:18789"
    exit 1
  fi
  if ss -lntp | grep -E '127\.0\.0\.1:18789'; then
    echo "OK loopback listen"
  fi
fi
echo "LOOPBACK_OK"
