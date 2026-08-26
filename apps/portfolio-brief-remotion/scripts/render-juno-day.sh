#!/bin/bash
# Render DailyShow with Higgsfield Juno voicePack → out/daily-YYYY-MM-DD-vo-juno.mp4
#
# Higgsfield is NOT this script's job. Desk lands wavs, then this renders.
# Refuses if another render is already writing the same output (lock + pgrep).
# Do not open Studio. Leave --concurrency unset.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "${SCRIPT_DIR}/.."
# shellcheck source=./_host-gate.sh
source "${SCRIPT_DIR}/_host-gate.sh"
wealth_host_gate

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
LOCKDIR="out/.lock-daily-${DATE}-vo-juno"

if pgrep -f "remotion render src/index.ts DailyShow ${OUT}" >/dev/null 2>&1; then
  echo "refuse: another remotion render is writing ${OUT}" >&2
  exit 4
fi

if [[ -d "${LOCKDIR}" ]]; then
  oldpid=""
  if [[ -f "${LOCKDIR}/pid" ]]; then
    oldpid="$(cat "${LOCKDIR}/pid")"
  fi
  if [[ -n "${oldpid}" ]] && kill -0 "${oldpid}" 2>/dev/null; then
    echo "refuse: render already writing ${OUT} (pid ${oldpid})" >&2
    exit 4
  fi
  rm -rf "${LOCKDIR}"
fi

mkdir "${LOCKDIR}"
echo $$ > "${LOCKDIR}/pid"
cleanup() { rm -rf "${LOCKDIR}"; }
trap cleanup EXIT

npx remotion render src/index.ts DailyShow "${OUT}" \
  --props="{\"episodeId\":\"${DATE}\",\"voicePack\":\"${PACK}\"}"
ls -lh "${OUT}"
echo "pack ${PACK}  wavs ${WAVS}  ${OUT}"
