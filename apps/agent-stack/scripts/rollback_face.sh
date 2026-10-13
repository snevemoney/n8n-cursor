#!/usr/bin/env bash
# rollback_face.sh [4018] <good-sha>
# Puts the Jarvis Face tree back on a known-good commit and restarts its launchd job.
# Local Mac only. Prints no env or keys. Refuses a dirty tree (stash or commit first).
#   4018 -> ~/jarvis-main   (launchd ai.grok.jarvis-face) — the only live Face.
# :4019 (ai.grok.jarvis-face-4019) was retired 2026-10-13; it is no longer a target.
set -euo pipefail
if [[ $# -ge 2 ]]; then PORT="$1"; SHA="$2"; else PORT=4018; SHA="${1:?usage: rollback_face.sh [4018] <sha>}"; fi
case "$PORT" in
  4018) DIR="$HOME/jarvis-main"; JOB=ai.grok.jarvis-face ;;
  4019) echo ":4019 is retired (2026-10-13); only 4018 is live" >&2; exit 2 ;;
  *) echo "port must be 4018" >&2; exit 2 ;;
esac
git -C "$DIR" diff --quiet && git -C "$DIR" diff --cached --quiet || { echo "refused: $DIR has local changes" >&2; exit 3; }
git -C "$DIR" cat-file -e "$SHA^{commit}" 2>/dev/null || git -C "$DIR" fetch -q origin
PREV=$(git -C "$DIR" rev-parse --short HEAD)
git -C "$DIR" checkout -q --detach "$SHA"
launchctl kickstart -k "gui/$(id -u)/$JOB"
for _ in $(seq 1 30); do curl -sf -m2 "http://127.0.0.1:$PORT/healthz" >/dev/null && break; sleep 1; done
echo "rollback: $PORT $PREV -> $(git -C "$DIR" rev-parse --short HEAD); healthz $(curl -s -m2 -o /dev/null -w '%{http_code}' http://127.0.0.1:$PORT/healthz)"
