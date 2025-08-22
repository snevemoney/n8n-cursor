#!/usr/bin/env bash
source "$(dirname "$0")/../utils/lib.sh"
WF_DIR="workflows"; mkdir -p "$WF_DIR"

case "${1:-help}" in
  import)   info "Import placeholder (connect n8n-mcp later)";;
  validate) require_cmd jq; find "$WF_DIR" -type f -name "*.json" -print0 | while IFS= read -r -d '' f; do run "jq . < \"$f\" >/dev/null"; done ;;
  dedupe)
    require_cmd sha256sum || true
    mapfile -t files < <(find "$WF_DIR" -type f -name '*.json' | sort)
    declare -A seen
    for f in "${files[@]}"; do
      h=$(sha256sum "$f" | awk '{print $1}')
      if [[ -n "${seen[$h]:-}" ]]; then warn "Duplicate: $f == ${seen[$h]}"; else seen[$h]="$f"; fi
    done
    ;;
  *) echo "Usage: $0 {import|validate|dedupe}"; exit 1;;
esac
