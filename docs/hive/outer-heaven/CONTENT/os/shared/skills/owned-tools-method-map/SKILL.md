---
name: Owned tools method map
description: >-
  Use when picking which installed/owned tool does a job (search, fetch, transcribe, cheap judgment, alerts, backups, monitoring, evals, secrets scan, teardown) — maps task to CLI and proof-of-use log.
---
# Owned tools method map (2026-10-11)

Every call should leave a line in `~/.local/state/owned-tools/use.jsonl` (oh-* CLIs and jev-route do it automatically; otherwise run `oh-uselog <tool> <method>`).

| Need | Use | Notes |
|---|---|---|
| Cheap first-pass classification / routing | `jev-route "<task>" <platform>` / `oh-jev` | advisory only; exit 2 = needs review |
| Web research | `oh-search` (SearXNG) then `oh-fetch` (MCP fetch) | before paid search |
| Video/audio claims | `oh-transcribe <url>` | cached in /workspace/transcripts |
| Human-must-act alert | `oh-notify` (ntfy) | only when a human must act |
| Job liveness | Healthchecks pings via scheduler `lib.sh hc` | box-backup, offsite-copy |
| Backups | restic via `/workspace/backups/scheduler` (02:10, 04:40) | check with `ensure.sh` / `ctl.sh status` |
| Site uptime / host metrics | Uptime Kuma (status.evenslouis.ca), Beszel | VPS, Forge-owned |
| Router/prompt evals | `/workspace/tools/jev-evals/run.sh` (promptfoo) | after any jev-route change |
| Risk policy for candidates | JevRouter (`/workspace/tools/JevRouter`) | ideas ported into jev-route v3 |
| Secret scan before commit | `detect-secrets scan <paths>` (or `git diff | rg` for key patterns) | required before brain-export |
| Teardown / RE | `app-teardown-rea` skill | REA MCP, Ghidra fallback |
| Clarify before build | `grill-me-into-prompt` | |
| Crawl at scale / long-term memory | Crawl4AI, mem0 | OFF on VPS (profiles crawl/mem); ask Forge to enable |
