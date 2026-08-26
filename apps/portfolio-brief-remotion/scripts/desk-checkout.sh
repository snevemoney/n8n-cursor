#!/bin/bash
# Pull origin/main onto THIS computer (Grok desktop or Evens Mac) so
# Wealth Manager can npm-render without waiting for Cursor.
# Cursor Cloud /workspace: abort.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

HERE="$(pwd -P 2>/dev/null || pwd)"
if [[ "${HERE}" == /workspace ]] || [[ "${HERE}" == /workspace/* ]]; then
  echo "Cursor Cloud /workspace is not a Remotion host." >&2
  exit 3
fi

if ! command -v git >/dev/null 2>&1; then
  echo "git missing on this desktop." >&2
  exit 2
fi
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "node/npm missing on this desktop. Remotion needs both. Do not wait for Cursor." >&2
  exit 2
fi

REPO="${WEALTH_DESK_REPO:-${HOME}/n8n-cursor}"
REMOTE="${WEALTH_DESK_REMOTE:-https://github.com/snevemoney/n8n-cursor.git}"

if [[ ! -d "${REPO}/.git" ]]; then
  echo "cloning origin/main → ${REPO}"
  git clone --depth 1 --branch main "${REMOTE}" "${REPO}"
else
  echo "updating ${REPO} to origin/main"
  git -C "${REPO}" fetch origin main
  git -C "${REPO}" checkout main
  git -C "${REPO}" pull --ff-only origin main
fi

ENGINE="${REPO}/apps/portfolio-brief-remotion"
if [[ ! -d "${ENGINE}" ]]; then
  echo "apps/portfolio-brief-remotion missing on $(git -C "${REPO}" rev-parse HEAD). Wrong SHA, not a missing product." >&2
  exit 2
fi

cd "${ENGINE}"
# shellcheck source=./_host-gate.sh
source "${SCRIPT_DIR}/_host-gate.sh"
wealth_host_gate

if [[ ! -d node_modules ]]; then
  echo "npm install (in-folder — do not use workspace pnpm)"
  npm install
fi

echo "DESK_REPO=${REPO}"
echo "ENGINE=${ENGINE}"
echo "SHA=$(git -C "${REPO}" rev-parse --short HEAD)"
echo "DESK_MP4=${ENGINE}/out/daily-YYYY-MM-DD-vo-juno.mp4"
echo "HOST_OK"
