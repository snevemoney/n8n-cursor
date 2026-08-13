#!/usr/bin/env bash
# Import n8n workflow JSON via docker exec (no N8N_API_KEY required)
# Usage: n8n-import-via-cli.sh <workflow.json> [--publish] [--name "Workflow Name"]
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CONTAINER="${N8N_CONTAINER:-n8n-cursor-n8n-1}"
PUBLISH=false
WF_FILE=""
WF_NAME=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --publish) PUBLISH=true; shift ;;
    --name) WF_NAME="$2"; shift 2 ;;
    -*) echo "Unknown flag $1"; exit 1 ;;
    *) WF_FILE="$1"; shift ;;
  esac
done

if [[ -z "$WF_FILE" ]]; then
  echo "Usage: $0 <workflow.json> [--publish] [--name \"Name\"]"
  exit 1
fi

if [[ "$WF_FILE" != /* ]]; then
  WF_FILE="$ROOT/$WF_FILE"
fi

if [[ ! -f "$WF_FILE" ]]; then
  echo "Missing $WF_FILE"
  exit 1
fi

if [[ -z "$WF_NAME" ]]; then
  WF_NAME=$(python3 -c "import json; print(json.load(open('$WF_FILE')).get('name',''))")
fi

REMOTE="/tmp/n8n-import-$(basename "$WF_FILE")"
if [[ "${HIVE_VPS_SSH:-}" != "" ]] || [[ "$(hostname -s 2>/dev/null)" != "69.62.66.78" ]]; then
  SSH_TARGET="${HIVE_VPS_SSH:-root@69.62.66.78}"
  scp -o BatchMode=yes "$WF_FILE" "$SSH_TARGET:$REMOTE"
  ssh -o BatchMode=yes "$SSH_TARGET" bash -s <<EOF
set -euo pipefail
docker cp "$REMOTE" ${CONTAINER}:/tmp/wf-import.json
docker exec ${CONTAINER} n8n import:workflow --input=/tmp/wf-import.json
EOF
else
  docker cp "$WF_FILE" "${CONTAINER}:/tmp/wf-import.json"
  docker exec "${CONTAINER}" n8n import:workflow --input=/tmp/wf-import.json
fi

if [[ "$PUBLISH" == true ]]; then
  WF_ID=$(python3 -c "import json; print(json.load(open('$WF_FILE')).get('id',''))")
  if [[ -z "$WF_ID" ]]; then
    echo "WARN: no id in JSON — lookup by name via sqlite"
    DB="/var/lib/docker/volumes/n8n-cursor_n8n_data/_data/database.sqlite"
    WF_ID=$(sqlite3 "$DB" "SELECT id FROM workflow_entity WHERE name='${WF_NAME}' ORDER BY updatedAt DESC LIMIT 1;" 2>/dev/null || true)
  fi
  if [[ -n "$WF_ID" ]]; then
    if [[ "${HIVE_VPS_SSH:-}" != "" ]] || [[ "$(hostname -s 2>/dev/null)" != "69.62.66.78" ]]; then
      ssh -o BatchMode=yes "${HIVE_VPS_SSH:-root@69.62.66.78}" \
        "docker exec ${CONTAINER} n8n publish:workflow --id=${WF_ID} 2>/dev/null || docker exec ${CONTAINER} n8n update:workflow --id=${WF_ID} --active=true"
    else
      docker exec "${CONTAINER}" n8n publish:workflow --id="${WF_ID}" 2>/dev/null \
        || docker exec "${CONTAINER}" n8n update:workflow --id="${WF_ID}" --active=true
    fi
    echo "Published/activated workflow id=${WF_ID} (${WF_NAME})"
  else
    echo "WARN: could not resolve workflow id for publish"
  fi
fi

echo "Imported: ${WF_NAME}"
