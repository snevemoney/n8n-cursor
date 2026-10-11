---
name: When Remotion
description: >-
  Use when the operator says animate, video, composition, captions, a map route,
  or a walkthrough that should live in code.
---

# When Remotion

Operator stack rule: use the better tool. Remotion is already installed. Do not block it. Do not mint a Remotion product/SKU.

## Fire it when they say
- animate / video / composition / captions
- a walkthrough that should live in code
- a map or route (example: "animate from LA to NY")

## Do
1. Load Remotion `remotion-best-practices` (router).
2. New video → `remotion-create`. Route / city-to-city / flyover → `remotion-maps`. Captions → `remotion-captions`. Preview → `remotion-studio`. Export → `remotion-render`.
3. Write one composition in the repo. Hybrid: agent writes, operator may drag-drop in Studio, save back to the same file.
4. Higgsfield = raw stills/loops in. Remotion = assemble out. Mobbin = taste check on UI-in-video.
5. Hand implementation to Forge (Cursor). Creative Studio owns the cut. Publishing Engine takes the receipt. Preview URL for desks (they cannot hit Mac localhost).
6. App-shaped work (Next.js / React Router + `<Player/>` + pick a renderer): use official `npx remotion skills add` via [remotion-official-skills-import](sand-workflow:remotion-official-skills-import). Source: Jonny Burger `x:2091789219270164975` (scaffold + Player + Lambda/client/Vercel advice). Hosted Remotion MCP dies after 2026-08-31 — official skills are the WORKAROUND.

## Don't
- Invent CSS motion or sit in After Effects because Remotion exists
- Stand up a public video-editor product
- Batch millions unless there is a real list
- Merge main or ship evenslouis.ca without HITL
- Call hosted Remotion MCP after 2026-08-31

## Tools
| Need | Path | Label |
|---|---|---|
| Official Remotion skills | remotion-official-skills-import | **PROVE** |
| Higgsfield plates | `user-Higgsfield` (connected 2026-08-27) | **PROVE** connector; gen still prove-this-session |
| Hosted Remotion MCP after sunset | | **BLOCKED** |


## X bookmarks enrich 2026-09-07

Packet: `/workspace/research/packets/x-bookmarks/20260907-1051/`

- **img2threejs** (@GithubProjects): still → procedural Three.js. Prefer Remotion / own-motion-lib. Blender+Codex (@theo) = **WORKAROUND** Codex→Cursor; Blender install **BLOCKED** until operator asks. Platform: Cursor + Remotion. Install: none default; repo via import-gate.

## Matt Penny Remotion stack 2026-09-14 (`yt:6bZrTSUR0RM`)

Fire Remotion when the brief needs **connector-backed** edits (not bare “edit this video”).

### Eight connectors (quick gate)
style+frames md · word-level transcript · AI b-roll API (cheap default) · Brave search · voice API · b-roll dict · SFX dict · icon dict — see [remotion-brief-to-render](sand-workflow:remotion-brief-to-render) + [remotion-asset-dictionaries](sand-workflow:remotion-asset-dictionaries).

### Skills list (tape)
slides · Open Montage · rotoscoping · Apple design · liquid background — import-gate only; do not mall-dump.

### Hive remaps (summary)
| Item | Label |
|---|---|
| Cursor + Grok Remotion / own-motion-lib / orb-scroll-demo | **PROVE** |
| Claude desktop as Remotion host | **BLOCKED** |
| Higgsfield plates (no spend unless free/HITL) | **WORKAROUND** |
| Brave / Inworld / HeyGen / ElevenLabs | **BLOCKED** until connected |
| Applied AI Mastermind rent | **BLOCKED** (builder-no-rent) |
| Template→section pre-editor (own) | **WORKAROUND** — L2 `recreation/TemplateSectionAssign.tsx` + `template-section-proof.html` |

Packet: `/workspace/research/youtube-daily/l2-20260914/6bZrTSUR0RM/`


## WL800 title-only enrich 2026-09-17

`yt:NTfXwQ85suw` — Full 3D Animation using Remotion with Claude Code (Lukas Margerie)

**Title steal:** Remotion owns 3D/motion-in-code. Claude Code as host = **BLOCKED** second face → Cursor + Grok **WORKAROUND**. Pair [remotion-brief-to-render](sand-workflow:remotion-brief-to-render). Adjacent L2s `yt:6bZrTSUR0RM` / `yt:W1jRF5hDAfo` already closed — no redo.

| Item | Label |
|---|---|
| Remotion path | **PROVE** |
| Claude desktop / Claude Code OS face | **BLOCKED** |
| Cursor CloudAgent write Remotion | **WORKAROUND** |
| L2 this fire | **SKIP** |

Packet: `packets/signal-miss-backfill-20260917/watch-later/`

## X bookmarks 20260924-1623 — Opus one-prompt motion cluster
Ids `2103048400157696039` · `2102712897701097828`.
Trigger still Remotion when operator says animate / composition / captions / walkthrough-in-code.
Claude Opus 5.5 "one prompt graphic+animation" demos → **WORKAROUND** to Remotion+Higgsfield, not install Claude desktop as motion face.

## X bookmarks 20260925-1315 (`x:2103511092013957138` · `x:2103337314021937232`)

Packet: `/workspace/research/packets/x-bookmarks/20260925-1315-desktop/`.

**FACT:** launch + single-prompt motion demos continue to land in bookmarks — Remotion remains assemble face when operator says animate/video/composition.
**Map:** Prefer Remotion (plugin already installed) over CapCut/AE for hive assemble; Cap hold video bodies.

| Need | Label |
|---|---|
| Remotion assemble | **PROVE** |
| CapCut/AE as hive face from bookmark | **BLOCKED** |

## X bookmarks 20260930-1019 — motion kit cluster

Ids `2105209785335373948` · `2104240559632384173` · `2103875279588602225`.
Trigger still Remotion when operator says animate / composition / captions / walkthrough-in-code.
Named Claude skill kit (`echris6/motion-video-kit`) + Opus/Higgsfield demos → **WORKAROUND** to Remotion+Higgsfield, not install Claude Code as motion face.

| Need | Label |
|---|---|
| Remotion assemble | **PROVE** |
| Claude Code motion kit as hive face | **BLOCKED** |


## X bookmarks 20260930-1616-desktop
Trigger unchanged for animate/composition. Claude→Blender demos (`x:2104970447041486998`) and Jev+Opus launch reels (`x:2105023417716191488`) do **not** move assemble face off Remotion. Cap HELD. Install: **none**.


## X bookmark enrich 20261001-1318-desktop (`x:2105375124195021274`)
Operator trigger still animate/video/composition — Raphael batch (16/6d/code) confirms Remotion as assemble face for Opus-authored motion; Cap HELD for full open-source Article.

## Enrich 2026-10-09 — Claude Motion beta (X `2108271552991252810` @claudeai)
FACT (post text only): Anthropic shipped **Claude Motion** (ideas → animated explainers) and **Claude Dashboards** in beta. Feature depth, export format, pricing = UNVERIFIED (media not watched).
- Remotion stays the default: compositions live in our repo, render on our pipeline, Studio hand-edit saves back to the same file. A hosted explainer has none of that.
- Claude Motion = **RESEARCH-OK / WATCH** only. Allowed use: a throwaway storyboard or timing sketch the operator asks for, then rebuild in Remotion. Never the shipped asset, never a second motion stack.
- Claude desktop / Cowork still BLOCKED as hive face (hive-smarter-loop). Install path, if ever, goes through [awesome-skill-import-gate](sand-workflow:awesome-skill-import-gate).
- Pairs with the Oct 6 motion-prompt cluster (0xMovez / 0xCodila) already routed to `own-motion-kit`.


## 2026-10-11 — EffectCraft is the footage-bound AE sidecar (yt:5mi_tYSdkWQ)
When a job needs real After-Effects ops that Remotion can't do in code — point/face tracking, stabilize, keying, LUT/Lumetri on footage — use [effectcraft-headless-motion](sand-workflow:effectcraft-headless-motion) (ArtCraft's AE clone, pure Rust, runs headless on the box via CLI + MCP; PROVE v0.8.0). Remotion stays the assembler of record: EffectCraft tracks/keys/renders, Remotion composes (or import its Lottie export via `@remotion/lottie`, UNVERIFIED on box). Do NOT reimplement tracking in CSS because Remotion exists.
