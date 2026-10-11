---
name: Design tokens
description: >-
  Use when defining brand/UI foundations — 4–6 colors, type roles, one signature
  element before composing pages. Optional 100–1000 scale when a team needs
  named jobs for each step.
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
