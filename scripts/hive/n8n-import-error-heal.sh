#!/usr/bin/env bash
# Import hive-error-heal-notify only from a real export. Never activate. Never import a stub.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WF_FILE="$ROOT/workflows/hive/error-heal-notify.json"
NAME="Hive Error Heal Notify"

if [[ ! -f "$WF_FILE" ]]; then
  echo "MISSING $WF_FILE — will not import or activate"
  exit 1
fi

if python3 -c "
import json, sys
wf = json.load(open(sys.argv[1]))
meta = wf.get('meta') or {}
if wf.get('_stub') or meta.get('status') == 'MISSING_FROM_REPO' or not wf.get('nodes'):
    sys.exit(0)
sys.exit(1)
" "$WF_FILE"; then
  echo "STUB/EMPTY: $WF_FILE — will not import or activate. Export from live n8n first."
  exit 1
fi

echo "File looks real. Import stays HITL — Evens runs n8n UI import. This script stops here."
exit 1
