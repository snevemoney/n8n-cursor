# CE — AI Brain Sonnet 5 + YouTube transcript fix

Updated: 2026-08-07 · Live on VPS `/root/client-engine` (app rebuilt)

Patch mirror: [`docs/patches/client-engine/ai-youtube-sonnet5-59dd.diff`](../patches/client-engine/ai-youtube-sonnet5-59dd.diff)  
Files: [`docs/patches/client-engine/files/ai-youtube/`](../patches/client-engine/files/ai-youtube/)

> GitHub App cannot push to `snevemoney/client-engine` — changes applied on VPS + mirrored here. Local CE branch: `cursor/ce-ai-youtube-fixes-59dd`.

## Done

### AI Brain → Claude Sonnet 5
- `DEFAULT_BRAIN_MODEL = "claude-sonnet-5"` in `src/lib/llm/anthropic.ts`
- Override: `ANTHROPIC_BRAIN_MODEL`
- Removed `temperature` from Anthropic calls (Sonnet 5 returns HTTP 400 for sampling params)
- Docs updated (`CLAUDE.md`, ADR-002, `AI_CONTEXT.md`)
- Verified in production bundle: `claude-sonnet-5`

### YouTube transcript tool
**Root cause:** slim Docker runner omitted `youtube-transcript` / `@danielxceron/youtube-transcript` from `node_modules`, so dynamic imports failed in the app container (worker had full deps).

**Fixes:**
1. `Dockerfile` copies both packages into the runner image
2. Static imports (Next standalone tracing)
3. Hardened `youtube-captions`: Innertube players, multi-format timedtext, fall back when watch-page tracks yield empty segments
4. `YOUTUBE_COOKIES` env for bot-gated videos
5. `POST /api/youtube/transcripts/retry` + **Retry all** UI

**Verified live:**
- Packages present in app container
- Ingest `dQw4w9WgXcQ` → `ok:true`, `providerUsed: youtube-captions`
- Failed backlog videos now surface: `YouTube bot check (LOGIN_REQUIRED) — set YOUTUBE_COOKIES…`

## Remaining broken / ops (not fixed by this deploy)

| Item | Severity | Notes |
|------|----------|-------|
| **YouTube failure backlog (14)** | ops | VPS IP hits YouTube bot check. Set `YOUTUBE_COOKIES` (browser Cookie header) in CE `.env`, restart app, then **Retry all** on `/dashboard/youtube` |
| **Meta Ads token 401** | ops | Regenerate Graph/System User token with `ads_read`; update `META_ACCESS_TOKEN` |
| **Scoreboard stale (~155d)** | ops | Recompute job / workday schedule |
| **Ops Health workday failed** | ops | Last run 2026-03-04 — restart workday job |
| **Jobs: 1 stale** | ops | Recover stale job + scheduler tick |
| **Reminders overdue / Follow-ups empty** | operator | Backlog, not a code crash |
| **Learning proposal on some ingests** | minor | Rickroll transcribed but `PROPOSAL_FAILED` (LLM proposal step) — separate from transcript |

## Operator next steps

1. Export YouTube cookies from a logged-in browser → set `YOUTUBE_COOKIES=...` in `/root/client-engine/.env` → `docker compose up -d app`
2. Open `/dashboard/youtube` → Failures → **Retry all**
3. Rotate Meta Ads token
4. Kick scoreboard/workday job schedules
