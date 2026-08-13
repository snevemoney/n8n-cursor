#!/usr/bin/env bash
# Full Outer Heaven capture cycle: cache-first writes, vault mirror, git sync, VPS push.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"

CACHE="${OUTER_HEAVEN_CACHE:-$HOME/.grokbot/outer-heaven}"
STEP_TIMEOUT="${OUTER_HEAVEN_STEP_TIMEOUT:-600}"
STEPS_FILE="$(mktemp)"
mkdir -p "$CACHE"
: > "$STEPS_FILE"

run_step() {
  local name="$1"
  shift
  echo "=== $name ==="
  local status="ok"
  if command -v timeout >/dev/null 2>&1; then
    if ! timeout "$STEP_TIMEOUT" "$@"; then
      status="timeout_or_fail"
      echo "WARN: $name failed or timed out (${STEP_TIMEOUT}s)" >&2
    fi
  elif ! "$@"; then
    status="fail"
    echo "WARN: $name failed" >&2
  fi
  printf '%s\t%s\n' "$name" "$status" >> "$STEPS_FILE"
}

if [[ -z "${HIVE_OBSIDIAN_VAULT:-}" && -f "$HOME/.grokbot/os-config.json" ]]; then
  HIVE_OBSIDIAN_VAULT="$(python3 -c "import json,pathlib; p=pathlib.Path.home()/'.grokbot'/'os-config.json'; print(json.loads(p.read_text()).get('HIVE_OBSIDIAN_VAULT',''))" 2>/dev/null || true)"
  export HIVE_OBSIDIAN_VAULT
fi
if [[ -z "${HIVE_OBSIDIAN_VAULT:-}" && -d "$HOME/Documents/My_Billion_Dollar_Vault" ]]; then
  export HIVE_OBSIDIAN_VAULT="$HOME/Documents/My_Billion_Dollar_Vault"
fi

export OUTER_HEAVEN_CACHE="$CACHE"
echo "OUTER_HEAVEN_CACHE=$CACHE"
echo "HIVE_OBSIDIAN_VAULT=${HIVE_OBSIDIAN_VAULT:-UNSET}"

run_step mine-transcripts python3 scripts/hive/outer-heaven/mine-transcripts.py
run_step export-all-cursor-chats \
  python3 scripts/hive/outer-heaven/export-all-cursor-chats.py --include-all-workspaces --skip-chronicle
run_step link-cursor-chats python3 scripts/hive/outer-heaven/link-cursor-chats.py
run_step ingest-inbox python3 scripts/hive/outer-heaven/ingest-inbox.py

if [[ -d "$CACHE" ]]; then
  run_step build-graph-index node "$ROOT/scripts/hive/obsidian/build-graph-index.mjs" "$CACHE"
fi

run_step mirror-cache-to-vault bash scripts/hive/outer-heaven/mirror-cache-to-vault.sh
run_step sync-vault-to-git bash scripts/hive/outer-heaven/sync-vault-to-git.sh
run_step publish-brief \
  python3 scripts/hive/os/outer-heaven-brief.py --agent Librarian --publish --format json
run_step push-vps-mirror bash scripts/hive/outer-heaven/push-vault-mirror.sh

python3 - "$STEPS_FILE" <<'PY'
import json
import sys
from pathlib import Path

steps_file = Path(sys.argv[1])
steps: dict[str, str] = {}
for line in steps_file.read_text(encoding="utf-8").splitlines():
    if not line.strip():
        continue
    name, status = line.split("\t", 1)
    steps[name] = status

sys.path.insert(0, "scripts/hive/outer-heaven")
import lib

lib.write_last_capture(steps)
print("last-capture.json written")
PY

rm -f "$STEPS_FILE"
echo "=== capture cycle complete ==="
