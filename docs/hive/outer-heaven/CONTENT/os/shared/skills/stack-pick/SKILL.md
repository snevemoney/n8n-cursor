---
name: Stack pick
description: >-
  use this when choosing website stack — Next vs Astro vs Framer vs Webflow with
  an honest decision tree
merged_from: [website-stack-pick]
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

---

## Merged from `website-stack-pick` (2026-10-11)

- Original description: Use before scaffolding a site — Astro/Sanity or Next for code-owned; Framer/Webflow when client edits visually; Shopify for commerce.
- Unique content carried: Shopify-for-commerce and Framer/Webflow-client-edits branches

# Website stack pick

Sources: website-skills-dossier 2026-08-12; LIVE ugly-sites/AI-native enrich `yt:NNv80mMzFDs` `yt:Tliio-33w4g` (CAPTION_GAP).

## When
Choosing stack for a client or portfolio site.

## Do
1. Marketing/portfolio with agent-maintained code: Astro+Sanity or Next+Sanity/Payload.
2. Full product app: Next App Router + Vercel (auth → [better-auth-next-scaffold](sand-workflow:better-auth-next-scaffold)).
3. Design-led landing, client will not touch Git: Framer.
4. Non-technical CMS owner: Webflow.
5. Commerce: Shopify theme or headless Shopify+Next. Do not rebuild checkout.
6. Record stack + why in one paragraph before UI code. Remap Claude Code stack demos → Cursor.

## Don't
- Pure custom commerce without eng retainer
- Lovable/v0 as the long-term SoT for client code

## Tools
| Need | Path |
|---|---|
| Defaults | this skill + website-build-pipeline — **PROVE** |
| Lovable long-term SoT | **BLOCKED** needsAuth / anti-pattern |
| Vercel | **BLOCKED** needsAuth — Hostinger HITL **WORKAROUND** |

## Prompts
**Stack pick**
```
Site job:
Editor: agent-git | visual-client | mixed
Pick: Astro+Sanity | Next+shadcn | Framer | Webflow | Shopify
Why (1 paragraph):
Auth needed?: Better Auth scaffold Y/N
```
