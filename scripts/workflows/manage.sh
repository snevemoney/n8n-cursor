#!/bin/bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
WORKFLOWS_DIR="$PROJECT_ROOT/workflows"

source "$SCRIPT_DIR/../utils/lib.sh"

log_info "Workflow management script"

case "${1:-}" in
validate)
  log_info "Validating all workflows..."
  if ! command -v jq &>/dev/null; then
    log_error "jq is required for workflow validation. Please install it."
    exit 1
  fi

  failed_workflows=()
  total_workflows=0

  while IFS= read -r -d '' file; do
    if [[ "$file" == *.json ]]; then
      total_workflows=$((total_workflows + 1))
      if [[ "$DRY_RUN" == "1" ]]; then
        log_info "[DRY-RUN] jq . < \"$file\" >/dev/null"
      else
        if jq . <"$file" >/dev/null 2>&1; then
          log_info "✅ Valid: $file"
        else
          log_error "❌ Invalid: $file"
          failed_workflows+=("$file")
        fi
      fi
    fi
  done < <(find "$WORKFLOWS_DIR" -type f -name "*.json" -print0)

  if [[ ${#failed_workflows[@]} -eq 0 ]]; then
    log_info "All $total_workflows workflows are valid JSON"
  else
    log_error "${#failed_workflows[@]} workflows failed validation:"
    for file in "${failed_workflows[@]}"; do
      log_error "  - $file"
    done
    exit 1
  fi
  ;;
dedupe)
  log_info "Checking for duplicate workflows..."
  if [[ "$DRY_RUN" == "1" ]]; then
    log_info "[DRY-RUN] Duplicate detection would run"
  else
    # Simple duplicate detection by content hash
    declare -A hashes
    duplicates_found=0

    while IFS= read -r -d '' file; do
      if [[ "$file" == *.json ]]; then
        hash=$(sha256sum "$file" | cut -d' ' -f1)
        if [[ -n "${hashes[$hash]:-}" ]]; then
          log_warn "Potential duplicate: $file matches ${hashes[$hash]}"
          duplicates_found=1
        else
          hashes[$hash]="$file"
        fi
      fi
    done < <(find "$WORKFLOWS_DIR" -type f -name "*.json" -print0)

    if [[ $duplicates_found -eq 0 ]]; then
      log_info "No duplicate workflows found"
    else
      log_warn "Review potential duplicates above"
    fi
  fi
  ;;
import)
  log_info "Importing workflows..."
  if [[ "$DRY_RUN" == "1" ]]; then
    log_info "[DRY-RUN] Workflow import would run"
  else
    log_info "Manual import required. Copy workflow files to workflows/ directory"
    log_info "Then run: make wf-validate"
  fi
  ;;
*)
  log_error "Usage: $0 {validate|dedupe|import}"
  exit 1
  ;;
esac

log_info "Workflow operation completed"
