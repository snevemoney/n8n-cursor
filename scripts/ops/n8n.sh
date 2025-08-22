#!/usr/bin/env bash
source "$(dirname "$0")/../utils/lib.sh"
require_cmd docker
COMPOSE="docker compose -f docker-compose.yml"

case "${1:-help}" in
  up)       run "$COMPOSE up -d" ;;
  down)     run "$COMPOSE down" ;;
  restart)  run "$COMPOSE down"; run "$COMPOSE up -d" ;;
  status)   run "$COMPOSE ps" ;;
  logs)     run "$COMPOSE logs --tail=200" ;;
  backup)   mkdir -p backups; TAR="backups/repo-$(date +%Y%m%d-%H%M%S).tar.gz"; run "tar --exclude=node_modules --exclude=logs --exclude=backups -czf $TAR ." ; info "Backup: $TAR" ;;
  restore)  require_master; die "Manual restore only; see docs/MIGRATION.md." ;;
  *) echo "Usage: $0 {up|down|restart|status|logs|backup|restore}"; exit 1;;
esac
