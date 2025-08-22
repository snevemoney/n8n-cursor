#!/bin/bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
REPO_BRAIN_DIR="$PROJECT_ROOT/apps/repo-brain"

source "$SCRIPT_DIR/../utils/lib.sh"

log_info "Repo Brain operations"

case "${1:-}" in
index)
  log_info "Indexing repository for Repo Brain..."
  if [[ -d "$REPO_BRAIN_DIR/cli" ]]; then
    cd "$REPO_BRAIN_DIR/cli"
    if [[ -f "embed.mjs" ]]; then
      log_info "Running embed.mjs..."
      node embed.mjs
    else
      log_warn "embed.mjs not found, creating stub..."
      cat >embed.mjs <<'EOF'
#!/usr/bin/env node
console.log("Repo Brain embedding - stub implementation");
console.log("Set OPENAI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY to enable");
EOF
      chmod +x embed.mjs
    fi
  else
    log_error "Repo Brain CLI directory not found"
    exit 1
  fi
  ;;
suggest)
  log_info "Getting Repo Brain suggestions..."
  if [[ -d "$REPO_BRAIN_DIR/cli" ]]; then
    cd "$REPO_BRAIN_DIR/cli"
    if [[ -f "suggest.mjs" ]]; then
      log_info "Running suggest.mjs..."
      node suggest.mjs
    else
      log_warn "suggest.mjs not found, creating stub..."
      cat >suggest.mjs <<'EOF'
#!/usr/bin/env node
console.log("Repo Brain suggestions - stub implementation");
console.log("Set OPENAI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY to enable");
EOF
      chmod +x suggest.mjs
    fi
  else
    log_error "Repo Brain CLI directory not found"
    exit 1
  fi
  ;;
*)
  log_error "Usage: $0 {index|suggest}"
  exit 1
  ;;
esac

log_info "Repo Brain operation completed"
