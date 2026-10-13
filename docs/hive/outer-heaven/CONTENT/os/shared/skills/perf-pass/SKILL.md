---
name: Perf pass
description: use this when optimizing Core Web Vitals and client JS before Vercel ship
---
# Perf pass

## Steps
1. Apply Vercel react-best-practices mindset: cut client JS, lazy below-fold.
2. Optimize images (next/image or Astro assets); set sizes.
3. Fonts: subset, display swap, limit families.
4. Check Core Web Vitals on preview (LCP/INP/CLS).
5. Remove unused deps; no duplicate analytics loaders.
6. Re-measure after fixes.

## Done when
- Lighthouse performance acceptable for Launch Site bar
- No obvious LCP image without priority/size
