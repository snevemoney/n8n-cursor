---
name: Find costs to cut (Demkinn #28)
description: >-
  Use when: Spend review. Demkinn #28. Owner Personal CFO.
merged_from: [free-for-dev-vendor-cuts, subscription-refund-hunter]
---
# Find costs to cut (Demkinn #28)

**Owner desk:** Personal CFO  
**Lane:** hive-os (+ tag others)  
**Sources:** demkinn skills/28  
**Status:** owned  
**HITL:** ASK before cancel/pay


## Tools
| Need | Path |
|---|---|
| Bank / card / SaaS CSV | operator paste — **PROVE** |
| free-for-dev / vendor alts | WebSearch + find-costs-to-cut — **PROVE** |
| Cancel / refund actions | **BLOCKED** without ASK |
| Claim check on savings $ | claim-verifier (#47) — **PROVE** |

## Prompts
**Cost-cut pass**
```
Run Demkinn #28 find-costs-to-cut.
Spend dump:
[paste CSV/summary]
Flag: duplication · underused · spikes · cheaper alts.
Report only — no auto-cancel. ASK list for operator. claim-verifier on savings $.
```

**SaaS duplicate hunt**
```
From this subscription list, group duplicates/overlaps only:
[paste]
```

## When
Spend review

## Do
1. Find: duplication · underused · spikes · unnecessary alts
2. Report only; operator cuts
3. No auto-cancel

## Don't
- Mint agents · auto-send · auto-pay/book/publish
- New icp_id / business-lanes row without operator yes
- $ FACT without claim-verifier (#47)
- Farms/NSFW sources

## Done when
Reusable artifact on disk (brief, packet, checklist, or skill note) — not chat-only.

---

## Merged from `free-for-dev-vendor-cuts` (2026-10-11)

- Original description: Use when hunting free or self-host alternatives before paying for SaaS — ripienaar/free-for-dev bookmark.
- Unique content carried: Gmail receipt subscription scan; free/self-host alternatives list

# free-for-dev vendor cuts

Local bookmark: `/workspace/research/packets/unicode-33-free-20260822/refs/free-for-dev/README.md`
Upstream: https://github.com/ripienaar/free-for-dev

1. Search the README for the paid category.
2. Rank free/self-host options by fit, ops cost, HITL risk.
3. Recommend keep / cut / trial. No auto-cancel or auto-pay.
4. Tag lane id. Savings UNVERIFIED until measured.

Owners: Personal CFO, Consultant.

## LIVE enrich 2026-08-22 — safe open tools skim (`yt:PeYlw9OOqmw`)
Safe map only (no piracy / no full self-host farm install from video):

| Tool | Hive path |
|---|---|
| Whisper-class transcription | summarize-audio-video (**PROVE** box) — prefer over Scriberr install |
| Ollama interest | local-private-agent-lab (wiki card; install only on ask) |
| Automation | Grok-first; n8n-kit-* legacy — Activepieces = **NO-SKILL** install-heavy unless operator asks |
| Coding agent demos (OpenHands) | Cursor cloud agent WORKAROUND — **NO-SKILL** clone OpenHands |
| SearXNG / Vane / Khoj / Open WebUI / LibreTranslate / Tesseract | **NO-SKILL** default (ops-heavy); web tools + claim-verifier already cover research |

Piracy-flavored “illegal” framing = marketing only; extract legal open tools, refuse crack/warez adjacent asks.

## Cursor Auto (effective 2026-08-24)
Auto is per-model priced this cycle; included Cursor-model usage went up. Confirm Settings → Billing before treating Auto as leftover free compute. Do not buy SuperGrok/Cursor Pro just for Grok Bot — hive already has access after the 2026-08-26 expansion.


## WL26-100 remaining L2 2026-08-27 — 10 GitHub replacements (PROVE ASR)

Packet: `/workspace/research/packets/signals-20260826/WL26-100-L2-REMAINING.md`

`yt:jMAe1h39rHo` FACT: AppFlowy / Immich / Documenso / Excalidraw / Penpot / cal.com / Listmonk / Dub / RustDesk / Fluid Voice are **forks-to-taste**, not clone-all. Self-host = you own 3-2-1, deliverability, 11pm ops. Hosted plans still exist on several. Stars / $ / Zapier sponsor = **UNVERIFIED**. Recommend keep/cut/trial only; no auto-cancel.


## WL800 title-only cross-ref 2026-09-17

- `yt:cyIWQHYoUg8` trending OSS agent-fix — catalog via import-gate; no silent vendor swap; $ savings **UNVERIFIED**
- Packet: `packets/signal-miss-backfill-20260917/watch-later/WL800_CLOSE.md`


## Enrich 2026-10-10: Cloudflare Tunnel for CGNAT / no open ports (signals-2mo-backlog-20261010)
Expose a self-hosted service through Cloudflare Tunnel (`cloudflared`: an outbound connection, no port forwarding, works behind CGNAT) instead of opening router ports (x:2041894544740868192, corroborated by x:2064571261980709117's no-open-ports posting stack; mechanism per Cloudflare's public docs). Any real tunnel needs the operator's Cloudflare account: approval-gated.


---

## Merged from `subscription-refund-hunter` (2026-10-11)

- Original description: Use on a Gmail receipt scan to list subscriptions and unchased refunds. Recommend cancel/keep. Never auto-cancel or email a merchant.
- Unique content carried: Gmail receipt subscription scan; free/self-host alternatives list

# Subscription and refund hunter
Owner: Personal CFO.
1. Scan Gmail receipts for subs + refund/cancel mail.
2. List price, last use, expected vs received refunds.
3. Cancel/keep recommendations. Show every proposed merchant message.
Never auto-cancel. Never send. Sacred items stay.

## Enrich — yt:rW3eyvrSqio subscription tracker shape (2026-09-21)
Add ledger + threshold notify (not only cancel/keep):
1. Extract vendor, amount, currency, billing cycle, next charge.
2. Normalize to USD; log sheet/CSV rows.
3. Alert only if amount_usd > 50 **or** cycle = annual.
4. Fixture/local path: `l2-20260921/rW3eyvrSqio/recreation/` — **PROVE** shape.
Never auto-cancel. Never email merchant. Slack/email send = HITL. Zapier deploy face **BLOCKED**.
