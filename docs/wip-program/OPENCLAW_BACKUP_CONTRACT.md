# OpenClaw backup contract (Phase 4)

## Must cover

- `/root/.openclaw/openclaw.json` (secrets — encrypted backup only)
- `/root/.openclaw/workspace*/` markdown: SOUL, AGENTS, IDENTITY, USER, TOOLS, HEARTBEAT, BOOTSTRAP, MEMORY, DREAMS
- Topic IDs must never be renumbered on restore

## Restore drill

1. Restore to `/tmp/openclaw-restore-drill/` (never overwrite prod blindly)  
2. Diff SOUL/TOOLS/topic map  
3. Confirm gateway.bind remains `loopback` after any config restore  
4. Log drill date in CE or Scorpion hive register  

## Monitor

- `scripts/wip-program/check-openclaw-loopback.sh` on VPS cron (hourly)  
- Alert if listen returns to `0.0.0.0:18789`
