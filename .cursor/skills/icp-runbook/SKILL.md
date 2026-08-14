---
name: icp-runbook
description: >-
  Pick icp_id and run the hunt runbook today. Use when the operator names a
  clinic, restaurant, creator, agency, industrial SMB, coach, or tags a prospect.
  Cursor plus Grok Bot.
---

# ICP runbook (Cursor)

Index: `docs/hive/outer-heaven/CONTENT/icp-runbooks/INDEX.md`  
Hunt log: `docs/hive/outer-heaven/CONTENT/icp-runbooks/HUNT_LOG.md`  
Default city: **Greater Montreal**

1. Route siblings via INDEX disambiguation — tag the right `icp_id`.
2. If operator need is broader than one prospect → run `catalog-demand-match.py` first.
3. Read `CONTENT/icp-runbooks/{icp_id}.md`.
3. **Named URL?** Path A money spine (MUST → margin) before build — even for A/C types.
4. Run **Today** (max 3 actions), then append **HUNT_LOG.md** with **stage** column (`discovered` minimum).
5. Pipeline stages: `CONTENT/icp-runbooks/ICP_PIPELINE.md` · stats: `python3 scripts/hive/hunt-log-stats.py`
6. Session 2 on next loop.

Proof in client drafts: public URLs only · STL `:3007` · cinematic `:3005` · MCP `:3006`.
6. Hard step stays HITL.

Skill file: `scripts/hive/grok-skills/icp-runbook.md`
