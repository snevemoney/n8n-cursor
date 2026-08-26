# Design to code workflows

Companion to website-skills-dossier.md. Creative Studio to Forge handoff.
Labels: FACT / INFERENCE / OPINION / UNVERIFIED

## 1) Token-first (no Figma)

FACT: Anthropic frontend-design requires two-pass plan before code: 4-6 named hex colors; display/body/utility type; layout + ASCII; one signature; then self-critique vs AI-slop; then implement.
Source: anthropics/claude-code plugins/frontend-design/skills/frontend-design/SKILL.md

OPINION Creative Studio artifact (design-tokens.md): subject/audience/job; palette; type roles; layout concept; signature; motion plan; out-of-bounds cliches.
Forge reads that file before ui-compose.

## 2) Figma MCP path

FACT: Remote Figma MCP at https://mcp.figma.com/mcp
- Claude: claude plugin install figma@claude-plugins-official
- Manual: claude mcp add --transport http figma https://mcp.figma.com/mcp
- Cursor: Figma plugin / MCP config
- Docs: https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/
- Help: https://help.figma.com/hc/en-us/articles/39888612464151
- Guide: https://github.com/figma/mcp-server-guide/

FACT: Read design context; code from frames; Code Connect; newer tools write canvas / capture live UI.

Forge rules (OPINION): paste frame URL; prefer Code Connect; use MCP assets; screenshot via agent-browser and diff.

## 3) Screenshot to code
- v0: fast React/Tailwind/shadcn section; paste then normalize to tokens
- Claude/Cursor vision: recreate from screenshot with token constraints
- agent-browser (coleam00): capture live site for critique/regression
- OPINION: great for one section; whole-site clones without tokens cause redesign loops

## 4) Design systems: shadcn + Radix + Tailwind
FACT CLI v4 March 2026: https://ui.shadcn.com/docs/changelog/2026-03-cli-v4
- install shadcn ui skill via skills CLI
- Presets: portable design-system codes
- Templates: Next, Vite, Astro, TanStack Start, React Router, Laravel
- Primitives flag: base radix or base base
- Helpers: shadcn info, docs, dry-run, diff
- INFERENCE: Radix/Base = a11y primitives; Tailwind maps Studio palette; shadcn copies source for agents
- OPINION: Hive = Tailwind + shadcn (Radix) + one preset per brand; wrap/compose; do not casually fork components/ui

## 5) Recommended handoff sequence
1. Consultant/Creative: site-brief
2. Creative: design-tokens (+ optional Figma)
3. Forge: stack-pick then next-scaffold or astro-scaffold
4. Forge: ui-compose (frontend-design + shadcn + Figma MCP if linked)
5. Forge: cms-wire + booking-embed
6. Forge: seo-pass then a11y-pass then perf-pass
7. Forge: ship-vercel then client-handoff
Lock tokens after step 2. Visual changes after lock = scoped change request.

## 6) Anti-slop checklist (from frontend-design FACT)
Avoid unless brief explicitly requests:
- Warm cream + terracotta + generic serif
- Near-black + acid green / vermilion only
- Broadsheet hairline / zero-radius newspaper pastiche
- Decorative 01/02/03 when content is not a sequence
- Scattered pointless motion
Spend boldness on one signature; keep the rest quiet.
