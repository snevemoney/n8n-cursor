#!/usr/bin/env bash
# Mouth is a write path, not a daemon. Always-on LIVE/MUTE lives on the face.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
echo "mouth: ready — LIVE/MUTE is on the face; CLI: python3 $HERE/turn.py"
exit 0
