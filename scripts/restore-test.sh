#!/usr/bin/env bash
set -euo pipefail

# LightningFlow AI Restore Test Script
# Run on non-prod test box to verify backup integrity

SNAP=$(restic snapshots --json | jq -r '.[-1].short_id')
echo "[restore-test] snapshot=$SNAP"

mkdir -p /tmp/restore-test
echo "[restore-test] restoring to /tmp/restore-test"
restic restore "$SNAP" --target /tmp/restore-test

echo "[restore-test] restored to /tmp/restore-test"
echo "[restore-test] files restored:"
ls -la /tmp/restore-test/

# Example: test SQL import into a throwaway container
# Uncomment to test database restore
# echo "[restore-test] testing database restore"
# docker run --rm -v /tmp/restore-test:/r postgres:15 bash -lc "createdb test && gunzip -c /r/tmp/pgdump-*.sql.gz | psql -U postgres -d test"

echo "[restore-test] restore test completed successfully"
