# Brand call — cinematic-ai-partner (v1)

**Owner:** Creative Studio · 2026-08-12  
**For:** Forge `design-tokens` + hero media  
**Labels:** OPINION (Creative Studio lock for demo)

## Direction

**Dark premium** AI Partner landing — filmic restraint, not neon cyberpunk.

**Signature motif (pick one, lock):** **Light leak + film grain** on glass-dark surfaces.  
Primary signature = soft anamorphic-style light leak (cool blue). Grain = texture layer. Glass = subtle specular planes in hero only — do not put glassmorphism on every card.

## Palette (4–6)

| Token | Hex | Role |
|-------|-----|------|
| `--bg` | `#0A0A0C` | Page void |
| `--surface` | `#141418` | Cards / sections |
| `--text` | `#F2F2F4` | Primary type |
| `--muted` | `#8B8B96` | Secondary type |
| `--accent` | `#5B8CFF` | Restrained cool accent (CTA hover, light leak echo) |
| `--line` | `#2A2A32` | Hairlines / borders |

Avoid: purple gradients, lime accents, warm terracotta cream stacks, matrix-green.

## Type roles

| Role | Suggestion | Notes |
|------|------------|-------|
| Display | `Instrument Serif` or `Newsreader` (or system serif fallback) | Hook line only |
| Body | `Geist` / `Inter` | Quiet, high legibility |
| Utility | Same sans, medium/semibold | Labels, nav, CTA |

## Layout concept

- Full-bleed hero with muted looping video + dark poster fallback
- Overlay type left or center-left, high contrast
- Scroll story: Hook → Constraint → Proof (3 cards) → How → CTA
- Generous negative space; one accent moment per viewport

## Motion plan

- Hero: autoplay muted loop, `playsinline`, no sound controls
- Scroll: Framer Motion opacity/translateY on sections; no parallax chaos
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)` (~ease-out-expo feel)
- Always honor `prefers-reduced-motion`: static poster, no loop

## Out of bounds

- Fake $50k case studies
- Unmuted autoplay
- WebGL hero for v1
- Feature laundry lists instead of Acquire / Grow / Cut outcomes

## Assets path

`~/.grokbot/research-packets/cinematic-site/assets/`
