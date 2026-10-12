---
name: UI compose
description: >-
  use this when composing page UI from tokens and shadcn — keep v0/Lovable to
  sections only
merged_from: [ai-product-ui-primitives]
---
# UI compose

Compose pages from tokens + brief — not from random inspiration mid-build.

## Steps
1. Load design-tokens and site-brief.
2. Prefer shadcn/ui primitives; customize sparingly.
3. Use Anthropic landing-page-design discipline: hierarchy, spacing, signature element consistency.
4. v0/Lovable only for isolated sections — paste into repo, then clean.
5. Build one page template (hero/nav/footer) and reuse.
6. Check mobile first; no unique snowflake sections without token updates.

## Anti-patterns
- New aesthetic every section
- Shipping generator output unedited

## X bookmarks 20260925-1019 (`x:2103145432390262954` Jakubantalik)

Packet: `/workspace/research/packets/x-bookmarks/20260925-1019-desktop/`.

**FACT:** Expressive-UI / libraries-dev skill pitch — agent taught where to apply library effects so UI is less generic.

**Map:** Keep compose path = design-tokens + shadcn + site-brief. Treat “library effects” as optional section craft after tokens, never mid-build aesthetic churn. Vendor libraries-dev = **RESEARCH-OK** / import-gate only — not hive face. Cap video HELD.

## Enrich 2026-10-10: feature-detect new CSS/HTML before use (`yt:unqPqGeJMck` Syntax)
Run `css_feature_probe.py` against the target Chrome. Box Chrome 154: grid-lanes and HTML-in-canvas = NO; corner-shape, column-wrap, container-name, view transitions, text-wrap pretty, base-select = YES. Ship progressive enhancement only.

## Enrich 2026-10-10: X-bookmark backlog study (signals-2mo-backlog-20261010)
- **Fixed colour-step rule.** Write it into AGENTS.md: backgrounds 100-300, borders 400-600, contrast 700-800, text 900-1000. That keeps every agent on one theme (x:2091547007680655589). PROVE: `color_step_lint.py` (this folder) flags out-of-band steps.
- **Artboards before code.** Pick the design on visual artboards, then generate code, so you don't pay for implementation retries (x:2090522758253871473).
- **Ship components with a customisation skill.** Bundle a small skill that says what is safe to change, so agent edits don't break the look (x:2090120567093617136).

---

## Merged from `ai-product-ui-primitives` (2026-10-11)

- Original description: Use when building Grok or AI Partner chrome from Beautiful UI primitives via Shadcn.
- Unique content carried: Beautiful UI primitives list for Grok/AI Partner chrome

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
1. Prefer owned [ui-compose](sand-workflow:ui-compose) + Shadcn + design-tokens — not vendor libraries-dev as face.
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
