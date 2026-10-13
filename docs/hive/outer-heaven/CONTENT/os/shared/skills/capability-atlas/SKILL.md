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

## Handoff card
`HANDOFF <from>→<to> · job <ID> · <ET>` / Goal / Context (paths, no secrets) / Do / Don't (locks) / Done when (evidence) / Return to. Log in ACTIVE_TASKS + Obsidian inbox. See HANDOFFS.md.

Locks: no merges, deploys, sends, spend, publishes; never print secrets; Jarvis Face one owner.
