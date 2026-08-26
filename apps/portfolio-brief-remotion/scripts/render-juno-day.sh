#!/bin/bash
# Render DailyShow with Higgsfield Juno voicePack → out/daily-YYYY-MM-DD-vo-juno.mp4
#
# Higgsfield is NOT this script's job. The Wealth Manager desk calls MCP
# (generate_audio get_cost first, use_unlim false, Juno preset
# a3ce02fe-4d3e-55bc-b4d4-a4801b9acdb4) and lands wavs in
# public/voice/YYYY-MM-DD/full-higgs-juno/ (or full-higgs-juno-YYYY-MM-DD).
# Grok Mac ExternalShell / Cursor Shell then runs this after wavs land.
#
# If the Juno pack is missing: exit 2 and print the fallback. Do not call
# Higgsfield. Do not loop mcp_auth. Optional FALLBACK=say runs local macOS
# say + render-day.sh (artifact is out/daily-YYYY-MM-DD.mp4, not -vo-juno).
set -euo pipefail
cd "$(dirname "$0")/.."

DATE="${1:-}"
if [[ ! "${DATE}" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]]; then
  echo "usage: scripts/render-juno-day.sh YYYY-MM-DD" >&2
  echo "Higgsfield Juno is the desk (MCP). This script only remotion-renders after wavs land." >&2
  exit 1
fi

PACK="${VOICE_PACK:-}"
if [[ -z "${PACK}" ]]; then
  if [[ -f "public/voice/${DATE}/full-higgs-juno/cues.json" ]]; then
    PACK="full-higgs-juno"
  elif [[ -f "public/voice/${DATE}/full-higgs-juno-${DATE}/cues.json" ]]; then
    PACK="full-higgs-juno-${DATE}"
  fi
fi

wav_count() {
  local dir="$1"
  find "$dir" -maxdepth 1 -name '*.wav' ! -name '*-raw.wav' 2>/dev/null | wc -l | tr -d ' '
}

if [[ -z "${PACK}" ]]; then
  echo "No Juno pack at public/voice/${DATE}/full-higgs-juno/ (or full-higgs-juno-${DATE}/)." >&2
  echo "Higgsfield is the desk's job: plugin-higgsfield-higgsfield generate_audio" >&2
  echo "  get_cost first · use_unlim false · voice Juno a3ce02fe-4d3e-55bc-b4d4-a4801b9acdb4" >&2
  echo "If Higgsfield balance session expired: do not loop mcp_auth. FALLBACK=say $0 ${DATE}" >&2
  if [[ "${FALLBACK:-}" == "say" ]]; then
    echo "FALLBACK=say — local macOS say (Reed/Samantha). Artifact will not be -vo-juno." >&2
    bash scripts/render-voice.sh "${DATE}"
    bash scripts/render-day.sh "${DATE}"
    ls -lh "out/daily-${DATE}.mp4"
    exit 0
  fi
  exit 2
fi

PACK_DIR="public/voice/${DATE}/${PACK}"
CUES="${PACK_DIR}/cues.json"
WAVS="$(wav_count "${PACK_DIR}")"
if [[ ! -f "${CUES}" ]] || [[ "${WAVS}" -lt 1 ]]; then
  echo "Pack ${PACK_DIR} has no cues.json or wavs (${WAVS} wavs). Desk must land Higgsfield Juno first." >&2
  exit 2
fi

mkdir -p out
OUT="out/daily-${DATE}-vo-juno.mp4"
npx remotion render src/index.ts DailyShow "${OUT}" \
  --props="{\"episodeId\":\"${DATE}\",\"voicePack\":\"${PACK}\"}"
ls -lh "${OUT}"
echo "pack ${PACK}  wavs ${WAVS}  ${OUT}"
