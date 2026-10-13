---
name: Website stack pick
description: >-
  Use before scaffolding a site — Astro/Sanity or Next for code-owned; Framer/Webflow when client edits visually; Shopify for commerce.
---

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
