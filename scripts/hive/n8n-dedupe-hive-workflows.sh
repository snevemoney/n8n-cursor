#!/usr/bin/env bash
# Remove duplicate inactive Hive workflows on VPS n8n (keep newest id per name).
# Meta-cognitive workflows stay inactive; never deletes active workflows.
set -euo pipefail

SSH_TARGET="${HIVE_VPS_SSH:-root@69.62.66.78}"
N8N_VOLUME="${N8N_VOLUME:-n8n-cursor_n8n_data}"
N8N_CONTAINER="${N8N_CONTAINER:-n8n-cursor-n8n-1}"

ssh -o BatchMode=yes "$SSH_TARGET" bash -s <<REMOTE
set -euo pipefail
DB="/var/lib/docker/volumes/${N8N_VOLUME}/_data/database.sqlite"
if [[ ! -f "\$DB" ]]; then
  echo "Missing \$DB"
  exit 1
fi

docker compose stop n8n >/dev/null

python3 <<'PY'
import sqlite3
from pathlib import Path

db = Path("/var/lib/docker/volumes/${N8N_VOLUME}/_data/database.sqlite")
conn = sqlite3.connect(db)
conn.row_factory = sqlite3.Row

HIVE_PREFIX = ("Hive ",)

def delete_workflow(wid: str):
    for table, col in [
        ("webhook_entity", "workflowId"),
        ("workflow_published_version", "workflowId"),
        ("workflow_publish_history", "workflowId"),
        ("shared_workflow", "workflowId"),
        ("workflows_tags", "workflowId"),
    ]:
        try:
            conn.execute(f"DELETE FROM {table} WHERE {col}=?", (wid,))
        except sqlite3.OperationalError:
            pass
    conn.execute("DELETE FROM workflow_entity WHERE id=?", (wid,))
    print("deleted", wid)

rows = conn.execute(
    "SELECT id, name, active, updatedAt FROM workflow_entity WHERE name LIKE 'Hive %' ORDER BY name, updatedAt DESC"
).fetchall()

by_name: dict[str, list] = {}
for r in rows:
    by_name.setdefault(r["name"], []).append(r)

for name, group in sorted(by_name.items()):
    if len(group) <= 1:
        continue
    # Keep first (newest updatedAt due to ORDER BY DESC)
    keep = group[0]
    print(f"dedupe {name}: keep {keep['id']} active={keep['active']}")
    for dup in group[1:]:
        if dup["active"]:
            print(f"  skip active duplicate {dup['id']}")
            continue
        delete_workflow(dup["id"])

conn.commit()
conn.close()
print("dedupe complete")
PY

docker start ${N8N_CONTAINER} >/dev/null
sleep 10
docker ps --filter name=n8n --format "{{.Status}}"
REMOTE

echo "==> n8n-dedupe-hive-workflows complete"
