---
name: A11y pass
description: >-
  use this when accessibility-checking a site before ship — semantic HTML,
  focus, contrast, reduced-motion
---
# A11y pass

## Steps
1. Semantic landmarks (header/nav/main/footer); one h1 per page.
2. Focus visible; keyboard path through nav/forms/modals.
3. Alt text for meaningful images; decorative images empty alt.
4. Color contrast against design-tokens.
5. Honor prefers-reduced-motion.
6. Run axe or Lighthouse accessibility; fix critical/serious before ship.

## Done when
- No critical axe issues on primary pages
- Keyboard-only path verified
