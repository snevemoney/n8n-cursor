# Client Engine `/pro` path + Auth.js fixes

These patches belong in `snevemoney/client-engine` (VPS: `/root/client-engine`).

**Push path:** this cloud agent’s Cursor GitHub App token is still limited to
`snevemoney/n8n-cursor` only (`/installation/repositories` → total 1), so
`git push` as `cursor[bot]` to `client-engine` returns 403. The VPS can push
as GitHub user `snevemoney` via `~/.ssh/id_ed25519`.

To let cloud agents push CE directly, grant the Cursor GitHub App access to
`client-engine` (or All repositories) under GitHub → Settings → Applications → Cursor.

Verify App scope:

```bash
gh api /installation/repositories --jq '.repositories[].full_name'
```

## Apply on a machine that already has the repo

```bash
cd /path/to/client-engine
git checkout -b cursor/domain-path-consolidation-59dd
git apply docs/../   # or copy from n8n-cursor:
git apply /path/to/n8n-cursor/docs/patches/client-engine/pro-path-auth-basepath.diff
# key files also under files/ if apply fails
```

## Already applied live on VPS

- Auth.js basePath + request rewrite for `/pro`
- `docker-compose.yml` `pro` service on `:3204`
- `DATABASE_URL` host fixed to `postgres` (not a bridge IP)
- Apex Caddy `/api*` → Client Engine `:3200` (see `infra/caddy/Caddyfile.evenslouis.prod`)

## Dashboard Playwright follow-ups (2026-08-07)

Patch: [`dashboard-dev-fixes-59dd.diff`](./dashboard-dev-fixes-59dd.diff)  
File copies: [`files/dashboard-dev/`](./files/dashboard-dev/)

From CE nav crawl (`docs/wip-program/CE_NAV_CRAWL_FINDINGS.md`):

1. **Health score formatting** — `formatHealthScore()`; Founder + Copilot no longer show `77.142857…warning`
2. **Meta Pixel** — `MetaPixel.tsx` skips `/dashboard`, `/login`, `/pro`; CSP allowlists `connect.facebook.net` for marketing pages
3. **Conversion funnel** — API default range `all` + range selector UI (was empty `last_4_weeks` vs Leads inventory)

```bash
cd /root/client-engine
git apply /root/domain-paths/n8n-cursor/docs/patches/client-engine/dashboard-dev-fixes-59dd.diff
# or copy from files/dashboard-dev/ into matching paths
docker compose build app && docker compose up -d app
```

Still ops (not in this patch): Meta Ads Graph token, stale scoreboard/jobs/workday.

## AI Brain Sonnet 5 + YouTube transcripts (2026-08-07)

Patch: [`ai-youtube-sonnet5-59dd.diff`](./ai-youtube-sonnet5-59dd.diff)  
File copies: [`files/ai-youtube/`](./files/ai-youtube/)  
Report: [`../../wip-program/CE_AI_YOUTUBE_FIX_REPORT.md`](../../wip-program/CE_AI_YOUTUBE_FIX_REPORT.md)

1. **AI Brain** — `claude-sonnet-5` (drop temperature; optional `ANTHROPIC_BRAIN_MODEL`)
2. **YouTube** — copy transcript npm packages into Docker runner; static imports; Innertube captions fallback; `YOUTUBE_COOKIES`; retry API/UI

Applied live on VPS app image. Remaining failures need operator cookies for YouTube bot check.
