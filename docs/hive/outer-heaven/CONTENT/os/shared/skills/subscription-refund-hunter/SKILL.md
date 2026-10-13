---
name: Subscription and refund hunter
description: Use on a Gmail receipt scan to list subscriptions and unchased refunds. Recommend cancel/keep. Never auto-cancel or email a merchant.
---
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
