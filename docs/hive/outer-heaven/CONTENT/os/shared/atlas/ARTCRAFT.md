# ArtCraft — the default content toolchain
**Standing rule:** ArtCraft MCP is the default for content. Use Remotion/HyperFrames only when better *and* free or cheaper. **No Higgsfield spend without Evens's per-job OK and a quote** (`media-gen-cost-gate`).

## What's installed (verified live, Mac, 2026-10-12 21:45 ET)
`/Applications/`: ArtCraft Launcher + 12 apps — **FilmCraft** (video edit), **EffectCraft** (motion/animation, comps), **PhotoCraft** (image edit), **LightCraft** (photo develop), **VectorCraft** (vector/diagrams), **DesignCraft** (layouts), **DeckCraft** (slides/.pptx), **PdfCraft** (PDF), **WordCraft** (docs/.docx), **GridCraft** (sheets/.xlsx), **SoundCraft** (audio), **CADCraft** (technical/spatial drawings).
MCP servers: each app is a stdio MCP `~/.local/bin/<app>-cli mcp` (e.g. `effectcraft-cli mcp`), wired in **all three** Mac clients: `~/.claude.json`, `~/.codex/config.toml [mcp_servers.<app>]`, `~/.cursor/mcp.json`. Grok box and Jarvis have no ArtCraft MCP → hand off.

## How to call it
1. `mcp__<app>__command_list` (filter, e.g. `{"filter":"import"}`) to see real commands; don't assume.
2. Build via commands (e.g. VectorCraft `file.new`, `path.rectangle`, `type.create`, `object.add`).
3. `render_preview` (VectorCraft) / `page_render` (PdfCraft) to inspect.
4. Save native + export: `document.save {path, format:"vectorcraft"}`, `document.export {path, format:"png"|"svg"|"pdf"}`.
5. `open -a <App> "<file>"` and confirm desktop visibility (Codex computer-use or a screenshot). **"Always add the file after doing something on any of the 12 apps"** (Evens, Oct 11).
Save to `~/Movies/<Project>/` (video/motion) or `~/Documents/ArtCraft Studio/<Project>/` / `~/ArtCraft Studio/00 Private/Projects/<JOB-ID>/`.

## ArtCraft Studio library (Codex, job ARTCRAFT-STUDIO-IMPLEMENT-20261012, Oct 12 ~14:50–15:49 ET)
- `~/ArtCraft Studio/` = **00 Private** (Evens-only, project work), **01 Internal** (16 workflow areas, guides for all 12 apps, templates, workbook, delivery-check helpers, Brand Guidelines v1.1), **02 Public** (sanitised drafts; never auto-published). Read `AGENTS.md` + `TIERS.md` there first.
- Installed by `install_library.py --apply` (96 reviewed files) from `~/Documents/Codex/2026-10-09/continuing-analyse-id-e-jarvis-chatgpt/work/studio-rollout/`; it also added the `artcraft-studio-20261012` block to CLAUDE.md/AGENTS.md and `~/.cursor/rules/brain-artcraft-studio.mdc`, and the proactive-assistance block (13:09).
- Receipts (with hashes) in that thread's `outputs/`: `studio-install-report.json`, `studio-verification.json`, `studio-real-proof-files.json`, `studio-proof-inputs.json`, `studio-approved-transcript-receipt.json`, `process-review-handoff.json`, `system-map-pdf-conversion.json`.
- 1,296 pre-existing Studio files inventoried, left in place, UNCLASSIFIED_PRIVATE.

## Proof files produced Oct 12 (Codex)
- VectorCraft: `~/Documents/ArtCraft Studio/Process Gap Review 2026-10-12/Workflow Gap Map.vectorcraft` (+PNG/SVG), Operating Review; System Map 2026-10-12 (interactive `index.html`, `System Overview.vectorcraft`, `Matrix and Jarvis Operating Brief - v2.pdf` opened in PdfCraft).
- Tier demos: Private `Studio Readiness Proof/Studio Readiness.pdf` (+XLSX, GridCraft); Internal `Studio Delivery SOP.pdf` (+DOCX, WordCraft); Public draft `From Question to Useful Visual.pdf` (+VectorCraft/PNG/SVG).
- `00 Private/Projects/ARTCRAFT-STUDIO-IMPLEMENT-20261012/`: CEO Operating Review.pdf (8 pp, DesignCraft), CEO Decisions.pptx (DeckCraft), Gap and Action Register.xlsx (GridCraft MCP, read back).
- Earlier (Claude Code, Oct 11): EffectCraft 45 s animation `Main_45s` + synthesized score; launch-video rebuild specs in `~/Movies/Launch Rebuilds/*/spec.json`.

## Known limits (honest)
- Codex run hit "MCP tool call requires approval, but approval policy is never" on WordCraft, DeckCraft, DesignCraft, VectorCraft, SoundCraft, CADCraft (Oct 12 15:28) → fallback docs labelled as fallback. Fix the client approval policy before claiming native execution.
- GridCraft and WordCraft opened to blank start screens (Book1) — file/export proven, desktop open not.
- Mac disk 94–97% → heavy video renders blocked; frames small, clean scratch.
- One engine owner at a time (EffectCraft: "another process owns that engine").
- Clearfield explainer project references a missing source movie: an export ≠ a rebuildable project.
- Codex's completeness checker rejects 3-demo coverage, blank scratch docs and fallback-as-native; it never issues PASS.
