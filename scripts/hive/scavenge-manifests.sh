#!/usr/bin/env bash
# Discover manifest.json files and print combined tool index (manifest scavenge).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

echo "Hive manifest scavenge — $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo ""

find . -name manifest.json -not -path '*/node_modules/*' -not -path '*/.git/*' 2>/dev/null | sort | python3 -c "
import json, sys
from pathlib import Path

files = [Path(l.strip()) for l in sys.stdin if l.strip()]
index = {'tools': [], 'endpoints': []}

for fp in files:
    try:
        data = json.loads(fp.read_text())
    except Exception as e:
        print(f'SKIP {fp}: {e}', file=sys.stderr)
        continue
    tn = data.get('tool_name', '?')
    index['tools'].append({
        'tool_name': tn,
        'path': str(fp),
        'status': data.get('status'),
        'base_url': data.get('base_url'),
    })
    for ep in data.get('endpoints', []):
        eid = ep.get('id', ep.get('path', '?'))
        base = data.get('base_url', '')
        index['endpoints'].append({
            'method_key': f'{tn}.{eid}',
            'tool_name': tn,
            'endpoint_id': eid,
            'http': f\"{ep.get('method','?')} {base}{ep.get('path','')}\",
            'manifest': str(fp),
        })

print(json.dumps(index, indent=2))
print(f\"\\n# {len(index['tools'])} tools, {len(index['endpoints'])} endpoints\", file=sys.stderr)
"

echo ""
echo "Registry: manifests/hive-toolbox-registry.json"
echo "Execute:  POST /webhook/hive-execute-tool"
