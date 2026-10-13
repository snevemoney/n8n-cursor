#!/usr/bin/env bash
# Eval gate runner: refreshes prompts from production source, runs suites. Exit 0 only if all suites pass.
# Needs OPENROUTER_API_KEY (never printed). Not for GitHub CI (no paid calls in CI).
# usage: run.sh [suite.yaml ...]   (default: all suite-*.yaml)
# Tracing is best-effort: set TRACE_PY=/path/to/trace.py; a missing or failing tracer is reported, not fatal.
set -uo pipefail; cd "$(dirname "$0")"
export PROMPTFOO_DISABLE_TELEMETRY=1 PROMPTFOO_DISABLE_UPDATE=1
G="${PROMPTFOO_GRADER:-openrouter:openai/gpt-4o-mini}"
python3 ./extract_prompts.py || { echo "prompt source drift/extract failed"; exit 2; }
if [ "$#" -gt 0 ]; then suites=("$@"); else suites=(suite-*.yaml); fi
ts=$(date +%Y%m%d-%H%M%S); mkdir -p results; fail=0
for s in "${suites[@]}"; do
  case "$s" in -*|*/../*) echo "refusing suite path: $s"; exit 2;; esac
  n=$(basename -- "$s" .yaml); out="results/$n-$ts.json"; log="results/$n-$ts.log"
  promptfoo eval -c "./$s" --no-cache --grader "$G" -o "$out" > "$log" 2>&1; rc=$?
  tr_note=""
  if [ -n "${TRACE_PY:-}" ]; then python3 "$TRACE_PY" from-promptfoo "$out" --tag "g01-$n" >/dev/null 2>&1 || tr_note=" [trace FAILED]"; else tr_note=" [trace off]"; fi
  echo "$n exit=$rc $(grep -E 'passed|failed|errors' "$log" | tr -s ' ' | tr '\n' ' ')$tr_note"; [ "$rc" -eq 0 ] || fail=1
done; exit "$fail"
