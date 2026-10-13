# Claude Code (Mac)
**Where:** Evens's Mac, `~/.local/bin/claude`. Config in `~/.claude/`.
**Instructions:** `~/.claude/CLAUDE.md` (identical to `~/.codex/AGENTS.md`; blocks: hard locks, verification, platform notes, JEV-ROUTE, proactive-assistance, artcraft-studio, brain-sync managed block, capability-atlas). Memory: `~/.claude/projects/-Users-evenslouis/memory/` (includes "ArtCraft: save to user folder").
**Skills/commands:** 1362 skills in `~/.claude/skills`; 98 slash commands in `~/.claude/commands` (e.g. `/plan`, `/pr`, `/code-review`, `/route`, `/model-route`, `/orch-*`, `/epic-*`, `/save-session`, `/resume-session`, `/security-scan`, `/quality-gate`).
**Plugins (enabledPlugins, ~30):** playwright, frontend-design, context7, superpowers, github, feature-dev, code-simplifier, ralph-loop, code-review, typescript/pyright/csharp LSP, commit-commands, security-guidance, serena, pr-review-toolkit, claude-md-management, figma, supabase, agent-sdk-dev, greptile, Notion, vercel, gitlab, stripe, playground, semgrep, skill-creator, output styles.
**MCPs (`~/.claude.json`, 21):** MCP_DOCKER, the 12 ArtCraft apps (cadcraft, deckcraft, designcraft, effectcraft, filmcraft, gridcraft, lightcraft, pdfcraft, photocraft, soundcraft, vectorcraft, wordcraft), rea, shadcn, context7, codebase-memory-mcp, n8n, playwright, hostinger, markitdown.
**Hooks (settings.json):** SessionStart ×2 (ADHD always-on, ponytail), SubagentStart, UserPromptSubmit (ponytail), PostToolUse (file-path check).
**Model/routing:** `modelSettings: claude-fable-5-1`, `effortLevel: xhigh`; `jev-route "<task>" claude-code`.
**Permissions:** 376 allow rules, 12 additional directories. **GitHub:** gh = `snevemoney` (keyring) today; bot `evens-claude-code-bot` key not yet installed (`~/.config/gh-bots/` has empty slug dirs; plan in `gh-bots-mac-20261012/INSTALL.md`).
**Strengths:** deep multi-step coding, subagent fan-out, broadest plugin set, proven EffectCraft 45 s animation + score (Oct 11).
**Limits:** weekly usage cap; Mac disk 94% (29 GB free); must not touch others' uncommitted `~/n8n-cursor`.
