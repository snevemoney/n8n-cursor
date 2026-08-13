# Cinematic AI Partner Landing

A cinematic marketing landing page for the AI Partner offering. Built with Next.js App Router, TypeScript, Tailwind CSS, and Framer Motion.

**Vercel preview only.** This app is not deployed to any production domain (evenslouis.ca).

## Signature motifs

**Light leak + film grain.**

- **Film grain** — animated SVG noise overlay (`grain` class on `<body>`) across the entire page. Stepped keyframes for organic texture. Static low-opacity under `prefers-reduced-motion: reduce`.
- **Light leak** — hero-only glass effect (`hero-glass` class) using layered radial gradients in the accent blue range. Creates a subtle cinematic lens artifact. Not applied to cards or other sections.

## Typography

| Role | Font stack |
|---|---|
| Display (headings) | Instrument Serif → Newsreader → Georgia → serif |
| Body | Geist → Inter → system-ui → sans-serif |

Instrument Serif and Inter are loaded from Google Fonts with `display=swap`.

## Design tokens (locked)

All visual tokens live as CSS custom properties in `app/globals.css`:

| Token | Value | Purpose |
|---|---|---|
| `--bg` | `#0A0A0C` | Page background |
| `--surface` | `#141418` | Card / elevated surface |
| `--text` | `#F2F2F4` | Headings / body text |
| `--muted` | `#8B8B96` | Secondary / caption text |
| `--accent` | `#5B8CFF` | Blue accent |
| `--line` | `#2A2A32` | Borders / dividers |
| `--ease-cinematic` | `cubic-bezier(0.22, 1, 0.36, 1)` | Motion easing |

## Hero media

The hero section ships with a CSS gradient + light-leak + grain fallback. To add Creative Studio media:

1. Place files in `public/hero/`:
   - `hero.webm` — looping background (~272 KB)
   - `hero.mp4` — fallback (~631 KB)
   - `poster.jpg` — still frame / OG image (1200×630)
   - `poster.webp` — optional optimized poster
2. **Motion allowed**: muted video, no loop. Scroll progress 0→1 scrubs `currentTime` and eases a slight scale. Cursor translates the plate 8px max. No WebGL.
3. **Reduced motion**: static `poster.webp` (jpg fallback); no scrub, no cursor, no autoplay.
4. Pathfinder (1px top bar) is orientation only — not a decoration.

### Optional proof broll

Place WebP stills in `public/proof/` (do not ship raw PNG masters):
- `broll-light-leak.webp` — decorative strip between heading and cards
- `broll-glass-planes.webp` — secondary decorative element

Images hide gracefully (via `onError`) when not present.

## CTA configuration

Placeholder defined in `app/config.ts`:

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

This app is designed for Vercel preview deployments only. It is **not** connected to any production domain (evenslouis.ca).

### Quick preview deploy

```bash
cd apps/cinematic-ai-partner
npx vercel
```

Or push the branch — if the monorepo has Vercel connected, configure this app's root directory to `apps/cinematic-ai-partner` in the Vercel dashboard for automatic preview deploys on PR branches.

## Accessibility

- All sections use semantic headings with `aria-labelledby`
- Framer Motion animations skipped entirely under `prefers-reduced-motion: reduce`
- Video autoplay disabled for reduced-motion users; static poster shown instead
- No video loop / no autoplay when reduced motion is active
- CTA links have visible focus rings
- Film grain overlay is `pointer-events: none` and decorative
- Broll images are `aria-hidden` decorative elements

## Lighthouse targets

- **LCP**: Fast with CSS gradient poster; hero media is small (~272 KB webm)
- **Accessibility**: Reduced-motion path, semantic HTML, focus management
- **Best Practices**: No console errors, HTTPS-ready, no mixed content
- **SEO**: Meta title/description, OG image path, robots noindex (preview)
