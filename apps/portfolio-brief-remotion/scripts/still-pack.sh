#!/bin/bash
# 4 chat-ready stills: tape, streak-or-delta, capital plan, opportunity-or-trigger
set -euo pipefail
cd "$(dirname "$0")/.."
DATE="${EPISODE_ID:-${1:-}}"
if [[ -z "${DATE}" ]]; then
  DATE="$(basename "$(ls src/data/episodes/*.ts | sort | tail -1)" .ts)"
fi
mkdir -p out/still-pack

still() {
  local kind="$1"
  local dest="$2"
  echo "still-pack ${kind} → ${dest}"
  npx remotion still src/index.ts EngineQA "${dest}" \
    --props="{\"episodeId\":\"${DATE}\",\"kind\":\"${kind}\",\"cut\":\"full\"}" \
    --frame=80
}

still worldTape "out/still-pack/01-tape.png"
still delta "out/still-pack/02-streak-or-delta.png"
still capitalPlan "out/still-pack/03-capital-plan.png"
still opportunityScout "out/still-pack/04-opportunity-or-trigger.png"

cat > out/still-pack/README.txt <<EOF
16:9 stills for chat (${DATE}).
01-tape — world tape (GLOBAL / US / CA; empty lanes omitted)
02-streak-or-delta — overnight delta, or first-episode / no prior tape
03-capital-plan
04-opportunity-or-trigger — scout board (empty = no new names)

Center-crop 1080×1080 if you need a phone square. Do not invent numbers on the still.
EOF

if command -v ffmpeg >/dev/null 2>&1; then
  for src in out/still-pack/0{1,2,3,4}-*.png; do
    base="$(basename "${src}" .png)"
    ffmpeg -y -i "${src}" -vf "crop=1080:1080:420:0" "out/still-pack/${base}-square.png" >/dev/null 2>&1 || true
  done
  echo "square crops written (ffmpeg)"
else
  echo "ffmpeg not found — 16:9 only (labeled for chat)"
fi

echo "wrote out/still-pack/ for ${DATE}"
