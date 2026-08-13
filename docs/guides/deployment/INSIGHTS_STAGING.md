# InsightsLM staging (later)

Reserved operator path: `https://evenslouis.ca/insights*`

## Current state

Caddy returns **503** with a reserved message for `/insights*` behind operator basic_auth.
Do **not** stage the app until CE / n8n / OpenClaw creative loop is stable (**WIP Phase 8 exit**).

Checklist: [../../wip-program/phases/15-insights-staging.md](../../wip-program/phases/15-insights-staging.md).

## When ready

1. Deploy InsightsLM (from `insights-lm-private`) bound to `127.0.0.1` with a chosen port.
2. Replace the `respond 503` block in `infra/caddy/Caddyfile.evenslouis.prod` with `reverse_proxy`.
3. Wire OpenClaw `#research` (8) / `#autoresearch` (9) per [OPENCLAW_TOPIC_CAPABILITY_MAP.md](./OPENCLAW_TOPIC_CAPABILITY_MAP.md).
4. Keep gated — never public on the portfolio hero.

## Anti-overlap

One grounded-research surface with Scorpion RAG — do not market InsightsLM as a second public product.
