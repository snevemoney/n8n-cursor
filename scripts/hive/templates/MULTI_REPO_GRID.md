# Multi-repo grid (Secrets 20–22)

One **modular microservice grid** — not separate perfection projects.

## 20 API gateway first

Machine API/webhook per app. UI optional. healthz + register.

## 21 n8n master router

`hive-ecosystem-route` — cross-repo transit. `ecosystem-gate.sh` before wiring.

## 22 Shared core

`packages/*` = shared brain. Check SHARED_CORE_REGISTRY before duplicates.

Sync rules: `bash scripts/hive/sync-ecosystem-cursorrules.sh`

Full: hub `docs/hive/MULTI_REPO_GRID.md`
