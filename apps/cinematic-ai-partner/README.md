# Cinematic AI Partner Landing

A cinematic marketing landing page for the AI Partner offering. Built with Next.js App Router, TypeScript, Tailwind CSS, and Framer Motion.

**Vercel preview only.** This app is not deployed to any production domain.

## Signature motif

**Film grain** — a subtle animated SVG noise overlay (`grain` class on `<body>`) that gives the entire page a cinematic texture. The grain animation uses stepped keyframes for an organic feel. Under `prefers-reduced-motion: reduce`, the grain becomes a static low-opacity texture with no animation.

## Design tokens

All visual tokens live as CSS custom properties in `app/globals.css`:

| Token | Value | Purpose |
|---|---|---|
| `--surface-primary` | `#0a0a0c` | Page background |
| `--surface-secondary` | `#121216` | Card / elevated surface |
| `--surface-elevated` | `#1a1a20` | Higher-level surface |
| `--accent` | `#c8956c` | Warm amber accent |
| `--accent-muted` | `#8a6548` | Subdued accent |
| `--text-primary` | `#f0ece6` | Headings / body |
| `--text-secondary` | `#a09a90` | Secondary copy |
| `--text-muted` | `#605c56` | Tertiary / captions |

## Hero media

The hero section ships with a high-quality CSS gradient + grain fallback. To upgrade to full cinematic media:

1. Place your files in `public/hero/`:
   - `hero.webm` — looping background (recommended: 10–20s, ≤ 8 MB)
   - `hero.mp4` — fallback for browsers without WebM
   - `poster.jpg` — still frame shown before video loads (1200×630 ideal for OG too)
2. The component auto-detects `hero.webm` via a HEAD request and fades in the video.
3. Video is muted, loops, and never autoplays when `prefers-reduced-motion: reduce` is active.

## CTA configuration

The call-to-action link is a placeholder defined in `app/config.ts`:

```ts
ctaHref: 'mailto:contact@example.com',
ctaLabel: 'Book a Strategy Call',
```

Replace with a Cal.com booking link or final contact URL when ready.

## Running locally

```bash
cd apps/cinematic-ai-partner
pnpm install
pnpm dev        # → http://localhost:3005
pnpm build      # production build
pnpm typecheck  # TypeScript validation
```

## Vercel preview

This app is designed for Vercel preview deployments only. It is **not** connected to any production domain (e.g. evenslouis.ca).

### Quick preview deploy

```bash
cd apps/cinematic-ai-partner
npx vercel
```

Or push the branch — if the monorepo has Vercel connected, configure this app's root directory to `apps/cinematic-ai-partner` in the Vercel dashboard for automatic preview deploys on PR branches.

## Accessibility

- All sections use semantic headings with `aria-labelledby`
- Framer Motion animations are skipped entirely under `prefers-reduced-motion: reduce`
- Video autoplay is disabled for reduced-motion users
- CTA links have visible focus rings
- Film grain overlay is `pointer-events: none` and `aria-hidden` by nature

## Lighthouse targets

- **LCP**: Fast with CSS gradient poster; will depend on media weight once hero video is added
- **Accessibility**: Reduced-motion path, semantic HTML, focus management
- **Best Practices**: No console errors, HTTPS-ready, no mixed content
- **SEO**: Meta title/description, OG image path, robots noindex (preview)
