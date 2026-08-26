#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."
DATE="${EPISODE_ID:-${1:-}}"
if [[ -z "${DATE}" ]]; then
  DATE="$(basename "$(ls src/data/episodes/*.ts | sort | tail -1)" .ts)"
fi
mkdir -p out/engine-qa-v2
kinds=(delta lookThrough predictionBoard network consensus streak opportunityRadar capitalPlan)
for kind in "${kinds[@]}"; do
  echo "v2 still $kind ($DATE)"
  npx remotion still src/index.ts EngineQA "out/engine-qa-v2/${kind}.png" \
    --props="{\"episodeId\":\"${DATE}\",\"kind\":\"${kind}\",\"cut\":\"full\"}" \
    --frame=80
done
echo "wrote out/engine-qa-v2/ for ${DATE}"
