# Watchdog workflow tests
Status: filled
Date: 2026-08-14
From take: takes/watchdog.md

## Tests

### 1. should-run + product-state control plane
- Tape change: Packet 9 (`IWdvG9Up8Mc`) — pick one recurring check (healthz, click-live, should-run) and run it until known-good. Packet 2 (`TL8V41Ea6oM`) — read/draft is the smoke; promotion only after the gate passes more than once. Job card owns `should-run` and `product-state --validate`.
- Command:
  ```bash
  python3 scripts/hive/os/should-run.py --help
  python3 scripts/hive/os/should-run.py --self-test
  python3 scripts/hive/os/should-run.py --agent Watchdog --event '{"type":"hive.heartbeat"}' --state '{"lifecycle":"production"}'
  python3 scripts/hive/os/should-run.py --agent Watchdog --state '{"lifecycle":"development","blocked":true}'
  python3 scripts/hive/product-state.py --help
  python3 scripts/hive/product-state.py --validate
  python3 scripts/hive/product-state.py --list
  python3 scripts/hive/product-state.py --can-act Watchdog hive-os
  curl -sS -o /dev/null -w "%{http_code}" --max-time 5 http://127.0.0.1:3003/scorpion/healthz
  ```
- Result: pass
- Evidence: `--help` printed flags (`--self-test`, `--validate`, `--can-act`). `should-run self-test: OK` (4 fixture cases). Watchdog heartbeat → `RUN`. Watchdog on a blocked project → `RUN` (desk is in the blocked-exception set). `product-state validate: OK (6 projects)` — clipengine, hive-os, operator, proofcheck, sentinel, trendspotter. `--can-act Watchdog hive-os` → `decision: RUN`. Local Scorpion was down (`curl` exit 7, `code=000`, no listener on 3003) — healthz not faked; not a script fail.

### 2. golden-path-smoke-notify fixture vs last-known-good (wiki-lint)
- Tape change: Packet 3 (`sboNwYmH3AY`) — fail an ingest if index, log, and source do not agree. Packet 6 (`IVx8OSMbTss`) — “eighty-five checks” is a report; still click the fixture. Proposed skill `wiki-lint` / `golden-test-loop`.
- Command:
  ```bash
  python3 -c "import json; json.load(open('workflows/hive/golden-path-smoke-notify.json'))"
  # compare JSON path/url/responseMode to one-pagers/watchdog.md + agent-workflow-map.md
  ```
- Result: fail
- Evidence: JSON parses. `id=TyxDfyLVDtxgqHfC` matches `live-workflow-inventory.json`. Name matches. No secret needles in the fixture. Last-known-good docs disagree with source (4 mismatches):
  - one-pager / map path `hive-smoke-notify` vs JSON `hive-golden-path-smoke`
  - one-pager `onReceived` vs JSON `responseNode`
  - one-pager register `evenslouis.ca/scorpion/api/hive/register` (+ “auth header present”) vs JSON `https://evenslouis.ca/api/services/register` (no auth keys)
  - one-pager “No code node” vs JSON two code nodes (`Build Register Payload`, `Evaluate Result`)
  Did not POST the live webhook. `scripts/hive/grok-skills/golden-test-loop.md` is missing (proposed only).

### 3. cinematic preview host ≠ custom domain
- Tape change: Packet 6 (`IVx8OSMbTss`) — preview host is not the custom domain; login broke on the owned host while `*.vercel.app` worked. `paid-slice-funnel` dual smoke. Proposed `preview-domain-smoke`. STYLE_BIBLE residual: `https://cinematic-ai-partner.vercel.app/` — no prod deploy.
- Command:
  ```bash
  curl -sS -D - -o /tmp/wd-cinematic-body.bin -w "%{http_code} %{url_effective}" --max-time 15 \
    https://cinematic-ai-partner.vercel.app/
  ```
- Result: pass
- Evidence: HTTP 200. Final URL stayed `https://cinematic-ai-partner.vercel.app/` (no redirect onto an owned host). `server: Vercel`, `x-vercel-cache: PRERENDER`. Host ends with `.vercel.app` → preview, not custom domain. HTML preload for `/hero/poster.webp`. This is a preview smoke only — not a ship, not a custom-domain login, not Stripe. CTA click not run (no owned URL shipped). Local healthz still down. Did not open farm / income dashboards.

## Never (operate)
- No farms, OTP, fake identity, mass-DM, betting, or auto-dial.
- No send / pay / deploy / book / publish. No live webhook POST. No Grok Bot.
- Do not call a ship done from a dashboard reload, a `*.vercel.app` 200, or an agent self-score.
- Do not merge `LESSONS-FROM-TAPE.md`. Takes stay SSOT.

## Blocked on Evens
- Local Scorpion not up (`127.0.0.1:3003` refused). Do not start or deploy it from this desk.
- One-pager vs `golden-path-smoke-notify.json` drift — Evens picks SSOT before anyone rewrites the one-pager or fires `/webhook/hive-smoke-notify` vs `/webhook/hive-golden-path-smoke`.
- `golden-test-loop.md` not on disk. Proposed skills stay listed until Evens says write the file.
- Custom-domain attach, Stripe live keys, and prod deploy stay HITL.
