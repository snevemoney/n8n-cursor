---
name: UI compose
description: >-
  use this when composing page UI from tokens and shadcn — keep v0/Lovable to
  sections only
---
# UI compose

Compose pages from tokens + brief — not from random inspiration mid-build.

## Steps
1. Load design-tokens and site-brief.
2. Prefer shadcn/ui primitives; customize sparingly.
3. Use Anthropic frontend-design discipline: hierarchy, spacing, signature element consistency.
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
