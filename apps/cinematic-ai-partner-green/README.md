# Cinematic AI Partner Landing — green variant

Preview-only copy of the locked landing (PR #37 / https://cinematic-ai-partner.vercel.app). Same layout, motion, and copy. Accent family only: `--accent #3EBA7A`.

**Do not merge to main. Do not deploy to evenslouis.ca.** Desks open the Vercel preview URL, not `localhost:3006`.

## Design tokens

| Token | Value |
|---|---|
| `--bg` | `#0A0A0C` |
| `--surface` | `#141418` |
| `--text` | `#F2F2F4` |
| `--muted` | `#8B8B96` |
| `--accent` | `#3EBA7A` |
| `--line` | `#2A2A32` |

Hover / muted accent come from the same `--accent` token (`hover:brightness-110`, `bg-accent/10`). Light-leak uses `rgba(var(--accent-rgb), …)`.

## Local

```bash
cd apps/cinematic-ai-partner-green
pnpm install
pnpm dev        # → http://localhost:3006
```

## Vercel preview

```bash
cd apps/cinematic-ai-partner-green
npx vercel --yes
```
