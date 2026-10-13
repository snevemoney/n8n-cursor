---
name: UUPM craft checklist
description: >-
  Use when reviewing UI/UX craft before ship — priority 1→10 checklist remapped
  from ui-ux-pro-max; Creative craft. Pair a11y-pass / landing-page-design / design-tokens.
---
# UUPM craft checklist

Source: nextlevelbuilder/ui-ux-pro-max-skill `.claude/skills/ui-ux-pro-max` priority table (MIT).
Packet: `/workspace/research/packets/ui-ux-pro-max-skill/.claude/skills/ui-ux-pro-max/`.
Owner: **Creative** craft. Literacy only — do not run packet CLI/scripts.

## When
Pre-delivery UI review, visual QA, or craft critique on web/mobile/desktop surfaces.

## Priority checks (1→10)
1. **Accessibility** — contrast ≥4.5:1, alt text, keyboard, aria-labels; no removed focus rings.
2. **Touch & interaction** — ≥44×44 targets, 8px+ spacing, loading feedback; no hover-only.
3. **Performance** — modern image formats, lazy load, reserve space (CLS); no layout thrash.
4. **Style selection** — match product type; consistent icons (SVG not emoji); no mixed metaphors.
5. **Layout & responsive** — mobile-first, viewport meta, no horizontal scroll / fixed-px traps.
6. **Typography & color** — base ≥16px, line-height ~1.5, semantic tokens; no raw hex in components.
7. **Animation** — meaning-bearing motion; honor reduced-motion; avoid animating width/height.
8. **Forms & feedback** — visible labels, errors near fields, progressive disclosure.
9. **Navigation** — predictable back, lean nav, deep links where needed.
10. **Charts & data** — legends/tooltips; never color-alone meaning.

## Pair
- [a11y-pass](sand-workflow:a11y-pass) for ship a11y
- [landing-page-design](sand-workflow:landing-page-design) for marketing structure (wins conflicts)
- [design-tokens](sand-workflow:design-tokens) for foundations

## Don't
Install cli/, package-manager, or browser automation from this packet. Copy scripts into workflows. Override landing-page-design Part B without explicit user ask. Ship live from this skill.
