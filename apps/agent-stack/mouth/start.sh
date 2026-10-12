#!/usr/bin/env bash
# Mouth is a write path, not a daemon. Wake-word / Space lives on the face.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
echo "mouth: ready — say JARVIS or tap Space on the face; CLI: python3 $HERE/turn.py"
exit 0
