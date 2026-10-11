---
name: Skill recall by use
description: >-
  Use when you need the right hive skill(s) for a job — by bucket (Remotion,
  research, websites, marketing, …) or by how skills were used before; never
  dump the full catalog.
---
# Skill recall by use

**Owner:** any desk (Researcher maintains indexes). **Never** paste 100+ skill names into chat.

## Sources (read in order)
1. Plain-English map + buckets: `/home/box/.grokbot/outer-heaven/CONTENT/skills/SKILL_STRUCTURE.md`
2. Usage scores + log: `…/SKILL_USAGE.md` · `SKILL_USAGE.json` · `SKILL_USAGE_LOG.md`
3. Machine catalog: `…/SKILL_CATALOG.json` (mirror `/workspace/research/skills-structure/`)
4. Signal provenance: `/workspace/research/SIGNAL_INDEX.md`
5. Saylor course overlay (optional): `CONTENT/saylor-skill-triggers.md` — Consultant picks 1–3

## Steps
1. Restate the job in one line (plain English).
2. Match **bucket** from SKILL_STRUCTURE “Plain-English job → bucket”.
3. Inside that bucket, pick **1–3** skills:
   - Prefer higher `use:` score when the job matches prior hive work.
   - Else match `description` / id keywords.
4. Open each skill’s SKILL.md and run it. Tools: PROVE / WORKAROUND / RESEARCH-OK / hard keep-out per `topics/signal-keepouts-loosen.md`.
5. After a meaningful run, **log usage**:
   - Append a row to `CONTENT/skills/SKILL_USAGE_LOG.md`, and/or
   - `append-action-log.py --agent "<desk>" --action used-skill --target "<skill-id>" --result "<one line>"`
6. Rebuild indexes when many skills added — ask Researcher / re-run structure build.

## Anti-triggers
- Do not dump SKILL_CATALOG or all Saylor COURSE-SKILLs into operator chat.
- Do not pick leisure / real-quarantine skills as fun installs.
- Do not treat usage score as proof of $ claims.

## Platform / Install
- Platform: Grok Bot + Cursor
- Install: `none (process-only)`

## Quick map
| Job | Bucket |
|---|---|
| Remotion / scrub-scroll / animations / video frames | motion-video |
| Watch video / bookmarks / research / steal | research-signals |
| Landing / Client Pack / funnel / shadcn | websites-product |
| Build / fix / PR / verify | dev-engineering |
| Leads / offer / ICP / marketing | business-marketing |
| Stripe / money | money-finance |
| Course / career | professional-career |
| Email / calendar | comms |
| Session / hive ops | ops-hive |

## HN Social 2026-09-07
From Ask HN skills-management thread (packet web-intel-social-20260907):
- Prefer **1–3** skills that are reactive house rules or NL→tool adapters — not a mall.
- If AGENTS.md / job card already covers it, **skip skill pick**.
- Public inspiration OK; 1:1 install still goes through [awesome-skill-import-gate](sand-workflow:awesome-skill-import-gate).
