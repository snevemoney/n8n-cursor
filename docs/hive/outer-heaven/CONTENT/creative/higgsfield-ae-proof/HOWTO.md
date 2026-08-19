# HOWTO — Higgsfield / AE MCP: reference → editable layers (v1)

**Owner:** Creative Studio · 2026-08-12  
**Queue:** P1 operator (via Researcher)  
**Proof pack:** this folder (`proof-ref-to-layers.mp4` + `stills/`)  
**Theme hub:** `THEMES/after-effects.md`  
**No NSFW · no $50k claims**

Label legend: **FACT** · **OPINION** · **INFERENCE** · **UNVERIFIED**

---

## What this proves (OPINION)

Browser AI usually returns a **flat render**. The Higgsfield AE + MCP path aims for the opposite: a **reference (or prompt) becomes native AE structure** you can keep editing — layers, keyframes, expressions — inside the live project.

This pack’s short clip is a **conceptual layer-stack proof** (merged reference → BG / light / glass plates → remixed). It demonstrates the *shape* of the workflow for portfolio/partner talk. It is **not** a claim that Claude ran live MCP against AE in this Grok session.

---

## Two different “MCP” ideas (FACT)

| Endpoint / path | What it does |
|-----------------|--------------|
| Regular Higgsfield MCP | Generates assets (image/video). Does **not** drive AE. |
| **AE bridge** `https://bridge.higgsfield.ai/mcp` | Connects Claude ↔ Higgsfield AE plugin so the agent can work on **compositions, layers, keyframes, effects, scripts**. |

Source: [Higgsfield Inside Adobe After Effects](https://higgsfield.ai/blog/higgsfield-after-effects) (2026-07).

---

## Install + connect (FACT — official)

1. AE **2024 (24.0)+** (plugin page also cites 2025+ for some tools — treat 24.0 as floor; upgrade if panel missing).  
2. Install plugin from [higgsfield.ai/plugins/after-effects](https://higgsfield.ai/plugins/after-effects) (macOS `.dmg` → Applications).  
3. AE open → **Window → Extensions → Higgsfield**. Sign in (same credits as web).  
4. Claude Desktop: add MCP connector URL **`bridge.higgsfield.ai/mcp`**.  
5. Alternate agent surface: Higgsfield **Supercomputer** auto-detects the plugin (no extra connector).

Operator history (hive): prior chat already opened `MCP_Demo_Breathing` and used Window → Extensions paths — see `THEMES/after-effects.md` link.

---

## Target workflow: reference → editable layers (FACT + INFERENCE)

**Bookmark signal (FACT text):** @higgsfield (2026-07-14) — MCP/plugin upgrade powered by Fable 5 includes: build AE plugins; **drop in a reference → decompose into editable vector layers you can animate**; AI assistant; localize projects.

**Agent can do inside a live comp (FACT from Higgsfield blog):**

- Build effects/animations from a description in the active composition  
- Recreate a design from an **image reference**, or an animation from a **video reference**  
- Generate expressions from plain language  
- Import Higgsfield generations onto the timeline  

**Recommended operator loop (OPINION — Creative Studio):**

1. **Taste lock** — drop 1 reference still (or use cinematic brand plates).  
2. **Ask the agent (via AE bridge)** — e.g. “Decompose this reference into BG, light leak (Add/Screen), glass shards, and grain overlay as separate layers; keep brand dark premium.”  
3. **Verify stack** — rename layers, set blend modes, confirm nothing is a single flattened pre-render.  
4. **Animate** — keyframe opacity/position/rotation per plate; keep easing `0.22,1,0.36,1` for web-adjacent motion.  
5. **Finish in panel** — Reframe / Remove BG / Upscale / Draw to Edit as needed (still inside AE).  
6. **Export** — poster + muted WebM/MP4 under ~4MB for web (see cinematic landing pack).

---

## Proof assets in this folder

| File | Role |
|------|------|
| `stills/01-reference-merged.png` | Flat reference (what you “drop in”) |
| `stills/02-layer-bg.png` | BG plate |
| `stills/03-layer-light.png` | Light-leak plate (Screen/Add in AE) |
| `stills/04-layer-glass.png` | Glass/shard plate |
| `stills/05-layer-grain.jpg` | Grain texture plate |
| `proof-ref-to-layers.mp4` | ~7s muted sequence: merged → plates → remixed |

**How to use in AE (OPINION):** Import stills as footage → stack 02–05 over each other → set light to **Screen** or **Add**, grain to **Overlay** ~20–40% → animate opacity/position. Matches the MCP “editable layers” outcome without waiting on credits for a demo meeting.

---

## Do / Don’t

**Do**

- Prefer bridge MCP when the goal is **editable AE**, not just a file dump.  
- Keep client-facing voice/audio on separate HITL path (ElevenLabs post-call).  
- Label portfolio claims carefully: “agent builds native layers” ≠ “fully autonomous $50k studio.”

**Don’t**

- Confuse web generation MCP with `bridge.higgsfield.ai/mcp`.  
- Ship NSFW.  
- Invent sold case studies or dollar outcomes.  
- Expect offline generation (FACT: inference is server-side).

---

## Definition of done (this P1)

- [x] Short proof clip **or** still sequence  
- [x] 1-page HOWTO (this file)  
- [x] Dropped under `~/.grokbot/research-packets/cinematic-site/higgsfield-ae-proof/`  
- [ ] Optional: live AE screenshot of layer stack after operator runs bridge once (operator machine)

