#!/usr/bin/env bash
# Dev binary for the floating orb. Finder mini-app: install-orb-app.sh
# Floating orb on the existing face. 127.0.0.1 only.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
PORT="${AGENT_STACK_FACE_PORT:-4018}"
URL="http://127.0.0.1:${PORT}/healthz"
if ! python3 - "$URL" <<'PY'
import sys, urllib.request
url = sys.argv[1]
try:
    urllib.request.urlopen(url, timeout=2)
except Exception:
    sys.exit(1)
PY
then
  echo "face is dark. start apps/agent-stack/face/start.sh first."
  exit 2
fi
mkdir -p "$HERE/bin"
BIN="$HERE/bin/jarvis-widget"
ORB_ARCH="$(/usr/bin/uname -m)"
ORB_MIN_OS="$(/usr/bin/plutil -extract LSMinimumSystemVersion raw -o - "$HERE/Info.plist")"
if [[ ! -x "$BIN" || "$HERE/widget.swift" -nt "$BIN" || "$HERE/Info.plist" -nt "$BIN" || "$HERE/widget.sh" -nt "$BIN" ]]; then
  /usr/bin/swiftc -O -target "${ORB_ARCH}-apple-macosx${ORB_MIN_OS}" -framework Cocoa -framework WebKit -o "$BIN" "$HERE/widget.swift"
fi
export AGENT_STACK_FACE_PORT="$PORT"
exec "$BIN"
