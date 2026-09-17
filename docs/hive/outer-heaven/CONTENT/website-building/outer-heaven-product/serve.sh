#!/bin/bash
# Outer Heaven product preview :4863. 127.0.0.1 only. CapEx / preview. Never deploys.
# Leaves 4017 / 4821–4831 / 4839–4842 alone. Never kills an existing listener.
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
PIDDIR="$DIR/.pids"
PORT="${OUTERHEAVEN_PORT:-4863}"
mkdir -p "$PIDDIR"

if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  existing="$(lsof -nP -iTCP:"$PORT" -sTCP:LISTEN -t 2>/dev/null | head -1 || true)"
  [ -n "$existing" ] && echo "$existing" > "$PIDDIR/$PORT.pid"
  echo "already listening on 127.0.0.1:$PORT (outer-heaven) pid=$existing"
else
  python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$DIR" >/dev/null 2>&1 &
  echo $! > "$PIDDIR/$PORT.pid"
  echo "started 127.0.0.1:$PORT → outer-heaven pid=$!"
fi

echo
echo "Shell   http://127.0.0.1:$PORT/"
echo "Line    http://127.0.0.1:$PORT/walkthrough.html   (?state=complete for the finished run · ?state=grade to land on the Grade station)"
echo "Publish / deploy stays HITL. Live / stays HOLD."
