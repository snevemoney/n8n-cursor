---
name: UUPM design-system literacy
description: >-
  Use when defining or auditing token architecture — three-layer primitive→semantic→component
  literacy from ui-ux-pro-max design-system; Creative craft. Pair design-tokens.
---
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
