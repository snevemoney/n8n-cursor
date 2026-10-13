---
name: AI product UI primitives
description: Use when building Grok or AI Partner chrome from Beautiful UI primitives via Shadcn.
---

# AI product UI primitives

Owner: Creative Studio and Forge. Lane: ai-partner-websites.

Source: x:2092883541482692728 to https://beautifului.dev/ (FACT fetch 2026-08-27).

## When
Agent-app chrome: thinking traces, streaming answers, HITL approval, tool chips, task rows, prompt bar. Not cinematic marketing heroes (use cinematic-site-recipe).

## Do
1. Pick one primitive: loading, thinking, stream, approval, tool-chip, task-row, prompt-bar.
2. Implement with Shadcn plus design-tokens. Mobbin for taste if needed.
3. Approval card is existing Tier-3 HITL. Never auto-send.
4. Click-verify with Playwright.

## Do not
- Vendor the Beautiful UI kit
- Use this for a cinematic landing
- Mint a desk or icp_id from a gallery

## Tools
- Shadcn: PROVE (connected)
- Mobbin: PROVE (connected)
- Playwright: PROVE (connected)
- Figma: BLOCKED needsAuth, screenshot workaround
- user-X: BLOCKED needsAuth, disk workaround

## Prompts
Primitive (one): loading | thinking | stream | approval | tool-chip | task-row | prompt-bar
Implement with Shadcn plus design-tokens.
HITL: approval card never auto-sends.
Click-verify with Playwright.
Do not vendor beautifului.dev.

## Chase inspiration screenshots 2026-08-29 (`yt:nSfEL1Y-nUk`) watch-page PROVE
Before prompting chrome or a landing: collect screenshot refs (posters, Landbook, Dribbble, Mobbin).
Feed refs, then pick a winner. Do not prompt blind. Multi-variant → one implement.
Claude `/design` **BLOCKED** → Cursor + this skill + cinematic-site-recipe **WORKAROUND**.
Higgsfield MCP only if already authenticated. Skool pitch **NO-SKILL**.

## Wave-M repass 2026-09-09 (`yt:nSfEL1Y-nUk`)
Timedtext now **PROVE** (was CAPTION_GAP). Packet: `/workspace/research/youtube-daily/repass-20260909/nSfEL1Y-nUk/`. Steal unchanged — inspiration-first; Claude `/design` **BLOCKED**.

## X bookmarks 20260918-1338 — voice glow taste

Packet: `/workspace/research/packets/x-bookmarks/20260918-1338/` · source x:2100620796796502264 (@Jakubantalik · libraries.dev/voice)

**FACT:** Claims animated voice glow, zero dep, dark/light themes; playground link + video.
**UNVERIFIED:** "zero dep" / package quality beyond vendor claim.

### Map
1. Steal as **primitive taste** for chat/voice chrome (loading/listening glow states) — implement with owned tokens + [own-motion-kit](sand-workflow:own-motion-kit) / Remotion / CSS-canvas.
2. Do **not** require `voice-glow` npm or libraries.dev as hive dependency.
3. HITL: glow is chrome, never auto-sends.

| Need | Label |
|---|---|
| Owned glow/chat chrome | **WORKAROUND** / **PROVE** when implemented |
| voice-glow npm as required dep | **BLOCKED** |

## X bookmarks 20260925-1019 (`x:2103145432390262954` Jakubantalik · `x:2103342411581882811` krispuckett · `x:2103232247323410432` ab_workss)

Packet: `/workspace/research/packets/x-bookmarks/20260925-1019-desktop/`.

**FACT (text preview):** (1) libraries-dev skill pitch — teach agent where/how to use library effects for expressive (less-generic) UI. (2) Dynamic Island demo for an agent. (3) Grok @bot chrome across notch, widgets, and states with step-by-step breakdown.

**UNVERIFIED:** Vendor pack quality; that libraries-dev or iOS Dynamic Island is required hive face.

### Map
1. Prefer owned [ai-product-ui-primitives](sand-workflow:ai-product-ui-primitives) + Shadcn + design-tokens — not vendor libraries-dev as face.
2. Dynamic Island / notch / widget agent chrome → implement as product UI primitives (tool chips, task rows, status island) on web/Shadcn **WORKAROUND** (not native iOS Island).
3. Cap: video bodies HELD Watch Later — text preview closed here. No deep-watch this fire.
4. METHOD_PROMOTION_WITHOUT_LOCAL_EVIDENCE — do not ADOPT libraries-dev or Island demos as doctrine.

| Need | Label |
|---|---|
| Shadcn + design-tokens agent chrome | **PROVE** |
| libraries-dev vendor skill as required face | **BLOCKED** (would work if operator imported via awesome-skill-import-gate + HITL) |
| Native iOS Dynamic Island | **BLOCKED** — web island primitive **WORKAROUND** |

## 2026-10-10 full study — `shaders` (shader-effects-inc, @npm_i_shaders open-sourced)
Box sandbox `/tmp/sigsbx/shaders-demo`: `npm i shaders@4.0.4` (MIT) → `shaders/registry` exports **200** components; React/Vue/Svelte/Solid/JS entries; CLI `npx shaders search "<look>" --json` (free, no sign-in), `install <preset>` = Pro, `SHADERS_API_KEY` for CI; repo ships an agent skill (`skills/shaders/SKILL.md`: compose 1–2 components by hand first, then preset search). WebGPU render not attempted headless → visual proof PARTIAL. Use for hero/background accents only; import via gate.
