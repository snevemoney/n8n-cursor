#!/bin/bash
# Render Morning60 commute cut → out/morning-YYYY-MM-DD.mp4
# Voice first (so the MP4 has narration): bash scripts/render-voice.sh YYYY-MM-DD
set -euo pipefail
cd "$(dirname "$0")/.."

DATE="${1:-}"
if [[ ! "${DATE}" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
  DATE="$(basename "$(ls src/data/episodes/*.ts | sort | tail -1)" .ts)"
fi

mkdir -p out
npx remotion render src/index.ts Morning60 "out/morning-${DATE}.mp4" \
  --props="{\"episodeId\":\"${DATE}\"}"
ls -lh "out/morning-${DATE}.mp4"
