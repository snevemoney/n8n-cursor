#!/usr/bin/env bash
source "$(dirname "$0")/../utils/lib.sh"

case "${1:-help}" in
  verify)
    info "Running safety verification…"
    # refuse if docker-compose.yml changed service names/ports
    if git diff --name-only HEAD | grep -q '^docker-compose\.yml$'; then
      warn "docker-compose.yml changed. Review carefully."
    fi
    # shellcheck everything
    run "shellcheck -x \$(git ls-files '*.sh') || true"
    ;;
  snapshot)
    "$REPO_ROOT/scripts/ops/n8n.sh" backup
    ;;
  restore)
    die "Documented manual restore only. See docs/MIGRATION.md."
    ;;
  *)
    echo "Usage: $0 {verify|snapshot|restore}"; exit 1;;
esac
