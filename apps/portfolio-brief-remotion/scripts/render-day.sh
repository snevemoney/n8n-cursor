#!/bin/bash
# Render DailyShow for one registered episode → out/daily-YYYY-MM-DD.mp4
# Voice first (so the MP4 has narration): bash scripts/render-voice.sh YYYY-MM-DD
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "${SCRIPT_DIR}/.."
# shellcheck source=./_host-gate.sh
source "${SCRIPT_DIR}/_host-gate.sh"
wealth_host_gate

DATE="${1:-}"
if [[ ! "${DATE}" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
  echo "usage: scripts/render-day.sh YYYY-MM-DD" >&2
  exit 1
fi

mkdir -p out
npx remotion render src/index.ts DailyShow "out/daily-${DATE}.mp4" \
  --props="{\"episodeId\":\"${DATE}\"}"
ls -lh "out/daily-${DATE}.mp4"
