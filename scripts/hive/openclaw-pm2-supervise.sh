#!/usr/bin/env bash
# PM2 supervisor for OpenClaw — avoids duplicate gateway restart storm.
# If gateway already listens on :18789, supervise that PID (do not spawn another).
# If down, start one foreground gateway (exec).
set -euo pipefail

PORT="${OPENCLAW_GATEWAY_PORT:-18789}"
export PATH="/opt/node22/bin:${PATH:-}"

health() {
  curl -fsS --max-time 3 "http://127.0.0.1:${PORT}/health" >/dev/null 2>&1
}

gateway_pid() {
  ss -tlnp 2>/dev/null | grep ":${PORT}" | sed -n 's/.*pid=\([0-9]*\).*/\1/p' | head -1
}

if health; then
  pid="$(gateway_pid)"
  if [[ -n "${pid}" ]]; then
    echo "[openclaw-pm2] healthy — supervising pid=${pid}"
    while kill -0 "${pid}" 2>/dev/null; do sleep 30; done
    echo "[openclaw-pm2] gateway pid ${pid} exited"
    exit 1
  fi
fi

echo "[openclaw-pm2] starting gateway on :${PORT}"
openclaw gateway stop 2>/dev/null || true
sleep 2
pkill -f "openclaw.mjs gateway" 2>/dev/null || true
pkill -f "openclaw/dist/index.js gateway" 2>/dev/null || true
pkill -f "openclaw-gateway" 2>/dev/null || true
sleep 2

exec /opt/node22/bin/node /opt/node22/lib/node_modules/openclaw/openclaw.mjs gateway --port "${PORT}"
