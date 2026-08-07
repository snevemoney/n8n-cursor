# Phase 1 — Creative-loop read tools

**Macro:** Telegram (Outer Heaven / BigBoss) can inventory CE, n8n, and Scorpion without SSH.

**Refs:** `docs/patches/philanthropic-ai-agent/tools/TOOL_CONTRACTS.md`, `docs/patches/philanthropic-ai-agent/tools/ce_list_actions.ts`, `docs/guides/deployment/CREATIVE_ENGINEERING_LOOP.md`, `apps/scorpion/app/api/hive/`, `packages/shared-config/src/repo-registry.ts`

**Exit:** Three read smokes pass from Telegram (`#general` / BigBoss).

## Micro-tasks

- [ ] Add `ce_list_actions` to philanthropic tool registry (`philanthropic-ai-agent`) → `GET /scorpion/api/hive/ce/actions?limit=N`
- [ ] Add `ce_lookup_lead` tool → hive/CE lead lookup (machine auth `HIVE_MACHINE_TOKEN`)
- [ ] Add `n8n_list_workflows` tool → n8n API via broker (not raw secrets in Outer Heaven)
- [ ] Add `n8n_get_execution` tool → `GET /scorpion/api/hive/n8n/executions?id=`
- [ ] Add `scorpion_health` tool → `GET /scorpion/api/hive/health`
- [ ] Add `scorpion_knowledge_search` tool → existing Scorpion knowledge API (or safe stub)
- [ ] Route tool errors to readable Telegram replies (no raw stacks / secrets)
- [ ] Log each tool attempt to OpenClaw `#live-activity` (topic 424)
- [ ] Smoke: “last 10 CE actions” from `#general` / BigBoss
- [ ] Smoke: “what failed on execution X” via `n8n_get_execution`
- [ ] Smoke: Scorpion health summary lands in Telegram
- [ ] Keep BigBoss `SOUL.md` / `TOOLS.md` creative-loop append; do not overwrite personalities (`docs/patches/philanthropic-ai-agent/BIGBOSS_CREATIVE_LOOP_APPEND.md`)
