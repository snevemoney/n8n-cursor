#!/usr/bin/env bash
# Import hive-creative-pivot-notify only from a real export. Never activate. Never import a stub.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
WF="$ROOT/workflows/hive/creative-pivot-notify.json"

if [[ ! -f "$WF" ]]; then
  echo "MISSING $WF — will not import or activate"
  exit 1
fi

if python3 -c "
import json, sys
wf = json.load(open(sys.argv[1]))
meta = wf.get('meta') or {}
if wf.get('_stub') or meta.get('status') == 'MISSING_FROM_REPO' or not wf.get('nodes'):
    sys.exit(0)
sys.exit(1)
" "$WF"; then
  echo "STUB/EMPTY: $WF — will not import or activate. Export from live n8n first."
  exit 1
fi

echo "File looks real. Import stays HITL — Evens runs n8n UI import. This script stops here."
exit 1
