#!/usr/bin/env bash
# Publish + activate hive workflows after n8n container recreate (n8n 2.x)
# Guard: refuse if duplicate webhook paths exist (prevents activation storm / black UI).
set -euo pipefail

N8N_CONTAINER="${N8N_CONTAINER:-n8n-cursor-n8n-1}"
N8N_VOLUME="${N8N_VOLUME:-n8n-cursor_n8n_data}"
N8N_IMAGE="${N8N_IMAGE:-n8nio/n8n:2.34.1}"
DB="/var/lib/docker/volumes/${N8N_VOLUME}/_data/database.sqlite"

# Stable UUIDs from workflows/hive/*.json — never use CLI-generated short ids here.
GOLDEN_PATH_ID="${HIVE_GOLDEN_PATH_WORKFLOW_ID:-cfae0953-97cd-4d35-885d-b3e4dd6efa28}"
OUTER_HEAVEN_ID="${HIVE_OUTER_HEAVEN_WORKFLOW_ID:-e39875ba-a355-43f2-9dd6-dc0e4bcda2ef}"

WORKFLOW_IDS=(
  "$GOLDEN_PATH_ID"
  "$OUTER_HEAVEN_ID"
)

guard_webhook_paths() {
  local paths=("hive-smoke-notify" "hive-outer-heaven-report")
  if [[ ! -f "$DB" ]]; then
    echo "WARN: sqlite not found at $DB — skip webhook guard"
    return 0
  fi
  for path in "${paths[@]}"; do
    local count
    count=$(sqlite3 "$DB" "SELECT COUNT(*) FROM webhook_entity WHERE webhookPath='${path}';" 2>/dev/null || echo "0")
    if [[ "$count" -gt 1 ]]; then
      echo "ERROR: duplicate webhook path '${path}' (${count} rows). Dedupe before activate."
      sqlite3 "$DB" "SELECT workflowId, webhookPath FROM webhook_entity WHERE webhookPath='${path}';" 2>/dev/null || true
      exit 1
    fi
  done
  # Golden path: at most one workflow row with that name
  local golden_count
  golden_count=$(sqlite3 "$DB" "SELECT COUNT(*) FROM workflow_entity WHERE name='Hive Golden Path Smoke Notify';" 2>/dev/null || echo "0")
  if [[ "$golden_count" -gt 1 ]]; then
    echo "ERROR: ${golden_count} workflows named 'Hive Golden Path Smoke Notify'. Run n8n-dedupe-hive-workflows.sh first."
    exit 1
  fi
}

guard_webhook_paths

echo "Stopping $N8N_CONTAINER ..."
docker stop "$N8N_CONTAINER" >/dev/null

for id in "${WORKFLOW_IDS[@]}"; do
  if ! sqlite3 "$DB" "SELECT 1 FROM workflow_entity WHERE id='${id}';" 2>/dev/null | grep -q 1; then
    echo "WARN: workflow id=${id} not in DB — skip publish"
    continue
  fi
  echo "Publishing $id"
  docker run --rm -v "${N8N_VOLUME}:/home/node/.n8n" --entrypoint n8n "$N8N_IMAGE" \
    publish:workflow --id="$id" >/dev/null
done

echo "Starting $N8N_CONTAINER ..."
docker start "$N8N_CONTAINER" >/dev/null
sleep 12
echo "Done. Webhooks: /webhook/hive-smoke-notify, /webhook/hive-outer-heaven-report"
