#!/bin/bash
# Field Manuals product preview :4866. 127.0.0.1 only. CapEx / preview. Never deploys.
# Leaves 4017 / 4821–4831 / 4839–4842 alone. Never kills an existing listener.
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
PIDDIR="$DIR/.pids"
PORT="${FIELDMANUALS_PORT:-4866}"
mkdir -p "$PIDDIR"

if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  existing="$(lsof -nP -iTCP:"$PORT" -sTCP:LISTEN -t 2>/dev/null | head -1 || true)"
  [ -n "$existing" ] && echo "$existing" > "$PIDDIR/$PORT.pid"
  echo "already listening on 127.0.0.1:$PORT (field-manuals) pid=$existing"
else
  python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$DIR" >/dev/null 2>&1 &
  echo $! > "$PIDDIR/$PORT.pid"
  echo "started 127.0.0.1:$PORT → field-manuals pid=$!"
fi

echo
echo "Shell   http://127.0.0.1:$PORT/"
echo "Manual  http://127.0.0.1:$PORT/manual.html   (?state=open&manual=m2 lands open in hand · ?state=held&manual=m1 lifted, not yet open)"
echo "Publish / deploy stays HITL. Live / stays HOLD."
