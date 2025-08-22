#!/bin/bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

source "$SCRIPT_DIR/../utils/lib.sh"

log_info "Structure Guard - Repository Safety Check"

# Load configuration
SCHEMA_FILE="$PROJECT_ROOT/config/repo.schema"
if [[ -f "$SCHEMA_FILE" ]]; then
    log_info "Using schema: $SCHEMA_FILE"
else
    log_warn "Schema file not found, using defaults"
fi

# Forbidden paths (hardcoded for safety)
FORBIDDEN_PATHS=(
    "docker-compose.yml"
    "examples/test-payloads.json"
    "n8n-manager.sh"
    "setup-comprehensive-n8n.sh"
    "test-remote-n8n.js"
)

# Forbidden strings (security)
FORBIDDEN_STRINGS=(
    "MASTER_UNLOCK"
)

# Required directories
REQUIRED_DIRS=(
    "infra/docker"
    "infra/nginx"
    "scripts/ops"
    "scripts/workflows"
    "scripts/safety"
    "scripts/utils"
    "scripts/bin"
    "workflows"
    "templates"
    "docs"
    "reports"
    "apps/repo-brain"
    "config"
    "backups"
    "logs"
)

# Required files
REQUIRED_FILES=(
    "Makefile"
    "scripts/utils/lib.sh"
    "scripts/safety/structure-guard.sh"
    "config/repo.schema"
)

log_info "== Checking Forbidden Paths =="
forbidden_found=0
for path in "${FORBIDDEN_PATHS[@]}"; do
    if [[ -e "$PROJECT_ROOT/$path" ]]; then
        log_error "Forbidden path: $path"
        forbidden_found=1
    fi
done

log_info "== Checking Forbidden Strings =="
forbidden_strings_found=0
for string in "${FORBIDDEN_STRINGS[@]}"; do
    if grep -r "$string" "$PROJECT_ROOT" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=backups --exclude-dir=logs 2>/dev/null | grep -v ".env.example" | grep -v "MASTER_UNLOCK.*env"; then
        log_error "MASTER_UNLOCK string found in code. Use env var only."
        forbidden_strings_found=1
    fi
done

log_info "== Checking Required Directories =="
missing_dirs=0
for dir in "${REQUIRED_DIRS[@]}"; do
    if [[ ! -d "$PROJECT_ROOT/$dir" ]]; then
        log_warn "Missing directory: $dir"
        missing_dirs=1
    fi
done

log_info "== Checking Required Files =="
missing_files=0
for file in "${REQUIRED_FILES[@]}"; do
    if [[ ! -f "$PROJECT_ROOT/$file" ]]; then
        log_error "Missing file: $file"
        missing_files=1
    fi
done

log_info "== Checking File Permissions =="
executable_scripts=0
while IFS= read -r -d '' file; do
    if [[ -x "$file" ]] && [[ "$file" == *.sh ]]; then
        executable_scripts=$((executable_scripts + 1))
    fi
done < <(find "$PROJECT_ROOT/scripts" -type f -name "*.sh" -print0 2>/dev/null)

log_info "Found $executable_scripts executable scripts"

# Summary
log_info "== Structure Guard Summary =="
if [[ $forbidden_found -eq 0 ]] && [[ $forbidden_strings_found -eq 0 ]] && [[ $missing_files -eq 0 ]]; then
    log_info "✅ Structure Guard: PASSED"
    if [[ $missing_dirs -eq 0 ]]; then
        log_info "✅ All required directories present"
    else
        log_warn "⚠️  Some directories missing (non-critical)"
    fi
    exit 0
else
    log_error "❌ Structure Guard: FAILED"
    if [[ $forbidden_found -eq 1 ]]; then
        log_error "  - Forbidden paths found"
    fi
    if [[ $forbidden_strings_found -eq 1 ]]; then
        log_error "  - Forbidden strings found"
    fi
    if [[ $missing_files -eq 1 ]]; then
        log_error "  - Required files missing"
    fi
    exit 1
fi
