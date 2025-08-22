#!/usr/bin/env bash
source "$(dirname "$0")/../utils/lib.sh"
OUT="backups/db-$(date +%Y%m%d-%H%M%S).sql.gz"
run "pg_dump \"$POSTGRES_URL\" | gzip > $OUT"
info "DB backup -> $OUT"
