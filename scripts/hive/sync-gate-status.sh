#!/usr/bin/env bash
# Update CORE_WORK_READY.md last-run section from EXPERT_AUDIT_LAST.txt
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
AUDIT="$ROOT/docs/hive/EXPERT_AUDIT_LAST.txt"
GATE="$ROOT/docs/hive/CORE_WORK_READY.md"

if [[ ! -f "$AUDIT" ]]; then
  echo "Run expert-audit.sh first"
  exit 1
fi

ts=$(grep -m1 '^Time:' "$AUDIT" | sed 's/Time: //')
pass=$(grep -c '^PASS' "$AUDIT" 2>/dev/null || echo 0)
fail=$(grep -c '^FAIL' "$AUDIT" 2>/dev/null || echo 0)
skip=$(grep -c '^SKIP' "$AUDIT" 2>/dev/null || echo 0)

block="## Last expert audit

- **Run:** ${ts:-unknown}
- **PASS:** ${pass} · **FAIL:** ${fail} · **SKIP:** ${skip}
- **Log:** [EXPERT_AUDIT_LAST.txt](./EXPERT_AUDIT_LAST.txt)

Gate rows stay **conditional** until operator completes manual checklist and deploys Scorpion hive routes to prod.
"

python3 <<PY
from pathlib import Path
gate = Path('${GATE}')
text = gate.read_text()
marker = '## Last expert audit'
block = '''${block}'''
if marker in text:
    pre, _, rest = text.partition(marker)
    # drop old block until next ##
    if '## Operator manual checklist' in rest:
        _, rest = rest.split('## Operator manual checklist', 1)
        rest = '## Operator manual checklist' + rest
    else:
        rest = rest.split('\n## ', 1)
        rest = ('## ' + rest[1]) if len(rest) > 1 else ''
    text = pre.rstrip() + '\n\n' + block.strip() + '\n\n' + rest.lstrip()
else:
    text = text.rstrip() + '\n\n' + block.strip() + '\n'
gate.write_text(text)
print('Updated', gate)
PY
