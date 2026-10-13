#!/usr/bin/env bash
# Eval gate runner: runs every suite-*.yaml. Exit 0 only if all suites pass. Needs OPENROUTER_API_KEY (never printed).
set -uo pipefail; cd "$(dirname "$0")"
export PROMPTFOO_DISABLE_TELEMETRY=1 PROMPTFOO_DISABLE_UPDATE=1
G=${PROMPTFOO_GRADER:-openrouter:openai/gpt-4o-mini}
ts=$(date +%Y%m%d-%H%M%S); mkdir -p results; fail=0
for s in ${@:-suite-*.yaml}; do n=$(basename $s .yaml)
  promptfoo eval -c $s --no-cache --grader "$G" -o results/$n-$ts.json > results/$n-$ts.log 2>&1; rc=$?
  python3 ../g04-tracer/trace.py from-promptfoo results/$n-$ts.json --tag g01-$n >/dev/null 2>&1
  echo "$n exit=$rc $(grep -E 'passed|failed|errors' results/$n-$ts.log | tr -s ' ' | tr '\n' ' ')"; [ $rc -eq 0 ] || fail=1
done; exit $fail
