#!/usr/bin/env bash
set -Eeuo pipefail
ROOT="$(cd -- "$(dirname "${BASH_SOURCE[0]}")"/../.. && pwd)"; cd "$ROOT"
usage(){ echo "new.sh {workflow|script} Name [desc]"; exit 1; }
type="${1:-}"; name="${2:-}"; desc="${3:-no description}"; [[ -z "$type" || -z "$name" ]] && usage
DATE="$(date -Iseconds)"
case "$type" in
  workflow) out="workflows/${name// /-}.json"; sed "s/{{NAME}}/$name/g; s/{{DATE}}/$DATE/g" templates/workflow.json.tmpl > "$out" ;;
  script)   out="scripts/ops/${name// /-}.sh";  sed "s/{{NAME}}/$name/g; s/{{DESC}}/$desc/g" templates/script.sh.tmpl > "$out"; chmod +x "$out" ;;
  *) usage ;;
esac
echo "Created $out"
