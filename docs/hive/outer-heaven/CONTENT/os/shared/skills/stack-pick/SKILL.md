---
name: Stack pick
description: >-
  use this when choosing website stack — Next vs Astro vs Framer vs Webflow with
  an honest decision tree
---
# Stack pick

Pick the lightest stack that hits the brief.

## Decision tree
1. Marketing site, mostly static, rare updates → **Astro** (or Framer if non-dev client edits visually).
2. App-like, auth, dashboards, heavy React → **Next.js App Router + Vercel**.
3. Client must edit visually without repo → **Framer/Webflow**; export/handoff plan required.
4. Prototype only → v0/Lovable OK, then move to Git + Next/Astro before production.

## Output
- Chosen stack + 3 reasons
- Rejected options + why
- CMS choice hint (Sanity/Payload/Notion/none)
- Hosting ownership (client Vercel vs builder)

## Rules
- Prefer official docs over affiliate blogs
- Do not leave production only on Lovable

## YT daily stamp 2026-10-03 — Sticky solo stack (`yt:A4_TFHzqAAg`)

Source: Fireship Cap≤1 L2 `/workspace/research/youtube-daily/l2-20261003/A4_TFHzqAAg/`.

### Extra rules (FACT→hive)
5. **Sticky over trendy** — pick the stack that maximizes *your* ship speed; users don't care React vs Angular vs WordPress (FACT). Pieter Levels boring PHP cited as proof pattern (**his $ UNVERIFIED**).
6. **Remap tape SKIT** — SvelteKit + Firebase → hive default **Next.js App Router + Supabase/Postgres** (or Astro when static). Firebase vendor lock-in is a tape-admitted tradeoff — prefer owned DB when relationships grow.
7. **Design order** — functional → beautiful → unique. Mobbin for inspiration (connector **PROVE**).
8. **No-rent preference** — avoid locking production solely on rented prototype hosts (extends rule 4).

### PROVE
- Gate demo remaps `firebase+sveltekit` → `next+supabase`: pack `recreation/solo_builder_gate_demo.py`.

Anti: claiming mastery because Next/Vercel already installed without running sticky + validation gates.
