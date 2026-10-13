#!/usr/bin/env bash
# rollback_face.sh <port 4018|4019> <good-sha>
# Puts the Jarvis Face tree for a port back on a known-good commit and restarts its launchd job.
# Local Mac only. Prints no env or keys. Refuses a dirty tree (stash or commit first).
#   4018 -> ~/jarvis-main   (launchd ai.grok.jarvis-face)
#   4019 -> $JARVIS_4019_DIR or ~/jarvis-main (launchd ai.grok.jarvis-face-4019)
set -euo pipefail
PORT="${1:?usage: rollback_face.sh <4018|4019> <sha>}"; SHA="${2:?good sha (e.g. a96e52265)}"
case "$PORT" in
  4018) DIR="$HOME/jarvis-main"; JOB=ai.grok.jarvis-face ;;
  4019) DIR="${JARVIS_4019_DIR:-$HOME/jarvis-main}"; JOB=ai.grok.jarvis-face-4019 ;;
  *) echo "port must be 4018 or 4019" >&2; exit 2 ;;
esac
git -C "$DIR" diff --quiet && git -C "$DIR" diff --cached --quiet || { echo "refused: $DIR has local changes" >&2; exit 3; }
git -C "$DIR" cat-file -e "$SHA^{commit}" 2>/dev/null || git -C "$DIR" fetch -q origin
PREV=$(git -C "$DIR" rev-parse --short HEAD)
git -C "$DIR" checkout -q --detach "$SHA"
launchctl kickstart -k "gui/$(id -u)/$JOB"
for _ in $(seq 1 30); do curl -sf -m2 "http://127.0.0.1:$PORT/healthz" >/dev/null && break; sleep 1; done
echo "rollback: $PORT $PREV -> $(git -C "$DIR" rev-parse --short HEAD); healthz $(curl -s -m2 -o /dev/null -w '%{http_code}' http://127.0.0.1:$PORT/healthz)"
