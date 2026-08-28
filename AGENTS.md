# AGENTS.md

This repo (`snevemoney/n8n-cursor`) participates in Outer Heaven. GitHub is the distribution bus. This file is an **index**, not the brain. Never assume the next worker has this conversation.

Codex native file: `AGENTS.md` (optionally `AGENTS.override.md`). Not `CODEX.md`. Cursor already reads this file and `CLAUDE.md`.

## Jump packet

If `~/.grokbot/jumps/CURRENT.md` exists and status is ready, pick up that task first, then continue the sitting.
Jump packet only. Claude and Codex stay on-tape. Not hive desks.
Do not invent a new jump system, JSON schema, or workflow engine.

## Read first

- Sitting save: [`docs/hive/outer-heaven/HANDOFF.md`](docs/hive/outer-heaven/HANDOFF.md) · [`CURRENT_STATE.md`](docs/hive/outer-heaven/CURRENT_STATE.md)
- Agent wiki: [`docs/hive/outer-heaven/OUTER_HEAVEN_LLM_WIKI.md`](docs/hive/outer-heaven/OUTER_HEAVEN_LLM_WIKI.md)
- Operator memory (do not dump): [`docs/hive/outer-heaven/OPERATOR_MEMORY.md`](docs/hive/outer-heaven/OPERATOR_MEMORY.md)
- Library / systems map: [`docs/hive/outer-heaven/OUTER_HEAVEN_LIBRARY.md`](docs/hive/outer-heaven/OUTER_HEAVEN_LIBRARY.md)
- Roster: [`docs/hive/outer-heaven/AGENT_ROSTER.md`](docs/hive/outer-heaven/AGENT_ROSTER.md)
- Monorepo map: `apps/` · `pnpm-workspace.yaml` · `.cursor-rules.md`

Global policy lives in those docs. Do not inline it here.

## Handoff protocol

**BEFORE:** `git status` + `git log`. Read `HANDOFF.md` and `CURRENT_STATE.md`. Do not repeat completed work.
**WHILE:** Do the named next step only.
**AFTER:** Verify. Update `HANDOFF.md` + `CURRENT_STATE.md`. Open or update a PR — do not silently overwrite.

Providers are workers. Outer Heaven is the database. `AGENTS.md` is an index. PRs, not silent overwrite.
