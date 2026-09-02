#!/bin/bash
# Vale :4840 · Keyline :4841 · index :4839. 127.0.0.1 only.
# Leaves 4017 / 4821–4831 alone. Never kills an existing listener.
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
PIDDIR="$DIR/.pids"
mkdir -p "$PIDDIR"

start_if_free() {
  local port="$1"
  local root="$2"
  local label="$3"
  if lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1; then
    local existing
    existing="$(lsof -nP -iTCP:"$port" -sTCP:LISTEN -t 2>/dev/null | head -1 || true)"
    [ -n "$existing" ] && echo "$existing" > "$PIDDIR/$port.pid"
    echo "already listening on 127.0.0.1:$port ($label) pid=$existing"
    return 0
  fi
  python3 -m http.server "$port" --bind 127.0.0.1 --directory "$root" \
    >/dev/null 2>&1 &
  echo $! > "$PIDDIR/$port.pid"
  echo "started 127.0.0.1:$port → $label pid=$!"
}

start_if_free 4839 "$DIR" "index"
start_if_free 4840 "$DIR/vale" "vale"
start_if_free 4841 "$DIR/keyline" "keyline"

echo
echo "Open http://127.0.0.1:4839/  Vale :4840  Keyline :4841"
echo "Publish / deploy stays HITL."
