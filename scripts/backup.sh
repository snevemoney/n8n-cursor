#!/usr/bin/env bash
set -euo pipefail

# LightningFlow AI Backup Script
# REQUIRE: RESTIC_REPOSITORY, RESTIC_PASSWORD, B2_… or S3_… envs pre-set (systemd env file)

TS=$(date -u +%Y%m%d-%H%M%S)
echo "[backup] start $TS"

# (A) Supabase or Postgres exports (adjust if managed)
if [ -d /var/lib/postgres ]; then
  echo "[backup] exporting postgres data"
  pg_dumpall -U postgres | gzip > /tmp/pgdump-$TS.sql.gz || true
fi

# (B) Redis snapshot (if running locally)
if command -v redis-cli >/dev/null 2>&1; then
  echo "[backup] creating redis snapshot"
  redis-cli BGSAVE || true
  sleep 2
fi

# (C) n8n workflows (if local)
if [ -d /srv/workflows ]; then
  echo "[backup] backing up n8n workflows"
  mkdir -p /srv/workflows
else
  echo "[backup] creating workflows directory"
  mkdir -p /srv/workflows
fi

# (D) restic backup set
echo "[backup] running restic backup"
restic backup \
  /tmp/pgdump-$TS.sql.gz \
  /var/lib/redis \
  /etc/caddy/Caddyfile \
  /srv/workflows \
  /root/infra \
  --tag lightningflow

# prune old backups
echo "[backup] pruning old backups"
restic forget --keep-daily 7 --keep-weekly 4 --keep-monthly 6

# cleanup temp files
rm -f /tmp/pgdump-$TS.sql.gz

echo "[backup] done"
