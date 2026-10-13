---
name: capability-atlas
description: Use when choosing which platform or tool to use (Grok desks, Claude Code, Codex, Cursor, Jarvis), or when doing something another platform usually does. Points to the shared Capability Atlas and summarises the capability x platform matrix and handoff card.
---
# Capability atlas (Grok Bot desks)

Full atlas (PR #621, draft): `docs/hive/outer-heaven/CONTENT/os/shared/atlas/` in snevemoney/n8n-cursor
(box worktree `/workspace/atlas-wt/...`; Mac vault `~/Documents/My_Billion_Dollar_Vault/00_Outer_Heaven/CONTENT/os/shared/atlas/`; after merge `~/.grok-shared/atlas/`).
Files: ATLAS.md, GROK-BOX.md, CLAUDE-CODE.md, CODEX.md, CURSOR.md, JARVIS.md, HANDOFFS.md, ARTCRAFT.md.

**Rule:** you can do what other platforms do, in your own way. Check the matrix before handing off.

## Matrix summary (how to do it on the box)
| Need | Here (box) | Better elsewhere |
|---|---|---|
| Route cheap/frontier | `jev-route "<task>" grok-desks` | — |
| PR on n8n-cursor | git push + `gh-agent pr create --draft` (evens-agents-bot); never merge | Claude Code for long refactors |
| Video/motion/slides/docs/diagrams | python-docx/pptx/openpyxl, Mermaid/Excalidraw, Remotion/HyperFrames if free | **ArtCraft MCP on the Mac** (Claude/Codex/Cursor) — default for content |
| Images/video gen | Higgsfield **only** with Evens's per-job OK + quote | ArtCraft PhotoCraft/EffectCraft |
| Mac GUI / open files in apps | Mac machineId Shell (`open -a`) | Codex computer-use |
| Email/Calendar/Drive/Slack/X | connectors (draft only; sends need Evens) | — |
| Hosting/DNS/VPS/n8n | Hostinger MCPs | — |
| Talk to Evens by voice | — | Jarvis (Face owner only) |

**ArtCraft saves (Mac):** save into `~/ArtCraft Studio/…`, then run `python3 ~/.local/bin/artcraft-recents-sync.py --add "<abs path>"` (Mac machineId Shell) so the file shows in that app's Recent/home page. Open DeckCraft/FilmCraft/DesignCraft files Finder-style (`open <file>`, routed via `~/Applications/ArtCraft Openers`) or `open -n -a <App> --args <file>`; plain `open -a App file` fails with "cannot open files in the … format".

## Handoff card
`HANDOFF <from>→<to> · job <ID> · <ET>` / Goal / Context (paths, no secrets) / Do / Don't (locks) / Done when (evidence) / Return to. Log in ACTIVE_TASKS + Obsidian inbox. See HANDOFFS.md.

Locks: no merges, deploys, sends, spend, publishes; never print secrets; Jarvis Face one owner.

## Fleet quick facts (5-way sync 2026-10-13; mirrors ~/.grok-shared/atlas/ATLAS.md + MAC_SHARED_MEMORY.md)
- D1 (Tier-3): merges to main, pushes to PUBLIC repo snevemoney/n8n-cursor, and global-rule edits need Evens's explicit yes (pre-push guard `EVENS_OK=yes` only after he approves).
- Higgsfield: no generation/credits/spend without Evens's per-job OK and a quote. ArtCraft MCP first; Remotion/HyperFrames only when better and free.
- ArtCraft: 12 apps, each MCP `~/.local/bin/<app>-cli mcp` on the Mac (Claude/Codex/Cursor registered; box + Jarvis run the CLI via machineId or hand off). Save into ~/ArtCraft Studio (00 Private/Projects/<JOB-ID> default, 01 Internal, 02 Public), then `artcraft-recents-sync.py --add` and `open`. Full how-to: `artcraft-assist` skill.
- Oct 12: Codex job ARTCRAFT-STUDIO-IMPLEMENT-20261012 installed the Studio library and made CEO Operating Review.pdf, CEO Decisions.pptx, Gap and Action Register.xlsx.
- Proactive assist-while-chatting (Evens 2026-10-12): make the smallest useful artifact during authorised work; discovery → evidence → impact → recommendation → artifact → decision.
- gods-eye-view (Mac MCP/`gev-call`, live world data, advise-only); jev-route (cheap tier preflight, advice only).
