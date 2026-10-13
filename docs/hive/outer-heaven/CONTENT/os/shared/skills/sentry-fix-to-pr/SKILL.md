---
name: Sentry fix to PR
description: >-
  Use when Forge/Watchdog need production error → GitHub issue/PR loop —
  blocked until Sentry (or equivalent) exists; workaround via logs + Issues.
---
# Sentry fix → PR

**Owners:** Forge · Watchdog
**Path:** **BLOCKED** — **it would work if we had Sentry** (or Amplitude unlocked for product analytics).  
**WORKAROUND:** Vercel/host logs (after Vercel re-auth) + issue-spine-github + Cursor cloud agent fix PR.

## Steps (workaround)
1. Capture error evidence (log URL, screenshot, repro).
2. Open GitHub issue (issue-spine-github).
3. Forge cloud agent: fix + PR; no auto-merge main.

## When Sentry lands
1. Connect Sentry (operator HITL for secrets).
2. Map issue → GitHub issue → PR.
3. same-day-rubric includes error quiet check.

## Never
- Auto-prod hotfix without HITL
- Install random APM farm from awesome lists

## Tools
| Need | Path |
|---|---|
| GitHub | GitHub MCP — **PROVE** |
| Sentry | manual/issue paste if no Sentry MCP |

## Prompts
**Issue→PR**
```
Issue:
Reproduce · fix · test · PR. No force push main.
```

## YT daily stamp 2026-10-02 (`yt:LmV0OiNjw8c`)
Paper-cut errors → prefer **cloud agent lane** (no deep-work context switch). Hive: open issue → Cursor CloudAgent fix PR (existing WORKAROUND). Live Sentry webhook auto-dispatch still **BLOCKED** (would work if Sentry connected). Router: see `agent-harness-loops` cloud-vs-local table. Pack: `youtube-daily/l2-20261002/LmV0OiNjw8c/`.
