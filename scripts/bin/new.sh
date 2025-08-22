#!/bin/bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TEMPLATES_DIR="$PROJECT_ROOT/templates"

source "$SCRIPT_DIR/../utils/lib.sh"

log_info "New file generator script"

if [[ $# -lt 2 ]]; then
  log_error "Usage: $0 {workflow|script} <name> [description]"
  exit 1
fi

type="$1"
name="$2"
description="${3:-}"

# Sanitize name for file naming
safe_name=$(echo "$name" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')

case "$type" in
workflow)
  log_info "Creating new workflow: $name"
  if [[ "$DRY_RUN" == "1" ]]; then
    log_info "[DRY-RUN] Would create workflow: workflows/$safe_name.json"
  else
    output_file="$PROJECT_ROOT/workflows/$safe_name.json"
    if [[ -f "$output_file" ]]; then
      log_error "Workflow already exists: $output_file"
      exit 1
    fi

    # Generate workflow from template
    sed -e "s/{{WORKFLOW_NAME}}/$name/g" \
      -e "s/{{WORKFLOW_ID}}/$(uuidgen)/g" \
      -e "s/{{WORKFLOW_TAGS}}/new,generated/g" \
      "$TEMPLATES_DIR/workflow.json.tmpl" >"$output_file"

    log_info "✅ Created workflow: $output_file"
  fi
  ;;
script)
  log_info "Creating new script: $name"
  if [[ "$DRY_RUN" == "1" ]]; then
    log_info "[DRY-RUN] Would create script: scripts/ops/$safe_name.sh"
  else
    output_file="$PROJECT_ROOT/scripts/ops/$safe_name.sh"
    if [[ -f "$output_file" ]]; then
      log_error "Script already exists: $output_file"
      exit 1
    fi

    # Generate script from template
    sed -e "s/{{SCRIPT_NAME}}/$name/g" \
      -e "s/{{SCRIPT_DESCRIPTION}}/$description/g" \
      -e "s/{{DATE}}/$(date +%Y-%m-%d)/g" \
      -e "s/{{MAIN_LOGIC}}/# TODO: implement main logic/g" \
      "$TEMPLATES_DIR/script.sh.tmpl" >"$output_file"

    chmod +x "$output_file"
    log_info "✅ Created script: $output_file"
  fi
  ;;
*)
  log_error "Invalid type: $type. Use 'workflow' or 'script'"
  exit 1
  ;;
esac

log_info "File generation completed"
