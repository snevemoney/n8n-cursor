# Cinematic Website Skills Pack

Extension of the website-building skill pack. These seven skills cover the cinematic landing page workflow from brief to ship.

## Skills (cinematic-brief → cinematic-ship)

### 1. cinematic-brief
Write a cinematic landing page brief: audience, one-line promise, constraint framing, proof outcomes, and CTA strategy. Output is a structured markdown brief consumable by downstream skills.

### 2. cinematic-tokens
Define a dark-premium design token system (CSS custom properties): surface palette, restrained accent, text hierarchy, spacing scale, and one signature motif (film grain or soft light-leak). Output is a `globals.css` token block and Tailwind config extension.

### 3. cinematic-hero
Build a full-bleed hero section with layered poster fallback (CSS gradient + grain), optional muted looping video (lazy, poster-first), animated headline reveal (Framer Motion), and `prefers-reduced-motion` path. Output is a self-contained React component.

### 4. cinematic-sections
Compose the landing page body: constraint framing, outcome proof cards, sober process steps, and CTA. Each section uses the Reveal scroll-animation wrapper and semantic headings. Output is a set of section components.

### 5. cinematic-motion
Configure tasteful scroll/section reveal animations with Framer Motion: staggered entrance, intersection-observer trigger, eased transitions. Provide a full reduced-motion fallback that renders content immediately without animation.

### 6. cinematic-perf
Performance and accessibility pass: lazy video with poster, lean dependency tree, SEO metadata (title, description, OG), focus-visible rings, semantic landmarks, and Lighthouse audit targets (LCP, a11y, best practices).

### 7. cinematic-ship
Ship to Vercel preview: configure Next.js App Router build, verify `pnpm build` succeeds, document preview deploy path (`npx vercel` or monorepo root directory config), write README with token reference, hero media drop-in instructions, and CTA config location. Open PR — do not merge or deploy to production domain.
