---
name: hive-funnels
description: >-
  Run hive funnels (same as workflows) on Cursor + Grok Bot. Use when the
  operator says funnel, workflow, website offer, paid slice, lead list, wiki
  ingest, session dump, or slice build. Do not adopt other AI vendors.
---

# Hive funnels (Cursor)

Workflow = funnel. Stack = **Cursor + Grok Bot**.

Load the matching file in `scripts/hive/grok-skills/` and follow it. Grok `/` copies live in `~/.grokbot/skills/<slug>/SKILL.md`.

| Operator says | Skill | You do in Cursor |
|---------------|-------|------------------|
| New project / dump | `session-bootstrap` | First message = full dump, then short loops |
| Build site/page/game | `slice-build` | Bible → plan → one system; cinematic → `cinematic-recipe`; verify → `click-live-site` |
| After site ship | `click-live-site` | Open URL, click CTA — no "looks good" |
| Checkout / paid surface | `paid-slice-funnel` | Thin V1; Stripe/domain HITL; smoke preview **and** domain |
| Lead list (volume) | `list-anneal-funnel` | 50 → 60–70% → then 3–5 to Path A |
| Named leaky site | `lead-web-find` | URL + leak + contact → MUST score |
| Outbound | `outbound-playbook-funnel` | After margin green; then discovery/demo |
| Wiki / memory | `wiki-ingest` | Write Outer Heaven pages + log |
| New lane / desk | `interview-to-desk` | Triangle, then one task |
| Unsure / voice / book | `ask-principal` | Ask Evens; never close |
| What do we sell (sentence) | `outcome-offer-funnel` | ICP sentence; client still needs constraint + four-blank |
| Website funnel | `website-offer-funnel` | **Router first** — Path A client / B lists / C our surface |
| One-person use cases | `one-person-usecases` | review-to-book · clip-factory · Person B brief · speed-positioning · demand-validate |
| Any steal / business type | `steal-usecases` + `.cursor/skills/steal-sheet` | One master `STEAL_SHEET.md` — pick `icp_id` then router. Doctrine: `DEEP_SUMMARIES.md` |
| Hunt / run today | `icp-runbook` + `.cursor/skills/icp-runbook` | Open `CONTENT/icp-runbooks/{icp_id}.md` → **Today** block → `website-offer-funnel` |

## Hard step
Send, pay, deploy, book, publish = operator. Never auto.

## Never
Claude Cowork, Claude Code, Codex, ChatGPT, Gemini, Coda, Vapi, Abacus.  
IG OTP farms, auto-dial, unverified YouTube income.
