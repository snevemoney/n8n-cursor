# Capability Atlas — every platform, every capability (v1, 2026-10-12 21:45 ET)

**Purpose (Evens, 2026-10-12):** each platform (Grok Bot desks, Codex, Claude Code, Cursor, Jarvis) should know every other one well enough to do what the others do, in its own way. Read this before choosing a tool. If another platform "usually" does a thing, check the matrix for how *you* do it here before handing off.

Verified 2026-10-12 21:42–21:55 ET by the box executor: live reads of the box (workflows, agent profiles, gh-agent, jev-route) and the Mac (~/.claude, ~/.codex, ~/.cursor, ~/jarvis-int, ~/.grok-shared, /Applications/*Craft.app, ~/ArtCraft Studio). Items marked *(recap)* come from the offline-tools-recap-20261012 transcripts, not a live read. **No secrets or key values are in this folder; never add any.**

Files: [ATLAS.md](ATLAS.md) · [GROK-BOX.md](GROK-BOX.md) · [CLAUDE-CODE.md](CLAUDE-CODE.md) · [CODEX.md](CODEX.md) · [CURSOR.md](CURSOR.md) · [JARVIS.md](JARVIS.md) · [HANDOFFS.md](HANDOFFS.md) · [ARTCRAFT.md](ARTCRAFT.md)

## Platforms at a glance
| Platform | Runs where | Model / routing | GitHub identity | Skills | Best at | Hard limits |
|---|---|---|---|---|---|---|
| **Grok Bot desks** (17 named desks + executors) | Box (Linux, shared FS, own per-agent desktop/browser) | Grok Bot; `~/.local/bin/jev-route "<task>" grok-desks` | `evens-agents-bot` GitHub App via `gh-agent` + git credential helper (n8n-cursor only) | 251 in `/home/box/agent-data/workflows` | Always-on desks, research packets, web/X/Gmail/Drive/Calendar/Slack connectors, Higgsfield, Hostinger, box browser, reaching the Mac via machineId | Box disk tight; can't send/merge/spend without Evens; Mac tools only via machineId (flaky link) |
| **Claude Code** | Mac (`~/.local/bin/claude`) | `claude-fable-5-1` settings, effort `xhigh`; `jev-route … claude-code` | Mac gh = `snevemoney` today; `evens-claude-code-bot` **pending install** | 1362 skills + 98 slash commands + ~30 plugins | Long agentic coding, subagent fan-out, ArtCraft MCP (all 12), plugin ecosystem (Playwright, Vercel, Supabase, Stripe, Figma, Notion, Semgrep) | Weekly usage cap (hit 15:52 ET Oct 12) *(recap)*; Mac disk 94% |
| **Codex** | Mac (ChatGPT app + `codex` CLI) | `gpt-6.1-sol`, effort `low`; `jev-route … codex` | `evens-codex-bot` **pending install** | 1360 skills | Computer-use of Mac apps, doc/PDF/slides/sheets plugins, ArtCraft Studio work, isolated slices with receipts + hashes | Approval policy can flip mid-run (blocked 6 ArtCraft MCPs Oct 12) *(recap)*; config breakage history (`wire_api`) |
| **Cursor** | Mac (IDE + `cursor-agent` CLI) | model `default`; `jev-route … cursor` | `evens-cursor-bot` **pending install** | 1359 skills + 5 global rules (`~/.cursor/rules`) | In-editor code edits, rules fleet, REA reverse-engineering MCP, Hostinger MCP, background subagents | Has done destructive app resets before (ChatGPT state) *(recap)* — keep to its own scope |
| **Jarvis** | Mac (`~/jarvis-int`; Face at 127.0.0.1:4018) + Hostinger n8n (evenslouis.ca/n8n) | per-mission routing in agent-stack; `jev-route … jarvis` | none of its own (no repo writes) | reads shared context, not skills | Voice/Orb conversation, mission controller, shared-memory retrieval | Face has ONE owner at a time (ACTIVE_TASKS); don't restart/patch unless named owner |

## Capability × platform matrix ("how to do it here")
| Capability | Grok Bot (box) | Claude Code (Mac) | Codex (Mac) | Cursor (Mac) | Jarvis |
|---|---|---|---|---|---|
| **Pick cheap vs frontier** | `jev-route "<task>" grok-desks` | `~/.local/bin/jev-route "<task>" claude-code` (CLAUDE.md block) | same, `codex` | same, `cursor` (rule `jev-route.mdc`) | `jev-route … jarvis`; advice only |
| **Edit code / open PR on n8n-cursor** | git push (bot helper) + `gh-agent pr create --draft` | own branch/worktree; `gh` as snevemoney until bot installed; never touch others' uncommitted `~/n8n-cursor` | isolated `~/Documents/Codex/<date>/…/work/` slices, then PR | edit in IDE on own branch | no — hand off |
| **Video / motion content** | Higgsfield (quote + per-job OK only); else hand to Mac for ArtCraft; Remotion/HyperFrames on box if free | ArtCraft MCP `effectcraft`/`filmcraft` (+`soundcraft` audio) | same MCPs via `config.toml`; opens apps via computer-use | same MCPs via `mcp.json` | ask a Mac platform |
| **Diagrams / process maps** | Excalidraw/Mermaid in markdown, box browser | `vectorcraft` MCP | `vectorcraft` MCP (proven Oct 12: Workflow Gap Map) | `vectorcraft` MCP | describe, then hand off |
| **Slides / docs / PDFs / sheets** | python-docx/pptx/openpyxl on box; Drive upload | `deckcraft`/`wordcraft`/`pdfcraft`/`gridcraft` MCP | same + bundled documents/presentations/spreadsheets/pdf plugins | same MCPs | — |
| **Images / photo** | Higgsfield (gated), box PIL | `photocraft`/`lightcraft` MCP | same + image gen | same | — |
| **Browser automation** | box browser, Playwright/Browser-use MCP | Playwright plugin/MCP (`file:` URLs blocked) | browser + computer-use plugins | Playwright MCP | Jarvis hands/browser_runtime (mission-gated) |
| **Drive the Mac's GUI** | via Mac machineId Shell only | — | **computer-use plugin** (best) | — | — |
| **Email / Calendar / Drive / Slack / X** | Gmail, Calendar, Drive, Slack, X connectors (drafts; sends need Evens) | Notion plugin only | — | — | reads shared memory only |
| **n8n workflows** | Hostinger MCPs + n8n-box-sandbox skill | `n8n` MCP (evenslouis.ca) | `n8n` MCP | `n8n` MCP | runs on it |
| **Hosting / DNS / VPS** | `user-Hostinger-*` MCPs (8 namespaces) | `hostinger` MCP | — | `hostinger` MCP | — |
| **Obsidian vault** | brain-sync PR → Mac mirror | MCP_DOCKER (Docker Desktop must run) | MCP_DOCKER | MCP_DOCKER | `~/.grok-shared` symlink |
| **Docs lookup** | WebSearch/WebFetch | `context7` | `context7` | `context7` | — |
| **Codebase memory/graph** | `rg` + skills | `codebase-memory-mcp`, serena | `codebase-memory-mcp` | `codebase-memory-mcp` | memory/store.py |
| **Reverse engineering** | `user-rea` MCP (box binary path issue, gap G03) | `rea` MCP | `rea` MCP | `rea` MCP | — |
| **UI components** | Shadcn/21st/Mobbin MCPs | `shadcn` MCP | `shadcn` MCP | `shadcn` MCP | — |
| **Research a video/post** | `youtube-watch-to-implement-digest` + yt-dlp/fw-transcribe on box | skill copy | skill copy | skill copy | — |
| **Shared memory read/write** | write packets in `/workspace/research/packets`; brain-sync export | `~/.grok-shared/*` | `~/.grok-shared/*` | `~/.cursor/rules/brain-*.mdc` + `~/.grok-shared` | `brain/shared_context.py` loads `JARVIS_CONTEXT.md` |

## Standing rules (all platforms)
1. No merges, deploys, sends, publishes, spend, bookings, credential changes or destructive actions without Evens's explicit OK for that action.
2. **Content default = ArtCraft MCP** (see [ARTCRAFT.md](ARTCRAFT.md)). Remotion/HyperFrames when better *and* free or cheaper. **No Higgsfield spend without Evens's per-job OK and a quote.**
3. Never print or copy secrets. Use env-var references.
4. Jarvis Face: one owner at a time (check ACTIVE_TASKS).
5. Claim saved/exported/opened only with evidence; installed ≠ verified.
6. Run `jev-route` before premium/frontier work; Jev advises, never approves.
7. Pick the platform from this atlas, and hand off with [HANDOFFS.md](HANDOFFS.md) when another platform is genuinely better.

## Quick facts every platform must know (5-way sync 2026-10-13)
- **D1 (Tier-3 authority):** merges to main, pushes to the PUBLIC repo `snevemoney/n8n-cursor`, and global-rule edits need Evens's explicit yes; pre-push guard needs `EVENS_OK=yes` only after he approves.
- **Higgsfield:** no generation/credits/spend without Evens's per-job OK and a quote; read-only balance checks are fine. ArtCraft MCP first.
- **gods-eye-view:** local MCP server + `gev-call`/`gev-show` CLIs on the Mac (`~/tools/gods-eye-view`) for live world situational data (weather, quakes, flights, ships, satellites) and a 3D globe; advise-only.
- **jev-route:** `~/.local/bin/jev-route "<task>" <platform>` cheap preflight that picks small/mid/frontier; advice only, never approval.
- **ArtCraft:** see ARTCRAFT.md (12 apps, MCP `<app>-cli mcp`, Studio tiers, recents-sync + `open`).
