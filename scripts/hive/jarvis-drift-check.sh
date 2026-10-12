#!/bin/bash
# Cross-platform drift check, Jarvis part. Weekly (Mondays) or by hand. Read-only except its report.
#   bash scripts/hive/jarvis-drift-check.sh [--port 4018] [--no-latency]
# Checks: Face health, turn latency (<20 s), private-file exposure in public clones, shared-file freshness.
# Exit 0 clean, 1 drift found. Report: ~/jarvis-proof/drift-YYYYMMDD.txt (override DRIFT_OUT).
set -u
PORT=4018; LAT=1
while [ $# -gt 0 ]; do case "$1" in --port) PORT=$2; shift;; --no-latency) LAT=0;; esac; shift; done
HERE="$(cd "$(dirname "$0")/../.." && pwd)"; AS="$HERE/apps/agent-stack"
SHARED="${JARVIS_SHARED_DIR:-$HOME/.grok-shared}"; PRIV="${JARVIS_PRIVATE_DIR:-$HOME/.grok-private}"
OUT="${DRIFT_OUT:-$HOME/jarvis-proof/drift-$(date +%Y%m%d).txt}"; mkdir -p "$(dirname "$OUT")"
FAIL=0; say() { echo "$*" | tee -a "$OUT"; }; bad() { say "DRIFT $*"; FAIL=1; }
: > "$OUT"; say "jarvis drift check $(date '+%Y-%m-%d %H:%M %Z') port=$PORT"
# 1) health
code=$(curl -s -o /dev/null -w '%{http_code}' -m 5 "http://127.0.0.1:$PORT/healthz")
[ "$code" = 200 ] && say "OK   face :$PORT healthz 200" || bad "face :$PORT healthz $code"
# 2) latency
if [ "$LAT" = 1 ] && [ "$code" = 200 ]; then
  if python3 "$AS/scripts/latency_smoke.py" --port "$PORT" --limit 20 >> "$OUT" 2>&1; then say "OK   latency: all turns < 20 s"; else bad "latency: a turn was over 20 s or empty (see above)"; fi
fi
# 3) private-file exposure: private files must be real files in $PRIV; anything in a public clone must be an ignored symlink
for f in ACTIVE_TASKS.md MAC_SHARED_MEMORY.md SECURITY_TODO.md OPERATOR_PROFILE.md TOOLS_AND_REPOS.md SKILLS_INDEX.md; do
  [ -f "$PRIV/$f" ] && [ ! -L "$PRIV/$f" ] || bad "private: $PRIV/$f missing"
  if [ -e "$SHARED/$f" ] && [ ! -L "$SHARED/$f" ]; then bad "private: $SHARED/$f is a real file again (should be a symlink into $PRIV)"; fi
done
real=$(cd "$SHARED" 2>/dev/null && pwd -P)
if top=$(git -C "$real" rev-parse --show-toplevel 2>/dev/null); then
  rel=${real#$top/}
  n=$(git -C "$top" status --porcelain --untracked-files=all -- "$rel" | grep -v '/inbox/' | wc -l | tr -d ' ')
  [ "$n" = 0 ] && say "OK   public clone $top: shared dir clean (no untracked/staged)" || { bad "public clone $top: $n untracked/staged entr(ies) in $rel"; git -C "$top" status --short -- "$rel" | head -10 >> "$OUT"; }
  staged=$(git -C "$top" diff --cached --name-only | grep -E "(ACTIVE_TASKS|MAC_SHARED_MEMORY|SECURITY_TODO|CURRENT_STATE)\.md|\.grok-shared\.md" | wc -l | tr -d ' ')
  [ "$staged" = 0 ] || bad "public clone $top: private file STAGED"
fi
# 4) freshness (content dates, durable vs live thresholds) via the Jarvis loader
if python3 "$AS/brain/shared_context.py" --drift > /tmp/jarvis-drift.json 2>/dev/null; then
  python3 - "$OUT" <<'PY' || FAIL=1
import json, sys
d = json.load(open("/tmp/jarvis-drift.json")); out = open(sys.argv[1], "a")
for r in d["present"]:
    print(f"     {r['file']:24} as of {r.get('as_of', '?')} ({r['age_hours']} h)", file=out)
msg = "OK   shared files fresh" if d["ok"] else f"DRIFT shared files missing={d['missing']} stale={d['stale']}"
print(msg); print(msg, file=out)
sys.exit(0 if d["ok"] else 1)
PY
else bad "shared_context --drift failed"; fi
say "result: $([ $FAIL = 0 ] && echo CLEAN || echo DRIFT) -> $OUT"
exit $FAIL
