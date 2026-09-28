# evenslouis-public

Intended **`/`** for `https://evenslouis.ca`: a hive OS walkthrough. Building mode. Preview only.

Live hire `/` is a VPS Next.js app **not in this git**. `apps/portfolio` is the stale Scorpion page. See `SOURCE.md`.

```
LANE: hive-os
FILE: public/index.html   ← this file is /
PREVIEW: pnpm --filter evenslouis-public start
         http://127.0.0.1:4011/
TEST:    pnpm --filter evenslouis-public test
```

Hard step (Evens, later): publish / Caddy / VPS. Not this PR.

## Critic list (2026-09-02)

1. Walkthrough is **on `/`**. H1 is exactly `Hive OS — walkthrough`. Desks + named routine on that page. No password.
2. Hire residual parked: no “Available for new projects”, no “Ready to build something?”, no contact form, no Discovery/Build/Ship hero.
3. OS proof = desks + Publishing Engine “Publishing pipeline check” (Mondays 9:00 AM America/Toronto; packages, does not auto-publish). Ironlane / Ashford / Quay named as Proof/concept static craft, **not** href’d, **not** the OS substitute.
4. No “Hunt / scope” grouping. One line: building mode, no outbound this cycle.
5. Preview keeps `noindex`. Drop only if/when the public URL actually ships.
6. No traffic / conversion / revenue / lift. KPI stays BLANK.

## HITL later (not now)

Point apex `/` at this folder. Remove `noindex` + `robots.txt` Disallow only on that ship. Do not flip Caddy from this PR.
