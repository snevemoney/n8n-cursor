# Codex (Mac)
**Where:** ChatGPT desktop app + `codex` CLI (`/Applications/ChatGPT.app/.../codex`). Config `~/.codex/`. Thread workspaces in `~/Documents/Codex/<date>/<slug>/{work,outputs}`.
**Instructions:** `~/.codex/AGENTS.md` (mirror of CLAUDE.md) + `instructions.md`; memories in `memories_v2`.
**Skills:** 1360 in `~/.codex/skills`.
**MCPs (`config.toml [mcp_servers]`):** MCP_DOCKER, computer-use, n8n, node_repl, the 12 ArtCraft apps (each `~/.local/bin/<app>-cli mcp`), rea, playwright, shadcn, context7, codebase-memory-mcp.
**Plugins:** codex-app-tools, documents, github, pdf, presentations, spreadsheets, template-creator, visualize, browser, unified-computer-use, computer-use, code-review.
**Model/routing:** `model = "gpt-6.1-sol"`, `model_reasoning_effort = "low"`; `jev-route "<task>" codex`.
**GitHub:** `evens-codex-bot` pending install. **Hooks:** none in config.toml.
**Strengths:** drives Mac apps via computer-use (opens ArtCraft files to prove desktop visibility); office-doc plugins; evidence receipts with SHA hashes (`outputs/*.json`); built and installed ArtCraft Studio library.
**Limits:** approval policy "never" made 6 ArtCraft MCP create calls fail mid-run (Oct 12 15:28) *(recap)*; GridCraft/WordCraft desktop open showed blank start screens; Oct 11 config break (`wire_api`) fixed by Claude; Oct 12 code slices still uncommitted candidates.
