# Phase 4 — OpenClaw resilience + backups

**Macro:** Agent face survives reboot and restore without soul wipe.

**Refs:** `outer-heaven-backups`, `/root/.openclaw/`, `docs/guides/deployment/OPENCLAW_TOPIC_CAPABILITY_MAP.md`, `docs/guides/deployment/OPENCLAW_WORKSPACE_CONTRACT.md`, `docs/wip-program/HARD_RULES.md`, `/claw/hooks*` on `evenslouis.ca`

**Exit:** Restore drill logged; `gateway.bind=loopback` monitor in place.

## Micro-tasks

- [ ] Automate check that `gateway.bind` remains `loopback` after pm2 restart
- [ ] Document reboot procedure for `openclaw` / `philanthropy` / `embedder` pm2 apps
- [ ] Extend `outer-heaven-backups` cron to include `/root/.openclaw/workspace*` paths
- [ ] Encrypt + retention policy (keep N versions) for workspace backups
- [ ] Restore drill to a **staging** directory (never overwrite prod blindly)
- [ ] Verify `/claw/hooks` still 401/405 without token after Caddy reload
- [ ] Verify gated `/claw` (non-hooks) still requires basic_auth
- [ ] Heartbeat / `#crons` surfaces gateway-down condition
- [ ] Emergency stop runbook: stop hooks/pm2 without deleting markdown souls/topics
- [ ] Confirm topic IDs unchanged vs `OPENCLAW_TOPIC_CAPABILITY_MAP.md`
- [ ] Confirm sandbox BigBoss `TOOLS`/`SOUL` still contain creative-loop append
- [ ] Alert if process listens on `0.0.0.0:18789` again (must stay loopback)
