# 🦂 Scorpion OS

Monorepo for Evens's personal AI stack. The active work is **Jarvis**, a local voice and chat agent in [`apps/agent-stack`](apps/agent-stack). It also holds the older Scorpion and LightningFlow apps, the n8n tooling, and the hive docs.

> This repo is **public**. Do not commit keys, `.env` files, absolute home paths or private shared notes. `public_guard` (below) checks for these.

_Last refreshed 2026-10-13 against `main` @ `7566fe6`._

## What's in the repo

| Path | What it is |
|---|---|
| `apps/agent-stack/` | **Jarvis**: brain, face, mouth, memory, hands, eval (Python + a small Swift/JS face) |
| `apps/scorpion/` | Scorpion operations console (Next.js, legacy) |
| `apps/lightningflow/` | LightningFlow Lightning Network SaaS (legacy side project) |
| `apps/n8n-cursor/`, `apps/lovable-frontend/` | n8n development tools and a workflow test dashboard |
| `apps/portfolio/`, `apps/portfolio-brief-remotion/` | Portfolio site and Remotion brief |
| `docs/hive/outer-heaven/` | Hive docs, bus state and shared context used by Jarvis |
| `docs/` | Older setup, DevOps and guardrail docs |
| `scripts/` | Setup, deploy and guard scripts (`scripts/guard/public_guard.py`, `scripts/hive/…`) |
| `infra/` | Docker Compose and Caddy configs |
| `.github/` | CI workflows and `CODEOWNERS` |

## Jarvis (`apps/agent-stack`)

There is one pipeline. Each ask gets a context file and then a conversation by default. A hand (tool) is used only when one is needed. Hard steps are spoken as a proposal and then stop.

| Part | Path | Role |
|---|---|---|
| **brain** | `brain/` | `pipeline.py` (turn flow), `online.py` (OpenRouter talk + tool schema), `jev_router.py` / `jev_preflight.py` (advisory Jev router), `resume.py` ("continue" after a cut-off reply), `shared_context.py`, mission controller |
| **face** | `face/` | `serve.py` HTTP server on `127.0.0.1:4018`: Orb HUD (`pane.html`, `orb.js`), `widget.swift` (Jarvis Orb app), mic, SSE |
| **mouth** | `mouth/` | `turn.py`, `persona.py` (butler voice + honesty filters), `voice.py` (TTS: Kokoro `bm_lewis` by default) |
| **memory** | `memory/` | `store.py`, `chats.py`, `retrieve.py`, `turn_log.py` (metadata only, no transcript text), `scars.json` |
| **hands** | `hands/` | `vault_read`, `safari_see` (`see.py`), `cursor_ask`, `craft`, `status`, `refuse_hard_step`, `browser_mission` (`browser_runtime.py`); `mac_act` only while Watch is armed |
| **eval** | `eval/` | Contracts, manifest, latency budget, result/scoreboard schemas |

Main endpoints: `GET /healthz`, `GET /widget`, `POST /api/turn` (JSON or SSE), `POST /api/watch` (browser use, Safari not Chrome), `POST /api/voice-mac` (computer use). Talk goes through OpenRouter. Jev (`typesafe/jev-1.13`) is **advisory only**: it never approves anything and never sees hard steps.

More detail: [`apps/agent-stack/README.md`](apps/agent-stack/README.md), [`apps/agent-stack/AGENTS.md`](apps/agent-stack/AGENTS.md), [`apps/agent-stack/hands/AGENTS.md`](apps/agent-stack/hands/AGENTS.md).

### Running it

Jarvis runs on a headed Mac. It needs an OpenRouter key already present in the local `.env` / `.env.local`; the face loads it at start.

```bash
cd apps/agent-stack
./start.sh check                       # dry check, starts nothing
lsof -iTCP:4018 -sTCP:LISTEN           # make sure nothing old holds :4018
env -u AGENT_STACK_DRY_TTS ./start.sh  # face on http://127.0.0.1:4018/
curl -s http://127.0.0.1:4018/healthz
npm test                               # python3 scripts/test_suite.py
```

On Evens's Mac, the live `:4018` face runs as a launchd LaunchAgent (`ai.grok.jarvis-face`) so it outlives the shell. A second instance on `:4019` (`AGENT_STACK_FACE_PORT=4019`) is used to test candidates before they go to `:4018`. The launchd plist is local to the Mac; it is not in this repo. Tests run in a **full** checkout. A sparse worktree fails the docs-dependent tests (`brain/test_pipeline`, `test_pipeline_main_ports`, the face self-test).

### Status (CANDIDATE evidence, not a PASS; from the 2026-10-11..13 proof runs)

**Works**
- Hard-step guard: send / pay / deploy / book / publish become a spoken proposal and then stop (`refuse_hard_step` plus a regex gate).
- Talk latency on `:4018`: streamed first words in about 0.6–1.2 s (p50) on 20-turn soaks with 0 timeouts. There is a backup-model race, an 18 s soft turn deadline with a "say continue" wrap, and a resume path.
- Honesty filters: the model reports its own id, and the face drops unbacked status / "ready to serve" boasts.
- Shared context is date-stamped and marked stale. Per-turn logs hold metadata only.

**Partial**
- Coding: writes code but does not run it.
- Jev: router is live but advisory; "ask Jev …" misroutes.
- Skills/workflows: lists its hands as "skills".
- Memory: session only, nothing durable.
- Browser use: promises without firing on "open <url>".
- Computer use: grabs the Safari tab, not the screen.
- VPS: read-only, and it sometimes answers from stale notes.
- Voice: engine reports dark, and `/api/tts` returned 204 empty in the probe.
- Tool-path replies are not streamed. Some long replies skip the soft cut.

**Missing on `main`**
- Reading files and repo context: Jarvis has invented README contents and branch names.
- Generic local tools: it makes fake "I'll check…" promises.
- Web search: misroutes to `browser_mission`.
- Installed-repo listing, MCP client, loops/schedules.
- `workspace_read` and `web_search` hands are in draft PRs **#628** and **#630**. They are not merged.

## Guards

- **Only Evens merges.** Agents open draft PRs. `CODEOWNERS` assigns every path to `@evenslouis`.
- **`EVENS_OK=yes` pre-push.** A local `pre-push` hook on agent machines (not tracked in this repo) blocks Tier-3 pushes unless `EVENS_OK=yes` is set for that one command after Evens approves. No force-pushes.
- **`public_guard`.** `scripts/guard/public_guard.py` blocks private shared files (e.g. `ACTIVE_TASKS`, `MAC_SHARED_MEMORY`, `*.grok-shared.md`, `gold_vault.local.json`, `jarvis-turns.jsonl`), absolute `/Users|/home` paths and secret shapes in **added** lines. It runs in CI on every PR and on pushes to `main` (`.github/workflows/public-guard.yml`). Tests: `apps/agent-stack/tests/test_public_guard.py`. Run it locally with `python3 scripts/guard/public_guard.py --staged`.
- Builder ≠ grader: agent results are CANDIDATE until Watchdog or Evens gives a PASS.

## Where docs live

- Jarvis: `apps/agent-stack/README.md`, `AGENTS.md`, `face/ORB_NATIVE_REGRESSION.md`, `memory/context/JARVIS_CONTEXT.md`
- Repo rules for agents: `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/`
- Hive / shared context (public copy): `docs/hive/outer-heaven/` (`CONTENT/os/shared`)
- Older guides: `docs/INSTALLATION.md`, `docs/GUARDRAILS.md`, `docs/CONTRIBUTING.md`, `docs/DR_RUNBOOK.md`, `docs/ENV_VARS.md`, `docs/API_ENDPOINTS.md`
- Proof packets and private notes live off-repo, outside this public tree.

## Legacy: Scorpion / LightningFlow stack

These scripts and configs are still in the repo. They are not part of the Jarvis work, and they were not re-tested in this refresh.

```bash
./scripts/setup-all.sh                                        # one-command setup
docker compose -f infra/docker/docker-compose.dev.yml up -d   # local stack
./scripts/health-check.sh
docker compose -f infra/docker/docker-compose.prod.yml up -d  # VPS (Caddy: infra/caddy/Caddyfile.prod)
./scripts/smoke.sh
./scripts/flip_green.sh / ./scripts/flip_blue.sh              # blue/green
./scripts/diagnose-502.sh / ./scripts/fix-502.sh              # 502 troubleshooting
```

Services: Scorpion console (port 3003), LightningFlow landing/web/ops (3000/3001/3002), Express API with BullMQ workers, n8n, Redis, Caddy.

## License

`apps/agent-stack` is MIT (see its `LICENSE`). There is no root `LICENSE` file.
