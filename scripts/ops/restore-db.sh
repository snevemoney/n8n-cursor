#!/usr/bin/env bash
source "$(dirname "$0")/../utils/lib.sh"
require_master
FILE="${1:-}"
[[ -f "$FILE" ]] || die "usage: restore-db.sh <file.sql.gz>"
run "gunzip -c \"$FILE\" | psql \"$POSTGRES_URL\""
