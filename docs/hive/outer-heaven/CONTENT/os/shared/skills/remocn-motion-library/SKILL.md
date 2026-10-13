---
name: Remocn motion library
description: >-
  Use when building Remotion product demos / motion graphics from the remocn MIT
  effect library (typography, shaders, transitions, UI primitives, icons) —
  copy-paste via shadcn add @remocn/<name>.
---
# Remocn motion library (hive)

**Owner:** Creative Studio + Forge  
**Source:** https://github.com/Remocn/remocn · https://remocn.dev  
**License:** MIT  
**Local mirror:** `/workspace/remocn-lib`  
**Catalog:** `/workspace/research/packets/yyyole-motion-20260824/CATALOG.md` (283 items)

Triggered by operator share of X motion-library posts (e.g. @yyyole). We **own the code** after copy-paste — not a runtime SaaS.

## When
- Product demo / changelog / feature announce / CLI demo / testimonial reel video in Remotion
- Need a typed motion primitive (blur-in, whip-pan, terminal sim, shader backdrop) instead of inventing keyframes

## Do
1. Confirm Remotion project exists (or `npx create-video@latest`).
2. Add effects from the registry (own the files):
   ```bash
   npx shadcn@latest add @remocn/<name>
   ```
   Examples: `soft-blur-in`, `whip-pan`, `terminal-simulator`, `shader-mesh-gradient`, `simulated-cursor`, `x-follow-card`.
3. Optional agent skill: `npx skills add Remocn/remocn --yes` (or copy `/workspace/remocn-lib/skills/remocn/` into the Remotion repo).
4. Compose scenes with remotion-brief-to-render. Generative plates still via motion-pipeline / Higgsfield when re-authed.
5. Prefer hive archetypes in `remocn-lib/skills/remocn/references/archetypes/` (product-demo, feature-announcement, cli-tool-demo, etc.).

## Don't
- Re-keyframe every fade from scratch when `@remocn/*` exists
- Treat remocn as requiring Claude Desktop — Cursor + Forge is enough
- Install ComfyUI because a shader looks generative — remocn shaders are Remotion components; Higgsfield for film plates
- Auto-publish social; client send = HITL
- Quote remocn marketing $ as ours

## Tools
| Need | Path |
|---|---|
| Registry clone | `/workspace/remocn-lib` — **PROVE** |
| Catalog | `packets/yyyole-motion-20260824/CATALOG.md` — **PROVE** |
| Add component | `npx shadcn@latest add @remocn/<name>` — **PROVE** |
| Remotion render | remotion-brief-to-render — **PROVE** |
| Higgsfield plates | motion-pipeline — WORKAROUND / re-auth |

## Prompts
**Demo from remocn**
```
Product / length / aspect:
Archetype (product-demo | feature-announcement | cli-tool-demo | …):
Pick 3–8 @remocn effects from CATALOG.md:
Repo path:
Plates via Higgsfield?: yes/no
Compose Remotion; preview Studio; save to same file.
```

**Add one effect**
```
npx shadcn@latest add @remocn/<name>
Wire into composition <id>; scrub @remotion/player; verify no Math.random.
```

## Stage camera (2026-08-26 signal)
**FACT.** remocn changelog 2026-08-21 shipped `Stage`: perspective plane + operator camera (normalized x/y, easing, holds, zoom, roll, deterministic handheld). `contentSize` travels pages taller than the frame.
Use for product-demo page walks and the av1dlive WebNavTutorial. Pair with `simulated-cursor`. Do not invent a follow-cam when Stage exists.
Add: `npx shadcn@latest add @remocn/stage` (plus `@remocn/simulated-cursor` if missing).
Packet: `/workspace/research/packets/signals-20260826/FINDINGS.md` · WebNav: `/workspace/research/packets/av1dlive-mouse-nav-20260826/FORGE_HANDOFF.md`

## Cursor lock (Forge 2026-08-26)
VETO remocn SimulatedCursor (white/30/loud). Use owned Cursor.tsx #111111 / 28 / quiet ripple. Stage camera stays. WebNavTutorial stays in la-to-ny-remotion.
