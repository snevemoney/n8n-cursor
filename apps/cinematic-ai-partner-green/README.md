# Cinematic AI Partner Landing — GREEN variant

Internal factory proof. Sibling of the locked blue landing (`apps/cinematic-ai-partner` on PR #37). Same layout, motion, and copy spine. Accent family only.

**Preview only.** Do not merge to main. Do not deploy to evenslouis.ca. Desks should open the **public preview URL**, not `localhost:3006`.

Known-good blue: https://cinematic-ai-partner.vercel.app

## What changed vs locked blue

| Token | Blue (PR #37) | Green (this app) |
|---|---|---|
| `--accent` | `#5B8CFF` | `#3EBA7A` |
| `--accent-rgb` | — | `62, 186, 122` |
| `--accent-companion-rgb` | hardcoded purple leak | `120, 186, 150` |
| `--bg` / `--surface` / `--text` / `--muted` / `--line` | unchanged | unchanged |

Light-leak and hero wash read `rgba(var(--accent-rgb), …)` so they follow the accent. Type, grain, hero-glass, and copy are the locked spine.

## Variant files

This entire sibling app is the variant:

- `apps/cinematic-ai-partner-green/**`

Color-only files:

- `app/globals.css` — tokens + light-leak / plate wash
- `package.json` — package name + local port `3006`
- `app/config.ts` — preview `url` only (copy unchanged)

## How to add the next color

Repo has no shared theme system. Follow this sibling-app recipe (same as Cursor's locked landing):

1. Copy `apps/cinematic-ai-partner-green` → `apps/cinematic-ai-partner-<color>`.
2. In `app/globals.css`, set `--accent`, `--accent-rgb`, and `--accent-companion-rgb`. Leave `--bg` / `--surface` / `--text` / `--line` unless contrast fails.
3. Rename `package.json` `name`, pick an unused local port, update `app/config.ts` `url`.
4. Do **not** rewrite copy, motion, or section order.
5. Open a preview/PR only. Ship a public preview URL — Grok desks cannot hit Mac localhost.

## Local (operators only)

```bash
cd apps/cinematic-ai-partner-green
pnpm install
pnpm dev        # → http://localhost:3006
pnpm build
pnpm typecheck
```

Desks: use the Vercel preview URL from the PR, not `:3006`.

## Preview deploy

```bash
cd apps/cinematic-ai-partner-green
npx vercel
```

Or set the Vercel project root to `apps/cinematic-ai-partner-green`. Not a production domain.
