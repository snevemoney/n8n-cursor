# Repository map

`snevemoney/n8n-cursor` is a **monorepo**: one repository that holds several products and the shared "hive" knowledge.
The name is historical (it started as n8n tooling). The active product today is **Jarvis**.

## Products and areas

| Area | Folder | Status (2026-10-16) | What it is |
|---|---|---|---|
| **Jarvis** | `apps/agent-stack/` | **Active, live** | Evens's Mac operator: voice/text Orb, one agent loop, Safari and native-app control, signal engine. Runs at 127.0.0.1:4018. |
| Hive / Outer Heaven | `docs/hive/outer-heaven/` | **Active** | Shared knowledge for every agent: CURRENT_STATE, ACTIVE_TASKS, signals (watch-later packets, method catalog), desk notes. |
| Hive scripts | `scripts/hive/` | Active | Desk skills, digests, signal tooling. |
| Locked checks | `checks/` | Active | Feature-loop checks (locked by hook). |
| Scorpion OS | `apps/scorpion/`, `packages/scorpion-core/` | Legacy (2025) | Earlier operations dashboard. Kept for reference. |
| LightningFlow | `apps/lightningflow/`, `packages/lightning-core/`, `packages/lf-sdk/` | Legacy | Earlier Lightning Network SaaS. Most of the repo's files live here (vendored dependencies). |
| n8n tooling | `apps/n8n-cursor/`, `workflows/` | Legacy / reference | The original n8n workflow tools. |
| Portfolio | `apps/portfolio/`, `apps/portfolio-brief-remotion/` | Dormant | Personal site and video brief. |
| Shared packages | `packages/shared-*`, `packages/contracts`, `packages/agent-factory` | Legacy shared code | Used by the legacy apps. |
| Infra | `infra/`, `database/`, `mcp/`, `contracts/` | Mixed | Docker, Caddy, schemas, MCP configs. |
| Old docs | `docs/*.md` (about 180 files) | Mostly legacy | See [DOCS-INDEX.md](DOCS-INDEX.md). |

## Facts worth knowing

- 166,678 files are tracked; **156,321 of them (94%) are `node_modules`**, downloaded dependencies that should not be in
  a repository. They were committed before `.gitignore` covered them. That is why every full checkout is about 2.4 GB.
  Fix: see [DECISIONS-NEEDED.md](DECISIONS-NEEDED.md) #1.
- The repository is **public**. Never commit secrets, `.env` files or absolute home paths (`public-guard` checks this).
