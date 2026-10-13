---
name: Ship Vercel
description: >-
  use this when deploying to Vercel production with env hygiene and domain
  ownership clear
---
# Ship Vercel

## Steps
1. Confirm preview green after seo/a11y/perf passes.
2. Env vars only on Vercel/host — rotate any that were pasted in chat.
3. Production domain ownership documented (client account preferred).
4. Deploy production; verify HTTPS and redirects.
5. Smoke key paths: home, primary CTA, booking/form.
6. Hand remaining items to client-handoff.

## Tier 3
- Never change prod secrets or DNS without operator approval when client-owned.
