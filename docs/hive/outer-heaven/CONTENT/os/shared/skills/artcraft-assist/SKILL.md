---
name: artcraft-assist
description: >-
  Use while chatting with Evens on any authorised job when a small visual or document would help him
  understand, decide or move forward (deck, one-pager, sheet, diagram, short video/audio). Builds it with the
  ArtCraft MCP apps, saves into ~/ArtCraft Studio, adds it to recents and opens it on his Mac. Also use when
  asked "how do I use ArtCraft", "where do ArtCraft files go", or to prove an ArtCraft app works.
---
# ArtCraft assist-while-chatting (Evens decision 2026-10-12; open/recents fix 2026-10-13)

Source of truth: `~/.grok-shared/atlas/ARTCRAFT.md`, `~/ArtCraft Studio/AGENTS.md` + `TIERS.md`,
`~/.grok-shared/AGENT_RULES.md` §8–9. Origin: Codex job ARTCRAFT-STUDIO-IMPLEMENT-20261012 + Evens:
"implement it to all the platforms and Jarvis now so they can start doing it the next time I need something."

## The pattern (do this inside the conversation, not as a new mission)
1. Recover context first (CURRENT_STATE → ACTIVE_TASKS → PLATFORM_DIGEST, the job folder). Needs an existing job ID.
2. While answering, spot the one artifact that would help most and make it instead of offering it
   (smallest useful thing: 1-slide decision deck, one-page brief, tracker sheet, process map).
3. Present: what I found → evidence → what it means for your goal → recommendation → the artifact → the exact decision needed.
4. Plain business language for Evens as CEO. No jargon, no acronyms without the words.

## Where files go (~/ArtCraft Studio)
| Tier | Use |
|---|---|
| `00 Private/Projects/<JOB-ID>/` | default for new job work (Evens only) |
| `01 Internal/Work in Progress/<type>/<item>/` | reusable content being built; methods in `01 Internal/Workflows`, `Playbooks`, `App Guides`, `Templates`, `Brand Guidelines` (v1.1) |
| `02 Public/<type>/<item>/` | sanitised finished drafts only; never published by an agent |
Fallback when no Studio job applies: `~/Movies/<Project>/` (video/motion) or `~/Documents`. Agent tests: `00 Private/_agent-tests-YYYYMMDD/`.

## Build → save → recents → open (always all four)
1. MCP: each app is a stdio server `~/.local/bin/<app>-cli mcp` (deckcraft, wordcraft, gridcraft, pdfcraft, filmcraft,
   effectcraft, soundcraft, photocraft, vectorcraft, lightcraft, designcraft, cadcraft). Registered in Claude Code
   (`~/.claude.json`), Codex (`~/.codex/config.toml`), Cursor (`~/.cursor/mcp.json`). Call `command_list` first; don't guess.
   Jarvis has its own craft hand (`~/jarvis-int/apps/agent-stack/hands/craft.py`, one `<app>-cli mcp` per app; default save dir
   ~/Documents/Craft, so pass an ArtCraft Studio path). Grok box: run `<app>-cli run ... --save` on the Mac via machineId.
   Codex in the sandbox: use `artcraft-open "<file>"` instead of `open` (rule ~/.codex/rules/artcraft.rules lets it and the
   recents script run outside the sandbox; the wrapper only opens files under ~/ArtCraft Studio, ~/Movies or ~/Documents).
2. Save native + an export (pptx/docx/xlsx/pdf/png) in the right tier folder.
3. `python3 ~/.local/bin/artcraft-recents-sync.py --add "<file>"` (skips apps that are running; a LaunchAgent also syncs every 15 min).
4. `open "<file>"` (Finder-style). DeckCraft/FilmCraft/DesignCraft/SoundCraft can't take macOS open events; the droplets in
   `~/Applications/ArtCraft Openers/` own those file types and fix the double-click bug. docx→WordCraft, xlsx/csv→GridCraft, pdf→PdfCraft.
5. Prove it: window title or screenshot. Installation is not proof; never self-PASS.

## Content rules
- ArtCraft MCP is the default; Remotion/HyperFrames only when better AND free/cheaper.
- No Higgsfield spend or credits without Evens's per-job OK and a quote (`media-gen-cost-gate`).
- No send/publish/deploy/spend. One engine owner at a time (close the app before a headless edit of the same file).
- Mac disk is tight: small files, no heavy renders.
