#!/usr/bin/env bash
set -Eeuo pipefail

REPO_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")"/../.. && pwd)"
cd "$REPO_ROOT"

LOG_DIR="${LOG_DIR:-logs}"; mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/ops-$(date +%Y%m%d-%H%M%S).log"
DRY_RUN="${DRY_RUN:-1}"

log(){ printf "[%s] %s\n" "$(date -Iseconds)" "$*" | tee -a "$LOG_FILE"; }
info(){ log "INFO  $*"; }
warn(){ log "WARN  $*"; }
err(){ log "ERROR $*" >&2; }
die(){ err "$*"; exit 1; }
require_cmd(){ command -v "$1" >/dev/null 2>&1 || die "Missing cmd: $1"; }

run(){ if [[ "$DRY_RUN" == "1" ]]; then info "[DRY-RUN] $*"; else info "RUN $*"; eval "$@" | tee -a "$LOG_FILE"; fi; }

# Optional master unlock (set in .env, never commit raw value)
require_master(){ [[ "${MASTER_UNLOCK:-}" != "" ]] || die "Master unlock required. Set MASTER_UNLOCK in environment."; }
