---
name: Remotion official skills import
description: >-
  Use when a Remotion repo still talks to hosted Remotion MCP, or when Studio
  needs official Agent Skills (npx remotion skills add) after the 2026-08-31 MCP sunset.
---
# Remotion official skills import

**Owner:** Creative Studio + Forge
**Source:** https://www.remotion.dev/docs/ai/skills · https://www.remotion.dev/docs/ai/mcp
**Close:** 2026-08-26 Researcher hunt

## When
A Remotion project is about to use AI help, or someone reaches for Remotion hosted MCP.

## Do
1. In the Remotion repo (not the hive root), run `npx remotion skills add` (or `npx skills add remotion-dev/skills`).
2. Use `/remotion-docs` from the official skill. Do not add hosted Remotion MCP as a hive connector.
3. Studio WebMCP (4.0.518) is Codex-only today. Hive path = official skills + remotion-brief-to-render.
4. Optional: Studio Browse Elements for own-motion-lib / remocn.

## Do not
- Install Claude Code Remotion plugins
- Depend on hosted MCP after 2026-08-31
- Treat WebMCP as hive-ready
- Ship GSAP without checking the GSAP license

## Tools
| Need | Path |
|---|---|
| Official skills | `npx remotion skills add` — **PROVE** when run in a Remotion repo |
| Hosted Remotion MCP | **BLOCKED** after sunset |
| Studio WebMCP | **WORKAROUND** — official skills (Codex-only today) |

## Prompts
```
In Remotion repo [path]:
1) npx remotion skills add
2) Confirm /remotion-docs
3) Do not add hosted Remotion MCP
4) Continue with remotion-brief-to-render
```

## PROVE 2026-08-26
Ran `npx remotion skills add` in /workspace/la-to-ny-remotion. Landed 12: remotion-best-practices, remotion-captions, remotion-create, remotion-docs, remotion-interactivity, remotion-maps, remotion-markup, remotion-multimedia, remotion-render, remotion-saas, remotion-studio, remotion-upgrade.

## CapEx PROVE 2026-09-22
Ran `npx remotion skills add` in launch-samples/project → 12 skills @ 4.0.527 under `.agents/skills`.
Skills 2.0 notes + recoverable CapEx gaps: motion-library `docs/REMOTION_METHODS_HARVEST_20260922.md`.
Prefer `npx remotion skills update` after Remotion upgrades.


## X bookmarks desktop 20260923 — official Agent Skills promo
Packet: `/workspace/research/packets/x-bookmarks/20260923-desktop/` · ids `2013626968386765291` · `2013628043105890779` (@Remotion).

**FACT (preview):** Remotion ships Agent Skills via `npx skills add remotion-dev/skills` (alias of `npx remotion skills add`). Demo animation “just by prompting.” Full prompt history published as a gist for recreate.

**Do:** Same as above — install skills **inside the Remotion repo**, not hive root. Keep prompt history beside the composition when recreating.

| Need | Label |
|---|---|
| Official skills add (already CapEx PROVE) | **PROVE** |
| Claude Code as face for Remotion | **BLOCKED** → Cursor+Grok **WORKAROUND** |
| Video body of Remotion demos | Cap≤1 NEED-WATCH-LATER — preview close only this fire |
