# CE dashboard — what needs fixing (Playwright)

Crawled: 2026-08-07T16:26Z · Base: `https://evenslouis.ca` · **43** sidebar routes

**Result:** broken **0** · needs_fix **7** · needs_attention **9** · ok **27**

All listed sidebar routes **load (HTTP 200)** after Auth.js login. Issues below are functional/UX/data, not dead links.

Script: `scripts/wip-program/ce-nav-playwright-crawl.mjs`

## Global (every page)

- **csp_blocks_fbevents** (fix): CSP blocks `https://connect.facebook.net/en_US/fbevents.js` on every dashboard page — allowlist in CSP **or** remove Meta Pixel from dashboard layouts (Pixel does not belong on operator UI).
- **health_banner_everywhere** (warn): Global Intelligence banner shows `Health 77 / 1 risk / 4 actions` on every page — verify accuracy; round display; reduce noise.

## Priority fixes

### Meta Ads (`/dashboard/meta-ads`) — token broken
- UI says **Meta: live** but body/API: **Invalid or expired token** + console **401**.
- Fix: regenerate Graph API / System User token with `ads_read`; update CE secrets; confirm refresh path.

### Conversion (`/dashboard/conversion`)
- Funnel shows **all zeros** (`TOTAL LEADS 0` … `WON 0`) despite Leads page showing **86** total — metrics wiring / date filter / stage mapping bug.

### Scoreboard (`/dashboard/internal/scoreboard`)
- **Last computed 155d ago · Stale** — recompute job not running; wire to job schedules / workday run.

### System Health (`/dashboard/ops-health`)
- Workday run **Failed**; last run **2026-03-04** — stale ops automation; restart/fix workday job + failure alerting.

### Jobs (`/dashboard/jobs`)
- Shows **1 Stale**; queue otherwise empty — recover stale jobs; ensure scheduler ticks.

### Retention (`/dashboard/retention`)
- **STALE** badge + **OVERDUE 1**; testimonials/reviews/referrals all 0 asked — refresh retention rules + clear overdue.

### Home (`/dashboard/founder`) + Copilot (`/dashboard/copilot`)
- **Ugly number precision**: `Business Health Score 77.14285714285714` (and Copilot score context) — format to 0–1 decimal; fix “warning” glued to number (`77.14warning` → separate badge).

## Needs attention (data/ops, not crashes)

| Page | Issue |
|------|--------|
| **Growth** | Pipeline empty (`new (0)`); no follow-ups in 7d |
| **YouTube** | Ingest works but **Failures (14)**; multi-provider fallback noise — clear/retry failures |
| **Leads** | **2 NEEDS PIPELINE** — run pipeline action for those leads |
| **Follow-ups** | Queue empty (ALL 0) while Reminders has overdue — sync follow-up generation from reminders/leads |
| **Forecast** | Low-confidence warnings — capture snapshot / improve inputs |
| **Delivery** | **OVERDUE 1** project — operator action |
| **Scorecard** | “Time to close No …” — missing close/revenue calibration data |
| **Reminders** | **Open 8 / Overdue 6** — highest operator backlog |

## Healthy / usable (no page-level product flags)

Lead Intake, Prospect, Signals, Decisions, Proposals, Handoffs, Build Ops, Deploys, Proof, Campaigns, Reviews, Proof Candidates, Content Posts, Risk, Intelligence, Next Actions, Inbox, Founder OS, Knowledge, Automation, Operator, Settings, Notifications, Channels, Flywheel, Exec Metrics, Job Schedules.

## Suggested fix order

1. **Meta Ads token** (blocking live ads control)  
2. **Round health score + CSP/Pixel** (global polish / console clean)  
3. **Workday / Scoreboard / Jobs stale** (system automation)  
4. **Conversion funnel vs Leads count mismatch** (metrics bug)  
5. **Reminders overdue + Follow-ups empty** (operator loop)  
6. **YouTube failure backlog**  
7. Data empties (Growth/Scorecard) once pipelines run  

## Full severity table

| group | label | href | severity | signals |
|-------|-------|------|----------|---------|
| capture | Lead Intake | `/dashboard/intake` | **ok** | — |
| capture | Prospect | `/dashboard/prospect` | **ok** | — |
| capture | Signals | `/dashboard/signals` | **ok** | — |
| capture | Growth | `/dashboard/growth` | **needs_attention** | growth_pipeline_empty |
| capture | Copilot | `/dashboard/copilot` | **needs_fix** | ugly_number_precision |
| capture | Meta Ads | `/dashboard/meta-ads` | **needs_fix** | expired_token_401 |
| capture | YouTube | `/dashboard/youtube` | **needs_attention** | failures_14 |
| convert | Leads | `/dashboard/leads` | **needs_attention** | needs_pipeline |
| convert | Decisions | `/dashboard/decisions` | **ok** | — |
| convert | Proposals | `/dashboard/proposals` | **ok** | — |
| convert | Follow-ups | `/dashboard/followups` | **needs_attention** | followups_empty |
| convert | Forecast | `/dashboard/forecast` | **needs_attention** | low_confidence |
| build | Delivery | `/dashboard/delivery` | **needs_attention** | has_overdue |
| build | Handoffs | `/dashboard/handoffs` | **ok** | — |
| build | Build Ops | `/dashboard/build-ops` | **ok** | — |
| build | Deploys | `/dashboard/deploys` | **ok** | — |
| prove | Proof | `/dashboard/proof` | **ok** | — |
| prove | Scorecard | `/dashboard/scorecard` | **needs_attention** | scorecard_no_data |
| prove | Campaigns | `/dashboard/campaigns` | **ok** | — |
| prove | Reviews | `/dashboard/reviews` | **ok** | — |
| prove | Proof Candidates | `/dashboard/proof-candidates` | **ok** | — |
| prove | Content Posts | `/dashboard/content-posts` | **ok** | — |
| optimize | Conversion | `/dashboard/conversion` | **needs_fix** | funnel_all_zero_mismatch |
| optimize | Retention | `/dashboard/retention` | **needs_fix** | stale_metrics |
| optimize | Risk | `/dashboard/risk` | **ok** | — |
| optimize | Intelligence | `/dashboard/intelligence` | **ok** | — |
| optimize | Scoreboard | `/dashboard/internal/scoreboard` | **needs_fix** | stale_155d |
| system | Home | `/dashboard/founder` | **needs_fix** | ugly_number_precision |
| system | Next Actions | `/dashboard/next-actions` | **ok** | — |
| system | Inbox | `/dashboard/inbox` | **ok** | — |
| system | Reminders | `/dashboard/reminders` | **needs_attention** | overdue_6 |
| system | Founder OS | `/dashboard/founder/os` | **ok** | — |
| system | Knowledge | `/dashboard/knowledge` | **ok** | — |
| system | Jobs | `/dashboard/jobs` | **needs_fix** | stale_job |
| system | Automation | `/dashboard/automation` | **ok** | — |
| system | Operator | `/dashboard/operator` | **ok** | — |
| system | Settings | `/dashboard/settings` | **ok** | — |
| system | Notifications | `/dashboard/notifications` | **ok** | — |
| system | Channels | `/dashboard/notification-channels` | **ok** | — |
| system | Flywheel | `/dashboard/flywheel` | **ok** | — |
| system | Exec Metrics | `/dashboard/system` | **ok** | — |
| system | System Health | `/dashboard/ops-health` | **needs_fix** | workday_failed_stale |
| system | Job Schedules | `/dashboard/job-schedules` | **ok** | — |
