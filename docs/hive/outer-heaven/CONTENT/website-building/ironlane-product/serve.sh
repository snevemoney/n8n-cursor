#!/bin/bash
# Ironlane product preview :4842. 127.0.0.1 only. CapEx / preview. Never deploys.
# Leaves 4017 / 4821–4831 / 4839–4841 alone. Never kills an existing listener.
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
PIDDIR="$DIR/.pids"
PORT="${IRONLANE_PORT:-4842}"
mkdir -p "$PIDDIR"

if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  existing="$(lsof -nP -iTCP:"$PORT" -sTCP:LISTEN -t 2>/dev/null | head -1 || true)"
  [ -n "$existing" ] && echo "$existing" > "$PIDDIR/$PORT.pid"
  echo "already listening on 127.0.0.1:$PORT (ironlane) pid=$existing"
else
  python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$DIR" >/dev/null 2>&1 &
  echo $! > "$PIDDIR/$PORT.pid"
  echo "started 127.0.0.1:$PORT → ironlane pid=$!"
fi

echo
echo "Shell   http://127.0.0.1:$PORT/"
echo "Book    http://127.0.0.1:$PORT/book.html   (?state=confirmed for the full week)"
echo "Check   http://127.0.0.1:$PORT/check.html  (?url=ironlane.example | dm-only-gym.example)"
echo "Publish / deploy stays HITL. Live / stays HOLD."
