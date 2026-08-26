#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
DATE="${EPISODE_ID:-${1:-}}"
if [[ -z "${DATE}" ]]; then
  DATE="$(basename "$(ls src/data/episodes/*.ts | sort | tail -1)" .ts)"
fi
mkdir -p out/engine-qa
kinds=(delta worldTape calendar opportunityScout unknowns capitalPlan open)
for kind in "${kinds[@]}"; do
  echo "still $kind ($DATE)"
  npx remotion still src/index.ts EngineQA "out/engine-qa/${kind}.png" \
    --props="{\"episodeId\":\"${DATE}\",\"kind\":\"${kind}\",\"cut\":\"full\"}" \
    --frame=80
done
echo "still morning60 ($DATE)"
npx remotion still src/index.ts Morning60 "out/engine-qa/morning60.png" \
  --props="{\"episodeId\":\"${DATE}\"}" \
  --frame=80
echo "wrote out/engine-qa/ for ${DATE}"
