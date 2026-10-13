---
name: Design tokens
description: >-
  Use when defining brand/UI foundations — 4–6 colors, type roles, one signature
  element before composing pages. Optional 100–1000 scale when a team needs
  named jobs for each step.
merged_from: [uupm-brand-literacy, uupm-design-system-literacy]
---
---
name: Design tokens
description: >-
  Use when defining brand/UI foundations — 4–6 colors, type roles, one
  signature element before composing pages. Optional 100–1000 scale when a
  team needs named jobs for each step.
---

# Design tokens

Lock visual foundations before UI compose.

## Steps
1. Pull brand inputs (logo, existing site, vibe words) or invent a tight temporary system.
2. Choose 4–6 colors max (bg, fg, muted, accent, danger/success as needed).
3. Define type roles: display, h1–h3, body, small, mono — sizes/weights only.
4. Pick one signature element (shape, border, motion, illustration style) — not five.
5. Write tokens as CSS variables or Tailwind theme keys a coder can paste.
6. Hand off to ui-compose / Forge; do not invent new tokens mid-build without updating this set.

## Optional named scale (X `x:2091547007680655589` @writenicecode)
When a team keeps guessing which gray is "the border," name the *job*, not a bigger palette. Still 4–6 hues.

- 100 / 200 / 300 — backgrounds
- 400 / 500 / 600 — borders
- 700 / 800 — contrast surfaces
- 900 / 1000 — text

Write this into the site `agents.md` / tokens file so Forge stops inventing a seventh gray. **INFERENCE** from the tweet, not a hive law. Skip if the brand already has a locked system.

## Anti-patterns
- Unique treatment per section
- Unbounded color palette from a generator dump
- Ingesting a 2,000-file DESIGN.md pack into the window ([context-before-tokens](sand-workflow:context-before-tokens))

## Tools
| Need | Path | Label |
|---|---|---|
| Tokens file on disk | site repo / packet | **PROVE** |
| Mobbin taste check | `user-Mobbin` | **PROVE** |

## Deep repass 2026-09-03 — Refero DESIGN.md
Optional source: one page from https://styles.refero.design → extract 4–6 colors + type roles into CSS/Tailwind tokens. Never paste a 2000-file pack (context-before-tokens).

## Repass 20260909 wave AC — Slop tells
- Reject default purple/blue gradients and other AI-default tokens; force intentional palette (RVeCbPg0liw).

## Enrich 2026-10-10: design.md as an agent steering doc (`yt:KWXCkg6qYGA` Syntax on Google's spec)
Keep design tokens in `design.md` front matter (colors / spacing / type) plus prose rules. Lint before agents generate UI: required groups, hex validity, spacing scale, contrast ≥ 4.5. Emit `:root` vars. PROVE: `design_md.py`.

---

## Merged from `uupm-brand-literacy` (2026-10-11)

- Original description: Use for brand craft literacy — voice, visual identity, messaging, consistency — remaps ui-ux-pro-max brand skill. Creative Studio owner. Pair design-tokens.
- Unique content carried: three-layer primitive→semantic→component; brand voice/identity checklist

# UUPM brand literacy

Source: nextlevelbuilder/ui-ux-pro-max-skill `.claude/skills/brand` (MIT).
Packet: `/workspace/research/packets/ui-ux-pro-max-skill/.claude/skills/brand/`.
Owner: **Creative Studio** (Creative craft). Literacy only — no sync/extract scripts.

## When
Brand voice, visual identity, messaging frameworks, consistency review, guideline scaffolding for a product surface.

## Do
1. Lock voice + visual identity before composing pages.
2. Messaging: one offer, one audience, proof points — hand off structure to [landing-page-design](sand-workflow:landing-page-design).
3. Sync language to tokens conceptually; write concrete values via [design-tokens](sand-workflow:design-tokens).
4. Cite packet `references/` (voice, visual-identity, messaging, consistency) on demand — do not 1:1 dump.

## Don't
Run brand scripts. Install cli/. Treat this as a second face or marketplace plugin. Publish/live from literacy alone.


---

## Merged from `uupm-design-system-literacy` (2026-10-11)

- Original description: Use when defining or auditing token architecture — three-layer primitive→semantic→component literacy from ui-ux-pro-max design-system; Creative craft. Pair design-tokens.
- Unique content carried: three-layer primitive→semantic→component; brand voice/identity checklist

# UUPM design-system literacy

Source: nextlevelbuilder/ui-ux-pro-max-skill `.claude/skills/design-system` (MIT).
Packet: `/workspace/research/packets/ui-ux-pro-max-skill/.claude/skills/design-system/`.
Owner: **Creative** craft. Literacy only — do not run generate/validate scripts.

## When
Token architecture, CSS variable systems, spacing/typography scales, design-to-code handoff language.

## Three-layer model
```
Primitive (raw values)
       ↓
Semantic (purpose aliases)
       ↓
Component (component-specific)
```
Example: `--color-blue-600` → `--color-primary` → `--button-bg`.

## Do
1. Keep primitives raw; name semantics by purpose; bind components to semantics only.
2. Prefer CSS variables / Tailwind theme keys a coder can paste.
3. Pair [design-tokens](sand-workflow:design-tokens) for the tight 4–6 color + type-role lock.
4. Cite packet `references/token-architecture.md` when deeper detail is needed — read, do not dump.

## Don't
Run packet scripts. Install cli/. Invent unbounded palettes. Paste full token JSON packs into context ([context-before-tokens](sand-workflow:context-before-tokens)).

## Repass 20260909 wave AC — Anti-slop literacy
- Treat "AI default" tells as defects; literacy includes recognizing 60+ slop patterns (RVeCbPg0liw).

## Enrich 2026-10-12: box-proven trials (yt12, /workspace/trials/yt12-20261012)
- **One-style icon pack as editable SVG** (yt:_SVU3oC4JX8 @8:21). Pull a set from the Iconify public API (free, no key; e.g. lucide), parse it, and recolor currentColor to a token. PROVE: `/workspace/trials/yt12-20261012/m39-icon-pack-svg`.
