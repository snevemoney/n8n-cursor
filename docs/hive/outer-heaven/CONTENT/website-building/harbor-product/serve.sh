#!/bin/bash
# Harbor & Co. product preview :4847. 127.0.0.1 only. CapEx / preview. Never deploys.
# Leaves 4017 / 4821–4831 / 4839–4842 and the other /work slices alone. Never kills an existing listener.
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
PIDDIR="$DIR/.pids"
PORT="${HARBOR_PORT:-4847}"
mkdir -p "$PIDDIR"

if lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  existing="$(lsof -nP -iTCP:"$PORT" -sTCP:LISTEN -t 2>/dev/null | head -1 || true)"
  [ -n "$existing" ] && echo "$existing" > "$PIDDIR/$PORT.pid"
  echo "already listening on 127.0.0.1:$PORT (harbor) pid=$existing"
else
  python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$DIR" >/dev/null 2>&1 &
  echo $! > "$PIDDIR/$PORT.pid"
  echo "started 127.0.0.1:$PORT → harbor pid=$!"
fi

echo
echo "Shell   http://127.0.0.1:$PORT/"
echo "Door    http://127.0.0.1:$PORT/job.html   (?state=booked for the visit-on-calendar picture)"
echo "Publish / deploy stays HITL. Live / stays HOLD."
