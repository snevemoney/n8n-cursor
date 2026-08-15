---
name: icp-runbook
description: Load the hunt runbook for a tagged icp_id and run website-offer-funnel today. Use when hunting a clinic, restaurant, creator, agency, industrial SMB, coach, or internal us work. Cursor plus Grok Bot.
---

# ICP runbook (pick and run)

**Index:** `docs/hive/outer-heaven/CONTENT/icp-runbooks/INDEX.md`  
**Hunt log:** `CONTENT/icp-runbooks/HUNT_LOG.md` — append at end of every Today  
**JSON:** `CONTENT/watch-later/business-types.json`  
**Default city:** Greater Montreal (unless Evens names another)  
**Router:** `catalog-demand-match` **then** `website-offer-funnel` (never website-first for unmapped needs)

## When
Operator or agent tags a prospect with `icp_id`, or says “hunt [type] today.”

## Steps
1. Open `CONTENT/icp-runbooks/INDEX.md` — **route siblings** (disambiguation table). Pick the right `icp_id`.
2. Open `CONTENT/icp-runbooks/{icp_id}.md`.
3. Confirm Path A / B / C from the runbook (do not guess).
4. **Named URL on any client ICP?** Run Path A money spine first: MUST → constraint → four-blank → margin — **before** build (even A/C types).
5. Run the **Today** block — three actions max this session.
6. **Append row(s) to `HUNT_LOG.md`** (date · icp_id · city · url · leak · contact · MUST · **stage** · next · owner). Default `stage=discovered`. Stats: `python3 scripts/hive/hunt-log-stats.py`.
7. Follow the skill chain in order; hard step = HITL. On disk: `lead-web-find` · `four-blank-sku` · `warm-draft-hitl` · `private-book-install` (draft slot, HITL book, icp_id not always plumber) · `discovery-spiced-constraint` · `demo-walk-script` · `proof-30-60-90` · `no-reply-follow-up` · `no-show-follow-up`.
8. Map pattern → `usecase-to-sku` after Consultant POSITION (Path A).
9. Never quote tape/tweet $. Stack = Cursor + Grok only.

## Proof URLs (client drafts — public only)
- Cinematic `:3005` · MCP `:3006` · Speed-to-lead / Intake→Book `:3007` (not :3006 for STL)
- Never put localhost in client-facing drafts.

## If no URL yet
Path B: `list-anneal-funnel` → 3–5 → Path A per runbook. Do not MUST-score raw 50.

## If URL named
Path A from step 1 of runbook — skip raw-50 MUST.

## Session 2
Each runbook has a **Session 2** block — run on the next loop after Today + hunt log.

## Never
Add `business-lanes.json` row from an ICP · auto-dial · fork second steal sheet · double-tag sibling ICPs.
